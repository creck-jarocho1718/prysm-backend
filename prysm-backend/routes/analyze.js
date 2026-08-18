/**
 * Analysis Routes
 * POST /api/analyze - Full image analysis and PDF generation
 */

const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

// Services
const colorAnalysis = require('../services/colorAnalysis');
const seasonMapper = require('../services/seasonMapper');
const pdfGenerator = require('../services/pdfGenerator');

// Configure multer for this route
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Solo se permiten imágenes'));
  }
});

// Fields for multipart upload
const uploadFields = upload.fields([
  { name: 'photoFront', maxCount: 1 },
  { name: 'photoLeft', maxCount: 1 },
  { name: 'photoRight', maxCount: 1 }
]);

/**
 * Clean up uploaded files after processing
 */
function cleanupFiles(files) {
  const fileArrays = [files.photoFront, files.photoLeft, files.photoRight];
  for (const fileArray of fileArrays) {
    if (fileArray && fileArray.length > 0) {
      try {
        fs.unlinkSync(fileArray[0].path);
      } catch (err) {
        console.warn('Could not delete file:', fileArray[0].path);
      }
    }
  }
}

/**
 * POST /api/analyze
 * Full analysis: photo analysis + quiz answers + PDF generation
 */
router.post('/', (req, res) => {
  uploadFields(req, res, async (err) => {
    const startTime = Date.now();

    if (err) {
      console.error('Upload error:', err);
      return res.status(400).json({
        success: false,
        error: err.message || 'Error al subir archivos'
      });
    }

    try {
      // Parse request data
      const { name, email, answers } = req.body;
      let parsedAnswers = {};

      if (answers) {
        try {
          parsedAnswers = typeof answers === 'string' ? JSON.parse(answers) : answers;
        } catch (e) {
          parsedAnswers = {};
        }
      }

      // Get uploaded files
      const files = req.files || {};
      const photoFront = files.photoFront?.[0]?.path;
      const photoLeft = files.photoLeft?.[0]?.path;
      const photoRight = files.photoRight?.[0]?.path;

      console.log(`[Analysis] Starting for: ${name} (${email})`);
      console.log(`[Analysis] Photos: front=${!!photoFront}, left=${!!photoLeft}, right=${!!photoRight}`);

      // Step 1: Analyze photos if available
      let skinAnalysis = null;
      let dominantColors = [];

      if (photoFront) {
        try {
          console.log('[Analysis] Analyzing front photo...');
          const frontResult = await colorAnalysis.analyzeImage(photoFront);
          skinAnalysis = frontResult;
          dominantColors = frontResult.dominantColors || [];
          console.log('[Analysis] Front photo analysis complete:', frontResult.undertone, frontResult.depth);
        } catch (imgErr) {
          console.warn('[Analysis] Front photo analysis failed:', imgErr.message);
        }
      }

      // Step 2: If no photo analysis, use quiz answers
      if (!skinAnalysis) {
        console.log('[Analysis] Using quiz answers for skin analysis...');
        skinAnalysis = colorAnalysis.analyzeFromQuizAnswers(parsedAnswers);
      }

      // Step 3: Map to color season
      console.log('[Analysis] Mapping to season...');
      const seasonResult = seasonMapper.mapToSeason(skinAnalysis);
      const season = seasonResult.season;
      const palette = seasonResult.palette;
      const colorNames = seasonResult.colorNames;

      // Step 4: Determine body type from quiz
      let bodyType = 'hourglass'; // default
      if (parsedAnswers.bodyType) {
        const bodyMap = {
          'triangulo-invertido': 'inverted_triangle',
          'triángulo-invertido': 'inverted_triangle',
          'triangulo': 'triangle',
          'triángulo': 'triangle',
          'reloj-de-arena': 'hourglass',
          'reloj de arena': 'hourglass',
          'rectangulo': 'rectangle',
          'rectángulo': 'rectangle',
          'ovalada': 'oval',
          'oval': 'oval',
          'diamante': 'diamond'
        };
        bodyType = bodyMap[parsedAnswers.bodyType.toLowerCase()] || 'hourglass';
      }

      // Step 5: Calculate PRYSM score
      const prysmScore = seasonMapper.calculateScore(parsedAnswers);

      // Step 6: Load outfit recommendations
      const outfits = require('../templates/outfits.json');
      const bodyOutfits = outfits[bodyType] || outfits.hourglass;

      // Step 7: Prepare report data
      const reportData = {
        name: name || 'Cliente',
        email: email || '',
        date: new Date().toLocaleDateString('es-MX', {
          day: 'numeric',
          month: 'long',
          year: 'numeric'
        }),
        // Analysis results
        season: {
          id: season.id,
          name: season.name_es,
          name_en: season.name_en,
          temperature: season.temperature,
          depth: season.depth,
          description: season.description_es || season.description_en,
          characteristics: season.characteristics
        },
        palette: {
          protagonist: palette.protagonist,
          secondary: palette.secondary,
          neutral: palette.neutral,
          accent: palette.accent,
          avoid: palette.avoid,
          colorNames: colorNames
        },
        bodyType: {
          id: bodyType,
          name: bodyOutfits.name_es,
          recommended: bodyOutfits.recommended_silhouette,
          fabrics: bodyOutfits.fabrics,
          avoid: bodyOutfits.avoid
        },
        prysmScore: parseFloat(prysmScore),
        // Additional data from quiz
        quizAnswers: parsedAnswers,
        // Metadata
        analysisMethod: photoFront ? 'photo_analysis' : 'quiz_answers',
        dominantColors: dominantColors
      };

      // Step 8: Generate PDF
      console.log('[Analysis] Generating PDF...');
      const pdfResult = await pdfGenerator.generateReport(reportData);
      const pdfUrl = `/output/${path.basename(pdfResult.pdfPath)}`;

      // Cleanup uploaded photos
      cleanupFiles(files);

      const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`[Analysis] Complete in ${processingTime}s - PDF: ${pdfUrl}`);

      // Return success response
      res.json({
        success: true,
        reportId: pdfResult.reportId,
        pdfUrl: pdfUrl,
        analysis: {
          season: {
            id: season.id,
            name: season.name_es,
            temperature: season.temperature,
            depth: season.depth
          },
          palette: palette,
          bodyType: {
            id: bodyType,
            name: bodyOutfits.name_es
          },
          prysmScore: parseFloat(prysmScore),
          analysisMethod: reportData.analysisMethod
        },
        processingTime: `${processingTime}s`
      });

    } catch (error) {
      console.error('[Analysis] Error:', error);
      console.error(error.stack);

      // Cleanup files on error
      cleanupFiles(req.files || {});

      res.status(500).json({
        success: false,
        error: 'Error al procesar el análisis',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  });
});

/**
 * POST /api/analyze/quick
 * Quick analysis from quiz answers only (no photos)
 */
router.post('/quick', async (req, res) => {
  try {
    const { name, email, answers } = req.body;

    if (!answers) {
      return res.status(400).json({
        success: false,
        error: 'Se requieren respuestas del quiz'
      });
    }

    // Analyze from quiz
    const skinAnalysis = colorAnalysis.analyzeFromQuizAnswers(answers);
    const seasonResult = seasonMapper.mapToSeason(skinAnalysis);

    // Calculate score
    const prysmScore = seasonMapper.calculateScore(answers);

    res.json({
      success: true,
      analysis: {
        undertone: skinAnalysis.undertone,
        depth: skinAnalysis.depth,
        saturation: skinAnalysis.saturation,
        season: {
          id: seasonResult.season.id,
          name: seasonResult.season.name_es,
          name_en: seasonResult.season.name_en
        },
        palette: seasonResult.palette,
        prysmScore: parseFloat(prysmScore)
      }
    });

  } catch (error) {
    console.error('[Quick Analysis] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Error en el análisis rápido'
    });
  }
});

module.exports = router;

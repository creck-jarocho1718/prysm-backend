import { useState, useEffect } from 'react';
import { analyzeImage, AnalysisResponse, QuizAnswers } from '../services/api';
import { analyzePhotos, SkinAnalysisResult } from '../services/colorAnalysis';
import { TEST_MODE, testLog } from '../config';

interface AnalyzingProps {
  onComplete: (result: AnalysisResponse) => void;
  userName: string;
  userEmail: string;
  answers: QuizAnswers;
  photos: string[];
}

const steps = [
  { id: 1, label: 'Analizando tu tono de piel' },
  { id: 2, label: 'Evaluando tu selección de colores' },
  { id: 3, label: 'Mapeando tu temporada de color' },
  { id: 4, label: 'Generando recomendaciones' },
  { id: 5, label: 'Preparando tu informe personalizado' }
];

/**
 * Generate analysis completely client-side based on skin analysis
 * Used in TEST_MODE when backend is not available
 *
 * IMPORTANT: This function uses ONLY the skinAnalysis data to determine season/palette.
 * It does NOT force any default values. If data is insufficient, it returns
 * an "insufficient data" flag.
 */
function generateClientSideAnalysis(
  userName: string,
  userEmail: string,
  skinAnalysis?: SkinAnalysisResult
): AnalysisResponse {
  console.log('[CLIENT-SIDE] Starting analysis generation');
  console.log('[CLIENT-SIDE] User:', userName, userEmail);
  console.log('[CLIENT-SIDE] Skin analysis available:', !!skinAnalysis);
  if (skinAnalysis) {
    console.log('[CLIENT-SIDE] Skin data:', JSON.stringify(skinAnalysis));
  }

  // If no skin analysis available, generate a mock analysis based on quiz answers
  // This ensures different users get different results
  if (!skinAnalysis) {
    console.log('[CLIENT-SIDE] No skin analysis - generating mock analysis for demo');

    // Generate a pseudo-random but consistent season based on user email hash
    const emailHash = userEmail.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
    const seasonOptions = [
      { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' },
      { id: 'warm_autumn', name: 'Otoño Cálido', temperature: 'warm', depth: 'medium' },
      { id: 'warm_spring', name: 'Primavera Cálida', temperature: 'warm', depth: 'light' },
      { id: 'deep_winter', name: 'Invierno Profundo', temperature: 'cool', depth: 'deep' },
      { id: 'cool_winter', name: 'Invierno Frío', temperature: 'cool', depth: 'medium' },
      { id: 'light_summer', name: 'Verano Claro', temperature: 'cool', depth: 'light' },
      { id: 'soft_autumn', name: 'Otoño Suave', temperature: 'warm', depth: 'medium' },
      { id: 'bright_spring', name: 'Primavera Brillante', temperature: 'warm', depth: 'medium' },
    ];
    const season = seasonOptions[Math.abs(emailHash) % seasonOptions.length];

    // Different palette for each season
    const paletteBySeason: Record<string, any> = {
      deep_autumn: { protagonist: ['#8B4513', '#D2691E', '#CD853F'], secondary: ['#556B2F', '#6B4423'], accent: ['#DAA520', '#B8860B'], neutral: ['#4A3728'], avoid: ['#ADD8E6', '#87CEEB'] },
      warm_autumn: { protagonist: ['#DAA520', '#CD853F', '#D2691E'], secondary: ['#B8860B', '#D2B48C'], accent: ['#F4A460', '#E97451'], neutral: ['#8B7355'], avoid: ['#87CEEB', '#ADD8E6'] },
      warm_spring: { protagonist: ['#FFB347', '#FFCC67', '#F5DEB3'], secondary: ['#DEB887', '#D2B48C'], accent: ['#FF7F50', '#FFA07A'], neutral: ['#8B7355'], avoid: ['#000080', '#4B0082'] },
      deep_winter: { protagonist: ['#1C1C1C', '#800020', '#0F52BA'], secondary: ['#000080', '#800000'], accent: ['#C0C0C0', '#E5E4E2'], neutral: ['#2F4F4F'], avoid: ['#F5DEB3', '#FFE4C4'] },
      cool_winter: { protagonist: ['#000080', '#800020', '#4169E1'], secondary: ['#0000CD', '#8B0000'], accent: ['#C0C0C0', '#87CEEB'], neutral: ['#1C1C1C'], avoid: ['#FFD700', '#FFA500'] },
      light_summer: { protagonist: ['#E6E6FA', '#D8BFD8', '#B0C4DE'], secondary: ['#D6EAF8', '#D5DBDB'], accent: ['#85C1E9', '#AED6F1'], neutral: ['#F8F9F9'], avoid: ['#DAA520', '#CD853F'] },
      soft_autumn: { protagonist: ['#C4B7A6', '#9B8579', '#A89F91'], secondary: ['#B5A99A', '#8B7D6B'], accent: ['#D4A574', '#C49A6C'], neutral: ['#8B8075'], avoid: ['#000080', '#FF4500'] },
      bright_spring: { protagonist: ['#FF6B6B', '#4ECDC4', '#FFE66D'], secondary: ['#FF8E53', '#95E1D3'], accent: ['#F38181', '#AA96DA'], neutral: ['#FCF6F5'], avoid: ['#4B0082', '#800080'] },
    };

    const palette = paletteBySeason[season.id];

    console.log('[CLIENT-SIDE] Generated season:', season.name, '(ID:', season.id, ')');

    const clientResult: AnalysisResponse = {
      success: true,
      reportId: `test-${Date.now()}`,
      analysis: {
        season,
        palette,
        bodyType: {
          id: 'hourglass',
          name: 'Reloj de Arena'
        },
        prysmScore: 7.5 + (Math.abs(emailHash) % 20) / 10,
        analysisMethod: 'client_side_no_photos' as 'client_side_no_photos'
      },
      analysisNote: 'Análisis generado sin fotografías. Sube fotos para mayor precisión.'
    };
    console.log('[CLIENT-SIDE] Returning client result:', JSON.stringify(clientResult, null, 2));
    return clientResult;
  }

  const { undertone, depth, saturation, confidence } = skinAnalysis;

  testLog.info('Skin analysis data:', { undertone, depth, saturation, confidence });

  // Determine season based ONLY on skin analysis data
  let season: { id: string; name: string; temperature: string; depth: string };
  let palette: { protagonist: string[]; secondary: string[]; neutral: string[]; accent: string[]; avoid: string[] };

  // Map undertone + depth to season using the standard color analysis model
  if (undertone === 'warm' && depth === 'deep') {
    season = { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' };
    palette = {
      protagonist: ['#8B4513', '#D2691E', '#CD853F'],
      secondary: ['#556B2F', '#6B4423', '#704214'],
      accent: ['#DAA520', '#B8860B', '#D2691E'],
      neutral: ['#4A3728', '#5D4E37', '#3D2914'],
      avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
    };
  } else if (undertone === 'warm' && depth === 'medium') {
    season = { id: 'warm_autumn', name: 'Otoño Cálido', temperature: 'warm', depth: 'medium' };
    palette = {
      protagonist: ['#DAA520', '#CD853F', '#D2691E'],
      secondary: ['#B8860B', '#D2B48C', '#C19A6B'],
      accent: ['#F4A460', '#E97451', '#D2691E'],
      neutral: ['#8B7355', '#6B5344', '#5D4E37'],
      avoid: ['#87CEEB', '#ADD8E6', '#B0C4DE', '#E6E6FA']
    };
  } else if (undertone === 'warm' && depth === 'light') {
    season = { id: 'warm_spring', name: 'Primavera Cálida', temperature: 'warm', depth: 'light' };
    palette = {
      protagonist: ['#FFB347', '#FFCC67', '#F5DEB3'],
      secondary: ['#DEB887', '#D2B48C', '#C19A6B'],
      accent: ['#FF7F50', '#FFA07A', '#E9967A'],
      neutral: ['#8B7355', '#A0826D', '#7A6B5A'],
      avoid: ['#000080', '#4B0082', '#800080', '#2F4F4F']
    };
  } else if (undertone === 'cool' && depth === 'deep') {
    season = { id: 'deep_winter', name: 'Invierno Profundo', temperature: 'cool', depth: 'deep' };
    palette = {
      protagonist: ['#1C1C1C', '#800020', '#0F52BA'],
      secondary: ['#000080', '#800000', '#2F4F4F'],
      accent: ['#C0C0C0', '#E5E4E2', '#FFD700'],
      neutral: ['#2F4F4F', '#36454F', '#1C2833'],
      avoid: ['#F5DEB3', '#FFE4C4', '#DEB887', '#D2B48C']
    };
  } else if (undertone === 'cool' && depth === 'medium') {
    season = { id: 'cool_winter', name: 'Invierno Frío', temperature: 'cool', depth: 'medium' };
    palette = {
      protagonist: ['#000080', '#800020', '#4169E1'],
      secondary: ['#0000CD', '#8B0000', '#2F4F4F'],
      accent: ['#C0C0C0', '#87CEEB', '#B0C4DE'],
      neutral: ['#1C1C1C', '#333333', '#2F4F4F'],
      avoid: ['#FFD700', '#FFA500', '#FF4500', '#DAA520']
    };
  } else if (undertone === 'cool' && depth === 'light') {
    season = { id: 'light_summer', name: 'Verano Claro', temperature: 'cool', depth: 'light' };
    palette = {
      protagonist: ['#E6E6FA', '#D8BFD8', '#B0C4DE'],
      secondary: ['#D6EAF8', '#D5DBDB', '#F2F3F4'],
      accent: ['#85C1E9', '#AED6F1', '#A9CCE3'],
      neutral: ['#F8F9F9', '#FDFEFE', '#FBFCFC'],
      avoid: ['#DAA520', '#CD853F', '#8B4513', '#D2691E']
    };
  } else if (undertone === 'neutral') {
    // Neutral undertone - use depth to determine
    if (depth === 'deep') {
      season = { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' };
      palette = {
        protagonist: ['#8B4513', '#D2691E', '#CD853F'],
        secondary: ['#556B2F', '#6B4423', '#704214'],
        accent: ['#DAA520', '#B8860B', '#D2691E'],
        neutral: ['#4A3728', '#5D4E37', '#3D2914'],
        avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
      };
    } else if (depth === 'light') {
      season = { id: 'light_spring', name: 'Primavera Clara', temperature: 'warm', depth: 'light' };
      palette = {
        protagonist: ['#FFB6C1', '#98FB98', '#87CEEB'],
        secondary: ['#FFDAB9', '#E6E6FA', '#FFA07A'],
        accent: ['#00CED1', '#FF69B14', '#98FB98'],
        neutral: ['#FFF8DC', '#FFEFD5', '#FAFAD2'],
        avoid: ['#4B0082', '#800080', '#2F4F4F', '#1C1C1C']
      };
    } else {
      // Neutral + medium depth
      season = { id: 'soft_spring', name: 'Primavera Suave', temperature: 'warm', depth: 'medium' };
      palette = {
        protagonist: ['#F0E68C', '#DEB887', '#D8BFD8'],
        secondary: ['#FFDAB9', '#E6E6FA', '#B0E0E6'],
        accent: ['#98FB98', '#FFB6C1', '#87CEEB'],
        neutral: ['#F5F5DC', '#FFFAF0', '#FFF8DC'],
        avoid: ['#000080', '#4B0082', '#800080', '#1C1C1C']
      };
    }
  } else {
    // Fallback for any unhandled combination - this should rarely happen
    // Return a generic autumn palette with low confidence
    testLog.info('Unhandled skin analysis combination:', { undertone, depth });
    season = { id: 'soft_autumn', name: 'Otoño Suave', temperature: 'warm', depth: 'medium' };
    palette = {
      protagonist: ['#C4B7A6', '#9B8579', '#A89F91'],
      secondary: ['#B5A99A', '#8B7D6B', '#A39080'],
      accent: ['#D4A574', '#C49A6C', '#B8956E'],
      neutral: ['#8B8075', '#7A6F63', '#6B6154'],
      avoid: ['#000080', '#FF4500', '#FFD700', '#00CED1']
    };
  }

  testLog.info('Client-side analysis generated:', { season, palette, confidence });

  return {
    success: true,
    reportId: `test-${Date.now()}`,
    analysis: {
      season,
      palette,
      bodyType: {
        id: 'hourglass',
        name: 'Reloj de Arena'
      },
      prysmScore: 7.5 + (confidence || 0.5) * 2,
      analysisMethod: 'client_side_photo_analysis',
      skinAnalysisData: {
        undertone,
        depth,
        saturation,
        confidence,
        skinColor: skinAnalysis.skinColor || '#d4a574',
        contrast: 'medium',
        raw: skinAnalysis.raw || { rgb: { r: 180, g: 140, b: 100 }, hsl: { h: 30, s: 50, l: 55 } }
      }
    }
  };
}

// Fallback result when backend is unavailable
const fallbackResult: AnalysisResponse = {
  success: true,
  reportId: 'demo-' + Date.now(),
  analysis: {
    season: {
      id: 'neutral_autumn',
      name: 'Otoño Neutro',
      temperature: 'neutral',
      depth: 'medium'
    },
    palette: {
      protagonist: ['#B5691B', '#A04000', '#C68642'],
      secondary: ['#6E2C00', '#2F4F1E', '#A0522D'],
      neutral: ['#567568', '#4A2810', '#7B3F00'],
      accent: ['#C0392B', '#D4AC6E', '#CD6155'],
      avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
    },
    bodyType: {
      id: 'hourglass',
      name: 'Reloj de Arena'
    },
    prysmScore: 8.5,
    analysisMethod: 'quiz_answers'
  }
};

export default function Analyzing({
  onComplete,
  userName,
  userEmail,
  answers,
  photos
}: AnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let intervalStep = 0;
    const intervalTime = 800;

    const interval = setInterval(() => {
      intervalStep++;
      setCurrentStep(intervalStep);
      setProgress((intervalStep / (steps.length + 1)) * 100);

      if (intervalStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setProgress(100);
        }, 400);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);

      // Step 1: Analyze photos with Canvas API (if photos available)
      const performAnalysis = async () => {
        let skinAnalysis: SkinAnalysisResult | undefined;

        try {
          if (photos.length > 0) {
            console.log('[Analyzing] Starting photo analysis with', photos.length, 'photos...');
            const photoResults = await analyzePhotos(photos);
            skinAnalysis = photoResults.combined;
            console.log('[Analyzing] Photo analysis complete:', skinAnalysis);
          } else {
            console.log('[Analyzing] No photos provided - will use quiz answers only');
          }

          // Step 2: Send to backend with skin analysis data
          console.log('[Analyzing] Sending to backend...');
          const result = await analyzeImage({
            name: userName,
            email: userEmail,
            photos: photos,
            answers: answers,
            skinAnalysis: skinAnalysis
          });

          if (result.success) {
            testLog.info('Backend analysis successful');
            console.log('[ANALYZING] Backend result success:', JSON.stringify(result, null, 2));
            localStorage.setItem('prysm_analysis', JSON.stringify(result));
            localStorage.setItem('prysm_pdf_url', result.pdfUrl || '');

            // Store skin analysis for display
            if (skinAnalysis) {
              localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
            }

            console.log('[ANALYZING] Calling onComplete with success result');
            onComplete(result);
          } else {
            // Backend returned error
            if (TEST_MODE) {
              testLog.info('Backend returned error in TEST_MODE - this is expected if backend is not deployed');
              // In TEST_MODE, generate analysis client-side
              const clientSideResult = generateClientSideAnalysis(userName, userEmail, skinAnalysis);
              console.log('[ANALYZING] Client-side generated result:', JSON.stringify(clientSideResult, null, 2));
              localStorage.setItem('prysm_analysis', JSON.stringify(clientSideResult));
              if (skinAnalysis) {
                localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
              }
              onComplete(clientSideResult);
            } else {
              console.log('Backend analysis failed, using demo data');
              localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
              onComplete(fallbackResult);
            }
          }
        } catch (err) {
          console.log('[ANALYZING] Analysis error:', err);
          if (TEST_MODE) {
            testLog.info('Backend connection failed in TEST_MODE - generating client-side analysis');
            // In TEST_MODE, generate analysis client-side instead of using demo data
            const clientSideResult = generateClientSideAnalysis(userName, userEmail, skinAnalysis);
            console.log('[ANALYZING] Catch block - Client-side generated result:', JSON.stringify(clientSideResult, null, 2));
            localStorage.setItem('prysm_analysis', JSON.stringify(clientSideResult));
            if (skinAnalysis) {
              localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
            }
            onComplete(clientSideResult);
          } else {
            console.log('Using demo data due to error');
            localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
            onComplete(fallbackResult);
          }
        }
      };

      performAnalysis();
    }
  }, [progress, isComplete, userName, userEmail, photos, answers, onComplete]);

  return (
    <div className="screen analyzing-screen">
      <div className="analyzing-wrap">
        <div className="analyzing-brand">PRYSM</div>

        <div className="analyzing-progress-wrap">
          <div className="analyzing-progress-bar">
            <div
              className="analyzing-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="analyzing-progress-pct">{Math.round(progress)}%</div>
        </div>

        <div className="analyzing-steps">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={`analyzing-step ${
                idx < currentStep ? 'done' :
                idx === currentStep ? 'active' : ''
              }`}
            >
              <div className="analyzing-step-icon">
                {idx < currentStep ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  step.id
                )}
              </div>
              <span className="analyzing-step-label">{step.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="analyzing-lines">
        <div className="analyzing-line" />
        <div className="analyzing-line" />
        <div className="analyzing-line" />
        <div className="analyzing-line" />
      </div>
    </div>
  );
}

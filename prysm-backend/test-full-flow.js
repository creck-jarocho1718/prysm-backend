/**
 * PRYSM - Complete Test Flow (NO PAYMENT)
 * Generates a full PDF report for testing purposes
 */

const pdfGenerator = require('./services/pdfGenerator');
const seasonMapper = require('./services/seasonMapper');

// Sample user data for testing
const testUser = {
  name: 'Valentina García',
  email: 'valentina@test.com',
  answers: {
    skinTone: 'morena-clara',
    undertone: 'warm',
    bodyType: 'reloj-de-arena',
    style: ['clasico', 'glamuroso'],
    occasions: ['oficina', 'citas', 'eventos']
  }
};

// Simulated skin analysis from photo (real data would come from Canvas API)
const simulatedSkinAnalysis = {
  skinColor: '#C9A07A',
  undertone: 'warm',
  depth: 'medium',
  saturation: 'medium',
  contrast: 'medium',
  confidence: 0.85,
  raw: {
    rgb: { r: 201, g: 160, b: 122 },
    hsl: { h: 28, s: 42, l: 63 }
  }
};

async function runTest() {
  console.log('═══════════════════════════════════════════════════');
  console.log('       PRYSM - TEST COMPLETO (SIN PAGO)');
  console.log('═══════════════════════════════════════════════════\n');

  try {
    // Step 1: Map skin analysis to season
    console.log('📊 Paso 1: Analizando datos de piel...');
    console.log(`   Color detectado: ${simulatedSkinAnalysis.skinColor}`);
    console.log(`   Subtón: ${simulatedSkinAnalysis.undertone}`);
    console.log(`   Profundidad: ${simulatedSkinAnalysis.depth}`);
    console.log(`   Confianza: ${(simulatedSkinAnalysis.confidence * 100).toFixed(0)}%\n`);

    // Step 2: Get season
    console.log('🎨 Paso 2: Determinando temporada de color...');
    const seasonResult = seasonMapper.mapToSeason(simulatedSkinAnalysis);
    const season = seasonResult.season;
    const palette = seasonResult.palette;

    console.log(`   Temporada: ${season.name_es}`);
    console.log(`   Nombre en inglés: ${season.name_en}`);
    console.log(`   Temperatura: ${season.temperature}`);
    console.log(`   Profundidad: ${season.depth}\n`);

    // Step 3: Calculate score
    console.log('⭐ Paso 3: Calculando PRYSM Score...');
    const prysmScore = seasonMapper.calculateScore(testUser.answers);
    console.log(`   Score: ${prysmScore}\n`);

    // Step 4: Load body type recommendations
    console.log('👗 Paso 4: Cargando recomendaciones de silueta...');
    const bodyType = 'hourglass';
    console.log(`   Tipo de cuerpo: Reloj de Arena\n`);

    // Step 5: Prepare report data
    console.log('📄 Paso 5: Preparando datos del informe...\n');

    const reportData = {
      name: testUser.name,
      email: testUser.email,
      date: new Date().toLocaleDateString('es-MX', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }),
      season: {
        id: season.id,
        name_es: season.name_es,
        name_en: season.name_en,
        temperature: season.temperature,
        depth: season.depth,
        description: season.description_es,
        characteristics: season.characteristics
      },
      palette: palette,
      bodyType: {
        id: bodyType,
        name: 'Reloj de Arena',
        recommended: 'Cintura definida, escotes V y palabra de honor',
        fabrics: ['Seda natural', 'Algodón premium', 'Punto pesado'],
        avoid: ['Tejidos muy rígidos', 'Cintura alta']
      },
      prysmScore: parseFloat(prysmScore),
      skinAnalysis: simulatedSkinAnalysis,
      analysisMethod: 'photo_analysis',
      quizAnswers: testUser.answers
    };

    // Step 6: Generate PDF
    console.log('🔄 Paso 6: Generando PDF...');
    const pdfResult = await pdfGenerator.generateReport(reportData);

    console.log('\n═══════════════════════════════════════════════════');
    console.log('✅ ¡INFORME GENERADO EXITOSAMENTE!');
    console.log('═══════════════════════════════════════════════════');
    console.log(`\n📁 Archivo: ${pdfResult.pdfPath}`);
    console.log(`🔗 URL: http://localhost:3001${pdfResult.pdfUrl}`);
    console.log(`📋 Report ID: ${pdfResult.reportId}`);
    console.log('\n💡 Para ver el PDF, abre la URL en tu navegador.\n');

    return pdfResult;

  } catch (error) {
    console.error('\n❌ Error al generar el informe:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run the test
runTest();

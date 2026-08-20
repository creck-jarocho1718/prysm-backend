/**
 * PDF Generator Service
 * Uses Playwright to render HTML → PDF
 */

const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const playwright = require('playwright');

const OUTPUT_DIR = path.join(__dirname, '../output');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate PDF from report data (called from analyze.js)
 * This is the main entry point for the API
 */
async function generateReport(reportData) {
  const { name, email, season, palette, bodyType, prysmScore, skinAnalysis, analysisMethod } = reportData;
  const reportId = uuidv4();
  const filename = `report-${reportId}.pdf`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  // Extract the photo URL if available (base64 or URL)
  const clientPhoto = reportData.photoUrl || null;

  // Generate HTML content
  const html = generateHTML({
    name: name || 'Clienta',
    email: email || '',
    reportId,
    season,
    palette,
    bodyType,
    prysmScore: prysmScore || 8.5,
    skinAnalysis,
    analysisMethod,
    clientPhoto
  });

  // Render with Playwright and save as PDF
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 } // A4 dimensions
  });

  await page.setContent(html, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  return {
    reportId,
    filename,
    pdfUrl: `/output/${filename}`,
    pdfPath: outputPath
  };
}

/**
 * Generate PDF from analysis data (legacy function)
 */
async function generatePDF(data) {
  const { name, email, analysis, answers, clientPhoto } = data;
  const reportId = uuidv4();
  const filename = `report-${reportId}.pdf`;
  const outputPath = path.join(OUTPUT_DIR, filename);

  // Generate HTML content
  const html = generateHTML({
    name,
    email,
    reportId,
    analysis,
    answers,
    clientPhoto
  });

  // Render with Playwright and save as PDF
  const browser = await playwright.chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage({
    viewport: { width: 794, height: 1123 } // A4 dimensions
  });

  await page.setContent(html, {
    waitUntil: 'networkidle',
    timeout: 30000
  });

  // Generate PDF
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
    margin: { top: 0, right: 0, bottom: 0, left: 0 }
  });

  await browser.close();

  return {
    reportId,
    filename,
    pdfUrl: `/api/report/${reportId}`,
    pdfPath: outputPath
  };
}

/**
 * Generate HTML content for PDF
 */
function generateHTML(data) {
  // Support both old and new data structure
  const { name, email, reportId, season, palette, bodyType, prysmScore, skinAnalysis, analysisMethod, clientPhoto, analysis, answers } = data;

  // Use new structure if available, otherwise fall back to legacy
  const effectiveSeason = season || (analysis?.season);
  const effectivePalette = palette || (analysis?.palette);
  const effectiveBodyType = bodyType || (analysis?.bodyType);
  const effectiveScore = prysmScore || analysis?.prysmScore || 9.4;
  const effectiveSkinAnalysis = skinAnalysis || analysis?.skinAnalysis;

  // Hair colors based on season
  const hairColors = getHairColorsForSeason(effectiveSeason?.id);
  const outfits = answers?.outfits || getDefaultOutfits(effectiveSeason?.id);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRYSM - Tu Informe de Estilo Personal</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@300;400;500;600&display=swap" rel="stylesheet">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    :root {
      --gold: #D4A473;
      --gold-dark: #B5691B;
      --teal: #205E53;
      --bg: #faf8f3;
      --white: #FFFFFF;
      --text: #1a1a1a;
      --text-light: #666666;
    }

    body {
      font-family: 'Outfit', sans-serif;
      background: var(--bg);
      color: var(--text);
      font-size: 12px;
      line-height: 1.6;
    }

    .page {
      width: 794px;
      min-height: 1123px;
      background: var(--white);
      position: relative;
      page-break-after: always;
    }

    .page:last-child {
      page-break-after: auto;
    }

    /* Cover Page */
    .cover {
      height: 1123px;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      background: linear-gradient(135deg, #0f1a17 0%, #1a2f2a 50%, #205E53 100%);
      color: white;
      padding: 60px;
      position: relative;
      overflow: hidden;
    }

    .cover::before {
      content: '';
      position: absolute;
      top: -50%;
      left: -50%;
      width: 200%;
      height: 200%;
      background: radial-gradient(circle at 30% 70%, rgba(212,164,115,.15) 0%, transparent 50%);
    }

    .cover-logo {
      font-family: 'Instrument Serif', serif;
      font-size: 48px;
      letter-spacing: .3em;
      margin-bottom: 60px;
      position: relative;
    }

    .cover-photo {
      width: 200px;
      height: 200px;
      border-radius: 50%;
      object-fit: cover;
      border: 4px solid var(--gold);
      margin-bottom: 40px;
      position: relative;
    }

    .cover-title {
      font-family: 'Instrument Serif', serif;
      font-size: 36px;
      margin-bottom: 20px;
      position: relative;
    }

    .cover-season {
      font-size: 24px;
      color: var(--gold);
      margin-bottom: 30px;
      position: relative;
    }

    .cover-palette {
      display: flex;
      gap: 8px;
      margin-bottom: 40px;
      position: relative;
    }

    .cover-palette-color {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255,255,255,.3);
    }

    .cover-score {
      font-size: 64px;
      font-family: 'Instrument Serif', serif;
      color: var(--gold);
      position: relative;
    }

    .cover-score-label {
      font-size: 12px;
      letter-spacing: .3em;
      text-transform: uppercase;
      opacity: .6;
      position: relative;
    }

    .cover-footer {
      position: absolute;
      bottom: 40px;
      font-size: 10px;
      opacity: .4;
      letter-spacing: .1em;
    }

    /* Content Pages */
    .content-page {
      padding: 60px;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 40px;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(0,0,0,.1);
    }

    .page-logo {
      font-family: 'Instrument Serif', serif;
      font-size: 18px;
      color: var(--teal);
    }

    .page-title {
      font-family: 'Instrument Serif', serif;
      font-size: 28px;
      color: var(--text);
      margin-bottom: 30px;
    }

    .section {
      margin-bottom: 30px;
    }

    .section-title {
      font-size: 10px;
      letter-spacing: .2em;
      text-transform: uppercase;
      color: var(--gold-dark);
      margin-bottom: 12px;
    }

    .section-text {
      color: var(--text-light);
      margin-bottom: 15px;
    }

    /* Color Swatches */
    .color-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin: 20px 0;
    }

    .color-swatch {
      text-align: center;
    }

    .color-block {
      width: 100%;
      height: 60px;
      border-radius: 8px;
      margin-bottom: 6px;
    }

    .color-hex {
      font-family: monospace;
      font-size: 10px;
      color: var(--text-light);
    }

    .color-label {
      font-size: 9px;
      color: var(--text-light);
      margin-top: 4px;
    }

    /* Two Column Layout */
    .two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 40px;
    }

    /* Characteristics */
    .char-list {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .char-item {
      padding: 15px;
      background: var(--bg);
      border-radius: 8px;
    }

    .char-label {
      font-size: 9px;
      letter-spacing: .1em;
      text-transform: uppercase;
      color: var(--text-light);
      margin-bottom: 4px;
    }

    .char-value {
      font-weight: 500;
      color: var(--text);
    }

    /* Outfit Cards */
    .outfit-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }

    .outfit-card {
      padding: 20px;
      background: var(--bg);
      border-radius: 12px;
      border-left: 3px solid var(--gold);
    }

    .outfit-title {
      font-size: 11px;
      letter-spacing: .15em;
      text-transform: uppercase;
      color: var(--teal);
      margin-bottom: 10px;
    }

    .outfit-pieces {
      font-size: 11px;
      color: var(--text-light);
      margin-bottom: 10px;
    }

    .outfit-colors {
      display: flex;
      gap: 6px;
    }

    .outfit-color {
      width: 24px;
      height: 24px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,.1);
    }

    /* Avoid Colors */
    .avoid-grid {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }

    .avoid-color {
      width: 40px;
      height: 40px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: white;
    }

    /* Hair Colors */
    .hair-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
    }

    .hair-item {
      text-align: center;
    }

    .hair-block {
      width: 100%;
      height: 50px;
      border-radius: 8px;
      margin-bottom: 8px;
    }

    /* Jewelry */
    .jewelry-box {
      padding: 25px;
      background: linear-gradient(135deg, rgba(32,94,83,.1), rgba(32,94,83,.05));
      border-radius: 12px;
      border: 1px solid rgba(32,94,83,.2);
    }

    .metal-title {
      font-size: 18px;
      font-family: 'Instrument Serif', serif;
      color: var(--teal);
      margin-bottom: 15px;
    }

    /* Footer */
    .page-footer {
      position: absolute;
      bottom: 30px;
      left: 60px;
      right: 60px;
      display: flex;
      justify-content: space-between;
      font-size: 9px;
      color: var(--text-light);
      padding-top: 20px;
      border-top: 1px solid rgba(0,0,0,.1);
    }

    /* Page Numbers */
    .page-number {
      font-size: 10px;
      color: var(--text-light);
    }

    /* Final Page */
    .final-page {
      padding: 60px;
      text-align: center;
      background: linear-gradient(180deg, var(--white) 0%, var(--bg) 100%);
    }

    .final-logo {
      font-family: 'Instrument Serif', serif;
      font-size: 36px;
      color: var(--teal);
      margin-bottom: 30px;
    }

    .final-title {
      font-family: 'Instrument Serif', serif;
      font-size: 24px;
      margin-bottom: 20px;
    }

    .final-text {
      color: var(--text-light);
      margin-bottom: 30px;
      max-width: 500px;
      margin-left: auto;
      margin-right: auto;
    }

    .final-url {
      font-size: 14px;
      color: var(--teal);
      letter-spacing: .1em;
    }

    .prysm-score-final {
      display: inline-block;
      padding: 15px 40px;
      background: var(--teal);
      color: white;
      border-radius: 30px;
      font-size: 18px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <!-- PAGE 1: Cover -->
  <div class="page">
    <div class="cover">
      <div class="cover-logo">PRYSM</div>
      <div class="cover-title">Tu Informe de<br>Estilo Personal</div>
      <div class="cover-season">${effectiveSeason?.name_es || 'Temporada Personalizada'}</div>
      <div class="cover-palette">
        ${(effectivePalette?.protagonist || ['#B5691B', '#6E2C00', '#E07B39', '#C68642']).slice(0, 4).map(c => `<div class="cover-palette-color" style="background: ${c}"></div>`).join('')}
      </div>
      <div class="cover-score">${effectiveScore.toFixed(1)}</div>
      <div class="cover-score-label">PRYSM Score</div>
      <div class="cover-footer">
        ${name} · ${new Date().toLocaleDateString('es-MX')} · PRYSM-2026
      </div>
    </div>
  </div>

  <!-- PAGE 2: Season Analysis -->
  <div class="page">
    <div class="content-page">
      <div class="page-header">
        <div class="page-logo">PRYSM</div>
        <div class="page-number">2</div>
      </div>

      <h1 class="page-title">Tu Temporada de Color</h1>

      <div class="section">
        <div class="section-title">Temporada Identificada</div>
        <div style="font-family: 'Instrument Serif', serif; font-size: 36px; color: var(--teal); margin-bottom: 15px;">
          ${effectiveSeason?.name_es || 'Temporada Personalizada'}
        </div>
        <div style="color: var(--text-light); font-size: 14px; margin-bottom: 20px;">
          ${effectiveSeason?.name_en || 'Custom Season'}
        </div>
        <p class="section-text">${effectiveSeason?.description || 'Tu paleta personalizada basada en tu análisis.'}</p>
      </div>

      <div class="section">
        <div class="section-title">Características</div>
        <div class="char-list">
          <div class="char-item">
            <div class="char-label">Subtipo de Temperatura</div>
            <div class="char-value">${effectiveSeason?.characteristics?.undertone || 'Cálido'}</div>
          </div>
          <div class="char-item">
            <div class="char-label">Intensidad</div>
            <div class="char-value">${effectiveSeason?.characteristics?.depth || 'Medio'}</div>
          </div>
          <div class="char-item">
            <div class="char-label">Contraste</div>
            <div class="char-value">${effectiveSeason?.characteristics?.contrast || 'Medio'}</div>
          </div>
          <div class="char-item">
            <div class="char-label">Tono de Piel</div>
            <div class="char-value">${effectiveSkinAnalysis?.skinColor || effectiveSkinAnalysis?.depth || 'Detectado de foto'}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Tu Paleta de ${effectiveSeason?.name_es || 'Temporada'}</div>
        <div class="color-grid">
          ${(effectivePalette?.protagonist || ['#B5691B', '#6E2C00', '#E07B39', '#C68642']).map(c => `
            <div class="color-swatch">
              <div class="color-block" style="background: ${c}"></div>
              <div class="color-hex">${c}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div>PRYSM 2026</div>
      <div>Tu guía de estilo personal</div>
    </div>
  </div>

  <!-- PAGE 3: 8 Colors -->
  <div class="page">
    <div class="content-page">
      <div class="page-header">
        <div class="page-logo">PRYSM</div>
        <div class="page-number">3</div>
      </div>

      <h1 class="page-title">8 Colores que Te Favorecen</h1>

      <div class="two-col">
        <div>
          <div class="section">
            <div class="section-title">Protagonista</div>
            <div class="color-grid">
              ${(effectivePalette?.protagonist || ['#B5691B', '#6E2C00', '#E07B39']).map(c => `
                <div class="color-swatch">
                  <div class="color-block" style="background: ${c}"></div>
                  <div class="color-hex">${c}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Secundarios</div>
            <div class="color-grid">
              ${(effectivePalette?.secondary || ['#2F4F1E', '#A0522D']).map(c => `
                <div class="color-swatch">
                  <div class="color-block" style="background: ${c}"></div>
                  <div class="color-hex">${c}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <div>
          <div class="section">
            <div class="section-title">Neutros</div>
            <div class="color-grid">
              ${(effectivePalette?.neutral || ['#8B4513', '#567568']).map(c => `
                <div class="color-swatch">
                  <div class="color-block" style="background: ${c}"></div>
                  <div class="color-hex">${c}</div>
                </div>
              `).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Acento</div>
            <div class="color-grid">
              ${(effectivePalette?.accent || ['#C68642', '#C0392B']).map(c => `
                <div class="color-swatch">
                  <div class="color-block" style="background: ${c}"></div>
                  <div class="color-hex">${c}</div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="section" style="margin-top: 30px;">
        <div class="section-title">Colores a Evitar</div>
        <div class="avoid-grid">
          ${(effectivePalette?.avoid || ['#ADD8E6', '#FFB6C1', '#E6E6FA']).map(c => `
            <div class="avoid-color" style="background: ${c}">✗</div>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div>PRYSM 2026</div>
      <div>Tu guía de estilo personal</div>
    </div>
  </div>

  <!-- PAGE 4: Body Type -->
  <div class="page">
    <div class="content-page">
      <div class="page-header">
        <div class="page-logo">PRYSM</div>
        <div class="page-number">4</div>
      </div>

      <h1 class="page-title">Guía de Estilo y Silueta</h1>

      <div class="section">
        <div class="section-title">Tu Tipo de Cuerpo</div>
        <div style="font-family: 'Instrument Serif', serif; font-size: 28px; color: var(--teal); margin-bottom: 20px;">
          ${effectiveBodyType?.name || effectiveBodyType?.id || 'Reloj de Arena'}
        </div>
        <p class="section-text">
          Tu figura tiene proporciones que favorecen ciertos cortes y siluetas.
          Aquí te presentamos las recomendaciones personalizadas.
        </p>
      </div>

      <div class="two-col" style="margin-top: 30px;">
        <div class="section">
          <div class="section-title">Sí Usar</div>
          <ul style="list-style: none; font-size: 12px; color: var(--text-light);">
            <li style="margin-bottom: 10px;">✓  Piezas que acentúan tu cintura</li>
            <li style="margin-bottom: 10px;">✓  Telas fluidas que siguen tu figura</li>
            <li style="margin-bottom: 10px;">✓  Escotes en V o sweetheart</li>
            <li style="margin-bottom: 10px;">✓  Prendas con estructura moderada</li>
          </ul>
        </div>
        <div class="section">
          <div class="section-title">Evitar</div>
          <ul style="list-style: none; font-size: 12px; color: var(--text-light);">
            <li style="margin-bottom: 10px;">✗  Cortes completamente rectos</li>
            <li style="margin-bottom: 10px;">✗  Prendas sin forma definida</li>
            <li style="margin-bottom: 10px;">✗  Cargas de tejido en areas equivocadas</li>
            <li style="margin-bottom: 10px;">✗  Estampados muy grandes</li>
          </ul>
        </div>
      </div>

      <div class="section" style="margin-top: 30px;">
        <div class="section-title">Telas Recomendadas</div>
        <div style="display: flex; gap: 10px; flex-wrap: wrap;">
          ${['Algodón', 'Seda', 'Lino de calidad', 'Viscosa', 'Tejidos con caída'].map(t => `
            <span style="padding: 8px 16px; background: var(--bg); border-radius: 20px; font-size: 11px;">${t}</span>
          `).join('')}
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div>PRYSM 2026</div>
      <div>Tu guía de estilo personal</div>
    </div>
  </div>

  <!-- PAGE 5: Hair -->
  <div class="page">
    <div class="content-page">
      <div class="page-header">
        <div class="page-logo">PRYSM</div>
        <div class="page-number">5</div>
      </div>

      <h1 class="page-title">Color y Corte de Cabello</h1>

      <div class="section">
        <div class="section-title">Tonos que Te Iluminan</div>
        <div class="hair-grid">
          ${hairColors.map((c, i) => `
            <div class="hair-item">
              <div class="hair-block" style="background: ${c.color}"></div>
              <div class="color-hex">${c.color}</div>
              <div class="color-label">${c.name}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section" style="margin-top: 30px;">
        <div class="section-title">Cortes Recomendados</div>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
          ${['Corte en V', 'Capas suaves', 'Largo medio', 'Bordease degradados'].map(cut => `
            <div style="padding: 15px; background: var(--bg); border-radius: 8px; font-size: 12px;">
              ✦ ${cut}
            </div>
          `).join('')}
        </div>
      </div>

      <div class="section" style="margin-top: 30px;">
        <div class="section-title">Consejo para tu Estilista</div>
        <div style="padding: 20px; background: linear-gradient(135deg, rgba(212,164,115,.1), rgba(32,94,83,.08)); border-radius: 12px; font-size: 12px; color: var(--text-light);">
          Pide tonos cálidos y dorados como ${hairColors[2]?.color || '#C68642'} que complementen tu temporada de ${effectiveSeason?.name_es || 'Otoño'}. Evita tonos cenizos o muy oscuros que pueden apagarte.
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div>PRYSM 2026</div>
      <div>Tu guía de estilo personal</div>
    </div>
  </div>

  <!-- PAGE 6: Outfits -->
  <div class="page">
    <div class="content-page">
      <div class="page-header">
        <div class="page-logo">PRYSM</div>
        <div class="page-number">6</div>
      </div>

      <h1 class="page-title">4 Outfits por Ocasión</h1>

      <div class="outfit-grid">
        <div class="outfit-card">
          <div class="outfit-title">Día a Día</div>
          <div class="outfit-pieces">Blusa ocre, pantalón beige, sneakers blancas</div>
          <div class="outfit-colors">
            ${(effectivePalette?.protagonist || ['#B5691B', '#C68642', '#D4A473']).slice(0, 3).map(c => `<div class="outfit-color" style="background: ${c}"></div>`).join('')}
          </div>
        </div>

        <div class="outfit-card">
          <div class="outfit-title">Oficina</div>
          <div class="outfit-pieces">Blazer café, blusa seda beige, pantalón navy</div>
          <div class="outfit-colors">
            ${(effectivePalette?.secondary || ['#6E2C00', '#A0522D']).slice(0, 3).map(c => `<div class="outfit-color" style="background: ${c}"></div>`).join('')}
          </div>
        </div>

        <div class="outfit-card">
          <div class="outfit-title">Citas</div>
          <div class="outfit-pieces">Vestido satin ocre, tacones gold, pendientes</div>
          <div class="outfit-colors">
            ${(effectivePalette?.accent || ['#E07B39', '#C68642']).slice(0, 3).map(c => `<div class="outfit-color" style="background: ${c}"></div>`).join('')}
          </div>
        </div>

        <div class="outfit-card">
          <div class="outfit-title">Viajes</div>
          <div class="outfit-pieces">Vestido midi verde musgo, denim oscuro, blazer camel</div>
          <div class="outfit-colors">
            ${(effectivePalette?.neutral || ['#567568', '#8B4513']).slice(0, 3).map(c => `<div class="outfit-color" style="background: ${c}"></div>`).join('')}
          </div>
        </div>
      </div>

      <div class="section" style="margin-top: 30px;">
        <div class="section-title">Joyería Recomendada</div>
        <div class="jewelry-box">
          <div class="metal-title">Oro y Metales Cálidos</div>
          <div style="font-size: 12px; color: var(--text-light); margin-bottom: 15px;">
            Pendientes de gota, collares en V, pulseras de cadena dorada
          </div>
          <div style="display: flex; gap: 20px; font-size: 11px;">
            <span style="color: var(--teal);">✓ Oro</span>
            <span style="color: var(--teal);">✓ Bronce</span>
            <span style="color: var(--teal);">✓ Cobre</span>
            <span style="color: #c0392b;">✗ Evitar Plata</span>
          </div>
        </div>
      </div>
    </div>
    <div class="page-footer">
      <div>PRYSM 2026</div>
      <div>Tu guía de estilo personal</div>
    </div>
  </div>

  <!-- PAGE 7: Final -->
  <div class="page">
    <div class="final-page">
      <div class="final-logo">PRYSM</div>
      <div class="final-title">Tu Guía Está Completa</div>
      <div class="prysm-score-final">PRYSM Score: ${effectiveScore.toFixed(1)}</div>
      <p class="final-text">
        Este informe es tuyo para siempre. Guárdalo, imprímelo o muéstraselo a tu estilista.
        Con los colores, cortes y consejos de este documento, cada compra será un acierto.
      </p>
      <div style="margin: 40px 0; padding: 30px; background: var(--bg); border-radius: 16px; text-align: left;">
        <div style="margin-bottom: 20px;"><strong>Tu informe incluye:</strong></div>
        <div style="font-size: 12px; color: var(--text-light); line-height: 2;">
          ✓ Temporada de color personalizada<br>
          ✓ 8 colores que te favorecen<br>
          ✓ Guía de silueta y estilo<br>
          ✓ Recomendaciones de cabello<br>
          ✓ 4 outfits por ocasión<br>
          ✓ Joyería y accesorios ideales
        </div>
      </div>
      <div class="final-url">prysm.mx</div>
    </div>
  </div>
</body>
</html>
  `;
}

/**
 * Get hair colors based on season
 */
function getHairColorsForSeason(seasonId) {
  const warmSeasons = ['warm_spring', 'deep_autumn', 'neutral_autumn', 'neutral_spring'];
  const coolSeasons = ['soft_summer', 'deep_summer', 'bright_winter', 'neutral_winter'];

  if (warmSeasons.includes(seasonId)) {
    return [
      { color: '#4A2810', name: 'Castaño cálido' },
      { color: '#7B3F00', name: 'Cobre' },
      { color: '#C68642', name: 'Dorado miel' }
    ];
  } else if (coolSeasons.includes(seasonId)) {
    return [
      { color: '#2C1810', name: 'Castaño oscuro' },
      { color: '#4A3728', name: 'Castaño medio' },
      { color: '#8B6914', name: 'Avellana' }
    ];
  } else {
    return [
      { color: '#4A2810', name: 'Castaño' },
      { color: '#7B3F00', name: 'Cobre' },
      { color: '#C68642', name: 'Dorado' }
    ];
  }
}

/**
 * Get default outfits based on season
 */
function getDefaultOutfits(seasonId) {
  return {
    casual: { pieces: 'Blusa, pantalón, sneakers', colors: ['#B5691B', '#C68642'] },
    office: { pieces: 'Blazer, blusa, pantalón', colors: ['#6E2C00', '#A0522D'] },
    date: { pieces: 'Vestido, tacones, pendientes', colors: ['#E07B39', '#B5691B'] },
    travel: { pieces: 'Vestido midi, denim, blazer', colors: ['#2F4F1E', '#C68642'] }
  };
}

/**
 * Delete PDF file
 */
async function deletePDF(filename) {
  const filepath = path.join(OUTPUT_DIR, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
}

module.exports = {
  generateReport,
  generatePDF,
  generateHTML,
  deletePDF,
  OUTPUT_DIR
};

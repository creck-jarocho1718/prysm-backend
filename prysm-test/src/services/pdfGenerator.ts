/**
 * PDF Generator Service (Test Mode)
 * Generates personalized PDF using profile data
 */

import { PersonalStyleProfile } from './styleGenome';
import { generateCompleteRecommendations, PersonalizedLook, HairRecommendation, FabricRecommendation } from './recommendationEngine';
import { testLog } from '../config';

// ============================================================================
// PDF Generator Function
// ============================================================================

export interface GeneratedPdfData {
  profile: PersonalStyleProfile;
  looks: PersonalizedLook[];
  hair: HairRecommendation;
  fabrics: FabricRecommendation[];
  recommendations: any;
  pdfHtml: string;
  pageCount: number;
}

/**
 * Generate personalized PDF HTML from profile
 */
export async function generatePdfHtml(profile: PersonalStyleProfile): Promise<GeneratedPdfData> {
  testLog.pdf({ action: 'Starting PDF generation', profileId: profile.profileId });

  // Generate recommendations
  const recommendations = generateCompleteRecommendations(profile);
  const { looks, hair, fabrics } = recommendations;

  // Build complete data for PDF
  const pdfData: GeneratedPdfData = {
    profile,
    looks,
    hair,
    fabrics,
    recommendations,
    pdfHtml: '',
    pageCount: 7,
  };

  // Generate HTML
  const html = buildPdfHtml(profile, looks, hair, fabrics);
  pdfData.pdfHtml = html;

  testLog.pdf({
    action: 'PDF HTML generated',
    profileId: profile.profileId,
    looksCount: looks.length,
    pageCount: pdfData.pageCount,
  });

  return pdfData;
}

// ============================================================================
// HTML Template Builder
// ============================================================================

function buildPdfHtml(
  profile: PersonalStyleProfile,
  looks: PersonalizedLook[],
  hair: HairRecommendation,
  fabrics: FabricRecommendation[]
): string {
  const { userName, colorimetry, silhouette, lifestyle } = profile;

  // Get all colors for display
  const allColors = [
    ...colorimetry.palette.protagonist,
    ...colorimetry.palette.secondary,
    ...colorimetry.palette.accent,
    ...colorimetry.palette.neutral,
  ].slice(0, 8);

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>PRYSM - ${userName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Outfit:wght@200;300;400;500&display=swap" rel="stylesheet">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Outfit', sans-serif; background: #fff; color: #1a1a1a; font-size: 11pt; line-height: 1.5; }
    .page { width: 100%; min-height: 100vh; padding: 40px 50px; position: relative; }
    .serif { font-family: 'Instrument Serif', serif; }

    /* Page 1: Cover */
    .cover { background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); color: #fff; display: flex; flex-direction: column; justify-content: space-between; }
    .cover-brand { font-size: 14pt; letter-spacing: 0.3em; opacity: 0.6; }
    .cover-date { font-size: 10pt; letter-spacing: 0.1em; opacity: 0.5; }
    .cover-title { font-size: 48pt; line-height: 1.1; margin: 60px 0; }
    .cover-title em { font-style: italic; color: #d4a473; }
    .cover-palette { display: flex; gap: 6px; margin: 30px 0; }
    .cover-palette-dot { width: 24px; height: 24px; border-radius: 50%; }
    .cover-score { position: absolute; bottom: 60px; right: 50px; text-align: right; }
    .cover-score-label { font-size: 9pt; letter-spacing: 0.2em; opacity: 0.6; text-transform: uppercase; }
    .cover-score-num { font-size: 64pt; font-weight: 200; color: #d4a473; }
    .cover-name { font-size: 12pt; opacity: 0.8; }

    /* Page 2: Season */
    .season-page { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .season-left { background: #faf8f5; padding: 30px; }
    .label { font-size: 9pt; letter-spacing: 0.2em; text-transform: uppercase; opacity: 0.6; margin-bottom: 10px; }
    .season-name { font-size: 32pt; line-height: 1.1; margin-bottom: 10px; }
    .season-type { font-size: 11pt; opacity: 0.7; margin-bottom: 30px; }
    .palette-big { display: grid; grid-template-columns: repeat(3, 50px); gap: 4px; margin-bottom: 20px; }
    .palette-swatch { width: 50px; height: 50px; }
    .season-desc { font-size: 10pt; line-height: 1.6; opacity: 0.8; }
    .number-bg { font-size: 120pt; font-weight: 200; opacity: 0.05; position: absolute; bottom: 20px; right: 30px; }
    .season-right { position: relative; }
    .section-title { font-size: 24pt; margin-bottom: 15px; line-height: 1.2; }
    .section-sub { font-size: 10pt; opacity: 0.7; margin-bottom: 25px; line-height: 1.6; }
    .char-item { margin-bottom: 15px; }
    .char-title { font-weight: 500; margin-bottom: 3px; }
    .char-desc { font-size: 9pt; opacity: 0.7; }
    .hex-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .hex-chip { display: flex; align-items: center; gap: 8px; background: #f5f5f5; padding: 6px 12px; border-radius: 20px; font-size: 9pt; }
    .hex-dot { width: 16px; height: 16px; border-radius: 50%; }
    .hex-code { font-family: monospace; }

    /* Page 3: Colors */
    .colors-page { padding: 40px 50px; }
    .colors-header { margin-bottom: 30px; }
    .colors-title { font-size: 28pt; margin-bottom: 5px; }
    .colors-title em { font-style: italic; color: #d4a473; }
    .colors-sub { font-size: 10pt; opacity: 0.6; }
    .section-label { font-size: 9pt; letter-spacing: 0.15em; text-transform: uppercase; opacity: 0.5; margin: 20px 0 15px; }
    .colors-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
    .color-item { text-align: center; }
    .color-swatch { height: 80px; border-radius: 8px; position: relative; margin-bottom: 8px; }
    .color-tag { position: absolute; top: 8px; right: 8px; font-size: 8pt; background: rgba(255,255,255,0.9); padding: 2px 8px; border-radius: 10px; }
    .color-name { font-size: 9pt; font-weight: 500; }
    .color-hex { font-size: 8pt; opacity: 0.6; font-family: monospace; }
    .avoid-section { display: flex; align-items: center; gap: 30px; padding: 20px; background: #fef5f5; border-radius: 10px; margin-top: 20px; }
    .avoid-title { font-weight: 500; color: #c0392b; }
    .avoid-desc { font-size: 9pt; opacity: 0.7; flex: 1; }
    .avoid-colors { display: flex; gap: 10px; }
    .avoid-dot { width: 40px; height: 40px; border-radius: 50%; opacity: 0.7; }

    /* Page 4: Style */
    .style-page { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .silhouette-title { font-size: 18pt; margin-bottom: 5px; }
    .silhouette-name { font-size: 11pt; opacity: 0.7; margin-bottom: 20px; }
    .silhouette-body { display: flex; flex-direction: column; align-items: center; gap: 4px; }
    .body-bar { height: 12px; background: linear-gradient(90deg, #d4a473, #205E53); border-radius: 6px; }
    .tips-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
    .tip { display: flex; align-items: flex-start; gap: 8px; font-size: 9pt; }
    .tip-icon { color: #d4a473; }
    .style-right-title { font-size: 20pt; margin-bottom: 20px; }
    .fabric-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .fabric-dot { width: 8px; height: 8px; background: #d4a473; border-radius: 50%; margin-top: 5px; }
    .fabric-name { font-weight: 500; font-size: 10pt; }
    .fabric-desc { font-size: 9pt; opacity: 0.7; }
    .label-gold { color: #d4a473; font-size: 9pt; letter-spacing: 0.1em; }

    /* Page 5: Hair */
    .hair-page { padding: 40px 50px; }
    .hair-title { font-size: 28pt; margin-bottom: 30px; }
    .hair-title em { font-style: italic; color: #d4a473; }
    .hair-section { margin-bottom: 30px; }
    .section-title-bar { font-size: 10pt; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 8px 0; border-bottom: 1px solid #eee; margin-bottom: 15px; }
    .hair-colors { display: flex; flex-direction: column; gap: 12px; }
    .hair-item { display: flex; align-items: center; gap: 15px; }
    .hair-swatch { width: 50px; height: 50px; border-radius: 8px; }
    .hair-name { font-weight: 500; }
    .hair-desc { font-size: 9pt; opacity: 0.7; }
    .cuts-grid { display: flex; flex-wrap: wrap; gap: 10px; }
    .cut-item { display: flex; align-items: center; gap: 8px; padding: 8px 15px; background: #f5f5f5; border-radius: 20px; font-size: 9pt; }
    .cut-icon { color: #d4a473; }

    /* Page 6: Outfits */
    .outfits-page { padding: 40px 50px; }
    .outfits-title { font-size: 28pt; margin-bottom: 30px; }
    .outfits-title em { font-style: italic; color: #d4a473; }
    .outfits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
    .outfit-card { border: 1px solid #eee; border-radius: 12px; overflow: hidden; }
    .outfit-header { padding: 15px 20px; display: flex; align-items: center; gap: 10px; }
    .outfit-icon { font-size: 16pt; }
    .outfit-name { font-weight: 500; }
    .outfit-green { background: linear-gradient(135deg, #d4a473, #205E53); color: #fff; }
    .outfit-gold { background: linear-gradient(135deg, #B5691B, #6E2C00); color: #fff; }
    .outfit-body { padding: 15px 20px; }
    .outfit-label { font-size: 8pt; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.5; margin-bottom: 8px; }
    .outfit-pieces { font-size: 9pt; line-height: 1.6; margin-bottom: 10px; }
    .outfit-color-row { display: flex; gap: 6px; }
    .outfit-color-dot { width: 20px; height: 20px; border-radius: 50%; border: 1px solid rgba(0,0,0,0.1); }

    /* Page 7: Close */
    .close-page { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
    .close-title { font-size: 24pt; margin-bottom: 25px; }
    .summary-item { display: flex; align-items: flex-start; gap: 12px; margin-bottom: 12px; }
    .summary-check { color: #d4a473; font-weight: bold; }
    .summary-text { font-size: 10pt; }
    .close-section-title { font-size: 11pt; font-weight: 500; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 15px; padding-bottom: 8px; border-bottom: 1px solid #eee; }
    .jewelry-item { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 12px; }
    .jewelry-icon { color: #d4a473; }
    .jewelry-name { font-weight: 500; font-size: 10pt; }
    .jewelry-desc { font-size: 9pt; opacity: 0.7; }
    .brand-tag { font-size: 9pt; letter-spacing: 0.2em; opacity: 0.3; text-align: center; margin: 30px 0; }
    .footer-brand { font-size: 14pt; letter-spacing: 0.3em; opacity: 0.6; margin-bottom: 5px; }
    .footer-url { font-size: 8pt; opacity: 0.4; }
  </style>
</head>
<body>

<!-- PAGE 1: COVER -->
<div class="page cover">
  <div>
    <div class="cover-brand">PRYSM</div>
    <div class="cover-date">2026 · Premium</div>
  </div>
  <div>
    <div class="label" style="color: rgba(255,255,255,0.5); margin-bottom: 10px;">Análisis completado · PRYSM Engine 2026</div>
    <h1 class="cover-title serif">Tu guía<br>personal de<br><em>estilo</em></h1>
    <div class="cover-palette">
      ${colorimetry.palette.protagonist.slice(0, 6).map(c => `<div class="cover-palette-dot" style="background: ${c}"></div>`).join('')}
    </div>
  </div>
  <div class="cover-name">Documento exclusivo · ${userName || 'Cliente'}</div>
  <div class="cover-score">
    <div class="cover-score-label">PRYSM Score</div>
    <div class="cover-score-num">${profile.prysmScore.toFixed(1)}</div>
  </div>
</div>

<!-- PAGE 2: SEASON -->
<div class="page season-page" style="position: relative;">
  <div class="number-bg">02</div>
  <div class="season-left">
    <div class="label">Tu estación</div>
    <div class="season-name serif">${colorimetry.season.name.split(' ')[0]}<br>${colorimetry.season.name.split(' ').slice(1).join(' ')}</div>
    <div class="season-type">${colorimetry.season.subtitle}</div>
    <div class="palette-big">
      ${colorimetry.palette.protagonist.slice(0, 3).map(c => `<div class="palette-swatch" style="background: ${c}"></div>`).join('')}
      ${colorimetry.palette.secondary.slice(0, 3).map(c => `<div class="palette-swatch" style="background: ${c}"></div>`).join('')}
    </div>
    <p class="season-desc">Los colores del ${colorimetry.season.name} son ${colorimetry.season.temperature === 'warm' ? 'ricos, cálidos y con saturación media-alta. Los colores tierra quemado, los ocres profundos y los verdes musgo son tus aliados.' : 'fríos, claros y con saturación media. Los tonos azulados, rosados y lavanda complementan tu paleta.'}</p>
  </div>
  <div class="season-right">
    <div class="label">Tu análisis de color</div>
    <h2 class="section-title serif">¿Por qué estos<br>colores son los tuyos?</h2>
    <p class="section-sub">Tu piel tiene subtono ${colorimetry.season.temperature} con profundidad ${colorimetry.season.depth}. Esta combinación es clásica del ${colorimetry.season.name}.</p>
    <div class="char-item">
      <div class="char-title">Subtono</div>
      <div class="char-desc">${colorimetry.season.temperature === 'warm' ? 'Golden undertone. Los colores con base amarilla u ocre resuenan con tu piel.' : 'Cool undertone. Los colores con base azul o rosa complementan tu piel.'}</div>
    </div>
    <div class="char-item">
      <div class="char-title">Profundidad</div>
      <div class="char-desc">${colorimetry.season.depth === 'deep' ? 'Profundidad alta. Tus colores tienen presencia máxima.' : colorimetry.season.depth === 'light' ? 'Profundidad clara. Tus colores son delicados y luminosos.' : 'Profundidad media. Un balance perfecto entre presencia y sutileza.'}</div>
    </div>
    <div class="char-item">
      <div class="char-title">Contraste</div>
      <div class="char-desc">Contraste ${colorimetry.season.contrast}. El cabello y los ojos crean ${colorimetry.season.contrast === 'high' ? 'un contraste marcado que favorece colores saturados.' : 'un contraste suave que funciona bien con colores pastel.'}</div>
    </div>
    <div style="margin-top: 20px;">
      <div class="label-gold">Tus 6 colores temporada</div>
      <div class="hex-grid">
        ${colorimetry.palette.protagonist.slice(0, 6).map(c => `
          <div class="hex-chip">
            <div class="hex-dot" style="background: ${c}"></div>
            <div class="hex-code">${c}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
</div>

<!-- PAGE 3: COLORS -->
<div class="page colors-page">
  <div class="colors-header">
    <div class="label">Temporada · ${colorimetry.season.name}</div>
    <h2 class="colors-title serif">Tus 8 colores<br><em>que te favorecen</em></h2>
    <p class="colors-sub">Hex codes exactos para comprar online o mostrarle a tu estilista</p>
  </div>

  <div class="section-label">Colores protagonistas</div>
  <div class="colors-grid">
    ${allColors.map((color, i) => `
      <div class="color-item">
        <div class="color-swatch" style="background: ${color}">
          <div class="color-tag">${i === 0 ? 'Best' : i < 3 ? 'Top' : i < 5 ? 'Favorito' : 'Acento'}</div>
        </div>
        <div class="color-name">${getColorName(color)}</div>
        <div class="color-hex">${color}</div>
      </div>
    `).join('')}
  </div>

  <div class="avoid-section">
    <div>
      <div class="avoid-title">Colores que debes evitar</div>
      <p class="avoid-desc">Los colores opposites a tu paleta apagarán tu rostro. Evita colores con subtonos opuestos al tuyo.</p>
    </div>
    <div class="avoid-colors">
      ${colorimetry.palette.avoid.slice(0, 4).map(c => `<div class="avoid-dot" style="background: ${c}"></div>`).join('')}
    </div>
  </div>
</div>

<!-- PAGE 4: STYLE -->
<div class="page style-page">
  <div class="style-left">
    <div class="label">Tu morfología</div>
    <div class="silhouette-title serif">Tu silueta ideal</div>
    <div class="silhouette-name">${silhouette.name} · ${silhouette.bodyShape}</div>

    <div class="silhouette-body" style="margin: 20px 0;">
      <div class="body-bar" style="width: 100px;"></div>
      <div class="body-bar" style="width: 120px; height: 30px;"></div>
      <div class="body-bar" style="width: 70px; height: 40px;"></div>
      <div class="body-bar" style="width: 140px; height: 30px;"></div>
    </div>

    <div class="label" style="margin-bottom: 12px;">Lo que te favorece</div>
    <div class="tips-grid">
      ${silhouette.recommendations.favor.slice(0, 4).map(tip => `
        <div class="tip">
          <span class="tip-icon">✦</span>
          <span>${tip}</span>
        </div>
      `).join('')}
    </div>
  </div>

  <div class="style-right">
    <div class="label-gold">Telas y materiales</div>
    <h2 class="style-right-title serif">Materiales que<br>realzan tu figura</h2>

    <div class="fabrics">
      ${fabrics.slice(0, 5).map(f => `
        <div class="fabric-item">
          <div class="fabric-dot"></div>
          <div>
            <div class="fabric-name">${f.name}</div>
            <div class="fabric-desc">${f.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>

    <div class="number-bg" style="color: #f5f5f5;">04</div>
  </div>
</div>

<!-- PAGE 5: HAIR -->
<div class="page hair-page">
  <div class="label">Morfología facial</div>
  <h2 class="hair-title serif">Cabello &<br><em>forma de rostro</em></h2>

  <div class="hair-section">
    <div class="section-title-bar">Tonos de cabello recomendados</div>
    <div class="hair-colors">
      ${hair.recommended.map(h => `
        <div class="hair-item">
          <div class="hair-swatch" style="background: ${h.hex}"></div>
          <div>
            <div class="hair-name">${h.name}</div>
            <div class="hair-desc">${h.desc}</div>
          </div>
        </div>
      `).join('')}
    </div>
    <div style="margin-top: 20px;">
      <div class="label">Evitar</div>
      <div style="display: flex; gap: 15px; margin-top: 10px;">
        ${hair.avoid.slice(0, 3).map(h => `
          <div style="text-align: center;">
            <div style="width: 40px; height: 40px; background: #eee; border-radius: 50%; opacity: 0.5; margin: 0 auto 5px;"></div>
            <div style="font-size: 8pt; opacity: 0.6; max-width: 80px;">${h.name}</div>
          </div>
        `).join('')}
      </div>
      <div class="hair-desc" style="margin-top: 10px;">${hair.avoid[0]?.reason || ''}</div>
    </div>
  </div>

  <div class="hair-section">
    <div class="section-title-bar">Cortes recomendados</div>
    <div class="cuts-grid">
      ${hair.cuts.map(cut => `
        <div class="cut-item">
          <span class="cut-icon">✦</span>
          <span>${cut}</span>
        </div>
      `).join('')}
    </div>
  </div>
</div>

<!-- PAGE 6: OUTFITS -->
<div class="page outfits-page">
  <div class="label">${looks.length} ocasiones · Adaptadas a tu perfil</div>
  <h2 class="outfits-title serif">Looks para<br><em>cada momento</em></h2>

  <div class="outfits-grid">
    ${looks.map((look, i) => `
      <div class="outfit-card">
        <div class="outfit-header ${i % 2 === 0 ? 'outfit-green' : 'outfit-gold'}">
          <span class="outfit-icon">${look.occasionIcon}</span>
          <span class="outfit-name">${look.occasion}</span>
        </div>
        <div class="outfit-body">
          <div class="outfit-label">Piezas recomendadas</div>
          <div class="outfit-pieces">${look.pieces}</div>
          <div class="outfit-color-row">
            ${look.colors.slice(0, 4).map(c => `<div class="outfit-color-dot" style="background: ${c}"></div>`).join('')}
          </div>
        </div>
      </div>
    `).join('')}
  </div>
</div>

<!-- PAGE 7: CLOSE -->
<div class="page close-page">
  <div class="close-left">
    <div class="label">Tu resumen</div>
    <h2 class="close-title serif">Todo lo que<br>incluye tu guía</h2>

    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">Temporada ${colorimetry.season.name} con explicación completa</span>
    </div>
    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">${allColors.length} colores favoritos con hex codes exactos</span>
    </div>
    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">Guía de silueta ${silhouette.name} con tips de dressing</span>
    </div>
    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">Tonos de cabello + cortes recomendados</span>
    </div>
    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">${looks.length} outfits por ocasión personalizados</span>
    </div>
    <div class="summary-item">
      <span class="summary-check">✓</span>
      <span class="summary-text">Joyería, bolsos y accesorios recomendados</span>
    </div>

    <div class="brand-tag">PRYSM · prysmstyle.art</div>
  </div>

  <div class="close-right">
    <div class="close-section-title">Joyería ideal</div>
    <div class="jewelry-item">
      <span class="jewelry-icon">✦</span>
      <div>
        <div class="jewelry-name">${profile.preferences.metal === 'gold' ? 'Oro cálido / Bronce' : profile.preferences.metal === 'silver' ? 'Plata / Acero' : 'Oro y Plata combinados'}</div>
        <div class="jewelry-desc">El metal correcto complementa tu subtono ${colorimetry.season.temperature}. Evita el metal opuesto.</div>
      </div>
    </div>
    <div class="jewelry-item">
      <span class="jewelry-icon">✦</span>
      <div>
        <div class="jewelry-name">Aros colgantes</div>
        <div class="jewelry-desc">De longitud media. Las gotas o aros complejos favorecen tu rostro.</div>
      </div>
    </div>
    <div class="jewelry-item">
      <span class="jewelry-icon">✦</span>
      <div>
        <div class="jewelry-name">Collares en V</div>
        <div class="jewelry-desc">Alargan el cuello. Los charms discretos en ${profile.preferences.metal === 'gold' ? 'oro cálido' : 'plata'} son perfectos.</div>
      </div>
    </div>

    <div class="close-section-title" style="margin-top: 25px;">Bolsos recomendados</div>
    <div class="jewelry-item">
      <span class="jewelry-icon">✦</span>
      <div>
        <div class="jewelry-name">Tote de cuero suave</div>
        <div class="jewelry-desc">Formato amplio, asas cortas. En tonos ${colorimetry.season.depth === 'deep' ? 'oscuros' : 'neutros'}.</div>
      </div>
    </div>
    <div class="jewelry-item">
      <span class="jewelry-icon">✦</span>
      <div>
        <div class="jewelry-name">Crossbody pequeña</div>
        <div class="jewelry-desc">Para evenings. Cadena ${profile.preferences.metal === 'gold' ? 'dorada' : 'plateada'} con cuerpo de cuero.</div>
      </div>
    </div>

    <div class="footer-brand">PRYSM</div>
    <div class="footer-url">prysmstyle.art · Premium Style Guide 2026</div>
  </div>
</div>

</body>
</html>`;
}

// ============================================================================
// Helper Functions
// ============================================================================

function getColorName(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  if (r > 180 && g > 100 && b < 100) return 'Ocre quemado';
  if (r > 150 && g > 80 && b < 60) return 'Café oscuro';
  if (r > 200 && g > 150 && b < 100) return 'Naranja quemado';
  if (g > r && g > b && g > 80) return 'Verde musgo';
  if (r > 140 && g > 80 && b < 60) return 'Siena tostado';
  if (r > 180 && g > 130 && b < 80) return 'Caramelo';
  if (r > 120 && g > 80 && b < 40) return 'Saddle brown';
  if (g > 80 && r > 60 && b > 60) return 'Verde oliva';
  return 'Tono';
}

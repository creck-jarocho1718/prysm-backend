import { useState, useEffect, useRef } from 'react';
import { AnalysisResponse } from '../services/api';
import { TEST_MODE, testLog } from '../config';
import { downloadPdf } from '../services/pdfDownloader';

interface ReportProps {
  userName: string;
  analysisResult: AnalysisResponse | null;
  onShare: () => void;
  onRestart: () => void;
  testPdfData?: any;
}

// Fallback data for demo
const fallbackData = {
  season: {
    name: 'Otoño Profundo',
    subtitle: 'Deep Autumn · Warm · Rich',
    undertone: 'Cálido',
    depth: 'Media-alta',
    contrast: 'Alto',
    temperature: 'Cálida sin excepción'
  },
  prysmScore: 9.4,
  bodyType: 'Reloj de arena',
  bodyShape: 'Curvilínea',
  palette: {
    protagonist: ['#B5691B', '#6E2C00', '#E07B39'],
    secondary: ['#2F4F1E', '#A0522D'],
    accent: ['#C68642', '#8B4513'],
    neutral: ['#567568'],
    avoid: ['#a8c8d8', '#d8a8b8', '#c8c8d8', '#e8e0d8', '#88aacc']
  },
  silhouette: {
    shoulders: 'Hombros anchos',
    bust: 'Busto prominente',
    waist: 'Cintura definida',
    hip: 'Cadera completa'
  },
  tips: [
    'Cintura definida',
    'Escotes V y redonda',
    'Stirrup pants',
    'Evitar líneas rectas'
  ],
  fabrics: [
    { name: 'Seda natural', desc: 'Caída perfecta sobre curvas' },
    { name: 'Algodón premium', desc: 'Fresco y estructurado' },
    { name: 'Cuero suave', desc: 'Para cinturones y bolsos' },
    { name: 'Punto pesado', desc: 'Cardigans con caída elegante' },
    { name: 'Lino de calidad', desc: 'Perfecto para primavera-verano' }
  ],
  hairColors: [
    { name: 'Castaño chocolate', color: '#4A2810', desc: 'Base cálida, profundidad media' },
    { name: 'Rojo caoba', color: '#7B3F00', desc: 'Acentúa el subtono cálido' },
    { name: 'Marrón cálido miel', color: '#C68642', desc: 'Ilumina el rostro' }
  ],
  haircuts: ['Largo medios', 'Corte en V', 'Bucle suave', 'Flequillo lateral'],
  faceShape: 'Ovalada',
  outfits: [
    { occasion: 'Día a día', icon: '☀', pieces: 'Camisa de seda ocre · Pantalón palazzo camel · Sneakers blancas · Bolso tote cuero marrón · Abrigo largo verde musgo', colors: ['#B5691B', '#C68642', '#f5f0e8', '#2F4F1E'] },
    { occasion: 'Oficina', icon: '✦', pieces: 'Blazer sastre café · Blusa seda beige · Pantalón slim navy oscuro · Stiletto camel · Reloj dorado minimalista', colors: ['#6E2C00', '#A0522D', '#f5f0e8', '#1a1a2e'] },
    { occasion: 'Citas', icon: '♥', pieces: 'Vestido slip satinado ocre · Abrigo男友 · Sandalias tacón bloque dorado · Pendientes aro dorado · Mini bolso cadena', colors: ['#E07B39', '#B5691B', '#D4A473', '#f5f0e8'] },
    { occasion: 'Viajes', icon: '✈', pieces: 'Vestido midi fluido verde musgo · Denim oscuro skinny · Gaban camel · Sneakers blancas · Sombrero floppy beige', colors: ['#2F4F1E', '#C68642', '#d4c8b8', '#f5f0e8'] }
  ],
  jewelry: [
    { name: 'Oro cálido / Bronce', desc: 'Evita plata o acero. El oro amarillo y el bronze complementan tu subtono cálido.' },
    { name: 'Aros colgantes', desc: 'De longitud media. Las gotas o aros complejos favorecen tu rostro.' },
    { name: 'Collares en V', desc: 'Alargan el cuello. Los charms discretos en oro cálido son perfectos.' }
  ],
  bags: [
    { name: 'Tote de cuero suave', desc: 'Formato amplio, asas cortas. En café, camel o cognac.' },
    { name: 'Crossbody pequeña', desc: 'Para evenings. Cadena dorada con cuerpo de cuero o paja.' },
    { name: 'Clutch estructurada', desc: 'Para eventos formales. En verde profundo o dorado.' }
  ]
};

export default function Report({
  userName,
  analysisResult,
  onShare,
  onRestart,
  testPdfData
}: ReportProps) {
  const [activePage, setActivePage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get user's photo from testPdfData
  const userPhoto = testPdfData?.profile?.userPhotos?.[0] || '';
  const hasUserPhoto = !!userPhoto;

  // Log test mode status
  useEffect(() => {
    if (TEST_MODE) {
      testLog.info('Report component loaded with testPdfData:', testPdfData ? 'AVAILABLE' : 'NOT AVAILABLE');
      testLog.info('User photo available:', hasUserPhoto);
    }
  }, [testPdfData, hasUserPhoto]);

  // Download PDF handler - generates real PDF file
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const handleDownloadPdf = async () => {
    if (!testPdfData?.pdfHtml) {
      alert('No hay PDF disponible para descargar.');
      return;
    }

    setIsGeneratingPdf(true);

    try {
      testLog.pdf({ action: 'Starting PDF download', userName });

      await downloadPdf({
        htmlContent: testPdfData.pdfHtml,
        fileName: 'PRYSM-Informe-Personalizado',
        userName: userName || 'Cliente',
      });

      testLog.pdf({ action: 'PDF download completed' });
    } catch (error) {
      console.error('Error downloading PDF:', error);
      alert('Error al generar el PDF. Por favor intenta de nuevo.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Get data from testPdfData, analysisResult, or fallback
  const getReportData = () => {
    // If we have test PDF data, use it
    if (testPdfData?.profile) {
      const profile = testPdfData.profile;
      const recommendations = testPdfData.recommendations || testPdfData;

      testLog.info('Using test PDF data for report');

      return {
        season: {
          name: profile.colorimetry?.season?.name || 'Temporada',
          subtitle: profile.colorimetry?.season?.subtitle || '',
          undertone: profile.colorimetry?.season?.temperature || '',
          depth: profile.colorimetry?.season?.depth || '',
          contrast: profile.colorimetry?.season?.contrast || '',
          temperature: profile.colorimetry?.season?.temperature || ''
        },
        prysmScore: profile.prysmScore || 8.5,
        bodyType: profile.silhouette?.name || 'Silueta',
        bodyShape: profile.silhouette?.bodyShape || '',
        palette: profile.colorimetry?.palette || fallbackData.palette,
        silhouette: profile.silhouette || fallbackData.silhouette,
        tips: profile.silhouette?.recommendations?.favor || fallbackData.tips,
        fabrics: recommendations.fabrics || fallbackData.fabrics,
        hairColors: recommendations.hair?.recommended?.map((h: any) => ({
          name: h.name,
          color: h.hex,
          desc: h.desc
        })) || fallbackData.hairColors,
        haircuts: recommendations.hair?.cuts || fallbackData.haircuts,
        faceShape: 'Ovalada',
        outfits: recommendations.looks?.map((look: any) => ({
          occasion: look.occasion,
          icon: look.occasionIcon || '✦',
          pieces: look.pieces,
          colors: look.colors || []
        })) || fallbackData.outfits,
        jewelry: recommendations.accessories?.find((a: any) => a.category === 'Joyería')?.recommendations || fallbackData.jewelry,
        bags: recommendations.accessories?.find((a: any) => a.category === 'Bolsos')?.recommendations || fallbackData.bags
      };
    }

    // Otherwise use analysis result or fallback
    return (analysisResult?.analysis || fallbackData) as typeof fallbackData;
  };

  const data = getReportData();
  const seasonName = data.season?.name || fallbackData.season.name;
  const score = data.prysmScore || fallbackData.prysmScore;

  // Get body type as string (could be BodyTypeInfo object or string)
  const getBodyTypeName = (bt: string | { name: string }) => {
    return typeof bt === 'string' ? bt : (bt.name || fallbackData.bodyType);
  };
  const bodyTypeName = getBodyTypeName(data.bodyType);
  const bodyShapeName = data.bodyShape || fallbackData.bodyShape;

  // Get palette from analysis or fallback
  const palette = data.palette || fallbackData.palette;
  const protagonistColors = palette.protagonist || fallbackData.palette.protagonist;
  const secondaryColors = palette.secondary || fallbackData.palette.secondary;
  const accentColors = palette.accent || fallbackData.palette.accent;
  const avoidColors = palette.avoid || fallbackData.palette.avoid;

  // All 8 colors for the report
  const allColors = [
    ...protagonistColors.map((c, i) => ({ hex: c, tag: i === 0 ? 'Best' : 'Top' })),
    ...secondaryColors.map(c => ({ hex: c, tag: 'Favorito' })),
    ...accentColors.map(c => ({ hex: c, tag: 'Acento' })),
    ...(palette.neutral || []).map(c => ({ hex: c, tag: 'Neutro' }))
  ].slice(0, 8);

  // Get hex name
  const getColorName = (hex: string): string => {
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
  };

  const pages = [
    { id: 'cover', label: 'Portada' },
    { id: 'season', label: 'Temporada' },
    { id: 'colors', label: 'Colores' },
    { id: 'style', label: 'Estilo' },
    { id: 'hair', label: 'Cabello' },
    { id: 'outfits', label: 'Outfits' },
    { id: 'close', label: 'Resumen' }
  ];

  // Scroll to section
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const pageHeight = container.scrollHeight / pages.length;
    container.scrollTo({
      top: activePage * pageHeight,
      behavior: 'smooth'
    });
  }, [activePage, pages.length]);

  // Handle scroll to update active page
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const pageHeight = container.scrollHeight / pages.length;
      const currentPage = Math.round(container.scrollTop / pageHeight);
      if (currentPage !== activePage && currentPage >= 0 && currentPage < pages.length) {
        setActivePage(currentPage);
      }
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [activePage, pages.length]);

  // Get tips from silhouette recommendations
  const tips = data.tips || fallbackData.tips;

  // Get hair colors
  const hairColors = data.hairColors || fallbackData.hairColors;

  // Get haircuts
  const haircuts = data.haircuts || fallbackData.haircuts;

  // Get outfits
  const outfits = data.outfits || fallbackData.outfits;

  // Get jewelry
  const jewelry = data.jewelry || fallbackData.jewelry;

  // Get bags
  const bags = data.bags || fallbackData.bags;

  // Get fabrics
  const fabrics = data.fabrics || fallbackData.fabrics;

  return (
    <div className="report-editorial-container" ref={containerRef}>
      {/* Page 1: Cover */}
      <section className="re-page re-cover">
        <div className="re-watermark">PRYSM</div>
        <div className="re-cover-photo">
          {hasUserPhoto ? (
            <img src={userPhoto} alt={`Foto de ${userName || 'Cliente'}`} />
          ) : (
            <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&q=80&auto=format&fit=crop&crop=top" alt="" />
          )}
          <div className="re-cover-photo-overlay" />
        </div>
        <div className="re-cover-top">
          <div className="re-brand">PRYSM</div>
          <div className="re-date">2026 · Premium</div>
        </div>
        <div className="re-cover-center">
          <div className="re-season-badge">
            <div className="re-badge-dot" />
            Análisis completado · PRYSM Engine 2026
          </div>
          <h1 className="re-cover-title">
            Tu guía<br />personal de<br /><em>estilo</em>
          </h1>
          <div className="re-cover-subtitle">Documento exclusivo · {userName || 'Cliente'}</div>
          <div className="re-cover-palette">
            {allColors.slice(0, 6).map((color, i) => (
              <div key={i} className="re-palette-dot" style={{ background: color.hex }} />
            ))}
          </div>
        </div>
        <div className="re-cover-score">
          <div className="re-score-label">PRYSM Score</div>
          <div className="re-score-num">{score}</div>
        </div>
        <div className="re-cover-name">
          <div className="re-name-text">{userName || 'Cliente'}<br />{seasonName}</div>
        </div>
      </section>

      {/* Page 2: Temporada de Color */}
      <section className="re-page re-season-page">
        <div className="re-season-left">
          <div>
            <div className="re-label re-label-light">Tu estación</div>
            <div className="re-season-name">{seasonName.split(' ')[0]}<br />{seasonName.split(' ').slice(1).join(' ')}</div>
            <div className="re-season-type">{data.season?.subtitle || fallbackData.season.subtitle}</div>
          </div>
          <div className="re-palette-big">
            <div className="re-palette-row">
              <div className="re-palette-swatch" style={{ background: protagonistColors[0] }} />
              <div className="re-palette-swatch" style={{ background: protagonistColors[1] || '#6E2C00' }} />
              <div className="re-palette-swatch" style={{ background: accentColors[0] || '#E07B39' }} />
            </div>
            <div className="re-palette-row">
              <div className="re-palette-swatch" style={{ background: secondaryColors[0] || '#2F4F1E' }} />
              <div className="re-palette-swatch" style={{ background: secondaryColors[1] || '#A0522D' }} />
              <div className="re-palette-swatch" style={{ background: accentColors[1] || '#8B4513' }} />
            </div>
          </div>
          <div>
            <div className="re-season-desc">
              Los colores del {seasonName} son ricos, cálidos y con saturación media-alta. Los colores tierra quemado, los ocres profundos y los verdes musgo son tus aliados. El dorado, el cobre y el bronce complementan perfectamente tu paleta.
            </div>
          </div>
          <div className="re-number-bg">02</div>
        </div>
        <div className="re-season-right">
          <div className="re-season-right-header">
            <div className="re-label" style={{ marginBottom: '8px' }}>Tu análisis de color</div>
            <h2 className="re-section-title">¿Por qué estos<br />colores son los tuyos?</h2>
            <div className="re-section-sub">
              Tu piel tiene subtono {data.season?.undertone || fallbackData.season.undertone} con profundidad {data.season?.depth || fallbackData.season.depth}. Esta combinación es clásica del {seasonName} — los colores tierra y los tonos quemados son los que naturalmente iluminan tu rostro.
            </div>
          </div>
          <div className="re-characteristics">
            <div className="re-char-item">
              <div className="re-char-title">Subtono</div>
              <div className="re-char-desc">{data.season?.undertone || fallbackData.season.undertone} (golden undertone). Los colores con base amarilla u ocre resuenan con tu piel.</div>
            </div>
            <div className="re-char-item">
              <div className="re-char-title">Profundidad</div>
              <div className="re-char-desc">{data.season?.depth || fallbackData.season.depth}. Tus colores tienen presencia y saturación moderada — ni pastel ni neón.</div>
            </div>
            <div className="re-char-item">
              <div className="re-char-title">Contraste</div>
              <div className="re-char-desc">{data.season?.contrast || fallbackData.season.contrast}. El cabello oscuro y los ojos claros crean contraste natural que favorece colores saturados.</div>
            </div>
            <div className="re-char-item">
              <div className="re-char-title">Temperatura</div>
              <div className="re-char-desc">{data.season?.temperature || fallbackData.season.temperature}. Los subtonos fríos (azules, rosados) apagarán tu rostro.</div>
            </div>
          </div>
          <div>
            <div className="re-label-gold" style={{ marginBottom: '12px' }}>Tus 6 colores temporada</div>
            <div className="re-hex-grid">
              {allColors.slice(0, 6).map((color, i) => (
                <div key={i} className="re-hex-chip">
                  <div className="re-hex-dot" style={{ background: color.hex }} />
                  <div className="re-hex-code">{color.hex}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Page 3: 8 Colores Favoritos */}
      <section className="re-page re-colors-page">
        <div className="re-colors-header">
          <div className="re-label" style={{ marginBottom: '8px' }}>Temporada · {seasonName}</div>
          <h2 className="re-colors-title">Tus 8 colores<br /><em>que te favorecen</em></h2>
          <div className="re-colors-sub">Hex codes exactos para comprar online o mostrarle a tu estilista</div>
        </div>
        <div>
          <div className="re-section-label">Colores protagonistas</div>
          <div className="re-colors-grid">
            {allColors.map((color, i) => (
              <div key={i} className="re-color-item">
                <div className="re-color-swatch" style={{ background: color.hex }}>
                  <div className="re-color-tag">{color.tag}</div>
                </div>
                <div className="re-color-info">
                  <div className="re-color-name">{getColorName(color.hex)}</div>
                  <div className="re-color-hex">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="re-avoid-section">
          <div>
            <div className="re-avoid-title">Colores que debes evitar</div>
            <div className="re-avoid-desc">Los subtonos fríos apagarán tu rostro. Estos colores crean palidez o sombra grisácea que no favorece tu tonalidad.</div>
          </div>
          <div className="re-avoid-colors">
            {avoidColors.map((color, i) => (
              <div key={i} className="re-avoid-dot" style={{ background: color }} />
            ))}
          </div>
        </div>
      </section>

      {/* Page 4: Guía de Estilo */}
      <section className="re-page re-style-page">
        <div className="re-style-left">
          <div>
            <div className="re-label" style={{ marginBottom: '8px' }}>Tu morfología</div>
            <div className="re-silhouette-title">Tu silueta ideal</div>
            <div className="re-silhouette-name">{bodyTypeName} · {bodyShapeName}</div>
          </div>
          <div className="re-silhouette-visual">
            <div className="re-silhouette-body">
              <div className="re-body-bar" style={{ width: '35mm' }}>Hombros</div>
              <div className="re-body-bar" style={{ width: '40mm', height: '10mm' }}>Busto</div>
              <div className="re-body-bar" style={{ width: '22mm', height: '14mm' }}>Cintura</div>
              <div className="re-body-bar" style={{ width: '45mm', height: '10mm' }}>Cadera</div>
            </div>
          </div>
          <div>
            <div className="re-label" style={{ marginBottom: '12px' }}>Lo que te favorece</div>
            <div className="re-tips-grid">
              {tips.slice(0, 4).map((tip, i) => (
                <div key={i} className="re-tip">
                  <div className="re-tip-icon">✦</div>
                  <div className="re-tip-title">{tip}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="re-style-right">
          <div>
            <div className="re-label re-label-gold-dark">Telas y materiales</div>
            <h2 className="re-style-right-title">Materiales que<br />realzan tu figura</h2>
          </div>
          <div className="re-fabrics">
            {fabrics.slice(0, 5).map((fabric, i) => (
              <div key={i} className="re-fabric-item">
                <div className="re-fabric-dot" />
                <div>
                  <div className="re-fabric-name">{fabric.name}</div>
                  <div className="re-fabric-desc">{fabric.desc}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="re-watermark-dark">04</div>
        </div>
      </section>

      {/* Page 5: Cabello y Rostro */}
      <section className="re-page re-hair-page">
        <div className="re-hair-header">
          <div className="re-label" style={{ marginBottom: '8px' }}>Morfología facial</div>
          <h2 className="re-hair-title">Cabello &<br /><em>forma de rostro</em></h2>
        </div>
        <div className="re-hair-content">
          <div className="re-hair-section">
            <div className="re-section-title-bar">Tonos de cabello recomendados</div>
            <div className="re-hair-colors">
              {hairColors.map((hair, i) => (
                <div key={i} className="re-hair-item">
                  <div className="re-hair-swatch" style={{ background: hair.color || hair.hex }} />
                  <div>
                    <div className="re-hair-name">{hair.name}</div>
                    <div className="re-hair-desc">{hair.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px' }}>
              <div className="re-label" style={{ marginBottom: '12px' }}>Evitar</div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="re-hair-swatch" style={{ background: '#2a1a10', opacity: 0.5 }} />
                <div className="re-hair-swatch" style={{ background: '#c8c8d8', opacity: 0.5 }} />
                <div className="re-hair-swatch" style={{ background: '#e8c8c8', opacity: 0.5 }} />
              </div>
              <div className="re-hair-desc" style={{ marginTop: '8px' }}>Negro azabache, rubio cenizo, rosa o lila — apagan tu complexion.</div>
            </div>
          </div>
          <div className="re-hair-section">
            <div className="re-section-title-bar">Cortes recomendados</div>
            <div className="re-cuts-grid">
              {haircuts.map((cut, i) => (
                <div key={i} className="re-cut-item">
                  <div className="re-cut-icon">✦</div>
                  <div className="re-cut-name">{cut}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: '24px' }}>
              <div className="re-face-title">Tu forma de rostro: {data.faceShape || fallbackData.faceShape}</div>
              <div className="re-face-shape">
                <div className="re-face-icon">◯</div>
                <div>
                  <div className="re-face-name">Rostro {data.faceShape || fallbackData.faceShape}</div>
                  <div className="re-face-desc">La forma más simétrica. Casi todos los cortes y peinados te favorecen. Elige según la textura de tu pelo y tu estilo de vida.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Page 6: Outfits */}
      <section className="re-page re-outfits-page">
        <div className="re-outfits-header">
          <div className="re-label" style={{ marginBottom: '8px' }}>4 ocasiones · Adaptados a tu presupuesto</div>
          <h2 className="re-outfits-title">Looks para<br /><em>cada momento</em></h2>
        </div>
        <div className="re-outfits-grid">
          {outfits.map((outfit, i) => (
            <div key={i} className="re-outfit-card">
              <div className={`re-outfit-header ${i % 2 === 0 ? 're-outfit-green' : 're-outfit-gold'}`}>
                <div className="re-outfit-icon">{outfit.icon}</div>
                <div className="re-outfit-name">{outfit.occasion}</div>
              </div>
              <div className="re-outfit-body">
                <div className="re-outfit-label">Piezas recomendadas</div>
                <div className="re-outfit-pieces">{outfit.pieces}</div>
                <div className="re-outfit-color-row">
                  {(outfit.colors || []).map((color, j) => (
                    <div key={j} className="re-outfit-color-dot" style={{ background: color }} />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Page 7: Cierre + Resumen */}
      <section className="re-page re-close-page">
        <div className="re-close-left">
          <div>
            <div className="re-label re-label-light" style={{ marginBottom: '16px' }}>Tu resumen</div>
            <h2 className="re-close-title">Todo lo que<br />incluye tu guía</h2>
          </div>
          <div className="re-summary-list">
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">Temporada {seasonName} con explicación completa</div>
            </div>
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">6 colores de temporada + 8 colores favoritos con hex codes</div>
            </div>
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">Guía de silueta {bodyTypeName} con tips de dressing</div>
            </div>
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">Tonos de cabello + cortes recomendados + forma de rostro</div>
            </div>
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">4 outfits por ocasión con piezas específicas</div>
            </div>
            <div className="re-summary-item">
              <div className="re-summary-check">✓</div>
              <div className="re-summary-text">Joyería, bolsos y accesorios recomendados</div>
            </div>
          </div>
          <div className="re-watermark-close">PRYSM</div>
        </div>
        <div className="re-close-right">
          <div>
            <div className="re-close-section-title">Joyería ideal</div>
            <div className="re-jewelry-list">
              {jewelry.slice(0, 3).map((jewel, i) => (
                <div key={i} className="re-jewelry-item">
                  <div className="re-jewelry-icon">✦</div>
                  <div>
                    <div className="re-jewelry-name">{jewel.name}</div>
                    <div className="re-jewelry-desc">{jewel.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="re-close-section-title">Bolsos recomendados</div>
            <div className="re-bags-list">
              {bags.slice(0, 3).map((bag, i) => (
                <div key={i} className="re-bag-item">
                  <div className="re-bag-icon">✦</div>
                  <div>
                    <div className="re-jewelry-name">{bag.name}</div>
                    <div className="re-jewelry-desc">{bag.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="re-brand-tag">PRYSM · prysmstyle.art</div>
          <div className="re-close-footer">
            <div className="re-footer-brand">PRYSM</div>
            <div className="re-footer-url">prysmstyle.art · Premium Style Guide 2026</div>
          </div>
        </div>
      </section>

      {/* Navigation */}
      <nav className="re-nav">
        {pages.map((page, i) => (
          <button
            key={page.id}
            className={`re-nav-btn ${activePage === i ? 'active' : ''}`}
            onClick={() => setActivePage(i)}
          >
            {page.label}
          </button>
        ))}
      </nav>

      {/* Actions */}
      <div className="re-actions" style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: '12px',
        zIndex: 100,
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          onClick={handleDownloadPdf}
          disabled={!testPdfData?.pdfHtml || isGeneratingPdf}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 24px',
            background: isGeneratingPdf
              ? 'linear-gradient(135deg, #888 0%, #666 100%)'
              : 'linear-gradient(135deg, #D4A473 0%, #205E53 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '500',
            letterSpacing: '0.1em',
            cursor: (testPdfData?.pdfHtml && !isGeneratingPdf) ? 'pointer' : 'not-allowed',
            opacity: (testPdfData?.pdfHtml && !isGeneratingPdf) ? 1 : 0.7,
            boxShadow: '0 4px 20px rgba(212, 164, 115, 0.4)',
            transition: 'all 0.3s ease'
          }}
        >
          {isGeneratingPdf ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
                <circle cx="12" cy="12" r="10" strokeOpacity="0.3"/>
                <path d="M12 2a10 10 0 0 1 10 10"/>
              </svg>
              GENERANDO PDF...
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              DESCARGAR PDF
            </>
          )}
        </button>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
        <button
          onClick={onShare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 20px',
            background: 'transparent',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartir
        </button>
        <button
          onClick={onRestart}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 20px',
            background: 'rgba(255,255,255,0.1)',
            color: '#fff',
            border: 'none',
            borderRadius: '30px',
            fontSize: '12px',
            fontWeight: '400',
            letterSpacing: '0.05em',
            cursor: 'pointer',
            transition: 'all 0.3s ease'
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
          Nuevo Análisis
        </button>
      </div>
    </div>
  );
}

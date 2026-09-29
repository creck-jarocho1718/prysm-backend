import { useState, useEffect, useRef } from 'react';
import { AnalysisResponse } from '../services/api';
import { TEST_MODE, testLog } from '../config';
import { downloadPdf } from '../services/pdfDownloader';
import { processAnalysisResult, ValidatedAnalysisResult, ValidatedColor } from '../services/analysisValidator';
import { getColorNameFromHex } from '../services/colorCatalog';

interface ReportProps {
  userName: string;
  analysisResult: AnalysisResponse | null;
  onShare: () => void;
  onRestart: () => void;
  testPdfData?: any;
}

// Fallback data for demo (solamente cuando NO hay datos de análisis)
const fallbackData = {
  season: {
    name: 'Primavera Brillante',
    subtitle: 'Bright Spring · Warm · Bright',
    undertone: 'Cálido',
    depth: 'Media',
    contrast: 'Alto',
    temperature: 'Cálida'
  },
  prysmScore: 8.5,
  bodyType: 'Reloj de arena',
  bodyShape: 'Curvilínea',
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
    { name: 'Caramelo cálido', color: '#C49A6C', desc: 'Base dorada que ilumina el rostro' },
    { name: 'Miel dorado', color: '#DAA520', desc: 'Reflejos cálidos que complementan el subtono' },
    { name: 'Caoba suave', color: '#A0522D', desc: 'Profundidad cálida sin ser muy oscura' }
  ],
  haircuts: ['Largo con ondas suaves', 'Lob hasta los hombros', 'Corte en capas', 'Flequillo lateral'],
  faceShape: 'Ovalada',
  outfits: [
    { occasion: 'Día a día', icon: '☀', pieces: 'Blusa seda coral · Pantalón camel · Sneakers blancas · Bolso tote cuero', colors: ['#FF6F61', '#C19A6B', '#FFFFFF', '#8B7355'] },
    { occasion: 'Oficina', icon: '✦', pieces: 'Blazer ocre · Blusa blanca · Pantalón navy · Tacón camel', colors: ['#D2691E', '#FFFFFF', '#1E3A5F', '#C19A6B'] },
    { occasion: 'Citas', icon: '♥', pieces: 'Vestido rojo tomate · Abrigo camel · Sandalias doradas', colors: ['#FF6347', '#C19A6B', '#FFD700'] },
    { occasion: 'Eventos', icon: '★', pieces: 'Vestido dorado · Bolso clutch · Joyería dorada', colors: ['#FFD700', '#D4A574', '#FFFFFF'] }
  ],
  jewelry: [
    { name: 'Oro cálido / Bronce', desc: 'El oro amarillo y el bronce complementan tu subtono cálido.' },
    { name: 'Aros colgantes', desc: 'De longitud media. Las gotas o aros complejos favorecen tu rostro.' },
    { name: 'Collares en V', desc: 'Alargan el cuello. Los charms discretos en oro cálido son perfectos.' }
  ],
  bags: [
    { name: 'Tote de cuero suave', desc: 'Formato amplio, asas cortas. En tonos cálidos.' },
    { name: 'Crossbody pequeña', desc: 'Para evenings. Cadena dorada con cuerpo de cuero.' },
    { name: 'Clutch estructurada', desc: 'Para eventos formales. En tonos metálicos.' }
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

  // NUEVO: Procesar y normalizar el resultado usando el módulo de validación
  const processResult = (): ValidatedAnalysisResult | null => {
    if (testPdfData?.profile) {
      // Usar datos del PDF generator que ya pasó por normalización
      const profile = testPdfData.profile;

      // Extraer datos normalizados
      const season = profile.colorimetry?.season;
      const palette = profile.colorimetry?.palette;

      testLog.info('[PRYSM ANALYSIS]', {
        season: season?.name,
        subtype: season?.primary,
        undertone: season?.temperature,
        depth: season?.depth,
        contrast: season?.contrast,
        saturation: season?.saturation
      });

      testLog.info('[PRYSM COLORS]', {
        seasonalColors: palette?.protagonist?.length || 0,
        personalColors: (palette?.protagonist?.length || 0) + (palette?.secondary?.length || 0),
        avoidColors: palette?.avoid?.length || 0
      });

      return {
        season: season?.primary || 'bright_spring',
        seasonName: season?.name || 'Primavera',
        seasonSubtitle: season?.subtitle || '',
        undertone: season?.temperature === 'warm' ? 'Cálido' : 'Frío',
        depth: season?.depth || 'media',
        contrast: season?.contrast || 'medio',
        saturation: season?.saturation || 'media',
        seasonDescription: season?.temperature === 'warm'
          ? 'Los colores cálidos con base amarilla u ocre resuenan con tu piel.'
          : 'Los colores fríos con base rosa o azul complementan tu paleta.',
        seasonalColors: (palette?.protagonist || []).slice(0, 6).map((c: any, i: number) => ({
          hex: typeof c === 'string' ? c : c.hex,
          name: typeof c === 'string' ? getColorNameFromHex(c) : (c.nombre || getColorNameFromHex(c.hex)),
          category: i === 0 ? 'best' : i < 3 ? 'top' : 'favorite',
          explanation: typeof c === 'string' ? '' : (c.explicacion || '')
        })),
        personalColors: [
          ...(palette?.protagonist || []).map((c: any) => ({
            hex: typeof c === 'string' ? c : c.hex,
            name: typeof c === 'string' ? getColorNameFromHex(c) : (c.nombre || getColorNameFromHex(c.hex)),
            category: 'favorite' as const,
            explanation: typeof c === 'string' ? '' : (c.explicacion || '')
          })),
          ...(palette?.secondary || []).map((c: any) => ({
            hex: typeof c === 'string' ? c : c.hex,
            name: typeof c === 'string' ? getColorNameFromHex(c) : (c.nombre || getColorNameFromHex(c.hex)),
            category: 'accent' as const,
            explanation: typeof c === 'string' ? '' : (c.explicacion || '')
          }))
        ].slice(0, 8),
        avoidColors: (palette?.avoid || []).map((c: any) => ({
          hex: typeof c === 'string' ? c : c.hex,
          name: typeof c === 'string' ? getColorNameFromHex(c) : (c.nombre || getColorNameFromHex(c.hex)),
          category: 'avoid' as const,
          explanation: typeof c === 'string' ? 'Color que puede generar menor armonía con tu paleta.' : (c.explicacion || 'Color que puede generar menor armonía con tu paleta.')
        })),
        bodyShape: profile.silhouette?.name || 'Silueta',
        bodyShapeSource: 'user_selected',
        faceShape: null,
        hair: {
          recommended: testPdfData?.hair?.recommended?.map((h: any) => ({
            hex: h.hex || '#000000',
            name: h.name || 'Color',
            category: 'favorite' as const,
            explanation: h.desc || ''
          })) || [],
          avoid: [],
          cuts: testPdfData?.hair?.cuts || []
        },
        outfits: (testPdfData?.looks || []).slice(0, 4).map((l: any) => ({
          occasion: l.occasion || 'Día a día',
          occasionIcon: l.occasionIcon || '✦',
          pieces: l.pieces || '',
          colors: Array.isArray(l.colors) ? l.colors : []
        })),
        jewelry: [
          { name: profile.preferences?.metal === 'gold' ? 'Oro cálido' : profile.preferences?.metal === 'silver' ? 'Plata' : 'Oro y Plata', desc: 'Metal que complementa tu subtono.' }
        ],
        bags: [
          { name: 'Tote de cuero', desc: 'Formato amplio en tonos cálidos.' },
          { name: 'Crossbody', desc: 'Para ocasiones casuales.' }
        ],
        accessories: [],
        score: profile.prysmScore || 8.5
      };
    }

    return null;
  };

  // Log test mode status
  useEffect(() => {
    if (TEST_MODE) {
      testLog.info('Report component loaded with testPdfData:', testPdfData ? 'AVAILABLE' : 'NOT AVAILABLE');
      testLog.info('User photo available:', hasUserPhoto);

      const processed = processResult();
      if (processed) {
        testLog.info('[PRYSM HAIR]', {
          recommended: processed.hair.recommended.length,
          avoid: processed.hair.avoid.length,
          cuts: processed.hair.cuts.length
        });
        testLog.info('[PRYSM OUTFITS]', {
          count: processed.outfits.length
        });
      }
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

  // Get data from testPdfData (normalizado) o fallback
  const getReportData = () => {
    const processed = processResult();
    if (processed) {
      return processed;
    }

    // Usar fallback solo si no hay datos
    return fallbackData;
  };

  const data = getReportData();

  // Usar directamente los datos normalizados
  const isNormalized = 'season' in data && 'seasonalColors' in data;
  const normalizedData = data as ValidatedAnalysisResult;

  const seasonName = isNormalized
    ? normalizedData.seasonName
    : fallbackData.season.name;
  const score = isNormalized
    ? normalizedData.score
    : fallbackData.prysmScore;

  // Helper para normalizar color
  const normalizeColorDisplay = (c: ValidatedColor | string) => {
    if (typeof c === 'string') {
      return { hex: c, name: getColorNameFromHex(c) };
    }
    return { hex: c.hex, name: c.name };
  };

  // Colores para el reporte
  const seasonalColors = isNormalized
    ? normalizedData.seasonalColors
    : [];

  const personalColors = isNormalized
    ? normalizedData.personalColors
    : [];

  const avoidColors = isNormalized
    ? normalizedData.avoidColors
    : [];

  // Preparar colores para display (en español)
  const allDisplayColors = [
    ...seasonalColors.map((c, i) => ({ ...normalizeColorDisplay(c as any), tag: i === 0 ? 'Mejor' : i < 3 ? 'Destacado' : 'Favorito' })),
  ].slice(0, 6);

  const allPersonalColors = personalColors.slice(0, 8).map((c, i) => {
    const tags = ['Mejor', 'Destacado', 'Destacado', 'Favorito', 'Favorito', 'Acento', 'Acento', 'Neutro'];
    return { ...normalizeColorDisplay(c as any), tag: tags[i] || 'Favorito' };
  });

  const avoidDisplayColors = avoidColors.slice(0, 4).map(c => normalizeColorDisplay(c as any));

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
  const tips = (data as any).tips || fallbackData.tips;

  // Get hair colors
  const hairColors = isNormalized
    ? normalizedData.hair.recommended.map(h => ({
        name: h.name,
        color: h.hex,
        desc: h.explanation
      }))
    : (data as any).hairColors || fallbackData.hairColors;

  // Get haircuts
  const haircuts = isNormalized
    ? normalizedData.hair.cuts
    : (data as any).haircuts || fallbackData.haircuts;

  // Get outfits
  const outfits = isNormalized
    ? normalizedData.outfits
    : (data as any).outfits || fallbackData.outfits;

  // Get jewelry
  const jewelry = isNormalized
    ? normalizedData.jewelry
    : (data as any).jewelry || fallbackData.jewelry;

  // Get bags
  const bags = isNormalized
    ? normalizedData.bags
    : (data as any).bags || fallbackData.bags;

  // Get fabrics
  const fabrics = (data as any).fabrics || fallbackData.fabrics;

  // Get body type
  const bodyTypeName = (data as any).bodyType || (data as any).bodyShape || fallbackData.bodyType;
  const bodyShapeName = (data as any).bodyShape || fallbackData.bodyShape;

  // Get undertone, depth, contrast
  const undertone = isNormalized ? normalizedData.undertone : ((data as any).season?.undertone || fallbackData.season.undertone);
  const depth = isNormalized ? normalizedData.depth : ((data as any).season?.depth || fallbackData.season.depth);
  const contrast = isNormalized ? normalizedData.contrast : ((data as any).season?.contrast || fallbackData.season.contrast);
  const temperature = isNormalized ? normalizedData.undertone : ((data as any).season?.temperature || fallbackData.season.temperature);

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
            {allDisplayColors.slice(0, 6).map((color, i) => (
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
            <div className="re-season-type">{isNormalized ? normalizedData.seasonSubtitle : ((data as any).season?.subtitle || fallbackData.season.subtitle)}</div>
          </div>
          <div className="re-palette-big">
            <div className="re-palette-row">
              <div className="re-palette-swatch" style={{ background: allDisplayColors[0]?.hex || '#FF6F61' }} />
              <div className="re-palette-swatch" style={{ background: allDisplayColors[1]?.hex || '#D2691E' }} />
              <div className="re-palette-swatch" style={{ background: allDisplayColors[2]?.hex || '#DAA520' }} />
            </div>
            <div className="re-palette-row">
              <div className="re-palette-swatch" style={{ background: allDisplayColors[3]?.hex || '#CD853F' }} />
              <div className="re-palette-swatch" style={{ background: allDisplayColors[4]?.hex || '#8B4513' }} />
              <div className="re-palette-swatch" style={{ background: allDisplayColors[5]?.hex || '#556B2F' }} />
            </div>
          </div>
          <div>
            <div className="re-season-desc">
              {isNormalized ? normalizedData.seasonDescription : `Los colores del ${seasonName} son ricos y cálidos con saturación media-alta. Los tonos tierra y los ocres profundos son tus aliados.`}
            </div>
          </div>
          <div className="re-number-bg">02</div>
        </div>
        <div className="re-season-right">
          <div className="re-season-right-header">
            <div className="re-label" style={{ marginBottom: '8px' }}>Tu análisis de color</div>
            <h2 className="re-section-title">¿Por qué estos<br />colores son los tuyos?</h2>
            <div className="re-section-sub">
              Tu piel tiene subtono {undertone}, con profundidad {depth}. Esta combinación es clásica del {seasonName}.
            </div>
          </div>
          <div className="re-characteristics">
            <div className="re-char-item">
              <div className="re-char-title">Subtono</div>
              <div className="re-char-desc">{undertone}. Los colores {temperature === 'Cálido' ? 'con base amarilla u ocre resuenan con tu piel' : 'con base rosa o azul complementan tu paleta'}.</div>
            </div>
            <div className="re-char-item">
              <div className="re-char-title">Profundidad</div>
              <div className="re-char-desc">{depth}. Tus colores tienen presencia {depth === 'Alta' || depth === 'alta' || depth === 'deep' ? 'marcada' : depth === 'Baja' || depth === 'baja' || depth === 'light' ? 'suave' : 'moderada'}.</div>
            </div>
            <div className="re-char-item">
              <div className="re-char-title">Contraste</div>
              <div className="re-char-desc">{contrast}. {contrast === 'Alto' || contrast === 'alto' || contrast === 'high' ? 'Los colores saturados favorecen tu look.' : 'Los colores pastel funcionan bien con tu paleta.'}</div>
            </div>
          </div>
          <div>
            <div className="re-label-gold" style={{ marginBottom: '12px' }}>Tus 6 colores temporada</div>
            <div className="re-hex-grid">
              {allDisplayColors.slice(0, 6).map((color, i) => (
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
            {allPersonalColors.map((color, i) => (
              <div key={i} className="re-color-item">
                <div className="re-color-swatch" style={{ background: color.hex }}>
                  <div className="re-color-tag">{color.tag}</div>
                </div>
                <div className="re-color-info">
                  <div className="re-color-name">{color.name}</div>
                  <div className="re-color-hex">{color.hex}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="re-avoid-section">
          <div>
            <div className="re-avoid-title">Colores que debes evitar</div>
            <div className="re-avoid-desc">Los colores opuestos a tu paleta pueden apagar tu rostro. Se recomienda priorizar versiones más cálidas o más frías según tu subtono.</div>
          </div>
          <div className="re-avoid-colors">
            {avoidDisplayColors.map((color, i) => (
              <div key={i} className="re-avoid-dot" style={{ background: color.hex }} title={color.name} />
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
            <div className="re-silhouette-name">{bodyTypeName}{bodyShapeName !== bodyTypeName ? ` · ${bodyShapeName}` : ''}</div>
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
                  <div className="re-hair-swatch" style={{ background: hair.color || hair.hex || '#000000' }} />
                  <div>
                    <div className="re-hair-name">{hair.name}</div>
                    <div className="re-hair-desc">{hair.desc}</div>
                  </div>
                </div>
              ))}
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
              <div className="re-face-title">Tu forma de rostro: {isNormalized && normalizedData.faceShape ? normalizedData.faceShape : (data as any).faceShape || fallbackData.faceShape}</div>
              <div className="re-face-shape">
                <div className="re-face-icon">◯</div>
                <div>
                  <div className="re-face-name">Rostro ovalado</div>
                  <div className="re-face-desc">La forma más simétrica. Casi todos los cortes y peinados te favorecen.</div>
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
          {outfits.slice(0, 4).map((outfit, i) => (
            <div key={i} className="re-outfit-card">
              <div className={`re-outfit-header ${i % 2 === 0 ? 're-outfit-green' : 're-outfit-gold'}`}>
                <div className="re-outfit-icon">{outfit.icon || '✦'}</div>
                <div className="re-outfit-name">{outfit.occasion}</div>
              </div>
              <div className="re-outfit-body">
                <div className="re-outfit-label">Piezas recomendadas</div>
                <div className="re-outfit-pieces">{outfit.pieces}</div>
                <div className="re-outfit-color-row">
                  {(outfit.colors || []).map((color, j) => (
                    <div key={j} className="re-outfit-color-dot" style={{ background: typeof color === 'string' ? color : color.hex }} />
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
              <div className="re-summary-text">Tonos de cabello + cortes recomendados</div>
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
          <div className="re-brand-tag">PRYSM · Tu Guía de Estilo</div>
          <div className="re-close-footer">
            <div className="re-footer-brand">PRYSM</div>
            <div className="re-footer-url">Análisis Personalizado · Guía de Estilo Premium 2026</div>
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
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

import { useState, useEffect, useRef } from 'react';
import { AnalysisResponse } from '../services/api';

interface ReportProps {
  userName: string;
  analysisResult: AnalysisResponse | null;
  onShare: () => void;
  onRestart: () => void;
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
  onRestart
}: ReportProps) {
  const [activePage, setActivePage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get data from props or localStorage (cast to fallback type for full properties)
  const data = (analysisResult?.analysis || fallbackData) as typeof fallbackData;
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

  return (
    <div className="report-editorial-container" ref={containerRef}>
      {/* Page 1: Cover */}
      <section className="re-page re-cover">
        <div className="re-watermark">PRYSM</div>
        <div className="re-cover-photo">
          <img src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&h=900&q=80&auto=format&fit=crop&crop=top" alt="" />
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
              {(data.tips || fallbackData.tips).slice(0, 4).map((tip: string, i: number) => (
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
            {(data.fabrics || fallbackData.fabrics).map((fabric: { name: string; desc: string }, i: number) => (
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
              {(data.hairColors || fallbackData.hairColors).map((hair: { name: string; color: string; desc: string }, i: number) => (
                <div key={i} className="re-hair-item">
                  <div className="re-hair-swatch" style={{ background: hair.color }} />
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
              {(data.haircuts || fallbackData.haircuts).map((cut: string, i: number) => (
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
          {(data.outfits || fallbackData.outfits).map((outfit: { occasion: string; icon: string; pieces: string; colors: string[] }, i: number) => (
            <div key={i} className="re-outfit-card">
              <div className={`re-outfit-header ${i % 2 === 0 ? 're-outfit-green' : 're-outfit-gold'}`}>
                <div className="re-outfit-icon">{outfit.icon}</div>
                <div className="re-outfit-name">{outfit.occasion}</div>
              </div>
              <div className="re-outfit-body">
                <div className="re-outfit-label">Piezas recomendadas</div>
                <div className="re-outfit-pieces">{outfit.pieces}</div>
                <div className="re-outfit-color-row">
                  {outfit.colors.map((color, j) => (
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
              {(data.jewelry || fallbackData.jewelry).map((jewel: { name: string; desc: string }, i: number) => (
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
              {(data.bags || fallbackData.bags).map((bag: { name: string; desc: string }, i: number) => (
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
      <div className="re-actions">
        <button className="re-action-btn" onClick={onShare}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
          </svg>
          Compartir
        </button>
        <button className="re-action-btn primary" onClick={onRestart}>
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

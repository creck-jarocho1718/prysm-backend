import { useEffect, useState } from 'react';
import { AnalysisResponse } from '../services/api';
import { TEST_MODE } from '../config';

interface ResultPreviewProps {
  userName: string;
  analysisResult: AnalysisResponse | null;
  onViewReport: () => void;
  onPaywall: () => void;
}

// Fallback colors for demo/preview
const fallbackPalette = {
  protagonist: ['#B5691B', '#6E2C00', '#E07B39', '#2F4F1E', '#A0522D', '#8B4513'],
  secondary: ['#3D2314', '#C68642', '#567568', '#C0392B'],
  neutral: ['#4A2810', '#7B3F00', '#C68642'],
  accent: ['#d4a473', '#205E53', '#B5691B', '#1a1a1a'],
  avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
};

const testimonials = [
  {
    score: '9.1',
    text: 'Nunca supe que el color burdeos me sentaba así de bien. En dos semanas me hicieron 4 cumplidos en el trabajo. El informe cambió cómo me visto para siempre.',
    name: 'Camila R.',
    location: 'Ciudad de México',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80&auto=format&fit=crop'
  },
  {
    score: '9.4',
    text: 'Pensé que era un test más, pero la guía de compras me ahorró $400 USD en ropa que habría comprado y nunca usado. La mejor inversión en mi imagen personal.',
    name: 'Valentina T.',
    location: 'Guadalajara',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80&auto=format&fit=crop'
  },
  {
    score: '9.7',
    text: 'La sección de cabello fue un cambio de vida. Mi estilista no podía creer lo preciso que era. Ahora voy a mis citas con una seguridad que nunca tuve.',
    name: 'Andrea M.',
    location: 'Monterrey',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80&auto=format&fit=crop'
  },
  {
    score: '8.9',
    text: 'Tengo 52 años y pensé que ya no había nada que hacer. El informe me demostró que estaba equivocada. Mis amigas me preguntan qué me hice.',
    name: 'Lucía H.',
    location: 'Puebla',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80&auto=format&fit=crop'
  },
  {
    score: '9.2',
    text: 'Trabajo en televisión y el informe me dio exactamente los colores que debo usar frente a cámara. Mi director de arte me preguntó qué había cambiado.',
    name: 'Daniela S.',
    location: 'Ciudad de México',
    avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=80&q=80&auto=format&fit=crop'
  },
  {
    score: '9.5',
    text: 'Me compré un vestido azul que nunca me había puesto. El informe dijo que era mi color y tenía razón. Ahora todo lo que compro me queda bien.',
    name: 'Sofía G.',
    location: 'Tijuana',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=80&q=80&auto=format&fit=crop'
  }
];

export default function ResultPreview({
  userName,
  analysisResult,
  onViewReport,
  onPaywall
}: ResultPreviewProps) {
  const [animated, setAnimated] = useState(false);

  // Get analysis data from prop or localStorage
  const analysis = analysisResult || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('prysm_analysis') || 'null') : null);

  // Debug log
  console.log('[ResultPreview] Props and State:', {
    analysisResult: analysisResult,
    localStorageData: typeof window !== 'undefined' ? localStorage.getItem('prysm_analysis') : null,
    analysis: analysis
  });

  // Use actual analysis data from backend (GPT), NOT fallback values
  // Backend returns: { success, data: { analisisColor, silueta, estilo, ... } }
  const gptData = analysis?.data;
  const seasonName = gptData?.analisisColor?.estacion || (analysis?.success === false ? 'Análisis en progreso...' : 'Temporada personalizada');
  const prysmScore = analysis?.success === false ? '...' : '8.5';
  const bodyTypeName = gptData?.silueta?.tipoCuerpo || 'Tu silueta';

  // Transform GPT palette format to component format
  const gptPalette = gptData?.analisisColor?.paleta;
  const palette = gptPalette ? {
    protagonist: gptPalette.protagonistas?.map((c: { hex: string }) => c.hex) || [],
    secondary: gptPalette.secundarios?.map((c: { hex: string }) => c.hex) || [],
    neutral: gptPalette.neutros?.map((c: { hex: string }) => c.hex) || [],
    accent: gptPalette.acento?.map((c: { hex: string }) => c.hex) || [],
    avoid: gptPalette.evitar?.map((c: { hex: string }) => c.hex) || []
  } : (analysis?.success === false ? { protagonist: [], secondary: [], neutral: [], accent: [], avoid: [] } : fallbackPalette);

  // Debug log
  console.log('[ResultPreview] Extracted data:', {
    hasAnalysis: !!analysis,
    success: analysis?.success,
    seasonName,
    prysmScore,
    bodyTypeName,
    paletteKeys: palette ? Object.keys(palette) : [],
    protagonistCount: palette?.protagonist?.length || 0,
    protagonistColors: palette?.protagonist || []
  });

  // Combine protagonist and secondary colors for the hero color strip
  const heroColors = [
    ...(palette.protagonist || []).slice(0, 6)
  ];

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleVerifyClick = () => {
    onPaywall();
  };

  const handleBuyClick = () => {
    // In TEST_MODE: Go directly to PDF generation
    if (TEST_MODE) {
      onViewReport();
      return;
    }
    // In production: Open MercadoPago
    window.open('https://link.mercadopago.com.mx/prysm', '_blank');
  };

  return (
    <div className="result-preview-screen">
      {/* Ambient orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* HERO */}
      <div className="rp-hero" id="hero">
        <div className="rp-hero-bg">
          <img
            src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1400&q=85&auto=format&fit=crop&crop=top"
            alt="Fashion editorial"
          />
        </div>
        <div className="rp-hero-overlay" />
        <div className="rp-hero-content">
          <div className="rp-badge">
            <div className="rp-badge-dot" />
            Análisis completado
          </div>
          <h1 className="rp-hero-title">
            Tu informe<br /><em>está listo.</em>
          </h1>
          <div className="rp-hero-name">
            {userName || 'Valentina'} · PRYSM-2026 · {seasonName}
          </div>
          <a
            className="rp-scroll-hint"
            href="#includes"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('includes')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <span>Descubre más</span>
            <div className="rp-scroll-line" />
          </a>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="rp-main" id="main-content">

        {/* EDITORIAL CREDIBILITY */}
        <div className="rp-editorial">
          <div className="rp-editorial-label">Tendencia editorial · Respaldado por la industria de moda</div>
          <div className="rp-editorial-logos">
            <div className="rp-editorial-logo">Vogue <span>Style Lab</span></div>
            <div className="rp-editorial-dot" />
            <div className="rp-editorial-logo">Elle <span>Beauty</span></div>
            <div className="rp-editorial-dot" />
            <div className="rp-editorial-logo">Harper's <span>Bazaar</span></div>
            <div className="rp-editorial-dot" />
            <div className="rp-editorial-logo">Forbes <span>Style</span></div>
          </div>
          <div className="rp-editorial-badge">
            <div className="rp-editorial-badge-icon">✦</div>
            <div className="rp-editorial-badge-text">Metodología respaldada por estilistas profesionales</div>
          </div>
        </div>

        {/* STATS */}
        <div className="rp-stats">
          <div>
            <div className="rp-stat-num">{prysmScore}</div>
            <div className="rp-stat-label">PRYSM Score</div>
          </div>
          <div>
            <div className="rp-stat-num">6</div>
            <div className="rp-stat-label">Categorías</div>
          </div>
          <div>
            <div className="rp-stat-num">$299</div>
            <div className="rp-stat-label">MXN · Pago único</div>
          </div>
        </div>

        {/* INCLUDES SECTION */}
        <div className="rp-includes-section" id="includes">
          <div className="rp-includes-header">
            <div className="rp-includes-label">Tu informe incluye</div>
            <h2 className="rp-includes-title">Todo lo que necesitas para verte <em>increíble</em></h2>
            <div className="rp-includes-sub">Cada sección personalizada con tus datos reales de análisis</div>
          </div>

          <div className="rp-includes-body">
            {/* Left intro */}
            <div className="rp-includes-intro">
              <h3 className="rp-includes-intro-title">Tu guía <em>editorial</em> de estilo personal</h3>
              <p className="rp-includes-intro-text">
                No es un test genérico. Es un documento de 7 páginas diseñado exclusivamente para ti,
                con los colores, siluetas y recomendaciones que mejor funcionan con tu biotipo único.
              </p>
              <div className="rp-includes-intro-cta">↓ Tus resultados personalizados</div>
            </div>

            {/* Color cards */}
            <div className="rp-color-grid">
              {/* Card 1: Temporada de color */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top">
                    {heroColors.slice(0, 6).map((color, i) => (
                      <div key={i} className="rp-color-dot" style={{ background: color }} />
                    ))}
                  </div>
                  <div className="rp-color-strip-bottom">
                    {heroColors.slice(0, 6).map((color, i) => (
                      <div key={i} className="rp-strip-segment" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">01</div>
                  <div className="rp-color-title">Temporada de color</div>
                  <div className="rp-color-desc">Tu subtipo exacto y por qué estos colores funcionan con tu tono de piel, ojos y cabello.</div>
                  <div className="rp-color-hex-row">
                    {heroColors.slice(0, 3).map((color, i) => (
                      <div key={i} className="rp-color-hex-chip">{color}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 2: 8 colores */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top">
                    {(palette.secondary || []).slice(0, 4).map((color, i) => (
                      <div key={i} className="rp-color-dot" style={{ background: color }} />
                    ))}
                  </div>
                  <div className="rp-color-strip-bottom">
                    {(palette.secondary || []).slice(0, 4).map((color, i) => (
                      <div key={i} className="rp-strip-segment" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">02</div>
                  <div className="rp-color-title">8 colores que te favorecen</div>
                  <div className="rp-color-desc">Tus colores protagonistas, los de acento y los que debes evitar. Con hex codes para comprar online.</div>
                  <div className="rp-color-hex-row">
                    {(palette.secondary || []).slice(0, 3).map((color, i) => (
                      <div key={i} className="rp-color-hex-chip">{color}</div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Card 3: Guía de estilo */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top" style={{ background: 'linear-gradient(135deg,rgba(212,164,115,.1),rgba(32,94,83,.08))', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ display: 'flex', gap: '4px', width: '100%', justifyContent: 'center' }}>
                      <div style={{ width: '20px', height: '28px', background: 'rgba(255,255,255,.06)', borderRadius: '3px 3px 0 0' }} />
                      <div style={{ width: '30px', height: '36px', background: 'rgba(212,164,115,.15)', borderRadius: '3px 3px 0 0', border: '1px solid rgba(212,164,115,.2)' }} />
                      <div style={{ width: '20px', height: '30px', background: 'rgba(255,255,255,.06)', borderRadius: '3px 3px 0 0' }} />
                    </div>
                    <div style={{ fontSize: '8px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>Silueta {bodyTypeName}</div>
                  </div>
                  <div className="rp-color-strip-bottom">
                    <div className="rp-strip-segment" style={{ background: 'linear-gradient(90deg,#d4a473,#205E53)' }} />
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">03</div>
                  <div className="rp-color-title">Guía de estilo y silueta</div>
                  <div className="rp-color-desc">Qué siluetas, telas y proporciones realzan tu figura. Qué cortar, qué evitar y cómo dressing tu cuerpo.</div>
                  <div className="rp-color-hex-row">
                    <div className="rp-color-hex-chip">{bodyTypeName}</div>
                    <div className="rp-color-hex-chip">Algodón · Seda</div>
                  </div>
                </div>
              </div>

              {/* Card 4: Cabello */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top">
                    {(palette.neutral || []).slice(0, 3).map((color, i) => (
                      <div key={i} className="rp-color-dot" style={{ background: color }} />
                    ))}
                  </div>
                  <div className="rp-color-strip-bottom">
                    {(palette.neutral || []).slice(0, 3).map((color, i) => (
                      <div key={i} className="rp-strip-segment" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">04</div>
                  <div className="rp-color-title">Color y corte de cabello</div>
                  <div className="rp-color-desc">Tonos que iluminan tu rostro y el corte que mejor se adapta a tu forma de cara y textura de pelo.</div>
                  <div className="rp-color-hex-row">
                    <div className="rp-color-hex-chip">Castaño cálido</div>
                    <div className="rp-color-hex-chip">Corte en V</div>
                  </div>
                </div>
              </div>

              {/* Card 5: Outfits */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top" style={{ background: 'linear-gradient(135deg,rgba(255,255,255,.04),rgba(255,255,255,.02))', flexDirection: 'column', gap: '4px', justifyContent: 'center' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', width: '100%', maxWidth: '80px' }}>
                      {(palette.accent || []).slice(0, 4).map((color, i) => (
                        <div key={i} style={{ height: '24px', background: color, borderRadius: '4px', border: `1px solid ${color}` }} />
                      ))}
                    </div>
                  </div>
                  <div className="rp-color-strip-bottom">
                    {(palette.accent || []).slice(0, 4).map((color, i) => (
                      <div key={i} className="rp-strip-segment" style={{ background: color }} />
                    ))}
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">05</div>
                  <div className="rp-color-title">4 outfits por ocasión</div>
                  <div className="rp-color-desc">Día a día, oficina, citas y viajes. Cada uno adaptado a tu presupuesto real y fácil de replicar.</div>
                  <div className="rp-color-hex-row">
                    <div className="rp-color-hex-chip">4 looks completos</div>
                    <div className="rp-color-hex-chip">Adaptados</div>
                  </div>
                </div>
              </div>

              {/* Card 6: PDF Premium */}
              <div className="rp-color-card">
                <div className="rp-color-strip">
                  <div className="rp-color-strip-top" style={{ background: 'linear-gradient(135deg,rgba(212,164,115,.12),rgba(32,94,83,.08))', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <div style={{ width: '50px', height: '64px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <div style={{ fontFamily: 'var(--serif)', fontSize: '10px', color: 'rgba(212,164,115,.5)' }}>P</div>
                    </div>
                    <div style={{ fontSize: '8px', letterSpacing: '.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,.2)' }}>7 páginas</div>
                  </div>
                  <div className="rp-color-strip-bottom">
                    <div className="rp-strip-segment" style={{ background: 'linear-gradient(90deg,#d4a473,#205E53)' }} />
                  </div>
                </div>
                <div className="rp-color-content">
                  <div className="rp-color-number">06</div>
                  <div className="rp-color-title">PDF premium editorial</div>
                  <div className="rp-color-desc">7 páginas diseñadas tipo revista. Guarda, imprime o muestraselo a tu estilista. Acceso permanente.</div>
                  <div className="rp-color-hex-row">
                    <div className="rp-color-hex-chip">Descargar</div>
                    <div className="rp-color-hex-chip">Imprimir</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRICE CTA */}
        <div className="rp-price-section">
          <div className="rp-divider" />
          {TEST_MODE ? (
            /* TEST MODE: Show direct access button */
            <div className="rp-price-card" style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{
                display: 'inline-block',
                background: '#10b981',
                color: '#fff',
                padding: '8px 20px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: '500',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '24px'
              }}>
                🧪 MODO PRUEBA
              </div>
              <h3 style={{
                fontFamily: 'var(--serif)',
                fontSize: 'clamp(20px, 3vw, 28px)',
                marginBottom: '16px',
                color: '#fff'
              }}>
                Tu informe está listo para generar
              </h3>
              <p style={{
                color: 'rgba(255,255,255,0.6)',
                marginBottom: '32px',
                fontSize: '14px'
              }}>
                Haz clic para generar tu PDF con tus datos reales
              </p>
              <button className="rp-buy-btn" onClick={handleBuyClick} style={{
                background: '#10b981',
                fontSize: '13px',
                padding: '18px 40px'
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
                Ver mi reporte completo — MODO PRUEBA
              </button>
              <p style={{
                color: 'rgba(255,255,255,0.4)',
                marginTop: '16px',
                fontSize: '12px'
              }}>
                Se generará un PDF personalizado con tus respuestas
              </p>
            </div>
          ) : (
            /* PRODUCTION: Show normal payment flow */
            <>
              <div className="rp-price-card">
                <div className="rp-price-tag">Acceso completo · Pago único</div>
                <div className="rp-price-amount">$299 <small>MXN</small></div>
                <div className="rp-price-note">Sin suscripción · Acceso de por vida</div>
                <button className="rp-buy-btn" onClick={handleBuyClick}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  Obtener mi informe ahora
                </button>
                <div className="rp-guarantee">✓ Acceso inmediato · ✓ PDF premium · ✓ Sin límite de tiempo</div>
                <div className="rp-verify" onClick={handleVerifyClick}>¿Ya pagaste? Verificar mi pago</div>
              </div>
              <div className="rp-trust-row">
                <div className="rp-trust-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Pago seguro
                </div>
                <div className="rp-trust-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  MercadoPago
                </div>
                <div className="rp-trust-item">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Sin suscripción
                </div>
              </div>
            </>
          )}
        </div>

        {/* CAROUSEL */}
        <div className="rp-carousel-section">
          <div className="rp-carousel-header">
            <div className="rp-carousel-label">Resultados reales</div>
            <h3 className="rp-carousel-title">Lo que dicen <em>nuestras clientas</em></h3>
            <div className="rp-carousel-sub">Valoración promedio 4.9/5 · Más de 2,400 mujeres en México</div>
          </div>
          <div className="rp-carousel-track-wrap">
            <div className="rp-carousel-track">
              {[...testimonials, ...testimonials].map((t, i) => (
                <div key={i} className="rp-testimonial-card">
                  <div className="rp-carousel-stars-badge">
                    <div className="rp-tc-score-badge">{t.score}</div>
                  </div>
                  <div className="rp-tc-stars">★★★★★</div>
                  <div className="rp-tc-text">"{t.text}"</div>
                  <div className="rp-tc-author">
                    <img className="rp-tc-avatar" src={t.avatar} alt={t.name} />
                    <div>
                      <div className="rp-tc-name">{t.name}</div>
                      <div className="rp-tc-meta">{t.location}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

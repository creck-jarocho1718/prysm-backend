import { useEffect, useState } from 'react';

interface ResultPreviewProps {
  userName: string;
  onViewReport: () => void;
  onPaywall: () => void;
}

const modules = [
  { icon: '🎨', name: 'Tu Paleta de Color', desc: 'Colores que realzan tu tono natural' },
  { icon: '✨', name: 'Siluetas Ideales', desc: 'Cortes que favorecen tu figura' },
  { icon: '👗', name: 'Piezas Clave', desc: 'Prendas esenciales para tu armario' },
  { icon: '💫', name: 'Ocasiones', desc: 'Looks para cada momento' },
  { icon: '🌟', name: 'Tendencias', desc: 'Lo último adaptado a ti' },
  { icon: '📐', name: 'Proporciones', desc: 'Equilibrio perfecto en cada outfit' }
];

const valueCards = [
  { category: 'Paleta', title: 'Colores de Otoño', desc: 'Tonos tierra y cobre que realzan tu belleza natural', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' },
  { category: 'Silueta', title: 'Línea Ajustada', desc: 'Destaca tus proporciones con elegancia', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80' },
  { category: 'Estilo', title: 'Boho Moderno', desc: 'Libertad con sofisticación', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80' },
  { category: 'Tendencia', title: 'Minimalismo Chic', desc: 'Menos es más, pero con impacto', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
  { category: 'Tela', title: 'Sedas Naturales', desc: 'Fluidez y lujo en cada movimiento', image: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=600&q=80' },
  { category: 'Accesorios', title: 'Joyas Minimalistas', desc: 'El detalle que lo cambia todo', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600&q=80' }
];

export default function ResultPreview({ userName, onViewReport, onPaywall }: ResultPreviewProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="screen result-preview-screen">
      <div className="rp-cover">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80" alt="Cover" />
        <div className="rp-cover-content">
          <p className="rp-eyebrow">Tu Análisis Personalizado</p>
          <h1 className="rp-title">
            Hola, <em>{userName}</em>
          </h1>
        </div>
        <div className="rp-score">
          <div className="rp-score-n">92<span style={{ fontSize: '0.4em' }}>%</span></div>
          <small>Compatibilidad de Estilo</small>
        </div>
      </div>

      <div className="rp-preview-section">
        <h2 className="rp-preview-title">Tu Informe Incluye</h2>
        <p className="rp-preview-sub">6 módulos diseñados para transformar tu estilo</p>

        <div className="rp-module-grid">
          {modules.map((mod, idx) => (
            <div
              key={idx}
              className="rp-module-card"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.6s cubic-bezier(0.16,1,0.3,1) ${idx * 0.1}s`
              }}
            >
              <div className="rp-module-card-icon">{mod.icon}</div>
              <div className="rp-module-card-body">
                <h3 className="rp-module-card-name">{mod.name}</h3>
                <p className="rp-module-card-desc">{mod.desc}</p>
              </div>
              <div className="rp-module-card-lock">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0110 0v4"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-cta-section">
        <div className="rp-price-wrap">
          <span className="rp-price-old">$49.99</span>
          <span className="rp-price-current"><sup>$</sup>19.99</span>
        </div>
        <p className="rp-price-label">Acceso completo a tu informe</p>

        <button className="rp-cta-btn" onClick={onViewReport}>
          Ver Mi Informe Completo
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7"/>
          </svg>
        </button>

        <p className="rp-cta-sub">O prueba gratis con módulos limitados</p>

        <div className="rp-cta-trust">
          <span>Pago seguro</span>
          <span>Acceso inmediato</span>
          <span>Garantía 30 días</span>
        </div>
      </div>

      <div className="rp-validation">
        <p className="rp-validation-label">Validado por expertos en estilo</p>
        <div className="rp-validation-logos">
          <span className="rp-validation-logo">Vogue<span>Editorial</span></span>
          <div className="rp-validation-dot" />
          <span className="rp-validation-logo">Elle<span>Style</span></span>
          <div className="rp-validation-dot" />
          <span className="rp-validation-logo">GQ<span>Fashion</span></span>
        </div>
      </div>

      <div className="rp-value-section">
        <div className="rp-value-header">
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(28px,4vw,44px)', letterSpacing: '-0.02em' }}>
            Inspiración Personalizada
          </h2>
          <div className="rp-value-live">
            <div className="rp-live-dot" />
            <span className="rp-live-label">Actualizado</span>
          </div>
        </div>

        <div className="rp-value-grid">
          {valueCards.map((card, idx) => (
            <div
              key={idx}
              className="rp-value-card"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(30px)',
                transition: `all 0.7s cubic-bezier(0.16,1,0.3,1) ${0.6 + idx * 0.1}s`
              }}
            >
              <div className="rpvc-photo-wrap">
                <img src={card.image} alt={card.title} className="rpvc-photo" />
                <div className="rpvc-overlay">
                  <div className="rpvc-lock">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0110 0v4"/>
                    </svg>
                  </div>
                </div>
                <div className="rpvc-shimmer" />
              </div>
              <div className="rpvc-body">
                <p className="rpvc-category">{card.category}</p>
                <h3 className="rpvc-title">{card.title}</h3>
                <p className="rpvc-desc">{card.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rp-social">
        <h2 className="rp-social-title">Lo que dicen nuestros usuarios</h2>
        <p className="rp-social-sub">Más de 10,000 personas han transformado su estilo</p>

        <div className="rp-testimonials">
          {[
            { text: 'Finalmente encontré los colores que me favorecen. Mi armario tiene sentido ahora.', name: 'María García', meta: 'Cliente desde 2024' },
            { text: 'El informe es increíblemente detallado. Vale cada centavo.', name: 'Carlos Ruiz', meta: 'Cliente desde 2024' },
            { text: 'Mis amigos me preguntan qué ha cambiado. Es mi confianza.', name: 'Ana Martínez', meta: 'Cliente desde 2023' }
          ].map((testimonial, idx) => (
            <div key={idx} className="rp-testimonial">
              <div className="rp-testimonial-stars">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="rp-star">★</span>
                ))}
              </div>
              <p className="rp-testimonial-text">"{testimonial.text}"</p>
              <div className="rp-testimonial-author">
                <div className="rp-testimonial-avatar">
                  <img src={`https://i.pravatar.cc/100?img=${idx + 10}`} alt={testimonial.name} />
                </div>
                <div>
                  <p className="rp-testimonial-name">{testimonial.name}</p>
                  <p className="rp-testimonial-meta">{testimonial.meta}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '60px 48px', textAlign: 'center', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
        <button
          onClick={onPaywall}
          style={{
            fontFamily: 'var(--sans)',
            fontSize: '11px',
            fontWeight: 400,
            letterSpacing: '0.4em',
            textTransform: 'uppercase',
            color: '#fff',
            background: '#111',
            padding: '24px 56px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.5s cubic-bezier(0.16,1,0.3,1)'
          }}
        >
          Desbloquear Informe Completo
        </button>
      </div>
    </div>
  );
}

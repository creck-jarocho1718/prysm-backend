import { useEffect, useState } from 'react';

interface ResultPreviewProps {
  userName: string;
  onViewReport: () => void;
  onPaywall: () => void;
}

const includes = [
  {
    title: 'Tu temporada de color personalizada',
    desc: 'Otoño, Primavera, Verano o Invierno con tu subtipo exacto'
  },
  {
    title: '8 colores que te favorecen',
    desc: 'Con hex codes exactos para comprar online o en tienda'
  },
  {
    title: 'Guía de estilo según tu silueta',
    desc: 'Qué cortar, qué evitar, qué telas y proporciones favorecen'
  },
  {
    title: '3 colores de cabello recomendados',
    desc: 'Con códigos de color y técnica de aplicación'
  },
  {
    title: '4 outfits por ocasión',
    desc: 'Día a día, oficina, citas y viajes — listos para copiar'
  },
  {
    title: 'Joyería, bolsos y zapatos ideales',
    desc: 'Metal correcto, estilos y marcas accesibles'
  },
  {
    title: 'PDF premium para descargar',
    desc: '7 páginas editable para guardar o imprimir'
  }
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
          <p className="rp-eyebrow">Tu análisis está listo</p>
          <h1 className="rp-title">
            Desbloquea tu<br /><em>informe completo.</em>
          </h1>
          <p className="rp-sub">Accede a todo — temporada, paleta, outfits y PDF.</p>
        </div>
      </div>

      <div className="rp-includes-section">
        <div className="rp-includes">
          {includes.map((item, idx) => (
            <div
              key={idx}
              className="rp-include-item"
              style={{
                opacity: animated ? 1 : 0,
                transform: animated ? 'translateY(0)' : 'translateY(20px)',
                transition: `all 0.5s cubic-bezier(0.16,1,0.3,1) ${idx * 0.08}s`
              }}
            >
              <div className="rp-include-icon">✓</div>
              <div className="rp-include-text">
                <div className="rp-include-title">{item.title}</div>
                <div className="rp-include-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="rp-price-box">
          <div className="rp-price-tag">Pago único · Acceso permanente</div>
          <div className="rp-price">$346.84 <small>MXN</small></div>
          <div className="rp-price-note">IVA incluido · Sin suscripciones</div>
        </div>

        <a
          className="rp-cta"
          href="https://link.mercadopago.com.mx/prysm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Pagar con MercadoPago
        </a>

        <div className="rp-trust">
          <span>Pago seguro · Procesado por MercadoPago</span>
        </div>

        <div className="rp-verify-link" onClick={() => {}}>
          <span>¿Ya pagaste? Verificar mi pago</span>
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

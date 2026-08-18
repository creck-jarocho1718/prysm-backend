import { useState } from 'react';

interface PaywallProps {
  onBack: () => void;
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

export default function Paywall({ onBack }: PaywallProps) {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="screen paywall-screen">
        <div className="pay-inner" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
          <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(32px, 5vw, 48px)', marginBottom: '16px' }}>
            ¡Bienvenido/a!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '32px' }}>
            Tu informe está listo. Revisa tu email para acceder.
          </p>
          <button
            onClick={onBack}
            style={{
              fontFamily: 'var(--sans)',
              fontSize: '10px',
              letterSpacing: '0.4em',
              textTransform: 'uppercase',
              padding: '20px 40px',
              background: '#fff',
              color: '#000',
              border: 'none',
              cursor: 'pointer'
            }}
          >
            Ver Mi Informe
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen paywall-screen">
      <nav className="nav" style={{ mixBlendMode: 'difference', color: '#fff' }}>
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '12px',
            letterSpacing: '0.2em'
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver
        </button>
        <div className="nav-logo">PRYSM</div>
        <div style={{ width: '60px' }} />
      </nav>

      <div className="pay-inner">
        <p className="pay-eyebrow">Tu análisis está listo</p>
        <h1 className="pay-title">
          Desbloquea tu<br /><em>informe completo.</em>
        </h1>
        <p className="pay-sub">Accede a todo — temporada, paleta, outfits y PDF.</p>

        <div className="pay-includes">
          {includes.map((item, idx) => (
            <div key={idx} className="pay-include-item">
              <div className="pay-include-icon">✓</div>
              <div className="pay-include-text">
                <div className="pay-include-title">{item.title}</div>
                <div className="pay-include-desc">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="pay-price-box">
          <div className="pay-price-tag">Pago único · Acceso permanente</div>
          <div className="pay-price">$346.84 <small>MXN</small></div>
          <div className="pay-price-note">IVA incluido · Sin suscripciones</div>
        </div>

        <a
          className="pay-cta"
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

        <div className="pay-trust">
          <span>Pago seguro · Procesado por MercadoPago</span>
        </div>

        <div className="pay-verify-link">
          <span>¿Ya pagaste? Verificar mi pago</span>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

interface PaywallProps {
  onBack: () => void;
}

export default function Paywall({ onBack }: PaywallProps) {
  const [formData, setFormData] = useState({
    email: '',
    card: '',
    expiry: '',
    cvc: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

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
        <span className="pay-tag">Oferta Especial</span>

        <h1 className="pay-title">
          Desbloquea tu<br /><em>Informe Completo</em>
        </h1>

        <p className="pay-sub">
          Accede a todas las recomendaciones personalizadas,
          tu paleta de colores completa y consejos de expertos.
        </p>

        <div className="pay-card">
          <div className="pay-row">
            <div>
              <p className="pay-product">Informe Premium</p>
              <p className="pay-desc">Acceso de por vida</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p className="pay-price">$19.99</p>
              <p className="pay-old">$49.99</p>
            </div>
          </div>

          <p className="pay-savings">Ahorra 60% — Oferta por tiempo limitado</p>

          <form onSubmit={handleSubmit}>
            <div className="pay-field">
              <label>Email</label>
              <input
                type="email"
                className="pay-input"
                placeholder="tu@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="pay-field">
              <label>Datos de Pago</label>
              <input
                type="text"
                className="pay-input"
                placeholder="Número de tarjeta"
                value={formData.card}
                onChange={(e) => setFormData({ ...formData, card: e.target.value })}
                required
              />
            </div>

            <div className="pay-grid">
              <input
                type="text"
                className="pay-input"
                placeholder="MM/AA"
                value={formData.expiry}
                onChange={(e) => setFormData({ ...formData, expiry: e.target.value })}
                required
              />
              <input
                type="text"
                className="pay-input"
                placeholder="CVC"
                value={formData.cvc}
                onChange={(e) => setFormData({ ...formData, cvc: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="pay-submit">
              Completar Compra
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>
          </form>

          <p className="pay-tax-note">Impuestos incluidos. Cancelación en cualquier momento.</p>
        </div>

        <p className="pay-trust">
          🔒 Pago seguro · SSL encriptado · Procesado por Stripe
        </p>
      </div>
    </div>
  );
}

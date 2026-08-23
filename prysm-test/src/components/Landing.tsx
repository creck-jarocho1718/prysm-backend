import { useEffect, useState } from 'react';

interface LandingProps {
  onStart: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="landing">
      <div className="landing-hero">
        <img
          src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80"
          alt="Fashion"
          className="landing-img"
        />
        <div className="landing-content">
          <div className="landing-eyebrow" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 0.8s' }}>
            Análisis de Estilo Personal
          </div>
          <h1 className="landing-title" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1s' }}>
            Descubre tu<br /><em>mejor versión</em>
          </h1>
          <p className="landing-body" style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.2s' }}>
            Un análisis profundo de tu estilo personal basado en colores,
            siluetas y tendencias que te hacen brillar. 5 minutos que cambiarán tu armario.
          </p>
          <button
            className="landing-cta"
            onClick={onStart}
            style={{ opacity: loaded ? 1 : 0, transform: loaded ? 'translateY(0)' : 'translateY(20px)', transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.4s' }}
          >
            Comenzar Análisis
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
      <div className="landing-footer" style={{ opacity: loaded ? 1 : 0, transition: 'all 1s cubic-bezier(0.16,1,0.3,1) 1.6s' }}>
        <span className="landing-promise">+10,000 personas han descubierto su estilo</span>
        <div className="landing-modules">
          <span className="landing-module">Colores</span>
          <span className="landing-module">Siluetas</span>
          <span className="landing-module">Tendencias</span>
        </div>
      </div>
    </div>
  );
}

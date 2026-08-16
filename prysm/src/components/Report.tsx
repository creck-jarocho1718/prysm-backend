import { useState } from 'react';

interface ReportProps {
  userName: string;
  onShare: () => void;
  onRestart: () => void;
}

const palette = [
  { name: 'Terracota', hex: '#C45A3B', tag: 'Principal' },
  { name: 'Camel', hex: '#C4A76C', tag: 'Secundario' },
  { name: 'Oliva', hex: '#6B7B3C', tag: 'Acento' },
  { name: 'Café', hex: '#4A3728', tag: 'Base' }
];

export default function Report({ userName, onShare, onRestart }: ReportProps) {
  const [activeSection, setActiveSection] = useState('paleta');

  const sections = [
    { id: 'paleta', label: 'Paleta' },
    { id: 'siluetas', label: 'Siluetas' },
    { id: 'outfits', label: 'Outfits' },
    { id: 'tips', label: 'Tips' }
  ];

  return (
    <div className="screen report-screen">
      <div className="report-hero">
        <img src="https://images.unsplash.com/photo-1509631179647-0177331693ae?w=1920&q=80" alt="Hero" />
        <div className="report-hero-content">
          <h1 className="report-season">
            Otoño<br /><em>Radiante</em>
          </h1>
          <div className="report-meta">
            <span>Estación: Otoño</span>
            <span>Subtemporada: cálido</span>
            <span>Intensidad: alta</span>
          </div>
        </div>
        <div className="report-score">
          <div className="report-score-n">92<span style={{ fontSize: '0.4em' }}>%</span></div>
          <small>Compatibilidad</small>
        </div>
      </div>

      <nav className="report-nav">
        {sections.map(section => (
          <button
            key={section.id}
            className={`report-nav-btn ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {activeSection === 'paleta' && (
        <section className="report-section">
          <p className="report-section-label">Tu Paleta Personal</p>
          <h2 className="report-section-title">Colores que te <em>brillan</em></h2>

          <div className="report-hero-photo">
            <img src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80" alt="Style" />
            <span className="report-hero-photo-label">Tu guía de colores</span>
          </div>

          <div className="palette-grid">
            {palette.map((color, idx) => (
              <div
                key={idx}
                className="palette-swatch"
                style={{ backgroundColor: color.hex }}
              >
                <span className="palette-swatch-name">{color.name}</span>
                <span className="palette-swatch-hex">{color.hex}</span>
                {color.tag && <span className="palette-swatch-tag">{color.tag}</span>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '24px', background: '#fafaf8', borderRadius: '4px' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Los tonos cálidos de tierra amplifican tu energía natural. Usa terracota y camel como dominantes,
              oliva como acento y café para bases elegantes."
            </p>
          </div>
        </section>
      )}

      {activeSection === 'siluetas' && (
        <section className="report-section">
          <p className="report-section-label">Tu Silueta Ideal</p>
          <h2 className="report-section-title">Líneas que <em>favorecen</em></h2>

          <div className="outfit-grid" style={{ marginTop: '32px' }}>
            {[
              { occasion: 'Trabajo', look: 'Blazer estructurado con pantalón palazzo, accessorized con cinturón тонкая.' },
              { occasion: 'Casual', look: 'Camel coat sobre sweater de cashmere, jeans straight leg.' },
              { occasion: 'Evening', look: 'Vestido midi fluido en terracota, pendientes dorados minimalistas.' },
              { occasion: 'Weekend', look: 'Sweater oversize, falda plisada, botas de cuero.' }
            ].map((outfit, idx) => (
              <div key={idx} className="outfit-card">
                <p className="outfit-occasion">{outfit.occasion}</p>
                <p className="outfit-look">"{outfit.look}"</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'outfits' && (
        <section className="report-section">
          <p className="report-section-label">Looks Recomendados</p>
          <h2 className="report-section-title">Tu <em>wardrobe</em></h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginTop: '32px' }}>
            {[
              { title: 'Esencial #1', desc: 'Camel coat + vestido negro + botas altas', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80' },
              { title: 'Esencial #2', desc: 'Blazer terracota + jeans + loafers', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
              { title: 'Esencial #3', desc: 'Cardigan oliva + falda midi + ballet flats', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
              { title: 'Esencial #4', desc: ' sweater camel + pantalón wide leg', image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' }
            ].map((item, idx) => (
              <div key={idx} style={{
                background: '#fff',
                border: '1px solid rgba(0,0,0,0.08)',
                borderRadius: '4px',
                overflow: 'hidden'
              }}>
                <img src={item.image} alt={item.title} style={{ width: '100%', aspectRatio: '4/5', objectFit: 'cover' }} />
                <div style={{ padding: '20px' }}>
                  <p style={{ fontSize: '9px', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--grey-4)', marginBottom: '8px' }}>
                    {item.title}
                  </p>
                  <p style={{ fontFamily: 'var(--serif)', fontSize: '16px', color: '#000' }}>
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeSection === 'tips' && (
        <section className="report-section">
          <p className="report-section-label">Consejos de Expertos</p>
          <h2 className="report-section-title">Tips <em>esenciales</em></h2>

          <div className="editorial-list" style={{ marginTop: '32px' }}>
            {[
              { num: '01', title: 'Invierte en Basics Cálidos', desc: 'Un buen camel coat y blazers en tonos tierra son la base de tu guardarropa.' },
              { num: '02', title: 'Joyería Dorada', desc: 'El oro complementa perfectamente tu paleta de otoño. Evita la plata.' },
              { num: '03', title: 'Capas con Textura', desc: 'Mezcla cashmere, cuero y telas naturales para crear profundidad.' },
              { num: '04', title: 'Accesorios Minimalistas', desc: 'Menos es más. Un bolso de calidad sobre muchos accesorios.' },
              { num: '05', title: 'Calzado de Cuero', desc: 'Botas, mocasines y flats en tonos café o camel son versátiles.' }
            ].map((tip, idx) => (
              <div key={idx} className="editorial-item">
                <span className="editorial-num">{tip.num}</span>
                <div>
                  <h4>{tip.title}</h4>
                  <p>{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <div style={{ height: '100px' }} />

      <div className="report-download">
        <div>
          <p className="report-dl-title">Informe {userName}</p>
          <p className="report-dl-sub">Generado el {new Date().toLocaleDateString('es-ES')}</p>
        </div>
        <div className="report-dl-actions">
          <button className="report-dl-btn" onClick={onShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir
          </button>
          <button className="report-dl-btn primary" onClick={onRestart}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12a9 9 0 109-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
            </svg>
            Nuevo Análisis
          </button>
        </div>
      </div>
    </div>
  );
}

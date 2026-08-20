import { useState, useEffect } from 'react';
import { AnalysisResponse } from '../services/api';
import { getPdfUrl } from '../services/api';

interface ReportProps {
  userName: string;
  analysisResult: AnalysisResponse | null;
  onShare: () => void;
  onRestart: () => void;
}

// Fallback palette for demo
const fallbackPalette = {
  protagonist: ['#C45A3B', '#C4A76C', '#6B7B3C', '#4A3728'],
  secondary: ['#8B6F47', '#D4A574', '#5C6B4A'],
  neutral: ['#3D2817', '#6B4423', '#8B7355'],
  accent: ['#E07B39', '#C68642', '#9B6B3C'],
  avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
};

export default function Report({
  userName,
  analysisResult,
  onShare,
  onRestart
}: ReportProps) {
  const [activeSection, setActiveSection] = useState('paleta');

  // Get analysis data from prop or localStorage
  const analysis = analysisResult || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('prysm_analysis') || 'null') : null);
  const seasonName = analysis?.analysis?.season?.name || 'Otoño';
  const prysmScore = analysis?.analysis?.prysmScore || 8.5;
  const bodyTypeName = analysis?.analysis?.bodyType?.name || 'Reloj de Arena';
  const palette = analysis?.analysis?.palette || fallbackPalette;
  const pdfUrl = analysisResult?.pdfUrl || localStorage.getItem('prysm_pdf_url') || '';

  // Combine palette colors for display
  const displayColors = [
    ...(palette.protagonist || []).map((hex, i) => ({ hex, tag: i === 0 ? 'Principal' : undefined })),
    ...(palette.secondary || []).map(hex => ({ hex, tag: 'Secundario' })),
    ...(palette.accent || []).map(hex => ({ hex, tag: 'Acento' }))
  ].slice(0, 8);

  // Color names based on hex (simple mapping)
  const getColorName = (hex: string): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    // Simple color naming based on HSL-like logic
    if (r > 180 && g > 100 && b < 100) return 'Terracota';
    if (r > 180 && g > 150 && b > 100) return 'Camel';
    if (g > r && g > b && g > 100) return 'Oliva';
    if (r < 100 && g < 80 && b < 60) return 'Café';
    if (r > 150 && g > 80 && b < 60) return 'Marrón';
    if (r > 200 && g > 150 && b < 100) return 'Naranja';
    if (b > 150 && r < 100) return 'Azul';
    if (r > 150 && b > 150) return 'Morado';
    if (r > 200 && g > 200 && b > 150) return 'Beige';
    return 'Tono';
  };

  const handleDownloadPdf = () => {
    // Demo mode: generate a simple PDF preview
    if (!pdfUrl) {
      // Create demo PDF HTML
      const demoHtml = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Informe PRYSM Demo - ${userName}</title>
          <style>
            body { font-family: Georgia, serif; padding: 40px; max-width: 800px; margin: 0 auto; }
            h1 { color: #2c2c2c; border-bottom: 2px solid #d4a473; padding-bottom: 10px; }
            .season { font-size: 24px; color: #8b6f47; margin: 20px 0; }
            .palette { display: flex; gap: 10px; margin: 20px 0; }
            .color-swatch { width: 60px; height: 60px; border-radius: 4px; }
            .tips { background: #f9f7f4; padding: 20px; margin: 20px 0; border-radius: 8px; }
            .footer { margin-top: 40px; font-size: 12px; color: #888; text-align: center; }
          </style>
        </head>
        <body>
          <h1>PRYSM</h1>
          <p>Informe Personal de Imagen para ${userName}</p>
          <div class="season">Tu Temporada: <strong>${seasonName}</strong></div>
          <p><strong>PRYSM Score:</strong> ${prysmScore}/10</p>
          <p><strong>Tipo de Cuerpo:</strong> ${bodyTypeName}</p>

          <h2>Tu Paleta de Colores</h2>
          <div class="palette">
            ${(palette.protagonist || []).map(c => `<div class="color-swatch" style="background:${c}"></div>`).join('')}
          </div>

          <div class="tips">
            <h3>Consejos Rápidos</h3>
            <p>• Usa colores cálidos de tierra como dominantes</p>
            <p>• Añade acentos en tonos contrastantes</p>
            <p>• Evita colores pastel que wash you out</p>
          </div>

          <div class="footer">
            <p>Este es un DEMO del informe completo.</p>
            <p>Para el informe premium de 7 páginas, visita prysm.mx</p>
            <p>Generado: ${new Date().toLocaleDateString('es-ES')}</p>
          </div>
        </body>
        </html>
      `;

      // Open demo PDF in new tab
      const blob = new Blob([demoHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank');
      return;
    }

    const fullUrl = getPdfUrl(pdfUrl);
    window.open(fullUrl, '_blank');
  };

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
            {seasonName.split(' ')[0]}<br /><em>{seasonName.split(' ').slice(1).join(' ')}</em>
          </h1>
          <div className="report-meta">
            <span>Temperatura: {analysis?.analysis?.season?.temperature || 'cálido'}</span>
            <span>Intensidad: {analysis?.analysis?.season?.depth || 'media'}</span>
          </div>
        </div>
        <div className="report-score">
          <div className="report-score-n">{Math.round(prysmScore * 10)}<span style={{ fontSize: '0.4em' }}>%</span></div>
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
            {displayColors.map((color, idx) => (
              <div
                key={idx}
                className="palette-swatch"
                style={{ backgroundColor: color.hex }}
              >
                <span className="palette-swatch-name">{getColorName(color.hex)}</span>
                <span className="palette-swatch-hex">{color.hex}</span>
                {color.tag && <span className="palette-swatch-tag">{color.tag}</span>}
              </div>
            ))}
          </div>

          <div style={{ marginTop: '40px', padding: '24px', background: '#fafaf8', borderRadius: '4px' }}>
            <p style={{ fontFamily: 'var(--serif)', fontSize: '18px', fontStyle: 'italic', lineHeight: 1.6 }}>
              "Los tonos {analysis?.analysis?.season?.temperature === 'warm' ? 'cálidos de tierra' : analysis?.analysis?.season?.temperature === 'cool' ? 'fríos' : 'neutros'} amplifican tu energía natural.
              Usa los colores principales como dominantes, los secundarios como complemento y evita los que no favorecen tu tono."
            </p>
          </div>

          {/* Avoid colors */}
          <div style={{ marginTop: '32px' }}>
            <p style={{ fontSize: '11px', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--grey-4)', marginBottom: '16px' }}>
              Colores a evitar
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {(palette.avoid || []).map((hex, idx) => (
                <div
                  key={idx}
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: hex,
                    borderRadius: '4px',
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {activeSection === 'siluetas' && (
        <section className="report-section">
          <p className="report-section-label">Tu Silueta Ideal</p>
          <h2 className="report-section-title">{bodyTypeName} - Líneas que <em>favorecen</em></h2>

          <div className="outfit-grid" style={{ marginTop: '32px' }}>
            {[
              { occasion: 'Trabajo', look: `Blazer estructurado con pantalón palazzo, accessorized con cinturón тонкая. Ideal para tu silueta ${bodyTypeName}.` },
              { occasion: 'Casual', look: `Camel coat sobre sweater de cashmere, jeans straight leg. Resalta tus proporciones.` },
              { occasion: 'Evening', look: `Vestido midi fluido, pendientes dorados minimalistas. Elegancia sin esfuerzo.` },
              { occasion: 'Weekend', look: `Sweater oversize, falda plisada, botas de cuero. Práctico y con estilo.` }
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
              { title: 'Esencial #1', desc: 'Camel coat + vestido + botas altas', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80' },
              { title: 'Esencial #2', desc: `Blazer + jeans + loafers`, image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
              { title: 'Esencial #3', desc: 'Cardigan + falda midi + ballet flats', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
              { title: 'Esencial #4', desc: `Sweater + pantalón wide leg`, image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&q=80' }
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
              { num: '01', title: 'Invierte en Basics', desc: `Piezas básicas en tonos de tu paleta son la base de tu guardarropa. Calidad sobre cantidad.` },
              { num: '02', title: 'Joyería según tu temperatura', desc: analysis?.analysis?.season?.temperature === 'warm' ? 'El oro complementa tu paleta cálida. Evita la plata.' : 'La plata complementa tu paleta fría. El oro puede verse arancionado.' },
              { num: '03', title: 'Capas con Textura', desc: 'Mezcla diferentes texturas para crear profundidad visual en tus outfits.' },
              { num: '04', title: 'Accesorios Minimalistas', desc: 'Menos es más. Un bolso de calidad sobre muchos accesorios.' },
              { num: '05', title: 'Calzado Versátil', desc: 'Invierte en zapatos neutros que combinen con múltiples piezas de tu guardarropa.' }
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
          <p className="report-dl-sub">Generado el {new Date().toLocaleDateString('es-ES')} · {seasonName}</p>
        </div>
        <div className="report-dl-actions">
          <button className="report-dl-btn" onClick={onShare}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
            </svg>
            Compartir
          </button>
          {(
            <button className="report-dl-btn primary" onClick={handleDownloadPdf}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
              </svg>
              {pdfUrl ? 'Descargar PDF' : 'Ver Demo PDF'}
            </button>
          )}
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

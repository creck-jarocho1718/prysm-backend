import { useState } from 'react';
import { TEST_MODE, testLog } from '../config';
import { generatePdfHtml } from '../services/pdfGenerator';

interface PaywallProps {
  onBack: () => void;
  onPaymentComplete: (pdfData: any) => void;
  profile?: any;
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

export default function Paywall({ onBack, onPaymentComplete, profile }: PaywallProps) {
  const [submitted, setSubmitted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  const handleSimulatePayment = async () => {
    testLog.payment('Starting simulated payment flow...');
    setIsProcessing(true);
    setProcessingStep('Generando perfil personalizado...');

    try {
      // Get stored analysis data
      const storedAnalysis = localStorage.getItem('prysm_analysis');
      const storedSkinAnalysis = localStorage.getItem('prysm_skin_analysis');

      if (!storedAnalysis) {
        alert('No se encontró datos de análisis. Por favor completa el quiz primero.');
        setIsProcessing(false);
        return;
      }

      const analysis = JSON.parse(storedAnalysis);
      const skinAnalysis = storedSkinAnalysis ? JSON.parse(storedSkinAnalysis) : null;

      testLog.payment('Analysis data retrieved');
      setProcessingStep('Construyendo PersonalStyleProfile...');

      // The profile should be passed from App, but we can also build it here
      // For now, use the analysis data to generate the profile
      const userProfile = profile || {
        userName: analysis.analysis?.userName || 'Usuario Test',
        userEmail: analysis.analysis?.userEmail || 'test@test.com',
        quizAnswers: analysis.answers || {},
        skinAnalysis: skinAnalysis
      };

      setProcessingStep('Ejecutando motores de recomendación...');

      // Generate PDF with the actual data
      setProcessingStep('Generando PDF personalizado...');

      const pdfData = await generatePdfHtml({
        profileId: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userName: userProfile.userName,
        userEmail: userProfile.userEmail,
        colorimetry: {
          season: {
            primary: analysis.analysis?.season?.id || 'deep_autumn',
            name: analysis.analysis?.season?.name || 'Otoño Profundo',
            subtitle: 'Deep Autumn · Warm · Rich',
            temperature: 'warm',
            depth: 'medium',
            contrast: 'medium',
            saturation: 'medium'
          },
          palette: analysis.analysis?.palette || {
            protagonist: ['#8B4513', '#D2691E', '#CD853F'],
            secondary: ['#556B2F', '#6B4423', '#704214'],
            accent: ['#DAA520', '#B8860B', '#D2691E'],
            neutral: ['#4A3728', '#5D4E37', '#3D2914'],
            avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
          },
          skinAnalysis: skinAnalysis || {
            undertone: 'warm',
            depth: 'medium',
            saturation: 'medium',
            contrast: 'medium',
            confidence: 0.8
          }
        },
        silhouette: {
          type: 'hourglass',
          name: analysis.analysis?.bodyType?.name || 'Reloj de Arena',
          bodyShape: 'Curvilínea',
          recommendations: {
            favor: ['Cintura definida', 'Tejidos que marcan curva', 'Piezas que realzan proporción'],
            avoid: ['Líneas rectas sin forma', 'Ropa oversize'],
            necklines: ['V', 'Redondeada', 'Sweetheart'],
            silhouettes: ['Ajustado en cintura', 'Evaseado en falda']
          }
        },
        lifestyle: {
          occasions: [
            { type: 'office', priority: 5 },
            { type: 'casual', priority: 4 },
            { type: 'date', priority: 3 },
            { type: 'travel', priority: 2 }
          ],
          budget: 'medium',
          wardrobeStatus: {
            existingPieces: ['Blusas', 'Jeans'],
            existingColors: ['Negro', 'Blanco'],
            gaps: ['Blazer', 'Vestido']
          }
        },
        style: {
          primary: 'classic',
          secondary: ['elegant', 'professional'],
          desiredFeeling: 'Segura',
          referenceLooks: []
        },
        preferences: {
          metal: 'gold',
          styleAdjectives: ['Clásico', 'Elegante']
        },
        goals: {
          primary: 'Verse bien',
          blockers: []
        },
        prysmScore: analysis.analysis?.prysmScore || analysis.analysis?.prysmScore || 8.5,
        analysisConfidence: 0.8
      });

      testLog.payment('PDF generated successfully');

      // Store only small payment flag in localStorage (NOT the PDF data which is too large)
      localStorage.setItem('prysm_payment_verified', 'true');

      setIsProcessing(false);
      setSubmitted(true);

      // Notify parent component with PDF data (kept in React state, not localStorage)
      onPaymentComplete(pdfData);

      testLog.payment('Payment simulation complete - transitioning to report');
    } catch (error) {
      testLog.info('Error in simulated payment:', error);
      setIsProcessing(false);
      alert('Error al generar el informe. Por favor intenta de nuevo.');
    }
  };

  // Test Mode Processing Screen
  if (isProcessing) {
    return (
      <div className="screen paywall-screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: '#fff' }}>
          {/* Test Mode Banner */}
          {TEST_MODE && (
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#10b981',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase'
            }}>
              🧪 TEST MODE - Generando informe...
            </div>
          )}

          <div style={{ fontSize: '48px', marginBottom: '24px' }}>
            ⚙️
          </div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(24px, 4vw, 32px)',
            marginBottom: '16px'
          }}>
            Procesando tu informe...
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px',
            fontSize: '14px'
          }}>
            {processingStep}
          </p>

          {/* Progress Steps */}
          <div style={{
            maxWidth: '400px',
            margin: '0 auto',
            textAlign: 'left'
          }}>
            {[
              'Confirmando pago simulado',
              'Construyendo PersonalStyleProfile',
              'Ejecutando motores de recomendación',
              'Generando contenido personalizado',
              'Creando PDF de 7 páginas'
            ].map((step, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  marginBottom: '12px',
                  opacity: 0.5
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '10px'
                }}>
                  {i + 1}
                </div>
                <span style={{ fontSize: '13px' }}>{step}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="screen paywall-screen">
        <div className="pay-inner" style={{ textAlign: 'center' }}>

          {/* Test Mode Banner */}
          {TEST_MODE && (
            <div style={{
              background: '#10b981',
              color: '#fff',
              padding: '8px 24px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'inline-block',
              marginBottom: '24px'
            }}>
              🧪 TEST MODE - Pago simulado exitoso
            </div>
          )}

          <div style={{ fontSize: '64px', marginBottom: '24px' }}>✨</div>
          <h2 style={{
            fontFamily: 'var(--serif)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            marginBottom: '16px'
          }}>
            ¡Bienvenido/a!
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.6)',
            marginBottom: '32px'
          }}>
            Tu informe personalizado está listo. Generado con tus datos reales.
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
            Ver Mi Informe Personalizado
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="screen paywall-screen">
      {/* Test Mode Banner */}
      {TEST_MODE && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#10b981',
          color: '#fff',
          padding: '8px 24px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '500',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          zIndex: 1000
        }}>
          🧪 TEST MODE - Entorno de Desarrollo
        </div>
      )}

      <nav className="nav" style={{ mixBlendMode: 'difference', color: '#fff', marginTop: TEST_MODE ? '40px' : 0 }}>
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
          <div className="pay-price">$299 <small>MXN</small></div>
          <div className="pay-price-note">IVA incluido · Sin suscripciones</div>
        </div>

        {/* Test Mode Button */}
        {TEST_MODE ? (
          <div style={{ marginBottom: '16px' }}>
            <a
              className="pay-cta"
              href="https://link.mercadopago.com.mx/prysm"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#3b82f6'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
              Pagar con MercadoPago (Real)
            </a>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              margin: '16px 0',
              color: 'rgba(255,255,255,0.3)'
            }}>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.1em' }}>o</span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.2)' }} />
            </div>

            <button
              onClick={handleSimulatePayment}
              style={{
                width: '100%',
                padding: '16px 24px',
                background: '#10b981',
                color: '#fff',
                border: '2px solid #10b981',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: '600',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                fontFamily: 'var(--sans)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
              🔧 SIMULAR PAGO EXITOSO
            </button>

            <p style={{
              textAlign: 'center',
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              marginTop: '8px'
            }}>
              Genera un PDF con tus datos reales del quiz
            </p>
          </div>
        ) : (
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
        )}

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

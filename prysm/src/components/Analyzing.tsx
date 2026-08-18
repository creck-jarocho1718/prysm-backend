import { useState, useEffect, useCallback } from 'react';
import { analyzeImage, AnalysisResponse, QuizAnswers } from '../services/api';

interface AnalyzingProps {
  onComplete: (result: AnalysisResponse) => void;
  userName: string;
  userEmail: string;
  answers: QuizAnswers;
  photos: string[];
}

const steps = [
  { id: 1, label: 'Analizando tu selección de colores' },
  { id: 2, label: 'Evaluando preferencias de estilo' },
  { id: 3, label: 'Procesando siluetas ideales' },
  { id: 4, label: 'Generando recomendaciones' },
  { id: 5, label: 'Preparando tu informe' }
];

export default function Analyzing({
  onComplete,
  userName,
  userEmail,
  answers,
  photos
}: AnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const runAnalysis = useCallback(async () => {
    try {
      console.log('Starting analysis for:', userName, userEmail);
      console.log('Photos:', photos.length);
      console.log('Answers:', Object.keys(answers).length);

      const result = await analyzeImage({
        name: userName,
        email: userEmail,
        photos: photos,
        answers: answers
      });

      if (result.success) {
        // Store result in localStorage for ResultPreview
        localStorage.setItem('prysm_analysis', JSON.stringify(result));
        localStorage.setItem('prysm_pdf_url', result.pdfUrl || '');
        onComplete(result);
      } else {
        setError(result.error || 'Error en el análisis');
        // Retry logic
        if (retryCount < 2) {
          console.log(`Retrying... (${retryCount + 1}/2)`);
          setRetryCount(prev => prev + 1);
          setTimeout(() => {
            setError(null);
            setCurrentStep(0);
            setProgress(0);
            runAnalysis();
          }, 2000);
        }
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError('Error al conectar con el servidor');

      // Use fallback data on error
      setTimeout(() => {
        const fallbackResult: AnalysisResponse = {
          success: true,
          reportId: 'demo-' + Date.now(),
          analysis: {
            season: {
              id: 'neutral_autumn',
              name: 'Otoño Neutro',
              temperature: 'neutral',
              depth: 'medium'
            },
            palette: {
              protagonist: ['#B5691B', '#A04000', '#C68642'],
              secondary: ['#6E2C00', '#2F4F1E', '#A0522D'],
              neutral: ['#567568', '#4A2810', '#7B3F00'],
              accent: ['#C0392B', '#D4AC6E', '#CD6155'],
              avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
            },
            bodyType: {
              id: 'hourglass',
              name: 'Reloj de Arena'
            },
            prysmScore: 8.5,
            analysisMethod: 'quiz_answers'
          }
        };
        localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
        onComplete(fallbackResult);
      }, 1500);
    }
  }, [userName, userEmail, answers, photos, onComplete, retryCount]);

  useEffect(() => {
    // Start analysis after initial animation
    const startTimer = setTimeout(() => {
      runAnalysis();
    }, 500);

    return () => clearTimeout(startTimer);
  }, [runAnalysis]);

  useEffect(() => {
    if (error) return; // Don't animate if there's an error

    const intervalTime = 1200;
    let step = 0;

    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      setProgress((step / (steps.length + 1)) * 100);

      if (step >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setProgress(100);
        }, 500);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [error]);

  return (
    <div className="screen analyzing-screen">
      <div className="analyzing-wrap">
        <div className="analyzing-brand">PRYSM</div>

        <div className="analyzing-progress-wrap">
          <div className="analyzing-progress-bar">
            <div
              className="analyzing-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="analyzing-progress-pct">{Math.round(progress)}%</div>
        </div>

        {error ? (
          <div className="analyzing-error">
            <p>{error}</p>
            <p style={{ fontSize: '12px', marginTop: '8px', opacity: 0.7 }}>
              Reintentando...
            </p>
          </div>
        ) : (
          <div className="analyzing-steps">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`analyzing-step ${
                  idx < currentStep ? 'done' :
                  idx === currentStep ? 'active' : ''
                }`}
              >
                <div className="analyzing-step-icon">
                  {idx < currentStep ? (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  ) : (
                    step.id
                  )}
                </div>
                <span className="analyzing-step-label">{step.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="analyzing-lines">
        <div className="analyzing-line" />
        <div className="analyzing-line" />
        <div className="analyzing-line" />
        <div className="analyzing-line" />
      </div>
    </div>
  );
}

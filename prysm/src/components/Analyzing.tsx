import { useState, useEffect } from 'react';
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

// Fallback result when backend is unavailable
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

export default function Analyzing({
  onComplete,
  userName,
  userEmail,
  answers,
  photos
}: AnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    let intervalStep = 0;
    const intervalTime = 800;

    const interval = setInterval(() => {
      intervalStep++;
      setCurrentStep(intervalStep);
      setProgress((intervalStep / (steps.length + 1)) * 100);

      if (intervalStep >= steps.length) {
        clearInterval(interval);
        setTimeout(() => {
          setProgress(100);
        }, 400);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress >= 100 && !isComplete) {
      setIsComplete(true);

      // Try backend first, use fallback on error
      analyzeImage({
        name: userName,
        email: userEmail,
        photos: photos,
        answers: answers
      })
      .then(result => {
        if (result.success) {
          localStorage.setItem('prysm_analysis', JSON.stringify(result));
          localStorage.setItem('prysm_pdf_url', result.pdfUrl || '');
          onComplete(result);
        } else {
          // Backend returned error, use fallback
          console.log('Backend analysis failed, using demo data');
          localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
          onComplete(fallbackResult);
        }
      })
      .catch(err => {
        // Backend unreachable, use fallback
        console.log('Backend unavailable, using demo data:', err.message);
        localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
        onComplete(fallbackResult);
      });
    }
  }, [progress, isComplete, userName, userEmail, photos, answers, onComplete]);

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

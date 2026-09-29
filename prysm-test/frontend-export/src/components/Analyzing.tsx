import { useState, useEffect } from 'react';
import { analyzeImage, AnalysisResponse, QuizAnswers } from '../services/api';
import { analyzePhotos, SkinAnalysisResult } from '../services/colorAnalysis';
import { testLog } from '../config';

interface AnalyzingProps {
  onComplete: (result: AnalysisResponse) => void;
  userName: string;
  userEmail: string;
  answers: QuizAnswers;
  photos: string[];
}

const steps = [
  { id: 1, label: 'Analizando tu tono de piel' },
  { id: 2, label: 'Evaluando tu selección de colores' },
  { id: 3, label: 'Mapeando tu temporada de color' },
  { id: 4, label: 'Generando recomendaciones' },
  { id: 5, label: 'Preparando tu informe personalizado' }
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
  const [isComplete, setIsComplete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

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

  // Handle retry
  const handleRetry = () => {
    setError(null);
    setProgress(0);
    setCurrentStep(0);
    setIsComplete(false);
    setRetryCount(prev => prev + 1);
  };

  useEffect(() => {
    // Reset when retryCount changes
    if (retryCount > 0) {
      setError(null);
      setIsComplete(false);
    }
  }, [retryCount]);

  useEffect(() => {
    if (progress >= 100 && !isComplete && !error) {
      setIsComplete(true);

      // Step 1: Analyze photos with Canvas API (if photos available)
      const performAnalysis = async () => {
        let skinAnalysis: SkinAnalysisResult | undefined;

        try {
          if (photos.length > 0) {
            console.log('[Analyzing] Starting photo analysis with', photos.length, 'photos...');
            const photoResults = await analyzePhotos(photos);
            skinAnalysis = photoResults.combined;
            console.log('[Analyzing] Photo analysis complete:', skinAnalysis);
          } else {
            console.log('[Analyzing] No photos provided - will use quiz answers only');
          }

          // Step 2: Call backend API (which calls OpenAI)
          console.log('[Analyzing] Calling backend API...');
          const result = await analyzeImage({
            name: userName,
            email: userEmail,
            photos: photos,
            answers: answers,
            skinAnalysis: skinAnalysis
          });

          if (result.success) {
            testLog.info('Backend analysis successful');
            console.log('[ANALYZING] Backend result success');
            localStorage.setItem('prysm_analysis', JSON.stringify(result));
            localStorage.setItem('prysm_pdf_url', result.pdfUrl || '');

            // Store skin analysis for display
            if (skinAnalysis) {
              localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
            }

            console.log('[ANALYZING] Calling onComplete with success result');
            onComplete(result);
          } else {
            // Backend/API returned error - NO MOCK DATA, show error
            testLog.error('Analysis failed:', result.error);
            console.log('[ANALYZING] Analysis failed:', result.error);
            setError(result.error || 'No pudimos completar tu análisis. Intenta nuevamente.');
          }
        } catch (err) {
          console.log('[ANALYZING] Analysis error:', err);
          testLog.error('Analysis exception:', err);
          // NO MOCK DATA - show error
          setError('No pudimos completar tu análisis. Intenta nuevamente.');
        }
      };

      performAnalysis();
    }
  }, [progress, isComplete, error, retryCount, photos, answers, userName, userEmail, onComplete]);

  // Show error screen if analysis failed
  if (error) {
    return (
      <div className="screen analyzing-screen">
        <div className="analyzing-wrap">
          <div className="analyzing-brand">PRYSM</div>

          <div className="analyzing-error">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <h2>No pudimos completar tu análisis</h2>
            <p>{error}</p>
            <button className="btn-primary" onClick={handleRetry}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10"/>
                <polyline points="1 20 1 14 7 14"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
              </svg>
              Intentar de nuevo
            </button>
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

import { useState, useEffect } from 'react';

interface AnalyzingProps {
  onComplete: () => void;
}

const steps = [
  { id: 1, label: 'Analizando tu selección de colores' },
  { id: 2, label: 'Evaluando preferencias de estilo' },
  { id: 3, label: 'Procesando siluetas ideales' },
  { id: 4, label: 'Generando recomendaciones' },
  { id: 5, label: 'Preparando tu informe' }
];

export default function Analyzing({ onComplete }: AnalyzingProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
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
          setTimeout(onComplete, 800);
        }, 1000);
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [onComplete]);

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

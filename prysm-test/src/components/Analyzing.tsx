import { useState, useEffect } from 'react';
import { analyzeImage, AnalysisResponse, QuizAnswers } from '../services/api';
import { analyzePhotos, SkinAnalysisResult } from '../services/colorAnalysis';
import { TEST_MODE, testLog } from '../config';

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

/**
 * Generate analysis completely client-side based on skin analysis
 * Used in TEST_MODE when backend is not available
 */
function generateClientSideAnalysis(
  userName: string,
  userEmail: string,
  skinAnalysis?: SkinAnalysisResult
): AnalysisResponse {
  testLog.info('Generating client-side analysis based on skin data');

  // Determine season based on skin analysis
  let season: { id: string; name: string; temperature: string; depth: string };
  let palette: { protagonist: string[]; secondary: string[]; neutral: string[]; accent: string[]; avoid: string[] };

  if (skinAnalysis) {
    const { undertone, depth, saturation } = skinAnalysis;

    // Determine season based on undertone and depth
    if (undertone === 'warm' && (depth === 'medium' || depth === 'deep')) {
      season = { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' };
      palette = {
        protagonist: ['#8B4513', '#D2691E', '#CD853F'],
        secondary: ['#556B2F', '#6B4423', '#704214'],
        accent: ['#DAA520', '#B8860B', '#D2691E'],
        neutral: ['#4A3728', '#5D4E37', '#3D2914'],
        avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
      };
    } else if (undertone === 'warm' && depth === 'light') {
      season = { id: 'soft_autumn', name: 'Otoño Suave', temperature: 'warm', depth: 'soft' };
      palette = {
        protagonist: ['#C4A77D', '#A0826D', '#B5956A'],
        secondary: ['#8B7355', '#967259', '#7D6B5A'],
        accent: ['#D4A574', '#C4956A', '#B8860B'],
        neutral: ['#6B5B4F', '#5D4E42', '#4A3F35'],
        avoid: ['#ADD8E6', '#87CEEB', '#B0E0E6']
      };
    } else if (undertone === 'cool' && (depth === 'medium' || depth === 'deep')) {
      season = { id: 'deep_winter', name: 'Invierno Profundo', temperature: 'cool', depth: 'deep' };
      palette = {
        protagonist: ['#1C1C1C', '#8B0000', '#000080'],
        secondary: ['#4A0080', '#2F4F4F', '#483D8B'],
        accent: ['#FFD700', '#C0C0C0', '#DC143C'],
        neutral: ['#2F2F2F', '#363636', '#1A1A1A'],
        avoid: ['#FFDAB9', '#FFE4B5', '#FAFAD2']
      };
    } else if (undertone === 'cool' && depth === 'light') {
      season = { id: 'soft_summer', name: 'Verano Suave', temperature: 'cool', depth: 'soft' };
      palette = {
        protagonist: ['#8E8E8E', '#708090', '#A9A9A9'],
        secondary: ['#B0C4DE', '#778899', '#6A5ACD'],
        accent: ['#DB7093', '#DA70D6', '#EE82EE'],
        neutral: ['#696969', '#808080', '#A9A9A9'],
        avoid: ['#FFD700', '#FFA500', '#FF4500']
      };
    } else if (undertone === 'neutral') {
      season = { id: 'neutral_spring', name: 'Primavera Neutra', temperature: 'neutral', depth: 'medium' };
      palette = {
        protagonist: ['#F0E68C', '#DAA520', '#D2691E'],
        secondary: ['#90EE90', '#3CB371', '#2E8B57'],
        accent: ['#FF6347', '#FFD700', '#FF8C00'],
        neutral: ['#F5DEB3', '#D2B48C', '#C4A77D'],
        avoid: ['#6A5ACD', '#483D8B', '#9370DB']
      };
    } else {
      // Default to deep autumn
      season = { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' };
      palette = {
        protagonist: ['#8B4513', '#D2691E', '#CD853F'],
        secondary: ['#556B2F', '#6B4423', '#704214'],
        accent: ['#DAA520', '#B8860B', '#D2691E'],
        neutral: ['#4A3728', '#5D4E37', '#3D2914'],
        avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
      };
    }
  } else {
    // No skin analysis, default to deep autumn
    season = { id: 'deep_autumn', name: 'Otoño Profundo', temperature: 'warm', depth: 'deep' };
    palette = {
      protagonist: ['#8B4513', '#D2691E', '#CD853F'],
      secondary: ['#556B2F', '#6B4423', '#704214'],
      accent: ['#DAA520', '#B8860B', '#D2691E'],
      neutral: ['#4A3728', '#5D4E37', '#3D2914'],
      avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
    };
  }

  testLog.info('Client-side analysis generated:', { season, palette });

  return {
    success: true,
    reportId: `test-${Date.now()}`,
    analysis: {
      season,
      palette,
      bodyType: {
        id: 'hourglass',
        name: 'Reloj de Arena'
      },
      prysmScore: skinAnalysis ? 8.5 + (skinAnalysis.confidence || 0) * 0.5 : 8.5,
      analysisMethod: 'photo_analysis'
    }
  };
}

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

      // Step 1: Analyze photos with Canvas API (if photos available)
      const performAnalysis = async () => {
        let skinAnalysis: SkinAnalysisResult | undefined;

        try {
          if (photos.length > 0) {
            console.log('[Analyzing] Starting photo analysis...');
            const photoResults = await analyzePhotos(photos);
            skinAnalysis = photoResults.combined;
            console.log('[Analyzing] Photo analysis complete:', skinAnalysis);
          }

          // Step 2: Send to backend with skin analysis data
          console.log('[Analyzing] Sending to backend...');
          const result = await analyzeImage({
            name: userName,
            email: userEmail,
            photos: photos,
            answers: answers,
            skinAnalysis: skinAnalysis
          });

          if (result.success) {
            testLog.info('Backend analysis successful');
            localStorage.setItem('prysm_analysis', JSON.stringify(result));
            localStorage.setItem('prysm_pdf_url', result.pdfUrl || '');

            // Store skin analysis for display
            if (skinAnalysis) {
              localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
            }

            onComplete(result);
          } else {
            // Backend returned error
            if (TEST_MODE) {
              testLog.info('Backend returned error in TEST_MODE - this is expected if backend is not deployed');
              // In TEST_MODE, generate analysis client-side
              const clientSideResult = generateClientSideAnalysis(userName, userEmail, skinAnalysis);
              localStorage.setItem('prysm_analysis', JSON.stringify(clientSideResult));
              if (skinAnalysis) {
                localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
              }
              onComplete(clientSideResult);
            } else {
              console.log('Backend analysis failed, using demo data');
              localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
              onComplete(fallbackResult);
            }
          }
        } catch (err) {
          console.log('Analysis error:', err);
          if (TEST_MODE) {
            testLog.info('Backend connection failed in TEST_MODE - generating client-side analysis');
            // In TEST_MODE, generate analysis client-side instead of using demo data
            const clientSideResult = generateClientSideAnalysis(userName, userEmail, skinAnalysis);
            localStorage.setItem('prysm_analysis', JSON.stringify(clientSideResult));
            if (skinAnalysis) {
              localStorage.setItem('prysm_skin_analysis', JSON.stringify(skinAnalysis));
            }
            onComplete(clientSideResult);
          } else {
            console.log('Using demo data due to error');
            localStorage.setItem('prysm_analysis', JSON.stringify(fallbackResult));
            onComplete(fallbackResult);
          }
        }
      };

      performAnalysis();
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

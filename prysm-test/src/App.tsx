import { useState, useCallback, useEffect } from 'react';
import Landing from './components/Landing';
import Quiz from './components/Quiz';
import Analyzing from './components/Analyzing';
import ResultPreview from './components/ResultPreview';
import Report from './components/Report';
import Paywall from './components/Paywall';
import Share from './components/Share';
import { AnalysisResponse, QuizAnswers } from './services/api';
import { TEST_MODE, testLog } from './config';
import { generatePdfHtml } from './services/pdfGenerator';
import { PersonalStyleProfile } from './services/styleGenome';

export type Screen = 'landing' | 'quiz' | 'analyzing' | 'result' | 'report' | 'paywall' | 'share' | 'processing';

export interface QuizAnswer {
  questionId: string;
  value: string | string[];
}

export interface UserData {
  name: string;
  email: string;
  photos: string[];
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [testPdfData, setTestPdfData] = useState<any>(null);

  // Convert QuizAnswer[] to QuizAnswers format for API
  const getQuizAnswers = useCallback((): QuizAnswers => {
    const result: QuizAnswers = {};
    answers.forEach(a => {
      result[a.questionId] = a.value;
    });
    return result;
  }, [answers]);

  const handleStartQuiz = useCallback(() => {
    setCurrentScreen('quiz');
    setCurrentQuestionIndex(0);
  }, []);

  const handleAnswer = useCallback((questionId: string, value: string | string[]) => {
    setAnswers(prev => {
      const existing = prev.findIndex(a => a.questionId === questionId);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = { questionId, value };
        return updated;
      }
      return [...prev, { questionId, value }];
    });
  }, []);

  const handleNextQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => prev + 1);
  }, []);

  const handlePrevQuestion = useCallback(() => {
    setCurrentQuestionIndex(prev => Math.max(0, prev - 1));
  }, []);

  const handlePhotoUpload = useCallback((photos: string[]) => {
    setUploadedPhotos(photos);
  }, []);

  const handleNameSubmit = useCallback((name: string, email: string) => {
    setUserName(name);
    setUserEmail(email);
    setCurrentQuestionIndex(prev => prev + 1);
  }, []);

  const handleStartAnalysis = useCallback(() => {
    setCurrentScreen('analyzing');
  }, []);

  const handleAnalysisComplete = useCallback((result: AnalysisResponse) => {
    setAnalysisResult(result);
    setCurrentScreen('result');
  }, []);

  const handleViewReport = useCallback(() => {
    // In TEST_MODE: Execute full PDF generation flow
    if (TEST_MODE) {
      setCurrentScreen('processing');
      return;
    }

    // In normal mode, always go to paywall first
    setCurrentScreen('paywall');
  }, []);

  const handlePaywall = useCallback(() => {
    setCurrentScreen('paywall');
  }, []);

  const handleShare = useCallback(() => {
    setCurrentScreen('share');
  }, []);

  const handleRestart = useCallback(() => {
    setCurrentScreen('landing');
    setAnswers([]);
    setUserName('');
    setUserEmail('');
    setCurrentQuestionIndex(0);
    setUploadedPhotos([]);
    setAnalysisResult(null);
    setTestPdfData(null);
    localStorage.removeItem('prysm_analysis');
    localStorage.removeItem('prysm_pdf_url');
    localStorage.removeItem('prysm_payment_verified');
    localStorage.removeItem('prysm_test_pdf_data');
    localStorage.removeItem('prysm_skin_analysis');
  }, []);

  // Handle payment completion from Paywall
  const handlePaymentComplete = useCallback((pdfData: any) => {
    testLog.info('Payment complete, storing PDF data...');
    setTestPdfData(pdfData);
    // After payment is simulated, go back to result and then to report
    setCurrentScreen('result');
    // Small delay before transitioning to report
    setTimeout(() => {
      setCurrentScreen('report');
    }, 100);
  }, []);

  // Generate PDF in TEST_MODE
  const generateTestPdf = useCallback(async () => {
    testLog.info('TEST MODE: Starting PDF generation...');

    try {
      // Get stored analysis data
      const storedAnalysis = localStorage.getItem('prysm_analysis');
      const storedSkinAnalysis = localStorage.getItem('prysm_skin_analysis');

      if (!storedAnalysis) {
        throw new Error('No se encontró datos de análisis. Por favor completa el quiz primero.');
      }

      const analysis = JSON.parse(storedAnalysis);
      const skinAnalysis = storedSkinAnalysis ? JSON.parse(storedSkinAnalysis) : null;

      testLog.profile('Analysis data retrieved from localStorage');

      // Build PersonalStyleProfile from analysis data
      const profile: PersonalStyleProfile = {
        profileId: `test-${Date.now()}`,
        createdAt: new Date().toISOString(),
        userName: analysis.analysis?.userName || userName || 'Usuario Test',
        userEmail: analysis.analysis?.userEmail || userEmail || 'test@test.com',
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
        prysmScore: analysis.analysis?.prysmScore || 8.5,
        analysisConfidence: 0.8
      };

      testLog.profile('PersonalStyleProfile built successfully');

      // Generate PDF
      const pdfData = await generatePdfHtml(profile);

      testLog.pdf({ action: 'PDF generated successfully', pageCount: pdfData.pageCount });

      // Store payment verified flag
      localStorage.setItem('prysm_payment_verified', 'true');
      localStorage.setItem('prysm_test_pdf_data', JSON.stringify(pdfData));

      // Store PDF data in state
      setTestPdfData(pdfData);

      // Transition to report
      setCurrentScreen('report');

    } catch (error) {
      testLog.info('Error generating PDF:', error);
      alert('Error al generar el informe. Por favor intenta de nuevo.');
      setCurrentScreen('result');
    }
  }, [userName, userEmail]);

  // Execute PDF generation when entering processing screen (TEST_MODE only)
  useEffect(() => {
    if (currentScreen === 'processing' && TEST_MODE) {
      generateTestPdf();
    }
  }, [currentScreen, TEST_MODE, generateTestPdf]);

  useEffect(() => {
    if (currentScreen === 'landing') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [currentScreen]);

  // Log TEST_MODE status
  useEffect(() => {
    if (TEST_MODE) {
      testLog.info('TEST MODE is ACTIVE');
      console.log('[TEST MODE] Running in test environment');
    }
  }, []);

  return (
    <div id="app">
      {/* Test Mode Banner */}
      {TEST_MODE && currentScreen !== 'landing' && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: '#10b981',
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '500',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
          🧪 TEST MODE
        </div>
      )}

      {currentScreen === 'landing' && (
        <Landing onStart={handleStartQuiz} />
      )}
      {currentScreen === 'quiz' && (
        <Quiz
          questionIndex={currentQuestionIndex}
          answers={answers}
          userName={userName}
          uploadedPhoto={uploadedPhotos}
          onAnswer={handleAnswer}
          onNext={handleNextQuestion}
          onPrev={handlePrevQuestion}
          onPhotoUpload={handlePhotoUpload}
          onNameSubmit={handleNameSubmit}
          onStartAnalysis={handleStartAnalysis}
        />
      )}
      {currentScreen === 'analyzing' && (
        <Analyzing
          onComplete={handleAnalysisComplete}
          userName={userName}
          userEmail={userEmail}
          answers={getQuizAnswers()}
          photos={uploadedPhotos}
        />
      )}
      {currentScreen === 'result' && (
        <ResultPreview
          userName={userName}
          analysisResult={analysisResult}
          onViewReport={handleViewReport}
          onPaywall={handlePaywall}
        />
      )}
      {currentScreen === 'report' && (
        <Report
          userName={userName}
          analysisResult={analysisResult}
          onShare={handleShare}
          onRestart={handleRestart}
          testPdfData={testPdfData}
        />
      )}
      {currentScreen === 'paywall' && (
        <Paywall
          onBack={() => setCurrentScreen('result')}
          onPaymentComplete={handlePaymentComplete}
          profile={{
            userName,
            userEmail,
            quizAnswers: getQuizAnswers(),
            skinAnalysis: analysisResult
          }}
        />
      )}
      {currentScreen === 'share' && (
        <Share onBack={() => setCurrentScreen('report')} />
      )}
      {currentScreen === 'processing' && (
        <div className="screen" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
          minHeight: '100vh'
        }}>
          <div style={{ textAlign: 'center', color: '#fff', maxWidth: '500px', padding: '20px' }}>
            {/* Test Mode Badge */}
            <div style={{
              display: 'inline-block',
              background: '#10b981',
              color: '#fff',
              padding: '8px 20px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '500',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              marginBottom: '32px'
            }}>
              🧪 MODO PRUEBA — PAGO SIMULADO
            </div>

            <div style={{ fontSize: '64px', marginBottom: '24px' }}>
              ⚙️
            </div>
            <h2 style={{
              fontFamily: 'var(--serif)',
              fontSize: 'clamp(24px, 4vw, 32px)',
              marginBottom: '16px'
            }}>
              Generando tu informe personalizado...
            </h2>
            <p style={{
              color: 'rgba(255,255,255,0.6)',
              marginBottom: '40px',
              fontSize: '14px'
            }}>
              Ejecutando motores de recomendación con tus datos reales
            </p>

            {/* Progress Steps */}
            <div style={{
              textAlign: 'left',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '12px',
              padding: '24px'
            }}>
              {[
                { step: 1, text: 'Confirmando pago simulado', status: 'done' },
                { step: 2, text: 'Construyendo PersonalStyleProfile', status: 'done' },
                { step: 3, text: 'Ejecutando motores de recomendación', status: 'active' },
                { step: 4, text: 'Generando contenido personalizado', status: 'pending' },
                { step: 5, text: 'Creando PDF de 7 páginas', status: 'pending' }
              ].map((item) => (
                <div
                  key={item.step}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '16px',
                    opacity: item.status === 'pending' ? 0.4 : 1
                  }}
                >
                  <div style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    background: item.status === 'done' ? '#10b981' : item.status === 'active' ? '#3b82f6' : 'rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {item.status === 'done' ? '✓' : item.step}
                  </div>
                  <span style={{ fontSize: '14px' }}>{item.text}</span>
                </div>
              ))}
            </div>

            <p style={{
              color: 'rgba(255,255,255,0.3)',
              marginTop: '24px',
              fontSize: '12px'
            }}>
              No cierres esta ventana...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

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

export type Screen = 'landing' | 'quiz' | 'analyzing' | 'result' | 'report' | 'paywall' | 'share';

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
    // In TEST_MODE, check if payment was simulated
    if (TEST_MODE) {
      const paymentVerified = localStorage.getItem('prysm_payment_verified');
      const testPdf = localStorage.getItem('prysm_test_pdf_data');

      if (paymentVerified === 'true' && testPdf) {
        testLog.info('TEST MODE: Direct access to report allowed');
        setCurrentScreen('report');
        return;
      }
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
    </div>
  );
}

export default App;

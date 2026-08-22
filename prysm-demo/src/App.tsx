import { useState, useCallback, useEffect } from 'react';
import Landing from './components/Landing';
import Quiz from './components/Quiz';
import Analyzing from './components/Analyzing';
import ResultPreview from './components/ResultPreview';
import Report from './components/Report';
import Paywall from './components/Paywall';
import Share from './components/Share';
import { AnalysisResponse, QuizAnswers } from './services/api';

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

// Demo analysis data
const demoAnalysis: AnalysisResponse = {
  success: true,
  analysis: {
    season: {
      id: 'autumn-deep',
      name: 'Otoño Profundo',
      temperature: 'warm',
      depth: 'deep'
    },
    prysmScore: 8.7,
    bodyType: {
      id: 'hourglass',
      name: 'Reloj de Arena'
    },
    palette: {
      protagonist: ['#C45A3B', '#8B4513', '#A0522D'],
      secondary: ['#D4A574', '#6B4423'],
      accent: ['#E07B39', '#C68642'],
      neutral: ['#4A2810', '#7B3F00'],
      avoid: ['#ADD8E6', '#87CEEB']
    },
    analysisMethod: 'quiz_answers'
  }
};

function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);

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
    setCurrentScreen('report');
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
    localStorage.removeItem('prysm_analysis');
    localStorage.removeItem('prysm_pdf_url');
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

  // Handle demo mode from landing page
  useEffect(() => {
    const handleDemoMode = () => {
      // Store demo analysis in localStorage
      localStorage.setItem('prysm_analysis', JSON.stringify(demoAnalysis));
      // Set user name for demo
      setUserName('Valentina Demo');
      // Go directly to result preview with demo data
      setAnalysisResult(demoAnalysis);
      setCurrentScreen('result');
    };

    window.addEventListener('prysm_demo_mode', handleDemoMode);

    // Check if coming from demo mode URL
    const params = new URLSearchParams(window.location.search);
    if (params.get('demo') === 'true') {
      handleDemoMode();
      // Clean URL
      window.history.replaceState({}, '', '/');
    }

    return () => {
      window.removeEventListener('prysm_demo_mode', handleDemoMode);
    };
  }, []);

  return (
    <div id="app">
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
        />
      )}
      {currentScreen === 'paywall' && (
        <Paywall onBack={() => setCurrentScreen('result')} />
      )}
      {currentScreen === 'share' && (
        <Share onBack={() => setCurrentScreen('report')} />
      )}
    </div>
  );
}

export default App;

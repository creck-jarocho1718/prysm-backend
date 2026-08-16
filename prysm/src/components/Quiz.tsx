import { useState, useEffect } from 'react';
import { QuizAnswer } from '../App';

interface QuizProps {
  questionIndex: number;
  answers: QuizAnswer[];
  userName: string;
  uploadedPhoto: string | null;
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  onPhotoUpload: (photoData: string) => void;
  onNameSubmit: (name: string) => void;
  onStartAnalysis: () => void;
}

interface Question {
  id: string;
  type: 'name' | 'image-grid' | 'color-grid' | 'chip' | 'choice' | 'photo';
  title: string;
  subtitle?: string;
  eyebrow?: string;
  badge?: string;
  options?: { id: string; label: string; image?: string }[];
  colors?: { id: string; hex: string; name: string }[];
  chips?: { id: string; label: string }[];
  choices?: { id: string; label: string }[];
}

const questions: Question[] = [
  {
    id: 'name',
    type: 'name',
    title: '¿Cuál es tu nombre?',
    subtitle: 'Lo usaremos para personalizar tu informe de estilo'
  },
  {
    id: 'occasion',
    type: 'image-grid',
    eyebrow: 'Pregunta 1 de 7',
    title: '¿Para qué ocasión vistes?',
    badge: 'Adapta tu estilo',
    options: [
      { id: 'work', label: 'Trabajo', image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80' },
      { id: 'casual', label: 'Casual', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80' },
      { id: 'elegant', label: 'Elegante', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80' },
      { id: 'sporty', label: 'Deportivo', image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=600&q=80' }
    ]
  },
  {
    id: 'colors',
    type: 'color-grid',
    eyebrow: 'Pregunta 2 de 7',
    title: '¿Qué colores prefieres?',
    subtitle: 'Selecciona los que más te gusten',
    options: [
      { id: 'neutros', label: 'Neutros' },
      { id: 'vibrantes', label: 'Vibrantes' },
      { id: 'pastel', label: 'Pastel' },
      { id: 'oscuros', label: 'Oscuros' }
    ],
    colors: [
      { id: 'black', hex: '#000000', name: 'Negro' },
      { id: 'white', hex: '#FFFFFF', name: 'Blanco' },
      { id: 'beige', hex: '#D4B896', name: 'Beige' },
      { id: 'grey', hex: '#808080', name: 'Gris' },
      { id: 'navy', hex: '#1B3A5F', name: 'Azul Marino' },
      { id: 'burgundy', hex: '#722F37', name: 'Burdeos' },
      { id: 'emerald', hex: '#50C878', name: 'Esmeralda' },
      { id: 'coral', hex: '#FF7F50', name: 'Coral' },
      { id: 'mustard', hex: '#FFDB58', name: 'Mostaza' },
      { id: 'lavender', hex: '#E6E6FA', name: 'Lavanda' }
    ]
  },
  {
    id: 'style',
    type: 'chip',
    eyebrow: 'Pregunta 3 de 7',
    title: '¿Cómo describirías tu estilo?',
    subtitle: 'Selecciona todos los que apliquen',
    chips: [
      { id: 'minimalist', label: 'Minimalista' },
      { id: 'bohemian', label: 'Boho' },
      { id: 'classic', label: 'Clásico' },
      { id: 'edgy', label: 'Edgy' },
      { id: 'romantic', label: 'Romántico' },
      { id: 'sporty', label: 'Deportivo' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'streetwear', label: 'Streetwear' }
    ]
  },
  {
    id: 'silhouette',
    type: 'choice',
    eyebrow: 'Pregunta 4 de 7',
    title: '¿Qué silueta prefieres?',
    choices: [
      { id: 'fitted', label: 'Ajustado - Destaco mi figura' },
      { id: 'relaxed', label: 'Relajado - Comodidad primero' },
      { id: 'structured', label: 'Estructurado - Líneas definidas' },
      { id: 'flowy', label: 'Fluido - Movimiento y gracia' }
    ]
  },
  {
    id: 'fabrics',
    type: 'chip',
    eyebrow: 'Pregunta 5 de 7',
    title: '¿Qué tejidos te gustan?',
    subtitle: 'Selecciona todos los que prefieras',
    chips: [
      { id: 'cotton', label: 'Algodón' },
      { id: 'silk', label: 'Seda' },
      { id: 'wool', label: 'Lana' },
      { id: 'linen', label: 'Lino' },
      { id: 'denim', label: 'Denim' },
      { id: 'leather', label: 'Cuero' },
      { id: 'cashmere', label: 'Cashmere' },
      { id: 'velvet', label: 'Terciopelo' }
    ]
  },
  {
    id: 'inspiration',
    type: 'image-grid',
    eyebrow: 'Pregunta 6 de 7',
    title: '¿Qué te inspira?',
    badge: 'Tus referencias',
    options: [
      { id: 'nature', label: 'Naturaleza', image: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80' },
      { id: 'city', label: 'Ciudad', image: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=600&q=80' },
      { id: 'art', label: 'Arte', image: 'https://images.unsplash.com/photo-1547891654-e66ed7ebb968?w=600&q=80' },
      { id: 'travel', label: 'Viajes', image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80' },
      { id: 'music', label: 'Música', image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&q=80' },
      { id: 'architecture', label: 'Arquitectura', image: 'https://images.unsplash.com/photo-1486718448742-163732cd1544?w=600&q=80' }
    ]
  },
  {
    id: 'photo',
    type: 'photo',
    eyebrow: 'Pregunta 7 de 7',
    title: 'Sube tu foto',
    subtitle: 'Ayúdanos a entender mejor tu estilo actual'
  }
];

export default function Quiz({
  questionIndex,
  answers,
  userName,
  uploadedPhoto,
  onAnswer,
  onNext,
  onPhotoUpload,
  onNameSubmit,
  onStartAnalysis
}: QuizProps) {
  const [nameInput, setNameInput] = useState('');
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const currentQuestion = questions[questionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isLastQuestion = questionIndex === questions.length - 1;
  const isNameQuestion = currentQuestion?.type === 'name';
  const hasAnswer = currentAnswer !== undefined;

  const handleImageSelect = (optionId: string) => {
    onAnswer(currentQuestion.id, optionId);
  };

  const handleColorSelect = (colorId: string) => {
    const current = (currentAnswer?.value as string[]) || [];
    if (current.includes(colorId)) {
      onAnswer(currentQuestion.id, current.filter(c => c !== colorId));
    } else {
      onAnswer(currentQuestion.id, [...current, colorId]);
    }
  };

  const handleChipSelect = (chipId: string) => {
    const current = (currentAnswer?.value as string[]) || [];
    if (current.includes(chipId)) {
      onAnswer(currentQuestion.id, current.filter(c => c !== chipId));
    } else {
      onAnswer(currentQuestion.id, [...current, chipId]);
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    onAnswer(currentQuestion.id, choiceId);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onPhotoUpload(reader.result as string);
        onAnswer('photo', 'uploaded');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSubmit = () => {
    if (nameInput.trim()) {
      onNameSubmit(nameInput.trim());
    }
  };

  const handleContinue = () => {
    if (isLastQuestion) {
      onStartAnalysis();
    } else {
      onNext();
    }
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'name':
        return (
          <div className="card-inner">
            <div className="card-question">
              <p className="card-eyebrow">Antes de empezar</p>
              <h2 className="card-title">¿Cómo te llamas?</h2>
              <p className="card-subtitle">Lo usaremos para personalizar tu informe</p>
            </div>
            <div className="text-input-wrap">
              <input
                type="text"
                className="text-input"
                placeholder="Tu nombre"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleNameSubmit()}
              />
            </div>
          </div>
        );

      case 'image-grid':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              {currentQuestion.badge && <span className="adaptive-card-badge">{currentQuestion.badge}</span>}
              <h2 className="card-title">{currentQuestion.title}</h2>
            </div>
            <div className="image-grid">
              {currentQuestion.options?.map((option) => (
                <div
                  key={option.id}
                  className={`image-choice ${currentAnswer?.value === option.id ? 'selected' : ''}`}
                  onClick={() => handleImageSelect(option.id)}
                >
                  <img src={option.image} alt={option.label} />
                  <div className="image-choice-label">
                    <span>{option.label}</span>
                  </div>
                  <div className="image-choice-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'color-grid':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div className="color-swatch-grid">
              {currentQuestion.colors?.map((color) => (
                <div
                  key={color.id}
                  className={`color-swatch-item ${(currentAnswer?.value as string[])?.includes(color.id) ? 'selected' : ''}`}
                  onClick={() => handleColorSelect(color.id)}
                >
                  <div
                    className="color-swatch-circle"
                    style={{ backgroundColor: color.hex }}
                  />
                  <span className="color-swatch-label">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'chip':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div className="chip-grid">
              {currentQuestion.chips?.map((chip) => (
                <button
                  key={chip.id}
                  className={`chip ${(currentAnswer?.value as string[])?.includes(chip.id) ? 'selected' : ''}`}
                  onClick={() => handleChipSelect(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        );

      case 'choice':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
            </div>
            <div className="choice-list">
              {currentQuestion.choices?.map((choice, idx) => (
                <button
                  key={choice.id}
                  className={`choice-item ${currentAnswer?.value === choice.id ? 'selected' : ''}`}
                  onClick={() => handleChoiceSelect(choice.id)}
                >
                  <span className="choice-key">{String.fromCharCode(65 + idx)}</span>
                  <span className="choice-text">{choice.label}</span>
                  <div className="choice-check">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 'photo':
        return (
          <div className="photo-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <label className="photo-drop">
              <input type="file" accept="image/*" onChange={handlePhotoChange} />
              <div className="photo-drop-icon">↑</div>
              <div className="photo-drop-title">Arrastra tu foto aquí</div>
              <div className="photo-drop-sub">o haz clic para seleccionar</div>
            </label>
            {uploadedPhoto && (
              <div className="photo-preview active">
                <img src={uploadedPhoto} alt="Uploaded" />
                <div className="photo-validated">Validada</div>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="screen card-screen" style={{
      opacity: animated ? 1 : 0,
      transform: animated ? 'translateY(0)' : 'translateY(24px)',
      transition: 'all 0.6s cubic-bezier(0.16,1,0.3,1)'
    }}>
      <nav className="nav dark">
        <div className="nav-logo" onClick={() => window.location.reload()}>PRYSM</div>
      </nav>

      <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto' }}>
        {renderQuestion()}
      </div>

      <div className="continue-row" style={{ padding: '0 48px 60px', width: '100%' }}>
        {!isNameQuestion && (
          <button
            className={`continue-btn ${hasAnswer ? 'ready' : ''}`}
            onClick={handleContinue}
            disabled={isNameQuestion ? false : !hasAnswer}
            style={{
              opacity: isNameQuestion ? (nameInput.trim() ? 1 : 0.5) : (hasAnswer ? 1 : 0.5),
              cursor: isNameQuestion ? 'pointer' : (hasAnswer ? 'pointer' : 'not-allowed')
            }}
          >
            {isLastQuestion ? 'Ver Resultados' : 'Continuar'}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        )}
      </div>

      <div className="stage-label">
        {questionIndex + 1} de {questions.length}
      </div>
    </div>
  );
}

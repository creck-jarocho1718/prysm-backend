import { useState, useEffect, useRef } from 'react';
import { QuizAnswer } from '../App';

interface QuizProps {
  questionIndex: number;
  answers: QuizAnswer[];
  userName: string;
  uploadedPhoto: string[];
  onAnswer: (questionId: string, value: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  onPhotoUpload: (photos: string[]) => void;
  onNameSubmit: (name: string, email: string) => void;
  onStartAnalysis: () => void;
}

interface Question {
  id: string;
  type: 'feeling' | 'skin-tone' | 'silhouette' | 'budget' | 'colors-closet' | 'closet' | 'metal' | 'style' | 'occasions' | 'archetype' | 'photos' | 'name-email';
  title: string;
  subtitle?: string;
  eyebrow?: string;
  options?: { id: string; label: string; image?: string }[];
  chips?: { id: string; label: string }[];
  choices?: { id: string; label: string; image?: string }[];
  colors?: { id: string; hex: string; name: string }[];
}

const questions: Question[] = [
  {
    id: 'feeling',
    type: 'feeling',
    eyebrow: 'Pregunta 1 de 12',
    title: '¿Cómo te gustaría sentirte?',
    subtitle: 'Selecciona la que más resuene contigo',
    chips: [
      { id: 'sofisticada', label: 'Sofisticada' },
      { id: 'segura', label: 'Segura' },
      { id: 'imponente', label: 'Imponente' },
      { id: 'vibrante', label: 'Vibrante' },
      { id: 'serena', label: 'Serena' },
      { id: 'poderosa', label: 'Poderosa' },
      { id: 'natural', label: 'Natural' },
      { id: 'glamurosa', label: 'Glamurosa' }
    ]
  },
  {
    id: 'skin-tone',
    type: 'skin-tone',
    eyebrow: 'Pregunta 2 de 12',
    title: '¿Cuál es tu tono de piel?',
    subtitle: 'Selecciona la opción que más se parezca a tu piel',
    options: [
      { id: 'muy-clara', label: 'Muy Clara', image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&q=80' },
      { id: 'clara', label: 'Clara', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
      { id: 'media', label: 'Media', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80' },
      { id: 'morena-clara', label: 'Morena Clara', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
      { id: 'morena', label: 'Morena', image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&q=80' },
      { id: 'morena-oscura', label: 'Morena Oscura', image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80' }
    ]
  },
  {
    id: 'silhouette',
    type: 'silhouette',
    eyebrow: 'Pregunta 3 de 12',
    title: '¿Cuál es tu tipo de silueta?',
    subtitle: 'Selecciona la que mejor describa tu figura',
    options: [
      { id: 'reloj-arena', label: 'Reloj de Arena', image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=80' },
      { id: 'triangulo', label: 'Triángulo', image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&q=80' },
      { id: 'triangulo-inv', label: 'Triángulo Invertido', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
      { id: 'rectangulo', label: 'Rectángulo', image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80' },
      { id: 'ovalada', label: 'Ovalada', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
      { id: 'diamante', label: 'Diamante', image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&q=80' }
    ]
  },
  {
    id: 'budget',
    type: 'budget',
    eyebrow: 'Pregunta 4 de 12',
    title: '¿Cuál es tu presupuesto mensual en ropa?',
    subtitle: 'Para recomendarte opciones acorde a tu inversión',
    choices: [
      { id: 'menos-1000', label: 'Menos de $1,000 MXN' },
      { id: '1000-3000', label: '$1,000 - $3,000 MXN' },
      { id: '3000-5000', label: '$3,000 - $5,000 MXN' },
      { id: '5000-10000', label: '$5,000 - $10,000 MXN' },
      { id: 'mas-10000', label: 'Más de $10,000 MXN' }
    ]
  },
  {
    id: 'colors-closet',
    type: 'colors-closet',
    eyebrow: 'Pregunta 5 de 12',
    title: '¿Qué colores tienes en tu clóset?',
    subtitle: 'Selecciona todos los que ya tengas',
    colors: [
      { id: 'negro', hex: '#000000', name: 'Negro' },
      { id: 'blanco', hex: '#FFFFFF', name: 'Blanco' },
      { id: 'gris', hex: '#808080', name: 'Gris' },
      { id: 'azul', hex: '#1B3A5F', name: 'Azul' },
      { id: 'cafe', hex: '#6F4E37', name: 'Café' },
      { id: 'beige', hex: '#D4B896', name: 'Beige' },
      { id: 'rojo', hex: '#C41E3A', name: 'Rojo' },
      { id: 'verde', hex: '#228B22', name: 'Verde' },
      { id: 'morado', hex: '#663399', name: 'Morado' },
      { id: 'rosa', hex: '#FF69B4', name: 'Rosa' },
      { id: 'amarillo', hex: '#FFD700', name: 'Amarillo' },
      { id: 'naranja', hex: '#FF8C00', name: 'Naranja' }
    ]
  },
  {
    id: 'closet',
    type: 'closet',
    eyebrow: 'Pregunta 6 de 12',
    title: '¿Qué hay en tu clóset actualmente?',
    subtitle: 'Selecciona todo lo que tengas',
    chips: [
      { id: 'jeans', label: 'Jeans' },
      { id: 'blusas', label: 'Blusas' },
      { id: 'vestidos', label: 'Vestidos' },
      { id: 'faldas', label: 'Faldas' },
      { id: 'shorts', label: 'Shorts' },
      { id: 'blazers', label: 'Blazers' },
      { id: 'sweaters', label: 'Sweaters' },
      { id: 'zapatos', label: 'Zapatos' },
      { id: 'bolsas', label: 'Bolsas' },
      { id: 'accesorios', label: 'Accesorios' },
      { id: 'sudaderas', label: 'Sudaderas' },
      { id: 'camisas', label: 'Camisas' }
    ]
  },
  {
    id: 'metal',
    type: 'metal',
    eyebrow: 'Pregunta 7 de 12',
    title: '¿Dorado o plateado?',
    subtitle: '¿Qué joyería te queda mejor?',
    options: [
      { id: 'dorado', label: 'Dorado', image: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80' },
      { id: 'plateado', label: 'Plateado', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=400&q=80' },
      { id: 'ambos', label: 'Ambos', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400&q=80' }
    ]
  },
  {
    id: 'style',
    type: 'style',
    eyebrow: 'Pregunta 8 de 12',
    title: '¿Cómo describirías tu estilo?',
    subtitle: 'Selecciona todos los que te representen',
    chips: [
      { id: 'clasico', label: 'Clásico' },
      { id: 'casual', label: 'Casual' },
      { id: 'bohemio', label: 'Bohemio' },
      { id: 'glamuroso', label: 'Glamuroso' },
      { id: 'minimalista', label: 'Minimalista' },
      { id: 'deportivo', label: 'Deportivo' },
      { id: 'romantico', label: 'Romántico' },
      { id: 'edgy', label: 'Edgy' },
      { id: 'vintage', label: 'Vintage' },
      { id: 'streetwear', label: 'Streetwear' },
      { id: 'profesional', label: 'Profesional' },
      { id: 'chic', label: 'Chic' }
    ]
  },
  {
    id: 'occasions',
    type: 'occasions',
    eyebrow: 'Pregunta 9 de 12',
    title: '¿Para qué ocasiones vistes?',
    subtitle: 'Selecciona todas las que apliquen',
    chips: [
      { id: 'oficina', label: 'Oficina' },
      { id: 'citas', label: 'Citas' },
      { id: 'eventos', label: 'Eventos formales' },
      { id: 'fin-semana', label: 'Fin de semana' },
      { id: 'ejercicio', label: 'Ejercicio' },
      { id: 'viajes', label: 'Viajes' },
      { id: 'fiestas', label: 'Fiestas' },
      { id: 'familia', label: 'Tiempo con familia' },
      { id: 'coworking', label: 'Coworking/Café' },
      { id: 'casa', label: 'Estar en casa' }
    ]
  },
  {
    id: 'archetype',
    type: 'archetype',
    eyebrow: 'Pregunta 10 de 12',
    title: '¿Cuál es tu look de referencia?',
    subtitle: 'Elige el arquetipo que más te inspire',
    options: [
      { id: 'natural', label: 'Natural', image: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=80' },
      { id: 'dramatica', label: 'Dramática', image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=80' },
      { id: 'romantica', label: 'Romántica', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
      { id: 'ingenua', label: 'Ingenua', image: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80' },
      { id: 'arquitectonica', label: 'Arquitectónica', image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&q=80' },
      { id: 'glamourosa', label: 'Glamourosa', image: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80' }
    ]
  },
  {
    id: 'photos',
    type: 'photos',
    eyebrow: 'Pregunta 11 de 12',
    title: 'Sube 3 fotos tuyas',
    subtitle: 'Para un análisis más preciso de tu color personal'
  },
  {
    id: 'name-email',
    type: 'name-email',
    eyebrow: 'Última pregunta',
    title: 'Tus datos para el informe',
    subtitle: 'Ingresa tu información para recibir tu análisis personalizado'
  }
];

export default function Quiz({
  questionIndex,
  answers,
  uploadedPhoto,
  onAnswer,
  onNext,
  onPhotoUpload,
  onNameSubmit,
  onStartAnalysis
}: QuizProps) {
  const [nameInput, setNameInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);
  const [animated, setAnimated] = useState(false);
  const fileInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    setAnimated(false);
    const timer = setTimeout(() => setAnimated(true), 50);
    return () => clearTimeout(timer);
  }, [questionIndex]);

  const currentQuestion = questions[questionIndex];
  const currentAnswer = answers.find(a => a.questionId === currentQuestion?.id);
  const isLastQuestion = questionIndex === questions.length - 1;
  const isNameEmailQuestion = currentQuestion?.type === 'name-email';
  const hasAnswer = currentAnswer !== undefined || isNameEmailQuestion;

  const handleImageSelect = (optionId: string) => {
    if (!currentQuestion) return;
    onAnswer(currentQuestion.id, optionId);
  };

  const handleChipSelect = (chipId: string) => {
    if (!currentQuestion) return;
    const current = (currentAnswer?.value as string[]) || [];
    if (current.includes(chipId)) {
      onAnswer(currentQuestion.id, current.filter(c => c !== chipId));
    } else {
      onAnswer(currentQuestion.id, [...current, chipId]);
    }
  };

  const handleChoiceSelect = (choiceId: string) => {
    if (!currentQuestion) return;
    onAnswer(currentQuestion.id, choiceId);
  };

  const handleColorSelect = (colorId: string) => {
    if (!currentQuestion) return;
    const current = (currentAnswer?.value as string[]) || [];
    if (current.includes(colorId)) {
      onAnswer(currentQuestion.id, current.filter(c => c !== colorId));
    } else {
      onAnswer(currentQuestion.id, [...current, colorId]);
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhotos = [...uploadedPhotos];
        newPhotos[index] = reader.result as string;
        setUploadedPhotos(newPhotos);
        onPhotoUpload(newPhotos.filter(Boolean));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNameSubmit = () => {
    if (nameInput.trim() && emailInput.trim()) {
      onNameSubmit(nameInput.trim(), emailInput.trim());
      onStartAnalysis();
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
    if (!currentQuestion) return null;

    switch (currentQuestion.type) {
      case 'name-email':
        return (
          <div className="card-inner">
            <div className="card-question">
              <p className="card-eyebrow">{currentQuestion.eyebrow}</p>
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="text-input-wrap">
                <input
                  type="text"
                  className="text-input"
                  placeholder="Tu nombre completo"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  style={{ fontSize: 'clamp(20px, 4vw, 32px)' }}
                />
              </div>
              <div className="text-input-wrap">
                <input
                  type="email"
                  className="text-input"
                  placeholder="tu@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ fontSize: 'clamp(16px, 3vw, 24px)' }}
                />
                <p className="text-input-label">Tu email para recibir el informe</p>
              </div>
            </div>
          </div>
        );

      case 'feeling':
      case 'style':
      case 'occasions':
      case 'closet':
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

      case 'skin-tone':
      case 'silhouette':
      case 'metal':
      case 'archetype':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div className="image-grid" style={{ gridTemplateColumns: currentQuestion.options?.length === 3 ? 'repeat(3, 1fr)' : 'repeat(3, 1fr)' }}>
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

      case 'budget':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div className="choice-list">
              {currentQuestion.choices?.map((choice, idx) => (
                <button
                  key={choice.id}
                  className={`choice-item ${currentAnswer?.value === choice.id ? 'selected' : ''}`}
                  onClick={() => handleChoiceSelect(choice.id)}
                >
                  <span className="choice-key">{idx + 1}</span>
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

      case 'colors-closet':
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div className="color-swatch-grid" style={{ maxHeight: '400px' }}>
              {currentQuestion.colors?.map((color) => (
                <div
                  key={color.id}
                  className={`color-swatch-item ${(currentAnswer?.value as string[])?.includes(color.id) ? 'selected' : ''}`}
                  onClick={() => handleColorSelect(color.id)}
                >
                  <div
                    className="color-swatch-circle"
                    style={{
                      backgroundColor: color.hex,
                      border: color.id === 'blanco' ? '1px solid #e0e0de' : 'none'
                    }}
                  />
                  <span className="color-swatch-label">{color.name}</span>
                </div>
              ))}
            </div>
          </div>
        );

      case 'photos':
        const photoLabels = ['Rostro frontal', 'Perfil izquierdo', 'Cuerpo completo'];
        return (
          <div className="card-inner">
            <div className="card-question">
              {currentQuestion.eyebrow && <p className="card-eyebrow">{currentQuestion.eyebrow}</p>}
              <h2 className="card-title">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && <p className="card-subtitle">{currentQuestion.subtitle}</p>}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {[0, 1, 2].map((index) => (
                <div key={index}>
                  <label
                    className={`photo-drop ${uploadedPhotos[index] ? 'photo-drop-uploaded' : ''}`}
                    style={{ padding: uploadedPhotos[index] ? '0' : '32px 16px' }}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoChange(e, index)}
                      ref={(el) => fileInputRefs.current[index] = el}
                    />
                    {uploadedPhotos[index] ? (
                      <div style={{ position: 'relative' }}>
                        <img
                          src={uploadedPhotos[index]}
                          alt={`Foto ${index + 1}`}
                          style={{ width: '100%', aspectRatio: '1', objectFit: 'cover', borderRadius: '2px' }}
                        />
                        <div style={{
                          position: 'absolute',
                          top: '8px',
                          left: '8px',
                          background: '#4ade80',
                          color: '#fff',
                          padding: '4px 8px',
                          fontSize: '8px',
                          borderRadius: '2px',
                          letterSpacing: '0.1em'
                        }}>
                          ✓ Cargada
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="photo-drop-icon" style={{ fontSize: '32px' }}>+</div>
                        <div style={{ fontFamily: 'var(--serif)', fontSize: '14px', color: '#000', marginBottom: '4px' }}>
                          {photoLabels[index]}
                        </div>
                        <div style={{ fontSize: '8px', color: 'var(--grey-5)', letterSpacing: '0.1em' }}>
                          Toca para subir
                        </div>
                      </>
                    )}
                  </label>
                </div>
              ))}
            </div>
            <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--grey-5)', textAlign: 'center' }}>
              Necesitas al menos 1 foto para continuar
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  const canContinue = () => {
    if (!currentQuestion) return false;
    if (isNameEmailQuestion) {
      return nameInput.trim() && emailInput.trim() && emailInput.includes('@');
    }
    if (currentQuestion.type === 'photos') {
      return uploadedPhotos.filter(Boolean).length >= 1;
    }
    return true;
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

      <div style={{ width: '100%', maxWidth: '760px', margin: '0 auto', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {renderQuestion()}
      </div>

      <div className="continue-row" style={{ padding: '0 48px 60px', width: '100%' }}>
        {isNameEmailQuestion ? (
          <button
            className="continue-btn ready"
            onClick={handleNameSubmit}
            disabled={!canContinue()}
            style={{
              opacity: canContinue() ? 1 : 0.5,
              cursor: canContinue() ? 'pointer' : 'not-allowed'
            }}
          >
            Ver Resultados
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        ) : (
          <button
            className={`continue-btn ${canContinue() ? 'ready' : ''}`}
            onClick={handleContinue}
            disabled={!canContinue()}
            style={{
              opacity: canContinue() ? 1 : 0.5,
              cursor: canContinue() ? 'pointer' : 'not-allowed'
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
        {isNameEmailQuestion ? 'Final' : `${questionIndex + 1} de ${questions.length - 1}`}
      </div>
    </div>
  );
}

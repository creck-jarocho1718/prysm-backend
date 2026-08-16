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
  type: 'name-email' | 'feeling' | 'skin-tone' | 'silhouette' | 'budget' | 'colors-closet' | 'closet' | 'metal' | 'style' | 'occasions' | 'archetype' | 'photos';
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
    id: 'name-email',
    type: 'name-email',
    title: 'Cuéntanos sobre ti',
    subtitle: 'Para personalizar tu informe de estilo',
    eyebrow: 'Antes de empezar'
  },
  {
    id: 'feeling',
    type: 'feeling',
    eyebrow: 'Pregunta 1 de 11',
    title: '¿Cómo te gustaría sentirte?',
    subtitle: 'Selecciona la que más resuene contigo',
    chips: [
      { id: 'sofisticada', label: 'Sofisticada' },
      { id: 'segura', label: ' Segura' },
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
    eyebrow: 'Pregunta 2 de 11',
    title: '¿Cuál es tu tono de piel?',
    subtitle: 'Selecciona la opción que más se parezca a tu piel',
    options: [
      { id: 'muy-clara', label: 'Muy Clara', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23FDEEE4" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%23F8D9C8"/%3E%3C/svg%3E' },
      { id: 'clara', label: 'Clara', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23F8D5C0" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%23F0C4A8"/%3E%3C/svg%3E' },
      { id: 'media', label: 'Media', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23D4A574" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%23C8956A"/%3E%3C/svg%3E' },
      { id: 'morena-clara', label: 'Morena Clara', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23B8860B" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%23A67C52"/%3E%3C/svg%3E' },
      { id: 'morena', label: 'Morena', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%238B4513" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%23704213"/%3E%3C/svg%3E' },
      { id: 'morena-oscura', label: 'Morena Oscura', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%235D3A1A" width="300" height="400"/%3E%3Ccircle cx="150" cy="160" r="60" fill="%234C2D1E"/%3E%3C/svg%3E' }
    ]
  },
  {
    id: 'silhouette',
    type: 'silhouette',
    eyebrow: 'Pregunta 3 de 11',
    title: '¿Cuál es tu tipo de silueta?',
    subtitle: 'Selecciona la que mejor describa tu figura',
    options: [
      { id: 'reloj-arena', label: 'Reloj de Arena', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="35" ry="40" fill="%23e0e0e0"/%3E%3Cpath d="M110 140 Q90 200 95 280 Q100 320 120 340 L130 340 L130 260 L125 200 L150 180 L175 200 L170 260 L170 340 L180 340 Q200 320 205 280 Q210 200 190 140 Z" fill="%23e0e0e0"/%3E%3C/svg%3E' },
      { id: 'triangulo', label: 'Triángulo', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="35" ry="40" fill="%23e0e0e0"/%3E%3Cpath d="M110 140 Q100 200 80 280 Q70 320 65 340 L140 340 L140 200 L150 180 L160 200 L160 340 L235 340 Q230 320 220 280 Q200 200 190 140 Z" fill="%23e0e0e0"/%3E%3C/svg%3E' },
      { id: 'triangulo-inv', label: 'Triángulo Invertido', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="40" ry="45" fill="%23e0e0e0"/%3E%3Cpath d="M95 145 Q90 200 95 240 L100 240 Q80 200 85 145 Q100 130 150 130 Q200 130 215 145 Q220 200 200 240 L205 240 Q210 200 205 145 Z" fill="%23e0e0e0"/%3E%3Cpath d="M100 240 L95 340 L205 340 L200 240 Z" fill="%23e0e0e0"/%3E%3C/svg%3E' },
      { id: 'rectangulo', label: 'Rectángulo', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="35" ry="40" fill="%23e0e0e0"/%3E%3Cpath d="M105 140 L105 340 L195 340 L195 140 Z" fill="%23e0e0e0"/%3E%3C/svg%3E' },
      { id: 'ovalada', label: 'Ovalada', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="35" ry="40" fill="%23e0e0e0"/%3E%3Cellipse cx="150" cy="220" rx="60" ry="80" fill="%23e0e0e0"/%3E%3Cpath d="M90 280 L95 340 L205 340 L210 280 Z" fill="%23e0e0e0"/%3E%3C/svg%3E' },
      { id: 'diamante', label: 'Diamante', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23f5f5f5" width="300" height="400"/%3E%3Cellipse cx="150" cy="100" rx="35" ry="40" fill="%23e0e0e0"/%3E%3Cellipse cx="150" cy="220" rx="55" ry="60" fill="%23e0e0e0"/%3E%3Cpath d="M95 260 L100 340 L200 340 L205 260 Z" fill="%23e0e0e0"/%3E%3Cellipse cx="150" cy="170" rx="45" ry="30" fill="%23d0d0d0"/%3E%3C/svg%3E' }
    ]
  },
  {
    id: 'budget',
    type: 'budget',
    eyebrow: 'Pregunta 4 de 11',
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
    eyebrow: 'Pregunta 5 de 11',
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
    eyebrow: 'Pregunta 6 de 11',
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
    eyebrow: 'Pregunta 7 de 11',
    title: '¿Dorado o plateado?',
    subtitle: 'La joyería que mejor te favorece',
    options: [
      { id: 'dorado', label: 'Dorado', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23FFFBEB" width="300" height="400"/%3E%3Ccircle cx="150" cy="180" r="50" fill="%23D4AF37" stroke="%23B8860B" stroke-width="3"/%3E%3Ccircle cx="150" cy="180" r="35" fill="%23FFD700"/%3E%3Ccircle cx="150" cy="280" r="40" fill="%23D4AF37" stroke="%23B8860B" stroke-width="2"/%3E%3Cellipse cx="150" cy="280" rx="25" ry="30" fill="%23FFD700"/%3E%3C/svg%3E' },
      { id: 'plateado', label: 'Plateado', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23F0F0F0" width="300" height="400"/%3E%3Ccircle cx="150" cy="180" r="50" fill="%23C0C0C0" stroke="%23A9A9A9" stroke-width="3"/%3E%3Ccircle cx="150" cy="180" r="35" fill="%23E8E8E8"/%3E%3Ccircle cx="150" cy="280" r="40" fill="%23C0C0C0" stroke="%23A9A9A9" stroke-width="2"/%3E%3Cellipse cx="150" cy="280" rx="25" ry="30" fill="%23E8E8E8"/%3E%3C/svg%3E' },
      { id: 'ambos', label: 'Ambos me favorecen', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23FFFBEB" width="300" height="400"/%3E%3Ccircle cx="120" cy="180" r="35" fill="%23FFD700" stroke="%23D4AF37" stroke-width="2"/%3E%3Ccircle cx="180" cy="180" r="35" fill="%23E8E8E8" stroke="%23C0C0C0" stroke-width="2"/%3E%3Cellipse cx="120" cy="280" rx="20" ry="25" fill="%23FFD700" stroke="%23D4AF37" stroke-width="2"/%3E%3Cellipse cx="180" cy="280" rx="20" ry="25" fill="%23E8E8E8" stroke="%23C0C0C0" stroke-width="2"/%3E%3C/svg%3E' }
    ]
  },
  {
    id: 'style',
    type: 'style',
    eyebrow: 'Pregunta 8 de 11',
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
    eyebrow: 'Pregunta 9 de 11',
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
    eyebrow: 'Pregunta 10 de 11',
    title: '¿Cuál es tu look de referencia?',
    subtitle: 'Elige el arquetipo que más te inspire (opcional)',
    options: [
      { id: 'natural', label: 'Natural', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23F5F5DC" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="40" ry="45" fill="%23DEB887"/%3E%3Cellipse cx="140" cy="115" rx="8" ry="6" fill="%238B4513"/%3E%3Cellipse cx="160" cy="115" rx="8" ry="6" fill="%238B4513"/%3E%3Cpath d="M130 100 Q150 80 170 100 Q160 90 150 95 Q140 90 130 100" fill="%23A0522D"/%3E%3Cpath d="M115 140 Q100 200 110 280 L190 280 Q200 200 185 140 Q170 130 150 130 Q130 130 115 140" fill="%236B8E23"/%3E%3Cellipse cx="150" cy="310" rx="30" ry="50" fill="%236B8E23"/%3E%3Cellipse cx="120" cy="360" rx="15" ry="20" fill="%23D2B48C"/%3E%3Cellipse cx="180" cy="360" rx="15" ry="20" fill="%23D2B48C"/%3E%3C/svg%3E' },
      { id: 'dramatica', label: 'Dramática', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%231C1C1C" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="35" ry="40" fill="%23F5DEB3"/%3E%3Cellipse cx="135" cy="115" rx="6" ry="4" fill="%23000"/%3E%3Cellipse cx="165" cy="115" rx="6" ry="4" fill="%23000"/%3E%3Cpath d="M130 90 L150 70 L170 90 L165 95 L150 80 L135 95 Z" fill="%23000"/%3E%3Cpath d="M110 140 Q90 200 95 280 L205 280 Q210 200 190 140 Q170 125 150 125 Q130 125 110 140" fill="%23000"/%3E%3Cpath d="M120 180 L110 280 L190 280 L180 180 Z" fill="%23222"/%3E%3Cellipse cx="150" cy="310" rx="25" ry="50" fill="%23000"/%3E%3Cellipse cx="125" cy="360" rx="12" ry="20" fill="%23000"/%3E%3Cellipse cx="175" cy="360" rx="12" ry="20" fill="%23000"/%3E%3C/svg%3E' },
      { id: 'romantica', label: 'Romántica', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23FFF0F5" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="38" ry="43" fill="%23FFDAB9"/%3E%3Cellipse cx="138" cy="115" rx="7" ry="5" fill="%236B8E23"/%3E%3Cellipse cx="162" cy="115" rx="7" ry="5" fill="%236B8E23"/%3E%3Cpath d="M135 95 Q150 85 165 95 Q160 92 150 90 Q140 92 135 95" fill="%23D2691E"/%3E%3Cpath d="M120 140 Q100 200 105 260 Q110 300 130 310 Q150 320 170 310 Q190 300 195 260 Q200 200 180 140 Q165 125 150 125 Q135 125 120 140" fill="%23FFB6C1"/%3E%3Cpath d="M125 180 Q150 200 175 180 L180 300 Q150 320 120 300 Z" fill="%23FFC0CB"/%3E%3Cellipse cx="150" cy="320" rx="30" ry="45" fill="%23FFB6C1"/%3E%3Cellipse cx="130" cy="365" rx="10" ry="15" fill="%23FFB6C1"/%3E%3Cellipse cx="170" cy="365" rx="10" ry="15" fill="%23FFB6C1"/%3E%3Ccircle cx="140" cy="200" r="8" fill="%23FF69B4" opacity="0.5"/%3E%3Ccircle cx="160" cy="220" r="6" fill="%23FF69B4" opacity="0.5"/%3E%3C/svg%3E' },
      { id: 'ingenua', label: 'Ingenua', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23E6E6FA" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="36" ry="42" fill="%23FFE4C4"/%3E%3Cellipse cx="140" cy="115" rx="8" ry="6" fill="%234B0082"/%3E%3Cellipse cx="160" cy="115" rx="8" ry="6" fill="%234B0082"/%3E%3Ccircle cx="140" cy="115" r="3" fill="%23000"/%3E%3Ccircle cx="160" cy="115" r="3" fill="%23000"/%3E%3Cpath d="M140 135 Q150 145 160 135" stroke="%23FF69B4" stroke-width="2" fill="none"/%3E%3Cpath d="M125 95 Q150 75 175 95 Q165 90 150 92 Q135 90 125 95" fill="%23FFD700"/%3E%3Cpath d="M115 140 Q100 200 105 270 L195 270 Q200 200 185 140 Q170 130 150 130 Q130 130 115 140" fill="%23ADD8E6"/%3E%3Cpath d="M130 170 L130 270 L170 270 L170 170 Z" fill="%23B0E0E6"/%3E%3Cellipse cx="150" cy="290" rx="35" ry="55" fill="%23ADD8E6"/%3E%3Cellipse cx="120" cy="350" rx="12" ry="20" fill="%23FFE4E1"/%3E%3Cellipse cx="180" cy="350" rx="12" ry="20" fill="%23FFE4E1"/%3E%3C/svg%3E' },
      { id: 'arquitectonica', label: 'Arquitectónica', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%23F0F0F0" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="32" ry="38" fill="%23D2B48C"/%3E%3Cellipse cx="140" cy="115" rx="5" ry="4" fill="%23000"/%3E%3Cellipse cx="160" cy="115" rx="5" ry="4" fill="%23000"/%3E%3Crect x="125" y="90" width="50" height="15" fill="%23000" transform="rotate(-5 150 97)"/%3E%3Cpath d="M110 140 L190 140 L200 280 L100 280 Z" fill="%23333"/%3E%3Crect x="115" y="160" width="20" height="100" fill="%23666"/%3E%3Crect x="165" y="160" width="20" height="100" fill="%23666"/%3E%3Cpath d="M110 280 L100 360 L130 360 L125 280" fill="%23333"/%3E%3Cpath d="M190 280 L200 360 L170 360 L175 280" fill="%23333"/%3E%3Cellipse cx="115" cy="360" rx="15" ry="10" fill="%23000"/%3E%3Cellipse cx="185" cy="360" rx="15" ry="10" fill="%23000"/%3E%3C/svg%3E' },
      { id: 'glamourosa', label: 'Glamourosa', image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 400"%3E%3Crect fill="%232E0854" width="300" height="400"/%3E%3Cellipse cx="150" cy="120" rx="38" ry="43" fill="%23F5DEB3"/%3E%3Cellipse cx="138" cy="115" rx="7" ry="5" fill="%23000"/%3E%3Cellipse cx="162" cy="115" rx="7" ry="5" fill="%23000"/%3E%3Cpath d="M130 95 Q150 85 170 95 Q160 92 150 90 Q140 92 130 95" fill="%23FFD700"/%3E%3Ccircle cx="150" cy="85" r="10" fill="%23FFD700"/%3E%3Cpath d="M105 140 Q85 200 90 280 L210 280 Q215 200 195 140 Q170 120 150 120 Q130 120 105 140" fill="%23FFD700"/%3E%3Cpath d="M115 170 Q150 200 185 170 L190 280 L110 280 Z" fill="%23FFC125"/%3E%3Cellipse cx="150" cy="310" rx="35" ry="50" fill="%23FFD700"/%3E%3Cellipse cx="120" cy="365" rx="12" ry="18" fill="%23FFD700"/%3E%3Cellipse cx="180" cy="365" rx="12" ry="18" fill="%23FFD700"/%3E%3Ccircle cx="130" cy="180" r="4" fill="%23FFF"/%3E%3Ccircle cx="170" cy="180" r="4" fill="%23FFF"/%3E%3Ccircle cx="150" cy="250" r="5" fill="%23FFF"/%3E%3C/svg%3E' }
    ]
  },
  {
    id: 'photos',
    type: 'photos',
    eyebrow: 'Última pregunta',
    title: 'Sube 3 fotos tuyas',
    subtitle: 'Para un análisis más preciso de tu color personal'
  }
];

export default function Quiz({
  questionIndex,
  answers,
  uploadedPhoto,
  onAnswer,
  onNext,
  onPhotoUpload,
  onNameSubmit
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
  const isFirstQuestion = currentQuestion?.type === 'name-email';
  const hasAnswer = currentAnswer !== undefined || isFirstQuestion;

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
    }
  };

  const handleContinue = () => {
    onNext();
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
    if (isFirstQuestion) {
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
        {isFirstQuestion ? (
          <button
            className="continue-btn ready"
            onClick={handleNameSubmit}
            disabled={!canContinue()}
            style={{
              opacity: canContinue() ? 1 : 0.5,
              cursor: canContinue() ? 'pointer' : 'not-allowed'
            }}
          >
            Comenzar
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
        {isFirstQuestion ? 'Inicio' : `${questionIndex} de ${questions.length - 1}`}
      </div>
    </div>
  );
}

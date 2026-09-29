/**
 * PRYSM API Service
 * Handles communication with the backend
 */

import { TEST_MODE } from '../config';

// Use TEST_MODE to determine which API URL to use
// IMPORTANT: VITE_TEST_API_URL and VITE_API_URL are set during build/deployment
const getApiBaseUrl = (): string => {
  const testUrl = import.meta.env.VITE_TEST_API_URL;
  const prodUrl = import.meta.env.VITE_API_URL;
  const fallbackUrl = 'http://localhost:3001';

  if (TEST_MODE) {
    if (testUrl) {
      console.log('[PRYSM API] Using TEST API URL:', testUrl);
      return testUrl;
    }
    console.log('[PRYSM API] TEST_MODE enabled but VITE_TEST_API_URL not set, using localhost');
    return fallbackUrl;
  }

  if (prodUrl) {
    console.log('[PRYSM API] Using PROD API URL:', prodUrl);
    return prodUrl;
  }

  console.log('[PRYSM API] No API URL configured, using localhost');
  return fallbackUrl;
};

const API_BASE_URL = getApiBaseUrl();

export interface QuizAnswers {
  [key: string]: string | string[];
}

export interface SkinAnalysisData {
  skinColor: string;
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  saturation: 'low' | 'medium' | 'high';
  contrast: 'low' | 'medium' | 'high';
  confidence: number;
  raw: {
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
}

export interface AnalysisRequest {
  name: string;
  email: string;
  photos: string[]; // base64 encoded images
  answers: QuizAnswers;
  skinAnalysis?: SkinAnalysisData; // Pre-analyzed skin data from frontend
}

export interface SeasonInfo {
  id: string;
  name: string;
  temperature: string;
  depth: string;
  saturation?: string;
  contrast?: string;
  explanation?: string;
}

export interface PaletteColors {
  protagonist: string[];
  secondary: string[];
  neutral: string[];
  accent: string[];
  avoid: string[];
}

export interface BodyTypeInfo {
  id: string;
  name: string;
}

// GPT Analysis data structure (matches StyleAnalysisResponse from styleAnalysis.ts)
export interface GPTAnalysisData {
  analisisColor: {
    subtono: string;
    profundidad: string;
    contraste: string;
    saturacion: string;
    estacion: string;
    subestacion?: string;
    confianza: number;
    explicacion: string;
    paleta: {
      protagonistas: { hex: string; nombre: string; explicacion: string }[];
      secundarios: { hex: string; nombre: string; explicacion: string }[];
      neutros: { hex: string; nombre: string; explicacion: string }[];
      acento: { hex: string; nombre: string; explicacion: string }[];
      evitar: { hex: string; nombre: string; explicacion: string }[];
    };
  };
  silueta: {
    tipoCuerpo: string;
    cortes: string[];
    proporciones: string;
    escotes: string[];
    largos: { pantalones: string; faldas: string };
    prendasFavorecen: string[];
    prendasEvitar: string[];
    explicacion: string;
  };
  estilo: {
    principal: { nombre: string; descripcion: string; palabrasClave: string[] };
    secundarios: string[];
    arquetipo: string;
    sensacionProyectar: string;
  };
  presupuesto: {
    nivel: string;
    comprasPrioritarias: { prenda: string; razon: string; rangoPrecio: string }[];
    invertir: { prenda: string; razon: string; rangoPrecio: string }[];
    economicas: { prenda: string; dondeAhorrar: string; rangoPrecio: string }[];
    puedeEsperar: string[];
  };
  closet: {
    yaTienes: { prenda: string; comoUsar: string; combinaCon: string[] }[];
    teSirve: { prenda: string; comoAdaptar: string }[];
    combinaloAsi: { prenda: string; combinacion: string; colores: string[] }[];
    teFalta: string[];
    noEsPrioridad: string[];
  };
  ocasiones: {
    nombre: string;
    prioridad: number;
    looks: { nombre: string; piezas: string; colores: string[]; sensacion: string; descripcion: string }[];
  }[];
  joyeria: {
    metal: string;
    acabados: string[];
    tipos: string[];
    piedras: string[];
    explicacion: string;
  };
  perfil: {
    descubrimiento: string;
    explicacion: string;
    coloresFavorecen: string;
    coloresConservar: string;
    coloresDejar: string;
    prendasFavorecen: string;
    prendasComprar: string;
    prioridadCompras: string;
    looksPrincipales: string;
    imagenDeseada: string;
  };
}

export interface AnalysisResponse {
  success: boolean;
  reportId?: string;
  pdfUrl?: string;
  // Direct GPT data from backend (matches backend response structure)
  data?: GPTAnalysisData;
  analysis?: {
    season: SeasonInfo;
    palette: PaletteColors;
    bodyType: BodyTypeInfo;
    prysmScore: number;
    analysisMethod: 'photo_analysis' | 'quiz_answers' | 'client_side_photo_analysis' | 'client_side_no_photos' | 'gpt_analysis';
    skinAnalysisData?: SkinAnalysisData;
    // Full GPT analysis data for personalization
    gptAnalysisData?: GPTAnalysisData;
  };
  analysisNote?: string;
  error?: string;
  processingTime?: string;
}

/**
 * Upload photos to backend and get analysis
 *
 * IMPORTANT: This function sends data to the backend which calls OpenAI.
 * No mock data is used - if the request fails, an error is returned.
 */
export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
  console.log('[PRYSM API] analyzeImage called');
  console.log('[PRYSM API] Photos included:', request.photos && request.photos.length > 0);
  console.log('[PRYSM API] Photos count:', request.photos?.length || 0);
  console.log('[PRYSM API] Quiz answers included:', !!request.answers);
  console.log('[PRYSM API] API URL:', API_BASE_URL);

  try {
    // Send JSON with base64 photos
    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: request.name,
        email: request.email,
        photos: request.photos, // base64 encoded images
        answers: request.answers,
        skinAnalysis: request.skinAnalysis,
      }),
    });

    console.log('[PRYSM API] Response status:', response.status);

    const data = await response.json();
    console.log('[PRYSM API] Response success:', data.success);

    if (data.success) {
      console.log('[PRYSM] GPT season:', data.data?.analisisColor?.estacion);
      console.log('[PRYSM] GPT palette colors:', data.data?.analisisColor?.paleta?.protagonistas?.length);
      console.log('[PRYSM] GPT silhouette:', data.data?.silueta?.tipoCuerpo);
      console.log('[PRYSM] GPT style:', data.data?.estilo?.principal?.nombre);
    } else {
      console.log('[PRYSM API] Error:', data.error);
    }

    return data;
  } catch (error) {
    console.error('[PRYSM API] Network error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'No pudimos conectar con el servidor. Intenta nuevamente.'
    };
  }
}

/**
 * Quick analysis from quiz answers only (no photos)
 */
export async function quickAnalysis(name: string, email: string, answers: QuizAnswers): Promise<AnalysisResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/analyze/quick`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, email, answers }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Quick analysis API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al conectar con el servidor'
    };
  }
}

/**
 * Check if backend is healthy
 */
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get PDF URL
 */
export function getPdfUrl(pdfPath: string): string {
  if (pdfPath.startsWith('http')) {
    return pdfPath;
  }
  return `${API_BASE_URL}${pdfPath}`;
}

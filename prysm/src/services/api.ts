/**
 * PRYSM API Service
 * Handles communication with the backend
 */

// Use environment variable or fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface QuizAnswers {
  [key: string]: string | string[];
}

export interface AnalysisRequest {
  name: string;
  email: string;
  photos: string[]; // base64 encoded images
  answers: QuizAnswers;
}

export interface SeasonInfo {
  id: string;
  name: string;
  temperature: string;
  depth: string;
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

export interface AnalysisResponse {
  success: boolean;
  reportId?: string;
  pdfUrl?: string;
  analysis?: {
    season: SeasonInfo;
    palette: PaletteColors;
    bodyType: BodyTypeInfo;
    prysmScore: number;
    analysisMethod: 'photo_analysis' | 'quiz_answers';
  };
  error?: string;
  processingTime?: string;
}

/**
 * Upload photos to backend and get analysis
 */
export async function analyzeImage(request: AnalysisRequest): Promise<AnalysisResponse> {
  try {
    // Convert base64 photos to FormData
    const formData = new FormData();
    formData.append('name', request.name);
    formData.append('email', request.email);
    formData.append('answers', JSON.stringify(request.answers));

    // Add photos
    request.photos.forEach((photo, index) => {
      // Convert base64 to blob
      const byteString = atob(photo.split(',')[1]);
      const mimeString = photo.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      formData.append(`photo${index === 0 ? 'Front' : index === 1 ? 'Left' : 'Right'}`, blob, `photo${index}.jpg`);
    });

    const response = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP error ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Analysis API error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al conectar con el servidor'
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

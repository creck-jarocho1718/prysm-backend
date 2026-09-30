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
import { cleanSeasonLabel, normalizeKey } from './services/seasonFormat';
import { PersonalStyleProfile, SilhouetteType, BudgetLevel, StyleType, OccasionType, MetalPreference, SeasonType } from './services/styleGenome';

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

// ============================================================================
// Helper Functions to Extract Quiz Answers
// ============================================================================

/**
 * Get a single answer from the answers array
 */
function getAnswerValue(answers: QuizAnswer[], questionId: string): string | string[] | undefined {
  const answer = answers.find(a => a.questionId === questionId);
  return answer?.value;
}

/**
 * Get a single string answer (for single-select questions)
 */
function getStringAnswer(answers: QuizAnswer[], questionId: string): string {
  const value = getAnswerValue(answers, questionId);
  if (Array.isArray(value)) return value[0] || '';
  return value || '';
}

/**
 * Get an array of strings (for multi-select questions)
 */
function getArrayAnswer(answers: QuizAnswer[], questionId: string): string[] {
  const value = getAnswerValue(answers, questionId);
  if (Array.isArray(value)) return value;
  return value ? [value] : [];
}

// Mapping: Silhouette quiz answer → SilhouetteType
const SILHOUETTE_MAP: Record<string, { type: SilhouetteType; name: string }> = {
  'reloj-arena': { type: 'hourglass', name: 'Reloj de Arena' },
  'triangulo': { type: 'pear', name: 'Triángulo' },
  'triangulo-inv': { type: 'inverted_triangle', name: 'Triángulo Invertido' },
  'rectangulo': { type: 'rectangle', name: 'Rectángulo' },
  'ovalada': { type: 'oval', name: 'Ovalada' },
  'diamante': { type: 'diamond', name: 'Diamante' },
};

// Mapping: Budget quiz answer → BudgetLevel
const BUDGET_MAP: Record<string, BudgetLevel> = {
  'menos-1000': 'low',
  '1000-3000': 'medium',
  '3000-5000': 'medium',
  '5000-10000': 'high',
  'mas-10000': 'luxury',
};

// Mapping: Metal quiz answer → MetalPreference
const METAL_MAP: Record<string, MetalPreference> = {
  'dorado': 'gold',
  'plateado': 'silver',
  'ambos': 'both',
};

// Mapping: Style quiz answer → StyleType
const STYLE_MAP: Record<string, StyleType> = {
  'clasico': 'classic',
  'casual': 'casual',
  'bohemio': 'boho',
  'glamuroso': 'glamorous',
  'minimalista': 'minimalist',
  'deportivo': 'sporty',
  'romantico': 'romantic',
  'edgy': 'dramatic',
  'vintage': 'artistic',
  'streetwear': 'casual',
  'profesional': 'professional',
  'chic': 'elegant',
};

// Mapping: Occasion quiz answer → OccasionType
const OCCASION_MAP: Record<string, OccasionType> = {
  'oficina': 'office',
  'citas': 'date',
  'eventos': 'event',
  'fin-semana': 'casual',
  'ejercicio': 'sport',
  'viajes': 'travel',
  'fiestas': 'event',
  'familia': 'casual',
  'coworking': 'casual',
  'casa': 'casual',
};

// Color names from quiz to readable format
const COLOR_NAMES: Record<string, string> = {
  'negro': 'Negro',
  'blanco': 'Blanco',
  'gris': 'Gris',
  'azul': 'Azul',
  'cafe': 'Café',
  'beige': 'Beige',
  'rojo': 'Rojo',
  'verde': 'Verde',
  'morado': 'Morado',
  'rosa': 'Rosa',
  'amarillo': 'Amarillo',
  'naranja': 'Naranja',
};

/**
 * Get color name from HEX code
 * Used as fallback when GPT doesn't provide the name
 */
function getColorNameFromHex(hex: string): string {
  // Remove # if present
  const cleanHex = hex.replace('#', '').toUpperCase();

  // Color name mapping based on HEX values
  const COLOR_MAP: Record<string, string> = {
    'FF6F61': 'Coral',
    '6DA3D6': 'Azul Cielo',
    'F5B9B4': 'Rosa Claro',
    'A8D7E1': 'Turquesa',
    'FFFFFF': 'Blanco',
    'C0C0C0': 'Gris Claro',
    'D50032': 'Rojo Intenso',
    'FF0000': 'Rojo Intenso',
    '4B0082': 'Índigo',
    '00FF00': 'Verde Lima',
    'FFD700': 'Dorado',
    'FFB6C1': 'Rosa Claro',
    '32CD32': 'Verde Lima',
    'FF4500': 'Rojo Anaranjado',
    'F5F5DC': 'Beige',
    'FFB347': 'Melocotón',
    'FFCC67': 'Amarillo Miel',
    'FF7F50': 'Coral',
    'FFA07A': 'Salmón',
    'DEB887': 'Arena',
    'D2B48C': 'Tan',
    'C19A6B': 'Camel',
    '8B4513': 'Marrón Suela',
    'D2691E': 'Chocolate',
    'CD853F': 'Perú',
    '556B2F': 'Verde Oliva',
    'DAA520': 'Dorado',
    '8B7355': 'Marrón Cuero',
    '000080': 'Azul Marino',
    '0000FF': 'Azul Brillante',
    '800020': 'Burdeos',
    '0F52BA': 'Azul Zafiro',
    '708090': 'Gris Pizarra',
    '778899': 'Azul Grisáceo',
    '87CEEB': 'Azul Cielo',
    'B0C4DE': 'Azul Periwinkle',
    'E6E6FA': 'Lavanda',
    'D8BFD8': 'Malva',
    'ADD8E6': 'Azul Claro',
    'F8F9F9': 'Blanco',
    '1C1C1C': 'Negro Profundo',
    '333333': 'Gris Carbón',
    '36454F': 'Carbón',
    'FF69B4': 'Rosa Brillante',
    '9400D3': 'Violeta',
    '00FFFF': 'Cyan',
    '00BFFF': 'Azul Cielo Brillante',
    '00CED1': 'Turquesa',
    'FF6347': 'Rojo Tomate',
    'F7C548': 'Amarillo Sol',
    'FF8C00': 'Naranja',
    'FF1493': 'Rosa Intenso',
    '1ABC9C': 'Turquesa',
    'E74C3C': 'Rojo',
    '9B59B6': 'Amatista',
    'FF6B6B': 'Rojo Coral',
    'F39C12': 'Naranja',
    'C4B7A6': 'Gris Topo',
    'A89F91': 'Taupe',
    '9B8579': 'Marrón Rosado',
    'B5A99A': 'Arena Rosada',
    '8B8075': 'Gris Cálido',
    '7A6F63': 'Marrón Grisáceo',
    'D4A574': 'Melocotón',
    'C49A6C': 'Caramelo',
    'B8956E': 'Cobre Suave',
    'A0826D': 'Marrón Rosado',
    '7A6B5A': 'Marrón Ternera',
    '6B5344': 'Marrón Oscuro',
    '5D4E37': 'Marrón Oliva',
    'E97451': 'Terracota',
    'F4A460': 'Salmón',
    '2F4F4F': 'Verde Grisáceo',
    '4A5568': 'Gris Azulado',
    '5B6B7C': 'Azul Gris',
    '696969': 'Gris Dim',
    '636363': 'Gris Medio',
    '1C2833': 'Azul Noche',
    'E5E4E2': 'Platino',
    'ECF0F1': 'Gris Claro',
    'FDFEFE': 'Blanco Nieve',
    'FFF8DC': 'Crema',
    'FFEFD5': 'Melocotón Claro',
    'FAFAD2': 'Crema Claro',
    'FFFAF0': 'Blanco Hueso',
    'D6EAF8': 'Azul Claro',
    'F2F3F4': 'Gris Plateado',
    '85C1E9': 'Azul Cielo',
    'AED6F1': 'Azul Pastel',
    'A9CCE3': 'Azul Grisáceo',
    'B8860B': 'Oro Oscuro',
    '704214': 'Marrón Canela',
    '6B4423': 'Marrón Oscuro',
    '4A3728': 'Marrón Café',
    '3D2914': 'Marrón Profundo',
    '4169E1': 'Azul Real',
    '0000CD': 'Azul Medium',
    '8B0000': 'Rojo Oscuro',
    '000000': 'Negro',
    '98FB98': 'Verde Mentol',
    'FFDAB9': 'Melocotón',
    'F0E68C': 'Amarillo Caqui',
    'B0E0E6': 'Azul Powder',
    'CDC0B0': 'Beige Rosado',
    'C8C0B8': 'Gris Béige',
    'A89080': 'Marrón Grisáceo',
    'B8A090': 'Rosa Salmón',
    'A0522D': 'Siena',
  };

  return COLOR_MAP[cleanHex] || cleanHex;
}

// Derive secondary styles based on primary
const SECONDARY_STYLES: Record<StyleType, StyleType[]> = {
  classic: ['elegant', 'professional'],
  romantic: ['elegant', 'glamorous'],
  dramatic: ['glamorous', 'artistic'],
  natural: ['casual', 'boho'],
  glamorous: ['elegant', 'romantic'],
  minimalist: ['classic', 'elegant'],
  boho: ['natural', 'casual'],
  sporty: ['casual', 'natural'],
  elegant: ['classic', 'glamorous'],
  casual: ['natural', 'sporty'],
  artistic: ['dramatic', 'glamorous'],
  professional: ['classic', 'elegant'],
};

/**
 * Build PersonalStyleProfile from real quiz answers AND GPT analysis
 * GPT analysis takes PRIORITY over quiz answers
 */
function buildProfileFromAnswers(
  answers: QuizAnswer[],
  userName: string,
  userEmail: string,
  uploadedPhotos: string[],
  analysis: any,
  skinAnalysis: any
): PersonalStyleProfile {
  // Check if we have GPT analysis data
  // Backend returns: { success, data: { analisisColor, silueta, estilo, ... } }
  const gptData = analysis?.data;
  const hasGPTAnalysis = !!gptData;

  testLog.info('Building profile - GPT analysis available:', hasGPTAnalysis);

  // Q1: Desired feeling (from quiz, as fallback for GPT)
  const desiredFeeling = getStringAnswer(answers, 'feeling') || 'segura';

  // Q2: Skin tone (from quiz, as reference)
  const skinToneQuiz = getStringAnswer(answers, 'skin-tone');

  // Q3: Silhouette - Use GPT result if available, else quiz
  const silhouetteAnswer = getStringAnswer(answers, 'silhouette');
  let silhouetteData = SILHOUETTE_MAP[silhouetteAnswer] || SILHOUETTE_MAP['reloj-arena'];
  let silhouetteRecommendations = getSilhouetteRecommendations(silhouetteData.type);

  if (hasGPTAnalysis) {
    // GPT determines the silhouette type — lookup is case/accent/format-insensitive
    // (GPT may return "reloj-arena", "Reloj de Arena", "RECTANGULO", etc.)
    const gptSilhouetteMap: Record<string, typeof silhouetteData> = {
      'reloj de arena': { type: 'hourglass', name: 'Reloj de Arena' },
      'triangulo': { type: 'pear', name: 'Triángulo' },
      'triangulo invertido': { type: 'inverted_triangle', name: 'Triángulo Invertido' },
      'rectangulo': { type: 'rectangle', name: 'Rectángulo' },
      'ovalada': { type: 'oval', name: 'Ovalada' },
      'ovalado': { type: 'oval', name: 'Ovalada' },
      'diamante': { type: 'diamond', name: 'Diamante' },
      'manzana': { type: 'apple', name: 'Manzana' }
    };
    silhouetteData = gptSilhouetteMap[normalizeKey(gptData.silueta.tipoCuerpo)] || silhouetteData;
    silhouetteRecommendations = {
      favor: gptData.silueta.prendasFavorecen || [],
      avoid: gptData.silueta.prendasEvitar || [],
      necklines: gptData.silueta.escotes || [],
      silhouettes: gptData.silueta.cortes || []
    };
  }

  // Q4: Budget
  const budgetAnswer = getStringAnswer(answers, 'budget');
  const budget = BUDGET_MAP[budgetAnswer] || 'medium';

  // Q5: Existing colors
  const existingColorsRaw = getArrayAnswer(answers, 'colors-closet');
  const existingColors = existingColorsRaw.map(c => COLOR_NAMES[c] || c);

  // Q6: Existing pieces
  const existingPiecesRaw = getArrayAnswer(answers, 'closet');
  const existingPieces = existingPiecesRaw.map(p => {
    const pieceMap: Record<string, string> = {
      'jeans': 'Jeans',
      'blusas': 'Blusas',
      'vestidos': 'Vestidos',
      'faldas': 'Faldas',
      'shorts': 'Shorts',
      'blazers': 'Blazers',
      'sweaters': 'Sweaters',
      'zapatos': 'Zapatos',
      'bolsas': 'Bolsas',
      'accesorios': 'Accesorios',
      'sudaderas': 'Sudaderas',
      'camisas': 'Camisas',
    };
    return pieceMap[p] || p.charAt(0).toUpperCase() + p.slice(1);
  });

  // Detect wardrobe gaps based on existing pieces
  const gaps: string[] = [];
  const piecesLower = existingPiecesRaw.map(p => p.toLowerCase());
  if (!piecesLower.some(p => p.includes('blazer'))) {
    gaps.push('Blazer o sak de constructor');
  }
  if (!piecesLower.some(p => p.includes('vestido'))) {
    gaps.push('Vestido versátil');
  }
  if (!piecesLower.some(p => p.includes('pantalon') || p.includes('jean'))) {
    gaps.push('Pantalón bien cortado');
  }

  // Q7: Metal preference
  const metalAnswer = getStringAnswer(answers, 'metal');
  let metal = METAL_MAP[metalAnswer] || 'both';

  if (hasGPTAnalysis) {
    // GPT determines metal preference based on colorimetry
    const metalMap: Record<string, typeof metal> = {
      'oro': 'gold',
      'oro rosa': 'gold', // Map to gold as fallback
      'plata': 'silver',
      'bronce': 'both', // Map to both as bronze works with warm tones
      'acero': 'silver'
    };
    metal = metalMap[gptData.joyeria.metal.toLowerCase()] || metal;
  }

  // Q8: Style
  const styleAnswers = getArrayAnswer(answers, 'style');
  let primaryStyle = styleAnswers.length > 0 ?
    (STYLE_MAP[styleAnswers[0]] || 'classic') : 'classic';
  let secondaryStyles = styleAnswers.length > 1 ?
    styleAnswers.slice(1, 3).map(s => STYLE_MAP[s] || 'casual') :
    SECONDARY_STYLES[primaryStyle];

  if (hasGPTAnalysis) {
    // GPT determines style based on analysis
    const styleMap: Record<string, typeof primaryStyle> = {
      'clásico': 'classic',
      'casual': 'casual',
      'bohemio': 'boho',
      'glamuroso': 'glamorous',
      'minimalista': 'minimalist',
      'deportivo': 'sporty',
      'romántico': 'romantic',
      'dramático': 'dramatic',
      'artístico': 'artistic',
      'elegante': 'elegant',
      'profesional': 'professional'
    };
    primaryStyle = styleMap[gptData.estilo.principal.nombre.toLowerCase()] || primaryStyle;
  }

  // Q9: Occasions with priorities
  const occasionAnswers = getArrayAnswer(answers, 'occasions');
  const occasions = occasionAnswers.map((occ, idx) => ({
    type: OCCASION_MAP[occ] || 'casual',
    priority: Math.max(1, 5 - idx),
  }));
  if (occasions.length === 0) {
    occasions.push({ type: 'office', priority: 5 });
    occasions.push({ type: 'casual', priority: 4 });
  }

  // Q10: Archetype (reference looks)
  const archetype = getStringAnswer(answers, 'archetype');

  // Get season from GPT analysis (if available) or analysis data
  let season = {
    primary: 'pending',
    name: 'Pendiente de análisis',
    subtitle: 'Análisis pendiente',
    temperature: 'neutral' as 'warm' | 'cool' | 'neutral',
    depth: 'medium' as 'light' | 'medium' | 'deep',
    contrast: 'medium' as 'low' | 'medium' | 'high',
    saturation: 'medium' as 'muted' | 'medium' | 'bright',
    isPending: true,
  };

  if (hasGPTAnalysis) {
    // Use GPT's color analysis
    const gptSeason = gptData.analisisColor;
    // Clean label: dedupes ("OTOÑO OTOÑO PROFUNDO" -> "Otoño Profundo") and hides N/A substations
    const seasonName = cleanSeasonLabel(gptSeason.estacion, gptSeason.subestacion);
    const substation = gptSeason.subestacion || '';

    // Map season to internal format
    const seasonTypeMap: Record<string, string> = {
      'otoño profundo': 'deep_autumn',
      'otoño suave': 'soft_autumn',
      'otoño cálido': 'warm_autumn',
      'invierno profundo': 'deep_winter',
      'invierno brillante': 'bright_winter',
      'invierno frío': 'cool_winter',
      'invierno suave': 'soft_winter',
      'primavera brillante': 'bright_spring',
      'primavera cálida': 'warm_spring',
      'primavera clara': 'light_spring',
      'primavera suave': 'soft_spring',
      'verano claro': 'light_summer',
      'verano suave': 'soft_summer',
      'verano frío': 'cool_summer',
      'verano brillante': 'bright_summer',
      'otoño': 'warm_autumn',
      'invierno': 'cool_winter',
      'primavera': 'warm_spring',
      'verano': 'cool_summer'
    };

    const seasonIdKey = substation ? substation.toLowerCase() : gptSeason.estacion.toLowerCase();
    const seasonPrimary = seasonTypeMap[seasonIdKey] || seasonTypeMap[gptSeason.estacion.toLowerCase()] || 'warm_autumn';

    season = {
      primary: seasonPrimary as any,
      name: seasonName,
      subtitle: `${seasonName} · ${gptSeason.subtono} · ${gptSeason.profundidad}`,
      temperature: gptSeason.subtono === 'cálido' ? 'warm' :
                   gptSeason.subtono === 'frío' ? 'cool' : 'neutral',
      depth: gptSeason.profundidad === 'claro' ? 'light' :
             gptSeason.profundidad === 'profundo' ? 'deep' : 'medium',
      contrast: gptSeason.contraste === 'bajo' ? 'low' :
                gptSeason.contraste === 'alto' ? 'high' : 'medium',
      saturation: gptSeason.saturacion === 'baja' ? 'muted' :
                  gptSeason.saturacion === 'alta' ? 'bright' : 'medium',
      isPending: false,
    };
  } else if (analysis?.analysis?.season) {
    // Fallback to analysis data
    const seasonId = analysis.analysis.season.id || analysis.analysis.season.primary || 'pending';
    const isWarm = seasonId.includes('autumn') || seasonId.includes('spring');
    const isCool = seasonId.includes('winter') || seasonId.includes('summer');
    const isDeep = seasonId.includes('deep') || seasonId.includes('dark');
    const isLight = seasonId.includes('light');

    season = {
      primary: seasonId,
      name: analysis.analysis.season.name || 'Pendiente de análisis',
      subtitle: `${analysis.analysis.season.name || 'Temporada'} · ${analysis.analysis.season.temperature || 'Warm'} · ${isDeep ? 'Rich' : 'Medium'}`,
      temperature: (analysis.analysis.season.temperature as any) || (isWarm ? 'warm' : isCool ? 'cool' : 'neutral'),
      depth: (analysis.analysis.season.depth as any) || (isDeep ? 'deep' : isLight ? 'light' : 'medium'),
      contrast: (analysis.analysis.season.contrast as any) || 'medium',
      saturation: (analysis.analysis.season.saturation as any) || 'medium',
      isPending: seasonId === 'pending',
    };
  }

  // Use palette from GPT analysis (if available) or analysis data
  // IMPORTANT: Store full color objects (hex, nombre, explicacion) to display correct names in report
  let palette = {
    protagonist: [] as { hex: string; nombre: string; explicacion: string }[],
    secondary: [] as { hex: string; nombre: string; explicacion: string }[],
    accent: [] as { hex: string; nombre: string; explicacion: string }[],
    neutral: [] as { hex: string; nombre: string; explicacion: string }[],
    avoid: [] as { hex: string; nombre: string; explicacion: string }[],
    isPending: true,
  };

  if (hasGPTAnalysis) {
    // GPT provides the complete palette with names - store full objects
    palette = {
      protagonist: gptData.analisisColor.paleta.protagonistas.map((c: any) => ({
        hex: c.hex,
        nombre: c.nombre || getColorNameFromHex(c.hex),
        explicacion: c.explicacion || ''
      })),
      secondary: gptData.analisisColor.paleta.secundarios.map((c: any) => ({
        hex: c.hex,
        nombre: c.nombre || getColorNameFromHex(c.hex),
        explicacion: c.explicacion || ''
      })),
      accent: gptData.analisisColor.paleta.acento.map((c: any) => ({
        hex: c.hex,
        nombre: c.nombre || getColorNameFromHex(c.hex),
        explicacion: c.explicacion || ''
      })),
      neutral: gptData.analisisColor.paleta.neutros.map((c: any) => ({
        hex: c.hex,
        nombre: c.nombre || getColorNameFromHex(c.hex),
        explicacion: c.explicacion || ''
      })),
      avoid: gptData.analisisColor.paleta.evitar.map((c: any) => ({
        hex: c.hex,
        nombre: c.nombre || getColorNameFromHex(c.hex),
        explicacion: c.explicacion || ''
      })),
      isPending: false,
    };
  } else if (analysis?.analysis?.palette) {
    // Convert string arrays to color objects
    palette = {
      protagonist: (analysis.analysis.palette.protagonist || []).map((hex: string) => ({
        hex,
        nombre: getColorNameFromHex(hex),
        explicacion: ''
      })),
      secondary: (analysis.analysis.palette.secondary || []).map((hex: string) => ({
        hex,
        nombre: getColorNameFromHex(hex),
        explicacion: ''
      })),
      accent: (analysis.analysis.palette.accent || []).map((hex: string) => ({
        hex,
        nombre: getColorNameFromHex(hex),
        explicacion: ''
      })),
      neutral: (analysis.analysis.palette.neutral || []).map((hex: string) => ({
        hex,
        nombre: getColorNameFromHex(hex),
        explicacion: ''
      })),
      avoid: (analysis.analysis.palette.avoid || []).map((hex: string) => ({
        hex,
        nombre: getColorNameFromHex(hex),
        explicacion: ''
      })),
      isPending: false,
    };
  }

  // Build the final profile
  return {
    profileId: `test-${Date.now()}`,
    createdAt: new Date().toISOString(),
    userName: userName || analysis?.analysis?.userName || 'Usuario Test',
    userEmail: userEmail || analysis?.analysis?.userEmail || 'test@test.com',
    userPhotos: uploadedPhotos,
    colorimetry: {
      season: {
        primary: season.primary as SeasonType,
        name: season.name,
        subtitle: season.subtitle,
        temperature: season.temperature,
        depth: season.depth,
        contrast: season.contrast,
        saturation: season.saturation,
      },
      palette,
      skinAnalysis: skinAnalysis || (analysis?.analysis?.skinAnalysisData ? {
        undertone: analysis.analysis.skinAnalysisData.undertone || 'unknown',
        depth: analysis.analysis.skinAnalysisData.depth || 'unknown',
        saturation: analysis.analysis.skinAnalysisData.saturation || 'unknown',
        contrast: 'medium',
        confidence: analysis.analysis.skinAnalysisData.confidence || 0,
      } : {
        undertone: 'unknown',
        depth: 'unknown',
        saturation: 'unknown',
        contrast: 'unknown',
        confidence: 0,
      }),
    },
    silhouette: {
      type: silhouetteData.type,
      name: silhouetteData.name,
      bodyShape: silhouetteData.type === 'hourglass' || silhouetteData.type === 'pear' || silhouetteData.type === 'apple' || silhouetteData.type === 'diamond' || silhouetteData.type === 'oval' ? 'Curvilínea' : 'Lineal',
      recommendations: silhouetteRecommendations,
    },
    lifestyle: {
      occasions,
      budget,
      wardrobeStatus: {
        existingPieces,
        existingColors,
        gaps,
      },
    },
    style: {
      primary: primaryStyle,
      secondary: secondaryStyles,
      desiredFeeling,
      referenceLooks: archetype ? [archetype] : [],
    },
    preferences: {
      metal,
      styleAdjectives: styleAnswers.map(s => {
        const adjMap: Record<string, string> = {
          'clasico': 'Clásico',
          'casual': 'Casual',
          'bohemio': 'Bohemio',
          'glamuroso': 'Glamuroso',
          'minimalista': 'Minimalista',
          'deportivo': 'Deportivo',
          'romantico': 'Romántico',
          'edgy': 'Edgy',
          'vintage': 'Vintage',
          'streetwear': 'Streetwear',
          'profesional': 'Profesional',
          'chic': 'Chic',
        };
        return adjMap[s] || s;
      }),
    },
    goals: {
      primary: desiredFeeling,
      blockers: [],
    },
    prysmScore: analysis?.analysis?.prysmScore || (hasGPTAnalysis ? (gptData.analisisColor.confianza || 0.85) * 10 : 8.5),
    analysisConfidence: hasGPTAnalysis ? (gptData.analisisColor.confianza || 0.9) : 0.85,
  };
}

function getSilhouetteRecommendations(type: SilhouetteType) {
  const recommendations: Record<SilhouetteType, { favor: string[]; avoid: string[]; necklines: string[]; silhouettes: string[] }> = {
    hourglass: {
      favor: ['Cintura definida', 'Tejidos que marcan curva', 'Piezas que realzan proporción'],
      avoid: ['Líneas rectas sin forma', 'Ropa oversize que oculta figura', 'Cinturones anchos en cintura'],
      necklines: ['V', 'Redondeada', 'Sweetheart', 'Halter'],
      silhouettes: ['Ajustado en cintura', 'Evaseado en falda', 'Bodycon'],
    },
    pear: {
      favor: ['Escotes que equilibran', 'Colores claros arriba', 'Tejidos estructurados en torso'],
      avoid: ['Ropa ajustada en cadera', 'Estampados grandes abajo', 'Volumen en parte inferior'],
      necklines: ['V', 'Barco', 'Cuadrado', 'One shoulder'],
      silhouettes: ['A-line', 'Trapecio', 'Blusas con estructura'],
    },
    inverted_triangle: {
      favor: ['Colores oscuros arriba', 'Piezas simples en torso', 'Falda con volumen'],
      avoid: ['Hombreras grandes', 'Estampados arriba', 'Capas que añaden volumen arriba'],
      necklines: ['Barco', 'Redondeada', 'Cuadrado'],
      silhouettes: ['A-line', 'Pantalones anchos', 'Skirts con volumen'],
    },
    rectangle: {
      favor: ['Cintura definida', 'Capas y volumen', 'Piezas con textura'],
      avoid: ['Ropa completamente recta', 'Sin diferenciación', 'Tejidos lisos sin forma'],
      necklines: ['V', 'Redondeada', 'Halter', 'Asimétrica'],
      silhouettes: ['Entallado en cintura', 'Fit and flare', 'Piezas con drapeado'],
    },
    oval: {
      favor: ['Cintura suelta o alta', 'Piezas con estructura', 'Líneas verticales'],
      avoid: ['Ropa muy ajustada', 'Estampados grandes', 'Tejidos muy finos'],
      necklines: ['V', 'Columna', 'Escote alto'],
      silhouettes: ['Empire', 'Blazers', 'Capas con estructura'],
    },
    diamond: {
      favor: ['Cintura definida', 'Equilibrio arriba y abajo', 'Tejidos fluidos'],
      avoid: ['Ropa muy ajustada', 'Líneas horizontales', 'Volumen extremo'],
      necklines: ['V', 'Escote redondo', 'Asimétrica'],
      silhouettes: ['Fit and flare', 'Trapecio', 'Piezas con movimiento'],
    },
    apple: {
      favor: ['Cintura suelta', 'Piezas que fluyen', 'Escotes que alargan'],
      avoid: ['Ropa ajustada en medio', 'Cinturones en cintura', 'Tejidos rígidos'],
      necklines: ['V profundo', 'Escote barco', 'Columnas verticales'],
      silhouettes: ['Empire', 'A-line', 'Blazers largos'],
    },
  };

  return recommendations[type] || recommendations.hourglass;
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
    console.log('[App] handleAnalysisComplete received:', JSON.stringify(result, null, 2));
    console.log('[App] GPT season:', result?.data?.analisisColor?.estacion);
    console.log('[App] GPT palette colors:', result?.data?.analisisColor?.paleta?.protagonistas?.length);
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
    // Clean up localStorage (but NOT the PDF data since we don't store it there anymore)
    localStorage.removeItem('prysm_analysis');
    localStorage.removeItem('prysm_pdf_url');
    localStorage.removeItem('prysm_payment_verified');
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

      // Build PersonalStyleProfile from REAL quiz answers
      const profile = buildProfileFromAnswers(
        answers,
        userName,
        userEmail,
        uploadedPhotos,
        analysis,
        skinAnalysis
      );

      testLog.profile('PersonalStyleProfile built from quiz answers');
      testLog.info('Answers used:', {
        Q1_feeling: getStringAnswer(answers, 'feeling'),
        Q2_skinTone: getStringAnswer(answers, 'skin-tone'),
        Q3_silhouette: getStringAnswer(answers, 'silhouette'),
        Q4_budget: getStringAnswer(answers, 'budget'),
        Q5_colors: getArrayAnswer(answers, 'colors-closet'),
        Q6_pieces: getArrayAnswer(answers, 'closet'),
        Q7_metal: getStringAnswer(answers, 'metal'),
        Q8_style: getArrayAnswer(answers, 'style'),
        Q9_occasions: getArrayAnswer(answers, 'occasions'),
        Q10_archetype: getStringAnswer(answers, 'archetype'),
        photosCount: uploadedPhotos.length,
      });

      // Generate PDF
      const pdfData = await generatePdfHtml(profile);

      testLog.pdf({ action: 'PDF generated successfully', pageCount: pdfData.pageCount });

      // Store payment verified flag (small data only)
      localStorage.setItem('prysm_payment_verified', 'true');

      // Store PDF data in React state ONLY (NOT in localStorage to avoid quota exceeded)
      // The PDF contains base64 images which are too large for localStorage
      setTestPdfData(pdfData);

      // Transition to report
      setCurrentScreen('report');

    } catch (error) {
      testLog.info('Error generating PDF:', error);
      alert('Error al generar el informe. Por favor intenta de nuevo.');
      setCurrentScreen('result');
    }
  }, [answers, userName, userEmail, uploadedPhotos]);

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

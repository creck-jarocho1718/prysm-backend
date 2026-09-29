/**
 * Analysis Validator - Valida resultados antes de generar PDF
 */

import { SeasonType, SEASON_CONFIG, isValidSeason } from './seasonConfig';
import { COLOR_CATALOG, getColorFromCatalog } from './colorCatalog';
import { testLog } from '../config';

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

export interface ValidatedAnalysisResult {
  // Season
  season: SeasonType | null;
  seasonName: string;
  seasonSubtitle: string;
  undertone: string;
  depth: string;
  contrast: string;
  saturation: string;
  seasonDescription: string;

  // Colors
  seasonalColors: ValidatedColor[];
  personalColors: ValidatedColor[];
  avoidColors: ValidatedColor[];

  // Body
  bodyShape: string;
  bodyShapeSource: 'user_selected' | 'image_analysis' | 'unknown';
  faceShape: string | null;

  // Hair
  hair: {
    recommended: ValidatedColor[];
    avoid: ValidatedColor[];
    cuts: string[];
  };

  // Outfits
  outfits: ValidatedOutfit[];

  // Accessories
  jewelry: { name: string; desc: string }[];
  bags: { name: string; desc: string }[];
  accessories: { name: string; desc: string }[];

  // Score
  score: number;
}

export interface ValidatedColor {
  hex: string;
  name: string;
  category: 'best' | 'top' | 'favorite' | 'accent' | 'neutral' | 'avoid';
  explanation: string;
  temperature?: string;
  family?: string;
}

export interface ValidatedOutfit {
  occasion: string;
  occasionIcon: string;
  pieces: string;
  colors: string[];
  adaptForStyle?: string;
  adaptForBudget?: string;
}

/**
 * Valida el resultado de análisis
 */
export function validateAnalysis(result: any): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // 1. Validar estación
  if (!result.season) {
    errors.push({ field: 'season', message: 'Estación no proporcionada', severity: 'error' });
  } else if (!isValidSeason(result.season)) {
    // Intentar mapear
    const mapped = mapSeasonFromString(result.season);
    if (!mapped) {
      errors.push({ field: 'season', message: `Estación inválida: ${result.season}`, severity: 'error' });
    }
  }

  // 2. Validar colores de temporada (deben ser exactamente 6)
  const seasonalColors = result.seasonalColors || [];
  if (seasonalColors.length < 6) {
    warnings.push({
      field: 'seasonalColors',
      message: `Colores de temporada insuficientes: ${seasonalColors.length}/6. Se completarán desde el catálogo.`,
      severity: 'warning'
    });
  } else if (seasonalColors.length > 6) {
    warnings.push({
      field: 'seasonalColors',
      message: `Colores de temporada excedentes: ${seasonalColors.length}/6. Se seleccionarán los primeros 6.`,
      severity: 'warning'
    });
  }

  // 3. Validar colores personalizados (deben ser exactamente 8)
  const personalColors = result.personalColors || [];
  if (personalColors.length < 8) {
    warnings.push({
      field: 'personalColors',
      message: `Colores personalizados insuficientes: ${personalColors.length}/8. Se completarán desde el catálogo.`,
      severity: 'warning'
    });
  } else if (personalColors.length > 8) {
    warnings.push({
      field: 'personalColors',
      message: `Colores personalizados excedentes: ${personalColors.length}/8. Se seleccionarán los primeros 8.`,
      severity: 'warning'
    });
  }

  // 4. Validar HEX de colores
  const allColors = [...seasonalColors, ...personalColors, ...(result.avoidColors || [])];
  allColors.forEach((color: any, index: number) => {
    const hex = color.hex || color;
    const cleanHex = hex.replace('#', '').toUpperCase();

    if (!/^[0-9A-F]{6}$/.test(cleanHex)) {
      errors.push({
        field: `color[${index}].hex`,
        message: `HEX inválido: ${hex}`,
        severity: 'error'
      });
    } else if (!(cleanHex in COLOR_CATALOG)) {
      warnings.push({
        field: `color[${index}].hex`,
        message: `HEX no está en catálogo: ${hex}. El nombre puede no ser oficial.`,
        severity: 'warning'
      });
    }
  });

  // 5. Validar silueta
  if (!result.bodyShape) {
    warnings.push({ field: 'bodyShape', message: 'Silueta no proporcionada', severity: 'warning' });
  }

  // 6. Validar outfits (deben ser exactamente 4)
  const outfits = result.outfits || [];
  if (outfits.length < 4) {
    warnings.push({
      field: 'outfits',
      message: `Outfits insuficientes: ${outfits.length}/4. Se generarán adicionales.`,
      severity: 'warning'
    });
  } else if (outfits.length > 4) {
    warnings.push({
      field: 'outfits',
      message: `Outfits excedentes: ${outfits.length}/4. Se seleccionarán los primeros 4.`,
      severity: 'warning'
    });
  }

  // 7. Validar descripciones contradictorias
  if (result.season && result.seasonDescription) {
    const seasonConfig = SEASON_CONFIG[result.season as SeasonType];
    if (seasonConfig) {
      const desc = result.seasonDescription.toLowerCase();
      const temp = seasonConfig.temperature;

      // Verificar contradicciones
      if (temp === 'cool' && (desc.includes('base amarilla') || desc.includes('subtono cálido'))) {
        warnings.push({
          field: 'seasonDescription',
          message: 'Descripción contradictoria: Estás describiendo una paleta cálida para una estación fría.',
          severity: 'warning'
        });
      }
      if (temp === 'warm' && (desc.includes('subtono frío') || desc.includes('base fría'))) {
        warnings.push({
          field: 'seasonDescription',
          message: 'Descripción contradictoria: Estás describiendo una paleta fría para una estación cálida.',
          severity: 'warning'
        });
      }
    }
  }

  testLog.info('[PRYSM VALIDATION]', {
    isValid: errors.length === 0,
    errorCount: errors.length,
    warningCount: warnings.length,
    errors: errors.map(e => `${e.field}: ${e.message}`),
    warnings: warnings.map(w => `${w.field}: ${w.message}`)
  });

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Normaliza el resultado de análisis para asegurar estructura consistente
 */
export function normalizeAnalysisResult(rawResult: any, quizAnswers?: any): ValidatedAnalysisResult {
  testLog.info('[PRYSM NORMALIZE] Starting normalization...');

  // 1. Determinar estación
  let season: SeasonType | null = null;
  let seasonName = '';
  let seasonSubtitle = '';
  let undertone = '';
  let depth = '';
  let contrast = '';
  let saturation = '';
  let seasonDescription = '';

  // Intentar obtener estación del resultado
  if (rawResult.season) {
    const mappedSeason = mapSeasonFromString(rawResult.season);
    if (mappedSeason) {
      season = mappedSeason;
      const config = SEASON_CONFIG[mappedSeason];
      if (config) {
        seasonName = config.nameEs;
        seasonSubtitle = config.subtitle;
        undertone = config.temperature === 'warm' ? 'Cálido' : 'Frío';
        depth = config.depth;
        contrast = config.contrast;
        saturation = config.saturation;
        seasonDescription = config.description;
      }
    }
  }

  // Fallback si no hay estación válida
  if (!season) {
    testLog.warn('[PRYSM NORMALIZE] No valid season found, using fallback');
    season = 'bright_spring'; // Fallback seguro
    const config = SEASON_CONFIG[season];
    seasonName = config.nameEs;
    seasonSubtitle = config.subtitle;
    undertone = 'Cálido';
    depth = 'medium';
    contrast = 'medium';
    saturation = 'bright';
    seasonDescription = config.description;
  }

  // 2. Normalizar colores
  const seasonalColors = normalizeColors(rawResult.seasonalColors || rawResult.colors?.protagonist || [], season, 'seasonal');
  const personalColors = normalizeColors(rawResult.personalColors || rawResult.colors?.protagonist || [], season, 'personal');
  const avoidColors = normalizeColors(rawResult.avoidColors || rawResult.colors?.avoid || [], season, 'avoid');

  // 3. Normalizar cuerpo
  const bodyShape = rawResult.bodyShape || rawResult.silhouette?.name || 'Reloj de Arena';
  const bodyShapeSource = rawResult.bodyShapeSource || (quizAnswers?.body_type ? 'user_selected' : 'unknown');
  const faceShape = rawResult.faceShape || null;

  // 4. Normalizar cabello
  const hairRecommended = normalizeColors(rawResult.hair?.recommendedColors || [], season, 'hair');
  const hairAvoid = normalizeColors(rawResult.hair?.avoidColors || [], season, 'hair-avoid');
  const hairCuts = rawResult.hair?.cuts || [];

  // 5. Normalizar outfits
  const outfits = normalizeOutfits(rawResult.outfits || [], quizAnswers);

  // 6. Normalizar accesorios
  const jewelry = rawResult.jewelry || [];
  const bags = rawResult.bags || [];
  const accessories = rawResult.accessories || [];

  // 7. Score
  const score = rawResult.score || rawResult.prysmScore || 8.0;

  const normalized: ValidatedAnalysisResult = {
    season,
    seasonName,
    seasonSubtitle,
    undertone,
    depth,
    contrast,
    saturation,
    seasonDescription,
    seasonalColors,
    personalColors,
    avoidColors,
    bodyShape,
    bodyShapeSource,
    faceShape,
    hair: {
      recommended: hairRecommended,
      avoid: hairAvoid,
      cuts: hairCuts
    },
    outfits,
    jewelry,
    bags,
    accessories,
    score
  };

  testLog.info('[PRYSM NORMALIZE] Normalization complete', {
    season: normalized.season,
    seasonalColors: normalized.seasonalColors.length,
    personalColors: normalized.personalColors.length,
    avoidColors: normalized.avoidColors.length,
    outfits: normalized.outfits.length
  });

  return normalized;
}

/**
 * Normaliza un array de colores usando el catálogo oficial
 */
function normalizeColors(colors: any[], season: SeasonType, purpose: string): ValidatedColor[] {
  const result: ValidatedColor[] = [];
  const seasonConfig = SEASON_CONFIG[season];

  // Primera pasada: normalizar colores del resultado
  colors.forEach((color: any, index: number) => {
    let hex = '';
    let name = '';
    let explanation = '';

    // Extraer HEX y nombre
    if (typeof color === 'string') {
      hex = color;
    } else if (color.hex) {
      hex = color.hex;
      name = color.nombre || color.name || '';
      explanation = color.explicacion || color.explanation || '';
    }

    hex = hex.replace('#', '').toUpperCase();

    // Buscar en catálogo
    const catalogColor = COLOR_CATALOG[hex];

    if (catalogColor) {
      // Usar nombre del catálogo, no de GPT
      result.push({
        hex: `#${hex}`,
        name: catalogColor.nameEs,
        category: getCategoryForColor(index, purpose),
        explanation: explanation || catalogColor.description || '',
        temperature: catalogColor.temperature,
        family: catalogColor.family
      });
    } else if (hex.length === 6) {
      // Color no en catálogo pero HEX válido
      result.push({
        hex: `#${hex}`,
        name: name || hex, // Usar nombre de GPT o el HEX
        category: getCategoryForColor(index, purpose),
        explanation: explanation || 'Color no verificado en catálogo.',
        temperature: 'unknown',
        family: 'unknown'
      });
    }
  });

  // Segunda pasada: completar desde catálogo si falta
  if (seasonConfig && (purpose === 'seasonal' || purpose === 'personal')) {
    while (purpose === 'seasonal' && result.length < 6) {
      const catalogColors = seasonConfig.recommendedColors;
      const nextHex = catalogColors[result.length % catalogColors.length];
      const catalogColor = COLOR_CATALOG[nextHex];
      if (catalogColor && !result.some(c => c.hex === `#${nextHex}`)) {
        result.push({
          hex: `#${nextHex}`,
          name: catalogColor.nameEs,
          category: getCategoryForColor(result.length, purpose),
          explanation: catalogColor.description || '',
          temperature: catalogColor.temperature,
          family: catalogColor.family
        });
      } else {
        break; // Evitar loop infinito
      }
    }
  }

  return result.slice(0, purpose === 'seasonal' ? 6 : purpose === 'avoid' ? 4 : 8);
}

/**
 * Obtiene categoría según posición y propósito
 */
function getCategoryForColor(index: number, purpose: string): ValidatedColor['category'] {
  if (purpose === 'avoid') return 'avoid';

  const categories: ValidatedColor['category'][] = ['best', 'top', 'favorite', 'accent', 'neutral', 'avoid', 'favorite', 'accent'];
  return categories[index] || 'favorite';
}

/**
 * Normaliza outfits
 */
function normalizeOutfits(outfits: any[], quizAnswers?: any): ValidatedOutfit[] {
  const occasionIcons: Record<string, string> = {
    'office': '✦',
    'oficina': '✦',
    'date': '♥',
    'citas': '♥',
    'casual': '☀',
    'fin de semana': '☀',
    'event': '★',
    'eventos': '★',
    'fiestas': '★',
    'travel': '✈',
    'viajes': '✈',
    'sport': '⚡',
    'ejercicio': '⚡',
    'familia': '☀',
    'casa': '☀'
  };

  return outfits.slice(0, 4).map((outfit: any) => ({
    occasion: outfit.occasion || outfit.nombre || 'Día a día',
    occasionIcon: occasionIcons[outfit.occasion?.toLowerCase()] || '✦',
    pieces: outfit.pieces || outfit.descripcion || '',
    colors: Array.isArray(outfit.colors) ? outfit.colors : [],
    adaptForStyle: outfit.adaptForStyle || '',
    adaptForBudget: outfit.adaptForBudget || ''
  }));
}

/**
 * Mapea string de estación a tipo SeasonType
 */
function mapSeasonFromString(seasonStr: string): SeasonType | null {
  const lower = seasonStr.toLowerCase();

  // Mapeo directo por palabras clave
  if (lower.includes('primavera') || lower.includes('spring')) {
    if (lower.includes('brillante') || lower.includes('bright')) return 'bright_spring';
    if (lower.includes('cálida') || lower.includes('warm')) return 'warm_spring';
    if (lower.includes('clara') || lower.includes('light')) return 'light_spring';
    if (lower.includes('suave') || lower.includes('soft')) return 'soft_spring';
    return 'bright_spring';
  }

  if (lower.includes('verano') || lower.includes('summer')) {
    if (lower.includes('brillante') || lower.includes('bright')) return 'bright_summer';
    if (lower.includes('fría') || lower.includes('frío') || lower.includes('cool')) return 'cool_summer';
    if (lower.includes('clara') || lower.includes('light')) return 'light_summer';
    if (lower.includes('suave') || lower.includes('soft')) return 'soft_summer';
    return 'cool_summer';
  }

  if (lower.includes('otoño') || lower.includes('autumn')) {
    if (lower.includes('profunda') || lower.includes('deep')) return 'deep_autumn';
    if (lower.includes('cálida') || lower.includes('warm')) return 'warm_autumn';
    if (lower.includes('suave') || lower.includes('soft')) return 'soft_autumn';
    return 'warm_autumn';
  }

  if (lower.includes('invierno') || lower.includes('winter')) {
    if (lower.includes('profunda') || lower.includes('deep')) return 'deep_winter';
    if (lower.includes('brillante') || lower.includes('bright')) return 'bright_winter';
    if (lower.includes('fría') || lower.includes('frío') || lower.includes('cool')) return 'cool_winter';
    if (lower.includes('suave') || lower.includes('soft')) return 'soft_winter';
    return 'bright_winter';
  }

  return null;
}

/**
 * Valida y normaliza en un solo paso
 */
export function processAnalysisResult(rawResult: any, quizAnswers?: any): {
  validated: ValidatedAnalysisResult;
  validation: ValidationResult;
} {
  const validation = validateAnalysis(rawResult);
  const validated = normalizeAnalysisResult(rawResult, quizAnswers);

  return { validated, validation };
}

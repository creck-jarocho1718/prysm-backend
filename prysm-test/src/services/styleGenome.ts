/**
 * StyleGenome - Personal Style Profile Generator
 * Combines quiz answers + photo analysis to create personalized profile
 */

import { QuizAnswers } from './api';
import { SkinAnalysisResult } from './colorAnalysis';
import { testLog } from '../config';

// ============================================================================
// Type Definitions
// ============================================================================

export type SeasonType =
  | 'deep_autumn' | 'soft_autumn' | 'warm_autumn'
  | 'deep_winter' | 'bright_winter' | 'cool_winter' | 'soft_winter'
  | 'bright_spring' | 'warm_spring' | 'light_spring' | 'soft_spring'
  | 'light_summer' | 'soft_summer' | 'cool_summer' | 'bright_summer';

export type SilhouetteType =
  | 'hourglass' | 'pear' | 'apple' | 'rectangle'
  | 'inverted_triangle' | 'diamond' | 'oval';

export type StyleType =
  | 'classic' | 'romantic' | 'dramatic' | 'natural'
  | 'glamorous' | 'minimalist' | 'boho' | 'sporty'
  | 'elegant' | 'casual' | 'artistic' | 'professional';

export type BudgetLevel = 'low' | 'medium' | 'high' | 'luxury';

export type OccasionType = 'office' | 'date' | 'casual' | 'event' | 'travel' | 'sport';

export type MetalPreference = 'gold' | 'silver' | 'both' | 'neither';

export interface PersonalStyleProfile {
  // Metadata
  profileId: string;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhotos?: string[];

  // Colorimetry
  colorimetry: {
    season: {
      primary: SeasonType;
      name: string;
      subtitle: string;
      temperature: 'warm' | 'cool' | 'neutral';
      depth: 'light' | 'medium' | 'deep';
      contrast: 'low' | 'medium' | 'high';
      saturation: 'muted' | 'medium' | 'bright';
    };
    palette: {
      protagonist: string[];
      secondary: string[];
      accent: string[];
      neutral: string[];
      avoid: string[];
    };
    skinAnalysis: {
      undertone: string;
      depth: string;
      saturation: string;
      contrast: string;
      confidence: number;
    };
  };

  // Silhouette
  silhouette: {
    type: SilhouetteType;
    name: string;
    bodyShape: string;
    recommendations: {
      favor: string[];
      avoid: string[];
      necklines: string[];
      silhouettes: string[];
    };
  };

  // Lifestyle
  lifestyle: {
    occasions: Array<{ type: OccasionType; priority: number }>;
    budget: BudgetLevel;
    wardrobeStatus: {
      existingPieces: string[];
      existingColors: string[];
      gaps: string[];
    };
  };

  // Style
  style: {
    primary: StyleType;
    secondary: StyleType[];
    desiredFeeling: string;
    referenceLooks: string[];
  };

  // Preferences
  preferences: {
    metal: MetalPreference;
    styleAdjectives: string[];
  };

  // Goals
  goals: {
    primary: string;
    blockers: string[];
  };

  // PRYSM Score
  prysmScore: number;
  analysisConfidence: number;
}

// ============================================================================
// Season Mapping Data
// ============================================================================

const SEASON_NAMES: Record<SeasonType, { name: string; subtitle: string }> = {
  deep_autumn: { name: 'Otoño Profundo', subtitle: 'Deep Autumn · Warm · Rich' },
  soft_autumn: { name: 'Otoño Suave', subtitle: 'Soft Autumn · Warm · Muted' },
  warm_autumn: { name: 'Otoño Cálido', subtitle: 'Warm Autumn · Warm · Bright' },
  deep_winter: { name: 'Invierno Profundo', subtitle: 'Deep Winter · Cool · Rich' },
  bright_winter: { name: 'Invierno Brillante', subtitle: 'Bright Winter · Cool · Bright' },
  cool_winter: { name: 'Invierno Frío', subtitle: 'Cool Winter · Cool · Clear' },
  soft_winter: { name: 'Invierno Suave', subtitle: 'Soft Winter · Cool · Muted' },
  bright_spring: { name: 'Primavera Brillante', subtitle: 'Bright Spring · Warm · Bright' },
  warm_spring: { name: 'Primavera Cálida', subtitle: 'Warm Spring · Warm · Clear' },
  light_spring: { name: 'Primavera Clara', subtitle: 'Light Spring · Warm · Light' },
  soft_spring: { name: 'Primavera Suave', subtitle: 'Soft Spring · Warm · Muted' },
  light_summer: { name: 'Verano Claro', subtitle: 'Light Summer · Cool · Light' },
  soft_summer: { name: 'Verano Suave', subtitle: 'Soft Summer · Cool · Muted' },
  cool_summer: { name: 'Verano Frío', subtitle: 'Cool Summer · Cool · Clear' },
  bright_summer: { name: 'Verano Brillante', subtitle: 'Bright Summer · Cool · Bright' },
};

const SEASON_PALETTES: Record<SeasonType, { protagonist: string[]; secondary: string[]; accent: string[]; neutral: string[]; avoid: string[] }> = {
  deep_autumn: {
    protagonist: ['#8B4513', '#D2691E', '#CD853F'],
    secondary: ['#556B2F', '#6B4423', '#704214'],
    accent: ['#DAA520', '#B8860B', '#D2691E'],
    neutral: ['#4A3728', '#5D4E37', '#3D2914'],
    avoid: ['#ADD8E6', '#87CEEB', '#98FB98', '#FFB6C1'],
  },
  soft_autumn: {
    protagonist: ['#C4B7A6', '#9B8579', '#A89F91'],
    secondary: ['#B5A99A', '#8B7D6B', '#A39080'],
    accent: ['#D4A574', '#C49A6C', '#B8956E'],
    neutral: ['#8B8075', '#7A6F63', '#6B6154'],
    avoid: ['#000080', '#FF4500', '#FFD700', '#00CED1'],
  },
  warm_autumn: {
    protagonist: ['#DAA520', '#CD853F', '#D2691E'],
    secondary: ['#B8860B', '#D2B48C', '#C19A6B'],
    accent: ['#F4A460', '#E97451', '#D2691E'],
    neutral: ['#8B7355', '#6B5344', '#5D4E37'],
    avoid: ['#87CEEB', '#ADD8E6', '#B0C4DE', '#E6E6FA'],
  },
  deep_winter: {
    protagonist: ['#1C1C1C', '#800020', '#0F52BA'],
    secondary: ['#000080', '#800000', '#2F4F4F'],
    accent: ['#C0C0C0', '#E5E4E2', '#FFD700'],
    neutral: ['#2F4F4F', '#36454F', '#1C2833'],
    avoid: ['#F5DEB3', '#FFE4C4', '#DEB887', '#D2B48C'],
  },
  bright_winter: {
    protagonist: ['#FF0000', '#0000FF', '#FFFFFF'],
    secondary: ['#FF69B4', '#00FFFF', '#9400D3'],
    accent: ['#FFD700', '#00FF00', '#FF1493'],
    neutral: ['#000000', '#333333', '#1C1C1C'],
    avoid: ['#F5DEB3', '#DEB887', '#D2B48C', '#FFE4C4'],
  },
  cool_winter: {
    protagonist: ['#000080', '#800020', '#4169E1'],
    secondary: ['#0000CD', '#8B0000', '#2F4F4F'],
    accent: ['#C0C0C0', '#87CEEB', '#B0C4DE'],
    neutral: ['#1C1C1C', '#333333', '#2F4F4F'],
    avoid: ['#FFD700', '#FFA500', '#FF4500', '#DAA520'],
  },
  soft_winter: {
    protagonist: ['#778899', '#708090', '#696969'],
    secondary: ['#2F4F4F', '#4A5568', '#5B6B7C'],
    accent: ['#B0C4DE', '#87CEEB', '#ADD8E6'],
    neutral: ['#36454F', '#2F4F4F', '#1C2833'],
    avoid: ['#FFD700', '#FFA500', '#FF4500', '#DAA520'],
  },
  bright_spring: {
    protagonist: ['#FF6B35', '#F7C548', '#00BFFF'],
    secondary: ['#FF8C00', '#FFD700', '#00CED1'],
    accent: ['#FF69B4', '#32CD32', '#FF6347'],
    neutral: ['#F5DEB3', '#FAFAD2', '#FFEFD5'],
    avoid: ['#4B0082', '#800080', '#2F4F4F'],
  },
  warm_spring: {
    protagonist: ['#FFB347', '#FFCC67', '#F5DEB3'],
    secondary: ['#DEB887', '#D2B48C', '#C19A6B'],
    accent: ['#FF7F50', '#FFA07A', '#E9967A'],
    neutral: ['#8B7355', '#A0826D', '#7A6B5A'],
    avoid: ['#000080', '#4B0082', '#800080', '#2F4F4F'],
  },
  light_spring: {
    protagonist: ['#FFB6C1', '#98FB98', '#87CEEB'],
    secondary: ['#FFDAB9', '#E6E6FA', '#FFA07A'],
    accent: ['#00CED1', '#FF69B4', '#98FB98'],
    neutral: ['#FFF8DC', '#FFEFD5', '#FAFAD2'],
    avoid: ['#4B0082', '#800080', '#2F4F4F', '#1C1C1C'],
  },
  soft_spring: {
    protagonist: ['#F0E68C', '#DEB887', '#D8BFD8'],
    secondary: ['#FFDAB9', '#E6E6FA', '#B0E0E6'],
    accent: ['#98FB98', '#FFB6C1', '#87CEEB'],
    neutral: ['#F5F5DC', '#FFFAF0', '#FFF8DC'],
    avoid: ['#000080', '#4B0082', '#800080', '#1C1C1C'],
  },
  light_summer: {
    protagonist: ['#E6E6FA', '#D8BFD8', '#B0C4DE'],
    secondary: ['#D6EAF8', '#D5DBDB', '#F2F3F4'],
    accent: ['#85C1E9', '#AED6F1', '#A9CCE3'],
    neutral: ['#F8F9F9', '#FDFEFE', '#FBFCFC'],
    avoid: ['#DAA520', '#CD853F', '#8B4513', '#D2691E'],
  },
  soft_summer: {
    protagonist: ['#C4B7A6', '#A89F91', '#9B8579'],
    secondary: ['#B5A99A', '#CDC0B0', '#C8C0B8'],
    accent: ['#9B8579', '#A89080', '#B8A090'],
    neutral: ['#8B8075', '#7A6F63', '#6B6154'],
    avoid: ['#FFD700', '#FF4500', '#000080', '#4B0082'],
  },
  cool_summer: {
    protagonist: ['#708090', '#778899', '#636363'],
    secondary: ['#2F4F4F', '#4A5568', '#5B6B7C'],
    accent: ['#87CEEB', '#ADD8E6', '#B0C4DE'],
    neutral: ['#36454F', '#2F4F4F', '#1C2833'],
    avoid: ['#DAA520', '#FFA500', '#FF4500', '#CD853F'],
  },
  bright_summer: {
    protagonist: ['#00BFFF', '#FF69B4', '#FF1493'],
    secondary: ['#00CED1', '#FF6B6B', '#9B59B6'],
    accent: ['#F39C12', '#1ABC9C', '#E74C3C'],
    neutral: ['#FFFFFF', '#F8F9F9', '#ECF0F1'],
    avoid: ['#8B4513', '#A0522D', '#D2691E', '#CD853F'],
  },
};

const SILHOUETTE_DATA: Record<SilhouetteType, { name: string; bodyShape: string; favor: string[]; avoid: string[]; necklines: string[]; silhouettes: string[] }> = {
  hourglass: {
    name: 'Reloj de Arena',
    bodyShape: 'Curvilínea',
    favor: ['Cintura definida', 'Tejidos que marcan curva', 'Piezas que realzan proporción'],
    avoid: ['Líneas rectas sin forma', 'Ropa oversize que oculta figura', 'Cinturones anchos en cintura'],
    necklines: ['V', 'Redondeada', 'Sweetheart', 'Halter'],
    silhouettes: ['Ajustado en cintura', 'Evaseado en falda', 'Bodycon'],
  },
  pear: {
    name: 'Pera',
    bodyShape: 'Curvilínea inferior',
    favor: ['Escotes que equilibran', 'Colores claros arriba', 'Tejidos estructurados en torso'],
    avoid: ['Ropa ajustada en cadera', 'Estampados grandes abajo', 'Volumen en parte inferior'],
    necklines: ['V', 'Barco', 'Cuadrado', 'One shoulder'],
    silhouettes: ['A-line', 'Trapecio', 'Blusas con estructura'],
  },
  apple: {
    name: 'Manzana',
    bodyShape: 'Curvilínea central',
    favor: ['Cintura suelta', 'Piezas que fluuyen', 'Escotes que alargan'],
    avoid: ['Ropa ajustada en medio', 'Cinturones en cintura', 'Tejidos rígidos'],
    necklines: ['V profundo', 'Des侄alce', 'Columnas verticales'],
    silhouettes: ['Empire', 'A-line', 'Blazers largos'],
  },
  rectangle: {
    name: 'Rectángulo',
    bodyShape: 'Lineal',
    favor: ['Cintura definida', 'Capas y volumen', 'Piezas con textura'],
    avoid: ['Ropa completamente recta', 'Sin diferenciación', 'Tejidos lisos sin forma'],
    necklines: ['V', 'Redondeada', 'Halter', 'Asimétrica'],
    silhouettes: ['Entallado en cintura', 'Fit and flare', 'Piezas con drapeado'],
  },
  inverted_triangle: {
    name: 'Triángulo Invertido',
    bodyShape: 'Curvilínea superior',
    favor: ['Colores oscuros arriba', 'Piezas simples en torso', 'Falda con volumen'],
    avoid: ['Hombreras grandes', 'Estampados arriba', 'Capas que add volume arriba'],
    necklines: ['Barco', 'Redondeada', 'Cuadrado'],
    silhouettes: ['A-line', 'Pantalones anchos', 'Skirts con volumen'],
  },
  diamond: {
    name: 'Diamante',
    bodyShape: 'Curvilínea media',
    favor: ['Cintura definida', 'Equilibrio arriba y abajo', 'Tejidos fluidos'],
    avoid: ['Ropa muy ajustada', 'Líneas horizontales', 'Volumen extremo'],
    necklines: ['V', 'Des侄alce', 'Asimétrica'],
    silhouettes: ['Fit and flare', 'Trapecio', 'Piezas con movimiento'],
  },
  oval: {
    name: 'Oval',
    bodyShape: 'Curvilínea suave',
    favor: ['Cintura suelta o alta', 'Piezas con estructura', 'Líneas verticales'],
    avoid: ['Ropa muy ajustada', 'Estampados grandes', 'Tejidos muy finos'],
    necklines: ['V', 'Columna', 'Des侄alce alto'],
    silhouettes: ['Empire', 'Blazers', 'Capas con estructura'],
  },
};

// ============================================================================
// StyleGenome Core Function
// ============================================================================

/**
 * Generate PersonalStyleProfile from quiz answers and photo analysis
 */
export function generateStyleGenome(
  userName: string,
  userEmail: string,
  quizAnswers: QuizAnswers,
  photoAnalysis?: SkinAnalysisResult
): PersonalStyleProfile {
  const profileId = `PRYSM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  testLog.info('Generating StyleGenome profile...');
  testLog.info('Quiz answers:', quizAnswers);
  testLog.info('Photo analysis:', photoAnalysis);

  // 1. Determine Season from photo analysis or quiz
  const season = determineSeason(quizAnswers, photoAnalysis);

  // 2. Determine Silhouette from quiz
  const silhouette = determineSilhouette(quizAnswers);

  // 3. Determine Lifestyle from quiz
  const lifestyle = determineLifestyle(quizAnswers);

  // 4. Determine Style from quiz
  const style = determineStyle(quizAnswers);

  // 5. Determine Preferences from quiz
  const preferences = determinePreferences(quizAnswers);

  // 6. Determine Goals from quiz
  const goals = determineGoals(quizAnswers);

  // 7. Calculate PRYSM Score
  const prysmScore = calculatePrysmScore(photoAnalysis, season);

  const profile: PersonalStyleProfile = {
    profileId,
    createdAt: new Date().toISOString(),
    userName,
    userEmail,
    colorimetry: {
      season,
      palette: SEASON_PALETTES[season.primary],
      skinAnalysis: {
        undertone: photoAnalysis?.undertone || (Array.isArray(quizAnswers.skin_tone) ? quizAnswers.skin_tone[0] : quizAnswers.skin_tone) || 'unknown',
        depth: photoAnalysis?.depth || 'medium',
        saturation: photoAnalysis?.saturation || 'medium',
        contrast: photoAnalysis?.contrast || 'medium',
        confidence: photoAnalysis?.confidence || 0.7,
      },
    },
    silhouette,
    lifestyle,
    style,
    preferences,
    goals,
    prysmScore,
    analysisConfidence: photoAnalysis?.confidence || 0.7,
  };

  testLog.profile(profile);

  return profile;
}

// ============================================================================
// Helper Functions
// ============================================================================

function determineSeason(quizAnswers: QuizAnswers, photoAnalysis?: SkinAnalysisResult): PersonalStyleProfile['colorimetry']['season'] {
  // Get temperature from photos or quiz
  let temperature: 'warm' | 'cool' | 'neutral' = 'warm';
  let depth: 'light' | 'medium' | 'deep' = 'medium';
  let saturation: 'muted' | 'medium' | 'bright' = 'medium';

  if (photoAnalysis) {
    temperature = photoAnalysis.undertone as 'warm' | 'cool' | 'neutral';
    depth = photoAnalysis.depth as 'light' | 'medium' | 'deep';
    saturation = photoAnalysis.saturation as 'muted' | 'medium' | 'bright';
  } else if (quizAnswers.skin_tone) {
    const skinTone = quizAnswers.skin_tone as string;
    if (skinTone.includes('clara')) depth = 'light';
    else if (skinTone.includes('oscura')) depth = 'deep';
    else depth = 'medium';
  }

  // Get metal preference to reinforce temperature
  const metal = quizAnswers.metal_preference as string || '';
  if (metal.includes('dorado') || metal.includes('oro')) {
    temperature = 'warm';
  } else if (metal.includes('plata') || metal.includes('plateado')) {
    temperature = 'cool';
  }

  // Map to season
  let primary: SeasonType = 'deep_autumn';

  if (temperature === 'warm') {
    if (depth === 'light') primary = 'warm_spring';
    else if (depth === 'deep') primary = 'deep_autumn';
    else {
      primary = saturation === 'bright' ? 'warm_autumn' : 'soft_autumn';
    }
  } else if (temperature === 'cool') {
    if (depth === 'light') primary = 'light_summer';
    else if (depth === 'deep') primary = 'deep_winter';
    else {
      primary = saturation === 'bright' ? 'bright_winter' : 'soft_summer';
    }
  } else {
    primary = 'soft_autumn'; // Default neutral to soft autumn
  }

  const seasonInfo = SEASON_NAMES[primary];

  return {
    primary,
    name: seasonInfo.name,
    subtitle: seasonInfo.subtitle,
    temperature,
    depth,
    contrast: photoAnalysis?.contrast as 'low' | 'medium' | 'high' || 'medium',
    saturation,
  };
}

function determineSilhouette(quizAnswers: QuizAnswers): PersonalStyleProfile['silhouette'] {
  const silhouetteAnswer = quizAnswers.body_type as string || 'hourglass';
  const normalizedAnswer = silhouetteAnswer.toLowerCase().replace(/[_-]/g, ' ');

  let silhouetteType: SilhouetteType = 'hourglass';
  if (normalizedAnswer.includes('pera') || normalizedAnswer.includes('tri')) silhouetteType = 'pear';
  else if (normalizedAnswer.includes('manzana') || normalizedAnswer.includes('apple')) silhouetteType = 'apple';
  else if (normalizedAnswer.includes('rectang') || normalizedAnswer.includes('rect')) silhouetteType = 'rectangle';
  else if (normalizedAnswer.includes('inv') || normalizedAnswer.includes('trianguloinv')) silhouetteType = 'inverted_triangle';
  else if (normalizedAnswer.includes('diamante')) silhouetteType = 'diamond';
  else if (normalizedAnswer.includes('oval')) silhouetteType = 'oval';
  else silhouetteType = 'hourglass';

  const silhouetteData = SILHOUETTE_DATA[silhouetteType];

  return {
    type: silhouetteType,
    name: silhouetteData.name,
    bodyShape: silhouetteData.bodyShape,
    recommendations: {
      favor: silhouetteData.favor,
      avoid: silhouetteData.avoid,
      necklines: silhouetteData.necklines,
      silhouettes: silhouetteData.silhouettes,
    },
  };
}

function determineLifestyle(quizAnswers: QuizAnswers): PersonalStyleProfile['lifestyle'] {
  // Parse occasions
  const occasionsRaw = quizAnswers.occasions as string[] | string || [];
  const occasionsArray = Array.isArray(occasionsRaw) ? occasionsRaw : [occasionsRaw];
  const occasions = occasionsArray.map((occ, idx) => ({
    type: mapOccasionString(occ),
    priority: 5 - idx, // First mentioned = highest priority
  }));

  // Parse budget
  const budgetRaw = quizAnswers.budget as string || 'medium';
  const budget = mapBudget(budgetRaw);

  // Parse wardrobe
  const existingPieces = parseListAnswer(quizAnswers.wardrobe_pieces as string);
  const existingColors = parseListAnswer(quizAnswers.wardrobe_colors as string);
  const gaps = detectWardrobeGaps(existingPieces);

  return {
    occasions,
    budget,
    wardrobeStatus: {
      existingPieces,
      existingColors,
      gaps,
    },
  };
}

function determineStyle(quizAnswers: QuizAnswers): PersonalStyleProfile['style'] {
  const styleAnswer = quizAnswers.style_description as string || 'classic';
  const desiredFeeling = quizAnswers.desired_feeling as string || 'segura';
  const referenceLooks = parseListAnswer(quizAnswers.reference_looks as string);

  let primary: StyleType = 'classic';
  const styleLower = styleAnswer.toLowerCase();

  if (styleLower.includes('dramat') || styleLower.includes('bold')) primary = 'dramatic';
  else if (styleLower.includes('romantic') || styleLower.includes('femen')) primary = 'romantic';
  else if (styleLower.includes('natural') || styleLower.includes('boho')) primary = 'natural';
  else if (styleLower.includes('glamour') || styleLower.includes('glam')) primary = 'glamorous';
  else if (styleLower.includes('minimal') || styleLower.includes('simple')) primary = 'minimalist';
  else if (styleLower.includes('elegant') || styleLower.includes('sofisti')) primary = 'elegant';
  else if (styleLower.includes('sport') || styleLower.includes('athle')) primary = 'sporty';
  else if (styleLower.includes('casual') || styleLower.includes('relaj')) primary = 'casual';
  else if (styleLower.includes('artistic') || styleLower.includes('avant')) primary = 'artistic';
  else if (styleLower.includes('prof') || styleLower.includes('offic')) primary = 'professional';
  else if (styleLower.includes('classic') || styleLower.includes('timeless')) primary = 'classic';

  return {
    primary,
    secondary: deriveSecondaryStyles(primary),
    desiredFeeling,
    referenceLooks,
  };
}

function determinePreferences(quizAnswers: QuizAnswers): PersonalStyleProfile['preferences'] {
  const metalAnswer = quizAnswers.metal_preference as string || 'both';
  let metal: MetalPreference = 'both';

  if (metalAnswer.includes('dorado') || metalAnswer.includes('oro')) metal = 'gold';
  else if (metalAnswer.includes('plata') || metalAnswer.includes('plateado')) metal = 'silver';
  else if (metalAnswer.includes('ambos') || metalAnswer.includes('los dos')) metal = 'both';
  else metal = 'neither';

  return {
    metal,
    styleAdjectives: parseListAnswer(quizAnswers.style_description as string),
  };
}

function determineGoals(quizAnswers: QuizAnswers): PersonalStyleProfile['goals'] {
  const primary = quizAnswers.desired_feeling as string || 'verse bien';
  const blockers: string[] = [];

  // Common blockers based on style description
  const styleDesc = quizAnswers.style_description as string || '';
  if (styleDesc.includes('no sé')) blockers.push('No sabe qué le queda');
  if (styleDesc.includes('miedo')) blockers.push('Miedo a equivocarse');

  return {
    primary,
    blockers,
  };
}

function calculatePrysmScore(photoAnalysis: SkinAnalysisResult | undefined, season: PersonalStyleProfile['colorimetry']['season']): number {
  let score = 7.5;

  if (photoAnalysis) {
    // Higher confidence from photos = higher score
    score += photoAnalysis.confidence * 2;
  }

  // Bonus for complete season data
  if (season.temperature && season.depth && season.contrast) {
    score += 0.5;
  }

  return Math.min(10, Math.max(5, score));
}

function mapOccasionString(occ: string): OccasionType {
  const lower = occ.toLowerCase();
  if (lower.includes('ofic') || lower.includes('trabaj')) return 'office';
  if (lower.includes('cit') || lower.includes('noche')) return 'date';
  if (lower.includes('viaj') || lower.includes('vacac')) return 'travel';
  if (lower.includes('event') || lower.includes('festa')) return 'event';
  if (lower.includes('deport') || lower.includes('gym')) return 'sport';
  return 'casual';
}

function mapBudget(budget: string): BudgetLevel {
  const lower = budget.toLowerCase();
  if (lower.includes('bajo') || lower.includes('1') || lower.includes('mín')) return 'low';
  if (lower.includes('alto') || lower.includes('4') || lower.includes('ilimitado')) return 'high';
  if (lower.includes('lujo') || lower.includes('5')) return 'luxury';
  return 'medium';
}

function parseListAnswer(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return value.split(/[,;]/).map(s => s.trim()).filter(Boolean);
}

function detectWardrobeGaps(pieces: string[]): string[] {
  const gaps: string[] = [];
  const piecesLower = pieces.map(p => p.toLowerCase());

  if (!piecesLower.some(p => p.includes('blazer') || p.includes('sastre'))) {
    gaps.push('Blazer o sak de constructor');
  }
  if (!piecesLower.some(p => p.includes('vestido'))) {
    gaps.push('Vestido versátil');
  }
  if (!piecesLower.some(p => p.includes('pantalon') || p.includes('jean'))) {
    gaps.push('Pantalón bien cortado');
  }

  return gaps;
}

function deriveSecondaryStyles(primary: StyleType): StyleType[] {
  const pairs: Record<StyleType, StyleType[]> = {
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

  return pairs[primary] || ['casual'];
}

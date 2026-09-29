/**
 * Season Configuration - Fuente centralizada de estaciones
 */

export type SeasonType =
  | 'deep_autumn' | 'soft_autumn' | 'warm_autumn'
  | 'deep_winter' | 'bright_winter' | 'cool_winter' | 'soft_winter'
  | 'bright_spring' | 'warm_spring' | 'light_spring' | 'soft_spring'
  | 'light_summer' | 'soft_summer' | 'cool_summer' | 'bright_summer';

export type SeasonGroup = 'spring' | 'summer' | 'autumn' | 'winter';

export interface SeasonInfo {
  id: SeasonType;
  name: string;
  nameEs: string;
  subtitle: string;
  group: SeasonGroup;
  temperature: 'warm' | 'cool';
  depth: 'light' | 'medium' | 'deep';
  contrast: 'low' | 'medium' | 'high';
  saturation: 'muted' | 'medium' | 'bright';
  description: string;
  recommendedColors: string[]; // HEX codes
  avoidColors: string[]; // HEX codes
}

export const SEASON_CONFIG: Record<SeasonType, SeasonInfo> = {
  // PRIMAVERAS
  bright_spring: {
    id: 'bright_spring',
    name: 'Bright Spring',
    nameEs: 'Primavera Brillante',
    subtitle: 'Bright Spring · Warm · Bright',
    group: 'spring',
    temperature: 'warm',
    depth: 'medium',
    contrast: 'high',
    saturation: 'bright',
    description: 'Los colores vibrantes y cálidos con alta saturación son tus aliados. Los tonos coral, melocotón y amarillo dorado iluminan tu rostro.',
    recommendedColors: ['FF6F61', 'FF7F50', 'FFA500', 'FFD700', 'F7C548', 'FFB347'],
    avoidColors: ['000080', '4B0082', '800080', '2F4F4F', '1C1C1C'],
  },
  warm_spring: {
    id: 'warm_spring',
    name: 'Warm Spring',
    nameEs: 'Primavera Cálida',
    subtitle: 'Warm Spring · Warm · Clear',
    group: 'spring',
    temperature: 'warm',
    depth: 'medium',
    contrast: 'medium',
    saturation: 'bright',
    description: 'Los tonos cálidos y luminosos complementan tu subtono dorado. Los verdes frescos y dorados radiantes te favorecen.',
    recommendedColors: ['FFB347', 'FFCC67', 'FFA500', 'DAA520', 'FF7F50', 'C19A6B'],
    avoidColors: ['000080', '4B0082', '800080', '2F4F4F', '000000'],
  },
  light_spring: {
    id: 'light_spring',
    name: 'Light Spring',
    nameEs: 'Primavera Clara',
    subtitle: 'Light Spring · Warm · Light',
    group: 'spring',
    temperature: 'warm',
    depth: 'light',
    contrast: 'low',
    saturation: 'medium',
    description: 'Los tonos claros y suaves con calidez natural son ideales. Los pasteles cálidos y el blanco crema te iluminan.',
    recommendedColors: ['FFB6C1', 'FFDAB9', 'FFF8DC', 'FAFAD2', 'FFEFD5', '98FB98'],
    avoidColors: ['000000', '4B0082', '800080', '8B0000', '2F4F4F'],
  },
  soft_spring: {
    id: 'soft_spring',
    name: 'Soft Spring',
    nameEs: 'Primavera Suave',
    subtitle: 'Soft Spring · Warm · Muted',
    group: 'spring',
    temperature: 'warm',
    depth: 'medium',
    contrast: 'low',
    saturation: 'muted',
    description: 'Los tonos muted cálidos con profundidad media favorecen tu look. Los verdes suaves y tierras claras son perfectos.',
    recommendedColors: ['C4B7A6', '9B8579', 'DEB887', 'A89F91', 'D2B48C', 'FA8072'],
    avoidColors: ['000000', 'FF0000', '00FF00', '0000FF', 'FF00FF'],
  },

  // VERANOS
  light_summer: {
    id: 'light_summer',
    name: 'Light Summer',
    nameEs: 'Verano Claro',
    subtitle: 'Light Summer · Cool · Light',
    group: 'summer',
    temperature: 'cool',
    depth: 'light',
    contrast: 'low',
    saturation: 'muted',
    description: 'Los tonos claros y suaves con subtonos fríos son ideales. Los azules pastel y lavandas suaves te favorecen.',
    recommendedColors: ['E6E6FA', 'D8BFD8', 'B0C4DE', 'ADD8E6', '87CEEB', 'F8F9F9'],
    avoidColors: ['DAA520', 'FF4500', '8B4513', 'CD853F', '000000'],
  },
  soft_summer: {
    id: 'soft_summer',
    name: 'Soft Summer',
    nameEs: 'Verano Suave',
    subtitle: 'Soft Summer · Cool · Muted',
    group: 'summer',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'low',
    saturation: 'muted',
    description: 'Los tonos muted fríos con profundidad media complementan tu paleta. Los grises rosados y verdes sage son ideales.',
    recommendedColors: ['C4B7A6', 'A89F91', '9B8579', 'B5A99A', '708090', '778899'],
    avoidColors: ['FFD700', 'FF4500', 'FF0000', '8B0000', '000000'],
  },
  cool_summer: {
    id: 'cool_summer',
    name: 'Cool Summer',
    nameEs: 'Verano Frío',
    subtitle: 'Cool Summer · Cool · Clear',
    group: 'summer',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'medium',
    saturation: 'bright',
    description: 'Los tonos fríos y claros con buena saturación son perfectos. Los azules medios y lavandas vibrantes te favorecen.',
    recommendedColors: ['4169E1', '708090', '778899', '87CEEB', '6495ED', '4682B4'],
    avoidColors: ['DAA520', 'FFA500', '8B4513', 'CD853F', 'FF4500'],
  },
  bright_summer: {
    id: 'bright_summer',
    name: 'Bright Summer',
    nameEs: 'Verano Brillante',
    subtitle: 'Bright Summer · Cool · Bright',
    group: 'summer',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'high',
    saturation: 'bright',
    description: 'Los tonos fríos y brillantes con alto contraste son ideales. Los azules intensos y fucsias vibrantes te favorecen.',
    recommendedColors: ['0000FF', 'FF69B4', 'FF1493', '00BFFF', '00CED1', '9400D3'],
    avoidColors: ['8B4513', 'A0522D', 'D2691E', 'CD853F', 'DAA520'],
  },

  // OTOÑOS
  deep_autumn: {
    id: 'deep_autumn',
    name: 'Deep Autumn',
    nameEs: 'Otoño Profundo',
    subtitle: 'Deep Autumn · Warm · Rich',
    group: 'autumn',
    temperature: 'warm',
    depth: 'deep',
    contrast: 'high',
    saturation: 'muted',
    description: 'Los tonos ricos y profundos con calidez terrosa son perfectos. Los ocres, sienas y verdes musgo complementan tu paleta.',
    recommendedColors: ['8B4513', 'D2691E', 'CD853F', '556B2F', '6B4423', '704214'],
    avoidColors: ['ADD8E6', '87CEEB', '98FB98', 'FFB6C1', '0000FF'],
  },
  soft_autumn: {
    id: 'soft_autumn',
    name: 'Soft Autumn',
    nameEs: 'Otoño Suave',
    subtitle: 'Soft Autumn · Warm · Muted',
    group: 'autumn',
    temperature: 'warm',
    depth: 'medium',
    contrast: 'low',
    saturation: 'muted',
    description: 'Los tonos muted cálidos con profundidad media son ideales. Los taupe, beige rosado y verdes sage te favorecen.',
    recommendedColors: ['C4B7A6', '9B8579', 'A89F91', 'B5A99A', '8B8075', '7A6F63'],
    avoidColors: ['000080', 'FF4500', 'FFD700', '00CED1', 'FF1493'],
  },
  warm_autumn: {
    id: 'warm_autumn',
    name: 'Warm Autumn',
    nameEs: 'Otoño Cálido',
    subtitle: 'Warm Autumn · Warm · Bright',
    group: 'autumn',
    temperature: 'warm',
    depth: 'medium',
    contrast: 'medium',
    saturation: 'bright',
    description: 'Los tonos cálidos y vibrantes complementan tu subtono dorado. Los naranjas queimados y dorados radiantes te favorecen.',
    recommendedColors: ['DAA520', 'CD853F', 'D2691E', 'B8860B', 'D2B48C', 'C19A6B'],
    avoidColors: ['87CEEB', 'ADD8E6', 'B0C4DE', 'E6E6FA', '000080'],
  },

  // INVIERNOS
  deep_winter: {
    id: 'deep_winter',
    name: 'Deep Winter',
    nameEs: 'Invierno Profundo',
    subtitle: 'Deep Winter · Cool · Rich',
    group: 'winter',
    temperature: 'cool',
    depth: 'deep',
    contrast: 'high',
    saturation: 'bright',
    description: 'Los tonos fríos, profundos y vibrantes son perfectos. Los azules oscuros, burdeos y negro puro complementan tu paleta.',
    recommendedColors: ['1C1C1C', '800020', '000080', '0F52BA', '800000', '2F4F4F'],
    avoidColors: ['F5DEB3', 'FFE4C4', 'DEB887', 'FFD700', 'FFA500'],
  },
  bright_winter: {
    id: 'bright_winter',
    name: 'Bright Winter',
    nameEs: 'Invierno Brillante',
    subtitle: 'Bright Winter · Cool · Bright',
    group: 'winter',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'high',
    saturation: 'bright',
    description: 'Los tonos fríos y brillantes con alto contraste son ideales. Los rojos vibrantes, azules eléctricos y blanco puro te favorecen.',
    recommendedColors: ['FF0000', '0000FF', 'FFFFFF', 'FF69B4', '00FFFF', 'FFD700'],
    avoidColors: ['F5DEB3', 'DEB887', 'D2B48C', 'C4B7A6', '8B8075'],
  },
  cool_winter: {
    id: 'cool_winter',
    name: 'Cool Winter',
    nameEs: 'Invierno Frío',
    subtitle: 'Cool Winter · Cool · Clear',
    group: 'winter',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'medium',
    saturation: 'bright',
    description: 'Los tonos fríos y claros con buena saturación complementan tu paleta. Los azules marino, berenjena y plata son perfectos.',
    recommendedColors: ['000080', '800020', '4169E1', '0000CD', '8B0000', 'C0C0C0'],
    avoidColors: ['FFD700', 'FFA500', 'FF4500', 'DAA520', 'CD853F'],
  },
  soft_winter: {
    id: 'soft_winter',
    name: 'Soft Winter',
    nameEs: 'Invierno Suave',
    subtitle: 'Soft Winter · Cool · Muted',
    group: 'winter',
    temperature: 'cool',
    depth: 'medium',
    contrast: 'low',
    saturation: 'muted',
    description: 'Los tonos fríos y muted con profundidad media son ideales. Los grises azulados y azules pastel profundos te favorecen.',
    recommendedColors: ['778899', '708090', '696969', '2F4F4F', '4A5568', '5B6B7C'],
    avoidColors: ['FFD700', 'FFA500', 'FF4500', 'DAA520', 'CD853F'],
  },
};

/**
 * Obtiene el grupo de estación (primavera, verano, otoño, invierno)
 */
export function getSeasonGroup(season: SeasonType): SeasonGroup {
  return SEASON_CONFIG[season]?.group || 'spring';
}

/**
 * Obtiene la configuración completa de una estación
 */
export function getSeasonInfo(season: SeasonType): SeasonInfo | null {
  return SEASON_CONFIG[season] || null;
}

/**
 * Valida que una estación sea válida
 */
export function isValidSeason(season: string): season is SeasonType {
  return season in SEASON_CONFIG;
}

/**
 * Mapea respuesta de GPT a tipo de estación
 */
export function mapGptSeasonToType(gptSeason: string): SeasonType | null {
  const lowerSeason = gptSeason.toLowerCase();

  if (lowerSeason.includes('primavera') || lowerSeason.includes('spring')) {
    if (lowerSeason.includes('brillante') || lowerSeason.includes('bright')) return 'bright_spring';
    if (lowerSeason.includes('cálida') || lowerSeason.includes('warm')) return 'warm_spring';
    if (lowerSeason.includes('clara') || lowerSeason.includes('light')) return 'light_spring';
    if (lowerSeason.includes('suave') || lowerSeason.includes('soft')) return 'soft_spring';
    return 'bright_spring'; // Default primavera
  }

  if (lowerSeason.includes('verano') || lowerSeason.includes('summer')) {
    if (lowerSeason.includes('brillante') || lowerSeason.includes('bright')) return 'bright_summer';
    if (lowerSeason.includes('fría') || lowerSeason.includes('frío') || lowerSeason.includes('cool')) return 'cool_summer';
    if (lowerSeason.includes('clara') || lowerSeason.includes('light')) return 'light_summer';
    if (lowerSeason.includes('suave') || lowerSeason.includes('soft')) return 'soft_summer';
    return 'cool_summer'; // Default verano
  }

  if (lowerSeason.includes('otoño') || lowerSeason.includes('autumn')) {
    if (lowerSeason.includes('profunda') || lowerSeason.includes('deep')) return 'deep_autumn';
    if (lowerSeason.includes('cálida') || lowerSeason.includes('warm')) return 'warm_autumn';
    if (lowerSeason.includes('suave') || lowerSeason.includes('soft')) return 'soft_autumn';
    return 'warm_autumn'; // Default otoño
  }

  if (lowerSeason.includes('invierno') || lowerSeason.includes('winter')) {
    if (lowerSeason.includes('profunda') || lowerSeason.includes('deep')) return 'deep_winter';
    if (lowerSeason.includes('brillante') || lowerSeason.includes('bright')) return 'bright_winter';
    if (lowerSeason.includes('fría') || lowerSeason.includes('frío') || lowerSeason.includes('cool')) return 'cool_winter';
    if (lowerSeason.includes('suave') || lowerSeason.includes('soft')) return 'soft_winter';
    return 'bright_winter'; // Default invierno
  }

  return null;
}

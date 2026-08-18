/**
 * Season Mapper Service
 * Maps undertone + depth to color season with full palette
 */

// Complete season mapping
const SEASON_MAP = {
  'warm|light': 'warm_spring',
  'warm|medium': 'deep_autumn',
  'warm|deep': 'deep_autumn',
  'cool|light': 'soft_summer',
  'cool|medium': 'deep_summer',
  'cool|deep': 'bright_winter',
  'neutral|light': 'neutral_spring',
  'neutral|medium': 'neutral_autumn',
  'neutral|deep': 'neutral_winter'
};

// Season definitions with names
const SEASONS = {
  'warm_spring': {
    id: 'warm_spring',
    name_es: 'Primavera Cálida',
    name_en: 'Warm Spring',
    temperature: 'warm',
    depth: 'light',
    description_es: 'Brillante y cálida. Tus colores tienen vida y energía.',
    description_en: 'Bright and warm. Your colors have life and energy.',
    characteristics: {
      undertone: 'Cálido (amarillo/dorado)',
      depth: 'Claro a medio',
      contrast: 'Medio a alto'
    }
  },
  'deep_autumn': {
    id: 'deep_autumn',
    name_es: 'Otoño Profundo',
    name_en: 'Deep Autumn',
    temperature: 'warm',
    depth: 'deep',
    description_es: 'Profunda y cálida. Colores ricos y terrosos que te hacen brillar.',
    description_en: 'Deep and warm. Rich, earthy colors that make you glow.',
    characteristics: {
      undertone: 'Cálido (dorado/áureo)',
      depth: 'Profundo a medio',
      contrast: 'Alto'
    }
  },
  'soft_summer': {
    id: 'soft_summer',
    name_es: 'Verano Suave',
    name_en: 'Soft Summer',
    temperature: 'cool',
    depth: 'light',
    description_es: 'Suave y fría. Colores dusty que complementan tu piel.',
    description_en: 'Soft and cool. Dusty colors that complement your skin.',
    characteristics: {
      undertone: 'Frío (azul/rosa)',
      depth: 'Claro a medio',
      contrast: 'Bajo a medio'
    }
  },
  'deep_summer': {
    id: 'deep_summer',
    name_es: 'Verano Profundo',
    name_en: 'Deep Summer',
    temperature: 'cool',
    depth: 'medium',
    description_es: 'Profunda y fría. Colores ricos sin ser demasiado vibrantes.',
    description_en: 'Deep and cool. Rich colors without being too vibrant.',
    characteristics: {
      undertone: 'Frío (azul/rosa)',
      depth: 'Medio a profundo',
      contrast: 'Medio'
    }
  },
  'bright_winter': {
    id: 'bright_winter',
    name_es: 'Invierno Brillante',
    name_en: 'Bright Winter',
    temperature: 'cool',
    depth: 'deep',
    description_es: 'Fría y brillante. Colores vibrantes de alto contraste.',
    description_en: 'Cool and bright. High contrast, vibrant colors.',
    characteristics: {
      undertone: 'Frío (azul)',
      depth: 'Medio a profundo',
      contrast: 'Muy alto'
    }
  },
  'neutral_spring': {
    id: 'neutral_spring',
    name_es: 'Primavera Neutra',
    name_en: 'Neutral Spring',
    temperature: 'neutral',
    depth: 'light',
    description_es: 'Equilibrada y cálida. Puedes usar colores cálidos y frescos.',
    description_en: 'Balanced and warm. You can wear both warm and cool colors.',
    characteristics: {
      undertone: 'Neutro',
      depth: 'Claro',
      contrast: 'Medio'
    }
  },
  'neutral_autumn': {
    id: 'neutral_autumn',
    name_es: 'Otoño Neutro',
    name_en: 'Neutral Autumn',
    temperature: 'neutral',
    depth: 'medium',
    description_es: 'Equilibrada y terrosa. Colores naturales que funcionan.',
    description_en: 'Balanced and earthy. Natural colors that work for you.',
    characteristics: {
      undertone: 'Neutro',
      depth: 'Medio',
      contrast: 'Medio'
    }
  },
  'neutral_winter': {
    id: 'neutral_winter',
    name_es: 'Invierno Neutro',
    name_en: 'Neutral Winter',
    temperature: 'neutral',
    depth: 'deep',
    description_es: 'Equilibrada y profunda. Colores intensos pero no cálidos.',
    description_en: 'Balanced and deep. Intense colors without warmth.',
    characteristics: {
      undertone: 'Neutro',
      depth: 'Profundo',
      contrast: 'Alto'
    }
  }
};

// Palettes by season (8 colors each)
const PALETTES = {
  'warm_spring': {
    protagonist: ['#E8A838', '#F5B041', '#F1948A'],
    secondary: ['#58D68D', '#F7DC6F', '#85C1E9'],
    neutral: ['#D4AC6E', '#B7950B', '#A04000'],
    accent: ['#EC7063', '#48C9B0', '#F39C12'],
    avoid: ['#85C1E9', '#AED6F1', '#D2B4DE', '#ABB2B9']
  },
  'deep_autumn': {
    protagonist: ['#B5691B', '#6E2C00', '#E07B39', '#C68642'],
    secondary: ['#2F4F1E', '#A0522D', '#8B4513'],
    neutral: ['#567568', '#6E2C00', '#4A2810'],
    accent: ['#C0392B', '#D4AC6E', '#CD6155'],
    avoid: ['#ADD8E6', '#FFB6C1', '#E6E6FA', '#87CEEB', '#98FB98']
  },
  'soft_summer': {
    protagonist: ['#9B8FA0', '#7A9E9F', '#C4A8B8', '#B8909A'],
    secondary: ['#8EAFC2', '#A89BB0', '#B8A9C9'],
    neutral: ['#B8B4BC', '#909090', '#7F7F7F'],
    accent: ['#D4A8B8', '#B8909A', '#C9A8B8'],
    avoid: ['#FF4500', '#FFD700', '#FF1493', '#000080', '#FF6347']
  },
  'deep_summer': {
    protagonist: ['#5D6D7E', '#34495E', '#7B7D7D', '#616A6B'],
    secondary: ['#85929E', '#2E4053', '#4A4A4A'],
    neutral: ['#283747', '#17202A', '#515A5A'],
    accent: ['#943126', '#6C3483', '#1A5276'],
    avoid: ['#F9E79F', '#FCF3CF', '#FADBD8', '#D4EFDF']
  },
  'bright_winter': {
    protagonist: ['#17202A', '#FFFFFF', '#E74C3C', '#3498DB'],
    secondary: ['#1C2833', '#B7950B', '#CB4335'],
    neutral: ['#000000', '#FDFEFE', '#ABB2B9'],
    accent: ['#F39C12', '#9B59B6', '#1ABC9C'],
    avoid: ['#FDEBD0', '#F5EEF8', '#EAFAF1', '#FAF0E6']
  },
  'neutral_spring': {
    protagonist: ['#F5B041', '#58D68D', '#F8C471'],
    secondary: ['#85C1E9', '#F1948A', '#A9DFBF'],
    neutral: ['#D4AC6E', '#B7950B', '#F7DC6F'],
    accent: ['#EC7063', '#48C9B0', '#F39C12'],
    avoid: ['#ABB2B9', '#5D6D7E', '#34495E']
  },
  'neutral_autumn': {
    protagonist: ['#B5691B', '#A04000', '#C68642', '#8B4513'],
    secondary: ['#6E2C00', '#2F4F1E', '#A0522D'],
    neutral: ['#567568', '#4A2810', '#7B3F00'],
    accent: ['#C0392B', '#D4AC6E', '#CD6155'],
    avoid: ['#ADD8E6', '#87CEEB', '#98FB98']
  },
  'neutral_winter': {
    protagonist: ['#17202A', '#1C2833', '#B7950B'],
    secondary: ['#FFFFFF', '#E74C3C', '#3498DB'],
    neutral: ['#000000', '#FDFEFE', '#ABB2B9'],
    accent: ['#F39C12', '#9B59B6', '#1ABC9C'],
    avoid: ['#FDEBD0', '#F5EEF8', '#EAFAF1', '#FAF0E6']
  }
};

/**
 * Get season from undertone and depth
 */
function getSeason(undertone, depth) {
  const key = `${undertone}|${depth}`;
  return SEASON_MAP[key] || 'neutral_autumn';
}

/**
 * Get full season data
 */
function getSeasonData(seasonId) {
  return SEASONS[seasonId] || SEASONS['neutral_autumn'];
}

/**
 * Get palette for season
 */
function getPalette(seasonId) {
  return PALETTES[seasonId] || PALETTES['deep_autumn'];
}

/**
 * Map analysis results to season
 */
function mapToSeason(analysis) {
  const { undertone, depth, saturation, contrast } = analysis;
  const seasonId = getSeason(undertone, depth);
  const season = getSeasonData(seasonId);
  const palette = getPalette(seasonId);

  return {
    season: {
      id: seasonId,
      name_es: season.name_es,
      name_en: season.name_en,
      temperature: season.temperature,
      depth: season.depth,
      description: season.description_es,
      characteristics: season.characteristics
    },
    palette,
    // Color names for display
    colorNames: getColorNames(seasonId)
  };
}

/**
 * Get descriptive color names for a season
 */
function getColorNames(seasonId) {
  const names = {
    'warm_spring': ['Durazno dorado', 'Verde esmeralda', 'Rosa coral', 'Amarillo sol', 'Azul turquesa'],
    'deep_autumn': ['Marrón chocolate', 'Rojo vino', 'Naranja ocre', 'Verde musgo', 'Dorado cobre'],
    'soft_summer': ['Lavanda dusty', 'Rosa dusty', 'Azul acero', 'Verde salvia', 'Gris perla'],
    'deep_summer': ['Azul navy', 'Gris grafito', 'Verde bosque', 'Burdeos', 'Rosa malva'],
    'bright_winter': ['Negro profundo', 'Blanco puro', 'Rojo carmesí', 'Azul eléctrico', 'Dorado brillante'],
    'neutral_spring': ['Durazno', 'Verde lima', 'Amarillo miel', 'Azul cielo', 'Rosa petal'],
    'neutral_autumn': ['Caramelo', 'Café tostado', 'Verde oliva', 'Rojo terracota', 'Mostaza'],
    'neutral_winter': ['Negro carb\u00f3n', 'Blanco optico', 'Rojo rubí', 'Azul cobalto', 'Plata']
  };
  return names[seasonId] || names['deep_autumn'];
}

/**
 * Calculate PRYSM score based on consistency
 */
function calculateScore(answers) {
  // Base score from quiz consistency
  let score = 8.5;

  // Increase for complete answers
  if (answers.skinTone) score += 0.2;
  if (answers.undertone) score += 0.2;
  if (answers.bodyType) score += 0.2;
  if (answers.style && answers.style.length >= 2) score += 0.3;

  // Cap at 9.9
  return Math.min(score, 9.9).toFixed(1);
}

module.exports = {
  getSeason,
  getSeasonData,
  getPalette,
  mapToSeason,
  getColorNames,
  calculateScore,
  SEASONS,
  PALETTES,
  SEASON_MAP
};

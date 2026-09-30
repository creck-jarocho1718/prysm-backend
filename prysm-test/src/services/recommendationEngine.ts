/**
 * Recommendation Engine
 * Generates personalized recommendations based on PersonalStyleProfile
 */

import { PersonalStyleProfile, OccasionType, StyleType, BudgetLevel } from './styleGenome';
import { testLog } from '../config';

// ============================================================================
// Types
// ============================================================================

export interface PersonalizedLook {
  occasion: string;
  occasionIcon: string;
  pieces: string;
  colors: string[];
  adaptForStyle?: string;
  adaptForBudget?: string;
}

export interface HairRecommendation {
  recommended: Array<{ name: string; hex: string; desc: string }>;
  avoid: Array<{ name: string; reason: string }>;
  cuts: string[];
}

export interface FabricRecommendation {
  name: string;
  desc: string;
}

export interface AccessoryRecommendation {
  category: string;
  recommendations: Array<{ name: string; desc: string }>;
}

// ============================================================================
// Look Templates by Occasion
// ============================================================================

interface LookTemplate {
  tops: string[];
  bottoms: string[];
  outerwear: string[];
  shoes: string[];
}

const LOOK_TEMPLATES: Record<OccasionType, LookTemplate> = {
  office: {
    tops: ['Blusa de seda', 'Camisa blanca', 'Blusa romántica', 'Top estructurado', 'Camiseta de cuello plano'],
    bottoms: ['Pantalón de vestir', 'Falda midi', 'Pantalón palazzo', 'Falda lápiz', 'Pantalón slim'],
    outerwear: ['Blazer clásico', 'Cardigan largo', 'Gabán camel', 'Blazer negro', 'Cárdigan estructurado'],
    shoes: ['Zapato de tacón', 'Mocasín elegante', 'Bailarina', 'Zapato plano', 'Botín bajo'],
  },
  date: {
    tops: ['Blusa satinada', 'Top halter', 'Body elegante', 'Blusa con detalle', 'Camisa holgada'],
    bottoms: ['Falda midi', 'Pantalón slim', 'Falda con movimiento', 'Pantalón de vestir', 'Falda con vuelito'],
    outerwear: ['Abrigo corto', 'Chaqueta de cuero', 'Chal de punto', 'Blazer femenino', 'Cardigan drapeado'],
    shoes: ['Tacón stiletto', 'Sandalia elegante', 'Botín con tacón', 'Zapato de tiras', 'Mule de tacón'],
  },
  casual: {
    tops: ['Camiseta básica', 'Suéter fino', 'Camisa holgada', 'Top holgado', 'Polo'],
    bottoms: ['Denim oscuro', 'Pantalón de pierna ancha', 'Leggings', 'Jogger elegante', 'Pantalón cargo'],
    outerwear: ['Chaqueta de mezclilla', 'Cardigan', 'Cazadora', 'Abrigo largo', 'Suéter holgado'],
    shoes: ['Sneakers blancas', 'Bailarina plana', 'Sandalia plana', 'Mocasín', 'Tenis limpios'],
  },
  event: {
    tops: ['Blusa protagonista', 'Top con detalles', 'Blusa de seda', 'Top brillante', 'Blusa con print'],
    bottoms: ['Pantalón de vestir', 'Falda midi elegante', 'Palazzo', 'Pantalón con brillo', 'Falda estructurado'],
    outerwear: ['Gaban largo', 'Abrigo elegante', 'Capa', 'Chaqueta estructurada', 'Blazer drapeado'],
    shoes: ['Tacón stiletto', 'Zapato metálico', 'Sandalia de tacón', 'Zapato charol', 'Botín elegante'],
  },
  travel: {
    tops: ['Camisa cómoda', 'Top fácil', 'Suéter fino', 'Camiseta de calidad', 'Blusa fluida'],
    bottoms: ['Denim oscuro', 'Pantalón cargo', 'Jogger de viaje', 'Pantalón convertible', 'Falda casual'],
    outerwear: ['Cazadora ligera', 'Cardigan', 'Impermeable', 'Abrigo plegable', 'Chaqueta de mezclilla'],
    shoes: ['Sneakers cómodas', 'Bailarina plana', 'Sandalia caminata', 'Mocasín de viaje', 'Zapato elástico'],
  },
  sport: {
    tops: ['Top deportivo', 'Camiseta técnica', 'Sports bra', 'Polo deportivo', 'Sudadera técnica'],
    bottoms: ['Leggings', 'Short deportivo', 'Pantalón jogger', 'Bike shorts', 'Track pants'],
    outerwear: ['Chaqueta deportiva', 'Cortavientos', 'Hoodie técnico', 'Chaleco deportivo', 'Forro polar'],
    shoes: ['Tenis running', 'Zapatillas deportivas', 'Tenis casual deportivo', 'Zapato crossfit', 'Sandalia sport'],
  },
};

// ============================================================================
// Style Adjectives for Look Personalization
// ============================================================================

const STYLE_ADJECTIVES: Record<StyleType, string[]> = {
  classic: ['clásico', 'atemporal', 'elegante', 'pulido', 'sofisticado'],
  romantic: ['femenino', 'delicado', 'suave', 'romántico', 'florido'],
  dramatic: ['impactante', 'audaz', 'poderoso', 'atrevido', 'dramático'],
  natural: ['relajado', 'casual', 'cómodo', 'auténtico', 'sin esfuerzo'],
  glamorous: ['lujoso', 'brillante', 'glamuroso', 'espléndido', 'estelar'],
  minimalist: ['limpio', 'simple', 'esencial', 'puro', 'sin adornos'],
  boho: ['bohemio', 'artístico', 'étereo', 'espíritu libre', 'artístico'],
  sporty: ['atlético', 'dinámico', 'enérgico', 'activo', 'funcional'],
  elegant: ['refinado', 'distinguido', 'grácil', 'sofisticado', 'noble'],
  casual: ['relajado', 'informal', 'cómodo', 'cómodo', 'natural'],
  artistic: ['vanguardista', 'experimental', 'artístico', 'único', 'creativo'],
  professional: ['corporativo', 'formal', 'profesional', 'serio', 'competente'],
};

// ============================================================================
// Budget Modifiers
// ============================================================================

const BUDGET_PIECE_MODIFIERS: Record<BudgetLevel, { quality: string[]; affordable: string[] }> = {
  low: {
    quality: ['básico de calidad', 'esencial bien cortado', 'versátil'],
    affordable: ['accesible', 'cómodo', 'funcional'],
  },
  medium: {
    quality: ['de buena calidad', 'con detalles', 'bien terminado'],
    affordable: ['excelente relación calidad-precio', 'versátil', 'cómodo'],
  },
  high: {
    quality: ['de alta calidad', 'bien cortado', 'con acabados premium'],
    affordable: ['buena inversión', 'atemporal', 'de diseñador'],
  },
  luxury: {
    quality: ['de lujo', 'de diseñador', 'exclusivo', 'premium'],
    affordable: ['inversión segura', 'piezas de colección', 'único'],
  },
};

// ============================================================================
// Hair Recommendations by Season
// ============================================================================

const HAIR_RECOMMENDATIONS: Record<string, HairRecommendation> = {
  autumn: {
    recommended: [
      { name: 'Castaño chocolate', hex: '#4A2810', desc: 'Base cálida, profundidad media' },
      { name: 'Rojo caoba', hex: '#7B3F00', desc: 'Acentúa el subtono cálido' },
      { name: 'Marrón cálido miel', hex: '#C68642', desc: 'Ilumina el rostro' },
    ],
    avoid: [
      { name: 'Negro azabache', reason: 'Contraste demasiado alto que apaga el rostro' },
      { name: 'Rubio cenizo', reason: 'Subtono frío contradice tu calidez natural' },
      { name: 'Rosa o lila', reason: 'Colores fríos que no favorecen tu tono' },
    ],
    cuts: ['Largo con capas suaves', 'Bob con volumen', 'Flequillo lateral', 'Ondas sueltas'],
  },
  winter: {
    recommended: [
      { name: 'Negro azabache', hex: '#0D0D0D', desc: 'Contraste máximo que define' },
      { name: 'Castaño oscuro', hex: '#3D2314', desc: 'Profundidad y definición' },
      { name: 'Rubio platino', hex: '#E5E4E2', desc: 'Moderno y desafiante' },
    ],
    avoid: [
      { name: 'Dorado o miel', reason: 'Subtono cálido que contradice tu frío' },
      { name: 'Rojo cobrizo', reason: 'Demasiada calidez para tu paleta' },
      { name: 'Rubio muy claro', reason: 'Falta contraste con tu piel' },
    ],
    cuts: ['Corte recto', 'Pixie corto', 'Largo lacio', 'Bob estructurado'],
  },
  spring: {
    recommended: [
      { name: 'Dorado miel', hex: '#DAA520', desc: 'Ilumina y calienta' },
      { name: 'Castaño claro', hex: '#A0522D', desc: 'Natural y luminoso' },
      { name: 'Rojo fresa', hex: '#9B111E', desc: 'Juguetón y cálido' },
    ],
    avoid: [
      { name: 'Negro', reason: 'Demasiado contraste para tu paleta suave' },
      { name: 'Gris cenizo', reason: 'Frío que apaga tu calidez' },
      { name: 'Azul o verde', reason: 'No hay contexto para estos tonos' },
    ],
    cuts: ['Largo con movimiento', 'Ondas suaves', 'Lob', 'Flequillo suave'],
  },
  summer: {
    recommended: [
      { name: 'Rubio arena', hex: '#C4B7A6', desc: 'Suave y natural' },
      { name: 'Castaño claro', hex: '#9B8579', desc: 'Versátil y fresco' },
      { name: 'Canas elegantes', hex: '#B5A99A', desc: 'Contraste suave perfecto' },
    ],
    avoid: [
      { name: 'Negro', reason: 'Demasiado contraste para tu paleta' },
      { name: 'Rojo vivo', reason: 'Sobresatura tu paleta suave' },
      { name: 'Naranja', reason: 'Demasiado brillante para tu tono' },
    ],
    cuts: ['Largo recto', 'Bob clásico', 'Ondas suaves', 'Lob redondeado'],
  },
};

// ============================================================================
// Fabric Recommendations
// ============================================================================

const FABRIC_RECOMMENDATIONS = {
  general: [
    { name: 'Algodón de calidad', desc: 'Fresco y estructurado' },
    { name: 'Seda natural', desc: 'Caída perfecta, luxe natural' },
    { name: 'Lino premium', desc: 'Elegante y casual' },
  ],
  autumn_winter: [
    { name: 'Punto pesado', desc: 'Cardigans con caída elegante' },
    { name: 'Cuero suave', desc: 'Para cinturones y bolsos' },
    { name: 'Terciopelo', desc: 'Para ocasiones especiales' },
  ],
  spring_summer: [
    { name: 'Gasa', desc: 'Liviano y femenino' },
    { name: 'Viscosa', desc: 'Caída fluida y cómoda' },
    { name: 'Lino puro', desc: 'Fresco para climas cálidos' },
  ],
};

// ============================================================================
// Accessory Recommendations
// ============================================================================

const ACCESSORY_RECOMMENDATIONS = {
  gold: {
    jewelry: [
      { name: 'Aretes dorado', desc: 'Aros colgantes de longitud media' },
      { name: 'Collar en V', desc: 'Alarga el cuello, cadena dorada' },
      { name: 'Pulsera charms', desc: 'Dorado cálido con detalles' },
    ],
    bags: [
      { name: 'Tote de cuero', desc: 'Formato amplio, asas cortas' },
      { name: 'Crossbody pequeña', desc: 'Cadena dorada con cuerpo de cuero' },
      { name: 'Clutch estructurada', desc: 'Para eventos formales' },
    ],
  },
  silver: {
    jewelry: [
      { name: 'Aretes plateados', desc: 'Geométricos y modernos' },
      { name: 'Collar minimalista', desc: 'Cadena fina plateada' },
      { name: 'Anillo protagonista', desc: 'Plateado con detalles' },
    ],
    bags: [
      { name: 'Clutch metálica', desc: 'Plateada para eventos' },
      { name: 'Crossbody canvas', desc: 'Con detalles plateados' },
      { name: 'Bolso de mano', desc: 'Plateado suave' },
    ],
  },
  both: {
    jewelry: [
      { name: 'Aretes mixtos', desc: 'Dorado y plateado combinados' },
      { name: 'Collar con mezcl', desc: 'Cadena dorada con dije plateado' },
      { name: 'Pulsera mixta', desc: 'Brazalete con ambos metales' },
    ],
    bags: [
      { name: 'Tote neutral', desc: 'Cuero en tono neutral' },
      { name: 'Clutch metalizada', desc: 'Metal neutral' },
      { name: 'Crossbody versátil', desc: 'Con detalles de ambos metales' },
    ],
  },
};

// ============================================================================
// Gender agreement for Spanish adjectives
// Adjectives in the tables above are stored in masculine form ("lujoso",
// "bien terminado"). When the piece noun is feminine ("Blusa", "Falda",
// "Chaqueta"...), feminize them: "Blusa satinada lujosa".
// ============================================================================

const FEMININE_PIECE_NOUNS = new Set([
  'blusa', 'camisa', 'camiseta', 'falda', 'chaqueta', 'sandalia', 'bailarina',
  'mule', 'capa', 'cazadora', 'sudadera', 'zapatilla', 'gabardina', 'tote', 'clutch',
]);

function feminizeAdjective(adj: string): string {
  return adj
    .split(' ')
    .map((w) => {
      if (/os$/i.test(w)) return w.slice(0, -2) + 'as';
      if (/o$/i.test(w)) return w.slice(0, -1) + 'a';
      return w;
    })
    .join(' ');
}

function agreeAdjective(piece: string, adj: string): string {
  const firstWord = (piece.split(' ')[0] || '').toLowerCase();
  if (FEMININE_PIECE_NOUNS.has(firstWord)) return feminizeAdjective(adj);
  return adj;
}

// ============================================================================
// Engine Functions
// ============================================================================

/**
 * Generate personalized looks based on profile
 */
export function generateLooks(profile: PersonalStyleProfile): PersonalizedLook[] {
  testLog.info('Generating personalized looks...');

  const { lifestyle, style, colorimetry, silhouette, preferences } = profile;

  // Get top 4 occasions by priority
  const topOccasions = lifestyle.occasions
    .sort((a, b) => b.priority - a.priority)
    .slice(0, 4);

  const looks: PersonalizedLook[] = topOccasions.map(occasion => {
    const template = LOOK_TEMPLATES[occasion.type];
    const styleAdjectives = STYLE_ADJECTIVES[style.primary] || STYLE_ADJECTIVES.classic;
    const budgetMod = BUDGET_PIECE_MODIFIERS[lifestyle.budget];

    // Select random pieces from template
    const selectPiece = (pieces: string[]) =>
      pieces[Math.floor(Math.random() * pieces.length)];

    const top = selectPiece(template.tops);
    const bottom = selectPiece(template.bottoms);
    const outer = selectPiece(template.outerwear);
    const shoe = selectPiece(template.shoes);

    // Build pieces string with style adjectives - natural Spanish order
    // Adjective goes AFTER the piece ("Blusa de seda refinada") and agrees
    // in gender with it ("Blusa satinada lujosa", "Chaqueta de cuero bien terminada")
    const piecesArray = [top, bottom, outer, shoe];
    const piecesString = piecesArray
      .map((p, i) => {
        // For first piece (top), use style adjective; for others, use budget quality
        const adj = i === 0
          ? styleAdjectives[Math.floor(Math.random() * styleAdjectives.length)]
          : budgetMod.quality[Math.floor(Math.random() * budgetMod.quality.length)];
        return `${p} ${agreeAdjective(p, adj)}`;
      })
      .join(' · ');

    // Select colors from palette
    const paletteColors = [
      ...colorimetry.palette.protagonist,
      ...colorimetry.palette.secondary,
      ...colorimetry.palette.accent,
    ];
    // Extract hex values from ColorObject array to get string array
    const selectedColors = paletteColors.slice(0, 4).map(c => c.hex);

    // Occasion icons
    const icons: Record<OccasionType, string> = {
      office: '✦',
      date: '♥',
      casual: '☀',
      event: '★',
      travel: '✈',
      sport: '⚡',
    };

    return {
      occasion: getOccasionName(occasion.type),
      occasionIcon: icons[occasion.type] || '✦',
      pieces: piecesString,
      colors: selectedColors,
      adaptForStyle: `${styleAdjectives[0]} con toque ${styleAdjectives[1] || styleAdjectives[0]}`,
      adaptForBudget: `${budgetMod.quality[0]}, ${budgetMod.affordable[0]}`,
    };
  });

  testLog.info('Generated looks:', looks);
  return looks;
}

/**
 * Generate hair recommendations
 */
export function generateHairRecommendations(profile: PersonalStyleProfile): HairRecommendation {
  const season = profile.colorimetry.season.primary;

  // Determine season group
  let group = 'autumn';
  if (season.includes('winter')) group = 'winter';
  else if (season.includes('spring')) group = 'spring';
  else if (season.includes('summer')) group = 'summer';

  return HAIR_RECOMMENDATIONS[group];
}

/**
 * Generate fabric recommendations
 */
export function generateFabricRecommendations(profile: PersonalStyleProfile): FabricRecommendation[] {
  const season = profile.colorimetry.season.primary;
  const general = FABRIC_RECOMMENDATIONS.general;

  let specific: FabricRecommendation[] = [];
  if (season.includes('autumn') || season.includes('winter')) {
    specific = FABRIC_RECOMMENDATIONS.autumn_winter;
  } else {
    specific = FABRIC_RECOMMENDATIONS.spring_summer;
  }

  return [...general.slice(0, 3), ...specific.slice(0, 3)].slice(0, 5);
}

/**
 * Generate accessory recommendations
 */
export function generateAccessoryRecommendations(profile: PersonalStyleProfile): AccessoryRecommendation[] {
  const metal = profile.preferences.metal;
  const metalRecs = ACCESSORY_RECOMMENDATIONS[metal] || ACCESSORY_RECOMMENDATIONS.both;

  return [
    {
      category: 'Joyería',
      recommendations: metalRecs.jewelry,
    },
    {
      category: 'Bolsos',
      recommendations: metalRecs.bags,
    },
  ];
}

/**
 * Generate complete recommendations for PDF
 */
export function generateCompleteRecommendations(profile: PersonalStyleProfile) {
  return {
    looks: generateLooks(profile),
    hair: generateHairRecommendations(profile),
    fabrics: generateFabricRecommendations(profile),
    accessories: generateAccessoryRecommendations(profile),
  };
}

// ============================================================================
// Helper Functions
// ============================================================================

function getOccasionName(type: OccasionType): string {
  const names: Record<OccasionType, string> = {
    office: 'Oficina',
    date: 'Citas',
    casual: 'Día a día',
    event: 'Eventos',
    travel: 'Viajes',
    sport: 'Deportivo',
  };
  return names[type] || type;
}

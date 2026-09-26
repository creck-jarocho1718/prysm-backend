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

// Color object with full information from GPT analysis
export interface ColorObject {
  hex: string;
  nombre: string;
  explicacion: string;
}

// Palette type that stores full color objects
export interface PaletteColors {
  protagonist: ColorObject[];
  secondary: ColorObject[];
  accent: ColorObject[];
  neutral: ColorObject[];
  avoid: ColorObject[];
}

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
    palette: PaletteColors;
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

// Helper to create ColorObject from hex
const color = (hex: string, nombre: string, explicacion: string): ColorObject => ({ hex, nombre, explicacion });

const SEASON_PALETTES: Record<SeasonType, PaletteColors> = {
  deep_autumn: {
    protagonist: [
      color('#8B4513', 'Marrón Suela', 'Tono cálido profundo'),
      color('#D2691E', 'Chocolate', 'Rico y versátil'),
      color('#CD853F', 'Perú', 'Cálido y terroso'),
    ],
    secondary: [
      color('#556B2F', 'Verde Oliva', 'Complementa tonos cálidos'),
      color('#6B4423', 'Marrón Oscuro', 'Añade profundidad'),
      color('#704214', 'Marrón Canela', 'Versátil'),
    ],
    accent: [
      color('#DAA520', 'Dorado', 'Acento cálido luminoso'),
      color('#B8860B', 'Oro Oscuro', 'Sofisticado'),
      color('#D2691E', 'Chocolate', 'Rico y profundo'),
    ],
    neutral: [
      color('#4A3728', 'Marrón Café', 'Base elegante'),
      color('#5D4E37', 'Beige Oscuro', 'Versátil y sofisticado'),
      color('#3D2914', 'Marrón Profundo', 'Añade contraste'),
    ],
    avoid: [
      color('#ADD8E6', 'Azul Claro', 'Tono frío que puede competir'),
      color('#87CEEB', 'Azul Cielo', 'Demasiado frío'),
      color('#98FB98', 'Verde Claro', 'Tono pastel que no complementa'),
      color('#FFB6C1', 'Rosa Claro', 'Demasiado frío para subtonos cálidos'),
    ],
  },
  soft_autumn: {
    protagonist: [
      color('#C4B7A6', 'Gris Topo', 'Tono muted cálido'),
      color('#9B8579', 'Marrón Rosado', 'Suave y armonioso'),
      color('#A89F91', 'Taupe', 'Versátil y sofisticado'),
    ],
    secondary: [
      color('#B5A99A', 'Marrón Sandía', 'Cálido y suave'),
      color('#8B7D6B', 'Marrón Taupe', 'Terroso'),
      color('#A39080', 'Beige Grisé', 'Neutro cálido'),
    ],
    accent: [
      color('#D4A574', 'Melocotón', 'Dulce y cálido'),
      color('#C49A6C', 'Cobre Suave', 'Acento luminoso'),
      color('#B8956E', 'Miel', 'Dorado apagado'),
    ],
    neutral: [
      color('#8B8075', 'Gris Cálido', 'Base neutra'),
      color('#7A6F63', 'Taupe Oscuro', 'Versátil'),
      color('#6B6154', 'Marrón Medio', 'Profundidad suave'),
    ],
    avoid: [
      color('#000080', 'Azul Marino', 'Demasiado frío'),
      color('#FF4500', 'Rojo Naranja', 'Demasiado saturado'),
      color('#FFD700', 'Dorado Brillante', 'Muy intenso'),
      color('#00CED1', 'Turquesa', 'Frío y brillante'),
    ],
  },
  warm_autumn: {
    protagonist: [
      color('#DAA520', 'Dorado', 'Cálido y radiante'),
      color('#CD853F', 'Perú', 'Terroso y luminoso'),
      color('#D2691E', 'Chocolate', 'Rico y profundo'),
    ],
    secondary: [
      color('#B8860B', 'Oro Oscuro', 'Suntuoso'),
      color('#D2B48C', 'Tan', 'Versátil'),
      color('#C19A6B', 'Camel', 'Clásico otoñal'),
    ],
    accent: [
      color('#F4A460', 'Arena', 'Cálido brillante'),
      color('#E97451', 'Terracota', 'Vibrante'),
      color('#D2691E', 'Chocolate', 'Fondo cálido'),
    ],
    neutral: [
      color('#8B7355', 'Marrón Taupe', 'Base elegante'),
      color('#6B5344', 'Marrón Medio', 'Versátil'),
      color('#5D4E37', 'Beige Oscuro', 'Sofisticado'),
    ],
    avoid: [
      color('#87CEEB', 'Azul Cielo', 'Demasiado frío'),
      color('#ADD8E6', 'Azul Claro', 'Frío pastel'),
      color('#B0C4DE', 'Azul Perla', 'Frío'),
      color('#E6E6FA', 'Lavanda', 'Frío y claro'),
    ],
  },
  deep_winter: {
    protagonist: [
      color('#1C1C1C', 'Negro Profundo', 'Presencia máxima'),
      color('#800020', 'Burdeos', 'Rico y elegante'),
      color('#0F52BA', 'Azul Zafiro', 'Intenso y frío'),
    ],
    secondary: [
      color('#000080', 'Azul Marino', 'Clásico invierno'),
      color('#800000', 'Rojo Oscuro', 'Drama'),
      color('#2F4F4F', 'Verde Azulado', 'Profundo'),
    ],
    accent: [
      color('#C0C0C0', 'Plata', 'Metal frío'),
      color('#E5E4E2', 'Platino', 'Luminoso'),
      color('#FFD700', 'Dorado Brillante', 'Contraste cálido'),
    ],
    neutral: [
      color('#2F4F4F', 'Verde Azulado', 'Base oscura'),
      color('#36454F', 'Carbón', 'Versátil oscuro'),
      color('#1C2833', 'Negro Azulado', 'Profundidad'),
    ],
    avoid: [
      color('#F5DEB3', 'Trigo', 'Demasiado cálido'),
      color('#FFE4C4', 'Melocotón Claro', 'Frío conflictivo'),
      color('#DEB887', 'Beige', 'Demasiado claro'),
      color('#D2B48C', 'Tan', 'Cálido incorrecto'),
    ],
  },
  bright_winter: {
    protagonist: [
      color('#FF0000', 'Rojo Brillante', 'Intenso y llamativo'),
      color('#0000FF', 'Azul Brillante', 'Frío puro'),
      color('#FFFFFF', 'Blanco Puro', 'Luminosidad máxima'),
    ],
    secondary: [
      color('#FF69B4', 'Rosa Brillante', 'Vibrante'),
      color('#00FFFF', 'Cian', 'Neón frío'),
      color('#9400D3', 'Púrpura', 'Drama'),
    ],
    accent: [
      color('#FFD700', 'Dorado', 'Contraste'),
      color('#00FF00', 'Verde Neón', 'Impacto'),
      color('#FF1493', 'Magenta', 'Vibrante'),
    ],
    neutral: [
      color('#000000', 'Negro', 'Base máxima'),
      color('#333333', 'Gris Oscuro', 'Versátil'),
      color('#1C1C1C', 'Negro Carbón', 'Presencia'),
    ],
    avoid: [
      color('#F5DEB3', 'Trigo', 'Demasiado cálido'),
      color('#DEB887', 'Beige', 'Opaco'),
      color('#D2B48C', 'Tan', 'Sin contraste'),
      color('#FFE4C4', 'Bisque', 'Muy suave'),
    ],
  },
  cool_winter: {
    protagonist: [
      color('#000080', 'Azul Marino', 'Clásico frío'),
      color('#800020', 'Burdeos', 'Sofisticado'),
      color('#4169E1', 'Azul Real', 'Intenso'),
    ],
    secondary: [
      color('#0000CD', 'Azul Medio', 'Fresco'),
      color('#8B0000', 'Rojo Oscuro', 'Drama frío'),
      color('#2F4F4F', 'Verde Azulado', 'Profundo'),
    ],
    accent: [
      color('#C0C0C0', 'Plata', 'Metal ideal'),
      color('#87CEEB', 'Azul Cielo', 'Claro frío'),
      color('#B0C4DE', 'Azul Perla', 'Delicado'),
    ],
    neutral: [
      color('#1C1C1C', 'Negro', 'Base'),
      color('#333333', 'Gris Oscuro', 'Versátil'),
      color('#2F4F4F', 'Verde Azulado', 'Complemento'),
    ],
    avoid: [
      color('#FFD700', 'Dorado', 'Muy cálido'),
      color('#FFA500', 'Naranja', 'Cálido incorrecto'),
      color('#FF4500', 'Rojo Naranja', 'Cálido'),
      color('#DAA520', 'Dorado', 'Cálido'),
    ],
  },
  soft_winter: {
    protagonist: [
      color('#778899', 'Gris Pizarra', 'Suave frío'),
      color('#708090', 'Gris Acero', 'Muted frío'),
      color('#696969', 'Gris Dim', 'Discreto'),
    ],
    secondary: [
      color('#2F4F4F', 'Verde Azulado', 'Profundo suave'),
      color('#4A5568', 'Gris Azulado', 'Versátil'),
      color('#5B6B7C', 'Azul Grisáceo', 'Frío suave'),
    ],
    accent: [
      color('#B0C4DE', 'Azul Perla', 'Claro'),
      color('#87CEEB', 'Azul Cielo', 'Luminoso'),
      color('#ADD8E6', 'Azul Claro', 'Pastel frío'),
    ],
    neutral: [
      color('#36454F', 'Carbón', 'Base'),
      color('#2F4F4F', 'Verde Azulado', 'Complemento'),
      color('#1C2833', 'Negro Azulado', 'Profundidad'),
    ],
    avoid: [
      color('#FFD700', 'Dorado', 'Muy cálido'),
      color('#FFA500', 'Naranja', 'Cálido'),
      color('#FF4500', 'Rojo Naranja', 'Intenso cálido'),
      color('#DAA520', 'Dorado', 'Cálido'),
    ],
  },
  bright_spring: {
    protagonist: [
      color('#FF6B35', 'Coral Naranja', 'Vibrante cálido'),
      color('#F7C548', 'Amarillo Dorado', 'Radiante'),
      color('#00BFFF', 'Azul Cielo', 'Fresco cálido'),
    ],
    secondary: [
      color('#FF8C00', 'Naranja', 'Brillante'),
      color('#FFD700', 'Dorado', 'Luminoso'),
      color('#00CED1', 'Turquesa', 'Fresco'),
    ],
    accent: [
      color('#FF69B4', 'Rosa Brillante', 'Vibrante'),
      color('#32CD32', 'Verde Lima', 'Fresco'),
      color('#FF6347', 'Rojo Tomate', 'Energético'),
    ],
    neutral: [
      color('#F5DEB3', 'Trigo', 'Claro cálido'),
      color('#FAFAD2', 'Crema Claro', 'Luminoso'),
      color('#FFEFD5', 'Papaya', 'Suave'),
    ],
    avoid: [
      color('#4B0082', 'Índigo', 'Muy oscuro'),
      color('#800080', 'Púrpura', 'Frío'),
      color('#2F4F4F', 'Verde Azulado', 'Oscuro frío'),
    ],
  },
  warm_spring: {
    protagonist: [
      color('#FFB347', 'Melocotón', 'Cálido luminoso'),
      color('#FFCC67', 'Amarillo Miel', 'Radiante'),
      color('#F5DEB3', 'Trigo', 'Suave cálido'),
    ],
    secondary: [
      color('#DEB887', 'Beige Arena', 'Versátil'),
      color('#D2B48C', 'Tan', 'Clásico'),
      color('#C19A6B', 'Camel', 'Elegante'),
    ],
    accent: [
      color('#FF7F50', 'Coral', 'Vibrante'),
      color('#FFA07A', 'Salmón', 'Suave'),
      color('#E9967A', 'Salmón Oscuro', 'Cálido'),
    ],
    neutral: [
      color('#8B7355', 'Marrón Taupe', 'Base'),
      color('#A0826D', 'Marrón Rosado', 'Suave'),
      color('#7A6B5A', 'Beige Cálido', 'Versátil'),
    ],
    avoid: [
      color('#000080', 'Azul Marino', 'Muy frío'),
      color('#4B0082', 'Índigo', 'Frío'),
      color('#800080', 'Púrpura', 'Frío'),
      color('#2F4F4F', 'Verde Azulado', 'Oscuro frío'),
    ],
  },
  light_spring: {
    protagonist: [
      color('#FFB6C1', 'Rosa Claro', 'Delicado cálido'),
      color('#98FB98', 'Verde Menta', 'Fresco claro'),
      color('#87CEEB', 'Azul Cielo', 'Luminoso'),
    ],
    secondary: [
      color('#FFDAB9', 'Melocotón Pálido', 'Suave'),
      color('#E6E6FA', 'Lavanda', 'Claro'),
      color('#FFA07A', 'Salmón Claro', 'Cálido'),
    ],
    accent: [
      color('#00CED1', 'Turquesa Claro', 'Vibrante'),
      color('#FF69B4', 'Rosa Brillante', 'Acento'),
      color('#98FB98', 'Verde Menta', 'Fresco'),
    ],
    neutral: [
      color('#FFF8DC', 'Crema', 'Base clara'),
      color('#FFEFD5', 'Papaya', 'Suave'),
      color('#FAFAD2', 'Crema Claro', 'Luminoso'),
    ],
    avoid: [
      color('#4B0082', 'Índigo', 'Muy oscuro'),
      color('#800080', 'Púrpura', 'Frío'),
      color('#2F4F4F', 'Verde Oscuro', 'Opaco'),
      color('#1C1C1C', 'Negro', 'Muy oscuro'),
    ],
  },
  soft_spring: {
    protagonist: [
      color('#F0E68C', 'Amarillo Canario', 'Suave cálido'),
      color('#DEB887', 'Beige Arena', 'Muted'),
      color('#D8BFD8', 'Ciruela', 'Suave'),
    ],
    secondary: [
      color('#FFDAB9', 'Melocotón Pálido', 'Cálido'),
      color('#E6E6FA', 'Lavanda', 'Claro'),
      color('#B0E0E6', 'Azul Pulso', 'Fresco'),
    ],
    accent: [
      color('#98FB98', 'Verde Menta', 'Fresco'),
      color('#FFB6C1', 'Rosa Claro', 'Delicado'),
      color('#87CEEB', 'Azul Cielo', 'Luminoso'),
    ],
    neutral: [
      color('#F5F5DC', 'Beige', 'Base'),
      color('#FFFAF0', 'Marfil', 'Claro'),
      color('#FFF8DC', 'Crema', 'Suave'),
    ],
    avoid: [
      color('#000080', 'Azul Marino', 'Muy frío'),
      color('#4B0082', 'Índigo', 'Oscuro'),
      color('#800080', 'Púrpura', 'Frío'),
      color('#1C1C1C', 'Negro', 'Muy oscuro'),
    ],
  },
  light_summer: {
    protagonist: [
      color('#E6E6FA', 'Lavanda', 'Suave frío'),
      color('#D8BFD8', 'Ciruela', 'Delicado'),
      color('#B0C4DE', 'Azul Perla', 'Claro'),
    ],
    secondary: [
      color('#D6EAF8', 'Azul Cielo', 'Luminoso'),
      color('#D5DBDB', 'Gris Claro', 'Neutro'),
      color('#F2F3F4', 'Blanco Grisáceo', 'Suave'),
    ],
    accent: [
      color('#85C1E9', 'Azul Claro', 'Fresco'),
      color('#AED6F1', 'Azul Pálido', 'Delicado'),
      color('#A9CCE3', 'Azul Grisáceo', 'Muted'),
    ],
    neutral: [
      color('#F8F9F9', 'Blanco Suave', 'Base'),
      color('#FDFEFE', 'Blanco Puro', 'Claro'),
      color('#FBFCFC', 'Blanco Azulado', 'Frío'),
    ],
    avoid: [
      color('#DAA520', 'Dorado', 'Muy cálido'),
      color('#CD853F', 'Perú', 'Cálido'),
      color('#8B4513', 'Marrón Suela', 'Oscuro cálido'),
      color('#D2691E', 'Chocolate', 'Cálido profundo'),
    ],
  },
  soft_summer: {
    protagonist: [
      color('#C4B7A6', 'Gris Topo', 'Muted cálido'),
      color('#A89F91', 'Taupe', 'Versátil'),
      color('#9B8579', 'Marrón Rosado', 'Suave'),
    ],
    secondary: [
      color('#B5A99A', 'Marrón Sandía', 'Cálido'),
      color('#CDC0B0', 'Beige Rosado', 'Suave'),
      color('#C8C0B8', 'Gris Béige', 'Neutro'),
    ],
    accent: [
      color('#9B8579', 'Marrón Rosado', 'Acento cálido'),
      color('#A89080', 'Taupe Dorado', 'Muted'),
      color('#B8A090', 'Beige Cálido', 'Suave'),
    ],
    neutral: [
      color('#8B8075', 'Gris Cálido', 'Base'),
      color('#7A6F63', 'Taupe Oscuro', 'Versátil'),
      color('#6B6154', 'Marrón Medio', 'Profundidad'),
    ],
    avoid: [
      color('#FFD700', 'Dorado', 'Muy brillante'),
      color('#FF4500', 'Rojo Naranja', 'Intenso'),
      color('#000080', 'Azul Marino', 'Muy oscuro'),
      color('#4B0082', 'Índigo', 'Frío oscuro'),
    ],
  },
  cool_summer: {
    protagonist: [
      color('#708090', 'Gris Acero', 'Frío medio'),
      color('#778899', 'Gris Pizarra', 'Muted frío'),
      color('#636363', 'Gris Medio', 'Neutro'),
    ],
    secondary: [
      color('#2F4F4F', 'Verde Azulado', 'Profundo'),
      color('#4A5568', 'Gris Azulado', 'Versátil'),
      color('#5B6B7C', 'Azul Grisáceo', 'Frío'),
    ],
    accent: [
      color('#87CEEB', 'Azul Cielo', 'Claro'),
      color('#ADD8E6', 'Azul Claro', 'Fresco'),
      color('#B0C4DE', 'Azul Perla', 'Delicado'),
    ],
    neutral: [
      color('#36454F', 'Carbón', 'Base'),
      color('#2F4F4F', 'Verde Azulado', 'Complemento'),
      color('#1C2833', 'Negro Azulado', 'Profundidad'),
    ],
    avoid: [
      color('#DAA520', 'Dorado', 'Muy cálido'),
      color('#FFA500', 'Naranja', 'Cálido'),
      color('#FF4500', 'Rojo Naranja', 'Intenso cálido'),
      color('#CD853F', 'Perú', 'Cálido'),
    ],
  },
  bright_summer: {
    protagonist: [
      color('#00BFFF', 'Azul Cielo Brillante', 'Luminoso frío'),
      color('#FF69B4', 'Rosa Brillante', 'Vibrante'),
      color('#FF1493', 'Magenta', 'Impacto'),
    ],
    secondary: [
      color('#00CED1', 'Turquesa', 'Fresco'),
      color('#FF6B6B', 'Coral Rojo', 'Energético'),
      color('#9B59B6', 'Púrpura', 'Drama'),
    ],
    accent: [
      color('#F39C12', 'Naranja Brillante', 'Contraste'),
      color('#1ABC9C', 'Verde Menta', 'Fresco'),
      color('#E74C3C', 'Rojo Coral', 'Vibrante'),
    ],
    neutral: [
      color('#FFFFFF', 'Blanco Puro', 'Base luminosa'),
      color('#F8F9F9', 'Blanco Suave', 'Claro'),
      color('#ECF0F1', 'Gris Muy Claro', 'Neutro'),
    ],
    avoid: [
      color('#8B4513', 'Marrón Suela', 'Muy cálido'),
      color('#A0522D', 'Siena', 'Cálido'),
      color('#D2691E', 'Chocolate', 'Profundo cálido'),
      color('#CD853F', 'Perú', 'Terroso'),
    ],
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
    favor: ['Cintura suelta', 'Piezas que fluyen', 'Escotes que alargan'],
    avoid: ['Ropa ajustada en medio', 'Cinturones en cintura', 'Tejidos rígidos'],
    necklines: ['V profundo', 'Deshalf', 'Columnas verticales'],
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
    necklines: ['V', 'Deshalf', 'Asimétrica'],
    silhouettes: ['Fit and flare', 'Trapecio', 'Piezas con movimiento'],
  },
  oval: {
    name: 'Oval',
    bodyShape: 'Curvilínea suave',
    favor: ['Cintura suelta o alta', 'Piezas con estructura', 'Líneas verticales'],
    avoid: ['Ropa muy ajustada', 'Estampados grandes', 'Tejidos muy finos'],
    necklines: ['V', 'Columna', 'Deshalf alto'],
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

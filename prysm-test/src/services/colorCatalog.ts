/**
 * Color Catalog - Fuente única de verdad para colores
 * HEX es la clave principal, nombres son oficiales del catálogo
 */

import { SEASON_CONFIG } from './seasonConfig';

export type ColorTemperature = 'warm' | 'cool' | 'neutral' | 'warm-neutral' | 'cool-neutral';
export type ColorFamily =
  | 'red' | 'orange' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'brown'
  | 'gray' | 'white' | 'black' | 'beige' | 'coral' | 'teal' | 'olive' | 'burgundy';

export interface CatalogColor {
  hex: string;
  name: string;
  nameEs: string;
  temperature: ColorTemperature;
  family: ColorFamily;
  seasonCompatibility: SeasonType[];
  description?: string;
}

export type SeasonType =
  | 'deep_autumn' | 'soft_autumn' | 'warm_autumn'
  | 'deep_winter' | 'bright_winter' | 'cool_winter' | 'soft_winter'
  | 'bright_spring' | 'warm_spring' | 'light_spring' | 'soft_spring'
  | 'light_summer' | 'soft_summer' | 'cool_summer' | 'bright_summer';

// Catálogo maestro de colores - HEX es la clave
export const COLOR_CATALOG: Record<string, CatalogColor> = {
  // ROJOS
  'FF0000': { hex: 'FF0000', name: 'Red', nameEs: 'Rojo', temperature: 'warm', family: 'red', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Rojo puro y vibrante' },
  'C41E3A': { hex: 'C41E3A', name: 'Cardinal', nameEs: 'Rojo Cardinal', temperature: 'warm', family: 'red', seasonCompatibility: ['deep_autumn', 'deep_winter', 'bright_winter'], description: 'Rojo profundo con matiz azulado' },
  '990000': { hex: '990000', name: 'Dark Red', nameEs: 'Rojo Oscuro', temperature: 'warm', family: 'red', seasonCompatibility: ['deep_autumn', 'deep_winter'], description: 'Rojo intenso y dramático' },
  'FF6347': { hex: 'FF6347', name: 'Tomato', nameEs: 'Rojo Tomate', temperature: 'warm', family: 'coral', seasonCompatibility: ['bright_spring', 'warm_spring', 'warm_autumn'], description: 'Rojo cálido con naranja' },
  'DC143C': { hex: 'DC143C', name: 'Crimson', nameEs: 'Carmesí', temperature: 'warm', family: 'red', seasonCompatibility: ['bright_winter', 'deep_winter', 'bright_spring'], description: 'Rojo brillante y vivo' },
  'B22222': { hex: 'B22222', name: 'Firebrick', nameEs: 'Rojo Ladrillo', temperature: 'warm', family: 'red', seasonCompatibility: ['deep_autumn', 'deep_winter'], description: 'Rojo terroso y profundo' },
  '8B0000': { hex: '8B0000', name: 'Dark Red', nameEs: 'Rojo Granate', temperature: 'cool', family: 'red', seasonCompatibility: ['deep_winter', 'cool_winter', 'deep_autumn'], description: 'Rojo oscuro con subtono frío' },
  'FF4500': { hex: 'FF4500', name: 'Orange Red', nameEs: 'Rojo Anaranjado', temperature: 'warm', family: 'orange', seasonCompatibility: ['bright_spring', 'bright_winter', 'warm_autumn'], description: 'Rojo con dominante naranja' },
  'FF2400': { hex: 'FF2400', name: 'Scarlet', nameEs: 'Escarlata', temperature: 'warm', family: 'red', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Rojo brillante y ardiente' },
  'CE2029': { hex: 'CE2029', name: 'Chinese Red', nameEs: 'Rojo Chino', temperature: 'warm', family: 'red', seasonCompatibility: ['bright_spring', 'deep_autumn'], description: 'Rojo saturado y cálido' },
  'E34234': { hex: 'E34234', name: 'Vermilion', nameEs: 'Vermellón', temperature: 'warm', family: 'coral', seasonCompatibility: ['warm_autumn', 'bright_spring', 'warm_spring'], description: 'Rojo anaranjado clásico' },
  'D50032': { hex: 'D50032', name: 'US Flag Red', nameEs: 'Rojo Intenso', temperature: 'warm', family: 'red', seasonCompatibility: ['bright_winter', 'bright_spring'], description: 'Rojo vibrante y moderno' },

  // NARANJAS
  'FFA500': { hex: 'FFA500', name: 'Orange', nameEs: 'Naranja', temperature: 'warm', family: 'orange', seasonCompatibility: ['bright_spring', 'warm_spring', 'warm_autumn'], description: 'Naranja puro y energético' },
  'FF8C00': { hex: 'FF8C00', name: 'Dark Orange', nameEs: 'Naranja Oscuro', temperature: 'warm', family: 'orange', seasonCompatibility: ['warm_autumn', 'bright_spring', 'warm_spring'], description: 'Naranja profundo y cálido' },
  'FF7F50': { hex: 'FF7F50', name: 'Coral', nameEs: 'Coral', temperature: 'warm', family: 'coral', seasonCompatibility: ['bright_spring', 'warm_spring', 'soft_summer'], description: 'Naranja rosado y vibrante' },
  'E97451': { hex: 'E97451', name: 'Burnt Sienna', nameEs: 'Terracota', temperature: 'warm', family: 'orange', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'soft_autumn'], description: 'Naranja quemado y terroso' },
  'F4A460': { hex: 'F4A460', name: 'Sandy Brown', nameEs: 'Arena', temperature: 'warm', family: 'beige', seasonCompatibility: ['warm_spring', 'soft_spring', 'soft_autumn'], description: 'Naranja claro y suave' },
  'FF6F61': { hex: 'FF6F61', name: 'Coral', nameEs: 'Coral', temperature: 'warm', family: 'coral', seasonCompatibility: ['bright_spring', 'warm_spring', 'soft_spring'], description: 'Coral vibrante y fresco' },
  'FF7F00': { hex: 'FF7F00', name: 'Orange', nameEs: 'Naranja Brillante', temperature: 'warm', family: 'orange', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Naranja intenso y luminoso' },
  'ED9121': { hex: 'ED9121', name: 'Mandarin', nameEs: 'Mandarina', temperature: 'warm', family: 'orange', seasonCompatibility: ['bright_spring', 'warm_spring'], description: 'Naranja brillante y fresco' },
  'FA8072': { hex: 'FA8072', name: 'Salmon', nameEs: 'Salmón', temperature: 'warm', family: 'coral', seasonCompatibility: ['soft_spring', 'warm_spring', 'soft_summer'], description: 'Coral suave y delicado' },
  'FFA07A': { hex: 'FFA07A', name: 'Light Salmon', nameEs: 'Salmón Claro', temperature: 'warm', family: 'coral', seasonCompatibility: ['soft_spring', 'light_spring', 'soft_summer'], description: 'Salmón pastel y cálido' },
  'E9967A': { hex: 'E9967A', name: 'Dark Salmon', nameEs: 'Salmón Oscuro', temperature: 'warm', family: 'coral', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_spring'], description: 'Salmón profundo y suave' },
  'F08080': { hex: 'F08080', name: 'Light Coral', nameEs: 'Coral Claro', temperature: 'warm', family: 'coral', seasonCompatibility: ['soft_spring', 'light_spring', 'soft_summer'], description: 'Coral rosado y suave' },

  // AMARILLOS
  'FFD700': { hex: 'FFD700', name: 'Gold', nameEs: 'Dorado', temperature: 'warm', family: 'yellow', seasonCompatibility: ['bright_spring', 'warm_spring', 'bright_summer'], description: 'Amarillo dorado y brillante' },
  'F7C548': { hex: 'F7C548', name: 'Maize', nameEs: 'Amarillo Maíz', temperature: 'warm', family: 'yellow', seasonCompatibility: ['bright_spring', 'warm_spring', 'warm_autumn'], description: 'Amarillo cálido y dorado' },
  'FFB347': { hex: 'FFB347', name: 'Pastel Orange', nameEs: 'Melocotón', temperature: 'warm', family: 'coral', seasonCompatibility: ['warm_spring', 'soft_spring', 'light_summer'], description: 'Melocotón suave y cálido' },
  'FFCC67': { hex: 'FFCC67', name: 'Flavescent', nameEs: 'Amarillo Miel', temperature: 'warm', family: 'yellow', seasonCompatibility: ['bright_spring', 'warm_spring', 'light_spring'], description: 'Amarillo dorado y luminoso' },
  'FFF8DC': { hex: 'FFF8DC', name: 'Cornsilk', nameEs: 'Crema', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'light_summer', 'warm_spring'], description: 'Amarillo muy claro y suave' },
  'FFEFD5': { hex: 'FFEFD5', name: 'Papaya Whip', nameEs: 'Papaya', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'warm_spring', 'soft_summer'], description: 'Crema cálido y delicado' },
  'F0E68C': { hex: 'F0E68C', name: 'Khaki', nameEs: 'Caqui', temperature: 'warm', family: 'yellow', seasonCompatibility: ['soft_autumn', 'warm_autumn', 'soft_spring'], description: 'Amarillo terroso y muted' },
  'F4D03F': { hex: 'F4D03F', name: 'Turbo', nameEs: 'Amarillo Brillante', temperature: 'warm', family: 'yellow', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Amarillo neón y vibrante' },
  'FFEA00': { hex: 'FFEA00', name: 'Yellow', nameEs: 'Amarillo Neón', temperature: 'warm', family: 'yellow', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Amarillo puro y eléctrico' },
  'F5B041': { hex: 'F5B041', name: 'Sandy', nameEs: 'Amarillo Arena', temperature: 'warm', family: 'yellow', seasonCompatibility: ['warm_spring', 'warm_autumn', 'soft_spring'], description: 'Amarillo dorado y suave' },
  'DAA520': { hex: 'DAA520', name: 'Goldenrod', nameEs: 'Dorado', temperature: 'warm', family: 'yellow', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'bright_spring'], description: 'Dorado clásico y cálido' },
  'B8860B': { hex: 'B8860B', name: 'Dark Goldenrod', nameEs: 'Oro Oscuro', temperature: 'warm', family: 'yellow', seasonCompatibility: ['deep_autumn', 'deep_winter', 'warm_autumn'], description: 'Dorado profundo y rico' },

  // VERDES
  '228B22': { hex: '228B22', name: 'Forest Green', nameEs: 'Verde Bosque', temperature: 'cool', family: 'green', seasonCompatibility: ['deep_autumn', 'deep_winter', 'soft_summer'], description: 'Verde profundo y natural' },
  '2E8B57': { hex: '2E8B57', name: 'Sea Green', nameEs: 'Verde Mar', temperature: 'cool', family: 'green', seasonCompatibility: ['soft_summer', 'soft_autumn', 'deep_winter'], description: 'Verde marino y sofisticado' },
  '008000': { hex: '008000', name: 'Green', nameEs: 'Verde', temperature: 'cool', family: 'green', seasonCompatibility: ['deep_winter', 'bright_winter', 'deep_autumn'], description: 'Verde puro y profundo' },
  '556B2F': { hex: '556B2F', name: 'Olive Drab', nameEs: 'Verde Oliva', temperature: 'warm', family: 'olive', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'soft_autumn'], description: 'Verde olive terroso y cálido' },
  '6B8E23': { hex: '6B8E23', name: 'Olive Drab', nameEs: 'Verde Oliva Claro', temperature: 'warm', family: 'olive', seasonCompatibility: ['warm_autumn', 'soft_autumn', 'soft_spring'], description: 'Verde olive suave' },
  '32CD32': { hex: '32CD32', name: 'Lime Green', nameEs: 'Verde Lima', temperature: 'warm', family: 'green', seasonCompatibility: ['bright_spring', 'bright_winter', 'bright_summer'], description: 'Verde brillante y eléctrico' },
  '00FF00': { hex: '00FF00', name: 'Lime', nameEs: 'Verde Lima Neón', temperature: 'warm', family: 'green', seasonCompatibility: ['bright_spring', 'bright_winter'], description: 'Verde puro y vibrante' },
  '00FA9A': { hex: '00FA9A', name: 'Medium Spring Green', nameEs: 'Verde Menta', temperature: 'cool-neutral', family: 'green', seasonCompatibility: ['bright_spring', 'bright_summer', 'light_summer'], description: 'Verde fresco y luminoso' },
  '98FB98': { hex: '98FB98', name: 'Pale Green', nameEs: 'Verde Menta', temperature: 'cool-neutral', family: 'green', seasonCompatibility: ['light_spring', 'light_summer', 'soft_summer'], description: 'Verde pastel muy suave' },
  '3CB371': { hex: '3CB371', name: 'Medium Sea Green', nameEs: 'Verde Mar Claro', temperature: 'cool', family: 'green', seasonCompatibility: ['soft_summer', 'bright_summer', 'soft_spring'], description: 'Verde marino medio' },
  '2F4F4F': { hex: '2F4F4F', name: 'Dark Slate Gray', nameEs: 'Verde Azulado Oscuro', temperature: 'cool', family: 'gray', seasonCompatibility: ['deep_winter', 'cool_winter', 'soft_winter'], description: 'Gris verdoso profundo' },
  '66CDAA': { hex: '66CDAA', name: 'Medium Aquamarine', nameEs: 'Aguamarina', temperature: 'cool-neutral', family: 'teal', seasonCompatibility: ['soft_summer', 'light_summer', 'bright_summer'], description: 'Verde azulado suave' },
  '20B2AA': { hex: '20B2AA', name: 'Light Sea Green', nameEs: 'Verde Turquesa', temperature: 'cool', family: 'teal', seasonCompatibility: ['bright_summer', 'bright_winter', 'soft_summer'], description: 'Verde turquesa vibrante' },
  '008B8B': { hex: '008B8B', name: 'Dark Cyan', nameEs: 'Cian Oscuro', temperature: 'cool', family: 'teal', seasonCompatibility: ['deep_winter', 'bright_winter', 'cool_winter'], description: 'Cian profundo y dramático' },
  '40E0D0': { hex: '40E0D0', name: 'Turquoise', nameEs: 'Turquesa', temperature: 'cool', family: 'teal', seasonCompatibility: ['bright_summer', 'bright_winter', 'bright_spring'], description: 'Turquesa brillante y vibrante' },
  '00CED1': { hex: '00CED1', name: 'Dark Turquoise', nameEs: 'Turquesa Oscuro', temperature: 'cool', family: 'teal', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Turquesa intenso y frío' },
  '7FFFD4': { hex: '7FFFD4', name: 'Aquamarine', nameEs: 'Aguamarina', temperature: 'cool-neutral', family: 'teal', seasonCompatibility: ['bright_spring', 'bright_summer', 'light_summer'], description: 'Verde azulado claro y fresco' },

  // AZULES
  '0000FF': { hex: '0000FF', name: 'Blue', nameEs: 'Azul', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Azul puro y brillante' },
  '0000CD': { hex: '0000CD', name: 'Medium Blue', nameEs: 'Azul Medio', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_winter', 'cool_winter', 'bright_summer'], description: 'Azul medio e intenso' },
  '000080': { hex: '000080', name: 'Navy Blue', nameEs: 'Azul Marino', temperature: 'cool', family: 'blue', seasonCompatibility: ['deep_winter', 'cool_winter', 'bright_winter'], description: 'Azul oscuro y clásico' },
  '4169E1': { hex: '4169E1', name: 'Royal Blue', nameEs: 'Azul Real', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_winter', 'bright_summer', 'cool_winter'], description: 'Azul brillante y majestuoso' },
  '1E90FF': { hex: '1E90FF', name: 'Dodger Blue', nameEs: 'Azul Dodger', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Azul brillante y moderno' },
  '6495ED': { hex: '6495ED', name: 'Cornflower Blue', nameEs: 'Azul Aciano', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_summer', 'soft_summer', 'bright_winter'], description: 'Azul medio y suave' },
  '87CEEB': { hex: '87CEEB', name: 'Sky Blue', nameEs: 'Azul Cielo', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_summer', 'light_summer', 'bright_spring', 'light_spring'], description: 'Azul claro y luminoso' },
  '87CEFA': { hex: '87CEFA', name: 'Light Sky Blue', nameEs: 'Azul Cielo Claro', temperature: 'cool', family: 'blue', seasonCompatibility: ['light_summer', 'bright_summer', 'light_spring'], description: 'Azul cielo pastel' },
  'ADD8E6': { hex: 'ADD8E6', name: 'Light Blue', nameEs: 'Azul Claro', temperature: 'cool', family: 'blue', seasonCompatibility: ['light_summer', 'soft_summer', 'bright_spring'], description: 'Azul pastel muy suave' },
  'B0E0E6': { hex: 'B0E0E6', name: 'Powder Blue', nameEs: 'Azul Powder', temperature: 'cool', family: 'blue', seasonCompatibility: ['soft_summer', 'light_summer', 'soft_winter'], description: 'Azul pulverulento y delicado' },
  'B0C4DE': { hex: 'B0C4DE', name: 'Light Steel Blue', nameEs: 'Azul Perla', temperature: 'cool', family: 'blue', seasonCompatibility: ['soft_summer', 'soft_winter', 'light_summer'], description: 'Azul grisáceo y suave' },
  '4682B4': { hex: '4682B4', name: 'Steel Blue', nameEs: 'Azul Acero', temperature: 'cool', family: 'blue', seasonCompatibility: ['cool_winter', 'soft_winter', 'bright_summer'], description: 'Azul medio grisáceo' },
  '708090': { hex: '708090', name: 'Slate Gray', nameEs: 'Gris Pizarra', temperature: 'cool', family: 'gray', seasonCompatibility: ['soft_winter', 'soft_summer', 'cool_summer'], description: 'Gris azulado medio' },
  '778899': { hex: '778899', name: 'Light Slate Gray', nameEs: 'Gris Pizarra Claro', temperature: 'cool', family: 'gray', seasonCompatibility: ['soft_summer', 'soft_winter', 'cool_summer'], description: 'Gris azulado suave' },
  '1E3A5F': { hex: '1E3A5F', name: 'Dark Navy', nameEs: 'Azul Marino Oscuro', temperature: 'cool', family: 'blue', seasonCompatibility: ['deep_winter', 'cool_winter'], description: 'Azul marino muy profundo' },
  '0F52BA': { hex: '0F52BA', name: 'Sapphire', nameEs: 'Azul Zafiro', temperature: 'cool', family: 'blue', seasonCompatibility: ['deep_winter', 'bright_winter', 'cool_winter'], description: 'Azul zafiro intenso' },
  '00BFFF': { hex: '00BFFF', name: 'Deep Sky Blue', nameEs: 'Azul Cielo Brillante', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Azul brillante y luminoso' },
  '1C2833': { hex: '1C2833', name: 'Night Blue', nameEs: 'Azul Noche', temperature: 'cool', family: 'blue', seasonCompatibility: ['deep_winter', 'cool_winter', 'soft_winter'], description: 'Azul muy oscuro y profundo' },

  // PÚRPURAS Y MORADOS
  '800080': { hex: '800080', name: 'Purple', nameEs: 'Morado', temperature: 'cool', family: 'purple', seasonCompatibility: ['deep_winter', 'bright_winter', 'cool_winter'], description: 'Morado puro y profundo' },
  '9400D3': { hex: '9400D3', name: 'Dark Violet', nameEs: 'Violeta', temperature: 'cool', family: 'purple', seasonCompatibility: ['bright_winter', 'deep_winter', 'bright_summer'], description: 'Violeta brillante y dramático' },
  '8B008B': { hex: '8B008B', name: 'Dark Magenta', nameEs: 'Magenta Oscuro', temperature: 'cool', family: 'purple', seasonCompatibility: ['deep_winter', 'bright_winter', 'soft_winter'], description: 'Magenta profundo' },
  '9932CC': { hex: '9932CC', name: 'Dark Orchid', nameEs: 'Orquídea Oscuro', temperature: 'cool', family: 'purple', seasonCompatibility: ['bright_winter', 'bright_summer', 'soft_summer'], description: 'Orquídea vibrante' },
  'BA55D3': { hex: 'BA55D3', name: 'Medium Orchid', nameEs: 'Orquídea', temperature: 'cool-neutral', family: 'purple', seasonCompatibility: ['bright_summer', 'soft_summer', 'bright_spring'], description: 'Orquídea medio y suave' },
  'DA70D6': { hex: 'DA70D6', name: 'Orchid', nameEs: 'Orquídea Claro', temperature: 'cool-neutral', family: 'purple', seasonCompatibility: ['bright_summer', 'soft_summer', 'bright_spring'], description: 'Orquídea pastel' },
  'EE82EE': { hex: 'EE82EE', name: 'Violet', nameEs: 'Violeta Claro', temperature: 'cool-neutral', family: 'purple', seasonCompatibility: ['bright_summer', 'bright_spring', 'bright_winter'], description: 'Violeta brillante' },
  'FF00FF': { hex: 'FF00FF', name: 'Magenta', nameEs: 'Magenta', temperature: 'cool', family: 'purple', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Magenta puro y vibrante' },
  'FF1493': { hex: 'FF1493', name: 'Deep Pink', nameEs: 'Rosa Intenso', temperature: 'cool', family: 'pink', seasonCompatibility: ['bright_winter', 'bright_summer', 'bright_spring'], description: 'Rosa intenso y vibrante' },
  '4B0082': { hex: '4B0082', name: 'Indigo', nameEs: 'Índigo', temperature: 'cool', family: 'purple', seasonCompatibility: ['deep_winter', 'bright_winter', 'cool_winter'], description: 'Índigo profundo y dramático' },
  '663399': { hex: '663399', name: 'Rebecca Purple', nameEs: 'Púrpura', temperature: 'cool', family: 'purple', seasonCompatibility: ['deep_winter', 'soft_winter', 'bright_winter'], description: 'Púrpura profundo' },
  '6A5ACD': { hex: '6A5ACD', name: 'Slate Blue', nameEs: 'Azul Pizarra', temperature: 'cool', family: 'blue', seasonCompatibility: ['soft_summer', 'soft_winter', 'bright_summer'], description: 'Azul púrpura medio' },
  '9370DB': { hex: '9370DB', name: 'Medium Purple', nameEs: 'Púrpura Medio', temperature: 'cool', family: 'purple', seasonCompatibility: ['bright_summer', 'soft_summer', 'bright_winter'], description: 'Púrpura medio brillante' },
  'D8BFD8': { hex: 'D8BFD8', name: 'Thistle', nameEs: 'Ciruela', temperature: 'cool-neutral', family: 'purple', seasonCompatibility: ['soft_summer', 'light_summer', 'soft_winter'], description: 'Lila suave y delicado' },
  'E6E6FA': { hex: 'E6E6FA', name: 'Lavender', nameEs: 'Lavanda', temperature: 'cool-neutral', family: 'purple', seasonCompatibility: ['light_summer', 'soft_summer', 'light_spring'], description: 'Lavanda pastel muy suave' },

  // ROSAS
  'FF69B4': { hex: 'FF69B4', name: 'Hot Pink', nameEs: 'Rosa Brillante', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['bright_spring', 'bright_summer', 'bright_winter'], description: 'Rosa vibrante y moderno' },
  'FFB6C1': { hex: 'FFB6C1', name: 'Light Pink', nameEs: 'Rosa Claro', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['bright_spring', 'light_spring', 'soft_spring', 'light_summer'], description: 'Rosa pastel muy delicado' },
  'FFC0CB': { hex: 'FFC0CB', name: 'Pink', nameEs: 'Rosa', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['bright_spring', 'soft_spring', 'light_spring', 'light_summer'], description: 'Rosa clásico y suave' },
  'F8BBD9': { hex: 'F8BBD9', name: 'Pink', nameEs: 'Rosa Suave', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['light_spring', 'soft_spring', 'light_summer'], description: 'Rosa pastel muy suave' },
  'FF6B6B': { hex: 'FF6B6B', name: 'Pastel Red', nameEs: 'Rojo Coral', temperature: 'warm', family: 'coral', seasonCompatibility: ['bright_spring', 'warm_spring', 'bright_summer'], description: 'Rojo coral suave' },
  'E91E63': { hex: 'E91E63', name: 'Pink', nameEs: 'Rosa', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['bright_spring', 'bright_winter', 'bright_summer'], description: 'Rosa vibrante' },
  'F48FB1': { hex: 'F48FB1', name: 'Pink', nameEs: 'Rosa', temperature: 'warm-neutral', family: 'pink', seasonCompatibility: ['bright_spring', 'soft_spring', 'light_summer'], description: 'Rosa suave' },

  // MARRONES
  '8B4513': { hex: '8B4513', name: 'Saddle Brown', nameEs: 'Marrón Suela', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'deep_winter'], description: 'Marrón profundo y terroso' },
  'D2691E': { hex: 'D2691E', name: 'Chocolate', nameEs: 'Chocolate', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'soft_autumn'], description: 'Marrón rico y versátil' },
  'CD853F': { hex: 'CD853F', name: 'Peru', nameEs: 'Perú', temperature: 'warm', family: 'brown', seasonCompatibility: ['warm_autumn', 'deep_autumn', 'bright_spring', 'warm_spring'], description: 'Marrón dorado y cálido' },
  'A0522D': { hex: 'A0522D', name: 'Sienna', nameEs: 'Siena', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'soft_autumn'], description: 'Marrón rojizo profundo' },
  '8B7355': { hex: '8B7355', name: 'Taupe', nameEs: 'Marrón Cuero', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'warm_autumn', 'soft_summer'], description: 'Marrón grisáceo cálido' },
  '704214': { hex: '704214', name: 'Burnt Umber', nameEs: 'Marrón Canela', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'warm_autumn'], description: 'Marrón quemado profundo' },
  '6B4423': { hex: '6B4423', name: 'Dark Brown', nameEs: 'Marrón Oscuro', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'deep_winter'], description: 'Marrón oscuro y profundo' },
  '4A3728': { hex: '4A3728', name: 'Dark Brown', nameEs: 'Marrón Café', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'deep_winter'], description: 'Marrón café profundo' },
  '5D4E37': { hex: '5D4E37', name: 'Earth Brown', nameEs: 'Beige Oscuro', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'warm_autumn', 'soft_autumn'], description: 'Marrón tierra oscuro' },
  '3D2914': { hex: '3D2914', name: 'Coffee', nameEs: 'Marrón Profundo', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'deep_winter'], description: 'Marrón café muy profundo' },
  'C19A6B': { hex: 'C19A6B', name: 'Camel', nameEs: 'Camel', temperature: 'warm', family: 'beige', seasonCompatibility: ['warm_autumn', 'warm_spring', 'deep_autumn'], description: 'Beige dorado clásico' },
  'D2B48C': { hex: 'D2B48C', name: 'Tan', nameEs: 'Tan', temperature: 'warm', family: 'beige', seasonCompatibility: ['warm_spring', 'warm_autumn', 'soft_spring', 'soft_autumn'], description: 'Beige medio cálido' },
  'DEB887': { hex: 'DEB887', name: 'Burlywood', nameEs: 'Arena', temperature: 'warm', family: 'beige', seasonCompatibility: ['warm_spring', 'soft_spring', 'soft_autumn'], description: 'Beige arena suave' },
  'F5DEB3': { hex: 'F5DEB3', name: 'Wheat', nameEs: 'Trigo', temperature: 'warm', family: 'beige', seasonCompatibility: ['light_spring', 'warm_spring', 'soft_spring', 'light_summer'], description: 'Beige trigo claro' },
  'FAFAD2': { hex: 'FAFAD2', name: 'Light Goldenrod Yellow', nameEs: 'Crema Claro', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'light_summer', 'warm_spring'], description: 'Crema dorado muy claro' },
  'FFFAF0': { hex: 'FFFAF0', name: 'Ivory', nameEs: 'Blanco Hueso', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'warm_spring', 'light_summer'], description: 'Blanco crema cálido' },
  'D4A574': { hex: 'D4A574', name: 'Melocotón', nameEs: 'Melocotón', temperature: 'warm', family: 'coral', seasonCompatibility: ['warm_spring', 'soft_spring', 'soft_autumn', 'light_summer'], description: 'Melocotón suave y cálido' },
  'C49A6C': { hex: 'C49A6C', name: 'Caramel', nameEs: 'Caramelo', temperature: 'warm', family: 'brown', seasonCompatibility: ['warm_autumn', 'deep_autumn', 'warm_spring'], description: 'Caramelo dorado cálido' },
  'B8956E': { hex: 'B8956E', name: 'Bronze', nameEs: 'Bronce', temperature: 'warm', family: 'brown', seasonCompatibility: ['warm_autumn', 'deep_autumn', 'bright_spring'], description: 'Bronce dorado cálido' },
  'A0826D': { hex: 'A0826D', name: 'Brown Rose', nameEs: 'Marrón Rosado', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_spring'], description: 'Marrón cálido y rosado' },
  '7A6B5A': { hex: '7A6B5A', name: 'Taupe Brown', nameEs: 'Marrón Ternera', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_autumn'], description: 'Taupe marrón cálido' },
  '6B5344': { hex: '6B5344', name: 'Dark Taupe', nameEs: 'Marrón Oscuro', temperature: 'warm', family: 'brown', seasonCompatibility: ['deep_autumn', 'soft_autumn'], description: 'Taupe oscuro profundo' },
  'C4B7A6': { hex: 'C4B7A6', name: 'Taupe Gray', nameEs: 'Gris Topo', temperature: 'warm-neutral', family: 'gray', seasonCompatibility: ['soft_autumn', 'soft_summer', 'soft_spring'], description: 'Gris topo cálido y versátil' },
  '9B8579': { hex: '9B8579', name: 'Rosy Brown', nameEs: 'Marrón Rosado', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_spring'], description: 'Marrón rosado suave' },
  'A89F91': { hex: 'A89F91', name: 'Taupe', nameEs: 'Taupe', temperature: 'warm-neutral', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_autumn'], description: 'Taupe clásico versátil' },
  'B5A99A': { hex: 'B5A99A', name: 'Rosy Brown Light', nameEs: 'Arena Rosada', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_spring', 'soft_summer'], description: 'Arena rosada suave' },
  '8B8075': { hex: '8B8075', name: 'Warm Gray', nameEs: 'Gris Cálido', temperature: 'warm', family: 'gray', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_autumn'], description: 'Gris cálido medio' },
  '7A6F63': { hex: '7A6F63', name: 'Dark Warm Gray', nameEs: 'Taupe Oscuro', temperature: 'warm', family: 'gray', seasonCompatibility: ['soft_autumn', 'soft_summer', 'deep_autumn'], description: 'Gris cálido oscuro' },
  '6B6154': { hex: '6B6154', name: 'Warm Gray Dark', nameEs: 'Marrón Medio', temperature: 'warm', family: 'gray', seasonCompatibility: ['soft_autumn', 'deep_autumn', 'warm_autumn'], description: 'Gris marrón oscuro' },

  // GRISES
  '808080': { hex: '808080', name: 'Gray', nameEs: 'Gris', temperature: 'neutral', family: 'gray', seasonCompatibility: ['soft_summer', 'soft_winter', 'soft_spring', 'soft_autumn'], description: 'Gris medio neutral' },
  '696969': { hex: '696969', name: 'Dim Gray', nameEs: 'Gris Dim', temperature: 'cool-neutral', family: 'gray', seasonCompatibility: ['soft_summer', 'soft_winter', 'cool_summer'], description: 'Gris oscuro medio' },
  'A9A9A9': { hex: 'A9A9A9', name: 'Dark Gray', nameEs: 'Gris Oscuro', temperature: 'neutral', family: 'gray', seasonCompatibility: ['soft_summer', 'soft_winter', 'soft_spring'], description: 'Gris medio oscuro' },
  'C0C0C0': { hex: 'C0C0C0', name: 'Silver', nameEs: 'Gris Claro', temperature: 'cool-neutral', family: 'gray', seasonCompatibility: ['bright_winter', 'bright_summer', 'cool_winter', 'light_summer'], description: 'Gris plateado claro' },
  'D3D3D3': { hex: 'D3D3D3', name: 'Light Gray', nameEs: 'Gris Claro', temperature: 'neutral', family: 'gray', seasonCompatibility: ['light_summer', 'soft_summer', 'light_spring'], description: 'Gris pastel muy claro' },
  'E5E4E2': { hex: 'E5E4E2', name: 'Platinum', nameEs: 'Platino', temperature: 'cool-neutral', family: 'gray', seasonCompatibility: ['bright_summer', 'light_summer', 'bright_winter'], description: 'Gris plateado brillante' },
  'ECEF1F': { hex: 'ECF0F1', name: 'Porcelain', nameEs: 'Gris Claro', temperature: 'cool-neutral', family: 'gray', seasonCompatibility: ['light_summer', 'soft_summer', 'bright_summer'], description: 'Gris porcelana muy claro' },
  'FDFEFE': { hex: 'FDFEFE', name: 'Snow', nameEs: 'Blanco Nieve', temperature: 'cool-neutral', family: 'white', seasonCompatibility: ['light_summer', 'bright_summer', 'bright_winter'], description: 'Blanco azulado muy claro' },
  '636363': { hex: '636363', name: 'Gray', nameEs: 'Gris Medio', temperature: 'neutral', family: 'gray', seasonCompatibility: ['soft_summer', 'soft_winter', 'cool_summer'], description: 'Gris medio' },
  '36454F': { hex: '36454F', name: 'Charcoal', nameEs: 'Carbón', temperature: 'cool', family: 'gray', seasonCompatibility: ['deep_winter', 'cool_winter', 'soft_winter'], description: 'Gris carbón oscuro' },
  '333333': { hex: '333333', name: 'Dark Charcoal', nameEs: 'Gris Carbón', temperature: 'cool', family: 'gray', seasonCompatibility: ['deep_winter', 'cool_winter', 'soft_winter'], description: 'Gris carbón medio' },

  // BLANCOS Y NEGROS
  'FFFFFF': { hex: 'FFFFFF', name: 'White', nameEs: 'Blanco', temperature: 'neutral', family: 'white', seasonCompatibility: ['light_spring', 'light_summer', 'bright_spring', 'bright_summer'], description: 'Blanco puro' },
  'F8F9F9': { hex: 'F8F9F9', name: 'White', nameEs: 'Blanco', temperature: 'neutral', family: 'white', seasonCompatibility: ['light_summer', 'bright_summer', 'light_spring'], description: 'Blanco suave' },
  'FFFAFA': { hex: 'FFFAFA', name: 'Snow', nameEs: 'Blanco Nieve', temperature: 'neutral', family: 'white', seasonCompatibility: ['light_spring', 'light_summer'], description: 'Blanco crema muy suave' },
  'F0FFFF': { hex: 'F0FFFF', name: 'Azure', nameEs: 'Azur', temperature: 'cool-neutral', family: 'white', seasonCompatibility: ['bright_summer', 'light_summer', 'bright_winter'], description: 'Blanco azulado' },
  'F5F5F5': { hex: 'F5F5F5', name: 'White Smoke', nameEs: 'Blanco Humo', temperature: 'neutral', family: 'white', seasonCompatibility: ['light_summer', 'soft_summer', 'soft_spring'], description: 'Blanco grisáceo suave' },
  '000000': { hex: '000000', name: 'Black', nameEs: 'Negro', temperature: 'neutral', family: 'black', seasonCompatibility: ['deep_winter', 'bright_winter', 'deep_autumn'], description: 'Negro puro' },
  '1C1C1C': { hex: '1C1C1C', name: 'Rich Black', nameEs: 'Negro Profundo', temperature: 'neutral', family: 'black', seasonCompatibility: ['deep_winter', 'deep_autumn', 'bright_winter'], description: 'Negro rico y profundo' },

  // BEIGES Y CREMAS
  'F5F5DC': { hex: 'F5F5DC', name: 'Beige', nameEs: 'Beige', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'soft_spring', 'warm_spring', 'light_summer'], description: 'Beige neutro clásico' },
  'D6EAF8': { hex: 'D6EAF8', name: 'Light Blue', nameEs: 'Azul Claro', temperature: 'cool', family: 'blue', seasonCompatibility: ['light_summer', 'bright_summer', 'light_spring'], description: 'Azul glacial muy claro' },
  'F2F3F4': { hex: 'F2F3F4', name: 'Light Gray', nameEs: 'Gris Plateado', temperature: 'cool-neutral', family: 'gray', seasonCompatibility: ['light_summer', 'bright_summer', 'soft_summer'], description: 'Gris plateado muy claro' },
  '85C1E9': { hex: '85C1E9', name: 'Light Blue', nameEs: 'Azul Cielo', temperature: 'cool', family: 'blue', seasonCompatibility: ['bright_summer', 'light_summer', 'bright_spring'], description: 'Azul cielo claro' },
  'AED6F1': { hex: 'AED6F1', name: 'Light Blue', nameEs: 'Azul Pastel', temperature: 'cool', family: 'blue', seasonCompatibility: ['light_summer', 'bright_summer', 'light_spring'], description: 'Azul pastel suave' },
  'A9CCE3': { hex: 'A9CCE3', name: 'Light Blue', nameEs: 'Azul Grisáceo', temperature: 'cool', family: 'blue', seasonCompatibility: ['soft_summer', 'light_summer', 'soft_winter'], description: 'Azul grisáceo suave' },
  'CDC0B0': { hex: 'CDC0B0', name: 'Warm Gray', nameEs: 'Beige Rosado', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['soft_autumn', 'soft_summer', 'soft_spring'], description: 'Beige rosado cálido' },
  'C8C0B8': { hex: 'C8C0B8', name: 'Warm Gray', nameEs: 'Gris Béige', temperature: 'warm-neutral', family: 'gray', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_autumn'], description: 'Gris beige cálido' },
  'A89080': { hex: 'A89080', name: 'Taupe Rose', nameEs: 'Marrón Grisáceo', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_autumn'], description: 'Taupe rosado suave' },
  'B8A090': { hex: 'B8A090', name: 'Taupe Rose Light', nameEs: 'Rosa Salmón', temperature: 'warm', family: 'brown', seasonCompatibility: ['soft_autumn', 'soft_summer', 'warm_spring'], description: 'Taupe rosado claro' },
  'FFDAB9': { hex: 'FFDAB9', name: 'Peach Puff', nameEs: 'Melocotón', temperature: 'warm', family: 'coral', seasonCompatibility: ['light_spring', 'soft_spring', 'soft_summer', 'warm_spring'], description: 'Melocotón pastel suave' },
  'FFE4C4': { hex: 'FFE4C4', name: 'Bisque', nameEs: 'Bisque', temperature: 'warm-neutral', family: 'beige', seasonCompatibility: ['light_spring', 'warm_spring', 'soft_spring'], description: 'Crema melocotón suave' },
  'FFE4B5': { hex: 'FFE4B5', name: 'Moccasin', nameEs: 'Mocasín', temperature: 'warm', family: 'beige', seasonCompatibility: ['warm_spring', 'bright_spring', 'soft_spring'], description: 'Beige dorado suave' },
};

/**
 * Obtiene el nombre oficial de un color a partir de su HEX
 */
export function getColorNameFromHex(hex: string): string {
  const cleanHex = hex.replace('#', '').toUpperCase();
  const color = COLOR_CATALOG[cleanHex];
  return color ? color.nameEs : cleanHex;
}

/**
 * Obtiene la información completa de un color del catálogo
 */
export function getColorFromCatalog(hex: string): CatalogColor | null {
  const cleanHex = hex.replace('#', '').toUpperCase();
  return COLOR_CATALOG[cleanHex] || null;
}

/**
 * Verifica si un HEX existe en el catálogo
 */
export function isValidCatalogColor(hex: string): boolean {
  const cleanHex = hex.replace('#', '').toUpperCase();
  return cleanHex in COLOR_CATALOG;
}

/**
 * Obtiene colores de una paleta de estación específicos
 */
export function getSeasonalColors(season: SeasonType, category: 'protagonist' | 'secondary' | 'accent' | 'neutral' | 'avoid'): CatalogColor[] {
  // Filtrar colores que son compatibles con la estación
  const compatibleColors = Object.values(COLOR_CATALOG).filter(c =>
    c.seasonCompatibility.includes(season)
  );

  // Retornar según categoría
  switch (category) {
    case 'protagonist':
      return compatibleColors.slice(0, 3);
    case 'secondary':
      return compatibleColors.slice(3, 6);
    case 'accent':
      return compatibleColors.slice(6, 9);
    case 'neutral':
      return compatibleColors.filter(c => c.family === 'white' || c.family === 'black' || c.family === 'gray' || c.family === 'beige').slice(0, 3);
    case 'avoid':
      // Colores incompatibles: temperatura opuesta
      const seasonData = SEASON_CONFIG[season];
      const oppositeTemp = seasonData?.temperature === 'warm' ? 'cool' : 'warm';
      return Object.values(COLOR_CATALOG)
        .filter(c => c.temperature === oppositeTemp || (c.temperature !== 'neutral' && c.temperature !== `${oppositeTemp}-neutral` && c.temperature !== seasonData?.temperature))
        .slice(0, 4);
    default:
      return [];
  }
}

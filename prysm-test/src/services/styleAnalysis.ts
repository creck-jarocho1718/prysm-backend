/**
 * PRYSM Style Analysis Engine
 * Uses OpenAI GPT to analyze user photos and questionnaire responses
 * to generate personalized style recommendations
 */

import { testLog } from '../config';
import type { QuizAnswers } from './api';

// OpenAI API configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// System prompt for the Style Analysis Engine
const SYSTEM_PROMPT = `Eres el motor de análisis de imagen y estilo de PRYSM.

Tu función es analizar de forma integral la información proporcionada por el usuario y generar un perfil de estilo personalizado.

IMPORTANTE:
- No debes modificar el diseño, estructura visual, navegación ni componentes visuales existentes de PRYSM
- Solo debes proporcionar los datos y recomendaciones que alimentarán el reporte
- Devuelve SOLO JSON válido, sin texto adicional

DATOS DE ENTRADA:
1. Fotografías del usuario
2. Respuestas completas del cuestionario
3. Tono de piel indicado por el usuario
4. Tipo de cuerpo/silueta indicado por el usuario
5. Cómo quiere sentirse o proyectarse
6. Presupuesto
7. Colores que ya tiene en su clóset
8. Prendas que ya tiene
9. Metal preferido
10. Estilo elegido
11. Ocasiones para las que necesita ropa
12. Look/arquetipo de referencia

ANÁLISIS DE COLOR:
Analiza las fotografías junto con el tono de piel indicado en el cuestionario.

Determina, cuando exista evidencia suficiente:
- subtono (cálido, frío, neutro)
- profundidad (claro, medio, profundo)
- nivel de contraste (bajo, medio, alto)
- saturación (baja, media, alta)
- estación cromática (Primavera, Verano, Otoño, Invierno)
- subestación, si corresponde

IMPORTANTE:
- No asumas automáticamente Otoño
- El resultado puede ser Primavera, Verano, Otoño o Invierno y sus subestaciones
- Si la confianza es baja, indícalo claramente
- Nunca fuerces una estación únicamente porque falten datos

Genera:
- colores protagonistas (los que más favorecen)
- colores secundarios (buena opción, versátil)
- neutros recomendados
- colores de acento
- colores que conviene evitar

Para cada color proporciona el hex code y una breve explicación.

SILUETA:
Utiliza el tipo de cuerpo indicado por el usuario y la información visual disponible.

Genera recomendaciones específicas sobre:
- cortes que favorecen
- proporciones ideales
- escotes recomendados
- largos de pantalón/falda
- tipos de vestidos
- chaquetas/blazers
- prendas que favorecen
- prendas que conviene evitar o adaptar

ESTILO:
Combina estilo principal, estilos secundarios, cómo quiere sentirse y arquetipo/look de referencia.

Genera:
- estilo principal con descripción
- estilos secundarios
- arquetipo de referencia
- sensación a proyectar
- palabras clave del estilo

PRESUPUESTO:
Divide las recomendaciones en:
- compras prioritarias (inversiones principales)
- piezas donde vale la pena invertir
- alternativas económicas
- piezas que pueden esperar

CLOSET (ARMARIO):
Analiza los colores y prendas que el usuario ya posee.

Genera listas específicas:
- "YA_TIENES": prendas que ya posee y puede usar
- "TE_SIRVE": prendas que necesita adaptar
- "COMBINALO_ASI": cómo combinar prendas existentes
- "TE_FALTA": prendas que faltan
- "NO_ES_PRIORIDAD": prendas que pueden esperar

OCASIONES:
Prioriza las ocasiones seleccionadas por el usuario.

Genera looks específicos para cada ocasión relevante con:
- nombre del look
- piezas específicas
- colores de la paleta
- sensación a proyectar
- descripción del resultado

JOYERÍA:
Basado en el metal elegido y colorimetría:
- metal recomendado
- acabados ideales
- tipos de accesorios
- colores de piedras (si aplica)

RESULTADO FINAL:
Genera un perfil de estilo coherente con:
1. Descubrimiento principal
2. Explicación del análisis
3. Por qué estos colores favorecen
4. Colores del clóset a conservar
5. Colores a dejar de priorizar
6. Prendas que favorecen la silueta
7. Prendas a comprar
8. Prioridad de compras según presupuesto
9. Looks para ocasiones principales
10. Cómo conseguir la imagen deseada

FORMATO DE RESPUESTA:
Devuelve EXACTAMENTE este JSON structure:

{
  "analisisColor": {
    "subtono": "cálido|frío|neutro",
    "profundidad": "claro|medio|profundo",
    "contraste": "bajo|medio|alto",
    "saturacion": "baja|media|alta",
    "estacion": "Primavera|Verano|Otoño|Invierno",
    "subestacion": "nombre de subestación si aplica",
    "confianza": 0.0-1.0,
    "explicacion": "breve explicación del análisis",
    "paleta": {
      "protagonistas": [{"hex": "#HEX", "nombre": "nombre descriptivo", "explicacion": "por qué favorece"}],
      "secundarios": [{"hex": "#HEX", "nombre": "nombre descriptivo", "explicacion": "por qué es buena opción"}],
      "neutros": [{"hex": "#HEX", "nombre": "nombre descriptivo", "explicacion": "cómo usarlo"}],
      "acento": [{"hex": "#HEX", "nombre": "nombre descriptivo", "explicacion": "para qué sirve"}],
      "evitar": [{"hex": "#HEX", "nombre": "nombre descriptivo", "explicacion": "por qué evitar o usar con moderación"}]
    }
  },
  "silueta": {
    "tipoCuerpo": "tipo indicado o detectado",
    "cortes": ["corte 1", "corte 2", ...],
    "proporciones": "descripción de proporciones ideales",
    "escotes": ["escote 1", "escote 2", ...],
    "largos": {"pantalones": "...", "faldas": "..."},
    "prendasFavorecen": ["prenda 1", "prenda 2", ...],
    "prendasEvitar": ["prenda 1", "prenda 2", ...],
    "explicacion": "por qué estas prendas favorecen"
  },
  "estilo": {
    "principal": {
      "nombre": "nombre del estilo",
      "descripcion": "descripción detallada",
      "palabrasClave": ["palabra 1", "palabra 2", ...]
    },
    "secundarios": ["estilo 1", "estilo 2", ...],
    "arquetipo": "arquetipo de referencia",
    "sensacionProyectar": "cómo quiere sentirse/proyectarse"
  },
  "presupuesto": {
    "nivel": "bajo|medio|alto|lujo",
    "comprasPrioritarias": [{"prenda": "...", "razon": "...", "rangoPrecio": "..."}],
    "invertir": [{"prenda": "...", "razon": "...", "rangoPrecio": "..."}],
    "economicas": [{"prenda": "...", "dondeAhorrar": "...", "rangoPrecio": "..."}],
    "puedeEsperar": ["prenda 1", "prenda 2", ...]
  },
  "closet": {
    "yaTienes": [{"prenda": "...", "comoUsar": "...", "combinaCon": [...]}],
    "teSirve": [{"prenda": "...", "comoAdaptar": "..."}],
    "combinaloAsi": [{"prenda": "...", "combinacion": "...", "colores": [...]}],
    "teFalta": ["prenda 1", "prenda 2", ...],
    "noEsPrioridad": ["prenda 1", "prenda 2", ...]
  },
  "ocasiones": [
    {
      "nombre": "nombre de la ocasión",
      "prioridad": 1-10,
      "looks": [
        {
          "nombre": "nombre del look",
          "piezas": "descripción de piezas específicas",
          "colores": ["#HEX1", "#HEX2", ...],
          "sensacion": "sensación a proyectar",
          "descripcion": "descripción del resultado final"
        }
      ]
    }
  ],
  "joyeria": {
    "metal": "oro|plata|oro rosa|acero|bronce",
    "acabados": ["acabado 1", "acabado 2", ...],
    "tipos": ["tipo 1", "tipo 2", ...],
    "piedras": ["piedra 1", "piedra 2", ...],
    "explicacion": "por qué este metal favorece"
  },
  "perfil": {
    "descubrimiento": "qué descubriste del usuario",
    "explicacion": "por qué llegaste a esas conclusiones",
    "coloresFavorecen": "por qué estos colores favorecen",
    "coloresConservar": "colores del closet a conservar",
    "coloresDejar": "colores a dejar de priorizar",
    "prendasFavorecen": "prendas que favorecen su silueta",
    "prendasComprar": "prendas que necesita comprar",
    "prioridadCompras": "qué comprar primero según presupuesto",
    "looksPrincipales": "looks para ocasiones principales",
    "imagenDeseada": "cómo conseguir la imagen que desea proyectar"
  }
}`;

export interface StyleAnalysisRequest {
  photos?: string[]; // base64 encoded photos
  answers: QuizAnswers;
  userName?: string;
  skinAnalysis?: {
    undertone: 'warm' | 'cool' | 'neutral';
    depth: 'light' | 'medium' | 'deep';
    saturation: 'low' | 'medium' | 'high';
  };
}

export interface StyleAnalysisResponse {
  success: boolean;
  data?: {
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
      principal: {
        nombre: string;
        descripcion: string;
        palabrasClave: string[];
      };
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
      looks: {
        nombre: string;
        piezas: string;
        colores: string[];
        sensacion: string;
        descripcion: string;
      }[];
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
  };
  error?: string;
  processingTime?: number;
}

/**
 * Analyze user photos and answers to generate personalized style recommendations
 */
export async function analyzeStyle(request: StyleAnalysisRequest): Promise<StyleAnalysisResponse> {
  const startTime = Date.now();

  testLog.info('Starting OpenAI style analysis...');

  // If no API key, return mock data for testing
  if (!OPENAI_API_KEY) {
    testLog.warn('No OpenAI API key found, using mock data');
    return getMockAnalysis(request);
  }

  try {
    // Build user context from questionnaire answers
    const userContext = buildUserContext(request);

    // Create the analysis prompt
    const analysisPrompt = `Analiza la siguiente información del usuario y genera un perfil de estilo personalizado completo.

INFORMACIÓN DEL USUARIO:
${userContext}

${request.photos && request.photos.length > 0 ? `
NOTA: El usuario ha proporcionado ${request.photos.length} fotografía(s). Las fotografías contienen información visual importante sobre:
- Tono de piel real
- Color y tono de cabello
- Color de ojos
- Proporciones faciales
- Forma del rostro
- Tipo de cuerpo visible

El análisis de color debe basarse principalmente en la evidencia visual de las fotografías.
` : ''}

Responde SOLO con el JSON válido, sin texto adicional ni explicaciones.`;

    testLog.info('Calling OpenAI API...');

    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: analysisPrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
        response_format: { type: 'json_object' }
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    testLog.info('OpenAI analysis completed successfully');

    // Parse the JSON response
    const analysisData = JSON.parse(content);

    const processingTime = Date.now() - startTime;
    testLog.info(`Analysis completed in ${processingTime}ms`);

    return {
      success: true,
      data: analysisData,
      processingTime
    };

  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error('Style analysis error:', error);

    testLog.error('Style analysis failed', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en el análisis de estilo',
      processingTime
    };
  }
}

/**
 * Build user context from questionnaire answers
 */
function buildUserContext(request: StyleAnalysisRequest): string {
  const answers = request.answers;
  const lines: string[] = [];

  // Name
  if (request.userName) {
    lines.push(`Nombre: ${request.userName}`);
  }

  // Q1: Cómo se describe
  if (answers.q1) {
    lines.push(`\n1. Cómo se describe: ${Array.isArray(answers.q1) ? answers.q1.join(', ') : answers.q1}`);
  }

  // Q2: Tipo de cuerpo
  if (answers.q2) {
    lines.push(`2. Tipo de cuerpo: ${answers.q2}`);
  }

  // Q3: Budget
  if (answers.q3) {
    lines.push(`3. Presupuesto: ${answers.q3}`);
  }

  // Q4: Colores y prendas del closet
  if (answers.q4) {
    lines.push(`4. Colores en su closet: ${Array.isArray(answers.q4) ? answers.q4.join(', ') : answers.q4}`);
  }

  // Q5: Metal preferido
  if (answers.q5) {
    lines.push(`5. Metal preferido: ${answers.q5}`);
  }

  // Q6: Estilo
  if (answers.q6) {
    lines.push(`6. Estilo: ${answers.q6}`);
  }

  // Q7: Ocasiones
  if (answers.q7) {
    lines.push(`7. Ocasiones para ropa: ${Array.isArray(answers.q7) ? answers.q7.join(', ') : answers.q7}`);
  }

  // Q8: Arquetipo/Look
  if (answers.q8) {
    lines.push(`8. Arquetipo/Look de referencia: ${answers.q8}`);
  }

  // Skin analysis from frontend
  if (request.skinAnalysis) {
    lines.push(`\nAnálisis de piel (del sistema):`);
    lines.push(`- Subtono: ${request.skinAnalysis.undertone}`);
    lines.push(`- Profundidad: ${request.skinAnalysis.depth}`);
    lines.push(`- Saturación: ${request.skinAnalysis.saturation}`);
  }

  return lines.join('\n');
}

/**
 * Mock analysis for testing without OpenAI API
 */
function getMockAnalysis(request: StyleAnalysisRequest): StyleAnalysisResponse {
  const answers = request.answers;

  // Detect style type based on answers
  const estilo = (answers.q6 as string) || '';
  const arquetipo = (answers.q8 as string) || '';
  const presupuesto = (answers.q3 as string) || 'medio';
  const metal = (answers.q5 as string) || 'dorado';

  // Base colors based on warmth
  const baseColors = {
    warm: {
      protagonistas: ['#C4863B', '#8B5A2B', '#D4A473'],
      secundarios: ['#6B4423', '#A0522D', '#CD853F'],
      neutros: ['#F5DEB3', '#D2B48C', '#FAF0E6'],
      acento: ['#B8860B', '#DAA520', '#FFD700']
    },
    cool: {
      protagonistas: ['#4A6FA5', '#6B8BA4', '#708090'],
      secundarios: ['#5B7C99', '#778899', '#6A8CAD'],
      neutros: ['#F0F0F0', '#E8E8E8', '#DCDCDC'],
      acento: ['#4169E1', '#6495ED', '#87CEEB']
    }
  };

  const isWarm = (answers.q6 as string)?.toLowerCase().includes('calido') ||
                 metal.toLowerCase().includes('oro') ||
                 metal.toLowerCase().includes('dorado');

  const colors = isWarm ? baseColors.warm : baseColors.cool;

  const mockData = {
    analisisColor: {
      subtono: isWarm ? 'cálido' : 'neutro',
      profundidad: 'medio',
      contraste: 'medio-alto',
      saturacion: 'media',
      estacion: 'Otoño',
      subestacion: 'Otoño Soft',
      confianza: 0.78,
      explicacion: 'Basado en las respuestas del cuestionario y el análisis visual, tu paleta tiene tonos cálidos con profundidad media. Los colores tierra y ocres son tus aliados principales.',
      paleta: {
        protagonistas: colors.protagonistas.map((hex, i) => ({
          hex,
          nombre: ['Ocre quemado', 'Siena tostado', 'Caramelo dorado'][i],
          explicacion: 'Colores que iluminan tu rostro y complementan tu subtono'
        })),
        secundarios: colors.secundarios.map((hex, i) => ({
          hex,
          nombre: ['Marrón chocolate', 'Terracota', 'Dorado miel'][i],
          explicacion: 'Excelentes para prendas de uso frecuente'
        })),
        neutros: colors.neutros.map((hex, i) => ({
          hex,
          nombre: ['Beige arena', 'Nude', 'Crema'][i],
          explicacion: 'Base versátil para cualquier guardarropa'
        })),
        acento: colors.acento.map((hex, i) => ({
          hex,
          nombre: ['Ambar', 'Oro viejo', 'Mostaza'][i],
          explicacion: 'Para detalles y accesorios que aportan vida'
        })),
        evitar: [
          { hex: '#C0C0C0', nombre: 'Plata puro', explicacion: 'Contrasta frío con tu subtono cálido' },
          { hex: '#E6E6FA', nombre: 'Lavanda', explicacion: 'Puede apagar tu complexion' }
        ]
      }
    },
    silueta: {
      tipoCuerpo: (answers.q2 as string) || 'Reloj de arena',
      cortes: ['Corte evasé o A', 'Línea empire', 'Cintura definida'],
      proporciones: 'Equilibrar hombros y cadera, destacar cintura',
      escotes: ['V profundo', 'Redondo suave', 'Barca'],
      largos: {
        pantalones: 'Hasta el tobillo o midi',
        faldas: ' knee-length o midi evasé'
      },
      prendasFavorecen: ['Blusas con drapeado', 'Pantalones de tiro alto', 'Faldas evasé', 'Vestidos con cinturón'],
      prendasEvitar: ['Ropa completamente recta sin forma', 'Cinturones anchos en cintura'],
      explicacion: 'Las prendas que marcan la cintura y tienen movimiento en la parte inferior equilibran tu silueta'
    },
    estilo: {
      principal: {
        nombre: arquetipo || estilo || 'Sofisticada Natural',
        descripcion: 'Una combinación de elegancia discreta con toques naturales. Piezas bien estructuradas pero sin rigidez.',
        palabrasClave: ['sofisticado', 'natural', 'equilibrado', 'versátil']
      },
      secundarios: ['casual-elegante', 'minimalista con carácter'],
      arquetipo: arquetipo || 'La Profesional con Encanto',
      sensacionProyectar: 'Confianza accesible, profesional pero cercana'
    },
    presupuesto: {
      nivel: presupuesto,
      comprasPrioritarias: [
        { prenda: 'Blusa de seda en color protagonista', razon: 'Piezas superiores definen el look', rangoPrecio: '$$$' },
        { prenda: 'Pantalón de calidad en tono neutro', razon: 'Base versátil para múltiples outfits', rangoPrecio: '$$' }
      ],
      invertir: [
        { prenda: 'Blazer bien cortado', razon: 'Eleva cualquier conjunto', rangoPrecio: '$$$-$$$$' },
        { prenda: 'Bolso de cuero', razon: 'Piezas de uso diario', rangoPrecio: '$$$-$$$$' }
      ],
      economicas: [
        { prenda: 'Camisetas básicas', dondeAhorrar: 'Materiales sintéticos de buena calidad', rangoPrecio: '$' },
        { prenda: 'Accesorios', dondeAhorrar: 'Bisutería de calidad', rangoPrecio: '$' }
      ],
      puedeEsperar: ['Vestidos de fiesta', 'Zapatos de tacón alto']
    },
    closet: {
      yaTienes: [
        { prenda: 'Jeans oscuros', comoUsar: 'Con blusa de seda y blazer', combinaCon: ['#C4863B', '#8B5A2B'] },
        { prenda: 'Blazer negro', comoUsar: 'Con accesorios dorados', combinaCon: ['#D4A473', '#CD853F'] }
      ],
      teSirve: [
        { prenda: 'Blusas blancas', comoAdaptar: 'Combinar con pañuelo en tonos tierra' }
      ],
      combinaloAsi: [
        { prenda: 'Jean oscuro', combinacion: 'Con blusa ocre y blazer camel', colores: ['#C4863B', '#D4A473', '#F5DEB3'] }
      ],
      teFalta: [
        'Blusa de seda en color protagonista',
        'Pantalón palazzo en tono neutro',
        'Bolso structurado en cuero'
      ],
      noEsPrioridad: [
        'Ropa de fiesta elaborada',
        'Accesorios muy llamativos'
      ]
    },
    ocasiones: [
      {
        nombre: 'Trabajo/Oficina',
        prioridad: 10,
        looks: [
          {
            nombre: 'Power Casual',
            piezas: 'Blazer camel · Blusa seda ocre · Pantalón slim navy · Bailarinas o mocasines dorados · Bolso tote café',
            colores: ['#C4863B', '#D4A473', '#8B5A2B'],
            sensacion: 'Profesional pero accesible',
            descripcion: 'Un look que transmite competencia sin ser intimidante'
          }
        ]
      },
      {
        nombre: 'Citas/Salidas',
        prioridad: 8,
        looks: [
          {
            nombre: 'Elegancia Cálida',
            piezas: 'Vestido slip en tono caramelo · Abrigo structurado · Tacón bloque dorado · Pendientes aro · Mini bolso cadena',
            colores: ['#D4A473', '#CD853F', '#F5DEB3'],
            sensacion: 'Sofisticada y segura',
            descripcion: 'Perfecto para una cena o evento casual elegante'
          }
        ]
      },
      {
        nombre: 'Día a Día',
        prioridad: 9,
        looks: [
          {
            nombre: 'Weekend Chic',
            piezas: 'Camisa lino beige · Jeans oscuro · Ábito corto denim · Sneakers blancas · Bolso crossbody cuero',
            colores: ['#F5DEB3', '#8B5A2B', '#D4A473'],
            sensacion: 'Relajada pero con intención',
            descripcion: 'Transiciones perfectamente de día a tarde'
          }
        ]
      }
    ],
    joyeria: {
      metal: metal.toLowerCase().includes('plata') ? 'plata' : 'oro',
      acabados: ['Bruñido', 'Satinado', 'Mate'],
      tipos: ['Aros colgantes', 'Collares delicados', 'Pulseras finas'],
      piedras: ['Ágata', 'Turquesa', 'Cornalina', 'Ónix'],
      explicacion: `El ${metal} complementa tu subtono y aporta calidez a tu look`
    },
    perfil: {
      descubrimiento: 'Tienes una paleta cálida con profundidad media que te permite usar colores tierra y tonos quemados',
      explicacion: 'Tu subtono cálido se manifiesta en cómo los colores dorados y ocres iluminan tu rostro',
      coloresFavorecen: 'Los tonos tierra, ocres y dorados son tus colores protagonistas porque reflejan tu subtono cálido',
      coloresConservar: 'Jeans oscuros, negro, blanco, beige arena',
      coloresDejar: 'Plata puro, lavanda, rosa pastel intenso',
      prendasFavorecen: 'Piezas con drapeado suave, cinturas definidas, tejidos naturales',
      prendasComprar: 'Blusa de seda ocre, pantalón palazzo camel, bolso de cuero',
      prioridadCompras: '1. Blusa protagonista, 2. Pantalón versátil, 3. Accesorios dorados',
      looksPrincipales: 'Power Casual para trabajo, Elegancia Cálida para citas, Weekend Chic para día a día',
      imagenDeseada: 'Proyecta sofisticación accesible: alguien que se preocupa por su apariencia pero no de forma extrema'
    }
  };

  return {
    success: true,
    data: mockData,
    processingTime: 150
  };
}

/**
 * Convert style analysis to PDF-compatible format
 */
export function convertToPdfFormat(analysis: StyleAnalysisResponse) {
  if (!analysis.success || !analysis.data) {
    return null;
  }

  const data = analysis.data;

  return {
    season: {
      name: data.analisisColor.estacion + (data.analisisColor.subestacion ? ` ${data.analisisColor.subestacion}` : ''),
      subtitle: `${data.analisisColor.estacion} · ${data.analisisColor.subtono} · ${data.analisisColor.profundidad}`,
      undertone: data.analisisColor.subtono,
      depth: data.analisisColor.profundidad,
      contrast: data.analisisColor.contraste,
      temperature: data.analisisColor.subtono === 'cálido' ? 'Cálida' : data.analisisColor.subtono === 'frío' ? 'Fría' : 'Neutra'
    },
    palette: {
      protagonist: data.analisisColor.paleta.protagonistas.map(c => c.hex),
      secondary: data.analisisColor.paleta.secundarios.map(c => c.hex),
      neutral: data.analisisColor.paleta.neutros.map(c => c.hex),
      accent: data.analisisColor.paleta.acento.map(c => c.hex),
      avoid: data.analisisColor.paleta.evitar.map(c => c.hex)
    },
    silhouette: {
      name: data.silueta.tipoCuerpo,
      recommendations: {
        favor: data.silueta.prendasFavorecen,
        evitar: data.silueta.prendasEvitar
      },
      escotes: data.silueta.escotes,
      cortes: data.silueta.cortes
    },
    style: {
      principal: data.estilo.principal,
      secundarios: data.estilo.secundarios,
      arquetipo: data.estilo.arquetipo,
      sensacion: data.estilo.sensacionProyectar
    },
    budget: data.presupuesto,
    closet: data.closet,
    occasions: data.ocasiones,
    jewelry: data.joyeria,
    profile: data.perfil,
    prysmScore: Math.round((data.analisisColor.confianza * 0.3 + 0.7) * 10 * 10) / 10
  };
}

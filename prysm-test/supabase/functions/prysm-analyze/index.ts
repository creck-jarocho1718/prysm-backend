/**
 * PRYSM Style Analysis Edge Function
 * Securely calls OpenAI for style analysis
 *
 * API Key is stored in secrets, never exposed to frontend
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// System prompt for style analysis
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

/**
 * Build user context from questionnaire answers
 */
function buildUserContext(answers: Record<string, unknown>): string {
  const lines: string[] = [];

  // Q1: Cómo se describe
  if (answers.q1 || answers.feeling) {
    lines.push(`1. Cómo se describe: ${answers.q1 || answers.feeling}`);
  }

  // Q2: Tipo de cuerpo
  if (answers.q2 || answers.silhouette) {
    lines.push(`2. Tipo de cuerpo: ${answers.q2 || answers.silhouette}`);
  }

  // Q3: Budget
  if (answers.q3 || answers.budget) {
    lines.push(`3. Presupuesto: ${answers.q3 || answers.budget}`);
  }

  // Q4: Colores y prendas del closet
  if (answers.q4 || answers['colors-closet']) {
    const colors = Array.isArray(answers.q4) ? answers.q4.join(', ') :
                  Array.isArray(answers['colors-closet']) ? (answers['colors-closet'] as string[]).join(', ') :
                  answers.q4 || answers['colors-closet'] || '';
    lines.push(`4. Colores en su closet: ${colors}`);
  }

  // Q5: Metal preferido
  if (answers.q5 || answers.metal) {
    lines.push(`5. Metal preferido: ${answers.q5 || answers.metal}`);
  }

  // Q6: Estilo
  if (answers.q6 || answers.style) {
    const styles = Array.isArray(answers.q6) ? answers.q6.join(', ') :
                  Array.isArray(answers.style) ? (answers.style as string[]).join(', ') :
                  answers.q6 || answers.style || '';
    lines.push(`6. Estilo: ${styles}`);
  }

  // Q7: Ocasiones
  if (answers.q7 || answers.occasions) {
    const occasions = Array.isArray(answers.q7) ? answers.q7.join(', ') :
                    Array.isArray(answers.occasions) ? (answers.occasions as string[]).join(', ') :
                    answers.q7 || answers.occasions || '';
    lines.push(`7. Ocasiones para ropa: ${occasions}`);
  }

  // Q8: Arquetipo/Look
  if (answers.q8 || answers.archetype) {
    lines.push(`8. Arquetipo/Look de referencia: ${answers.q8 || answers.archetype}`);
  }

  return lines.join('\n');
}

serve(async (req) => {
  const startTime = Date.now();

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Get OpenAI API key from secrets
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAiKey) {
      console.error('[PRYSM API] OpenAI API key not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'OpenAI API no está configurada' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body = await req.json();
    const { photos = [], answers = {}, skinAnalysis } = body;

    console.log('[PRYSM API] Request received');
    console.log('[PRYSM API] Photos received:', photos.length);
    console.log('[PRYSM API] Quiz answers received:', Object.keys(answers).length > 0);

    if (!answers || Object.keys(answers).length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'Se requieren las respuestas del cuestionario' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build user context from answers
    const userContext = buildUserContext(answers);

    // Create analysis prompt
    const analysisPrompt = `Analiza la siguiente información del usuario y genera un perfil de estilo personalizado completo.

INFORMACIÓN DEL USUARIO:
${userContext}

${photos.length > 0 ? `
NOTA: El usuario ha proporcionado ${photos.length} fotografía(s). Las fotografías contienen información visual importante sobre:
- Tono de piel real
- Color y tono de cabello
- Color de ojos
- Proporciones faciales
- Forma del rostro
- Tipo de cuerpo visible

El análisis de color debe basarse principalmente en la evidencia visual de las fotografías.
` : ''}

Responde SOLO con el JSON válido, sin texto adicional ni explicaciones.`;

    console.log('[PRYSM API] Calling OpenAI...');

    // Call OpenAI API
    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openAiKey}`
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

    if (!openAiResponse.ok) {
      const errorData = await openAiResponse.json().catch(() => ({}));
      console.error('[PRYSM API] OpenAI error:', errorData);
      throw new Error(errorData.error?.message || `OpenAI API error: ${openAiResponse.status}`);
    }

    const result = await openAiResponse.json();
    const content = result.choices?.[0]?.message?.content;

    if (!content) {
      console.error('[PRYSM API] No content in OpenAI response');
      throw new Error('No content in OpenAI response');
    }

    console.log('[PRYSM API] OpenAI response received');

    // Parse the JSON response
    const analysisData = JSON.parse(content);

    const processingTime = Date.now() - startTime;

    // Log verification results
    console.log('[PRYSM API] GPT season:', analysisData.analisisColor?.estacion);
    console.log('[PRYSM API] GPT palette colors:', analysisData.analisisColor?.paleta?.protagonistas?.length || 0);
    console.log('[PRYSM API] GPT silhouette:', analysisData.silueta?.tipoCuerpo);
    console.log('[PRYSM API] GPT style:', analysisData.estilo?.principal?.nombre);
    console.log('[PRYSM API] Processing time:', processingTime + 'ms');

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisData,
        processingTime,
        verification: {
          photosIncluded: photos.length > 0,
          photosCount: photos.length,
          answersIncluded: Object.keys(answers).length > 0,
          season: analysisData.analisisColor?.estacion,
          paletteColors: analysisData.analisisColor?.paleta?.protagonistas?.length || 0,
          silhouette: analysisData.silueta?.tipoCuerpo,
          style: analysisData.estilo?.principal?.nombre
        }
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('[PRYSM API] Analysis failed:', error);

    return new Response(
      JSON.stringify({
        success: false,
        error: 'No pudimos completar tu análisis. Intenta nuevamente.',
        retryable: true
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

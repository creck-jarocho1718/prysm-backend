/**
 * PRYSM Backend Server
 * Secure API for OpenAI style analysis
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '50mb' }));

const log = {
  info: (message, data) => console.log(`[PRYSM] ${message}`, data || ''),
  error: (message, error) => console.error(`[PRYSM ERROR] ${message}`, error)
};

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const SYSTEM_PROMPT = `Eres el motor de análisis de imagen y estilo de PRYSM. Tu función es analizar de forma integral la información proporcionada por el usuario y generar un perfil de estilo personalizado. IMPORTANTE: Devuelve SOLO JSON válido, sin texto adicional. Analiza colores basándote en las fotografías proporcionadas, determina estación cromática (Primavera, Verano, Otoño, Invierno), genera paleta de colores con hex codes, recomienda silueta, estilo, presupuesto, closet, ocasiones y joyería. Formato de respuesta: { "analisisColor": { "subtono": "...", "estacion": "...", "paleta": { "protagonistas": [{"hex": "#HEX", "nombre": "...", "explicacion": "..."}], "secundarios": [], "neutros": [], "acento": [], "evitar": [] } }, "silueta": { "tipoCuerpo": "...", "cortes": [], "prendasFavorecen": [], "prendasEvitar": [] }, "estilo": { "principal": {"nombre": "...", "descripcion": "..."}, "secundarios": [], "arquetipo": "..." }, "presupuesto": { "nivel": "...", "comprasPrioritarias": [], "invertir": [], "economicas": [] }, "closet": { "yaTienes": [], "teFalta": [] }, "ocasiones": [{"nombre": "...", "looks": [{"nombre": "...", "piezas": "...", "colores": []}]}], "joyeria": { "metal": "...", "acabados": [] }, "perfil": { "descubrimiento": "...", "explicacion": "..." } }`;

function buildUserContext(answers) {
  const lines = [];
  if (answers.q1) lines.push(`Cómo se describe: ${answers.q1}`);
  if (answers.q2) lines.push(`Tipo de cuerpo: ${answers.q2}`);
  if (answers.q3) lines.push(`Presupuesto: ${answers.q3}`);
  if (answers.q4) lines.push(`Colores en closet: ${Array.isArray(answers.q4) ? answers.q4.join(', ') : answers.q4}`);
  if (answers.q5) lines.push(`Metal preferido: ${answers.q5}`);
  if (answers.q6) lines.push(`Estilo: ${Array.isArray(answers.q6) ? answers.q6.join(', ') : answers.q6}`);
  if (answers.q7) lines.push(`Ocasiones: ${Array.isArray(answers.q7) ? answers.q7.join(', ') : answers.q7}`);
  if (answers.q8) lines.push(`Arquetipo: ${answers.q8}`);
  return lines.join('\n');
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', openaiConfigured: !!OPENAI_API_KEY });
});

app.post('/api/analyze', async (req, res) => {
  const startTime = Date.now();
  log.info('OpenAI request started');

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ success: false, error: 'OpenAI API no configurada' });
  }

  let photos = req.body.photos || [];
  let answers = req.body.answers || {};

  if (!answers || Object.keys(answers).length === 0) {
    return res.status(400).json({ success: false, error: 'Se requieren respuestas del cuestionario' });
  }

  const userContext = buildUserContext(answers);
  const analysisPrompt = `Analiza al usuario y genera un perfil de estilo personalizado.\n\nINFORMACIÓN:\n${userContext}\n\n${photos.length > 0 ? `El usuario ha proporcionado ${photos.length} fotografía(s) para análisis visual.` : ''}\n\nResponde SOLO con JSON válido.`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${OPENAI_API_KEY}` },
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

    if (!content) throw new Error('No content in OpenAI response');

    const analysisData = JSON.parse(content);
    log.info('GPT season:', analysisData.analisisColor?.estacion);
    log.info('Processing time:', Date.now() - startTime + 'ms');

    return res.json({
      success: true,
      data: analysisData,
      processingTime: Date.now() - startTime,
      verification: { photosIncluded: photos.length > 0, season: analysisData.analisisColor?.estacion }
    });

  } catch (error) {
    log.error('Analysis failed:', error.message);
    return res.status(500).json({ success: false, error: 'No pudimos completar tu análisis. Intenta nuevamente.' });
  }
});

app.listen(PORT, () => {
  log.info(`PRYSM Backend running on port ${PORT}`);
  log.info(`OpenAI configured: ${!!OPENAI_API_KEY}`);
});

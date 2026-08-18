/**
 * Color Analysis Service
 * Uses Canvas API for pixel sampling + colorimetry algorithms
 * to determine skin tone characteristics
 */

// Face zones to sample for skin color analysis
const ZONES = [
  { name: 'forehead', x: 0.5, y: 0.2, w: 0.3, h: 0.15 },
  { name: 'left_cheek', x: 0.3, y: 0.45, w: 0.2, h: 0.15 },
  { name: 'right_cheek', x: 0.5, y: 0.45, w: 0.2, h: 0.15 },
  { name: 'nose_bridge', x: 0.5, y: 0.42, w: 0.1, h: 0.1 }
];

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }

  return { h: h * 360, s: s, l: l };
}

/**
 * Convert RGB to Hex
 */
function rgbToHex(r, g, b) {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Determine undertone based on R vs B comparison
 */
function determineUndertone(r, b) {
  const diff = r - b;
  if (diff > 15) return 'warm';
  if (diff < -15) return 'cool';
  return 'neutral';
}

/**
 * Determine depth based on luminosity
 */
function determineDepth(l) {
  if (l > 0.60) return 'light';
  if (l < 0.38) return 'deep';
  return 'medium';
}

/**
 * Determine saturation level
 */
function determineSaturation(s) {
  if (s > 0.5) return 'high';
  if (s < 0.25) return 'low';
  return 'medium';
}

/**
 * Determine contrast level
 */
function determineContrast(s) {
  if (s > 0.45) return 'high';
  if (s < 0.2) return 'low';
  return 'medium';
}

/**
 * Remove outliers from pixel data (remove very dark or very light pixels)
 */
function filterPixels(pixels) {
  return pixels.filter(p => {
    const brightness = (p.r + p.g + p.b) / 3;
    return brightness > 30 && brightness < 220;
  });
}

/**
 * Sample pixels from image using zones
 */
function samplePixels(imageData, width, height, zones) {
  const pixels = [];

  for (const zone of zones) {
    const startX = Math.floor(zone.x * width - (zone.w * width) / 2);
    const startY = Math.floor(zone.y * height - (zone.h * height) / 2);
    const zoneWidth = Math.floor(zone.w * width);
    const zoneHeight = Math.floor(zone.h * height);

    for (let y = startY; y < startY + zoneHeight && y < height; y++) {
      for (let x = startX; x < startX + zoneWidth && x < width; x++) {
        const i = (y * width + x) * 4;
        pixels.push({
          r: imageData.data[i],
          g: imageData.data[i + 1],
          b: imageData.data[i + 2]
        });
      }
    }
  }

  return pixels;
}

/**
 * Calculate average color from pixels
 */
function averageColor(pixels) {
  if (pixels.length === 0) return { r: 128, g: 128, b: 128 };

  let r = 0, g = 0, b = 0;
  for (const p of pixels) {
    r += p.r;
    g += p.g;
    b += p.b;
  }

  return {
    r: r / pixels.length,
    g: g / pixels.length,
    b: b / pixels.length
  };
}

/**
 * Main analysis function
 * Input: base64 image string
 * Output: { skinColor, undertone, depth, saturation, contrast }
 */
async function analyzeSkinColor(imageData) {
  try {
    // If imageData is a string (base64), it needs to be loaded in browser context
    // For Node.js, we'll accept raw pixel data directly
    if (typeof imageData === 'string') {
      // In browser context, this will be handled differently
      // Return a mock for now - actual implementation uses Canvas in frontend
      throw new Error('Image data must be processed in browser context');
    }

    const { data, width, height } = imageData;
    const pixels = samplePixels({ data }, width, height, ZONES);
    const filteredPixels = filterPixels(pixels);
    const avg = averageColor(filteredPixels);

    const hsl = rgbToHsl(avg.r, avg.g, avg.b);

    return {
      skinColor: rgbToHex(avg.r, avg.g, avg.b),
      undertone: determineUndertone(avg.r, avg.b),
      depth: determineDepth(hsl.l),
      saturation: determineSaturation(hsl.s),
      contrast: determineContrast(hsl.s),
      // Additional info for debugging
      raw: {
        rgb: { r: Math.round(avg.r), g: Math.round(avg.g), b: Math.round(avg.b) },
        hsl: { h: Math.round(hsl.h), s: Math.round(hsl.s * 100), l: Math.round(hsl.l * 100) }
      }
    };
  } catch (error) {
    console.error('Color analysis error:', error);
    throw error;
  }
}

/**
 * Fallback analysis using quiz answers
 */
function analyzeFromQuizAnswers(answers) {
  const skinTone = answers.skinTone || 'medium';
  const undertone = answers.undertone || 'neutral';

  let depth = 'medium';
  if (skinTone.includes('clara') || skinTone.includes('muy')) depth = 'light';
  if (skinTone.includes('oscura')) depth = 'deep';

  return {
    undertone,
    depth,
    saturation: 'medium',
    contrast: 'medium',
    source: 'quiz_fallback'
  };
}

module.exports = {
  analyzeSkinColor,
  analyzeFromQuizAnswers,
  rgbToHsl,
  rgbToHex,
  determineUndertone,
  determineDepth,
  determineSaturation,
  samplePixels,
  averageColor,
  ZONES
};

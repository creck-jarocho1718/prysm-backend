/**
 * Color Analysis Service (Frontend - uses Canvas API)
 * Extracts skin tone characteristics from uploaded photos
 */

// Face zones to sample for skin color analysis
const ANALYSIS_ZONES = [
  { name: 'forehead', x: 0.5, y: 0.18, w: 0.35, h: 0.12 },
  { name: 'left_cheek', x: 0.32, y: 0.45, w: 0.18, h: 0.12 },
  { name: 'right_cheek', x: 0.68, y: 0.45, w: 0.18, h: 0.12 },
  { name: 'nose_bridge', x: 0.5, y: 0.42, w: 0.08, h: 0.08 }
];

export interface SkinAnalysisResult {
  skinColor: string;        // Hex color of detected skin
  undertone: 'warm' | 'cool' | 'neutral';
  depth: 'light' | 'medium' | 'deep';
  saturation: 'low' | 'medium' | 'high';
  contrast: 'low' | 'medium' | 'high';
  confidence: number;        // 0-1 confidence score
  raw: {
    rgb: { r: number; g: number; b: number };
    hsl: { h: number; s: number; l: number };
  };
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
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
function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('').toUpperCase();
}

/**
 * Determine undertone based on R vs B comparison and color analysis
 */
function determineUndertone(r: number, g: number, b: number): 'warm' | 'cool' | 'neutral' {
  // Classic method: compare red vs blue
  const rbDiff = r - b;

  // Additional check: warm tones have more yellow/golden
  const warmScore = (r * 0.5 + g * 0.4 - b * 0.1);
  const coolScore = (b * 0.6 + g * 0.3 - r * 0.1);

  // Check for golden/yellow undertones
  const isYellowish = g > r * 0.85 && g > b * 1.1;
  const isPinkish = b > r * 0.8 && b > g * 0.9;

  if (rbDiff > 12 || (isYellowish && warmScore > coolScore)) {
    return 'warm';
  }
  if (rbDiff < -12 || (isPinkish && coolScore > warmScore)) {
    return 'cool';
  }
  return 'neutral';
}

/**
 * Determine depth based on luminosity
 */
function determineDepth(l: number): 'light' | 'medium' | 'deep' {
  if (l > 0.60) return 'light';
  if (l < 0.38) return 'deep';
  return 'medium';
}

/**
 * Determine saturation level
 */
function determineSaturation(s: number): 'low' | 'medium' | 'high' {
  if (s > 0.45) return 'high';
  if (s < 0.20) return 'low';
  return 'medium';
}

/**
 * Determine contrast level
 */
function determineContrast(s: number): 'low' | 'medium' | 'high' {
  if (s > 0.40) return 'high';
  if (s < 0.18) return 'low';
  return 'medium';
}

/**
 * Filter out non-skin pixels (too dark, too light, or unusual colors)
 */
function filterSkinPixels(pixels: { r: number; g: number; b: number }[]): { r: number; g: number; b: number }[] {
  return pixels.filter(p => {
    const brightness = (p.r + p.g + p.b) / 3;
    // Filter extreme brightness
    if (brightness < 35 || brightness > 215) return false;

    // Filter unusual colors (not skin-like)
    const sat = Math.max(p.r, p.g, p.b) - Math.min(p.r, p.g, p.b);
    if (sat > 100) {
      // High saturation - might be clothing or background
      // But allow warm tones (possible skin with color)
      const isWarm = p.r > p.g && p.g > p.b;
      if (!isWarm) return false;
    }

    // Filter greenish (likely background or filter)
    if (p.g > p.r * 1.1 && p.g > p.b * 1.1) return false;

    // Filter blueish on dark pixels (likely shadow or background)
    if (brightness < 80 && p.b > p.r) return false;

    return true;
  });
}

/**
 * Sample pixels from image using zones
 */
function samplePixels(imageData: ImageData, zones: typeof ANALYSIS_ZONES): { r: number; g: number; b: number }[] {
  const pixels: { r: number; g: number; b: number }[] = [];
  const { width, height, data } = imageData;

  for (const zone of zones) {
    const startX = Math.floor(zone.x * width - (zone.w * width) / 2);
    const startY = Math.floor(zone.y * height - (zone.h * height) / 2);
    const zoneWidth = Math.floor(zone.w * width);
    const zoneHeight = Math.floor(zone.h * height);

    // Sample every other pixel for performance
    for (let y = startY; y < Math.min(startY + zoneHeight, height); y += 2) {
      for (let x = startX; x < Math.min(startX + zoneWidth, width); x += 2) {
        const i = (y * width + x) * 4;
        pixels.push({
          r: data[i],
          g: data[i + 1],
          b: data[i + 2]
        });
      }
    }
  }

  return pixels;
}

/**
 * Calculate average and median color from pixels
 */
function calculateAverageColor(pixels: { r: number; g: number; b: number }[]): { r: number; g: number; b: number } {
  if (pixels.length === 0) return { r: 128, g: 128, b: 128 };

  // Use weighted average to reduce outlier impact
  let r = 0, g = 0, b = 0;
  let totalWeight = 0;

  for (const p of pixels) {
    // Weight by how "skin-like" the pixel is
    const brightness = (p.r + p.g + p.b) / 3;
    const weight = brightness > 50 && brightness < 200 ? 1.5 : 1;

    r += p.r * weight;
    g += p.g * weight;
    b += p.b * weight;
    totalWeight += weight;
  }

  return {
    r: r / totalWeight,
    g: g / totalWeight,
    b: b / totalWeight
  };
}

/**
 * Main analysis function - analyzes a base64 image and extracts skin tone
 */
export async function analyzePhoto(imageBase64: string): Promise<SkinAnalysisResult> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      try {
        // Create canvas and draw image
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          reject(new Error('Could not create canvas context'));
          return;
        }

        // Scale down for performance (max 400px)
        const maxSize = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);

        // Sample pixels from face zones
        const sampledPixels = samplePixels(imageData, ANALYSIS_ZONES);

        // Filter to keep only skin-like pixels
        const skinPixels = filterSkinPixels(sampledPixels);

        // If not enough skin pixels found, use all sampled pixels
        const pixelsToUse = skinPixels.length > 20 ? skinPixels : sampledPixels;

        if (pixelsToUse.length < 10) {
          // Not enough data - use a more relaxed filter
          const relaxedPixels = filterSkinPixels(sampledPixels.map(p => ({
            r: p.r,
            g: p.g,
            b: p.b
          })));
          pixelsToUse.length > 0 ? pixelsToUse : sampledPixels;
        }

        // Calculate average color
        const avg = calculateAverageColor(pixelsToUse);

        // Convert to HSL
        const hsl = rgbToHsl(avg.r, avg.g, avg.b);

        // Determine characteristics
        const undertone = determineUndertone(avg.r, avg.g, avg.b);
        const depth = determineDepth(hsl.l);
        const saturation = determineSaturation(hsl.s);
        const contrast = determineContrast(hsl.s);

        // Calculate confidence based on pixel count and variance
        const confidence = Math.min(pixelsToUse.length / 100, 1) *
          (1 - calculateVariance(pixelsToUse) / 1000);

        resolve({
          skinColor: rgbToHex(avg.r, avg.g, avg.b),
          undertone,
          depth,
          saturation,
          contrast,
          confidence: Math.max(0.3, Math.min(1, confidence)),
          raw: {
            rgb: {
              r: Math.round(avg.r),
              g: Math.round(avg.g),
              b: Math.round(avg.b)
            },
            hsl: {
              h: Math.round(hsl.h),
              s: Math.round(hsl.s * 100),
              l: Math.round(hsl.l * 100)
            }
          }
        });
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };

    img.src = imageBase64;
  });
}

/**
 * Calculate color variance in pixels (lower = more consistent)
 */
function calculateVariance(pixels: { r: number; g: number; b: number }[]): number {
  if (pixels.length < 2) return 0;

  const meanR = pixels.reduce((sum, p) => sum + p.r, 0) / pixels.length;
  const meanG = pixels.reduce((sum, p) => sum + p.g, 0) / pixels.length;
  const meanB = pixels.reduce((sum, p) => sum + p.b, 0) / pixels.length;

  const varianceR = pixels.reduce((sum, p) => sum + Math.pow(p.r - meanR, 2), 0) / pixels.length;
  const varianceG = pixels.reduce((sum, p) => sum + Math.pow(p.g - meanG, 2), 0) / pixels.length;
  const varianceB = pixels.reduce((sum, p) => sum + Math.pow(p.b - meanB, 2), 0) / pixels.length;

  return (varianceR + varianceG + varianceB) / 3;
}

/**
 * Analyze multiple photos and combine results
 */
export async function analyzePhotos(photosBase64: string[]): Promise<{
  primary: SkinAnalysisResult;
  allResults: SkinAnalysisResult[];
  combined: SkinAnalysisResult;
}> {
  if (photosBase64.length === 0) {
    throw new Error('No photos to analyze');
  }

  // Analyze each photo
  const results: SkinAnalysisResult[] = [];

  for (const photo of photosBase64) {
    try {
      const result = await analyzePhoto(photo);
      results.push(result);
    } catch (error) {
      console.warn('Failed to analyze photo:', error);
    }
  }

  if (results.length === 0) {
    throw new Error('Failed to analyze any photos');
  }

  // Use the highest confidence result as primary
  const primary = results.reduce((best, current) =>
    current.confidence > best.confidence ? current : best
  );

  // Combine results by averaging
  const combined = combineResults(results);

  return {
    primary,
    allResults: results,
    combined
  };
}

/**
 * Combine multiple analysis results
 */
function combineResults(results: SkinAnalysisResult[]): SkinAnalysisResult {
  // Weight by confidence
  let totalWeight = 0;
  let r = 0, g = 0, b = 0;
  let warmVotes = 0, coolVotes = 0, neutralVotes = 0;
  let lightVotes = 0, mediumVotes = 0, deepVotes = 0;

  for (const result of results) {
    const weight = result.confidence;
    totalWeight += weight;

    r += result.raw.rgb.r * weight;
    g += result.raw.rgb.g * weight;
    b += result.raw.rgb.b * weight;

    // Vote for undertone
    if (result.undertone === 'warm') warmVotes += weight;
    else if (result.undertone === 'cool') coolVotes += weight;
    else neutralVotes += weight;

    // Vote for depth
    if (result.depth === 'light') lightVotes += weight;
    else if (result.depth === 'deep') deepVotes += weight;
    else mediumVotes += weight;
  }

  r /= totalWeight;
  g /= totalWeight;
  b /= totalWeight;

  const avgHsl = rgbToHsl(r, g, b);

  // Determine majority votes
  const undertone: 'warm' | 'cool' | 'neutral' =
    warmVotes > coolVotes && warmVotes > neutralVotes ? 'warm' :
    coolVotes > warmVotes && coolVotes > neutralVotes ? 'cool' : 'neutral';

  const depth: 'light' | 'medium' | 'deep' =
    lightVotes > mediumVotes && lightVotes > deepVotes ? 'light' :
    deepVotes > lightVotes && deepVotes > mediumVotes ? 'deep' : 'medium';

  const saturation = determineSaturation(avgHsl.s);
  const contrast = determineContrast(avgHsl.s);

  return {
    skinColor: rgbToHex(r, g, b),
    undertone,
    depth,
    saturation,
    contrast,
    confidence: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
    raw: {
      rgb: { r: Math.round(r), g: Math.round(g), b: Math.round(b) },
      hsl: {
        h: Math.round(avgHsl.h),
        s: Math.round(avgHsl.s * 100),
        l: Math.round(avgHsl.l * 100)
      }
    }
  };
}

/**
 * Get season recommendation based on analysis
 */
export function getSeasonRecommendation(analysis: SkinAnalysisResult): {
  undertone: string;
  depth: string;
  temperature: string;
  description: string;
} {
  const undertoneLabels = {
    warm: 'Cálido (subtón dorado/amarillo)',
    cool: 'Frío (subtón rosa/azul)',
    neutral: 'Neutro (puede usar ambos)'
  };

  const depthLabels = {
    light: 'Claro',
    medium: 'Medio',
    deep: 'Profundo'
  };

  let temperature = 'neutral';
  if (analysis.undertone === 'warm') temperature = 'warm';
  else if (analysis.undertone === 'cool') temperature = 'cool';

  return {
    undertone: undertoneLabels[analysis.undertone],
    depth: depthLabels[analysis.depth],
    temperature,
    description: `Tono de piel ${depthLabels[analysis.depth]} con subtón ${analysis.undertone}. ` +
      `Color detectado: ${analysis.skinColor} (RGB: ${analysis.raw.rgb.r}, ${analysis.raw.rgb.g}, ${analysis.raw.rgb.b})`
  };
}

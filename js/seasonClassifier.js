/**
 * 12-Season Color Classification Engine
 * Classifies skin undertone, depth, and contrast from LAB values
 * and maps to one of 12 color seasons.
 */

import { labToHue, labChroma } from './colorConversion.js';

/**
 * Classification thresholds — tunable constants.
 * These are the primary knobs to adjust for accuracy.
 */
const THRESHOLDS = {
  // Undertone (based on b* and hue angle)
  undertone: {
    warmBMin: 12,       // b* > this → warm candidate
    coolAMin: 8,        // a* > this with low b* → cool candidate
    warmHueMin: 40,     // Hue angle range for warm
    warmHueMax: 85,
    coolHueMin: 0,      // Hue angle range for cool
    coolHueMax: 45,
  },
  // Depth (based on L* lightness)
  depth: {
    lightMin: 62,       // L* > this → light
    deepMax: 42,        // L* < this → deep
  },
  // Contrast/Chroma (based on sqrt(a²+b²))
  contrast: {
    highMin: 22,        // Chroma > this → high (bright/clear)
    lowMax: 13,         // Chroma < this → low (soft/muted)
  },
};

/**
 * Determine undertone from LAB values.
 * @returns {{ category: 'warm'|'cool'|'neutral', score: number, rawHue: number, rawB: number }}
 */
export function classifyUndertone(lab) {
  const hue = labToHue(lab);
  const bVal = lab.b;
  const aVal = lab.a;

  // Warm: high b* (yellow/golden) with hue in warm range
  const warmSignal =
    bVal > THRESHOLDS.undertone.warmBMin &&
    hue >= THRESHOLDS.undertone.warmHueMin &&
    hue <= THRESHOLDS.undertone.warmHueMax;

  // Cool: higher a* (pink/rose) with hue in cool range or low b*
  const coolSignal =
    aVal > THRESHOLDS.undertone.coolAMin &&
    (hue < THRESHOLDS.undertone.coolHueMax || bVal < THRESHOLDS.undertone.warmBMin * 0.7);

  let category, score;

  if (warmSignal && !coolSignal) {
    category = 'warm';
    // Score: how far into warm territory (0-1)
    score = Math.min(1, (bVal - THRESHOLDS.undertone.warmBMin) / 20);
  } else if (coolSignal && !warmSignal) {
    category = 'cool';
    score = Math.min(1, (aVal - THRESHOLDS.undertone.coolAMin) / 15);
  } else {
    category = 'neutral';
    // Score for neutral: how close to the boundary (lower = more neutral)
    score = 1 - Math.min(1, Math.max(
      Math.abs(bVal - THRESHOLDS.undertone.warmBMin) / 15,
      Math.abs(aVal - THRESHOLDS.undertone.coolAMin) / 12
    ));
  }

  return { category, score: Math.max(0, Math.min(1, score)), rawHue: hue, rawB: bVal, rawA: aVal };
}

/**
 * Determine depth (light/medium/deep) from L* value.
 * @returns {{ category: 'light'|'medium'|'deep', score: number, rawL: number }}
 */
export function classifyDepth(lab) {
  const L = lab.l;
  let category, score;

  if (L > THRESHOLDS.depth.lightMin) {
    category = 'light';
    score = Math.min(1, (L - THRESHOLDS.depth.lightMin) / 25);
  } else if (L < THRESHOLDS.depth.deepMax) {
    category = 'deep';
    score = Math.min(1, (THRESHOLDS.depth.deepMax - L) / 20);
  } else {
    category = 'medium';
    // How centered in the medium range
    const mid = (THRESHOLDS.depth.lightMin + THRESHOLDS.depth.deepMax) / 2;
    const range = (THRESHOLDS.depth.lightMin - THRESHOLDS.depth.deepMax) / 2;
    score = 1 - Math.abs(L - mid) / range;
  }

  return { category, score: Math.max(0, Math.min(1, score)), rawL: L };
}

/**
 * Determine contrast/clarity from chroma value.
 * @returns {{ category: 'high'|'medium'|'low', score: number, rawChroma: number }}
 */
export function classifyContrast(lab) {
  const chroma = labChroma(lab);
  let category, score;

  if (chroma > THRESHOLDS.contrast.highMin) {
    category = 'high';
    score = Math.min(1, (chroma - THRESHOLDS.contrast.highMin) / 15);
  } else if (chroma < THRESHOLDS.contrast.lowMax) {
    category = 'low';
    score = Math.min(1, (THRESHOLDS.contrast.lowMax - chroma) / 10);
  } else {
    category = 'medium';
    const mid = (THRESHOLDS.contrast.highMin + THRESHOLDS.contrast.lowMax) / 2;
    const range = (THRESHOLDS.contrast.highMin - THRESHOLDS.contrast.lowMax) / 2;
    score = 1 - Math.abs(chroma - mid) / range;
  }

  return { category, score: Math.max(0, Math.min(1, score)), rawChroma: chroma };
}

/**
 * Map undertone + depth + contrast to a 12-season key.
 * Returns the season key matching SEASONS in palettes.js.
 */
export function mapToSeason(undertone, depth, contrast) {
  const u = undertone.category;
  const d = depth.category;
  const c = contrast.category;

  // === WARM SEASONS ===
  if (u === 'warm') {
    if (d === 'light') {
      return c === 'high' ? 'brightSpring' : 'lightSpring';
    }
    if (d === 'deep') {
      return 'deepAutumn';
    }
    // Medium depth
    if (c === 'high') return 'trueSpring';
    if (c === 'low') return 'softAutumn';
    return 'trueAutumn'; // medium contrast
  }

  // === COOL SEASONS ===
  if (u === 'cool') {
    if (d === 'light') {
      return c === 'low' ? 'lightSummer' : 'lightSummer'; // light cool → summer
    }
    if (d === 'deep') {
      return c === 'high' ? 'deepWinter' : 'trueWinter';
    }
    // Medium depth
    if (c === 'high') return 'brightWinter';
    if (c === 'low') return 'softSummer';
    return 'trueSummer'; // medium contrast
  }

  // === NEUTRAL SEASONS ===
  // Neutral leans toward the nearest warm/cool season
  if (d === 'light') {
    // Neutral + Light → Light Spring or Light Summer
    // Use b* to break the tie: positive b* → spring, negative → summer
    return undertone.rawB > 10 ? 'lightSpring' : 'lightSummer';
  }
  if (d === 'deep') {
    return undertone.rawB > 8 ? 'deepAutumn' : 'deepWinter';
  }
  // Neutral + Medium
  if (c === 'high') {
    return undertone.rawB > 10 ? 'trueSpring' : 'brightWinter';
  }
  if (c === 'low') {
    return undertone.rawB > 10 ? 'softAutumn' : 'softSummer';
  }
  // Neutral + Medium + Medium contrast
  return undertone.rawB > 10 ? 'trueAutumn' : 'trueSummer';
}

/**
 * Full classification pipeline.
 * Takes averaged LAB skin color and returns season + all analysis data.
 */
export function classifySeason(averageLab) {
  const undertone = classifyUndertone(averageLab);
  const depth = classifyDepth(averageLab);
  const contrast = classifyContrast(averageLab);
  const seasonKey = mapToSeason(undertone, depth, contrast);

  return {
    seasonKey,
    undertone,
    depth,
    contrast,
    lab: averageLab,
  };
}

/**
 * Get human-readable labels for the classification axes.
 */
export function getAxisLabels(classification) {
  const undertoneLabels = {
    warm: '🌞 Warm — golden and peachy undertones',
    cool: '❄️ Cool — pink and blue-rose undertones',
    neutral: '⚖️ Neutral — balanced between warm and cool',
  };

  const depthLabels = {
    light: '☀️ Light — fair to light-medium skin',
    medium: '🌤️ Medium — medium to tan skin',
    deep: '🌙 Deep — dark and richly pigmented skin',
  };

  const contrastLabels = {
    high: '✨ High — vivid, clear, and saturated',
    medium: '🎨 Medium — balanced saturation',
    low: '🌫️ Low — soft, muted, and blended',
  };

  return {
    undertone: undertoneLabels[classification.undertone.category],
    depth: depthLabels[classification.depth.category],
    contrast: contrastLabels[classification.contrast.category],
  };
}

/**
 * Skin Color Extraction
 * Samples pixel colors from specific face regions (forehead, cheeks, jawline)
 * using MediaPipe face landmark coordinates.
 */

import { rgbToLab } from './colorConversion.js';

/**
 * Face region definitions.
 * Each region is a set of landmark indices that define its approximate center,
 * plus a sampling radius (in pixels) for the NxN sampling grid.
 */
const FACE_REGIONS = {
  forehead: {
    name: 'Forehead',
    // Landmarks around the center-upper forehead area
    landmarks: [10, 67, 109, 151, 108, 69],
    sampleRadius: 12,
  },
  leftCheek: {
    name: 'Left Cheek',
    // Landmarks on the left cheek surface (fleshy area)
    landmarks: [234, 50, 117, 118, 101, 36],
    sampleRadius: 15,
  },
  rightCheek: {
    name: 'Right Cheek',
    // Landmarks on the right cheek surface (mirror of left)
    landmarks: [454, 280, 346, 347, 330, 266],
    sampleRadius: 15,
  },
  jawline: {
    name: 'Jawline',
    // Landmarks along the lower jaw area
    landmarks: [152, 377, 148, 176, 149, 150],
    sampleRadius: 8,
  },
};

/**
 * Extract skin colors from face regions.
 * @param {HTMLImageElement} imageElement - The image to sample from
 * @param {Array<{x:number, y:number, z:number}>} landmarks - Normalized face landmarks (0-1)
 * @param {number} imgWidth - Image width in pixels
 * @param {number} imgHeight - Image height in pixels
 * @returns {{ regions: Array<{name:string, rgb:{r,g,b}, lab:{l,a,b}}>, averageRgb: {r,g,b}, averageLab: {l,a,b}, stdDevL: number }}
 */
export function extractSkinColors(imageElement, landmarks, imgWidth, imgHeight) {
  // Create offscreen canvas to read pixel data
  const canvas = document.createElement('canvas');
  canvas.width = imgWidth;
  canvas.height = imgHeight;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(imageElement, 0, 0, imgWidth, imgHeight);

  const regions = [];

  for (const [key, region] of Object.entries(FACE_REGIONS)) {
    // Compute center of the landmark group in pixel coordinates
    let cx = 0,
      cy = 0,
      count = 0;

    for (const idx of region.landmarks) {
      if (idx < landmarks.length) {
        cx += landmarks[idx].x * imgWidth;
        cy += landmarks[idx].y * imgHeight;
        count++;
      }
    }

    if (count === 0) continue;

    cx = Math.round(cx / count);
    cy = Math.round(cy / count);

    // Sample an NxN pixel grid around the center
    const radius = region.sampleRadius;
    const pixels = [];

    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const px = cx + dx;
        const py = cy + dy;

        // Bounds check
        if (px >= 0 && px < imgWidth && py >= 0 && py < imgHeight) {
          const pixelData = ctx.getImageData(px, py, 1, 1).data;
          pixels.push({
            r: pixelData[0],
            g: pixelData[1],
            b: pixelData[2],
          });
        }
      }
    }

    if (pixels.length === 0) continue;

    // Use median RGB (more robust to outliers like freckles, moles)
    const medianRgb = computeMedianRgb(pixels);
    const lab = rgbToLab(medianRgb.r, medianRgb.g, medianRgb.b);

    regions.push({
      name: region.name,
      key,
      rgb: medianRgb,
      lab,
      center: { x: cx, y: cy },
      sampleCount: pixels.length,
    });
  }

  if (regions.length === 0) {
    return null;
  }

  // Compute overall average across all regions
  const avgR = Math.round(regions.reduce((s, r) => s + r.rgb.r, 0) / regions.length);
  const avgG = Math.round(regions.reduce((s, r) => s + r.rgb.g, 0) / regions.length);
  const avgB = Math.round(regions.reduce((s, r) => s + r.rgb.b, 0) / regions.length);

  const averageRgb = { r: avgR, g: avgG, b: avgB };
  const averageLab = rgbToLab(avgR, avgG, avgB);

  // Compute standard deviation of L* across regions (for confidence scoring)
  const lValues = regions.map((r) => r.lab.l);
  const lMean = lValues.reduce((a, b) => a + b, 0) / lValues.length;
  const stdDevL = Math.sqrt(
    lValues.reduce((sum, val) => sum + (val - lMean) ** 2, 0) / lValues.length
  );

  return {
    regions,
    averageRgb,
    averageLab,
    stdDevL,
  };
}

/**
 * Compute median RGB from an array of pixel objects.
 * Median is computed per-channel independently.
 */
function computeMedianRgb(pixels) {
  const rVals = pixels.map((p) => p.r).sort((a, b) => a - b);
  const gVals = pixels.map((p) => p.g).sort((a, b) => a - b);
  const bVals = pixels.map((p) => p.b).sort((a, b) => a - b);

  const mid = Math.floor(pixels.length / 2);

  return {
    r: rVals.length % 2 ? rVals[mid] : Math.round((rVals[mid - 1] + rVals[mid]) / 2),
    g: gVals.length % 2 ? gVals[mid] : Math.round((gVals[mid - 1] + gVals[mid]) / 2),
    b: bVals.length % 2 ? bVals[mid] : Math.round((bVals[mid - 1] + bVals[mid]) / 2),
  };
}

/**
 * Batch read a rectangular region of pixels from an ImageData.
 * More performant than per-pixel getImageData for large sample grids.
 */
export function sampleRegionBatch(ctx, cx, cy, radius, imgWidth, imgHeight) {
  const x0 = Math.max(0, cx - radius);
  const y0 = Math.max(0, cy - radius);
  const x1 = Math.min(imgWidth, cx + radius + 1);
  const y1 = Math.min(imgHeight, cy + radius + 1);
  const w = x1 - x0;
  const h = y1 - y0;

  if (w <= 0 || h <= 0) return [];

  const imageData = ctx.getImageData(x0, y0, w, h);
  const data = imageData.data;
  const pixels = [];

  for (let i = 0; i < data.length; i += 4) {
    pixels.push({ r: data[i], g: data[i + 1], b: data[i + 2] });
  }

  return pixels;
}

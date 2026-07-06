/**
 * Confidence Score Calculator
 * Computes a 0–100% confidence score based on how clearly the skin color
 * maps to a single season, plus lighting quality and region consistency.
 */

/**
 * Calculate confidence score for a classification result.
 * @param {object} classification - Output from classifySeason()
 * @param {number} stdDevL - Standard deviation of L* across face regions
 * @param {number} lightingScore - Lighting quality score (0-100)
 * @returns {{ score: number, breakdown: { axisClarity: number, regionConsistency: number, lightingQuality: number } }}
 */
export function calculateConfidence(classification, stdDevL, lightingScore) {
  // Component 1: Axis Clarity (60% weight)
  // How far each axis is from its classification boundary.
  // Higher axis scores → classification is clearer, not borderline.
  const undertoneClarity = classification.undertone.score;
  const depthClarity = classification.depth.score;
  const contrastClarity = classification.contrast.score;
  const axisClarity = (undertoneClarity + depthClarity + contrastClarity) / 3;

  // Component 2: Region Consistency (25% weight)
  // Low std dev of L* across face regions → more consistent readings
  // stdDevL typically ranges from 0 (perfect) to ~25 (very inconsistent)
  const regionConsistency = Math.max(0, Math.min(1, 1 - stdDevL / 20));

  // Component 3: Lighting Quality (15% weight)
  const lightingQuality = (lightingScore || 80) / 100;

  // Weighted average
  const rawScore =
    axisClarity * 0.60 +
    regionConsistency * 0.25 +
    lightingQuality * 0.15;

  // Map to 0–100%, with a floor of 25% (we never say 0% confidence)
  // and scaling so typical good results land around 75-95%
  const score = Math.round(Math.max(25, Math.min(98, rawScore * 100)));

  return {
    score,
    breakdown: {
      axisClarity: Math.round(axisClarity * 100),
      regionConsistency: Math.round(regionConsistency * 100),
      lightingQuality: Math.round(lightingQuality * 100),
    },
  };
}

/**
 * Generate a human-readable confidence message.
 */
export function getConfidenceMessage(score) {
  if (score >= 85) return 'Very confident — your coloring clearly fits this season.';
  if (score >= 70) return 'Confident — this is a strong match for your coloring.';
  if (score >= 55) return 'Moderate — you likely fit this season, but you may share traits with a neighboring season.';
  if (score >= 40) return 'Low confidence — you may be between two seasons. Try a photo with better lighting.';
  return 'Very low confidence — the photo quality may be affecting results. Please try retaking with natural lighting.';
}

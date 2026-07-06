/**
 * Lighting Quality Check
 * Validates photo quality using LAB values from skin regions.
 * Returns a quality report with pass/fail, score, and human-readable messages.
 */

/**
 * Run lighting quality checks on extracted LAB skin region data.
 * @param {Array<{l: number, a: number, b: number}>} regionLabs - LAB values for each skin region
 * @returns {{ pass: boolean, score: number, issues: string[], message: string }}
 */
export function checkLightingQuality(regionLabs) {
  const issues = [];
  let score = 100;

  if (!regionLabs || regionLabs.length === 0) {
    return {
      pass: false,
      score: 0,
      issues: ['No skin regions detected'],
      message: 'Could not find skin regions in the photo. Please try a clearer selfie.',
    };
  }

  // Compute average L*, a*, b* across all regions
  const avgL = regionLabs.reduce((sum, lab) => sum + lab.l, 0) / regionLabs.length;
  const avgA = regionLabs.reduce((sum, lab) => sum + Math.abs(lab.a), 0) / regionLabs.length;
  const avgB = regionLabs.reduce((sum, lab) => sum + Math.abs(lab.b), 0) / regionLabs.length;

  // Compute standard deviation of L* across regions
  const lValues = regionLabs.map((lab) => lab.l);
  const lMean = lValues.reduce((a, b) => a + b, 0) / lValues.length;
  const lStdDev = Math.sqrt(
    lValues.reduce((sum, val) => sum + (val - lMean) ** 2, 0) / lValues.length
  );

  // Check 1: Too Dark
  if (avgL < 25) {
    issues.push('Photo is too dark — the skin regions appear very underexposed.');
    score -= 40;
  } else if (avgL < 35) {
    issues.push('Photo is a bit dark — try better lighting for more accurate results.');
    score -= 15;
  }

  // Check 2: Overexposed
  if (avgL > 90) {
    issues.push('Photo is overexposed — the skin appears washed out.');
    score -= 40;
  } else if (avgL > 82) {
    issues.push('Photo may be slightly overexposed — colors could be washed out.');
    score -= 10;
  }

  // Check 3: Uneven Lighting
  if (lStdDev > 15) {
    issues.push('Lighting looks uneven across your face — try facing the light source directly.');
    score -= 20;
  } else if (lStdDev > 10) {
    issues.push('Slight lighting unevenness detected — results may vary slightly.');
    score -= 8;
  }

  // Check 4: Low Saturation (possible B&W or very desaturated photo)
  if (avgA < 3 && avgB < 3) {
    issues.push('The photo appears to be in black & white or has very low color. Please use a color photo.');
    score -= 50;
  } else if (avgA < 5 && avgB < 5) {
    issues.push('Color saturation is very low — this might affect accuracy.');
    score -= 15;
  }

  // Clamp score
  score = Math.max(0, Math.min(100, score));

  // Determine pass/fail
  const pass = score >= 50;

  // Build summary message
  let message;
  if (pass && issues.length === 0) {
    message = 'Great lighting! Your photo looks perfect for analysis.';
  } else if (pass) {
    message = 'Photo quality is acceptable, but could be better. ' + issues[0];
  } else {
    message = 'Photo quality is too low for accurate analysis. ' + issues[0];
  }

  return { pass, score, issues, message };
}

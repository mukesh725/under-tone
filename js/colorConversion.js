/**
 * Color Conversion Utilities
 * sRGB → CIELAB conversion via XYZ intermediate (D65 illuminant)
 * Also includes deltaE and hue-angle helpers for classification.
 */

/**
 * Convert sRGB [0-255] to CIELAB { l, a, b }.
 * Uses the standard D65 reference white point.
 */
export function rgbToLab(r, g, b) {
  // 1. Normalize sRGB to [0,1] and apply inverse gamma (linearize)
  let [lr, lg, lb] = [r, g, b].map((v) => {
    v /= 255;
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  // 2. Linear RGB → XYZ (sRGB matrix, D65)
  let x = lr * 0.4124564 + lg * 0.3575761 + lb * 0.1804375;
  let y = lr * 0.2126729 + lg * 0.7151522 + lb * 0.0721750;
  let z = lr * 0.0193339 + lg * 0.1191920 + lb * 0.9503041;

  // 3. XYZ → CIELAB
  // D65 reference white
  const Xn = 0.95047;
  const Yn = 1.00000;
  const Zn = 1.08883;

  const f = (t) =>
    t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;

  const fx = f(x / Xn);
  const fy = f(y / Yn);
  const fz = f(z / Zn);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz),
  };
}

/**
 * CIE76 Delta-E: Euclidean distance in CIELAB space.
 * Good enough for our classification boundaries.
 */
export function deltaE76(lab1, lab2) {
  return Math.sqrt(
    (lab1.l - lab2.l) ** 2 +
    (lab1.a - lab2.a) ** 2 +
    (lab1.b - lab2.b) ** 2
  );
}

/**
 * Extract hue angle (in degrees, 0–360) from a* and b* components.
 * Used for warm/cool undertone classification.
 */
export function labToHue(lab) {
  let h = (Math.atan2(lab.b, lab.a) * 180) / Math.PI;
  if (h < 0) h += 360;
  return h;
}

/**
 * Compute chroma (saturation) from a* and b*.
 */
export function labChroma(lab) {
  return Math.sqrt(lab.a ** 2 + lab.b ** 2);
}

/**
 * Convert LAB back to approximate RGB for display purposes.
 * Not pixel-perfect but good enough for UI color swatches.
 */
export function labToRgb(l, a, b) {
  // LAB → XYZ
  const Xn = 0.95047;
  const Yn = 1.00000;
  const Zn = 1.08883;

  let fy = (l + 16) / 116;
  let fx = a / 500 + fy;
  let fz = fy - b / 200;

  const finv = (t) =>
    t > 0.206897 ? t ** 3 : (t - 16 / 116) / 7.787;

  let x = finv(fx) * Xn;
  let y = finv(fy) * Yn;
  let z = finv(fz) * Zn;

  // XYZ → linear RGB
  let lr = x * 3.2404542 + y * -1.5371385 + z * -0.4985314;
  let lg = x * -0.9692660 + y * 1.8760108 + z * 0.0415560;
  let lb = x * 0.0556434 + y * -0.2040259 + z * 1.0572252;

  // Apply gamma
  const gamma = (v) => {
    v = Math.max(0, Math.min(1, v));
    return v <= 0.0031308 ? 12.92 * v : 1.055 * Math.pow(v, 1 / 2.4) - 0.055;
  };

  return {
    r: Math.round(gamma(lr) * 255),
    g: Math.round(gamma(lg) * 255),
    b: Math.round(gamma(lb) * 255),
  };
}

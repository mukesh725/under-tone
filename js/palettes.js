/**
 * 12-Season Palette Data
 * Each season includes: name, tagline, description, recommended colors,
 * colors to avoid, and the three classification signals.
 */

export const SEASONS = {
  brightSpring: {
    name: 'Bright Spring',
    tagline: 'Fresh & Vibrant',
    emoji: '🌸',
    description: 'You radiate warmth and energy. Your coloring has a clear, bright quality with warm golden undertones. You look stunning in vivid, saturated colors that mirror your natural vibrancy.',
    signals: {
      undertone: 'Warm (golden / peachy)',
      depth: 'Light to Medium',
      contrast: 'High — clear and vivid',
    },
    colors: [
      '#FF6F61', // coral
      '#FFD700', // golden yellow
      '#00BFA5', // teal green
      '#FF8A65', // warm peach
      '#7C4DFF', // bright violet
      '#26C6DA', // cyan
      '#FFAB40', // amber
      '#E040FB', // magenta
      '#69F0AE', // mint green
      '#FF5252', // bright red
    ],
    avoid: ['#808080', '#2C2C2C', '#8B7D6B'],
  },

  lightSpring: {
    name: 'Light Spring',
    tagline: 'Soft & Luminous',
    emoji: '🌼',
    description: 'Your coloring is delicate and light with a warm golden glow. You shine in soft warm tones — think buttery yellows, peach, and warm pastels that complement your gentle radiance.',
    signals: {
      undertone: 'Warm (light golden)',
      depth: 'Light',
      contrast: 'Low to Medium — soft and gentle',
    },
    colors: [
      '#FFDAB9', // peach puff
      '#FFE4B5', // moccasin
      '#98D8C8', // soft mint
      '#F7C6C7', // blush pink
      '#FFF176', // light yellow
      '#FFCC80', // light orange
      '#A5D6A7', // soft green
      '#CE93D8', // light purple
      '#80DEEA', // light cyan
      '#FFB74D', // warm amber
    ],
    avoid: ['#1A1A1A', '#4A0E4E', '#000080'],
  },

  trueSpring: {
    name: 'True Spring',
    tagline: 'Warm & Golden',
    emoji: '☀️',
    description: 'Pure warmth defines your look. You have rich golden undertones and look your absolute best in warm, saturated colors — think sunflower yellow, coral, and warm greens.',
    signals: {
      undertone: 'Warm (strongly golden)',
      depth: 'Medium',
      contrast: 'Medium',
    },
    colors: [
      '#FF7043', // deep coral
      '#FFB300', // amber
      '#66BB6A', // green
      '#FF8F00', // dark amber
      '#29B6F6', // sky blue
      '#FFA726', // orange
      '#AB47BC', // purple
      '#26A69A', // teal
      '#FFEE58', // yellow
      '#EF5350', // red
    ],
    avoid: ['#607D8B', '#90A4AE', '#B0BEC5'],
  },

  lightSummer: {
    name: 'Light Summer',
    tagline: 'Cool & Ethereal',
    emoji: '🌊',
    description: 'You have a cool, delicate quality with a soft rosy undertone. Dusty pastels, lavender, powder blue, and soft rose bring out your natural cool radiance beautifully.',
    signals: {
      undertone: 'Cool (rosy / pink)',
      depth: 'Light',
      contrast: 'Low — soft and muted',
    },
    colors: [
      '#B2DFDB', // pale teal
      '#F8BBD0', // pink
      '#B3E5FC', // light blue
      '#E1BEE7', // light purple
      '#C8E6C9', // pale green
      '#F0F4C3', // pale lime
      '#FFCDD2', // light pink
      '#B2EBF2', // light cyan
      '#D1C4E9', // lavender
      '#CFD8DC', // blue grey
    ],
    avoid: ['#FF6F00', '#E65100', '#BF360C'],
  },

  trueSummer: {
    name: 'True Summer',
    tagline: 'Cool & Balanced',
    emoji: '💎',
    description: 'Cool and refined — your coloring has a distinctly blue-pink undertone. You look elegant in medium-cool tones like dusty rose, slate blue, and soft plum.',
    signals: {
      undertone: 'Cool (blue-pink)',
      depth: 'Medium',
      contrast: 'Medium',
    },
    colors: [
      '#7986CB', // indigo
      '#F48FB1', // pink
      '#4DB6AC', // teal
      '#9575CD', // deep purple
      '#4FC3F7', // light blue
      '#E57373', // soft red
      '#81C784', // green
      '#BA68C8', // purple
      '#64B5F6', // blue
      '#FFB0B0', // salmon
    ],
    avoid: ['#FF6D00', '#F57F17', '#E65100'],
  },

  softSummer: {
    name: 'Soft Summer',
    tagline: 'Muted & Graceful',
    emoji: '🌿',
    description: 'Your coloring is beautifully muted and blended. With neutral-cool undertones, you come alive in dusty, greyed-out tones — sage, mauve, dusty blue, and soft charcoal.',
    signals: {
      undertone: 'Neutral-Cool (muted)',
      depth: 'Medium',
      contrast: 'Low — soft and blended',
    },
    colors: [
      '#78909C', // blue grey
      '#A1887F', // warm grey
      '#80CBC4', // muted teal
      '#CE93D8', // muted purple
      '#90A4AE', // grey blue
      '#BCAAA4', // warm taupe
      '#B0BEC5', // silver
      '#AED581', // muted green
      '#F48FB1', // dusty pink
      '#9FA8DA', // muted indigo
    ],
    avoid: ['#FF1744', '#FFEA00', '#00E676'],
  },

  softAutumn: {
    name: 'Soft Autumn',
    tagline: 'Warm & Muted',
    emoji: '🍂',
    description: 'Your coloring is warm but gently muted — like autumn sunlight through fog. Earthy, dusty warm tones like olive, camel, terracotta, and warm taupe make you glow.',
    signals: {
      undertone: 'Neutral-Warm (muted)',
      depth: 'Medium',
      contrast: 'Low — soft and earthy',
    },
    colors: [
      '#A1887F', // taupe
      '#8D6E63', // brown
      '#AED581', // olive green
      '#FFAB91', // salmon
      '#BCAAA4', // warm grey
      '#C5E1A5', // sage
      '#D7CCC8', // warm beige
      '#FFCC80', // peach
      '#A5D6A7', // muted green
      '#FFE0B2', // light apricot
    ],
    avoid: ['#E91E63', '#2196F3', '#7C4DFF'],
  },

  trueAutumn: {
    name: 'True Autumn',
    tagline: 'Rich & Earthy',
    emoji: '🍁',
    description: 'Pure autumn warmth — your coloring is rich, golden, and earthy. Deep warm tones like rust, olive, mustard, and burnt sienna are your power colors.',
    signals: {
      undertone: 'Warm (rich golden)',
      depth: 'Medium to Deep',
      contrast: 'Medium',
    },
    colors: [
      '#BF360C', // rust
      '#F57F17', // mustard
      '#33691E', // forest green
      '#D84315', // burnt orange
      '#827717', // olive
      '#E65100', // dark orange
      '#4E342E', // chocolate
      '#F9A825', // golden
      '#558B2F', // dark green
      '#FF8F00', // amber
    ],
    avoid: ['#E040FB', '#00BCD4', '#B2EBF2'],
  },

  deepAutumn: {
    name: 'Deep Autumn',
    tagline: 'Warm & Intense',
    emoji: '🌰',
    description: 'You have deep, warm coloring with rich golden-bronze undertones. You command attention in deep, saturated warm tones — think mahogany, dark teal, and rich olive.',
    signals: {
      undertone: 'Warm (deep golden-bronze)',
      depth: 'Deep',
      contrast: 'Medium to High',
    },
    colors: [
      '#3E2723', // dark brown
      '#BF360C', // deep rust
      '#1B5E20', // dark green
      '#E65100', // burnt orange
      '#004D40', // dark teal
      '#4E342E', // chocolate
      '#827717', // dark olive
      '#880E4F', // deep magenta
      '#F57F17', // gold
      '#311B92', // deep indigo
    ],
    avoid: ['#E0F7FA', '#FFF9C4', '#F3E5F5'],
  },

  brightWinter: {
    name: 'Bright Winter',
    tagline: 'Cool & Electric',
    emoji: '❄️',
    description: 'Your coloring is cool with an electric clarity. You dazzle in high-contrast, vivid cool tones — think royal blue, hot pink, emerald, and pure white.',
    signals: {
      undertone: 'Cool (blue-based)',
      depth: 'Medium',
      contrast: 'High — bold and clear',
    },
    colors: [
      '#D500F9', // vivid purple
      '#00E5FF', // cyan
      '#FF1744', // vivid red
      '#2979FF', // bright blue
      '#00E676', // neon green
      '#F50057', // hot pink
      '#651FFF', // deep violet
      '#1DE9B6', // turquoise
      '#FFEA00', // electric yellow
      '#3D5AFE', // indigo
    ],
    avoid: ['#A1887F', '#BCAAA4', '#8D6E63'],
  },

  trueWinter: {
    name: 'True Winter',
    tagline: 'Cool & Dramatic',
    emoji: '💠',
    description: 'Pure cool drama — your coloring is high-contrast with distinct blue-pink undertones. You are striking in true, clear cool colors — navy, pure white, crimson, and emerald.',
    signals: {
      undertone: 'Cool (distinctly blue-pink)',
      depth: 'Medium to Deep',
      contrast: 'High',
    },
    colors: [
      '#1A237E', // navy
      '#B71C1C', // true red
      '#1B5E20', // emerald
      '#4A148C', // deep purple
      '#01579B', // dark blue
      '#880E4F', // burgundy
      '#006064', // dark cyan
      '#F5F5F5', // pure white
      '#C62828', // crimson
      '#283593', // royal blue
    ],
    avoid: ['#FFE0B2', '#FFF9C4', '#FFCCBC'],
  },

  deepWinter: {
    name: 'Deep Winter',
    tagline: 'Cool & Powerful',
    emoji: '🌑',
    description: 'You have deep, cool coloring with dramatic intensity. Rich, dark cool tones are your power move — think black, dark navy, burgundy, and deep emerald.',
    signals: {
      undertone: 'Cool (deep blue-based)',
      depth: 'Deep',
      contrast: 'High — dramatic',
    },
    colors: [
      '#0D0D0D', // near-black
      '#1A237E', // deep navy
      '#880E4F', // deep berry
      '#1B5E20', // deep green
      '#311B92', // deep purple
      '#B71C1C', // dark red
      '#004D40', // dark teal
      '#4A148C', // royal purple
      '#01579B', // marine blue
      '#E0E0E0', // icy grey
    ],
    avoid: ['#FFE082', '#FFAB91', '#FFF176'],
  },
};

/**
 * Get a season by its key.
 */
export function getSeason(key) {
  return SEASONS[key] || null;
}

/**
 * Get all season keys.
 */
export function getSeasonKeys() {
  return Object.keys(SEASONS);
}

# 🎨 UnderTone — Color Season Analysis

AI-powered color season analysis from a single selfie. Discover which of the **12 color seasons** best matches your natural coloring, with confidence scoring and personalized palette recommendations.

## ✨ Features

- **📸 Upload or Take a Selfie** — Works with file upload, drag-and-drop, or live camera
- **🤖 AI Face Detection** — MediaPipe Face Mesh detects 478 facial landmarks
- **🎨 Skin Tone Extraction** — Samples color from forehead, cheeks, and jawline
- **💡 Lighting Quality Check** — Validates photo quality before analysis
- **🌈 12-Season Classification** — Maps undertone + depth + contrast to a specific color season
- **📊 Confidence Scoring** — Shows how confident the analysis is with a visual gauge
- **🎯 "Why This Result"** — Transparent breakdown of the three classification signals
- **🔒 100% Private** — All analysis runs in your browser. No data is ever uploaded.

## 🏗️ Architecture

```
under-tone/
├── index.html              → Single-page app (5 screens)
├── css/styles.css          → Premium dark-mode design system
└── js/
    ├── app.js              → Main controller & pipeline orchestration
    ├── faceDetection.js    → MediaPipe Face Landmarker integration
    ├── colorExtraction.js  → Pixel sampling from face regions
    ├── colorConversion.js  → RGB → LAB color space utilities
    ├── lightingCheck.js    → Photo quality validation
    ├── seasonClassifier.js → 12-season classification engine
    ├── confidence.js       → Confidence score calculation
    ├── palettes.js         → Season data (colors, descriptions)
    └── ui.js               → DOM helpers & animations
```

## 🚀 Quick Start

### Local Development

The app is a static site — no build step required.

**Option 1: Open directly**
```bash
open index.html
```
> ⚠️ Some browsers block ES modules from `file://` URLs. Use a local server instead.

**Option 2: Local server (recommended)**
```bash
npx serve .
```

Then open `http://localhost:3000`.

### Deploy to Netlify

1. Go to [netlify.com](https://app.netlify.com/drop)
2. Drag the entire `under-tone` folder onto the drop zone
3. Done! Your site is live.

### Deploy to Vercel

1. Push the project to a GitHub repository
2. Go to [vercel.com](https://vercel.com/new) and import the repo
3. Framework: **Other** (static)
4. Deploy. Done!

## 🔬 How It Works

1. **Face Detection** — MediaPipe Face Landmarker identifies 478 facial landmarks
2. **Region Sampling** — Pixel grids are sampled around forehead, cheek, and jawline landmarks
3. **Color Conversion** — RGB values are converted to CIELAB color space (perceptually uniform)
4. **Lighting Check** — L*, a*, b* values are validated for quality (rejects too dark/bright/desaturated)
5. **Classification** — Three axes are evaluated:
   - **Undertone** (warm/cool/neutral) from hue angle and b* value
   - **Depth** (light/medium/deep) from L* lightness
   - **Contrast** (high/medium/low) from chroma (saturation)
6. **Season Mapping** — The combination maps to one of 12 seasons
7. **Confidence** — Scored by axis clarity (60%), region consistency (25%), and lighting quality (15%)

## 📋 12 Seasons

| Warm Seasons | Cool Seasons | Neutral-Leaning |
|:---|:---|:---|
| Bright Spring 🌸 | Light Summer 🌊 | Soft Autumn 🍂 |
| Light Spring 🌼 | True Summer 💎 | Soft Summer 🌿 |
| True Spring ☀️ | Bright Winter ❄️ | |
| True Autumn 🍁 | True Winter 💠 | |
| Deep Autumn 🌰 | Deep Winter 🌑 | |

## 🧪 Testing

The classification is **deterministic** — the same photo always produces the same result. To verify:

1. Upload the same photo twice → result should be identical
2. Test with photos in different lighting conditions
3. Check that the lighting quality check correctly rejects dark/overexposed photos

## 📄 License

MIT — Free to use, modify, and distribute.

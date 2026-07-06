/**
 * UI Helpers & Animation Utilities
 * DOM manipulation, screen transitions, animated components.
 */

let currentScreenId = null;

/**
 * Show a screen by ID, hide all others.
 * Uses CSS transition classes for smooth animation.
 */
export function showScreen(screenId) {
  currentScreenId = screenId;
  const screens = document.querySelectorAll('.screen');
  screens.forEach((screen) => {
    if (screen.id === screenId) {
      screen.classList.remove('screen--hidden');
      screen.classList.add('screen--visible');
      // Trigger reflow for animation
      void screen.offsetHeight;
      screen.style.opacity = '1';
      screen.style.transform = 'translateY(0)';
    } else {
      screen.style.opacity = '0';
      screen.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (currentScreenId !== screen.id) {
          screen.classList.add('screen--hidden');
          screen.classList.remove('screen--visible');
        }
      }, 400);
    }
  });
}

/**
 * Animate the circular confidence gauge.
 * @param {number} percentage - 0 to 100
 */
export function animateConfidenceGauge(percentage) {
  const gauge = document.getElementById('confidence-gauge');
  const text = document.getElementById('confidence-text');
  const circle = document.getElementById('confidence-circle');

  if (!gauge || !circle) return;

  // SVG circle circumference
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  circle.style.strokeDasharray = circumference;

  // Animate from 0 to target
  let current = 0;
  const duration = 1500;
  const start = performance.now();

  function animate(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    current = Math.round(eased * percentage);

    const offset = circumference - (current / 100) * circumference;
    circle.style.strokeDashoffset = offset;

    if (text) text.textContent = `${current}%`;

    // Update color based on score
    if (current >= 75) {
      circle.style.stroke = 'var(--color-success)';
    } else if (current >= 50) {
      circle.style.stroke = 'var(--color-warning)';
    } else {
      circle.style.stroke = 'var(--color-error)';
    }

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  }

  requestAnimationFrame(animate);
}

/**
 * Render color palette swatches with staggered animation.
 */
export function renderColorSwatches(containerId, colors, avoidColors) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  // Recommended colors
  const recLabel = document.createElement('h4');
  recLabel.className = 'swatch-label';
  recLabel.textContent = 'Your Best Colors';
  container.appendChild(recLabel);

  const recGrid = document.createElement('div');
  recGrid.className = 'swatch-grid';
  container.appendChild(recGrid);

  colors.forEach((hex, i) => {
    const swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = hex;
    swatch.style.animationDelay = `${i * 80}ms`;
    swatch.setAttribute('title', hex);

    // Add hex label
    const label = document.createElement('span');
    label.className = 'swatch-hex';
    label.textContent = hex;
    swatch.appendChild(label);

    recGrid.appendChild(swatch);
  });

  // Colors to avoid
  if (avoidColors && avoidColors.length > 0) {
    const avoidLabel = document.createElement('h4');
    avoidLabel.className = 'swatch-label swatch-label--avoid';
    avoidLabel.textContent = 'Colors to Avoid';
    container.appendChild(avoidLabel);

    const avoidGrid = document.createElement('div');
    avoidGrid.className = 'swatch-grid swatch-grid--avoid';
    container.appendChild(avoidGrid);

    avoidColors.forEach((hex, i) => {
      const swatch = document.createElement('div');
      swatch.className = 'swatch swatch--avoid';
      swatch.style.backgroundColor = hex;
      swatch.style.animationDelay = `${(colors.length + i) * 80}ms`;
      swatch.setAttribute('title', `Avoid: ${hex}`);

      const label = document.createElement('span');
      label.className = 'swatch-hex';
      label.textContent = hex;
      swatch.appendChild(label);

      // X overlay
      const xMark = document.createElement('span');
      xMark.className = 'swatch-x';
      xMark.textContent = '✕';
      swatch.appendChild(xMark);

      avoidGrid.appendChild(swatch);
    });
  }
}

/**
 * Render the "Why This Result" breakdown.
 */
export function renderWhyBreakdown(containerId, classification, labels) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';

  const axes = [
    {
      title: 'Undertone',
      label: labels.undertone,
      score: classification.undertone.score,
      category: classification.undertone.category,
      detail: `Hue angle: ${classification.undertone.rawHue.toFixed(1)}° | b*: ${classification.undertone.rawB.toFixed(1)}`,
    },
    {
      title: 'Depth',
      label: labels.depth,
      score: classification.depth.score,
      category: classification.depth.category,
      detail: `Lightness (L*): ${classification.depth.rawL.toFixed(1)}`,
    },
    {
      title: 'Contrast',
      label: labels.contrast,
      score: classification.contrast.score,
      category: classification.contrast.category,
      detail: `Chroma: ${classification.contrast.rawChroma.toFixed(1)}`,
    },
  ];

  axes.forEach((axis, i) => {
    const card = document.createElement('div');
    card.className = 'why-card';
    card.style.animationDelay = `${i * 150}ms`;

    card.innerHTML = `
      <div class="why-card__header">
        <h4 class="why-card__title">${axis.title}</h4>
        <span class="why-card__badge why-card__badge--${axis.category}">${axis.category}</span>
      </div>
      <p class="why-card__label">${axis.label}</p>
      <div class="why-card__bar">
        <div class="why-card__bar-fill" style="width: ${Math.round(axis.score * 100)}%"></div>
      </div>
      <p class="why-card__detail">${axis.detail}</p>
    `;

    container.appendChild(card);
  });
}

/**
 * Set the analyzing progress animation text.
 */
export function setAnalyzingStep(step) {
  const el = document.getElementById('analyzing-step');
  if (el) {
    el.style.opacity = '0';
    setTimeout(() => {
      el.textContent = step;
      el.style.opacity = '1';
    }, 200);
  }
}

/**
 * Preview uploaded image in the designated container.
 */
export function previewImage(containerId, imageUrl) {
  const container = document.getElementById(containerId);
  if (!container) return;

  container.innerHTML = '';
  const img = document.createElement('img');
  img.src = imageUrl;
  img.className = 'preview-image';
  img.alt = 'Uploaded photo preview';
  container.appendChild(img);
}

/**
 * Show/hide a loading spinner.
 */
export function toggleSpinner(show) {
  const spinner = document.getElementById('spinner');
  if (spinner) {
    spinner.classList.toggle('spinner--visible', show);
    spinner.classList.toggle('spinner--hidden', !show);
  }
}

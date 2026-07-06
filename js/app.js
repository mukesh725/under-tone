/**
 * UnderTone — Main App Controller
 * Orchestrates the full analysis pipeline:
 * Upload → Face Detection → Color Extraction → Lighting Check → Classification → Results
 */

import { initFaceLandmarker, detectFace } from './faceDetection.js';
import { extractSkinColors } from './colorExtraction.js';
import { checkLightingQuality } from './lightingCheck.js';
import { classifySeason, getAxisLabels } from './seasonClassifier.js';
import { calculateConfidence, getConfidenceMessage } from './confidence.js';
import { getSeason } from './palettes.js';
import {
  showScreen,
  animateConfidenceGauge,
  renderColorSwatches,
  renderWhyBreakdown,
  setAnalyzingStep,
  previewImage,
} from './ui.js';

// ─── State ───────────────────────────────────────────────────────
let currentImageUrl = null;
let currentImageElement = null;
let analysisResult = null;
let cameraStream = null;

// ─── DOM References ──────────────────────────────────────────────
const uploadZone = document.getElementById('upload-zone');
const fileInput = document.getElementById('file-input');
const btnUpload = document.getElementById('btn-upload');
const btnCamera = document.getElementById('btn-camera');
const btnTryAgain = document.getElementById('btn-try-again');
const btnRetry = document.getElementById('btn-retry');
const btnShare = document.getElementById('btn-share');
const btnCapture = document.getElementById('btn-capture');
const btnCancelCamera = document.getElementById('btn-cancel-camera');
const cameraVideo = document.getElementById('camera-video');
const cameraCanvas = document.getElementById('camera-canvas');
const tabs = document.querySelectorAll('.result-tab');

// ─── Event Listeners ─────────────────────────────────────────────

// File upload via button
btnUpload.addEventListener('click', () => fileInput.click());

// File input change
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (file) handleFile(file);
});

// Drag-and-drop zone
uploadZone.addEventListener('click', () => fileInput.click());
uploadZone.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fileInput.click();
  }
});

uploadZone.addEventListener('dragover', (e) => {
  e.preventDefault();
  uploadZone.classList.add('drag-over');
});

uploadZone.addEventListener('dragleave', () => {
  uploadZone.classList.remove('drag-over');
});

uploadZone.addEventListener('drop', (e) => {
  e.preventDefault();
  uploadZone.classList.remove('drag-over');
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) {
    handleFile(file);
  }
});

// Camera button
btnCamera.addEventListener('click', openCamera);
btnCapture.addEventListener('click', capturePhoto);
btnCancelCamera.addEventListener('click', closeCamera);

// Try again / retry buttons
btnTryAgain.addEventListener('click', resetApp);
btnRetry.addEventListener('click', resetApp);

// Share button
btnShare.addEventListener('click', shareResult);

// Result tabs
tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    // Update tab states
    tabs.forEach((t) => {
      t.classList.remove('result-tab--active');
      t.setAttribute('aria-selected', 'false');
    });
    tab.classList.add('result-tab--active');
    tab.setAttribute('aria-selected', 'true');

    // Show/hide panels
    const targetPanelId = tab.dataset.panel;
    document.querySelectorAll('.result-panel').forEach((panel) => {
      panel.classList.remove('result-panel--active');
    });
    const targetPanel = document.getElementById(targetPanelId);
    if (targetPanel) targetPanel.classList.add('result-panel--active');
  });
});

// ─── File Handler ────────────────────────────────────────────────
function handleFile(file) {
  if (!file.type.startsWith('image/')) {
    showError('Invalid File', 'Please upload an image file (JPG, PNG, or WebP).');
    return;
  }

  // Max file size: 15MB
  if (file.size > 15 * 1024 * 1024) {
    showError('File Too Large', 'Please use a photo smaller than 15MB.');
    return;
  }

  const url = URL.createObjectURL(file);
  currentImageUrl = url;
  loadAndAnalyze(url);
}

// ─── Camera ──────────────────────────────────────────────────────
async function openCamera() {
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
    });
    cameraVideo.srcObject = cameraStream;
    document.getElementById('screen-camera').classList.remove('screen--hidden');
    document.getElementById('screen-camera').classList.add('screen--visible');
  } catch (err) {
    console.error('Camera access error:', err);
    showError('Camera Unavailable', 'Could not access your camera. Please upload a photo instead.');
  }
}

function capturePhoto() {
  if (!cameraStream) return;

  const video = cameraVideo;
  cameraCanvas.width = video.videoWidth;
  cameraCanvas.height = video.videoHeight;
  const ctx = cameraCanvas.getContext('2d');

  // Mirror the capture (camera is already mirrored via CSS)
  ctx.translate(cameraCanvas.width, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(video, 0, 0);

  cameraCanvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob);
    currentImageUrl = url;
    closeCamera();
    loadAndAnalyze(url);
  }, 'image/jpeg', 0.92);
}

function closeCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  document.getElementById('screen-camera').classList.add('screen--hidden');
  document.getElementById('screen-camera').classList.remove('screen--visible');
}

// ─── Main Analysis Pipeline ──────────────────────────────────────
async function loadAndAnalyze(imageUrl) {
  // Show analyzing screen
  showScreen('screen-analyzing');
  previewImage('analyzing-preview', imageUrl);

  try {
    // Step 1: Load image
    setAnalyzingStep('Loading image...');
    const img = await loadImage(imageUrl);
    currentImageElement = img;

    // Step 2: Initialize face detection
    setAnalyzingStep('Loading face detection model...');
    await initFaceLandmarker();

    // Step 3: Detect face
    setAnalyzingStep('Detecting face landmarks...');
    const faceResult = await detectFace(img);

    if (!faceResult) {
      showError(
        'No Face Detected',
        'We couldn\'t detect a face in this photo. Please try a clear, front-facing selfie with good lighting.'
      );
      return;
    }

    // Step 4: Extract skin colors
    setAnalyzingStep('Extracting skin colors...');
    await delay(300); // Brief pause for UX
    const skinData = extractSkinColors(
      img,
      faceResult.landmarks,
      faceResult.width,
      faceResult.height
    );

    if (!skinData || skinData.regions.length < 2) {
      showError(
        'Extraction Failed',
        'Could not extract enough skin color data. Please try a photo where your face is clearly visible.'
      );
      return;
    }

    // Step 5: Check lighting quality
    setAnalyzingStep('Checking lighting quality...');
    await delay(200);
    const regionLabs = skinData.regions.map((r) => r.lab);
    const lightingResult = checkLightingQuality(regionLabs);

    if (!lightingResult.pass) {
      showError('Lighting Issue', lightingResult.message);
      return;
    }

    // Step 6: Classify season
    setAnalyzingStep('Analyzing undertone, depth & contrast...');
    await delay(400);
    const classification = classifySeason(skinData.averageLab);

    // Step 7: Calculate confidence
    setAnalyzingStep('Calculating confidence...');
    await delay(200);
    const confidence = calculateConfidence(
      classification,
      skinData.stdDevL,
      lightingResult.score
    );

    // Build full result
    analysisResult = {
      classification,
      confidence,
      skinData,
      lightingResult,
      season: getSeason(classification.seasonKey),
      labels: getAxisLabels(classification),
    };

    // Step 8: Show results
    setAnalyzingStep('Preparing your results...');
    await delay(300);
    showResults(analysisResult);

  } catch (error) {
    console.error('Analysis pipeline error:', error);
    showError(
      'Analysis Error',
      `Something went wrong during analysis: ${error.message}. Please try a different photo.`
    );
  }
}

// ─── Display Results ─────────────────────────────────────────────
function showResults(result) {
  const { classification, confidence, skinData, season, labels } = result;

  if (!season) {
    showError('Classification Error', 'Could not determine your color season. Please try another photo.');
    return;
  }

  // Set photo preview
  const photoContainer = document.getElementById('result-photo');
  photoContainer.innerHTML = `<img src="${currentImageUrl}" alt="Your photo">`;

  // Set season info
  document.getElementById('result-emoji').textContent = season.emoji;
  document.getElementById('result-name').textContent = season.name;
  document.getElementById('result-tagline').textContent = season.tagline;
  document.getElementById('result-description').textContent = season.description;

  // Set skin sample dot
  const { r, g, b } = skinData.averageRgb;
  document.getElementById('skin-sample-dot').style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  document.getElementById('skin-sample-text').textContent =
    `RGB(${r}, ${g}, ${b}) • L*${skinData.averageLab.l.toFixed(0)} a*${skinData.averageLab.a.toFixed(1)} b*${skinData.averageLab.b.toFixed(1)}`;

  // Set confidence
  document.getElementById('confidence-message').textContent = getConfidenceMessage(confidence.score);

  // Render palette
  renderColorSwatches('palette-container', season.colors, season.avoid);

  // Render "Why" breakdown
  renderWhyBreakdown('why-container', classification, labels);

  // Show results screen, then animate gauge
  showScreen('screen-results');

  // Reset tabs to overview
  tabs.forEach((t) => {
    t.classList.remove('result-tab--active');
    t.setAttribute('aria-selected', 'false');
  });
  document.getElementById('tab-overview').classList.add('result-tab--active');
  document.getElementById('tab-overview').setAttribute('aria-selected', 'true');
  document.querySelectorAll('.result-panel').forEach((p) => p.classList.remove('result-panel--active'));
  document.getElementById('panel-overview').classList.add('result-panel--active');

  // Animate confidence gauge after screen transition
  setTimeout(() => {
    animateConfidenceGauge(confidence.score);
  }, 500);
}

// ─── Error Display ───────────────────────────────────────────────
function showError(title, message) {
  document.getElementById('error-title').textContent = title;
  document.getElementById('error-message').textContent = message;
  showScreen('screen-error');
}

// ─── Reset ───────────────────────────────────────────────────────
function resetApp() {
  // Clean up
  if (currentImageUrl) {
    URL.revokeObjectURL(currentImageUrl);
    currentImageUrl = null;
  }
  currentImageElement = null;
  analysisResult = null;
  fileInput.value = '';

  showScreen('screen-upload');
}

// ─── Share ───────────────────────────────────────────────────────
async function shareResult() {
  if (!analysisResult) return;

  const { season, confidence } = analysisResult;
  const text = `🎨 My color season is ${season.name} ${season.emoji} (${confidence.score}% confidence)!\n\nAnalyzed with UnderTone — free AI color analysis`;

  try {
    await navigator.clipboard.writeText(text);
    btnShare.innerHTML = '<span class="btn__icon">✅</span> Copied!';
    setTimeout(() => {
      btnShare.innerHTML = '<span class="btn__icon">📋</span> Copy Result';
    }, 2000);
  } catch {
    // Fallback: select text
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);

    btnShare.innerHTML = '<span class="btn__icon">✅</span> Copied!';
    setTimeout(() => {
      btnShare.innerHTML = '<span class="btn__icon">📋</span> Copy Result';
    }, 2000);
  }
}

// ─── Utilities ───────────────────────────────────────────────────
function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Only set crossOrigin if we're loading from an external http/https URL
    if (url.startsWith('http') && !url.startsWith('blob:')) {
      img.crossOrigin = 'anonymous';
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = url;
  });
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Pre-warm the model on page load ─────────────────────────────
// Start loading the MediaPipe model in the background so it's ready
// when the user uploads a photo.
(async () => {
  try {
    await initFaceLandmarker();
    console.log('✅ Face Landmarker model pre-loaded');
  } catch (e) {
    console.warn('⚠️ Model pre-load failed (will retry on first use):', e.message);
  }
})();

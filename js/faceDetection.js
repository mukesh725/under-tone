/**
 * MediaPipe Face Landmarker Integration
 * Uses @mediapipe/tasks-vision (modern API) to detect 478 face landmarks
 * from an uploaded image.
 */

let FaceLandmarker;
let FilesetResolver;
let faceLandmarker = null;
let isInitialized = false;
let initPromise = null;

/**
 * Initialize the MediaPipe Face Landmarker.
 * Loads WASM runtime + model from Google CDN.
 * Returns a promise that resolves when ready.
 */
export async function initFaceLandmarker() {
  if (isInitialized && faceLandmarker) return faceLandmarker;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // Dynamic import from CDN
      const vision = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs'
      );

      FaceLandmarker = vision.FaceLandmarker;
      FilesetResolver = vision.FilesetResolver;

      // Load WASM fileset
      const filesetResolver = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
      );

      // Create Face Landmarker instance
      faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        numFaces: 1,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minTrackingConfidence: 0.5,
        outputFaceBlendshapes: false,
        outputFacialTransformationMatrixes: false,
      });

      isInitialized = true;
      return faceLandmarker;
    } catch (error) {
      console.error('Failed to initialize Face Landmarker:', error);

      // Retry with CPU delegate if GPU fails
      if (error.message?.includes('GPU') || error.message?.includes('delegate')) {
        console.warn('GPU delegate failed, falling back to CPU...');
        try {
          const vision = await import(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/vision_bundle.mjs'
          );

          FaceLandmarker = vision.FaceLandmarker;
          FilesetResolver = vision.FilesetResolver;

          const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.35/wasm'
          );

          faceLandmarker = await FaceLandmarker.createFromOptions(filesetResolver, {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
              delegate: 'CPU',
            },
            runningMode: 'IMAGE',
            numFaces: 1,
            minFaceDetectionConfidence: 0.5,
            minFacePresenceConfidence: 0.5,
            minTrackingConfidence: 0.5,
            outputFaceBlendshapes: false,
            outputFacialTransformationMatrixes: false,
          });

          isInitialized = true;
          return faceLandmarker;
        } catch (cpuError) {
          console.error('CPU fallback also failed:', cpuError);
          throw cpuError;
        }
      }
      throw error;
    }
  })();

  return initPromise;
}

/**
 * Detect face landmarks from an HTMLImageElement.
 * @param {HTMLImageElement} imageElement - The loaded image element
 * @returns {{ landmarks: Array<{x:number, y:number, z:number}>, width: number, height: number } | null}
 */
export async function detectFace(imageElement) {
  if (!faceLandmarker) {
    await initFaceLandmarker();
  }

  const result = faceLandmarker.detect(imageElement);

  if (!result || !result.faceLandmarks || result.faceLandmarks.length === 0) {
    return null;
  }

  // Return the first face's landmarks (normalized 0-1 coordinates)
  return {
    landmarks: result.faceLandmarks[0],
    width: imageElement.naturalWidth || imageElement.width,
    height: imageElement.naturalHeight || imageElement.height,
  };
}

/**
 * Check if the face landmarker is ready.
 */
export function isReady() {
  return isInitialized && faceLandmarker !== null;
}

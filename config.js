export const MEDIAPIPE = {
  wasmBaseUrl: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/wasm",
  visionBundleUrl: "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.17/vision_bundle.mjs",
  poseModelUrl:
    "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task",
  maxPoses: 2,
};

export const LANDMARK = {
  nose: 0,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24,
  leftAnkle: 27,
  rightAnkle: 28,
};

export const TRACKED_POINTS = [
  { key: "nose", landmarkIndex: LANDMARK.nose, type: "body" },
  { key: "leftWrist", landmarkIndex: LANDMARK.leftWrist, type: "hand" },
  { key: "rightWrist", landmarkIndex: LANDMARK.rightWrist, type: "hand" },
  { key: "leftAnkle", landmarkIndex: LANDMARK.leftAnkle, type: "foot" },
  { key: "rightAnkle", landmarkIndex: LANDMARK.rightAnkle, type: "foot" },
  { key: "bodyCenter", landmarkIndex: -1, type: "body" },
];

export const APP = {
  mirrorX: true,
  minVisibility: 0.48,
  maxParticles: 1100,
  targetFpsSampleMs: 250,
};

export const EMIT = {
  movementThreshold: 70,
  handThreshold: 115,
  footThreshold: 55,
  fastSpeed: 720,
  maxBurstPerPoint: 50,
  idleCooldownMs: 38,
};

export const PARTICLE = {
  minLife: 3,
  maxLife: 6,
  drag: 0.982,
  gravity: 7,
  buoyancy: -13,
  maxSize: 50,
  minSize: 16,
  fadeInSeconds: 0.15,
  drift: 22,
};

export const COLOR = {
  hueMin: 170,
  hueMax: 325,
  alternateHueMin: 48,
  alternateHueMax: 92,
  alternateChance: 0.34,
  saturationMin: 72,
  saturationMax: 96,
  lightnessMin: 58,
  lightnessMax: 70,
};

export const LETTERS = ["G", "F", "B"];

export const SKELETON_CONNECTIONS = [
  [11, 12],
  [11, 13],
  [13, 15],
  [12, 14],
  [14, 16],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [25, 27],
  [24, 26],
  [26, 28],
];

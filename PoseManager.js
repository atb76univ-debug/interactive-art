import { APP, LANDMARK, MEDIAPIPE, TRACKED_POINTS } from "../config.js";

export class PoseManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.landmarker = null;
    this.stream = null;
    this.isReady = false;
    this.isRunning = false;
    this.lastVideoTime = -1;
    this.latestResult = null;
    this.peopleCount = 0;

    this.points = TRACKED_POINTS.map((point) => ({
      key: point.key,
      type: point.type,
      x: 0,
      y: 0,
      previousX: 0,
      previousY: 0,
      speed: 0,
      visible: false,
      wasVisible: false,
      lastEmitAt: 0,
    }));
  }

  async init() {
    const vision = await import(MEDIAPIPE.visionBundleUrl);
    const fileset = await vision.FilesetResolver.forVisionTasks(MEDIAPIPE.wasmBaseUrl);

    this.landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath: MEDIAPIPE.poseModelUrl,
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numPoses: MEDIAPIPE.maxPoses,
      minPoseDetectionConfidence: 0.55,
      minPosePresenceConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    this.isReady = true;
  }

  async startCamera() {
    if (!this.isReady) {
      throw new Error("PoseLandmarker is still loading.");
    }

    if (this.stream) {
      this.isRunning = true;
      await this.video.play();
      return;
    }

    this.stream = await navigator.mediaDevices.getUserMedia({
      audio: false,
      video: {
        facingMode: "user",
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
    });

    this.video.srcObject = this.stream;
    await this.waitForMetadata();
    await this.video.play();
    this.isRunning = true;
  }

  stopCamera() {
    this.isRunning = false;
    this.peopleCount = 0;
    this.latestResult = null;
    this.lastVideoTime = -1;

    if (this.stream) {
      for (const track of this.stream.getTracks()) {
        track.stop();
      }
    }

    this.stream = null;
    this.video.srcObject = null;
    this.resetPoints();
  }

  detect(nowMs, canvasWidth, canvasHeight, deltaSeconds) {
    if (!this.isReady || !this.isRunning || !this.video.videoWidth) {
      this.peopleCount = 0;
      this.resetVisibility();
      return this.points;
    }

    if (this.video.currentTime === this.lastVideoTime) {
      return this.points;
    }

    this.lastVideoTime = this.video.currentTime;
    this.latestResult = this.landmarker.detectForVideo(this.video, nowMs);
    const landmarks = this.latestResult.landmarks || [];
    this.peopleCount = landmarks.length;

    if (landmarks.length === 0) {
      this.resetVisibility();
      return this.points;
    }

    this.updateTrackedPoints(landmarks[0], canvasWidth, canvasHeight, deltaSeconds);
    return this.points;
  }

  updateTrackedPoints(landmarks, canvasWidth, canvasHeight, deltaSeconds) {
    for (let i = 0; i < TRACKED_POINTS.length; i += 1) {
      const source = TRACKED_POINTS[i];
      const point = this.points[i];
      const landmark =
        source.key === "bodyCenter" ? this.getBodyCenterLandmark(landmarks) : landmarks[source.landmarkIndex];

      point.wasVisible = point.visible;
      point.visible = Boolean(landmark && (landmark.visibility ?? 1) >= APP.minVisibility);

      if (!point.visible) {
        point.speed = 0;
        continue;
      }

      point.previousX = point.x;
      point.previousY = point.y;
      point.x = (APP.mirrorX ? 1 - landmark.x : landmark.x) * canvasWidth;
      point.y = landmark.y * canvasHeight;

      if (!point.wasVisible || deltaSeconds <= 0) {
        point.speed = 0;
        point.previousX = point.x;
        point.previousY = point.y;
        continue;
      }

      const dx = point.x - point.previousX;
      const dy = point.y - point.previousY;
      point.speed = Math.hypot(dx, dy) / deltaSeconds;
    }
  }

  getBodyCenterLandmark(landmarks) {
    const leftHip = landmarks[LANDMARK.leftHip];
    const rightHip = landmarks[LANDMARK.rightHip];

    if (!leftHip || !rightHip) {
      return null;
    }

    return {
      x: (leftHip.x + rightHip.x) * 0.5,
      y: (leftHip.y + rightHip.y) * 0.5,
      visibility: Math.min(leftHip.visibility ?? 1, rightHip.visibility ?? 1),
    };
  }

  resetVisibility() {
    for (const point of this.points) {
      point.wasVisible = point.visible;
      point.visible = false;
      point.speed = 0;
    }
  }

  resetPoints() {
    for (const point of this.points) {
      point.x = 0;
      point.y = 0;
      point.previousX = 0;
      point.previousY = 0;
      point.speed = 0;
      point.visible = false;
      point.wasVisible = false;
      point.lastEmitAt = 0;
    }
  }

  waitForMetadata() {
    if (this.video.videoWidth > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.video.onloadedmetadata = () => resolve();
    });
  }
}

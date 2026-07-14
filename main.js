import { APP } from "./config.js";
import { ParticleEmitter } from "./particles/ParticleEmitter.js";
import { ParticlePool } from "./particles/ParticlePool.js";
import { PoseManager } from "./pose/PoseManager.js";
import { Renderer } from "./render/Renderer.js";
import { UIController } from "./ui/UIController.js";

class Main {
  constructor() {
    this.elements = this.getElements();
    this.renderer = new Renderer(this.elements.artCanvas, this.elements.debugCanvas);
    this.pool = new ParticlePool(APP.maxParticles);
    this.emitter = new ParticleEmitter(this.pool);
    this.poseManager = new PoseManager(this.elements.cameraVideo);
    this.ui = new UIController(this.elements);

    this.lastFrameMs = performance.now();
    this.fps = 0;
    this.framesSinceSample = 0;
    this.lastFpsSampleMs = this.lastFrameMs;
    this.resizeQueued = false;
    this.rafCallback = (nextMs) => this.loop(nextMs);

    this.ui.bind({
      onStartCamera: () => this.startCamera(),
      onStopCamera: () => this.stopCamera(),
      onFullscreen: () => this.toggleFullscreen(),
    });

    window.addEventListener("resize", () => this.queueResize(), { passive: true });
    window.addEventListener("orientationchange", () => this.queueResize(), { passive: true });
  }

  async init() {
    try {
      await this.poseManager.init();
      this.ui.setLoading(false);
      this.ui.setRunning(false);
      this.loop(this.lastFrameMs);
    } catch (error) {
      this.ui.setLoading(false);
      console.error(error);
      alert("PoseLandmarkerの読み込みに失敗しました。ネットワーク接続とHTTPS/localhost環境を確認してください。");
    }
  }

  async startCamera() {
    try {
      await this.poseManager.startCamera();
      this.ui.setRunning(true);
    } catch (error) {
      console.error(error);
      alert("カメラを開始できませんでした。ブラウザのカメラ許可を確認してください。");
    }
  }

  stopCamera() {
    this.poseManager.stopCamera();
    this.ui.setRunning(false);
    this.ui.updateStats(this.fps, 0);
  }

  loop(nowMs) {
    const deltaSeconds = Math.min((nowMs - this.lastFrameMs) / 1000, 0.05);
    this.lastFrameMs = nowMs;

    if (this.resizeQueued) {
      this.renderer.resize();
      this.resizeQueued = false;
    }

    const points = this.poseManager.detect(nowMs, this.renderer.width, this.renderer.height, deltaSeconds);
    this.emitter.emitFromTrackedPoints(points, nowMs);
    this.pool.update(deltaSeconds);
    this.renderer.render(this.pool, this.poseManager.latestResult, this.ui.showSkeleton, this.ui.debugMode);
    this.updateFps(nowMs);

    requestAnimationFrame(this.rafCallback);
  }

  updateFps(nowMs) {
    this.framesSinceSample += 1;
    const elapsed = nowMs - this.lastFpsSampleMs;

    if (elapsed < APP.targetFpsSampleMs) {
      return;
    }

    this.fps = (this.framesSinceSample * 1000) / elapsed;
    this.framesSinceSample = 0;
    this.lastFpsSampleMs = nowMs;
    this.ui.updateStats(this.fps, this.poseManager.peopleCount);
  }

  queueResize() {
    this.resizeQueued = true;
  }

  async toggleFullscreen() {
    if (!document.fullscreenElement) {
      await this.elements.stage.requestFullscreen();
      return;
    }

    await document.exitFullscreen();
  }

  getElements() {
    return {
      stage: document.getElementById("stage"),
      artCanvas: document.getElementById("artCanvas"),
      debugCanvas: document.getElementById("debugCanvas"),
      cameraVideo: document.getElementById("cameraVideo"),
      startCameraBtn: document.getElementById("startCameraBtn"),
      stopCameraBtn: document.getElementById("stopCameraBtn"),
      showCameraBtn: document.getElementById("showCameraBtn"),
      hideCameraBtn: document.getElementById("hideCameraBtn"),
      showSkeletonBtn: document.getElementById("showSkeletonBtn"),
      hideSkeletonBtn: document.getElementById("hideSkeletonBtn"),
      fullscreenBtn: document.getElementById("fullscreenBtn"),
      debugBtn: document.getElementById("debugBtn"),
      fpsText: document.getElementById("fpsText"),
      peopleText: document.getElementById("peopleText"),
      loadingPanel: document.getElementById("loadingPanel"),
    };
  }
}

const app = new Main();
app.init();

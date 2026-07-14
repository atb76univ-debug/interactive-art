import { APP, SKELETON_CONNECTIONS } from "../config.js";

export class Renderer {
  constructor(artCanvas, debugCanvas) {
    this.artCanvas = artCanvas;
    this.debugCanvas = debugCanvas;
    this.artCtx = artCanvas.getContext("2d", { alpha: false });
    this.debugCtx = debugCanvas.getContext("2d");
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    this.backgroundGradient = null;
    this.resize();
  }

  resize() {
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.resizeCanvas(this.artCanvas, this.artCtx);
    this.resizeCanvas(this.debugCanvas, this.debugCtx);
    this.backgroundGradient = this.createBackgroundGradient();
  }

  resizeCanvas(canvas, ctx) {
    canvas.width = Math.floor(this.width * this.pixelRatio);
    canvas.height = Math.floor(this.height * this.pixelRatio);
    canvas.style.width = `${this.width}px`;
    canvas.style.height = `${this.height}px`;
    ctx.setTransform(this.pixelRatio, 0, 0, this.pixelRatio, 0, 0);
  }

  render(pool, poseResult, showSkeleton, showLandmarkNumbers) {
    this.drawBackground();
    pool.draw(this.artCtx);
    this.renderDebug(poseResult, showSkeleton, showLandmarkNumbers);
  }

  drawBackground() {
    const ctx = this.artCtx;
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, this.width, this.height);

    // Subtle forest floor cue: visible only as a quiet base under bright particles.
    ctx.fillStyle = this.backgroundGradient;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  createBackgroundGradient() {
    const gradient = this.artCtx.createRadialGradient(
      this.width * 0.5,
      this.height * 1.06,
      0,
      this.width * 0.5,
      this.height * 1.02,
      this.width * 0.72,
    );
    gradient.addColorStop(0, "rgba(41, 94, 48, 0.18)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    return gradient;
  }

  renderDebug(poseResult, showSkeleton, showLandmarkNumbers) {
    const ctx = this.debugCtx;
    ctx.clearRect(0, 0, this.width, this.height);

    if (!showSkeleton || !poseResult?.landmarks?.length) {
      return;
    }

    for (const landmarks of poseResult.landmarks) {
      this.drawSkeleton(ctx, landmarks, showLandmarkNumbers);
    }
  }

  drawSkeleton(ctx, landmarks, showLandmarkNumbers) {
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = 3;
    ctx.strokeStyle = "rgba(114, 238, 255, 0.92)";
    ctx.fillStyle = "rgba(255, 245, 128, 0.95)";

    for (const [fromIndex, toIndex] of SKELETON_CONNECTIONS) {
      const from = landmarks[fromIndex];
      const to = landmarks[toIndex];

      if (!from || !to) {
        continue;
      }

      ctx.beginPath();
      ctx.moveTo(this.mapX(from.x), from.y * this.height);
      ctx.lineTo(this.mapX(to.x), to.y * this.height);
      ctx.stroke();
    }

    for (let i = 0; i < landmarks.length; i += 1) {
      const landmark = landmarks[i];
      const x = this.mapX(landmark.x);
      const y = landmark.y * this.height;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fill();

      if (showLandmarkNumbers) {
        ctx.fillStyle = "rgba(255, 255, 255, 0.96)";
        ctx.font = "11px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.fillText(String(i), x + 6, y - 5);
        ctx.fillStyle = "rgba(255, 245, 128, 0.95)";
      }
    }

    ctx.restore();
  }

  mapX(x) {
    return (APP.mirrorX ? 1 - x : x) * this.width;
  }
}

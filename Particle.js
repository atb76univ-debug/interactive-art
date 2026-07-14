import { LETTERS, PARTICLE } from "../config.js";
import { clamp, easeOutBack, easeOutCubic, rand, randInt } from "../utils/math.js";

export class Particle {
  constructor() {
    this.active = false;
    this.x = 0;
    this.y = 0;
    this.vx = 0;
    this.vy = 0;
    this.size = 0;
    this.life = 0;
    this.age = 0;
    this.drag = PARTICLE.drag;
    this.gravity = PARTICLE.gravity;
    this.rotation = 0;
    this.rotationSpeed = 0;
    this.hue = 0;
    this.saturation = 0;
    this.lightness = 0;
    this.colorStyle = "";
    this.glowStyle = "";
    this.alpha = 1;
    this.kind = "drop";
    this.letter = "";
    this.seed = 0;
  }

  spawn(options) {
    this.active = true;
    this.x = options.x;
    this.y = options.y;
    this.vx = options.vx;
    this.vy = options.vy;
    this.size = options.size;
    this.life = options.life;
    this.age = 0;
    this.drag = options.drag;
    this.gravity = options.gravity;
    this.rotation = options.rotation;
    this.rotationSpeed = options.rotationSpeed;
    this.hue = options.hue;
    this.saturation = options.saturation;
    this.lightness = options.lightness;
    this.colorStyle = options.colorStyle;
    this.glowStyle = options.glowStyle;
    this.kind = options.kind;
    this.letter = options.letter;
    this.seed = options.seed;
    this.alpha = 1;
  }

  update(deltaSeconds) {
    if (!this.active) {
      return;
    }

    this.age += deltaSeconds;
    if (this.age >= this.life) {
      this.active = false;
      return;
    }

    this.vx *= this.drag;
    this.vy = this.vy * this.drag + (this.gravity + PARTICLE.buoyancy) * deltaSeconds;
    this.x += this.vx * deltaSeconds;
    this.y += this.vy * deltaSeconds;
    this.rotation += this.rotationSpeed * deltaSeconds;

    const remaining = 1 - this.age / this.life;
    this.alpha = clamp(remaining * 1.35, 0, 1);
  }

  draw(ctx) {
    if (!this.active) {
      return;
    }

    const scale = this.getScale();
    const radius = this.size * scale;

    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);
    ctx.globalAlpha = this.alpha;

    if (this.kind === "letter") {
      this.drawLetter(ctx, radius, this.colorStyle, this.glowStyle);
    } else {
      this.drawDrop(ctx, radius, this.colorStyle, this.glowStyle);
    }

    ctx.restore();
  }

  getScale() {
    if (this.age < PARTICLE.fadeInSeconds) {
      return easeOutBack(this.age / PARTICLE.fadeInSeconds) * 1.2;
    }

    if (this.age < 0.32) {
      const t = (this.age - PARTICLE.fadeInSeconds) / 0.17;
      return 1.2 + (0.9 - 1.2) * easeOutCubic(t);
    }

    if (this.age < 0.5) {
      const t = (this.age - 0.32) / 0.18;
      return 0.9 + 0.1 * easeOutCubic(t);
    }

    return 1 + Math.sin(this.age * 2.1 + this.seed) * 0.045;
  }

  drawDrop(ctx, radius, color, glow) {
    const wobble = Math.sin(this.age * 2.7 + this.seed) * radius * 0.11;

    ctx.shadowColor = glow;
    ctx.shadowBlur = radius * 0.55;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, -radius * 0.72);
    ctx.bezierCurveTo(radius * 0.72 + wobble, -radius * 0.58, radius * 0.92, radius * 0.42, 0, radius);
    ctx.bezierCurveTo(-radius * 0.9, radius * 0.44, -radius * 0.76 - wobble, -radius * 0.56, 0, -radius * 0.72);
    ctx.closePath();
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.globalAlpha *= 0.5;
    ctx.fillStyle = "rgba(255, 255, 255, 0.66)";
    ctx.beginPath();
    ctx.ellipse(-radius * 0.22, -radius * 0.27, radius * 0.2, radius * 0.12, -0.55, 0, Math.PI * 2);
    ctx.fill();
  }

  drawLetter(ctx, radius, color, glow) {
    ctx.shadowColor = glow;
    ctx.shadowBlur = radius * 0.5;
    ctx.fillStyle = color;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.74)";
    ctx.lineWidth = Math.max(2, radius * 0.08);
    ctx.font = `900 ${Math.max(20, radius * 1.55)}px Inter, Arial, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.strokeText(this.letter, 0, radius * 0.04);
    ctx.fillText(this.letter, 0, radius * 0.04);
  }
}

export function createParticleOptions(x, y, force, color) {
  const angle = rand(0, Math.PI * 2);
  const speed = rand(18, 86) + force * rand(0.025, 0.09);
  const isLetter = Math.random() < 0.08;

  return {
    x: x + rand(-12, 12),
    y: y + rand(-12, 12),
    vx: Math.cos(angle) * speed + rand(-PARTICLE.drift, PARTICLE.drift),
    vy: Math.sin(angle) * speed - rand(10, 48),
    size: rand(PARTICLE.minSize, PARTICLE.maxSize) * (isLetter ? 1.06 : 1),
    life: rand(PARTICLE.minLife, PARTICLE.maxLife),
    drag: PARTICLE.drag - rand(0, 0.012),
    gravity: PARTICLE.gravity,
    rotation: rand(0, Math.PI * 2),
    rotationSpeed: rand(-0.78, 0.78),
    hue: color.hue,
    saturation: color.saturation,
    lightness: color.lightness,
    colorStyle: `hsl(${color.hue}, ${color.saturation}%, ${color.lightness}%)`,
    glowStyle: `hsla(${color.hue}, ${color.saturation}%, ${Math.min(color.lightness + 14, 86)}%, 0.28)`,
    kind: isLetter ? "letter" : "drop",
    letter: isLetter ? LETTERS[randInt(0, LETTERS.length - 1)] : "",
    seed: rand(0, 1000),
  };
}

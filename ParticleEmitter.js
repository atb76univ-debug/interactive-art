import { COLOR, EMIT } from "../config.js";
import { clamp, rand, randInt } from "../utils/math.js";
import { createParticleOptions } from "./Particle.js";

export class ParticleEmitter {
  constructor(pool) {
    this.pool = pool;
  }

  emitFromTrackedPoints(points, nowMs) {
    for (const point of points) {
      if (!point.visible) {
        continue;
      }

      const threshold = this.getThreshold(point.type);
      if (point.speed < threshold || nowMs - point.lastEmitAt < EMIT.idleCooldownMs) {
        continue;
      }

      const amount = this.getAmount(point.speed, point.type);
      this.emitBurst(point.x, point.y, amount, point.speed);
      point.lastEmitAt = nowMs;
    }
  }

  emitBurst(x, y, amount, force) {
    for (let i = 0; i < amount; i += 1) {
      this.pool.spawn(createParticleOptions(x, y, force, this.getRandomColor()));
    }
  }

  getThreshold(type) {
    if (type === "hand") {
      return EMIT.handThreshold;
    }

    if (type === "foot") {
      return EMIT.footThreshold;
    }

    return EMIT.movementThreshold;
  }

  getAmount(speed, type) {
    const normalized = clamp(speed / EMIT.fastSpeed, 0, 1);
    const calm = type === "foot" ? randInt(5, 10) : randInt(3, 8);
    const active = type === "hand" ? 20 : 14;
    const intense = EMIT.maxBurstPerPoint;
    return Math.round(calm + normalized * (active - calm) + normalized * normalized * (intense - active));
  }

  getRandomColor() {
    const useAlternate = Math.random() < COLOR.alternateChance;
    const hue = useAlternate
      ? rand(COLOR.alternateHueMin, COLOR.alternateHueMax)
      : rand(COLOR.hueMin, COLOR.hueMax);

    return {
      hue,
      saturation: rand(COLOR.saturationMin, COLOR.saturationMax),
      lightness: rand(COLOR.lightnessMin, COLOR.lightnessMax),
    };
  }
}

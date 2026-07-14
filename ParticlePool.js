import { Particle } from "./Particle.js";

export class ParticlePool {
  constructor(maxParticles) {
    this.particles = Array.from({ length: maxParticles }, () => new Particle());
    this.cursor = 0;
    this.activeCount = 0;
  }

  spawn(options) {
    const particle = this.getAvailableParticle();
    particle.spawn(options);
    return particle;
  }

  update(deltaSeconds) {
    let count = 0;

    for (const particle of this.particles) {
      if (!particle.active) {
        continue;
      }

      particle.update(deltaSeconds);
      if (particle.active) {
        count += 1;
      }
    }

    this.activeCount = count;
  }

  draw(ctx) {
    for (const particle of this.particles) {
      particle.draw(ctx);
    }
  }

  getAvailableParticle() {
    const total = this.particles.length;

    for (let i = 0; i < total; i += 1) {
      const index = (this.cursor + i) % total;
      const particle = this.particles[index];

      if (!particle.active) {
        this.cursor = (index + 1) % total;
        return particle;
      }
    }

    const particle = this.particles[this.cursor];
    this.cursor = (this.cursor + 1) % total;
    return particle;
  }
}

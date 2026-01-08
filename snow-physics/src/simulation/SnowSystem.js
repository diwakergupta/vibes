import { CONSTANTS } from '../constants.js';

export class SnowSystem {
    constructor(fluidSolver, gridPhys) {
        this.fluidSolver = fluidSolver;
        this.gridPhys = gridPhys;
        this.maxParticles = CONSTANTS.MAX_PARTICLES;
        this.count = 0;

        // SOA
        this.x = new Float32Array(this.maxParticles);
        this.y = new Float32Array(this.maxParticles);
        this.vx = new Float32Array(this.maxParticles);
        this.vy = new Float32Array(this.maxParticles);
        this.active = new Uint8Array(this.maxParticles);
    }

    spawn(x, y) {
        if (this.count >= this.maxParticles) return;

        // Simple linear search for empty slot
        // TODO: maintain a free list for O(1)
        for (let i = 0; i < this.maxParticles; i++) {
            if (this.active[i] === 0) {
                this.active[i] = 1;
                this.x[i] = x;
                this.y[i] = y;
                // Initial random velocity
                this.vx[i] = (Math.random() - 0.5) * 20;
                this.vy[i] = Math.random() * 10 + 5;
                this.count++;
                return;
            }
        }
    }

    update(dt) {
        const gravity = CONSTANTS.GRAVITY * 10; // Scale gravity for pixel coordinates

        for (let i = 0; i < this.maxParticles; i++) {
            if (this.active[i] === 0) continue;

            // 1. Get forces
            // transform particle pos to fluid grid
            const wind = this.fluidSolver.getVelocityAt(this.x[i], this.y[i]);

            // Apply wind drag
            // F_drag = C * (V_fluid - V_particle)
            // Simplified: direct velocity influence or strong drag
            const drag = 2.0 * dt;
            this.vx[i] += (wind.x * 50 - this.vx[i]) * drag; // Scale wind up
            this.vy[i] += (wind.y * 50 - this.vy[i]) * drag;

            // Apply Gravity
            this.vy[i] += gravity * dt;

            // Limit terminal velocity
            const tv = CONSTANTS.TERMINAL_VELOCITY;
            if (this.vy[i] > tv) this.vy[i] = tv;

            // 2. Integration (Euler)
            const nextX = this.x[i] + this.vx[i] * dt;
            const nextY = this.y[i] + this.vy[i] * dt;

            // 3. Collision
            // Check grid at next position
            if (this.gridPhys.checkCollision(nextX, nextY)) {
                // Determine deposit location
                // Just use current position (before entering wall)
                this.gridPhys.deposit(this.x[i], this.y[i]);

                // Kill particle
                this.active[i] = 0;
                this.count--;
            } else {
                this.x[i] = nextX;
                this.y[i] = nextY;
            }

            // Cleanup
            if (this.y[i] > window.innerHeight + 50 || this.x[i] < -50 || this.x[i] > window.innerWidth + 50) {
                this.active[i] = 0;
                this.count--;
            }
        }
    }
}

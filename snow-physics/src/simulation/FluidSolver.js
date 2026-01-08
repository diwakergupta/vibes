import { CONSTANTS } from '../constants.js';

export class FluidSolver {
    constructor(width, height) {
        this.width = Math.floor(width / CONSTANTS.FLUID_SCALE);
        this.height = Math.floor(height / CONSTANTS.FLUID_SCALE);
        this.size = this.width * this.height;

        // Density matches
        this.density = new Float32Array(this.size);
        this.prevDensity = new Float32Array(this.size);

        // Velocity (u = x, v = y)
        this.u = new Float32Array(this.size);
        this.v = new Float32Array(this.size);
        this.uPrev = new Float32Array(this.size);
        this.vPrev = new Float32Array(this.size);
    }

    step(dt) {
        const visc = CONSTANTS.FLUID_VISCOSITY;
        const diff = CONSTANTS.FLUID_DIFFUSION;

        // Velocity step
        this.diffuse(1, this.uPrev, this.u, visc, dt);
        this.diffuse(2, this.vPrev, this.v, visc, dt);

        this.project(this.uPrev, this.vPrev, this.u, this.v);

        this.advect(1, this.u, this.uPrev, this.uPrev, this.vPrev, dt);
        this.advect(2, this.v, this.vPrev, this.uPrev, this.vPrev, dt);

        this.project(this.u, this.v, this.uPrev, this.vPrev);

        // Density step
        this.diffuse(0, this.prevDensity, this.density, diff, dt);
        this.advect(0, this.density, this.prevDensity, this.u, this.v, dt);

        // Fade Density
        for (let i = 0; i < this.size; i++) {
            this.density[i] *= 0.995;
        }
    }

    addDensity(x, y, amount) {
        const idx = this.mouseToGrid(x, y);
        if (idx >= 0 && idx < this.size) {
            this.density[idx] += amount;
            // Clamp
            if (this.density[idx] > 5) this.density[idx] = 5;
        }
    }

    addVelocity(x, y, amountX, amountY) {
        const idx = this.mouseToGrid(x, y);
        if (idx >= 0 && idx < this.size) {
            this.u[idx] += amountX;
            this.v[idx] += amountY;
        }
    }

    // b: 0=scalar, 1=x, 2=y
    diffuse(b, x, x0, diff, dt) {
        const a = dt * diff * (this.width - 2) * (this.height - 2);
        this.lin_solve(b, x, x0, a, 1 + 6 * a);
    }

    lin_solve(b, x, x0, a, c) {
        const cRecip = 1.0 / c;
        for (let k = 0; k < CONSTANTS.FLUID_ITERATIONS; k++) {
            for (let j = 1; j < this.height - 1; j++) {
                for (let i = 1; i < this.width - 1; i++) {
                    const idx = this.IX(i, j);
                    x[idx] =
                        (x0[idx] +
                            a *
                            (x[this.IX(i + 1, j)] +
                                x[this.IX(i - 1, j)] +
                                x[this.IX(i, j + 1)] +
                                x[this.IX(i, j - 1)])) *
                        cRecip;
                }
            }
            this.set_bnd(b, x);
        }
    }

    project(velocX, velocY, p, div) {
        for (let j = 1; j < this.height - 1; j++) {
            for (let i = 1; i < this.width - 1; i++) {
                div[this.IX(i, j)] =
                    (-0.5 *
                        (velocX[this.IX(i + 1, j)] -
                            velocX[this.IX(i - 1, j)] +
                            velocY[this.IX(i, j + 1)] -
                            velocY[this.IX(i, j - 1)])) /
                    this.width;
                p[this.IX(i, j)] = 0;
            }
        }

        this.set_bnd(0, div);
        this.set_bnd(0, p);
        this.lin_solve(0, p, div, 1, 6);

        for (let j = 1; j < this.height - 1; j++) {
            for (let i = 1; i < this.width - 1; i++) {
                velocX[this.IX(i, j)] -= 0.5 * (p[this.IX(i + 1, j)] - p[this.IX(i - 1, j)]) * this.width;
                velocY[this.IX(i, j)] -= 0.5 * (p[this.IX(i, j + 1)] - p[this.IX(i, j - 1)]) * this.height;
            }
        }

        this.set_bnd(1, velocX);
        this.set_bnd(2, velocY);
    }

    advect(b, d, d0, velocX, velocY, dt) {
        const dt0 = dt * (this.width - 2);

        for (let j = 1; j < this.height - 1; j++) {
            for (let i = 1; i < this.width - 1; i++) {
                let x = i - dt0 * velocX[this.IX(i, j)];
                let y = j - dt0 * velocY[this.IX(i, j)];

                if (x < 0.5) x = 0.5;
                if (x > this.width - 1.5) x = this.width - 1.5;
                const i0 = Math.floor(x);
                const i1 = i0 + 1.0;

                if (y < 0.5) y = 0.5;
                if (y > this.height - 1.5) y = this.height - 1.5;
                const j0 = Math.floor(y);
                const j1 = j0 + 1.0;

                const s1 = x - i0;
                const s0 = 1.0 - s1;
                const t1 = y - j0;
                const t0 = 1.0 - t1;

                d[this.IX(i, j)] =
                    s0 * (t0 * d0[this.IX(i0, j0)] + t1 * d0[this.IX(i0, j1)]) +
                    s1 * (t0 * d0[this.IX(i1, j0)] + t1 * d0[this.IX(i1, j1)]);
            }
        }
        this.set_bnd(b, d);
    }

    set_bnd(b, x) {
        for (let i = 1; i < this.width - 1; i++) {
            x[this.IX(i, 0)] = b === 2 ? -x[this.IX(i, 1)] : x[this.IX(i, 1)];
            x[this.IX(i, this.height - 1)] = b === 2 ? -x[this.IX(i, this.height - 2)] : x[this.IX(i, this.height - 2)];
        }
        for (let j = 1; j < this.height - 1; j++) {
            x[this.IX(0, j)] = b === 1 ? -x[this.IX(1, j)] : x[this.IX(1, j)];
            x[this.IX(this.width - 1, j)] = b === 1 ? -x[this.IX(this.width - 2, j)] : x[this.IX(this.width - 2, j)];
        }

        // Corners
        x[this.IX(0, 0)] = 0.5 * (x[this.IX(1, 0)] + x[this.IX(0, 1)]);
        x[this.IX(0, this.height - 1)] = 0.5 * (x[this.IX(1, this.height - 1)] + x[this.IX(0, this.height - 2)]);
        x[this.IX(this.width - 1, 0)] = 0.5 * (x[this.IX(this.width - 2, 0)] + x[this.IX(this.width - 1, 1)]);
        x[this.IX(this.width - 1, this.height - 1)] = 0.5 * (x[this.IX(this.width - 2, this.height - 1)] + x[this.IX(this.width - 1, this.height - 2)]);
    }

    IX(x, y) {
        return x + y * this.width;
    }

    mouseToGrid(x, y) {
        const gx = Math.floor(x / CONSTANTS.FLUID_SCALE);
        const gy = Math.floor(y / CONSTANTS.FLUID_SCALE);
        return gx + gy * this.width;
    }

    getVelocityAt(x, y) {
        let gx = x / CONSTANTS.FLUID_SCALE;
        let gy = y / CONSTANTS.FLUID_SCALE;

        gx = Math.max(0, Math.min(this.width - 1.1, gx));
        gy = Math.max(0, Math.min(this.height - 1.1, gy));

        const i0 = Math.floor(gx);
        const i1 = i0 + 1;
        const j0 = Math.floor(gy);
        const j1 = j0 + 1;

        const sx = gx - i0;
        const sy = gy - j0;

        const u00 = this.u[this.IX(i0, j0)];
        const u10 = this.u[this.IX(i1, j0)];
        const u01 = this.u[this.IX(i0, j1)];
        const u11 = this.u[this.IX(i1, j1)];

        const lerpU1 = u00 * (1 - sx) + u10 * sx;
        const lerpU2 = u01 * (1 - sx) + u11 * sx;
        const finalU = lerpU1 * (1 - sy) + lerpU2 * sy;

        const v00 = this.v[this.IX(i0, j0)];
        const v10 = this.v[this.IX(i1, j0)];
        const v01 = this.v[this.IX(i0, j1)];
        const v11 = this.v[this.IX(i1, j1)];

        const lerpV1 = v00 * (1 - sx) + v10 * sx;
        const lerpV2 = v01 * (1 - sx) + v11 * sx;
        const finalV = lerpV1 * (1 - sy) + lerpV2 * sy;

        return { x: finalU, y: finalV };
    }
}

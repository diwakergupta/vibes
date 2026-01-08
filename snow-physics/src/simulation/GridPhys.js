import { CONSTANTS } from '../constants.js';

export class GridPhys {
    constructor(width, height) {
        this.width = Math.ceil(width / CONSTANTS.GRID_SIZE);
        this.height = Math.ceil(height / CONSTANTS.GRID_SIZE);
        this.size = this.width * this.height;

        this.density = new Uint8ClampedArray(this.size); // 0-255 (Display alpha/density)
        this.material = new Uint8Array(this.size);       // Enum
        this.temperature = new Float32Array(this.size);  // Celsius

        // Double buffer for CA steps to avoid race conditions (bias)
        // Or strictly strictly parallel updates.
        // For simple falling sand, changing in place from bottom-up is usually fine and faster.
    }

    step(dt) {
        // 1. Stability / Gravity for Snow
        // Iterate bottom-up to allow falling
        for (let y = this.height - 2; y >= 0; y--) {
            // Processing order can bias movement (left/right). Randomize x start or alternate?
            // Simple alternating scan
            const leftToRight = (y % 2 === 0);
            const startX = leftToRight ? 0 : this.width - 1;
            const endX = leftToRight ? this.width : -1;
            const stepX = leftToRight ? 1 : -1;

            for (let x = startX; x !== endX; x += stepX) {
                const idx = x + y * this.width;
                const mat = this.material[idx];

                if (mat === CONSTANTS.MAT_SNOW) {
                    this.updateSnowPixel(x, y, idx);
                }
            }
        }

        // 2. Thermodynamics
        // Simple melt check
        // Ideally diffusion, but for performance, just neighbor check with heaters
        for (let i = 0; i < this.size; i++) {
            if (this.material[i] === CONSTANTS.MAT_HEATER) {
                // Radiate heat (immediate neighbors melt)
                // TODO: Proper heatmap
                const x = i % this.width;
                const y = Math.floor(i / this.width);
                this.meltNeighbor(x + 1, y);
                this.meltNeighbor(x - 1, y);
                this.meltNeighbor(x, y + 1);
                this.meltNeighbor(x, y - 1);
            }
        }
    }

    meltNeighbor(x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) return;
        const idx = x + y * this.width;
        if (this.material[idx] === CONSTANTS.MAT_SNOW) {
            this.material[idx] = CONSTANTS.MAT_EMPTY;
            this.density[idx] = 0;
            // Spawn water particle? TODO
        }
    }

    updateSnowPixel(x, y, idx) {
        const belowIdx = idx + this.width;
        const belowMat = this.material[belowIdx];

        // 1. Fall down if empty
        if (belowMat === CONSTANTS.MAT_EMPTY) {
            this.move(idx, belowIdx);
            return;
        } else if (belowMat === CONSTANTS.MAT_WATER) {
            // Sink?
            this.swap(idx, belowIdx);
            return;
        }

        // 2. Slide (Angle of Repose)
        // If seated on top of snow or wall, check diagonals
        if (belowMat === CONSTANTS.MAT_SNOW || belowMat === CONSTANTS.MAT_WALL) {
            const left = x > 0;
            const right = x < this.width - 1;

            const blIdx = idx + this.width - 1;
            const brIdx = idx + this.width + 1;

            // Randomize fall direction slightly or check density
            const tryLeft = Math.random() < 0.5;

            if (tryLeft) {
                if (left && this.material[blIdx] === CONSTANTS.MAT_EMPTY) {
                    this.move(idx, blIdx);
                } else if (right && this.material[brIdx] === CONSTANTS.MAT_EMPTY) {
                    this.move(idx, brIdx);
                }
            } else {
                if (right && this.material[brIdx] === CONSTANTS.MAT_EMPTY) {
                    this.move(idx, brIdx);
                } else if (left && this.material[blIdx] === CONSTANTS.MAT_EMPTY) {
                    this.move(idx, blIdx);
                }
            }
        }
    }

    move(from, to) {
        this.material[to] = this.material[from];
        this.density[to] = this.density[from];
        this.temperature[to] = this.temperature[from];

        this.material[from] = CONSTANTS.MAT_EMPTY;
        this.density[from] = 0;
        this.temperature[from] = CONSTANTS.AMBIENT_TEMP;
    }

    swap(a, b) {
        const tm = this.material[a];
        const td = this.density[a];
        const tt = this.temperature[a];

        this.material[a] = this.material[b];
        this.density[a] = this.density[b];
        this.temperature[a] = this.temperature[b];

        this.material[b] = tm;
        this.density[b] = td;
        this.temperature[b] = tt;
    }

    checkCollision(x, y) {
        const gx = Math.floor(x / CONSTANTS.GRID_SIZE);
        const gy = Math.floor(y / CONSTANTS.GRID_SIZE);

        if (gx < 0 || gx >= this.width || gy < 0 || gy >= this.height) return true;

        const idx = gx + gy * this.width;
        return this.material[idx] !== CONSTANTS.MAT_EMPTY;
    }

    deposit(x, y) {
        const gx = Math.floor(x / CONSTANTS.GRID_SIZE);
        const gy = Math.floor(y / CONSTANTS.GRID_SIZE);

        if (gx >= 0 && gx < this.width && gy >= 0 && gy < this.height) {
            const idx = gx + gy * this.width;
            if (this.material[idx] === CONSTANTS.MAT_EMPTY) {
                this.material[idx] = CONSTANTS.MAT_SNOW;
                this.density[idx] = 120 + Math.random() * 50; // Variation
            } else {
                // Try neighbors if crowded?
            }
        }
    }

    setMaterial(x, y, value) {
        const gx = Math.floor(x / CONSTANTS.GRID_SIZE);
        const gy = Math.floor(y / CONSTANTS.GRID_SIZE);
        if (gx >= 0 && gx < this.width && gy >= 0 && gy < this.height) {
            const idx = gx + gy * this.width;
            this.material[idx] = value;
            if (value === CONSTANTS.MAT_WALL || value === CONSTANTS.MAT_HEATER) {
                this.density[idx] = 255;
            } else {
                this.density[idx] = 0;
            }
        }
    }

    // Debug draw helper (kept for fallback)
    draw(ctx) {
        const gs = CONSTANTS.GRID_SIZE;
        // Optimization: Don't draw every rect. 
        // Use ImageData? Or just draw necessary ones.
        // For high-res snowflakes, rects are slow.
        // But for debug it's ok.

        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const idx = x + y * this.width;
                const mat = this.material[idx];
                if (mat !== CONSTANTS.MAT_EMPTY) {
                    if (mat === CONSTANTS.MAT_SNOW) {
                        ctx.fillStyle = `rgba(230, 240, 255, ${this.density[idx] / 255})`;
                    }
                    else if (mat === CONSTANTS.MAT_WALL) ctx.fillStyle = "#64748b";
                    else if (mat === CONSTANTS.MAT_HEATER) ctx.fillStyle = "#ef4444";

                    ctx.fillRect(x * gs, y * gs, gs, gs);
                }
            }
        }
    }
}

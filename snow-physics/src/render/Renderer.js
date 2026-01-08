import { CONSTANTS } from '../constants.js';

export class Renderer {
    constructor(canvas, fluidSolver, snowSystem, gridPhys) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.fluidSolver = fluidSolver;
        this.snowSystem = snowSystem;
        this.gridPhys = gridPhys;

        this.width = canvas.width;
        this.height = canvas.height;

        this.debug = false;

        // Pre-render soft particle sprite
        this.cacheSnowSprite();
    }

    cacheSnowSprite() {
        this.snowSprite = document.createElement('canvas');
        this.snowSprite.width = 8;
        this.snowSprite.height = 8;
        const ctx = this.snowSprite.getContext('2d');

        const grad = ctx.createRadialGradient(4, 4, 0, 4, 4, 4);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.5, 'rgba(255, 255, 255, 0.4)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');

        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 8, 8);
    }

    resize(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
        this.width = w;
        this.height = h;
    }

    render() {
        this.ctx.fillStyle = "#0f111a";
        this.ctx.fillRect(0, 0, this.width, this.height);

        if (this.debug) {
            this.gridPhys.draw(this.ctx);
        }

        // Render Objects (Walls, Heaters)
        this.renderMaterials();

        // Render Snow Surface (Marching Squares)
        this.renderSnowSurface();

        // Render Falling Particles
        const snowX = this.snowSystem.x;
        const snowY = this.snowSystem.y;
        const snowActive = this.snowSystem.active;
        const cnt = this.snowSystem.maxParticles;
        const sprite = this.snowSprite;

        // Batch draw for falling particles?
        // drawImage is reasonably fast.
        for (let i = 0; i < cnt; i++) {
            if (snowActive[i] === 1) {
                this.ctx.drawImage(sprite, snowX[i] - 2, snowY[i] - 2);
            }
        }
    }

    renderMaterials() {
        const gs = CONSTANTS.GRID_SIZE;
        const w = this.gridPhys.width;
        const h = this.gridPhys.height;
        const mat = this.gridPhys.material;

        this.ctx.fillStyle = "#475569"; // Wall color
        this.ctx.beginPath();
        for (let i = 0; i < w * h; i++) {
            if (mat[i] === CONSTANTS.MAT_WALL) {
                const x = (i % w) * gs;
                const y = Math.floor(i / w) * gs;
                this.ctx.rect(x, y, gs, gs);
            }
        }
        this.ctx.fill();

        this.ctx.fillStyle = "#ef4444"; // Heater
        this.ctx.beginPath();
        for (let i = 0; i < w * h; i++) {
            if (mat[i] === CONSTANTS.MAT_HEATER) {
                const x = (i % w) * gs;
                const y = Math.floor(i / w) * gs;
                this.ctx.rect(x, y, gs, gs);
            }
        }
        this.ctx.fill();
    }

    renderSnowSurface() {
        const gs = CONSTANTS.GRID_SIZE;
        const w = this.gridPhys.width;
        const h = this.gridPhys.height;
        const density = this.gridPhys.density;
        const material = this.gridPhys.material;

        const iso = 100; // Threshold

        this.ctx.fillStyle = "#f1f5f9";
        this.ctx.beginPath();

        const lerp = (val1, val2) => {
            if (val1 === val2) return 0.5;
            if (val1 < iso && val2 < iso) return 0.5; // Both empty
            if (val1 >= iso && val2 >= iso) return 0.5; // Both full

            // Avoid div by zero or extreme lerps
            let t = (iso - val1) / (val2 - val1);
            if (t < 0) t = 0; if (t > 1) t = 1;
            return t;
        };

        // Scan full grid (Optimization potential: bounds mapping)
        for (let y = 0; y < h - 1; y++) {
            for (let x = 0; x < w - 1; x++) {
                const i0 = x + y * w;
                const i1 = (x + 1) + y * w;
                const i3 = x + (y + 1) * w;
                const i2 = (x + 1) + (y + 1) * w;

                // Treat non-snow as 0 density for smooth edge against air, 
                // but what about against wall? 
                // If neighbor is wall, treat as full density to blend?
                // Let's just lookup density.
                let v0 = (material[i0] === CONSTANTS.MAT_SNOW) ? density[i0] : (material[i0] === CONSTANTS.MAT_EMPTY ? 0 : 255);
                let v1 = (material[i1] === CONSTANTS.MAT_SNOW) ? density[i1] : (material[i1] === CONSTANTS.MAT_EMPTY ? 0 : 255);
                let v2 = (material[i2] === CONSTANTS.MAT_SNOW) ? density[i2] : (material[i2] === CONSTANTS.MAT_EMPTY ? 0 : 255);
                let v3 = (material[i3] === CONSTANTS.MAT_SNOW) ? density[i3] : (material[i3] === CONSTANTS.MAT_EMPTY ? 0 : 255);

                const c0 = v0 >= iso ? 8 : 0;
                const c1 = v1 >= iso ? 4 : 0;
                const c2 = v2 >= iso ? 2 : 0;
                const c3 = v3 >= iso ? 1 : 0;
                const caseIdx = c0 | c1 | c2 | c3;

                if (caseIdx === 0) continue;
                if (caseIdx === 15) {
                    this.ctx.rect(x * gs, y * gs, gs, gs);
                    continue;
                }

                // Coordinates for cell corners
                const X = x * gs;
                const Y = y * gs;

                // Edges
                const ax = X + gs * lerp(v0, v1); // Top
                const ay = Y;

                const bx = X + gs;
                const by = Y + gs * lerp(v1, v2); // Right

                const cx = X + gs * lerp(v3, v2); // Bottom
                const cy = Y + gs;

                const dx = X;
                const dy = Y + gs * lerp(v0, v3); // Left

                switch (caseIdx) {
                    case 1:
                        this.ctx.moveTo(dx, dy); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X, Y + gs);
                        break;
                    case 2:
                        this.ctx.moveTo(cx, cy); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y + gs);
                        break;
                    case 3:
                        this.ctx.moveTo(dx, dy); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y + gs); this.ctx.lineTo(X, Y + gs);
                        break;
                    case 4:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y);
                        break;
                    case 5:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y); this.ctx.closePath();
                        this.ctx.moveTo(dx, dy); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X, Y + gs);
                        break;
                    case 6:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X + gs, Y + gs); this.ctx.lineTo(X + gs, Y);
                        break;
                    case 7:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(dx, dy); this.ctx.lineTo(X, Y + gs); this.ctx.lineTo(X + gs, Y + gs); this.ctx.lineTo(X + gs, Y);
                        break;
                    case 8:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(dx, dy); this.ctx.lineTo(X, Y);
                        break;
                    case 9:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X, Y + gs); this.ctx.lineTo(X, Y);
                        break;
                    case 10:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(dx, dy); this.ctx.lineTo(X, Y); this.ctx.closePath();
                        this.ctx.moveTo(cx, cy); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y + gs);
                        break;
                    case 11:
                        this.ctx.moveTo(bx, by); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X, Y + gs); this.ctx.lineTo(X, Y); this.ctx.lineTo(X + gs, Y);
                        break;
                    case 12:
                        this.ctx.moveTo(dx, dy); this.ctx.lineTo(bx, by); this.ctx.lineTo(X + gs, Y); this.ctx.lineTo(X, Y);
                        break;
                    case 13:
                        this.ctx.moveTo(dx, dy); this.ctx.lineTo(cx, cy); this.ctx.lineTo(X + gs, Y + gs); this.ctx.lineTo(X + gs, Y); this.ctx.lineTo(X, Y);
                        break;
                    case 14:
                        this.ctx.moveTo(ax, ay); this.ctx.lineTo(dx, dy); this.ctx.lineTo(X, Y + gs); this.ctx.lineTo(X + gs, Y + gs); this.ctx.lineTo(X + gs, Y); // Check this
                        // Case 14 = 1110 (TL, TR, BR). BL Empty (1).
                        // Vertices: top-edge (A) and left-edge (D)? No.
                        // Vertices on cut should be: Left Edge (D) -> Bottom Edge (C)? No.
                        // Cut isolates BL. So cut is D->C.
                        // Polygon is everything else.
                        // A, B, C, D?
                        // AX->DY isolates TL? No.

                        // Let's re-verify Case 14:
                        // v3 is 0 (BL). Others 1.
                        // Crossings: Left edge (D, between v0 and v3) + Bottom edge (C, between v3 and v2).
                        // So cut is D->C.
                        // Vertices to fill: D -> A -> B -> C? Or D -> TL -> TR -> BR -> C ?

                        // Correct logic for case 14:
                        // Cut: D -> C.
                        // Fill: D -> TopLeft(X,Y) -> TopRight -> BottomRight -> C.
                        // Yes.
                        // My code above for case 14 was: ax->dx->... which is wrong cut.

                        // FIX:
                        this.ctx.moveTo(dx, dy);
                        this.ctx.lineTo(X, Y);      // TL
                        this.ctx.lineTo(X + gs, Y);   // TR
                        this.ctx.lineTo(X + gs, Y + gs);// BR
                        this.ctx.lineTo(cx, cy);    // Cut end
                        break;
                }
            }
        }
        this.ctx.fill();
    }
}

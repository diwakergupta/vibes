import { CONSTANTS } from './constants.js';
import { FluidSolver } from './simulation/FluidSolver.js';
import { SnowSystem } from './simulation/SnowSystem.js';
import { GridPhys } from './simulation/GridPhys.js';
import { Renderer } from './render/Renderer.js';

class App {
    constructor() {
        this.canvas = document.getElementById('simCanvas');
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // Init Systems
        this.fluidSolver = new FluidSolver(this.width, this.height);
        this.gridPhys = new GridPhys(this.width, this.height);
        this.snowSystem = new SnowSystem(this.fluidSolver, this.gridPhys);
        this.renderer = new Renderer(this.canvas, this.fluidSolver, this.snowSystem, this.gridPhys);

        // UI
        this.ui = {
            fps: document.getElementById('fpsDisplay'),
            particles: document.getElementById('particleCount'),
            tool: document.getElementById('toolSelect'),
            reset: document.getElementById('resetBtn'),
            debug: document.getElementById('debugToggle')
        };

        this.bindEvents();

        // Loop
        this.lastTime = 0;
        requestAnimationFrame(t => this.loop(t));
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        if (this.renderer) this.renderer.resize(this.width, this.height);
    }

    bindEvents() {
        this.isMouseDown = false;
        this.mouseX = 0;
        this.mouseY = 0;

        this.canvas.addEventListener('mousedown', e => {
            this.isMouseDown = true;
            this.handleInput(e);
        });

        this.canvas.addEventListener('mousemove', e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;
            if (this.isMouseDown) this.handleInput(e);
        });

        this.canvas.addEventListener('mouseup', () => this.isMouseDown = false);

        this.ui.reset.addEventListener('click', () => {
            // Reset logic
            this.gridPhys = new GridPhys(this.width, this.height);
            this.fluidSolver = new FluidSolver(this.width, this.height);
            this.snowSystem = new SnowSystem(this.fluidSolver, this.gridPhys);
            this.renderer.gridPhys = this.gridPhys;
            this.renderer.fluidSolver = this.fluidSolver;
            this.renderer.snowSystem = this.snowSystem;
        });

        this.ui.debug.addEventListener('click', () => {
            this.renderer.debug = !this.renderer.debug;
        });
    }

    handleInput(e) {
        const x = e.clientX;
        const y = e.clientY;
        const tool = this.ui.tool.value;

        const r = 20; // Brush radius

        // Simple brush loop
        if (tool === 'wind') {
            // Add velocity in direction of mouse movement? 
            // Or just "blow" to the right?
            // Let's make it a "blower" that blows in direction of drag or fixed?
            // User requested: "Click and drag to create localized wind sources"
            // Let's add velocity based on delta or constant "blowing away from cursor"?
            // Let's just add uniform velocity to the right for now, or random.
            this.fluidSolver.addVelocity(x, y, 50, 0); // Blow right
            this.fluidSolver.addDensity(x, y, 0.5); // Visual tracer
        } else if (tool === 'wall') {
            for (let i = -r; i < r; i += CONSTANTS.GRID_SIZE) {
                for (let j = -r; j < r; j += CONSTANTS.GRID_SIZE) {
                    this.gridPhys.setMaterial(x + i, y + j, CONSTANTS.MAT_WALL);
                }
            }
        } else if (tool === 'heat') {
            for (let i = -r; i < r; i += CONSTANTS.GRID_SIZE) {
                for (let j = -r; j < r; j += CONSTANTS.GRID_SIZE) {
                    this.gridPhys.setMaterial(x + i, y + j, CONSTANTS.MAT_HEATER);
                }
            }
        }
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        // 1. Fluid Step
        this.fluidSolver.step(dt);

        // 2. Snow Step
        // Continuous spawn
        for (let i = 0; i < 5; i++) {
            this.snowSystem.spawn(Math.random() * this.width, 0);
        }

        this.snowSystem.update(dt);

        // 3. Grid Step
        this.gridPhys.step(dt);

        // 4. Render
        this.renderer.render();

        // UI Updates
        this.ui.fps.innerText = Math.round(1 / dt);
        this.ui.particles.innerText = this.snowSystem.count;

        requestAnimationFrame(t => this.loop(t));
    }
}

new App();

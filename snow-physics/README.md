# High-Fidelity 2D Snow Physics Engine

A sophisticated 2D snow accumulation simulator that improves upon basic "falling sand" cellular automata by introducing fluid dynamics, thermodynamics, and structural integrity.

## Features

- **Hybrid Architecture**: Combines Eulerian Fluid Dynamics (Wind) with Lagrangian Particles (Snowflakes) and Grid-based Physics (Accumulation).
- **Realistic Wind**: Uses a stable Navier-Stokes solver to simulate wind that flows around obstacles and creates eddies.
- **Snow Accumulation**: Snow piles up realistically, accounting for angle of repose (avalanches) and compression.
- **Thermodynamics**: Heaters melt snow on contact.
- **Visuals**: Smooth surface rendering using Marching Squares and soft particle sprites.

## Tech Stack

- **HTML5 Canvas** & **Vanilla JavaScript (ES6 Modules)**
- **Physics**: Custom implementation of Jos Stam's Stable Fluids and Grid-based sand physics.
- **Rendering**: Custom Marching Squares implementation.

## How to Run

Simply open `index.html` in a browser or serve the directory.

## Controls

- **Wind Emitter**: Select tool and drag to blow wind.
- **Obstacle (Wall)**: Draw walls that block snow and wind.
- **Heater**: Draw heat sources to melt snow.

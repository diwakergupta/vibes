# High-Fidelity 2D Snow Physics Engine

A sophisticated 2D snow accumulation simulator that improves upon basic "falling sand" cellular automata by introducing fluid dynamics, thermodynamics, and structural integrity.

## Features

*   **Hybrid Lagrangian-Eulerian system**:
    *   **Air/Wind**: Semi-Lagrangian fluid solver for wind that flows around obstacles.
    *   **Snowflakes**: Particles with mass and drag.
    *   **Accumulation**: Grid-based snowpack with variable density.
*   **Advanced Aerodynamics**:
    *   Vector field flow obstructed by user-drawn shapes.
    *   Turbulence and eddies behind obstacles.
*   **Snowpack Physics**:
    *   Variable density and compression.
    *   Avalanche mechanics based on stability/shear.
*   **Thermodynamics**:
    *   Heat transfer from obstacles.
    *   Phase change (Snow -> Water -> Ice).
*   **Rendering**:
    *   Marching Squares for smooth snow surface.
    *   2D normal mapping for lighting.

## Controls

*   **Left Click**: Draw/Apply selected tool.
*   **Right Click** (or Shift + Click): Erase/Remove.
*   **Tools**:
    *   **Wall**: Blocks wind and snow.
    *   **Heater**: Melts snow.
    *   **Wind**: Creates a localized wind source.
    *   **Ice**: Slippery surface.

## Prompt

The following prompt was used to generate this tool:

> Add a 2D snow falling simulator, according to the following spec:
>
> Project Specification: High-Fidelity 2D Snow Physics Engine
>
> Objective: Architect and implement a sophisticated 2D snow accumulation simulator that improves upon basic "falling sand" cellular automata by introducing fluid dynamics, thermodynamics, and structural integrity.
>
> Core Architecture
> Shift from a pure Cellular Automata (CA) model to a Hybrid Lagrangian-Eulerian system:
> Air/Wind (Eulerian): Implement a semi-Lagrangian fluid solver (or a simplified vector field approximation) for air. Wind should not be a global constant; it must flow around obstacles, creating eddies and low-pressure zones behind structures to simulate realistic "snowdrifts."
> Snowflakes (Lagrangian): Particles with mass and drag coefficients that traverse the vector field.
> Accumulation (Grid/Voxel): Once settled, particles transfer to a grid that handles structural physics.
>
> Key Feature Requirements
> 1. Advanced Aerodynamics (The "Drifting" Effect)
> Vector Field Flow: Wind must be obstructed by user-drawn shapes.
> Turbulence: Snowflakes should get caught in vortices behind walls (lee side), causing realistic accumulation patterns (cornices and drifts) rather than simple vertical piling.
> 2. Snowpack Physics (The "Crunch" Factor)
> Variable Density: Tracking density per grid cell. Fresh snow is low density (fluffy); older snow or snow under pressure becomes high density (ice).
> Compression: Snow cells deep in a pile should slowly convert to ice/packed snow, changing their visual color (white -> blueish) and physical stability.
> Angle of Repose & Shearing: Instead of simple 45-degree sliding, implement stability checks. If a column of snow is too high and lacks support (cornice), it should risk structural failure (avalanche) based on shear strength.
> 3. Thermodynamics (Melting & Freezing)
> Heat Transfer: Assign thermal properties to obstacles. A "heated copper pipe" should melt snow on contact.
> Phase Change: Melted snow becomes water particles (which flow faster/differently) and can re-freeze into ice if they move away from the heat source or ambient temperature drops.
> 4. Rendering & Visuals
> Sub-pixel Rendering: Abandon the raw blocky grid look. Use Marching Squares or similar contouring algorithms to render the snow surface as smooth curves.
> Lighting: Implement 2D normal mapping based on the snow surface gradient to simulate sunlight and self-shadowing.
>
> Technical Constraints & Stack
> Language: HTML5 Canvas / JavaScript (ES6+).
> Optimization: Use TypedArrays (Uint8ClampedArray) for the physics grid to manage memory. Use Spatial Partitioning for particle collisions if particle count exceeds 5,000.
>
> User Interactions
> Material Brush: Paint surfaces with different friction/heat properties (e.g., Ice (slippery), Wood (sticky), Heater (melts)).
> Wind Emitter: Click and drag to create localized wind sources (blowers).

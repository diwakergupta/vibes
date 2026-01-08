export const CONSTANTS = {
    // Grid & World
    GRID_SIZE: 4, // Size of a physics grid cell in pixels
    GRAVITY: 9.81,

    // Snow Physics
    MAX_PARTICLES: 10000,
    PARTICLE_MASS: 1.0,
    TERMINAL_VELOCITY: 50.0,
    SNOW_DENSITY_FRESH: 100, // kg/m^3
    SNOW_DENSITY_ICE: 900,   // kg/m^3

    // Fluid Solver (Wind)
    FLUID_ITERATIONS: 4,
    FLUID_DIFFUSION: 0.0001,
    FLUID_VISCOSITY: 0.0001,
    FLUID_SCALE: 4, // Fluid grid is 4x coarser than physics grid for perf

    // Thermodynamics
    AMBIENT_TEMP: -5.0, // Celsius
    MELT_TEMP: 0.0,
    HEAT_SOURCE_TEMP: 20.0,

    // Materials
    MAT_EMPTY: 0,
    MAT_WALL: 1,
    MAT_SNOW: 2,
    MAT_WATER: 3,
    MAT_HEATER: 4
};

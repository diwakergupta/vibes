# Maze Runner

A first-person maze navigation game controlled entirely by body movements via webcam.

## How It Works

Navigate through a procedurally generated maze using your upper body movements:

- **Lean forward** → Move forward
- **Lean back** → Move backward  
- **Lean left** → Turn left
- **Lean right** → Turn right

## Features

- **Procedural Mazes**: New random maze generated every time
- **First-Person View**: Raycasted 3D perspective using Three.js
- **Full Body Tracking**: Powered by MediaPipe Pose for accurate body lean detection
- **Snappy Controls**: Responsive movement and turning with intensity-based speed scaling
- **Mini-map**: Toggleable overlay showing your position and the maze layout
- **Adjustable Sensitivity**: Three sliders for movement speed, turn speed, and response threshold
- **Calibration**: Set your neutral position anytime for optimal control
- **Live Feedback**: Visual bars showing your current lean intensity
- **Severance Aesthetic**: Clean, minimal white walls with sterile corporate vibes

## Tech Stack

- Three.js for 3D rendering
- MediaPipe Pose for full body tracking (runs entirely client-side)
- Recursive backtracker algorithm for maze generation
- Pure HTML/CSS/JavaScript - no server required

## Usage

1. Open `index.html` in a modern web browser
2. Allow camera access when prompted
3. Position yourself so your upper body (head, shoulders, torso) is visible
4. Click "Enter the Maze" to begin
5. Use the **Calibrate** button to set your neutral standing position
6. Lean to navigate!

**Tip**: Make sure you have good lighting and stand back far enough for the camera to see your full upper body.

## Controls

- **Movement Speed**: How fast you move when leaning forward/back (1-10)
- **Turn Speed**: How fast you rotate when leaning left/right (1-10)  
- **Response**: How sensitive the controls are to small leans (1-10)
  - Higher = more responsive, triggers with smaller movements
  - Lower = requires bigger leans to trigger

## Prompt Used

> Create a new project, called "mazerunner". Basically the user has to navigate a maze just using their head gestures.
> 
> Details:
> - static, client-side application
> - generate a new maze everytime
> - show a small "map view" on top right, with a red dot indicating current position in the maze
> - use webcam to get real-time feedback, navigation happens segway style -- user tilts head left / right for turns, up for going "up" in the map, down for going "down" (could also do lean forward / back if that's easier)
> - as user is moving, render the maze from the PoV of the user (first person). this is the primary UX, takes up most of the space on the screen
> 
> Implementation preferences:
> 1. Option B (lean body left/right to turn, lean forward/back to move)
> 2. Smooth turning
> 3. White walls, aesthetic inspired by the TV show Severance
> 4. Toggleable minimap
> 5. Adjustable sensitivity settings

## Updates

- Switched to full body pose tracking for better forward/back detection
- Fixed left/right turn direction
- Increased movement and turn speeds for snappier response
- Added intensity-based speed scaling (lean more = move faster)
- Added visual feedback bars for lean detection
# ErgoCoach Development Context

## Project Overview
ErgoCoach is a client-side, privacy-first web application that uses computer vision (TensorFlow.js) to provide real-time ergonomic feedback. It runs entirely in the browser.

## Technical Architecture
*   **Format**: Single-file HTML (`index.html`).
*   **Styling**: Tailwind CSS via CDN.
*   **AI Engine**: TensorFlow.js with the **MoveNet** (SinglePose Lightning) model.
*   **Rendering**: HTML5 Canvas overlay on top of a mirrored Video element.

## Key Implementation Details

### Coordinate System & Mirroring
*   The video feed is CSS-mirrored (`scale-x-[-1]`) to act like a mirror.
*   The Canvas is also mirrored to align dots with the video.
*   **Text Rendering**: Because the canvas is mirrored, text drawn normally appears backwards. We use a helper `drawText` that applies an inverse transform (`scale(-1, 1)`) at the specific coordinate to render readable text.

### Ergonomic Logic
1.  **Head Tilt**: Angle between eyes. Threshold: **12°**.
2.  **Shoulder Level**: Angle between shoulders. Threshold: **12°**.
3.  **Distance**: Calculated via shoulder width relative to frame width.
    *   Logic: `shoulder_width_px / canvas_width_px`.
    *   Range: < 0.15 (Too Far) to > 0.5 (Too Close).
4.  **Smoothing**: Exponential Moving Average (alpha = 0.2) is applied to angles to prevent UI jitter.

### Camera Context
*   The app inspects `navigator.mediaDevices` track labels.
*   Keywords: "facetime", "built-in", "integrated" -> **Laptop Mode**.
*   Otherwise -> **External Webcam Mode**.
*   This switches the "Tips" displayed in the sidebar.

## History & Decisions
*   **Display Mode**: Switched from `object-cover` to `object-contain` to prevent zooming/cropping issues on different window sizes.
*   **Math Fix**: Fixed angle calculation to use `left.x - right.x` (positive X delta) instead of `right.x - left.x` to avoid 180° inversion bugs.
*   **Visuals**: Added Green/Red state indicators and "Visual Guidance" (arrows ⟲/⟳) when posture is poor.

## Running the Project
Simply open `index.html` in a modern browser. No build step required.

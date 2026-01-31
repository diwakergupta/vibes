# ErgoCoach Specification

## Overview
ErgoCoach is a client-side, privacy-first web application that provides real-time ergonomic posture feedback using computer vision. All processing happens in the browser—no data leaves the user's device.

## Technical Requirements
- Single-file HTML application (no build step)
- Tailwind CSS via CDN for styling
- TensorFlow.js with MoveNet (SinglePose Lightning) for pose detection
- Works in modern browsers with webcam access

## Core Features

### 1. Pose Detection
Use MoveNet to detect facial and upper body keypoints:
- `nose`, `left_eye`, `right_eye`, `left_ear`, `right_ear`
- `left_shoulder`, `right_shoulder`

Minimum confidence threshold: 0.3

### 2. Ergonomic Metrics

#### Head Tilt (Roll)
- **What**: Angle between eyes (ear-to-shoulder tilt)
- **Calculation**: `atan2(rightEye.y - leftEye.y, leftEye.x - rightEye.x)`
- **Threshold**: < 12° is good
- **Feedback**: "Fix head tilt" with rotation arrow overlay

#### Head Pitch (Looking Down)
- **What**: Detects if user is looking down at screen
- **Calculation**: `(nose.y - eyeMidpoint.y) / eyeDistance`
- **Threshold**: < 0.85 ratio is good
- **Feedback**: "Raise your head" with upward arrow overlay

#### Shoulder Level
- **What**: Angle between shoulders
- **Calculation**: `atan2(rightShoulder.y - leftShoulder.y, leftShoulder.x - rightShoulder.x)`
- **Threshold**: < 12° is good
- **Feedback**: "Level shoulders" with horizontal guide line

#### Screen Distance
- **What**: Proximity to camera (proxy for screen distance)
- **Calculation**: `shoulderWidth / frameWidth`
- **Thresholds**:
  - < 0.15 = Too Far
  - 0.15 - 0.50 = Good
  - > 0.50 = Too Close
- **Feedback**: Distance status text

### 3. Smoothing
Apply Exponential Moving Average (alpha = 0.2) to all angle/ratio measurements to reduce UI jitter.

### 4. Visual Feedback

#### Canvas Overlay
- Draw keypoint dots (blue) on detected points
- Draw skeleton lines between connected keypoints
- Color-code lines: green = good, red = needs adjustment
- Show guidance overlays (arrows, target lines) when posture is poor

#### Mirroring
- Video feed is CSS-mirrored (`scale-x-[-1]`) to act as a mirror
- Canvas is also mirrored to align with video
- Text must be inverse-transformed to remain readable

#### Status Panel
- Overall status: "Great Posture!" (green) / "Adjustment Needed" (red)
- Individual metric cards with values and color indicators
- Tips section with context-aware advice

### 5. Camera Context Detection
Inspect `navigator.mediaDevices` track labels:
- Keywords "facetime", "built-in", "integrated" → Laptop mode tips
- Otherwise → External webcam tips

## UI Layout
```
+------------------------------------------+
| Header: Logo + "Privacy first" tagline   |
+------------------------------------------+
|                    |  Posture Status     |
|   Video Feed       |  -----------------  |
|   (with canvas     |  Head Tilt    [●]   |
|    overlay)        |  Head Pitch   [●]   |
|                    |  Distance     [●]   |
|                    |  Shoulders    [●]   |
|                    |  -----------------  |
|                    |  Tips panel         |
+------------------------------------------+
```

## User Flow
1. Page loads → AI model initializes (loading spinner)
2. Model ready → "Start Camera" button appears
3. User clicks → Camera permission requested
4. Camera active → Real-time pose detection begins
5. Continuous feedback loop at ~30fps

## Key Implementation Notes
- Use `requestAnimationFrame` for detection loop
- Canvas dimensions must match video dimensions
- Handle camera permission denial gracefully
- No external dependencies beyond CDN scripts

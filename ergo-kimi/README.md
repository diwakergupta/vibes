# ErgoCoach

Real-time ergonomic posture feedback using computer vision. Privacy-first - all processing happens client-side.

## Prompt Used

```
Create ErgoCoach: A client-side, privacy-first web application that provides real-time ergonomic posture feedback using computer vision.

Technical Requirements:
- Single-file HTML application (no build step)
- Tailwind CSS via CDN for styling
- TensorFlow.js with MoveNet (SinglePose Lightning) for pose detection
- Works in modern browsers with webcam access

Core Features:

1. Pose Detection:
- Use MoveNet to detect facial and upper body keypoints: nose, left_eye, right_eye, left_ear, right_ear, left_shoulder, right_shoulder
- Minimum confidence threshold: 0.3

2. Ergonomic Metrics with EMA smoothing (alpha=0.2):
- Head Tilt (Roll): Angle between eyes, threshold < 12° is good
- Head Pitch (Looking Down): Ratio calculation, threshold < 0.85 is good  
- Shoulder Level: Angle between shoulders, threshold < 12° is good
- Screen Distance: shoulderWidth / frameWidth, 0.15-0.50 is good range

3. Visual Feedback:
- CSS-mirrored video feed with canvas overlay
- Keypoint dots (blue) on detected points
- Color-coded lines (green=good, red=needs adjustment)
- Animated SVG guidance overlays (arrows, target lines) when posture is poor
- Status panel with overall posture status and individual metric cards
- Tips section with context-aware advice for laptop vs external webcam users

4. Camera Context Detection:
- Inspect navigator.mediaDevices track labels
- Keywords "facetime", "built-in", "integrated" → Laptop mode tips
- Otherwise → External webcam tips

User Flow:
1. Page loads → AI model initializes (loading spinner)
2. Model ready → "Start Camera" button appears
3. User clicks → Camera permission requested
4. Camera active → Real-time pose detection begins
5. Continuous feedback loop at ~30fps
```

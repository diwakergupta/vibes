# ErgoCoach 🧘

A privacy-first, client-side web application that uses your webcam and AI to provide real-time ergonomic feedback.

## Features

*   **Real-time Posture Analysis**: Detects head tilt, shoulder alignment, and screen distance.
*   **Visual Guidance Overlay**: Shows on-screen reference lines and correction arrows (⟲/⟳) to help you align your head and shoulders.
*   **Smart Camera Detection**: Automatically detects if you're using a laptop or external webcam and adjusts ergonomic advice accordingly.
*   **Privacy Focused**: All processing happens locally in your browser using TensorFlow.js. No video data is ever sent to a server.
*   **Instant Feedback**: Visual indicators and text alerts help you correct your posture immediately.

## Usage

1.  Allow camera access when prompted.
2.  Position yourself so your head and shoulders are clearly visible.
3.  Follow the on-screen guidance and green/red indicators to adjust your setup.

## Prompt

The following prompt was used to generate this tool:

> build a client-side web app that uses the webcam to offer users real time feedback on the ergonomics of their setup. use a new directory, call it `ergocoach`. share your plan for review before you implement anything.

// ─────────────────────────────────────────────
// audio.js  –  Web Audio API mic handling
// ─────────────────────────────────────────────

import { detectPitch } from './pitch.js';

const FFT_SIZE = 4096;

let audioCtx    = null;
let analyser    = null;
let source      = null;
let stream      = null;
let timeBuf     = null;
let running     = false;
let onPitch     = null;  // callback: ({ frequency, confidence } | null) => void

/**
 * Initialise (or resume) the audio pipeline.
 * Returns a promise that resolves once the mic is live.
 */
async function startAudio(pitchCallback) {
  onPitch = pitchCallback;

  if (audioCtx && audioCtx.state === 'suspended') {
    await audioCtx.resume();
  }

  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (!stream) {
    stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        noiseSuppression: false,
        autoGainControl:  false,
      },
    });
  }

  if (!source) {
    source   = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0;   // we smooth ourselves
    source.connect(analyser);
    timeBuf = new Float32Array(analyser.fftSize);
  }

  running = true;
  _tick();
}

/**
 * Stop listening and release the microphone.
 */
function stopAudio() {
  running = false;
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    stream = null;
  }
  if (source) { source.disconnect(); source = null; }
  if (audioCtx) { audioCtx.close(); audioCtx = null; }
  analyser = null;
}

/** Internal animation-frame loop. */
function _tick() {
  if (!running) return;
  analyser.getFloatTimeDomainData(timeBuf);
  const result = detectPitch(timeBuf, audioCtx.sampleRate);
  if (onPitch) onPitch(result);
  requestAnimationFrame(_tick);
}

export { startAudio, stopAudio };

// ─────────────────────────────────────────────
// pitch.js  –  autocorrelation pitch detector
// ─────────────────────────────────────────────

/**
 * Attempt to detect pitch via normalised autocorrelation (McLeod-style).
 *
 * @param {Float32Array} buf   – time-domain audio buffer
 * @param {number} sampleRate  – audio context sample rate
 * @returns {{ frequency: number, confidence: number } | null}
 *
 * The algorithm:
 *   1. Compute the RMS; bail early if silence.
 *   2. Normalised autocorrelation across plausible lag range.
 *   3. Find the first clear peak above a confidence threshold.
 *   4. Parabolic interpolation around the peak for sub-sample accuracy.
 */
function detectPitch(buf, sampleRate) {
  const SIZE = buf.length;

  // ── 1. RMS noise gate ──────────────────────
  let rms = 0;
  for (let i = 0; i < SIZE; i++) rms += buf[i] * buf[i];
  rms = Math.sqrt(rms / SIZE);
  if (rms < 0.008) return null;           // silence / background noise

  // ── 2. Autocorrelation ─────────────────────
  // Only compute over lags that correspond to 80 Hz – 1200 Hz
  const minLag = Math.floor(sampleRate / 1200);
  const maxLag = Math.ceil(sampleRate / 80);
  const nsdf   = new Float32Array(maxLag + 1);   // normalised SDF

  for (let lag = minLag; lag <= maxLag; lag++) {
    let num = 0, den = 0;
    for (let i = 0; i < SIZE - lag; i++) {
      num += buf[i] * buf[i + lag];
      den += buf[i] * buf[i] + buf[i + lag] * buf[i + lag];
    }
    nsdf[lag] = den === 0 ? 0 : 2 * num / den;
  }

  // ── 3. Peak-picking (first strong peak) ────
  let bestLag   = -1;
  let bestVal   = -1;
  let searching = false;

  for (let lag = minLag; lag <= maxLag; lag++) {
    if (nsdf[lag] > 0)  searching = true;
    if (!searching) continue;

    if (nsdf[lag] > bestVal) {
      bestVal = nsdf[lag];
      bestLag = lag;
    }

    // Once we fall below zero after a positive run, accept if strong enough
    if (nsdf[lag] < 0 && searching) {
      if (bestVal > 0.35) break;          // good enough peak found
      // else reset and keep looking
      bestVal   = -1;
      bestLag   = -1;
      searching = false;
    }
  }

  if (bestLag < 0 || bestVal < 0.35) return null;

  // ── 4. Parabolic interpolation ─────────────
  const prev = nsdf[bestLag - 1] || 0;
  const curr = nsdf[bestLag];
  const next = nsdf[bestLag + 1] || 0;
  const shift = (prev - next) / (2 * (prev - 2 * curr + next));
  const refinedLag = bestLag + (isFinite(shift) ? shift : 0);

  const frequency  = sampleRate / refinedLag;
  const confidence = bestVal;              // 0–1, higher = more confident

  // Sanity bounds
  if (frequency < 60 || frequency > 1400) return null;

  return { frequency, confidence };
}

export { detectPitch };

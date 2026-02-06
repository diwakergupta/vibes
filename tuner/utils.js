// ─────────────────────────────────────────────
// utils.js  –  note / frequency helpers
// ─────────────────────────────────────────────

const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

/**
 * Convert a frequency (Hz) to the nearest MIDI note number.
 * A4 = MIDI 69, but we allow a custom A4 reference.
 */
function frequencyToNoteNumber(freq, a4 = 440) {
  return Math.round(12 * Math.log2(freq / a4)) + 69;
}

/**
 * MIDI note number → ideal frequency for the given A4 reference.
 */
function noteNumberToFrequency(noteNum, a4 = 440) {
  return a4 * Math.pow(2, (noteNum - 69) / 12);
}

/**
 * Return { note, octave, noteNumber, expectedFreq, cents } for a detected freq.
 */
function frequencyToNoteInfo(freq, a4 = 440) {
  const noteNum  = frequencyToNoteNumber(freq, a4);
  const expected = noteNumberToFrequency(noteNum, a4);
  const cents    = 1200 * Math.log2(freq / expected);
  return {
    note:         NOTE_NAMES[((noteNum % 12) + 12) % 12],
    octave:       Math.floor(noteNum / 12) - 1,
    noteNumber:   noteNum,
    expectedFreq: expected,
    cents:        cents,
  };
}

/**
 * Map a cents value to a colour from the spec palette.
 *  |cents| > 30  → red
 *  10–30         → amber
 *  3–10          → yellow
 *  < 3           → green
 */
function centsToColor(cents) {
  const a = Math.abs(cents);
  if (a > 30) return '#FF4444';
  if (a > 10) return '#FFB84D';
  if (a > 3)  return '#FFE44D';
  return '#44FF88';
}

/**
 * Lerp between two hex colours. t ∈ [0,1].
 */
function lerpColor(c1, c2, t) {
  const p = (c) => [
    parseInt(c.slice(1,3),16),
    parseInt(c.slice(3,5),16),
    parseInt(c.slice(5,7),16),
  ];
  const a = p(c1), b = p(c2);
  const r = Math.round(a[0] + (b[0]-a[0]) * t);
  const g = Math.round(a[1] + (b[1]-a[1]) * t);
  const bl= Math.round(a[2] + (b[2]-a[2]) * t);
  return `rgb(${r},${g},${bl})`;
}

/**
 * Smooth colour based on absolute cents distance.
 * Returns an interpolated colour across the red → amber → yellow → green spectrum.
 */
function centsSmoothColor(cents) {
  const a = Math.abs(cents);
  if (a >= 40) return '#FF4444';
  if (a >= 30) return lerpColor('#FFB84D','#FF4444', (a-30)/10);
  if (a >= 10) return lerpColor('#FFE44D','#FFB84D', (a-10)/20);
  if (a >= 3)  return lerpColor('#44FF88','#FFE44D', (a-3)/7);
  return '#44FF88';
}

// Cheeky celebration messages
const CHEEKY_MESSAGES = [
  'Nailed it!',
  "Chef's kiss",
  'Pitch perfect!',
  "That's the sweet spot!",
  'Dialled in.',
  'Spot on!',
  'Beautifully in tune.',
  'Couldn\'t be better.',
  'Locked and loaded.',
  'Right on the money!',
];
let _lastMsgIdx = -1;
function randomCheekyMessage() {
  let idx;
  do { idx = Math.floor(Math.random() * CHEEKY_MESSAGES.length); }
  while (idx === _lastMsgIdx && CHEEKY_MESSAGES.length > 1);
  _lastMsgIdx = idx;
  return CHEEKY_MESSAGES[idx];
}

export {
  NOTE_NAMES,
  frequencyToNoteNumber,
  noteNumberToFrequency,
  frequencyToNoteInfo,
  centsToColor,
  lerpColor,
  centsSmoothColor,
  randomCheekyMessage,
};

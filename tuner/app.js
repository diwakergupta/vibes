// ─────────────────────────────────────────────
// app.js  –  main application logic
// ─────────────────────────────────────────────

import { startAudio, stopAudio } from './audio.js';
import {
  frequencyToNoteInfo,
  centsSmoothColor,
  randomCheekyMessage,
} from './utils.js';

// ── DOM refs ─────────────────────────────────
const $app            = document.getElementById('app');
const $start          = document.getElementById('start-screen');
const $startBtn       = document.getElementById('start-btn');
const $tuner          = document.getElementById('tuner-screen');
const $error          = document.getElementById('error-screen');
const $errorTitle     = document.getElementById('error-title');
const $errorMsg       = document.getElementById('error-message');
const $errorRetry     = document.getElementById('error-retry');
const $status         = document.getElementById('status');
const $noteName       = document.getElementById('note-name');
const $noteFreq       = document.getElementById('note-freq');
const $meterWrap      = document.getElementById('meter-wrap');
const $indicator      = document.getElementById('meter-indicator');
const $cents          = document.getElementById('cents-display');
const $toast          = document.getElementById('message-toast');
const $streak         = document.getElementById('streak');
const $settingsBtn    = document.getElementById('settings-toggle');
const $backdrop       = document.getElementById('settings-backdrop');
const $panel          = document.getElementById('settings-panel');
const $settingsClose  = document.getElementById('settings-close');
const $a4Select       = document.getElementById('a4-select');
const $a4Custom       = document.getElementById('a4-custom');
const $themeSelect    = document.getElementById('theme-select');
const $soundToggle    = document.getElementById('sound-toggle');
const $particles      = document.getElementById('particles');

// ── State ────────────────────────────────────
let settings = loadSettings();
let frozen   = false;
let smoothedCents = 0;
let smoothedFreq  = 0;
let stableNote    = null;
let stableCount   = 0;       // consecutive frames with same note
let inTuneSince   = 0;       // timestamp when we first hit green
let streakCount   = 0;
let lastToastTime = 0;
let ambientTimer  = null;
let isAmbient     = false;
let konamiIndex   = 0;
let lastActivityTime = Date.now();

const SMOOTHING      = 0.3;
const STABILITY_MS   = 200;
const IN_TUNE_CENTS  = 3;
const CELEBRATE_MS   = 2000;
const AMBIENT_MS     = 30000;

// ── Konami code easter egg ───────────────────
const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a'];

// ── Init ─────────────────────────────────────
applySettings();

$startBtn.addEventListener('click', handleStart);
$errorRetry.addEventListener('click', handleStart);
$meterWrap.addEventListener('click', toggleFreeze);
$settingsBtn.addEventListener('click', openSettings);
$settingsClose.addEventListener('click', closeSettings);
$backdrop.addEventListener('click', closeSettings);
$a4Select.addEventListener('change', onA4Change);
$a4Custom.addEventListener('input', onA4CustomInput);
$themeSelect.addEventListener('change', onThemeChange);
$soundToggle.addEventListener('change', onSoundToggle);

document.addEventListener('keydown', onKeyDown);

// ── Start ────────────────────────────────────
async function handleStart() {
  try {
    $start.classList.add('hidden');
    $error.classList.remove('active');
    $tuner.classList.add('active');
    $status.textContent = 'Listening...';
    $noteName.innerHTML = '&mdash;';
    $noteFreq.textContent = '';
    $cents.textContent = '';
    await startAudio(onPitch);
    $status.textContent = 'Play a note';
  } catch (err) {
    showError(err);
  }
}

function showError(err) {
  $tuner.classList.remove('active');
  $start.classList.add('hidden');
  $error.classList.add('active');

  if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
    $errorTitle.textContent = 'Microphone blocked';
    $errorMsg.textContent = 'This tuner needs microphone access to hear your instrument. Please allow microphone access in your browser settings and try again.';
  } else if (err.name === 'NotFoundError') {
    $errorTitle.textContent = 'No microphone found';
    $errorMsg.textContent = 'We couldn\'t find a microphone on this device. Please connect one and try again.';
  } else if (err.name === 'NotReadableError') {
    $errorTitle.textContent = 'Microphone in use';
    $errorMsg.textContent = 'Your microphone seems to be used by another app. Please close other apps and try again.';
  } else {
    $errorTitle.textContent = 'Something went wrong';
    $errorMsg.textContent = err.message || 'An unexpected error occurred. Please try again.';
  }
}

// ── Pitch callback (runs every frame) ────────
function onPitch(result) {
  wakeFromAmbient();

  if (frozen) return;

  if (!result || result.confidence < 0.5) {
    // No clear pitch detected
    fadeToIdle();
    return;
  }

  const { frequency, confidence } = result;
  const info = frequencyToNoteInfo(frequency, settings.a4);

  // Exponential smoothing
  if (smoothedFreq === 0) {
    smoothedFreq  = frequency;
    smoothedCents = info.cents;
  } else {
    smoothedFreq  = smoothedFreq  + SMOOTHING * (frequency - smoothedFreq);
    smoothedCents = smoothedCents + SMOOTHING * (info.cents - smoothedCents);
  }

  // Re-derive note info from smoothed frequency
  const smoothed = frequencyToNoteInfo(smoothedFreq, settings.a4);

  // Stability check – same note for enough frames?
  if (smoothed.note === stableNote) {
    stableCount++;
  } else {
    stableNote  = smoothed.note;
    stableCount = 1;
    inTuneSince = 0;
  }

  // Only update display if stable
  const stabilityFrames = Math.ceil((STABILITY_MS / 1000) * 60); // ~12 frames
  if (stableCount < stabilityFrames && stableNote !== null) {
    // still settling
    return;
  }

  // ── Update UI ────────────────────────────
  const color = centsSmoothColor(smoothed.cents);

  // Note name
  $noteName.innerHTML = `${smoothed.note}<span class="note-octave">${smoothed.octave}</span>`;
  $noteName.style.color = color;

  // Frequency
  $noteFreq.textContent = `${smoothedFreq.toFixed(1)} Hz`;

  // Cents
  const c = smoothed.cents;
  const sign = c >= 0 ? '+' : '';
  $cents.textContent = `${sign}${c.toFixed(1)} \u00A2`;
  $cents.style.color = color;

  // Meter position (cents clamped to ±50)
  const clamped  = Math.max(-50, Math.min(50, smoothed.cents));
  const pct      = 50 + clamped;              // 0–100
  $indicator.style.left = `${pct}%`;
  $indicator.style.boxShadow = `0 2px 12px rgba(0,0,0,.35), 0 0 0 3px ${color}40`;

  // Status
  $status.textContent = Math.abs(smoothed.cents) < IN_TUNE_CENTS ? 'In tune' :
    (smoothed.cents < 0 ? 'Tune up' : 'Tune down');
  $status.style.color = color;

  // ── In-tune celebration logic ────────────
  if (Math.abs(smoothed.cents) < IN_TUNE_CENTS) {
    if (!inTuneSince) inTuneSince = Date.now();
    const dt = Date.now() - inTuneSince;

    $indicator.classList.toggle('glow', dt > 600);

    if (dt > CELEBRATE_MS && Date.now() - lastToastTime > 5000) {
      celebrate(smoothed);
    }
  } else {
    inTuneSince = 0;
    $indicator.classList.remove('glow');
  }

  // A440 easter egg
  if (smoothed.note === 'A' && smoothed.octave === 4 &&
      Math.abs(smoothedFreq - 440) < 0.5 && settings.a4 === 440 &&
      Date.now() - lastToastTime > 10000) {
    showToast('The Universal Standard');
  }
}

function fadeToIdle() {
  // Gradually reset
  smoothedFreq = 0;
  stableNote   = null;
  stableCount  = 0;
  inTuneSince  = 0;
  $indicator.classList.remove('glow');
  scheduleAmbient();
}

// ── Celebrate ────────────────────────────────
function celebrate(noteInfo) {
  streakCount++;
  lastToastTime = Date.now();
  showToast(randomCheekyMessage());
  spawnParticles(12);
  haptic('success');

  if (streakCount > 1) {
    $streak.textContent = `${streakCount} strings tuned`;
    $streak.classList.remove('hidden');
  }

  // Reset so we don't re-fire immediately
  inTuneSince = 0;
}

function showToast(text) {
  $toast.textContent = text;
  $toast.classList.add('visible');
  setTimeout(() => $toast.classList.remove('visible'), 2400);
}

function spawnParticles(n) {
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const angle = (Math.PI * 2 * i) / n + (Math.random() - 0.5) * 0.5;
    const dist  = 60 + Math.random() * 80;
    p.style.setProperty('--dx', `${Math.cos(angle) * dist}px`);
    p.style.setProperty('--dy', `${Math.sin(angle) * dist}px`);
    p.style.left = '50%';
    p.style.top  = '50%';
    p.style.animationDelay = `${Math.random() * 0.15}s`;
    $particles.appendChild(p);
    setTimeout(() => p.remove(), 1400);
  }
}

function haptic(type) {
  if (!navigator.vibrate) return;
  if (type === 'success') navigator.vibrate([15, 30, 15]);
  else navigator.vibrate(10);
}

// ── Freeze ───────────────────────────────────
function toggleFreeze() {
  frozen = !frozen;
  $meterWrap.classList.toggle('frozen', frozen);
  if (frozen) haptic('tap');
}

// ── Ambient mode ─────────────────────────────
function scheduleAmbient() {
  clearTimeout(ambientTimer);
  ambientTimer = setTimeout(() => {
    isAmbient = true;
    $app.classList.add('ambient');
  }, AMBIENT_MS);
}

function wakeFromAmbient() {
  lastActivityTime = Date.now();
  if (isAmbient) {
    isAmbient = false;
    $app.classList.remove('ambient');
  }
  clearTimeout(ambientTimer);
  scheduleAmbient();
}

// ── Settings ─────────────────────────────────
function openSettings()  {
  $panel.classList.add('open');
  $backdrop.classList.add('open');
}
function closeSettings() {
  $panel.classList.remove('open');
  $backdrop.classList.remove('open');
}

function onA4Change() {
  if ($a4Select.value === 'custom') {
    $a4Custom.style.display = 'block';
    $a4Custom.focus();
  } else {
    $a4Custom.style.display = 'none';
    settings.a4 = parseInt($a4Select.value);
    saveSettings();
  }
}
function onA4CustomInput() {
  const v = parseInt($a4Custom.value);
  if (v >= 400 && v <= 480) {
    settings.a4 = v;
    saveSettings();
  }
}

function onThemeChange() {
  settings.theme = $themeSelect.value;
  saveSettings();
  applyTheme();
}

function onSoundToggle() {
  settings.sound = $soundToggle.checked;
  saveSettings();
}

function applyTheme() {
  if (settings.theme === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
  } else {
    document.documentElement.setAttribute('data-theme', settings.theme);
  }
}

function applySettings() {
  $a4Select.value = [432,440,442,444].includes(settings.a4)
    ? settings.a4.toString()
    : 'custom';
  if ($a4Select.value === 'custom') {
    $a4Custom.style.display = 'block';
    $a4Custom.value = settings.a4;
  }
  $themeSelect.value    = settings.theme;
  $soundToggle.checked  = settings.sound;
  applyTheme();
}

function loadSettings() {
  try {
    const raw = localStorage.getItem('tuner_settings');
    if (raw) return { a4: 440, theme: 'auto', sound: false, ...JSON.parse(raw) };
  } catch {}
  return { a4: 440, theme: 'auto', sound: false };
}
function saveSettings() {
  localStorage.setItem('tuner_settings', JSON.stringify(settings));
}

// ── Keyboard ─────────────────────────────────
function onKeyDown(e) {
  // Konami code detector
  if (e.key === KONAMI[konamiIndex]) {
    konamiIndex++;
    if (konamiIndex === KONAMI.length) {
      konamiIndex = 0;
      activateRetro();
    }
  } else {
    konamiIndex = e.key === KONAMI[0] ? 1 : 0;
  }

  // Keyboard shortcuts
  if (e.key === 'Escape') closeSettings();
  if (e.key === ' ' && $tuner.classList.contains('active')) {
    e.preventDefault();
    toggleFreeze();
  }
}

function activateRetro() {
  document.documentElement.setAttribute('data-theme', 'retro');
  showToast('RETRO MODE ACTIVATED');
  haptic('success');
  // Auto-revert after 30s
  setTimeout(() => {
    applyTheme();
    showToast('Back to normal');
  }, 30000);
}

// Listen for system theme changes
window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  if (settings.theme === 'auto') applyTheme();
});

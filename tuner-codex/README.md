# Tuner Codex

A fast, static, browser-based chromatic tuner built as a single `index.html` file. It uses the Web Audio API and an autocorrelation pitch detector to show:

- detected note + octave
- frequency in Hz
- cents deviation
- flat/perfect/sharp horizontal meter

It includes intelligent smoothing, note stability lock, freeze-on-meter tap, mobile-friendly layout, settings (A4/theme/sound/show-frequency), and localStorage preferences.

## Prompt

Build a tuner app in the `tuner-codex` directory, based on this spec [tuner-spec.md](tuner-codex/tuner-spec.md)

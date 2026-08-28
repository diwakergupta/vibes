# Tetris

A classic Tetris clone built as a single self-contained HTML file with vanilla JavaScript and canvas rendering.

## Features

- Standard 10x20 board with all 7 tetrominoes (I, O, T, S, Z, J, L)
- 7-bag randomizer for fair piece distribution
- Ghost piece (drop shadow) showing where the piece will land
- Next piece preview
- Hold piece with swap lockout
- Scoring with line clears (100/300/500/800 points) and level ups
- Speed increases with level
- High score persisted to `localStorage`
- Pause (P), hard drop (Space), soft drop (Down), rotate (Up/X), hold (C/Shift)
- Keyboard controls with DAS (auto-repeat) for smooth left/right movement

## Controls

| Key | Action |
|-----|--------|
| Arrow Left / Right | Move (hold to repeat) |
| Arrow Down | Soft drop |
| Arrow Up / X / Z | Rotate |
| Space | Hard drop |
| C / Shift | Hold piece |
| P | Pause |

## Prompt

> Build a Tetris clone: single page, static HTML + CSS + JS. Delete the existing tetris folder and start fresh.

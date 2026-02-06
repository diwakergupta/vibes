# Web-Based Instrument Tuner - Product Specification

## Executive Summary
A fast, simple, delightful web-based chromatic tuner for stringed instruments (guitar, ukulele, bass, etc.). Built entirely client-side with no backend, no dependencies on external services, and instant visual feedback. Designed to be so intuitive that a child could use it.

---

## Research Insights

### What's Out There
The market is saturated with web tuners that share common problems:
- **Over-engineered UIs**: Too many buttons, dropdowns, and options visible at once
- **Performance issues**: Laggy response, jittery indicators, slow startup
- **Intrusive monetization**: Ads interrupting tuning, paywalls for basic features
- **Cognitive overload**: Instrument selectors, tuning mode dropdowns, advanced settings cluttering the main screen
- **Poor visual hierarchy**: Users can't quickly tell if they're in tune or not

### What Works Well
Successful tuners share these traits:
- **Immediate feedback**: Visual response within 50-100ms of playing a note
- **Clear color coding**: Green = good, universally understood
- **Minimal interface**: One primary visual element for feedback
- **Auto-detection**: No need to tell it which string you're playing
- **Clean aesthetics**: Professional but not sterile

### What Users Complain About
Common pain points from reviews and forums:
- "Needle jumps all over the place" → needs smoothing
- "Too many ads interrupt tuning" → no ads, period
- "Can't see it from a distance" → needs large, high-contrast visuals
- "Takes too long to start" → instant on, no loading
- "Too sensitive / not sensitive enough" → needs intelligent smoothing

---

## Core Requirements

### Technical Stack
- **Pure client-side**: HTML, CSS, vanilla JavaScript (or minimal framework)
- **Web Audio API**: For microphone access and audio analysis
- **Pitch detection**: Autocorrelation algorithm (proven superior to FFT for guitars)
- **No build step required**: Can be deployed as static files
- **Browser support**: Modern Chrome, Firefox, Safari, Edge

### Performance Targets
- **First paint**: <500ms
- **Mic permission → live feedback**: <1 second
- **Pitch detection latency**: <100ms
- **Frame rate**: Smooth 60fps animations
- **Bundle size**: <100KB total (HTML + CSS + JS)

---

## User Experience Design

### The Core Flow
```
1. Land on page
   ↓
2. One large "Start" button (or auto-start on first visit)
   ↓
3. Grant microphone permission (browser prompt)
   ↓
4. Play instrument
   ↓
5. See immediate visual feedback
   ↓
6. Tune until green/centered
```

### Primary Screen Layout

**Layout Philosophy**: Maximum signal, minimum noise.

```
┌─────────────────────────────────────┐
│                                     │
│                                     │
│         [LARGE VISUAL METER]        │
│                                     │
│         Current Note: A             │
│         Current Freq: 440 Hz        │
│                                     │
│    ◀─────────●─────────▶           │
│    flat    perfect    sharp         │
│                                     │
│                                     │
│    [•••] (subtle settings icon)     │
└─────────────────────────────────────┘
```

### Visual Feedback System

**Primary Meter Options** (choose one for implementation):

**Option A: Radial Dial** (like analog tuner pedals)
- Circular gauge with a needle/indicator
- Centered = perfect pitch
- Sweeps left (flat) or right (sharp)
- Large, visible from across the room
- Color zones: red (very off) → yellow (close) → green (perfect)

**Option B: Horizontal Bar**
- Clean horizontal meter
- Dot/indicator slides along the bar
- Left = flat, center = perfect, right = sharp
- Color gradient matching above
- Minimalist, modern aesthetic

**Option C: Morphing Shape** (delightful option)
- Central shape that morphs based on pitch accuracy
- Off-pitch: angular, agitated shape in red/orange
- Getting closer: shape smooths out, yellow
- Perfect: smooth circle/sphere, vibrant green, subtle glow
- Most unique, most delightful

**Recommendation**: Start with Option B for simplicity, Option C as a "delight" feature.

### Color System
- **Very flat/sharp (>30 cents)**: `#FF4444` (red)
- **Getting close (10-30 cents)**: `#FFB84D` (amber)
- **Almost there (3-10 cents)**: `#FFE44D` (yellow)
- **Perfect (<3 cents)**: `#44FF88` (green)
- **Background**: `#1a1a1a` (dark) or `#f5f5f5` (light mode)
- **Text**: High contrast with background

### Typography
- **Note name**: 72px+, bold, sans-serif
- **Frequency**: 24px, regular weight
- **Instructions**: 16px, subtle color

---

## Feature Specifications

### Essential Features (MVP)

#### 1. Chromatic Tuning
- Detects all 12 notes across audible range (roughly 80Hz - 1200Hz)
- No need to select instrument or string
- Auto-identifies the closest note being played

#### 2. Real-time Visual Feedback
- Updates 60fps or as fast as pitch detection allows
- Shows current note name (C, C#, D, etc.)
- Shows frequency in Hz
- Shows cents deviation from perfect pitch
- Visual meter indicates flat/sharp

#### 3. Intelligent Smoothing
- Prevents jittery readings from harmonics or noise
- Requires note stability (hold for ~200ms before locking)
- Smooths pitch readings without introducing lag
- Ignores brief audio interruptions

#### 4. Responsive Design
- Works on mobile, tablet, desktop
- Touch-friendly for mobile (large tap targets)
- Adapts layout for portrait/landscape
- Readable from 3+ feet away

### Nice-to-Have Features (Phase 2)

#### 1. A4 Reference Adjustment
- Hidden in settings
- Allow tuning to A=432Hz or other standards
- Default: A=440Hz

#### 2. Dark/Light Mode Toggle
- Follows system preference by default
- Manual toggle available
- Smooth transition animation

#### 3. Freeze Mode
- Tap to freeze the current reading
- Useful for checking specific tuning
- Tap again to resume

#### 4. Sound Feedback
- Optional audio "ding" when perfectly in tune
- Brief, pleasant sound
- Can be disabled

### Delightful Details (The "Quirks")

#### 1. Perfect Pitch Celebration
- When in tune for 2+ seconds
- Subtle particle effect or glow pulse
- Makes tuning feel rewarding
- Not annoying or over-the-top

#### 2. Haptic Feedback (mobile)
- Gentle vibration when locking onto a note
- Different pattern when reaching perfect pitch
- Only on mobile devices that support it

#### 3. Tuning Streak Counter
- "You've tuned 3 strings perfectly!"
- Appears subtly, doesn't block UI
- Resets when you leave the page
- Gamifies the tuning process slightly

#### 4. Cheeky Messages
- When detecting very low frequencies: "That's more like a rumble than a note!"
- When detecting very high frequencies: "Only dogs can hear that high!"
- When perfectly in tune: Random encouraging messages
  - "Nailed it!"
  - "Chef's kiss 👌"
  - "Pitch perfect!"
  - "That's the sweet spot!"
- Rotate messages, don't repeat too often

#### 5. Ambient Mode
- After 30 seconds of no input
- UI dims slightly
- Meter visualization becomes more abstract/artistic
- Subtle animations, almost screensaver-like
- Returns to full brightness on any input

#### 6. Easter Eggs
- Tuning to perfect A440 triggers a brief "Universal Standard" message
- Detecting the brown note frequency (around 5-9Hz, if even possible) shows a silly message
- Konami code or similar activates a retro/8-bit visual theme

---

## Technical Implementation Details

### Pitch Detection Algorithm

**Autocorrelation Approach** (recommended):
```
1. Capture audio via getUserMedia()
2. Get time-domain data from AnalyserNode (getFloatTimeDomainData)
3. Apply autocorrelation to find fundamental frequency
4. Filter out noise and harmonics
5. Map frequency to nearest note
6. Calculate cents deviation
7. Apply smoothing to prevent jitter
```

**Key Parameters**:
- **FFT size**: 4096 (good balance of accuracy and performance)
- **Sample rate**: Use device default (typically 44.1kHz or 48kHz)
- **Buffer size**: ~85ms of audio data
- **Smoothing**: Exponential moving average with α ≈ 0.3

**Libraries** (avoid heavy dependencies):
- Consider using a lightweight pitch detection library (e.g., `pitchfinder`)
- Or implement autocorrelation from scratch (preferred for no dependencies)

### Audio Processing Pipeline
```
MediaStream → AudioContext → MediaStreamSource
                                ↓
                            AnalyserNode
                                ↓
                        Time Domain Data
                                ↓
                        Pitch Detection
                                ↓
                        Note Identification
                                ↓
                        Visual Update (60fps)
```

### Frequency to Note Mapping
```javascript
// Standard formula
noteNumber = 12 * log2(frequency / A4_frequency)
noteName = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'][noteNumber % 12]
octave = Math.floor(noteNumber / 12) + 4

// Cents calculation
expectedFrequency = A4 * 2^((noteNumber - 69) / 12)
cents = 1200 * log2(actualFrequency / expectedFrequency)
```

### Noise Handling
- **Noise gate**: Ignore input below certain amplitude threshold
- **Confidence threshold**: Only display pitch if autocorrelation confidence > 95%
- **Stability requirement**: Note must be detected consistently for 150-200ms before displaying

### State Management
Keep it simple:
```javascript
{
  isListening: boolean,
  currentNote: string | null,
  currentFrequency: number | null,
  centDeviation: number | null,
  confidenceLevel: number,
  inTuneStreak: number,
  settings: {
    a4Frequency: 440,
    darkMode: boolean,
    soundEnabled: boolean,
  }
}
```

### Local Storage
- Save user preferences (dark mode, A4 reference)
- Don't save streak or session data
- Minimal storage footprint

---

## UI/UX Guidelines

### What NOT to Do
Based on research of existing tuners:

❌ **Don't**: Show instrument selection dropdown on main screen
✅ **Do**: Chromatic mode works for all instruments

❌ **Don't**: Show tuning mode selector (standard, drop D, etc.)
✅ **Do**: Just detect the note being played

❌ **Don't**: Display advanced settings (noise gate, smoothing factor)
✅ **Do**: Choose good defaults, hide advanced settings

❌ **Don't**: Show frequency spectrum visualizer by default
✅ **Do**: Optional, hidden in settings for audio nerds

❌ **Don't**: Use small, hard-to-read fonts
✅ **Do**: Large, high-contrast typography

❌ **Don't**: Animate excessively (spinning wheels, bouncing elements)
✅ **Do**: Smooth, purposeful animations only

### Interaction Patterns
- **Microphone permission**: Browser handles the prompt, we just show clear instructions
- **Settings access**: Small gear icon in corner, reveals minimal overlay
- **Mode switches**: Tap background to toggle dark/light? Subtle, non-obtrusive
- **Freezing a reading**: Tap the meter itself

### Loading States
- **Initial load**: Show app immediately, no splash screen
- **Microphone initializing**: "Initializing microphone..." text, subtle spinner
- **Waiting for sound**: "Play a note..." prompt
- **Processing**: Meter shows but dims slightly until first note detected

### Error States
- **No microphone access**: "Microphone access required. Please check browser permissions."
- **Microphone in use**: "Microphone is being used by another app. Please close other apps and try again."
- **Browser not supported**: "This browser doesn't support the Web Audio API. Please use Chrome, Firefox, Safari, or Edge."
- All errors with simple, actionable instructions

---

## Visual Design System

### Component Specifications

#### Main Meter (Horizontal Bar Version)
```
Width: 80% of viewport width (max 600px)
Height: 60px
Border radius: 30px
Background: gradient from red → yellow → green
Indicator: 40px circle, white with shadow
Position: slides smoothly along bar
Animation: spring physics (slight overshoot)
```

#### Note Display
```
Font: System sans-serif, bold
Size: 72px on desktop, 56px on mobile
Color: White (dark mode) or dark gray (light mode)
Position: Above meter, centered
```

#### Frequency Display
```
Font: System monospace
Size: 24px
Color: 60% opacity of text color
Position: Below note name
Format: "440.0 Hz"
```

#### Cents Indicator
```
Font: System sans-serif, medium
Size: 18px
Color: Same as current accuracy color
Position: To the right of meter
Format: "+12¢" or "-5¢"
Only show when within ±50 cents
```

### Animation Principles
- **Duration**: 150-300ms for most transitions
- **Easing**: ease-out for snappy feel
- **Avoid**: Bouncing, wobbling (makes it hard to read)
- **Meter movement**: Smooth interpolation, not instant jumps
- **Color transitions**: Gradual blend, not harsh switches

### Accessibility
- **High contrast mode**: Support prefers-contrast media query
- **Reduced motion**: Respect prefers-reduced-motion
- **Keyboard navigation**: Tab to settings, Enter to freeze/unfreeze
- **Screen readers**: ARIA labels for all interactive elements
- **Focus indicators**: Clear, visible focus states

---

## Settings Panel

Keep settings to absolute minimum:

### Settings Options
1. **A4 Reference** (dropdown or input)
   - 432 Hz
   - 440 Hz (default)
   - 442 Hz
   - 444 Hz
   - Custom input

2. **Dark Mode** (toggle)
   - Auto (follow system)
   - Light
   - Dark

3. **Sound Feedback** (toggle)
   - On / Off

4. **Transposition** (advanced, initially hidden)
   - None (default)
   - -1 semitone to +1 semitone

5. **Show Frequency** (toggle)
   - Yes (default) / No

### Settings UI
- Overlay that slides in from right/bottom
- Semi-transparent backdrop
- Close by tapping outside or X button
- Settings save automatically to localStorage

---

## Mobile Considerations

### Touch Targets
- Minimum 44x44px for any interactive element
- Settings icon: 56x56px on mobile
- Meter should be tappable (freeze function)

### Orientation
- Portrait: Vertical layout, meter at top
- Landscape: Horizontal layout, meter centered
- Smooth transition when rotating

### Performance
- Avoid heavy processing on older devices
- Test on mid-range Android devices
- Reduce FFT size if frame rate drops below 30fps
- Show warning if device struggles

### PWA Features (Optional)
- Manifest file for "Add to Home Screen"
- Service worker for offline support (HTML/CSS/JS only, no API calls needed)
- Standalone mode: feels like native app
- Custom splash screen

---

## Development Phases

### Phase 1: MVP (Week 1-2)
- Basic pitch detection with autocorrelation
- Horizontal bar meter with color feedback
- Note name and frequency display
- Dark mode only
- Desktop-first, but responsive

### Phase 2: Polish (Week 3)
- Mobile optimization
- Light mode
- Settings panel with A4 adjustment
- Intelligent smoothing refinement
- Performance optimization

### Phase 3: Delight (Week 4)
- Perfect pitch celebration animation
- Haptic feedback on mobile
- Tuning streak counter
- Cheeky messages
- Easter eggs
- Ambient mode

### Phase 4: Testing & Launch
- Cross-browser testing
- Mobile device testing (iOS Safari, Chrome Android)
- Performance profiling
- Accessibility audit
- User testing with musicians of various skill levels

---

## Success Metrics

### Performance Metrics
- **Load time**: <1 second on 4G connection
- **Time to interactive**: <2 seconds
- **Accuracy**: Within ±1 cent for stable tones
- **Latency**: <100ms from sound to visual update
- **Frame rate**: Maintain 60fps on target devices

### User Experience Metrics
- **Time to first tuning**: <30 seconds for new users
- **Error rate**: <5% of tuning attempts fail
- **Task completion**: >90% of users can tune a string successfully
- **Return rate**: Users bookmark/return to use again

---

## Competitive Differentiation

### Why This Tuner?
- **Fastest to use**: No account, no downloads, no BS
- **Genuinely delightful**: Personality without being annoying
- **Actually simple**: Not "simple mode" hidden in settings
- **Respect for users**: No ads, no tracking, no upsells
- **Just works**: Reliable, fast, accurate

### Positioning
"The tuner you'll actually want to use. Fast, simple, delightful."

---

## Future Enhancements (Post-MVP)

### Possible Additions
- **Strobe tuner mode**: Ultra-precise visualization for advanced users
- **Chord detection**: "You're playing an A minor!"
- **Tuning history**: Track how often strings go out of tune
- **Multiple tuning systems**: Equal temperament, just intonation, etc.
- **Reference tone generator**: Play the note you want to tune to
- **Calibration assistant**: Help set intonation on guitars

### Won't Do
- **Instrument selection**: Not needed for chromatic tuner
- **Lesson content**: Focus on tuning, not teaching
- **Social features**: No sharing, no accounts, no community
- **Premium version**: Free forever, no tiers

---

## Technical Constraints & Considerations

### Browser Compatibility
- **Chrome/Edge**: Full support (Blink engine)
- **Firefox**: Full support
- **Safari**: Full support (iOS 12+, macOS 10.14+)
- **Mobile browsers**: getUserMedia() requires HTTPS or localhost
- **IE11**: Not supported (no Web Audio API)

### Privacy
- **No analytics**: No tracking scripts whatsoever
- **No servers**: All processing happens client-side
- **No data collection**: We never hear or store audio
- **Microphone access**: Clearly explained, only when needed

### Security
- **HTTPS required**: For microphone access (except localhost)
- **No XSS vulnerabilities**: Minimal dynamic content
- **No dependencies**: Fewer supply chain risks
- **CSP headers**: If deployed on a server

### Deployment
- **Static hosting**: GitHub Pages, Netlify, Vercel, any CDN
- **No backend needed**: Pure static files
- **Custom domain**: Easy to set up
- **Fast CDN**: Edge caching for global performance

---

## Code Structure (Recommended)

```
tuner/
├── index.html          (structure, minimal)
├── styles.css          (all styles, well-organized)
├── app.js              (main app logic)
├── audio.js            (Web Audio API handling)
├── pitch.js            (pitch detection algorithm)
├── utils.js            (note/frequency calculations)
└── README.md           (documentation)

Optional:
├── manifest.json       (for PWA)
├── sw.js               (service worker)
└── assets/
    ├── icon.png
    └── sounds/
        └── ding.mp3    (optional in-tune sound)
```

### Code Style
- **Vanilla JS or lightweight library**: Avoid React/Vue for simplicity
- **Modern JS**: ES6+, but transpile for older browsers if needed
- **Comments**: Explain the "why", not the "what"
- **Performance**: Avoid premature optimization, but profile hot paths
- **Readability**: Clear function names, logical structure

---

## Final Notes

### Design Philosophy
"Make it impossible to be confused."

Every design decision should pass the test:
- Can a 10-year-old figure this out in 10 seconds?
- Is there only one obvious thing to do next?
- Does it spark joy when it works?

### The Tuner Personality
- **Helpful, not bossy**: "Tune up a bit" not "INCORRECT PITCH"
- **Encouraging**: Celebrate small wins (perfect tuning)
- **Quiet confidence**: Works flawlessly, doesn't brag
- **Slightly playful**: Cheeky messages, but never annoying

### Quality Bar
- Better to ship a simple, excellent tuner than a complex, buggy one
- Every feature must earn its place
- If in doubt, leave it out (can always add later)
- "This is the best tuner I've ever used" should be achievable

---

## Appendix: Research Links

### Good Examples to Study
- https://qiuxiang.github.io/tuner/app (excellent simplicity)
- https://cwilso.github.io/PitchDetect/ (good technical foundation)
- https://www.musicca.com/tuner (clean UI but could be simpler)

### Technical Resources
- [Autocorrelation pitch detection](https://alexanderell.is/posts/tuner/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Chris Wilson's pitch detection](https://github.com/cwilso/PitchDetect)

### User Complaints to Learn From
- Pro Guitar Tuner app: Too many ads (we have zero)
- GuitarTuna: "Eager to say you're in tune" (we're strict)
- gStrings: "Needle all over the place" (we smooth it)

---

## Handoff Checklist

For the development agent (Claude Code):

- [ ] Implement Web Audio API microphone access
- [ ] Implement autocorrelation pitch detection algorithm
- [ ] Create responsive UI with horizontal bar meter
- [ ] Add color-coded feedback (red/yellow/green)
- [ ] Display note name, frequency, cents deviation
- [ ] Implement intelligent smoothing
- [ ] Add dark mode support
- [ ] Create settings panel (minimal)
- [ ] Add perfect pitch celebration animation
- [ ] Test on multiple browsers
- [ ] Test on mobile devices
- [ ] Optimize performance (60fps, <100ms latency)
- [ ] Add keyboard navigation
- [ ] Implement accessibility features
- [ ] Write clear README with usage instructions

---

**End of Specification**

This spec balances ambition with pragmatism. Start with the MVP, ship it, then iterate based on real user feedback. The goal is to create something people genuinely love using, not just another tuner that works.

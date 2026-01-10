# Lap Steel Dyads

A web-based tool for discovering and visualizing dyad fingerings on lap steel guitar. Find two-note chord voicings that work with straight bar and slanted bar techniques across different tunings.

**Live demo**: [lthiberiol.github.io/lap-steel-dyads](https://lthiberiol.github.io/lap-steel-dyads/)

## Features

- **Custom Tunings**: Choose from preset tunings (Gmaj9, C6/Am7, E9, Open G/D/E/A) or enter your own
- **Interactive Fretboard**: SVG visualization with notes positioned on fret lines (lap steel style)
- **Dyad Types**: Straight bar (same fret) and slant bar (adjacent frets) fingerings
- **Chord Substitutions**: Diatonic function and tritone substitutions based on chord degree
- **Guide Tones Filter**: Show only 3rds and 7ths for essential voice leading
- **Audio Playback**: Click any dyad to hear it

## Usage

1. **Select a tuning** from the dropdown or enter a custom tuning (space/comma separated notes)
2. **Enter a chord** (e.g., `C`, `Am7`, `F#dim`, `Gmaj9`)
3. **Set the degree** (I, ii, iii, IV, V, vi, vii°) to enable substitution suggestions
4. **Explore dyads** on the fretboard - hover for details, click to play

### Display Options

- **All dyads / Guide tones**: Toggle between showing all intervals or just 3rds and 7ths
- **Straight / Slant**: Filter by bar technique
- **Substitutions**: Show/hide diatonic and tritone substitution dyads

### Color Coding

| Color | Meaning |
|-------|---------|
| Amber | Direct chord tones (straight bar) |
| Teal | Direct chord tones (slant bar) |
| Green (dashed) | Diatonic substitution |
| Magenta (dashed) | Tritone substitution |

## Preset Tunings

| Name | Notes | Strings |
|------|-------|---------|
| Gmaj9 | G B D F# A D | 6 |
| C6/Am7 | C E G A C E | 6 |
| E9 | B D# E F# G# B E | 7 |
| Open G | D G D G B D | 6 |
| Open D | D A D F# A D | 6 |
| Open E | E B E G# B E | 6 |
| Open A | E A E A C# E | 6 |

## Installation

### Prerequisites

- [Pixi](https://pixi.sh) for environment management, or Node.js 20+

### Development

```bash
# Clone the repository
git clone https://github.com/lthiberiol/lap-steel-dyads.git
cd lap-steel-dyads

# With Pixi
pixi run dev

# Or with npm directly
npm install
npm run dev
```

The app will be available at `http://localhost:5173`

### Production Build

```bash
pixi run build   # or: npm run build
pixi run preview # or: npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── ChordInput.tsx      # Chord and degree input
│   ├── TuningInput.tsx     # Tuning selector
│   └── Fretboard.tsx       # SVG fretboard visualization
├── lib/
│   ├── audio.ts            # Web Audio API playback
│   ├── dyads.ts            # Dyad finding algorithms
│   ├── fretboard.ts        # Position calculations
│   ├── music.ts            # Music theory (intervals, chords)
│   └── substitutions.ts    # Chord substitution logic
└── App.tsx                 # Main application
```

## Music Theory

### Dyads

Two-note voicings extracted from chords. On lap steel, dyads are played with either:
- **Straight bar**: Both notes on the same fret
- **Slant bar**: Notes on adjacent frets (1 fret difference)

### Guide Tones

The 3rd and 7th define chord quality and are essential for voice leading. The guide tones filter shows only these intervals.

### Substitutions

Based on the chord's degree in the key:

| Degree | Function | Substitutes |
|--------|----------|-------------|
| I | Tonic | iii, vi |
| ii | Subdominant | IV |
| iii | Tonic | I, vi |
| IV | Subdominant | ii, vi |
| V | Dominant | vii°, bII7 (tritone) |
| vi | Tonic | I, iii |
| vii° | Dominant | V |

## Tech Stack

- React 18 + TypeScript
- Vite
- CSS Modules
- Web Audio API

## License

MIT

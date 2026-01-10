# Lap Steel Dyads

A web-based tool for discovering and visualizing dyad fingerings on lap steel guitar. Find two-note chord voicings that work with straight bar and slanted bar techniques across different tunings.

**Live demo**: [lthiberiol.github.io/lap-steel-dyads](https://lthiberiol.github.io/lap-steel-dyads/)

## Features

- **Custom Tunings**: Choose from preset tunings (Gmaj9, C6/Am7, E9, Open G/D/E/A) or enter your own
- **Interactive Fretboard**: SVG visualization with notes positioned on fret lines (lap steel style)
- **Dyad Types**: Straight bar (same fret) and slant bar (adjacent frets) fingerings
- **Guide Tones Filter**: Show only the most important dyads (prioritizes 3rd+7th, 3rd+root combinations)
- **Audio Playback**: Click any dyad to hear it

## Usage

1. **Select a tuning** from the dropdown or enter a custom tuning (space/comma separated notes)
2. **Enter a chord** (e.g., `C`, `Am7`, `F#dim`, `Gmaj9`)
3. **Explore dyads** on the fretboard - hover for details, click to play

### Display Options

- **All dyads / Guide tones**: Toggle between showing all intervals or just the most harmonically important
- **Straight / Slant**: Filter by bar technique

### Color Coding

| Color | Meaning |
|-------|---------|
| Amber | Straight bar dyads |
| Teal | Slant bar dyads |

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
│   ├── ChordInput.tsx      # Chord input
│   ├── TuningInput.tsx     # Tuning selector
│   └── Fretboard.tsx       # SVG fretboard visualization
├── lib/
│   ├── audio.ts            # Web Audio API playback
│   ├── dyads.ts            # Dyad finding and filtering
│   ├── fretboard.ts        # Position calculations
│   └── music.ts            # Music theory (intervals, chords)
└── App.tsx                 # Main application
```

## Music Theory

### Dyads

Two-note voicings extracted from chords. On lap steel, dyads are played with either:
- **Straight bar**: Both notes on the same fret
- **Slant bar**: Notes on adjacent frets (1 fret difference)

### Guide Tones

The guide tones filter prioritizes dyads by harmonic importance:
- **3rd + 7th** (score 19): Best for 7th chords - defines quality
- **3rd + root** (score 16): Best for triads
- **3rd + 9th/13th** (score 13-14): Good for extensions

Dyads with duplicate degrees (e.g., two 3rds) are excluded.

## Tech Stack

- React 18 + TypeScript
- Vite
- CSS Modules
- Web Audio API

## License

MIT

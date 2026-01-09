# Lap Steel Dyads

A web-based tool for discovering and visualizing dyad fingerings on lap steel guitar. This application helps musicians find two-note chord voicings that work with lap steel guitar mechanics, including lever positions and substitution chords.

## Features

- **Interactive Chord Selection**: Input chord progressions and see all available dyad fingerings in real-time
- **Fretboard Visualization**: SVG-based interactive fretboard showing exact positions for both straight and slanted bar techniques
- **Lever Support**: Identifies which dyads utilize lap steel guitar levers (10ths, B, and C pedals)
- **Guide Tones**: Filter view to show only the most musically important dyads (3rds and 7ths)
- **Chord Substitutions**: Automatically suggest and display diatonic and tritone substitution dyads
- **Degree-Based Suggestions**: Input roman numeral degrees to get substitutions in context of the key
- **Multiple Voicing Types**: Distinguish between straight bar and slanted bar fingerings
- **Color-Coded Display**: Visual distinction between direct chord tones, lever-based positions, and substitutions

## Installation

### Prerequisites

- **Pixi** (for environment and package management)
  - Install from: https://pixi.sh

### Setup

1. **Navigate to the project directory**:
   ```bash
   cd lap-steel-dyads
   ```

2. **Initialize the Pixi environment**:
   Pixi will automatically set up the environment with Node.js and dependencies on first run.

3. **Start the development server**:
   ```bash
   pixi run dev
   ```
   
   The application will be available at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create an optimized production build:

```bash
pixi run build
```

The compiled files will be in the `dist/` directory. You can preview the build locally with:

```bash
pixi run preview
```

## Usage

### Basic Workflow

1. **Input a Chord**: Use the chord input panel to select a root note and chord type (Major, Minor, Dominant 7, etc.)
2. **View Dyads**: The fretboard automatically displays all available two-note fingerings for that chord
3. **Filter Results**: Toggle between different voicing types:
   - **Straight**: Traditional bar techniques using only fret positions
   - **Slant**: Angled bar techniques for different intervals
   - **Substitutions**: Alternative chord voicings that fit the harmonic context

### Chord Input Panel

- **Root Note**: Select from C, C#/Db, D, D#/Eb, E, F, F#/Gb, G, G#/Ab, A, A#/Bb, B
- **Chord Type**: Choose from various chord qualities (Major, Minor, Dominant, Minor 7, Major 7, etc.)
- **Degree Input** (Optional): Enter a Roman numeral (I, IV, V, etc.) to receive substitution suggestions appropriate to that scale degree

### Fretboard Legend

The fretboard display uses color coding to indicate dyad types:

- **Direct Tones**: Dyads formed directly from chord notes
- **Lever Positions**: Dyads that require using lap steel pedals/levers
- **Diatonic Substitutions**: Alternative chord tones from the same key
- **Tritone Substitutions**: Tritone substitutions (useful for dominant chords)

### Display Modes

- **All Dyads**: Shows every available fingering combination
- **Guide Tones Only**: Filters to show only musically essential intervals (3rds and 7ths), which define chord quality and are most important for harmonic function

## Project Structure

```
lap-steel-dyads/
├── src/
│   ├── components/
│   │   ├── ChordInput.tsx          # Chord selection component
│   │   ├── ChordInput.module.css   # Chord input styling
│   │   ├── Fretboard.tsx           # SVG fretboard visualization
│   │   └── Fretboard.module.css    # Fretboard styling
│   ├── lib/
│   │   ├── dyads.ts                # Core dyad finding and filtering logic
│   │   ├── fretboard.ts            # Lap steel tuning and fret position calculations
│   │   ├── music.ts                # Music theory utilities (intervals, notes)
│   │   └── substitutions.ts        # Chord substitution logic
│   ├── App.tsx                     # Main application component
│   ├── App.module.css              # Application styling
│   ├── main.tsx                    # React entry point
│   └── index.css                   # Global styles
├── package.json                    # Project dependencies
├── vite.config.ts                  # Vite build configuration
├── tsconfig.json                   # TypeScript configuration
└── index.html                      # HTML entry point
```

## Key Technologies

- **React 18**: UI framework for building interactive components
- **TypeScript**: Type-safe JavaScript for better code quality
- **Vite**: Fast build tool and development server
- **CSS Modules**: Scoped styling for components

## Music Theory Overview

### Dyads

A dyad is a two-note chord voicing. This tool finds all possible ways to play dyads on lap steel guitar, considering:
- The tuning of the instrument (D9, D, B, G#, D, B)
- Fret positions within a playable range
- Lever/pedal positions that modify pitches
- Musically meaningful intervals

### Guide Tones

Guide tones are the 3rd and 7th of a chord, which define its harmonic quality. The "Guide Tones" display mode helps you focus on the most essential voicings by filtering out less critical intervals.

### Substitution Chords

The tool suggests two types of substitutions:

1. **Diatonic Substitutions**: Chords using notes from the same key, useful for harmonic reharmonization
2. **Tritone Substitutions**: Chords a tritone away, particularly useful for dominant 7th chords as they share the same tritone interval (the essential feature defining dominant function)

## Development

### Available Scripts

- `npm run dev` - Start development server with hot module reload
- `npm run build` - Compile TypeScript and build for production
- `npm run preview` - Preview production build locally

### Code Organization

- **Components** (`src/components/`): React components for UI elements
- **Libraries** (`src/lib/`): Pure business logic for music theory calculations
- **Styles**: CSS Modules for component-scoped styling

## Browser Support

Works on all modern browsers that support:
- ES2020+ JavaScript features
- CSS Grid and Flexbox
- SVG rendering

## License

This project is part of lap steel guitar educational tools and learning resources.

## Contributing

For bug reports or feature suggestions, please provide:
- Steps to reproduce the issue
- Expected vs. actual behavior
- Browser and OS information

## Troubleshooting

### Application won't start
- Ensure Node.js v18+ is installed: `node --version`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

### Fretboard not displaying correctly
- Clear browser cache (Ctrl+Shift+Delete or Cmd+Shift+Delete)
- Try a different browser to rule out browser-specific issues

### Chords not showing dyads
- Ensure chord tones are properly selected in the input panel
- Try a simple chord (e.g., C Major) to verify functionality

## Support

For questions or support regarding lap steel guitar technique, consult with a lap steel guitar instructor or refer to standard lap steel guitar resources.

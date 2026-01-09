// All notes in chromatic order (using sharps as canonical)
const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'] as const

// Flat to sharp equivalents
const FLAT_TO_SHARP: Record<string, string> = {
  'Db': 'C#', 'Eb': 'D#', 'Fb': 'E', 'Gb': 'F#',
  'Ab': 'G#', 'Bb': 'A#', 'Cb': 'B'
}

// Sharp to flat equivalents (for display)
const SHARP_TO_FLAT: Record<string, string> = {
  'C#': 'Db', 'D#': 'Eb', 'F#': 'Gb', 'G#': 'Ab', 'A#': 'Bb'
}

export type NoteName = typeof NOTES[number]

// Chord quality intervals (semitones from root)
const CHORD_INTERVALS: Record<string, number[]> = {
  '': [0, 4, 7],           // major
  'maj': [0, 4, 7],        // major
  'M': [0, 4, 7],          // major
  'm': [0, 3, 7],          // minor
  'min': [0, 3, 7],        // minor
  '-': [0, 3, 7],          // minor
  'dim': [0, 3, 6],        // diminished
  'o': [0, 3, 6],          // diminished
  'aug': [0, 4, 8],        // augmented
  '+': [0, 4, 8],          // augmented
  '7': [0, 4, 7, 10],      // dominant 7
  'maj7': [0, 4, 7, 11],   // major 7
  'M7': [0, 4, 7, 11],     // major 7
  'm7': [0, 3, 7, 10],     // minor 7
  'min7': [0, 3, 7, 10],   // minor 7
  '-7': [0, 3, 7, 10],     // minor 7
  'dim7': [0, 3, 6, 9],    // diminished 7
  'o7': [0, 3, 6, 9],      // diminished 7
  'm7b5': [0, 3, 6, 10],   // half-diminished
  'ø': [0, 3, 6, 10],      // half-diminished
  'ø7': [0, 3, 6, 10],     // half-diminished
  'aug7': [0, 4, 8, 10],   // augmented 7
  '+7': [0, 4, 8, 10],     // augmented 7
  '6': [0, 4, 7, 9],       // major 6
  'm6': [0, 3, 7, 9],      // minor 6
  'sus2': [0, 2, 7],       // suspended 2
  'sus4': [0, 5, 7],       // suspended 4
  '9': [0, 4, 7, 10, 14],  // dominant 9
  'maj9': [0, 4, 7, 11, 14], // major 9
  'm9': [0, 3, 7, 10, 14], // minor 9
}

// Interval names for dyads
const INTERVAL_NAMES: Record<number, string> = {
  0: 'unison',
  1: 'm2',
  2: 'M2',
  3: 'm3',
  4: 'M3',
  5: 'P4',
  6: 'TT',
  7: 'P5',
  8: 'm6',
  9: 'M6',
  10: 'm7',
  11: 'M7',
}

/**
 * Normalize a note name to use sharps (canonical form)
 */
export function normalizeNote(note: string): NoteName {
  const upper = note.charAt(0).toUpperCase() + note.slice(1)
  if (FLAT_TO_SHARP[upper]) {
    return FLAT_TO_SHARP[upper] as NoteName
  }
  if (NOTES.includes(upper as NoteName)) {
    return upper as NoteName
  }
  throw new Error(`Invalid note: ${note}`)
}

/**
 * Get the semitone index (0-11) for a note
 */
export function noteToSemitone(note: string): number {
  const normalized = normalizeNote(note)
  return NOTES.indexOf(normalized)
}

/**
 * Get the note name for a semitone index (0-11)
 */
export function semitoneToNote(semitone: number): NoteName {
  return NOTES[((semitone % 12) + 12) % 12]
}

/**
 * Transpose a note by a number of semitones
 */
export function transposeNote(note: string, semitones: number): NoteName {
  const index = noteToSemitone(note)
  return semitoneToNote(index + semitones)
}

/**
 * Get the interval in semitones between two notes (0-11)
 */
export function getInterval(note1: string, note2: string): number {
  const s1 = noteToSemitone(note1)
  const s2 = noteToSemitone(note2)
  return ((s2 - s1) % 12 + 12) % 12
}

/**
 * Get a human-readable interval name
 */
export function getIntervalName(semitones: number): string {
  const normalized = ((semitones % 12) + 12) % 12
  return INTERVAL_NAMES[normalized] || `${normalized}st`
}

/**
 * Parse a chord symbol into root and quality
 * Examples: "C" -> {root: "C", quality: ""}, "Am7" -> {root: "A", quality: "m7"}
 */
export function parseChord(chord: string): { root: NoteName; quality: string } {
  const match = chord.match(/^([A-Ga-g][#b]?)(.*)$/)
  if (!match) {
    throw new Error(`Invalid chord: ${chord}`)
  }
  const [, rootStr, quality] = match
  const root = normalizeNote(rootStr)

  // Validate quality
  if (quality && !CHORD_INTERVALS[quality]) {
    throw new Error(`Unknown chord quality: ${quality}`)
  }

  return { root, quality }
}

/**
 * Get the chord tones for a given chord symbol
 */
export function getChordTones(chord: string): NoteName[] {
  const { root, quality } = parseChord(chord)
  const intervals = CHORD_INTERVALS[quality] || CHORD_INTERVALS['']
  const rootSemitone = noteToSemitone(root)

  return intervals.map(interval => semitoneToNote(rootSemitone + interval))
}

/**
 * Check if two notes are enharmonically equivalent
 */
export function areEnharmonic(note1: string, note2: string): boolean {
  return noteToSemitone(note1) === noteToSemitone(note2)
}

/**
 * Get flat spelling for a note if it has one
 */
export function toFlat(note: NoteName): string {
  return SHARP_TO_FLAT[note] || note
}

export { NOTES, INTERVAL_NAMES }

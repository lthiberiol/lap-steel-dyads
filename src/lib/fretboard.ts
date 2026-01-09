import { NoteName, transposeNote, noteToSemitone } from './music'

// Lap steel tuning: G B D F# A D (low to high, strings 0-5)
export const LAP_STEEL_TUNING: NoteName[] = ['G', 'B', 'D', 'F#', 'A', 'D']

// Lever configuration for pitch bending
export interface LeverConfig {
  stringIndex: number    // Which string (0-5)
  semitones: number      // How many semitones the lever bends UP
  openNote: NoteName     // The unbent note
  bentNote: NoteName     // The resulting bent note
}

// Default lever configuration: F# string (+1 semitone), A string (+2 semitones)
export const LEVER_CONFIG: LeverConfig[] = [
  { stringIndex: 3, semitones: 1, openNote: 'F#', bentNote: 'G' },   // F# -> G
  { stringIndex: 4, semitones: 2, openNote: 'A', bentNote: 'B' },    // A -> B
]

// Number of frets to display
export const FRET_COUNT = 24

// Fret marker positions (standard dots)
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
export const DOUBLE_MARKERS = [12, 24]

export interface FretPosition {
  string: number        // 0-5 (0 = lowest string G)
  fret: number          // 0-24 (0 = open)
  note: NoteName
  isLeverBent?: boolean // True if this position uses a lever bend
}

/**
 * Get the note at a specific string and fret position
 */
export function getNoteAt(string: number, fret: number, tuning = LAP_STEEL_TUNING): NoteName {
  const openNote = tuning[string]
  return transposeNote(openNote, fret)
}

/**
 * Find all positions on the fretboard for a given note
 */
export function findNotePositions(
  note: NoteName,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): FretPosition[] {
  const positions: FretPosition[] = []
  const targetSemitone = noteToSemitone(note)

  for (let string = 0; string < tuning.length; string++) {
    const openSemitone = noteToSemitone(tuning[string])
    for (let fret = 0; fret <= maxFret; fret++) {
      const currentSemitone = (openSemitone + fret) % 12
      if (currentSemitone === targetSemitone) {
        positions.push({ string, fret, note })
      }
    }
  }

  return positions
}

/**
 * Find all positions for multiple notes (chord tones)
 */
export function findChordPositions(
  notes: NoteName[],
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): FretPosition[] {
  const positions: FretPosition[] = []

  for (const note of notes) {
    positions.push(...findNotePositions(note, tuning, maxFret))
  }

  return positions
}

/**
 * Get string name for display (tuning note)
 */
export function getStringName(string: number, tuning = LAP_STEEL_TUNING): string {
  return tuning[string]
}

/**
 * Find all positions for a note, with lever support.
 * When a lever bent note matches a chord tone, ONLY return the lever position
 * (at fret 0), replacing the standard open string position on that string.
 *
 * @param note - Target note to find
 * @param chordTones - All chord tones (to determine if lever should engage)
 * @param levers - Lever configuration
 * @param tuning - Lap steel tuning
 * @param maxFret - Maximum fret to search
 */
export function findNotePositionsWithLevers(
  note: NoteName,
  chordTones: NoteName[],
  levers: LeverConfig[] = LEVER_CONFIG,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): FretPosition[] {
  const positions: FretPosition[] = []
  const targetSemitone = noteToSemitone(note)

  // Determine which strings have engaged levers (bent note is a chord tone)
  const leverEngagedStrings = new Set<number>()
  for (const lever of levers) {
    const bentSemitone = noteToSemitone(lever.bentNote)
    if (chordTones.some(ct => noteToSemitone(ct) === bentSemitone)) {
      leverEngagedStrings.add(lever.stringIndex)

      // If target note matches bent note, add lever position at fret 0
      if (targetSemitone === bentSemitone) {
        positions.push({
          string: lever.stringIndex,
          fret: 0,
          note,
          isLeverBent: true
        })
      }
    }
  }

  // Find standard positions (excluding fret 0 on lever-engaged strings)
  for (let string = 0; string < tuning.length; string++) {
    const openSemitone = noteToSemitone(tuning[string])

    for (let fret = 0; fret <= maxFret; fret++) {
      // Skip fret 0 on lever-engaged strings (bent note replaces open)
      if (fret === 0 && leverEngagedStrings.has(string)) {
        continue
      }

      const currentSemitone = (openSemitone + fret) % 12
      if (currentSemitone === targetSemitone) {
        positions.push({ string, fret, note, isLeverBent: false })
      }
    }
  }

  return positions
}

/**
 * Find all positions for chord tones with lever support
 */
export function findChordPositionsWithLevers(
  notes: NoteName[],
  levers: LeverConfig[] = LEVER_CONFIG,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): FretPosition[] {
  const positions: FretPosition[] = []

  for (const note of notes) {
    positions.push(...findNotePositionsWithLevers(note, notes, levers, tuning, maxFret))
  }

  return positions
}

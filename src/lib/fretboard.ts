import { NoteName, transposeNote, noteToSemitone } from './music'

// Lap steel tuning: G B D F# A D (low to high, strings 0-5)
export const LAP_STEEL_TUNING: NoteName[] = ['G', 'B', 'D', 'F#', 'A', 'D']

// Number of frets to display
export const FRET_COUNT = 24

// Fret marker positions (standard dots)
export const FRET_MARKERS = [3, 5, 7, 9, 12, 15, 17, 19, 21, 24]
export const DOUBLE_MARKERS = [12, 24]

export interface FretPosition {
  string: number  // 0-5 (0 = lowest string G)
  fret: number    // 0-24 (0 = open)
  note: NoteName
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

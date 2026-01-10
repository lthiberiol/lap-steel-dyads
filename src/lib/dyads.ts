import { NoteName, getInterval, getIntervalName } from './music'
import { FretPosition, findChordPositions, LAP_STEEL_TUNING, FRET_COUNT } from './fretboard'

export type DyadType = 'straight' | 'slant'

export interface Dyad {
  pos1: FretPosition
  pos2: FretPosition
  interval: number        // semitones between notes
  intervalName: string    // human readable (m3, P5, etc.)
  type: DyadType          // straight bar or slanted
}

/**
 * Find all valid dyads for given chord tones.
 *
 * Rules:
 * - Straight bar: same fret, any two strings
 * - Slanted bar: fret difference <= maxSlant, must be on different strings
 *
 * @param chordTones Array of notes in the chord
 * @param maxSlant Maximum fret difference for slanted dyads (default 1)
 * @param tuning Lap steel tuning (default GBDF#AD)
 * @param maxFret Maximum fret to search (default 24)
 */
export function findDyads(
  chordTones: NoteName[],
  maxSlant = 1,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): Dyad[] {
  const positions = findChordPositions(chordTones, tuning, maxFret)
  const dyads: Dyad[] = []
  const seen = new Set<string>()

  // Compare all pairs of positions
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const pos1 = positions[i]
      const pos2 = positions[j]

      // Must be on different strings
      if (pos1.string === pos2.string) continue

      const fretDiff = Math.abs(pos1.fret - pos2.fret)

      // Check if valid straight or slant
      if (fretDiff > maxSlant) continue

      // Determine type
      const type: DyadType = fretDiff === 0 ? 'straight' : 'slant'

      // Create a unique key to avoid duplicates
      const [lower, higher] = pos1.string < pos2.string ? [pos1, pos2] : [pos2, pos1]
      const key = `${lower.string}-${lower.fret}-${higher.string}-${higher.fret}`

      if (seen.has(key)) continue
      seen.add(key)

      // Calculate interval
      const interval = getInterval(lower.note, higher.note)
      const intervalName = getIntervalName(interval)

      dyads.push({
        pos1: lower,
        pos2: higher,
        interval,
        intervalName,
        type,
      })
    }
  }

  // Sort by fret position, then by lower string
  dyads.sort((a, b) => {
    const fretA = Math.min(a.pos1.fret, a.pos2.fret)
    const fretB = Math.min(b.pos1.fret, b.pos2.fret)
    if (fretA !== fretB) return fretA - fretB
    return a.pos1.string - b.pos1.string
  })

  return dyads
}

/**
 * Filter dyads by type
 */
export function filterDyadsByType(dyads: Dyad[], type: DyadType): Dyad[] {
  return dyads.filter(d => d.type === type)
}

/**
 * Check if two dyads overlap (share any position or are very close)
 */
function dyadsOverlap(a: Dyad, b: Dyad, fretProximity = 3): boolean {
  // Check if they share any string-fret position
  const aPositions = [
    `${a.pos1.string}-${a.pos1.fret}`,
    `${a.pos2.string}-${a.pos2.fret}`,
  ]
  const bPositions = [
    `${b.pos1.string}-${b.pos1.fret}`,
    `${b.pos2.string}-${b.pos2.fret}`,
  ]

  if (aPositions.some(p => bPositions.includes(p))) {
    return true
  }

  // Check if they're within proximity on the fretboard
  const aMinFret = Math.min(a.pos1.fret, a.pos2.fret)
  const bMinFret = Math.min(b.pos1.fret, b.pos2.fret)

  // Check fret proximity
  const fretsClose = Math.abs(aMinFret - bMinFret) <= fretProximity

  // Check string overlap
  const aStrings = [a.pos1.string, a.pos2.string]
  const bStrings = [b.pos1.string, b.pos2.string]
  const stringsOverlap = aStrings.some(s => bStrings.includes(s))

  return fretsClose && stringsOverlap
}

/**
 * Get the chord degree (interval from root) for a note.
 * Returns the interval in semitones (0-11).
 */
function getChordDegree(note: NoteName, chordRoot: NoteName): number {
  return getInterval(chordRoot, note)
}

/**
 * Get the harmonic importance score for a chord degree.
 * Higher score = more important for defining chord quality.
 *
 * Scoring:
 * - 3rd (m3/M3): 10 - defines major/minor quality
 * - 7th (m7/M7): 9 - defines 7th chord type
 * - Root: 6 - foundation
 * - 9th (m9/M9): 4 - extension
 * - 13th (m13/M13): 3 - extension
 * - 11th (P11/#11): 3 - extension
 * - 5th (P5): 2 - least defining
 * - Other: 0
 */
function getDegreeImportance(degree: number): number {
  switch (degree) {
    case 3:  // m3
    case 4:  // M3
      return 10
    case 10: // m7
    case 11: // M7
      return 9
    case 0:  // Root
      return 6
    case 1:  // m9 (m2)
    case 2:  // M9 (M2)
      return 4
    case 8:  // m13 (m6)
    case 9:  // M13 (M6)
      return 3
    case 5:  // P11 (P4)
    case 6:  // #11 (TT)
      return 3
    case 7:  // P5
      return 2
    default:
      return 0
  }
}

/**
 * Filter dyads to show only the most harmonically important ones.
 *
 * Prioritizes dyads containing different chord degrees (3rd+7th, 3rd+root, etc.)
 * and rejects dyads where both notes are the same degree (e.g., two 3rds).
 * Selects the best non-overlapping dyads across the fretboard.
 *
 * @param dyads Array of dyads to filter
 * @param chordRoot Root note of the chord
 * @param fretProximity Minimum fret distance between selected dyads (default 3)
 */
export function filterGuideTones(dyads: Dyad[], chordRoot: NoteName | null, fretProximity = 3): Dyad[] {
  if (!chordRoot) return []

  // Score all dyads, rejecting those with duplicate degrees
  const scored: { dyad: Dyad; score: number }[] = []

  for (const dyad of dyads) {
    const degree1 = getChordDegree(dyad.pos1.note, chordRoot)
    const degree2 = getChordDegree(dyad.pos2.note, chordRoot)

    // Reject dyads where both notes are the same chord degree
    if (degree1 === degree2) continue

    const score = getDegreeImportance(degree1) + getDegreeImportance(degree2)

    // Filter out dyads with very low scores
    if (score >= 8) {
      scored.push({ dyad, score })
    }
  }

  // Sort by score (highest first), then by fret position
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return Math.min(a.dyad.pos1.fret, a.dyad.pos2.fret) -
           Math.min(b.dyad.pos1.fret, b.dyad.pos2.fret)
  })

  // Greedily select non-overlapping dyads, preferring higher scores
  const selected: Dyad[] = []

  for (const { dyad } of scored) {
    const overlapsWithSelected = selected.some(s => dyadsOverlap(dyad, s, fretProximity))
    if (!overlapsWithSelected) {
      selected.push(dyad)
    }
  }

  // Sort result by fret position for display
  selected.sort((a, b) => {
    return Math.min(a.pos1.fret, a.pos2.fret) - Math.min(b.pos1.fret, b.pos2.fret)
  })

  return selected
}

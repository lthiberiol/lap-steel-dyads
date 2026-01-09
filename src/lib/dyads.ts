import { NoteName, getInterval, getIntervalName } from './music'
import { FretPosition, findChordPositions, findChordPositionsWithLevers, LAP_STEEL_TUNING, FRET_COUNT, LEVER_CONFIG } from './fretboard'
import { Degree, getSubstitutions } from './substitutions'

export type DyadType = 'straight' | 'slant'
export type DyadSource = 'direct' | 'lever' | 'diatonic-sub' | 'tritone-sub'

export interface Dyad {
  pos1: FretPosition
  pos2: FretPosition
  interval: number        // semitones between notes
  intervalName: string    // human readable (m3, P5, etc.)
  type: DyadType          // straight bar or slanted
  priority: number        // higher = more important (guide tones)
  source: DyadSource      // how this dyad was found
  leverPositions?: number[] // which positions (1, 2, or both) use levers
  substitutionInfo?: {    // for substitution dyads
    substituteChord: string
    substituteDegree: string
  }
}

// Guide tone priority scoring
// 3rds and 7ths define chord quality and are most important
const INTERVAL_PRIORITY: Record<number, number> = {
  3: 10,   // m3 - defines minor quality
  4: 10,   // M3 - defines major quality
  10: 9,   // m7 - defines dominant/minor 7th
  11: 9,   // M7 - defines major 7th
  6: 8,    // TT - tritone, crucial for dominant resolution
  7: 5,    // P5 - supportive but less defining
  8: 4,    // m6
  9: 4,    // M6
  5: 3,    // P4
  2: 2,    // M2
  1: 1,    // m2
  0: 0,    // unison
}

/**
 * Get priority score for a dyad based on its interval
 * Higher score = more harmonically important (guide tones)
 */
function getDyadPriority(interval: number): number {
  return INTERVAL_PRIORITY[interval] ?? 0
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
 * @param useLevers Whether to use lever-aware position finding (default true)
 */
export function findDyads(
  chordTones: NoteName[],
  maxSlant = 1,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT,
  useLevers = true
): Dyad[] {
  // Use lever-aware position finding when enabled
  const positions = useLevers
    ? findChordPositionsWithLevers(chordTones, LEVER_CONFIG, tuning, maxFret)
    : findChordPositions(chordTones, tuning, maxFret)

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

      // Create a unique key to avoid duplicates (include lever state)
      const [lower, higher] = pos1.string < pos2.string ? [pos1, pos2] : [pos2, pos1]
      const key = `${lower.string}-${lower.fret}-${higher.string}-${higher.fret}-${lower.isLeverBent}-${higher.isLeverBent}`

      if (seen.has(key)) continue
      seen.add(key)

      // Calculate interval
      const interval = getInterval(lower.note, higher.note)
      const intervalName = getIntervalName(interval)
      const priority = getDyadPriority(interval)

      // Determine if this dyad uses levers
      const leverPositions: number[] = []
      if (lower.isLeverBent) leverPositions.push(1)
      if (higher.isLeverBent) leverPositions.push(2)

      dyads.push({
        pos1: lower,
        pos2: higher,
        interval,
        intervalName,
        type,
        priority,
        source: leverPositions.length > 0 ? 'lever' : 'direct',
        leverPositions: leverPositions.length > 0 ? leverPositions : undefined
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
 * Filter dyads by interval
 */
export function filterDyadsByInterval(dyads: Dyad[], intervals: number[]): Dyad[] {
  return dyads.filter(d => intervals.includes(d.interval))
}

/**
 * Group dyads by fret (for display purposes)
 */
export function groupDyadsByFret(dyads: Dyad[]): Map<number, Dyad[]> {
  const groups = new Map<number, Dyad[]>()

  for (const dyad of dyads) {
    const fret = Math.min(dyad.pos1.fret, dyad.pos2.fret)
    if (!groups.has(fret)) {
      groups.set(fret, [])
    }
    groups.get(fret)!.push(dyad)
  }

  return groups
}

/**
 * Check if two dyads overlap (share any position or are very close)
 */
function dyadsOverlap(a: Dyad, b: Dyad, fretProximity = 2): boolean {
  // Check if they share any string-fret position
  const positions = [
    `${a.pos1.string}-${a.pos1.fret}`,
    `${a.pos2.string}-${a.pos2.fret}`,
  ]
  const bPositions = [
    `${b.pos1.string}-${b.pos1.fret}`,
    `${b.pos2.string}-${b.pos2.fret}`,
  ]

  if (positions.some(p => bPositions.includes(p))) {
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
 * Filter dyads to show only guide tones, removing clutter from overlapping positions.
 * Keeps the highest priority dyad when multiple dyads overlap.
 *
 * Guide tones are intervals that define chord quality:
 * - 3rds (major/minor quality)
 * - 7ths (chord extension type)
 * - Tritones (dominant function)
 */
export function filterGuideTones(dyads: Dyad[], fretProximity = 2): Dyad[] {
  // First, filter to only high-priority intervals (3rds, 7ths, tritones)
  const guideToneIntervals = [3, 4, 6, 10, 11] // m3, M3, TT, m7, M7
  const guideToneDyads = dyads.filter(d => guideToneIntervals.includes(d.interval))

  // Sort by priority (highest first), then by fret position
  const sorted = [...guideToneDyads].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority
    return Math.min(a.pos1.fret, a.pos2.fret) - Math.min(b.pos1.fret, b.pos2.fret)
  })

  // Greedily select non-overlapping dyads, preferring higher priority
  const selected: Dyad[] = []

  for (const dyad of sorted) {
    const overlapsWithSelected = selected.some(s => dyadsOverlap(dyad, s, fretProximity))
    if (!overlapsWithSelected) {
      selected.push(dyad)
    }
  }

  // Sort result by fret position for display
  selected.sort((a, b) => {
    const fretA = Math.min(a.pos1.fret, a.pos2.fret)
    const fretB = Math.min(b.pos1.fret, b.pos2.fret)
    return fretA - fretB
  })

  return selected
}

/**
 * Find dyads for substitution chords based on degree
 */
export function findSubstitutionDyads(
  chordRoot: NoteName,
  degree: Degree,
  maxSlant = 1,
  tuning = LAP_STEEL_TUNING,
  maxFret = FRET_COUNT
): Dyad[] {
  const substitutions = getSubstitutions(chordRoot, degree)
  const allSubDyads: Dyad[] = []

  for (const sub of substitutions) {
    // Find dyads for substitution chord (without levers for subs)
    const subDyads = findDyads(sub.substituteTones, maxSlant, tuning, maxFret, false)

    // Mark them as substitution dyads
    for (const dyad of subDyads) {
      dyad.source = sub.type === 'tritone' ? 'tritone-sub' : 'diatonic-sub'
      dyad.substitutionInfo = {
        substituteChord: sub.substituteChord,
        substituteDegree: sub.substituteDegree
      }
    }

    allSubDyads.push(...subDyads)
  }

  return allSubDyads
}

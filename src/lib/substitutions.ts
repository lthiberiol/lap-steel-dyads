import { NoteName, transposeNote, getChordTones } from './music'

export type Degree = 'I' | 'ii' | 'iii' | 'IV' | 'V' | 'vi' | 'vii°'

// Diatonic function substitutions - chords that share harmonic function
export const DIATONIC_SUBSTITUTIONS: Record<Degree, Degree[]> = {
  'I':    ['iii', 'vi'],      // Tonic function
  'ii':   ['IV'],             // Subdominant function (IV can substitute for ii)
  'iii':  ['I', 'vi'],        // Tonic function
  'IV':   ['ii', 'vi'],       // Subdominant function
  'V':    ['vii°'],           // Dominant function
  'vi':   ['I', 'iii'],       // Tonic function
  'vii°': ['V'],              // Dominant function
}

// Degree to semitone offset from tonic
const DEGREE_SEMITONES: Record<Degree, number> = {
  'I': 0,
  'ii': 2,
  'iii': 4,
  'IV': 5,
  'V': 7,
  'vi': 9,
  'vii°': 11,
}

// Degree to chord quality for building substitute chords
const DEGREE_QUALITY: Record<Degree, string> = {
  'I': '',        // major
  'ii': 'm',      // minor
  'iii': 'm',     // minor
  'IV': '',       // major
  'V': '7',       // dominant 7 (for tritone sub compatibility)
  'vi': 'm',      // minor
  'vii°': 'm7b5', // half-diminished
}

export interface SubstitutionInfo {
  substituteDegree: Degree | 'bII7'
  substituteChord: string
  substituteTones: NoteName[]
  type: 'diatonic' | 'tritone'
}

/**
 * Get the tonic (I) note from a chord and its degree
 * Example: chord root = "A", degree = "vi" -> tonic = "C"
 */
export function getTonicFromChord(chordRoot: NoteName, degree: Degree): NoteName {
  const offset = DEGREE_SEMITONES[degree]
  // Transpose DOWN by the degree offset to find the tonic
  return transposeNote(chordRoot, -offset)
}

/**
 * Build a chord symbol from tonic and degree
 */
export function buildChordFromDegree(tonic: NoteName, degree: Degree): string {
  const root = transposeNote(tonic, DEGREE_SEMITONES[degree])
  const quality = DEGREE_QUALITY[degree]
  return `${root}${quality}`
}

/**
 * Get tritone substitution for a dominant chord
 * bII7 substitutes for V7 (same tritone interval: 3rd and 7th swap roles)
 * Example: G7 (V of C) -> Db7 (bII7)
 */
export function getTritoneSubstitution(dominantRoot: NoteName): { chord: string; tones: NoteName[] } {
  // Tritone sub root is 6 semitones away
  const subRoot = transposeNote(dominantRoot, 6)
  const chord = `${subRoot}7`
  const tones = getChordTones(chord)
  return { chord, tones }
}

/**
 * Get all substitution chords for a given chord and degree
 */
export function getSubstitutions(
  chordRoot: NoteName,
  degree: Degree
): SubstitutionInfo[] {
  const substitutions: SubstitutionInfo[] = []

  // Get tonic for the key
  const tonic = getTonicFromChord(chordRoot, degree)

  // Diatonic substitutions
  const diatonicSubs = DIATONIC_SUBSTITUTIONS[degree] || []
  for (const subDegree of diatonicSubs) {
    const subChord = buildChordFromDegree(tonic, subDegree)
    const subTones = getChordTones(subChord)

    substitutions.push({
      substituteDegree: subDegree,
      substituteChord: subChord,
      substituteTones: subTones,
      type: 'diatonic'
    })
  }

  // Tritone substitution (only for V degree)
  if (degree === 'V') {
    const tritone = getTritoneSubstitution(chordRoot)
    substitutions.push({
      substituteDegree: 'bII7',
      substituteChord: tritone.chord,
      substituteTones: tritone.tones,
      type: 'tritone'
    })
  }

  return substitutions
}

import { NoteName, noteToSemitone } from './music'

// Audio context singleton
let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
  }
  return audioContext
}

// Base frequency for A4 (440 Hz standard tuning)
const A4_FREQUENCY = 440
const A4_SEMITONE = 9 // A is at index 9 in our chromatic scale

/**
 * Convert a note name and octave to frequency in Hz
 * Default octave is 3 (middle range for lap steel)
 */
export function noteToFrequency(note: NoteName, octave = 3): number {
  const semitone = noteToSemitone(note)
  // Calculate semitones from A4
  const semitonesFromA4 = semitone - A4_SEMITONE + (octave - 4) * 12
  return A4_FREQUENCY * Math.pow(2, semitonesFromA4 / 12)
}

/**
 * Estimate octave based on string and fret position
 * Lap steel tuning G B D F# A D spans roughly octaves 2-4
 */
export function getOctaveForPosition(string: number, fret: number): number {
  // Base octaves for each string (low to high: G2, B2, D3, F#3, A3, D4)
  const baseOctaves = [2, 2, 3, 3, 3, 4]
  const baseOctave = baseOctaves[string] ?? 3
  // Each 12 frets adds an octave
  return baseOctave + Math.floor(fret / 12)
}

interface PlayNoteOptions {
  duration?: number      // Duration in seconds
  attack?: number        // Attack time in seconds
  release?: number       // Release time in seconds
  volume?: number        // Volume 0-1
  waveform?: OscillatorType
}

/**
 * Play a single note
 */
export function playNote(
  note: NoteName,
  octave: number,
  options: PlayNoteOptions = {}
): void {
  const {
    duration = 1.5,
    attack = 0.02,
    release = 0.8,
    volume = 0.3,
    waveform = 'triangle'
  } = options

  const ctx = getAudioContext()
  const now = ctx.currentTime

  // Create oscillator
  const oscillator = ctx.createOscillator()
  oscillator.type = waveform
  oscillator.frequency.value = noteToFrequency(note, octave)

  // Create gain for envelope
  const gainNode = ctx.createGain()
  gainNode.gain.setValueAtTime(0, now)
  gainNode.gain.linearRampToValueAtTime(volume, now + attack)
  gainNode.gain.setValueAtTime(volume, now + duration - release)
  gainNode.gain.linearRampToValueAtTime(0, now + duration)

  // Connect and play
  oscillator.connect(gainNode)
  gainNode.connect(ctx.destination)

  oscillator.start(now)
  oscillator.stop(now + duration)
}

/**
 * Play a dyad (two notes simultaneously)
 */
export function playDyad(
  note1: NoteName,
  string1: number,
  fret1: number,
  note2: NoteName,
  string2: number,
  fret2: number,
  options: PlayNoteOptions = {}
): void {
  const octave1 = getOctaveForPosition(string1, fret1)
  const octave2 = getOctaveForPosition(string2, fret2)

  // Play both notes with slightly reduced volume to avoid clipping
  const dyadOptions = { ...options, volume: (options.volume ?? 0.3) * 0.7 }

  playNote(note1, octave1, dyadOptions)
  playNote(note2, octave2, dyadOptions)
}

/**
 * Resume audio context if suspended (required for user interaction on some browsers)
 */
export function resumeAudio(): void {
  const ctx = getAudioContext()
  if (ctx.state === 'suspended') {
    ctx.resume()
  }
}

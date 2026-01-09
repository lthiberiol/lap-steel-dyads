import { useState, useEffect } from 'react'
import { parseChord, getChordTones, NoteName } from '../lib/music'
import { Degree } from '../lib/substitutions'
import styles from './ChordInput.module.css'

export const DEGREES: Degree[] = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°']
export type { Degree }

interface ChordInputProps {
  onChordChange: (tones: NoteName[], chordName: string, degree: Degree, root: NoteName | null) => void
}

export function ChordInput({ onChordChange }: ChordInputProps) {
  const [input, setInput] = useState('C')
  const [degree, setDegree] = useState<Degree>('I')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const trimmed = input.trim()
      if (!trimmed) {
        setError(null)
        onChordChange([], '', degree, null)
        return
      }

      // Validate and parse the chord
      const { root } = parseChord(trimmed)
      const tones = getChordTones(trimmed)
      setError(null)
      onChordChange(tones, `${trimmed} (${degree})`, degree, root)
    } catch (e) {
      setError((e as Error).message)
      onChordChange([], '', degree, null)
    }
  }, [input, degree, onChordChange])

  return (
    <div className={styles.container}>
      <div className={styles.inputGroup}>
        <label className={styles.label}>chord</label>
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          className={`${styles.input} ${error ? styles.inputError : ''}`}
          placeholder="C, Am7, F#dim..."
          spellCheck={false}
          autoComplete="off"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.label}>degree</label>
        <div className={styles.degrees}>
          {DEGREES.map(d => (
            <button
              key={d}
              className={`${styles.degree} ${degree === d ? styles.degreeActive : ''}`}
              onClick={() => setDegree(d)}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}

import { useState, useEffect } from 'react'
import { parseChord, getChordTones, NoteName } from '../lib/music'
import styles from './ChordInput.module.css'

interface ChordInputProps {
  onChordChange: (tones: NoteName[], chordName: string, root: NoteName | null) => void
}

export function ChordInput({ onChordChange }: ChordInputProps) {
  const [input, setInput] = useState('C')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    try {
      const trimmed = input.trim()
      if (!trimmed) {
        setError(null)
        onChordChange([], '', null)
        return
      }

      // Validate and parse the chord
      const { root } = parseChord(trimmed)
      const tones = getChordTones(trimmed)
      setError(null)
      onChordChange(tones, trimmed, root)
    } catch (e) {
      setError((e as Error).message)
      onChordChange([], '', null)
    }
  }, [input, onChordChange])

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

      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}

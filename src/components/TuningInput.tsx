import { useState, useEffect } from 'react'
import { NoteName, normalizeNote } from '../lib/music'
import styles from './TuningInput.module.css'

// Common lap steel tunings (low to high)
export const PRESET_TUNINGS: Record<string, NoteName[]> = {
  'C6 (GBDF#AD)': ['G', 'B', 'D', 'F#', 'A', 'D'],
  'C6 (CEGACE)': ['C', 'E', 'G', 'A', 'C', 'E'],
  'E9 (BD#EF#G#BE)': ['B', 'D#', 'E', 'F#', 'G#', 'B', 'E'],
  'Open G (DGDGBD)': ['D', 'G', 'D', 'G', 'B', 'D'],
  'Open D (DADF#AD)': ['D', 'A', 'D', 'F#', 'A', 'D'],
  'Open E (EBEG#BE)': ['E', 'B', 'E', 'G#', 'B', 'E'],
  'Open A (EAEAC#E)': ['E', 'A', 'E', 'A', 'C#', 'E'],
}

const DEFAULT_TUNING_NAME = 'C6 (GBDF#AD)'

interface TuningInputProps {
  onTuningChange: (tuning: NoteName[]) => void
}

export function TuningInput({ onTuningChange }: TuningInputProps) {
  const [selectedPreset, setSelectedPreset] = useState(DEFAULT_TUNING_NAME)
  const [customTuning, setCustomTuning] = useState('')
  const [isCustom, setIsCustom] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle preset selection
  useEffect(() => {
    if (!isCustom && selectedPreset) {
      const tuning = PRESET_TUNINGS[selectedPreset]
      if (tuning) {
        onTuningChange(tuning)
        setError(null)
      }
    }
  }, [selectedPreset, isCustom, onTuningChange])

  // Handle custom tuning input
  useEffect(() => {
    if (isCustom && customTuning) {
      try {
        const notes = parseCustomTuning(customTuning)
        if (notes.length < 2) {
          setError('Need at least 2 strings')
          return
        }
        if (notes.length > 12) {
          setError('Maximum 12 strings')
          return
        }
        onTuningChange(notes)
        setError(null)
      } catch (e) {
        setError((e as Error).message)
      }
    }
  }, [customTuning, isCustom, onTuningChange])

  const handlePresetChange = (preset: string) => {
    if (preset === 'custom') {
      setIsCustom(true)
      setCustomTuning(PRESET_TUNINGS[selectedPreset]?.join(' ') || '')
    } else {
      setIsCustom(false)
      setSelectedPreset(preset)
    }
  }

  return (
    <div className={styles.container}>
      <label className={styles.label}>tuning</label>
      <div className={styles.inputRow}>
        <select
          value={isCustom ? 'custom' : selectedPreset}
          onChange={e => handlePresetChange(e.target.value)}
          className={styles.select}
        >
          {Object.keys(PRESET_TUNINGS).map(name => (
            <option key={name} value={name}>{name}</option>
          ))}
          <option value="custom">Custom...</option>
        </select>

        {isCustom && (
          <input
            type="text"
            value={customTuning}
            onChange={e => setCustomTuning(e.target.value)}
            className={`${styles.input} ${error ? styles.inputError : ''}`}
            placeholder="G B D F# A D"
            spellCheck={false}
            autoComplete="off"
          />
        )}
      </div>
      {error && <div className={styles.error}>{error}</div>}
    </div>
  )
}

/**
 * Parse a custom tuning string into note names
 * Accepts space or comma separated notes: "G B D F# A D" or "G,B,D,F#,A,D"
 */
function parseCustomTuning(input: string): NoteName[] {
  const parts = input.trim().split(/[\s,]+/).filter(Boolean)
  return parts.map(part => {
    try {
      return normalizeNote(part)
    } catch {
      throw new Error(`Invalid note: ${part}`)
    }
  })
}

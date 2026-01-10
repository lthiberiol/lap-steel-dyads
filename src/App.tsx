import { useState, useCallback, useMemo } from 'react'
import { ChordInput } from './components/ChordInput'
import { TuningInput, PRESET_TUNINGS } from './components/TuningInput'
import { Fretboard } from './components/Fretboard'
import { findDyads, filterGuideTones } from './lib/dyads'
import { NoteName } from './lib/music'
import styles from './App.module.css'

type DisplayMode = 'all' | 'guide'

const DEFAULT_TUNING = PRESET_TUNINGS['Gmaj9 (GBDF#AD)']

function App() {
  const [tuning, setTuning] = useState<NoteName[]>(DEFAULT_TUNING)
  const [chordTones, setChordTones] = useState<NoteName[]>(['C', 'E', 'G'])
  const [chordName, setChordName] = useState('C')
  const [chordRoot, setChordRoot] = useState<NoteName | null>('C')
  const [showStraight, setShowStraight] = useState(true)
  const [showSlant, setShowSlant] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all')

  const handleTuningChange = useCallback((newTuning: NoteName[]) => {
    setTuning(newTuning)
  }, [])

  const handleChordChange = useCallback((
    tones: NoteName[],
    name: string,
    root: NoteName | null
  ) => {
    setChordTones(tones)
    setChordName(name)
    setChordRoot(root)
  }, [])

  // Find all dyads for the chord
  const allDyads = useMemo(() => {
    if (chordTones.length === 0) return []
    return findDyads(chordTones, 1, tuning)
  }, [chordTones, tuning])

  // Apply guide tone filter if selected
  const dyads = useMemo(() => {
    if (displayMode === 'guide') {
      return filterGuideTones(allDyads, chordRoot)
    }
    return allDyads
  }, [allDyads, displayMode, chordRoot])

  const straightCount = useMemo(() => dyads.filter(d => d.type === 'straight').length, [dyads])
  const slantCount = useMemo(() => dyads.filter(d => d.type === 'slant').length, [dyads])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>lap steel dyads</h1>
        <span className={styles.tuning}>{tuning.join('')}</span>
      </header>

      <div className={styles.controls}>
        <TuningInput onTuningChange={handleTuningChange} />
        <ChordInput onChordChange={handleChordChange} />

        <div className={styles.displayMode}>
          <span className={styles.modeLabel}>display</span>
          <div className={styles.modeOptions}>
            <label className={styles.modeOption}>
              <input
                type="radio"
                name="displayMode"
                checked={displayMode === 'all'}
                onChange={() => setDisplayMode('all')}
              />
              <span>all dyads</span>
            </label>
            <label className={styles.modeOption}>
              <input
                type="radio"
                name="displayMode"
                checked={displayMode === 'guide'}
                onChange={() => setDisplayMode('guide')}
              />
              <span>guide tones</span>
            </label>
          </div>
        </div>

        <div className={styles.filters}>
          <label className={styles.filter}>
            <input
              type="checkbox"
              checked={showStraight}
              onChange={e => setShowStraight(e.target.checked)}
            />
            <span className={styles.filterLabel}>
              straight <span className={styles.filterCount}>{straightCount}</span>
            </span>
          </label>
          <label className={styles.filter}>
            <input
              type="checkbox"
              checked={showSlant}
              onChange={e => setShowSlant(e.target.checked)}
            />
            <span className={styles.filterLabel}>
              slant <span className={styles.filterCount}>{slantCount}</span>
            </span>
          </label>
        </div>
      </div>

      {chordName && (
        <div className={styles.chordInfo}>
          <span className={styles.chordName}>{chordName}</span>
          <span className={styles.chordTones}>
            {chordTones.join(' – ')}
          </span>
        </div>
      )}

      <div className={styles.fretboardWrapper}>
        <Fretboard
          dyads={dyads}
          tuning={tuning}
          showStraight={showStraight}
          showSlant={showSlant}
        />
      </div>

      <footer className={styles.footer}>
        hover over dyads for details · click to play
      </footer>
    </div>
  )
}

export default App

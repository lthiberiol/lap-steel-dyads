import { useState, useCallback, useMemo } from 'react'
import { ChordInput, Degree } from './components/ChordInput'
import { TuningInput, PRESET_TUNINGS } from './components/TuningInput'
import { Fretboard } from './components/Fretboard'
import { findDyads, filterGuideTones, findSubstitutionDyads } from './lib/dyads'
import { NoteName } from './lib/music'
import styles from './App.module.css'

type DisplayMode = 'all' | 'guide'

const DEFAULT_TUNING = PRESET_TUNINGS['Gmaj9 (GBDF#AD)']

function App() {
  const [tuning, setTuning] = useState<NoteName[]>(DEFAULT_TUNING)
  const [chordTones, setChordTones] = useState<NoteName[]>(['C', 'E', 'G'])
  const [chordName, setChordName] = useState('C (I)')
  const [chordRoot, setChordRoot] = useState<NoteName | null>('C')
  const [degree, setDegree] = useState<Degree>('I')
  const [showStraight, setShowStraight] = useState(true)
  const [showSlant, setShowSlant] = useState(true)
  const [showSubstitutions, setShowSubstitutions] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all')

  const handleTuningChange = useCallback((newTuning: NoteName[]) => {
    setTuning(newTuning)
  }, [])

  const handleChordChange = useCallback((
    tones: NoteName[],
    name: string,
    deg: Degree,
    root: NoteName | null
  ) => {
    setChordTones(tones)
    setChordName(name)
    setDegree(deg)
    setChordRoot(root)
  }, [])

  // Direct chord dyads
  const directDyads = useMemo(() => {
    if (chordTones.length === 0) return []
    return findDyads(chordTones, 1, tuning)
  }, [chordTones, tuning])

  // Substitution dyads based on degree
  const substitutionDyads = useMemo(() => {
    if (!showSubstitutions || !chordRoot || chordTones.length === 0) return []
    return findSubstitutionDyads(chordRoot, degree, 1, tuning)
  }, [showSubstitutions, chordRoot, degree, chordTones.length, tuning])

  // Combined dyads
  const allDyads = useMemo(() => {
    return [...directDyads, ...substitutionDyads]
  }, [directDyads, substitutionDyads])

  const dyads = useMemo(() => {
    if (displayMode === 'guide') {
      // Filter direct dyads for guide tones (3rd + 7th)
      const filteredDirect = filterGuideTones(directDyads, chordRoot)
      // For substitutions, we'd need each chord's root - for now show all
      return [...filteredDirect, ...substitutionDyads]
    }
    return allDyads
  }, [allDyads, directDyads, substitutionDyads, displayMode, chordRoot])

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
          <label className={styles.filter}>
            <input
              type="checkbox"
              checked={showSubstitutions}
              onChange={e => setShowSubstitutions(e.target.checked)}
            />
            <span className={styles.filterLabel}>
              substitutions <span className={styles.filterCount}>{substitutionDyads.length}</span>
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
        hover over dyads for details
      </footer>
    </div>
  )
}

export default App

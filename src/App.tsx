import { useState, useCallback, useMemo } from 'react'
import { ChordInput, Degree } from './components/ChordInput'
import { Fretboard } from './components/Fretboard'
import { findDyads, filterGuideTones, findSubstitutionDyads } from './lib/dyads'
import { NoteName } from './lib/music'
import styles from './App.module.css'

type DisplayMode = 'all' | 'guide'

function App() {
  const [chordTones, setChordTones] = useState<NoteName[]>(['C', 'E', 'G'])
  const [chordName, setChordName] = useState('C (I)')
  const [chordRoot, setChordRoot] = useState<NoteName | null>('C')
  const [degree, setDegree] = useState<Degree>('I')
  const [showStraight, setShowStraight] = useState(true)
  const [showSlant, setShowSlant] = useState(true)
  const [showSubstitutions, setShowSubstitutions] = useState(true)
  const [displayMode, setDisplayMode] = useState<DisplayMode>('all')

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

  // Direct chord dyads (with lever support)
  const directDyads = useMemo(() => {
    if (chordTones.length === 0) return []
    return findDyads(chordTones, 1)
  }, [chordTones])

  // Substitution dyads based on degree
  const substitutionDyads = useMemo(() => {
    if (!showSubstitutions || !chordRoot || chordTones.length === 0) return []
    return findSubstitutionDyads(chordRoot, degree, 1)
  }, [showSubstitutions, chordRoot, degree, chordTones.length])

  // Combined dyads
  const allDyads = useMemo(() => {
    return [...directDyads, ...substitutionDyads]
  }, [directDyads, substitutionDyads])

  const dyads = useMemo(() => {
    if (displayMode === 'guide') {
      return filterGuideTones(allDyads)
    }
    return allDyads
  }, [allDyads, displayMode])

  const straightCount = useMemo(() => dyads.filter(d => d.type === 'straight').length, [dyads])
  const slantCount = useMemo(() => dyads.filter(d => d.type === 'slant').length, [dyads])

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <h1 className={styles.title}>lap steel dyads</h1>
        <span className={styles.tuning}>GBDF#AD</span>
      </header>

      <div className={styles.controls}>
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

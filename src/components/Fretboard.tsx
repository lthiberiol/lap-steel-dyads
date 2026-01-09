import { useMemo, useState } from 'react'
import { LAP_STEEL_TUNING, FRET_COUNT, FRET_MARKERS, DOUBLE_MARKERS } from '../lib/fretboard'
import { Dyad, DyadSource } from '../lib/dyads'
import styles from './Fretboard.module.css'

// Get CSS class based on dyad source
function getSourceClass(source: DyadSource): string {
  switch (source) {
    case 'lever': return styles.lever
    case 'diatonic-sub': return styles['diatonic-sub']
    case 'tritone-sub': return styles['tritone-sub']
    default: return ''
  }
}

interface FretboardProps {
  dyads: Dyad[]
  showStraight: boolean
  showSlant: boolean
}

// SVG dimensions and layout
const STRING_COUNT = LAP_STEEL_TUNING.length
const FRET_WIDTH = 48
const STRING_SPACING = 28
const NUT_WIDTH = 4
const PADDING_LEFT = 40
const PADDING_TOP = 30
const PADDING_BOTTOM = 20

const TOTAL_WIDTH = PADDING_LEFT + NUT_WIDTH + (FRET_COUNT * FRET_WIDTH) + 20
const TOTAL_HEIGHT = PADDING_TOP + ((STRING_COUNT - 1) * STRING_SPACING) + PADDING_BOTTOM

// Calculate X position for a fret (on the fret line - lap steel bar placement)
function fretX(fret: number): number {
  if (fret === 0) {
    return PADDING_LEFT + NUT_WIDTH / 2  // Open string at nut
  }
  return PADDING_LEFT + NUT_WIDTH + (fret * FRET_WIDTH)  // On the fret line
}

// Calculate Y position for a string
function stringY(string: number): number {
  // String 0 (G, lowest) at bottom, String 5 (D, highest) at top
  return PADDING_TOP + ((STRING_COUNT - 1 - string) * STRING_SPACING)
}

export function Fretboard({ dyads, showStraight, showSlant }: FretboardProps) {
  const [hoveredDyad, setHoveredDyad] = useState<Dyad | null>(null)

  // Filter dyads based on visibility toggles
  const visibleDyads = useMemo(() => {
    return dyads.filter(d => {
      if (d.type === 'straight' && !showStraight) return false
      if (d.type === 'slant' && !showSlant) return false
      return true
    })
  }, [dyads, showStraight, showSlant])

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${TOTAL_WIDTH} ${TOTAL_HEIGHT}`}
        className={styles.svg}
        preserveAspectRatio="xMinYMid meet"
      >
        {/* Fretboard background */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 10}
          width={NUT_WIDTH + FRET_COUNT * FRET_WIDTH}
          height={(STRING_COUNT - 1) * STRING_SPACING + 20}
          className={styles.board}
        />

        {/* Nut */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 8}
          width={NUT_WIDTH}
          height={(STRING_COUNT - 1) * STRING_SPACING + 16}
          className={styles.nut}
        />

        {/* Fret markers (dots) */}
        {FRET_MARKERS.map(fret => {
          const x = PADDING_LEFT + NUT_WIDTH + ((fret - 0.5) * FRET_WIDTH)
          const isDouble = DOUBLE_MARKERS.includes(fret)
          const centerY = PADDING_TOP + ((STRING_COUNT - 1) * STRING_SPACING) / 2

          if (isDouble) {
            return (
              <g key={`marker-${fret}`}>
                <circle cx={x} cy={centerY - 20} r={4} className={styles.marker} />
                <circle cx={x} cy={centerY + 20} r={4} className={styles.marker} />
              </g>
            )
          }
          return (
            <circle key={`marker-${fret}`} cx={x} cy={centerY} r={4} className={styles.marker} />
          )
        })}

        {/* Frets */}
        {Array.from({ length: FRET_COUNT }, (_, i) => i + 1).map(fret => (
          <line
            key={`fret-${fret}`}
            x1={PADDING_LEFT + NUT_WIDTH + fret * FRET_WIDTH}
            y1={PADDING_TOP - 8}
            x2={PADDING_LEFT + NUT_WIDTH + fret * FRET_WIDTH}
            y2={PADDING_TOP + (STRING_COUNT - 1) * STRING_SPACING + 8}
            className={styles.fret}
          />
        ))}

        {/* Strings */}
        {LAP_STEEL_TUNING.map((_, string) => (
          <line
            key={`string-${string}`}
            x1={PADDING_LEFT}
            y1={stringY(string)}
            x2={PADDING_LEFT + NUT_WIDTH + FRET_COUNT * FRET_WIDTH}
            y2={stringY(string)}
            className={styles.string}
            style={{ strokeWidth: 1 + (STRING_COUNT - 1 - string) * 0.3 }}
          />
        ))}

        {/* String labels (tuning notes) */}
        {LAP_STEEL_TUNING.map((note, string) => (
          <text
            key={`label-${string}`}
            x={PADDING_LEFT - 8}
            y={stringY(string)}
            className={styles.stringLabel}
          >
            {note}
          </text>
        ))}

        {/* Fret numbers */}
        {[0, 3, 5, 7, 9, 12, 15, 17, 19, 21, 24].map(fret => (
          <text
            key={`fretnum-${fret}`}
            x={fretX(fret)}
            y={PADDING_TOP + (STRING_COUNT - 1) * STRING_SPACING + 24}
            className={styles.fretNumber}
          >
            {fret}
          </text>
        ))}

        {/* Dyad highlights */}
        {visibleDyads.map((dyad, index) => {
          const x1 = fretX(dyad.pos1.fret)
          const y1 = stringY(dyad.pos1.string)
          const x2 = fretX(dyad.pos2.fret)
          const y2 = stringY(dyad.pos2.string)
          const isHovered = hoveredDyad === dyad
          const sourceClass = getSourceClass(dyad.source)

          return (
            <g
              key={`dyad-${index}`}
              className={`${styles.dyad} ${styles[dyad.type]} ${sourceClass} ${isHovered ? styles.hovered : ''}`}
              onMouseEnter={() => setHoveredDyad(dyad)}
              onMouseLeave={() => setHoveredDyad(null)}
            >
              {/* Connection line */}
              <line
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                className={styles.dyadLine}
              />
              {/* Note dots */}
              <circle cx={x1} cy={y1} r={8} className={styles.dyadDot} />
              <circle cx={x2} cy={y2} r={8} className={styles.dyadDot} />
              {/* Note labels */}
              <text x={x1} y={y1} className={styles.dyadNote}>{dyad.pos1.note}</text>
              <text x={x2} y={y2} className={styles.dyadNote}>{dyad.pos2.note}</text>
              {/* Lever indicators */}
              {dyad.leverPositions?.includes(1) && (
                <text x={x1} y={y1 - 12} className={styles.leverIndicator}>L</text>
              )}
              {dyad.leverPositions?.includes(2) && (
                <text x={x2} y={y2 - 12} className={styles.leverIndicator}>L</text>
              )}
            </g>
          )
        })}
      </svg>

      {/* Hover info */}
      {hoveredDyad && (
        <div className={styles.info}>
          <span className={styles.infoNotes}>
            {hoveredDyad.pos1.note}–{hoveredDyad.pos2.note}
          </span>
          <span className={styles.infoInterval}>{hoveredDyad.intervalName}</span>
          <span className={styles.infoType}>{hoveredDyad.type}</span>
          <span className={styles.infoFrets}>
            fret {hoveredDyad.pos1.fret}
            {hoveredDyad.type === 'slant' && `–${hoveredDyad.pos2.fret}`}
          </span>
          {hoveredDyad.source === 'lever' && (
            <span className={styles.infoSource}>lever</span>
          )}
          {hoveredDyad.substitutionInfo && (
            <span className={hoveredDyad.source === 'tritone-sub' ? styles.infoTritone : styles.infoSub}>
              {hoveredDyad.substitutionInfo.substituteChord} ({hoveredDyad.substitutionInfo.substituteDegree})
            </span>
          )}
        </div>
      )}
    </div>
  )
}

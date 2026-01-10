import { useMemo, useState, useCallback } from 'react'
import { FRET_COUNT, FRET_MARKERS, DOUBLE_MARKERS } from '../lib/fretboard'
import { Dyad } from '../lib/dyads'
import { NoteName } from '../lib/music'
import { playDyad, resumeAudio } from '../lib/audio'
import styles from './Fretboard.module.css'

interface FretboardProps {
  dyads: Dyad[]
  tuning: NoteName[]
  showStraight: boolean
  showSlant: boolean
}

// SVG dimensions and layout - base values
const FRET_WIDTH = 48
const STRING_SPACING = 28
const NUT_WIDTH = 4
const PADDING_LEFT = 40
const PADDING_TOP = 30
const PADDING_BOTTOM = 20

const TOTAL_WIDTH = PADDING_LEFT + NUT_WIDTH + (FRET_COUNT * FRET_WIDTH) + 20

// Calculate X position for a fret (on the fret line - lap steel bar placement)
function fretX(fret: number): number {
  if (fret === 0) {
    return PADDING_LEFT + NUT_WIDTH / 2  // Open string at nut
  }
  return PADDING_LEFT + NUT_WIDTH + (fret * FRET_WIDTH)  // On the fret line
}

// Calculate Y position for a string
function stringY(string: number, stringCount: number): number {
  // String 0 (lowest) at bottom, highest string at top
  return PADDING_TOP + ((stringCount - 1 - string) * STRING_SPACING)
}

// Calculate total height based on string count
function getTotalHeight(stringCount: number): number {
  return PADDING_TOP + ((stringCount - 1) * STRING_SPACING) + PADDING_BOTTOM
}

export function Fretboard({ dyads, tuning, showStraight, showSlant }: FretboardProps) {
  const [hoveredDyad, setHoveredDyad] = useState<Dyad | null>(null)

  // Handle dyad click to play sound
  const handleDyadClick = useCallback((dyad: Dyad) => {
    resumeAudio()
    playDyad(
      dyad.pos1.note,
      dyad.pos1.string,
      dyad.pos1.fret,
      dyad.pos2.note,
      dyad.pos2.string,
      dyad.pos2.fret
    )
  }, [])

  // Filter dyads based on visibility toggles
  const visibleDyads = useMemo(() => {
    return dyads.filter(d => {
      if (d.type === 'straight' && !showStraight) return false
      if (d.type === 'slant' && !showSlant) return false
      return true
    })
  }, [dyads, showStraight, showSlant])

  const stringCount = tuning.length
  const totalHeight = getTotalHeight(stringCount)

  return (
    <div className={styles.container}>
      <svg
        viewBox={`0 0 ${TOTAL_WIDTH} ${totalHeight}`}
        className={styles.svg}
        preserveAspectRatio="xMinYMid meet"
      >
        {/* Fretboard background */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 10}
          width={NUT_WIDTH + FRET_COUNT * FRET_WIDTH}
          height={(stringCount - 1) * STRING_SPACING + 20}
          className={styles.board}
        />

        {/* Nut */}
        <rect
          x={PADDING_LEFT}
          y={PADDING_TOP - 8}
          width={NUT_WIDTH}
          height={(stringCount - 1) * STRING_SPACING + 16}
          className={styles.nut}
        />

        {/* Fret markers (dots) */}
        {FRET_MARKERS.map(fret => {
          const x = PADDING_LEFT + NUT_WIDTH + ((fret - 0.5) * FRET_WIDTH)
          const isDouble = DOUBLE_MARKERS.includes(fret)
          const centerY = PADDING_TOP + ((stringCount - 1) * STRING_SPACING) / 2

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
            y2={PADDING_TOP + (stringCount - 1) * STRING_SPACING + 8}
            className={styles.fret}
          />
        ))}

        {/* Strings */}
        {tuning.map((_, string) => (
          <line
            key={`string-${string}`}
            x1={PADDING_LEFT}
            y1={stringY(string, stringCount)}
            x2={PADDING_LEFT + NUT_WIDTH + FRET_COUNT * FRET_WIDTH}
            y2={stringY(string, stringCount)}
            className={styles.string}
            style={{ strokeWidth: 1 + (stringCount - 1 - string) * 0.3 }}
          />
        ))}

        {/* String labels (tuning notes) */}
        {tuning.map((note, string) => (
          <text
            key={`label-${string}`}
            x={PADDING_LEFT - 8}
            y={stringY(string, stringCount)}
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
            y={PADDING_TOP + (stringCount - 1) * STRING_SPACING + 24}
            className={styles.fretNumber}
          >
            {fret}
          </text>
        ))}

        {/* Dyad highlights */}
        {visibleDyads.map((dyad, index) => {
          const x1 = fretX(dyad.pos1.fret)
          const y1 = stringY(dyad.pos1.string, stringCount)
          const x2 = fretX(dyad.pos2.fret)
          const y2 = stringY(dyad.pos2.string, stringCount)
          const isHovered = hoveredDyad === dyad

          return (
            <g
              key={`dyad-${index}`}
              className={`${styles.dyad} ${styles[dyad.type]} ${isHovered ? styles.hovered : ''}`}
              onMouseEnter={() => setHoveredDyad(dyad)}
              onMouseLeave={() => setHoveredDyad(null)}
              onClick={() => handleDyadClick(dyad)}
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
        </div>
      )}
    </div>
  )
}

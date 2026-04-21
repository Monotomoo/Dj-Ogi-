import { useEffect, useRef, useState } from 'react'
import { useAudioStore } from '../../stores/audioStore'

const MAX_ENERGY = 100
const TICK_MS = 200
const FULL_THRESHOLD = 100

interface CrowdMeterProps {
  onFloorDestroyed: () => void
}

/**
 * HARD MODE — Fills based on mix-quality heuristics.
 *
 * To hit 100 from 10, it takes **~45-55 seconds of sustained perfect mixing**:
 *   - Both decks playing
 *   - BPMs within 3%
 *   - Crossfader in the mix zone (0.25–0.75)
 *   - 1-2 FX active (not more — too much = penalty)
 *   - Actively moving EQ / filter on at least one deck
 *   - Maintaining all this uninterrupted (streak bonus builds over 20s)
 *
 * If ANY condition drops: gain slows or the meter drains.
 * If nothing is playing: fast drain.
 * If user just plays one deck and walks away: 0 gain, slow drain — won't trickle up.
 */
export default function CrowdMeter({ onFloorDestroyed }: CrowdMeterProps) {
  const [energy, setEnergy] = useState(10)

  const onFloorDestroyedRef = useRef(onFloorDestroyed)
  useEffect(() => { onFloorDestroyedRef.current = onFloorDestroyed }, [onFloorDestroyed])

  const steadyCountRef = useRef(0)

  useEffect(() => {
    const interval = setInterval(() => {
      const state = useAudioStore.getState()
      const { deckA, deckB, crossfader } = state

      const aPlaying = deckA.isPlaying
      const bPlaying = deckB.isPlaying
      const bothPlaying = aPlaying && bPlaying
      const anyPlaying = aPlaying || bPlaying

      // Constant drain — you must actively earn points against it
      let delta = -0.2

      if (!anyPlaying) {
        // Walked away? Drain hard.
        delta = -1.5
        steadyCountRef.current = 0
      } else if (!bothPlaying) {
        // Only one deck playing — barely counteracts the baseline drain
        delta += 0.2 // net ≈ 0, meter holds but doesn't climb
        steadyCountRef.current = Math.max(0, steadyCountRef.current - 1)
      } else {
        // Both decks playing: real opportunity to score
        delta += 0.12

        // BPM match — tight threshold (3%)
        const bpmRatio = Math.min(deckA.bpm, deckB.bpm) / Math.max(deckA.bpm, deckB.bpm)
        if (bpmRatio > 0.97) delta += 0.14
        else if (bpmRatio > 0.93) delta += 0.04 // tiny partial credit
        // Otherwise no BPM bonus — drives user to SYNC

        // Crossfader in "actually mixing" zone
        if (crossfader > 0.25 && crossfader < 0.75) delta += 0.15
        else if (crossfader > 0.1 && crossfader < 0.9) delta += 0.04

        // FX used TASTEFULLY (1-2 = good, 3+ = too much, 4+ = penalty)
        const fxCountA = Number(deckA.fxEcho) + Number(deckA.fxFlanger) + Number(deckA.fxBitcrush) + Number(deckA.fxGate)
        const fxCountB = Number(deckB.fxEcho) + Number(deckB.fxFlanger) + Number(deckB.fxBitcrush) + Number(deckB.fxGate)
        const totalFX = fxCountA + fxCountB
        if (totalFX === 1 || totalFX === 2) delta += 0.06
        else if (totalFX === 3) delta -= 0.02
        else if (totalFX >= 4) delta -= 0.25

        // Active EQ/filter use (DJ "working" the mix)
        const activeA = Math.abs(deckA.eqLow) + Math.abs(deckA.eqMid) + Math.abs(deckA.eqHi) + Math.abs(deckA.filter)
        const activeB = Math.abs(deckB.eqLow) + Math.abs(deckB.eqMid) + Math.abs(deckB.eqHi) + Math.abs(deckB.filter)
        if (activeA > 0.3) delta += 0.04
        if (activeB > 0.3) delta += 0.04

        // Streak — builds slowly, caps at +0.12 after 100 ticks (20s sustained)
        steadyCountRef.current = Math.min(steadyCountRef.current + 1, 120)
        delta += Math.min(steadyCountRef.current * 0.0012, 0.12)
      }

      setEnergy((prev) => {
        const next = Math.max(0, Math.min(MAX_ENERGY + 10, prev + delta))
        if (prev < FULL_THRESHOLD && next >= FULL_THRESHOLD) {
          onFloorDestroyedRef.current()
          steadyCountRef.current = 0
          return 15 // reset harsh
        }
        return Math.min(next, MAX_ENERGY)
      })
    }, TICK_MS)

    return () => clearInterval(interval)
  }, [])

  const pct = (energy / MAX_ENERGY) * 100
  const color = pct < 40 ? '#00ffcc' : pct < 70 ? '#ffcc00' : '#ff003c'
  const colorRgb = pct < 40 ? '0,255,204' : pct < 70 ? '255,204,0' : '255,0,60'

  const BAR_COUNT = 20
  const litBars = Math.round((pct / 100) * BAR_COUNT)

  return (
    <div className="flex flex-col items-center h-full justify-center px-2 py-2 gap-2"
      style={{ minWidth: 48 }}>
      <div className="font-vhs text-[7px] text-white/30 tracking-[0.3em] text-center">CROWD</div>

      <div className="flex flex-col-reverse gap-[2px]" style={{ flex: 1 }}>
        {Array.from({ length: BAR_COUNT }).map((_, i) => {
          const isLit = i < litBars
          const barRgb = i < BAR_COUNT * 0.4 ? '0,255,204' : i < BAR_COUNT * 0.7 ? '255,204,0' : '255,0,60'
          return (
            <div key={i}
              className="w-6 rounded-sm transition-all duration-100"
              style={{
                height: 5,
                background: isLit
                  ? `linear-gradient(90deg, rgba(${barRgb},0.8), rgba(${barRgb},1))`
                  : 'rgba(255,255,255,0.04)',
                boxShadow: isLit ? `0 0 6px rgba(${barRgb},0.6)` : 'none',
                opacity: isLit ? 1 : 0.4,
              }} />
          )
        })}
      </div>

      <div className="font-vhs text-[9px] tabular-nums"
        style={{
          color,
          textShadow: pct > 70 ? `0 0 8px rgba(${colorRgb},0.8)` : 'none',
        }}>
        {Math.round(pct)}
      </div>
    </div>
  )
}

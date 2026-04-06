import { useRef, useEffect, useMemo } from 'react'
import seedrandom from 'seedrandom'
import { useAudioStore } from '../../stores/audioStore'
import type { DeckId } from '../../lib/audio/soundcloudManager'

interface WaveformDisplayProps {
  deckId: DeckId
  position: number // 0-1
}

const BAR_COUNT = 100

export default function WaveformDisplay({ deckId, position }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackTitle = useAudioStore((s) => deckId === 'A' ? s.deckA.trackTitle : s.deckB.trackTitle)

  // Generate deterministic waveform data from track title
  const waveformData = useMemo(() => {
    const rng = seedrandom(trackTitle || `deck-${deckId}-default`)
    const data: number[] = []
    for (let i = 0; i < BAR_COUNT; i++) {
      // Simulate realistic waveform with envelope
      const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.3 + 0.3
      const noise = rng() * 0.7
      data.push(envelope + noise * (1 - envelope * 0.5))
    }
    return data
  }, [trackTitle, deckId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const barWidth = w / BAR_COUNT
    const playheadX = position * w

    ctx.clearRect(0, 0, w, h)

    // Draw bars
    for (let i = 0; i < BAR_COUNT; i++) {
      const x = i * barWidth
      const barH = waveformData[i] * h * 0.8
      const isPast = x < playheadX

      if (isPast) {
        ctx.fillStyle = deckId === 'A'
          ? 'rgba(0, 255, 204, 0.7)'
          : 'rgba(255, 0, 60, 0.7)'
      } else {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)'
      }

      const y = (h - barH) / 2
      ctx.fillRect(x + 0.5, y, barWidth - 1, barH)
    }

    // Playhead line
    if (position > 0) {
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, h)
      ctx.stroke()
    }
  }, [position, waveformData, deckId])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-12 rounded bg-black/50"
    />
  )
}

import { useRef, useEffect, useMemo } from 'react'
import seedrandom from 'seedrandom'
import { useAudioStore } from '../../stores/audioStore'
import type { DeckId } from '../../lib/audio/soundcloudManager'

interface WaveformDisplayProps {
  deckId: DeckId
  position: number
}

const BAR_COUNT = 120

export default function WaveformDisplay({ deckId, position }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackTitle = useAudioStore((s) => deckId === 'A' ? s.deckA.trackTitle : s.deckB.trackTitle)
  const isPlaying = useAudioStore((s) => deckId === 'A' ? s.deckA.isPlaying : s.deckB.isPlaying)

  const isA = deckId === 'A'
  const colorPlayed = isA ? [0, 255, 204] : [255, 0, 60]

  const waveformData = useMemo(() => {
    const rng = seedrandom(trackTitle || `deck-${deckId}-default`)
    const data: number[] = []
    for (let i = 0; i < BAR_COUNT; i++) {
      const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.35 + 0.3
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
    const [r, g, b] = colorPlayed

    ctx.clearRect(0, 0, w, h)

    // Draw bars
    for (let i = 0; i < BAR_COUNT; i++) {
      const x = i * barWidth
      const barH = waveformData[i] * h * 0.85
      const y = (h - barH) / 2
      const isPast = x < playheadX
      const progress = x / w

      if (isPast) {
        // Gradient from bright to slightly dimmer as it recedes
        const brightness = 0.5 + 0.5 * (x / playheadX)
        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`

        // Add glow on playing bars near playhead
        if (isPlaying && x > playheadX - 30) {
          ctx.shadowColor = `rgba(${r},${g},${b},0.8)`
          ctx.shadowBlur = 8
        } else {
          ctx.shadowBlur = 0
        }
      } else {
        // Future bars — dim, slight color tint in back half
        const tint = progress > 0.5 ? 0.06 : 0.03
        ctx.fillStyle = `rgba(${r},${g},${b},${tint})`
        ctx.shadowBlur = 0
        // Overlay white
        ctx.fillStyle = `rgba(255,255,255,${0.07 + waveformData[i] * 0.05})`
      }

      ctx.fillRect(x + 0.5, y, Math.max(barWidth - 1.5, 1), barH)
      ctx.shadowBlur = 0
    }

    // Playhead
    if (position > 0) {
      // Glow
      ctx.shadowColor = `rgba(${r},${g},${b},1)`
      ctx.shadowBlur = 12
      ctx.strokeStyle = `rgba(${r},${g},${b},1)`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, h)
      ctx.stroke()
      ctx.shadowBlur = 0

      // White highlight on playhead
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, h)
      ctx.stroke()
    }

    // Center line (axis)
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()

  }, [position, waveformData, deckId, isPlaying, colorPlayed])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.5)' }}
    />
  )
}

import { useRef, useEffect, useState } from 'react'
import seedrandom from 'seedrandom'
import { useAudioStore } from '../../stores/audioStore'
import { audioManager, type DeckId } from '../../lib/audio/audioManager'

interface WaveformDisplayProps {
  deckId: DeckId
  position: number
}

const BAR_COUNT = 120

export default function WaveformDisplay({ deckId, position }: WaveformDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const trackUrl = useAudioStore((s) => deckId === 'A' ? s.deckA.trackUrl : s.deckB.trackUrl)
  const trackTitle = useAudioStore((s) => deckId === 'A' ? s.deckA.trackTitle : s.deckB.trackTitle)
  const isPlaying = useAudioStore((s) => deckId === 'A' ? s.deckA.isPlaying : s.deckB.isPlaying)
  const isReady = useAudioStore((s) => deckId === 'A' ? s.deckA.isReady : s.deckB.isReady)

  const isA = deckId === 'A'
  const colorPlayed = isA ? [0, 255, 204] : [255, 0, 60]

  // Real PCM peaks (fetched after track loads) OR seeded fallback until ready
  const [peaks, setPeaks] = useState<number[]>([])
  const [usingRealPeaks, setUsingRealPeaks] = useState(false)

  // Fallback seeded waveform for loading state / SC tracks
  useEffect(() => {
    if (peaks.length > 0) return // already have data
    const rng = seedrandom(trackTitle || `deck-${deckId}-default`)
    const data: number[] = []
    for (let i = 0; i < BAR_COUNT; i++) {
      const envelope = Math.sin((i / BAR_COUNT) * Math.PI) * 0.35 + 0.3
      const noise = rng() * 0.7
      data.push(envelope + noise * (1 - envelope * 0.5))
    }
    setPeaks(data)
  }, [trackTitle, deckId, peaks.length])

  // Fetch real PCM peaks once the track is ready (self-hosted audio only — skip SC URLs)
  useEffect(() => {
    if (!isReady || !trackUrl) return
    // Only decode local/R2 URLs, not SC page URLs (SC page URLs can't be fetched+decoded)
    if (trackUrl.includes('soundcloud.com')) { setUsingRealPeaks(false); return }
    let cancelled = false

    audioManager.getWaveformPeaks(deckId, BAR_COUNT).then((realPeaks) => {
      if (cancelled || !realPeaks) return
      // Normalize to 0-1 range, boost lower values so visualization has presence
      const max = Math.max(...realPeaks, 0.001)
      const normalized = realPeaks.map(p => Math.min(1, (p / max) * 0.9 + 0.1))
      setPeaks(normalized)
      setUsingRealPeaks(true)
    })

    return () => { cancelled = true }
    // isRemote is derived, we only care about trackUrl changes
  }, [isReady, trackUrl, deckId])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || peaks.length === 0) return
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

    for (let i = 0; i < BAR_COUNT; i++) {
      const x = i * barWidth
      const barH = peaks[i] * h * 0.85
      const y = (h - barH) / 2
      const isPast = x < playheadX

      if (isPast) {
        const brightness = 0.5 + 0.5 * (x / playheadX)
        ctx.fillStyle = `rgba(${r},${g},${b},${brightness})`
        if (isPlaying && x > playheadX - 30) {
          ctx.shadowColor = `rgba(${r},${g},${b},0.8)`
          ctx.shadowBlur = 8
        } else {
          ctx.shadowBlur = 0
        }
      } else {
        ctx.shadowBlur = 0
        ctx.fillStyle = `rgba(255,255,255,${0.07 + peaks[i] * 0.05})`
      }

      ctx.fillRect(x + 0.5, y, Math.max(barWidth - 1.5, 1), barH)
      ctx.shadowBlur = 0
    }

    if (position > 0) {
      ctx.shadowColor = `rgba(${r},${g},${b},1)`
      ctx.shadowBlur = 12
      ctx.strokeStyle = `rgba(${r},${g},${b},1)`
      ctx.lineWidth = 1.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, h)
      ctx.stroke()
      ctx.shadowBlur = 0

      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(playheadX, 0)
      ctx.lineTo(playheadX, h)
      ctx.stroke()
    }

    ctx.strokeStyle = 'rgba(255,255,255,0.04)'
    ctx.lineWidth = 0.5
    ctx.beginPath()
    ctx.moveTo(0, h / 2)
    ctx.lineTo(w, h / 2)
    ctx.stroke()
  }, [position, peaks, isPlaying, colorPlayed])

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-16 rounded-xl"
      style={{ background: 'rgba(0,0,0,0.5)' }}
      data-real-peaks={usingRealPeaks ? 'true' : 'false'}
    />
  )
}

import { useEffect, useRef } from 'react'
import { audioManager } from '../../lib/audio/audioManager'
import { useAudioStore } from '../../stores/audioStore'

/**
 * Real FFT frequency spectrum of the master output.
 * 64 bars, cyan→red gradient based on frequency.
 * Only animates when at least one deck is playing — otherwise idle (0% CPU).
 */
export default function FFTSpectrum() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isAnyPlaying = useAudioStore((s) => s.isAnyPlaying)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Fixed-size Uint8Array for FFT data (fftSize=128 → 64 bins)
    const BAR_COUNT = 64
    const freqData = new Uint8Array(BAR_COUNT)

    // Setup canvas DPR
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      const dpr = window.devicePixelRatio || 1
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      const ctx = canvas.getContext('2d')
      if (ctx) ctx.scale(dpr, dpr)
    }
    resize()
    window.addEventListener('resize', resize)

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const draw = () => {
      const rect = canvas.getBoundingClientRect()
      const w = rect.width
      const h = rect.height

      ctx.clearRect(0, 0, w, h)

      const ok = audioManager.getFrequencyData(freqData)
      if (!ok) { rafRef.current = 0; return }

      const barWidth = w / BAR_COUNT
      for (let i = 0; i < BAR_COUNT; i++) {
        const v = freqData[i] / 255 // 0..1
        const barH = v * h * 0.9
        const x = i * barWidth
        const y = h - barH

        // Color: cyan at low-mid, white at mid-high, red at top
        // hue gradient: 160 (cyan) → 0 (red)
        const t = i / BAR_COUNT
        const hue = 180 - t * 180
        const sat = 80
        const light = 45 + v * 20
        const alpha = 0.3 + v * 0.7
        ctx.fillStyle = `hsla(${hue}, ${sat}%, ${light}%, ${alpha})`

        ctx.fillRect(x + 1, y, Math.max(barWidth - 2, 1), barH)

        // Peak highlight cap
        if (v > 0.05) {
          ctx.fillStyle = `hsla(${hue}, 90%, 80%, ${v})`
          ctx.fillRect(x + 1, y, Math.max(barWidth - 2, 1), 2)
        }
      }

      // Baseline
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'
      ctx.lineWidth = 0.5
      ctx.beginPath()
      ctx.moveTo(0, h - 0.5)
      ctx.lineTo(w, h - 0.5)
      ctx.stroke()

      rafRef.current = requestAnimationFrame(draw)
    }

    if (isAnyPlaying) {
      rafRef.current = requestAnimationFrame(draw)
    } else {
      // Draw one frame to show the idle state
      draw()
    }

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [isAnyPlaying])

  return (
    <div className="w-full h-10 rounded-lg overflow-hidden relative"
      style={{
        background: 'linear-gradient(180deg, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.3) 100%)',
        border: '1px solid rgba(255,255,255,0.04)',
      }}>
      <canvas ref={canvasRef} className="w-full h-full" />
      {/* Scan lines overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 3px)' }} />
      {/* Label */}
      <div className="absolute top-1 left-2 font-vhs text-[6px] text-white/20 tracking-[0.3em]">SPECTRUM</div>
    </div>
  )
}

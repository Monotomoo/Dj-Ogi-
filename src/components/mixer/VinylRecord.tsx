import { useRef, useEffect, useState, useCallback } from 'react'
import { audioManager, type DeckId } from '../../lib/audio/audioManager'

interface VinylRecordProps {
  isPlaying: boolean
  color: string
  /** If provided, enables scratch mode (drag to scratch). */
  deckId?: DeckId
}

export default function VinylRecord({ isPlaying, color, deckId }: VinylRecordProps) {
  const rotationRef = useRef(0)
  const animRef = useRef<number>(0)
  const discRef = useRef<HTMLDivElement>(null)
  const [isScratching, setIsScratching] = useState(false)
  const lastXRef = useRef(0)
  const scratchSpeedRef = useRef(0) // deg/frame, used when scratching for visual rotation

  // Visual rotation loop
  useEffect(() => {
    const animate = () => {
      if (isScratching) {
        // Scratch mode: use the latest scratch speed directly
        rotationRef.current += scratchSpeedRef.current
        // Decay the visual speed when user stops moving
        scratchSpeedRef.current *= 0.92
      } else if (isPlaying) {
        rotationRef.current += 1.2 // ~33 RPM feel
      }
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotationRef.current}deg)`
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, isScratching])

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!deckId) return
    e.preventDefault()
    e.currentTarget.setPointerCapture(e.pointerId)
    setIsScratching(true)
    lastXRef.current = e.clientX
    scratchSpeedRef.current = 0
    audioManager.scratchStart(deckId)
  }, [deckId])

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!deckId || !isScratching) return
    const dx = e.clientX - lastXRef.current
    lastXRef.current = e.clientX
    // Blend new velocity with previous for smoother feel
    scratchSpeedRef.current = dx * 1.8 // visual rotation speed
    audioManager.scratchMove(deckId, Math.abs(dx))
  }, [deckId, isScratching])

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!deckId) return
    try { e.currentTarget.releasePointerCapture(e.pointerId) } catch { /* ignore */ }
    setIsScratching(false)
    audioManager.scratchEnd(deckId)
  }, [deckId])

  const isDraggable = !!deckId

  return (
    <div className="relative w-20 h-20 flex-shrink-0">
      {/* Glow when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-30"
          style={{ background: color }}
        />
      )}

      {/* Vinyl disc */}
      <div
        ref={discRef}
        className="relative w-20 h-20 rounded-full bg-[#111] border border-white/[0.08]"
        onPointerDown={isDraggable ? handlePointerDown : undefined}
        onPointerMove={isDraggable ? handlePointerMove : undefined}
        onPointerUp={isDraggable ? handlePointerUp : undefined}
        onPointerCancel={isDraggable ? handlePointerUp : undefined}
        style={{
          background: `
            radial-gradient(circle at 50% 50%,
              #222 0%, #111 15%, #0a0a0a 16%,
              #111 30%, #0a0a0a 31%,
              #0d0d0d 45%, #0a0a0a 46%,
              #0c0c0c 60%, #0a0a0a 61%,
              #0b0b0b 75%, #0a0a0a 76%,
              #111 90%, #0a0a0a 100%
            )
          `,
          cursor: isDraggable ? (isScratching ? 'grabbing' : 'grab') : 'default',
          touchAction: isDraggable ? 'none' : 'auto',
          boxShadow: isScratching ? `0 0 18px ${color}` : 'none',
          transition: 'box-shadow 0.2s',
        }}
        title={isDraggable ? 'Click + drag to scratch' : undefined}
      >
        {/* Center label */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, ${color}15 60%, transparent 100%)`,
            border: `1px solid ${color}30`,
          }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black border border-white/10" />
        </div>

        {/* Grooves */}
        {[35, 50, 65, 80].map((r) => (
          <div
            key={r}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] pointer-events-none"
            style={{ width: `${r}%`, height: `${r}%` }}
          />
        ))}
      </div>

      {/* Scratch indicator */}
      {isScratching && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 font-vhs text-[7px] tracking-[0.3em] pointer-events-none"
          style={{ color, textShadow: `0 0 6px ${color}` }}>
          SCRATCH
        </div>
      )}
    </div>
  )
}

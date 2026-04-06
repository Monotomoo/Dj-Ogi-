import { useRef, useEffect } from 'react'

interface VinylRecordProps {
  isPlaying: boolean
  color: string
  position: number
}

export default function VinylRecord({ isPlaying, color, position }: VinylRecordProps) {
  const rotationRef = useRef(0)
  const animRef = useRef<number>(0)
  const discRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const animate = () => {
      if (isPlaying) {
        rotationRef.current += 1.2 // ~33 RPM feel
      }
      if (discRef.current) {
        discRef.current.style.transform = `rotate(${rotationRef.current}deg)`
      }
      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying])

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
        }}
      >
        {/* Center label */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full"
          style={{
            background: `radial-gradient(circle, ${color}40 0%, ${color}15 60%, transparent 100%)`,
            border: `1px solid ${color}30`,
          }}
        >
          {/* Spindle hole */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-black border border-white/10" />
        </div>

        {/* Grooves (subtle lines) */}
        {[35, 50, 65, 80].map((r) => (
          <div
            key={r}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03]"
            style={{ width: `${r}%`, height: `${r}%` }}
          />
        ))}
      </div>

      {/* Progress ring */}
      <svg className="absolute inset-0 w-20 h-20 -rotate-90" viewBox="0 0 80 80">
        <circle
          cx="40" cy="40" r="38"
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          strokeDasharray={`${position * 238.76} 238.76`}
          opacity="0.4"
        />
      </svg>
    </div>
  )
}

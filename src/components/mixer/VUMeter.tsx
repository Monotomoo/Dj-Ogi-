import { useRef, useEffect } from 'react'

interface VUMeterProps {
  isPlaying: boolean
  volume: number
  color: string
}

const BAR_COUNT = 12

export default function VUMeter({ isPlaying, volume, color }: VUMeterProps) {
  const barsRef = useRef<(HTMLDivElement | null)[]>([])
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)
  const levelsRef = useRef<number[]>(new Array(BAR_COUNT).fill(0))

  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.05
      const levels = levelsRef.current

      for (let i = 0; i < BAR_COUNT; i++) {
        if (isPlaying) {
          const baseLevel = (volume / 100) * (1 - i / BAR_COUNT * 0.3)
          const noise = Math.sin(timeRef.current * (3 + i * 0.7)) * 0.3
            + Math.sin(timeRef.current * (5 + i * 1.3)) * 0.2
          levels[i] = Math.max(0, Math.min(1, baseLevel * (0.5 + noise * 0.5)))
        } else {
          levels[i] *= 0.92
        }

        const bar = barsRef.current[i]
        if (bar) {
          const height = Math.max(2, levels[i] * 100)
          const isHot = i >= BAR_COUNT - 3 && levels[i] > 0.7
          const barColor = isHot ? '#ff3333' : i >= BAR_COUNT - 3 ? '#ffcc00' : color
          bar.style.height = `${height}%`
          bar.style.background = `linear-gradient(to top, ${barColor}60, ${barColor})`
          bar.style.opacity = levels[i] > 0.05 ? '1' : '0.15'
        }
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, volume, color])

  return (
    <div className="flex gap-[2px] items-end h-16 flex-shrink-0">
      {Array.from({ length: BAR_COUNT }, (_, i) => (
        <div key={i} ref={el => { barsRef.current[i] = el }}
          className="w-[3px] rounded-sm"
          style={{ height: '2%', opacity: 0.15 }} />
      ))}
    </div>
  )
}

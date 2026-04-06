import { useRef, useEffect, useState } from 'react'

interface VUMeterProps {
  isPlaying: boolean
  volume: number // 0-100
  color: string
}

const BAR_COUNT = 12

export default function VUMeter({ isPlaying, volume, color }: VUMeterProps) {
  const [levels, setLevels] = useState<number[]>(new Array(BAR_COUNT).fill(0))
  const animRef = useRef<number>(0)
  const timeRef = useRef(0)

  useEffect(() => {
    const animate = () => {
      timeRef.current += 0.05

      if (isPlaying) {
        const newLevels = Array.from({ length: BAR_COUNT }, (_, i) => {
          const baseLevel = (volume / 100) * (1 - i / BAR_COUNT * 0.3)
          const noise = Math.sin(timeRef.current * (3 + i * 0.7)) * 0.3
            + Math.sin(timeRef.current * (5 + i * 1.3)) * 0.2
          return Math.max(0, Math.min(1, baseLevel * (0.5 + noise * 0.5)))
        })
        setLevels(newLevels)
      } else {
        setLevels((prev) => prev.map((l) => l * 0.92)) // decay
      }

      animRef.current = requestAnimationFrame(animate)
    }
    animRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying, volume])

  return (
    <div className="flex gap-[2px] items-end h-16 flex-shrink-0">
      {levels.map((level, i) => {
        const height = Math.max(2, level * 100)
        const isHot = i >= BAR_COUNT - 3 && level > 0.7
        const barColor = isHot ? '#ff3333' : i >= BAR_COUNT - 3 ? '#ffcc00' : color

        return (
          <div key={i} className="w-[3px] rounded-sm transition-all duration-75" style={{
            height: `${height}%`,
            background: `linear-gradient(to top, ${barColor}60, ${barColor})`,
            boxShadow: level > 0.5 ? `0 0 4px ${barColor}40` : 'none',
            opacity: level > 0.05 ? 1 : 0.15,
          }} />
        )
      })}
    </div>
  )
}

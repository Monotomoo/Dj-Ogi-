import { useRef, useState, useCallback } from 'react'
import { useAudioStore } from '../../stores/audioStore'
import type { DeckId } from '../../lib/audio/soundcloudManager'

interface FilterKnobProps {
  deckId: DeckId
  label: string
}

export default function FilterKnob({ deckId, label }: FilterKnobProps) {
  const filter = useAudioStore((s) => deckId === 'A' ? s.filterA : s.filterB)
  const setFilter = useAudioStore((s) => deckId === 'A' ? s.setFilterA : s.setFilterB)
  const knobRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const accentColor = deckId === 'A' ? '#00ffcc' : '#ff003c'

  // Map filter value (0-1) to rotation degrees (-150 to 150)
  const rotation = (filter - 0.5) * 300

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startY = e.clientY
    const startValue = filter

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = (startY - moveEvent.clientY) / 150
      const newValue = Math.max(0, Math.min(1, startValue + delta))
      setFilter(newValue)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
  }, [filter, setFilter])

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="font-vhs text-[9px] text-white/20 tracking-widest">{label}</div>
      <div
        ref={knobRef}
        onMouseDown={handleMouseDown}
        className={`w-10 h-10 rounded-full border border-white/20 bg-black/80 relative cursor-grab
          ${isDragging ? 'cursor-grabbing border-white/40' : 'hover:border-white/30'} transition-colors`}
        style={{
          boxShadow: isDragging ? `0 0 12px ${accentColor}30` : 'none',
        }}
      >
        {/* Knob indicator line */}
        <div
          className="absolute top-1 left-1/2 w-0.5 h-3 bg-white/60 rounded-full origin-bottom"
          style={{
            transform: `translateX(-50%) rotate(${rotation}deg)`,
            transformOrigin: '50% 250%',
          }}
        />
      </div>
      <div className="font-vhs text-[9px] text-white/15">
        {Math.round(filter * 100)}
      </div>
    </div>
  )
}

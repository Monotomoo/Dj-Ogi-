import { useRef, useState, useCallback, useEffect } from 'react'

interface KnobProps {
  /** Current value, bipolar -1..+1 */
  value: number
  /** Called with new value -1..+1 */
  onChange: (value: number) => void
  /** Label shown below knob */
  label: string
  /** Accent color for active state glow */
  color: string
  /** Size in pixels */
  size?: number
  /** Show numeric readout below label */
  showValue?: boolean
  /** Double-click target (default 0 = center) */
  defaultValue?: number
  /** How sensitive drag is — px to move from min to max */
  dragRange?: number
}

/**
 * Rotary knob with bipolar -1..+1 value.
 * Drag vertically (up = increase). Double-click to reset to default.
 * Visual indicator rotates -135° (at -1) to +135° (at +1). 0 = straight up.
 */
export default function Knob({
  value,
  onChange,
  label,
  color,
  size = 48,
  showValue = true,
  defaultValue = 0,
  dragRange = 180,
}: KnobProps) {
  const [isDragging, setIsDragging] = useState(false)
  const startYRef = useRef(0)
  const startValueRef = useRef(0)

  const clamped = Math.max(-1, Math.min(1, value))
  // -1 → -135°, 0 → 0°, +1 → +135°
  const rotation = clamped * 135

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    startYRef.current = e.clientY
    startValueRef.current = clamped
  }, [clamped])

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: MouseEvent) => {
      const delta = (startYRef.current - e.clientY) / (dragRange / 2) // -1..+1 full range over dragRange px
      const newValue = Math.max(-1, Math.min(1, startValueRef.current + delta))
      onChange(newValue)
    }
    const handleUp = () => setIsDragging(false)
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, onChange, dragRange])

  const handleDoubleClick = () => onChange(defaultValue)

  // Readout: show as bipolar -100..+100 or "0" at center
  const displayValue = Math.round(clamped * 100)

  // Ring dots — showing rotation range
  const ringColor = Math.abs(clamped) > 0.03 ? color : 'rgba(255,255,255,0.08)'

  return (
    <div className="flex flex-col items-center gap-1 select-none">
      <div className="font-vhs text-[8px] text-white/35 tracking-[0.3em]">{label}</div>
      <div
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: size,
          height: size,
        }}
        title="Drag up/down to adjust. Double-click to reset."
      >
        {/* Outer ring (decorative) */}
        <div className="absolute inset-0 rounded-full"
          style={{
            background: 'radial-gradient(circle at 30% 30%, #2a2a2e 0%, #111114 70%, #0a0a0c 100%)',
            border: `1px solid ${isDragging ? color : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isDragging
              ? `0 0 14px ${color}55, inset 0 1px 0 rgba(255,255,255,0.06)`
              : 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 6px rgba(0,0,0,0.5)',
            transition: 'box-shadow 0.2s, border-color 0.2s',
          }} />

        {/* Tick marks */}
        {[-135, -90, -45, 0, 45, 90, 135].map((deg) => (
          <div key={deg}
            className="absolute top-1/2 left-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${deg}deg) translateY(-${size / 2 + 2}px)`,
              width: 1,
              height: 3,
              background: deg === 0 ? color : 'rgba(255,255,255,0.15)',
              opacity: deg === 0 ? 0.6 : 1,
            }} />
        ))}

        {/* Indicator line */}
        <div className="absolute top-1/2 left-1/2 pointer-events-none"
          style={{
            width: 2,
            height: size * 0.38,
            background: `linear-gradient(to top, transparent, ${color})`,
            boxShadow: `0 0 6px ${color}`,
            transformOrigin: 'bottom center',
            transform: `translate(-50%, -100%) rotate(${rotation}deg)`,
            transition: isDragging ? 'none' : 'transform 0.08s linear',
          }} />

        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 rounded-full pointer-events-none"
          style={{
            transform: 'translate(-50%, -50%)',
            width: size * 0.25,
            height: size * 0.25,
            background: 'radial-gradient(circle, #1a1a1e 0%, #0a0a0e 100%)',
            border: `1px solid ${ringColor}`,
            boxShadow: Math.abs(clamped) > 0.03 ? `0 0 6px ${color}60` : 'none',
          }} />
      </div>
      {showValue && (
        <div className="font-vhs text-[8px] tabular-nums"
          style={{ color: Math.abs(clamped) > 0.03 ? color : 'rgba(255,255,255,0.2)' }}>
          {displayValue > 0 ? `+${displayValue}` : displayValue}
        </div>
      )}
    </div>
  )
}

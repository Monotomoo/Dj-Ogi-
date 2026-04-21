import { useEffect, useState } from 'react'

interface FloorDestroyedProps {
  trigger: number // increment to re-trigger
}

/** Full-screen glitch celebration when crowd meter hits 100. */
export default function FloorDestroyed({ trigger }: FloorDestroyedProps) {
  const [visible, setVisible] = useState(false)
  const [phase, setPhase] = useState<'strobe' | 'text' | 'fade' | 'done'>('done')

  useEffect(() => {
    if (trigger === 0) return
    setVisible(true)
    setPhase('strobe')

    const t1 = setTimeout(() => setPhase('text'), 300)
    const t2 = setTimeout(() => setPhase('fade'), 1800)
    const t3 = setTimeout(() => {
      setVisible(false)
      setPhase('done')
    }, 2600)

    return () => {
      clearTimeout(t1); clearTimeout(t2); clearTimeout(t3)
    }
  }, [trigger])

  if (!visible) return null

  return (
    <>
      {/* Strobe flash */}
      {phase === 'strobe' && (
        <div className="fixed inset-0 z-[99997] pointer-events-none"
          style={{
            background: 'white',
            animation: 'floorDestroyedStrobe 0.1s steps(1) infinite',
          }} />
      )}

      {/* Full-screen hype */}
      <div className="fixed inset-0 z-[99998] pointer-events-none flex items-center justify-center overflow-hidden"
        style={{
          background: phase === 'fade' ? 'transparent' : 'radial-gradient(ellipse at center, rgba(255,0,60,0.35) 0%, rgba(0,0,0,0.85) 60%)',
          transition: 'background 0.8s ease',
        }}>
        {/* RGB split text */}
        {(phase === 'text' || phase === 'fade') && (
          <div className="relative">
            <div className="absolute inset-0 font-vhs text-5xl md:text-8xl font-black tracking-widest text-center whitespace-nowrap"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #00ffcc',
                transform: 'translate(-5px, 2px)',
                opacity: phase === 'fade' ? 0 : 0.8,
                transition: 'opacity 0.5s ease',
              }}>
              FLOOR DESTROYED
            </div>
            <div className="absolute inset-0 font-vhs text-5xl md:text-8xl font-black tracking-widest text-center whitespace-nowrap"
              style={{
                color: 'transparent',
                WebkitTextStroke: '2px #ff003c',
                transform: 'translate(5px, -2px)',
                opacity: phase === 'fade' ? 0 : 0.8,
                transition: 'opacity 0.5s ease',
              }}>
              FLOOR DESTROYED
            </div>
            <div className="relative font-vhs text-5xl md:text-8xl font-black tracking-widest text-center whitespace-nowrap"
              style={{
                color: '#fff',
                textShadow: '0 0 30px #fff, 0 0 60px rgba(255,0,60,0.8)',
                animation: 'floorDestroyedShake 0.1s steps(3) infinite',
                opacity: phase === 'fade' ? 0 : 1,
                transition: 'opacity 0.5s ease',
              }}>
              FLOOR DESTROYED
            </div>
          </div>
        )}
      </div>
    </>
  )
}

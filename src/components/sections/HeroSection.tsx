import { useEffect, useRef, useState } from 'react'
import GlitchText from '../vhs/GlitchText'

const HEADLINES = [
  'HARD TECHNO',
  'RIJEKA, CROATIA',
  'SINCE 1995',
  '300+ TRACKS',
  'TECHNODROME',
  'BEAST MUSIC',
]

export default function HeroSection() {
  const [phase, setPhase] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [headlineVisible, setHeadlineVisible] = useState(true)
  const [timecode, setTimecode] = useState('00:00:00:00')
  const sectionRef = useRef<HTMLElement>(null)

  // Boot sequence
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []
    timers.push(setTimeout(() => setPhase(1), 400))
    timers.push(setTimeout(() => setPhase(2), 1200))
    timers.push(setTimeout(() => setPhase(3), 2000))
    timers.push(setTimeout(() => setPhase(4), 2800))
    return () => timers.forEach(clearTimeout)
  }, [])

  // Rotating headlines
  useEffect(() => {
    if (phase < 3) return
    const interval = setInterval(() => {
      setHeadlineVisible(false)
      setTimeout(() => {
        setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length)
        setHeadlineVisible(true)
      }, 400)
    }, 2500)
    return () => clearInterval(interval)
  }, [phase])

  // Running timecode
  useEffect(() => {
    if (phase < 4) return
    const start = Date.now()
    const interval = setInterval(() => {
      const elapsed = Date.now() - start
      const hrs = String(Math.floor(elapsed / 3600000)).padStart(2, '0')
      const mins = String(Math.floor((elapsed % 3600000) / 60000)).padStart(2, '0')
      const secs = String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')
      const frames = String(Math.floor((elapsed % 1000) / 33)).padStart(2, '0')
      setTimecode(`${hrs}:${mins}:${secs}:${frames}`)
    }, 33)
    return () => clearInterval(interval)
  }, [phase])

  const skipToReady = () => setPhase(4)

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section flex items-center justify-center relative bg-black"
    >
      {/* CRT Power-on */}
      <div
        className="absolute inset-0 bg-[#0a0a0a] transition-all duration-600 ease-out"
        style={{
          clipPath: phase >= 1 ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
        }}
      />

      {/* VHS Tracking bars */}
      {phase < 2 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full h-8 bg-white/5"
              style={{
                top: `${20 * i + 10}%`,
                animation: `trackingBar 0.8s ${i * 0.1}s linear infinite`,
              }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className={`relative z-10 text-center px-4 transition-opacity duration-500 ${phase >= 2 ? 'opacity-100' : 'opacity-0'}`}>
        {/* DJ OGI - massive, fills screen */}
        <GlitchText
          text="DJ OGI"
          as="h1"
          active={phase >= 4}
          className="font-vhs text-[18vw] md:text-[16vw] lg:text-[14vw] leading-[0.85] tracking-[0.15em] text-white"
        />

        {/* Rotating headline */}
        <div className="h-14 md:h-16 flex items-center justify-center mt-4 overflow-hidden">
          {phase >= 3 && (
            <div
              className={`font-vhs text-2xl md:text-3xl lg:text-4xl tracking-[0.25em] text-primary transition-all duration-300 ${
                headlineVisible
                  ? 'opacity-100 translate-y-0 blur-0'
                  : 'opacity-0 translate-y-4 blur-sm'
              }`}
            >
              {HEADLINES[headlineIndex]}
            </div>
          )}
        </div>

        {/* Thin separator line */}
        <div className={`mx-auto mt-4 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent transition-all duration-1000 ${phase >= 4 ? 'w-48 opacity-100' : 'w-0 opacity-0'}`} />

        {/* Scroll indicator */}
        <div className={`mt-10 transition-opacity duration-1000 ${phase >= 4 ? 'opacity-50' : 'opacity-0'}`}>
          <div className="font-vhs text-[10px] text-white/30 tracking-[0.5em] mb-3">SCROLL</div>
          <div className="w-px h-6 bg-white/15 mx-auto animate-pulse" />
        </div>
      </div>

      {/* REC indicator */}
      {phase >= 4 && (
        <div className="absolute top-5 left-5 flex items-center gap-2 font-vhs text-xs">
          <span className="rec-dot w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          <span className="text-accent/70">REC</span>
        </div>
      )}

      {/* Timecode */}
      {phase >= 4 && (
        <div className="absolute top-5 right-5 font-vhs text-xs text-white/25">
          {timecode}
        </div>
      )}

      {/* Skip */}
      {phase < 4 && phase > 0 && (
        <button
          onClick={skipToReady}
          className="absolute bottom-6 right-6 font-vhs text-[10px] text-white/20 hover:text-white/50 transition-colors tracking-widest"
        >
          SKIP &gt;&gt;
        </button>
      )}

      <style>{`
        @keyframes trackingBar {
          0% { transform: translateY(-100vh); }
          100% { transform: translateY(100vh); }
        }
      `}</style>
    </section>
  )
}

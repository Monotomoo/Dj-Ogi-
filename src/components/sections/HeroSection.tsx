import { useEffect, useRef, useState, useCallback } from 'react'

const HEADLINES = [
  'RIJEKA, CROATIA',
  'SINCE 1995',
  '300+ TRACKS',
  'LOVE PARADE BERLIN',
  'TECHNODROME',
  'BEAST MUSIC',
  '30 YEARS DEEP',
]

const BOOT_LINES = [
  'LOADING SYSTEM...',
  'VHS DECK // INIT',
  'AUDIO BUS // CONNECTED',
  'SOUNDCHECK // OK',
  'SIGNAL LOCKED',
]

// V1: font-vhs (VCR OSD Mono) — classic VHS monospace
// V2: Orbitron — geometric, futuristic, electronic
const HERO_FONT = "'Orbitron', sans-serif" // V2

export default function HeroSection() {
  const [phase, setPhase] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [headlineVisible, setHeadlineVisible] = useState(true)
  const [timecode, setTimecode] = useState('00:00:00:00')
  const [bootLine, setBootLine] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const sectionRef = useRef<HTMLElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  // Animated frequency bars in background
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || phase < 3) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    const barCount = 64
    const phases: number[] = Array.from({ length: barCount }, (_, i) => i * 0.15)

    const draw = (t: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const w = canvas.width / barCount
      for (let i = 0; i < barCount; i++) {
        const val = (Math.sin(t * 0.001 + phases[i]) * 0.5 + 0.5) *
                    (Math.sin(t * 0.0007 + i * 0.3) * 0.3 + 0.7)
        const h = val * canvas.height * 0.45
        const x = i * w
        const ratio = i / barCount
        const r = Math.round(ratio * 255)
        const g = Math.round((1 - ratio) * 255 * 0.8)
        const b = Math.round((1 - ratio) * 204 + ratio * 60)
        ctx.fillStyle = `rgba(${r},${g},${b},0.03)`
        ctx.fillRect(x, canvas.height - h, w - 1, h)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize) }
  }, [phase])

  // Boot sequence
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setPhase(1), 300))
    t.push(setTimeout(() => setPhase(2), 900))
    t.push(setTimeout(() => setBootLine(1), 1200))
    t.push(setTimeout(() => setBootLine(2), 1500))
    t.push(setTimeout(() => setBootLine(3), 1800))
    t.push(setTimeout(() => setBootLine(4), 2100))
    t.push(setTimeout(() => setPhase(3), 2600))
    t.push(setTimeout(() => setPhase(4), 3400))
    return () => t.forEach(clearTimeout)
  }, [])

  // Typewriter for "DJ OGI"
  useEffect(() => {
    if (phase < 3) return
    const full = 'DJ OGI'
    let i = 0
    const interval = setInterval(() => {
      i++
      setTypedText(full.slice(0, i))
      if (i >= full.length) clearInterval(interval)
    }, 80)
    return () => clearInterval(interval)
  }, [phase])

  // Cursor blink
  useEffect(() => {
    if (phase < 3) return
    const interval = setInterval(() => setShowCursor(p => !p), 530)
    return () => clearInterval(interval)
  }, [phase])

  // Rotating headlines
  useEffect(() => {
    if (phase < 4) return
    const interval = setInterval(() => {
      setHeadlineVisible(false)
      setTimeout(() => {
        setHeadlineIndex((prev) => (prev + 1) % HEADLINES.length)
        setHeadlineVisible(true)
      }, 400)
    }, 2800)
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

  const skipToReady = useCallback(() => {
    setPhase(4)
    setTypedText('DJ OGI')
    setBootLine(4)
  }, [])

  return (
    <section
      id="hero"
      ref={sectionRef}
      className="section flex items-center justify-center relative bg-black overflow-hidden"
    >
      {/* ── PORTRAIT BACKGROUND with eye emphasis ── */}
      <div className="absolute inset-0 z-0"
        style={{
          opacity: phase >= 3 ? 1 : 0,
          transition: 'opacity 2s ease',
        }}>
        {/* Base image — dark, desaturated, blue-tinted */}
        <img
          src="/gallery/portrait-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.22) saturate(0.3) contrast(1.2) hue-rotate(170deg)',
            objectPosition: 'center 25%',
          }}
          aria-hidden="true"
        />

        {/* Eye reveal — radial bright spot */}
        <div className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 40% 30% at 50% 30%, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)`,
          }} />

        {/* Bright eye layer — pulsing */}
        <img
          src="/gallery/portrait-hero.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none hero-eye-pulse"
          style={{
            filter: 'brightness(0.7) saturate(0.6) contrast(1.6) hue-rotate(160deg)',
            objectPosition: 'center 25%',
            maskImage: 'radial-gradient(ellipse 25% 14% at 50% 28%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 25% 14% at 50% 28%, black 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Cyan glow halo — breathing around the eyes */}
        <div className="absolute inset-0 pointer-events-none hero-eye-glow"
          style={{
            background: 'radial-gradient(ellipse 30% 18% at 50% 28%, rgba(0,255,204,0.15) 0%, transparent 100%)',
          }} />

        {/* VHS glitch bands — horizontal noise lines over the portrait */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[12, 27, 34, 58, 71, 83].map((top, i) => (
            <div key={i} className="absolute left-0 right-0 hero-glitch-band"
              style={{
                top: `${top}%`,
                height: `${1 + (i % 3)}px`,
                background: i % 2 === 0
                  ? 'linear-gradient(90deg, transparent 10%, rgba(0,255,204,0.07) 30%, rgba(255,0,60,0.05) 70%, transparent 90%)'
                  : 'rgba(255,255,255,0.02)',
                animationDelay: `${i * 1.3}s`,
              }} />
          ))}
        </div>

        {/* Falling data rain — matrix-style, very subtle */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden"
          style={{
            maskImage: 'radial-gradient(ellipse 50% 40% at 50% 35%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 50% 40% at 50% 35%, black 0%, transparent 100%)',
          }}>
          {[...Array(20)].map((_, i) => (
            <div key={i} className="absolute hero-data-drop font-vhs"
              style={{
                left: `${5 + (i * 4.7) % 90}%`,
                top: '-20px',
                fontSize: '9px',
                color: `rgba(0,255,204,${0.04 + (i % 5) * 0.015})`,
                animationDelay: `${(i * 0.7) % 5}s`,
                animationDuration: `${3 + (i % 4)}s`,
              }}>
              {['0', '1', 'A', 'F', '/', '\\', '|', '#', ':', '.'][i % 10]}
            </div>
          ))}
        </div>

        {/* Chromatic split flash — red/cyan edge bleeds that flicker */}
        <div className="absolute inset-0 pointer-events-none hero-chroma-flash"
          style={{
            boxShadow: 'inset 3px 0 20px rgba(0,255,204,0.04), inset -3px 0 20px rgba(255,0,60,0.04)',
          }} />

        {/* Bottom fade to black */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 75%, #000 100%)' }} />

        {/* Side vignettes */}
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
      </div>

      {/* Ambient frequency bars */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[1]" style={{ opacity: phase >= 3 ? 0.6 : 0, transition: 'opacity 1s ease' }} />

      {/* CRT Power-on circle wipe — fades out after boot to reveal portrait */}
      <div className="absolute inset-0 bg-[#0a0a0c] transition-all ease-out z-[2]"
        style={{
          clipPath: phase >= 1 ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          opacity: phase >= 3 ? 0 : 1,
          transitionDuration: phase >= 3 ? '1.5s' : '0.6s',
          pointerEvents: phase >= 3 ? 'none' : 'auto',
        }} />

      {/* VHS tracking bars during boot */}
      {phase >= 1 && phase < 3 && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-full" style={{
              height: `${3 + Math.random() * 4}px`,
              top: `${15 * i + 8}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              animation: `heroTrackingBar ${0.6 + i * 0.12}s ${i * 0.08}s linear infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Continuous scan line */}
      {phase >= 3 && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.06), transparent)',
              animation: 'heroScanLine 4s linear infinite',
            }} />
        </div>
      )}

      {/* Boot terminal */}
      {phase >= 2 && phase < 4 && (
        <div className="absolute top-16 left-6 md:left-10 z-20 space-y-1">
          {BOOT_LINES.slice(0, bootLine + 1).map((line, i) => (
            <div key={i} className="font-vhs text-[10px] tracking-widest"
              style={{
                color: i === bootLine ? 'rgba(0,255,204,0.6)' : 'rgba(0,255,204,0.2)',
                animation: 'bootFadeIn 0.3s ease',
              }}>
              {'>'} {line}
            </div>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <div className={`relative z-20 text-center px-4 transition-all duration-700 ${phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>

        {/* Date badge */}
        <div className={`transition-all duration-500 ${phase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-block px-4 py-1 rounded-full mb-6"
            style={{ border: '1px solid rgba(0,255,204,0.15)', background: 'rgba(0,255,204,0.04)' }}>
            <span className="font-vhs text-[10px] text-primary/60 tracking-[0.5em]">EST. 1995 // RIJEKA</span>
          </div>
        </div>

        {/* DJ OGI — V2: Orbitron, geometric, futuristic */}
        <h1 className="relative inline-block leading-[0.85]"
          style={{
            fontFamily: HERO_FONT,
            fontSize: 'clamp(4rem, 18vw, 14rem)',
            fontWeight: 900,
            letterSpacing: '0.06em',
            color: '#fff',
            textShadow: phase >= 4
              ? '0 0 60px rgba(0,255,204,0.2), 0 0 120px rgba(0,255,204,0.08)'
              : 'none',
            transition: 'text-shadow 1.5s ease',
          }}>
          {/* Red ghost (RGB split) */}
          <span className="absolute inset-0 pointer-events-none select-none" aria-hidden
            style={{
              fontFamily: HERO_FONT,
              color: 'transparent',
              textShadow: phase >= 4 ? '-3px 1px rgba(255,0,60,0.35)' : 'none',
              transition: 'text-shadow 0.5s ease',
            }}>
            {typedText}
          </span>
          {/* Cyan ghost */}
          <span className="absolute inset-0 pointer-events-none select-none" aria-hidden
            style={{
              fontFamily: HERO_FONT,
              color: 'transparent',
              textShadow: phase >= 4 ? '3px -1px rgba(0,255,204,0.35)' : 'none',
              transition: 'text-shadow 0.5s ease',
            }}>
            {typedText}
          </span>
          {/* Actual text */}
          {typedText}
          {/* Cursor during typing */}
          {phase === 3 && (
            <span className="text-primary" style={{ opacity: showCursor ? 1 : 0, fontFamily: "'VCR OSD Mono', monospace", fontSize: '0.6em' }}>_</span>
          )}
        </h1>

        {/* Underline glow */}
        <div className={`mx-auto mt-4 h-[2px] rounded-full transition-all duration-1000 ease-out ${phase >= 4 ? 'w-72 opacity-100' : 'w-0 opacity-0'}`}
          style={{ background: 'linear-gradient(90deg, transparent, #00ffcc, transparent)', boxShadow: '0 0 15px rgba(0,255,204,0.6)' }} />

        {/* Rotating headline */}
        <div className="h-16 md:h-20 flex items-center justify-center mt-5 overflow-hidden">
          {phase >= 4 && (
            <div className={`font-vhs text-2xl md:text-4xl lg:text-5xl tracking-[0.2em] transition-all duration-400 ${
              headlineVisible ? 'opacity-100 translate-y-0 blur-0' : 'opacity-0 translate-y-6 blur-sm'
            }`}
            style={{
              background: 'linear-gradient(135deg, #00ffcc 0%, #ffffff 50%, #ff003c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {HEADLINES[headlineIndex]}
            </div>
          )}
        </div>

        {/* Stats strip */}
        <div className={`flex items-center justify-center gap-6 md:gap-10 mt-2 transition-all duration-700 ${phase >= 4 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
          style={{ transitionDelay: '0.5s' }}>
          {[
            { val: '30+', label: 'YEARS' },
            { val: '80+', label: 'VINYL RECORDS' },
            { val: '5', label: 'LABELS' },
          ].map(({ val, label }) => (
            <div key={label} className="text-center">
              <div className="font-vhs text-xl md:text-2xl text-white/70">{val}</div>
              <div className="font-vhs text-[7px] text-white/15 tracking-[0.4em]">{label}</div>
            </div>
          ))}
        </div>

        {/* Scroll CTA */}
        <div className={`mt-14 transition-all duration-700 ${phase >= 4 ? 'opacity-60' : 'opacity-0'}`}
          style={{ transitionDelay: '1s' }}>
          <div className="font-vhs text-[9px] text-white/30 tracking-[0.6em] mb-3">SCROLL TO EXPLORE</div>
          <div className="flex flex-col items-center gap-1">
            <div className="w-4 h-7 rounded-full border border-white/15 flex items-start justify-center p-1">
              <div className="w-1 h-2 rounded-full bg-primary/50" style={{ animation: 'heroScrollDot 1.5s ease-in-out infinite' }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── HUD CORNERS ── */}
      {phase >= 4 && (
        <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
          <span className="rec-dot w-2 h-2 rounded-full bg-accent inline-block shadow-[0_0_8px_#ff003c]" />
          <span className="font-vhs text-[11px] text-accent/80 tracking-widest">REC</span>
        </div>
      )}

      {phase >= 4 && (
        <div className="absolute top-5 right-5 z-20 font-vhs text-[11px] text-white/30 tracking-wider tabular-nums">
          {timecode}
        </div>
      )}

      {phase >= 4 && (
        <div className="absolute bottom-5 left-5 z-20">
          <div className="font-vhs text-[8px] text-white/10 tracking-[0.4em]">CH-01 // 145.00 BPM</div>
          <div className="flex gap-0.5 mt-1">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="w-1 rounded-sm"
                style={{
                  height: `${4 + Math.random() * 8}px`,
                  background: i < 8 ? `rgba(0,255,204,${0.2 + i * 0.06})` : `rgba(255,0,60,${0.3 + (i - 8) * 0.15})`,
                  animation: `heroBarPulse ${0.3 + Math.random() * 0.4}s ease-in-out infinite alternate`,
                  animationDelay: `${i * 0.05}s`,
                }} />
            ))}
          </div>
        </div>
      )}

      {phase >= 4 && (
        <div className="absolute bottom-5 right-5 z-20 text-right">
          <div className="font-vhs text-[8px] text-white/10 tracking-[0.3em]">
            {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
          </div>
          <div className="font-vhs text-[8px] text-primary/20 tracking-[0.3em]">SP MODE // HI-FI</div>
        </div>
      )}

      {/* Skip */}
      {phase > 0 && phase < 4 && (
        <button onClick={skipToReady}
          className="absolute bottom-6 right-6 z-30 font-vhs text-[10px] text-white/20 hover:text-primary/60 transition-colors tracking-widest">
          SKIP &gt;&gt;
        </button>
      )}

      <style>{`
        @keyframes heroTrackingBar {
          0% { transform: translateY(-100vh); opacity: 1; }
          100% { transform: translateY(100vh); opacity: 0; }
        }
        @keyframes heroScanLine {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes bootFadeIn {
          from { opacity: 0; transform: translateX(-8px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes heroScrollDot {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(8px); opacity: 1; }
        }
        @keyframes heroBarPulse {
          0% { transform: scaleY(0.6); }
          100% { transform: scaleY(1.3); }
        }

        /* Eye pulse — slow breathing brightness */
        .hero-eye-pulse {
          animation: heroEyePulse 4s ease-in-out infinite;
        }
        @keyframes heroEyePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        /* Cyan glow halo breathing */
        .hero-eye-glow {
          animation: heroEyeGlow 4s ease-in-out infinite;
        }
        @keyframes heroEyeGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* Glitch bands — horizontal jitter */
        .hero-glitch-band {
          animation: heroGlitchBand 6s steps(3) infinite;
        }
        @keyframes heroGlitchBand {
          0%, 85%, 100% { opacity: 0; transform: translateX(0); }
          87% { opacity: 1; transform: translateX(-3px); }
          89% { opacity: 0.6; transform: translateX(5px); }
          91% { opacity: 0.3; transform: translateX(-1px); }
          93% { opacity: 0; transform: translateX(0); }
        }

        /* Matrix-style data drops */
        .hero-data-drop {
          animation: heroDataDrop 4s linear infinite;
        }
        @keyframes heroDataDrop {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 20px)); opacity: 0; }
        }

        /* Chromatic edge flash */
        .hero-chroma-flash {
          animation: heroChromaFlash 8s ease-in-out infinite;
        }
        @keyframes heroChromaFlash {
          0%, 80%, 100% { opacity: 0.3; }
          85% { opacity: 1; box-shadow: inset 4px 0 30px rgba(0,255,204,0.08), inset -4px 0 30px rgba(255,0,60,0.08); }
          88% { opacity: 0.5; }
          90% { opacity: 1; box-shadow: inset -2px 0 15px rgba(0,255,204,0.06), inset 2px 0 15px rgba(255,0,60,0.06); }
        }
      `}</style>
    </section>
  )
}

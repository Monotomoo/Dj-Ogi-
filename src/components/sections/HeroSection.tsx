import { useEffect, useRef, useState, useCallback, useMemo } from 'react'

const HEADLINES = [
  'RIJEKA, CROATIA',
  'SINCE 1994',
  '300+ TRACKS',
  'LOVE PARADE BERLIN',
  'ENERGETICA',
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

const HERO_FONT = "'Orbitron', sans-serif"
// URL-encoded because the file has a space
const VIDEO_SRC = '/gallery/Hero%20Video.mp4'

export default function HeroSection() {
  const [phase, setPhase] = useState(0)
  const [headlineIndex, setHeadlineIndex] = useState(0)
  const [headlineVisible, setHeadlineVisible] = useState(true)
  const [timecode, setTimecode] = useState('00:00:00:00')
  const [bootLine, setBootLine] = useState(0)
  const [typedText, setTypedText] = useState('')
  const [showCursor, setShowCursor] = useState(true)

  // Video-specific state
  const [videoMode, setVideoMode] = useState(false)
  const [bigGlitch, setBigGlitch] = useState(false)
  const [bottomGlitch, setBottomGlitch] = useState(false)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Glitch chain bookkeeping — survives effect re-renders so the chain can't be aborted mid-way
  const chainStarted = useRef(false)
  const chainTimers = useRef<ReturnType<typeof setTimeout>[]>([])

  // Stable random values
  const trackingBarHeights = useMemo(() => Array.from({ length: 6 }, () => 3 + Math.random() * 4), [])
  const hudBarHeights = useMemo(() => Array.from({ length: 12 }, () => 4 + Math.random() * 8), [])
  const hudBarDurations = useMemo(() => Array.from({ length: 12 }, () => 0.3 + Math.random() * 0.4), [])

  // Intro plays video from 17s → 21s (when it hits 21s, the big glitch fires)
  const INTRO_START_SEC = 17
  const INTRO_END_SEC = 21

  // ── Video autoplay: seek to intro start, muted, loop during intro ──
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const onLoaded = () => {
      try { v.currentTime = INTRO_START_SEC } catch { /* ignore */ }
      v.muted = true
      v.loop = true
      v.play().catch(() => { /* autoplay blocked is acceptable fallback */ })
    }
    v.addEventListener('loadedmetadata', onLoaded)
    return () => { v.removeEventListener('loadedmetadata', onLoaded) }
  }, [])

  // ── Fullscreen video mode handlers ──
  const closeVideoMode = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setBigGlitch(true)
    window.setTimeout(() => setBigGlitch(false), 450)
    setVideoMode(false)
    v.muted = true
    v.loop = true
    // Park at intro start (not visible in normal mode, but ready if they play again)
    try { v.currentTime = INTRO_START_SEC } catch { /* ignore */ }
    v.pause()
  }, [])

  const openVideoMode = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    setBigGlitch(true)
    window.setTimeout(() => setBigGlitch(false), 450)
    setVideoMode(true)
    v.muted = false
    v.loop = false
    try { v.currentTime = 0 } catch { /* ignore */ }
    v.play().catch(() => { /* user-gesture-required failed — very unlikely since this IS a click */ })
  }, [])

  // Auto-close when fullscreen video finishes
  useEffect(() => {
    if (!videoMode) return
    const v = videoRef.current
    if (!v) return
    const onEnded = () => closeVideoMode()
    v.addEventListener('ended', onEnded)
    return () => v.removeEventListener('ended', onEnded)
  }, [videoMode, closeVideoMode])

  // ESC to exit + lock page scroll while video is playing fullscreen
  useEffect(() => {
    if (!videoMode) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeVideoMode() }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [videoMode, closeVideoMode])

  // Ambient frequency-bar canvas (only after phase 3, paused in video mode)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || phase < 3 || videoMode) return
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
  }, [phase, videoMode])

  // ── Intro chrome: CRT wipe + boot terminal (paced over the longer 4s video intro) ──
  useEffect(() => {
    const t: ReturnType<typeof setTimeout>[] = []
    t.push(setTimeout(() => setPhase(1), 300))    // CRT wipe opens → video visible
    t.push(setTimeout(() => setPhase(2), 900))    // Boot terminal starts (line 0)
    t.push(setTimeout(() => setBootLine(1), 1400))
    t.push(setTimeout(() => setBootLine(2), 1950))
    t.push(setTimeout(() => setBootLine(3), 2550))
    t.push(setTimeout(() => setBootLine(4), 3200))
    return () => t.forEach(clearTimeout)
  }, [])

  // ── Glitch chain: fires when the video's currentTime hits INTRO_END_SEC (21s).
  //    Chain timers live in a ref so they survive re-renders caused by setPhase(3).
  //    Timer-driven fallback at 6s in case autoplay is blocked. ──
  useEffect(() => {
    if (chainStarted.current) return
    const v = videoRef.current
    if (!v) return

    const runGlitchChain = () => {
      if (chainStarted.current) return
      chainStarted.current = true
      setBigGlitch(true)
      // These timers MUST NOT be in the effect cleanup — they need to fire after phase changes
      const push = (fn: () => void, ms: number) => {
        chainTimers.current.push(setTimeout(fn, ms))
      }
      push(() => setPhase(3), 200)        // video→portrait swap hidden by glitch
      push(() => setBigGlitch(false), 450)
      push(() => setPhase(4), 900)         // settle: HUD, headlines, stats
      push(() => setBottomGlitch(true), 1800)
      push(() => setPhase(5), 2000)        // play button reveals
      push(() => setBottomGlitch(false), 2200)
    }

    const onTimeUpdate = () => {
      if (v.currentTime >= INTRO_END_SEC) runGlitchChain()
    }
    // Fallback: if video never reaches 21s (autoplay blocked / slow buffer), still proceed
    const fallback = setTimeout(runGlitchChain, 6000)

    v.addEventListener('timeupdate', onTimeUpdate)
    return () => {
      v.removeEventListener('timeupdate', onTimeUpdate)
      clearTimeout(fallback)
      // Chain timers intentionally NOT cleared here
    }
  }, [])

  // Unmount: clear any still-pending chain timers so we don't leak
  useEffect(() => {
    return () => { chainTimers.current.forEach(clearTimeout) }
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

  useEffect(() => {
    if (phase < 3) return
    const interval = setInterval(() => setShowCursor(p => !p), 530)
    return () => clearInterval(interval)
  }, [phase])

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
    setPhase(5)
    setTypedText('DJ OGI')
    setBootLine(4)
  }, [])

  // ─────── Visibility helpers ───────
  // Video is visible as background during phase 1–2, then fades out during the big glitch
  const videoBgVisible = phase >= 1 && phase < 3
  // Portrait crossfades in during the big glitch (phase 3+)
  const portraitVisible = phase >= 3 && !videoMode
  // Most UI chrome hides during videoMode
  const chromeHidden = videoMode

  return (
    <section
      id="hero"
      className="section flex items-center justify-center relative bg-black overflow-hidden"
    >
      {/* ── BACKGROUND VIDEO ────────────────────────────────
           - During intro (phase 1–2): dark + glitchy as ambient background
           - During phase 3+ in normal mode: hidden (portrait takes over)
           - During videoMode: full-screen, unmuted, clean ── */}
      <video
        ref={videoRef}
        src={VIDEO_SRC}
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          opacity: videoMode ? 1 : videoBgVisible ? 1 : 0,
          filter: videoMode
            ? 'none'
            // Moody but readable — light enough to see the video clearly, overlays add the "glitch"
            : 'brightness(0.75) saturate(0.85) contrast(1.12)',
          objectPosition: 'center 40%',
          zIndex: videoMode ? 50 : 0,
          transition: 'opacity 0.7s ease, filter 0.7s ease',
        }}
        aria-hidden={!videoMode}
      />

      {/* ── PORTRAIT BACKGROUND (crossfades in during big glitch) ── */}
      <div className="absolute inset-0 z-[1]"
        style={{
          opacity: portraitVisible ? 1 : 0,
          transition: 'opacity 0.8s ease',
          pointerEvents: 'none',
        }}>
        <img
          src="/gallery/portrait-decks.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            filter: 'brightness(0.22) saturate(0.3) contrast(1.2) hue-rotate(170deg)',
            objectPosition: 'center 35%',
          }}
          aria-hidden="true"
        />

        <div className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 40% 30% at 50% 38%, transparent 0%, rgba(0,0,0,0.15) 40%, rgba(0,0,0,0.7) 100%)`,
          }} />

        <img
          src="/gallery/portrait-decks.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none hero-eye-pulse"
          style={{
            filter: 'brightness(0.7) saturate(0.6) contrast(1.6) hue-rotate(160deg)',
            objectPosition: 'center 35%',
            maskImage: 'radial-gradient(ellipse 25% 14% at 50% 36%, black 0%, transparent 100%)',
            WebkitMaskImage: 'radial-gradient(ellipse 25% 14% at 50% 36%, black 0%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 pointer-events-none hero-eye-glow"
          style={{
            background: 'radial-gradient(ellipse 30% 18% at 50% 36%, rgba(0,255,204,0.15) 0%, transparent 100%)',
          }} />

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

        <div className="absolute inset-0 pointer-events-none hero-chroma-flash"
          style={{
            boxShadow: 'inset 3px 0 20px rgba(0,255,204,0.04), inset -3px 0 20px rgba(255,0,60,0.04)',
          }} />

        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(180deg, transparent 50%, rgba(0,0,0,0.5) 75%, #000 100%)' }} />

        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 70% at 50% 40%, transparent 0%, rgba(0,0,0,0.4) 100%)' }} />
      </div>

      {/* Ambient frequency bars canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-[2]"
        style={{ opacity: !videoMode && phase >= 3 ? 0.6 : 0, transition: 'opacity 1s ease' }} />

      {/* CRT Power-on circle wipe */}
      <div className="absolute inset-0 bg-[#0a0a0c] transition-all ease-out z-[3]"
        style={{
          clipPath: phase >= 1 ? 'circle(150% at 50% 50%)' : 'circle(0% at 50% 50%)',
          opacity: phase >= 1 ? 0 : 1,
          transitionDuration: '0.8s',
          pointerEvents: 'none',
        }} />

      {/* VHS tracking bars during boot */}
      {phase >= 1 && phase < 3 && !videoMode && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute w-full" style={{
              height: `${trackingBarHeights[i]}px`,
              top: `${15 * i + 8}%`,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent)',
              animation: `heroTrackingBar ${0.6 + i * 0.12}s ${i * 0.08}s linear infinite`,
            }} />
          ))}
        </div>
      )}

      {/* Continuous scan line */}
      {phase >= 3 && !videoMode && (
        <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
          <div className="absolute left-0 right-0 h-[2px]"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(0,255,204,0.06), transparent)',
              animation: 'heroScanLine 4s linear infinite',
            }} />
        </div>
      )}

      {/* Boot terminal */}
      {phase >= 2 && phase < 4 && !videoMode && (
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

      {/* ── MAIN CONTENT (hides during videoMode) ── */}
      <div className={`relative z-20 text-center px-4 transition-all duration-500 ${
        videoMode
          ? 'opacity-0 scale-95 pointer-events-none'
          : phase >= 3 ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>

        {/* Date badge */}
        <div className={`transition-all duration-500 ${phase >= 4 ? 'opacity-100' : 'opacity-0'}`}>
          <div className="inline-block px-4 py-1 rounded-full mb-6"
            style={{ border: '1px solid rgba(0,255,204,0.15)', background: 'rgba(0,255,204,0.04)' }}>
            <span className="font-vhs text-[10px] text-primary/60 tracking-[0.5em]">EST. 1994 // RIJEKA</span>
          </div>
        </div>

        {/* DJ OGI title */}
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
          <span className="absolute inset-0 pointer-events-none select-none" aria-hidden
            style={{
              fontFamily: HERO_FONT,
              color: 'transparent',
              textShadow: phase >= 4 ? '-3px 1px rgba(255,0,60,0.35)' : 'none',
              transition: 'text-shadow 0.5s ease',
            }}>
            {typedText}
          </span>
          <span className="absolute inset-0 pointer-events-none select-none" aria-hidden
            style={{
              fontFamily: HERO_FONT,
              color: 'transparent',
              textShadow: phase >= 4 ? '3px -1px rgba(0,255,204,0.35)' : 'none',
              transition: 'text-shadow 0.5s ease',
            }}>
            {typedText}
          </span>
          {typedText}
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

        {/* ── BOTTOM AREA — PLAY BUTTON or SCROLL HINT ── */}
        <div className="mt-14">
          {/* Before phase 5: scroll indicator (ghost, dimmer) */}
          {phase >= 4 && phase < 5 && (
            <div className="transition-all duration-500 opacity-60">
              <div className="font-vhs text-[9px] text-white/30 tracking-[0.6em] mb-3">SCROLL TO EXPLORE</div>
              <div className="flex flex-col items-center gap-1">
                <div className="w-4 h-7 rounded-full border border-white/15 flex items-start justify-center p-1">
                  <div className="w-1 h-2 rounded-full bg-primary/50" style={{ animation: 'heroScrollDot 1.5s ease-in-out infinite' }} />
                </div>
              </div>
            </div>
          )}

          {/* PLAY BUTTON — revealed at phase 5 by the bottom glitch */}
          {phase >= 5 && (
            <div className="hero-play-reveal flex flex-col items-center">
              <button
                onClick={openVideoMode}
                className="group relative flex items-center justify-center mx-auto select-none"
                aria-label="Play hero reel"
              >
                {/* Pulsing outer rings */}
                <span aria-hidden className="absolute rounded-full hero-play-ring-1"
                  style={{ width: 88, height: 88, border: '2px solid rgba(0,255,204,0.7)' }} />
                <span aria-hidden className="absolute rounded-full hero-play-ring-2"
                  style={{ width: 88, height: 88, border: '1px solid rgba(0,255,204,0.45)' }} />

                {/* Main button body */}
                <span className="relative flex items-center justify-center rounded-full transition-transform duration-300 group-hover:scale-105"
                  style={{
                    width: 88, height: 88,
                    background: 'radial-gradient(circle at 35% 30%, rgba(0,255,204,0.35), rgba(0,255,204,0.1) 55%, rgba(0,0,0,0.8))',
                    border: '2px solid #00ffcc',
                    boxShadow: '0 0 38px rgba(0,255,204,0.55), 0 0 80px rgba(0,255,204,0.2), inset 0 0 22px rgba(0,255,204,0.25)',
                  }}>
                  {/* Chromatic RGB ghosts */}
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: 'rgba(255,0,60,0.6)', transform: 'translate(-3px, 0)', mixBlendMode: 'screen' }}>
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                  </span>
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ color: 'rgba(0,255,204,0.6)', transform: 'translate(3px, 0)', mixBlendMode: 'screen' }}>
                    <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                  </span>

                  {/* Real icon */}
                  <svg className="relative w-10 h-10 ml-1" fill="#fff" viewBox="0 0 24 24"
                    style={{ filter: 'drop-shadow(0 0 6px #00ffcc)' }}>
                    <polygon points="6,3 20,12 6,21" />
                  </svg>

                  {/* Inner scan lines */}
                  <span aria-hidden className="absolute inset-0 rounded-full pointer-events-none opacity-25"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.15) 2px, rgba(255,255,255,0.15) 3px)',
                    }} />
                </span>
              </button>

              <div className="mt-5 font-vhs text-[10px] text-primary/70 tracking-[0.5em]">
                // PLAY HERO REEL
              </div>
              <div className="mt-1 font-vhs text-[8px] text-white/25 tracking-[0.4em]">
                30 YEARS IN 60 SECONDS
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── HUD corners (phase 4+, hidden in videoMode) ── */}
      {phase >= 4 && !videoMode && (
        <>
          <div className="absolute top-5 left-5 z-20 flex items-center gap-2">
            <span className="rec-dot w-2 h-2 rounded-full bg-accent inline-block shadow-[0_0_8px_#ff003c]" />
            <span className="font-vhs text-[11px] text-accent/80 tracking-widest">REC</span>
          </div>
          <div className="absolute top-5 right-5 z-20 font-vhs text-[11px] text-white/30 tracking-wider tabular-nums">
            {timecode}
          </div>
          <div className="absolute bottom-5 left-5 z-20">
            <div className="font-vhs text-[8px] text-white/10 tracking-[0.4em]">CH-01 // 145.00 BPM</div>
            <div className="flex gap-0.5 mt-1">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="w-1 rounded-sm"
                  style={{
                    height: `${hudBarHeights[i]}px`,
                    background: i < 8 ? `rgba(0,255,204,${0.2 + i * 0.06})` : `rgba(255,0,60,${0.3 + (i - 8) * 0.15})`,
                    animation: `heroBarPulse ${hudBarDurations[i]}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 0.05}s`,
                  }} />
              ))}
            </div>
          </div>
          <div className="absolute bottom-5 right-5 z-20 text-right">
            <div className="font-vhs text-[8px] text-white/10 tracking-[0.3em]">
              {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}
            </div>
            <div className="font-vhs text-[8px] text-primary/20 tracking-[0.3em]">SP MODE // HI-FI</div>
          </div>
        </>
      )}

      {/* Skip intro */}
      {phase > 0 && phase < 5 && !videoMode && (
        <button onClick={skipToReady}
          className="absolute bottom-6 right-6 z-30 font-vhs text-[10px] text-white/20 hover:text-primary/60 transition-colors tracking-widest"
          aria-label="Skip intro animation">
          SKIP &gt;&gt;
        </button>
      )}

      {/* ── BIG GLITCH OVERLAY ── */}
      {bigGlitch && (
        <div className="absolute inset-0 z-[46] pointer-events-none hero-big-glitch-shake">
          {/* White flash */}
          <div className="absolute inset-0 hero-glitch-flash"
            style={{ background: 'rgba(255,255,255,0.35)', mixBlendMode: 'screen' }} />

          {/* RGB tears */}
          <div className="absolute inset-0 hero-glitch-tear-red"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 7px, rgba(255,0,60,0.32) 7px, rgba(255,0,60,0.32) 9px)',
              mixBlendMode: 'screen',
            }} />
          <div className="absolute inset-0 hero-glitch-tear-cyan"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent 0px, transparent 11px, rgba(0,255,204,0.28) 11px, rgba(0,255,204,0.28) 12px)',
              mixBlendMode: 'screen',
            }} />

          {/* Horizontal slabs */}
          {[15, 32, 48, 62, 78, 89].map((top, i) => (
            <div key={i} className="absolute left-0 right-0 hero-glitch-slab"
              style={{
                top: `${top}%`,
                height: `${5 + (i % 4) * 3}%`,
                background: i % 3 === 0
                  ? 'rgba(255,255,255,0.1)'
                  : i % 3 === 1
                    ? 'rgba(0,255,204,0.18)'
                    : 'rgba(255,0,60,0.18)',
                mixBlendMode: 'screen',
                animationDelay: `${i * 35}ms`,
              }} />
          ))}

          {/* Dense scan-line veil */}
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.6) 2px, rgba(0,0,0,0.6) 3px)',
            }} />
        </div>
      )}

      {/* ── BOTTOM GLITCH OVERLAY ── */}
      {bottomGlitch && (
        <div className="absolute bottom-0 left-0 right-0 h-[50%] z-[45] pointer-events-none">
          {[2, 12, 24, 38, 52, 68, 82, 94].map((top, i) => (
            <div key={i} className="absolute left-0 right-0 hero-bottom-slab"
              style={{
                top: `${top}%`,
                height: `${3 + (i % 5) * 2}%`,
                background: i % 3 === 0
                  ? 'rgba(255,0,60,0.28)'
                  : i % 3 === 1
                    ? 'rgba(0,255,204,0.22)'
                    : 'rgba(255,255,255,0.08)',
                mixBlendMode: 'screen',
                animationDelay: `${i * 30}ms`,
              }} />
          ))}
          <div className="absolute inset-0 hero-bottom-rgb-edge"
            style={{ boxShadow: 'inset 6px 0 25px rgba(255,0,60,0.35), inset -6px 0 25px rgba(0,255,204,0.35)' }} />
          <div className="absolute inset-0 opacity-30"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)',
            }} />
        </div>
      )}

      {/* ── EXIT BUTTON + LIVE badge (video mode only) ── */}
      {videoMode && (
        <>
          {/* Big EXIT button top-right */}
          <button
            onClick={closeVideoMode}
            className="absolute top-6 right-6 z-[60] group font-vhs tracking-[0.3em] transition-all duration-200 flex items-center gap-3 px-5 py-3 rounded-lg"
            style={{
              background: 'rgba(0,0,0,0.72)',
              border: '1px solid rgba(255,0,60,0.5)',
              color: '#ff003c',
              boxShadow: '0 0 24px rgba(255,0,60,0.28), inset 0 0 12px rgba(255,0,60,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
            aria-label="Exit video"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="6" y1="18" x2="18" y2="6" />
            </svg>
            <span className="text-[12px] font-bold" style={{ textShadow: '0 0 8px rgba(255,0,60,0.7)' }}>
              EXIT
            </span>
            <span className="font-vhs text-[8px] text-accent/50 tracking-[0.3em] hidden md:inline">[ESC]</span>
          </button>

          {/* LIVE badge top-left */}
          <div className="absolute top-6 left-6 z-[60] flex items-center gap-2 px-3 py-1.5 rounded"
            style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,0,60,0.35)', backdropFilter: 'blur(8px)' }}>
            <span className="rec-dot w-2 h-2 rounded-full bg-accent shadow-[0_0_8px_#ff003c]" />
            <span className="font-vhs text-[10px] text-accent/80 tracking-[0.4em]">LIVE // HERO REEL</span>
          </div>

          {/* Subtle scan lines over fullscreen video */}
          <div className="absolute inset-0 z-[55] pointer-events-none opacity-15"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.5) 2px, rgba(0,0,0,0.5) 3px)',
            }} />
        </>
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

        .hero-eye-pulse { animation: heroEyePulse 4s ease-in-out infinite; }
        @keyframes heroEyePulse {
          0%, 100% { opacity: 0.7; }
          50% { opacity: 1; }
        }

        .hero-eye-glow { animation: heroEyeGlow 4s ease-in-out infinite; }
        @keyframes heroEyeGlow {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        .hero-glitch-band { animation: heroGlitchBand 6s steps(3) infinite; }
        @keyframes heroGlitchBand {
          0%, 85%, 100% { opacity: 0; transform: translateX(0); }
          87% { opacity: 1; transform: translateX(-3px); }
          89% { opacity: 0.6; transform: translateX(5px); }
          91% { opacity: 0.3; transform: translateX(-1px); }
          93% { opacity: 0; transform: translateX(0); }
        }

        .hero-data-drop { animation: heroDataDrop 4s linear infinite; }
        @keyframes heroDataDrop {
          0% { transform: translateY(0); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { transform: translateY(calc(100vh + 20px)); opacity: 0; }
        }

        .hero-chroma-flash { animation: heroChromaFlash 8s ease-in-out infinite; }
        @keyframes heroChromaFlash {
          0%, 80%, 100% { opacity: 0.3; }
          85% { opacity: 1; box-shadow: inset 4px 0 30px rgba(0,255,204,0.08), inset -4px 0 30px rgba(255,0,60,0.08); }
          88% { opacity: 0.5; }
          90% { opacity: 1; box-shadow: inset -2px 0 15px rgba(0,255,204,0.06), inset 2px 0 15px rgba(255,0,60,0.06); }
        }

        /* PLAY BUTTON pulsing rings */
        .hero-play-ring-1 { animation: heroPlayRing 2s ease-out infinite; }
        .hero-play-ring-2 { animation: heroPlayRing 2s ease-out infinite 1s; }
        @keyframes heroPlayRing {
          0%   { transform: scale(1);   opacity: 0.9; }
          100% { transform: scale(1.75); opacity: 0; }
        }

        /* Play-button reveal (fires once at phase 5) */
        .hero-play-reveal { animation: heroPlayReveal 0.6s cubic-bezier(0.22, 1, 0.36, 1) both; }
        @keyframes heroPlayReveal {
          0%   { opacity: 0; transform: translateY(14px) scale(0.9); filter: blur(6px); }
          60%  { opacity: 1; filter: blur(0); }
          100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        /* BIG GLITCH */
        .hero-big-glitch-shake { animation: heroBigShake 450ms steps(6); }
        @keyframes heroBigShake {
          0%, 100% { transform: translate(0,0); }
          20% { transform: translate(-5px, 3px); }
          40% { transform: translate(6px, -4px); }
          60% { transform: translate(-4px, 5px); }
          80% { transform: translate(5px, -2px); }
        }
        .hero-glitch-flash { animation: heroGlitchFlash 450ms steps(5); }
        @keyframes heroGlitchFlash {
          0%, 30%, 60%, 85%, 100% { opacity: 0; }
          15% { opacity: 1; }
          45% { opacity: 0.6; }
          70% { opacity: 0.25; }
        }
        .hero-glitch-slab { animation: heroGlitchSlab 450ms steps(1); }
        @keyframes heroGlitchSlab {
          0%, 100% { opacity: 0; transform: translateX(0); }
          20% { opacity: 1; transform: translateX(-10px); }
          40% { opacity: 0.3; transform: translateX(7px); }
          60% { opacity: 1; transform: translateX(-3px); }
          80% { opacity: 0.6; transform: translateX(0); }
        }
        .hero-glitch-tear-red { animation: heroGlitchTearRed 450ms steps(3); }
        @keyframes heroGlitchTearRed {
          0%, 100% { opacity: 0; transform: translate(0,0); }
          33% { opacity: 1; transform: translate(-6px, 0); }
          66% { opacity: 0.5; transform: translate(4px, 0); }
        }
        .hero-glitch-tear-cyan { animation: heroGlitchTearCyan 450ms steps(3); }
        @keyframes heroGlitchTearCyan {
          0%, 100% { opacity: 0; transform: translate(0,0); }
          33% { opacity: 0.7; transform: translate(6px, 0); }
          66% { opacity: 1; transform: translate(-4px, 0); }
        }

        /* BOTTOM GLITCH */
        .hero-bottom-slab { animation: heroBottomSlab 400ms steps(1); }
        @keyframes heroBottomSlab {
          0%, 100% { opacity: 0; transform: translateX(0); }
          25% { opacity: 1; transform: translateX(-12px); }
          50% { opacity: 0.3; transform: translateX(9px); }
          75% { opacity: 1; transform: translateX(-4px); }
        }
        .hero-bottom-rgb-edge { animation: heroBottomRgbEdge 400ms ease-in-out; }
        @keyframes heroBottomRgbEdge {
          0%, 100% { opacity: 0; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  )
}

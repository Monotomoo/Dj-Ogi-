import { useState, useEffect, useRef } from 'react'

export default function EnergeticaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  const [counter, setCounter] = useState(0)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Animated counter for 31
  useEffect(() => {
    if (!inView) return
    const target = 31
    const duration = 1500
    const t0 = performance.now()
    const tick = (now: number) => {
      const progress = Math.min((now - t0) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCounter(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView])

  return (
    <section ref={sectionRef} className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #060610 25%, #0a0a18 50%, #060610 75%, #000 100%)' }}>

      {/* Ambient — dual color */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[700px] h-[600px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 60%)', filter: 'blur(130px)' }} />
        <div className="absolute bottom-1/4 right-0 w-[600px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 60%)', filter: 'blur(120px)' }} />
      </div>

      {/* Giant logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <img src="/energetica-logo.png" alt=""
          style={{
            width: 'min(900px, 80vw)',
            opacity: 0.03,
            filter: 'invert(1)',
            transform: 'rotate(-8deg)',
          }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div className="text-center mb-14"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(25px)', transition: 'all 0.8s ease' }}>
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="h-px w-20 bg-gradient-to-r from-transparent to-primary/40" />
            <span className="font-vhs text-[9px] text-primary/60 tracking-[0.6em]">// LEGACY</span>
            <div className="h-px w-20 bg-gradient-to-l from-transparent to-primary/40" />
          </div>
          {/* Logo — prominent */}
          <div className="flex justify-center mb-6 energetica-logo-float">
            <img src="/energetica-logo.png" alt="Energetica"
              className="w-28 md:w-36"
              style={{
                filter: 'invert(1) drop-shadow(0 0 25px rgba(0,255,204,0.4)) drop-shadow(0 0 50px rgba(0,255,204,0.15))',
                transition: 'filter 0.5s ease',
              }} />
          </div>
          <h2 className="font-vhs text-5xl md:text-7xl lg:text-8xl text-white tracking-wider rgb-split mb-4 leading-[0.9]">
            ENERGETICA
          </h2>
          <p className="font-vhs text-[11px] md:text-sm tracking-[0.35em] mt-3"
            style={{
              background: 'linear-gradient(90deg, #00ffcc 0%, #ffffff 50%, #ff003c 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
            31 YEARS OF ELECTRONIC MUSIC HISTORY
          </p>
        </div>

        {/* ── HERO STAT: 31 ── */}
        <div className="text-center mb-16"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'scale(1)' : 'scale(0.9)', transition: 'all 1s ease 0.2s' }}>
          <div className="relative inline-block">
            <span className="font-vhs leading-none tabular-nums block"
              style={{
                fontSize: 'clamp(8rem, 22vw, 20rem)',
                color: '#00ffcc',
                textShadow: inView
                  ? '0 0 60px rgba(0,255,204,0.5), 0 0 120px rgba(0,255,204,0.25), 0 0 200px rgba(0,255,204,0.1)'
                  : 'none',
                transition: 'text-shadow 1.5s ease',
              }}>
              {counter}
            </span>
            {/* Scan lines over the number */}
            <div className="absolute inset-0 pointer-events-none opacity-30"
              style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 6px)' }} />
            {/* Subtitle */}
            <div className="font-vhs text-[11px] md:text-sm text-white/40 tracking-[0.5em] -mt-2">
              YEARS
            </div>
          </div>
        </div>

        {/* ── TIMELINE STAT CARDS ── */}
        <div className="grid grid-cols-3 gap-3 md:gap-5 mb-16"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.4s' }}>
          {[
            { year: '1994', label: 'FOUNDED IN RIJEKA', color: '#00ffcc', rgb: '0,255,204' },
            { year: '1998', label: 'RADIO SHOW', color: '#ffcc00', rgb: '255,204,0' },
            { year: '2025', label: 'STILL RUNNING', color: '#ff003c', rgb: '255,0,60' },
          ].map((item, i) => (
            <div key={item.year}
              className="relative rounded-xl overflow-hidden py-6 md:py-8 px-4 text-center"
              style={{
                background: `linear-gradient(135deg, rgba(${item.rgb},0.05) 0%, rgba(0,0,0,0.5) 100%)`,
                border: `1px solid rgba(${item.rgb},0.2)`,
                opacity: inView ? 1 : 0,
                transform: inView ? 'translateY(0)' : 'translateY(15px)',
                transition: `all 0.7s ease ${0.5 + i * 0.15}s`,
              }}>
              <div className="absolute top-0 left-0 right-0 h-px"
                style={{ background: `linear-gradient(90deg, transparent, ${item.color}, transparent)` }} />
              <div className="font-vhs text-3xl md:text-5xl leading-none tabular-nums mb-3"
                style={{
                  color: item.color,
                  textShadow: `0 0 20px rgba(${item.rgb},0.4)`,
                }}>
                {item.year}
              </div>
              <div className="font-vhs text-[8px] md:text-[10px] text-white/40 tracking-[0.3em]">
                {item.label}
              </div>
            </div>
          ))}
        </div>

        {/* ── STORY TEXT ── */}
        <div className="max-w-3xl mx-auto space-y-6 mb-16"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease 0.7s' }}>

          <p className="text-white/80 text-base md:text-lg leading-relaxed">
            <span className="font-vhs text-primary text-lg md:text-xl">Energetica</span> is the oldest active
            electronic music event organization in Croatia — rooted in Rijeka and running continuously since{' '}
            <span className="text-primary font-vhs">1994</span>. Founded by DJ Ogi and DJ Rene, a duo that recognized
            the power of the techno movement in its earliest days in this region.
          </p>

          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Energetica's first party was held at the legendary <span className="text-white">Klub 82 on Pag</span>,
            opening one of the longest-running chapters in Croatian club history.
          </p>

          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            Over three decades, Energetica has hosted countless artists from the global DJ scene and shaped
            generations of electronic music lovers. In 1998 it also launched its own radio show,{' '}
            <span className="text-white italic">Energetica Music</span>, on Kvarnerski Radio.
          </p>

          <p className="text-white/70 text-sm md:text-base leading-relaxed">
            <span className="font-vhs text-primary">DJ Ogi</span> has given the organization its signature imprint —
            for the last 27 years he has remained Energetica's main driving force and active promoter, continuously
            working to develop the scene and preserve its authentic sound.
          </p>

          {/* Quote-like finisher */}
          <div className="pt-6 border-t border-white/[0.06]">
            <p className="text-white/85 text-base md:text-lg leading-relaxed italic font-light">
              From Rijeka's industrial spaces to Adriatic open-air locations, Energetica is synonymous with
              <span className="text-primary not-italic font-vhs"> uncompromising techno</span>, quality production,
              and a passionate crowd.
            </p>
          </div>
        </div>

        {/* ── LOCATION SWEEP ── */}
        <div className="flex items-center justify-center gap-4 md:gap-8 flex-wrap mb-10"
          style={{ opacity: inView ? 1 : 0, transition: 'all 0.8s ease 1s' }}>
          {['RIJEKA', 'PAG · KLUB 82', 'JADRAN', 'OPEN-AIR', 'KVARNERSKI RADIO'].map((loc, i) => (
            <div key={loc} className="flex items-center gap-4 md:gap-8">
              <span className="font-vhs text-[9px] md:text-[11px] text-white/35 tracking-[0.35em]">
                {loc}
              </span>
              {i < 4 && <span className="text-primary/30 font-vhs text-xs">◆</span>}
            </div>
          ))}
        </div>

        {/* Bottom label */}
        <div className="text-center pt-8 border-t border-white/[0.04]">
          <span className="font-vhs text-[8px] text-white/[0.1] tracking-[0.5em]">
            ENERGETICA // SINCE 1994 // NEVER STOPPED
          </span>
        </div>
      </div>

      <style>{`
        .energetica-logo-float {
          animation: energeticaLogoFloat 4s ease-in-out infinite;
        }
        @keyframes energeticaLogoFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-4px) scale(1.02); }
        }
      `}</style>
    </section>
  )
}

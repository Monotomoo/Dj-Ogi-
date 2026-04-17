import { useState, useEffect, useRef, useCallback } from 'react'
import { bioEntries } from '../../data/bio'

export default function BioSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [transitioning, setTransitioning] = useState(false)
  const [displayIndex, setDisplayIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)

  const active = bioEntries[displayIndex]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const switchTo = useCallback((i: number) => {
    setActiveIndex(prev => {
      if (i === prev) return prev
      setTransitioning(true)
      setTimeout(() => {
        setDisplayIndex(i)
        setTransitioning(false)
      }, 300)
      return i
    })
  }, [])

  // Auto-advance every 6s
  useEffect(() => {
    if (!inView) return
    const interval = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % bioEntries.length
        setTransitioning(true)
        setTimeout(() => {
          setDisplayIndex(next)
          setTransitioning(false)
        }, 300)
        return next
      })
    }, 6000)
    return () => clearInterval(interval)
  }, [inView])

  const progressPct = ((activeIndex) / (bioEntries.length - 1)) * 100

  return (
    <section id="bio" ref={sectionRef} className="relative pt-12 pb-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #050508 30%, #080810 50%, #050508 70%, #000 100%)' }}>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div className="text-center mb-14"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease',
          }}>
          <div className="font-vhs text-[9px] text-primary/40 tracking-[0.6em] mb-4">// BIOGRAPHY</div>
          <h2 className="font-vhs text-5xl md:text-7xl text-white tracking-wider rgb-split mb-6">THE STORY</h2>
          <p className="text-white/60 text-sm md:text-base leading-relaxed max-w-3xl mx-auto mb-4">
            In 1994, in the port city of Rijeka — where cranes tower over the Adriatic and concrete meets salt air —
            a kid walked into a room full of machines and never walked out. No music school. No connections. No scene to plug into.
            Just a four-track recorder, a stack of imported vinyl, and the unshakable belief that this city deserved its own sound.
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl mx-auto mb-4">
            While the rest of Croatia looked to Zagreb, DJ Ogi built something from nothing. He didn't wait for permission.
            He pressed his own records. Founded his own labels. Booked his own nights. Turned abandoned warehouses into
            temples of sound and made a generation of kids fall in love with four-to-the-floor at 145 BPM.
          </p>
          <p className="text-white/50 text-sm leading-relaxed max-w-3xl mx-auto mb-4">
            The records traveled further than anyone expected. Berlin came calling. Love Parade. Dance Valley.
            Clubs in London, São Paulo, Bogotá, Kiev. And then the moment that confirmed everything — Aphex Twin,
            the most unpredictable mind in electronic music, dropped a DJ Ogi track in his set. No email. No promo push.
            The music just found its way to the right ears.
          </p>
          <p className="text-white/45 text-sm leading-relaxed max-w-3xl mx-auto">
            Three decades later, the machines are still running. Five labels. 80+ vinyl records pressed.
            Hundreds of tracks released. But the address hasn't changed. Rijeka. The same port city, the same
            salt air, the same stubborn belief that hard techno doesn't need to be polished — it needs to be honest.
            DJ Ogi never chased a trend. He just kept making the sound he believed in, and the world came to listen.
          </p>
        </div>

        {/* ── TIMELINE BAR ── */}
        <div className="mb-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
          {/* Progress track */}
          <div className="relative h-1 rounded-full mb-5 mx-4"
            style={{ background: 'rgba(255,255,255,0.04)' }}>
            <div className="absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPct}%`,
                background: 'linear-gradient(90deg, #00ffcc, #00ffcc80)',
                boxShadow: '0 0 12px rgba(0,255,204,0.5)',
              }} />
          </div>

          {/* Year buttons */}
          <div className="flex justify-between px-0">
            {bioEntries.map((entry, i) => {
              const isActive = i === activeIndex
              const isPast = i < activeIndex
              return (
                <button key={entry.year} onClick={() => switchTo(i)}
                  className="group flex flex-col items-center gap-2 transition-all duration-300"
                  style={{ flex: '1 1 0' }}>
                  {/* Dot */}
                  <div className="transition-all duration-300"
                    style={{
                      width: isActive ? '12px' : '6px',
                      height: isActive ? '12px' : '6px',
                      borderRadius: '50%',
                      background: isActive ? '#00ffcc' : isPast ? 'rgba(0,255,204,0.5)' : 'rgba(255,255,255,0.15)',
                      boxShadow: isActive ? '0 0 16px rgba(0,255,204,0.8), 0 0 32px rgba(0,255,204,0.4)' : 'none',
                    }} />
                  {/* Year label */}
                  <span className="font-vhs text-[10px] md:text-xs tracking-wider transition-all duration-300"
                    style={{
                      color: isActive ? '#00ffcc' : isPast ? 'rgba(0,255,204,0.4)' : 'rgba(255,255,255,0.2)',
                      textShadow: isActive ? '0 0 10px rgba(0,255,204,0.6)' : 'none',
                    }}>
                    {entry.year}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* ── CONTENT CARD ── */}
        <div className="relative"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(20px)',
            transition: 'all 0.8s ease 0.4s',
          }}>

          <div className="relative rounded-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,204,0.03) 0%, rgba(0,0,0,0.5) 50%, rgba(255,0,60,0.02) 100%)',
              border: '1px solid rgba(0,255,204,0.08)',
              boxShadow: '0 0 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}>

            {/* Background year watermark */}
            <div className="absolute inset-0 flex items-center justify-end pr-8 md:pr-16 pointer-events-none overflow-hidden">
              <span className="font-vhs text-[12rem] md:text-[18rem] leading-none select-none"
                style={{
                  color: 'transparent',
                  WebkitTextStroke: '1px rgba(0,255,204,0.04)',
                  transition: 'opacity 0.3s ease',
                  opacity: transitioning ? 0 : 1,
                }}>
                {active.year}
              </span>
            </div>

            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, #00ffcc40, transparent 50%, #ff003c20)' }} />

            <div className={`relative p-8 md:p-12 transition-all duration-300 ${transitioning ? 'opacity-0 translate-y-3' : 'opacity-100 translate-y-0'}`}>
              {/* Year + line */}
              <div className="flex items-baseline gap-5 mb-5">
                <span className="font-vhs text-6xl md:text-8xl leading-none tracking-wider"
                  style={{
                    color: '#00ffcc',
                    textShadow: '0 0 40px rgba(0,255,204,0.4), 0 0 80px rgba(0,255,204,0.15)',
                  }}>
                  {active.year}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
                <span className="font-vhs text-[10px] text-white/15 tracking-[0.4em] hidden md:block">
                  {String(activeIndex + 1).padStart(2, '0')} / {String(bioEntries.length).padStart(2, '0')}
                </span>
              </div>

              {/* Title */}
              <h3 className="font-vhs text-xl md:text-3xl text-white tracking-[0.15em] mb-5">
                {active.title}
              </h3>

              {/* Description */}
              <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-3xl">
                {active.description}
              </p>

              {/* Bottom separator + nav hint */}
              <div className="mt-8 flex items-center justify-between">
                <div className="h-px flex-1 bg-gradient-to-r from-primary/15 via-accent/8 to-transparent" />
                <div className="flex gap-2 ml-4">
                  <button onClick={() => switchTo(Math.max(0, activeIndex - 1))}
                    className="font-vhs text-[10px] text-white/20 hover:text-primary transition-colors px-2 py-1"
                    disabled={activeIndex === 0}>
                    ◄ PREV
                  </button>
                  <button onClick={() => switchTo(Math.min(bioEntries.length - 1, activeIndex + 1))}
                    className="font-vhs text-[10px] text-white/20 hover:text-primary transition-colors px-2 py-1"
                    disabled={activeIndex === bioEntries.length - 1}>
                    NEXT ►
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom accent */}
            <div className="absolute bottom-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg, transparent, #ff003c20, transparent)' }} />
          </div>
        </div>

        {/* ── STATS ── */}
        <div className="grid grid-cols-3 gap-4 mt-10"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(15px)',
            transition: 'all 0.8s ease 0.6s',
          }}>
          {[
            { value: '30+', label: 'YEARS ACTIVE', color: '#00ffcc' },
            { value: '300+', label: 'TRACKS RELEASED', color: '#ff003c' },
            { value: '5', label: 'RECORD LABELS', color: '#9900ff' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-5 rounded-xl"
              style={{
                background: 'rgba(255,255,255,0.015)',
                border: `1px solid rgba(255,255,255,0.04)`,
              }}>
              <div className="font-vhs text-3xl md:text-4xl mb-1.5"
                style={{ color: stat.color, textShadow: `0 0 20px ${stat.color}40` }}>
                {stat.value}
              </div>
              <div className="font-vhs text-[8px] text-white/20 tracking-[0.4em]">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

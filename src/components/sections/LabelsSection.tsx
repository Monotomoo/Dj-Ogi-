import { useState, useEffect, useRef } from 'react'
import { labelLinks } from '../../data/socials'

const LABEL_META: Record<string, {
  color: string
  rgb: string
  founded: string
  releases: number
  desc: string
  tagline: string
  letter: string
}> = {
  Technodrome: {
    color: '#00ffcc', rgb: '0,255,204',
    founded: '1998', releases: 60,
    desc: 'The flagship imprint where the original Rijeka hard techno sound was forged. Born in the underground clubs of Croatia\'s port city, Technodrome became the launchpad for a generation of hard techno artists. Raw, relentless, uncompromising — every release is a statement that the dancefloor comes first.',
    tagline: 'FLAGSHIP LABEL', letter: 'T',
  },
  'Techno Factory': {
    color: '#ff003c', rgb: '255,0,60',
    founded: '2001', releases: 80,
    desc: 'Industrial-grade techno built for warehouse floors. Techno Factory channels the raw power of machines into pounding kicks and distorted textures. No fillers, no compromises — pure mechanical energy designed to shake concrete walls and shatter speaker cones.',
    tagline: 'INDUSTRIAL', letter: 'TF',
  },
  'Dark Noise': {
    color: '#9900ff', rgb: '153,0,255',
    founded: '2005', releases: 40,
    desc: 'The experimental arm. Dark Noise pushes into territories where most labels fear to go — thick atmospheres, raw noise textures, and deep hypnotic pressure that pulls you into a trance. Every release is a journey into the unknown corners of electronic music.',
    tagline: 'EXPERIMENTAL', letter: 'DN',
  },
  'Beast Music Records': {
    color: '#ff6600', rgb: '255,102,0',
    founded: '2008', releases: 55,
    desc: 'High-energy rave weapons engineered for peak-time destruction. Beast Music Records is where the big room meets the underground — explosive drops, relentless grooves, and the kind of tracks that turn a crowd into a single moving organism. The crowd never had a chance.',
    tagline: 'PEAK TIME', letter: 'BM',
  },
  'Noisy Room': {
    color: '#cccccc', rgb: '204,204,204',
    founded: '2012', releases: 30,
    desc: 'The underground side. Noisy Room strips techno back to its essence — slow-burning, hypnotic, and relentless. Inspired by the after-hours warehouse scene, these tracks are built for four walls, no windows, and no mercy. Minimal light, maximum impact.',
    tagline: 'UNDERGROUND', letter: 'NR',
  },
}

function useInView(threshold = 0.2) {
  const ref = useRef<HTMLDivElement>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold })
    obs.observe(el)
    return () => obs.disconnect()
  }, [threshold])
  return { ref, inView }
}

function AnimatedCount({ target, color, inView }: { target: number; color: string; inView: boolean }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    if (!inView) return
    const duration = 1200
    const t0 = performance.now()
    const tick = (now: number) => {
      const elapsed = now - t0
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [inView, target])
  return (
    <span className="font-vhs text-3xl md:text-4xl leading-none tabular-nums"
      style={{ color, textShadow: `0 0 20px ${color}60` }}>
      {count}+
    </span>
  )
}

export default function LabelsSection() {
  const [hoveredLabel, setHoveredLabel] = useState<string | null>(null)
  const headerVis = useInView(0.3)
  const flagshipVis = useInView(0.2)
  const gridVis = useInView(0.15)
  const statsVis = useInView(0.3)

  const otherLabels = labelLinks.filter(l => l.name !== 'Technodrome')

  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #050508 30%, #080810 50%, #050508 70%, #000 100%)' }}>

      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[-10%] top-[20%] w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute right-[-10%] bottom-[20%] w-[500px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute left-[40%] top-[50%] w-[400px] h-[400px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #9900ff 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div ref={headerVis.ref}
          className="text-center mb-20 transition-all duration-1000"
          style={{
            opacity: headerVis.inView ? 1 : 0,
            transform: headerVis.inView ? 'translateY(0)' : 'translateY(30px)',
          }}>
          <div className="font-vhs text-[9px] text-primary/40 tracking-[0.6em] mb-4">// HIS IMPRINTS</div>
          <h2 className="font-vhs text-5xl md:text-7xl text-white tracking-wider mb-5 rgb-split">THE LABELS</h2>
          <p className="text-white/60 text-sm max-w-lg mx-auto leading-relaxed">
            30 years. 5 imprints. 265+ releases. Each label a different weapon in the same arsenal.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            {Object.values(LABEL_META).map(m => (
              <div key={m.color} className="w-2 h-2 rounded-full"
                style={{
                  background: m.color,
                  boxShadow: `0 0 8px ${m.color}80`,
                  animation: 'labelDotPulse 2s ease-in-out infinite',
                  animationDelay: `${Object.values(LABEL_META).indexOf(m) * 0.4}s`,
                }} />
            ))}
          </div>
        </div>

        {/* ── FLAGSHIP: TECHNODROME ── */}
        <div ref={flagshipVis.ref}
          className="mb-5 transition-all duration-1000"
          style={{
            opacity: flagshipVis.inView ? 1 : 0,
            transform: flagshipVis.inView ? 'translateY(0) scale(1)' : 'translateY(40px) scale(0.97)',
            transitionDelay: '0.15s',
          }}>
          {(() => {
            const meta = LABEL_META['Technodrome']
            const isHov = hoveredLabel === 'Technodrome'
            return (
              <div className="group relative rounded-2xl overflow-hidden cursor-default"
                onMouseEnter={() => setHoveredLabel('Technodrome')}
                onMouseLeave={() => setHoveredLabel(null)}
                style={{
                  background: isHov
                    ? 'linear-gradient(135deg, rgba(0,255,204,0.08) 0%, rgba(0,0,0,0.7) 50%, rgba(0,0,0,0.85) 100%)'
                    : 'linear-gradient(135deg, rgba(0,255,204,0.04) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)',
                  border: `1px solid rgba(0,255,204,${isHov ? '0.25' : '0.1'})`,
                  boxShadow: isHov ? '0 0 60px rgba(0,255,204,0.1), 0 20px 60px rgba(0,0,0,0.5)' : '0 4px 30px rgba(0,0,0,0.4)',
                  transition: 'all 0.5s ease',
                }}>
                {/* Giant background letter */}
                <div className="absolute inset-0 flex items-center justify-end overflow-hidden pointer-events-none">
                  <span className="font-vhs text-[16rem] md:text-[22rem] leading-none tracking-tight select-none"
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: isHov ? '1px rgba(0,255,204,0.08)' : '1px rgba(0,255,204,0.03)',
                      transition: 'all 0.5s ease',
                      transform: isHov ? 'translateX(-10px)' : 'translateX(0)',
                      marginRight: '-2rem',
                    }}>
                    T
                  </span>
                </div>

                {/* Animated border glow */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: isHov
                      ? 'linear-gradient(90deg, transparent, #00ffcc, transparent)'
                      : 'linear-gradient(90deg, transparent, rgba(0,255,204,0.2), transparent)',
                    transition: 'background 0.5s ease',
                  }} />

                <div className="relative p-8 md:p-12 flex flex-col md:flex-row md:items-center gap-8">
                  <div className="flex-1">
                    {/* Badge */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-3 h-3 rounded-full"
                        style={{
                          background: '#00ffcc',
                          boxShadow: '0 0 12px rgba(0,255,204,0.8), 0 0 24px rgba(0,255,204,0.4)',
                          animation: 'labelDotPulse 2s ease-in-out infinite',
                        }} />
                      <span className="font-vhs text-[10px] text-primary/60 tracking-[0.5em]">FLAGSHIP LABEL</span>
                    </div>

                    {/* Name */}
                    <h3 className="font-vhs text-4xl md:text-6xl tracking-wider mb-4"
                      style={{
                        color: '#00ffcc',
                        textShadow: isHov
                          ? '0 0 40px rgba(0,255,204,0.5), 0 0 80px rgba(0,255,204,0.2)'
                          : '0 0 20px rgba(0,255,204,0.15)',
                        transition: 'text-shadow 0.5s ease',
                      }}>
                      TECHNODROME
                    </h3>

                    <p className="text-sm leading-relaxed max-w-lg"
                      style={{
                        color: isHov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.7)',
                        transition: 'color 0.3s ease',
                      }}>
                      {meta.desc}
                    </p>
                  </div>

                  {/* Stats */}
                  <div className="flex gap-10 md:flex-col md:gap-6 md:text-right shrink-0">
                    <div>
                      <div className="font-vhs text-5xl md:text-6xl leading-none tabular-nums"
                        style={{
                          color: '#00ffcc',
                          textShadow: isHov ? '0 0 30px rgba(0,255,204,0.7)' : '0 0 15px rgba(0,255,204,0.2)',
                          transition: 'text-shadow 0.5s ease',
                        }}>
                        {meta.releases}+
                      </div>
                      <div className="font-vhs text-[9px] text-white/20 tracking-[0.4em] mt-1">RELEASES</div>
                    </div>
                    <div>
                      <div className="font-vhs text-5xl md:text-6xl leading-none tabular-nums"
                        style={{ color: 'rgba(0,255,204,0.35)' }}>
                        {meta.founded}
                      </div>
                      <div className="font-vhs text-[9px] text-white/20 tracking-[0.4em] mt-1">FOUNDED</div>
                    </div>
                  </div>
                </div>

                {/* Bottom glow */}
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{
                    background: isHov
                      ? 'linear-gradient(90deg, transparent, #00ffcc60, transparent)'
                      : 'transparent',
                    transition: 'background 0.5s ease',
                  }} />
              </div>
            )
          })()}
        </div>

        {/* ── 4 LABELS GRID ── */}
        <div ref={gridVis.ref} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-16">
          {otherLabels.map((label, idx) => {
            const meta = LABEL_META[label.name]
            if (!meta) return null
            const isHov = hoveredLabel === label.name

            return (
              <div key={label.name}
                className="group relative rounded-xl overflow-hidden cursor-default"
                onMouseEnter={() => setHoveredLabel(label.name)}
                onMouseLeave={() => setHoveredLabel(null)}
                style={{
                  opacity: gridVis.inView ? 1 : 0,
                  transform: gridVis.inView ? 'translateY(0)' : 'translateY(30px)',
                  transition: `all 0.7s ease ${0.1 + idx * 0.12}s`,
                  background: isHov
                    ? `linear-gradient(135deg, rgba(${meta.rgb},0.07) 0%, rgba(0,0,0,0.6) 100%)`
                    : 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.5) 100%)',
                  border: `1px solid rgba(${meta.rgb},${isHov ? '0.3' : '0.08'})`,
                  boxShadow: isHov
                    ? `0 0 40px rgba(${meta.rgb},0.12), 0 16px 48px rgba(0,0,0,0.5)`
                    : '0 4px 20px rgba(0,0,0,0.3)',
                }}>

                {/* Background letter(s) */}
                <div className="absolute top-0 right-2 bottom-0 flex items-center pointer-events-none overflow-hidden">
                  <span className="font-vhs text-[9rem] md:text-[11rem] leading-none select-none"
                    style={{
                      color: 'transparent',
                      WebkitTextStroke: `1px rgba(${meta.rgb},${isHov ? '0.08' : '0.03'})`,
                      transition: 'all 0.5s ease',
                      transform: isHov ? 'scale(1.05)' : 'scale(1)',
                    }}>
                    {meta.letter}
                  </span>
                </div>

                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-500"
                  style={{
                    background: `linear-gradient(180deg, transparent, ${meta.color}, transparent)`,
                    opacity: isHov ? 1 : 0.2,
                    boxShadow: isHov ? `0 0 15px ${meta.color}60` : 'none',
                  }} />

                {/* Top glow */}
                <div className="absolute top-0 left-0 right-0 h-px transition-all duration-500"
                  style={{
                    background: isHov
                      ? `linear-gradient(90deg, ${meta.color}, transparent 60%)`
                      : 'transparent',
                  }} />

                <div className="relative p-6 md:p-7 pl-7">
                  {/* Tag */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                      style={{
                        background: meta.color,
                        boxShadow: isHov ? `0 0 8px ${meta.color}` : 'none',
                      }} />
                    <span className="font-vhs text-[8px] tracking-[0.5em]"
                      style={{ color: `rgba(${meta.rgb},0.5)` }}>
                      {meta.tagline}
                    </span>
                  </div>

                  {/* Name */}
                  <h3 className="font-vhs text-xl md:text-2xl tracking-wider mb-3"
                    style={{
                      color: meta.color,
                      textShadow: isHov ? `0 0 25px rgba(${meta.rgb},0.5)` : 'none',
                      transition: 'text-shadow 0.4s ease',
                    }}>
                    {label.name.toUpperCase()}
                  </h3>

                  {/* Desc */}
                  <p className="text-xs leading-relaxed mb-5"
                    style={{
                      color: isHov ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.65)',
                      transition: 'color 0.3s ease',
                    }}>
                    {meta.desc}
                  </p>

                  {/* Stats */}
                  <div className="flex items-end justify-between pt-4"
                    style={{ borderTop: `1px solid rgba(${meta.rgb},${isHov ? '0.15' : '0.06'})`, transition: 'border-color 0.3s' }}>
                    <div>
                      <AnimatedCount target={meta.releases} color={meta.color} inView={gridVis.inView} />
                      <div className="font-vhs text-[7px] text-white/15 tracking-[0.4em] mt-1">RELEASES</div>
                    </div>
                    <div className="text-right">
                      <span className="font-vhs text-2xl text-white/25 tabular-nums leading-none">{meta.founded}</span>
                      <div className="font-vhs text-[7px] text-white/15 tracking-[0.4em] mt-1">FOUNDED</div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* ── STAT FOOTER ── */}
        <div ref={statsVis.ref}
          className="pt-10 border-t border-white/[0.04] relative transition-all duration-1000"
          style={{
            opacity: statsVis.inView ? 1 : 0,
            transform: statsVis.inView ? 'translateY(0)' : 'translateY(20px)',
            transitionDelay: '0.2s',
          }}>
          {/* Top glow accent */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background: 'linear-gradient(90deg, transparent, #00ffcc40, transparent)' }} />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0">
            {[
              { val: 5, suffix: '', label: 'IMPRINTS', color: '#00ffcc' },
              { val: 265, suffix: '+', label: 'TOTAL RELEASES', color: '#ff003c' },
              { val: 30, suffix: '', label: 'YEARS ACTIVE', color: '#9900ff' },
              { val: 1995, suffix: '', label: 'EST. RIJEKA', color: '#ff6600' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center py-4 ${i < 3 ? 'md:border-r md:border-white/[0.04]' : ''}`}>
                <div className="font-vhs leading-none mb-2 tabular-nums"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    color: stat.color,
                    opacity: 0.75,
                    textShadow: `0 0 30px ${stat.color}40`,
                  }}>
                  {stat.val}{stat.suffix}
                </div>
                <div className="font-vhs text-[9px] text-white/20 tracking-[0.4em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes labelDotPulse {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </section>
  )
}

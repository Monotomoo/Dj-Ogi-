import { useState, useEffect, useRef } from 'react'

interface Vinyl {
  title: string; label: string; cat: string; year: string
  bpm: number; color: string; rgb: string; side: string
}

const VINYLS: Vinyl[] = [
  { title: 'RIJEKA ACID', label: 'TECHNODROME', cat: 'TDR-001', year: '1998', bpm: 145, color: '#00ffcc', rgb: '0,255,204', side: 'A' },
  { title: 'HARD ATTACK', label: 'SUBMISSION', cat: 'SUB-022', year: '1998', bpm: 147, color: '#ffcc00', rgb: '255,204,0', side: 'A' },
  { title: 'PATTERNS EP', label: 'PATTERNS', cat: 'PAT-033', year: '1999', bpm: 144, color: '#00aaff', rgb: '0,170,255', side: 'A' },
  { title: 'GROOVE DESTROYER', label: 'PLANET RHYTHM', cat: 'PR-044', year: '1999', bpm: 143, color: '#ff8800', rgb: '255,136,0', side: 'B' },
  { title: 'WAREHOUSE DISTRICT', label: 'TECHNODROME', cat: 'TDR-005', year: '1999', bpm: 142, color: '#00ffcc', rgb: '0,255,204', side: 'A' },
  { title: 'CONCRETE', label: 'COMPRESSED', cat: 'CMP-011', year: '2000', bpm: 146, color: '#999999', rgb: '153,153,153', side: 'A' },
  { title: 'ADRIATIC BASS', label: 'TECHNODROME', cat: 'TDR-012', year: '2001', bpm: 146, color: '#00ffcc', rgb: '0,255,204', side: 'A' },
  { title: 'MACHINE FUNK', label: 'TECHNO FACTORY', cat: 'TF-003', year: '2001', bpm: 148, color: '#ff003c', rgb: '255,0,60', side: 'B' },
  { title: 'STEEL CITY', label: 'TECHNO FACTORY', cat: 'TF-007', year: '2002', bpm: 150, color: '#ff003c', rgb: '255,0,60', side: 'A' },
  { title: 'TECHNO CHURCH', label: 'TECHNO FACTORY', cat: 'TF-015', year: '2004', bpm: 149, color: '#ff003c', rgb: '255,0,60', side: 'A' },
  { title: 'DARK MATTER', label: 'DARK NOISE', cat: 'DN-001', year: '2005', bpm: 140, color: '#9900ff', rgb: '153,0,255', side: 'A' },
  { title: 'HYPNOSIS', label: 'DARK NOISE', cat: 'DN-008', year: '2006', bpm: 138, color: '#9900ff', rgb: '153,0,255', side: 'B' },
  { title: 'RAVE SIGNAL', label: 'BEAST MUSIC', cat: 'BM-001', year: '2008', bpm: 150, color: '#ff6600', rgb: '255,102,0', side: 'A' },
  { title: 'CROWD CONTROL', label: 'BEAST MUSIC', cat: 'BM-004', year: '2009', bpm: 148, color: '#ff6600', rgb: '255,102,0', side: 'B' },
  { title: 'NOISE FLOOR', label: 'DARK NOISE', cat: 'DN-015', year: '2010', bpm: 137, color: '#9900ff', rgb: '153,0,255', side: 'A' },
  { title: 'PEAK TIME WEAPON', label: 'BEAST MUSIC', cat: 'BM-009', year: '2010', bpm: 152, color: '#ff6600', rgb: '255,102,0', side: 'A' },
  { title: 'FOUR WALLS', label: 'NOISY ROOM', cat: 'NR-001', year: '2012', bpm: 135, color: '#cccccc', rgb: '204,204,204', side: 'A' },
  { title: 'BACK TO BASICS', label: 'BEAST MUSIC', cat: 'BM-020', year: '2015', bpm: 145, color: '#ff6600', rgb: '255,102,0', side: 'A' },
  { title: 'MIDNIGHT SHIFT', label: 'NOISY ROOM', cat: 'NR-005', year: '2018', bpm: 132, color: '#cccccc', rgb: '204,204,204', side: 'B' },
  { title: 'OLD SCHOOL VOL.6', label: 'TECHNODROME', cat: 'TDR-030', year: '2022', bpm: 143, color: '#00ffcc', rgb: '0,255,204', side: 'A' },
]

/* ── Cover art patterns per index ── */
function getCoverStyle(v: Vinyl, i: number): React.CSSProperties {
  const r = v.rgb
  const styles: React.CSSProperties[] = [
    // 0: Grid circuit
    { background: `repeating-linear-gradient(0deg, transparent, transparent 18px, rgba(${r},0.1) 18px, rgba(${r},0.1) 19px), repeating-linear-gradient(90deg, transparent, transparent 18px, rgba(${r},0.1) 18px, rgba(${r},0.1) 19px), radial-gradient(circle at 20% 80%, rgba(${r},0.2), transparent 50%), #0a0a0e` },
    // 1: Bold diagonal slash
    { background: `linear-gradient(135deg, transparent 40%, rgba(${r},0.25) 40%, rgba(${r},0.25) 42%, transparent 42%), linear-gradient(135deg, transparent 55%, rgba(${r},0.12) 55%, rgba(${r},0.12) 58%, transparent 58%), radial-gradient(circle at 80% 20%, rgba(${r},0.1), transparent 50%), #0a0a0e` },
    // 2: Concentric circles
    { background: `radial-gradient(circle at 50% 55%, transparent 15%, rgba(${r},0.12) 16%, transparent 17%, transparent 30%, rgba(${r},0.08) 31%, transparent 32%, transparent 45%, rgba(${r},0.05) 46%, transparent 47%), radial-gradient(circle at 50% 55%, rgba(${r},0.15), transparent 60%), #0a0a0e` },
    // 3: Horizontal bars
    { background: `repeating-linear-gradient(0deg, transparent, transparent 10px, rgba(${r},0.08) 10px, rgba(${r},0.08) 12px), linear-gradient(180deg, rgba(${r},0.15), transparent 30%, transparent 70%, rgba(${r},0.1)), #0a0a0e` },
    // 4: Corner triangle
    { background: `linear-gradient(225deg, rgba(${r},0.3) 0%, rgba(${r},0.15) 20%, transparent 40%), linear-gradient(45deg, rgba(${r},0.05), transparent 30%), #0a0a0e` },
    // 5: Noise dots
    { background: `radial-gradient(circle at 25% 25%, rgba(${r},0.15) 1px, transparent 1px), radial-gradient(circle at 75% 75%, rgba(${r},0.1) 1px, transparent 1px), radial-gradient(circle at 50% 50%, rgba(${r},0.2), transparent 40%), #0a0a0e`, backgroundSize: '12px 12px, 12px 12px, 100% 100%, 100%' },
    // 6: Vertical split
    { background: `linear-gradient(90deg, rgba(${r},0.18) 0%, rgba(${r},0.18) 4px, transparent 4px, transparent 50%, rgba(${r},0.06) 50%), #0a0a0e` },
    // 7: X cross
    { background: `linear-gradient(135deg, transparent 45%, rgba(${r},0.15) 45%, rgba(${r},0.15) 55%, transparent 55%), linear-gradient(45deg, transparent 45%, rgba(${r},0.1) 45%, rgba(${r},0.1) 55%, transparent 55%), #0a0a0e` },
    // 8: Radial burst
    { background: `conic-gradient(from 0deg at 50% 50%, rgba(${r},0.1) 0deg, transparent 30deg, rgba(${r},0.06) 60deg, transparent 90deg, rgba(${r},0.08) 120deg, transparent 150deg, rgba(${r},0.04) 180deg, transparent 210deg, rgba(${r},0.1) 240deg, transparent 270deg, rgba(${r},0.06) 300deg, transparent 330deg), #0a0a0e` },
    // 9: Bottom heavy gradient
    { background: `linear-gradient(0deg, rgba(${r},0.25) 0%, rgba(${r},0.08) 30%, transparent 60%), #0a0a0e` },
  ]
  return styles[i % styles.length]
}

/* ── Generative cover art ── */
function CoverArt({ vinyl, size = 'large', index = 0 }: { vinyl: Vinyl; size?: 'large' | 'thumb'; index?: number }) {
  const isLarge = size === 'large'
  return (
    <div className="w-full h-full relative overflow-hidden select-none group/cover"
      style={getCoverStyle(vinyl, index)}>

      {/* Animated shimmer overlay */}
      <div className="absolute inset-0 pointer-events-none cover-shimmer"
        style={{ background: `linear-gradient(110deg, transparent 30%, rgba(${vinyl.rgb},0.06) 50%, transparent 70%)`, backgroundSize: '200% 100%' }} />

      {/* Label initial — huge, outlined */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
        <span className="cover-letter" style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: isLarge ? '14rem' : '3.5rem',
          fontWeight: 900,
          color: 'transparent',
          WebkitTextStroke: isLarge ? `1.5px rgba(${vinyl.rgb},0.12)` : `1px rgba(${vinyl.rgb},0.15)`,
          lineHeight: 1,
          transition: 'all 0.5s ease',
        }}>
          {vinyl.label.split(' ').map(w => w[0]).join('')}
        </span>
      </div>

      {/* Colored accent edge — left + bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${vinyl.color}, rgba(${vinyl.rgb},0.3))` }} />
      <div className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, rgba(${vinyl.rgb},0.3), ${vinyl.color}, rgba(${vinyl.rgb},0.3))` }} />

      {/* Top-right corner accent triangle */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-60">
        <div className="absolute -top-8 -right-8 w-16 h-16 rotate-45"
          style={{ background: `rgba(${vinyl.rgb},0.15)` }} />
      </div>

      {/* Title text — large covers */}
      {isLarge && (
        <>
          <div className="absolute bottom-6 left-6 right-6 z-10">
            <div className="font-vhs text-2xl md:text-3xl text-white leading-tight tracking-wide mb-2"
              style={{ textShadow: `0 2px 15px rgba(0,0,0,0.9), 0 0 20px rgba(${vinyl.rgb},0.2)` }}>
              {vinyl.title}
            </div>
            <div className="font-vhs text-[10px] tracking-[0.4em]" style={{ color: `rgba(${vinyl.rgb},0.8)` }}>
              {vinyl.label}
            </div>
          </div>
          <div className="absolute top-5 right-5 text-right z-10">
            <div className="font-vhs text-[10px] text-white/25 tracking-widest">{vinyl.cat}</div>
            <div className="font-vhs text-[9px] text-white/15 mt-1">{vinyl.year}</div>
          </div>
          {/* Bottom gradient for text legibility */}
          <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
        </>
      )}

      {/* Thumbnail: show mini title */}
      {!isLarge && (
        <div className="absolute bottom-1 left-1 right-1 z-10">
          <div className="font-vhs text-[5px] text-white/60 truncate leading-tight">{vinyl.title}</div>
        </div>
      )}

      {/* VHS scan lines */}
      <div className="absolute inset-0 opacity-[0.06] pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)' }} />

      {/* RGB chromatic edge on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover/cover:opacity-100 transition-opacity duration-300"
        style={{ boxShadow: `inset 2px 0 0 rgba(0,255,204,0.2), inset -2px 0 0 rgba(255,0,60,0.2)` }} />
    </div>
  )
}

/* ── CSS Vinyl disc ── */
function VinylDisc({ vinyl, spinning }: { vinyl: Vinyl; spinning: boolean }) {
  return (
    <div className="w-full h-full rounded-full relative"
      style={{ animation: spinning ? 'vinylSpin 1.8s linear infinite' : 'none' }}>
      <div className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, #1a1a1a 0%, #111 16%, #1a1a1a 17%, #0f0f0f 24%, #181818 25%, #0e0e0e 34%, #171717 35%, #0d0d0d 44%, #161616 45%, #111 54%, #191919 55%, #0f0f0f 64%, #181818 65%, #111 78%, #1a1a1a 100%)`,
        }} />
      {[24, 32, 40, 48, 56, 64, 72, 80, 88].map(r => (
        <div key={r} className="absolute rounded-full" style={{ inset: `${(100 - r) / 2}%`, border: '0.5px solid rgba(255,255,255,0.025)' }} />
      ))}
      <div className="absolute inset-0 rounded-full" style={{ background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255,255,255,0.05) 25deg, transparent 50deg, transparent 180deg, rgba(255,255,255,0.025) 200deg, transparent 230deg)' }} />
      {spinning && (
        <div className="absolute inset-[20%] rounded-full" style={{ background: `radial-gradient(circle, rgba(${vinyl.rgb},0.12), transparent)`, animation: 'discGlow 2s ease-in-out infinite' }} />
      )}
      <div className="absolute rounded-full" style={{
        inset: '34%',
        background: `radial-gradient(circle at 40% 35%, ${vinyl.color}, rgba(${vinyl.rgb},0.7))`,
        boxShadow: `inset 0 2px 8px rgba(0,0,0,0.4), 0 0 ${spinning ? '15' : '6'}px rgba(${vinyl.rgb},${spinning ? '0.35' : '0.1'})`,
      }}>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-[12%] h-[12%] rounded-full bg-black/80" />
        </div>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-vhs text-[5px] text-black/50 tracking-wider">{vinyl.cat}</span>
          <span className="font-vhs text-[4px] text-black/35 tracking-widest mt-2">33⅓ RPM</span>
        </div>
      </div>
    </div>
  )
}

export default function VinylSection() {
  const [activeIdx, setActiveIdx] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [discOut, setDiscOut] = useState(true)
  const [inView, setInView] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const stripRef = useRef<HTMLDivElement>(null)
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const active = VINYLS[activeIdx]

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-rotate
  useEffect(() => {
    if (!inView) return
    const start = () => {
      autoRef.current = setInterval(() => {
        setActiveIdx(prev => (prev + 1) % VINYLS.length)
      }, 4500) as unknown as ReturnType<typeof setTimeout>
    }
    start()
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [inView])

  const selectVinyl = (i: number) => {
    if (i === activeIdx) return
    if (autoRef.current) clearInterval(autoRef.current)
    // Animate disc back in, switch, slide out
    setDiscOut(false)
    setTimeout(() => {
      setActiveIdx(i)
      setSpinning(false)
      setTimeout(() => setDiscOut(true), 100)
    }, 300)
    // Restart auto after idle
    autoRef.current = setTimeout(() => {
      autoRef.current = setInterval(() => {
        setActiveIdx(prev => (prev + 1) % VINYLS.length)
      }, 4500) as unknown as ReturnType<typeof setTimeout>
    }, 12000) as ReturnType<typeof setTimeout>
  }

  // Scroll active thumbnail into view
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    const thumb = strip.children[activeIdx] as HTMLElement
    if (thumb) {
      const offset = thumb.offsetLeft - strip.offsetWidth / 2 + thumb.offsetWidth / 2
      strip.scrollTo({ left: offset, behavior: 'smooth' })
    }
  }, [activeIdx])

  return (
    <section ref={sectionRef} className="relative pt-24 pb-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #050508 30%, #08080e 50%, #050508 70%, #000 100%)' }}>

      {/* Ambient spotlight */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full transition-all duration-1000"
          style={{ background: `radial-gradient(ellipse, rgba(${active.rgb},0.04) 0%, transparent 60%)`, filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div className="text-center mb-16"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(25px)', transition: 'all 0.8s ease' }}>
          <div className="font-vhs text-[9px] text-primary/40 tracking-[0.6em] mb-4">// PRESSED ON WAX</div>
          <h2 className="font-vhs text-5xl md:text-7xl text-white tracking-wider rgb-split mb-5">THE VAULT</h2>
          <p className="text-white/50 text-sm leading-relaxed max-w-2xl mx-auto">
            Before streaming, before digital, there was wax. Over 80 vinyl records pressed across 5 labels and
            international imprints — from Rijeka's underground studios to record shops in Berlin, London, and
            São Paulo. Each 12-inch is a piece of history, cut loud for warehouse sound systems and engineered
            to move dancefloors. This is a selection of 20 records that defined the DJ Ogi sound — the ones
            DJs hunted for, the ones that never left the crate, the ones that still hit hardest when the needle drops.
          </p>
        </div>

        {/* ── FEATURED DISPLAY ── */}
        <div className="mb-14"
          style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(30px)', transition: 'all 0.8s ease 0.2s' }}>

          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-0 justify-center">

            {/* Cover + Disc ensemble */}
            <div className="relative" style={{ width: 'min(380px, 85vw)', height: 'min(380px, 85vw)' }}>

              {/* The sleeve / cover art */}
              <div className="absolute inset-0 rounded-lg overflow-hidden z-10 transition-all duration-500"
                style={{
                  boxShadow: `0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(${active.rgb},0.06)`,
                  border: `1px solid rgba(${active.rgb},0.1)`,
                }}>
                <CoverArt vinyl={active} size="large" index={activeIdx} />
              </div>

              {/* The vinyl disc — slides out to the right */}
              <div className="absolute top-0 bottom-0 z-[5] transition-all duration-700 ease-out"
                style={{
                  width: 'min(340px, 80vw)',
                  left: discOut ? '55%' : '10%',
                  opacity: discOut ? 1 : 0,
                }}>
                <div className="w-full h-full p-4">
                  <VinylDisc vinyl={active} spinning={spinning} />
                </div>
              </div>

              {/* Shadow beneath disc */}
              <div className="absolute bottom-[-10px] left-[40%] w-[50%] h-4 rounded-full z-[4] transition-all duration-700"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.5), transparent)',
                  opacity: discOut ? 1 : 0,
                  filter: 'blur(8px)',
                }} />
            </div>

            {/* Track details — right side */}
            <div className="md:ml-[min(180px,15vw)] flex-shrink-0 md:w-56 text-center md:text-left">
              <div className="font-vhs text-[9px] tracking-[0.5em] mb-3 transition-colors duration-500"
                style={{ color: `rgba(${active.rgb},0.6)` }}>
                {active.label}
              </div>
              <div className="font-vhs text-2xl md:text-3xl text-white tracking-wider leading-tight mb-4 transition-colors duration-500">
                {active.title}
              </div>

              <div className="space-y-2 mb-6">
                <div className="flex items-center justify-center md:justify-start gap-4">
                  <span className="font-vhs text-[10px] text-white/25 tracking-widest">{active.cat}</span>
                  <span className="font-vhs text-[10px] text-white/25">{active.year}</span>
                  <span className="font-vhs text-[10px] text-white/25">SIDE {active.side}</span>
                </div>
              </div>

              {/* BPM — large */}
              <div className="mb-6">
                <span className="font-vhs text-5xl tabular-nums leading-none transition-all duration-500"
                  style={{
                    color: active.color,
                    textShadow: spinning ? `0 0 25px rgba(${active.rgb},0.6)` : `0 0 10px rgba(${active.rgb},0.2)`,
                  }}>
                  {active.bpm}
                </span>
                <span className="font-vhs text-xs text-white/20 ml-2 tracking-widest">BPM</span>
              </div>

              {/* Play / Spin toggle */}
              <button onClick={() => setSpinning(!spinning)}
                className="group flex items-center gap-3 mx-auto md:mx-0 transition-all duration-300"
                style={{
                  padding: '10px 24px',
                  borderRadius: '99px',
                  background: spinning ? `rgba(${active.rgb},0.1)` : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${spinning ? `rgba(${active.rgb},0.3)` : 'rgba(255,255,255,0.08)'}`,
                  boxShadow: spinning ? `0 0 20px rgba(${active.rgb},0.15)` : 'none',
                }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300"
                  style={{
                    background: spinning ? `rgba(${active.rgb},0.2)` : 'rgba(255,255,255,0.05)',
                    color: spinning ? active.color : 'rgba(255,255,255,0.4)',
                  }}>
                  {spinning ? (
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1.5" /><rect x="15" y="4" width="4" height="16" rx="1.5" /></svg>
                  ) : (
                    <svg className="w-3.5 h-3.5 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                  )}
                </div>
                <span className="font-vhs text-[10px] tracking-widest transition-colors duration-300"
                  style={{ color: spinning ? active.color : 'rgba(255,255,255,0.3)' }}>
                  {spinning ? 'SPINNING' : 'SPIN IT'}
                </span>
                {spinning && <div className="w-1.5 h-1.5 rounded-full bg-accent rec-dot shadow-[0_0_4px_#ff003c]" />}
              </button>

              {/* Nav */}
              <div className="flex items-center gap-4 mt-5 justify-center md:justify-start">
                <button onClick={() => selectVinyl((activeIdx - 1 + VINYLS.length) % VINYLS.length)}
                  className="font-vhs text-[10px] text-white/20 hover:text-primary transition-colors tracking-widest">◄ PREV</button>
                <span className="font-vhs text-[9px] text-white/10 tabular-nums">{String(activeIdx + 1).padStart(2, '0')} / {VINYLS.length}</span>
                <button onClick={() => selectVinyl((activeIdx + 1) % VINYLS.length)}
                  className="font-vhs text-[10px] text-white/20 hover:text-primary transition-colors tracking-widest">NEXT ►</button>
              </div>
            </div>
          </div>
        </div>

        {/* ── COVER STRIP — browse the collection ── */}
        <div style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.8s ease 0.4s' }}>
          <div className="flex items-center gap-4 mb-4 px-1">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-white/[0.06]" />
            <span className="font-vhs text-[9px] text-white/15 tracking-[0.5em]">BROWSE COLLECTION</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-white/[0.06]" />
          </div>

          {/* Horizontal scroll strip */}
          <div className="relative">
            {/* Edge fades */}
            <div className="absolute left-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to right, #050508, transparent)' }} />
            <div className="absolute right-0 top-0 bottom-0 w-12 z-10 pointer-events-none" style={{ background: 'linear-gradient(to left, #050508, transparent)' }} />

            <div ref={stripRef}
              className="flex gap-3 overflow-x-auto py-3 px-4 vinyl-strip-scroll"
              style={{ scrollbarWidth: 'none' }}>
              {VINYLS.map((v, i) => {
                const isActive = i === activeIdx
                return (
                  <button key={v.cat} onClick={() => selectVinyl(i)}
                    className="shrink-0 rounded-md overflow-hidden transition-all duration-400 relative group"
                    style={{
                      width: isActive ? '90px' : '72px',
                      height: isActive ? '90px' : '72px',
                      border: `1px solid ${isActive ? v.color + '50' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isActive ? `0 0 20px rgba(${v.rgb},0.2), 0 8px 20px rgba(0,0,0,0.5)` : '0 4px 12px rgba(0,0,0,0.3)',
                      transform: isActive ? 'translateY(-6px)' : 'translateY(0)',
                    }}>
                    <CoverArt vinyl={v} size="thumb" index={i} />
                    {/* Hover glow */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      style={{ background: `rgba(${v.rgb},0.08)` }} />
                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: v.color, boxShadow: `0 0 4px ${v.color}` }} />
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div className="mt-14 pt-6 border-t border-white/[0.04] text-center"
          style={{ opacity: inView ? 1 : 0, transition: 'opacity 0.8s ease 0.6s' }}>
          <span className="font-vhs text-[8px] text-white/[0.08] tracking-[0.5em]">
            80+ VINYL PRESSED // 12&quot; // 33⅓ RPM // HEAVYWEIGHT WAX
          </span>
        </div>
      </div>

      <style>{`
        @keyframes vinylSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes discGlow { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
        .vinyl-strip-scroll::-webkit-scrollbar { display: none; }

        /* Cover shimmer sweep */
        .cover-shimmer {
          animation: coverShimmer 4s ease-in-out infinite;
        }
        @keyframes coverShimmer {
          0% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Letter subtle float */
        .cover-letter {
          animation: coverLetterFloat 6s ease-in-out infinite;
        }
        @keyframes coverLetterFloat {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-2px); }
        }
      `}</style>
    </section>
  )
}

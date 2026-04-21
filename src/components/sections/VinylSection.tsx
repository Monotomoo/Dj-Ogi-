import { useState, useEffect, useRef } from 'react'

interface Vinyl {
  title: string; label: string; cat: string; year: string
  bpm: number; color: string; rgb: string; side: string
  coverImage?: string
  backCoverImage?: string
}

const VINYLS: Vinyl[] = [
  { title: 'RIJEKA ACID', label: 'TECHNODROME', cat: 'TDR-001', year: '1998', bpm: 145, color: '#00ffcc', rgb: '0,255,204', side: 'A' },
  { title: 'JOURNEY', label: 'SUBMISSIONS', cat: 'SUBMISSLP-001', year: '2003', bpm: 145, color: '#ffffff', rgb: '255,255,255', side: 'A', coverImage: '/vault/journey-front.jpg', backCoverImage: '/vault/journey-back.jpg' },
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

/* ── Single face of the cover (front or back) ── */
function CoverFace({ vinyl, image, size, index, isBack = false }:
  { vinyl: Vinyl; image?: string; size: 'large' | 'thumb'; index: number; isBack?: boolean }) {
  const isLarge = size === 'large'
  const hasRealCover = !!image
  return (
    <div className="absolute inset-0 overflow-hidden"
      style={{
        ...(hasRealCover ? { background: '#000' } : getCoverStyle(vinyl, index)),
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        transform: isBack ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>

      {hasRealCover && (
        <img
          src={image}
          alt={`${vinyl.title} — ${vinyl.label}${isBack ? ' (back)' : ''}`}
          className="absolute inset-0 w-full h-full object-cover cover-img-breathe"
          style={{ filter: 'saturate(0.95) contrast(1.05)' }}
        />
      )}

      {/* Shimmer sweep */}
      <div className="absolute inset-0 pointer-events-none cover-shimmer"
        style={{ background: `linear-gradient(110deg, transparent 30%, rgba(${vinyl.rgb},0.06) 50%, transparent 70%)`, backgroundSize: '200% 100%' }} />

      {/* Vertical tracking bar (slow sweep) — only on large */}
      {isLarge && (
        <div className="absolute left-0 right-0 h-6 pointer-events-none cover-tracking-bar"
          style={{
            background: `linear-gradient(180deg, transparent, rgba(${vinyl.rgb},0.12) 40%, rgba(255,255,255,0.05) 50%, rgba(${vinyl.rgb},0.12) 60%, transparent)`,
            mixBlendMode: 'screen',
          }} />
      )}

      {/* Random glitch bar */}
      {isLarge && (
        <div className="absolute left-0 right-0 pointer-events-none cover-glitch-bar"
          style={{
            height: '3px',
            top: '45%',
            background: `linear-gradient(90deg, transparent, rgba(${vinyl.rgb},0.3), rgba(0,255,204,0.2), rgba(255,0,60,0.2), transparent)`,
            mixBlendMode: 'screen',
          }} />
      )}

      {/* Generative: huge label letter */}
      {!hasRealCover && (
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="cover-letter" style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: isLarge ? '14rem' : '3.5rem',
            fontWeight: 900,
            color: 'transparent',
            WebkitTextStroke: isLarge ? `1.5px rgba(${vinyl.rgb},0.12)` : `1px rgba(${vinyl.rgb},0.15)`,
            lineHeight: 1,
          }}>
            {vinyl.label.split(' ').map(w => w[0]).join('')}
          </span>
        </div>
      )}

      {/* L-frame accents */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${vinyl.color}, rgba(${vinyl.rgb},0.3))` }} />
      <div className="absolute top-0 left-0 bottom-0 w-[3px]"
        style={{ background: `linear-gradient(180deg, rgba(${vinyl.rgb},0.3), ${vinyl.color}, rgba(${vinyl.rgb},0.3))` }} />

      {/* Corner triangle */}
      <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-60 pointer-events-none">
        <div className="absolute -top-8 -right-8 w-16 h-16 rotate-45"
          style={{ background: `rgba(${vinyl.rgb},0.15)` }} />
      </div>

      {/* VINYL badge (front only) */}
      {hasRealCover && !isBack && (
        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded"
          style={{ background: `rgba(${vinyl.rgb},0.85)`, backdropFilter: 'blur(4px)' }}>
          <span className="font-vhs text-[6px] tracking-widest text-black font-bold">VINYL</span>
        </div>
      )}

      {/* B-SIDE badge on back */}
      {hasRealCover && isBack && (
        <div className="absolute top-2 left-2 z-20 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(4px)' }}>
          <span className="font-vhs text-[6px] tracking-widest text-black font-bold">TRACKLIST</span>
        </div>
      )}

      {/* Generative title overlay */}
      {isLarge && !hasRealCover && (
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
          <div className="absolute bottom-0 left-0 right-0 h-1/2 pointer-events-none"
            style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
        </>
      )}

      {!isLarge && !hasRealCover && (
        <div className="absolute bottom-1 left-1 right-1 z-10">
          <div className="font-vhs text-[5px] text-white/60 truncate leading-tight">{vinyl.title}</div>
        </div>
      )}

      {/* Hard scan lines (stronger on large) */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          opacity: isLarge ? 0.1 : 0.06,
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)',
        }} />

      {/* RGB chromatic edge bleed */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 2px 0 0 rgba(0,255,204,0.15), inset -2px 0 0 rgba(255,0,60,0.15)' }} />

      {/* Chromatic flash — rare */}
      {isLarge && (
        <div className="absolute inset-0 pointer-events-none cover-chroma-pulse"
          style={{
            background: `linear-gradient(90deg, rgba(0,255,204,0.08) 0%, transparent 50%, rgba(255,0,60,0.08) 100%)`,
            mixBlendMode: 'screen',
          }} />
      )}

      {/* Tape grain noise (subtle) */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.5) 1px, transparent 1px), radial-gradient(circle at 70% 60%, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '3px 3px, 5px 5px',
        }} />

      {/* Vignette */}
      {isLarge && (
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.35) 100%)' }} />
      )}
    </div>
  )
}

/* ── Cover art with flip interaction ── */
function CoverArt({ vinyl, size = 'large', index = 0 }: { vinyl: Vinyl; size?: 'large' | 'thumb'; index?: number }) {
  const [flipped, setFlipped] = useState(false)
  const hasBack = !!vinyl.backCoverImage
  const isLarge = size === 'large'

  return (
    <div className="w-full h-full relative select-none group/cover"
      style={{ perspective: '1600px' }}
      onMouseEnter={() => hasBack && setFlipped(true)}
      onMouseLeave={() => hasBack && setFlipped(false)}>

      <div className="absolute inset-0 rounded-[inherit]"
        style={{
          transformStyle: 'preserve-3d',
          transition: 'transform 0.9s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}>
        <CoverFace vinyl={vinyl} image={vinyl.coverImage} size={size} index={index} />
        {hasBack && (
          <CoverFace vinyl={vinyl} image={vinyl.backCoverImage} size={size} index={index} isBack />
        )}
      </div>

      {/* "FLIP" hint badge — only when back exists and not flipped */}
      {hasBack && isLarge && !flipped && (
        <div className="absolute bottom-3 right-3 z-30 px-2 py-1 rounded pointer-events-none"
          style={{
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
          <span className="font-vhs text-[8px] tracking-widest text-white/70">⟲ HOVER TO FLIP</span>
        </div>
      )}
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
  const [discOut, setDiscOut] = useState(false) // disc starts tucked inside sleeve
  const [inView, setInView] = useState(false)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
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

  // Auto-rotate — only when NOT spinning (so user's listening is never interrupted)
  useEffect(() => {
    if (!inView || spinning) return
    autoRef.current = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % VINYLS.length)
    }, 5000) as unknown as ReturnType<typeof setTimeout>
    return () => { if (autoRef.current) clearInterval(autoRef.current) }
  }, [inView, spinning])

  const selectVinyl = (i: number) => {
    if (i === activeIdx) return
    if (autoRef.current) clearInterval(autoRef.current)
    // If disc is out, slide it back in before swapping sleeve
    if (discOut || spinning) {
      setSpinning(false)
      setDiscOut(false)
      setTimeout(() => setActiveIdx(i), 500)
    } else {
      setActiveIdx(i)
    }
  }

  // Play / pause toggle — slides disc out & spins, or tucks it back in
  const togglePlay = () => {
    if (spinning) {
      // Pause → stop spin, slide disc back in
      setSpinning(false)
      setTimeout(() => setDiscOut(false), 150)
    } else {
      // Play → slide disc out, then start spinning once it's clear
      setDiscOut(true)
      setTimeout(() => setSpinning(true), 450)
    }
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
    <section id="vault" ref={sectionRef} className="relative pt-24 pb-12 overflow-hidden"
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

            {/* Cover + Disc ensemble — disc always BEHIND the sleeve, slides out to the right on PLAY */}
            <div className="relative" style={{ width: 'min(380px, 85vw)', height: 'min(380px, 85vw)' }}>

              {/* Shadow beneath disc (z-[3] — under everything) */}
              <div className="absolute bottom-[-10px] left-[38%] w-[58%] h-4 rounded-full z-[3] transition-all duration-700 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.55), transparent)',
                  opacity: discOut ? 1 : 0,
                  filter: 'blur(10px)',
                }} />

              {/* The vinyl disc — ALWAYS z-[5], lives behind the sleeve.
                  When tucked: fully hidden under the sleeve.
                  When out: right half peeks out past the sleeve's right edge (like a real record jacket). */}
              <div className="absolute top-0 bottom-0 z-[5] ease-out"
                style={{
                  width: 'min(340px, 80vw)',
                  left: discOut ? '55%' : '4%',
                  opacity: discOut ? 1 : 0,
                  transition: 'left 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 500ms ease',
                  filter: discOut ? `drop-shadow(0 12px 24px rgba(0,0,0,0.7))` : 'none',
                }}>
                <div className="w-full h-full p-4">
                  <VinylDisc vinyl={active} spinning={spinning} />
                </div>
              </div>

              {/* The sleeve / cover art — z-10, always in front of the disc */}
              <div className="absolute inset-0 rounded-lg overflow-hidden z-10 transition-all duration-500"
                style={{
                  boxShadow: spinning
                    ? `0 20px 60px rgba(0,0,0,0.85), 0 0 60px rgba(${active.rgb},0.18), 0 0 100px rgba(${active.rgb},0.08)`
                    : `0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(${active.rgb},0.06)`,
                  border: `1px solid rgba(${active.rgb},${spinning ? '0.25' : '0.1'})`,
                }}>
                <CoverArt vinyl={active} size="large" index={activeIdx} />
              </div>

              {/* Sleeve opening shadow on the right edge — subtle dark gradient that sells the "record coming out of the jacket" illusion */}
              <div className="absolute top-0 bottom-0 right-0 w-6 rounded-r-lg z-20 pointer-events-none transition-opacity duration-500"
                style={{
                  opacity: discOut ? 0.9 : 0,
                  background: 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.7) 100%)',
                  boxShadow: 'inset -1px 0 0 rgba(0,0,0,0.4)',
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

              {/* BIG Play / Spin button — pulsing rings, chromatic hover, signature glow */}
              <button onClick={togglePlay}
                onMouseEnter={() => setHoveredIdx(-1)}
                onMouseLeave={() => setHoveredIdx(null)}
                className="group relative flex items-center gap-5 mx-auto md:mx-0 select-none"
                style={{ padding: '6px 6px 6px 6px', background: 'transparent', border: 'none' }}>

                {/* Outer pulsing ring — only when spinning */}
                {spinning && (
                  <>
                    <span aria-hidden className="absolute rounded-full pointer-events-none spin-ring-1"
                      style={{
                        left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 88, height: 88,
                        border: `2px solid rgba(${active.rgb},0.55)`,
                      }} />
                    <span aria-hidden className="absolute rounded-full pointer-events-none spin-ring-2"
                      style={{
                        left: 0, top: '50%', transform: 'translateY(-50%)',
                        width: 88, height: 88,
                        border: `1px solid rgba(${active.rgb},0.35)`,
                      }} />
                  </>
                )}

                {/* Main circular button — 88px */}
                <span className="relative flex items-center justify-center rounded-full transition-all duration-300"
                  style={{
                    width: 88, height: 88,
                    background: spinning
                      ? `radial-gradient(circle at 35% 30%, rgba(${active.rgb},0.35), rgba(${active.rgb},0.15) 60%, rgba(0,0,0,0.6))`
                      : `radial-gradient(circle at 35% 30%, rgba(${active.rgb},0.22), rgba(0,0,0,0.8))`,
                    border: `2px solid ${spinning ? active.color : `rgba(${active.rgb},0.45)`}`,
                    boxShadow: spinning
                      ? `0 0 40px rgba(${active.rgb},0.55), 0 0 80px rgba(${active.rgb},0.2), inset 0 0 20px rgba(${active.rgb},0.25)`
                      : `0 0 20px rgba(${active.rgb},0.25), inset 0 0 15px rgba(0,0,0,0.6)`,
                  }}>
                  {/* RGB chromatic ghost icons on hover */}
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: hoveredIdx === -1 ? 1 : 0,
                      transform: 'translate(-3px, 0)',
                      color: 'rgba(255,0,60,0.55)',
                      mixBlendMode: 'screen',
                    }}>
                    {spinning ? (
                      <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                    )}
                  </span>
                  <span aria-hidden className="absolute inset-0 flex items-center justify-center pointer-events-none transition-opacity duration-300"
                    style={{
                      opacity: hoveredIdx === -1 ? 1 : 0,
                      transform: 'translate(3px, 0)',
                      color: 'rgba(0,255,204,0.55)',
                      mixBlendMode: 'screen',
                    }}>
                    {spinning ? (
                      <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                    )}
                  </span>

                  {/* Real icon */}
                  <span className="relative transition-transform duration-300"
                    style={{
                      color: '#fff',
                      filter: `drop-shadow(0 0 6px ${active.color})`,
                      transform: hoveredIdx === -1 ? 'scale(1.08)' : 'scale(1)',
                    }}>
                    {spinning ? (
                      <svg className="w-9 h-9" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="4" width="4" height="16" rx="1" /><rect x="15" y="4" width="4" height="16" rx="1" /></svg>
                    ) : (
                      <svg className="w-10 h-10 ml-1" fill="currentColor" viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                    )}
                  </span>

                  {/* Scan lines inside button */}
                  <span aria-hidden className="absolute inset-0 rounded-full pointer-events-none opacity-25"
                    style={{
                      backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.12) 2px, rgba(255,255,255,0.12) 3px)',
                    }} />
                </span>

                {/* Label */}
                <span className="flex flex-col items-start">
                  <span className="font-vhs text-[9px] text-white/30 tracking-[0.4em] mb-1">
                    {spinning ? '// NOW PLAYING' : '// PRESS PLAY'}
                  </span>
                  <span className="font-vhs text-xl tracking-[0.25em] transition-all duration-300"
                    style={{
                      color: spinning ? active.color : '#fff',
                      textShadow: spinning ? `0 0 20px rgba(${active.rgb},0.7)` : 'none',
                      letterSpacing: spinning ? '0.35em' : '0.25em',
                    }}>
                    {spinning ? 'SPINNING' : 'SPIN IT'}
                  </span>
                  {spinning && (
                    <span className="flex items-center gap-1.5 mt-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-accent rec-dot shadow-[0_0_6px_#ff003c]" />
                      <span className="font-vhs text-[8px] text-accent/70 tracking-widest">REC</span>
                    </span>
                  )}
                </span>
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
                const isHovered = hoveredIdx === i
                const size = isHovered ? 120 : isActive ? 96 : 72
                const lift = isHovered ? -14 : isActive ? -6 : 0
                return (
                  <button key={v.cat} onClick={() => selectVinyl(i)}
                    onMouseEnter={() => setHoveredIdx(i)}
                    onMouseLeave={() => setHoveredIdx(null)}
                    className="shrink-0 rounded-md overflow-hidden relative group"
                    style={{
                      width: size,
                      height: size,
                      border: `1px solid ${isHovered ? v.color : isActive ? v.color + '60' : 'rgba(255,255,255,0.06)'}`,
                      boxShadow: isHovered
                        ? `0 0 30px rgba(${v.rgb},0.5), 0 0 60px rgba(${v.rgb},0.2), 0 12px 30px rgba(0,0,0,0.7)`
                        : isActive
                          ? `0 0 20px rgba(${v.rgb},0.25), 0 8px 20px rgba(0,0,0,0.5)`
                          : '0 4px 12px rgba(0,0,0,0.3)',
                      transform: `translateY(${lift}px)`,
                      transition: 'width 0.35s cubic-bezier(0.34,1.56,0.64,1), height 0.35s cubic-bezier(0.34,1.56,0.64,1), transform 0.35s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease, border 0.3s ease',
                      zIndex: isHovered ? 20 : isActive ? 10 : 1,
                    }}>
                    <CoverArt vinyl={v} size="thumb" index={i} />

                    {/* Hover glow overlay */}
                    <div className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        background: `radial-gradient(circle at 50% 40%, rgba(${v.rgb},0.15), transparent 70%)`,
                      }} />

                    {/* Hover: title + label overlay */}
                    <div className="absolute inset-x-0 bottom-0 p-1.5 pointer-events-none transition-all duration-300"
                      style={{
                        opacity: isHovered ? 1 : 0,
                        transform: isHovered ? 'translateY(0)' : 'translateY(8px)',
                        background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                      }}>
                      <div className="font-vhs text-[8px] text-white truncate leading-tight tracking-wider"
                        style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                        {v.title}
                      </div>
                      <div className="font-vhs text-[6px] truncate tracking-widest mt-0.5"
                        style={{ color: `rgba(${v.rgb},0.85)` }}>
                        {v.label}
                      </div>
                    </div>

                    {/* Hover: play icon peeking from top-right */}
                    {isHovered && !isActive && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center pointer-events-none"
                        style={{ background: 'rgba(0,0,0,0.7)', border: `1px solid ${v.color}`, boxShadow: `0 0 8px rgba(${v.rgb},0.6)` }}>
                        <svg className="w-2.5 h-2.5 ml-0.5" fill={v.color} viewBox="0 0 24 24"><polygon points="6,3 20,12 6,21" /></svg>
                      </div>
                    )}

                    {/* Hover: scan lines overlay */}
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                      style={{
                        opacity: isHovered ? 0.3 : 0,
                        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.25) 2px, rgba(255,255,255,0.25) 3px)',
                      }} />

                    {/* Active indicator dot */}
                    {isActive && (
                      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                        style={{ background: v.color, boxShadow: `0 0 6px ${v.color}` }} />
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

        /* Vertical tracking bar — slow sweep with random glitch */
        .cover-tracking-bar {
          animation: coverTrackingBar 7s linear infinite;
          top: -6%;
        }
        @keyframes coverTrackingBar {
          0% { top: -6%; opacity: 0; }
          5% { opacity: 0.8; }
          50% { top: 50%; opacity: 0.6; }
          95% { opacity: 0.5; }
          100% { top: 106%; opacity: 0; }
        }

        /* Random glitch bar — jumps, shifts, disappears */
        .cover-glitch-bar {
          animation: coverGlitchBar 5s steps(1) infinite;
        }
        @keyframes coverGlitchBar {
          0%, 100% { opacity: 0; transform: translateX(0); top: 30%; }
          92% { opacity: 0; top: 30%; }
          93% { opacity: 1; transform: translateX(-6px); top: 22%; }
          94% { opacity: 0.6; transform: translateX(4px); top: 68%; }
          95% { opacity: 1; transform: translateX(-2px); top: 45%; }
          96% { opacity: 0.3; transform: translateX(3px); top: 80%; }
          97% { opacity: 0; top: 30%; }
        }

        /* Chromatic edge pulse — breathes */
        .cover-chroma-pulse {
          animation: coverChromaPulse 3.5s ease-in-out infinite;
          opacity: 0.35;
        }
        @keyframes coverChromaPulse {
          0%, 100% { opacity: 0.25; }
          50% { opacity: 0.55; }
        }

        /* Breathing image — slight zoom cycle */
        .cover-img-breathe {
          animation: coverImgBreathe 8s ease-in-out infinite;
        }
        @keyframes coverImgBreathe {
          0%, 100% { transform: scale(1); filter: saturate(0.95) contrast(1.05); }
          50% { transform: scale(1.02); filter: saturate(1.05) contrast(1.1); }
        }

        /* Play button pulsing rings */
        .spin-ring-1 {
          animation: spinRingPulse 1.8s ease-out infinite;
        }
        .spin-ring-2 {
          animation: spinRingPulse 1.8s ease-out infinite;
          animation-delay: 0.9s;
        }
        @keyframes spinRingPulse {
          0%   { transform: translateY(-50%) scale(1);   opacity: 0.9; }
          100% { transform: translateY(-50%) scale(1.7); opacity: 0; }
        }
      `}</style>
    </section>
  )
}

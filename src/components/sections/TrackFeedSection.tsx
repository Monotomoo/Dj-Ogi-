import { useState, useEffect, useRef } from 'react'

interface Track {
  title: string
  label: string
  color: string
  rgb: string
  bpm: number
  duration: string
  pattern: number
}

type Category = 'upcoming' | 'trending' | 'recent'

const TRACKS: Record<Category, Track[]> = {
  upcoming: [
    { title: 'WAREHOUSE RITUAL', label: 'TECHNODROME', color: '#00ffcc', rgb: '0,255,204', bpm: 146, duration: '6:42', pattern: 0 },
    { title: 'SIGNAL LOST', label: 'DARK NOISE', color: '#9900ff', rgb: '153,0,255', bpm: 138, duration: '7:18', pattern: 2 },
    { title: 'IRON PULSE', label: 'TECHNO FACTORY', color: '#ff003c', rgb: '255,0,60', bpm: 149, duration: '6:55', pattern: 1 },
  ],
  trending: [
    { title: 'RIJEKA RAVE', label: 'TECHNODROME', color: '#00ffcc', rgb: '0,255,204', bpm: 145, duration: '6:30', pattern: 4 },
    { title: 'NIGHT DRIVER', label: 'BEAST MUSIC', color: '#ff6600', rgb: '255,102,0', bpm: 150, duration: '7:02', pattern: 8 },
    { title: 'DARK CIRCUIT', label: 'DARK NOISE', color: '#9900ff', rgb: '153,0,255', bpm: 140, duration: '8:15', pattern: 5 },
  ],
  recent: [
    { title: 'OLD SCHOOL VOL.7', label: 'TECHNODROME', color: '#00ffcc', rgb: '0,255,204', bpm: 143, duration: '7:45', pattern: 3 },
    { title: 'BASS WEAPON', label: 'BEAST MUSIC', color: '#ff6600', rgb: '255,102,0', bpm: 148, duration: '6:12', pattern: 7 },
    { title: 'MACHINE DREAMS', label: 'TECHNO FACTORY', color: '#ff003c', rgb: '255,0,60', bpm: 147, duration: '7:30', pattern: 6 },
  ],
}

const CATEGORIES: { id: Category; label: string; badge: string; color: string; rgb: string }[] = [
  { id: 'upcoming', label: 'UPCOMING', badge: 'SOON', color: '#ffcc00', rgb: '255,204,0' },
  { id: 'trending', label: 'TRENDING', badge: 'HOT', color: '#ff003c', rgb: '255,0,60' },
  { id: 'recent', label: 'RECENT', badge: 'NEW', color: '#00ffcc', rgb: '0,255,204' },
]

function getPatternBg(pattern: number, rgb: string): string {
  const styles = [
    `repeating-linear-gradient(0deg, transparent, transparent 8px, rgba(${rgb},0.1) 8px, rgba(${rgb},0.1) 9px), repeating-linear-gradient(90deg, transparent, transparent 8px, rgba(${rgb},0.1) 8px, rgba(${rgb},0.1) 9px), radial-gradient(circle at 30% 70%, rgba(${rgb},0.28), transparent 60%), #0a0a0e`,
    `linear-gradient(135deg, transparent 38%, rgba(${rgb},0.35) 38%, rgba(${rgb},0.35) 44%, transparent 44%), radial-gradient(circle at 75% 25%, rgba(${rgb},0.15), transparent 50%), #0a0a0e`,
    `radial-gradient(circle at 50% 55%, transparent 12%, rgba(${rgb},0.18) 13%, transparent 14%, transparent 28%, rgba(${rgb},0.1) 29%, transparent 30%), radial-gradient(circle at 50% 55%, rgba(${rgb},0.22), transparent 55%), #0a0a0e`,
    `repeating-linear-gradient(0deg, transparent, transparent 5px, rgba(${rgb},0.12) 5px, rgba(${rgb},0.12) 6px), linear-gradient(180deg, rgba(${rgb},0.22), transparent 50%), #0a0a0e`,
    `linear-gradient(225deg, rgba(${rgb},0.4) 0%, rgba(${rgb},0.15) 25%, transparent 50%), #0a0a0e`,
    `radial-gradient(circle at 25% 25%, rgba(${rgb},0.22) 1.5px, transparent 1.5px), radial-gradient(circle at 75% 75%, rgba(${rgb},0.14) 1.5px, transparent 1.5px), radial-gradient(circle at 50% 50%, rgba(${rgb},0.25), transparent 45%), #0a0a0e`,
    `linear-gradient(90deg, rgba(${rgb},0.3) 0%, rgba(${rgb},0.3) 3px, transparent 3px, transparent 60%, rgba(${rgb},0.1) 60%), #0a0a0e`,
    `linear-gradient(135deg, transparent 44%, rgba(${rgb},0.22) 44%, rgba(${rgb},0.22) 56%, transparent 56%), linear-gradient(45deg, transparent 44%, rgba(${rgb},0.14) 44%, rgba(${rgb},0.14) 56%, transparent 56%), #0a0a0e`,
    `conic-gradient(from 0deg at 50% 50%, rgba(${rgb},0.18) 0deg, transparent 30deg, rgba(${rgb},0.1) 60deg, transparent 90deg, rgba(${rgb},0.12) 120deg, transparent 150deg), #0a0a0e`,
  ]
  return styles[pattern % styles.length]
}

function TrackCard({ track, index, inView, badge, badgeColor, glitching }:
  { track: Track; index: number; inView: boolean; badge: string; badgeColor: string; glitching: boolean }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`relative rounded-lg overflow-hidden cursor-pointer group ${glitching ? 'track-card-glitch' : ''}`}
      style={{
        background: '#0a0a0e',
        border: `1px solid ${hovered ? track.color + '50' : 'rgba(255,255,255,0.06)'}`,
        boxShadow: hovered
          ? `0 12px 30px rgba(0,0,0,0.6), 0 0 24px rgba(${track.rgb},0.15)`
          : '0 4px 14px rgba(0,0,0,0.4)',
        transform: hovered ? 'translateY(-3px) scale(1.02)' : 'translateY(0)',
        transition: 'border 0.3s, box-shadow 0.3s, transform 0.3s cubic-bezier(0.34, 1.2, 0.64, 1)',
        opacity: inView ? 1 : 0,
        transitionDelay: `${index * 0.1}s`,
      }}>

      {/* Cover art — reduced to 4:3 aspect (shorter) */}
      <div className="relative aspect-[4/3] overflow-hidden"
        style={{ background: getPatternBg(track.pattern, track.rgb) }}>

        {/* Glitch slice layers — only visible when glitching */}
        {glitching && (
          <>
            <div className="absolute inset-0 track-glitch-slice-1 pointer-events-none"
              style={{ background: getPatternBg(track.pattern, track.rgb), mixBlendMode: 'screen' }} />
            <div className="absolute inset-0 track-glitch-slice-2 pointer-events-none"
              style={{ background: `rgba(${track.rgb},0.3)`, mixBlendMode: 'screen' }} />
            <div className="absolute inset-0 track-glitch-slice-3 pointer-events-none"
              style={{ background: 'rgba(255,0,60,0.2)', mixBlendMode: 'screen' }} />
          </>
        )}

        {/* Floating label initial */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
          <span className="track-letter-float"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '4rem',
              fontWeight: 900,
              color: 'transparent',
              WebkitTextStroke: `1px rgba(${track.rgb},0.22)`,
              lineHeight: 1,
            }}>
            {track.label.split(' ').map(w => w[0]).join('')}
          </span>
        </div>

        {/* Accent edges */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px]"
          style={{ background: `linear-gradient(90deg, ${track.color}, rgba(${track.rgb},0.3))` }} />
        <div className="absolute top-0 left-0 bottom-0 w-[2px]"
          style={{ background: `linear-gradient(180deg, rgba(${track.rgb},0.3), ${track.color}, rgba(${track.rgb},0.3))` }} />

        {/* Shimmer */}
        <div className="absolute inset-0 pointer-events-none track-shimmer"
          style={{ background: `linear-gradient(110deg, transparent 30%, rgba(${track.rgb},0.08) 50%, transparent 70%)`, backgroundSize: '200% 100%' }} />

        {/* Scan lines */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.5) 2px, rgba(255,255,255,0.5) 3px)' }} />

        {/* Category badge */}
        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded"
          style={{ background: badgeColor + 'dd', backdropFilter: 'blur(4px)' }}>
          <span className="font-vhs text-[7px] tracking-widest font-bold text-black">{badge}</span>
        </div>

        {/* Duration */}
        <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <span className="font-vhs text-[7px] tracking-widest text-white/60">{track.duration}</span>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center transition-all duration-300 pointer-events-none"
          style={{
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(0.6)',
          }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: `radial-gradient(circle, rgba(${track.rgb},0.3) 0%, rgba(${track.rgb},0.1) 70%)`,
              border: `1.5px solid ${track.color}`,
              boxShadow: `0 0 20px rgba(${track.rgb},0.6), 0 0 40px rgba(${track.rgb},0.3)`,
            }}>
            <svg className="w-4 h-4 ml-0.5" viewBox="0 0 24 24" fill={track.color}>
              <polygon points="6,3 20,12 6,21" />
            </svg>
          </div>
        </div>

        <div className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{ background: 'rgba(0,0,0,0.4)', opacity: hovered ? 1 : 0 }} />

        {/* Chromatic edge */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ boxShadow: 'inset 1.5px 0 0 rgba(0,255,204,0.15), inset -1.5px 0 0 rgba(255,0,60,0.15)' }} />
      </div>

      {/* Track info — compact */}
      <div className="px-2.5 py-2 relative">
        <div className="font-vhs text-[11px] text-white leading-tight truncate"
          style={{
            textShadow: hovered ? `0 0 10px rgba(${track.rgb},0.4)` : 'none',
            transition: 'text-shadow 0.3s',
          }}>
          {track.title}
        </div>

        <div className="flex items-center justify-between mt-1">
          <span className="font-vhs text-[7px] tracking-[0.25em] truncate"
            style={{ color: `rgba(${track.rgb},0.8)` }}>
            {track.label}
          </span>
          <span className="font-vhs text-[8px] tabular-nums ml-2 shrink-0"
            style={{ color: track.color, textShadow: hovered ? `0 0 6px rgba(${track.rgb},0.6)` : 'none' }}>
            {track.bpm}
            <span className="text-white/25 ml-0.5 text-[6px]">BPM</span>
          </span>
        </div>

        {/* Mini EQ bars */}
        <div className="flex gap-0.5 items-end h-1 mt-1.5">
          {[...Array(20)].map((_, i) => (
            <div key={i} className="flex-1 rounded-sm track-eq-bar"
              style={{
                background: `rgba(${track.rgb},${0.2 + (i % 4) * 0.1})`,
                height: `${30 + (i * 13) % 70}%`,
                animationDelay: `${i * 0.07}s`,
                animationPlayState: hovered ? 'running' : 'paused',
                opacity: hovered ? 1 : 0.35,
                transition: 'opacity 0.3s',
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default function TrackFeedSection() {
  const [activeTab, setActiveTab] = useState<Category>('trending')
  const [inView, setInView] = useState(false)
  const [glitchingIdx, setGlitchingIdx] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Random glitch storm — glitches every 1.5-3.5s, sometimes double-bursts
  useEffect(() => {
    if (!inView) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      const delay = 1500 + Math.random() * 2000
      timer = setTimeout(() => {
        const idx = Math.floor(Math.random() * 3)
        setGlitchingIdx(idx)
        setTimeout(() => setGlitchingIdx(null), 450)
        // 35% chance of a rapid double-glitch on a different card
        if (Math.random() < 0.35) {
          setTimeout(() => {
            const idx2 = Math.floor(Math.random() * 3)
            setGlitchingIdx(idx2)
            setTimeout(() => setGlitchingIdx(null), 400)
          }, 600)
        }
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [inView])

  const activeCategory = CATEGORIES.find(c => c.id === activeTab)!
  const tracks = TRACKS[activeTab]
  const activeIndex = CATEGORIES.findIndex(c => c.id === activeTab)

  return (
    <section ref={sectionRef} className="relative py-14 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #040408 50%, #000 100%)' }}>

      {/* Ambient color orb */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-0 w-[500px] h-[400px] rounded-full opacity-[0.04] transition-all duration-1000"
          style={{ background: `radial-gradient(circle, ${activeCategory.color} 0%, transparent 60%)`, filter: 'blur(120px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative"
        style={{ opacity: inView ? 1 : 0, transform: inView ? 'translateY(0)' : 'translateY(20px)', transition: 'all 0.8s ease' }}>

        {/* ── HEADER ── */}
        <div className="mb-6">
          <div className="font-vhs text-[9px] text-primary/40 tracking-[0.5em] mb-2">// FROM THE BOOTH</div>
          <h2 className="font-vhs text-3xl md:text-5xl text-white tracking-wider rgb-split leading-none">
            FRESH CUTS
          </h2>
        </div>

        {/* ── TABS — neon bracket style ── */}
        <div className="relative mb-6">
          <div className="flex gap-0 relative">
            {CATEGORIES.map((cat, i) => {
              const isActive = cat.id === activeTab
              return (
                <button key={cat.id} onClick={() => setActiveTab(cat.id)}
                  className="relative flex-1 group/tab transition-all duration-300"
                  style={{
                    padding: '14px 12px',
                    background: isActive ? `linear-gradient(180deg, rgba(${cat.rgb},0.08) 0%, rgba(${cat.rgb},0.02) 100%)` : 'transparent',
                    borderLeft: i === 0 ? `1px solid ${isActive ? cat.color + '60' : 'rgba(255,255,255,0.06)'}` : 'none',
                    borderRight: `1px solid ${isActive ? cat.color + '60' : 'rgba(255,255,255,0.06)'}`,
                    borderTop: `1px solid ${isActive ? cat.color + '60' : 'rgba(255,255,255,0.06)'}`,
                    borderBottom: 'none',
                  }}>
                  {/* Active tab scan lines */}
                  {isActive && (
                    <div className="absolute inset-0 pointer-events-none opacity-20"
                      style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.3) 3px, rgba(255,255,255,0.3) 4px)' }} />
                  )}

                  {/* Top accent glow */}
                  {isActive && (
                    <div className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${cat.color}, transparent)`,
                        boxShadow: `0 0 10px ${cat.color}`,
                      }} />
                  )}

                  <div className="relative flex items-center justify-center gap-2.5">
                    {/* Number */}
                    <span className="font-vhs text-[10px] tabular-nums tracking-widest transition-colors"
                      style={{ color: isActive ? cat.color : 'rgba(255,255,255,0.2)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>

                    <span className="font-vhs text-white/20">/</span>

                    {/* Label */}
                    <span className="font-vhs text-xs md:text-sm tracking-[0.35em] transition-all duration-300"
                      style={{
                        color: isActive ? '#ffffff' : 'rgba(255,255,255,0.35)',
                        textShadow: isActive ? `0 0 12px rgba(${cat.rgb},0.5)` : 'none',
                      }}>
                      {cat.label}
                    </span>

                    {/* Badge when active */}
                    {isActive && (
                      <span className="px-1.5 py-0.5 rounded font-vhs text-[7px] font-bold tracking-wider tab-badge-blink"
                        style={{ background: cat.color, color: '#000' }}>
                        {cat.badge}
                      </span>
                    )}

                    {/* Track count */}
                    <span className="font-vhs text-[8px] text-white/15 tabular-nums ml-auto md:ml-0"
                      style={{ color: isActive ? `rgba(${cat.rgb},0.5)` : 'rgba(255,255,255,0.15)' }}>
                      [{TRACKS[cat.id].length}]
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Bottom sliding indicator bar */}
          <div className="relative h-[2px] overflow-visible"
            style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div className="absolute top-0 h-full transition-all duration-500 ease-out"
              style={{
                left: `${(activeIndex / 3) * 100}%`,
                width: `${100 / 3}%`,
                background: `linear-gradient(90deg, transparent, ${activeCategory.color}, transparent)`,
                boxShadow: `0 0 12px ${activeCategory.color}, 0 0 24px ${activeCategory.color}80`,
              }} />
          </div>
        </div>

        {/* ── TRACKS GRID ── */}
        <div key={activeTab} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 track-grid-fade">
          {tracks.map((track, i) => (
            <TrackCard key={`${activeTab}-${track.title}`}
              track={track}
              index={i}
              inView={inView}
              badge={activeCategory.badge}
              badgeColor={activeCategory.color}
              glitching={glitchingIdx === i} />
          ))}
        </div>
      </div>

      <style>{`
        .track-shimmer {
          animation: trackShimmer 4s ease-in-out infinite;
        }
        @keyframes trackShimmer {
          0% { background-position: -200% 0; }
          50% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .track-letter-float {
          animation: trackLetterFloat 5s ease-in-out infinite;
        }
        @keyframes trackLetterFloat {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-2px); }
        }

        .track-eq-bar {
          animation: trackEqBar 0.5s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
        @keyframes trackEqBar {
          0% { transform: scaleY(0.3); }
          100% { transform: scaleY(1); }
        }

        .track-grid-fade {
          animation: trackGridFade 0.4s ease-out;
        }
        @keyframes trackGridFade {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        /* HARD CARD GLITCH — tears apart in layers */
        .track-card-glitch {
          animation: cardHardGlitch 0.45s steps(1);
        }
        @keyframes cardHardGlitch {
          0% { transform: translate(0, 0); }
          8% { transform: translate(-6px, 1px); }
          15% { transform: translate(4px, -2px); filter: hue-rotate(90deg); }
          22% { transform: translate(-3px, 2px); }
          30% { transform: translate(5px, 0); filter: hue-rotate(-30deg) saturate(1.5); }
          40% { transform: translate(-2px, -1px); filter: none; }
          50% { transform: translate(3px, 1px); }
          60% { transform: translate(-4px, 0); filter: hue-rotate(180deg); }
          72% { transform: translate(2px, -2px); filter: none; }
          85% { transform: translate(-1px, 1px); }
          100% { transform: translate(0, 0); }
        }

        /* Glitch slice layers — offset bands that shift wildly */
        .track-glitch-slice-1 {
          animation: slice1 0.45s steps(1);
          clip-path: inset(15% 0 70% 0);
        }
        @keyframes slice1 {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-20px); }
          40% { transform: translateX(15px); }
          60% { transform: translateX(-10px); }
          80% { transform: translateX(8px); }
        }

        .track-glitch-slice-2 {
          animation: slice2 0.45s steps(1);
          clip-path: inset(50% 0 30% 0);
        }
        @keyframes slice2 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          15% { transform: translateX(25px); opacity: 1; }
          35% { transform: translateX(-18px); opacity: 0.6; }
          55% { transform: translateX(10px); opacity: 1; }
          75% { transform: translateX(-5px); opacity: 0.4; }
        }

        .track-glitch-slice-3 {
          animation: slice3 0.45s steps(1);
          clip-path: inset(75% 0 10% 0);
        }
        @keyframes slice3 {
          0%, 100% { transform: translateX(0); opacity: 0; }
          25% { transform: translateX(-15px); opacity: 0.8; }
          50% { transform: translateX(20px); opacity: 0.5; }
          75% { transform: translateX(-8px); opacity: 0.7; }
        }

        /* Tab badge blink */
        .tab-badge-blink {
          animation: tabBadgeBlink 2s ease-in-out infinite;
        }
        @keyframes tabBadgeBlink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </section>
  )
}

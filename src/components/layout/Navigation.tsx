import { useState, useEffect, useRef } from 'react'

interface Section {
  id: string
  num: string
  label: string
  sub?: string
}

// All on-page sections — matches current App.tsx order
const sections: Section[] = [
  { id: 'hero',       num: '01', label: 'TOP',        sub: 'HERO' },
  { id: 'tracks',     num: '02', label: 'CUTS',       sub: 'FRESH' },
  { id: 'contact',    num: '03', label: 'LINKS',      sub: 'FIND ME' },
  { id: 'events',     num: '04', label: 'LIVE',       sub: 'DATES' },
  { id: 'mixer',      num: '05', label: 'MIX',        sub: 'DECKS' },
  { id: 'vault',      num: '06', label: 'VAULT',      sub: 'WAX' },
  { id: 'gallery',    num: '07', label: 'GALLERY',    sub: 'CAPTURED' },
  { id: 'bio',        num: '08', label: 'STORY',      sub: 'BIO' },
  { id: 'energetica', num: '09', label: 'ENERGETICA', sub: 'LEGACY' },
  { id: 'highlights', num: '10', label: 'HIGHLIGHTS', sub: 'ARCHIVE' },
  { id: 'labels',     num: '11', label: 'LABELS',     sub: 'IMPRINTS' },
  { id: 'book',       num: '12', label: 'BOOK',       sub: 'CONTACT' },
]

export default function Navigation() {
  const [active, setActive] = useState('hero')
  const [hovered, setHovered] = useState<string | null>(null)
  const [glitchingId, setGlitchingId] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const hoverTimer = useRef<number | null>(null)

  // Intersection-based active detection
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the entry closest to the middle of the viewport
        let best: IntersectionObserverEntry | null = null
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry
        }
        if (best) setActive(best.target.id)
      },
      { threshold: [0.2, 0.5, 0.75], rootMargin: '-20% 0px -20% 0px' }
    )
    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [])

  // Random glitch trigger — fires on a random item every 4-9 seconds
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      const delay = 4000 + Math.random() * 5000
      timer = setTimeout(() => {
        const pick = sections[Math.floor(Math.random() * sections.length)]
        setGlitchingId(pick.id)
        setTimeout(() => setGlitchingId(null), 380)
        schedule()
      }, delay)
    }
    schedule()
    return () => clearTimeout(timer)
  }, [])

  // Auto-expand when hovering the nav, collapse after a beat when mouse leaves
  const handleNavEnter = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setExpanded(true)
  }
  const handleNavLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    hoverTimer.current = window.setTimeout(() => setExpanded(false), 600)
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const handleMobileItemClick = (id: string) => {
    scrollTo(id)
    setMobileOpen(false)
  }

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    if (!mobileOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [mobileOpen])

  // ESC to close mobile menu
  useEffect(() => {
    if (!mobileOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [mobileOpen])

  const activeSection = sections.find(s => s.id === active)

  return (
    <>
    {/* ─────────── DESKTOP: vertical right-edge nav (hidden on mobile) ─────────── */}
    <nav
      onMouseEnter={handleNavEnter}
      onMouseLeave={handleNavLeave}
      className="hidden md:flex fixed right-0 top-1/2 -translate-y-1/2 z-[9990] flex-col items-end nav-glitch-container"
      style={{ transition: 'padding 0.4s ease', padding: expanded ? '14px 18px' : '14px 10px' }}
    >
      {/* Subtle vertical connector line */}
      <div
        className="absolute right-[14px] top-4 bottom-4 pointer-events-none transition-opacity duration-300"
        style={{
          width: 1,
          background: 'linear-gradient(180deg, transparent, rgba(0,255,204,0.15), rgba(0,255,204,0.15), transparent)',
          opacity: expanded ? 1 : 0.35,
        }}
      />

      {/* Top cap label when expanded */}
      <div
        className="font-vhs text-[8px] text-primary/40 tracking-[0.5em] mb-3 transition-all duration-300 origin-right"
        style={{
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : 'translateX(10px)',
        }}
      >
        // NAV
      </div>

      <div className="flex flex-col gap-2 items-end">
        {sections.map((s) => {
          const isActive = active === s.id
          const isHovered = hovered === s.id
          const isGlitching = glitchingId === s.id
          const shouldShowLabel = expanded || isActive || isHovered

          return (
            <button
              key={s.id}
              onClick={() => scrollTo(s.id)}
              onMouseEnter={() => setHovered(s.id)}
              onMouseLeave={() => setHovered(null)}
              aria-label={`Scroll to ${s.label}`}
              className={`group relative flex items-center gap-3 transition-all duration-300 ${isGlitching ? 'nav-item-glitch' : ''}`}
              style={{ paddingRight: 4 }}
            >
              {/* Number prefix — only when expanded */}
              <span
                className="font-vhs text-[8px] tabular-nums transition-all duration-300 select-none"
                style={{
                  opacity: expanded ? (isActive ? 0.75 : 0.35) : 0,
                  transform: expanded ? 'translateX(0)' : 'translateX(8px)',
                  color: isActive ? '#00ffcc' : 'rgba(255,255,255,0.45)',
                  pointerEvents: 'none',
                  width: expanded ? 'auto' : 0,
                }}
              >
                {s.num}
              </span>

              {/* Main label */}
              <span
                className="relative font-vhs transition-all duration-300 select-none"
                style={{
                  opacity: shouldShowLabel ? 1 : 0,
                  transform: shouldShowLabel ? 'translateX(0)' : 'translateX(8px)',
                  pointerEvents: 'none',
                }}
              >
                {/* RGB ghost — red behind */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 font-vhs pointer-events-none"
                    style={{
                      color: 'rgba(255,0,60,0.7)',
                      transform: 'translate(-2px, 1px)',
                      letterSpacing: '0.25em',
                      fontSize: 13,
                    }}
                  >
                    {s.label}
                  </span>
                )}
                {/* RGB ghost — cyan ahead */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 font-vhs pointer-events-none"
                    style={{
                      color: 'rgba(0,255,204,0.7)',
                      transform: 'translate(2px, -1px)',
                      letterSpacing: '0.25em',
                      fontSize: 13,
                    }}
                  >
                    {s.label}
                  </span>
                )}
                {/* Actual label */}
                <span
                  className="relative inline-block"
                  style={{
                    color: isActive ? '#fff' : isHovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                    textShadow: isActive ? '0 0 12px rgba(0,255,204,0.55)' : 'none',
                    letterSpacing: '0.25em',
                    fontSize: 13,
                    fontWeight: isActive ? 700 : 400,
                  }}
                >
                  {s.label}
                </span>
              </span>

              {/* Sub-tag (tiny) — only while hovering or active + expanded */}
              {s.sub && (
                <span
                  className="absolute right-7 whitespace-nowrap font-vhs text-[7px] tracking-[0.35em] transition-all duration-300"
                  style={{
                    bottom: -9,
                    opacity: isActive && expanded ? 0.5 : 0,
                    color: '#00ffcc',
                    transform: isActive ? 'translateX(0)' : 'translateX(4px)',
                    pointerEvents: 'none',
                  }}
                >
                  // {s.sub}
                </span>
              )}

              {/* Dot indicator */}
              <span
                className="relative block rounded-full transition-all duration-300"
                style={{
                  width: isActive ? 12 : isHovered ? 8 : 5,
                  height: isActive ? 12 : isHovered ? 8 : 5,
                  background: isActive ? '#00ffcc' : isHovered ? 'rgba(0,255,204,0.5)' : 'rgba(255,255,255,0.25)',
                  boxShadow: isActive
                    ? '0 0 10px rgba(0,255,204,0.9), 0 0 20px rgba(0,255,204,0.4)'
                    : isHovered
                      ? '0 0 6px rgba(0,255,204,0.35)'
                      : 'none',
                }}
              >
                {/* Pulsing ring on active */}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-full"
                    style={{
                      animation: 'navDotPulse 2s ease-in-out infinite',
                      border: '1px solid rgba(0,255,204,0.6)',
                    }}
                  />
                )}
              </span>
            </button>
          )
        })}
      </div>

      {/* Bottom cap label when expanded */}
      <div
        className="font-vhs text-[8px] text-primary/40 tracking-[0.5em] mt-3 transition-all duration-300"
        style={{
          opacity: expanded ? 1 : 0,
          transform: expanded ? 'translateX(0)' : 'translateX(10px)',
        }}
      >
        {sections.length.toString().padStart(2, '0')} ///
      </div>
    </nav>

    {/* ─────────── MOBILE: hamburger button + full-screen overlay (hidden on desktop) ─────────── */}

    {/* Hamburger button — always visible top-right on mobile */}
    <button
      onClick={() => setMobileOpen(v => !v)}
      aria-label={mobileOpen ? 'Close navigation' : 'Open navigation'}
      aria-expanded={mobileOpen}
      className="md:hidden fixed top-4 right-4 z-[9994] group"
      style={{
        width: 52,
        height: 52,
        background: 'rgba(5,5,8,0.72)',
        border: `1px solid ${mobileOpen ? 'rgba(255,0,60,0.55)' : 'rgba(0,255,204,0.3)'}`,
        borderRadius: 10,
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        boxShadow: mobileOpen
          ? '0 0 18px rgba(255,0,60,0.35), inset 0 0 10px rgba(255,0,60,0.15)'
          : '0 0 12px rgba(0,255,204,0.22), inset 0 0 8px rgba(0,255,204,0.08)',
        transition: 'border 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
      }}
    >
      {/* Inside scan lines */}
      <span aria-hidden className="absolute inset-0 rounded-[inherit] pointer-events-none opacity-30"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.08) 2px, rgba(255,255,255,0.08) 3px)' }} />

      {/* 3 lines → X morph */}
      <span className="absolute inset-0 flex items-center justify-center">
        <span className="relative block" style={{ width: 22, height: 16 }}>
          {/* Top line */}
          <span className="absolute left-0 right-0 h-[2px] rounded-sm"
            style={{
              top: mobileOpen ? '50%' : 0,
              background: mobileOpen ? '#ff003c' : '#00ffcc',
              boxShadow: mobileOpen ? '0 0 6px #ff003c' : '0 0 6px rgba(0,255,204,0.8)',
              transform: mobileOpen ? 'translateY(-50%) rotate(45deg)' : 'translateY(0) rotate(0)',
              transformOrigin: 'center',
              transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              width: mobileOpen ? '100%' : '100%',
            }} />
          {/* Middle line (fades out on open) */}
          <span className="absolute left-0 h-[2px] rounded-sm top-1/2 -translate-y-1/2"
            style={{
              background: '#00ffcc',
              boxShadow: '0 0 6px rgba(0,255,204,0.8)',
              opacity: mobileOpen ? 0 : 1,
              width: mobileOpen ? 0 : '75%',
              transition: 'all 0.25s ease',
            }} />
          {/* Bottom line */}
          <span className="absolute left-0 right-0 h-[2px] rounded-sm"
            style={{
              bottom: mobileOpen ? '50%' : 0,
              background: mobileOpen ? '#ff003c' : '#00ffcc',
              boxShadow: mobileOpen ? '0 0 6px #ff003c' : '0 0 6px rgba(0,255,204,0.8)',
              transform: mobileOpen ? 'translateY(50%) rotate(-45deg)' : 'translateY(0) rotate(0)',
              transformOrigin: 'center',
              transition: 'all 0.35s cubic-bezier(0.22, 1, 0.36, 1)',
              width: mobileOpen ? '100%' : '55%',
            }} />
        </span>
      </span>

      {/* Tiny active-section label below icon (only when closed) */}
      {!mobileOpen && activeSection && (
        <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 font-vhs text-[7px] text-primary/50 tracking-[0.3em] whitespace-nowrap pointer-events-none">
          {activeSection.num} // {activeSection.label}
        </span>
      )}
    </button>

    {/* Full-screen overlay */}
    <div
      className="md:hidden fixed inset-0 z-[9993]"
      aria-hidden={!mobileOpen}
      style={{
        opacity: mobileOpen ? 1 : 0,
        pointerEvents: mobileOpen ? 'auto' : 'none',
        transition: 'opacity 0.35s ease',
        background: 'rgba(3,3,6,0.94)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
      }}
      onClick={(e) => { if (e.target === e.currentTarget) setMobileOpen(false) }}
    >
      {/* Ambient cyan glow */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 60% at 60% 50%, rgba(0,255,204,0.07), transparent 70%)' }} />

      {/* Red edge bleed */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 50% 40% at 10% 20%, rgba(255,0,60,0.05), transparent 70%)' }} />

      {/* Scan lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40"
        style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,255,204,0.025) 3px, rgba(0,255,204,0.025) 4px)' }} />

      {/* Chromatic edge bleed */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ boxShadow: 'inset 3px 0 24px rgba(0,255,204,0.12), inset -3px 0 24px rgba(255,0,60,0.12)' }} />

      {/* Header strip */}
      <div className="absolute top-4 left-4 right-20 flex items-center gap-2"
        style={{
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
          transition: 'opacity 0.4s ease 0.1s, transform 0.4s ease 0.1s',
        }}>
        <span className="rec-dot w-2 h-2 rounded-full bg-accent shadow-[0_0_6px_#ff003c]" />
        <span className="font-vhs text-[10px] text-primary/70 tracking-[0.5em]">
          // NAV // {String(sections.length).padStart(2, '0')}
        </span>
        <div className="flex-1 h-px bg-gradient-to-r from-primary/30 to-transparent ml-2" />
      </div>

      {/* Item list */}
      <div className="absolute inset-0 flex flex-col justify-center items-end px-5 pt-20 pb-16 overflow-y-auto scrollbar-hide">
        <div className="flex flex-col gap-1 w-full items-end">
          {sections.map((s, i) => {
            const isActive = active === s.id
            const isGlitching = glitchingId === s.id
            return (
              <button
                key={s.id}
                onClick={() => handleMobileItemClick(s.id)}
                className={`group relative w-full flex items-center justify-end gap-3 py-2.5 pr-1 pl-3 rounded ${isGlitching ? 'nav-item-glitch' : ''}`}
                style={{
                  opacity: mobileOpen ? 1 : 0,
                  transform: mobileOpen ? 'translateX(0)' : 'translateX(30px)',
                  transition: `opacity 0.4s ease ${0.15 + i * 0.035}s, transform 0.4s ease ${0.15 + i * 0.035}s, background 0.2s ease`,
                  background: isActive ? 'rgba(0,255,204,0.04)' : 'transparent',
                }}
              >
                {/* Number */}
                <span
                  className="font-vhs text-[9px] tabular-nums shrink-0"
                  style={{
                    color: isActive ? '#00ffcc' : 'rgba(255,255,255,0.3)',
                    textShadow: isActive ? '0 0 8px rgba(0,255,204,0.6)' : 'none',
                    width: 18,
                    textAlign: 'right',
                  }}
                >
                  {s.num}
                </span>

                {/* Label with RGB split when active */}
                <span className="relative font-vhs select-none flex-1 text-right">
                  {isActive && (
                    <>
                      <span aria-hidden className="absolute inset-0 font-vhs pointer-events-none text-right"
                        style={{
                          color: 'rgba(255,0,60,0.75)',
                          transform: 'translate(-2px, 1px)',
                          letterSpacing: '0.2em',
                          fontSize: 22,
                          fontWeight: 700,
                        }}>
                        {s.label}
                      </span>
                      <span aria-hidden className="absolute inset-0 font-vhs pointer-events-none text-right"
                        style={{
                          color: 'rgba(0,255,204,0.75)',
                          transform: 'translate(2px, -1px)',
                          letterSpacing: '0.2em',
                          fontSize: 22,
                          fontWeight: 700,
                        }}>
                        {s.label}
                      </span>
                    </>
                  )}
                  <span
                    className="relative inline-block"
                    style={{
                      color: isActive ? '#fff' : 'rgba(255,255,255,0.6)',
                      letterSpacing: '0.2em',
                      fontSize: isActive ? 22 : 20,
                      fontWeight: isActive ? 700 : 400,
                      textShadow: isActive ? '0 0 14px rgba(0,255,204,0.5)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    {s.label}
                  </span>
                </span>

                {/* Sub-tag */}
                {s.sub && (
                  <span
                    className="font-vhs text-[8px] tracking-[0.3em] shrink-0 text-right"
                    style={{
                      color: isActive ? 'rgba(0,255,204,0.6)' : 'rgba(255,255,255,0.22)',
                      width: 50,
                    }}
                  >
                    // {s.sub}
                  </span>
                )}

                {/* Active dot */}
                <span
                  className="relative block rounded-full shrink-0"
                  style={{
                    width: isActive ? 10 : 5,
                    height: isActive ? 10 : 5,
                    background: isActive ? '#00ffcc' : 'rgba(255,255,255,0.25)',
                    boxShadow: isActive ? '0 0 10px rgba(0,255,204,0.9), 0 0 20px rgba(0,255,204,0.35)' : 'none',
                    transition: 'all 0.3s',
                  }}
                >
                  {isActive && (
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-full"
                      style={{
                        animation: 'navDotPulse 2s ease-in-out infinite',
                        border: '1px solid rgba(0,255,204,0.6)',
                      }}
                    />
                  )}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Footer strip */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between"
        style={{
          opacity: mobileOpen ? 1 : 0,
          transform: mobileOpen ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.4s ease 0.35s, transform 0.4s ease 0.35s',
        }}>
        <span className="font-vhs text-[9px] text-white/25 tracking-[0.4em]">
          DJ OGI // RIJEKA
        </span>
        <span className="font-vhs text-[9px] text-primary/40 tracking-[0.4em]">
          30 YRS //
        </span>
      </div>
    </div>
    </>
  )
}

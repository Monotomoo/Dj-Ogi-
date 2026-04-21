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

  return (
    <nav
      onMouseEnter={handleNavEnter}
      onMouseLeave={handleNavLeave}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-[9990] flex flex-col items-end nav-glitch-container"
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
  )
}

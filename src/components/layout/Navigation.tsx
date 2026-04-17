import { useState, useEffect } from 'react'

const sections = [
  { id: 'hero', label: 'TOP' },
  { id: 'contact', label: 'LINKS' },
  { id: 'events', label: 'LIVE' },
  { id: 'bio', label: 'STORY' },
]

export default function Navigation() {
  const [active, setActive] = useState('hero')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActive(entry.target.id)
          }
        }
      },
      { threshold: 0.3 }
    )

    for (const section of sections) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [])

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-[9990] flex flex-col gap-3 items-end">
      {sections.map((s) => (
        <button
          key={s.id}
          onClick={() => scrollTo(s.id)}
          className={`group flex items-center gap-2 transition-all duration-300 ${
            active === s.id ? 'opacity-100' : 'opacity-40 hover:opacity-70'
          }`}
          aria-label={`Scroll to ${s.label}`}
        >
          <span
            className={`font-vhs text-[10px] tracking-widest transition-all duration-300 ${
              active === s.id
                ? 'text-primary opacity-100 translate-x-0'
                : 'opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0'
            }`}
          >
            {s.label}
          </span>
          <span
            className={`block rounded-full transition-all duration-300 ${
              active === s.id
                ? 'w-3 h-3 bg-primary shadow-[0_0_8px_rgba(0,255,204,0.6)]'
                : 'w-2 h-2 bg-white/30'
            }`}
          />
        </button>
      ))}
    </nav>
  )
}

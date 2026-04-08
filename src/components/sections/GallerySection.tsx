import { useState, useEffect, useRef } from 'react'

// Grid layout (4 cols):
// Row 1: hero(2x2) + portrait(2x2)  → fills 4 cols, 2 rows
// Row 3: blue(2x1) + eco(1x1) + crowd(1x1)  → fills 4 cols
// Row 4: red(2x1) + warehouse(1x1) + stage(1x1)  → fills 4 cols
// Row 5: energetika(full 4x1)  → fills 4 cols
const PHOTOS = [
  { src: '/gallery/portrait-decks.jpg', caption: 'ECLIPSE // RIJEKA 2024', span: 'col-span-2 row-span-2' },
  { src: '/gallery/portrait-hero.jpg', caption: 'PROMO SHOOT // 2024', span: 'col-span-2 row-span-2' },
  { src: '/gallery/club-blue.jpg', caption: 'CLUB SET // BLUE HOUR', span: 'col-span-2' },
  { src: '/gallery/eco-festival.jpg', caption: 'ECO FESTIVAL // MAIN STAGE', span: '' },
  { src: '/gallery/crowd-wild.jpg', caption: 'CROWD CONTROL // RAW ENERGY', span: '' },
  { src: '/gallery/club-red.jpg', caption: 'DJ OGI // RED ROOM', span: 'col-span-2' },
  { src: '/gallery/warehouse.jpg', caption: 'WAREHOUSE SESSION // INDUSTRIAL', span: '' },
  { src: '/gallery/stage-visuals.jpg', caption: 'LED VISUALS // ECLIPSE', span: '' },
  { src: '/gallery/energetika.jpg', caption: 'ENERGETIKA // CLUB NIGHT', span: 'col-span-4' },
]

function VHSTimestamp() {
  const [time, setTime] = useState('')
  useEffect(() => {
    const update = () => {
      const now = new Date()
      setTime(
        `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
      )
    }
    update()
    const i = setInterval(update, 1000)
    return () => clearInterval(i)
  }, [])
  return <span>{time}</span>
}

export default function GallerySection() {
  const [activePhoto, setActivePhoto] = useState<number | null>(null)
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [inView, setInView] = useState(false)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setInView(true) }, { threshold: 0.1 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  // Auto-scroll filmstrip
  useEffect(() => {
    const strip = stripRef.current
    if (!strip) return
    let raf: number
    let pos = 0
    const speed = 0.3
    const tick = () => {
      pos += speed
      if (pos >= strip.scrollWidth / 2) pos = 0
      strip.scrollLeft = pos
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView])

  return (
    <section ref={sectionRef} className="relative pt-12 pb-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #050508 30%, #06060c 50%, #050508 70%, #000 100%)' }}>

      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-[600px] h-[500px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 60%)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 60%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div className="text-center mb-16"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(25px)',
            transition: 'all 0.8s ease',
          }}>
          <div className="font-vhs text-[9px] text-accent/40 tracking-[0.6em] mb-4">// CAPTURED ON TAPE</div>
          <h2 className="font-vhs text-5xl md:text-7xl text-white tracking-wider rgb-split mb-4">GALLERY</h2>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="w-2 h-2 rounded-full bg-accent rec-dot shadow-[0_0_8px_#ff003c]" />
            <span className="font-vhs text-[10px] text-accent/60 tracking-[0.4em]">REC</span>
            <span className="font-vhs text-[10px] text-white/20 tracking-wider tabular-nums"><VHSTimestamp /></span>
          </div>
        </div>

        {/* ── MASONRY GRID ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-16 auto-rows-[160px] md:auto-rows-[200px]"
          style={{
            opacity: inView ? 1 : 0,
            transform: inView ? 'translateY(0)' : 'translateY(30px)',
            transition: 'all 0.8s ease 0.2s',
          }}>
          {PHOTOS.map((photo, i) => {
            const isHov = hoveredIdx === i
            const spanClass = photo.span

            return (
              <div
                key={i}
                className={`relative group cursor-pointer overflow-hidden rounded-lg ${spanClass}`}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => setActivePhoto(i)}
                style={{
                  transform: isHov ? 'scale(0.98)' : 'scale(1)',
                  transition: 'transform 0.3s ease',
                }}
              >
                {/* Image */}
                <img
                  src={photo.src}
                  alt={photo.caption}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: isHov
                      ? 'brightness(1.1) saturate(1.3) contrast(1.1)'
                      : 'brightness(0.7) saturate(0.8)',
                    transition: 'filter 0.4s ease',
                  }}
                  loading="lazy"
                />

                {/* VHS scan lines overlay */}
                <div className="absolute inset-0 pointer-events-none opacity-40"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.3) 2px, rgba(0,0,0,0.3) 4px)',
                    mixBlendMode: 'multiply',
                  }} />

                {/* RGB split border on hover */}
                <div className="absolute inset-0 pointer-events-none transition-opacity duration-300 rounded-lg"
                  style={{
                    opacity: isHov ? 1 : 0,
                    boxShadow: 'inset 2px 0 0 rgba(0,255,204,0.4), inset -2px 0 0 rgba(255,0,60,0.4), inset 0 2px 0 rgba(0,255,204,0.2), inset 0 -2px 0 rgba(255,0,60,0.2)',
                  }} />

                {/* Horizontal glitch bar on hover */}
                {isHov && (
                  <div className="absolute left-0 right-0 h-1 pointer-events-none"
                    style={{
                      top: `${30 + Math.random() * 40}%`,
                      background: 'rgba(0,255,204,0.15)',
                      animation: 'galleryGlitchBar 0.15s steps(2) infinite',
                    }} />
                )}

                {/* Vignette */}
                <div className="absolute inset-0 pointer-events-none"
                  style={{ background: 'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.6) 100%)' }} />

                {/* Caption + VHS overlay — slides up on hover */}
                <div className="absolute inset-x-0 bottom-0 transition-all duration-400"
                  style={{
                    background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                    padding: '2rem 0.75rem 0.75rem',
                    opacity: isHov ? 1 : 0,
                    transform: isHov ? 'translateY(0)' : 'translateY(8px)',
                  }}>
                  <div className="font-vhs text-[9px] text-white/80 tracking-[0.25em] leading-tight">
                    {photo.caption}
                  </div>
                  <div className="font-vhs text-[7px] text-primary/40 tracking-widest mt-1">
                    PLAY ▶
                  </div>
                </div>

                {/* Frame number */}
                <div className="absolute top-2 right-2 font-vhs text-[8px] text-white/20 tabular-nums pointer-events-none">
                  {String(i + 1).padStart(2, '0')}
                </div>
              </div>
            )
          })}
        </div>

        {/* ── FILMSTRIP (auto-scrolling) ── */}
        <div className="relative overflow-hidden mb-8"
          style={{
            opacity: inView ? 1 : 0,
            transition: 'opacity 0.8s ease 0.5s',
          }}>
          {/* Sprocket holes */}
          <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between pointer-events-none z-10 px-0">
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-sm border border-white/10 bg-black/80" />
              ))}
            </div>
            <div className="flex flex-col gap-2">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="w-3 h-3 rounded-sm border border-white/10 bg-black/80" />
              ))}
            </div>
          </div>

          {/* Edge fade */}
          <div className="absolute inset-y-0 left-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to right, #000, transparent)' }} />
          <div className="absolute inset-y-0 right-0 w-20 z-10 pointer-events-none"
            style={{ background: 'linear-gradient(to left, #000, transparent)' }} />

          {/* Filmstrip bar */}
          <div className="py-3 px-6"
            style={{ background: 'rgba(255,255,255,0.015)', borderTop: '2px solid rgba(255,255,255,0.06)', borderBottom: '2px solid rgba(255,255,255,0.06)' }}>
            <div ref={stripRef} className="flex gap-2 overflow-hidden" style={{ scrollBehavior: 'auto' }}>
              {/* Duplicate for infinite scroll */}
              {[...PHOTOS, ...PHOTOS].map((photo, i) => (
                <div key={i} className="flex-shrink-0 w-24 h-16 rounded overflow-hidden relative cursor-pointer opacity-60 hover:opacity-100 transition-opacity"
                  onClick={() => setActivePhoto(i % PHOTOS.length)}>
                  <img src={photo.src} alt="" className="w-full h-full object-cover"
                    style={{ filter: 'saturate(0.6) brightness(0.8)' }} loading="lazy" />
                  <div className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.3) 1px, rgba(0,0,0,0.3) 2px)' }} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer text */}
        <div className="text-center">
          <span className="font-vhs text-[8px] text-white/[0.08] tracking-[0.5em]">
            SP MODE // HI-FI STEREO // CAPTURED MOMENTS
          </span>
        </div>
      </div>

      {/* ── LIGHTBOX ── */}
      {activePhoto !== null && (
        <div className="fixed inset-0 z-[99990] flex items-center justify-center"
          onClick={() => setActivePhoto(null)}
          style={{ background: 'rgba(0,0,0,0.95)', backdropFilter: 'blur(20px)' }}>

          {/* VHS frame */}
          <div className="relative max-w-5xl max-h-[85vh] mx-4" onClick={(e) => e.stopPropagation()}>
            <img
              src={PHOTOS[activePhoto].src}
              alt={PHOTOS[activePhoto].caption}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              style={{ boxShadow: '0 0 100px rgba(0,0,0,0.8)' }}
            />

            {/* VHS overlay on lightbox */}
            <div className="absolute inset-0 pointer-events-none rounded-lg"
              style={{
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.15) 3px, rgba(0,0,0,0.15) 4px)',
                boxShadow: 'inset 3px 0 0 rgba(0,255,204,0.2), inset -3px 0 0 rgba(255,0,60,0.2)',
              }} />

            {/* Caption bar */}
            <div className="absolute bottom-0 left-0 right-0 py-4 px-5 rounded-b-lg"
              style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.9))' }}>
              <div className="flex justify-between items-end">
                <div>
                  <div className="font-vhs text-[11px] text-white/80 tracking-[0.3em]">
                    {PHOTOS[activePhoto].caption}
                  </div>
                  <div className="font-vhs text-[8px] text-white/20 tracking-widest mt-1">
                    FRAME {String(activePhoto + 1).padStart(2, '0')} / {String(PHOTOS.length).padStart(2, '0')}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-accent rec-dot shadow-[0_0_6px_#ff003c]" />
                  <span className="font-vhs text-[9px] text-accent/70">REC</span>
                </div>
              </div>
            </div>

            {/* REC top-left */}
            <div className="absolute top-3 left-4 font-vhs text-[9px] text-white/30 tracking-wider">
              <VHSTimestamp />
            </div>

            {/* Nav arrows */}
            <button
              className="absolute left-3 top-1/2 -translate-y-1/2 font-vhs text-2xl text-white/30 hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); setActivePhoto(Math.max(0, activePhoto - 1)) }}>
              ◄
            </button>
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2 font-vhs text-2xl text-white/30 hover:text-primary transition-colors"
              onClick={(e) => { e.stopPropagation(); setActivePhoto(Math.min(PHOTOS.length - 1, activePhoto + 1)) }}>
              ►
            </button>

            {/* Close */}
            <button
              className="absolute -top-10 right-0 font-vhs text-xs text-white/30 hover:text-white/70 transition-colors tracking-widest"
              onClick={() => setActivePhoto(null)}>
              CLOSE ×
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes galleryGlitchBar {
          0% { transform: translateX(-2px); opacity: 1; }
          50% { transform: translateX(3px); opacity: 0.5; }
          100% { transform: translateX(-1px); opacity: 0.8; }
        }
      `}</style>
    </section>
  )
}

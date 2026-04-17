import { useState } from 'react'
import { upcomingEvents } from '../../data/events'

export default function EventsSection() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null)

  return (
    <section id="events" className="relative pt-24 pb-12 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #04040a 40%, #060610 60%, #000 100%)' }}>

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(ellipse, #00ffcc 0%, transparent 65%)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[400px] opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse, #ff003c 0%, transparent 65%)', filter: 'blur(100px)' }} />
        {/* Horizontal scan lines - subtle */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(255,255,255,0.5) 3px, rgba(255,255,255,0.5) 4px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative">

        {/* ── HEADER ── */}
        <div className="text-center mb-20">
          <div className="font-vhs text-[9px] text-primary/40 tracking-[0.6em] mb-4">// DJ OGI</div>
          <h2 className="font-vhs text-6xl md:text-8xl text-white tracking-wider rgb-split mb-4">LIVE</h2>
          <div className="flex items-center justify-center gap-4">
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-primary/20" />
            <span className="font-vhs text-[9px] text-primary/30 tracking-[0.4em]">BOOK YOUR NIGHT</span>
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-primary/20" />
          </div>
        </div>

        {/* ── UPCOMING EVENTS ── */}
        <div className="mb-24 space-y-4">
          {upcomingEvents.map((event, i) => {
            const isFirst = i === 0
            const isSoldOut = event.status === 'sold-out'
            const isHovered = hoveredIdx === i

            return (
              <div
                key={i}
                className="group relative rounded-xl overflow-hidden cursor-default transition-all duration-500"
                style={{
                  transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
                  boxShadow: isHovered
                    ? `0 20px 60px rgba(0,0,0,0.8), 0 0 40px rgba(${isFirst ? '0,255,204' : '255,0,60'},0.08)`
                    : '0 4px 20px rgba(0,0,0,0.5)',
                }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {/* Card background */}
                <div className="absolute inset-0"
                  style={{
                    background: isHovered
                      ? `linear-gradient(135deg, rgba(${isFirst ? '0,255,204' : '255,0,60'},0.06) 0%, rgba(0,0,0,0.95) 60%)`
                      : 'linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(0,0,0,0.9) 100%)',
                    transition: 'background 0.5s ease',
                  }} />

                {/* Left accent bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1 transition-all duration-500"
                  style={{
                    background: isFirst
                      ? `linear-gradient(180deg, #00ffcc, #00ffcc88)`
                      : `linear-gradient(180deg, #ff003c, #ff003c88)`,
                    opacity: isHovered ? 1 : 0.4,
                    boxShadow: isHovered
                      ? `0 0 20px ${isFirst ? '#00ffcc' : '#ff003c'}60`
                      : 'none',
                  }} />

                {/* Border */}
                <div className="absolute inset-0 rounded-xl transition-all duration-500"
                  style={{
                    border: `1px solid rgba(${isFirst ? '0,255,204' : '255,0,60'},${isHovered ? '0.2' : '0.06'})`,
                  }} />

                {/* NEXT badge */}
                {isFirst && (
                  <div className="absolute top-4 right-4 flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary rec-dot" />
                    <span className="font-vhs text-[9px] text-primary tracking-[0.3em]">NEXT SHOW</span>
                  </div>
                )}

                {/* Content */}
                <div className="relative flex flex-col md:flex-row md:items-center gap-6 pl-6 pr-6 py-6 md:py-7">

                  {/* Date block */}
                  <div className="flex items-baseline gap-3 md:w-48 shrink-0">
                    <span className="font-vhs text-5xl md:text-6xl leading-none"
                      style={{ color: isFirst ? '#00ffcc' : '#ff003c', opacity: isHovered ? 1 : 0.7, transition: 'opacity 0.3s' }}>
                      {event.day}
                    </span>
                    <div>
                      <div className="font-vhs text-sm text-white/60 leading-tight">{event.month}</div>
                      <div className="font-vhs text-xs text-white/25">{event.year}</div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="hidden md:block w-px self-stretch"
                    style={{ background: `linear-gradient(180deg, transparent, rgba(${isFirst ? '0,255,204' : '255,0,60'},0.2), transparent)` }} />

                  {/* Venue info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-vhs text-2xl md:text-3xl text-white tracking-wide leading-tight mb-1 truncate">
                      {event.venue}
                    </div>
                    <div className="font-vhs text-xs text-white/35 tracking-[0.3em]">
                      {event.city} — {event.country}
                    </div>
                    {event.lineup && (
                      <div className="font-vhs text-[10px] mt-2 tracking-[0.2em]"
                        style={{ color: isFirst ? 'rgba(0,255,204,0.4)' : 'rgba(255,0,60,0.4)' }}>
                        {event.lineup}
                      </div>
                    )}
                  </div>

                  {/* Ticket button */}
                  <div className="shrink-0">
                    {isSoldOut ? (
                      <div className="font-vhs text-[10px] px-5 py-3 rounded tracking-widest text-center
                        border border-white/10 text-white/20 cursor-not-allowed">
                        SOLD OUT
                      </div>
                    ) : !event.ticketUrl || event.ticketUrl === '#' ? (
                      <div className="font-vhs text-[10px] px-5 py-3 rounded tracking-widest text-center
                        border border-white/15 text-white/40 cursor-default">
                        COMING SOON
                      </div>
                    ) : (
                      <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                        className="group/btn relative font-vhs text-[11px] px-6 py-3 rounded tracking-widest
                          inline-block text-center overflow-hidden transition-all duration-300"
                        style={{
                          background: isFirst
                            ? 'linear-gradient(135deg, #00ffcc, #00cc99)'
                            : 'linear-gradient(135deg, #ff003c, #cc0030)',
                          color: '#000',
                          boxShadow: isHovered
                            ? `0 0 24px rgba(${isFirst ? '0,255,204' : '255,0,60'},0.5)`
                            : 'none',
                        }}>
                        TICKETS →
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom glow line */}
                <div className="absolute bottom-0 left-6 right-6 h-px transition-all duration-500"
                  style={{
                    background: `linear-gradient(90deg, transparent, rgba(${isFirst ? '0,255,204' : '255,0,60'},${isHovered ? '0.3' : '0.06'}), transparent)`,
                  }} />
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

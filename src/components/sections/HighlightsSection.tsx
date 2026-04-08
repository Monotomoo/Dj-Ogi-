import { pastHighlights } from '../../data/events'

export default function HighlightsSection() {
  return (
    <section className="relative py-24 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #04040a 40%, #060610 60%, #000 100%)' }}>

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[500px] h-[400px] rounded-full opacity-[0.025]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 60%)', filter: 'blur(120px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative">
        {/* Section header */}
        <div className="mb-12">
          <div className="flex items-end justify-between mb-3">
            <div>
              <div className="font-vhs text-[9px] text-primary/40 tracking-[0.5em] mb-2">// CAREER ARCHIVE</div>
              <h3 className="font-vhs text-3xl md:text-4xl text-white tracking-wider">HIGHLIGHTS</h3>
            </div>
            <div className="text-right">
              <div className="font-vhs text-4xl md:text-5xl text-white/5 leading-none select-none">30</div>
              <div className="font-vhs text-[8px] text-white/15 tracking-[0.3em] -mt-1">YEARS OF TECHNO</div>
            </div>
          </div>
          <div className="h-px bg-gradient-to-r from-primary/30 via-white/10 to-transparent" />
        </div>

        {/* Setlist rows */}
        <div className="space-y-0">
          {pastHighlights.map((event, i) => (
            <div key={i}
              className="group relative flex items-center gap-4 md:gap-8 py-4 md:py-5 cursor-default
                transition-all duration-300 border-b border-white/[0.04] hover:border-white/[0.08]">

              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-400 pointer-events-none -mx-4"
                style={{ background: 'linear-gradient(90deg, rgba(0,255,204,0.04) 0%, rgba(0,255,204,0.015) 40%, transparent 100%)' }} />

              <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-all duration-300"
                style={{ background: 'linear-gradient(180deg, transparent, #00ffcc, transparent)' }} />

              <div className="shrink-0 w-8 text-right">
                <span className="font-vhs text-xs text-white/10 group-hover:text-primary/30 transition-colors duration-300">
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <div className="shrink-0 w-14 md:w-16">
                <span className="font-vhs text-sm md:text-base text-primary/50 group-hover:text-primary transition-colors duration-300 tabular-nums">
                  {event.year}
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <span className="font-vhs text-lg md:text-2xl text-white/60 group-hover:text-white
                  transition-colors duration-300 truncate block tracking-wide leading-tight">
                  {event.venue}
                </span>
              </div>

              <div className="hidden md:block shrink-0 text-right">
                <span className="font-vhs text-xs text-white/20 group-hover:text-white/45 transition-colors duration-300 tracking-widest">
                  {event.city}
                </span>
                <span className="font-vhs text-xs text-white/10 group-hover:text-white/20 transition-colors duration-300 ml-2 tracking-widest">
                  {event.country.toUpperCase()}
                </span>
              </div>

              <div className="shrink-0 w-6 text-right opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="font-vhs text-xs text-primary/50">›</span>
              </div>
            </div>
          ))}
        </div>

        {/* Stats footer */}
        <div className="mt-12 pt-6 border-t border-white/[0.04]">
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { value: '30+', label: 'YEARS' },
              { value: '40+', label: 'COUNTRIES' },
              { value: '1000+', label: 'EVENTS' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="font-vhs text-2xl md:text-3xl text-white/70 mb-1">{value}</div>
                <div className="font-vhs text-[9px] text-white/15 tracking-[0.4em]">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { upcomingEvents, pastHighlights } from '../../data/events'

export default function EventsSection() {
  const hasUpcoming = upcomingEvents.length > 0

  return (
    <section id="events" className="relative py-14 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #060608 30%, #080810 50%, #060608 70%, #000 100%)' }}>

      {/* Animated background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(ellipse, #00ffcc 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-8 relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="font-vhs text-[9px] text-accent/30 tracking-[0.5em] mb-2">// UPCOMING</div>
          <h2 className="font-vhs text-4xl md:text-6xl text-white tracking-wider rgb-split">LIVE</h2>
          <div className="mt-3 h-px w-32 mx-auto bg-gradient-to-r from-transparent via-accent/30 to-transparent" />
        </div>

        {/* Upcoming Events */}
        {hasUpcoming ? (
          <div className="space-y-3 mb-12">
            {upcomingEvents.map((event, i) => (
              <div key={i} className="group relative rounded-lg overflow-hidden border border-primary/10
                hover:border-primary/25 transition-all duration-300"
                style={{ background: 'linear-gradient(135deg, rgba(0,255,204,0.03) 0%, rgba(0,0,0,0.5) 100%)' }}>
                <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-0 p-4 md:p-5">
                  {/* Date */}
                  <div className="md:w-32">
                    <div className="font-vhs text-lg text-primary">{event.date}</div>
                  </div>
                  {/* Venue */}
                  <div className="flex-1">
                    <div className="font-vhs text-sm text-white/80">{event.venue}</div>
                    <div className="font-vhs text-[10px] text-white/25 mt-0.5">{event.city}, {event.country}</div>
                  </div>
                  {/* Ticket */}
                  {event.ticketUrl && (
                    <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer"
                      className="font-vhs text-[10px] text-black bg-primary px-4 py-2 rounded tracking-widest
                        hover:bg-primary/80 transition-colors self-start md:self-center">
                      TICKETS
                    </a>
                  )}
                </div>
                {/* Electric line at bottom */}
                <div className="h-px bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0
                  group-hover:via-primary/40 transition-all" />
              </div>
            ))}
          </div>
        ) : (
          /* No upcoming - cinematic empty state */
          <div className="relative text-center mb-12 py-16 rounded-xl border border-white/[0.03] overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.01) 0%, transparent 100%)' }}>
            {/* Scanning line effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent"
                style={{ animation: 'scanDown 4s linear infinite' }} />
            </div>

            <div className="font-vhs text-4xl md:text-6xl text-white/[0.04] tracking-[0.3em] mb-3">
              NO SIGNAL
            </div>
            <div className="font-vhs text-xs text-white/10 tracking-[0.4em]">
              DATES INCOMING // STAY TUNED
            </div>

            {/* Electric sparks */}
            <div className="absolute top-1/2 left-1/4 w-1 h-1 rounded-full bg-accent/30"
              style={{ animation: 'sparkle 2s ease-in-out infinite' }} />
            <div className="absolute top-1/3 right-1/3 w-0.5 h-0.5 rounded-full bg-primary/30"
              style={{ animation: 'sparkle 3s ease-in-out infinite 0.7s' }} />
            <div className="absolute bottom-1/3 right-1/4 w-1 h-1 rounded-full bg-accent/20"
              style={{ animation: 'sparkle 2.5s ease-in-out infinite 1.2s' }} />
          </div>
        )}

        {/* Past highlights - compact grid */}
        <div>
          <div className="font-vhs text-[8px] text-white/10 tracking-[0.4em] text-center mb-4">PAST HIGHLIGHTS</div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {pastHighlights.map((event, i) => (
              <div key={i} className="group px-3 py-2.5 rounded-lg bg-white/[0.01] border border-white/[0.02]
                hover:bg-white/[0.03] hover:border-white/[0.06] transition-all cursor-default">
                <div className="font-vhs text-[10px] text-white/30 group-hover:text-white/50 truncate transition-colors">
                  {event.venue}
                </div>
                <div className="flex justify-between mt-1">
                  <span className="font-vhs text-[8px] text-white/10">{event.city}</span>
                  <span className="font-vhs text-[8px] text-primary/20">{event.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scanDown {
          0% { top: -2px; }
          100% { top: 100%; }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0; transform: scale(0.5); }
          50% { opacity: 1; transform: scale(1.5); }
        }
      `}</style>
    </section>
  )
}

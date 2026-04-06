import { useState } from 'react'
import { bioEntries } from '../../data/bio'

export default function BioSection() {
  const [activeIndex, setActiveIndex] = useState(0)
  const active = bioEntries[activeIndex]

  return (
    <section id="bio" className="px-4 md:px-8 py-16 bg-[#060606] relative overflow-hidden">
      {/* Electric background effect */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-[0.015]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      <div className="max-w-5xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-2">// BIOGRAPHY</div>
          <h2 className="font-vhs text-3xl md:text-5xl text-white rgb-split tracking-wider">THE STORY</h2>
        </div>

        {/* Year selector - horizontal pills */}
        <div className="flex justify-center gap-1 md:gap-1.5 mb-8 flex-wrap">
          {bioEntries.map((entry, i) => (
            <button
              key={entry.year}
              onClick={() => setActiveIndex(i)}
              className={`font-vhs text-[10px] md:text-xs px-3 md:px-4 py-1.5 rounded-full transition-all duration-300 tracking-wider ${
                i === activeIndex
                  ? 'bg-primary/15 text-primary border border-primary/30 shadow-[0_0_15px_rgba(0,255,204,0.1)]'
                  : 'bg-white/[0.02] text-white/20 border border-white/[0.04] hover:text-white/40 hover:border-white/10'
              }`}
            >
              {entry.year}
            </button>
          ))}
        </div>

        {/* Active card - big and bold */}
        <div className="relative">
          {/* Electric arc decorations */}
          <svg className="absolute -top-6 -left-6 w-24 h-24 opacity-10" viewBox="0 0 100 100">
            <path d="M10 90 Q30 50 50 60 Q70 70 90 10" stroke="#00ffcc" strokeWidth="1" fill="none" className="electric-arc" />
            <path d="M20 80 Q40 30 60 50 Q80 60 95 20" stroke="#00ffcc" strokeWidth="0.5" fill="none" className="electric-arc-2" />
          </svg>
          <svg className="absolute -bottom-6 -right-6 w-24 h-24 opacity-10 rotate-180" viewBox="0 0 100 100">
            <path d="M10 90 Q30 50 50 60 Q70 70 90 10" stroke="#ff003c" strokeWidth="1" fill="none" className="electric-arc" />
          </svg>

          <div className="rounded-xl overflow-hidden border border-white/[0.05]"
            style={{
              background: 'linear-gradient(135deg, rgba(0,255,204,0.02) 0%, rgba(0,0,0,0.4) 50%, rgba(255,0,60,0.02) 100%)',
              boxShadow: '0 0 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)',
            }}>

            <div className="p-6 md:p-10">
              {/* Year - massive */}
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-vhs text-5xl md:text-7xl text-primary/80 leading-none tracking-wider"
                  style={{ textShadow: '0 0 30px rgba(0,255,204,0.2)' }}>
                  {active.year}
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-primary/20 to-transparent" />
              </div>

              {/* Title */}
              <h3 className="font-vhs text-lg md:text-2xl text-white/90 tracking-[0.15em] mb-4">
                {active.title}
              </h3>

              {/* Description */}
              <p className="text-white/40 text-sm md:text-base leading-relaxed max-w-2xl">
                {active.description}
              </p>

              {/* Electric line */}
              <div className="mt-6 h-px bg-gradient-to-r from-primary/20 via-accent/10 to-transparent" />

              {/* Progress dots */}
              <div className="flex gap-1.5 mt-4">
                {bioEntries.map((_, i) => (
                  <div key={i} className={`h-0.5 rounded-full transition-all duration-500 ${
                    i === activeIndex ? 'w-8 bg-primary' : i < activeIndex ? 'w-2 bg-primary/30' : 'w-2 bg-white/10'
                  }`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { value: '30+', label: 'YEARS ACTIVE' },
            { value: '300+', label: 'TRACKS RELEASED' },
            { value: '6', label: 'RECORD LABELS' },
          ].map((stat) => (
            <div key={stat.label} className="text-center py-4 rounded-lg bg-white/[0.01] border border-white/[0.03]">
              <div className="font-vhs text-2xl md:text-3xl text-primary mb-1"
                style={{ textShadow: '0 0 20px rgba(0,255,204,0.15)' }}>
                {stat.value}
              </div>
              <div className="font-vhs text-[8px] text-white/15 tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .electric-arc { animation: arcFlicker 3s ease-in-out infinite; }
        .electric-arc-2 { animation: arcFlicker 2.5s ease-in-out infinite 0.5s; }
        @keyframes arcFlicker {
          0%, 100% { opacity: 0.3; }
          20% { opacity: 1; }
          25% { opacity: 0.1; }
          30% { opacity: 0.8; }
          50% { opacity: 0.4; }
          70% { opacity: 0.9; }
          75% { opacity: 0.2; }
        }
      `}</style>
    </section>
  )
}

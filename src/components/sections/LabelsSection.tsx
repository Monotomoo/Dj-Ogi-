import { labelLinks } from '../../data/socials'

const LABEL_META: Record<string, {
  color: string
  glow: string
  founded: string
  releases: string
  desc: string
  tagline: string
}> = {
  Technodrome: {
    color: '#00ffcc',
    glow: 'rgba(0,255,204,0.12)',
    founded: '1998',
    releases: '60+',
    desc: 'The flagship imprint where the original Rijeka hard techno sound was forged. Raw, relentless, uncompromising.',
    tagline: 'FLAGSHIP',
  },
  'Techno Factory': {
    color: '#ff003c',
    glow: 'rgba(255,0,60,0.12)',
    founded: '2001',
    releases: '80+',
    desc: 'Industrial-grade techno built for warehouse floors. No fillers, no compromises — pure machine energy.',
    tagline: 'INDUSTRIAL',
  },
  'Dark Noise': {
    color: '#9900ff',
    glow: 'rgba(153,0,255,0.12)',
    founded: '2005',
    releases: '40+',
    desc: 'The experimental arm. Dark atmospheres, raw texture, noise and deep hypnotic pressure.',
    tagline: 'EXPERIMENTAL',
  },
  'Beast Music Records': {
    color: '#ff6600',
    glow: 'rgba(255,102,0,0.12)',
    founded: '2008',
    releases: '55+',
    desc: 'High-energy rave weapons engineered for peak-time destruction. The crowd never had a chance.',
    tagline: 'PEAK TIME',
  },
  'Noisy Room': {
    color: '#aaaaaa',
    glow: 'rgba(170,170,170,0.08)',
    founded: '2012',
    releases: '30+',
    desc: 'The underground side. Slow-burning, hypnotic and relentless. Four walls, no windows, no mercy.',
    tagline: 'UNDERGROUND',
  },
}

export default function LabelsSection() {
  return (
    <section className="px-4 md:px-8 py-20 bg-[#050505] relative overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-0 top-0 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 70%)', filter: 'blur(100px)' }} />
        <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 70%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-3">// DISCOGRAPHY</div>
          <h2 className="font-vhs text-4xl md:text-6xl text-white rgb-split tracking-wider mb-4">THE LABELS</h2>
          <p className="text-white/25 text-sm max-w-xl mx-auto leading-relaxed">
            30 years. 5 imprints. 265+ releases. Each label a different weapon in the same arsenal.
          </p>
          <div className="mt-5 h-px w-40 mx-auto bg-gradient-to-r from-transparent via-primary/25 to-transparent" />
        </div>

        {/* Featured label — Technodrome full-width */}
        {(() => {
          const flagship = labelLinks.find(l => l.name === 'Technodrome')
          const meta = flagship ? LABEL_META['Technodrome'] : null
          if (!flagship || !meta) return null
          return (
            <div className="relative rounded-2xl overflow-hidden mb-4 group"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,204,0.04) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.8) 100%)',
                border: '1px solid rgba(0,255,204,0.08)',
              }}>
              {/* Big background label name */}
              <div className="absolute inset-0 flex items-center justify-end pr-8 pointer-events-none overflow-hidden">
                <span className="font-vhs text-[10rem] md:text-[14rem] text-white/[0.02] leading-none tracking-tight select-none">
                  T
                </span>
              </div>

              {/* Hover glow */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 20% 50%, rgba(0,255,204,0.06) 0%, transparent 60%)' }} />

              <div className="relative p-8 md:p-10 flex flex-col md:flex-row md:items-center gap-6">
                {/* Left: label info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-3 h-3 rounded-full bg-primary shadow-[0_0_12px_rgba(0,255,204,0.6)]" />
                    <span className="font-vhs text-[9px] text-primary/50 tracking-[0.4em]">FLAGSHIP LABEL</span>
                  </div>
                  <h3 className="font-vhs text-3xl md:text-5xl text-primary tracking-wider mb-3"
                    style={{ textShadow: '0 0 40px rgba(0,255,204,0.2)' }}>
                    TECHNODROME
                  </h3>
                  <p className="text-white/35 text-sm leading-relaxed max-w-lg">{meta.desc}</p>
                </div>

                {/* Right: stats */}
                <div className="flex gap-8 md:flex-col md:gap-4 md:text-right">
                  <div>
                    <div className="font-vhs text-4xl md:text-5xl text-primary/70 leading-none"
                      style={{ textShadow: '0 0 20px rgba(0,255,204,0.15)' }}>
                      {meta.releases}
                    </div>
                    <div className="font-vhs text-[8px] text-white/15 tracking-widest mt-1">RELEASES</div>
                  </div>
                  <div>
                    <div className="font-vhs text-4xl md:text-5xl text-primary/40 leading-none">{meta.founded}</div>
                    <div className="font-vhs text-[8px] text-white/15 tracking-widest mt-1">FOUNDED</div>
                  </div>
                </div>
              </div>

              {/* Bottom electric line */}
              <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent
                opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          )
        })()}

        {/* Other 4 labels — 2x2 grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {labelLinks
            .filter(l => l.name !== 'Technodrome')
            .map((label) => {
              const meta = LABEL_META[label.name]
              if (!meta) return null
              return (
                <div key={label.name}
                  className="group relative rounded-xl overflow-hidden cursor-default"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.015) 0%, rgba(0,0,0,0.5) 100%)',
                    border: '1px solid rgba(255,255,255,0.04)',
                  }}>
                  {/* Big ghost letter */}
                  <div className="absolute top-0 right-4 pointer-events-none overflow-hidden h-full flex items-center">
                    <span className="font-vhs text-[8rem] text-white/[0.025] leading-none select-none">
                      {label.name[0]}
                    </span>
                  </div>

                  {/* Hover glow */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(ellipse at 0% 50%, ${meta.glow} 0%, transparent 60%)` }} />

                  <div className="relative p-6">
                    {/* Tagline */}
                    <div className="font-vhs text-[8px] tracking-[0.4em] mb-3 transition-opacity"
                      style={{ color: meta.color + '60' }}>
                      {meta.tagline}
                    </div>

                    {/* Name */}
                    <h3 className="font-vhs text-lg md:text-xl tracking-wider mb-3 transition-all duration-300 group-hover:opacity-100"
                      style={{ color: meta.color + 'cc' }}>
                      {label.name.toUpperCase()}
                    </h3>

                    {/* Desc */}
                    <p className="text-white/20 text-xs leading-relaxed mb-5 group-hover:text-white/35 transition-colors duration-300">
                      {meta.desc}
                    </p>

                    {/* Stats row */}
                    <div className="flex items-end justify-between border-t pt-4"
                      style={{ borderColor: meta.color + '15' }}>
                      <div>
                        <div className="font-vhs text-2xl leading-none"
                          style={{ color: meta.color + '80', textShadow: `0 0 15px ${meta.color}20` }}>
                          {meta.releases}
                        </div>
                        <div className="font-vhs text-[7px] text-white/10 tracking-widest mt-1">RELEASES</div>
                      </div>
                      <div className="text-right">
                        <div className="font-vhs text-lg leading-none text-white/20">{meta.founded}</div>
                        <div className="font-vhs text-[7px] text-white/10 tracking-widest mt-1">FOUNDED</div>
                      </div>
                    </div>
                  </div>

                  {/* Left color strip */}
                  <div className="absolute left-0 top-0 bottom-0 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: `linear-gradient(180deg, transparent, ${meta.color}, transparent)` }} />
                </div>
              )
            })}
        </div>

        {/* Total stat footer */}
        <div className="mt-12 pt-8 border-t border-white/[0.05] relative">
          {/* Glow line */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-0">
            {[
              { val: '5', label: 'IMPRINTS', color: '#00ffcc' },
              { val: '265+', label: 'TOTAL RELEASES', color: '#00ffcc' },
              { val: '30', label: 'YEARS ACTIVE', color: '#00ffcc' },
              { val: '1995', label: 'EST. RIJEKA', color: '#00ffcc' },
            ].map((stat, i) => (
              <div key={stat.label} className={`text-center py-4 ${i < 3 ? 'md:border-r border-white/[0.04]' : ''}`}>
                <div
                  className="font-vhs leading-none mb-2"
                  style={{
                    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
                    color: stat.color,
                    opacity: 0.6,
                    textShadow: `0 0 30px ${stat.color}25`,
                  }}
                >
                  {stat.val}
                </div>
                <div className="font-vhs text-[9px] text-white/20 tracking-[0.35em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import { useState } from 'react'
import { bookingEmail } from '../../data/socials'

const formInitial = { name: '', email: '', message: '' }

const platforms = [
  {
    name: 'SoundCloud',
    tagline: 'STREAM & FOLLOW',
    url: 'https://soundcloud.com/dj-ogi',
    color: '#ff5500',
    rgb: '255,85,0',
    icon: (
      <svg viewBox="0 0 32 20" fill="currentColor" className="w-9 h-6">
        <path d="M0 13.5a4.5 4.5 0 0 0 4.5 4.5H27a5 5 0 0 0 0-10h-.5A9 9 0 0 0 8.5 7a6.5 6.5 0 0 0-1.5-.2A7 7 0 0 0 0 13.5z"/>
        <path d="M2 8v4M4 6v7" strokeWidth="1.8" strokeLinecap="round" stroke="currentColor" fill="none"/>
      </svg>
    ),
  },
  {
    name: 'Discogs',
    tagline: 'VINYL RELEASES',
    url: 'https://www.discogs.com/artist/196808-DJ-Ogi',
    color: '#ff6600',
    rgb: '255,102,0',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <circle cx="12" cy="12" r="10" fill="currentColor"/>
        <circle cx="12" cy="12" r="5.5" fill="#040404"/>
        <circle cx="12" cy="12" r="2.2" fill="currentColor"/>
        <circle cx="12" cy="12" r="0.8" fill="#040404"/>
      </svg>
    ),
  },
  {
    name: 'Resident Advisor',
    tagline: 'ARTIST PROFILE',
    url: 'https://ra.co/dj/djogi',
    color: '#e8e8e8',
    rgb: '232,232,232',
    icon: (
      <div className="w-8 h-8 flex items-center justify-center">
        <span className="font-vhs font-black text-xl leading-none" style={{ color: 'currentColor' }}>RA</span>
      </div>
    ),
  },
  {
    name: 'Beatport',
    tagline: 'BUY TRACKS',
    url: 'https://www.beatport.com/artist/dj-ogi/29943',
    color: '#01ff95',
    rgb: '1,255,149',
    icon: (
      <svg viewBox="0 0 24 24" className="w-8 h-8">
        <path d="M12 2a10 10 0 0 0-10 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="0" y="12" width="5" height="8" rx="2.5" fill="currentColor"/>
        <rect x="19" y="12" width="5" height="8" rx="2.5" fill="currentColor"/>
      </svg>
    ),
  },
  {
    name: 'Bandcamp',
    tagline: 'DIRECT SUPPORT',
    url: 'https://djogi.bandcamp.com',
    color: '#1da0c3',
    rgb: '29,160,195',
    icon: (
      <svg viewBox="0 0 28 20" fill="currentColor" className="w-9 h-7">
        <path d="M0 20L10 0h18L18 20z"/>
      </svg>
    ),
  },
]

export default function ContactSection() {
  const [hoveredPlatform, setHoveredPlatform] = useState<number | null>(null)
  const [emailHovered, setEmailHovered] = useState(false)
  const [formData, setFormData] = useState(formInitial)
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const subject = encodeURIComponent(`Booking Inquiry from ${formData.name}`)
    const body = encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)
    window.open(`mailto:${bookingEmail}?subject=${subject}&body=${body}`)
    setSent(true)
    setTimeout(() => { setSent(false); setFormData(formInitial) }, 3000)
  }

  return (
    <section id="contact" className="relative pt-20 pb-10 overflow-hidden"
      style={{ background: 'linear-gradient(180deg, #000 0%, #040408 40%, #050510 60%, #000 100%)' }}>

      {/* Background ambience */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-[700px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: 'radial-gradient(ellipse, #00ffcc 0%, transparent 65%)', filter: 'blur(130px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[400px] rounded-full opacity-[0.02]"
          style={{ background: 'radial-gradient(ellipse, #ff5500 0%, transparent 65%)', filter: 'blur(100px)' }} />
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 relative">

        {/* ── DIVIDER ── */}
        <div className="flex items-center gap-5 mb-12">
          <div className="h-px flex-1 bg-gradient-to-r from-primary/25 to-transparent" />
          <span className="font-vhs text-[9px] text-white/15 tracking-[0.5em]">FIND ME ONLINE</span>
          <div className="h-px flex-1 bg-gradient-to-l from-primary/25 to-transparent" />
        </div>

        {/* ── PLATFORM CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-4">
          {platforms.map((platform, i) => {
            const isHov = hoveredPlatform === i
            return (
              <a
                key={i}
                href={platform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="relative rounded-xl overflow-hidden block text-center no-underline"
                style={{
                  padding: '1.5rem 1rem',
                  background: isHov
                    ? `rgba(${platform.rgb}, 0.09)`
                    : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${isHov ? platform.color + '50' : 'rgba(255,255,255,0.05)'}`,
                  transform: isHov ? 'translateY(-10px)' : 'translateY(0)',
                  boxShadow: isHov
                    ? `0 24px 60px rgba(${platform.rgb}, 0.3), 0 0 40px rgba(${platform.rgb}, 0.12), inset 0 1px 0 rgba(${platform.rgb}, 0.2)`
                    : '0 4px 20px rgba(0,0,0,0.5)',
                  transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
                onMouseEnter={() => setHoveredPlatform(i)}
                onMouseLeave={() => setHoveredPlatform(null)}
              >
                {/* Top glow bar */}
                <div
                  className="absolute top-0 left-0 right-0 h-px"
                  style={{
                    background: isHov
                      ? `linear-gradient(90deg, transparent, ${platform.color}, transparent)`
                      : 'transparent',
                    transition: 'background 0.3s ease',
                  }}
                />

                {/* Corner sparks on hover */}
                {isHov && (
                  <>
                    <div className="absolute top-1 left-1 w-1 h-1 rounded-full"
                      style={{ background: platform.color, opacity: 0.6, filter: `blur(2px)` }} />
                    <div className="absolute top-1 right-1 w-1 h-1 rounded-full"
                      style={{ background: platform.color, opacity: 0.4, filter: `blur(2px)` }} />
                  </>
                )}

                {/* Icon */}
                <div
                  className="flex justify-center items-center mb-4"
                  style={{
                    color: isHov ? platform.color : 'rgba(255,255,255,0.25)',
                    transform: isHov ? 'scale(1.18)' : 'scale(1)',
                    filter: isHov ? `drop-shadow(0 0 10px ${platform.color}90)` : 'none',
                    transition: 'color 0.3s, transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.3s',
                  }}
                >
                  {platform.icon}
                </div>

                {/* Platform name */}
                <div
                  className="font-vhs text-[11px] leading-snug mb-1.5"
                  style={{
                    color: isHov ? '#fff' : 'rgba(255,255,255,0.35)',
                    transition: 'color 0.3s ease',
                    letterSpacing: '0.1em',
                  }}
                >
                  {platform.name.toUpperCase()}
                </div>

                {/* Tagline */}
                <div
                  className="font-vhs text-[8px] tracking-widest"
                  style={{
                    color: isHov ? `rgba(${platform.rgb}, 0.8)` : 'rgba(255,255,255,0.1)',
                    transition: 'color 0.3s ease',
                  }}
                >
                  {platform.tagline}
                </div>

                {/* Visit arrow */}
                <div
                  className="font-vhs text-[9px] mt-2.5"
                  style={{
                    color: platform.color,
                    opacity: isHov ? 1 : 0,
                    transform: isHov ? 'translateY(0)' : 'translateY(6px)',
                    transition: 'opacity 0.25s ease, transform 0.3s ease',
                  }}
                >
                  VISIT →
                </div>
              </a>
            )
          })}
        </div>

        {/* ── EMAIL CARD (full-width, same family as platform cards) ── */}
        <a
          href={`mailto:${bookingEmail}`}
          className="relative rounded-xl overflow-hidden block mb-6"
          onMouseEnter={() => setEmailHovered(true)}
          onMouseLeave={() => setEmailHovered(false)}
          style={{
            padding: '1.75rem 2rem',
            background: emailHovered
              ? 'rgba(0,255,204,0.07)'
              : 'rgba(255,255,255,0.02)',
            border: `1px solid ${emailHovered ? 'rgba(0,255,204,0.35)' : 'rgba(255,255,255,0.05)'}`,
            transform: emailHovered ? 'translateY(-6px)' : 'translateY(0)',
            boxShadow: emailHovered
              ? '0 24px 60px rgba(0,255,204,0.2), 0 0 60px rgba(0,255,204,0.08), inset 0 1px 0 rgba(0,255,204,0.15)'
              : '0 4px 20px rgba(0,0,0,0.5)',
            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
            textDecoration: 'none',
          }}
        >
          {/* Top glow bar */}
          <div className="absolute top-0 left-0 right-0 h-px transition-all duration-300"
            style={{ background: emailHovered ? 'linear-gradient(90deg, transparent, #00ffcc, transparent)' : 'transparent' }} />

          {/* Corner sparks */}
          {emailHovered && (
            <>
              <div className="absolute top-1 left-1 w-1 h-1 rounded-full" style={{ background: '#00ffcc', opacity: 0.6, filter: 'blur(2px)' }} />
              <div className="absolute top-1 right-1 w-1 h-1 rounded-full" style={{ background: '#00ffcc', opacity: 0.4, filter: 'blur(2px)' }} />
            </>
          )}

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <div className="font-vhs text-[9px] tracking-[0.5em] mb-3"
                style={{ color: emailHovered ? 'rgba(0,255,204,0.6)' : 'rgba(255,255,255,0.15)' }}>
                DIRECT BOOKING
              </div>
              <div className="font-vhs text-2xl md:text-4xl tracking-tight"
                style={{
                  color: emailHovered ? '#00ffcc' : 'rgba(255,255,255,0.88)',
                  textShadow: emailHovered ? '0 0 40px rgba(0,255,204,0.6)' : 'none',
                  transition: 'color 0.3s, text-shadow 0.3s',
                }}>
                {bookingEmail}
              </div>
            </div>
            <div className="font-vhs text-[11px] tracking-[0.4em] shrink-0"
              style={{
                color: emailHovered ? '#00ffcc' : 'rgba(255,255,255,0.1)',
                opacity: emailHovered ? 1 : 0.5,
                transform: emailHovered ? 'translateX(0)' : 'translateX(-6px)',
                transition: 'all 0.3s ease',
              }}>
              WRITE NOW →
            </div>
          </div>
        </a>

        {/* ── CONTACT FORM ── */}
        <div className="mb-10">
          <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-4">// BOOKING INQUIRY</div>
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="YOUR NAME"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-md px-4 py-2.5
                font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none
                focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <input
              type="email"
              placeholder="YOUR EMAIL"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-md px-4 py-2.5
                font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none
                focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <textarea
              placeholder="YOUR MESSAGE"
              required
              rows={4}
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              className="w-full bg-white/[0.02] border border-white/[0.06] rounded-md px-4 py-2.5
                font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none resize-none
                focus:border-primary/30 focus:ring-1 focus:ring-primary/20 transition-all"
            />
            <button
              type="submit"
              className={`font-vhs text-[10px] tracking-widest px-6 py-2.5 rounded-md transition-all ${
                sent
                  ? 'bg-primary/20 text-primary border border-primary/30'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.08] hover:bg-primary/10 hover:text-primary hover:border-primary/20'
              }`}
            >
              {sent ? 'SENT //' : 'SEND MESSAGE'}
            </button>
          </form>
        </div>

        {/* ── FOOTER ── */}
        <div className="pt-4 border-t border-white/[0.03] flex justify-between items-center">
          <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">
            DJ OGI © {new Date().getFullYear()}
          </span>
          <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">RIJEKA // CROATIA</span>
        </div>
      </div>
    </section>
  )
}

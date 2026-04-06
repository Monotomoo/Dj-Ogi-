import { useState } from 'react'
import { bookingEmail } from '../../data/socials'

const formInitial = { name: '', email: '', message: '' }

export default function FooterSection() {
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
    <footer
      style={{
        background: 'linear-gradient(180deg, #000 0%, #04040a 100%)',
        borderTop: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      {/* END OF TAPE tape-rip */}
      <div className="w-full overflow-hidden leading-none select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="font-vhs text-[8px] text-white/[0.05] tracking-[0.6em] text-center py-2">
          ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14">

          {/* Left — identity */}
          <div>
            <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-5">// DJ OGI</div>
            <div className="font-vhs text-5xl md:text-6xl text-white/80 tracking-wider mb-2 leading-tight">
              DJ OGI
            </div>
            <div className="font-vhs text-xs text-white/20 tracking-[0.3em] mb-8">
              HARD TECHNO · RIJEKA · SINCE 1995
            </div>

            <div className="h-px w-16 bg-primary/20 mb-8" />

            <div className="space-y-2">
              <div className="font-vhs text-[8px] text-white/10 tracking-[0.4em]">DIRECT BOOKING</div>
              <a
                href={`mailto:${bookingEmail}`}
                className="font-vhs text-sm text-primary/70 hover:text-primary transition-colors duration-300"
              >
                {bookingEmail}
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div>
            <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-5">// BOOKING INQUIRY</div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="YOUR NAME"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3
                  font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none
                  focus:border-primary/30 focus:bg-white/[0.04] transition-all"
              />
              <input
                type="email"
                placeholder="YOUR EMAIL"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3
                  font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none
                  focus:border-primary/30 focus:bg-white/[0.04] transition-all"
              />
              <textarea
                placeholder="YOUR MESSAGE"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-white/[0.025] border border-white/[0.06] rounded-lg px-4 py-3
                  font-vhs text-xs text-white/70 placeholder:text-white/15 outline-none resize-none
                  focus:border-primary/30 focus:bg-white/[0.04] transition-all"
              />
              <button
                type="submit"
                className={`font-vhs text-[10px] tracking-widest px-6 py-3 rounded-lg w-full transition-all duration-300 ${
                  sent
                    ? 'bg-primary/20 text-primary border border-primary/30'
                    : 'bg-white/[0.03] text-white/40 border border-white/[0.06] hover:bg-primary/10 hover:text-primary hover:border-primary/25'
                }`}
              >
                {sent ? '// MESSAGE SENT //' : 'SEND MESSAGE'}
              </button>
            </form>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-5 border-t border-white/[0.03] flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-6">
            <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">
              DJ OGI © {new Date().getFullYear()}
            </span>
            <span className="font-vhs text-[7px] text-white/[0.04] tracking-widest">RIJEKA // CROATIA</span>
          </div>
          <span className="font-vhs text-[7px] text-white/[0.04] tracking-widest">
            TECHNO FACTORY · BEAST MUSIC · DARK NOISE · TECHNODROME · NOISY ROOM
          </span>
        </div>
      </div>
    </footer>
  )
}

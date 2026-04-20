import { useState } from 'react'
import { bookingEmail } from '../../data/socials'

const formInitial = { name: '', email: '', message: '' }

export default function FooterSection() {
  const [formData, setFormData] = useState(formInitial)
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setError(null)
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          access_key: 'df78fb3b-31c8-4480-9bbe-c6886a8f4348',
          name: formData.name,
          email: formData.email,
          message: formData.message,
          subject: `DJ Ogi Booking: ${formData.name}`,
          from_name: 'DJ Ogi Website',
          replyto: formData.email,
        }),
      })
      const data = await res.json()
      if (data.success) {
        setSent(true)
        setFormData(formInitial)
        setTimeout(() => setSent(false), 5000)
      } else {
        setError(data.message || 'Failed to send — try emailing directly')
        setTimeout(() => setError(null), 6000)
      }
    } catch {
      setError('Network error — try again or email directly')
      setTimeout(() => setError(null), 6000)
    } finally {
      setSending(false)
    }
  }

  return (
    <footer
      style={{
        background: 'linear-gradient(180deg, #000 0%, #05050a 50%, #07070e 100%)',
        borderTop: '1px solid rgba(0,255,204,0.08)',
      }}
    >
      {/* END OF TAPE strip */}
      <div className="w-full overflow-hidden leading-none select-none"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="font-vhs text-[10px] text-white/15 tracking-[0.6em] text-center py-3">
          ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄ END OF TAPE ◄◄
        </div>
      </div>

      {/* Ambient glow */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[400px] rounded-full opacity-[0.05]"
            style={{ background: 'radial-gradient(circle, #00ffcc 0%, transparent 70%)', filter: 'blur(120px)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] rounded-full opacity-[0.04]"
            style={{ background: 'radial-gradient(circle, #ff003c 0%, transparent 70%)', filter: 'blur(100px)' }} />
        </div>

        <div className="max-w-6xl mx-auto px-4 md:px-8 py-20 md:py-24 relative">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-14 md:gap-20">

            {/* Left — identity */}
            <div>
              <div className="font-vhs text-[11px] text-primary/60 tracking-[0.5em] mb-6">// DJ OGI</div>
              <div className="font-vhs text-6xl md:text-7xl lg:text-8xl text-white tracking-wider mb-4 leading-[0.95] rgb-split">
                DJ OGI
              </div>
              <div className="font-vhs text-sm md:text-base text-white/60 tracking-[0.3em] mb-10">
                HARD TECHNO · RIJEKA · SINCE 1994
              </div>

              <div className="h-px w-24 bg-gradient-to-r from-primary to-transparent mb-10" />

              <div className="space-y-3">
                <div className="font-vhs text-[10px] text-primary/50 tracking-[0.5em]">DIRECT BOOKING</div>
                <a
                  href={`mailto:${bookingEmail}`}
                  className="font-vhs text-xl md:text-2xl text-primary hover:text-white transition-colors duration-300 inline-block"
                  style={{ textShadow: '0 0 20px rgba(0,255,204,0.4)' }}
                >
                  {bookingEmail}
                </a>
                <div className="font-vhs text-[10px] text-white/30 tracking-[0.4em] pt-2">
                  WORLDWIDE BOOKINGS · PRESS · COLLABORATIONS
                </div>
              </div>
            </div>

            {/* Right — form */}
            <div>
              <div className="font-vhs text-[11px] text-primary/60 tracking-[0.5em] mb-6">// BOOKING INQUIRY</div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  placeholder="YOUR NAME"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4
                    font-vhs text-sm text-white placeholder:text-white/30 outline-none
                    focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(0,255,204,0.1)] transition-all"
                />
                <input
                  type="email"
                  placeholder="YOUR EMAIL"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4
                    font-vhs text-sm text-white placeholder:text-white/30 outline-none
                    focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(0,255,204,0.1)] transition-all"
                />
                <textarea
                  placeholder="YOUR MESSAGE"
                  required
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-5 py-4
                    font-vhs text-sm text-white placeholder:text-white/30 outline-none resize-none
                    focus:border-primary/50 focus:bg-white/[0.06] focus:shadow-[0_0_20px_rgba(0,255,204,0.1)] transition-all"
                />
                <button
                  type="submit"
                  disabled={sending}
                  className={`font-vhs text-xs tracking-[0.3em] px-6 py-4 rounded-lg w-full transition-all duration-300 ${
                    sent
                      ? 'bg-primary/25 text-primary border-2 border-primary/50 shadow-[0_0_25px_rgba(0,255,204,0.25)]'
                      : sending
                      ? 'bg-primary/5 text-primary/60 border-2 border-primary/20 cursor-wait'
                      : 'bg-primary/10 text-primary border-2 border-primary/30 hover:bg-primary/20 hover:border-primary/50 hover:shadow-[0_0_25px_rgba(0,255,204,0.2)]'
                  }`}
                >
                  {sent ? '// MESSAGE SENT //' : sending ? 'SENDING...' : 'SEND MESSAGE →'}
                </button>
                {error && (
                  <p className="font-vhs text-[9px] text-accent/80 tracking-widest text-center pt-1">
                    {error}
                  </p>
                )}
              </form>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <span className="font-vhs text-[10px] text-white/40 tracking-widest">
                DJ OGI © {new Date().getFullYear()}
              </span>
              <span className="font-vhs text-[10px] text-white/30 tracking-widest">RIJEKA // CROATIA</span>
            </div>
            <span className="font-vhs text-[10px] text-white/30 tracking-widest text-center md:text-right">
              TECHNODROME · TECHNO FACTORY · BEAST MUSIC · DARK NOISE · NOISY ROOM
            </span>
          </div>
        </div>
      </div>
    </footer>
  )
}

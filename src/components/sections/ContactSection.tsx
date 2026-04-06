import { useState } from 'react'
import { socialLinks, labelLinks, bookingEmail } from '../../data/socials'

export default function ContactSection() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Open mailto with form data as a fallback
    const subject = encodeURIComponent(`Booking Inquiry from ${formData.name}`)
    const body = encodeURIComponent(`From: ${formData.name}\nEmail: ${formData.email}\n\n${formData.message}`)
    window.open(`mailto:${bookingEmail}?subject=${subject}&body=${body}`)
    setSent(true)
    setTimeout(() => setSent(false), 3000)
  }

  return (
    <footer id="contact" className="px-4 md:px-8 py-12 bg-[#040404] border-t border-white/[0.03]">
      <div className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">

          {/* Contact Form */}
          <div>
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

          {/* Info column */}
          <div className="space-y-6">
            {/* Direct email */}
            <div>
              <div className="font-vhs text-[8px] text-white/10 tracking-widest mb-1.5">DIRECT BOOKING</div>
              <a href={`mailto:${bookingEmail}`}
                className="font-vhs text-sm text-primary hover:text-primary/70 transition-colors">
                {bookingEmail}
              </a>
            </div>

            {/* Socials */}
            <div>
              <div className="font-vhs text-[8px] text-white/10 tracking-widest mb-2">CONNECT</div>
              <div className="flex gap-3 flex-wrap">
                {socialLinks.map((link) => (
                  <a key={link.name} href={link.url} target="_blank" rel="noopener noreferrer"
                    className="font-vhs text-[9px] text-white/20 hover:text-primary px-2.5 py-1.5 rounded
                      bg-white/[0.02] border border-white/[0.04] hover:border-primary/20 transition-all tracking-widest">
                    {link.name.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>

            {/* Labels */}
            <div>
              <div className="font-vhs text-[8px] text-white/10 tracking-widest mb-2">LABELS</div>
              <div className="flex gap-2 flex-wrap">
                {labelLinks.map((label) => (
                  <span key={label.name}
                    className="font-vhs text-[8px] text-white/10 tracking-wider">
                    {label.name.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 border-t border-white/[0.03] flex justify-between items-center">
          <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">DJ OGI &copy; {new Date().getFullYear()}</span>
          <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">RIJEKA // CROATIA</span>
        </div>
      </div>
    </footer>
  )
}

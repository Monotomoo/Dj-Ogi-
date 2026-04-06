import { useState, useEffect, useCallback } from 'react'
import HeroSection from './components/sections/HeroSection'
import EventsSection from './components/sections/EventsSection'
import MixerSection from './components/sections/MixerSection'
import BioSection from './components/sections/BioSection'
import LabelsSection from './components/sections/LabelsSection'
import ContactSection from './components/sections/ContactSection'
import VHSOverlay from './components/vhs/VHSOverlay'
import Navigation from './components/layout/Navigation'
import PressMarquee from './components/layout/PressMarquee'
import NowPlayingBar from './components/layout/NowPlayingBar'

function App() {
  const [strobeActive, setStrobeActive] = useState(false)
  const [strobeWarning, setStrobeWarning] = useState(false)

  const triggerStrobe = useCallback(() => {
    setStrobeWarning(true)
    setTimeout(() => {
      setStrobeWarning(false)
      setStrobeActive(true)
      setTimeout(() => setStrobeActive(false), 3000)
    }, 800)
  }, [])

  // STROBO easter egg: type "STROBO" anywhere on the page
  useEffect(() => {
    let buffer = ''
    const SECRET = 'STROBO'
    const onKey = (e: KeyboardEvent) => {
      // Don't trigger inside form inputs
      const tag = (e.target as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      buffer = (buffer + e.key.toUpperCase()).slice(-SECRET.length)
      if (buffer === SECRET) {
        buffer = ''
        triggerStrobe()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [triggerStrobe])

  return (
    <>
      <VHSOverlay />
      <Navigation />
      <NowPlayingBar />

      {/* STROBO easter egg overlay */}
      {strobeWarning && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center pointer-events-none">
          <div className="font-vhs text-2xl md:text-4xl text-primary tracking-[0.3em] animate-pulse"
            style={{ textShadow: '0 0 30px rgba(0,255,204,0.8)' }}>
            // STROBO MODE //
          </div>
        </div>
      )}
      {strobeActive && (
        <div className="fixed inset-0 z-[99998] pointer-events-none strobe-overlay" />
      )}

      <main>
        <HeroSection />
        <PressMarquee />
        <ContactSection />
        <EventsSection />
        <MixerSection />
        <BioSection />
        <LabelsSection />
      </main>
    </>
  )
}

export default App

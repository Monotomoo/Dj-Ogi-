import { useEffect, useRef } from 'react'
import Deck from './Deck'
import Crossfader from './Crossfader'
import { scManager } from '../../lib/audio/soundcloudManager'
import { useAudioStore } from '../../stores/audioStore'
import { equalPowerCrossfade } from '../../lib/audio/crossfaderMath'
import { startBeatSimulator, stopBeatSimulator } from '../../lib/audio/beatSimulator'
import { startVHSController, stopVHSController } from '../../lib/effects/vhsController'
import { essentialTracks } from '../../data/tracks'

export default function DJMixer() {
  const iframeARef = useRef<HTMLIFrameElement>(null)
  const iframeBRef = useRef<HTMLIFrameElement>(null)
  const crossfader = useAudioStore((s) => s.crossfader)
  const deckAVolume = useAudioStore((s) => s.deckA.volume)
  const deckBVolume = useAudioStore((s) => s.deckB.volume)
  const deckAPlaying = useAudioStore((s) => s.deckA.isPlaying)
  const deckBPlaying = useAudioStore((s) => s.deckB.isPlaying)
  const prevCrossfader = useRef(crossfader)

  useEffect(() => {
    const setupDeck = (deckId: 'A' | 'B') => {
      scManager.onProgress(deckId, (data) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        update({ positionMs: data.position, position: data.relativePosition })
      })
      scManager.onStateChange(deckId, (state) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        if (state === 'play') update({ isPlaying: true, isLoading: false, hasError: false })
        if (state === 'pause') update({ isPlaying: false })
        if (state === 'finish') update({ isPlaying: false, position: 0 })
        if (state === 'ready') update({ isReady: true, isLoaded: true, isLoading: false, hasError: false })
        if (state === 'loading') update({ isReady: false, isLoading: true, hasError: false })
        if (state === 'error') update({ isLoading: false, hasError: true, isPlaying: false })
      })
      scManager.onTrackLoaded(deckId, (track) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        update({ trackTitle: track.title, trackArtist: track.artist, duration: track.duration, isLoaded: true })
      })
    }
    setupDeck('A')
    setupDeck('B')
    if (iframeARef.current) scManager.initDeck('A', iframeARef.current)
    setTimeout(() => {
      if (iframeBRef.current) scManager.initDeck('B', iframeBRef.current)
    }, 800)
    useAudioStore.getState().updateDeckA({ bpm: essentialTracks[0].bpm, trackUrl: essentialTracks[0].soundcloudUrl, trackTitle: essentialTracks[0].title, trackArtist: essentialTracks[0].artist })
    useAudioStore.getState().updateDeckB({ bpm: essentialTracks[1].bpm, trackUrl: essentialTracks[1].soundcloudUrl, trackTitle: essentialTracks[1].title, trackArtist: essentialTracks[1].artist })
    startBeatSimulator()
    startVHSController()
    return () => { stopBeatSimulator(); stopVHSController() }
  }, [])

  useEffect(() => {
    const { volumeA, volumeB } = equalPowerCrossfade(crossfader, deckAVolume, deckBVolume)
    scManager.setVolume('A', volumeA)
    scManager.setVolume('B', volumeB)
  }, [crossfader, deckAVolume, deckBVolume])

  useEffect(() => {
    const prev = prevCrossfader.current
    prevCrossfader.current = crossfader
    const state = useAudioStore.getState()
    const bothLoaded = state.deckA.isLoaded && state.deckB.isLoaded
    if (!bothLoaded) return
    if (prev <= 0.5 && crossfader > 0.5 && !state.deckB.isPlaying) scManager.play('B')
    else if (prev >= 0.5 && crossfader < 0.5 && !state.deckA.isPlaying) scManager.play('A')
  }, [crossfader])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hidden SC iframes */}
      <div className="sr-only" aria-hidden="true">
        <iframe ref={iframeARef} id="sc-deck-a" width="300" height="166" scrolling="no" frameBorder="no" allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(essentialTracks[0].soundcloudUrl)}&color=%2300ffcc&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />
        <iframe ref={iframeBRef} id="sc-deck-b" width="300" height="166" scrolling="no" frameBorder="no" allow="autoplay"
          src={`https://w.soundcloud.com/player/?url=${encodeURIComponent(essentialTracks[1].soundcloudUrl)}&color=%23ff003c&auto_play=false&hide_related=true&show_comments=false&show_user=false&show_reposts=false&show_teaser=false`} />
      </div>

      {/* MIXER SHELL */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #111116 0%, #0a0a0e 40%, #08080c 100%)',
          boxShadow: '0 0 100px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>

        {/* Top chrome bar */}
        <div className="flex items-center justify-between px-6 py-3"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {/* Deck A indicator */}
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${deckAPlaying ? 'bg-primary shadow-[0_0_12px_#00ffcc,0_0_24px_#00ffcc60]' : 'bg-primary/20'}`} />
            <span className="font-vhs text-[11px] text-primary/50 tracking-[0.35em]">DECK A</span>
          </div>

          {/* Center brand */}
          <div className="font-vhs text-[11px] text-white/20 tracking-[0.45em]">DJ OGI // MIXER</div>

          {/* Deck B indicator */}
          <div className="flex items-center gap-2.5">
            <span className="font-vhs text-[11px] text-accent/50 tracking-[0.35em]">DECK B</span>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${deckBPlaying ? 'bg-accent shadow-[0_0_12px_#ff003c,0_0_24px_#ff003c60]' : 'bg-accent/20'}`} />
          </div>
        </div>

        {/* Decks */}
        <div className="grid grid-cols-1 lg:grid-cols-2">
          {/* Deck A panel */}
          <div className="relative p-5 lg:p-6"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.04)',
              background: deckAPlaying
                ? 'linear-gradient(135deg, rgba(0,255,204,0.04) 0%, transparent 60%)'
                : 'transparent',
              transition: 'background 0.8s ease',
            }}>
            {/* Ambient glow when playing */}
            {deckAPlaying && (
              <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(0,255,204,0.08) 0%, transparent 70%)' }} />
            )}
            <div className="relative">
              <Deck deckId="A" />
            </div>
          </div>

          {/* Deck B panel */}
          <div className="relative p-5 lg:p-6"
            style={{
              background: deckBPlaying
                ? 'linear-gradient(225deg, rgba(255,0,60,0.04) 0%, transparent 60%)'
                : 'transparent',
              transition: 'background 0.8s ease',
            }}>
            {deckBPlaying && (
              <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(255,0,60,0.08) 0%, transparent 70%)' }} />
            )}
            <div className="relative">
              <Deck deckId="B" />
            </div>
          </div>
        </div>

        {/* Crossfader zone */}
        <div className="px-6 py-5"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)' }}>
          <Crossfader />
        </div>

        {/* Bottom chrome */}
        <div className="flex justify-between items-center px-6 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.4)' }}>
          <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">SOUNDCLOUD POWERED</span>
          <div className="flex gap-5">
            <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">RIJEKA</span>
            <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">CROATIA</span>
          </div>
        </div>
      </div>
    </div>
  )
}

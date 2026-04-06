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
    if (iframeBRef.current) scManager.initDeck('B', iframeBRef.current)
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

  // Smart crossfader handoff — SC only plays one stream at a time.
  // When the fader crosses 50%, auto-play the dominant deck.
  // SC will automatically pause the other one.
  useEffect(() => {
    const prev = prevCrossfader.current
    prevCrossfader.current = crossfader

    const state = useAudioStore.getState()
    const bothLoaded = state.deckA.isLoaded && state.deckB.isLoaded
    if (!bothLoaded) return

    if (prev <= 0.5 && crossfader > 0.5 && !state.deckB.isPlaying) {
      scManager.play('B')
    } else if (prev >= 0.5 && crossfader < 0.5 && !state.deckA.isPlaying) {
      scManager.play('A')
    }
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

      {/* MIXER CONSOLE */}
      <div className="relative rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0c0c0e 0%, #08080a 50%, #0a0a0c 100%)',
          boxShadow: '0 0 80px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>

        {/* Top chrome bar */}
        <div className="flex items-center justify-between px-5 py-2.5 border-b border-white/[0.04]"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.02) 0%, transparent 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary/50 shadow-[0_0_6px_rgba(0,255,204,0.3)]" />
            <span className="font-vhs text-[10px] text-primary/30 tracking-[0.3em]">DECK A</span>
          </div>
          <div className="font-vhs text-xs text-white/15 tracking-[0.4em]">DJ OGI // MIXER</div>
          <div className="flex items-center gap-3">
            <span className="font-vhs text-[10px] text-accent/30 tracking-[0.3em]">DECK B</span>
            <div className="w-2 h-2 rounded-full bg-accent/50 shadow-[0_0_6px_rgba(255,0,60,0.3)]" />
          </div>
        </div>

        {/* Decks area */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 divide-x divide-white/[0.03]">
          <div className="p-4 lg:p-5">
            <Deck deckId="A" />
          </div>
          <div className="p-4 lg:p-5">
            <Deck deckId="B" />
          </div>
        </div>

        {/* Crossfader zone */}
        <div className="px-5 py-4 border-t border-white/[0.04]"
          style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.01) 100%)' }}>
          <Crossfader />
        </div>

        {/* Bottom chrome */}
        <div className="flex justify-between items-center px-5 py-1.5 border-t border-white/[0.03]">
          <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">SOUNDCLOUD POWERED</span>
          <div className="flex gap-4">
            <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">RIJEKA</span>
            <span className="font-vhs text-[7px] text-white/[0.06] tracking-widest">CROATIA</span>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useEffect, useRef, useState } from 'react'
import Deck from './Deck'
import Crossfader from './Crossfader'
import FFTSpectrum from './FFTSpectrum'
import RecordButton from './RecordButton'
import CrowdMeter from './CrowdMeter'
import FloorDestroyed from './FloorDestroyed'
import { audioManager } from '../../lib/audio/audioManager'
import { useAudioStore } from '../../stores/audioStore'
import { equalPowerCrossfade } from '../../lib/audio/crossfaderMath'
import { startBeatSimulator, stopBeatSimulator } from '../../lib/audio/beatSimulator'
import { startVHSController, stopVHSController } from '../../lib/effects/vhsController'
import { essentialTracks } from '../../data/tracks'

const firstPlayable = essentialTracks.find(t => t.audioUrl) ?? essentialTracks[0]
const secondPlayable = essentialTracks.find((t, i) => i > 0 && t.audioUrl) ?? essentialTracks[1]

export default function DJMixer() {
  const audioARef = useRef<HTMLAudioElement>(null)
  const audioBRef = useRef<HTMLAudioElement>(null)
  const crossfader = useAudioStore((s) => s.crossfader)
  const deckAVolume = useAudioStore((s) => s.deckA.volume)
  const deckBVolume = useAudioStore((s) => s.deckB.volume)
  const deckAPlaying = useAudioStore((s) => s.deckA.isPlaying)
  const deckBPlaying = useAudioStore((s) => s.deckB.isPlaying)
  const prevCrossfader = useRef(crossfader)

  const [floorDestroyedTick, setFloorDestroyedTick] = useState(0)

  useEffect(() => {
    const setupDeck = (deckId: 'A' | 'B') => {
      audioManager.onProgress(deckId, (data) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        update({ positionMs: data.position, position: data.relativePosition })
      })
      audioManager.onStateChange(deckId, (state) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        if (state === 'play') update({ isPlaying: true, isLoading: false, hasError: false })
        if (state === 'pause') update({ isPlaying: false })
        if (state === 'finish') update({ isPlaying: false, position: 0 })
        if (state === 'ready') update({ isReady: true, isLoaded: true, isLoading: false, hasError: false })
        if (state === 'loading') update({ isReady: false, isLoading: true, hasError: false })
        if (state === 'error') update({ isLoading: false, hasError: true, isPlaying: false })
      })
      audioManager.onTrackLoaded(deckId, (track) => {
        const update = deckId === 'A' ? useAudioStore.getState().updateDeckA : useAudioStore.getState().updateDeckB
        update({ trackTitle: track.title, trackArtist: track.artist, duration: track.duration, isLoaded: true })
      })
    }
    setupDeck('A')
    setupDeck('B')

    if (audioARef.current) audioManager.initDeck('A', audioARef.current)
    if (audioBRef.current) audioManager.initDeck('B', audioBRef.current)

    useAudioStore.getState().updateDeckA({
      bpm: firstPlayable.bpm,
      trackUrl: firstPlayable.audioUrl || firstPlayable.soundcloudUrl,
      trackTitle: firstPlayable.title,
      trackArtist: firstPlayable.artist,
    })
    useAudioStore.getState().updateDeckB({
      bpm: secondPlayable.bpm,
      trackUrl: secondPlayable.audioUrl || secondPlayable.soundcloudUrl,
      trackTitle: secondPlayable.title,
      trackArtist: secondPlayable.artist,
    })

    startBeatSimulator()
    startVHSController()
    return () => { stopBeatSimulator(); stopVHSController() }
  }, [])

  useEffect(() => {
    const { volumeA, volumeB } = equalPowerCrossfade(crossfader, deckAVolume, deckBVolume)
    audioManager.setVolume('A', volumeA)
    audioManager.setVolume('B', volumeB)
  }, [crossfader, deckAVolume, deckBVolume])

  useEffect(() => {
    const prev = prevCrossfader.current
    prevCrossfader.current = crossfader
    const state = useAudioStore.getState()
    const bothLoaded = state.deckA.isLoaded && state.deckB.isLoaded
    if (!bothLoaded) return
    if (prev <= 0.5 && crossfader > 0.5 && !state.deckB.isPlaying) audioManager.play('B')
    else if (prev >= 0.5 && crossfader < 0.5 && !state.deckA.isPlaying) audioManager.play('A')
  }, [crossfader])

  return (
    <div className="w-full max-w-7xl mx-auto">
      {/* Hidden <audio> elements */}
      <div className="sr-only" aria-hidden="true">
        <audio ref={audioARef} id="audio-deck-a" preload="auto" crossOrigin="anonymous" src={firstPlayable.audioUrl || ''} />
        <audio ref={audioBRef} id="audio-deck-b" preload="auto" crossOrigin="anonymous" src={secondPlayable.audioUrl || ''} />
      </div>

      {/* FLOOR DESTROYED celebration overlay */}
      <FloorDestroyed trigger={floorDestroyedTick} />

      {/* MIXER SHELL */}
      <div className="relative rounded-2xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #111116 0%, #0a0a0e 40%, #08080c 100%)',
          boxShadow: '0 0 100px rgba(0,0,0,0.9), 0 0 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.06)',
        }}>

        {/* Top chrome bar — now with REC button + both deck indicators */}
        <div className="flex items-center justify-between px-6 py-3 gap-4"
          style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${deckAPlaying ? 'bg-primary shadow-[0_0_12px_#00ffcc,0_0_24px_#00ffcc60]' : 'bg-primary/20'}`} />
            <span className="font-vhs text-[11px] text-primary/50 tracking-[0.35em]">DECK A</span>
          </div>

          {/* Center — REC button replaces "DJ OGI // MIXER" */}
          <RecordButton />

          <div className="flex items-center gap-2.5">
            <span className="font-vhs text-[11px] text-accent/50 tracking-[0.35em]">DECK B</span>
            <div className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${deckBPlaying ? 'bg-accent shadow-[0_0_12px_#ff003c,0_0_24px_#ff003c60]' : 'bg-accent/20'}`} />
          </div>
        </div>

        {/* Decks + Crowd Meter between them */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-0">
          {/* Deck A panel */}
          <div className="relative p-5 lg:p-6"
            style={{
              borderRight: '1px solid rgba(255,255,255,0.04)',
              background: deckAPlaying ? 'linear-gradient(135deg, rgba(0,255,204,0.04) 0%, transparent 60%)' : 'transparent',
              transition: 'background 0.8s ease',
            }}>
            {deckAPlaying && (
              <div className="absolute top-0 left-0 w-48 h-48 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse, rgba(0,255,204,0.08) 0%, transparent 70%)' }} />
            )}
            <div className="relative">
              <Deck deckId="A" />
            </div>
          </div>

          {/* CROWD METER column */}
          <div className="hidden lg:flex items-stretch justify-center relative"
            style={{
              background: 'rgba(0,0,0,0.25)',
              borderLeft: '1px solid rgba(255,255,255,0.04)',
              borderRight: '1px solid rgba(255,255,255,0.04)',
            }}>
            <CrowdMeter onFloorDestroyed={() => setFloorDestroyedTick((t) => t + 1)} />
          </div>

          {/* Deck B panel */}
          <div className="relative p-5 lg:p-6"
            style={{
              background: deckBPlaying ? 'linear-gradient(225deg, rgba(255,0,60,0.04) 0%, transparent 60%)' : 'transparent',
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
        <div className="px-6 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.5) 100%)' }}>
          <Crossfader />
        </div>

        {/* Mobile CrowdMeter (horizontal slice above FFT on small screens) */}
        <div className="lg:hidden px-6 py-2" style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
          <CrowdMeter onFloorDestroyed={() => setFloorDestroyedTick((t) => t + 1)} />
        </div>

        {/* FFT SPECTRUM */}
        <div className="px-6 pt-2 pb-3"
          style={{ background: 'rgba(0,0,0,0.4)' }}>
          <FFTSpectrum />
        </div>

        {/* Bottom chrome */}
        <div className="flex justify-between items-center px-6 py-2"
          style={{ borderTop: '1px solid rgba(255,255,255,0.03)', background: 'rgba(0,0,0,0.4)' }}>
          <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">WEB AUDIO // DUAL DECK // REAL-TIME FX</span>
          <div className="flex gap-5">
            <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">RIJEKA</span>
            <span className="font-vhs text-[7px] text-white/[0.08] tracking-widest">CROATIA</span>
          </div>
        </div>
      </div>
    </div>
  )
}

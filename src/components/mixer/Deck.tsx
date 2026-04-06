import { useState } from 'react'
import { useAudioStore } from '../../stores/audioStore'
import { scManager, type DeckId } from '../../lib/audio/soundcloudManager'
import { essentialTracks } from '../../data/tracks'
import WaveformDisplay from './WaveformDisplay'
import TrackLoader from './TrackLoader'
import VUMeter from './VUMeter'
import VinylRecord from './VinylRecord'

const SC_PROFILE = 'https://soundcloud.com/dj-ogi'

interface DeckProps { deckId: DeckId }

export default function Deck({ deckId }: DeckProps) {
  const deck = useAudioStore((s) => deckId === 'A' ? s.deckA : s.deckB)
  const updateDeck = useAudioStore((s) => deckId === 'A' ? s.updateDeckA : s.updateDeckB)
  const [isLooping, setIsLooping] = useState(false)

  const isA = deckId === 'A'
  const color = isA ? '#00ffcc' : '#ff003c'
  const colorClass = isA ? 'text-primary' : 'text-accent'

  const handlePlay = () => scManager.toggle(deckId)
  const handleCue = () => { scManager.seekTo(deckId, 0); updateDeck({ position: 0, positionMs: 0 }) }

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    scManager.seekTo(deckId, ratio * deck.duration)
    updateDeck({ position: ratio, positionMs: ratio * deck.duration })
  }

  const handleLoadTrack = (trackId: number) => {
    const track = essentialTracks.find((t) => t.id === trackId)
    if (!track) return
    scManager.loadTrack(deckId, track.soundcloudUrl)
    updateDeck({ bpm: track.bpm, trackUrl: track.soundcloudUrl, trackTitle: track.title, trackArtist: track.artist, isPlaying: false, position: 0, positionMs: 0 })
  }

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000)
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  }

  // SoundCloud API blocked — show fallback
  if (deck.hasError && !deck.isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center py-6 gap-5 text-center px-4">
        {/* NO SIGNAL style header */}
        <div className="relative w-full py-4 rounded-lg overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.01), rgba(0,0,0,0.3))' }}>
          <div className="font-vhs text-3xl text-white/[0.06] tracking-[0.3em]">NO SIGNAL</div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
        </div>

        {/* Steps */}
        <div className="space-y-2 text-left w-full">
          <div className="font-vhs text-[8px] text-white/15 tracking-[0.4em] text-center mb-3">// HOW TO FIX</div>
          {[
            'Click the shield icon in your browser address bar',
            'Select "Turn off protection for this site"',
            'Page reloads — mixer activates',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className={`font-vhs text-[9px] flex-shrink-0 ${isA ? 'text-primary/40' : 'text-accent/40'}`}>
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-vhs text-[9px] text-white/25 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>

        {/* Retry */}
        <button
          onClick={() => scManager.retryInit(deckId)}
          className="font-vhs text-[9px] text-white/30 tracking-widest hover:text-white/60 transition-colors underline underline-offset-4"
        >
          RETRY
        </button>

        {/* Or use Chrome */}
        <div className="font-vhs text-[8px] text-white/10 tracking-widest">— OR OPEN IN CHROME —</div>

        {/* SC link */}
        <a href={SC_PROFILE} target="_blank" rel="noopener noreferrer"
          className={`font-vhs text-[9px] px-5 py-2 rounded tracking-widest border transition-all ${
            isA
              ? 'text-primary/60 border-primary/20 hover:bg-primary/10 hover:text-primary'
              : 'text-accent/60 border-accent/20 hover:bg-accent/10 hover:text-accent'
          }`}>
          LISTEN ON SOUNDCLOUD →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Track loader */}
      <TrackLoader deckId={deckId} onSelect={handleLoadTrack} />

      {/* Main deck area: Vinyl + Info + VU */}
      <div className="flex items-start gap-4">
        {/* Vinyl */}
        <VinylRecord isPlaying={deck.isPlaying} color={color} position={deck.position} />

        {/* Track info */}
        <div className="flex-1 min-w-0 pt-1">
          <div className="flex items-center gap-2">
            <div className={`font-vhs text-base ${colorClass} truncate leading-tight flex-1`}>
              {deck.trackTitle || 'NO TRACK'}
            </div>
            {deck.isLoading && (
              <span className="font-vhs text-[8px] text-white/30 tracking-widest flex-shrink-0 animate-pulse">
                LOADING
              </span>
            )}
            {deck.hasError && (
              <span className="font-vhs text-[8px] text-accent/60 tracking-widest flex-shrink-0">
                SC ERROR
              </span>
            )}
          </div>
          <div className="font-vhs text-[9px] text-white/15 truncate mt-0.5">
            {deck.trackArtist}
          </div>

          {/* BPM + Key row */}
          <div className="flex items-baseline gap-3 mt-2">
            <div>
              <span className={`font-vhs text-2xl font-bold ${colorClass} leading-none`}>{deck.bpm}</span>
              <span className="font-vhs text-[8px] text-white/15 ml-1">BPM</span>
            </div>
            <div className="font-vhs text-[9px] text-white/10">
              {formatTime(deck.positionMs)} / {formatTime(deck.duration)}
            </div>
          </div>
        </div>

        {/* VU Meter */}
        <VUMeter isPlaying={deck.isPlaying} volume={deck.volume} color={color} />
      </div>

      {/* Waveform - clickable seek */}
      <div className="cursor-pointer rounded-md overflow-hidden" onClick={handleSeek}>
        <WaveformDisplay deckId={deckId} position={deck.position} />
      </div>

      {/* Transport + Volume row */}
      <div className="flex items-center gap-2">
        {/* CUE */}
        <button onClick={handleCue}
          className="font-vhs text-[8px] px-2 py-1.5 rounded-md tracking-widest transition-all
            bg-white/[0.03] border border-white/[0.06] text-white/25
            hover:text-white/50 hover:bg-white/[0.05] hover:border-white/10
            active:bg-white/[0.08]">
          CUE
        </button>

        {/* PLAY - big prominent button */}
        <button onClick={handlePlay}
          className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
            deck.isPlaying
              ? `${isA ? 'bg-primary/10 border-primary/40 text-primary' : 'bg-accent/10 border-accent/40 text-accent'} border-2`
              : deck.isLoading
              ? 'bg-white/[0.02] border border-white/[0.05] text-white/15 cursor-wait'
              : 'bg-white/[0.03] border border-white/[0.08] text-white/25 hover:text-white/50 hover:bg-white/[0.06]'
          }`}
          style={deck.isPlaying ? { boxShadow: `0 0 25px ${color}20` } : {}}>
          {deck.isLoading ? (
            <svg className="w-4 h-4 animate-spin opacity-40" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          ) : deck.isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        {/* LOOP */}
        <button onClick={() => setIsLooping(!isLooping)}
          className={`font-vhs text-[8px] px-2 py-1.5 rounded-md tracking-widest transition-all ${
            isLooping
              ? `${isA ? 'bg-primary/10 border-primary/30 text-primary' : 'bg-accent/10 border-accent/30 text-accent'} border`
              : 'bg-white/[0.03] border border-white/[0.06] text-white/25 hover:text-white/50 hover:bg-white/[0.05]'
          }`}>
          LOOP
        </button>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Volume */}
        <svg className="w-3 h-3 text-white/10 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
        </svg>
        <input type="range" min={0} max={100} value={deck.volume}
          onChange={(e) => updateDeck({ volume: Number(e.target.value) })}
          className="w-24 h-1 rounded-full appearance-none cursor-pointer bg-white/[0.04]
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-2.5 [&::-webkit-slider-thumb]:h-2.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white/40
            [&::-webkit-slider-thumb]:hover:bg-white/70 [&::-webkit-slider-thumb]:transition-all" />
        <span className="font-vhs text-[7px] text-white/10 w-5 text-right">{deck.volume}</span>
      </div>
    </div>
  )
}

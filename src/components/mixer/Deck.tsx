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
  const colorRgb = isA ? '0,255,204' : '255,0,60'

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
      <div className="flex flex-col items-center justify-center py-8 gap-5 text-center px-4">
        <div className="relative w-full py-6 rounded-xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.02), rgba(0,0,0,0.4))', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="font-vhs text-3xl text-white/[0.07] tracking-[0.3em]">NO SIGNAL</div>
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)' }} />
        </div>
        <div className="space-y-2 text-left w-full">
          <div className="font-vhs text-[8px] text-white/15 tracking-[0.4em] text-center mb-3">// HOW TO FIX</div>
          {['Click the shield icon in your browser address bar', 'Select "Turn off protection for this site"', 'Page reloads — mixer activates'].map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="font-vhs text-[9px] flex-shrink-0" style={{ color: `rgba(${colorRgb},0.5)` }}>{String(i + 1).padStart(2, '0')}</span>
              <span className="font-vhs text-[9px] text-white/25 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
        <button onClick={() => scManager.retryInit(deckId)}
          className="font-vhs text-[9px] text-white/30 tracking-widest hover:text-white/60 transition-colors underline underline-offset-4">
          RETRY
        </button>
        <div className="font-vhs text-[8px] text-white/10 tracking-widest">— OR OPEN IN CHROME —</div>
        <a href={SC_PROFILE} target="_blank" rel="noopener noreferrer"
          className="font-vhs text-[9px] px-5 py-2 rounded-lg tracking-widest border transition-all"
          style={{ color: `rgba(${colorRgb},0.6)`, borderColor: `rgba(${colorRgb},0.2)` }}>
          LISTEN ON SOUNDCLOUD →
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Track loader */}
      <TrackLoader deckId={deckId} onSelect={handleLoadTrack} />

      {/* ── MAIN AREA: Vinyl + Info ── */}
      <div className="flex items-start gap-4">
        {/* Vinyl */}
        <VinylRecord isPlaying={deck.isPlaying} color={color} position={deck.position} />

        {/* Info column */}
        <div className="flex-1 min-w-0 space-y-2 pt-1">
          {/* Track name */}
          <div>
            <div className="font-vhs text-[10px] tracking-[0.3em] mb-1"
              style={{ color: `rgba(${colorRgb},0.5)` }}>
              {deck.isLoading ? '// LOADING...' : deck.hasError ? '// SC ERROR' : '// NOW LOADING'}
            </div>
            <div className="font-vhs text-base text-white leading-tight truncate">
              {deck.trackTitle || 'NO TRACK LOADED'}
            </div>
            <div className="font-vhs text-[9px] text-white/25 truncate mt-0.5">
              {deck.trackArtist}
            </div>
          </div>

          {/* BPM display — big and vivid */}
          <div className="rounded-xl px-3 py-2.5 flex items-baseline gap-2"
            style={{
              background: `linear-gradient(135deg, rgba(${colorRgb},0.08) 0%, rgba(0,0,0,0.3) 100%)`,
              border: `1px solid rgba(${colorRgb},0.12)`,
            }}>
            <span className="font-vhs text-4xl leading-none font-bold tabular-nums"
              style={{
                color,
                textShadow: deck.isPlaying ? `0 0 20px rgba(${colorRgb},0.8), 0 0 40px rgba(${colorRgb},0.4)` : 'none',
                transition: 'text-shadow 0.5s ease',
              }}>
              {deck.bpm}
            </span>
            <span className="font-vhs text-[10px] text-white/20 tracking-widest">BPM</span>
          </div>

          {/* Time display */}
          <div className="flex items-center gap-2">
            <span className="font-vhs text-xs text-white/50 tabular-nums">{formatTime(deck.positionMs)}</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="font-vhs text-[10px] text-white/20 tabular-nums">{formatTime(deck.duration)}</span>
          </div>
        </div>

        {/* VU Meter */}
        <VUMeter isPlaying={deck.isPlaying} volume={deck.volume} color={color} />
      </div>

      {/* ── WAVEFORM ── */}
      <div className="cursor-pointer rounded-xl overflow-hidden relative group"
        onClick={handleSeek}
        style={{ border: `1px solid rgba(${colorRgb},0.08)` }}>
        <WaveformDisplay deckId={deckId} position={deck.position} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl"
          style={{ border: `1px solid rgba(${colorRgb},0.25)` }} />
      </div>

      {/* ── TRANSPORT CONTROLS ── */}
      <div className="flex items-center gap-3">

        {/* CUE button */}
        <button onClick={handleCue}
          className="font-vhs text-[9px] px-3 py-2.5 rounded-lg tracking-widest transition-all duration-200 flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.3)',
          }}
          onMouseEnter={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.15)' }}
          onMouseLeave={e => { (e.target as HTMLElement).style.color = 'rgba(255,255,255,0.3)'; (e.target as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)' }}
        >
          CUE
        </button>

        {/* PLAY button — the star */}
        <button onClick={handlePlay}
          className="relative w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: deck.isPlaying
              ? `radial-gradient(circle, rgba(${colorRgb},0.25) 0%, rgba(${colorRgb},0.08) 70%)`
              : 'rgba(255,255,255,0.04)',
            border: deck.isPlaying
              ? `2px solid rgba(${colorRgb},0.7)`
              : '2px solid rgba(255,255,255,0.1)',
            boxShadow: deck.isPlaying
              ? `0 0 30px rgba(${colorRgb},0.5), 0 0 60px rgba(${colorRgb},0.2), inset 0 0 20px rgba(${colorRgb},0.1)`
              : '0 4px 20px rgba(0,0,0,0.5)',
            color: deck.isPlaying ? color : 'rgba(255,255,255,0.4)',
          }}>
          {/* Pulsing ring when playing */}
          {deck.isPlaying && (
            <div className="absolute inset-0 rounded-full animate-ping"
              style={{ border: `1px solid rgba(${colorRgb},0.3)`, animationDuration: '2s' }} />
          )}
          {deck.isLoading ? (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
          ) : deck.isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="4" width="4" height="16" rx="1.5" />
              <rect x="15" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg className="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        {/* LOOP button */}
        <button onClick={() => setIsLooping(!isLooping)}
          className="font-vhs text-[9px] px-3 py-2.5 rounded-lg tracking-widest transition-all duration-200 flex-shrink-0"
          style={{
            background: isLooping ? `rgba(${colorRgb},0.1)` : 'rgba(255,255,255,0.03)',
            border: isLooping ? `1px solid rgba(${colorRgb},0.4)` : '1px solid rgba(255,255,255,0.07)',
            color: isLooping ? color : 'rgba(255,255,255,0.3)',
            boxShadow: isLooping ? `0 0 12px rgba(${colorRgb},0.2)` : 'none',
          }}>
          ⟳ LOOP
        </button>

        <div className="flex-1" />

        {/* Volume section */}
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"
            style={{ color: `rgba(${colorRgb},0.4)` }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input type="range" min={0} max={100} value={deck.volume}
            onChange={(e) => updateDeck({ volume: Number(e.target.value) })}
            className="w-20 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(${colorRgb},0.7) ${deck.volume}%, rgba(255,255,255,0.08) ${deck.volume}%)`,
            }} />
          <span className="font-vhs text-[8px] w-6 text-right"
            style={{ color: `rgba(${colorRgb},0.6)` }}>{deck.volume}</span>
        </div>
      </div>
    </div>
  )
}

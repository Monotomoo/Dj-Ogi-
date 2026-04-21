import { useCallback, useEffect } from 'react'
import { useAudioStore } from '../../stores/audioStore'
import { audioManager, type DeckId } from '../../lib/audio/audioManager'
import { essentialTracks } from '../../data/tracks'
import WaveformDisplay from './WaveformDisplay'
import TrackLoader from './TrackLoader'
import VUMeter from './VUMeter'
import VinylRecord from './VinylRecord'
import Knob from './Knob'
import FXPads from './FXPads'

interface DeckProps { deckId: DeckId }

const LOOP_SIZES = [0.5, 1, 2, 4] as const

export default function Deck({ deckId }: DeckProps) {
  const deck = useAudioStore((s) => deckId === 'A' ? s.deckA : s.deckB)
  const otherDeck = useAudioStore((s) => deckId === 'A' ? s.deckB : s.deckA)
  const updateDeck = useAudioStore((s) => deckId === 'A' ? s.updateDeckA : s.updateDeckB)

  const isA = deckId === 'A'
  const color = isA ? '#00ffcc' : '#ff003c'
  const colorRgb = isA ? '0,255,204' : '255,0,60'

  // Push knob changes into the audio manager whenever store values change
  useEffect(() => { audioManager.setEQ(deckId, 'low', deck.eqLow) }, [deckId, deck.eqLow])
  useEffect(() => { audioManager.setEQ(deckId, 'mid', deck.eqMid) }, [deckId, deck.eqMid])
  useEffect(() => { audioManager.setEQ(deckId, 'hi', deck.eqHi) }, [deckId, deck.eqHi])
  useEffect(() => { audioManager.setFilter(deckId, deck.filter) }, [deckId, deck.filter])
  useEffect(() => { audioManager.setPitch(deckId, deck.pitch) }, [deckId, deck.pitch])

  // ─── Handlers ───
  const handlePlay = useCallback(() => audioManager.toggle(deckId), [deckId])

  const handleCue = useCallback(() => {
    audioManager.seekTo(deckId, 0)
    updateDeck({ position: 0, positionMs: 0 })
  }, [deckId, updateDeck])

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    audioManager.seekTo(deckId, ratio * deck.duration)
    updateDeck({ position: ratio, positionMs: ratio * deck.duration })
  }

  const handleLoadTrack = (trackId: number) => {
    const track = essentialTracks.find((t) => t.id === trackId)
    if (!track) return
    const url = track.audioUrl || track.soundcloudUrl
    audioManager.loadTrack(deckId, url, { title: track.title, artist: track.artist })
    // Reset deck state for new track
    updateDeck({
      bpm: track.bpm, trackUrl: url, trackTitle: track.title, trackArtist: track.artist,
      isPlaying: false, position: 0, positionMs: 0,
      hotCues: [null, null, null, null], loopActive: false, loopBars: null,
    })
  }

  const handleSync = () => {
    if (!deck.bpm || !otherDeck.bpm) return
    const ok = audioManager.syncTo(deckId, deck.bpm, otherDeck.bpm)
    if (ok) {
      // Pitch stored visually as the deviation from 1.0 (±8% = ±1 on the knob)
      const ratio = otherDeck.bpm / deck.bpm
      const pitchVisual = (ratio - 1) / 0.08
      updateDeck({ pitch: Math.max(-1, Math.min(1, pitchVisual)) })
    }
  }

  const handleHotCue = (slot: number) => {
    const cues = [...deck.hotCues]
    if (cues[slot] == null) {
      // Unset slot → mark current position
      cues[slot] = deck.positionMs
      updateDeck({ hotCues: cues })
    } else {
      // Set slot → jump to it
      audioManager.jumpToHotCue(deckId, cues[slot]!)
    }
  }

  const handleClearHotCue = (slot: number) => {
    const cues = [...deck.hotCues]
    cues[slot] = null
    updateDeck({ hotCues: cues })
  }

  const handleLoopToggle = (bars: number) => {
    if (deck.loopActive && deck.loopBars === bars) {
      // Same loop active → cancel
      audioManager.stopBeatLoop(deckId)
      updateDeck({ loopActive: false, loopBars: null })
    } else {
      audioManager.startBeatLoop(deckId, bars, deck.bpm)
      updateDeck({ loopActive: true, loopBars: bars })
    }
  }

  const handleTapeStop = () => {
    audioManager.tapeStop(deckId, 1000)
  }

  const handlePitchChange = (v: number) => updateDeck({ pitch: v })

  const formatTime = (ms: number) => {
    const secs = Math.floor(ms / 1000)
    return `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, '0')}`
  }

  return (
    <div className="space-y-3">

      {/* Track loader */}
      <TrackLoader deckId={deckId} onSelect={handleLoadTrack} />

      {/* ── MAIN AREA: Vinyl + Info + VU ── */}
      <div className="flex items-start gap-4">
        <VinylRecord isPlaying={deck.isPlaying} color={color} deckId={deckId} />

        <div className="flex-1 min-w-0 space-y-2 pt-1">
          <div>
            <div className="font-vhs text-[10px] tracking-[0.3em] mb-1"
              style={{ color: `rgba(${colorRgb},0.5)` }}>
              {deck.isLoading ? '// LOADING...' : deck.hasError ? '// LOAD ERROR' : deck.isPlaying ? '// PLAYING' : '// LOADED'}
            </div>
            <div className="font-vhs text-base text-white leading-tight truncate">
              {deck.trackTitle || 'NO TRACK LOADED'}
            </div>
            <div className="font-vhs text-[9px] text-white/25 truncate mt-0.5">{deck.trackArtist}</div>
          </div>

          {/* BPM + time */}
          <div className="flex items-center gap-3">
            <div className="rounded-lg px-2.5 py-1.5 flex items-baseline gap-1.5"
              style={{
                background: `linear-gradient(135deg, rgba(${colorRgb},0.08) 0%, rgba(0,0,0,0.3) 100%)`,
                border: `1px solid rgba(${colorRgb},0.12)`,
              }}>
              <span className="font-vhs text-2xl leading-none font-bold tabular-nums"
                style={{
                  color,
                  textShadow: deck.isPlaying ? `0 0 16px rgba(${colorRgb},0.8)` : 'none',
                  transition: 'text-shadow 0.5s ease',
                }}>
                {deck.bpm}
              </span>
              <span className="font-vhs text-[9px] text-white/20 tracking-widest">BPM</span>
            </div>

            <div className="flex-1 flex items-center gap-2 min-w-0">
              <span className="font-vhs text-[10px] text-white/50 tabular-nums shrink-0">{formatTime(deck.positionMs)}</span>
              <div className="flex-1 h-px bg-white/[0.06]" />
              <span className="font-vhs text-[9px] text-white/20 tabular-nums shrink-0">{formatTime(deck.duration)}</span>
            </div>
          </div>
        </div>

        <VUMeter isPlaying={deck.isPlaying} volume={deck.volume} color={color} />
      </div>

      {/* ── KNOBS ROW: EQ + Filter + Pitch ── */}
      <div className="flex items-start justify-between gap-3 rounded-xl px-3 py-3"
        style={{
          background: 'rgba(0,0,0,0.3)',
          border: '1px solid rgba(255,255,255,0.04)',
        }}>
        {/* EQ 3-band */}
        <div className="flex items-start gap-3">
          <Knob label="HI" value={deck.eqHi} onChange={(v) => updateDeck({ eqHi: v })} color={color} size={42} />
          <Knob label="MID" value={deck.eqMid} onChange={(v) => updateDeck({ eqMid: v })} color={color} size={42} />
          <Knob label="LOW" value={deck.eqLow} onChange={(v) => updateDeck({ eqLow: v })} color={color} size={42} />
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-white/[0.06]" />

        {/* FILTER — bigger knob, the showpiece */}
        <div className="flex items-center">
          <Knob label="FILTER" value={deck.filter} onChange={(v) => updateDeck({ filter: v })} color={color} size={50} />
        </div>

        {/* Divider */}
        <div className="w-px self-stretch bg-white/[0.06]" />

        {/* PITCH slider */}
        <div className="flex flex-col items-center gap-1">
          <div className="font-vhs text-[8px] text-white/35 tracking-[0.3em]">PITCH</div>
          <div className="relative h-10 w-6 flex items-center justify-center">
            <input
              type="range"
              min={-1}
              max={1}
              step={0.01}
              value={deck.pitch}
              onChange={(e) => handlePitchChange(parseFloat(e.target.value))}
              onDoubleClick={() => handlePitchChange(0)}
              className="pitch-slider"
              style={{
                transform: 'rotate(-90deg)',
                width: 40,
              }}
            />
          </div>
          <div className="font-vhs text-[8px] tabular-nums"
            style={{ color: Math.abs(deck.pitch) > 0.03 ? color : 'rgba(255,255,255,0.2)' }}>
            {deck.pitch > 0 ? '+' : ''}{(deck.pitch * 8).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* ── WAVEFORM ── */}
      <div className="cursor-pointer rounded-xl overflow-hidden relative group"
        onClick={handleSeek}
        style={{ border: `1px solid rgba(${colorRgb},0.08)` }}>
        <WaveformDisplay deckId={deckId} position={deck.position} />
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none rounded-xl"
          style={{ border: `1px solid rgba(${colorRgb},0.25)` }} />
      </div>

      {/* ── FX PADS ── */}
      <FXPads deckId={deckId} />

      {/* ── HOT CUES + LOOPS ── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Hot cues */}
        <div className="rounded-lg p-2"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="font-vhs text-[7px] text-white/30 tracking-[0.3em] mb-1.5 px-0.5">HOT CUE</div>
          <div className="grid grid-cols-4 gap-1">
            {deck.hotCues.map((cue, i) => {
              const isSet = cue !== null
              return (
                <button
                  key={i}
                  onClick={() => handleHotCue(i)}
                  onContextMenu={(e) => { e.preventDefault(); handleClearHotCue(i) }}
                  className="font-vhs text-[9px] py-1.5 rounded transition-all duration-200 tabular-nums relative"
                  style={{
                    background: isSet ? `rgba(${colorRgb},0.18)` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isSet ? color + '70' : 'rgba(255,255,255,0.07)'}`,
                    color: isSet ? color : 'rgba(255,255,255,0.35)',
                    boxShadow: isSet ? `0 0 8px rgba(${colorRgb},0.3)` : 'none',
                  }}
                  title={isSet ? 'Click = jump. Right-click = clear.' : 'Click = set cue'}
                >
                  {i + 1}
                </button>
              )
            })}
          </div>
        </div>

        {/* Loop sizes */}
        <div className="rounded-lg p-2"
          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
          <div className="font-vhs text-[7px] text-white/30 tracking-[0.3em] mb-1.5 px-0.5">LOOP</div>
          <div className="grid grid-cols-4 gap-1">
            {LOOP_SIZES.map((bars) => {
              const isActive = deck.loopActive && deck.loopBars === bars
              const label = bars < 1 ? '1/2' : `${bars}`
              return (
                <button
                  key={bars}
                  onClick={() => handleLoopToggle(bars)}
                  className="font-vhs text-[9px] py-1.5 rounded transition-all duration-200"
                  style={{
                    background: isActive ? `rgba(${colorRgb},0.18)` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? color + '70' : 'rgba(255,255,255,0.07)'}`,
                    color: isActive ? color : 'rgba(255,255,255,0.35)',
                    boxShadow: isActive ? `0 0 8px rgba(${colorRgb},0.3)` : 'none',
                  }}
                >
                  {label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── TRANSPORT CONTROLS ── */}
      <div className="flex items-center gap-2">
        {/* CUE */}
        <button onClick={handleCue}
          className="font-vhs text-[9px] px-2.5 py-2 rounded-lg tracking-widest transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.3)',
          }}>
          CUE
        </button>

        {/* PLAY */}
        <button onClick={handlePlay}
          className="relative w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300"
          style={{
            background: deck.isPlaying
              ? `radial-gradient(circle, rgba(${colorRgb},0.25) 0%, rgba(${colorRgb},0.08) 70%)`
              : 'rgba(255,255,255,0.04)',
            border: deck.isPlaying
              ? `2px solid rgba(${colorRgb},0.7)`
              : '2px solid rgba(255,255,255,0.1)',
            boxShadow: deck.isPlaying
              ? `0 0 24px rgba(${colorRgb},0.5), 0 0 50px rgba(${colorRgb},0.2)`
              : '0 4px 20px rgba(0,0,0,0.5)',
            color: deck.isPlaying ? color : 'rgba(255,255,255,0.4)',
          }}>
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
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <rect x="5" y="4" width="4" height="16" rx="1.5" />
              <rect x="15" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        {/* TAPE STOP */}
        <button onClick={handleTapeStop}
          className="font-vhs text-[9px] px-2.5 py-2 rounded-lg tracking-widest transition-all flex-shrink-0"
          style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.35)',
          }}
          title="Slow the record to a stop">
          TAPE STOP
        </button>

        {/* SYNC */}
        <button onClick={handleSync}
          disabled={!deck.bpm || !otherDeck.bpm}
          className="font-vhs text-[9px] px-2.5 py-2 rounded-lg tracking-widest transition-all flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            background: `rgba(${colorRgb},0.08)`,
            border: `1px solid rgba(${colorRgb},0.25)`,
            color: `rgba(${colorRgb},0.8)`,
          }}
          title="Match BPM to the other deck">
          SYNC
        </button>

        <div className="flex-1" />

        {/* Volume */}
        <div className="flex items-center gap-2">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"
            style={{ color: `rgba(${colorRgb},0.4)` }}>
            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"/>
          </svg>
          <input type="range" min={0} max={100} value={deck.volume}
            onChange={(e) => updateDeck({ volume: Number(e.target.value) })}
            className="w-16 h-1.5 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, rgba(${colorRgb},0.7) ${deck.volume}%, rgba(255,255,255,0.08) ${deck.volume}%)`,
            }} />
          <span className="font-vhs text-[8px] w-5 text-right tabular-nums"
            style={{ color: `rgba(${colorRgb},0.6)` }}>{deck.volume}</span>
        </div>
      </div>
    </div>
  )
}

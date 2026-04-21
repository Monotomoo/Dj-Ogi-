/**
 * Web Audio API Audio Manager
 *
 * Graph per deck:
 *   <audio>
 *     → MediaElementSource
 *     → EQ Low  (BiquadFilter lowshelf @100Hz)
 *     → EQ Mid  (BiquadFilter peaking  @1kHz, Q=1)
 *     → EQ Hi   (BiquadFilter highshelf @10kHz)
 *     → Filter  (BiquadFilter LP/HP, swept 20Hz..20kHz)
 *     → Gate    (GainNode — insert, modulated rhythmically when gate FX on)
 *     → FXSendPoint (GainNode, always 1)
 *         ├→ DryGain (1) ────────────────────────┐
 *         ├→ EchoSend (0) → Delay + Feedback ────┤
 *         ├→ FlangerSend (0) → Flanger LFO+Delay ┤
 *         └→ BitcrushSend (0) → WaveShaper ──────┤
 *                                                 └→ VolumeGain
 *                                                    → CrossfadeGain
 *                                                    → AudioContext.destination
 *
 * Pitch via audio.playbackRate (±8%) — bypasses graph.
 */

import { useAudioStore } from '../../stores/audioStore'

export type DeckId = 'A' | 'B'
export type FXName = 'echo' | 'flanger' | 'bitcrush' | 'gate'

interface DeckController {
  audio: HTMLAudioElement | null
  source: MediaElementAudioSourceNode | null
  // Input trim (pre-EQ)
  gainTrim: GainNode | null
  // EQ chain
  eqLow: BiquadFilterNode | null
  eqMid: BiquadFilterNode | null
  eqHi: BiquadFilterNode | null
  // Filter sweep
  filter: BiquadFilterNode | null
  // Insert: Gate (rhythmic gain)
  gateInsert: GainNode | null
  // FX bus
  fxSendPoint: GainNode | null       // tap point after gate
  dryGain: GainNode | null           // always 1
  // Echo
  echoSend: GainNode | null
  echoDelay: DelayNode | null
  echoFeedback: GainNode | null
  // Flanger
  flangerSend: GainNode | null
  flangerDelay: DelayNode | null
  flangerLFO: OscillatorNode | null
  flangerLFOGain: GainNode | null
  // Bitcrusher
  bitcrushSend: GainNode | null
  bitcrushShaper: WaveShaperNode | null
  // Reverb
  reverbSend: GainNode | null
  reverbConvolver: ConvolverNode | null
  // Output
  volumeGain: GainNode | null
  crossfadeGain: GainNode | null
  // State
  isPlaying: boolean
  isReady: boolean
  progressRaf: number
  // Transport
  loopInterval: number
  loopStartMs: number | null
  loopEndMs: number | null
  tapeStopRaf: number
  savedPlaybackRate: number
  // FX state tracked here so schedulers can see it
  fxActive: Record<FXName, boolean>
  gateSchedTimeout: number
  // Scratch
  isScratching: boolean
  scratchReleaseRaf: number
  preScratchRate: number
  // Reverse scrub
  reverseRaf: number
}

type ProgressCallback = (data: { position: number; relativePosition: number }) => void
type StateCallback = (state: 'play' | 'pause' | 'finish' | 'ready' | 'loading' | 'error') => void
type TrackCallback = (track: { title: string; artist: string; duration: number }) => void

const makeDeck = (): DeckController => ({
  audio: null, source: null, gainTrim: null,
  eqLow: null, eqMid: null, eqHi: null, filter: null,
  gateInsert: null, fxSendPoint: null, dryGain: null,
  echoSend: null, echoDelay: null, echoFeedback: null,
  flangerSend: null, flangerDelay: null, flangerLFO: null, flangerLFOGain: null,
  bitcrushSend: null, bitcrushShaper: null,
  reverbSend: null, reverbConvolver: null,
  volumeGain: null, crossfadeGain: null,
  isPlaying: false, isReady: false, progressRaf: 0,
  loopInterval: 0, loopStartMs: null, loopEndMs: null,
  tapeStopRaf: 0, savedPlaybackRate: 1,
  fxActive: { echo: false, flanger: false, bitcrush: false, gate: false },
  gateSchedTimeout: 0,
  isScratching: false, scratchReleaseRaf: 0, preScratchRate: 1,
  reverseRaf: 0,
})

// FX target levels when active
const ECHO_WET = 0.45
const FLANGER_WET = 0.55
const BITCRUSH_WET = 0.75

class AudioManager {
  private ctx: AudioContext | null = null
  private decks: Record<DeckId, DeckController> = { A: makeDeck(), B: makeDeck() }

  private progressCallbacks: Record<DeckId, ProgressCallback | null> = { A: null, B: null }
  private stateCallbacks: Record<DeckId, StateCallback | null> = { A: null, B: null }
  private trackCallbacks: Record<DeckId, TrackCallback | null> = { A: null, B: null }

  // Master bus — both decks feed into this before destination.
  // Also feeds the analyser + record destination.
  private masterBus: GainNode | null = null
  private masterAnalyser: AnalyserNode | null = null
  private recordDestination: MediaStreamAudioDestinationNode | null = null
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private recordingStartTime = 0
  private recordingCallbacks: {
    onStart?: () => void
    onStop?: (blob: Blob, durationSec: number) => void
    onTick?: (durationSec: number) => void
  } = {}
  private recordingTickTimer: number = 0
  private recordingMode: 'audio' | 'video' = 'audio'
  private videoCanvas: HTMLCanvasElement | null = null
  private videoRaf: number = 0

  private getContext(): AudioContext {
    if (!this.ctx) {
      const Ctor: typeof AudioContext = window.AudioContext
        || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      this.ctx = new Ctor()

      // Master bus — all decks connect here, then branches to destination + analyser + recorder tap
      this.masterBus = this.ctx.createGain()
      this.masterBus.gain.value = 1

      this.masterAnalyser = this.ctx.createAnalyser()
      this.masterAnalyser.fftSize = 128 // 64 frequency bins
      this.masterAnalyser.smoothingTimeConstant = 0.75

      this.masterBus.connect(this.masterAnalyser)
      this.masterBus.connect(this.ctx.destination)
    }
    if (this.ctx.state === 'suspended') this.ctx.resume().catch(() => { /* ignore */ })
    return this.ctx
  }

  /** Returns live frequency data for the master output. Length = fftSize/2. */
  getFrequencyData(out: Uint8Array): boolean {
    if (!this.masterAnalyser) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.masterAnalyser.getByteFrequencyData(out as any)
    return true
  }

  /** Returns live waveform (time-domain) data for kick-drum detection etc. */
  getTimeDomainData(out: Uint8Array): boolean {
    if (!this.masterAnalyser) return false
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.masterAnalyser.getByteTimeDomainData(out as any)
    return true
  }

  initDeck(deckId: DeckId, audio: HTMLAudioElement) {
    const ctx = this.getContext()
    const deck = this.decks[deckId]

    if (deck.audio && deck.audio !== audio) this.teardownDeck(deckId)
    if (deck.source) return

    deck.audio = audio

    try {
      deck.source = ctx.createMediaElementSource(audio)
    } catch (err) {
      console.warn(`[Audio ${deckId}] createMediaElementSource failed:`, err)
      this.stateCallbacks[deckId]?.('error')
      return
    }

    // ─── Input trim (GAIN knob) ───
    deck.gainTrim = ctx.createGain()
    deck.gainTrim.gain.value = 1

    // Sync key-lock default (off) with the audio element so store matches reality
    this.setKeyLock(deckId, false)

    // ─── EQ ───
    deck.eqLow = ctx.createBiquadFilter()
    deck.eqLow.type = 'lowshelf'; deck.eqLow.frequency.value = 100; deck.eqLow.gain.value = 0

    deck.eqMid = ctx.createBiquadFilter()
    deck.eqMid.type = 'peaking'; deck.eqMid.frequency.value = 1000; deck.eqMid.Q.value = 1; deck.eqMid.gain.value = 0

    deck.eqHi = ctx.createBiquadFilter()
    deck.eqHi.type = 'highshelf'; deck.eqHi.frequency.value = 10000; deck.eqHi.gain.value = 0

    // ─── Filter sweep ───
    deck.filter = ctx.createBiquadFilter()
    deck.filter.type = 'lowpass'; deck.filter.frequency.value = 22050; deck.filter.Q.value = 0.5

    // ─── Gate insert (default: transparent) ───
    deck.gateInsert = ctx.createGain()
    deck.gateInsert.gain.value = 1

    // ─── FX send point + dry path ───
    deck.fxSendPoint = ctx.createGain()
    deck.fxSendPoint.gain.value = 1

    deck.dryGain = ctx.createGain()
    deck.dryGain.gain.value = 1

    // ─── Echo chain ───
    deck.echoSend = ctx.createGain()
    deck.echoSend.gain.value = 0
    deck.echoDelay = ctx.createDelay(1.0)
    deck.echoDelay.delayTime.value = 0.225 // will be updated from BPM
    deck.echoFeedback = ctx.createGain()
    deck.echoFeedback.gain.value = 0.45

    // ─── Flanger chain ───
    deck.flangerSend = ctx.createGain()
    deck.flangerSend.gain.value = 0
    deck.flangerDelay = ctx.createDelay(0.05)
    deck.flangerDelay.delayTime.value = 0.005 // 5ms center
    deck.flangerLFO = ctx.createOscillator()
    deck.flangerLFO.type = 'sine'
    deck.flangerLFO.frequency.value = 0.35 // Hz — slow swoosh
    deck.flangerLFOGain = ctx.createGain()
    deck.flangerLFOGain.gain.value = 0.003 // ±3ms modulation depth
    deck.flangerLFO.connect(deck.flangerLFOGain)
    deck.flangerLFOGain.connect(deck.flangerDelay.delayTime)
    deck.flangerLFO.start()

    // ─── Bitcrusher ───
    deck.bitcrushSend = ctx.createGain()
    deck.bitcrushSend.gain.value = 0
    deck.bitcrushShaper = ctx.createWaveShaper()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deck.bitcrushShaper.curve = buildBitcrushCurve(12) as any // 12 step levels = lo-fi but not too harsh
    deck.bitcrushShaper.oversample = '2x'

    // ─── Reverb (convolver with synthesized impulse response) ───
    deck.reverbSend = ctx.createGain()
    deck.reverbSend.gain.value = 0
    deck.reverbConvolver = ctx.createConvolver()
    deck.reverbConvolver.buffer = buildReverbImpulse(ctx)

    // ─── Output gains ───
    deck.volumeGain = ctx.createGain()
    deck.volumeGain.gain.value = 0.8
    deck.crossfadeGain = ctx.createGain()
    deck.crossfadeGain.gain.value = 0.7

    // ─── Connect graph ───
    deck.source.connect(deck.gainTrim)
    deck.gainTrim.connect(deck.eqLow)
    deck.eqLow.connect(deck.eqMid)
    deck.eqMid.connect(deck.eqHi)
    deck.eqHi.connect(deck.filter)
    deck.filter.connect(deck.gateInsert)
    deck.gateInsert.connect(deck.fxSendPoint)

    // Four parallel sends from fxSendPoint to volumeGain
    deck.fxSendPoint.connect(deck.dryGain)
    deck.dryGain.connect(deck.volumeGain)

    deck.fxSendPoint.connect(deck.echoSend)
    deck.echoSend.connect(deck.echoDelay)
    deck.echoDelay.connect(deck.echoFeedback)
    deck.echoFeedback.connect(deck.echoDelay) // feedback loop
    deck.echoDelay.connect(deck.volumeGain)

    deck.fxSendPoint.connect(deck.flangerSend)
    deck.flangerSend.connect(deck.flangerDelay)
    deck.flangerDelay.connect(deck.volumeGain)

    deck.fxSendPoint.connect(deck.bitcrushSend)
    deck.bitcrushSend.connect(deck.bitcrushShaper)
    deck.bitcrushShaper.connect(deck.volumeGain)

    deck.fxSendPoint.connect(deck.reverbSend)
    deck.reverbSend.connect(deck.reverbConvolver)
    deck.reverbConvolver.connect(deck.volumeGain)

    deck.volumeGain.connect(deck.crossfadeGain)
    // Route through master bus (which forks to destination + analyser + optional recorder)
    if (this.masterBus) {
      deck.crossfadeGain.connect(this.masterBus)
    } else {
      // fallback if somehow master bus not ready
      deck.crossfadeGain.connect(ctx.destination)
    }

    // ─── Audio element events ───
    audio.addEventListener('loadedmetadata', () => {
      deck.isReady = true
      const title = (audio.dataset.title || '').trim() || 'Track'
      const artist = (audio.dataset.artist || '').trim() || 'DJ Ogi'
      this.trackCallbacks[deckId]?.({ title, artist, duration: audio.duration * 1000 })
      this.stateCallbacks[deckId]?.('ready')
    })
    audio.addEventListener('play', () => {
      deck.isPlaying = true
      this.stateCallbacks[deckId]?.('play')
      this.startProgressLoop(deckId)
    })
    audio.addEventListener('pause', () => {
      deck.isPlaying = false
      this.stateCallbacks[deckId]?.('pause')
      this.stopProgressLoop(deckId)
    })
    audio.addEventListener('ended', () => {
      deck.isPlaying = false
      this.stateCallbacks[deckId]?.('finish')
      this.stopProgressLoop(deckId)
    })
    audio.addEventListener('error', () => {
      console.warn(`[Audio ${deckId}] load/decode error:`, audio.error)
      this.stateCallbacks[deckId]?.('error')
    })
    audio.addEventListener('loadstart', () => {
      this.stateCallbacks[deckId]?.('loading')
    })
  }

  private teardownDeck(deckId: DeckId) {
    const deck = this.decks[deckId]
    this.stopProgressLoop(deckId)
    this.stopBeatLoop(deckId)
    this.stopTapeStop(deckId)
    this.stopGateSchedule(deckId)
    this.stopReverse(deckId)
    try { deck.flangerLFO?.stop() } catch { /* ignore */ }
    const nodes: (AudioNode | null)[] = [
      deck.source, deck.gainTrim, deck.eqLow, deck.eqMid, deck.eqHi, deck.filter,
      deck.gateInsert, deck.fxSendPoint, deck.dryGain,
      deck.echoSend, deck.echoDelay, deck.echoFeedback,
      deck.flangerSend, deck.flangerDelay, deck.flangerLFO, deck.flangerLFOGain,
      deck.bitcrushSend, deck.bitcrushShaper,
      deck.reverbSend, deck.reverbConvolver,
      deck.volumeGain, deck.crossfadeGain,
    ]
    nodes.forEach(n => { try { n?.disconnect() } catch { /* ignore */ } })
    Object.assign(deck, makeDeck())
  }

  private startProgressLoop(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (deck.progressRaf) return
    const tick = () => {
      if (!deck.audio || !deck.isPlaying) { deck.progressRaf = 0; return }
      const cur = deck.audio.currentTime
      const dur = deck.audio.duration || 1
      this.progressCallbacks[deckId]?.({ position: cur * 1000, relativePosition: cur / dur })
      deck.progressRaf = requestAnimationFrame(tick)
    }
    deck.progressRaf = requestAnimationFrame(tick)
  }

  private stopProgressLoop(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (deck.progressRaf) { cancelAnimationFrame(deck.progressRaf); deck.progressRaf = 0 }
  }

  // ─── Track loading & transport ───

  loadTrack(deckId: DeckId, url: string, meta?: { title?: string; artist?: string }) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    this.getContext()
    if (meta?.title) deck.audio.dataset.title = meta.title
    if (meta?.artist) deck.audio.dataset.artist = meta.artist
    deck.isReady = false
    deck.isPlaying = false
    this.stopBeatLoop(deckId)
    this.stateCallbacks[deckId]?.('loading')
    deck.audio.src = url
    deck.audio.load()
  }

  play(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    this.getContext()
    deck.audio.play().catch((err) => console.warn(`[Audio ${deckId}] play blocked:`, err))
  }
  pause(deckId: DeckId) { this.decks[deckId].audio?.pause() }
  toggle(deckId: DeckId) {
    const audio = this.decks[deckId].audio
    if (!audio) return
    if (audio.paused) this.play(deckId); else this.pause(deckId)
  }

  setVolume(deckId: DeckId, volume: number) {
    const deck = this.decks[deckId]
    const clamped = Math.max(0, Math.min(100, volume))
    const gainValue = clamped / 100
    if (deck.volumeGain) {
      const ctx = this.getContext()
      deck.volumeGain.gain.setTargetAtTime(gainValue, ctx.currentTime, 0.01)
    }
  }

  seekTo(deckId: DeckId, ms: number) {
    const deck = this.decks[deckId]
    if (!deck.audio || !deck.isReady) return
    const seconds = ms / 1000
    if (isFinite(seconds) && seconds >= 0 && seconds <= deck.audio.duration) {
      deck.audio.currentTime = seconds
    }
  }

  retryInit(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    this.stateCallbacks[deckId]?.('loading')
    deck.audio.load()
  }

  // ─── Batch 2: EQ / Filter / Pitch ───

  setEQ(deckId: DeckId, band: 'low' | 'mid' | 'hi', value: number) {
    const deck = this.decks[deckId]
    const node = band === 'low' ? deck.eqLow : band === 'mid' ? deck.eqMid : deck.eqHi
    if (!node) return
    const clamped = Math.max(-1, Math.min(1, value))
    const gainDb = clamped < 0 ? clamped * 40 : clamped * 12
    const ctx = this.getContext()
    node.gain.setTargetAtTime(gainDb, ctx.currentTime, 0.01)
  }

  setFilter(deckId: DeckId, value: number) {
    const deck = this.decks[deckId]
    if (!deck.filter) return
    const clamped = Math.max(-1, Math.min(1, value))
    const ctx = this.getContext()
    if (Math.abs(clamped) < 0.03) {
      deck.filter.type = 'lowpass'
      deck.filter.frequency.setTargetAtTime(22050, ctx.currentTime, 0.02)
      deck.filter.Q.setTargetAtTime(0.5, ctx.currentTime, 0.02)
      return
    }
    if (clamped < 0) {
      deck.filter.type = 'lowpass'
      const t = -clamped
      const freq = 22050 * Math.pow(200 / 22050, t)
      deck.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.02)
      deck.filter.Q.setTargetAtTime(0.7 + t * 2.5, ctx.currentTime, 0.02)
    } else {
      deck.filter.type = 'highpass'
      const t = clamped
      const freq = 20 * Math.pow(8000 / 20, t)
      deck.filter.frequency.setTargetAtTime(freq, ctx.currentTime, 0.02)
      deck.filter.Q.setTargetAtTime(0.7 + t * 2.5, ctx.currentTime, 0.02)
    }
  }

  setPitch(deckId: DeckId, value: number) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    const clamped = Math.max(-1, Math.min(1, value))
    deck.audio.playbackRate = 1 + clamped * 0.08
  }

  // ─── Batch 6: Pro DJ tools ───

  /** Input trim / gain: bipolar -1..+1 mapped to ±12 dB */
  setGain(deckId: DeckId, value: number) {
    const deck = this.decks[deckId]
    if (!deck.gainTrim || !this.ctx) return
    const clamped = Math.max(-1, Math.min(1, value))
    const db = clamped * 12
    const linear = Math.pow(10, db / 20)
    deck.gainTrim.gain.setTargetAtTime(linear, this.ctx.currentTime, 0.015)
  }

  /** Reverb send: 0 = dry, 1 = fully wet */
  setReverbSend(deckId: DeckId, value: number) {
    const deck = this.decks[deckId]
    if (!deck.reverbSend || !this.ctx) return
    const clamped = Math.max(0, Math.min(1, value))
    deck.reverbSend.gain.setTargetAtTime(clamped, this.ctx.currentTime, 0.02)
  }

  /** Preserve pitch when changing playbackRate — pro DJ "key lock" */
  setKeyLock(deckId: DeckId, locked: boolean) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const a = deck.audio as any
    if ('preservesPitch' in a) a.preservesPitch = locked
    if ('mozPreservesPitch' in a) a.mozPreservesPitch = locked
    if ('webkitPreservesPitch' in a) a.webkitPreservesPitch = locked
  }

  /** Reverse scrub — rapid backwards step while held */
  startReverse(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.audio || deck.reverseRaf) return
    // Pause real playback; we drive position manually
    const wasPlaying = !deck.audio.paused
    if (wasPlaying) deck.audio.pause()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(deck as any).__reverseWasPlaying = wasPlaying
    let lastTs = performance.now()
    const step = (ts: number) => {
      if (!deck.audio) return
      const dt = (ts - lastTs) / 1000
      lastTs = ts
      // Scrub back at 2× speed (2 seconds of audio per real second)
      deck.audio.currentTime = Math.max(0, deck.audio.currentTime - dt * 2)
      deck.reverseRaf = requestAnimationFrame(step)
    }
    deck.reverseRaf = requestAnimationFrame(step)
  }

  stopReverse(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (deck.reverseRaf) {
      cancelAnimationFrame(deck.reverseRaf)
      deck.reverseRaf = 0
    }
    if (!deck.audio) return
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const wasPlaying = (deck as any).__reverseWasPlaying
    if (wasPlaying) {
      deck.audio.play().catch(() => { /* ignore */ })
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (deck as any).__reverseWasPlaying
  }

  // ─── Batch 3: Transport tools ───

  syncTo(deckId: DeckId, myBpm: number, targetBpm: number): boolean {
    const deck = this.decks[deckId]
    if (!deck.audio || !myBpm || !targetBpm) return false
    const ratio = targetBpm / myBpm
    if (ratio < 0.84 || ratio > 1.16) return false
    deck.audio.playbackRate = ratio
    return true
  }

  jumpToHotCue(deckId: DeckId, positionMs: number) { this.seekTo(deckId, positionMs) }

  startBeatLoop(deckId: DeckId, bars: number, bpm: number) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    this.stopBeatLoop(deckId)
    const beatsPerBar = 4
    const totalBeats = bars * beatsPerBar
    const secondsPerBeat = 60 / bpm
    const loopLenSec = totalBeats * secondsPerBeat
    const loopLenMs = loopLenSec * 1000
    deck.loopStartMs = deck.audio.currentTime * 1000
    deck.loopEndMs = deck.loopStartMs + loopLenMs
    deck.loopInterval = window.setInterval(() => {
      if (!deck.audio || !deck.loopStartMs || !deck.loopEndMs) return
      const nowMs = deck.audio.currentTime * 1000
      if (nowMs >= deck.loopEndMs) deck.audio.currentTime = deck.loopStartMs / 1000
    }, 50)
  }

  stopBeatLoop(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (deck.loopInterval) { clearInterval(deck.loopInterval); deck.loopInterval = 0 }
    deck.loopStartMs = null
    deck.loopEndMs = null
  }

  tapeStop(deckId: DeckId, durationMs = 1000) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    this.stopTapeStop(deckId)
    deck.savedPlaybackRate = deck.audio.playbackRate
    const startRate = deck.audio.playbackRate
    const startTime = performance.now()
    const tick = () => {
      if (!deck.audio) return
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / durationMs, 1)
      const eased = 1 - Math.pow(1 - t, 3)
      const rate = startRate * (1 - eased)
      if (rate > 0.05) {
        deck.audio.playbackRate = rate
        deck.tapeStopRaf = requestAnimationFrame(tick)
      } else {
        deck.audio.pause()
        deck.audio.playbackRate = deck.savedPlaybackRate
        deck.tapeStopRaf = 0
      }
    }
    deck.tapeStopRaf = requestAnimationFrame(tick)
  }

  private stopTapeStop(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (deck.tapeStopRaf) {
      cancelAnimationFrame(deck.tapeStopRaf)
      deck.tapeStopRaf = 0
      if (deck.audio) deck.audio.playbackRate = deck.savedPlaybackRate
    }
  }

  // ─── Batch 4: FX Pads ───

  /**
   * Activate or deactivate an FX on a deck.
   * For echo + flanger + bitcrush: ramps wet send gain.
   * For gate: starts/stops scheduled rhythmic gain automation (BPM-synced 1/8-note chop).
   */
  setFX(deckId: DeckId, fx: FXName, active: boolean, bpm = 128) {
    const deck = this.decks[deckId]
    const ctx = this.getContext()
    deck.fxActive[fx] = active

    switch (fx) {
      case 'echo': {
        const gain = deck.echoSend?.gain
        if (!gain || !deck.echoDelay) return
        // Align echo delay time to 3/8 of a beat (classic dub-delay feel)
        const beatSec = 60 / bpm
        deck.echoDelay.delayTime.setTargetAtTime(beatSec * 0.375, ctx.currentTime, 0.05)
        gain.setTargetAtTime(active ? ECHO_WET : 0, ctx.currentTime, 0.05)
        break
      }
      case 'flanger': {
        const gain = deck.flangerSend?.gain
        if (!gain) return
        gain.setTargetAtTime(active ? FLANGER_WET : 0, ctx.currentTime, 0.05)
        break
      }
      case 'bitcrush': {
        const gain = deck.bitcrushSend?.gain
        const dry = deck.dryGain?.gain
        if (!gain || !dry) return
        // Bitcrusher is an insert-style — when on, mostly replace dry
        gain.setTargetAtTime(active ? BITCRUSH_WET : 0, ctx.currentTime, 0.05)
        dry.setTargetAtTime(active ? 0.15 : 1, ctx.currentTime, 0.05)
        break
      }
      case 'gate': {
        if (active) this.startGateSchedule(deckId, bpm)
        else this.stopGateSchedule(deckId)
        break
      }
    }
  }

  /** Schedule BPM-synced 1/8-note on/off gain modulation on the gate insert. */
  private startGateSchedule(deckId: DeckId, bpm: number) {
    const deck = this.decks[deckId]
    const gateNode = deck.gateInsert
    if (!gateNode) return
    const ctx = this.getContext()

    const eighthNoteSec = (60 / bpm) / 2 // 1/8 note
    const lookaheadCycles = 32 // schedule ahead this many steps

    const scheduleLoop = () => {
      if (!deck.fxActive.gate) return
      const gain = gateNode.gain
      gain.cancelScheduledValues(ctx.currentTime)
      let t = ctx.currentTime
      // Align to next eighth boundary (simple approximation)
      for (let i = 0; i < lookaheadCycles; i++) {
        gain.setValueAtTime(1, t)
        gain.setValueAtTime(0.1, t + eighthNoteSec * 0.5) // chop: open half the cycle
        t += eighthNoteSec
      }
      // Reschedule before the window runs out
      const reschedMs = (eighthNoteSec * lookaheadCycles * 1000) * 0.6
      deck.gateSchedTimeout = window.setTimeout(scheduleLoop, reschedMs)
    }
    scheduleLoop()
  }

  private stopGateSchedule(deckId: DeckId) {
    const deck = this.decks[deckId]
    const ctx = this.getContext()
    if (deck.gateSchedTimeout) {
      clearTimeout(deck.gateSchedTimeout)
      deck.gateSchedTimeout = 0
    }
    if (deck.gateInsert) {
      deck.gateInsert.gain.cancelScheduledValues(ctx.currentTime)
      deck.gateInsert.gain.setTargetAtTime(1, ctx.currentTime, 0.01)
    }
  }

  // ─── Batch 5: Scratch ───

  /** Begin scratch mode on a deck. Saves the current playbackRate so it can be restored. */
  scratchStart(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    if (deck.scratchReleaseRaf) { cancelAnimationFrame(deck.scratchReleaseRaf); deck.scratchReleaseRaf = 0 }
    deck.isScratching = true
    deck.preScratchRate = deck.audio.playbackRate
  }

  /**
   * Modulate playbackRate from drag velocity.
   * `velocity` is pixels-per-frame (positive = forward fast, 0 = hold, negative = brake).
   * Maps to a rate in 0.05..3.0.
   */
  scratchMove(deckId: DeckId, velocity: number) {
    const deck = this.decks[deckId]
    if (!deck.audio || !deck.isScratching) return
    // Hand-scratching a record: no motion = near-stop, fast motion = high rate
    const absV = Math.abs(velocity)
    // Map velocity to rate: 0 → 0.05 (near-pause), 30+ → ~3x
    const rate = Math.max(0.05, Math.min(3, 0.3 + absV * 0.08))
    deck.audio.playbackRate = rate
  }

  /** Release scratch — smoothly ramp playbackRate back to the pre-scratch value. */
  scratchEnd(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.audio) return
    deck.isScratching = false
    const targetRate = deck.preScratchRate
    const startRate = deck.audio.playbackRate
    const startTime = performance.now()
    const duration = 250 // ms
    const tick = () => {
      if (!deck.audio || deck.isScratching) { deck.scratchReleaseRaf = 0; return }
      const elapsed = performance.now() - startTime
      const t = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - t, 2)
      deck.audio.playbackRate = startRate + (targetRate - startRate) * eased
      if (t < 1) {
        deck.scratchReleaseRaf = requestAnimationFrame(tick)
      } else {
        deck.scratchReleaseRaf = 0
      }
    }
    deck.scratchReleaseRaf = requestAnimationFrame(tick)
  }

  // ─── Batch 5: Recording ───

  /** Is a MediaRecorder currently recording? */
  isRecording(): boolean {
    return this.mediaRecorder?.state === 'recording'
  }

  /** Current recording mode */
  getRecordingMode(): 'audio' | 'video' { return this.recordingMode }

  /**
   * Start recording the master output.
   * mode='audio' → audio-only webm (best quality, small file)
   * mode='video' → 720x1280 vertical video + audio (Instagram/Reels ready, larger file)
   */
  startRecording(mode: 'audio' | 'video' = 'audio', maxSeconds = 60): boolean {
    const ctx = this.getContext()
    if (!this.masterBus) return false
    if (this.isRecording()) return false

    this.recordingMode = mode

    if (!this.recordDestination) {
      this.recordDestination = ctx.createMediaStreamDestination()
      this.masterBus.connect(this.recordDestination)
    }

    let stream: MediaStream
    let mimeType = ''

    if (mode === 'video') {
      // Build branded canvas (portrait 720x1280 for IG Reels/Stories)
      this.videoCanvas = document.createElement('canvas')
      this.videoCanvas.width = 720
      this.videoCanvas.height = 1280
      this.startVideoDrawLoop()

      const canvasStream = this.videoCanvas.captureStream(30)
      const audioTrack = this.recordDestination.stream.getAudioTracks()[0]
      if (audioTrack) canvasStream.addTrack(audioTrack)
      stream = canvasStream

      const videoCandidates = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ]
      for (const c of videoCandidates) {
        if (MediaRecorder.isTypeSupported(c)) { mimeType = c; break }
      }
    } else {
      stream = this.recordDestination.stream
      const audioCandidates = [
        'audio/webm;codecs=opus',
        'audio/webm',
        'audio/mp4',
      ]
      for (const c of audioCandidates) {
        if (MediaRecorder.isTypeSupported(c)) { mimeType = c; break }
      }
    }

    if (!mimeType) {
      console.warn('[Rec] No supported MIME type for MediaRecorder')
      return false
    }

    try {
      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType,
        audioBitsPerSecond: 192000,
        videoBitsPerSecond: mode === 'video' ? 2_500_000 : undefined,
      })
    } catch (err) {
      console.warn('[Rec] MediaRecorder construct failed:', err)
      return false
    }

    this.recordedChunks = []
    this.recordingStartTime = performance.now()

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recordedChunks.push(e.data)
    }
    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: mimeType })
      const duration = (performance.now() - this.recordingStartTime) / 1000
      this.recordingCallbacks.onStop?.(blob, duration)
      if (this.recordingTickTimer) { clearInterval(this.recordingTickTimer); this.recordingTickTimer = 0 }
      this.stopVideoDrawLoop()
    }

    this.mediaRecorder.start(250)
    this.recordingCallbacks.onStart?.()

    this.recordingTickTimer = window.setInterval(() => {
      const duration = (performance.now() - this.recordingStartTime) / 1000
      this.recordingCallbacks.onTick?.(duration)
      if (duration >= maxSeconds) this.stopRecording()
    }, 100)

    return true
  }

  stopRecording() {
    if (this.mediaRecorder?.state === 'recording') this.mediaRecorder.stop()
  }

  private startVideoDrawLoop() {
    if (!this.videoCanvas) return
    const canvas = this.videoCanvas
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = canvas.width    // 720
    const H = canvas.height   // 1280
    const cx = W / 2

    const freqData = new Uint8Array(64)
    const startTime = performance.now()

    // CTA rotation — matches site tone: short, dry, techno-brutalist
    const CTA_MESSAGES = [
      { head: 'YOUR TURN', sub: 'DJ-OGI.COM' },
      { head: 'DROP YOUR MIX', sub: 'SHOW ME YOURS' },
      { head: 'CAN YOU BEAT THIS', sub: 'DJ-OGI.COM' },
      { head: 'HERE\'S MY BEST', sub: 'NOW GO SHOW YOURS' },
    ]

    // Pre-seeded glitch schedule (deterministic per recording, unique each take)
    const glitchEvents: Array<{ t: number; y: number; h: number; offset: number; color: 'c' | 'r' }> = []
    for (let i = 0; i < 60; i++) {
      glitchEvents.push({
        t: Math.random() * 60,
        y: Math.random() * H,
        h: 10 + Math.random() * 40,
        offset: (Math.random() - 0.5) * 40,
        color: Math.random() > 0.5 ? 'c' : 'r',
      })
    }

    // Text helper — triple RGB layered just like the site's rgb-split class
    const drawText = (text: string, x: number, y: number, font: string, color: string,
                      opts?: { rgbSplit?: number; align?: CanvasTextAlign; alpha?: number }) => {
      ctx.font = font
      ctx.textAlign = opts?.align ?? 'center'
      const split = opts?.rgbSplit ?? 0
      if (split > 0) {
        ctx.fillStyle = `rgba(255,0,60,${(opts?.alpha ?? 0.8)})`
        ctx.fillText(text, x - split, y)
        ctx.fillStyle = `rgba(0,255,204,${(opts?.alpha ?? 0.8)})`
        ctx.fillText(text, x + split, y)
      }
      ctx.fillStyle = color
      ctx.fillText(text, x, y)
    }

    // Horizontal divider — like the site's gradient `from-transparent via-X to-transparent`
    const drawDivider = (y: number, width: number, color: string, alpha = 0.35) => {
      const grad = ctx.createLinearGradient(cx - width / 2, 0, cx + width / 2, 0)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(0.5, color + Math.round(alpha * 255).toString(16).padStart(2, '0'))
      grad.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = grad
      ctx.fillRect(cx - width / 2, y, width, 1)
    }

    const draw = () => {
      const now = performance.now()
      const elapsed = (now - startTime) / 1000

      // ── AUDIO REACTIVE ENERGY ──
      this.getFrequencyData(freqData)
      let bassSum = 0
      for (let i = 0; i < 8; i++) bassSum += freqData[i]
      const bassEnergy = bassSum / (8 * 255)

      let highSum = 0
      for (let i = 40; i < 64; i++) highSum += freqData[i]
      const highEnergy = highSum / (24 * 255)

      let midSum = 0
      for (let i = 8; i < 40; i++) midSum += freqData[i]
      const midEnergy = midSum / (32 * 255)

      // ── PURE BLACK BACKGROUND ── (matches site)
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, W, H)

      // ── SUBTLE VIGNETTE ──
      const vignette = ctx.createRadialGradient(cx, H / 2, H / 3, cx, H / 2, H / 1.1)
      vignette.addColorStop(0, 'rgba(0,0,0,0)')
      vignette.addColorStop(1, 'rgba(0,0,0,0.85)')
      ctx.fillStyle = vignette
      ctx.fillRect(0, 0, W, H)

      // ── ORGANIC CORNER GLOWS (cyan top-left, red bottom-right) ──
      const glowA = ctx.createRadialGradient(120, 200, 0, 120, 200, 500)
      glowA.addColorStop(0, `rgba(0,255,204,${0.06 + bassEnergy * 0.08})`)
      glowA.addColorStop(1, 'rgba(0,255,204,0)')
      ctx.fillStyle = glowA
      ctx.fillRect(0, 0, W, H)

      const glowB = ctx.createRadialGradient(W - 120, H - 200, 0, W - 120, H - 200, 500)
      glowB.addColorStop(0, `rgba(255,0,60,${0.05 + highEnergy * 0.08})`)
      glowB.addColorStop(1, 'rgba(255,0,60,0)')
      ctx.fillStyle = glowB
      ctx.fillRect(0, 0, W, H)

      // ── PRE-SCHEDULED GLITCH BANDS (pure color flash) ──
      for (const ev of glitchEvents) {
        const dt = Math.abs(elapsed - ev.t)
        if (dt < 0.12) {
          const fade = 1 - dt / 0.12
          ctx.fillStyle = ev.color === 'c'
            ? `rgba(0,255,204,${0.12 * fade})`
            : `rgba(255,0,60,${0.12 * fade})`
          ctx.fillRect(0, ev.y, W, ev.h)
        }
      }

      // ── BASS-HIT GLITCH TEAR ──
      if (bassEnergy > 0.6 && Math.random() < 0.4) {
        const band = 8 + Math.random() * 30
        const y = Math.random() * H
        const off = (Math.random() - 0.5) * 40
        try {
          const imgData = ctx.getImageData(0, y, W, band)
          ctx.putImageData(imgData, off, y)
        } catch { /* CORS safety */ }
      }

      // ── HARD SCAN LINES (scrolling 2px stripes — site's signature) ──
      const scanOffset = (elapsed * 20) % 4
      ctx.fillStyle = 'rgba(0,0,0,0.4)'
      for (let y = scanOffset; y < H; y += 4) {
        ctx.fillRect(0, y, W, 2)
      }

      // ── HEADER STRIP ──
      // Thin top border line
      ctx.fillStyle = 'rgba(0,255,204,0.2)'
      ctx.fillRect(40, 36, W - 80, 1)

      // REC indicator (left)
      const blink = Math.sin(elapsed * 5) > 0
      if (blink) {
        ctx.fillStyle = '#ff003c'
        ctx.fillRect(40, 55, 8, 8)
      }
      drawText('● REC', 60, 65, '18px "VCR OSD Mono", monospace', '#ff003c', { align: 'left' })

      // Timer (center)
      const mm = Math.floor(elapsed / 60)
      const ss = String(Math.floor(elapsed % 60)).padStart(2, '0')
      drawText(`${mm}:${ss}`, cx, 65, '18px "VCR OSD Mono", monospace', 'rgba(255,255,255,0.5)', { align: 'center' })

      // Brand (right)
      drawText('// DJ OGI', W - 40, 65, '18px "VCR OSD Mono", monospace', 'rgba(0,255,204,0.5)', { align: 'right' })

      // ── DIVIDER ──
      drawDivider(110, 500, '#00ffcc', 0.25)

      // ── SECTION LABEL ──
      drawText('// LIVE FROM THE BOOTH', cx, 150, '20px "VCR OSD Mono", monospace', 'rgba(0,255,204,0.6)', { align: 'center' })

      // ── MASSIVE TITLE (DJ OGI) ──
      // Site style: big VHS text w/ chromatic triple-layer
      const titleSplit = 3 + bassEnergy * 10
      ctx.font = 'bold 150px "VCR OSD Mono", monospace'
      ctx.textAlign = 'center'
      // Red ghost (farther)
      ctx.fillStyle = `rgba(255,0,60,${0.6 + bassEnergy * 0.3})`
      ctx.fillText('DJ OGI', cx - titleSplit, 300)
      // Cyan ghost
      ctx.fillStyle = `rgba(0,255,204,${0.6 + bassEnergy * 0.3})`
      ctx.fillText('DJ OGI', cx + titleSplit, 300)
      // White core
      ctx.fillStyle = '#fff'
      ctx.fillText('DJ OGI', cx, 300)

      // Underline
      drawDivider(330, 400, '#00ffcc', 0.5 + bassEnergy * 0.5)

      // Sub-tag
      drawText('HARD TECHNO · SINCE 1994', cx, 365, '18px "VCR OSD Mono", monospace', 'rgba(255,255,255,0.35)', { align: 'center' })

      // ── TRACK PANELS (minimal, border-only, like site) ──
      const state = useAudioStore.getState()
      const aTrack = (state.deckA.trackTitle || '—').toUpperCase().substring(0, 24)
      const bTrack = (state.deckB.trackTitle || '—').toUpperCase().substring(0, 24)

      const drawTrackRow = (y: number, label: string, name: string, bpm: number, accent: string, rgb: string, energy: number) => {
        // Thin border (left accent only)
        ctx.fillStyle = accent
        ctx.fillRect(50, y - 18, 2, 36)

        // Row label
        ctx.font = 'bold 28px "VCR OSD Mono", monospace'
        ctx.textAlign = 'left'
        ctx.fillStyle = accent
        ctx.fillText(label, 70, y + 8)

        // Track title
        ctx.font = '20px "VCR OSD Mono", monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.85)'
        ctx.fillText(name, 110, y + 8)

        // BPM (right, bold, colored, glows with track energy)
        ctx.font = 'bold 24px "VCR OSD Mono", monospace'
        ctx.textAlign = 'right'
        const glow = 6 + energy * 10
        ctx.shadowColor = accent
        ctx.shadowBlur = glow
        ctx.fillStyle = accent
        ctx.fillText(`${bpm}`, W - 90, y + 8)
        ctx.shadowBlur = 0

        ctx.font = '14px "VCR OSD Mono", monospace'
        ctx.fillStyle = 'rgba(255,255,255,0.25)'
        ctx.fillText('BPM', W - 55, y + 8)

        // Bottom thin divider per row
        const grad = ctx.createLinearGradient(50, 0, W - 50, 0)
        grad.addColorStop(0, 'rgba(0,0,0,0)')
        grad.addColorStop(0.5, `rgba(${rgb},0.2)`)
        grad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = grad
        ctx.fillRect(50, y + 22, W - 100, 1)
      }
      drawTrackRow(440, 'A', aTrack, state.deckA.bpm, '#00ffcc', '0,255,204', midEnergy)
      drawTrackRow(495, 'B', bTrack, state.deckB.bpm, '#ff003c', '255,0,60', midEnergy)

      // ── FFT SPECTRUM — only cyan (low) + red (high), mirrored, site colors only ──
      const specY = 570
      const specH = 220
      const cySpec = specY + specH / 2
      const barCount = 64
      const barW = (W - 100) / barCount
      const maxBarH = 160

      for (let i = 0; i < barCount; i++) {
        const v = freqData[i] / 255
        const h = Math.max(2, v * maxBarH)
        const x = 50 + i * barW
        // Only cyan (low freq) → fading to red (high freq) with white in middle
        const t = i / barCount
        const rgbStr = t < 0.35
          ? `0,255,204`
          : t < 0.55
            ? `255,255,255`
            : `255,0,60`
        const alpha = 0.45 + v * 0.55
        ctx.fillStyle = `rgba(${rgbStr},${alpha})`
        ctx.fillRect(x, cySpec - h, barW - 1, h)
        ctx.fillRect(x, cySpec, barW - 1, h)

        // Peak glow top
        if (v > 0.55) {
          ctx.fillStyle = `rgba(${rgbStr},${v})`
          ctx.fillRect(x, cySpec - h, barW - 1, 2)
          ctx.fillRect(x, cySpec + h - 2, barW - 1, 2)
        }
      }

      // Center line (cyan, bass-reactive glow)
      ctx.shadowColor = '#00ffcc'
      ctx.shadowBlur = 10 + bassEnergy * 22
      ctx.strokeStyle = `rgba(0,255,204,${0.5 + bassEnergy * 0.5})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(50, cySpec); ctx.lineTo(W - 50, cySpec); ctx.stroke()
      ctx.shadowBlur = 0

      // Spectrum label
      drawText('// SPECTRUM', 50, specY - 10, '14px "VCR OSD Mono", monospace', 'rgba(255,255,255,0.25)', { align: 'left' })

      // ── DIVIDER ──
      drawDivider(870, 500, '#ff003c', 0.3)

      // ── CTA — dark box, not screaming ──
      const ctaIdx = Math.floor(elapsed / 6) % CTA_MESSAGES.length
      const cta = CTA_MESSAGES[ctaIdx]
      const ctaY = 980

      // Label above
      drawText('// YOUR MOVE', cx, ctaY - 80, '18px "VCR OSD Mono", monospace', 'rgba(255,0,60,0.55)', { align: 'center' })

      // Headline — chromatic split, glitching on bass
      const ctaSplit = 2 + bassEnergy * 8
      ctx.font = 'bold 50px "VCR OSD Mono", monospace'
      ctx.textAlign = 'center'
      ctx.fillStyle = 'rgba(255,0,60,0.7)'
      ctx.fillText(cta.head, cx - ctaSplit, ctaY)
      ctx.fillStyle = 'rgba(0,255,204,0.7)'
      ctx.fillText(cta.head, cx + ctaSplit, ctaY)
      ctx.fillStyle = '#fff'
      ctx.fillText(cta.head, cx, ctaY)

      // Subtitle URL
      drawText(cta.sub, cx, ctaY + 50, '22px "VCR OSD Mono", monospace', 'rgba(0,255,204,0.85)', { rgbSplit: 1, align: 'center' })

      // Divider below CTA
      drawDivider(ctaY + 80, 400, '#00ffcc', 0.3)

      // ── BOTTOM HUD ──
      // Small EQ-style dot row
      const hudY = H - 100
      const dotCount = 24
      const dotSpacing = 14
      const totalDotsW = dotCount * dotSpacing
      for (let i = 0; i < dotCount; i++) {
        const isOn = (i / dotCount) < (bassEnergy * 0.5 + midEnergy * 0.3 + highEnergy * 0.2)
        ctx.fillStyle = isOn ? (i < 8 ? '#00ffcc' : i < 16 ? 'rgba(255,255,255,0.9)' : '#ff003c') : 'rgba(255,255,255,0.08)'
        ctx.fillRect(cx - totalDotsW / 2 + i * dotSpacing, hudY, 8, 3)
      }

      // Footer site link
      drawText('DJ-OGI.COM', cx, H - 55, 'bold 26px "VCR OSD Mono", monospace', '#fff', { rgbSplit: 2, align: 'center' })
      drawText('// RIJEKA · CROATIA', cx, H - 25, '14px "VCR OSD Mono", monospace', 'rgba(255,255,255,0.25)', { align: 'center' })

      // ── HORIZONTAL TRACKING BAR (occasional sweep) ──
      const trackingPhase = Math.sin(elapsed * 0.35)
      if (trackingPhase > 0.4) {
        const trackingPos = (elapsed * 220) % (H + 80) - 40
        const tbGrad = ctx.createLinearGradient(0, trackingPos - 10, 0, trackingPos + 10)
        tbGrad.addColorStop(0, 'rgba(0,0,0,0)')
        tbGrad.addColorStop(0.5, 'rgba(255,255,255,0.12)')
        tbGrad.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = tbGrad
        ctx.fillRect(0, trackingPos - 10, W, 20)
      }

      // ── EDGE RGB BLEED (thin) ──
      const bleed = 0.04 + bassEnergy * 0.08
      ctx.fillStyle = `rgba(0,255,204,${bleed})`
      ctx.fillRect(0, 0, 3, H)
      ctx.fillStyle = `rgba(255,0,60,${bleed})`
      ctx.fillRect(W - 3, 0, 3, H)

      this.videoRaf = requestAnimationFrame(draw)
    }

    this.videoRaf = requestAnimationFrame(draw)
  }

  private stopVideoDrawLoop() {
    if (this.videoRaf) { cancelAnimationFrame(this.videoRaf); this.videoRaf = 0 }
    this.videoCanvas = null
  }

  onRecordingEvent(handlers: {
    onStart?: () => void
    onStop?: (blob: Blob, durationSec: number) => void
    onTick?: (durationSec: number) => void
  }) {
    this.recordingCallbacks = handlers
  }

  // ─── Callback registration ───

  onProgress(deckId: DeckId, callback: ProgressCallback) { this.progressCallbacks[deckId] = callback }
  onStateChange(deckId: DeckId, callback: StateCallback) { this.stateCallbacks[deckId] = callback }
  onTrackLoaded(deckId: DeckId, callback: TrackCallback) { this.trackCallbacks[deckId] = callback }

  // ─── Waveform peaks ───

  async getWaveformPeaks(deckId: DeckId, barCount = 120): Promise<number[] | null> {
    const deck = this.decks[deckId]
    if (!deck.audio?.src) return null
    try {
      const response = await fetch(deck.audio.src)
      if (!response.ok) return null
      const arrayBuffer = await response.arrayBuffer()
      const decodeCtx = this.getContext()
      const audioBuffer = await decodeCtx.decodeAudioData(arrayBuffer.slice(0))
      const channelData = audioBuffer.getChannelData(0)
      const samplesPerBar = Math.floor(channelData.length / barCount)
      const peaks: number[] = []
      for (let i = 0; i < barCount; i++) {
        let peak = 0
        const start = i * samplesPerBar
        const end = start + samplesPerBar
        for (let j = start; j < end; j++) {
          const v = Math.abs(channelData[j])
          if (v > peak) peak = v
        }
        peaks.push(peak)
      }
      return peaks
    } catch (err) {
      console.warn(`[Audio ${deckId}] waveform decode failed:`, err)
      return null
    }
  }
}

/** Build a stepped quantization curve for bitcrusher WaveShaper. `steps` = number of output levels. */
function buildBitcrushCurve(steps: number): Float32Array {
  const n = 4096
  // Explicit ArrayBuffer so the TS type narrows to Float32Array<ArrayBuffer> (what WaveShaperNode.curve expects)
  const buffer = new ArrayBuffer(n * Float32Array.BYTES_PER_ELEMENT)
  const curve = new Float32Array(buffer)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1 // -1..+1
    curve[i] = Math.round(x * steps) / steps
  }
  return curve
}

/**
 * Synthesize a stereo impulse response for the reverb convolver.
 * Exponentially decaying noise — roughly a medium-sized warehouse (~2.2s decay).
 * Cheaper than loading an IR file and sounds great for techno washouts.
 */
function buildReverbImpulse(ctx: AudioContext): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const durationSec = 2.2
  const length = Math.floor(sampleRate * durationSec)
  const buffer = ctx.createBuffer(2, length, sampleRate)
  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch)
    for (let i = 0; i < length; i++) {
      const t = i / length
      // Noise with sharp attack, exponential tail. Slight stereo variation.
      const decay = Math.pow(1 - t, 2.8)
      const variation = ch === 0 ? 1 : 0.92
      data[i] = (Math.random() * 2 - 1) * decay * variation
    }
  }
  return buffer
}

export const audioManager = new AudioManager()

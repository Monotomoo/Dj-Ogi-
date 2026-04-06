import { useAudioStore } from '../../stores/audioStore'

let animFrameId: number | null = null
let lastTime = 0
let energy = 0
let beatCount = 0

/**
 * Starts the beat simulation loop.
 * Reads BPM from audio store and simulates beat phase + energy.
 */
export function startBeatSimulator() {
  if (animFrameId !== null) return

  const tick = (time: number) => {
    const dt = (time - lastTime) / 1000
    lastTime = time

    const state = useAudioStore.getState()
    const isPlaying = state.deckA.isPlaying || state.deckB.isPlaying

    // Get active BPM (prefer playing deck)
    let bpm = 140
    if (state.deckA.isPlaying && state.deckB.isPlaying) {
      bpm = (state.deckA.bpm + state.deckB.bpm) / 2
    } else if (state.deckA.isPlaying) {
      bpm = state.deckA.bpm
    } else if (state.deckB.isPlaying) {
      bpm = state.deckB.bpm
    }

    // Beat phase (0-1 cycling)
    const beatsPerSecond = bpm / 60
    const beatPhase = (time * beatsPerSecond / 1000) % 1

    // Detect beat hits (phase crosses 0)
    const prevPhase = state.beatPhase
    if (beatPhase < prevPhase && isPlaying) {
      beatCount++
    }

    // Energy calculation
    const targetEnergy = isPlaying
      ? (state.deckA.isPlaying && state.deckB.isPlaying ? 0.9 : 0.7)
      : 0

    // Beat spike
    const beatProximity = beatPhase < 0.05 ? 1 : 0
    const spikedTarget = isPlaying
      ? Math.min(1, targetEnergy + beatProximity * 0.3)
      : 0

    // Smooth interpolation
    const lerpSpeed = isPlaying ? 8 : 3
    energy += (spikedTarget - energy) * Math.min(1, dt * lerpSpeed)

    useAudioStore.getState().setBeatPhase(beatPhase)
    useAudioStore.getState().setEnergy(energy)

    animFrameId = requestAnimationFrame(tick)
  }

  lastTime = performance.now()
  animFrameId = requestAnimationFrame(tick)
}

export function stopBeatSimulator() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
}

export function getBeatCount() {
  return beatCount
}

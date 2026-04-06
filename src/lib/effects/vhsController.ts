import { useAudioStore } from '../../stores/audioStore'

let animFrameId: number | null = null
let glitchCooldown = 0
let beatAccumulator = 0

/**
 * VHS Controller - bridges audio state to CSS custom properties.
 * Runs on requestAnimationFrame for smooth visual updates.
 */
export function startVHSController() {
  if (animFrameId !== null) return

  const root = document.documentElement

  const tick = (_time: number) => {
    const state = useAudioStore.getState()
    const { energy, beatPhase, isAnyPlaying } = state as {
      energy: number
      beatPhase: number
      isAnyPlaying: boolean
    }

    // Scanline opacity: pulse with beat
    const scanlineBase = 0.15
    const scanlineRange = 0.35
    const scanlineOpacity = scanlineBase + energy * scanlineRange * (0.5 + 0.5 * Math.sin(beatPhase * Math.PI * 2))
    root.style.setProperty('--scanline-opacity', String(scanlineOpacity.toFixed(3)))

    // Noise opacity: increase with energy
    const noiseOpacity = 0.03 + energy * 0.06
    root.style.setProperty('--noise-opacity', String(noiseOpacity.toFixed(3)))

    // RGB split: spike on bass hits (every beat near phase 0)
    let rgbSplit = 0
    if (isAnyPlaying && beatPhase < 0.05 && energy > 0.5) {
      rgbSplit = 2 + energy * 3
    }
    root.style.setProperty('--rgb-split', `${rgbSplit.toFixed(1)}px`)

    // Flicker speed: faster when playing
    const flickerSpeed = isAnyPlaying ? 2 + (1 - energy) * 4 : 8
    root.style.setProperty('--flicker-speed', `${flickerSpeed.toFixed(1)}s`)

    // Energy
    root.style.setProperty('--vhs-energy', String(energy.toFixed(3)))

    // Glitch trigger: every 8th-ish beat
    if (isAnyPlaying && beatPhase < 0.05) {
      beatAccumulator++
      if (beatAccumulator >= 8 && glitchCooldown <= 0 && Math.random() > 0.4) {
        triggerGlitch()
        glitchCooldown = 500
        beatAccumulator = 0
      }
    }

    if (glitchCooldown > 0) {
      glitchCooldown -= 16.67 // ~1 frame
    }

    animFrameId = requestAnimationFrame(tick)
  }

  animFrameId = requestAnimationFrame(tick)
}

export function stopVHSController() {
  if (animFrameId !== null) {
    cancelAnimationFrame(animFrameId)
    animFrameId = null
  }
}

function triggerGlitch() {
  const targets = document.querySelectorAll('.rgb-split')
  targets.forEach((el) => {
    el.classList.add('glitching')
    setTimeout(() => el.classList.remove('glitching'), 150)
  })
}

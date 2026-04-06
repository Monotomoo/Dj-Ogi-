import seedrandom from 'seedrandom'
import { palettes } from './colorPalettes'
import { drawWaveformPattern } from './patterns/waveform'
import { drawGridPattern } from './patterns/grid'
import { drawSpiralPattern } from './patterns/spiral'
import { drawNoisePattern } from './patterns/noise'
import { drawCircuitPattern } from './patterns/circuit'
import type { TrackData } from '../../data/tracks'

export interface ArtParams {
  rng: () => number
  palette: typeof palettes[number]
  bpm: number
  density: number
  rotation: number
  complexity: number
}

const patternDrawers = [
  drawWaveformPattern,
  drawGridPattern,
  drawSpiralPattern,
  drawNoisePattern,
  drawCircuitPattern,
]

export function generateArt(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  track: TrackData
) {
  const seed = `${track.title}-${track.bpm}-${track.key}-${track.label}`
  const rng = seedrandom(seed)

  // Select palette and pattern from seed
  const paletteIndex = Math.floor(rng() * palettes.length)
  const patternIndex = Math.floor(rng() * patternDrawers.length)
  const palette = palettes[paletteIndex]
  const drawPattern = patternDrawers[patternIndex]

  const params: ArtParams = {
    rng,
    palette,
    bpm: track.bpm,
    density: 0.3 + rng() * 0.7,
    rotation: rng() * Math.PI * 2,
    complexity: Math.floor(3 + rng() * 5),
  }

  // Background
  ctx.fillStyle = palette.bg
  ctx.fillRect(0, 0, width, height)

  // Draw pattern
  drawPattern(ctx, width, height, params)

  // Vignette overlay
  const gradient = ctx.createRadialGradient(
    width / 2, height / 2, width * 0.2,
    width / 2, height / 2, width * 0.7
  )
  gradient.addColorStop(0, 'transparent')
  gradient.addColorStop(1, 'rgba(0,0,0,0.5)')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, width, height)

  // Subtle noise grain
  for (let i = 0; i < width * height * 0.02; i++) {
    const x = rng() * width
    const y = rng() * height
    ctx.fillStyle = `rgba(255,255,255,${rng() * 0.05})`
    ctx.fillRect(x, y, 1, 1)
  }
}

import type { ArtParams } from '../artEngine'

// Simple value noise using seeded RNG
function valueNoise(x: number, y: number, _rng: () => number, scale: number): number {
  const ix = Math.floor(x / scale)
  const iy = Math.floor(y / scale)
  const fx = (x / scale) - ix
  const fy = (y / scale) - iy

  // Use deterministic hash based on coordinates
  const hash = (a: number, b: number) => {
    const h = ((a * 73856093) ^ (b * 19349663)) & 0x7fffffff
    return (h % 1000) / 1000
  }

  const v00 = hash(ix, iy)
  const v10 = hash(ix + 1, iy)
  const v01 = hash(ix, iy + 1)
  const v11 = hash(ix + 1, iy + 1)

  // Smooth interpolation
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)

  const a = v00 + sx * (v10 - v00)
  const b = v01 + sx * (v11 - v01)
  return a + sy * (b - a)
}

export function drawNoisePattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ArtParams
) {
  const { rng, palette, density } = params
  const scale = 20 + rng() * 40
  const lineCount = Math.floor(50 + density * 150)
  const stepLength = 3
  const steps = Math.floor(30 + density * 50)

  for (let i = 0; i < lineCount; i++) {
    let x = rng() * width
    let y = rng() * height
    const color = palette.colors[i % palette.colors.length]

    ctx.strokeStyle = color
    ctx.globalAlpha = 0.1 + rng() * 0.2
    ctx.lineWidth = 0.5 + rng()
    ctx.beginPath()
    ctx.moveTo(x, y)

    for (let s = 0; s < steps; s++) {
      const n = valueNoise(x, y, rng, scale)
      const angle = n * Math.PI * 4
      x += Math.cos(angle) * stepLength
      y += Math.sin(angle) * stepLength
      ctx.lineTo(x, y)
    }

    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

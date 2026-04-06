import type { ArtParams } from '../artEngine'

export function drawCircuitPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ArtParams
) {
  const { rng, palette, density, complexity } = params
  const lineCount = Math.floor(15 + density * 25)

  for (let i = 0; i < lineCount; i++) {
    let x = rng() * width
    let y = rng() * height
    const color = palette.colors[i % palette.colors.length]
    const segments = Math.floor(3 + complexity)

    ctx.strokeStyle = color
    ctx.globalAlpha = 0.15 + rng() * 0.35
    ctx.lineWidth = 0.5 + rng()
    ctx.beginPath()
    ctx.moveTo(x, y)

    for (let s = 0; s < segments; s++) {
      const isHorizontal = rng() > 0.5
      const length = 10 + rng() * 80
      const direction = rng() > 0.5 ? 1 : -1

      if (isHorizontal) {
        x += length * direction
      } else {
        y += length * direction
      }

      // Clamp
      x = Math.max(0, Math.min(width, x))
      y = Math.max(0, Math.min(height, y))
      ctx.lineTo(x, y)
    }

    ctx.stroke()

    // Node dots at endpoints and turns
    ctx.fillStyle = color
    ctx.globalAlpha = 0.3 + rng() * 0.3
    ctx.beginPath()
    ctx.arc(x, y, 1.5 + rng() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  // Random intersection dots
  const dotCount = Math.floor(10 + density * 20)
  for (let i = 0; i < dotCount; i++) {
    const x = rng() * width
    const y = rng() * height
    const color = palette.colors[Math.floor(rng() * palette.colors.length)]
    ctx.fillStyle = color
    ctx.globalAlpha = 0.1 + rng() * 0.2
    ctx.beginPath()
    ctx.arc(x, y, 1 + rng() * 1.5, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.globalAlpha = 1
}

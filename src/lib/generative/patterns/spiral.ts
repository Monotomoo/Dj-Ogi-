import type { ArtParams } from '../artEngine'

export function drawSpiralPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ArtParams
) {
  const { rng, palette, density, complexity } = params
  const cx = width / 2
  const cy = height / 2
  const spiralCount = Math.floor(1 + density * 3)

  for (let s = 0; s < spiralCount; s++) {
    const color = palette.colors[s % palette.colors.length]
    const maxRadius = Math.min(width, height) * 0.45
    const turns = 3 + complexity
    const pointCount = Math.floor(200 + density * 300)
    const dotSize = 0.5 + rng() * 2
    const phaseOffset = rng() * Math.PI * 2

    for (let i = 0; i < pointCount; i++) {
      const t = i / pointCount
      const angle = t * turns * Math.PI * 2 + phaseOffset
      const radius = t * maxRadius

      const x = cx + Math.cos(angle) * radius
      const y = cy + Math.sin(angle) * radius

      ctx.fillStyle = color
      ctx.globalAlpha = 0.1 + t * 0.4
      ctx.beginPath()
      ctx.arc(x, y, dotSize * (0.5 + t), 0, Math.PI * 2)
      ctx.fill()
    }
  }

  ctx.globalAlpha = 1
}

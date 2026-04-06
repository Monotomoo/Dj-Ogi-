import type { ArtParams } from '../artEngine'

export function drawGridPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ArtParams
) {
  const { rng, palette, density, rotation } = params
  const cellCount = Math.floor(6 + density * 10)
  const cellW = width / cellCount
  const cellH = height / cellCount

  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(rotation * 0.1) // subtle tilt
  ctx.translate(-width / 2, -height / 2)

  for (let row = 0; row < cellCount; row++) {
    for (let col = 0; col < cellCount; col++) {
      const x = col * cellW
      const y = row * cellH
      const r = rng()

      if (r < 0.3) {
        // Filled square
        const color = palette.colors[Math.floor(rng() * palette.colors.length)]
        ctx.fillStyle = color
        ctx.globalAlpha = 0.1 + rng() * 0.4
        const inset = cellW * 0.1
        ctx.fillRect(x + inset, y + inset, cellW - inset * 2, cellH - inset * 2)
      } else if (r < 0.5) {
        // Outlined square
        const color = palette.colors[Math.floor(rng() * palette.colors.length)]
        ctx.strokeStyle = color
        ctx.globalAlpha = 0.15 + rng() * 0.3
        ctx.lineWidth = 0.5
        const inset = cellW * 0.15
        ctx.strokeRect(x + inset, y + inset, cellW - inset * 2, cellH - inset * 2)
      } else if (r < 0.6) {
        // Dot
        const color = palette.colors[Math.floor(rng() * palette.colors.length)]
        ctx.fillStyle = color
        ctx.globalAlpha = 0.2 + rng() * 0.4
        ctx.beginPath()
        ctx.arc(x + cellW / 2, y + cellH / 2, cellW * 0.15, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }

  ctx.restore()
  ctx.globalAlpha = 1
}

import type { ArtParams } from '../artEngine'

export function drawWaveformPattern(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  params: ArtParams
) {
  const { rng, palette, density, complexity } = params
  const cy = height / 2
  const lineCount = Math.floor(8 + density * 15)

  for (let i = 0; i < lineCount; i++) {
    const color = palette.colors[i % palette.colors.length]
    const opacity = 0.2 + rng() * 0.5
    ctx.strokeStyle = color
    ctx.globalAlpha = opacity
    ctx.lineWidth = 0.5 + rng() * 1.5

    const amplitude = 20 + rng() * (height * 0.3)
    const frequency = 2 + rng() * complexity
    const phaseOffset = rng() * Math.PI * 2
    const yOffset = (i - lineCount / 2) * (height / lineCount)

    ctx.beginPath()
    for (let x = 0; x <= width; x += 2) {
      const t = x / width
      const y = cy + yOffset + Math.sin(t * frequency * Math.PI + phaseOffset) * amplitude * (0.3 + 0.7 * Math.sin(t * Math.PI))
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.stroke()
  }

  ctx.globalAlpha = 1
}

import { useRef, useEffect } from 'react'
import { generateArt } from '../../lib/generative/artEngine'
import type { TrackData } from '../../data/tracks'

interface GenerativeCanvasProps {
  track: TrackData
  size?: number
}

export default function GenerativeCanvas({ track, size = 200 }: GenerativeCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    canvas.width = size * dpr * 2
    canvas.height = size * dpr * 2
    ctx.scale(dpr * 2, dpr * 2)

    generateArt(ctx, size, size, track)
  }, [track, size])

  return (
    <canvas
      ref={canvasRef}
      className="w-full aspect-square rounded"
      style={{ imageRendering: 'auto' }}
    />
  )
}

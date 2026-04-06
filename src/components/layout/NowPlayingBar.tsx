import { useEffect, useRef } from 'react'
import { useAudioStore } from '../../stores/audioStore'

export default function NowPlayingBar() {
  const deckA = useAudioStore((s) => s.deckA)
  const deckB = useAudioStore((s) => s.deckB)
  const isAnyPlaying = useAudioStore((s) => s.isAnyPlaying)
  const barsRef = useRef<HTMLDivElement>(null)

  const activeTrack = deckA.isPlaying ? deckA : deckB.isPlaying ? deckB : null

  // Animate bars via direct DOM to avoid 60fps React re-renders
  useEffect(() => {
    if (!isAnyPlaying || !barsRef.current) return
    let raf: number
    const bars = Array.from(barsRef.current.children) as HTMLElement[]
    const tick = (t: number) => {
      bars.forEach((bar, i) => {
        const h = 15 + (Math.sin(t * 0.003 + i * 0.65) + 1) * 0.5 * 85
        bar.style.height = `${Math.max(8, h)}%`
      })
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [isAnyPlaying])

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-[9985] h-10 border-t transition-all duration-500 backdrop-blur-sm ${
        isAnyPlaying && activeTrack
          ? 'opacity-100 translate-y-0 border-primary/15 bg-black/92'
          : 'opacity-0 translate-y-full border-transparent pointer-events-none'
      }`}
    >
      <div className="flex items-center h-full px-4 gap-4">
        {/* REC dot */}
        <span className="rec-dot w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />

        {/* Label */}
        <span className="font-vhs text-[8px] text-primary/40 tracking-[0.4em] flex-shrink-0 hidden sm:block">
          NOW PLAYING
        </span>

        {/* Divider */}
        <span className="text-white/10 hidden sm:block">|</span>

        {/* Track name */}
        <span className="font-vhs text-[10px] text-white/55 truncate flex-1 min-w-0">
          {activeTrack?.trackTitle ?? ''}
        </span>

        {/* Frequency bars */}
        <div ref={barsRef} className="flex items-end gap-px h-5 flex-shrink-0">
          {[...Array(24)].map((_, i) => (
            <div
              key={i}
              className="w-[3px] rounded-t"
              style={{
                height: '40%',
                background:
                  i < 14
                    ? 'rgba(0,255,204,0.55)'
                    : i < 19
                    ? 'rgba(255,204,0,0.55)'
                    : 'rgba(255,0,60,0.55)',
              }}
            />
          ))}
        </div>

        {/* BPM */}
        {activeTrack && (
          <span className="font-vhs text-[8px] text-white/15 tracking-widest flex-shrink-0 hidden sm:block">
            {activeTrack.bpm} BPM
          </span>
        )}
      </div>
    </div>
  )
}

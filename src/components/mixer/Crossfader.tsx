import { useAudioStore } from '../../stores/audioStore'

export default function Crossfader() {
  const crossfader = useAudioStore((s) => s.crossfader)
  const setCrossfader = useAudioStore((s) => s.setCrossfader)
  const deckAPlaying = useAudioStore((s) => s.deckA.isPlaying)
  const deckBPlaying = useAudioStore((s) => s.deckB.isPlaying)

  const leftPct = (1 - crossfader) * 100
  const rightPct = crossfader * 100

  return (
    <div className="w-full">
      {/* Labels row */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: '#00ffcc',
              opacity: 0.2 + (1 - crossfader) * 0.8,
              boxShadow: deckAPlaying ? `0 0 8px #00ffcc` : 'none',
            }} />
          <span className="font-vhs text-[11px] tracking-[0.3em]"
            style={{ color: `rgba(0,255,204,${0.2 + (1 - crossfader) * 0.6})` }}>A</span>
        </div>

        <div className="text-center">
          <span className="font-vhs text-[9px] text-white/10 tracking-[0.35em]">CROSSFADER</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-vhs text-[11px] tracking-[0.3em]"
            style={{ color: `rgba(255,0,60,${0.2 + crossfader * 0.6})` }}>B</span>
          <div className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: '#ff003c',
              opacity: 0.2 + crossfader * 0.8,
              boxShadow: deckBPlaying ? `0 0 8px #ff003c` : 'none',
            }} />
        </div>
      </div>

      {/* Fader track */}
      <div className="relative h-10 flex items-center">
        {/* Track bg */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-2 rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.04)' }}>
          {/* Left fill — cyan */}
          <div className="absolute inset-y-0 left-0 transition-all duration-75"
            style={{
              width: `${leftPct}%`,
              background: 'linear-gradient(to right, rgba(0,255,204,0.5), rgba(0,255,204,0.2))',
            }} />
          {/* Right fill — red */}
          <div className="absolute inset-y-0 right-0 transition-all duration-75"
            style={{
              width: `${rightPct}%`,
              background: 'linear-gradient(to left, rgba(255,0,60,0.5), rgba(255,0,60,0.2))',
            }} />
        </div>

        {/* Center mark */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-6 bg-white/10 pointer-events-none" />

        {/* Range input */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={crossfader}
          onChange={(e) => setCrossfader(Number(e.target.value))}
          className="relative z-10 w-full h-10 appearance-none cursor-pointer bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-8 [&::-webkit-slider-thumb]:h-8
            [&::-webkit-slider-thumb]:rounded-lg
            [&::-webkit-slider-thumb]:bg-white
            [&::-webkit-slider-thumb]:shadow-[0_2px_12px_rgba(0,0,0,0.8),0_0_20px_rgba(255,255,255,0.15)]
            [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/30
            [&::-webkit-slider-thumb]:hover:shadow-[0_2px_16px_rgba(0,0,0,0.9),0_0_30px_rgba(255,255,255,0.25)]
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing
            [&::-webkit-slider-thumb]:active:scale-95"
        />
      </div>

      {/* Level meters */}
      <div className="flex justify-between px-1 mt-2">
        <div className="flex gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1.5 h-1 rounded-sm transition-all duration-75"
              style={{
                background: i < Math.round((1 - crossfader) * 8)
                  ? `rgba(0,255,204,${0.4 + i * 0.07})`
                  : 'rgba(255,255,255,0.04)',
              }} />
          ))}
        </div>
        <div className="flex gap-0.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="w-1.5 h-1 rounded-sm transition-all duration-75"
              style={{
                background: i < Math.round(crossfader * 8)
                  ? `rgba(255,0,60,${0.4 + i * 0.07})`
                  : 'rgba(255,255,255,0.04)',
              }} />
          ))}
        </div>
      </div>
    </div>
  )
}

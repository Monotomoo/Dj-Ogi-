import { useAudioStore } from '../../stores/audioStore'

export default function Crossfader() {
  const crossfader = useAudioStore((s) => s.crossfader)
  const setCrossfader = useAudioStore((s) => s.setCrossfader)

  // Visual indicator of position
  const leftOpacity = 1 - crossfader
  const rightOpacity = crossfader

  return (
    <div className="w-full">
      {/* Labels */}
      <div className="flex justify-between items-center mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-primary" style={{ opacity: leftOpacity * 0.8 + 0.2 }} />
          <span className="font-vhs text-[10px] text-primary/30 tracking-widest">A</span>
        </div>
        <span className="font-vhs text-[9px] text-white/10 tracking-[0.3em]">CROSSFADER // DRAG PAST CENTER TO SWITCH</span>
        <div className="flex items-center gap-1.5">
          <span className="font-vhs text-[10px] text-accent/30 tracking-widest">B</span>
          <div className="w-1.5 h-1.5 rounded-full bg-accent" style={{ opacity: rightOpacity * 0.8 + 0.2 }} />
        </div>
      </div>

      {/* Slider track */}
      <div className="relative h-8 flex items-center">
        {/* Background track */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full overflow-hidden bg-white/[0.04]">
          {/* Gradient fill showing position */}
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-accent/30"
            style={{ width: '100%' }}
          />
        </div>

        {/* Center mark */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-px h-5 bg-white/10" />

        {/* Slider */}
        <input
          type="range"
          min={0}
          max={1}
          step={0.005}
          value={crossfader}
          onChange={(e) => setCrossfader(Number(e.target.value))}
          className="relative z-10 w-full h-8 appearance-none cursor-pointer bg-transparent
            [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-10 [&::-webkit-slider-thumb]:h-6
            [&::-webkit-slider-thumb]:rounded-md
            [&::-webkit-slider-thumb]:bg-gradient-to-b [&::-webkit-slider-thumb]:from-white/70 [&::-webkit-slider-thumb]:to-white/40
            [&::-webkit-slider-thumb]:border [&::-webkit-slider-thumb]:border-white/20
            [&::-webkit-slider-thumb]:shadow-[0_2px_8px_rgba(0,0,0,0.5),0_0_12px_rgba(255,255,255,0.1)]
            [&::-webkit-slider-thumb]:hover:from-white/80 [&::-webkit-slider-thumb]:hover:to-white/50
            [&::-webkit-slider-thumb]:transition-all
            [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:active:cursor-grabbing"
        />
      </div>
    </div>
  )
}

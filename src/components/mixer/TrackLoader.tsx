import { essentialTracks } from '../../data/tracks'
import type { DeckId } from '../../lib/audio/soundcloudManager'

interface TrackLoaderProps {
  deckId: DeckId
  onSelect: (trackId: number) => void
}

export default function TrackLoader({ deckId, onSelect }: TrackLoaderProps) {
  const isA = deckId === 'A'
  const accentColor = isA ? 'rgba(0,255,204,0.15)' : 'rgba(255,0,60,0.15)'
  const borderColor = isA ? 'border-primary/20' : 'border-accent/20'
  const focusRing = isA ? 'focus:ring-primary/30' : 'focus:ring-accent/30'

  return (
    <div className="relative">
      <select
        onChange={(e) => onSelect(Number(e.target.value))}
        className={`w-full bg-black/60 border ${borderColor} rounded-md px-3 py-2
          font-vhs text-[11px] text-white/60 appearance-none cursor-pointer
          outline-none transition-all ring-0 ${focusRing} focus:ring-1`}
        style={{ backgroundImage: `linear-gradient(135deg, transparent 0%, ${accentColor} 100%)` }}
        defaultValue=""
      >
        <option value="" disabled>
          SELECT TRACK...
        </option>
        {essentialTracks.map((track) => (
          <option key={track.id} value={track.id}>
            {track.title.toUpperCase()} // {track.bpm}BPM // {track.label.toUpperCase()}
          </option>
        ))}
      </select>
      {/* Dropdown arrow */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-3 h-3 text-white/20" fill="currentColor" viewBox="0 0 12 12">
          <path d="M6 8L1 3h10L6 8z" />
        </svg>
      </div>
    </div>
  )
}

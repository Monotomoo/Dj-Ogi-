import { useState, useRef } from 'react'
import type { TrackData } from '../../data/tracks'
import GenerativeCanvas from './GenerativeCanvas'
import { scManager } from '../../lib/audio/soundcloudManager'
import { useAudioStore } from '../../stores/audioStore'

interface TrackCardProps {
  track: TrackData
  compact?: boolean
}

export default function TrackCard({ track, compact = false }: TrackCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [flashDeck, setFlashDeck] = useState<'A' | 'B' | null>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const loadToDeck = (deckId: 'A' | 'B') => {
    const updateDeck = deckId === 'A'
      ? useAudioStore.getState().updateDeckA
      : useAudioStore.getState().updateDeckB

    scManager.loadTrack(deckId, track.soundcloudUrl)
    updateDeck({
      bpm: track.bpm, trackUrl: track.soundcloudUrl,
      trackTitle: track.title, trackArtist: track.artist,
      isPlaying: false, position: 0, positionMs: 0,
    })

    // Flash effect on load
    setFlashDeck(deckId)
    setTimeout(() => setFlashDeck(null), 600)
  }

  if (compact) {
    return (
      <div
        ref={cardRef}
        className="group relative cursor-pointer border-r border-b border-white/[0.03] last:border-r-0 overflow-hidden"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Art */}
        <div className="relative aspect-square overflow-hidden">
          {/* Canvas — full brightness always, pop even more on hover */}
          <div
            className="w-full h-full transition-all duration-500"
            style={{
              filter: isHovered
                ? 'brightness(1.5) saturate(1.8) contrast(1.1)'
                : 'brightness(1) saturate(1)',
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
          >
            <GenerativeCanvas track={track} size={200} />
          </div>

          {/* Glowing border on hover — color matches art pattern */}
          <div
            className="absolute inset-0 pointer-events-none transition-all duration-400"
            style={{
              boxShadow: isHovered
                ? 'inset 0 0 0 1.5px rgba(0,255,204,0.5), inset 0 0 20px rgba(0,255,204,0.12)'
                : 'none',
            }}
          />

          {/* RGB split shimmer on hover */}
          {isHovered && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(0,255,204,0.05) 0%, transparent 40%, rgba(255,0,60,0.05) 100%)',
                animation: 'cardShimmer 1.5s ease-in-out infinite',
              }}
            />
          )}

          {/* Deck flash overlay when loaded */}
          {flashDeck && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: flashDeck === 'A'
                  ? 'rgba(0,255,204,0.35)'
                  : 'rgba(255,0,60,0.35)',
                animation: 'deckFlash 0.6s ease-out forwards',
              }}
            />
          )}

          {/* A/B buttons — slide up from bottom on hover, no dark overlay */}
          <div
            className="absolute bottom-0 left-0 right-0 flex transition-all duration-300"
            style={{
              transform: isHovered ? 'translateY(0)' : 'translateY(100%)',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <button
              onClick={(e) => { e.stopPropagation(); loadToDeck('A') }}
              className="flex-1 py-1.5 font-vhs text-[9px] tracking-widest transition-all
                text-black bg-primary/90 hover:bg-primary"
            >
              A
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); loadToDeck('B') }}
              className="flex-1 py-1.5 font-vhs text-[9px] tracking-widest transition-all
                text-white bg-accent/90 hover:bg-accent"
            >
              B
            </button>
          </div>

          {/* Track name — only visible on hover */}
          <div
            className="absolute top-0 inset-x-0 px-1.5 pt-1 pb-4 transition-all duration-300"
            style={{
              background: isHovered
                ? 'linear-gradient(180deg, rgba(0,0,0,0.65) 0%, transparent 100%)'
                : 'transparent',
              opacity: isHovered ? 1 : 0,
            }}
          >
            <div className="font-vhs text-[7px] text-white truncate leading-tight">
              {track.title.toUpperCase()}
            </div>
            <div className="font-vhs text-[6px] text-primary/70">
              {track.bpm}
            </div>
          </div>
        </div>

        <style>{`
          @keyframes cardShimmer {
            0%, 100% { opacity: 0.6; }
            50% { opacity: 1; }
          }
          @keyframes deckFlash {
            0% { opacity: 1; }
            100% { opacity: 0; }
          }
        `}</style>
      </div>
    )
  }

  return null
}

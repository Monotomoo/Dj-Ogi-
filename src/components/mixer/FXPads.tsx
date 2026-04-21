import { audioManager, type DeckId, type FXName } from '../../lib/audio/audioManager'
import { useAudioStore } from '../../stores/audioStore'

interface FXPadsProps {
  deckId: DeckId
}

interface PadDef {
  key: FXName
  label: string
  subtitle: string
  icon: string
}

const PADS: PadDef[] = [
  { key: 'echo',     label: 'ECHO',    subtitle: 'TAPE DELAY', icon: '◖◗' },
  { key: 'flanger',  label: 'FLNGR',   subtitle: 'SWOOSH',     icon: '∿∿' },
  { key: 'bitcrush', label: 'BITCR',   subtitle: 'LO-FI',      icon: '▓▒░' },
  { key: 'gate',     label: 'GATE',    subtitle: 'CHOP 1/8',   icon: '⎍⎍' },
]

export default function FXPads({ deckId }: FXPadsProps) {
  const deck = useAudioStore((s) => deckId === 'A' ? s.deckA : s.deckB)
  const updateDeck = useAudioStore((s) => deckId === 'A' ? s.updateDeckA : s.updateDeckB)

  const isA = deckId === 'A'
  const color = isA ? '#00ffcc' : '#ff003c'
  const colorRgb = isA ? '0,255,204' : '255,0,60'

  const stateMap: Record<FXName, boolean> = {
    echo: deck.fxEcho,
    flanger: deck.fxFlanger,
    bitcrush: deck.fxBitcrush,
    gate: deck.fxGate,
  }

  const toggleFX = (fx: FXName) => {
    const next = !stateMap[fx]
    audioManager.setFX(deckId, fx, next, deck.bpm || 128)
    if (fx === 'echo')     updateDeck({ fxEcho: next })
    if (fx === 'flanger')  updateDeck({ fxFlanger: next })
    if (fx === 'bitcrush') updateDeck({ fxBitcrush: next })
    if (fx === 'gate')     updateDeck({ fxGate: next })
  }

  return (
    <div className="rounded-lg p-2"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.04)' }}>
      <div className="font-vhs text-[7px] text-white/30 tracking-[0.3em] mb-1.5 px-0.5">FX PADS</div>
      <div className="grid grid-cols-4 gap-1">
        {PADS.map((pad) => {
          const isActive = stateMap[pad.key]
          return (
            <button
              key={pad.key}
              onClick={() => toggleFX(pad.key)}
              className="relative py-2 px-1 rounded transition-all duration-200 overflow-hidden group"
              style={{
                background: isActive
                  ? `linear-gradient(180deg, rgba(${colorRgb},0.22) 0%, rgba(${colorRgb},0.08) 100%)`
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isActive ? color + '80' : 'rgba(255,255,255,0.07)'}`,
                boxShadow: isActive
                  ? `0 0 12px rgba(${colorRgb},0.4), inset 0 0 8px rgba(${colorRgb},0.15)`
                  : 'none',
              }}
            >
              {/* Active LED pulse ring */}
              {isActive && (
                <div className="absolute inset-0 rounded pointer-events-none fx-pad-pulse"
                  style={{ boxShadow: `inset 0 0 0 1px ${color}` }} />
              )}

              {/* Scan lines on active */}
              {isActive && (
                <div className="absolute inset-0 pointer-events-none opacity-30"
                  style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.3) 2px, rgba(255,255,255,0.3) 3px)' }} />
              )}

              {/* Icon */}
              <div className="font-vhs text-xs leading-none mb-0.5"
                style={{
                  color: isActive ? color : 'rgba(255,255,255,0.25)',
                  textShadow: isActive ? `0 0 8px ${color}` : 'none',
                }}>
                {pad.icon}
              </div>

              {/* Label */}
              <div className="font-vhs text-[8px] tracking-widest"
                style={{ color: isActive ? '#fff' : 'rgba(255,255,255,0.45)' }}>
                {pad.label}
              </div>

              {/* Subtitle (only visible when active) */}
              <div className="font-vhs text-[6px] tracking-widest mt-0.5 transition-opacity"
                style={{
                  color: `rgba(${colorRgb},0.7)`,
                  opacity: isActive ? 1 : 0,
                }}>
                {pad.subtitle}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

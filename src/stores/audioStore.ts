import { create } from 'zustand'

export interface DeckState {
  trackUrl: string
  trackTitle: string
  trackArtist: string
  isPlaying: boolean
  position: number // 0-1
  positionMs: number
  duration: number // ms
  volume: number // 0-100
  bpm: number
  isLoaded: boolean
  isReady: boolean
  isLoading: boolean
  hasError: boolean

  // Batch 2 — Core sound shaping (all bipolar -1 to 1, 0 = neutral)
  eqHi: number
  eqMid: number
  eqLow: number
  filter: number    // bipolar: -1 low-pass, 0 bypass, +1 high-pass
  pitch: number     // bipolar: -1 = -8%, 0 = 0, +1 = +8%

  // Batch 3 — Transport tools
  hotCues: (number | null)[] // 4 slots, ms positions (null = unset)
  loopActive: boolean
  loopBars: number | null    // null = no loop, otherwise 0.5/1/2/4

  // Batch 4 — FX pads
  fxEcho: boolean
  fxFlanger: boolean
  fxBitcrush: boolean
  fxGate: boolean
}

const makeDefaultDeck = (): DeckState => ({
  trackUrl: '',
  trackTitle: '',
  trackArtist: '',
  isPlaying: false,
  position: 0,
  positionMs: 0,
  duration: 0,
  volume: 80,
  bpm: 140,
  isLoaded: false,
  isReady: false,
  isLoading: false,
  hasError: false,
  eqHi: 0,
  eqMid: 0,
  eqLow: 0,
  filter: 0,
  pitch: 0,
  hotCues: [null, null, null, null],
  loopActive: false,
  loopBars: null,
  fxEcho: false,
  fxFlanger: false,
  fxBitcrush: false,
  fxGate: false,
})

interface AudioStore {
  deckA: DeckState
  deckB: DeckState
  crossfader: number // 0 = full A, 0.5 = center, 1 = full B
  filterA: number // legacy; kept so old FilterKnob compiles. Not wired anywhere.
  filterB: number
  isAnyPlaying: boolean
  energy: number
  beatPhase: number

  // Actions
  updateDeckA: (partial: Partial<DeckState>) => void
  updateDeckB: (partial: Partial<DeckState>) => void
  setCrossfader: (value: number) => void
  setFilterA: (value: number) => void
  setFilterB: (value: number) => void
  setEnergy: (value: number) => void
  setBeatPhase: (value: number) => void
}

export const useAudioStore = create<AudioStore>((set) => ({
  deckA: makeDefaultDeck(),
  deckB: makeDefaultDeck(),
  crossfader: 0.5,
  filterA: 0.5,
  filterB: 0.5,
  isAnyPlaying: false,
  energy: 0,
  beatPhase: 0,

  updateDeckA: (partial) =>
    set((state) => {
      const deckA = { ...state.deckA, ...partial }
      return { deckA, isAnyPlaying: deckA.isPlaying || state.deckB.isPlaying }
    }),

  updateDeckB: (partial) =>
    set((state) => {
      const deckB = { ...state.deckB, ...partial }
      return { deckB, isAnyPlaying: state.deckA.isPlaying || deckB.isPlaying }
    }),

  setCrossfader: (value) => set({ crossfader: value }),
  setFilterA: (value) => set({ filterA: value }),
  setFilterB: (value) => set({ filterB: value }),
  setEnergy: (value) => set({ energy: value }),
  setBeatPhase: (value) => set({ beatPhase: value }),
}))

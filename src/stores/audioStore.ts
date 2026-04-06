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
}

const defaultDeck: DeckState = {
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
}

interface AudioStore {
  deckA: DeckState
  deckB: DeckState
  crossfader: number // 0 = full A, 0.5 = center, 1 = full B
  filterA: number // 0-1, 0.5 = neutral
  filterB: number // 0-1, 0.5 = neutral
  isAnyPlaying: boolean
  energy: number // 0-1 simulated energy
  beatPhase: number // 0-1 cycling with BPM

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
  deckA: { ...defaultDeck },
  deckB: { ...defaultDeck },
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

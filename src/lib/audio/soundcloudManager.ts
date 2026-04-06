// SoundCloud Widget API types
declare global {
  interface Window {
    SC?: {
      Widget?: {
        (el: HTMLIFrameElement): SCWidget
        Events: {
          READY: string
          PLAY: string
          PAUSE: string
          FINISH: string
          PLAY_PROGRESS: string
          SEEK: string
          ERROR: string
        }
      }
    }
  }
}

interface SCWidget {
  bind(event: string, callback: (...args: unknown[]) => void): void
  unbind(event: string): void
  load(url: string, options?: Record<string, unknown>): void
  play(): void
  pause(): void
  toggle(): void
  seekTo(ms: number): void
  setVolume(volume: number): void
  getVolume(callback: (volume: number) => void): void
  getPosition(callback: (position: number) => void): void
  getDuration(callback: (duration: number) => void): void
  getCurrentSound(callback: (sound: SCSound) => void): void
  isPaused(callback: (paused: boolean) => void): void
}

interface SCSound {
  title: string
  user: { username: string }
  duration: number
  artwork_url: string | null
  permalink_url: string
}

export type DeckId = 'A' | 'B'

interface DeckController {
  widget: SCWidget | null
  iframe: HTMLIFrameElement | null
  isReady: boolean
  pendingLoad: string | null
  pendingPlay: boolean
  isPlaying: boolean
}

type ProgressCallback = (data: { position: number; relativePosition: number }) => void
type StateCallback = (state: 'play' | 'pause' | 'finish' | 'ready' | 'loading' | 'error') => void
type TrackCallback = (track: { title: string; artist: string; duration: number }) => void

class SoundCloudManager {
  private decks: Record<DeckId, DeckController> = {
    A: { widget: null, iframe: null, isReady: false, pendingLoad: null, pendingPlay: false, isPlaying: false },
    B: { widget: null, iframe: null, isReady: false, pendingLoad: null, pendingPlay: false, isPlaying: false },
  }

  private progressCallbacks: Record<DeckId, ProgressCallback | null> = { A: null, B: null }
  private stateCallbacks: Record<DeckId, StateCallback | null> = { A: null, B: null }
  private trackCallbacks: Record<DeckId, TrackCallback | null> = { A: null, B: null }

  private injectSCScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      // Already loaded
      if (window.SC?.Widget) { resolve(); return }
      // Script already in DOM (static tag) — just wait
      const existing = document.querySelector('script[src*="soundcloud.com/player/api"]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://w.soundcloud.com/player/api.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('SC API blocked'))
        document.head.appendChild(script)
      } else {
        resolve()
      }
    })
  }

  private waitForSCApi(): Promise<void> {
    return new Promise((resolve, reject) => {
      const deadline = Date.now() + 12000 // 12s timeout
      const check = () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sc = (window as any).SC
        console.log(`[SC] poll — window.SC=${typeof sc} Widget=${typeof sc?.Widget}`)
        if (sc?.Widget) {
          resolve()
        } else if (Date.now() > deadline) {
          console.error('[SC] Timeout. window.SC =', sc)
          reject(new Error('SC API not available'))
        } else {
          setTimeout(check, 500)
        }
      }
      this.injectSCScript()
        .then(() => check())
        .catch((err) => {
          console.warn('[SC] Script inject failed:', err)
          check()
        })
    })
  }

  async initDeck(deckId: DeckId, iframe: HTMLIFrameElement) {
    console.log(`[SC ${deckId}] initDeck — iframe loaded:`, iframe.src?.slice(0, 60))
    try {
      await this.waitForSCApi()
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      console.log(`[SC ${deckId}] API ready. SC keys:`, Object.keys((window as any).SC ?? {}))
    } catch {
      console.warn(`[SC Widget ${deckId}] SoundCloud API unavailable`)
      this.stateCallbacks[deckId]?.('error')
      return
    }
    if (!window.SC?.Widget) return

    const widget = window.SC.Widget(iframe)
    const deck = this.decks[deckId]
    deck.widget = widget
    deck.iframe = iframe

    const Events = window.SC.Widget.Events

    const handleReady = () => {
      deck.isReady = true
      this.stateCallbacks[deckId]?.('ready')

      widget.getCurrentSound((sound: SCSound) => {
        if (sound) {
          this.trackCallbacks[deckId]?.({
            title: sound.title,
            artist: sound.user?.username || 'DJ Ogi',
            duration: sound.duration,
          })
        }
      })

      // Auto-play if queued
      if (deck.pendingPlay) {
        deck.pendingPlay = false
        setTimeout(() => widget.play(), 50)
      }

      // Process any pending load
      if (deck.pendingLoad) {
        const url = deck.pendingLoad
        deck.pendingLoad = null
        this.loadTrack(deckId, url)
      }
    }

    widget.bind(Events.READY, handleReady)

    widget.bind(Events.PLAY, () => {
      deck.isPlaying = true
      this.stateCallbacks[deckId]?.('play')
    })

    widget.bind(Events.PAUSE, () => {
      deck.isPlaying = false
      this.stateCallbacks[deckId]?.('pause')
    })

    widget.bind(Events.FINISH, () => {
      deck.isPlaying = false
      this.stateCallbacks[deckId]?.('finish')
    })

    widget.bind(Events.PLAY_PROGRESS, (data: unknown) => {
      const d = data as { currentPosition: number; relativePosition: number }
      this.progressCallbacks[deckId]?.({
        position: d.currentPosition,
        relativePosition: d.relativePosition,
      })
    })

    widget.bind(Events.ERROR, () => {
      console.warn(`[SC Widget ${deckId}] Error loading track`)
      this.stateCallbacks[deckId]?.('error')
    })

    // The READY event may have already fired before we bound the handler.
    // Probe the widget: if getDuration returns, it's already initialized.
    setTimeout(() => {
      if (!deck.isReady) {
        widget.getDuration((duration: number) => {
          if (!deck.isReady) {
            console.log(`[SC Widget ${deckId}] Detected already-ready widget, firing handleReady`)
            handleReady()
            // Also sync duration which handleReady's getCurrentSound may not catch
            if (duration > 0) {
              // duration is available from this callback — pass via store update
            }
          }
        })
      }
    }, 1000)
  }

  loadTrack(deckId: DeckId, url: string) {
    const deck = this.decks[deckId]

    if (!deck.widget || !deck.isReady) {
      deck.pendingLoad = url
      this.stateCallbacks[deckId]?.('loading')
      return
    }

    const wasPlaying = deck.isPlaying
    deck.isReady = false
    deck.isPlaying = false
    deck.pendingPlay = wasPlaying
    this.stateCallbacks[deckId]?.('loading')

    deck.widget.load(url, {
      auto_play: false,
      show_artwork: false,
      show_comments: false,
      show_playcount: false,
      show_user: false,
      hide_related: true,
      visual: false,
    })
  }

  play(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.widget) return
    if (deck.isReady) {
      deck.widget.play()
    } else {
      // Queue play for when READY fires
      deck.pendingPlay = true
    }
  }

  pause(deckId: DeckId) {
    const deck = this.decks[deckId]
    deck.pendingPlay = false
    if (deck.widget && deck.isReady) {
      deck.widget.pause()
    }
  }

  toggle(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.widget) return
    if (deck.isReady) {
      deck.widget.toggle()
    } else {
      // Toggle pending play state
      deck.pendingPlay = !deck.pendingPlay
    }
  }

  setVolume(deckId: DeckId, volume: number) {
    const deck = this.decks[deckId]
    if (deck.widget) {
      deck.widget.setVolume(Math.max(0, Math.min(100, volume)))
    }
  }

  seekTo(deckId: DeckId, ms: number) {
    const deck = this.decks[deckId]
    if (deck.widget && deck.isReady) {
      deck.widget.seekTo(ms)
    }
  }

  retryInit(deckId: DeckId) {
    const deck = this.decks[deckId]
    if (!deck.iframe) return
    deck.isReady = false
    deck.pendingPlay = false
    this.stateCallbacks[deckId]?.('loading')
    this.initDeck(deckId, deck.iframe)
  }

  onProgress(deckId: DeckId, callback: ProgressCallback) {
    this.progressCallbacks[deckId] = callback
  }

  onStateChange(deckId: DeckId, callback: StateCallback) {
    this.stateCallbacks[deckId] = callback
  }

  onTrackLoaded(deckId: DeckId, callback: TrackCallback) {
    this.trackCallbacks[deckId] = callback
  }
}

// Singleton
export const scManager = new SoundCloudManager()

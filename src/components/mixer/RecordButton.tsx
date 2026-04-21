import { useEffect, useRef, useState } from 'react'
import { audioManager } from '../../lib/audio/audioManager'

const MAX_DURATION_SEC = 60

type Mode = 'audio' | 'video'

/**
 * REC button + auto-display of the finished clip.
 * Two modes:
 *   - AUDIO: small .webm audio file (best quality, fast)
 *   - VIDEO (IG): 720x1280 vertical video with branded waveform + audio, perfect for Instagram Reels/Stories
 */
export default function RecordButton() {
  const [isRecording, setIsRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [blob, setBlob] = useState<Blob | null>(null)
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [mode, setMode] = useState<Mode>('audio')
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    audioManager.onRecordingEvent({
      onStart: () => {
        setIsRecording(true)
        setDuration(0)
        setBlob(null)
        if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
        blobUrlRef.current = null
        setBlobUrl(null)
      },
      onTick: (d) => setDuration(d),
      onStop: (b, d) => {
        setIsRecording(false)
        setBlob(b)
        setDuration(d)
        const url = URL.createObjectURL(b)
        blobUrlRef.current = url
        setBlobUrl(url)
      },
    })
    return () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    }
  }, [])

  const startRecording = (recordMode: Mode) => {
    setMode(recordMode)
    audioManager.startRecording(recordMode, MAX_DURATION_SEC)
  }

  const stopRecording = () => audioManager.stopRecording()

  const fileExt = () => {
    const bt = blob?.type || ''
    if (bt.includes('mp4')) return 'mp4'
    return 'webm'
  }

  const filename = () => {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-')
    const kind = mode === 'video' ? 'reel' : 'mix'
    return `dj-ogi-${kind}-${stamp}.${fileExt()}`
  }

  const handleDownload = () => {
    if (!blobUrl) return
    const a = document.createElement('a')
    a.href = blobUrl
    a.download = filename()
    a.click()
  }

  const handleShareIG = async () => {
    if (!blob) return
    const file = new File([blob], filename(), { type: blob.type })
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'DJ OGI Mix',
          text: 'My mix made on dj-ogi.com — upload as Reel or Story 🎛️',
        })
        return
      } catch {
        // user cancelled share — fall through to download
      }
    }
    // Fallback: download + show instructions
    handleDownload()
    alert('Mix downloaded! Open Instagram and upload as a Reel or Story.')
  }

  const handleDiscard = () => {
    if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current)
    blobUrlRef.current = null
    setBlob(null)
    setBlobUrl(null)
    setDuration(0)
  }

  const durationStr = `${Math.floor(duration / 60)}:${String(Math.floor(duration % 60)).padStart(2, '0')}`

  // ─── Render ───

  // If we have a finished recording, show the preview + share actions
  if (blob && !isRecording) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg flex-wrap"
        style={{
          background: 'rgba(0,255,204,0.06)',
          border: '1px solid rgba(0,255,204,0.25)',
        }}>
        <span className="font-vhs text-[9px] text-primary tracking-widest">
          {mode === 'video' ? '🎬 REEL' : '🎵 MIX'} · {durationStr}
        </span>
        {blobUrl && mode === 'audio' && (
          <audio src={blobUrl} controls className="h-6" style={{ width: 130 }} />
        )}
        {blobUrl && mode === 'video' && (
          <video src={blobUrl} controls className="h-12 rounded" style={{ width: 70 }} />
        )}
        <button onClick={handleShareIG}
          className="font-vhs text-[9px] px-2.5 py-1.5 tracking-widest rounded transition-all"
          style={{
            background: 'linear-gradient(135deg, #833AB4, #E1306C, #F56040)',
            color: '#fff',
            boxShadow: '0 0 10px rgba(225,48,108,0.4)',
          }}
          title="Share to Instagram (or download to upload as Reel/Story)">
          ↗ IG
        </button>
        <button onClick={handleDownload}
          className="font-vhs text-[9px] text-primary hover:text-white px-2 py-1 tracking-widest transition-colors"
          title={`Download ${fileExt().toUpperCase()}`}>
          ↓ DL
        </button>
        <button onClick={handleDiscard}
          className="font-vhs text-[9px] text-white/30 hover:text-white/60 px-2 py-1 tracking-widest transition-colors"
          title="Discard">
          ✕
        </button>
      </div>
    )
  }

  // While recording OR idle, show the two REC buttons
  return (
    <div className="flex items-center gap-2">
      {/* AUDIO mode button */}
      <button
        onClick={() => (isRecording ? stopRecording() : startRecording('audio'))}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
        disabled={isRecording && mode === 'video'}
        style={{
          background: isRecording && mode === 'audio'
            ? 'linear-gradient(180deg, rgba(255,0,60,0.3), rgba(255,0,60,0.12))'
            : 'rgba(255,0,60,0.08)',
          border: `1px solid ${isRecording && mode === 'audio' ? '#ff003c' : 'rgba(255,0,60,0.4)'}`,
          boxShadow: isRecording && mode === 'audio'
            ? '0 0 20px rgba(255,0,60,0.5), inset 0 0 12px rgba(255,0,60,0.2)'
            : 'none',
          color: isRecording && mode === 'audio' ? '#ff003c' : 'rgba(255,0,60,0.9)',
          opacity: isRecording && mode === 'video' ? 0.3 : 1,
        }}
        title="Record audio only (small file)"
      >
        <span className="w-1.5 h-1.5 rounded-full"
          style={{
            background: '#ff003c',
            boxShadow: isRecording && mode === 'audio' ? '0 0 8px #ff003c' : 'none',
            animation: isRecording && mode === 'audio' ? 'recBlink 0.8s ease-in-out infinite' : 'none',
          }} />
        <span className="font-vhs text-[9px] tracking-[0.25em] font-bold">
          {isRecording && mode === 'audio' ? 'STOP' : 'REC MIX'}
        </span>
        {isRecording && mode === 'audio' && (
          <span className="font-vhs text-[9px] tabular-nums" style={{ color: '#fff' }}>
            {durationStr}
          </span>
        )}
      </button>

      {/* INSTAGRAM (video) button */}
      <button
        onClick={() => (isRecording ? stopRecording() : startRecording('video'))}
        className="flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all duration-200"
        disabled={isRecording && mode === 'audio'}
        style={{
          background: isRecording && mode === 'video'
            ? 'linear-gradient(135deg, #833AB4, #E1306C, #F56040)'
            : 'linear-gradient(135deg, rgba(131,58,180,0.15), rgba(225,48,108,0.15), rgba(245,96,64,0.15))',
          border: `1px solid ${isRecording && mode === 'video' ? '#E1306C' : 'rgba(225,48,108,0.5)'}`,
          boxShadow: isRecording && mode === 'video'
            ? '0 0 22px rgba(225,48,108,0.6)'
            : 'none',
          color: isRecording && mode === 'video' ? '#fff' : 'rgba(225,48,108,1)',
          opacity: isRecording && mode === 'audio' ? 0.3 : 1,
        }}
        title="Record vertical video (720x1280) ready for Instagram Reels & Stories"
      >
        <span className="w-1.5 h-1.5 rounded-full"
          style={{
            background: isRecording && mode === 'video' ? '#fff' : '#E1306C',
            boxShadow: isRecording && mode === 'video' ? '0 0 8px #fff' : 'none',
            animation: isRecording && mode === 'video' ? 'recBlink 0.8s ease-in-out infinite' : 'none',
          }} />
        <span className="font-vhs text-[9px] tracking-[0.25em] font-bold">
          {isRecording && mode === 'video' ? `STOP ${durationStr}` : 'REC IG'}
        </span>
      </button>
    </div>
  )
}

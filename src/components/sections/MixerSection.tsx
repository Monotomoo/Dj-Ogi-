import DJMixer from '../mixer/DJMixer'
import { essentialTracks } from '../../data/tracks'
import TrackCard from '../tracks/TrackCard'

export default function MixerSection() {
  const topTracks = essentialTracks.slice(0, 10)
  const bottomTracks = essentialTracks.slice(10, 20)

  return (
    <section id="mixer" className="pt-12 pb-6 bg-[#060606]">
      {/* Mixer intro */}
      <div className="text-center mb-10 px-4">
        <div className="font-vhs text-[9px] text-primary/30 tracking-[0.5em] mb-4">// SELECT & MIX</div>
        <h2 className="font-vhs text-3xl md:text-5xl text-white tracking-wider mb-5 rgb-split">
          TAKE THE DECKS
        </h2>
        <p className="text-white/30 text-sm md:text-base leading-relaxed max-w-3xl mx-auto">
          For 30 years this has been Ogi's booth. Right now it's yours. Load any of his tracks into both decks, ride the crossfader, and make the crowd go wild — if you can.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-primary/20" />
          <span className="font-vhs text-[9px] text-primary/25 tracking-[0.4em]">HOVER A TRACK · PRESS A OR B · HIT PLAY</span>
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-primary/20" />
        </div>
      </div>

      {/* Top tracks - full width grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-0 mb-4">
        {topTracks.map((track) => (
          <TrackCard key={track.id} track={track} compact />
        ))}
      </div>

      {/* Mixer */}
      <div className="px-3 md:px-6 lg:px-10">
        <DJMixer />
      </div>

      {/* Bottom tracks - full width grid */}
      <div className="grid grid-cols-5 md:grid-cols-10 gap-0 mt-4">
        {bottomTracks.map((track) => (
          <TrackCard key={track.id} track={track} compact />
        ))}
      </div>
    </section>
  )
}

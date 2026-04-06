import { essentialTracks } from '../../data/tracks'
import TrackCard from '../tracks/TrackCard'

export default function TracksSection() {
  return (
    <section
      id="tracks"
      className="section px-4 md:px-8 py-20 bg-black"
    >
      <div className="max-w-6xl mx-auto">
        <div className="font-vhs text-xs text-primary/60 tracking-[0.5em] mb-2 text-center">
          // 20 ESSENTIAL TRACKS
        </div>
        <h2 className="font-vhs text-3xl md:text-4xl text-white text-center mb-12 rgb-split">
          THE ARCHIVE
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {essentialTracks.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      </div>
    </section>
  )
}

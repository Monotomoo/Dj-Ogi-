const ITEMS = [
  'LOVE PARADE BERLIN',
  'APHEX TWIN PLAYED HIS TRACKS',
  'SINCE 1994',
  'RIJEKA, CROATIA',
  '300+ TRACKS RELEASED',
  'TECHNODROME RECORDS',
  'BEAST MUSIC RECORDS',
  'DARK NOISE',
  'TECHNO FACTORY',
  'NOISY ROOM',
  'HARD TECHNO PIONEER',
  'FOUNDER · RIJEKA TECHNO SCENE',
]

export default function PressMarquee() {
  return (
    <div className="overflow-hidden bg-black border-y border-white/[0.03] py-2.5 select-none">
      <div className="flex whitespace-nowrap animate-marquee">
        {[...ITEMS, ...ITEMS].map((item, i) => (
          <span key={i} className="font-vhs text-[9px] tracking-[0.3em] text-white/15 mx-6 flex-shrink-0">
            {item}
            <span className="text-primary/20 ml-6">·</span>
          </span>
        ))}
      </div>
    </div>
  )
}

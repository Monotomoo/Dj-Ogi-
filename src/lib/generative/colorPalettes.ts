export interface Palette {
  name: string
  colors: string[]
  bg: string
}

export const palettes: Palette[] = [
  {
    name: 'acid',
    colors: ['#00ffcc', '#00cc99', '#009966', '#33ffdd', '#66ffee'],
    bg: '#050a08',
  },
  {
    name: 'fire',
    colors: ['#ff003c', '#ff3366', '#cc0033', '#ff6680', '#990022'],
    bg: '#0a0505',
  },
  {
    name: 'electric',
    colors: ['#6633ff', '#9966ff', '#cc99ff', '#3300cc', '#4400ee'],
    bg: '#060508',
  },
  {
    name: 'rust',
    colors: ['#ff6600', '#cc5500', '#ff8833', '#994400', '#ffaa55'],
    bg: '#0a0805',
  },
  {
    name: 'cold',
    colors: ['#0066ff', '#0099ff', '#00ccff', '#3388ff', '#0044cc'],
    bg: '#050508',
  },
  {
    name: 'industrial',
    colors: ['#888888', '#aaaaaa', '#666666', '#cccccc', '#444444'],
    bg: '#080808',
  },
  {
    name: 'toxic',
    colors: ['#ccff00', '#99cc00', '#66ff33', '#aaee00', '#ddff33'],
    bg: '#080a05',
  },
  {
    name: 'blood',
    colors: ['#cc0000', '#ff0000', '#990000', '#ff3333', '#660000'],
    bg: '#0a0404',
  },
]

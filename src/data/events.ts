export interface EventData {
  date: string
  month: string
  day: string
  year: string
  venue: string
  city: string
  country: string
  ticketUrl?: string
  status?: 'on-sale' | 'sold-out' | 'free'
  lineup?: string
}

export const upcomingEvents: EventData[] = [
  {
    date: '25 APR 2026',
    day: '25',
    month: 'APR',
    year: '2026',
    venue: 'Klub Crkva',
    city: 'Rijeka',
    country: 'Croatia',
    ticketUrl: 'https://core-event.co/events/retro-techno-all-night-with-dj-ogi-719a/',
    status: 'on-sale',
    lineup: 'RETRO TECHNO',
  },
  {
    date: '02 MAY 2026',
    day: '02',
    month: 'MAY',
    year: '2026',
    venue: 'Tresor Berlin meets Pitchblack',
    city: 'Rujno',
    country: 'Bosnia and Herzegovina',
    ticketUrl: '#',
    status: 'on-sale',
    lineup: 'DJ OGI LIVE',
  },
  {
    date: '08 MAY 2026',
    day: '08',
    month: 'MAY',
    year: '2026',
    venue: 'Lazareti',
    city: 'Dubrovnik',
    country: 'Croatia',
    ticketUrl: '#',
    status: 'on-sale',
    lineup: 'DJ OGI LIVE',
  },
]

export const pastHighlights: EventData[] = [
  { date: '2003', day: '2003', month: '', year: '2003', venue: 'Love Parade', city: 'Berlin', country: 'Germany' },
  { date: '2007', day: '2007', month: '', year: '2007', venue: 'Dance Valley', city: 'Spaarnwoude', country: 'Netherlands' },
  { date: '2006', day: '2006', month: '', year: '2006', venue: 'Apokalypsa', city: 'Brno', country: 'Czech Republic' },
  { date: '2008', day: '2008', month: '', year: '2008', venue: 'Fabric', city: 'London', country: 'UK' },
  { date: '2010', day: '2010', month: '', year: '2010', venue: 'Lov.e', city: 'São Paulo', country: 'Brazil' },
  { date: '2012', day: '2012', month: '', year: '2012', venue: 'Techsound Festival', city: 'Bogotá', country: 'Colombia' },
  { date: '2014', day: '2014', month: '', year: '2014', venue: 'Montagood', city: 'Lleida', country: 'Spain' },
  { date: '2016', day: '2016', month: '', year: '2016', venue: 'Liberty White', city: 'Oostende', country: 'Belgium' },
  { date: '2018', day: '2018', month: '', year: '2018', venue: 'ECO Festival', city: 'Nova Gorica', country: 'Slovenia' },
]

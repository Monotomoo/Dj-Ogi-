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
    date: '17 MAY 2026',
    day: '17',
    month: 'MAY',
    year: '2026',
    venue: 'Klub Hartera',
    city: 'Rijeka',
    country: 'Croatia',
    ticketUrl: '#',
    status: 'on-sale',
    lineup: 'DJ OGI // TECHNODROME NIGHT',
  },
  {
    date: '06 JUN 2026',
    day: '06',
    month: 'JUN',
    year: '2026',
    venue: 'Tresor',
    city: 'Berlin',
    country: 'Germany',
    ticketUrl: '#',
    status: 'on-sale',
    lineup: 'DJ OGI // BEAST MUSIC RECORDS SHOWCASE',
  },
  {
    date: '11 JUL 2026',
    day: '11',
    month: 'JUL',
    year: '2026',
    venue: 'Exit Festival',
    city: 'Novi Sad',
    country: 'Serbia',
    ticketUrl: '#',
    status: 'sold-out',
    lineup: 'DJ OGI B2B SPECIAL GUEST // DARK NOISE STAGE',
  },
  {
    date: '23 AUG 2026',
    day: '23',
    month: 'AUG',
    year: '2026',
    venue: 'Fabric',
    city: 'London',
    country: 'UK',
    ticketUrl: '#',
    status: 'on-sale',
    lineup: 'DJ OGI // TECHNO FACTORY LABEL NIGHT',
  },
]

export const pastHighlights: EventData[] = [
  { date: '2002', day: '2002', month: '', year: '2002', venue: 'Love Parade', city: 'Berlin', country: 'Germany' },
  { date: '2004', day: '2004', month: '', year: '2004', venue: 'Dance Valley', city: 'Spaarnwoude', country: 'Netherlands' },
  { date: '2006', day: '2006', month: '', year: '2006', venue: 'Apokalypsa', city: 'Brno', country: 'Czech Republic' },
  { date: '2008', day: '2008', month: '', year: '2008', venue: 'Fabric', city: 'London', country: 'UK' },
  { date: '2010', day: '2010', month: '', year: '2010', venue: 'Lov.e', city: 'São Paulo', country: 'Brazil' },
  { date: '2012', day: '2012', month: '', year: '2012', venue: 'Techsound Festival', city: 'Bogotá', country: 'Colombia' },
  { date: '2014', day: '2014', month: '', year: '2014', venue: 'Montagood', city: 'Lleida', country: 'Spain' },
  { date: '2016', day: '2016', month: '', year: '2016', venue: 'Liberty White', city: 'Oostende', country: 'Belgium' },
  { date: '2018', day: '2018', month: '', year: '2018', venue: 'ECO Festival', city: 'Nova Gorica', country: 'Slovenia' },
  { date: '2020', day: '2020', month: '', year: '2020', venue: 'Dom Im Berg', city: 'Graz', country: 'Austria' },
  { date: '2022', day: '2022', month: '', year: '2022', venue: 'Berghain Kantine', city: 'Berlin', country: 'Germany' },
  { date: '2024', day: '2024', month: '', year: '2024', venue: 'Tresor', city: 'Berlin', country: 'Germany' },
]

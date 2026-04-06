export interface EventData {
  date: string
  venue: string
  city: string
  country: string
  ticketUrl?: string
}

export const upcomingEvents: EventData[] = [
  // Placeholder events - replace with real data
]

export const pastHighlights: EventData[] = [
  { date: '2002', venue: 'Love Parade', city: 'Berlin', country: 'Germany' },
  { date: '2004', venue: 'Dance Valley', city: 'Spaarnwoude', country: 'Netherlands' },
  { date: '2006', venue: 'Apokalypsa', city: 'Brno', country: 'Czech Republic' },
  { date: '2008', venue: 'Factory', city: 'London', country: 'UK' },
  { date: '2010', venue: 'Lov.e', city: 'Sao Paulo', country: 'Brazil' },
  { date: '2012', venue: 'Techsound Festival', city: 'Bogota', country: 'Colombia' },
  { date: '2014', venue: 'Montagood', city: 'Lleida', country: 'Spain' },
  { date: '2016', venue: 'Liberty White', city: 'Oostende', country: 'Belgium' },
  { date: '2018', venue: 'ECO Festival', city: 'Nova Gorica', country: 'Slovenia' },
  { date: '2020', venue: 'Dom Im Berg', city: 'Graz', country: 'Austria' },
]

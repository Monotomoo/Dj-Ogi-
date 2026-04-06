export interface SocialLink {
  name: string
  url: string
  icon: string
}

export const socialLinks: SocialLink[] = [
  { name: 'SoundCloud', url: 'https://soundcloud.com/dj-ogi', icon: 'soundcloud' },
  { name: 'Discogs', url: 'https://www.discogs.com/artist/196808-DJ-Ogi', icon: 'discogs' },
  { name: 'Resident Advisor', url: 'https://ra.co/dj/djogi', icon: 'ra' },
  { name: 'Beatport', url: 'https://www.beatport.com/artist/dj-ogi/29943', icon: 'beatport' },
  { name: 'Bandcamp', url: 'https://djogi.bandcamp.com', icon: 'bandcamp' },
]

export interface LabelLink {
  name: string
  url: string
}

export const labelLinks: LabelLink[] = [
  { name: 'Technodrome', url: '#' },
  { name: 'Techno Factory', url: '#' },
  { name: 'Dark Noise', url: '#' },
  { name: 'Beast Music Records', url: '#' },
  { name: 'Noisy Room', url: '#' },
]

export const bookingEmail = 'booking@djogi.com'

// The two voices of the brand, shared by the site and the docs. Serif is the human
// voice and mono is the machine's. Nothing on either surface is set in a sans.
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'

export const human = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
})

export const machine = IBM_Plex_Mono({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
})

/** Class names that define both font variables on an element. */
export const fontVariables = `${human.variable} ${machine.variable}`

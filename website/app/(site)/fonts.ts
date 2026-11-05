// The landing page's fonts. The page sets its serif at one weight and never uses italic
// mono, so it loads less than the docs do, which is most of what its first paint waits
// for. Keep this in its own file: next/font loads whatever a module declares.
import { IBM_Plex_Mono } from 'next/font/google'
import localFont from 'next/font/local'

/**
 * Newsreader at weight 400, with the optical size axis kept so large text still gets
 * its display cut. See fonts/README.md for how these files were made.
 */
const human = localFont({
  src: [
    { path: './fonts/newsreader-regular.woff2', weight: '400', style: 'normal' },
    { path: './fonts/newsreader-italic.woff2', weight: '400', style: 'italic' },
  ],
  variable: '--font-newsreader',
})

const machine = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
})

/** Class names that define both font variables on an element. */
export const landingFontVariables = `${human.variable} ${machine.variable}`

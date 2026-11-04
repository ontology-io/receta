import type { Metadata } from 'next'
import { IBM_Plex_Mono, Newsreader } from 'next/font/google'
import type { ReactNode } from 'react'
import { metaContent } from '@/content/home.content'
import './globals.css'

const human = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
})

const machine = IBM_Plex_Mono({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-mono',
})

/**
 * Runs before first paint, so pinned scenes get their scroll room before the layout
 * settles. No JavaScript, or a reader who prefers less motion, means no attribute: the
 * page then shows its rest frames with nothing pinned.
 */
const ENABLE_MOTION = `matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.setAttribute('data-motion','')`

export const metadata: Metadata = {
  metadataBase: new URL('https://receta.dev'),
  title: metaContent.title,
  description: metaContent.description,
  openGraph: { title: metaContent.title, description: metaContent.description, type: 'website' },
}

type RootLayoutProps = { readonly children: ReactNode }

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning className={`${human.variable} ${machine.variable}`}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: ENABLE_MOTION }} />
    </head>
    <body>{children}</body>
  </html>
)

export default RootLayout

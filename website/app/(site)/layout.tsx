import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { fontVariables } from '../fonts'
import { metaContent, SITE_URL } from '@/content/home.content'
import './globals.css'

/**
 * Runs before first paint, so pinned scenes get their scroll room before the layout
 * settles. No JavaScript, or a reader who prefers less motion, means no attribute: the
 * page then shows its rest frames with nothing pinned.
 */
const ENABLE_MOTION = `matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.setAttribute('data-motion','')`

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: metaContent.title,
  description: metaContent.description,
  openGraph: { title: metaContent.title, description: metaContent.description, type: 'website' },
}

type RootLayoutProps = { readonly children: ReactNode }

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning className={fontVariables}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: ENABLE_MOTION }} />
    </head>
    <body>{children}</body>
  </html>
)

export default RootLayout

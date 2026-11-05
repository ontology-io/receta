import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { landingFontVariables } from './fonts'
import { metaContent, SITE_URL } from '@/content/home.content'
import './globals.css'

/**
 * Runs before first paint, so pinned scenes get their scroll room before the layout
 * settles. No JavaScript, or a reader who prefers less motion, means no attribute: the
 * page then shows its rest frames with nothing pinned.
 */
const ENABLE_MOTION = `matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.setAttribute('data-motion','')`

const { title, description, image, siteName, themeColor } = metaContent

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title,
  description,
  alternates: { canonical: '/' },
  openGraph: { title, description, type: 'website', url: '/', siteName, locale: 'en_US', images: [image] },
  twitter: { card: 'summary_large_image', title, description, images: [image.url] },
}

export const viewport: Viewport = { themeColor }

type RootLayoutProps = { readonly children: ReactNode }

const RootLayout = ({ children }: RootLayoutProps) => (
  <html lang="en" suppressHydrationWarning className={landingFontVariables}>
    <head>
      <script dangerouslySetInnerHTML={{ __html: ENABLE_MOTION }} />
    </head>
    <body>{children}</body>
  </html>
)

export default RootLayout

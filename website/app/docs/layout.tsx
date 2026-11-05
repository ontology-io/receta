import { DocsLayout } from 'fumadocs-ui/layouts/docs'
import { RootProvider } from 'fumadocs-ui/provider/next'
import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { fontVariables } from '../fonts'
import { SITE_URL } from '@/content/home.content'
import { DocsWordmark } from '@/components/docs/docs-wordmark'
import { docsContent, docsLinks } from '@/content/docs.content'
import { source } from '@/lib/docs/source'
import './docs.css'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: docsContent.title, template: docsContent.titleTemplate },
  description: docsContent.description,
}

const SEARCH = { options: { type: 'static', api: '/docs-search.json' } } as const

const NAV = { title: <DocsWordmark text={docsContent.navTitle} />, url: '/' }

type DocsRootLayoutProps = { readonly children: ReactNode }

/** Its own root layout, because the site's stage units would shrink everything in here. */
const DocsRootLayout = ({ children }: DocsRootLayoutProps) => (
  <html lang="en" suppressHydrationWarning className={fontVariables}>
    <body className="flex min-h-screen flex-col">
      <RootProvider search={SEARCH}>
        <DocsLayout tree={source.getPageTree()} nav={NAV} links={docsLinks} githubUrl={docsContent.github}>
          {children}
        </DocsLayout>
      </RootProvider>
    </body>
  </html>
)

export default DocsRootLayout

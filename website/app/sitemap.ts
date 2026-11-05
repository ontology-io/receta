import * as R from 'remeda'
import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/content/home.content'
import { source } from '@/lib/docs/source'

export const dynamic = 'force-static'

/**
 * The landing page and every docs page. There's no lastModified: search engines stop
 * trusting a date that changes on every build.
 */
const sitemap = (): MetadataRoute.Sitemap => [
  { url: `${SITE_URL}/` },
  ...R.map(source.getPages(), (page) => ({ url: `${SITE_URL}${page.url}` })),
]

export default sitemap

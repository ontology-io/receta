import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/content/home.content'

export const dynamic = 'force-static'

/** Everything is public, and agents are welcome: the docs publish llms.txt for them. */
const robots = (): MetadataRoute.Robots => ({
  rules: { userAgent: '*', allow: '/' },
  sitemap: `${SITE_URL}/sitemap.xml`,
})

export default robots

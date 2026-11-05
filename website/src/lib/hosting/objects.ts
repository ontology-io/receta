// How the static export is stored in R2, and which object a URL reads. The deploy script
// and the Worker share these rules, so what is uploaded is what gets served. Start at
// objectKey.
import { fromNullable, type Option } from '@ontologyio/receta/option'
import * as R from 'remeda'

const INDEX_KEY = 'index.html'

/** The page served with every 404. */
export const NOT_FOUND_KEY = '404.html'

/** Next puts a content hash or build id in every path under here, so a file never changes. */
const FINGERPRINTED_PREFIX = '_next/static/'

const CACHE_FOREVER = 'public, max-age=31536000, immutable'
const ALWAYS_REVALIDATE = 'public, max-age=0, must-revalidate'

const CONTENT_TYPES: Readonly<Record<string, string>> = {
  css: 'text/css; charset=utf-8',
  html: 'text/html; charset=utf-8',
  ico: 'image/x-icon',
  js: 'text/javascript; charset=utf-8',
  json: 'application/json; charset=utf-8',
  md: 'text/markdown; charset=utf-8',
  png: 'image/png',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  woff2: 'font/woff2',
  xml: 'application/xml; charset=utf-8',
}

const hasExtension = (key: string): boolean => (R.last(key.split('/')) ?? '').includes('.')

/** Agents ask for markdown with this header. Browsers never list it. */
const wantsMarkdown = (accept: string): boolean => accept.includes('text/markdown')

/**
 * The object a URL path reads. R2 has no index documents or clean URLs, so "/" and
 * "/docs/result" are mapped here. A docs page can also be read as markdown.
 */
export const objectKey = (pathname: string, accept = ''): string => {
  const key = pathname.replace(/^\/+|\/+$/g, '')
  if (key === '') return INDEX_KEY
  if (hasExtension(key)) return key
  return wantsMarkdown(accept) && isDocsPage(key) ? `${key}.md` : `${key}.html`
}

/** Whether a key is a docs page, so its answer depends on what the reader accepts. */
export const isDocsPage = (key: string): boolean => key === 'docs' || key.startsWith('docs/')

/** Whether a file's name is unique to its content, so it can be uploaded before the pages. */
export const isFingerprinted = (key: string): boolean => key.startsWith(FINGERPRINTED_PREFIX)

/** Fingerprinted files cache for a year. Everything else is checked on each visit. */
export const cacheControl = (key: string): string =>
  isFingerprinted(key) ? CACHE_FOREVER : ALWAYS_REVALIDATE

/** The content type for a file, or None for a type the site has never shipped. */
export const contentType = (key: string): Option<string> =>
  fromNullable(CONTENT_TYPES[R.last(key.split('.')) ?? ''])

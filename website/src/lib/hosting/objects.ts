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
  js: 'text/javascript; charset=utf-8',
  svg: 'image/svg+xml',
  txt: 'text/plain; charset=utf-8',
  woff2: 'font/woff2',
}

/** The object a URL path reads. R2 has no index documents, so "/" is mapped here. */
export const objectKey = (pathname: string): string => {
  const key = pathname.replace(/^\/+/, '')
  return key === '' ? INDEX_KEY : key
}

/** Whether a file's name is unique to its content, so it can be uploaded before the pages. */
export const isFingerprinted = (key: string): boolean => key.startsWith(FINGERPRINTED_PREFIX)

/** Fingerprinted files cache for a year. Everything else is checked on each visit. */
export const cacheControl = (key: string): string =>
  isFingerprinted(key) ? CACHE_FOREVER : ALWAYS_REVALIDATE

/** The content type for a file, or None for a type the site has never shipped. */
export const contentType = (key: string): Option<string> =>
  fromNullable(CONTENT_TYPES[R.last(key.split('.')) ?? ''])

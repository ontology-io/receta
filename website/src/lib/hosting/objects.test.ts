import { describe, expect, it } from 'bun:test'
import { none, some } from '@ontologyio/receta/option'
import { cacheControl, contentType, isFingerprinted, objectKey } from './objects'

describe('objectKey', () => {
  it('reads the home page at the root', () => {
    expect(objectKey('/')).toBe('index.html')
  })

  it('reads every other path as its own object', () => {
    expect(objectKey('/_next/static/chunks/a.js')).toBe('_next/static/chunks/a.js')
  })

  it('ignores repeated leading slashes', () => {
    expect(objectKey('//icon.svg')).toBe('icon.svg')
  })

  it('reads a clean address as its page', () => {
    expect(objectKey('/docs')).toBe('docs.html')
    expect(objectKey('/docs/result/patterns')).toBe('docs/result/patterns.html')
    expect(objectKey('/docs/result/')).toBe('docs/result.html')
  })

  it('serves a docs page as markdown to a reader that asks for it', () => {
    expect(objectKey('/docs/result', 'text/markdown, */*')).toBe('docs/result.md')
    expect(objectKey('/docs/result.md')).toBe('docs/result.md')
  })

  it('only serves markdown for docs pages', () => {
    expect(objectKey('/pricing', 'text/markdown')).toBe('pricing.html')
    expect(objectKey('/', 'text/markdown')).toBe('index.html')
  })
})

describe('cacheControl', () => {
  it('caches fingerprinted files for a year', () => {
    expect(cacheControl('_next/static/media/a.woff2')).toContain('immutable')
  })

  it('checks pages on every visit, so a deploy shows up at once', () => {
    expect(cacheControl('index.html')).toContain('max-age=0')
    expect(cacheControl('__next._tree.txt')).toContain('max-age=0')
  })
})

describe('isFingerprinted', () => {
  it('only matches the static folder', () => {
    expect(isFingerprinted('_next/static/chunks/a.js')).toBe(true)
    expect(isFingerprinted('icon.svg')).toBe(false)
  })
})

describe('contentType', () => {
  it('knows every type in the export', () => {
    expect(contentType('index.html')).toEqual(some('text/html; charset=utf-8'))
    expect(contentType('a.b.woff2')).toEqual(some('font/woff2'))
    expect(contentType('og.png')).toEqual(some('image/png'))
    expect(contentType('favicon.ico')).toEqual(some('image/x-icon'))
    expect(contentType('sitemap.xml')).toEqual(some('application/xml; charset=utf-8'))
  })

  it('refuses a type it has never seen', () => {
    expect(contentType('movie.mp4')).toEqual(none())
  })
})

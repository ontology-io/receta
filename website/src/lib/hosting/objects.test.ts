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
  })

  it('refuses a type it has never seen', () => {
    expect(contentType('movie.mp4')).toEqual(none())
  })
})

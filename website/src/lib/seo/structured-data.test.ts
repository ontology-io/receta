import { describe, expect, it } from 'bun:test'
import { readFileSync } from 'node:fs'
import { metaContent, RECETA_VERSION, SITE_URL } from '@/content/home.content'
import { landingPageSchema, toJsonLd } from './structured-data'

describe('toJsonLd', () => {
  it('can not close the script tag it sits in', () => {
    const text = toJsonLd({ name: '</script><script>alert(1)</script>' })

    expect(text).not.toContain('</script>')
    expect(JSON.parse(text)).toEqual({ name: '</script><script>alert(1)</script>' })
  })
})

describe('landingPageSchema', () => {
  it('points at the site', () => {
    const [website, library] = landingPageSchema['@graph']

    expect(website.url).toBe(`${SITE_URL}/`)
    expect(library.url).toBe(`${SITE_URL}/`)
  })

  it('survives a round trip through JSON', () => {
    expect(JSON.parse(toJsonLd(landingPageSchema))).toEqual(JSON.parse(JSON.stringify(landingPageSchema)))
  })
})

describe('search snippets', () => {
  it('keeps the title short enough not to be cut off', () => {
    expect(metaContent.title.length).toBeLessThanOrEqual(60)
  })

  it('keeps the description in the range search shows', () => {
    expect(metaContent.description.length).toBeGreaterThanOrEqual(140)
    expect(metaContent.description.length).toBeLessThanOrEqual(160)
  })
})

describe('RECETA_VERSION', () => {
  it('matches the installed package', () => {
    const installed = JSON.parse(readFileSync('node_modules/@ontologyio/receta/package.json', 'utf8'))

    expect(RECETA_VERSION).toBe(installed.version)
  })
})

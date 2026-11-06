import { describe, expect, it } from 'bun:test'
import { none, some } from '@ontologyio/receta/option'
import { SITE_URL } from '@/content/home.content'
import { canonicalRedirect } from './redirects'

const SITE_HOST = new URL(SITE_URL).hostname

describe('canonicalRedirect', () => {
  it('sends the old workers.dev address to the same page on the site', () => {
    expect(
      canonicalRedirect('https://receta-website.khaled-mailhub.workers.dev/docs/result'),
    ).toEqual(some(`${SITE_URL}/docs/result`))
  })

  it('sends www to the bare domain', () => {
    expect(canonicalRedirect(`https://www.${SITE_HOST}/`)).toEqual(some(`${SITE_URL}/`))
  })

  it('sends plain HTTP to HTTPS', () => {
    expect(canonicalRedirect(`http://${SITE_HOST}/docs`)).toEqual(some(`${SITE_URL}/docs`))
  })

  it('keeps the query string', () => {
    expect(canonicalRedirect(`https://www.${SITE_HOST}/docs?q=retry`)).toEqual(
      some(`${SITE_URL}/docs?q=retry`),
    )
  })

  it('serves the site itself, so a redirect can never loop', () => {
    expect(canonicalRedirect(`${SITE_URL}/docs/result`)).toEqual(none())
  })

  it('leaves localhost alone, so the Worker runs locally', () => {
    expect(canonicalRedirect('http://localhost:8787/docs')).toEqual(none())
  })
})

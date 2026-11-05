import { describe, expect, it } from 'bun:test'
import { brokenLinks } from './links'

const pages = new Set(['index.mdx', 'result/index.mdx', 'result/patterns.mdx', 'reference/result.mdx'])

const check = (page: string, text: string) => brokenLinks(page, text, pages)

describe('brokenLinks', () => {
  it('accepts relative links to pages and folders', () => {
    expect(check('result/index.mdx', '[a](./patterns.mdx) [b](../reference/result.mdx#map)')).toEqual([])
    expect(check('index.mdx', '[a](./result/index.mdx)')).toEqual([])
  })

  it('accepts site addresses', () => {
    expect(check('index.mdx', '[a](/docs) [b](/docs/result) [c](/docs/reference/result)')).toEqual([])
  })

  it('reports a page that is not there', () => {
    expect(check('result/index.mdx', '[a](./nope.mdx)')).toEqual([
      { page: 'result/index.mdx', target: './nope.mdx' },
    ])
  })

  it('ignores external links, anchors, public files and code', () => {
    expect(
      check('index.mdx', '[a](https://x.dev) [b](#top) [c](/llms.txt) `[d](./nope.mdx)`'),
    ).toEqual([])
  })
})

import { describe, expect, it } from 'bun:test'
import { llmsFull, llmsIndex, pageMarkdown, pageRoute, parsePage } from './markdown'

const page = parsePage(
  'result/patterns.mdx',
  '---\ntitle: "Patterns"\ndescription: Real recipes.\n---\n\n{/* generated */}\n\nBody text.\n',
)

describe('parsePage', () => {
  it('reads the frontmatter and drops MDX comments', () => {
    expect(page).toEqual({
      path: 'result/patterns.mdx',
      title: 'Patterns',
      description: 'Real recipes.',
      body: 'Body text.',
    })
  })
})

describe('pageRoute', () => {
  it('maps files to addresses', () => {
    expect(pageRoute('index.mdx')).toBe('/docs')
    expect(pageRoute('result/index.mdx')).toBe('/docs/result')
    expect(pageRoute('result/patterns.mdx')).toBe('/docs/result/patterns')
  })
})

describe('pageMarkdown', () => {
  it('puts the title and description back in the text', () => {
    expect(pageMarkdown(page)).toBe('# Patterns\n\nReal recipes.\n\nBody text.\n')
  })
})

describe('llmsIndex', () => {
  it('links every page to its markdown, grouped', () => {
    const index = llmsIndex('https://example.com', 'A library.', [
      page,
      parsePage('index.mdx', '---\ntitle: Introduction\n---\n\nHi.\n'),
      parsePage('reference/result.mdx', '---\ntitle: Result\n---\n\nAll of it.\n'),
    ])
    expect(index).toContain('# Receta\n\n> A library.')
    expect(index).toContain('## Get started\n\n- [Introduction](https://example.com/docs.md)')
    expect(index).toContain('- [result: Patterns](https://example.com/docs/result/patterns.md): Real recipes.')
    expect(index).toContain('## Reference\n\n- [Result](https://example.com/docs/reference/result.md)')
  })
})

describe('llmsFull', () => {
  it('joins every page', () => {
    const full = llmsFull([page, page])
    expect(full.split('\n---\n')).toHaveLength(2)
  })
})

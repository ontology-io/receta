import { describe, expect, it } from 'bun:test'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { Glob } from 'bun'
import * as R from 'remeda'
import { llmsFull, llmsIndex, pageMarkdown, pageRoute, parsePage } from './markdown'

const CONTENT = join(import.meta.dir, '../../../content/docs')

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

describe('parsePage with figures', () => {
  const body = (text: string) => parsePage('a.mdx', `---\ntitle: A\n---\n\n${text}\n`).body

  it('keeps the words of a figure and drops its tags', () => {
    expect(body('Before.\n\n<Timeline name="debounce">\n\nIt waits.\n\n</Timeline>\n\nAfter.')).toBe(
      'Before.\n\nIt waits.\n\nAfter.',
    )
  })

  it('drops a figure with no words of its own', () => {
    expect(body('Before.\n\n<OptionBoxes />\n\nAfter.')).toBe('Before.\n\nAfter.')
  })

  it('leaves JSX inside a code fence alone', () => {
    const fence = '```tsx\n<SearchBox>\n\n\n</SearchBox>\n```'
    expect(body(fence)).toBe(fence)
  })

  it('leaves a type in running text alone', () => {
    expect(body('Returns `Option<T>` here.')).toBe('Returns `Option<T>` here.')
  })
})

describe('every docs page', () => {
  it('leaves no component tags in its plain text', async () => {
    const paths = await Array.fromAsync(new Glob('**/*.mdx').scan({ cwd: CONTENT }))
    const leaks = await Promise.all(
      R.map(paths, async (path) => {
        const { body } = parsePage(path, await readFile(join(CONTENT, path), 'utf8'))
        const prose = body.replace(/^```[\s\S]*?^```[ \t]*$/gm, '')
        return /^<\/?[A-Z]/m.test(prose) ? [path] : []
      }),
    )
    expect(R.flat(leaks)).toEqual([])
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

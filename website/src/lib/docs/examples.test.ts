import { describe, expect, it } from 'bun:test'
import { isRealProblem, optOutCount, pageExamples, pageModule } from './examples'

const page = [
  '```ts',
  'const a = 1',
  '```',
  '```ts title="Signature"',
  'map(fn): Result',
  '```',
  '```ts nocheck',
  'const broken = ',
  '```',
  '```bash',
  'bun add remeda',
  '```',
].join('\n')

describe('pageExamples', () => {
  it('finds TypeScript fences and skips signatures and opt-outs', () => {
    expect(pageExamples('a.mdx', page)).toEqual([
      { page: 'a.mdx', line: 2, code: 'const a = 1\n', isTsx: false, style: 'receta' },
    ])
  })
})

describe('pageExamples with JSX', () => {
  it('compiles a tsx fence as TSX', () => {
    expect(pageExamples('a.mdx', '```tsx\nconst a = <b />\n```')).toEqual([
      { page: 'a.mdx', line: 2, code: 'const a = <b />\n', isTsx: true, style: 'receta' },
    ])
  })
})

describe('pageExamples style', () => {
  const styleOf = (meta: string) => pageExamples('a.mdx', `\`\`\`ts${meta}\nconst a = 1\n\`\`\``)[0]?.style

  it('reads the marker from the fence', () => {
    expect(styleOf(' vanilla')).toBe('vanilla')
    expect(styleOf(' nolint')).toBe('nolint')
    expect(styleOf(' title="Before" vanilla')).toBe('vanilla')
  })

  it('ignores the same word in a title', () => {
    expect(styleOf(' title="vanilla or nolint"')).toBe('receta')
  })
})

describe('optOutCount', () => {
  it('counts deliberate opt-outs', () => {
    expect(optOutCount(page)).toBe(1)
  })
})

describe('pageModule', () => {
  it('reads the module from guides and reference pages', () => {
    expect(pageModule('result/patterns.mdx')).toBe('result')
    expect(pageModule('reference/result.mdx')).toBe('result')
  })
})

describe('isRealProblem', () => {
  it('forgives what comes from being a fragment', () => {
    expect(isRealProblem(2451, "Cannot redeclare block-scoped variable 'a'.")).toBe(false)
    expect(isRealProblem(2307, "Cannot find module './db'")).toBe(false)
    expect(isRealProblem(2345, "Argument of type 'unknown' is not assignable")).toBe(false)
    expect(isRealProblem(2339, "Property 'value' does not exist on type 'EventTarget & HTMLInputElement'.")).toBe(false)
  })

  it('gives a fully typed example no slack over unknown', () => {
    expect(isRealProblem(18046, "'value' is of type 'unknown'.", false)).toBe(true)
    expect(isRealProblem(2345, "Argument of type 'unknown' is not assignable", false)).toBe(true)
    expect(isRealProblem(18046, "'value' is of type 'unknown'.", true)).toBe(false)
  })

  it('keeps a wrong import of our own packages', () => {
    expect(isRealProblem(2307, "Cannot find module '@ontologyio/receta/nope'")).toBe(true)
  })

  it('keeps an overload failure even though its message prints unknown', () => {
    expect(isRealProblem(2769, 'No overload matches: value is unknown')).toBe(true)
  })
})

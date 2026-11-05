import { describe, expect, it } from 'bun:test'
import * as R from 'remeda'
import { tokenizeLines } from './tokenize'

const textOf = (line: readonly { readonly text: string }[]): string =>
  R.pipe(line, R.map((token) => token.text), R.join(''))

describe('tokenizeLines', () => {
  it('keeps every character, so the code stays copyable', () => {
    const source = "    if (!data2) return null // 'x' => 12"
    expect(textOf(tokenizeLines([source])[0] ?? [])).toBe(source)
  })

  it('tells keywords, calls, types and strings apart', () => {
    const tokens = tokenizeLines(["const a = parse(Order, 'x')"])[0] ?? []
    const kindOf = (text: string) => tokens.find((token) => token.text === text)?.kind
    expect(kindOf('const')).toBe('keyword')
    expect(kindOf('parse')).toBe('call')
    expect(kindOf('Order')).toBe('type')
    expect(kindOf("'x'")).toBe('string')
  })

  it('lets a sample override a colour', () => {
    const tokens = tokenizeLines(['SyntaxError'], { SyntaxError: 'err' })[0] ?? []
    expect(tokens[0]?.kind).toBe('err')
  })
})

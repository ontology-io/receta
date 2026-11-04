import { describe, expect, it } from 'bun:test'
import { withClaims } from './claims'

describe('withClaims', () => {
  it('checks a claim on the same line', () => {
    const { code, claims } = withClaims('double(2) // => 4\n')
    expect(claims).toBe(1)
    expect(code).toContain('__claim(0, () => (double(2)), () => (4))')
  })

  it('checks a claim on the next line', () => {
    expect(withClaims('double(2)\n// => 4\n').claims).toBe(1)
  })

  it('claims about a variable read the variable', () => {
    const { code } = withClaims('const answer = double(2) // => 4\n')
    expect(code).toContain('const answer = double(2)')
    expect(code).toContain('__claim(0, () => (answer), () => (4))')
  })

  it('reads through console.log', () => {
    expect(withClaims('console.log(double(2)) // => 4\n').code).toContain('() => (double(2))')
  })

  it('understands how the docs print values', () => {
    const { code } = withClaims("parse('a') // => Err({ code: 'BAD' })\nfind(1) // => None\n")
    expect(code).toContain("__err({ code: 'BAD' })")
    expect(code).toContain('__none()')
  })

  it('leaves examples without claims alone', () => {
    expect(withClaims('const a = 1\n// just a note\n').claims).toBe(0)
  })
})

import { describe, expect, it } from 'bun:test'
import { exampleCode, exportSection, failureType, proseToMdx, signatureTitles } from './reference'

describe('proseToMdx', () => {
  it('turns generics into code, so MDX does not read them as tags', () => {
    expect(proseToMdx('Returns Promise<Result<T, E>> always')).toBe(
      'Returns `Promise<Result<T, E>>` always',
    )
  })

  it('leaves code spans and fences alone', () => {
    expect(proseToMdx('Use `Result<T>` here')).toBe('Use `Result<T>` here')
    expect(proseToMdx('```ts\nconst a = { b: 1 }\n```')).toBe('```ts\nconst a = { b: 1 }\n```')
  })

  it('escapes braces and turns links into code', () => {
    expect(proseToMdx('An {object} like {@link map}')).toBe('An \\{object\\} like `map`')
  })

  it('escapes a less-than sign', () => {
    expect(proseToMdx('when x < 5')).toBe('when x &lt; 5')
  })
})

describe('exampleCode', () => {
  it('reads every fence in an example', () => {
    expect(exampleCode('Intro\n```typescript\nconst a = 1\n```\n```ts\nconst b = 2\n```')).toEqual([
      'const a = 1',
      'const b = 2',
    ])
  })

  it('takes an unfenced example as it is', () => {
    expect(exampleCode('const a = 1\n')).toEqual(['const a = 1'])
  })
})

describe('failureType', () => {
  it('reads a named error, through a promise', () => {
    expect(failureType('Promise<Result<U[], MapAsyncError>>')).toBe('MapAsyncError')
  })

  it('handles commas inside the value type', () => {
    expect(failureType('Result<Map<string, number>, ParseError>')).toBe('ParseError')
  })

  it('skips a generic error, which only passes through', () => {
    expect(failureType('Result<U, E>')).toBe('')
  })

  it('skips anything that is not a Result', () => {
    expect(failureType('Option<string>')).toBe('')
  })
})

describe('signatureTitles', () => {
  it('names a pair by when it takes its data', () => {
    expect(signatureTitles([false, true])).toEqual(['Data-first', 'Data-last'])
  })

  it('numbers anything else', () => {
    expect(signatureTitles([false, false])).toEqual(['Overload 1', 'Overload 2'])
    expect(signatureTitles([false])).toEqual(['Signature'])
  })
})

describe('exportSection', () => {
  it('puts the name, signatures, failures and examples in order', () => {
    const section = exportSection({
      name: 'parse',
      kind: 'function',
      summary: 'Parses text.',
      signatures: ['function parse(text: string): Result<Doc, ParseError>'],
      returnsFunction: [false],
      returnTypes: ['Result<Doc, ParseError>'],
      examples: ['```ts\nparse("a")\n```'],
      seeAlso: ['`format`'],
    })
    expect(section).toContain('### parse\n\nParses text.')
    expect(section).toContain('title="Signature"')
    expect(section).toContain('**Fails with** `ParseError`.')
    expect(section).toContain('title="Example"')
    expect(section).toContain('**See also** `format`.')
  })
})

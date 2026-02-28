import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { template, parseTemplate } from '../template'
import { isOk, isErr } from '../../result'

describe('String.template', () => {
  describe('data-first', () => {
    it('interpolates variables into template', () => {
      const result = template('Hello {{name}}!', { name: 'Alice' })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Hello Alice!')
      }
    })

    it('interpolates multiple variables', () => {
      const result = template('{{greeting}} {{name}}, you have {{count}} messages', {
        greeting: 'Hi',
        name: 'Bob',
        count: 5,
      })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Hi Bob, you have 5 messages')
      }
    })

    it('handles numeric values', () => {
      const result = template('Price: ${{price}}', { price: 99.99 })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Price: $99.99')
      }
    })

    it('handles boolean values', () => {
      const result = template('Active: {{active}}', { active: true })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Active: true')
      }
    })

    it('converts null to empty string', () => {
      const result = template('Value: {{value}}', { value: null })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Value: ')
      }
    })

    it('converts undefined to empty string', () => {
      const result = template('Value: {{value}}', { value: undefined })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Value: ')
      }
    })

    it('returns error for missing variable', () => {
      const result = template('Hello {{name}}!', {})
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toEqual({
          type: 'missing_variable',
          variable: 'name',
        })
      }
    })

    it('returns error for first missing variable when multiple are missing', () => {
      const result = template('{{a}} {{b}} {{c}}', { b: 'B' })
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toEqual({
          type: 'missing_variable',
          variable: 'a',
        })
      }
    })

    it('handles templates with no variables', () => {
      const result = template('Just plain text', {})
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Just plain text')
      }
    })

    it('handles empty template', () => {
      const result = template('', {})
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('')
      }
    })

    it('handles duplicate variables', () => {
      const result = template('{{user}} sent {{user}} a message', { user: 'Alice' })
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Alice sent Alice a message')
      }
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(
        'Welcome {{name}}!',
        template({ name: 'Charlie' })
      )
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('Welcome Charlie!')
      }
    })

    it('works in pipe with error', () => {
      const result = R.pipe('Welcome {{name}}!', template({}))
      expect(isErr(result)).toBe(true)
    })
  })
})

describe('String.parseTemplate', () => {
  it('extracts variable names from template', () => {
    const vars = parseTemplate('Hello {{name}}, you have {{count}} messages')
    expect(vars).toEqual(['name', 'count'])
  })

  it('removes duplicate variable names', () => {
    const vars = parseTemplate('{{user}} sent {{user}} a message')
    expect(vars).toEqual(['user'])
  })

  it('returns empty array for template with no variables', () => {
    const vars = parseTemplate('No variables here')
    expect(vars).toEqual([])
  })

  it('returns empty array for empty template', () => {
    const vars = parseTemplate('')
    expect(vars).toEqual([])
  })

  it('extracts variables with underscores and numbers', () => {
    const vars = parseTemplate('{{user_id}} and {{item2}}')
    expect(vars).toEqual(['user_id', 'item2'])
  })

  it('handles multiple occurrences and deduplicates', () => {
    const vars = parseTemplate('{{a}} {{b}} {{a}} {{c}} {{b}}')
    expect(vars).toEqual(['a', 'b', 'c'])
  })
})

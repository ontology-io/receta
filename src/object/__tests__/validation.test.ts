import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { validateShape, type ObjectSchema } from '../validateShape'
import { stripUndefined } from '../stripUndefined'
import { compact } from '../compact'
import { isOk, isErr } from '../../result/guards'

describe('Object.validateShape', () => {
  describe('data-first', () => {
    it('validates object with matching schema', () => {
      const schema: ObjectSchema<{ id: number; name: string }> = {
        id: (v): v is number => typeof v === 'number',
        name: (v): v is string => typeof v === 'string',
      }
      const input = { id: 1, name: 'Alice' }
      const result = validateShape(input, schema)
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual(input)
      }
    })

    it('returns Err when validation fails', () => {
      const schema = {
        id: (v): v is number => typeof v === 'number',
        name: (v): v is string => typeof v === 'string',
      }
      const input = { id: '1', name: 'Alice' } // id is string, not number
      const result = validateShape(input, schema)
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR')
        expect(result.error.path).toContain('id')
      }
    })

    it('returns Err for non-object input', () => {
      const schema = { id: (v): v is number => typeof v === 'number' }
      const result = validateShape('not an object', schema)
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.code).toBe('VALIDATION_ERROR')
        expect(result.error.message).toContain('plain object')
      }
    })

    it('validates complex predicates', () => {
      const schema = {
        email: (v): v is string => typeof v === 'string' && v.includes('@'),
        age: (v): v is number => typeof v === 'number' && v >= 0 && v <= 150,
      }
      const valid = { email: 'alice@example.com', age: 30 }
      expect(isOk(validateShape(valid, schema))).toBe(true)

      const invalid1 = { email: 'invalid', age: 30 }
      expect(isErr(validateShape(invalid1, schema))).toBe(true)

      const invalid2 = { email: 'alice@example.com', age: 200 }
      expect(isErr(validateShape(invalid2, schema))).toBe(true)
    })

    it('validates nested schemas', () => {
      const schema = {
        user: {
          id: (v): v is number => typeof v === 'number',
          name: (v): v is string => typeof v === 'string',
        },
      }
      const valid = { user: { id: 1, name: 'Alice' } }
      const result = validateShape(valid, schema)
      expect(isOk(result)).toBe(true)
    })

    it('provides path for nested validation errors', () => {
      const schema = {
        user: {
          id: (v): v is number => typeof v === 'number',
        },
      }
      const invalid = { user: { id: 'not a number' } }
      const result = validateShape(invalid, schema)
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.path).toEqual(['user', 'id'])
      }
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const schema = {
        id: (v): v is number => typeof v === 'number',
      }
      const input = { id: 1 }
      const result = R.pipe(input, (obj) => validateShape(obj, schema))
      expect(isOk(result)).toBe(true)
    })
  })
})

describe('Object.stripUndefined', () => {
  it('removes undefined values', () => {
    const input = { name: 'Alice', age: undefined, email: 'alice@example.com' }
    const result = stripUndefined(input)
    expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' })
  })

  it('keeps null values', () => {
    const input = { name: 'Alice', age: null }
    const result = stripUndefined(input)
    expect(result).toEqual({ name: 'Alice', age: null })
  })

  it('keeps falsy values except undefined', () => {
    const input = { zero: 0, false: false, empty: '', undef: undefined }
    const result = stripUndefined(input)
    expect(result).toEqual({ zero: 0, false: false, empty: '' })
  })

  it('handles empty objects', () => {
    expect(stripUndefined({})).toEqual({})
  })

  it('handles objects with only undefined values', () => {
    const input = { a: undefined, b: undefined }
    expect(stripUndefined(input)).toEqual({})
  })

  it('works in pipe', () => {
    const input = { name: 'Alice', age: undefined }
    const result = R.pipe(input, stripUndefined)
    expect(result).toEqual({ name: 'Alice' })
  })
})

describe('Object.compact', () => {
  it('removes null and undefined values', () => {
    const input = {
      name: 'Alice',
      age: null,
      email: 'alice@example.com',
      phone: undefined,
    }
    const result = compact(input)
    expect(result).toEqual({ name: 'Alice', email: 'alice@example.com' })
  })

  it('keeps falsy values except nullish', () => {
    const input = { zero: 0, false: false, empty: '', null: null, undef: undefined }
    const result = compact(input)
    expect(result).toEqual({ zero: 0, false: false, empty: '' })
  })

  it('handles empty objects', () => {
    expect(compact({})).toEqual({})
  })

  it('handles objects with only nullish values', () => {
    const input = { a: null, b: undefined }
    expect(compact(input)).toEqual({})
  })

  it('works in pipe', () => {
    const input = { name: 'Alice', age: null, email: undefined }
    const result = R.pipe(input, compact)
    expect(result).toEqual({ name: 'Alice' })
  })
})

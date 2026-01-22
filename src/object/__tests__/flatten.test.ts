import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { flatten } from '../flatten'

describe('Object.flatten', () => {
  describe('data-first', () => {
    it('flattens nested objects', () => {
      const nested = {
        user: {
          name: 'Alice',
          age: 30,
        },
      }
      expect(flatten(nested)).toEqual({
        'user.name': 'Alice',
        'user.age': 30,
      })
    })

    it('handles deeply nested objects', () => {
      const deep = {
        a: {
          b: {
            c: {
              d: 'value',
            },
          },
        },
      }
      expect(flatten(deep)).toEqual({
        'a.b.c.d': 'value',
      })
    })

    it('preserves primitives', () => {
      const obj = {
        string: 'hello',
        number: 42,
        boolean: true,
        null: null,
        undefined: undefined,
      }
      expect(flatten(obj)).toEqual(obj)
    })

    it('handles empty objects', () => {
      expect(flatten({})).toEqual({})
      expect(flatten({ empty: {} })).toEqual({ empty: {} })
    })

    it('handles arrays by default (no flattening)', () => {
      const obj = {
        items: ['a', 'b', 'c'],
      }
      expect(flatten(obj)).toEqual({
        items: ['a', 'b', 'c'],
      })
    })

    it('flattens arrays when enabled', () => {
      const obj = {
        items: ['a', 'b'],
      }
      expect(flatten(obj, { flattenArrays: true })).toEqual({
        'items.0': 'a',
        'items.1': 'b',
      })
    })

    it('uses custom separator', () => {
      const nested = {
        user: {
          name: 'Alice',
        },
      }
      expect(flatten(nested, { separator: '_' })).toEqual({
        user_name: 'Alice',
      })
    })

    it('respects maxDepth', () => {
      const deep = {
        a: {
          b: {
            c: 'value',
          },
        },
      }
      expect(flatten(deep, { maxDepth: 1 })).toEqual({
        'a.b': { c: 'value' },
      })
    })

    it('handles mixed nesting', () => {
      const mixed = {
        user: {
          name: 'Alice',
          contact: {
            email: 'alice@example.com',
            phone: '555-1234',
          },
        },
        settings: {
          theme: 'dark',
        },
      }
      expect(flatten(mixed)).toEqual({
        'user.name': 'Alice',
        'user.contact.email': 'alice@example.com',
        'user.contact.phone': '555-1234',
        'settings.theme': 'dark',
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const nested = {
        user: {
          name: 'Alice',
        },
      }
      const result = R.pipe(nested, (obj) => flatten(obj))
      expect(result).toEqual({
        'user.name': 'Alice',
      })
    })

    it('works with options in pipe', () => {
      const nested = {
        user: {
          name: 'Alice',
        },
      }
      const result = R.pipe(nested, flatten({ separator: '_' }))
      expect(result).toEqual({
        user_name: 'Alice',
      })
    })
  })

  describe('edge cases', () => {
    it('handles objects with numeric keys', () => {
      const obj = {
        0: 'zero',
        1: 'one',
      }
      expect(flatten(obj)).toEqual({
        0: 'zero',
        1: 'one',
      })
    })

    it('handles Date objects', () => {
      const date = new Date('2024-01-01')
      const obj = {
        created: date,
      }
      expect(flatten(obj)).toEqual({
        created: date,
      })
    })

    it('handles empty arrays', () => {
      const obj = {
        items: [],
      }
      expect(flatten(obj, { flattenArrays: true })).toEqual({
        items: [],
      })
    })
  })
})

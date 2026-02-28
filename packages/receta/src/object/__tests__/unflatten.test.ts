import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { unflatten } from '../unflatten'

describe('Object.unflatten', () => {
  describe('data-first', () => {
    it('unflattens flat objects', () => {
      const flat = {
        'user.name': 'Alice',
        'user.age': 30,
      }
      expect(unflatten(flat)).toEqual({
        user: {
          name: 'Alice',
          age: 30,
        },
      })
    })

    it('handles deeply nested paths', () => {
      const flat = {
        'a.b.c.d': 'value',
      }
      expect(unflatten(flat)).toEqual({
        a: {
          b: {
            c: {
              d: 'value',
            },
          },
        },
      })
    })

    it('creates arrays from numeric indices', () => {
      const flat = {
        'items.0': 'a',
        'items.1': 'b',
        'items.2': 'c',
      }
      expect(unflatten(flat)).toEqual({
        items: ['a', 'b', 'c'],
      })
    })

    it('uses custom separator', () => {
      const flat = {
        user_name: 'Alice',
      }
      expect(unflatten(flat, { separator: '_' })).toEqual({
        user: {
          name: 'Alice',
        },
      })
    })

    it('handles primitives', () => {
      const flat = {
        string: 'hello',
        number: 42,
        boolean: true,
      }
      expect(unflatten(flat)).toEqual(flat)
    })

    it('handles empty objects', () => {
      expect(unflatten({})).toEqual({})
    })

    it('merges overlapping paths', () => {
      const flat = {
        'user.name': 'Alice',
        'user.age': 30,
        'user.email': 'alice@example.com',
      }
      expect(unflatten(flat)).toEqual({
        user: {
          name: 'Alice',
          age: 30,
          email: 'alice@example.com',
        },
      })
    })

    it('handles mixed arrays and objects', () => {
      const flat = {
        'users.0.name': 'Alice',
        'users.1.name': 'Bob',
        'settings.theme': 'dark',
      }
      expect(unflatten(flat)).toEqual({
        users: [{ name: 'Alice' }, { name: 'Bob' }],
        settings: {
          theme: 'dark',
        },
      })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const flat = {
        'user.name': 'Alice',
      }
      const result = R.pipe(flat, (obj) => unflatten(obj))
      expect(result).toEqual({
        user: {
          name: 'Alice',
        },
      })
    })

    it('works with options in pipe', () => {
      const flat = {
        user_name: 'Alice',
      }
      const result = R.pipe(flat, unflatten({ separator: '_' }))
      expect(result).toEqual({
        user: {
          name: 'Alice',
        },
      })
    })
  })

  describe('round-trip', () => {
    it('flatten then unflatten preserves structure', () => {
      const original = {
        user: {
          name: 'Alice',
          contact: {
            email: 'alice@example.com',
          },
        },
      }
      const { flatten } = require('../flatten')
      const result = R.pipe(original, (obj) => flatten(obj), (obj) => unflatten(obj))
      expect(result).toEqual(original)
    })
  })
})

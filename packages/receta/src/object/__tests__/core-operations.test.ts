import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { rename } from '../rename'
import { mask } from '../mask'
import { deepMerge } from '../deepMerge'

describe('Object.rename', () => {
  describe('data-first', () => {
    it('renames specified keys', () => {
      const user = { firstName: 'Alice', lastName: 'Smith' }
      const result = rename(user, { firstName: 'given_name', lastName: 'family_name' })
      expect(result).toEqual({ given_name: 'Alice', family_name: 'Smith' })
    })

    it('preserves unmapped keys', () => {
      const user = { id: 1, name: 'Alice', age: 30 }
      const result = rename(user, { name: 'fullName' })
      expect(result).toEqual({ id: 1, fullName: 'Alice', age: 30 })
    })

    it('handles empty mapping', () => {
      const user = { name: 'Alice' }
      expect(rename(user, {})).toEqual(user)
    })

    it('handles empty object', () => {
      expect(rename({}, { name: 'fullName' })).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const user = { firstName: 'Alice' }
      const result = R.pipe(user, rename({ firstName: 'given_name' }))
      expect(result).toEqual({ given_name: 'Alice' })
    })
  })
})

describe('Object.mask', () => {
  describe('data-first', () => {
    it('keeps only allowed keys', () => {
      const user = {
        id: 1,
        email: 'alice@example.com',
        passwordHash: 'secret',
        creditCard: '4111-1111-1111-1111',
      }
      const result = mask(user, ['id', 'email'])
      expect(result).toEqual({ id: 1, email: 'alice@example.com' })
    })

    it('handles non-existent keys gracefully', () => {
      const user = { id: 1, name: 'Alice' }
      const result = mask(user, ['id', 'email'] as any)
      expect(result).toEqual({ id: 1 })
    })

    it('returns empty object when no keys allowed', () => {
      const user = { id: 1, name: 'Alice' }
      expect(mask(user, [])).toEqual({})
    })

    it('handles empty object', () => {
      expect(mask({}, ['id', 'name'])).toEqual({})
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const user = { id: 1, secret: 'hidden', name: 'Alice' }
      const result = R.pipe(user, mask(['id', 'name']))
      expect(result).toEqual({ id: 1, name: 'Alice' })
    })
  })
})

describe('Object.deepMerge', () => {
  describe('data-first', () => {
    it('merges nested objects', () => {
      const defaults = { theme: 'light', features: { search: true } }
      const config = { features: { export: true } }
      const result = deepMerge([defaults, config])
      expect(result).toEqual({
        theme: 'light',
        features: { search: true, export: true },
      })
    })

    it('later objects override earlier ones', () => {
      const obj1 = { a: 1, b: 2 }
      const obj2 = { b: 3, c: 4 }
      expect(deepMerge([obj1, obj2])).toEqual({ a: 1, b: 3, c: 4 })
    })

    it('handles deeply nested merges', () => {
      const obj1 = { a: { b: { c: 1 } } }
      const obj2 = { a: { b: { d: 2 } } }
      expect(deepMerge([obj1, obj2])).toEqual({
        a: { b: { c: 1, d: 2 } },
      })
    })

    it('replaces arrays by default', () => {
      const obj1 = { tags: ['a', 'b'] }
      const obj2 = { tags: ['c'] }
      expect(deepMerge([obj1, obj2])).toEqual({ tags: ['c'] })
    })

    it('concatenates arrays with concat strategy', () => {
      const obj1 = { tags: ['a', 'b'] }
      const obj2 = { tags: ['c'] }
      const result = deepMerge([obj1, obj2], { arrayStrategy: 'concat' })
      expect(result).toEqual({ tags: ['a', 'b', 'c'] })
    })

    it('merges arrays by index with merge strategy', () => {
      const obj1 = { items: [{ id: 1 }, { id: 2 }] }
      const obj2 = { items: [{ name: 'A' }] }
      const result = deepMerge([obj1, obj2], { arrayStrategy: 'merge' })
      // Merge strategy only returns as many items as the source array
      expect(result).toEqual({
        items: [{ id: 1, name: 'A' }],
      })
    })

    it('uses custom merge function', () => {
      const obj1 = { count: 5 }
      const obj2 = { count: 3 }
      const result = deepMerge([obj1, obj2], {
        customMerge: (key, target, source) => {
          if (key === 'count') return (target as number) + (source as number)
          return source
        },
      })
      expect(result).toEqual({ count: 8 })
    })

    it('handles empty arrays', () => {
      expect(deepMerge([])).toEqual({})
    })

    it('handles single object', () => {
      const obj = { a: 1, b: 2 }
      expect(deepMerge([obj])).toEqual(obj)
      expect(deepMerge([obj])).not.toBe(obj) // Should be a copy
    })

    it('merges multiple objects', () => {
      const obj1 = { a: 1 }
      const obj2 = { b: 2 }
      const obj3 = { c: 3 }
      expect(deepMerge([obj1, obj2, obj3])).toEqual({ a: 1, b: 2, c: 3 })
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const defaults = { theme: 'light' }
      const config = { theme: 'dark' }
      const result = R.pipe([defaults, config], (objs) => deepMerge(objs))
      expect(result).toEqual({ theme: 'dark' })
    })
  })
})

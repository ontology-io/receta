import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import {
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
  between,
  startsWith,
  endsWith,
  includes,
  matches,
  isEmpty,
  isNotEmpty,
} from '../comparison'

describe('Predicate.comparison', () => {
  describe('gt', () => {
    it('returns true if value > threshold', () => {
      expect(gt(5)(10)).toBe(true)
      expect(gt(5)(5)).toBe(false)
      expect(gt(5)(3)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, gt(10))).toEqual([15, 20])
    })

    it('works with bigint', () => {
      expect(gt(5n)(10n)).toBe(true)
      expect(gt(5n)(3n)).toBe(false)
    })
  })

  describe('gte', () => {
    it('returns true if value >= threshold', () => {
      expect(gte(5)(10)).toBe(true)
      expect(gte(5)(5)).toBe(true)
      expect(gte(5)(3)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, gte(10))).toEqual([10, 15, 20])
    })
  })

  describe('lt', () => {
    it('returns true if value < threshold', () => {
      expect(lt(5)(3)).toBe(true)
      expect(lt(5)(5)).toBe(false)
      expect(lt(5)(10)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, lt(10))).toEqual([1, 5])
    })
  })

  describe('lte', () => {
    it('returns true if value <= threshold', () => {
      expect(lte(5)(3)).toBe(true)
      expect(lte(5)(5)).toBe(true)
      expect(lte(5)(10)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, lte(10))).toEqual([1, 5, 10])
    })
  })

  describe('eq', () => {
    it('returns true if values are strictly equal', () => {
      expect(eq(5)(5)).toBe(true)
      expect(eq(5)(3)).toBe(false)
      expect(eq('hello')('hello')).toBe(true)
      expect(eq('hello')('world')).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 2, 3, 2, 1]
      expect(R.filter(numbers, eq(2))).toEqual([2, 2])
    })

    it('uses strict equality', () => {
      expect(eq(5)('5')).toBe(false)
      expect(eq(0)(false)).toBe(false)
    })
  })

  describe('neq', () => {
    it('returns true if values are not equal', () => {
      expect(neq(5)(3)).toBe(true)
      expect(neq(5)(5)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 2, 3, 2, 1]
      expect(R.filter(numbers, neq(2))).toEqual([1, 3, 1])
    })
  })

  describe('between', () => {
    it('returns true if value is within range (inclusive)', () => {
      expect(between(5, 10)(7)).toBe(true)
      expect(between(5, 10)(5)).toBe(true)
      expect(between(5, 10)(10)).toBe(true)
      expect(between(5, 10)(3)).toBe(false)
      expect(between(5, 10)(15)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20, 25]
      expect(R.filter(numbers, between(10, 20))).toEqual([10, 15, 20])
    })

    it('works with bigint', () => {
      expect(between(5n, 10n)(7n)).toBe(true)
      expect(between(5n, 10n)(3n)).toBe(false)
    })
  })

  describe('startsWith', () => {
    it('returns true if string starts with prefix', () => {
      expect(startsWith('hello')('hello world')).toBe(true)
      expect(startsWith('hello')('world hello')).toBe(false)
    })

    it('is case-sensitive', () => {
      expect(startsWith('Hello')('hello world')).toBe(false)
    })

    it('works with filter', () => {
      const names = ['Alice', 'Bob', 'Alex', 'Barbara']
      expect(R.filter(names, startsWith('A'))).toEqual(['Alice', 'Alex'])
    })
  })

  describe('endsWith', () => {
    it('returns true if string ends with suffix', () => {
      expect(endsWith('.ts')('app.ts')).toBe(true)
      expect(endsWith('.ts')('app.js')).toBe(false)
    })

    it('is case-sensitive', () => {
      expect(endsWith('.TS')('app.ts')).toBe(false)
    })

    it('works with filter', () => {
      const files = ['app.ts', 'app.js', 'config.json', 'test.spec.ts']
      expect(R.filter(files, endsWith('.ts'))).toEqual(['app.ts', 'test.spec.ts'])
    })
  })

  describe('includes', () => {
    it('returns true if string contains substring', () => {
      expect(includes('world')('hello world')).toBe(true)
      expect(includes('world')('hello there')).toBe(false)
    })

    it('is case-sensitive', () => {
      expect(includes('World')('hello world')).toBe(false)
    })

    it('works with filter', () => {
      const emails = ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com']
      expect(R.filter(emails, includes('@gmail.com'))).toEqual([
        'alice@gmail.com',
        'charlie@gmail.com',
      ])
    })
  })

  describe('matches', () => {
    it('returns true if string matches regex', () => {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      expect(matches(emailPattern)('test@example.com')).toBe(true)
      expect(matches(emailPattern)('invalid-email')).toBe(false)
    })

    it('works with filter', () => {
      const emails = ['alice@example.com', 'invalid-email', 'bob@test.org']
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      const valid = R.filter(emails, matches(emailPattern))
      expect(valid).toEqual(['alice@example.com', 'bob@test.org'])
    })
  })

  describe('isEmpty', () => {
    it('returns true for empty strings', () => {
      expect(isEmpty('')).toBe(true)
      expect(isEmpty('hello')).toBe(false)
    })

    it('returns true for empty arrays', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty([1, 2, 3])).toBe(false)
    })

    it('returns true for empty objects', () => {
      expect(isEmpty({})).toBe(true)
      expect(isEmpty({ a: 1 })).toBe(false)
    })

    it('works with filter', () => {
      expect(R.filter(['', 'hello', '', 'world'], isEmpty)).toEqual(['', ''])
      expect(R.filter([[], [1, 2], []], isEmpty)).toEqual([[], []])
      expect(R.filter([{}, { a: 1 }, {}], isEmpty)).toEqual([{}, {}])
    })
  })

  describe('isNotEmpty', () => {
    it('returns true for non-empty strings', () => {
      expect(isNotEmpty('hello')).toBe(true)
      expect(isNotEmpty('')).toBe(false)
    })

    it('returns true for non-empty arrays', () => {
      expect(isNotEmpty([1, 2, 3])).toBe(true)
      expect(isNotEmpty([])).toBe(false)
    })

    it('returns true for non-empty objects', () => {
      expect(isNotEmpty({ a: 1 })).toBe(true)
      expect(isNotEmpty({})).toBe(false)
    })

    it('works with filter', () => {
      expect(R.filter(['', 'hello', '', 'world'], isNotEmpty)).toEqual(['hello', 'world'])
    })
  })

  describe('real-world scenarios', () => {
    it('filters products by price range', () => {
      const products = [
        { name: 'Budget', price: 5 },
        { name: 'Standard', price: 15 },
        { name: 'Premium', price: 50 },
      ]
      const affordable = R.filter(products, (p) => between(10, 30)(p.price))
      expect(affordable).toEqual([{ name: 'Standard', price: 15 }])
    })

    it('filters users by age', () => {
      const users = [
        { name: 'Alice', age: 25 },
        { name: 'Bob', age: 17 },
        { name: 'Charlie', age: 30 },
      ]
      const adults = R.filter(users, (u) => gte(18)(u.age))
      expect(adults).toEqual([
        { name: 'Alice', age: 25 },
        { name: 'Charlie', age: 30 },
      ])
    })

    it('filters files by extension', () => {
      const files = ['app.ts', 'test.spec.ts', 'config.json', 'utils.ts']
      const tsFiles = R.filter(files, endsWith('.ts'))
      expect(tsFiles).toEqual(['app.ts', 'test.spec.ts', 'utils.ts'])
    })
  })
})

import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { and, or, not, xor, always, never } from '../combinators'
import { gt, lt, eq } from '../comparison'

describe('Predicate.combinators', () => {
  describe('and', () => {
    it('returns true if all predicates return true', () => {
      const predicate = and(gt(5), lt(15))
      expect(predicate(10)).toBe(true)
      expect(predicate(3)).toBe(false)
      expect(predicate(20)).toBe(false)
    })

    it('short-circuits on first false', () => {
      let callCount = 0
      const expensive = () => {
        callCount++
        return true
      }
      const predicate = and(() => false, expensive)
      predicate(42)
      expect(callCount).toBe(0) // expensive not called
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, and(gt(5), lt(15)))).toEqual([10])
    })

    it('handles multiple predicates', () => {
      const users = [
        { age: 25, active: true, verified: true },
        { age: 30, active: false, verified: true },
        { age: 35, active: true, verified: false },
      ]
      const predicate = and(
        (u: typeof users[0]) => u.age >= 25,
        (u) => u.active,
        (u) => u.verified
      )
      expect(R.filter(users, predicate)).toEqual([{ age: 25, active: true, verified: true }])
    })
  })

  describe('or', () => {
    it('returns true if any predicate returns true', () => {
      const predicate = or(eq(1), eq(3), eq(5))
      expect(predicate(1)).toBe(true)
      expect(predicate(3)).toBe(true)
      expect(predicate(5)).toBe(true)
      expect(predicate(2)).toBe(false)
    })

    it('short-circuits on first true', () => {
      let callCount = 0
      const expensive = () => {
        callCount++
        return false
      }
      const predicate = or(() => true, expensive)
      predicate(42)
      expect(callCount).toBe(0) // expensive not called
    })

    it('works with filter', () => {
      const numbers = [1, 2, 3, 4, 5]
      expect(R.filter(numbers, or(eq(1), eq(3), eq(5)))).toEqual([1, 3, 5])
    })
  })

  describe('not', () => {
    it('negates a predicate', () => {
      const predicate = not(eq(2))
      expect(predicate(1)).toBe(true)
      expect(predicate(2)).toBe(false)
      expect(predicate(3)).toBe(true)
    })

    it('works with filter', () => {
      const numbers = [1, 2, 3, 2, 1]
      expect(R.filter(numbers, not(eq(2)))).toEqual([1, 3, 1])
    })

    it('can negate complex predicates', () => {
      const predicate = not(and(gt(5), lt(15)))
      expect(predicate(3)).toBe(true)
      expect(predicate(10)).toBe(false)
      expect(predicate(20)).toBe(true)
    })
  })

  describe('xor', () => {
    it('returns true if exactly one predicate is true', () => {
      const predicate = xor(lt(8), gt(12))
      expect(predicate(5)).toBe(true) // lt(8) true, gt(12) false
      expect(predicate(15)).toBe(true) // lt(8) false, gt(12) true
      expect(predicate(10)).toBe(false) // both false
      expect(predicate(2)).toBe(true) // exactly one true
    })

    it('returns false if more than one predicate is true', () => {
      const predicate = xor(gt(5), lt(15), eq(10))
      expect(predicate(10)).toBe(false) // all three are true
    })

    it('works with filter', () => {
      const numbers = [1, 5, 10, 15, 20]
      expect(R.filter(numbers, xor(lt(8), gt(12)))).toEqual([1, 5, 15, 20])
    })

    it('handles exclusive features', () => {
      const products = [
        { id: 1, premium: true, trial: false },
        { id: 2, premium: false, trial: true },
        { id: 3, premium: true, trial: true },
        { id: 4, premium: false, trial: false },
      ]
      const predicate = xor(
        (p: typeof products[0]) => p.premium,
        (p) => p.trial
      )
      expect(R.filter(products, predicate)).toEqual([
        { id: 1, premium: true, trial: false },
        { id: 2, premium: false, trial: true },
      ])
    })
  })

  describe('always', () => {
    it('always returns true', () => {
      const predicate = always<number>()
      expect(predicate(1)).toBe(true)
      expect(predicate(100)).toBe(true)
      expect(predicate(-5)).toBe(true)
    })

    it('keeps all items when filtering', () => {
      const numbers = [1, 2, 3]
      expect(R.filter(numbers, always())).toEqual([1, 2, 3])
    })
  })

  describe('never', () => {
    it('always returns false', () => {
      const predicate = never<number>()
      expect(predicate(1)).toBe(false)
      expect(predicate(100)).toBe(false)
      expect(predicate(-5)).toBe(false)
    })

    it('filters out all items', () => {
      const numbers = [1, 2, 3]
      expect(R.filter(numbers, never())).toEqual([])
    })
  })

  describe('composition patterns', () => {
    it('combines and/or/not', () => {
      // (x > 5 AND x < 15) OR x === 20
      const predicate = or(and(gt(5), lt(15)), eq(20))
      const numbers = [1, 5, 10, 15, 20, 25]
      expect(R.filter(numbers, predicate)).toEqual([10, 20])
    })

    it('de morgans law: not(and(a,b)) === or(not(a), not(b))', () => {
      const pred1 = not(and(gt(5), lt(15)))
      const pred2 = or(not(gt(5)), not(lt(15)))

      const testValues = [1, 5, 10, 15, 20]
      testValues.forEach((v) => {
        expect(pred1(v)).toBe(pred2(v))
      })
    })
  })
})

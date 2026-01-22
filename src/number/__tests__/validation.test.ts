import { describe, it, expect } from 'bun:test'
import {
  isInteger,
  isFinite,
  isPositive,
  isNegative,
  inRange,
  clamp,
} from '../index'
import * as R from 'remeda'

describe('Number Validation', () => {
  describe('isInteger', () => {
    it('returns true for integers', () => {
      expect(isInteger(0)).toBe(true)
      expect(isInteger(1)).toBe(true)
      expect(isInteger(-1)).toBe(true)
      expect(isInteger(42)).toBe(true)
    })

    it('returns false for non-integers', () => {
      expect(isInteger(1.5)).toBe(false)
      expect(isInteger(0.1)).toBe(false)
      expect(isInteger(-3.14)).toBe(false)
    })

    it('returns true for safe integers', () => {
      expect(isInteger(Number.MAX_SAFE_INTEGER)).toBe(true)
      expect(isInteger(Number.MIN_SAFE_INTEGER)).toBe(true)
    })

    it('returns false for unsafe integers', () => {
      expect(isInteger(Number.MAX_SAFE_INTEGER + 1)).toBe(false)
      expect(isInteger(Number.MIN_SAFE_INTEGER - 1)).toBe(false)
    })

    it('returns false for special values', () => {
      expect(isInteger(Infinity)).toBe(false)
      expect(isInteger(-Infinity)).toBe(false)
      expect(isInteger(NaN)).toBe(false)
    })
  })

  describe('isFinite', () => {
    it('returns true for finite numbers', () => {
      expect(isFinite(0)).toBe(true)
      expect(isFinite(42)).toBe(true)
      expect(isFinite(-3.14)).toBe(true)
      expect(isFinite(Number.MAX_VALUE)).toBe(true)
    })

    it('returns false for infinite values', () => {
      expect(isFinite(Infinity)).toBe(false)
      expect(isFinite(-Infinity)).toBe(false)
    })

    it('returns false for NaN', () => {
      expect(isFinite(NaN)).toBe(false)
    })
  })

  describe('isPositive', () => {
    it('returns true for positive numbers', () => {
      expect(isPositive(1)).toBe(true)
      expect(isPositive(0.1)).toBe(true)
      expect(isPositive(42)).toBe(true)
      expect(isPositive(Number.MAX_VALUE)).toBe(true)
    })

    it('returns false for zero', () => {
      expect(isPositive(0)).toBe(false)
    })

    it('returns false for negative numbers', () => {
      expect(isPositive(-1)).toBe(false)
      expect(isPositive(-0.1)).toBe(false)
    })
  })

  describe('isNegative', () => {
    it('returns true for negative numbers', () => {
      expect(isNegative(-1)).toBe(true)
      expect(isNegative(-0.1)).toBe(true)
      expect(isNegative(-42)).toBe(true)
    })

    it('returns false for zero', () => {
      expect(isNegative(0)).toBe(false)
    })

    it('returns false for positive numbers', () => {
      expect(isNegative(1)).toBe(false)
      expect(isNegative(0.1)).toBe(false)
    })
  })

  describe('inRange', () => {
    describe('data-first', () => {
      it('returns true for values in range', () => {
        expect(inRange(50, 0, 100)).toBe(true)
        expect(inRange(0, 0, 100)).toBe(true)
        expect(inRange(100, 0, 100)).toBe(true)
      })

      it('returns false for values out of range', () => {
        expect(inRange(-1, 0, 100)).toBe(false)
        expect(inRange(101, 0, 100)).toBe(false)
      })

      it('works with negative ranges', () => {
        expect(inRange(-5, -10, 0)).toBe(true)
        expect(inRange(-11, -10, 0)).toBe(false)
      })

      it('works with decimal ranges', () => {
        expect(inRange(0.5, 0, 1)).toBe(true)
        expect(inRange(1.1, 0, 1)).toBe(false)
      })
    })

    describe('data-last', () => {
      it('works as predicate in filter', () => {
        const ages = [15, 25, 35, 45, 65, 75]
        const adults = R.filter(ages, inRange(18, 64))
        expect(adults).toEqual([25, 35, 45])
      })

      it('works in pipe', () => {
        const result = R.pipe(50, inRange(0, 100))
        expect(result).toBe(true)
      })
    })
  })

  describe('clamp', () => {
    describe('data-first', () => {
      it('returns value if within range', () => {
        expect(clamp(50, 0, 100)).toBe(50)
        expect(clamp(0, 0, 100)).toBe(0)
        expect(clamp(100, 0, 100)).toBe(100)
      })

      it('returns min if value too low', () => {
        expect(clamp(-10, 0, 100)).toBe(0)
        expect(clamp(-100, 0, 100)).toBe(0)
      })

      it('returns max if value too high', () => {
        expect(clamp(150, 0, 100)).toBe(100)
        expect(clamp(1000, 0, 100)).toBe(100)
      })

      it('works with negative ranges', () => {
        expect(clamp(-15, -10, 0)).toBe(-10)
        expect(clamp(5, -10, 0)).toBe(0)
        expect(clamp(-5, -10, 0)).toBe(-5)
      })

      it('works with decimal values', () => {
        expect(clamp(0.5, 0, 1)).toBe(0.5)
        expect(clamp(1.5, 0, 1)).toBe(1)
        expect(clamp(-0.5, 0, 1)).toBe(0)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(150, clamp(0, 100))
        expect(result).toBe(100)
      })

      it('works in map', () => {
        const values = [-10, 50, 150]
        const clamped = R.map(values, clamp(0, 100))
        expect(clamped).toEqual([0, 50, 100])
      })
    })

    describe('real-world: volume control', () => {
      it('constrains volume to 0-100', () => {
        const setVolume = (level: number) => clamp(level, 0, 100)
        expect(setVolume(50)).toBe(50)
        expect(setVolume(-10)).toBe(0)
        expect(setVolume(150)).toBe(100)
      })
    })
  })
})

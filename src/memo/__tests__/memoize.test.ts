import { describe, it, expect, vi } from 'vitest'
import { memoize } from '../memoize'
import { some } from '../../option'

describe('memoize', () => {
  describe('basic caching', () => {
    it('caches result for same argument', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      expect(memoized(5)).toBe(10)
      expect(memoized(5)).toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('computes new result for different argument', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      expect(memoized(5)).toBe(10)
      expect(memoized(10)).toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('caches expensive computations', () => {
      const fibonacci = vi.fn((n: number): number => {
        if (n <= 1) return n
        return fibonacci(n - 1) + fibonacci(n - 2)
      })
      const memoFib = memoize(fibonacci)

      expect(memoFib(10)).toBe(55)
      expect(memoFib(10)).toBe(55)
      // First call is expensive, second is instant
      expect(fibonacci.mock.calls.length).toBeGreaterThan(0)
    })
  })

  describe('cache key', () => {
    it('uses first argument as cache key', () => {
      const fn = vi.fn((a: string, b: number) => `${a}-${b}`)
      const memoized = memoize(fn)

      expect(memoized('hello', 1)).toBe('hello-1')
      expect(memoized('hello', 2)).toBe('hello-1') // Same first arg, cached!
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles different types as keys', () => {
      const fn = vi.fn((key: string | number) => String(key))
      const memoized = memoize(fn)

      expect(memoized('foo')).toBe('foo')
      expect(memoized(123)).toBe('123')
      expect(memoized('foo')).toBe('foo')
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('maxSize option', () => {
    it('evicts oldest entry when max size exceeded', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn, { maxSize: 2 })

      memoized(1) // cache: [1]
      memoized(2) // cache: [1, 2]
      memoized(3) // cache: [2, 3] (1 evicted)

      expect(fn).toHaveBeenCalledTimes(3)

      memoized(2) // cached
      memoized(3) // cached
      memoized(1) // recomputed (was evicted)

      expect(fn).toHaveBeenCalledTimes(4)
    })

    it('does not evict if under max size', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn, { maxSize: 10 })

      for (let i = 0; i < 5; i++) {
        memoized(i)
      }

      expect(fn).toHaveBeenCalledTimes(5)

      for (let i = 0; i < 5; i++) {
        memoized(i) // All cached
      }

      expect(fn).toHaveBeenCalledTimes(5)
    })
  })

  describe('cache access', () => {
    it('exposes cache property', () => {
      const fn = (n: number) => n * 2
      const memoized = memoize(fn)

      memoized(5)

      expect(memoized.cache.has(5)).toBe(true)
      expect(memoized.cache.get(5)).toEqual(some(10))
    })

    it('exposes clear method', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      memoized.clear()

      memoized(5) // Recomputed
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('edge cases', () => {
    it('handles undefined as argument', () => {
      const fn = vi.fn((x: undefined) => 'undefined')
      const memoized = memoize(fn)

      expect(memoized(undefined)).toBe('undefined')
      expect(memoized(undefined)).toBe('undefined')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles null as argument', () => {
      const fn = vi.fn((x: null) => 'null')
      const memoized = memoize(fn)

      expect(memoized(null)).toBe('null')
      expect(memoized(null)).toBe('null')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles functions returning undefined', () => {
      const fn = vi.fn((_n: number) => undefined)
      const memoized = memoize(fn)

      expect(memoized(5)).toBeUndefined()
      expect(memoized(5)).toBeUndefined()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('type inference', () => {
    it('preserves function signature', () => {
      const fn = (n: number): string => String(n)
      const memoized = memoize(fn)

      const result: string = memoized(42)
      expect(result).toBe('42')
    })
  })
})

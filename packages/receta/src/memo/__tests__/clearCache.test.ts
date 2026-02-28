import { describe, it, expect, vi } from 'vitest'
import { memoize } from '../memoize'
import { memoizeAsync } from '../memoizeAsync'
import { clearCache } from '../clearCache'

describe('clearCache', () => {
  describe('with memoize', () => {
    it('clears cached values', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      clearCache(memoized)

      memoized(5) // Recomputed
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('clears all entries', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(1)
      memoized(2)
      memoized(3)
      expect(fn).toHaveBeenCalledTimes(3)

      clearCache(memoized)

      memoized(1) // All recomputed
      memoized(2)
      memoized(3)
      expect(fn).toHaveBeenCalledTimes(6)
    })
  })

  describe('with memoizeAsync', () => {
    it('clears cached promises', async () => {
      const fn = vi.fn(async (n: number) => n * 2)
      const memoized = memoizeAsync(fn)

      await memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      clearCache(memoized)

      await memoized(5) // Recomputed
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('alternative: .clear() method', () => {
    it('works via memoized.clear()', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn)

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      memoized.clear()

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })
})

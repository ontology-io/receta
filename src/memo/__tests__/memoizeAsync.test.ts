import { describe, it, expect, vi } from 'vitest'
import { memoizeAsync } from '../memoizeAsync'

describe('memoizeAsync', () => {
  describe('basic caching', () => {
    it('caches resolved promise', async () => {
      const fn = vi.fn(async (n: number) => n * 2)
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).resolves.toBe(10)
      await expect(memoized(5)).resolves.toBe(10)
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('computes new result for different argument', async () => {
      const fn = vi.fn(async (n: number) => n * 2)
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).resolves.toBe(10)
      await expect(memoized(10)).resolves.toBe(20)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('request deduplication', () => {
    it('deduplicates concurrent requests', async () => {
      const fn = vi.fn(async (id: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return `User ${id}`
      })
      const memoized = memoizeAsync(fn)

      const promises = [memoized('123'), memoized('123'), memoized('123')]

      const results = await Promise.all(promises)

      expect(results).toEqual(['User 123', 'User 123', 'User 123'])
      expect(fn).toHaveBeenCalledTimes(1) // Only 1 actual call
    })

    it('allows different concurrent requests', async () => {
      const fn = vi.fn(async (id: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return `User ${id}`
      })
      const memoized = memoizeAsync(fn)

      const promises = [memoized('123'), memoized('456'), memoized('123')]

      const results = await Promise.all(promises)

      expect(results).toEqual(['User 123', 'User 456', 'User 123'])
      expect(fn).toHaveBeenCalledTimes(2) // Two different IDs
    })
  })

  describe('error handling', () => {
    it('does not cache rejected promises', async () => {
      let callCount = 0
      const fn = vi.fn(async (n: number) => {
        callCount++
        if (callCount === 1) {
          throw new Error('First call fails')
        }
        return n * 2
      })
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).rejects.toThrow('First call fails')
      await expect(memoized(5)).resolves.toBe(10) // Retries

      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('removes failed promise from cache', async () => {
      const fn = vi.fn(async (n: number) => {
        if (n === 5) throw new Error('Invalid')
        return n * 2
      })
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).rejects.toThrow('Invalid')
      expect(memoized.cache.has(5)).toBe(false) // Removed from cache

      await expect(memoized(10)).resolves.toBe(20)
      expect(memoized.cache.has(10)).toBe(true) // Success stays cached
    })
  })

  describe('custom key extraction', () => {
    it('uses keyFn option', async () => {
      interface FetchOpts {
        id: string
        type: string
      }

      const fn = vi.fn(async (opts: FetchOpts) => `${opts.type}:${opts.id}`)
      const memoized = memoizeAsync(fn, {
        keyFn: (opts) => `${opts.id}-${opts.type}`,
      })

      await expect(memoized({ id: '1', type: 'user' })).resolves.toBe('user:1')
      await expect(memoized({ id: '1', type: 'user' })).resolves.toBe('user:1')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('distinguishes different keys', async () => {
      const fn = vi.fn(async (a: number, b: number) => a + b)
      const memoized = memoizeAsync(fn, {
        keyFn: (a, b) => `${a},${b}`,
      })

      await expect(memoized(2, 3)).resolves.toBe(5)
      await expect(memoized(3, 2)).resolves.toBe(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('cache access', () => {
    it('exposes cache property', async () => {
      const fn = async (n: number) => n * 2
      const memoized = memoizeAsync(fn)

      await memoized(5)

      expect(memoized.cache.has(5)).toBe(true)
      const cached = memoized.cache.get(5)
      expect(cached).toBeInstanceOf(Promise)
      await expect(cached).resolves.toBe(10)
    })

    it('exposes clear method', async () => {
      const fn = vi.fn(async (n: number) => n * 2)
      const memoized = memoizeAsync(fn)

      await memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      memoized.clear()

      await memoized(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })
  })

  describe('maxSize option', () => {
    it('evicts oldest entry when max size exceeded', async () => {
      const fn = vi.fn(async (n: number) => n * 2)
      const memoized = memoizeAsync(fn, { maxSize: 2 })

      await memoized(1)
      await memoized(2)
      await memoized(3) // Evicts 1

      expect(fn).toHaveBeenCalledTimes(3)

      await memoized(2) // Cached
      await memoized(3) // Cached
      await memoized(1) // Recomputed

      expect(fn).toHaveBeenCalledTimes(4)
    })
  })

  describe('real-world scenarios', () => {
    it('handles API fetch with deduplication', async () => {
      const fetchUser = vi.fn(async (id: string) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { id, name: `User ${id}` }
      })
      const memoized = memoizeAsync(fetchUser)

      // Multiple components request same user
      const p1 = memoized('123')
      const p2 = memoized('123')
      const p3 = memoized('123')

      const [user1, user2, user3] = await Promise.all([p1, p2, p3])

      expect(user1).toEqual({ id: '123', name: 'User 123' })
      expect(user2).toBe(user1) // Same reference
      expect(user3).toBe(user1)
      expect(fetchUser).toHaveBeenCalledTimes(1)
    })
  })

  describe('edge cases', () => {
    it('handles async functions returning undefined', async () => {
      const fn = vi.fn(async (_n: number) => undefined)
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).resolves.toBeUndefined()
      await expect(memoized(5)).resolves.toBeUndefined()
      expect(fn).toHaveBeenCalledTimes(1)
    })

    it('handles async functions returning null', async () => {
      const fn = vi.fn(async (_n: number) => null)
      const memoized = memoizeAsync(fn)

      await expect(memoized(5)).resolves.toBeNull()
      await expect(memoized(5)).resolves.toBeNull()
      expect(fn).toHaveBeenCalledTimes(1)
    })
  })

  describe('type inference', () => {
    it('preserves async function signature', async () => {
      const fn = async (n: number): Promise<string> => String(n)
      const memoized = memoizeAsync(fn)

      const result: string = await memoized(42)
      expect(result).toBe('42')
    })
  })
})

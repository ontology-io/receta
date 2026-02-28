import { describe, it, expect, vi } from 'vitest'
import { memoize } from '../memoize'
import { ttlCache } from '../caches/ttlCache'
import { lruCache } from '../caches/lruCache'
import { weakCache } from '../caches/weakCache'
import { isSome, isNone, unwrap, some, none } from '../../option'

describe('Cache Strategies', () => {
  describe('ttlCache', () => {
    it('expires entries after TTL', async () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn, {
        cache: ttlCache(100), // 100ms
      })

      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      // Within TTL - cached
      memoized(5)
      expect(fn).toHaveBeenCalledTimes(1)

      // After TTL - recomputed
      await new Promise((resolve) => setTimeout(resolve, 150))
      memoized(5)
      expect(fn).toHaveBeenCalledTimes(2)
    })

    it('handles multiple entries with different expiration', async () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn, {
        cache: ttlCache(100), // 100ms
      })

      memoized(1)
      await new Promise((resolve) => setTimeout(resolve, 50))
      memoized(2)

      expect(fn).toHaveBeenCalledTimes(2)

      // Both still cached
      memoized(1)
      memoized(2)
      expect(fn).toHaveBeenCalledTimes(2)

      // Wait for 1 to expire
      await new Promise((resolve) => setTimeout(resolve, 60))

      memoized(1) // Recomputed (expired)
      memoized(2) // Still cached
      expect(fn).toHaveBeenCalledTimes(3)
    })

    it('has() returns false for expired entries', async () => {
      const cache = ttlCache<number, number>(50)

      cache.set(1, 10)
      expect(cache.has(1)).toBe(true)

      await new Promise((resolve) => setTimeout(resolve, 60))
      expect(cache.has(1)).toBe(false)
    })

    it('get() returns None for expired entries', async () => {
      const cache = ttlCache<number, number>(50)

      cache.set(1, 10)
      expect(cache.get(1)).toEqual(some(10))

      await new Promise((resolve) => setTimeout(resolve, 60))
      expect(cache.get(1)).toEqual(none())
    })

    it('clears all entries', () => {
      const cache = ttlCache<number, number>(5000)

      cache.set(1, 10)
      cache.set(2, 20)
      expect(cache.has(1)).toBe(true)
      expect(cache.has(2)).toBe(true)

      cache.clear()

      expect(cache.has(1)).toBe(false)
      expect(cache.has(2)).toBe(false)
    })
  })

  describe('lruCache', () => {
    it('evicts least recently used entry', () => {
      const fn = vi.fn((n: number) => n * 2)
      const memoized = memoize(fn, {
        cache: lruCache(2), // Max 2 entries
      })

      memoized(1) // cache: [1]
      memoized(2) // cache: [1, 2]
      memoized(3) // cache: [2, 3] (1 evicted)

      expect(fn).toHaveBeenCalledTimes(3)

      memoized(2) // cached, moved to end: [3, 2]
      memoized(3) // cached, moved to end: [2, 3]
      expect(fn).toHaveBeenCalledTimes(3)

      memoized(1) // recomputed, 2 evicted: [3, 1]
      expect(fn).toHaveBeenCalledTimes(4)
    })

    it('updates position on get', () => {
      const cache = lruCache<number, number>(2)

      cache.set(1, 10)
      cache.set(2, 20)

      // Access 1 - moves to end
      cache.get(1)

      // Add 3 - should evict 2 (not 1)
      cache.set(3, 30)

      expect(cache.has(1)).toBe(true)
      expect(cache.has(2)).toBe(false)
      expect(cache.has(3)).toBe(true)
    })

    it('updates existing key position', () => {
      const cache = lruCache<number, number>(3)

      cache.set(1, 10)
      cache.set(2, 20)
      cache.set(3, 30)

      // Update value for 1 - moves to end
      cache.set(1, 11)

      // Add 4 - should evict 2 (oldest)
      cache.set(4, 40)

      expect(cache.has(1)).toBe(true)
      expect(cache.has(2)).toBe(false)
      expect(cache.has(3)).toBe(true)
      expect(cache.has(4)).toBe(true)
      expect(cache.get(1)).toEqual(some(11))
    })

    it('throws on invalid max size', () => {
      expect(() => lruCache(0)).toThrow('maxSize must be greater than 0')
      expect(() => lruCache(-1)).toThrow('maxSize must be greater than 0')
    })

    it('deletes entries', () => {
      const cache = lruCache<number, number>(3)

      cache.set(1, 10)
      cache.set(2, 20)

      expect(cache.delete(1)).toBe(true)
      expect(cache.has(1)).toBe(false)
      expect(cache.delete(1)).toBe(false) // Already deleted
    })

    it('clears all entries', () => {
      const cache = lruCache<number, number>(3)

      cache.set(1, 10)
      cache.set(2, 20)
      cache.set(3, 30)

      cache.clear()

      expect(cache.has(1)).toBe(false)
      expect(cache.has(2)).toBe(false)
      expect(cache.has(3)).toBe(false)
    })
  })

  describe('weakCache', () => {
    it('caches with object keys', () => {
      interface Node {
        id: string
        value: number
      }

      const fn = vi.fn((node: Node) => node.value * 2)
      const cache = weakCache<Node, number>()

      const node1 = { id: 'a', value: 5 }
      const node2 = { id: 'b', value: 10 }

      cache.set(node1, fn(node1))
      cache.set(node2, fn(node2))

      expect(cache.get(node1)).toEqual(some(10))
      expect(cache.get(node2)).toEqual(some(20))
      expect(cache.has(node1)).toBe(true)
      expect(cache.has(node2)).toBe(true)
    })

    it('returns None for non-existent keys', () => {
      const cache = weakCache<object, number>()
      const obj = {}

      expect(cache.get(obj)).toEqual(none())
      expect(cache.has(obj)).toBe(false)
    })

    it('deletes entries', () => {
      const cache = weakCache<object, number>()
      const obj = {}

      cache.set(obj, 42)
      expect(cache.has(obj)).toBe(true)

      cache.delete(obj)
      expect(cache.has(obj)).toBe(false)
    })

    it('clear is a no-op', () => {
      const cache = weakCache<object, number>()
      const obj = {}

      cache.set(obj, 42)
      cache.clear() // No-op for WeakMap

      // Entry still exists (WeakMap doesn't support clearing)
      expect(cache.has(obj)).toBe(true)
    })

    it('allows garbage collection', () => {
      const cache = weakCache<object, string>()

      // Create object in scope
      let obj: object | null = { id: 'test' }
      cache.set(obj, 'cached')

      expect(cache.has(obj)).toBe(true)

      // Remove reference - object can be GC'd
      obj = null

      // Note: We can't easily test actual GC in unit tests,
      // but this demonstrates the API usage
    })
  })

  describe('cache interface compliance', () => {
    it('ttlCache implements Cache interface', () => {
      const cache = ttlCache<string, number>(5000)

      cache.set('key', 42)
      expect(cache.get('key')).toEqual(some(42))
      expect(cache.has('key')).toBe(true)
      expect(cache.delete('key')).toBe(true)
      expect(cache.has('key')).toBe(false)
    })

    it('lruCache implements Cache interface', () => {
      const cache = lruCache<string, number>(10)

      cache.set('key', 42)
      expect(cache.get('key')).toEqual(some(42))
      expect(cache.has('key')).toBe(true)
      expect(cache.delete('key')).toBe(true)
      expect(cache.has('key')).toBe(false)
    })

    it('weakCache implements Cache interface', () => {
      const cache = weakCache<object, number>()
      const key = {}

      cache.set(key, 42)
      expect(cache.get(key)).toEqual(some(42))
      expect(cache.has(key)).toBe(true)
      expect(cache.delete(key)).toBe(true)
      expect(cache.has(key)).toBe(false)
    })
  })
})

import { type Option, fromNullable, some, none } from '../../option'
import type { Cache } from '../types'

/**
 * Creates a Least-Recently-Used (LRU) cache with a maximum size.
 *
 * When the cache reaches max size, the least recently accessed entry is evicted.
 * Useful for limiting memory usage while keeping hot data cached.
 *
 * @example
 * ```typescript
 * import { memoize, lruCache } from 'receta/memo'
 *
 * // Cache up to 100 users
 * const getUser = memoize(fetchUser, {
 *   cache: lruCache(100)
 * })
 *
 * // After 100 different users:
 * getUser('user-001') // cached
 * getUser('user-002') // cached
 * // ... 100 more calls ...
 * getUser('user-101') // causes 'user-001' to be evicted
 * ```
 *
 * @param maxSize - Maximum number of entries to cache
 */
export function lruCache<K, V>(maxSize: number): Cache<K, V> {
  if (maxSize <= 0) {
    throw new Error('lruCache: maxSize must be greater than 0')
  }

  // Using Map maintains insertion order
  // Most recent items are moved to the end
  const map = new Map<K, V>()

  return {
    get(key: K): Option<V> {
      const value = map.get(key)
      if (value === undefined) return none()

      // Move to end (mark as recently used)
      map.delete(key)
      map.set(key, value)

      return some(value)
    },

    set(key: K, value: V): void {
      // Remove if already exists (to update position)
      if (map.has(key)) {
        map.delete(key)
      }

      // Add to end
      map.set(key, value)

      // Evict least recently used if over max size
      if (map.size > maxSize) {
        const firstKey = map.keys().next().value as K
        if (firstKey !== undefined) {
          map.delete(firstKey)
        }
      }
    },

    has(key: K): boolean {
      return map.has(key)
    },

    delete(key: K): boolean {
      return map.delete(key)
    },

    clear(): void {
      map.clear()
    },
  }
}

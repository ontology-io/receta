import { Option, fromNullable } from 'receta/option'
import type { Cache } from '../types'

interface CacheEntry<V> {
  value: V
  expiresAt: number
}

/**
 * Creates a time-to-live (TTL) cache that automatically expires entries.
 *
 * Entries are removed after the specified TTL duration.
 * Useful for caching data that becomes stale (API responses, weather, prices, etc.).
 *
 * @example
 * ```typescript
 * import { memoize, ttlCache } from 'receta/memo'
 *
 * // Cache weather data for 5 minutes
 * const getWeather = memoize(fetchWeather, {
 *   cache: ttlCache(5 * 60 * 1000)
 * })
 *
 * getWeather('NYC') // fetches from API
 * getWeather('NYC') // cached
 * // ... 5 minutes later ...
 * getWeather('NYC') // fetches from API again
 * ```
 *
 * @param ttlMs - Time-to-live in milliseconds
 */
export function ttlCache<K, V>(ttlMs: number): Cache<K, V> {
  const map = new Map<K, CacheEntry<V>>()

  return {
    get(key: K): Option<V> {
      const entry = map.get(key)
      if (!entry) return undefined

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        map.delete(key)
        return undefined
      }

      return entry.value
    },

    set(key: K, value: V): void {
      map.set(key, {
        value,
        expiresAt: Date.now() + ttlMs,
      })
    },

    has(key: K): boolean {
      const entry = map.get(key)
      if (!entry) return false

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        map.delete(key)
        return false
      }

      return true
    },

    delete(key: K): boolean {
      return map.delete(key)
    },

    clear(): void {
      map.clear()
    },
  }
}

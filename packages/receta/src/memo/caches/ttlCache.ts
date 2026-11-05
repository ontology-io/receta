import type { Cache } from '../types'
import { boundedCache } from './boundedCache'

/**
 * Creates a time-to-live (TTL) cache that automatically expires entries.
 *
 * Entries are removed after the specified TTL duration.
 * Useful for caching data that becomes stale (API responses, weather, prices, etc.).
 *
 * @example
 * ```typescript
 * import { memoize, ttlCache } from '@ontologyio/receta/memo'
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
  return boundedCache({ ttl: ttlMs })
}

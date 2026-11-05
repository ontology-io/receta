import { type Option, isSome, none, some } from '../../option'
import type { Cache } from '../types'

interface CacheEntry<V> {
  readonly value: V
  readonly expiresAt: number
}

/** The limits a Map-backed cache can enforce. */
interface CacheBounds {
  readonly maxSize?: number
  readonly ttl?: number
}

/**
 * Creates a Map-backed cache with optional size and age limits.
 *
 * `ttlCache` is built on it, and so is the default cache of `memoize`, `memoizeBy`
 * and `memoizeAsync`. Past `maxSize`, the oldest entry goes. Entries older than `ttl`
 * milliseconds read as missing and are removed when next touched.
 *
 * @internal
 */
export function boundedCache<K, V>({ maxSize, ttl = Infinity }: CacheBounds = {}): Cache<K, V> {
  const entries = new Map<K, CacheEntry<V>>()

  const read = (key: K): Option<V> => {
    const entry = entries.get(key)
    if (entry === undefined) return none()
    if (Date.now() <= entry.expiresAt) return some(entry.value)

    entries.delete(key)
    return none()
  }

  return {
    get: read,

    set(key: K, value: V): void {
      entries.set(key, { value, expiresAt: Date.now() + ttl })

      if (maxSize && entries.size > maxSize) {
        entries.delete(entries.keys().next().value as K)
      }
    },

    has: (key: K): boolean => isSome(read(key)),

    delete: (key: K): boolean => entries.delete(key),

    clear(): void {
      entries.clear()
    },

    forEach(callback: (value: V, key: K) => void): void {
      entries.forEach((_entry, key) => {
        const current = read(key)
        if (isSome(current)) callback(current.value, key)
      })
    },
  }
}

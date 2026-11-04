import type { Option } from '../option/types'

/**
 * Cache interface that memoization functions can use.
 * Allows custom cache implementations (Map, LRU, TTL, WeakMap, etc.).
 */
export interface Cache<K, V> {
  get(key: K): Option<V>
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}

/**
 * Function that extracts a cache key from function arguments.
 */
export type KeyFn<Args extends readonly unknown[], K> = (...args: Args) => K

/**
 * Options for memoization functions.
 */
export interface MemoizeOptions<K = string> {
  /**
   * Custom cache implementation.
   * Defaults to a simple Map.
   */
  cache?: Cache<K, unknown>

  /**
   * Maximum number of cached entries (for built-in Map cache).
   * When exceeded, oldest entries are removed.
   */
  maxSize?: number

  /**
   * Time-to-live for cached entries in milliseconds.
   * Not applied yet: `memoize`, `memoizeBy` and `memoizeAsync` ignore it.
   * To expire entries, pass `cache: ttlCache(ms)` instead.
   */
  ttl?: number
}

/**
 * A memoized function with cache access.
 */
export interface MemoizedFunction<Args extends readonly unknown[], R> {
  (...args: Args): R
  cache: Cache<unknown, R>
  clear: () => void
}

/**
 * A memoized async function with cache access and deduplication.
 */
export interface MemoizedAsyncFunction<Args extends readonly unknown[], R> {
  (...args: Args): Promise<R>
  cache: Cache<unknown, Promise<R>>
  clear: () => void
}

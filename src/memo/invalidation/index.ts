import { isSome, unwrap } from '../../option'
import type { MemoizedFunction, MemoizedAsyncFunction } from '../types'

/**
 * Type alias for any memoized function (sync or async).
 */
type AnyMemoized = MemoizedFunction<any, any> | MemoizedAsyncFunction<any, any>

/**
 * Invalidates multiple cache entries by their keys.
 *
 * Useful when you know specific keys to invalidate after a batch operation.
 *
 * @example
 * ```typescript
 * import { memoize, invalidateMany } from 'receta/memo'
 *
 * const getUser = memoize(fetchUser)
 *
 * // After batch user update
 * await updateUsers(['1', '2', '3'], newData)
 * invalidateMany(getUser, ['1', '2', '3'])
 *
 * // Next calls will recompute
 * getUser('1') // Fetched again
 * getUser('2') // Fetched again
 * ```
 *
 * @param memoized - The memoized function to invalidate entries from
 * @param keys - Array of cache keys to invalidate
 */
export function invalidateMany<K>(memoized: AnyMemoized, keys: K[]): void {
  for (const key of keys) {
    memoized.cache.delete(key)
  }
}

/**
 * Invalidates cache entries matching a predicate.
 *
 * Useful for conditional invalidation based on key patterns or cached values.
 *
 * @example
 * ```typescript
 * import { memoize, invalidateWhere } from 'receta/memo'
 *
 * const getUser = memoizeBy(
 *   fetchUser,
 *   (id, type) => `${type}:${id}`
 * )
 *
 * // Invalidate all admin users
 * invalidateWhere(getUser, (key) => key.startsWith('admin:'))
 *
 * // Invalidate by value condition
 * invalidateWhere(getUser, (key, value) => {
 *   return value && value.deleted === true
 * })
 * ```
 *
 * @param memoized - The memoized function to invalidate entries from
 * @param predicate - Function that returns true for entries to invalidate
 */
export function invalidateWhere<K = unknown, V = unknown>(
  memoized: AnyMemoized,
  predicate: (key: K, value?: V) => boolean
): void {
  const cache = memoized.cache as any

  // Only Map-based caches support iteration
  if (typeof cache.forEach !== 'function') {
    throw new Error(
      'invalidateWhere only works with Map-based caches (default, ttlCache, lruCache). WeakMap does not support iteration.'
    )
  }

  const keysToDelete: K[] = []

  // Collect keys to delete (can't delete during iteration)
  // Note: forEach provides raw values (not wrapped in Option)
  cache.forEach((value: any, key: K) => {
    if (predicate(key as K, value as V)) {
      keysToDelete.push(key as K)
    }
  })

  // Delete collected keys
  for (const key of keysToDelete) {
    cache.delete(key)
  }
}

/**
 * Clears the cache of multiple memoized functions at once.
 *
 * Useful for coordinated invalidation across related caches.
 *
 * @example
 * ```typescript
 * import { memoize, memoizeAsync, invalidateAll } from 'receta/memo'
 *
 * const getUser = memoize(fetchUser)
 * const getUserPosts = memoizeAsync(fetchUserPosts)
 * const getUserComments = memoizeAsync(fetchUserComments)
 *
 * // After user deletion
 * async function deleteUser(id: string) {
 *   await db.users.delete(id)
 *
 *   // Clear all user-related caches
 *   invalidateAll(getUser, getUserPosts, getUserComments)
 * }
 *
 * // Alternative: clear specific entries before clearing all
 * getUser.cache.delete(id)
 * getUserPosts.cache.delete(id)
 * invalidateAll(getUserComments) // Clear everything from this one
 * ```
 *
 * @param memoized - One or more memoized functions to clear
 */
export function invalidateAll(...memoized: AnyMemoized[]): void {
  for (const fn of memoized) {
    fn.clear()
  }
}

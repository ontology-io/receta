import * as R from 'remeda'
import { Result, ok, err } from '../result'
import type { IndexConfig, DuplicateKeyError } from './types'
import { DuplicateKeyError as DuplicateKeyErrorClass } from './types'

/**
 * Creates an index (map) from an array, ensuring keys are unique.
 *
 * Returns a Result to handle duplicate key errors safely.
 * Useful for normalizing data and creating lookup tables.
 *
 * @param items - The array of items to index
 * @param getKey - Function to extract the key from each item
 * @param config - Configuration for collision handling
 * @returns Result containing either the index or a DuplicateKeyError
 *
 * @example
 * ```typescript
 * // Data-first
 * const users = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' }
 * ]
 *
 * indexByUnique(users, (u) => u.id)
 * // => Ok({ 1: { id: 1, name: 'Alice' }, 2: { id: 2, name: 'Bob' } })
 *
 * // Duplicate keys
 * const duplicates = [
 *   { id: 1, name: 'Alice' },
 *   { id: 1, name: 'Alicia' }
 * ]
 *
 * indexByUnique(duplicates, (u) => u.id)
 * // => Err(DuplicateKeyError: Duplicate key found: 1)
 *
 * // Handle collisions with config
 * indexByUnique(duplicates, (u) => u.id, { onCollision: 'last' })
 * // => Ok({ 1: { id: 1, name: 'Alicia' } }) // keeps last
 *
 * indexByUnique(duplicates, (u) => u.id, { onCollision: 'first' })
 * // => Ok({ 1: { id: 1, name: 'Alice' } }) // keeps first
 *
 * // Data-last (in pipe)
 * pipe(
 *   users,
 *   indexByUnique((u) => u.id)
 * )
 * ```
 *
 * @see nest - for hierarchical grouping
 */
export function indexByUnique<T, TKey extends string | number>(
  items: readonly T[],
  getKey: (item: T) => TKey,
  config?: IndexConfig
): Result<Record<TKey, T>, DuplicateKeyError>
export function indexByUnique<T, TKey extends string | number>(
  getKey: (item: T) => TKey,
  config?: IndexConfig
): (items: readonly T[]) => Result<Record<TKey, T>, DuplicateKeyError>
export function indexByUnique(...args: unknown[]): unknown {
  // Use Remeda's purry pattern for consistent data-first/data-last handling
  // Note: This requires handling optional 3rd parameter manually
  if (Array.isArray(args[0])) {
    // Data-first: indexByUnique(items, getKey, config?)
    return indexByUniqueImplementation(
      args[0] as readonly unknown[],
      args[1] as (item: unknown) => string | number,
      args[2] as IndexConfig | undefined
    )
  }

  // Data-last: indexByUnique(getKey, config?)
  const getKey = args[0] as (item: unknown) => string | number
  const config = args[1] as IndexConfig | undefined
  return (items: readonly unknown[]) => indexByUniqueImplementation(items, getKey, config)
}

function indexByUniqueImplementation<T, TKey extends string | number>(
  items: readonly T[],
  getKey: (item: T) => TKey,
  config: IndexConfig = {}
): Result<Record<TKey, T>, DuplicateKeyError> {
  const { onCollision = 'error' } = config
  const index: Record<TKey, T> = {} as Record<TKey, T>

  for (const item of items) {
    const key = getKey(item)

    if (key in index) {
      if (onCollision === 'error') {
        return err(new DuplicateKeyErrorClass(key))
      } else if (onCollision === 'first') {
        continue // Keep first, skip current
      }
      // onCollision === 'last' - overwrite with current
    }

    index[key] = item
  }

  return ok(index)
}

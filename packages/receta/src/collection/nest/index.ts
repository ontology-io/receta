import * as R from 'remeda'
import type { NestedMap } from '../types'

/**
 * Groups items hierarchically by multiple keys, creating a nested structure.
 *
 * Useful for organizing data like comments grouped by user and post,
 * or products grouped by category and subcategory.
 *
 * @param items - The array of items to nest
 * @param keys - Array of key selectors (property names or functions)
 * @returns A nested map structure
 *
 * @example
 * ```typescript
 * // Data-first
 * const comments = [
 *   { userId: 1, postId: 10, text: 'Hello' },
 *   { userId: 1, postId: 10, text: 'World' },
 *   { userId: 2, postId: 20, text: 'Foo' }
 * ]
 *
 * nest(comments, ['userId', 'postId'])
 * // => {
 * //   1: {
 * //     10: [{ userId: 1, postId: 10, text: 'Hello' }, { userId: 1, postId: 10, text: 'World' }]
 * //   },
 * //   2: {
 * //     20: [{ userId: 2, postId: 20, text: 'Foo' }]
 * //   }
 * // }
 *
 * // Data-last (in pipe)
 * pipe(
 *   comments,
 *   nest(['userId', 'postId'])
 * )
 * ```
 *
 * @see groupByPath - for grouping by a single nested path
 */
export function nest<T>(
  items: readonly T[],
  keys: readonly (keyof T | ((item: T) => string | number))[]
): NestedMap<T>
export function nest<T>(
  keys: readonly (keyof T | ((item: T) => string | number))[]
): (items: readonly T[]) => NestedMap<T>
export function nest(...args: unknown[]): unknown {
  return R.purry(nestImplementation, args)
}

function nestImplementation<T>(
  items: readonly T[],
  keys: readonly (keyof T | ((item: T) => string | number))[]
): NestedMap<T> {
  if (keys.length === 0) {
    return items as unknown as NestedMap<T>
  }

  const [firstKey, ...restKeys] = keys
  const grouped = R.groupBy(items, (item) => {
    if (typeof firstKey === 'function') {
      return String(firstKey(item))
    }
    const value = item[firstKey as keyof T]
    return String(value)
  })

  if (restKeys.length === 0) {
    return grouped as NestedMap<T>
  }

  return R.mapValues(grouped, (group) =>
    nestImplementation(group, restKeys)
  ) as NestedMap<T>
}

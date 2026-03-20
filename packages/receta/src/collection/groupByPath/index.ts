import * as R from 'remeda'
import { getPath } from '../../object/getPath'
import { unwrapOr } from '../../option'
import { instrumentedPurry } from '../../utils'

/**
 * Groups items by a nested object path.
 *
 * Useful for grouping objects by nested properties like `user.role` or `metadata.category`.
 *
 * Uses type-safe path access via Option pattern. Items with undefined/null paths
 * are grouped under the 'undefined' key.
 *
 * @param items - The array of items to group
 * @param path - Dot-separated path to the property (e.g., 'user.role')
 * @returns A record mapping path values to arrays of items
 *
 * @example
 * ```typescript
 * // Data-first
 * const users = [
 *   { name: 'Alice', profile: { role: 'admin' } },
 *   { name: 'Bob', profile: { role: 'user' } },
 *   { name: 'Charlie', profile: { role: 'admin' } }
 * ]
 *
 * groupByPath(users, 'profile.role')
 * // => {
 * //   admin: [
 * //     { name: 'Alice', profile: { role: 'admin' } },
 * //     { name: 'Charlie', profile: { role: 'admin' } }
 * //   ],
 * //   user: [{ name: 'Bob', profile: { role: 'user' } }]
 * // }
 *
 * // Data-last (in pipe)
 * pipe(
 *   users,
 *   groupByPath('profile.role')
 * )
 * ```
 *
 * @see nest - for multi-level hierarchical grouping
 */
export function groupByPath<T>(
  items: readonly T[],
  path: string
): Record<string, T[]>
export function groupByPath<T>(
  path: string
): (items: readonly T[]) => Record<string, T[]>
export function groupByPath(...args: unknown[]): unknown {
  return instrumentedPurry('groupByPath', 'collection', groupByPathImplementation, args)
}

function groupByPathImplementation<T>(
  items: readonly T[],
  path: string
): Record<string, T[]> {
  const keys = path.split('.')

  return R.groupBy(items, (item) => {
    // Use type-safe getPath from object module with Option pattern
    const valueOption = getPath<unknown>(keys, item as Record<string, unknown>)
    const value = unwrapOr(valueOption, undefined)
    return String(value)
  })
}

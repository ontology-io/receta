import type { Comparator, Nullable } from './types'

/**
 * Composes multiple comparators into a single comparator with priority ordering.
 *
 * Applies comparators in order: if the first comparator returns 0 (equal),
 * tries the second, and so on. This enables multi-level sorting like
 * "sort by status, then by priority, then by date".
 *
 * @param comparators - Comparators in priority order (first = highest priority)
 * @returns A composed comparator
 *
 * @example
 * ```typescript
 * interface Issue {
 *   status: 'open' | 'closed'
 *   priority: 'low' | 'medium' | 'high'
 *   createdAt: Date
 * }
 *
 * const issues: Issue[] = [
 *   { status: 'open', priority: 'high', createdAt: new Date('2024-01-03') },
 *   { status: 'open', priority: 'low', createdAt: new Date('2024-01-01') },
 *   { status: 'closed', priority: 'high', createdAt: new Date('2024-01-02') },
 *   { status: 'open', priority: 'high', createdAt: new Date('2024-01-04') }
 * ]
 *
 * // Sort by: status (open first), then priority (high first), then date (oldest first)
 * const priorityOrder = { high: 0, medium: 1, low: 2 }
 * const statusOrder = { open: 0, closed: 1 }
 *
 * issues.sort(
 *   compose(
 *     ascending(i => statusOrder[i.status]),
 *     ascending(i => priorityOrder[i.priority]),
 *     ascending(i => i.createdAt)
 *   )
 * )
 * ```
 *
 * @see withTiebreaker - for explicit two-level sorting
 */
export function compose<T>(...comparators: Comparator<T>[]): Comparator<T> {
  return (a, b) => {
    for (const comparator of comparators) {
      const result = comparator(a, b)
      if (result !== 0) return result
    }
    return 0
  }
}

/**
 * Reverses the order of a comparator.
 *
 * Useful for inverting existing comparators without rewriting logic.
 *
 * @param comparator - The comparator to reverse
 * @returns A reversed comparator
 *
 * @example
 * ```typescript
 * const users = [
 *   { name: 'Alice', score: 100 },
 *   { name: 'Bob', score: 200 },
 *   { name: 'Charlie', score: 150 }
 * ]
 *
 * // Sort by score ascending
 * const scoreAsc = ascending(u => u.score)
 * users.sort(scoreAsc) // => [100, 200, 150] -> [100, 150, 200]
 *
 * // Reverse it for descending
 * users.sort(reverse(scoreAsc)) // => [200, 150, 100]
 *
 * // Equivalent to:
 * users.sort(descending(u => u.score))
 * ```
 *
 * @see ascending - consider using descending instead
 * @see descending - consider using ascending instead
 */
export function reverse<T>(comparator: Comparator<T>): Comparator<T> {
  return (a, b) => comparator(b, a)
}

/**
 * Wraps a comparator to place null/undefined values first.
 *
 * When comparing two null/undefined values, they are considered equal.
 * When comparing null/undefined with a non-null value, null comes first.
 *
 * @param comparator - The comparator for non-null values
 * @returns A comparator that places nulls first
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   lastLogin: Date | null
 * }
 *
 * const users = [
 *   { name: 'Alice', lastLogin: new Date('2024-01-15') },
 *   { name: 'Bob', lastLogin: null },
 *   { name: 'Charlie', lastLogin: new Date('2024-01-10') },
 *   { name: 'Dave', lastLogin: null }
 * ]
 *
 * // Sort by last login, nulls first
 * users.sort(nullsFirst(ascending(u => u.lastLogin ?? new Date(0))))
 * // => [{ name: 'Bob', lastLogin: null },
 * //     { name: 'Dave', lastLogin: null },
 * //     { name: 'Charlie', lastLogin: 2024-01-10 },
 * //     { name: 'Alice', lastLogin: 2024-01-15 }]
 * ```
 *
 * @see nullsLast - to place nulls at the end
 */
export function nullsFirst<T>(comparator: Comparator<Nullable<T>>): Comparator<Nullable<T>> {
  return (a, b) => {
    const aIsNull = a == null
    const bIsNull = b == null

    if (aIsNull && bIsNull) return 0
    if (aIsNull) return -1
    if (bIsNull) return 1

    return comparator(a, b)
  }
}

/**
 * Wraps a comparator to place null/undefined values last.
 *
 * When comparing two null/undefined values, they are considered equal.
 * When comparing null/undefined with a non-null value, null comes last.
 *
 * @param comparator - The comparator for non-null values
 * @returns A comparator that places nulls last
 *
 * @example
 * ```typescript
 * interface Product {
 *   name: string
 *   discount: number | null
 * }
 *
 * const products = [
 *   { name: 'Keyboard', discount: 10 },
 *   { name: 'Mouse', discount: null },
 *   { name: 'Monitor', discount: 20 },
 *   { name: 'Webcam', discount: null }
 * ]
 *
 * // Sort by discount descending, nulls last
 * products.sort(nullsLast(descending(p => p.discount ?? 0)))
 * // => [{ name: 'Monitor', discount: 20 },
 * //     { name: 'Keyboard', discount: 10 },
 * //     { name: 'Mouse', discount: null },
 * //     { name: 'Webcam', discount: null }]
 * ```
 *
 * @see nullsFirst - to place nulls at the beginning
 */
export function nullsLast<T>(comparator: Comparator<Nullable<T>>): Comparator<Nullable<T>> {
  return (a, b) => {
    const aIsNull = a == null
    const bIsNull = b == null

    if (aIsNull && bIsNull) return 0
    if (aIsNull) return 1
    if (bIsNull) return -1

    return comparator(a, b)
  }
}

/**
 * Combines a primary comparator with a tiebreaker for when values are equal.
 *
 * More explicit alternative to `compose` for two-level sorting.
 *
 * @param primary - The primary comparator
 * @param tiebreaker - The comparator to use when primary returns 0
 * @returns A comparator with explicit tiebreaking
 *
 * @example
 * ```typescript
 * interface Player {
 *   name: string
 *   score: number
 *   level: number
 * }
 *
 * const players = [
 *   { name: 'Alice', score: 1000, level: 5 },
 *   { name: 'Bob', score: 1000, level: 3 },
 *   { name: 'Charlie', score: 800, level: 4 }
 * ]
 *
 * // Sort by score (descending), break ties by level (descending)
 * players.sort(
 *   withTiebreaker(
 *     descending(p => p.score),
 *     descending(p => p.level)
 *   )
 * )
 * // => [{ name: 'Alice', score: 1000, level: 5 },
 * //     { name: 'Bob', score: 1000, level: 3 },
 * //     { name: 'Charlie', score: 800, level: 4 }]
 * ```
 *
 * @see compose - for multi-level sorting with more than 2 levels
 */
export function withTiebreaker<T>(
  primary: Comparator<T>,
  tiebreaker: Comparator<T>
): Comparator<T> {
  return (a, b) => {
    const result = primary(a, b)
    return result !== 0 ? result : tiebreaker(a, b)
  }
}

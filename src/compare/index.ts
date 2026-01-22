/**
 * Compare module - Comparator builders for sorting and ordering.
 *
 * Provides composable comparators for sorting arrays of complex objects with
 * type-safe, reusable comparison logic.
 *
 * @module compare
 *
 * @example
 * ```typescript
 * import { ascending, compose, byDate } from 'receta/compare'
 *
 * interface Issue {
 *   status: string
 *   priority: number
 *   createdAt: Date
 * }
 *
 * // Multi-level sorting
 * issues.sort(
 *   compose(
 *     ascending(i => i.status),
 *     ascending(i => i.priority),
 *     byDate(i => i.createdAt)
 *   )
 * )
 * ```
 */

// Types
export type { Comparator, StringCompareOptions, Nullable, ComparableExtractor } from './types'

// Basic comparators
export { ascending, descending, natural, byKey } from './basic'

// Comparator combinators
export { compose, reverse, nullsFirst, nullsLast, withTiebreaker } from './combinators'

// Type-specific comparators
export { byDate, byNumber, byString, byBoolean } from './typed'

// Advanced comparators
export { caseInsensitive, localeCompare } from './advanced'

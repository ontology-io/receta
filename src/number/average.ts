import type { Option } from '../option/types'
import { none, some } from '../option/constructors'
import { sum } from './sum'

/**
 * Calculates the average (mean) of an array of numbers.
 *
 * Returns None for an empty array to avoid division by zero.
 *
 * @param values - Array of numbers to average
 * @returns Some containing the average, or None if the array is empty
 *
 * @example
 * ```typescript
 * average([1, 2, 3, 4]) // => Some(2.5)
 * average([10]) // => Some(10)
 * average([]) // => None
 *
 * // With Option handling
 * pipe(
 *   average(scores),
 *   unwrapOr(0)
 * )
 *
 * // Real-world: Rating calculation
 * const calculateRating = (ratings: number[]) =>
 *   pipe(
 *     average(ratings),
 *     map(rating => rating.toFixed(1))
 *   )
 * ```
 *
 * @see sum - for calculating the total
 */
export function average(values: readonly number[]): Option<number> {
  if (values.length === 0) {
    return none()
  }

  return some(sum(values) / values.length)
}

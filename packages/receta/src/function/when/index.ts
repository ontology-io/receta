import type { Predicate, Mapper } from '../types'
import { instrumentedPurryConfig2 } from '../../utils'

/**
 * Creates a function that conditionally applies a transformation.
 *
 * Returns a function that tests its input against the predicate. If the predicate
 * passes, applies the given function; otherwise returns the input unchanged.
 *
 * This is useful for conditional transformations where you want to preserve
 * the original value when the condition is not met.
 *
 * @example
 * ```typescript
 * const ensurePositive = when(
 *   (n: number) => n < 0,
 *   (n) => Math.abs(n)
 * )
 *
 * ensurePositive(-5)  // => 5
 * ensurePositive(3)   // => 3
 * ensurePositive(0)   // => 0
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = when(
 *   (str: string) => str.length === 0,
 *   () => 'default',
 *   ''
 * )
 * // => 'default'
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe for conditional transformations
 * pipe(
 *   getUserInput(),
 *   when(
 *     (input) => input.trim().length === 0,
 *     () => 'Anonymous'
 *   ),
 *   processUsername
 * )
 * ```
 *
 * @see unless - for the inverse condition
 */
export function when<T>(predicate: Predicate<T>, fn: Mapper<T, T>): (value: T) => T
export function when<T>(predicate: Predicate<T>, fn: Mapper<T, T>, value: T): T
export function when(...args: unknown[]): unknown {
  return instrumentedPurryConfig2('when', 'function', whenImplementation, args)
}

function whenImplementation<T>(predicate: Predicate<T>, fn: Mapper<T, T>, value: T): T {
  return predicate(value) ? fn(value) : value
}

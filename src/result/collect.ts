import * as R from 'remeda'
import type { Result } from './types'
import { ok, err } from './constructors'
import { isErr } from './guards'

/**
 * Collects an array of Results into a single Result of an array.
 *
 * If all Results are Ok, returns Ok with an array of all values.
 * If any Result is Err, returns the first Err encountered.
 *
 * This is useful for validating multiple independent operations and
 * collecting all successes or short-circuiting on the first error.
 *
 * @param results - Array of Results to collect
 * @returns Result containing array of all values, or first error
 *
 * @example
 * ```typescript
 * // All successful
 * collect([ok(1), ok(2), ok(3)])
 * // => Ok([1, 2, 3])
 *
 * // First error short-circuits
 * collect([ok(1), err('fail'), ok(3)])
 * // => Err('fail')
 *
 * // Practical use case
 * const validateUser = (data: unknown) => pipe(
 *   [
 *     validateName(data.name),
 *     validateEmail(data.email),
 *     validateAge(data.age)
 *   ],
 *   collect,
 *   map(([name, email, age]) => ({ name, email, age }))
 * )
 * ```
 *
 * @see partition - for separating Ok and Err values
 */
export function collect<T, E>(results: readonly Result<T, E>[]): Result<T[], E>
export function collect<T>(): <E>(results: readonly Result<T, E>[]) => Result<T[], E>
export function collect(...args: unknown[]): unknown {
  return R.purry(collectImplementation, args)
}

function collectImplementation<T, E>(results: readonly Result<T, E>[]): Result<T[], E> {
  const values: T[] = []

  for (const result of results) {
    if (isErr(result)) {
      return result
    }
    values.push(result.value)
  }

  return ok(values)
}

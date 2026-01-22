import type { Predicate, Mapper } from './types'
import { purryConfig3 } from '../utils'

/**
 * Creates a function that conditionally applies one of two functions based on a predicate.
 *
 * Returns a function that tests its input against the predicate, then applies
 * either `onTrue` if the predicate passes, or `onFalse` if it fails.
 *
 * @example
 * ```typescript
 * const classify = ifElse(
 *   (n: number) => n >= 0,
 *   (n) => 'positive',
 *   (n) => 'negative'
 * )
 *
 * classify(5)   // => 'positive'
 * classify(-3)  // => 'negative'
 * classify(0)   // => 'positive'
 * ```
 *
 * @example
 * ```typescript
 * // Data-first signature
 * const result = ifElse(
 *   (age: number) => age >= 18,
 *   (age) => ({ status: 'adult', age }),
 *   (age) => ({ status: 'minor', age }),
 *   25
 * )
 * // => { status: 'adult', age: 25 }
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe
 * pipe(
 *   fetchUser(),
 *   ifElse(
 *     (user) => user.role === 'admin',
 *     (user) => grantFullAccess(user),
 *     (user) => grantLimitedAccess(user)
 *   )
 * )
 * ```
 */
export function ifElse<T, U>(
  predicate: Predicate<T>,
  onTrue: Mapper<T, U>,
  onFalse: Mapper<T, U>
): (value: T) => U
export function ifElse<T, U>(
  predicate: Predicate<T>,
  onTrue: Mapper<T, U>,
  onFalse: Mapper<T, U>,
  value: T
): U
export function ifElse(...args: unknown[]): unknown {
  return purryConfig3(ifElseImplementation, args)
}

function ifElseImplementation<T, U>(
  predicate: Predicate<T>,
  onTrue: Mapper<T, U>,
  onFalse: Mapper<T, U>,
  value: T
): U {
  return predicate(value) ? onTrue(value) : onFalse(value)
}

import * as R from 'remeda'
import { err, ok, type Result } from '@ontologyio/receta/result'

/**
 * Checks a plain value and returns Ok(value) when it passes, or an Err built from the value when it doesn't.
 *
 * Use when: a value of unknown or loose type has to enter a `Result` pipe, such as a field
 * of a parsed body, a function argument or a value read from storage, and the check is a
 * predicate or a type guard. With a guard such as `isString` or `R.isArray`, the Ok value
 * gets the narrowed type, so no cast is needed afterwards.
 *
 * @example
 * ```ts
 * import { gte, isString } from '@ontologyio/receta/predicate'
 *
 * const body: Record<string, unknown> = { email: 'ada@example.com', age: 17 }
 *
 * resultFromPredicate(body['email'], isString, () => 'email must be text')
 * // => Ok('ada@example.com')
 *
 * resultFromPredicate(17, gte(18), (age) => `must be 18 or older, got ${age}`)
 * // => Err('must be 18 or older, got 17')
 *
 * R.pipe(body['name'], resultFromPredicate(isString, () => 'name is required'))
 * // => Err('name is required')
 * ```
 *
 * @tags predicate, guard, check, unknown, narrow, validate, assert, from value
 * @see ensure - the same check on the value inside an Ok
 * @see fromNullable - @ontologyio/receta/result, for the missing-value case alone
 */
export function resultFromPredicate<T, S extends T, E>(
  value: T,
  check: (value: T) => value is S,
  toError: (value: T) => E,
): Result<S, E>
export function resultFromPredicate<T, E>(
  value: T,
  check: (value: T) => boolean,
  toError: (value: T) => E,
): Result<T, E>
export function resultFromPredicate<T, S extends T, E>(
  check: (value: T) => value is S,
  toError: (value: T) => E,
): (value: T) => Result<S, E>
export function resultFromPredicate<T, E>(
  check: (value: T) => boolean,
  toError: (value: T) => E,
): (value: T) => Result<T, E>
export function resultFromPredicate(...args: unknown[]): unknown {
  return R.purry(resultFromPredicateImplementation, args)
}

const resultFromPredicateImplementation = <T, E>(
  value: T,
  check: (value: T) => boolean,
  toError: (value: T) => E,
): Result<T, E> => (check(value) ? ok(value) : err(toError(value)))

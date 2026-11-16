import * as R from 'remeda'
import { err, flatMap, ok, type Result } from '@ontologyio/receta/result'

/**
 * Keeps an Ok only when its value passes a check, and turns it into an Err built from the value otherwise.
 *
 * Use when: a parse or a load succeeded but the value still breaks a rule, such as a
 * number that must be positive, a list that must not be empty, a user who must be active or
 * a date that must be in the future, and the pipe should carry on as one `Result`. An `Err`
 * passes through untouched and the check never runs. With a type guard such as `isString`,
 * the Ok value's type narrows.
 *
 * @example
 * ```ts
 * import { isInteger } from '@ontologyio/receta/number'
 * import { gt } from '@ontologyio/receta/predicate'
 * import { ok, parseNumber } from '@ontologyio/receta/result'
 *
 * ensure(ok(5), gt(0), (n) => `expected a positive number, got ${n}`)
 * // => Ok(5)
 *
 * R.pipe(ok(-3), ensure(gt(0), (n) => `expected a positive number, got ${n}`))
 * // => Err('expected a positive number, got -3')
 *
 * R.pipe(
 *   parseNumber('2.5'),
 *   ensure(isInteger, () => 'expected a whole number'),
 *   ensure(gt(0), () => 'expected a positive number'),
 * )
 * // => Err('expected a whole number')
 * ```
 *
 * @tags check, guard, assert, validate, rule, filter, refine, narrow
 * @see resultFromPredicate - the same check on a plain value
 * @see flatMap - @ontologyio/receta/result, the chaining underneath
 */
export function ensure<T, S extends T, E, F>(
  result: Result<T, E>,
  check: (value: T) => value is S,
  toError: (value: T) => F,
): Result<S, E | F>
export function ensure<T, E, F>(
  result: Result<T, E>,
  check: (value: T) => boolean,
  toError: (value: T) => F,
): Result<T, E | F>
export function ensure<T, S extends T, F>(
  check: (value: T) => value is S,
  toError: (value: T) => F,
): <E>(result: Result<T, E>) => Result<S, E | F>
export function ensure<T, F>(
  check: (value: T) => boolean,
  toError: (value: T) => F,
): <E>(result: Result<T, E>) => Result<T, E | F>
export function ensure(...args: unknown[]): unknown {
  return R.purry(ensureImplementation, args)
}

const ensureImplementation = <T, E, F>(
  result: Result<T, E>,
  check: (value: T) => boolean,
  toError: (value: T) => F,
): Result<T, E | F> =>
  flatMap(result, (value): Result<T, F> => (check(value) ? ok(value) : err(toError(value))))

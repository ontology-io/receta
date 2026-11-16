import * as R from 'remeda'
import { fromNullable, match, none, some, type Option } from '@ontologyio/receta/option'
import { map, ok, type Result } from '@ontologyio/receta/result'

/**
 * Runs a step that returns a Result only when a value is present: missing is Ok(None), and a present value is parsed or checked.
 *
 * Use when: an optional field still has to be valid when it's given, such as an optional
 * `TIMEOUT` variable, a `?limit=` parameter, a middle name or a coupon code. `null` and
 * `undefined` mean "not given" and succeed as `None`; anything else goes through the step,
 * and its `Err` comes back as is. An empty string counts as present, so trim and check for
 * blank first if it should mean missing.
 *
 * @example
 * ```ts
 * import { mapErr, parseNumber } from '@ontologyio/receta/result'
 *
 * ifPresent('30', parseNumber)
 * // => Ok(Some(30))
 *
 * ifPresent(undefined, parseNumber)
 * // => Ok(None)
 *
 * R.pipe('soon', ifPresent(parseNumber), mapErr((error) => error.reason))
 * // => Err('not_a_number')
 * ```
 *
 * @tags optional, nullable, maybe, parse if present, undefined, field, query, env
 * @see parseOptionalInt - the same idea for one integer field, where blank also means missing
 * @see some - @ontologyio/receta/option, wraps the parsed value
 */
export function ifPresent<T, U, E>(
  value: T | null | undefined,
  step: (value: T) => Result<U, E>,
): Result<Option<U>, E>
export function ifPresent<T, U, E>(
  step: (value: T) => Result<U, E>,
): (value: T | null | undefined) => Result<Option<U>, E>
export function ifPresent(...args: unknown[]): unknown {
  return R.purry(ifPresentImplementation, args)
}

const ifPresentImplementation = <T, U, E>(
  value: T | null | undefined,
  step: (value: T) => Result<U, E>,
): Result<Option<U>, E> =>
  match(fromNullable(value), {
    onSome: (present) => map(step(present), (parsed): Option<U> => some(parsed)),
    onNone: (): Result<Option<U>, E> => ok(none()),
  })

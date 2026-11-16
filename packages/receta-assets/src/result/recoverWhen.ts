import * as R from 'remeda'
import { oneOf } from '@ontologyio/receta/predicate'
import { isErr, ok, type Result } from '@ontologyio/receta/result'

/**
 * Turns an Err into an Ok only when its `code` is one you list; every other error passes through.
 *
 * Use when: some failures are normal outcomes with a sensible value, such as `NOT_FOUND`
 * meaning an empty list, `CACHE_MISS` meaning "load it", or `ALREADY_EXISTS` meaning the
 * work was done, while the rest must still fail loudly. When the error type is a union of
 * codes, the recovered codes leave the error type. Recovering from everything hides real
 * problems; prefer naming the codes.
 *
 * @example
 * ```ts
 * import { err, type Result } from '@ontologyio/receta/result'
 *
 * type LoadError = { code: 'NOT_FOUND' } | { code: 'TIMEOUT'; ms: number }
 * const missing: Result<string[], LoadError> = err({ code: 'NOT_FOUND' })
 * const slow: Result<string[], LoadError> = err({ code: 'TIMEOUT', ms: 3000 })
 *
 * recoverWhen(missing, ['NOT_FOUND'], () => [])
 * // => Ok([])
 *
 * R.pipe(slow, recoverWhen(['NOT_FOUND'], () => []))
 * // => Err({ code: 'TIMEOUT', ms: 3000 })
 * ```
 *
 * @tags recover, fallback, error code, not found, default, ignore error, expected error
 * @see orElse - recovers from any error, with a Result
 * @see oneOf - @ontologyio/receta/predicate, matches the listed codes
 */
export function recoverWhen<T, E extends { readonly code: string }, const C extends E['code'], U>(
  result: Result<T, E>,
  codes: readonly C[],
  recover: (error: E) => U,
): Result<T | U, Exclude<E, { readonly code: C }>>
export function recoverWhen<E extends { readonly code: string }, const C extends E['code'], U>(
  codes: readonly C[],
  recover: (error: E) => U,
): <T>(result: Result<T, E>) => Result<T | U, Exclude<E, { readonly code: C }>>
export function recoverWhen(...args: unknown[]): unknown {
  return R.purry(recoverWhenImplementation, args)
}

const recoverWhenImplementation = <T, E extends { readonly code: string }, U>(
  result: Result<T, E>,
  codes: readonly string[],
  recover: (error: E) => U,
): Result<T | U, E> =>
  isErr(result) && oneOf(codes)(result.error.code) ? ok(recover(result.error)) : result

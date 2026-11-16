import * as R from 'remeda'
import { isErr, type Err, type Result } from '@ontologyio/receta/result'

/**
 * Checks whether a Result is an Err with a given `code`, and narrows the error to that code's shape when it is.
 *
 * Use when: one error code needs its own branch, such as answering 404 for `NOT_FOUND`,
 * asking for a login on `UNAUTHENTICATED`, highlighting a field on `INVALID`, or counting
 * timeouts in a batch. Inside the `if`, TypeScript knows the error's extra fields for that
 * code. Works with `R.filter` in its data-last form.
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type SaveError = { code: 'CONFLICT' } | { code: 'INVALID'; field: string }
 * const saved: Result<number, SaveError> = err({ code: 'INVALID', field: 'email' })
 *
 * isErrWithCode(saved, 'INVALID')
 * // => true
 *
 * const field = isErrWithCode(saved, 'INVALID') ? saved.error.field : 'none'
 * // => 'email'
 *
 * const outcomes: Result<number, SaveError>[] = [ok(1), err({ code: 'CONFLICT' }), ok(2)]
 * R.filter(outcomes, isErrWithCode('CONFLICT')).length
 * // => 1
 * ```
 *
 * @tags error code, narrow, type guard, branch, check error, discriminate, filter
 * @see recoverWhen - turns chosen codes into a value
 * @see isErr - @ontologyio/receta/result, the check without a code
 */
export function isErrWithCode<T, E extends { readonly code: string }, const C extends E['code']>(
  result: Result<T, E>,
  code: C,
): result is Err<E & { readonly code: C }>
export function isErrWithCode<E extends { readonly code: string }, const C extends E['code']>(
  code: C,
): <T>(result: Result<T, E>) => result is Err<E & { readonly code: C }>
export function isErrWithCode(...args: unknown[]): unknown {
  return R.purry(isErrWithCodeImplementation, args)
}

const isErrWithCodeImplementation = <T, E extends { readonly code: string }>(
  result: Result<T, E>,
  code: string,
): boolean => isErr(result) && result.error.code === code

import * as R from 'remeda'
import { guard, type GuardPair } from '@ontologyio/receta/function'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type GuardInputCheck<T, C extends string> = readonly [
  test: (value: T) => boolean,
  code: C,
  message: string | ((value: T) => string),
]

export type GuardInputError<T, C extends string> = {
  readonly code: C
  readonly input: T
  readonly message: string
}

/**
 * Runs checks in order and stops at the first that fails, returning its code and message.
 *
 * Use when: an action needs a gate before it runs, such as a command's arguments, a request
 * about to be queued or a value about to be saved, and only the first reason matters. Each
 * check is `[test, code, message]`, where the message can be a function of the value. Checks
 * after the failing one don't run, so a later check can rely on the earlier ones. To report
 * every failing check at once, use a Validation instead.
 *
 * @example
 * ```ts
 * import { isFiniteNumber, gt, lte } from '@ontologyio/receta/predicate'
 *
 * const quantity = [
 *   [isFiniteNumber, 'NOT_A_NUMBER', 'Quantity must be a number'],
 *   [gt(0), 'TOO_SMALL', 'Order at least one'],
 *   [lte(10), 'TOO_LARGE', (n: number) => `At most 10 per order, got ${n}`],
 * ] as const
 *
 * guardInput(3, quantity)
 * // => Ok(3)
 *
 * guardInput(12, quantity)
 * // => Err({ code: 'TOO_LARGE', input: 12, message: 'At most 10 per order, got 12' })
 *
 * R.pipe(0, guardInput(quantity))
 * // => Err({ code: 'TOO_SMALL', input: 0, message: 'Order at least one' })
 * ```
 *
 * @tags guard, precondition, check, gate, first error, fail fast, assert, input
 * @see guard - @ontologyio/receta/function, the ordered checks underneath
 * @see normalizeThenGuard - cleans the value up before the same checks
 */
export function guardInput<T, C extends string>(
  value: T,
  checks: readonly GuardInputCheck<T, C>[],
): Result<T, GuardInputError<T, C>>
export function guardInput<T, C extends string>(
  checks: readonly GuardInputCheck<T, C>[],
): (value: T) => Result<T, GuardInputError<T, C>>
export function guardInput(...args: unknown[]): unknown {
  return R.purry(guardInputImplementation, args)
}

const guardInputImplementation = <T, C extends string>(
  value: T,
  checks: readonly GuardInputCheck<T, C>[],
): Result<T, GuardInputError<T, C>> => {
  // guard reports the failing pair's error, so each check is its own error and keeps its message.
  const pairs = R.map(checks, (check): GuardPair<T, GuardInputCheck<T, C>> => [check[0], check])
  return R.pipe(
    guard(pairs, value),
    mapErr(([, code, message]) => ({
      code,
      input: value,
      message: R.isFunction(message) ? message(value) : message,
    })),
  )
}

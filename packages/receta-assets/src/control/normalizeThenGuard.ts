import * as R from 'remeda'
import { guard, type GuardPair } from '@ontologyio/receta/function'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type NormalizeThenGuardCheck<T, C extends string> = readonly [
  test: (value: T) => boolean,
  code: C,
  message: string | ((value: T) => string),
]

export type NormalizeThenGuardError<I, T, C extends string> = {
  readonly code: C
  /** What the caller passed in, before normalizing. */
  readonly input: I
  /** The value the failing check saw. */
  readonly normalized: T
  readonly message: string
}

/**
 * Builds a function that cleans a value up first, then checks it in order and stops at the first failure.
 *
 * Use when: users type a value in many forms and the checks should see one, such as a username,
 * a coupon code, a tag or an SKU that is trimmed and lowercased before its rules run. The `Ok`
 * holds the normalized value, ready to store. The error keeps both the raw input and the
 * normalized value, so a message can quote either. A message can be a function of the value.
 *
 * @example
 * ```ts
 * import { matches, not, oneOf } from '@ontologyio/receta/predicate'
 *
 * const toUsername = normalizeThenGuard(
 *   (raw: string) => raw.trim().toLowerCase(),
 *   [
 *     [matches(/^.{3,20}$/), 'LENGTH', 'Use 3 to 20 characters'],
 *     [matches(/^[a-z0-9_]+$/), 'CHARACTERS', 'Use letters, digits and _ only'],
 *     [not(oneOf(['admin', 'root'])), 'RESERVED', (name) => `"${name}" is reserved`],
 *   ],
 * )
 *
 * toUsername('  Ada_Lovelace ')
 * // => Ok('ada_lovelace')
 *
 * toUsername(' Admin ')
 * // => Err({ code: 'RESERVED', input: ' Admin ', normalized: 'admin', message: '"admin" is reserved' })
 *
 * toUsername('hi there')
 * // => Err({ code: 'CHARACTERS', input: 'hi there', normalized: 'hi there', message: 'Use letters, digits and _ only' })
 * ```
 *
 * @tags normalize, sanitize, guard, username, coupon, canonical, trim, lowercase, check
 * @see guard - @ontologyio/receta/function, the ordered checks after normalizing
 * @see guardInput - the same checks without a normalizing step
 */
export function normalizeThenGuard<I, T, C extends string>(
  normalize: (input: I) => T,
  checks: readonly NormalizeThenGuardCheck<T, C>[],
): (input: I) => Result<T, NormalizeThenGuardError<I, T, C>> {
  // guard reports the failing pair's error, so each check is its own error and keeps its message.
  const pairs = R.map(checks, (check): GuardPair<T, NormalizeThenGuardCheck<T, C>> => [check[0], check])
  return (input) => {
    const normalized = normalize(input)
    return R.pipe(
      guard(pairs, normalized),
      mapErr(([, code, message]) => ({
        code,
        input,
        normalized,
        message: R.isFunction(message) ? message(normalized) : message,
      })),
    )
  }
}

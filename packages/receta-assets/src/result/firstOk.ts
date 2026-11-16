import * as R from 'remeda'
import { err, isOk, mapErr, type Result } from '@ontologyio/receta/result'

/**
 * Tries a list of fallbacks in order and returns the first Ok, calling each one only if everything before it failed.
 *
 * Use when: a value can come from several places in order of preference, such as an
 * explicit setting, then an environment variable, then a config file, or several parsers
 * for the formats an input may be in. Attempts are functions, so later ones never run once
 * an earlier one succeeds. When all fail, the `Err` holds every error in order; an empty list
 * is `Err([])`.
 *
 * @example
 * ```ts
 * import { err, ok, parseNumber } from '@ontologyio/receta/result'
 *
 * firstOk([() => err('no flag'), () => ok(8080), () => ok(3000)])
 * // => Ok(8080)
 *
 * firstOk([() => err('no flag'), () => err('no env')])
 * // => Err(['no flag', 'no env'])
 *
 * const timeout = firstOk([() => parseNumber('soon'), () => parseNumber('30')])
 * // => Ok(30)
 * ```
 *
 * @tags fallback, first, alternative, try in order, config, cascade, or else
 * @see firstOkAsync - the same for async attempts, such as cache, then database, then API
 * @see firstSome - the same for Options, when the reasons don't matter
 * @see orElse - one fallback that receives the error
 */
export function firstOk<T, E>(
  attempts: readonly (() => Result<T, E>)[],
): Result<T, readonly E[]> {
  return R.reduce(
    attempts,
    (previous: Result<T, readonly E[]>, attempt) =>
      isOk(previous) ? previous : mapErr(attempt(), (error) => [...previous.error, error]),
    err([]),
  )
}

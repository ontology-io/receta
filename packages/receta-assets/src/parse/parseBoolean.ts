import * as R from 'remeda'
import { oneOf } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type ParseBooleanError = {
  readonly code: 'NOT_A_BOOLEAN'
  readonly input: string
  readonly message: string
}

const isTrueWord = oneOf(['true', 'yes', 'y', 'on', '1'])
const isFalseWord = oneOf(['false', 'no', 'n', 'off', '0'])

/**
 * Reads a yes-or-no answer such as `true`, `yes`, `on` or `1` from text, ignoring case and spaces.
 *
 * Use when: a boolean arrives as text, from an environment variable, a query parameter, a
 * CSV cell or a form, and people write it in different ways. `true`, `yes`, `y`, `on` and
 * `1` are true; `false`, `no`, `n`, `off` and `0` are false. Anything else, the empty
 * string included, is an `Err`, so a typo never turns into `false` without anyone noticing.
 *
 * @example
 * ```ts
 * parseBoolean(' YES ')
 * // => Ok(true)
 *
 * parseBoolean('off')
 * // => Ok(false)
 *
 * parseBoolean('ture')
 * // => Err({ code: 'NOT_A_BOOLEAN', input: 'ture', message: 'Expected yes or no (true, yes, on, 1, false, no, off, 0), got "ture"' })
 * ```
 *
 * @tags boolean, flag, yes, no, toggle, env, query, checkbox
 * @see parseEnvFlag - a missing or blank value falls back to a default
 * @see oneOf - @ontologyio/receta/predicate, the word lists
 */
export function parseBoolean(input: string): Result<boolean, ParseBooleanError> {
  const word = R.toLowerCase(input.trim())
  if (isTrueWord(word)) return ok(true)
  if (isFalseWord(word)) return ok(false)
  return err({
    code: 'NOT_A_BOOLEAN',
    input,
    message: `Expected yes or no (true, yes, on, 1, false, no, off, 0), got "${input}"`,
  })
}

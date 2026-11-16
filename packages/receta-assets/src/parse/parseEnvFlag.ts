import * as R from 'remeda'
import { oneOf } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'
import { isBlank } from '@ontologyio/receta/string'

export type ParseEnvFlagError = {
  readonly code: 'NOT_A_FLAG'
  readonly input: string
  readonly message: string
}

const isOnWord = oneOf(['true', 'yes', 'y', 'on', '1'])
const isOffWord = oneOf(['false', 'no', 'n', 'off', '0'])

/**
 * Reads an on/off feature flag such as `DEBUG=1`, falling back to a default when it is unset or blank.
 *
 * Use when: a boolean environment variable or setting may be missing, and missing should
 * mean the default rather than an error. `true`, `yes`, `y`, `on` and `1` turn it on;
 * `false`, `no`, `n`, `off` and `0` turn it off, in any case. A value that is set but
 * unreadable, like `DEBUG=enabled`, is an `Err`, so a typo never flips the flag silently.
 *
 * @example
 * ```ts
 * parseEnvFlag('ON', false)
 * // => Ok(true)
 *
 * parseEnvFlag(undefined, true)
 * // => Ok(true)
 *
 * R.pipe('', parseEnvFlag(false))
 * // => Ok(false)
 *
 * parseEnvFlag('enabled', false)
 * // => Err({ code: 'NOT_A_FLAG', input: 'enabled', message: 'Expected on or off (true, yes, on, 1, false, no, off, 0), got "enabled"' })
 * ```
 *
 * @tags flag, feature flag, env, boolean, toggle, default, config
 * @see parseBoolean - the value is required, with no default
 * @see isBlank - @ontologyio/receta/string, what counts as unset
 */
export function parseEnvFlag(
  value: string | undefined,
  fallback: boolean,
): Result<boolean, ParseEnvFlagError>
export function parseEnvFlag(
  fallback: boolean,
): (value: string | undefined) => Result<boolean, ParseEnvFlagError>
export function parseEnvFlag(...args: unknown[]): unknown {
  return R.purry(parseEnvFlagImplementation, args)
}

const parseEnvFlagImplementation = (
  value: string | undefined,
  fallback: boolean,
): Result<boolean, ParseEnvFlagError> => {
  if (value === undefined || isBlank(value)) return ok(fallback)
  const word = R.toLowerCase(value.trim())
  if (isOnWord(word)) return ok(true)
  if (isOffWord(word)) return ok(false)
  return err({
    code: 'NOT_A_FLAG',
    input: value,
    message: `Expected on or off (true, yes, on, 1, false, no, off, 0), got "${value}"`,
  })
}

import * as R from 'remeda'
import { filter, fromNullable, isNone, map, unwrapOr, type Option } from '@ontologyio/receta/option'
import { not } from '@ontologyio/receta/predicate'
import { err, ok, type Result } from '@ontologyio/receta/result'
import { isBlank, trim } from '@ontologyio/receta/string'

export type ParseRequiredEnvError<K extends string> = {
  readonly code: 'MISSING_ENV'
  /** Every variable that is unset or blank, in the order they were asked for. */
  readonly missing: readonly K[]
  readonly message: string
}

const present = (value: string | undefined): Option<string> =>
  R.pipe(fromNullable(value), map(trim), filter(not(isBlank)))

/**
 * Reads the environment variables a program can't start without, and lists every one that is missing in a single error.
 *
 * Use when: a server, worker or CLI starts up and needs `DATABASE_URL`, `API_KEY` and the
 * like, and a deploy with three missing variables should fail once with all three named,
 * not three times in a row. Blank values count as missing, and values are trimmed, since a
 * stray space or newline from a `.env` file is a common bug. Pass `process.env`, `Bun.env`
 * or `Deno.env.toObject()`. Parse the values further, such as with `parsePort`, after.
 *
 * @example
 * ```ts
 * const env = { DATABASE_URL: ' postgres://db/app ', API_KEY: '  ', PORT: '8080' }
 *
 * parseRequiredEnv(env, ['DATABASE_URL', 'PORT'])
 * // => Ok({ DATABASE_URL: 'postgres://db/app', PORT: '8080' })
 *
 * R.pipe(env, parseRequiredEnv(['DATABASE_URL', 'API_KEY', 'SENTRY_DSN']))
 * // => Err({ code: 'MISSING_ENV', missing: ['API_KEY', 'SENTRY_DSN'], message: 'Missing environment variables: API_KEY, SENTRY_DSN' })
 * ```
 *
 * @tags env, environment, config, startup, required, secrets, dotenv, missing
 * @see validateEnvVars - the Validation variant, with one message per missing variable
 * @see parseEnvFlag - one optional on/off variable with a default
 * @see sequenceRecordAll - parse each variable and report every bad one by name
 */
export function parseRequiredEnv<const K extends string>(
  env: Readonly<Record<string, string | undefined>>,
  names: readonly K[],
): Result<Readonly<Record<K, string>>, ParseRequiredEnvError<K>>
export function parseRequiredEnv<const K extends string>(
  names: readonly K[],
): (env: Readonly<Record<string, string | undefined>>) => Result<Readonly<Record<K, string>>, ParseRequiredEnvError<K>>
export function parseRequiredEnv(...args: unknown[]): unknown {
  return R.purry(parseRequiredEnvImplementation, args)
}

// Typed with plain strings: the overloads above carry the exact names to the caller.
const parseRequiredEnvImplementation = (
  env: Readonly<Record<string, string | undefined>>,
  names: readonly string[],
): Result<Readonly<Record<string, string>>, ParseRequiredEnvError<string>> => {
  const missing = R.filter(names, (name) => isNone(present(env[name])))
  if (!R.isEmpty(missing)) {
    return err({
      code: 'MISSING_ENV',
      missing,
      message: `Missing environment variables: ${R.join(missing, ', ')}`,
    })
  }
  return ok(R.fromKeys(names, (name) => unwrapOr(present(env[name]), '')))
}

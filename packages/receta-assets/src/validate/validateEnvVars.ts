import * as R from 'remeda'
import { filter, fromNullable, match } from '@ontologyio/receta/option'
import { not } from '@ontologyio/receta/predicate'
import { isBlank } from '@ontologyio/receta/string'
import { collectErrors, invalid, map, valid, type Validation } from '@ontologyio/receta/validation'

/** The shape of `process.env`, `Bun.env` and `import.meta.env`. */
export type ValidateEnvVarsSource = Readonly<Record<string, string | undefined>>

/**
 * Checks that every named environment variable is set, and returns just those, typed by name.
 *
 * Use when: a server, worker or script starts up and must stop with one list of everything
 * missing, instead of crashing later on the first `undefined`. Pass `process.env` and the
 * names. A blank or whitespace-only value counts as missing. Values come back as they are,
 * as strings; parse numbers and ports from the result.
 *
 * @example
 * ```ts
 * validateEnvVars({ DATABASE_URL: 'postgres://db/app', PORT: '8080', HOME: '/root' }, ['DATABASE_URL', 'PORT'])
 * // => Valid({ DATABASE_URL: 'postgres://db/app', PORT: '8080' })
 *
 * validateEnvVars({ DATABASE_URL: '  ' }, ['DATABASE_URL', 'STRIPE_KEY'])
 * // => Invalid(['Set the DATABASE_URL environment variable', 'Set the STRIPE_KEY environment variable'])
 *
 * R.pipe({ API_URL: 'https://api.example.com' }, validateEnvVars(['API_URL']))
 * // => Valid({ API_URL: 'https://api.example.com' })
 * ```
 *
 * @tags env, environment, config, startup, process, variables, secrets, dotenv
 * @see parsePort - turn the `PORT` value into a number
 */
export function validateEnvVars<K extends string>(
  env: ValidateEnvVarsSource,
  names: readonly K[],
): Validation<Record<K, string>, string>
export function validateEnvVars<K extends string>(
  names: readonly K[],
): (env: ValidateEnvVarsSource) => Validation<Record<K, string>, string>
export function validateEnvVars(...args: unknown[]): unknown {
  return R.purry(validateEnvVarsImplementation, args)
}

const validateEnvVarsImplementation = <K extends string>(
  env: ValidateEnvVarsSource,
  names: readonly K[],
): Validation<Record<K, string>, string> =>
  R.pipe(
    names,
    R.map((name) =>
      R.pipe(
        fromNullable(env[name]),
        filter(not(isBlank)),
        match<string, Validation<readonly [K, string], string>>({
          onSome: (value) => valid([name, value] as const),
          onNone: () => invalid(`Set the ${name} environment variable`),
        }),
      ),
    ),
    collectErrors(),
    map(R.mapToObj(([name, value]) => [name, value])),
  )

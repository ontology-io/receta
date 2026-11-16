import * as R from 'remeda'
import { compact, filterKeys, mapKeys, unflatten, type PlainObject } from '@ontologyio/receta/object'
import { and, eq, not, startsWith } from '@ontologyio/receta/predicate'
import { camelCase } from '@ontologyio/receta/string'

/** `DB__POOL_MAX` becomes `db.poolMax`: `__` nests, and each part is camel-cased. */
const toConfigPath = (name: string): string => R.join(R.map(name.split('__'), camelCase), '.')

/**
 * Reads the environment variables that share a prefix into a nested, camelCased config object.
 *
 * Use when: loading settings such as `APP_DB__HOST` and `APP_DB__POOL_MAX` from
 * `process.env`, Docker or Kubernetes into `{ db: { host, poolMax } }`, the way ASP.NET and
 * many twelve-factor loaders do. The prefix is removed, a double underscore `__` starts a
 * nested level, and each level is camelCased (`POOL_MAX` → `poolMax`). A numeric level makes an
 * array (`APP_HOSTS__0`). Values stay strings and unset variables are skipped: parse and
 * check the result next.
 *
 * ```text
 *  STEP                    DATA AFTER IT
 *  ─────────────────────   ─────────────────────────────────────────────────
 *  env                     { APP_DB__HOST: 'db', APP_PORT: '80', HOME: '/' }
 *  keep APP_, drop it      { DB__HOST: 'db', PORT: '80' }
 *  __ → dot, camelCase     { 'db.host': 'db', port: '80' }
 *  unflatten               { db: { host: 'db' }, port: '80' }
 * ```
 *
 * @example
 * ```ts
 * const env = {
 *   APP_PORT: '8080',
 *   APP_DB__HOST: 'db.internal',
 *   APP_DB__POOL_MAX: '20',
 *   APP_ORIGINS__0: 'https://a.dev',
 *   APP_ORIGINS__1: 'https://b.dev',
 *   APP_SECRET: undefined,
 *   HOME: '/root',
 * }
 *
 * envToConfig(env, 'APP_')
 * // => {
 * //   port: '8080',
 * //   db: { host: 'db.internal', poolMax: '20' },
 * //   origins: ['https://a.dev', 'https://b.dev'],
 * // }
 *
 * R.pipe({ HOME: '/root' }, envToConfig('APP_'))
 * // => {}
 * ```
 *
 * @tags env, environment, config, process.env, twelve-factor, settings, docker, kubernetes, nested
 * @see pickByPrefix - the prefix step alone, without nesting or renaming
 * @see unflatten - @ontologyio/receta/object, builds the nested object
 * @see camelCase - @ontologyio/receta/string, renames each level
 */
export function envToConfig(env: Readonly<Record<string, string | undefined>>, prefix: string): PlainObject
export function envToConfig(prefix: string): (env: Readonly<Record<string, string | undefined>>) => PlainObject
export function envToConfig(...args: unknown[]): unknown {
  return R.purry(envToConfigImplementation, args)
}

const envToConfigImplementation = (env: Readonly<Record<string, string | undefined>>, prefix: string): PlainObject =>
  R.pipe(
    compact(env),
    filterKeys(and(startsWith(prefix), not(eq(prefix)))),
    mapKeys((key) => toConfigPath(key.slice(prefix.length))),
    unflatten(),
  )

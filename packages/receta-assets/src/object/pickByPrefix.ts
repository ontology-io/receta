import * as R from 'remeda'
import { filterKeys, mapKeys, type PlainObject } from '@ontologyio/receta/object'
import { and, not, startsWith, eq } from '@ontologyio/receta/predicate'

/** The keys that started with `P`, without it. A record with string keys stays a record. */
export type PickByPrefixResult<T, P extends string> = string extends keyof T
  ? Record<string, T[keyof T]>
  : { [K in keyof T as K extends `${P}${infer Rest}` ? (Rest extends '' ? never : Rest) : never]: T[K] }

/**
 * Keeps the keys that start with a prefix, and removes the prefix from their names.
 *
 * Use when: reading one group of settings out of a flat bag, such as `VITE_` or `APP_` from
 * `process.env`, `og:` tags from page metadata, or `utm_` fields from a query. Keys that only
 * match the prefix in another case don't count, and a key equal to the prefix alone is left
 * out, since it would have no name.
 *
 * @example
 * ```ts
 * const env = { APP_PORT: '8080', APP_DB_HOST: 'db', HOME: '/root', APP_: 'x' }
 *
 * pickByPrefix(env, 'APP_')
 * // => { PORT: '8080', DB_HOST: 'db' }
 *
 * R.pipe({ utm_source: 'mail', utm_campaign: 'spring', page: '2' }, pickByPrefix('utm_'))
 * // => { source: 'mail', campaign: 'spring' }
 *
 * pickByPrefix({ app_port: '1' }, 'APP_')
 * // => {}
 * ```
 *
 * @tags prefix, env, environment, filter, keys, namespace, utm, config, strip
 * @see envToConfig - also nests and camel-cases the picked keys
 * @see omitByPrefix - drops prefixed keys instead, at any depth
 * @see filterKeys - @ontologyio/receta/object, the key filter
 */
export function pickByPrefix<T extends object, P extends string>(value: T, prefix: P): PickByPrefixResult<T, P>
export function pickByPrefix<T extends object, P extends string>(prefix: P): (value: T) => PickByPrefixResult<T, P>
export function pickByPrefix(...args: unknown[]): unknown {
  return R.purry(pickByPrefixImplementation, args)
}

const pickByPrefixImplementation = (value: PlainObject, prefix: string): PlainObject =>
  R.pipe(
    value,
    filterKeys(and(startsWith(prefix), not(eq(prefix)))),
    mapKeys((key) => key.slice(prefix.length)),
  )

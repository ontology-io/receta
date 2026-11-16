import * as R from 'remeda'
import { getPath, type ObjectPath, type PlainObject } from '@ontologyio/receta/object'
import { isSome } from '@ontologyio/receta/option'

/** Same `typeof`, both arrays or neither, and not null: what a caller relying on `T` needs. */
const isLike = <T>(value: unknown, fallback: T): value is T =>
  typeof value === typeof fallback && R.isArray(value) === R.isArray(fallback) && R.isNonNull(value)

/**
 * Reads a nested value by a dot path or key list, and returns the fallback when it is missing or of another type.
 *
 * Use when: reading parsed JSON, a config file or an API response you don't control, where
 * the value might be absent, `null`, or the wrong type (`"8080"` where a number was expected).
 * The value counts only when it has the fallback's `typeof` and is an array exactly when the
 * fallback is one, so the result really is the fallback's type. A path is `'a.b.0'` or
 * `['a', 'b', 0]`; numeric parts index into arrays.
 *
 * @example
 * ```ts
 * const config = { server: { host: 'example.com', port: '8080' }, origins: ['https://a.dev'] }
 *
 * getPathOr(config, 'server.host', 'localhost')
 * // => 'example.com'
 *
 * getPathOr(config, 'server.port', 3000)
 * // => 3000
 *
 * getPathOr(config, ['origins', 0], 'none')
 * // => 'https://a.dev'
 *
 * R.pipe(config, getPathOr('server.tls.cert', ''))
 * // => ''
 * ```
 *
 * @tags get, path, nested, default, fallback, config, json, safe, read, optional chaining
 * @see getPath - @ontologyio/receta/object, the same read as an Option
 * @see withDefaults - fills a whole object from defaults instead of one value
 */
export function getPathOr<T>(value: object, path: string | ObjectPath, fallback: T): T
export function getPathOr<T>(path: string | ObjectPath, fallback: T): (value: object) => T
export function getPathOr(...args: unknown[]): unknown {
  return R.purry(getPathOrImplementation, args)
}

const getPathOrImplementation = <T>(value: object, path: string | ObjectPath, fallback: T): T => {
  const found = getPath(R.isString(path) ? path.split('.') : path, value as PlainObject)
  return isSome(found) && isLike(found.value, fallback) ? found.value : fallback
}

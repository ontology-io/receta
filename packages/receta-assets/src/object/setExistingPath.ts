import * as R from 'remeda'
import { getPath, setPath, type PlainObject } from '@ontologyio/receta/object'
import { isNone } from '@ontologyio/receta/option'
import { err, ok, type Result } from '@ontologyio/receta/result'

export type SetExistingPathError = {
  readonly code: 'PATH_NOT_FOUND' | 'WRONG_TYPE'
  readonly path: string
  readonly message: string
}

const kindOf = (value: unknown): string => {
  if (R.isArray(value)) return 'array'
  if (R.isNullish(value)) return 'null'
  return typeof value
}

const withArticle = (kind: string): string => (/^[aeiou]/.test(kind) ? `an ${kind}` : `a ${kind}`)

/**
 * Sets a value at a dot path only if the path already exists and the new value has the same type as the old one.
 *
 * Use when: applying an override that comes from outside the code, such as `--set db.port=5432`,
 * an admin screen or a feature-flag service, where a typo must be refused instead of quietly
 * adding a key nobody reads. It returns `Err` with `PATH_NOT_FOUND` when nothing is there and
 * `WRONG_TYPE` when the kinds differ (string, number, boolean, object, array). A setting that
 * holds `null` takes any value. Numeric parts index into arrays. The input is never changed.
 *
 * @example
 * ```ts
 * const config = { db: { host: 'localhost', port: 5432 }, debug: false }
 *
 * setExistingPath(config, 'db.port', 6543)
 * // => Ok({ db: { host: 'localhost', port: 6543 }, debug: false })
 *
 * setExistingPath(config, 'db.hots', 'example.com')
 * // => Err({ code: 'PATH_NOT_FOUND', path: 'db.hots', message: 'Nothing to set at "db.hots"' })
 *
 * R.pipe(config, setExistingPath('debug', 'yes'))
 * // => Err({ code: 'WRONG_TYPE', path: 'debug', message: '"debug" holds a boolean, got a string' })
 *
 * setExistingPath({ proxy: null }, 'proxy', 'http://10.0.0.1:3128')
 * // => Ok({ proxy: 'http://10.0.0.1:3128' })
 * ```
 *
 * @tags set, path, override, config, cli, strict, typo, nested, update, safe
 * @see applyPathOverrides - many overrides at once, every problem reported
 * @see setPath - @ontologyio/receta/object, sets without checking, creating missing parents
 * @see getPath - @ontologyio/receta/object, the existence check
 */
export function setExistingPath<T extends object>(
  value: T,
  path: string,
  next: unknown,
): Result<T, SetExistingPathError>
export function setExistingPath<T extends object>(
  path: string,
  next: unknown,
): (value: T) => Result<T, SetExistingPathError>
export function setExistingPath(...args: unknown[]): unknown {
  return R.purry(setExistingPathImplementation, args)
}

const setExistingPathImplementation = <T extends object>(
  value: T,
  path: string,
  next: unknown,
): Result<T, SetExistingPathError> => {
  const segments = path.split('.')
  const current = getPath(segments, value as PlainObject)
  if (isNone(current)) {
    return err({ code: 'PATH_NOT_FOUND', path, message: `Nothing to set at "${path}"` })
  }
  const [was, got] = [kindOf(current.value), kindOf(next)]
  // A null slot is a setting left empty on purpose, so any value may fill it.
  if (was !== 'null' && was !== got) {
    return err({ code: 'WRONG_TYPE', path, message: `"${path}" holds ${withArticle(was)}, got ${withArticle(got)}` })
  }
  return ok(setPath(segments, next, value as PlainObject) as T)
}

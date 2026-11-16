import * as R from 'remeda'
import { mask, stripUndefined, type PlainObject } from '@ontologyio/receta/object'

/** The picked keys, each optional and never holding `undefined`. */
export type PickDefinedResult<T, K extends keyof T> = { [P in K]?: Exclude<T[P], undefined> }

/**
 * Picks the listed keys and leaves out the ones whose value is `undefined`.
 *
 * Use when: building an options object, a query or a PATCH body from values that may be
 * unset, where sending `{ limit: undefined }` would override a default or break
 * `exactOptionalPropertyTypes`. Only `undefined` is dropped: `null`, `0`, `''` and `false`
 * are real values and stay. Keys not on the list are left out too.
 *
 * @example
 * ```ts
 * const form = { name: 'Ada', email: undefined, age: 0, role: 'admin', internalNote: 'x' }
 *
 * pickDefined(form, ['name', 'email', 'age'])
 * // => { name: 'Ada', age: 0 }
 *
 * R.pipe({ cursor: undefined, limit: 20 }, pickDefined(['cursor', 'limit']))
 * // => { limit: 20 }
 *
 * pickDefined({ deletedAt: null, note: undefined }, ['deletedAt', 'note'])
 * // => { deletedAt: null }
 * ```
 *
 * @tags pick, undefined, optional, payload, patch, options, exactOptionalPropertyTypes, query
 * @see mask - @ontologyio/receta/object, the pick by key list
 * @see stripUndefined - @ontologyio/receta/object, the drop of undefined values
 */
export function pickDefined<T extends object, K extends keyof T & string>(
  value: T,
  keys: readonly K[],
): PickDefinedResult<T, K>
export function pickDefined<T extends object, K extends keyof T & string>(
  keys: readonly K[],
): (value: T) => PickDefinedResult<T, K>
export function pickDefined(...args: unknown[]): unknown {
  return R.purry(pickDefinedImplementation, args)
}

const pickDefinedImplementation = (value: PlainObject, keys: readonly string[]): PlainObject =>
  R.pipe(value, mask(keys), stripUndefined)

import * as R from 'remeda'
import { filterKeys, mapValues } from '@ontologyio/receta/object'
import { not, or, startsWith } from '@ontologyio/receta/predicate'

/** `T` without the keys that start with one of `P`, at any depth. */
export type OmitByPrefixResult<T, P extends string> = T extends readonly (infer Item)[]
  ? OmitByPrefixResult<Item, P>[]
  : T extends Date | ((...args: never[]) => unknown)
    ? T
    : T extends object
      ? { [K in keyof T as K extends `${P}${string}` ? never : K]: OmitByPrefixResult<T[K], P> }
      : T

/**
 * Removes every key that starts with one of the given prefixes, at any depth, arrays included.
 *
 * Use when: data carries bookkeeping fields that mustn't reach the UI, a cache key, a
 * snapshot or the next API, such as GraphQL's `__typename`, MongoDB's `__v` and `_id`, or
 * your own `$meta` and `_internal` fields. Class instances such as `Date` are left as they
 * are, and the input is not changed. The result type drops the same keys.
 *
 * @example
 * ```ts
 * const response = {
 *   __typename: 'Query',
 *   user: { __typename: 'User', id: 'u1', posts: [{ __typename: 'Post', title: 'Hi' }] },
 * }
 *
 * omitByPrefix(response, ['__'])
 * // => { user: { id: 'u1', posts: [{ title: 'Hi' }] } }
 *
 * R.pipe({ _id: 'a', __v: 0, name: 'Ada', $meta: { x: 1 } }, omitByPrefix(['_', '$']))
 * // => { name: 'Ada' }
 *
 * omitByPrefix({ name: 'Ada' }, [])
 * // => { name: 'Ada' }
 * ```
 *
 * @tags omit, prefix, typename, graphql, mongo, internal, private, strip, clean, deep
 * @see pickByPrefix - keeps the prefixed keys instead, at the top level
 * @see filterKeys - @ontologyio/receta/object, the key filter at each level
 */
export function omitByPrefix<T, P extends string>(value: T, prefixes: readonly P[]): OmitByPrefixResult<T, P>
export function omitByPrefix<P extends string>(prefixes: readonly P[]): <T>(value: T) => OmitByPrefixResult<T, P>
export function omitByPrefix(...args: unknown[]): unknown {
  return R.purry(omitByPrefixImplementation, args)
}

const omitByPrefixImplementation = (value: unknown, prefixes: readonly string[]): unknown => {
  const isPrefixed = or(...R.map(prefixes, startsWith))
  const strip = (current: unknown): unknown => {
    if (R.isArray(current)) return R.map(current, strip)
    if (!R.isPlainObject(current)) return current
    return R.pipe(current, filterKeys(not(isPrefixed)), mapValues(strip))
  }
  return strip(value)
}

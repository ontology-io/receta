import { memoizeBy, weakCache } from '@ontologyio/receta/memo'

/**
 * Computes a value derived from an object once per object, and lets the cached value go when the object does.
 *
 * Use when: the same object is read many times and something costly is built from it, such
 * as an index by id over a list from the store, a parsed schema, or a lookup table for a
 * config object. Objects are compared by identity, so this suits immutable data: a new
 * array is new data and is derived again. Nothing leaks: once the source object is
 * garbage-collected, so is its derived value.
 *
 * @example
 * ```ts
 * type User = { readonly id: string; readonly name: string }
 *
 * let indexed = 0
 * const byId = weakDerived((users: readonly User[]) => {
 *   indexed += 1
 *   return R.indexBy(users, R.prop('id'))
 * })
 *
 * const users = [{ id: 'u1', name: 'Ada' }]
 * byId(users) === byId(users)
 * // => true
 *
 * indexed
 * // => 1
 *
 * byId([...users, { id: 'u2', name: 'Bo' }])
 * // => { u1: { id: 'u1', name: 'Ada' }, u2: { id: 'u2', name: 'Bo' } }
 *
 * indexed
 * // => 2
 * ```
 *
 * @tags weakmap, derived, identity, index, immutable, garbage collection, memoize
 * @see weakCache - @ontologyio/receta/memo, the cache that lets entries go
 * @see memoizedSelector - recomputes from state when the selected inputs change
 */
export function weakDerived<S extends object, T>(derive: (source: S) => T): (source: S) => T {
  return memoizeBy(derive, (source: S) => source, { cache: weakCache<S, unknown>() })
}

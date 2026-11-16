import * as R from 'remeda'
import { ascending } from '@ontologyio/receta/compare'

const byKey = ascending(([key]: readonly [string, unknown]) => key)

const sortDeep = (value: unknown): unknown => {
  if (R.isArray(value)) return R.map(value, sortDeep)
  if (!R.isPlainObject(value)) return value
  return R.pipe(
    R.entries(value as Record<string, unknown>),
    R.sort(byKey),
    R.map(([key, inner]) => [key, sortDeep(inner)] as const),
    R.fromEntries(),
  )
}

/**
 * Returns a copy whose object keys are in sorted order at every depth, so equal data always serializes the same.
 *
 * Use when: an object becomes a cache key, a hash, an ETag, a signature payload or a
 * snapshot, and `{ a, b }` must produce the same `JSON.stringify` text as `{ b, a }`. Keys
 * sort by UTF-16 code unit, the same in every locale, so `'B'` comes before `'a'`. Arrays keep
 * their order, while the objects inside them are sorted too. Class instances such as `Date`
 * are left as they are, and the input is not changed.
 *
 * @example
 * ```ts
 * JSON.stringify(sortKeysDeep({ b: 1, a: { d: [{ z: 1, y: 2 }], c: 3 } }))
 * // => '{"a":{"c":3,"d":[{"y":2,"z":1}]},"b":1}'
 *
 * R.keys(sortKeysDeep({ beta: 1, Alpha: 2, alpha: 3, _id: 4 }))
 * // => ['Alpha', '_id', 'alpha', 'beta']
 *
 * sortKeysDeep([3, 1, 2])
 * // => [3, 1, 2]
 * ```
 *
 * @tags sort, keys, stable, deterministic, canonical, json, hash, cache key, snapshot, etag
 * @see ascending - @ontologyio/receta/compare, the locale-free key order
 */
export function sortKeysDeep<T>(value: T): T {
  return sortDeep(value) as T
}

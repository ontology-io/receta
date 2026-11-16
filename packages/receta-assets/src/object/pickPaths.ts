import * as R from 'remeda'
import { deepMerge, mapValues, type DeepPartial, type PlainObject } from '@ontologyio/receta/object'
import { isSome, map, none, some, unwrapOr, type Option } from '@ontologyio/receta/option'
import { eq } from '@ontologyio/receta/predicate'

const isWildcard = eq('*')

// Items without the field stay as {} so the picked items keep their positions.
const orEmpty = unwrapOr<unknown>({})

/** The part of `value` that `segments` reaches, nested the way it was, or None. */
const pickAt = (value: unknown, segments: readonly string[]): Option<unknown> => {
  const [head, ...rest] = segments
  if (head === undefined) return some(value)
  if (R.isArray(value)) {
    return isWildcard(head) ? some(R.map(value, (item) => orEmpty(pickAt(item, rest)))) : none()
  }
  if (!R.isPlainObject(value)) return none()
  if (isWildcard(head)) return some(mapValues(value, (inner) => orEmpty(pickAt(inner, rest))))
  return Object.hasOwn(value, head) ? R.pipe(pickAt(value[head], rest), map((picked) => ({ [head]: picked }))) : none()
}

/**
 * Keeps only the fields at the given dot paths, nested as they were, like a GraphQL selection or a projection.
 *
 * Use when: an API, cache or log should get a few fields of a large record, such as
 * `['id', 'profile.name', 'orders.*.total']`, without writing the nested shape out by hand.
 * `*` walks every array item or every key of an object, and items keep their positions: an
 * item without the field becomes `{}`. A path that isn't there adds nothing, and a path to an
 * object keeps all of it. Array items are reached only through `*`, not by position.
 *
 * @example
 * ```ts
 * const user = {
 *   id: 'u1',
 *   password: 'x',
 *   profile: { name: 'Ada', bio: 'Math', avatar: { url: 'a.png', size: 3 } },
 *   orders: [{ id: 'o1', total: 12, items: 3 }, { id: 'o2', total: 7, items: 1 }],
 * }
 *
 * pickPaths(user, ['id', 'profile.name', 'profile.avatar', 'orders.*.total'])
 * // => { id: 'u1', profile: { name: 'Ada', avatar: { url: 'a.png', size: 3 } }, orders: [{ total: 12 }, { total: 7 }] }
 *
 * R.pipe(user, pickPaths(['orders.*.id', 'orders.*.items', 'profile.missing']))
 * // => { orders: [{ id: 'o1', items: 3 }, { id: 'o2', items: 1 }] }
 *
 * pickPaths({ a: 1 }, [])
 * // => {}
 * ```
 *
 * @tags pick, select, projection, fields, graphql, paths, nested, whitelist, sparse fieldsets
 * @see omitPaths - removes the paths instead of keeping them
 * @see deepMerge - @ontologyio/receta/object, joins the picked parts, items merged by position
 */
export function pickPaths<T extends object>(value: T, paths: readonly string[]): DeepPartial<T>
export function pickPaths(paths: readonly string[]): <T extends object>(value: T) => DeepPartial<T>
export function pickPaths(...args: unknown[]): unknown {
  return R.purry(pickPathsImplementation, args)
}

const pickPathsImplementation = (value: object, paths: readonly string[]): PlainObject =>
  R.pipe(
    paths,
    R.map((path) => pickAt(value, path.split('.'))),
    R.filter(isSome),
    R.map((picked) => picked.value as PlainObject),
    deepMerge({ arrayStrategy: 'merge' }),
  )

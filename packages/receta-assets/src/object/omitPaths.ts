import * as R from 'remeda'
import { mapValues } from '@ontologyio/receta/object'
import { eq } from '@ontologyio/receta/predicate'

const isWildcard = eq('*')

/** `value` without what `segments` reaches. Off-path parts are kept as the same objects. */
const removeAt = (value: unknown, segments: readonly string[]): unknown => {
  const [head, ...rest] = segments
  if (head === undefined) return value
  if (R.isArray(value)) {
    // Arrays are walked into, never shortened, so positions keep their meaning.
    return isWildcard(head) && !R.isEmpty(rest) ? R.map(value, (item) => removeAt(item, rest)) : value
  }
  if (!R.isPlainObject(value)) return value
  if (isWildcard(head)) return R.isEmpty(rest) ? {} : mapValues(value, (inner) => removeAt(inner, rest))
  if (!Object.hasOwn(value, head)) return value
  return R.isEmpty(rest) ? R.omit(value, [head]) : { ...value, [head]: removeAt(value[head], rest) }
}

/**
 * Removes the fields at the given dot paths, where `*` stands for every array item or key, and keeps the rest.
 *
 * Use when: a record is almost right to send, cache or show, but a few nested fields must go,
 * such as `user.passwordHash` or `orders.*.internalNotes`, and listing every field to keep
 * would be longer. A path that isn't there changes nothing. `*` walks every array item or
 * every key of an object; arrays are reached only through `*`, so their length never changes.
 * The input is not changed. The result type stays `T`, so only remove optional fields if the
 * type matters downstream.
 *
 * @example
 * ```ts
 * const account = {
 *   id: 'a1',
 *   user: { name: 'Ada', passwordHash: 'x9', mfa: { secret: 's', enabled: true } },
 *   orders: [{ id: 'o1', internalNotes: 'vip' }, { id: 'o2' }],
 * }
 *
 * omitPaths(account, ['user.passwordHash', 'user.mfa.secret', 'orders.*.internalNotes'])
 * // => { id: 'a1', user: { name: 'Ada', mfa: { enabled: true } }, orders: [{ id: 'o1' }, { id: 'o2' }] }
 *
 * R.pipe(account, omitPaths(['user', 'nope.deeper']))
 * // => { id: 'a1', orders: [{ id: 'o1', internalNotes: 'vip' }, { id: 'o2' }] }
 * ```
 *
 * @tags omit, remove, delete, paths, nested, strip, blacklist, wildcard, sanitize, fields
 * @see pickPaths - keeps the paths instead of removing them
 * @see redactPaths - keeps the keys but hides their values
 */
export function omitPaths<T>(value: T, paths: readonly string[]): T
export function omitPaths(paths: readonly string[]): <T>(value: T) => T
export function omitPaths(...args: unknown[]): unknown {
  return R.purry(omitPathsImplementation, args)
}

const omitPathsImplementation = <T>(value: T, paths: readonly string[]): T =>
  R.reduce(paths, (current: unknown, path) => removeAt(current, path.split('.')), value as unknown) as T

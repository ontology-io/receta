import * as R from 'remeda'
import { fromNullable, type Result } from '@ontologyio/receta/result'

/**
 * Finds the first item that matches, as Ok(item), or returns the error you give when none does.
 *
 * Use when: looking something up is part of a `Result` pipe and "not there" is a failure
 * with a reason, such as the user for an id, the price for a SKU, the route for a path or the
 * plan for a name. Build the predicate with `where` and `eq` for record lookups. With a
 * type guard, the found item's type narrows.
 *
 * @example
 * ```ts
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * type User = { id: number; name: string }
 * const users: User[] = [{ id: 1, name: 'Ada' }, { id: 2, name: 'Grace' }]
 *
 * findOrErr(users, where<User>({ id: eq(2) }), { code: 'USER_NOT_FOUND', id: 2 })
 * // => Ok({ id: 2, name: 'Grace' })
 *
 * R.pipe(users, findOrErr(where<User>({ id: eq(9) }), { code: 'USER_NOT_FOUND', id: 9 }))
 * // => Err({ code: 'USER_NOT_FOUND', id: 9 })
 * ```
 *
 * @tags find, lookup, not found, search, by id, first, result, 404
 * @see where - @ontologyio/receta/predicate, builds the match from fields
 * @see fromNullable - @ontologyio/receta/result, turns the missing item into the Err
 */
export function findOrErr<T, S extends T, E>(
  items: readonly T[],
  matches: (item: T) => item is S,
  error: E,
): Result<S, E>
export function findOrErr<T, E>(
  items: readonly T[],
  matches: (item: T) => boolean,
  error: E,
): Result<T, E>
export function findOrErr<T, S extends T, E>(
  matches: (item: T) => item is S,
  error: E,
): (items: readonly T[]) => Result<S, E>
export function findOrErr<T, E>(
  matches: (item: T) => boolean,
  error: E,
): (items: readonly T[]) => Result<T, E>
export function findOrErr(...args: unknown[]): unknown {
  return R.purry(findOrErrImplementation, args)
}

const findOrErrImplementation = <T, E>(
  items: readonly T[],
  matches: (item: T) => boolean,
  error: E,
): Result<T, E> => fromNullable(R.find(items, matches), error)

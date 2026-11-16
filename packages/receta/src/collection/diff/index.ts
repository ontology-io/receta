import * as R from 'remeda'
import type { DiffResult, Comparator } from '../types'

/**
 * Compares two collections and returns added, updated, removed, and unchanged items.
 *
 * Useful for syncing data, detecting changes, and implementing optimistic updates.
 *
 * Each list keeps the order its items came in: `added`, `updated` and `unchanged` follow
 * `newItems`, and `removed` follows `oldItems`. When a list repeats an id, its last item
 * with that id is the one compared.
 *
 * @param oldItems - The original collection
 * @param newItems - The updated collection
 * @param getId - Function to extract unique identifier
 * @param isEqual - Optional custom equality checker (defaults to deep equality)
 * @returns A DiffResult containing categorized changes
 *
 * @example
 * ```typescript
 * // Data-first
 * const oldUsers = [
 *   { id: 1, name: 'Alice' },
 *   { id: 2, name: 'Bob' }
 * ]
 * const newUsers = [
 *   { id: 1, name: 'Alicia' }, // updated
 *   { id: 3, name: 'Charlie' }  // added
 * ]
 *
 * diff(oldUsers, newUsers, (u) => u.id)
 * // => {
 * //   added: [{ id: 3, name: 'Charlie' }],
 * //   updated: [{ old: { id: 1, name: 'Alice' }, new: { id: 1, name: 'Alicia' } }],
 * //   removed: [{ id: 2, name: 'Bob' }],
 * //   unchanged: []
 * // }
 *
 * // Data-last (in pipe)
 * pipe(
 *   oldUsers,
 *   diff(newUsers, (u) => u.id)
 * )
 * ```
 *
 * @see union - for merging collections
 * @see intersect - for finding common elements
 */
export function diff<T, TId extends string | number>(
  oldItems: readonly T[],
  newItems: readonly T[],
  getId: (item: T) => TId,
  isEqual?: Comparator<T>
): DiffResult<T>
export function diff<T, TId extends string | number>(
  newItems: readonly T[],
  getId: (item: T) => TId,
  isEqual?: Comparator<T>
): (oldItems: readonly T[]) => DiffResult<T>
export function diff(...args: unknown[]): unknown {
  // Handle data-first: diff(oldItems, newItems, getId, isEqual?)
  if (Array.isArray(args[0]) && Array.isArray(args[1])) {
    return diffImplementation(
      args[0] as readonly unknown[],
      args[1] as readonly unknown[],
      args[2] as (item: unknown) => string | number,
      args[3] as Comparator<unknown> | undefined
    )
  }

  // Handle data-last: diff(newItems, getId, isEqual?)
  const newItems = args[0] as readonly unknown[]
  const getId = args[1] as (item: unknown) => string | number
  const isEqual = args[2] as Comparator<unknown> | undefined
  return (oldItems: readonly unknown[]) => diffImplementation(oldItems, newItems, getId, isEqual)
}

function diffImplementation<T, TId extends string | number>(
  oldItems: readonly T[],
  newItems: readonly T[],
  getId: (item: T) => TId,
  isEqual: Comparator<T> = defaultEqual
): DiffResult<T> {
  const oldById = indexById(oldItems, getId)
  const newById = indexById(newItems, getId)

  const [known, added] = R.partition([...newById], ([id]) => oldById.has(id))
  const pairs = R.map(known, ([id, item]) => ({ old: oldById.get(id) as T, new: item }))
  const [unchanged, updated] = R.partition(pairs, (pair) => isEqual(pair.old, pair.new))

  return {
    added: R.map(added, ([, item]) => item),
    updated,
    removed: R.pipe(
      [...oldById],
      R.filter(([id]) => !newById.has(id)),
      R.map(([, item]) => item)
    ),
    unchanged: R.map(unchanged, (pair) => pair.new),
  }
}

/**
 * Indexes items by id. A Map keeps the order the items came in, which a plain object
 * doesn't for ids that look like numbers, and it can hold any item, falsy ones included.
 * Ids are compared as strings, so 1 and '1' are the same id.
 */
function indexById<T>(
  items: readonly T[],
  getId: (item: T) => string | number
): Map<string, T> {
  return new Map(R.map(items, (item): [string, T] => [String(getId(item)), item]))
}

function defaultEqual<T>(a: T, b: T): boolean {
  return R.isDeepEqual(a, b)
}

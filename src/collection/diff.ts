import * as R from 'remeda'
import type { DiffResult, Comparator } from './types'

/**
 * Compares two collections and returns added, updated, removed, and unchanged items.
 *
 * Useful for syncing data, detecting changes, and implementing optimistic updates.
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
  const oldById = R.indexBy(oldItems, getId) as Record<string | number, T | undefined>
  const newById = R.indexBy(newItems, getId) as Record<string | number, T | undefined>

  const oldIds = new Set(R.keys(oldById))
  const newIds = new Set(R.keys(newById))

  const added: T[] = []
  const updated: Array<{ old: T; new: T }> = []
  const removed: T[] = []
  const unchanged: T[] = []

  // Find added and updated items
  for (const id of newIds) {
    const newItem = newById[id]
    const oldItem = oldById[id]

    if (!newItem) continue

    if (!oldItem) {
      added.push(newItem)
    } else if (!isEqual(oldItem, newItem)) {
      updated.push({ old: oldItem, new: newItem })
    } else {
      unchanged.push(newItem)
    }
  }

  // Find removed items
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      const item = oldById[id]
      if (item) removed.push(item)
    }
  }

  return { added, updated, removed, unchanged }
}

function defaultEqual<T>(a: T, b: T): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'

/**
 * Groups consecutive items in an array based on a predicate or grouping function.
 *
 * Unlike `groupBy` which groups ALL matching items together, `batchBy` only groups
 * consecutive items that produce the same grouping key. Useful for identifying runs,
 * sequences, or consecutive states in time-series data.
 *
 * @param items - The array to group
 * @param fn - Function that returns a grouping key for each item
 * @returns Array of batches (sub-arrays of consecutive matching items)
 *
 * @example
 * ```typescript
 * // Data-first: Group consecutive same values
 * batchBy([1, 1, 2, 2, 2, 3, 1, 1], x => x)
 * // => [[1, 1], [2, 2, 2], [3], [1, 1]]
 *
 * // Group consecutive dates by day
 * const events = [
 *   { timestamp: '2024-01-01T10:00:00Z', event: 'login' },
 *   { timestamp: '2024-01-01T11:00:00Z', event: 'click' },
 *   { timestamp: '2024-01-02T09:00:00Z', event: 'login' },
 *   { timestamp: '2024-01-02T10:00:00Z', event: 'logout' },
 * ]
 *
 * batchBy(events, e => e.timestamp.split('T')[0])
 * // => [
 * //   [{ timestamp: '2024-01-01T10:00:00Z', ... }, { timestamp: '2024-01-01T11:00:00Z', ... }],
 * //   [{ timestamp: '2024-01-02T09:00:00Z', ... }, { timestamp: '2024-01-02T10:00:00Z', ... }]
 * // ]
 *
 * // Group consecutive status changes
 * const tasks = [
 *   { id: 1, status: 'pending' },
 *   { id: 2, status: 'pending' },
 *   { id: 3, status: 'done' },
 *   { id: 4, status: 'done' },
 *   { id: 5, status: 'pending' },
 * ]
 *
 * batchBy(tasks, t => t.status)
 * // => [
 * //   [{ id: 1, status: 'pending' }, { id: 2, status: 'pending' }],
 * //   [{ id: 3, status: 'done' }, { id: 4, status: 'done' }],
 * //   [{ id: 5, status: 'pending' }]
 * // ]
 *
 * // Data-last (in pipe)
 * pipe(
 *   [1, 1, 2, 2, 2, 3, 1, 1],
 *   batchBy(x => x)
 * )
 * // => [[1, 1], [2, 2, 2], [3], [1, 1]]
 * ```
 *
 * @see groupBy - for grouping all matching items (not just consecutive)
 * @see chunk - for fixed-size batches
 */
export function batchBy<T, K extends string | number>(
  items: readonly T[],
  fn: (item: T) => K
): readonly (readonly T[])[]
export function batchBy<T, K extends string | number>(
  fn: (item: T) => K
): (items: readonly T[]) => readonly (readonly T[])[]
export function batchBy(...args: unknown[]): unknown {
  return instrumentedPurry('batchBy', 'collection', batchByImplementation, args)
}

function batchByImplementation<T, K extends string | number>(
  items: readonly T[],
  fn: (item: T) => K
): readonly (readonly T[])[] {
  if (items.length === 0) {
    return []
  }

  const batches: T[][] = []
  let currentBatch: T[] = [items[0]!]
  let currentKey = fn(items[0]!)

  return R.pipe(
    items,
    R.drop(1),
    R.reduce((acc, item) => {
      const key = fn(item)
      if (key === currentKey) {
        currentBatch.push(item)
      } else {
        acc.push(currentBatch)
        currentBatch = [item]
        currentKey = key
      }
      return acc
    }, batches),
    (result) => {
      result.push(currentBatch)
      return result
    }
  )
}

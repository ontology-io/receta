import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'

/**
 * Moves an element from one index to another (immutably).
 *
 * Creates a new array with the element at `fromIndex` moved to `toIndex`,
 * shifting other elements as needed. Useful for drag-and-drop reordering,
 * priority adjustments, or any scenario requiring index-based repositioning.
 *
 * @param items - The array to modify
 * @param fromIndex - Index of element to move
 * @param toIndex - Destination index
 * @returns New array with element moved
 *
 * @example
 * ```typescript
 * // Data-first: Move element forward
 * moveIndex(['a', 'b', 'c', 'd', 'e'], 1, 3)
 * // => ['a', 'c', 'd', 'b', 'e']
 *
 * // Move element backward
 * moveIndex(['a', 'b', 'c', 'd', 'e'], 3, 1)
 * // => ['a', 'd', 'b', 'c', 'e']
 *
 * // Drag-and-drop reordering
 * interface Task {
 *   id: number
 *   title: string
 *   priority: number
 * }
 *
 * const tasks: Task[] = [
 *   { id: 1, title: 'Task 1', priority: 1 },
 *   { id: 2, title: 'Task 2', priority: 2 },
 *   { id: 3, title: 'Task 3', priority: 3 },
 * ]
 *
 * // Move task from position 0 to position 2
 * moveIndex(tasks, 0, 2)
 * // => [
 * //   { id: 2, title: 'Task 2', priority: 2 },
 * //   { id: 3, title: 'Task 3', priority: 3 },
 * //   { id: 1, title: 'Task 1', priority: 1 },
 * // ]
 *
 * // No-op if indices are same
 * moveIndex([1, 2, 3], 1, 1)
 * // => [1, 2, 3]
 *
 * // Negative indices (from end)
 * moveIndex(['a', 'b', 'c', 'd'], -1, 0)
 * // => ['d', 'a', 'b', 'c']
 *
 * // Data-last (in pipe)
 * pipe(
 *   ['a', 'b', 'c', 'd', 'e'],
 *   moveIndex(1, 3)
 * )
 * // => ['a', 'c', 'd', 'b', 'e']
 * ```
 *
 * @see insertAt - for adding new elements
 * @see removeAtIndex - for removing elements
 * @see updateAt - for replacing elements
 */
export function moveIndex<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): readonly T[]
export function moveIndex(
  fromIndex: number,
  toIndex: number
): <T>(items: readonly T[]) => readonly T[]
export function moveIndex(...args: unknown[]): unknown {
  return instrumentedPurry('moveIndex', 'collection', moveIndexImplementation, args)
}

function moveIndexImplementation<T>(
  items: readonly T[],
  fromIndex: number,
  toIndex: number
): readonly T[] {
  const length = items.length

  // Normalize negative indices
  const normalizedFrom = fromIndex < 0 ? length + fromIndex : fromIndex
  const normalizedTo = toIndex < 0 ? length + toIndex : toIndex

  // Validate indices
  if (normalizedFrom < 0 || normalizedFrom >= length) {
    return items
  }

  if (normalizedTo < 0 || normalizedTo >= length) {
    return items
  }

  // No-op if same index
  if (normalizedFrom === normalizedTo) {
    return items
  }

  // Remove element from original position
  const element = items[normalizedFrom]!
  const withoutElement = R.pipe(
    items,
    R.filter((_, index) => index !== normalizedFrom)
  )

  // Insert at new position
  return R.pipe(
    withoutElement,
    (arr) => [
      ...arr.slice(0, normalizedTo),
      element,
      ...arr.slice(normalizedTo),
    ]
  )
}

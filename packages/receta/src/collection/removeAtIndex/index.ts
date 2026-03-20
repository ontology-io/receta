import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'

/**
 * Removes an element at a specific index (immutably).
 *
 * Creates a new array with the element at the specified index removed. More ergonomic
 * than `splice` for single-element removal. Built on top of Remeda's `splice` for consistency.
 *
 * @param items - The array to modify
 * @param index - Position to remove
 * @returns New array with element removed, or original array if index is out of bounds
 *
 * @example
 * ```typescript
 * // Data-first: Remove element
 * removeAtIndex(['a', 'b', 'c', 'd'], 2)
 * // => ['a', 'b', 'd']
 *
 * // Remove at beginning
 * removeAtIndex([1, 2, 3], 0)
 * // => [2, 3]
 *
 * // Remove at end
 * removeAtIndex([1, 2, 3], 2)
 * // => [1, 2]
 *
 * // Negative index (from end)
 * removeAtIndex(['a', 'b', 'c', 'd'], -1)
 * // => ['a', 'b', 'c']
 *
 * // Out of bounds returns original array
 * removeAtIndex([1, 2, 3], 10)
 * // => [1, 2, 3]
 *
 * // Remove todo item
 * interface Todo {
 *   id: number
 *   text: string
 * }
 *
 * const todos: Todo[] = [
 *   { id: 1, text: 'Buy milk' },
 *   { id: 2, text: 'Read book' },
 *   { id: 3, text: 'Walk dog' },
 * ]
 *
 * removeAtIndex(todos, 1)
 * // => [
 * //   { id: 1, text: 'Buy milk' },
 * //   { id: 3, text: 'Walk dog' },
 * // ]
 *
 * // Data-last (in pipe)
 * pipe(
 *   ['a', 'b', 'c', 'd'],
 *   removeAtIndex(2)
 * )
 * // => ['a', 'b', 'd']
 *
 * // Chain multiple removals
 * pipe(
 *   [1, 2, 3, 4, 5],
 *   removeAtIndex(0),  // [2, 3, 4, 5]
 *   removeAtIndex(-1)  // [2, 3, 4]
 * )
 * // => [2, 3, 4]
 * ```
 *
 * @see insertAt - for adding elements
 * @see updateAt - for replacing elements
 * @see moveIndex - for moving elements
 */
export function removeAtIndex<T>(
  items: readonly T[],
  index: number
): readonly T[]
export function removeAtIndex(
  index: number
): <T>(items: readonly T[]) => readonly T[]
export function removeAtIndex(...args: unknown[]): unknown {
  return instrumentedPurry('removeAtIndex', 'collection', removeAtIndexImplementation, args)
}

function removeAtIndexImplementation<T>(
  items: readonly T[],
  index: number
): readonly T[] {
  const length = items.length

  // Normalize negative index
  const normalizedIndex = index < 0 ? length + index : index

  // Return original array if index is out of bounds
  if (normalizedIndex < 0 || normalizedIndex >= length) {
    return items
  }

  // Use Remeda's splice: splice(array, start, deleteCount, items)
  return R.splice(items, normalizedIndex, 1, [])
}

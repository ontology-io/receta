import * as R from 'remeda'

/**
 * Updates (replaces) an element at a specific index (immutably).
 *
 * Creates a new array with the element at the specified index replaced with a new value.
 * More ergonomic than `splice` for single-element replacement. Built on top of Remeda's
 * `splice` for consistency.
 *
 * @param items - The array to modify
 * @param index - Position to update
 * @param value - New value to set
 * @returns New array with element updated, or original array if index is out of bounds
 *
 * @example
 * ```typescript
 * // Data-first: Update element
 * updateAt(['a', 'b', 'c', 'd'], 2, 'X')
 * // => ['a', 'b', 'X', 'd']
 *
 * // Update at beginning
 * updateAt([1, 2, 3], 0, 10)
 * // => [10, 2, 3]
 *
 * // Update at end
 * updateAt([1, 2, 3], 2, 30)
 * // => [1, 2, 30]
 *
 * // Negative index (from end)
 * updateAt(['a', 'b', 'c', 'd'], -1, 'Z')
 * // => ['a', 'b', 'c', 'Z']
 *
 * // Out of bounds returns original array
 * updateAt([1, 2, 3], 10, 99)
 * // => [1, 2, 3]
 *
 * // Update todo item
 * interface Todo {
 *   id: number
 *   text: string
 *   done: boolean
 * }
 *
 * const todos: Todo[] = [
 *   { id: 1, text: 'Buy milk', done: false },
 *   { id: 2, text: 'Read book', done: false },
 *   { id: 3, text: 'Walk dog', done: false },
 * ]
 *
 * updateAt(todos, 1, { id: 2, text: 'Read book', done: true })
 * // => [
 * //   { id: 1, text: 'Buy milk', done: false },
 * //   { id: 2, text: 'Read book', done: true },
 * //   { id: 3, text: 'Walk dog', done: false },
 * // ]
 *
 * // Data-last (in pipe)
 * pipe(
 *   ['a', 'b', 'c', 'd'],
 *   updateAt(2, 'X')
 * )
 * // => ['a', 'b', 'X', 'd']
 * ```
 *
 * @see insertAt - for adding elements
 * @see removeAtIndex - for removing elements
 * @see moveIndex - for moving elements
 */
export function updateAt<T>(
  items: readonly T[],
  index: number,
  value: T
): readonly T[]
export function updateAt<T>(
  index: number,
  value: T
): (items: readonly T[]) => readonly T[]
export function updateAt(...args: unknown[]): unknown {
  return R.purry(updateAtImplementation, args)
}

function updateAtImplementation<T>(
  items: readonly T[],
  index: number,
  value: T
): readonly T[] {
  const length = items.length

  // Normalize negative index
  const normalizedIndex = index < 0 ? length + index : index

  // Return original array if index is out of bounds
  if (normalizedIndex < 0 || normalizedIndex >= length) {
    return items
  }

  // Use Remeda's splice: splice(array, start, deleteCount, items)
  return R.splice(items, normalizedIndex, 1, [value])
}

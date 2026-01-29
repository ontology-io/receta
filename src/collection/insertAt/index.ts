import * as R from 'remeda'

/**
 * Inserts one or more elements at a specific index (immutably).
 *
 * Creates a new array with elements inserted at the specified index, shifting
 * existing elements as needed. More ergonomic than `splice` for insertion-only operations.
 * Built on top of Remeda's `splice` for consistency.
 *
 * @param items - The array to modify
 * @param index - Position to insert at (0 = beginning, length = end)
 * @param values - Element(s) to insert
 * @returns New array with elements inserted
 *
 * @example
 * ```typescript
 * // Data-first: Insert single element
 * insertAt(['a', 'b', 'd', 'e'], 2, 'c')
 * // => ['a', 'b', 'c', 'd', 'e']
 *
 * // Insert multiple elements
 * insertAt([1, 2, 5, 6], 2, [3, 4])
 * // => [1, 2, 3, 4, 5, 6]
 *
 * // Insert at beginning
 * insertAt(['b', 'c'], 0, 'a')
 * // => ['a', 'b', 'c']
 *
 * // Insert at end
 * insertAt(['a', 'b'], 2, 'c')
 * // => ['a', 'b', 'c']
 *
 * // Negative index (from end)
 * insertAt(['a', 'b', 'd'], -1, 'c')
 * // => ['a', 'b', 'c', 'd']
 *
 * // Add item to todo list at specific position
 * interface Todo {
 *   id: number
 *   text: string
 * }
 *
 * const todos: Todo[] = [
 *   { id: 1, text: 'Buy milk' },
 *   { id: 3, text: 'Walk dog' },
 * ]
 *
 * insertAt(todos, 1, { id: 2, text: 'Read book' })
 * // => [
 * //   { id: 1, text: 'Buy milk' },
 * //   { id: 2, text: 'Read book' },
 * //   { id: 3, text: 'Walk dog' },
 * // ]
 *
 * // Data-last (in pipe)
 * pipe(
 *   ['a', 'b', 'd', 'e'],
 *   insertAt(2, 'c')
 * )
 * // => ['a', 'b', 'c', 'd', 'e']
 * ```
 *
 * @see updateAt - for replacing elements
 * @see removeAtIndex - for removing elements
 * @see moveIndex - for moving elements
 */
export function insertAt<T>(
  items: readonly T[],
  index: number,
  values: T | readonly T[]
): readonly T[]
export function insertAt<T>(
  index: number,
  values: T | readonly T[]
): (items: readonly T[]) => readonly T[]
export function insertAt(...args: unknown[]): unknown {
  return R.purry(insertAtImplementation, args)
}

function insertAtImplementation<T>(
  items: readonly T[],
  index: number,
  values: T | readonly T[]
): readonly T[] {
  const length = items.length

  // Normalize negative index
  const normalizedIndex = index < 0 ? Math.max(0, length + index) : Math.min(index, length)

  // Convert single value to array for uniform handling
  const valueArray = Array.isArray(values) ? values : [values]

  // Use Remeda's splice: splice(array, start, deleteCount, items)
  return R.splice(items, normalizedIndex, 0, valueArray)
}

import * as R from 'remeda'
import type { Lens } from '../types'
import { lens } from '../lens'

/**
 * Creates a Lens focusing on a specific index in an array.
 *
 * Allows immutable updates to array elements at a specific position.
 * If the index is out of bounds, `get` returns undefined and `set` has no effect.
 *
 * @param idx - The array index to focus on
 * @returns A Lens focusing on the element at the specified index
 *
 * @example
 * ```typescript
 * const firstLens = index<number>(0)
 * const thirdLens = index<number>(2)
 *
 * const numbers = [1, 2, 3, 4, 5]
 *
 * firstLens.get(numbers) // 1
 * thirdLens.get(numbers) // 3
 *
 * firstLens.set(10)(numbers) // [10, 2, 3, 4, 5]
 * thirdLens.set(30)(numbers) // [1, 2, 30, 4, 5]
 * ```
 *
 * @example
 * ```typescript
 * // With objects in arrays
 * interface Todo {
 *   id: number
 *   text: string
 *   done: boolean
 * }
 *
 * const todos: Todo[] = [
 *   { id: 1, text: 'Buy milk', done: false },
 *   { id: 2, text: 'Walk dog', done: true }
 * ]
 *
 * const secondTodoLens = index<Todo>(1)
 * secondTodoLens.get(todos) // { id: 2, text: 'Walk dog', done: true }
 * ```
 *
 * @see prop - For object property access
 * @see path - For nested property access
 */
export function index<A>(idx: number): Lens<readonly A[], A | undefined> {
  return lens(
    (source) => source[idx],
    (value) => (source) => {
      if (idx < 0 || idx >= source.length || value === undefined) {
        return source
      }
      // Use Remeda's splice to immutably replace element at index
      return R.splice(source, idx, 1, [value])
    }
  )
}

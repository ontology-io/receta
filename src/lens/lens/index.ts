import type { Lens } from '../types'

/**
 * Creates a Lens from a getter and setter function.
 *
 * A lens is a composable abstraction for focusing on a specific part of a
 * data structure. It consists of:
 * - `get`: Extracts the focused value from the source
 * - `set`: Returns a new source with the focused value updated
 *
 * @param get - Function to extract the focused value
 * @param set - Function to update the focused value (returns updater)
 * @returns A Lens for the specified get/set operations
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   age: number
 * }
 *
 * const nameLens = lens<User, string>(
 *   (user) => user.name,
 *   (name) => (user) => ({ ...user, name })
 * )
 *
 * const user = { name: 'Alice', age: 30 }
 * const newName = nameLens.get(user) // 'Alice'
 * const updated = nameLens.set('Bob')(user) // { name: 'Bob', age: 30 }
 * ```
 *
 * @see prop - For simple property access
 * @see path - For nested property access
 */
export function lens<S, A>(
  get: (source: S) => A,
  set: (value: A) => (source: S) => S
): Lens<S, A> {
  return { get, set }
}

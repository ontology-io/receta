import type { Lens } from '../types'
import { lens } from '../lens'

/**
 * Creates a Lens focusing on a specific property of an object.
 *
 * This is a convenience function for creating lenses that access a single
 * property. It's type-safe and ensures the property exists on the object.
 *
 * @param key - The property key to focus on
 * @returns A Lens focusing on the specified property
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   email: string
 *   age: number
 * }
 *
 * const nameLens = prop<User>('name')
 * const emailLens = prop<User>('email')
 *
 * const user = { name: 'Alice', email: 'alice@example.com', age: 30 }
 *
 * nameLens.get(user) // 'Alice'
 * nameLens.set('Bob')(user) // { name: 'Bob', email: 'alice@example.com', age: 30 }
 * ```
 *
 * @see lens - For custom get/set logic
 * @see path - For nested property access
 * @see view - To read through the lens
 * @see set - To write through the lens
 */
export function prop<S, K extends keyof S>(key: K): Lens<S, S[K]> {
  return lens(
    (source) => source[key],
    (value) => (source) => ({ ...source, [key]: value })
  )
}

/**
 * Removes all undefined values from an object (shallow).
 *
 * @module object/stripUndefined
 */

import * as R from 'remeda'
import type { PlainObject } from '../types'

/**
 * Removes all undefined values from an object (shallow).
 *
 * Creates a new object without properties that have undefined values.
 * Useful for cleaning up data before sending to APIs, preventing
 * prototype pollution, and preparing data for serialization.
 *
 * Note: This is a shallow operation. Use with `mapValues` for deep cleaning.
 *
 * @param obj - The object to clean
 * @returns A new object without undefined values
 *
 * @example
 * ```typescript
 * // Data-first
 * const input = { name: 'Alice', age: undefined, email: 'alice@example.com' }
 * stripUndefined(input)
 * // => { name: 'Alice', email: 'alice@example.com' }
 *
 * // Preparing API payload
 * const payload = stripUndefined({
 *   name: formData.name,
 *   email: formData.email,
 *   phone: formData.phone // might be undefined
 * })
 *
 * // Data-last (in pipe)
 * pipe(
 *   formData,
 *   stripUndefined,
 *   validateShape(schema)
 * )
 * ```
 *
 * @see compact - for removing both null and undefined
 */
export function stripUndefined<T extends PlainObject>(obj: T): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (value !== undefined) {
      result[key as keyof T] = value as T[keyof T]
    }
  })

  return result
}

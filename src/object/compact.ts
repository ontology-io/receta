/**
 * Removes all nullish (null or undefined) values from an object (shallow).
 *
 * @module object/compact
 */

import * as R from 'remeda'
import type { PlainObject } from './types'

/**
 * Removes all nullish (null or undefined) values from an object (shallow).
 *
 * Creates a new object without properties that have null or undefined values.
 * Useful for cleaning data, preparing payloads, and removing empty fields.
 *
 * Note: This is a shallow operation. Nested objects are not compacted.
 *
 * @param obj - The object to compact
 * @returns A new object without nullish values
 *
 * @example
 * ```typescript
 * const input = {
 *   name: 'Alice',
 *   age: null,
 *   email: 'alice@example.com',
 *   phone: undefined
 * }
 * compact(input)
 * // => { name: 'Alice', email: 'alice@example.com' }
 *
 * // Cleaning API response
 * pipe(
 *   apiResponse,
 *   compact,
 *   validateShape(schema)
 * )
 *
 * // Note: Keeps falsy values like 0, false, ''
 * compact({ count: 0, active: false, name: '' })
 * // => { count: 0, active: false, name: '' }
 * ```
 *
 * @see stripUndefined - for removing only undefined values
 */
export function compact<T extends PlainObject>(obj: T): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (value != null) {
      result[key as keyof T] = value as T[keyof T]
    }
  })

  return result
}

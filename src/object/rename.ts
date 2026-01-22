/**
 * Renames keys in an object according to a mapping.
 *
 * @module object/rename
 */

import * as R from 'remeda'
import type { PlainObject } from './types'

/**
 * Renames keys in an object according to a mapping.
 *
 * Creates a new object with renamed keys. If a key isn't in the mapping,
 * it's kept as-is. Useful for transforming API responses, normalizing data,
 * and adapting to different schemas.
 *
 * @param obj - The object with keys to rename
 * @param mapping - Object mapping old keys to new keys
 * @returns A new object with renamed keys
 *
 * @example
 * ```typescript
 * // Data-first
 * const user = { firstName: 'Alice', lastName: 'Smith' }
 * rename(user, { firstName: 'given_name', lastName: 'family_name' })
 * // => { given_name: 'Alice', family_name: 'Smith' }
 *
 * // Partial mapping (unmapped keys preserved)
 * rename({ id: 1, name: 'Alice', age: 30 }, { name: 'fullName' })
 * // => { id: 1, fullName: 'Alice', age: 30 }
 *
 * // Data-last (in pipe)
 * pipe(
 *   apiResponse,
 *   rename({ user_id: 'userId', created_at: 'createdAt' })
 * )
 * ```
 *
 * @see mapKeys - for transforming all keys with a function
 */
export function rename<T extends PlainObject>(obj: T, mapping: Record<string, string>): PlainObject
export function rename(mapping: Record<string, string>): <T extends PlainObject>(obj: T) => PlainObject
export function rename(...args: unknown[]): unknown {
  return R.purry(renameImplementation, args)
}

function renameImplementation<T extends PlainObject>(obj: T, mapping: Record<string, string>): PlainObject {
  const result: PlainObject = {}

  Object.entries(obj).forEach(([key, value]) => {
    const newKey = mapping[key] ?? key
    result[newKey] = value
  })

  return result
}

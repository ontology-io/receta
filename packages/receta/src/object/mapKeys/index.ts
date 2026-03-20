/**
 * Transforms all keys in an object using a mapping function.
 *
 * @module object/mapKeys
 */

import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'
import type { PlainObject } from '../types'

/**
 * Transforms all keys in an object using a mapping function.
 *
 * Creates a new object with all keys transformed by the provided function.
 * Useful for normalizing keys (camelCase, snake_case), prefixing, or
 * other systematic key transformations.
 *
 * Note: If multiple keys map to the same new key, later values overwrite earlier ones.
 *
 * @param obj - The object whose keys to transform
 * @param fn - Function that transforms each key (receives key and value)
 * @returns A new object with transformed keys
 *
 * @example
 * ```typescript
 * // Data-first
 * const snakeCase = {
 *   first_name: 'Alice',
 *   last_name: 'Smith',
 *   email_address: 'alice@example.com'
 * }
 * mapKeys(snakeCase, (key) => key.replace(/_([a-z])/g, (_, c) => c.toUpperCase()))
 * // => { firstName: 'Alice', lastName: 'Smith', emailAddress: 'alice@example.com' }
 *
 * // Prefixing keys
 * mapKeys({ id: 1, name: 'Alice' }, (key) => `user_${key}`)
 * // => { user_id: 1, user_name: 'Alice' }
 *
 * // With key and value
 * mapKeys(obj, (key, value) => typeof value === 'number' ? key.toUpperCase() : key)
 *
 * // Data-last (in pipe)
 * pipe(
 *   apiResponse,
 *   mapKeys((key) => toCamelCase(key))
 * )
 * ```
 *
 * @see rename - for selective key renaming with a mapping object
 * @see Remeda.mapKeys - this wraps Remeda's mapKeys for consistency
 */
export function mapKeys<T extends PlainObject>(
  obj: T,
  fn: (key: string, value: T[keyof T]) => string
): PlainObject
export function mapKeys(
  fn: (key: string, value: any) => string
): <T extends PlainObject>(obj: T) => PlainObject
export function mapKeys(...args: unknown[]): unknown {
  return instrumentedPurry('mapKeys', 'object', mapKeysImplementation, args)
}

function mapKeysImplementation<T extends PlainObject>(
  obj: T,
  fn: (key: string, value: T[keyof T]) => string
): PlainObject {
  // Use Remeda's mapKeys
  return R.mapKeys(obj, fn as any)
}

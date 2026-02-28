/**
 * Immutably updates a value at a given path using a function.
 *
 * @module object/updatePath
 */

import type { Option } from '../../option/types'
import { isSome } from '../../option/guards'
import { getPath } from '../getPath'
import { setPath } from '../setPath'
import type { ObjectPath, PlainObject } from '../types'
import { purryConfig2 } from '../../utils/purry'

/**
 * Immutably updates a value at a given path using a function.
 *
 * Retrieves the current value at the path, applies the update function,
 * and sets the new value. If the path doesn't exist, the object is returned
 * unchanged.
 *
 * @param path - The path to the value to update
 * @param fn - Function to transform the current value
 * @param obj - The object to update
 * @returns A new object with the updated value, or the original if path not found
 *
 * @example
 * ```typescript
 * // Data-first
 * const user = { profile: { views: 10 } }
 * updatePath(['profile', 'views'], (n: number) => n + 1, user)
 * // => { profile: { views: 11 } }
 *
 * // Path doesn't exist - returns original
 * updatePath(['profile', 'likes'], (n: number) => n + 1, user)
 * // => { profile: { views: 10 } }
 *
 * // Transforming nested data
 * updatePath(['database', 'host'], (host: string) => host.toUpperCase(), config)
 *
 * // Data-last (in pipe)
 * pipe(
 *   user,
 *   updatePath(['profile', 'views'], (n: number) => n + 1),
 *   updatePath(['profile', 'lastSeen'], () => new Date())
 * )
 * ```
 *
 * @see getPath - for reading a value at a path
 * @see setPath - for setting a value directly
 */
export function updatePath<T extends PlainObject, V>(
  path: ObjectPath,
  fn: (value: V) => V,
  obj: T
): T
export function updatePath<V>(
  path: ObjectPath,
  fn: (value: V) => V
): <T extends PlainObject>(obj: T) => T
export function updatePath(...args: unknown[]): unknown {
  return purryConfig2(updatePathImplementation, args)
}

function updatePathImplementation<T extends PlainObject, V>(
  path: ObjectPath,
  fn: (value: V) => V,
  obj: T
): T {
  const currentValue: Option<V> = getPath<V>(path, obj)

  if (!isSome(currentValue)) {
    // Path doesn't exist, return original object
    return obj
  }

  const newValue = fn(currentValue.value)
  return setPath(path, newValue, obj)
}

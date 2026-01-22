/**
 * Immutably updates a value at a given path using a function.
 *
 * @module object/updatePath
 */

import * as R from 'remeda'
import type { Option } from '../option/types'
import { isSome } from '../option/guards'
import { getPath } from './getPath'
import { setPath } from './setPath'
import type { ObjectPath, PlainObject } from './types'

/**
 * Immutably updates a value at a given path using a function.
 *
 * Retrieves the current value at the path, applies the update function,
 * and sets the new value. If the path doesn't exist, the object is returned
 * unchanged.
 *
 * @param obj - The object to update
 * @param path - The path to the value to update
 * @param fn - Function to transform the current value
 * @returns A new object with the updated value, or the original if path not found
 *
 * @example
 * ```typescript
 * // Data-first
 * const user = { profile: { views: 10 } }
 * updatePath(user, ['profile', 'views'], (n: number) => n + 1)
 * // => { profile: { views: 11 } }
 *
 * // Path doesn't exist - returns original
 * updatePath(user, ['profile', 'likes'], (n: number) => n + 1)
 * // => { profile: { views: 10 } }
 *
 * // Transforming nested data
 * updatePath(config, ['database', 'host'], (host: string) => host.toUpperCase())
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
  obj: T,
  path: ObjectPath,
  fn: (value: V) => V
): T
export function updatePath<V>(
  path: ObjectPath,
  fn: (value: V) => V
): <T extends PlainObject>(obj: T) => T
export function updatePath(...args: unknown[]): unknown {
  return R.purry(updatePathImplementation, args)
}

function updatePathImplementation<T extends PlainObject, V>(
  obj: T,
  path: ObjectPath,
  fn: (value: V) => V
): T {
  const currentValue: Option<V> = getPath<V>(obj, path)

  if (!isSome(currentValue)) {
    // Path doesn't exist, return original object
    return obj
  }

  const newValue = fn(currentValue.value)
  return setPath(obj, path, newValue)
}

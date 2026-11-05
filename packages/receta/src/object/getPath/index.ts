/**
 * Safely gets a value at a given path in an object, returning Option.
 *
 * @module object/getPath
 */

import type { Option } from '../../option/types'
import { some, none } from '../../option/constructors'
import type { ObjectPath, PlainObject } from '../types'
import { purryConfig } from '../../utils/purry'

/**
 * Safely gets a value at a given path in an object, returning Option.
 *
 * Navigates nested object structures using a path (array of keys).
 * Returns None if the path runs through a missing or null value, or ends at
 * undefined. A value of null at the end of the path comes back as Some(null).
 * Unlike optional chaining, the result composes with other Option operations.
 *
 * @param path - The path to follow (array of keys)
 * @param obj - The object to navigate
 * @returns Option<T> - Some(value) if found, None otherwise
 *
 * @example
 * ```typescript
 * import { map, unwrapOr } from '@ontologyio/receta/option'
 *
 * // Data-first
 * const config = { database: { host: 'localhost', port: 5432 } }
 * getPath(['database', 'host'], config)
 * // => Some('localhost')
 *
 * getPath(['database', 'user'], config)
 * // => None
 *
 * getPath(['api', 'key'], config)
 * // => None
 *
 * // Composing with Option
 * pipe(
 *   getPath(['database', 'host'], config),
 *   map(host => `postgres://${host}`),
 *   unwrapOr('postgres://localhost')
 * )
 *
 * // Data-last (in pipe)
 * pipe(
 *   config,
 *   getPath(['database', 'port'])
 * )
 * ```
 *
 * @see setPath - for immutably setting a value at a path
 * @see updatePath - for updating a value at a path with a function
 */
export function getPath<T = unknown>(path: ObjectPath, obj: PlainObject): Option<T>
export function getPath<T = unknown>(path: ObjectPath): (obj: PlainObject) => Option<T>
export function getPath(...args: unknown[]): unknown {
  return purryConfig(getPathImplementation, args)
}

function getPathImplementation<T>(path: ObjectPath, obj: PlainObject): Option<T> {
  if (path.length === 0) {
    return some(obj as T)
  }

  let current: any = obj

  for (const key of path) {
    if (current == null || typeof current !== 'object') {
      return none()
    }

    current = current[key]

    if (current === undefined) {
      return none()
    }
  }

  return some(current as T)
}

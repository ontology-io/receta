/**
 * Safely gets a value at a given path in an object, returning Option.
 *
 * @module object/getPath
 */

import * as R from 'remeda'
import type { Option } from '../option/types'
import { some, none } from '../option/constructors'
import type { ObjectPath, PlainObject } from './types'

/**
 * Safely gets a value at a given path in an object, returning Option.
 *
 * Navigates nested object structures using a path (array of keys).
 * Returns Some(value) if the path exists, None if any part is undefined/null.
 * Safer than optional chaining as it composes with other Option operations.
 *
 * @param obj - The object to navigate
 * @param path - The path to follow (array of keys)
 * @returns Option<T> - Some(value) if found, None otherwise
 *
 * @example
 * ```typescript
 * // Data-first
 * const config = { database: { host: 'localhost', port: 5432 } }
 * getPath(config, ['database', 'host'])
 * // => Some('localhost')
 *
 * getPath(config, ['database', 'user'])
 * // => None
 *
 * getPath(config, ['api', 'key'])
 * // => None (intermediate path doesn't exist)
 *
 * // Composing with Option
 * pipe(
 *   config,
 *   getPath(['database', 'host']),
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
export function getPath<T = unknown>(obj: PlainObject, path: ObjectPath): Option<T>
export function getPath<T = unknown>(path: ObjectPath): (obj: PlainObject) => Option<T>
export function getPath(...args: unknown[]): unknown {
  return R.purry(getPathImplementation, args)
}

function getPathImplementation<T>(obj: PlainObject, path: ObjectPath): Option<T> {
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

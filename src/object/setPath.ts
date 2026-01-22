/**
 * Immutably sets a value at a given path in an object.
 *
 * @module object/setPath
 */

import * as R from 'remeda'
import type { ObjectPath, PlainObject } from './types'

/**
 * Immutably sets a value at a given path in an object.
 *
 * Creates a new object with the value at the specified path updated.
 * Creates intermediate objects/arrays as needed. Returns a shallow copy
 * with only the path modified.
 *
 * @param obj - The object to update
 * @param path - The path where to set the value
 * @param value - The value to set
 * @returns A new object with the value set at the path
 *
 * @example
 * ```typescript
 * // Data-first
 * const config = { database: { host: 'localhost' } }
 * setPath(config, ['database', 'port'], 5432)
 * // => { database: { host: 'localhost', port: 5432 } }
 *
 * // Creating intermediate paths
 * setPath({}, ['api', 'endpoints', 'users'], '/api/v1/users')
 * // => { api: { endpoints: { users: '/api/v1/users' } } }
 *
 * // Array indices
 * setPath({ items: ['a', 'b'] }, ['items', 1], 'updated')
 * // => { items: ['a', 'updated'] }
 *
 * // Data-last (in pipe)
 * pipe(
 *   config,
 *   setPath(['database', 'host'], 'prod.example.com'),
 *   setPath(['database', 'port'], 5432)
 * )
 * ```
 *
 * @see getPath - for safely reading a value at a path
 * @see updatePath - for updating with a function
 */
export function setPath<T extends PlainObject>(obj: T, path: ObjectPath, value: unknown): T
export function setPath(path: ObjectPath, value: unknown): <T extends PlainObject>(obj: T) => T
export function setPath(...args: unknown[]): unknown {
  return R.purry(setPathImplementation, args)
}

function setPathImplementation<T extends PlainObject>(obj: T, path: ObjectPath, value: unknown): T {
  if (path.length === 0) {
    return value as T
  }

  const [head, ...tail] = path

  if (tail.length === 0) {
    // Base case: set the value
    if (Array.isArray(obj)) {
      const newArray = [...obj]
      newArray[head as number] = value
      return newArray as any as T
    } else {
      return { ...obj, [head as any]: value } as T
    }
  }

  // Recursive case: navigate deeper
  const current = obj[head as keyof T]

  // Determine if next level should be array or object
  const nextKey = tail[0]
  const shouldBeArray = typeof nextKey === 'number'

  let nextValue: any
  if (current === undefined || current === null) {
    // Create new intermediate value
    nextValue = shouldBeArray ? [] : {}
  } else if (Array.isArray(current)) {
    nextValue = current
  } else if (typeof current === 'object') {
    nextValue = current
  } else {
    // Current value is primitive, replace with new structure
    nextValue = shouldBeArray ? [] : {}
  }

  const updatedNext = setPathImplementation(nextValue, tail, value)

  if (Array.isArray(obj)) {
    const newArray = [...obj]
    newArray[head as number] = updatedNext
    return newArray as any as T
  } else {
    return { ...obj, [head as any]: updatedNext } as T
  }
}

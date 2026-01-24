/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 *
 * @module object/flatten
 */

import * as R from 'remeda'
import type { FlatObject, FlattenOptions, PlainObject } from '../types'

/**
 * Flattens a nested object into a single-level object with dot-notation keys.
 *
 * Converts nested structures like `{ user: { name: 'Alice' } }` into
 * `{ 'user.name': 'Alice' }`. Useful for form data, query parameters,
 * and database operations.
 *
 * @param obj - The object to flatten
 * @param options - Flattening options (separator, maxDepth, flattenArrays)
 * @returns A flattened object with dot-notation keys
 *
 * @example
 * ```typescript
 * // Data-first
 * const nested = { user: { name: 'Alice', age: 30 } }
 * flatten(nested)
 * // => { 'user.name': 'Alice', 'user.age': 30 }
 *
 * // Custom separator
 * flatten(nested, { separator: '_' })
 * // => { 'user_name': 'Alice', 'user_age': 30 }
 *
 * // Max depth
 * flatten({ a: { b: { c: 1 } } }, { maxDepth: 1 })
 * // => { 'a.b': { c: 1 } }
 *
 * // Data-last (in pipe)
 * pipe(
 *   nested,
 *   flatten({ separator: '_' })
 * )
 * ```
 *
 * @see unflatten - for reversing the flattening
 */
export function flatten(obj: PlainObject, options?: FlattenOptions): FlatObject
export function flatten(options?: FlattenOptions): (obj: PlainObject) => FlatObject
export function flatten(objOrOptions?: PlainObject | FlattenOptions, maybeOptions?: FlattenOptions): any {
  // Data-last: if first arg looks like options (has separator/maxDepth/flattenArrays keys)
  if (objOrOptions !== undefined && typeof objOrOptions === 'object' &&
      ('separator' in objOrOptions || 'maxDepth' in objOrOptions || 'flattenArrays' in objOrOptions)) {
    return (obj: PlainObject) => flattenImplementation(obj, objOrOptions as FlattenOptions)
  }

  // Data-first
  return flattenImplementation(objOrOptions as PlainObject ?? {}, maybeOptions)
}

function flattenImplementation(obj: PlainObject, options?: FlattenOptions): FlatObject {
  const opts = options ?? {}
  const { separator = '.', maxDepth = Infinity, flattenArrays = false } = opts
  const result: Record<string, unknown> = {}

  function recurse(current: unknown, path: string[], depth: number): void {
    // Stop at max depth (depth is 0-indexed, so depth >= maxDepth means we've reached the limit)
    if (depth >= maxDepth) {
      result[path.join(separator)] = current
      return
    }

    // Handle null/undefined
    if (current == null) {
      result[path.join(separator)] = current
      return
    }

    // Handle arrays
    if (Array.isArray(current)) {
      if (flattenArrays) {
        if (current.length === 0) {
          result[path.join(separator)] = []
        } else {
          current.forEach((item, index) => {
            recurse(item, [...path, String(index)], depth + 1)
          })
        }
      } else {
        result[path.join(separator)] = current
      }
      return
    }

    // Handle plain objects
    if (R.isPlainObject(current)) {
      const entries = Object.entries(current as Record<string, unknown>)

      if (entries.length === 0) {
        result[path.join(separator)] = {}
      } else {
        entries.forEach(([key, value]) => {
          recurse(value, [...path, key], depth + 1)
        })
      }
      return
    }

    // Handle primitives and other types
    result[path.join(separator)] = current
  }

  // Start recursion
  Object.entries(obj).forEach(([key, value]) => {
    recurse(value, [key], 0)
  })

  return result
}

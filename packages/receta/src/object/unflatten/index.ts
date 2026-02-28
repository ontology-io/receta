/**
 * Unflattens a single-level object with dot-notation keys into a nested object.
 *
 * @module object/unflatten
 */

import * as R from 'remeda'
import type { FlatObject, PlainObject, UnflattenOptions } from '../types'

/**
 * Unflattens a single-level object with dot-notation keys into a nested object.
 *
 * Reverses the flattening operation, converting `{ 'user.name': 'Alice' }`
 * back into `{ user: { name: 'Alice' } }`.
 *
 * @param obj - The flattened object to unflatten
 * @param options - Unflattening options (separator)
 * @returns A nested object
 *
 * @example
 * ```typescript
 * // Data-first
 * const flat = { 'user.name': 'Alice', 'user.age': 30 }
 * unflatten(flat)
 * // => { user: { name: 'Alice', age: 30 } }
 *
 * // Custom separator
 * unflatten({ 'user_name': 'Alice' }, { separator: '_' })
 * // => { user: { name: 'Alice' } }
 *
 * // Array indices
 * unflatten({ 'items.0': 'a', 'items.1': 'b' })
 * // => { items: ['a', 'b'] }
 *
 * // Data-last (in pipe)
 * pipe(
 *   flat,
 *   unflatten({ separator: '_' })
 * )
 * ```
 *
 * @see flatten - for the reverse operation
 */
export function unflatten(obj: FlatObject, options?: UnflattenOptions): PlainObject
export function unflatten(options?: UnflattenOptions): (obj: FlatObject) => PlainObject
export function unflatten(objOrOptions?: FlatObject | UnflattenOptions, maybeOptions?: UnflattenOptions): any {
  // Data-last: if first arg looks like options (has separator key)
  if (objOrOptions !== undefined && typeof objOrOptions === 'object' && 'separator' in objOrOptions && !Object.keys(objOrOptions).some(k => k.includes('.'))) {
    return (obj: FlatObject) => unflattenImplementation(obj, objOrOptions as UnflattenOptions)
  }

  // Data-first
  return unflattenImplementation(objOrOptions as FlatObject ?? {}, maybeOptions)
}

function unflattenImplementation(obj: FlatObject, options?: UnflattenOptions): PlainObject {
  const opts = options ?? {}
  const { separator = '.' } = opts
  const result: PlainObject = {}

  Object.entries(obj).forEach(([key, value]) => {
    const parts = key.split(separator)
    let current: any = result

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1

      if (isLast) {
        current[part] = value
      } else {
        // Check if next part is a number to determine array vs object
        const nextPart = parts[index + 1]
        const isNextPartNumber = nextPart !== undefined && /^\d+$/.test(nextPart)

        if (current[part] === undefined) {
          current[part] = isNextPartNumber ? [] : {}
        }

        current = current[part]
      }
    })
  })

  return result
}

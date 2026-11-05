/**
 * Unflattens a single-level object with dot-notation keys into a nested object.
 *
 * @module object/unflatten
 */

import * as R from 'remeda'
import type { FlatObject, PlainObject, UnflattenOptions } from '../types'
import { isOptionsObject } from '../isOptionsObject'
import { setOwnKey } from '../../utils/setOwnKey'

const OPTION_TYPES = { separator: 'string' } as const

/**
 * Unflattens a single-level object with dot-notation keys into a nested object.
 *
 * Reverses the flattening operation, converting `{ 'user.name': 'Alice' }`
 * back into `{ user: { name: 'Alice' } }`.
 *
 * @param obj - The flattened object to unflatten
 * An object made only of option keys reads as options. To treat one as data, pass `{}` as the second argument.
 *
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
 * // unflatten() works in a pipe. With options, wrap it, because TypeScript
 * // reads unflatten({ separator: '_' }) as the data-first call.
 * pipe(
 *   flat,
 *   (obj) => unflatten(obj)
 * )
 * ```
 *
 * @see flatten - for the reverse operation
 */
export function unflatten(obj: FlatObject, options?: UnflattenOptions): PlainObject
export function unflatten(options?: UnflattenOptions): (obj: FlatObject) => PlainObject
export function unflatten(objOrOptions?: FlatObject | UnflattenOptions, maybeOptions?: UnflattenOptions): any {
  // Data-last: no arguments, or a lone argument made only of options
  if (maybeOptions === undefined && (objOrOptions === undefined || isOptionsObject(objOrOptions, OPTION_TYPES))) {
    return (obj: FlatObject) => unflattenImplementation(obj, objOrOptions as UnflattenOptions | undefined)
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
        setOwnKey(current, part, value)
      } else {
        // Check if next part is a number to determine array vs object
        const nextPart = parts[index + 1]
        const isNextPartNumber = nextPart !== undefined && /^\d+$/.test(nextPart)

        // Own keys only: an inherited one would walk into a shared prototype
        if (!Object.hasOwn(current, part) || current[part] === undefined) {
          setOwnKey(current, part, isNextPartNumber ? [] : {})
        }

        current = current[part]
      }
    })
  })

  return result
}

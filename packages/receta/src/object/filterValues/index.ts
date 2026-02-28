/**
 * Filters an object by keeping only entries whose values match a predicate.
 *
 * @module object/filterValues
 */

import * as R from 'remeda'
import type { PlainObject } from '../types'

/**
 * Filters an object by keeping only entries whose values match a predicate.
 *
 * Creates a new object containing only entries whose values satisfy the predicate.
 * Useful for removing empty values, filtering by type, or keeping only specific
 * value ranges.
 *
 * @param obj - The object to filter
 * @param predicate - Function that tests each value (receives value and key)
 * @returns A new object with filtered entries
 *
 * @example
 * ```typescript
 * // Data-first
 * const scores = { alice: 85, bob: 60, charlie: 92, diana: 55 }
 * filterValues(scores, (score) => score >= 70)
 * // => { alice: 85, charlie: 92 }
 *
 * // Remove empty strings
 * filterValues({ a: 'hello', b: '', c: 'world' }, (v) => v !== '')
 * // => { a: 'hello', c: 'world' }
 *
 * // Type filtering
 * const mixed = { a: 1, b: 'two', c: 3, d: 'four' }
 * filterValues(mixed, (v) => typeof v === 'number')
 * // => { a: 1, c: 3 }
 *
 * // With key and value
 * filterValues(obj, (value, key) => value > threshold[key])
 *
 * // Data-last (in pipe)
 * pipe(
 *   data,
 *   filterValues((v) => v != null)
 * )
 * ```
 *
 * @see filterKeys - for filtering by keys instead of values
 * @see compact - for removing nullish values specifically
 */
export function filterValues<T extends PlainObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T>
export function filterValues(
  predicate: (value: any, key: string) => boolean
): <T extends PlainObject>(obj: T) => Partial<T>
export function filterValues(...args: unknown[]): unknown {
  return R.purry(filterValuesImplementation, args)
}

function filterValuesImplementation<T extends PlainObject>(
  obj: T,
  predicate: (value: T[keyof T], key: keyof T) => boolean
): Partial<T> {
  const result: Partial<T> = {}

  Object.entries(obj).forEach(([key, value]) => {
    if (predicate(value as T[keyof T], key as keyof T)) {
      result[key as keyof T] = value as T[keyof T]
    }
  })

  return result
}

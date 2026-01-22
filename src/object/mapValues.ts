/**
 * Transforms all values in an object using a mapping function.
 *
 * @module object/mapValues
 */

import * as R from 'remeda'
import type { PlainObject } from './types'

/**
 * Transforms all values in an object using a mapping function.
 *
 * Creates a new object with all values transformed by the provided function.
 * This is a re-export of Remeda's mapValues for consistency and to enable
 * integration with Result/Option patterns.
 *
 * @param obj - The object whose values to transform
 * @param fn - Function that transforms each value (receives value and key)
 * @returns A new object with transformed values
 *
 * @example
 * ```typescript
 * // Data-first
 * const prices = { apple: 1.5, banana: 0.5, orange: 2.0 }
 * mapValues(prices, (price) => price * 1.1) // 10% increase
 * // => { apple: 1.65, banana: 0.55, orange: 2.2 }
 *
 * // Type conversion
 * mapValues({ a: 1, b: 2, c: 3 }, (n) => String(n))
 * // => { a: '1', b: '2', c: '3' }
 *
 * // With key and value
 * mapValues(obj, (value, key) => `${key}: ${value}`)
 *
 * // Data-last (in pipe)
 * pipe(
 *   config,
 *   mapValues((v) => normalizeValue(v))
 * )
 * ```
 *
 * @see mapKeys - for transforming keys instead of values
 * @see Remeda.mapValues - original implementation
 */
export function mapValues<T extends PlainObject, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U>
export function mapValues<U>(
  fn: (value: any, key: string) => U
): <T extends PlainObject>(obj: T) => Record<keyof T, U>
export function mapValues(...args: unknown[]): unknown {
  return R.purry(mapValuesImplementation, args)
}

function mapValuesImplementation<T extends PlainObject, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U
): Record<keyof T, U> {
  // Use Remeda's mapValues
  return R.mapValues(obj, fn as any) as Record<keyof T, U>
}

/**
 * Fast-check arbitraries for Result types.
 *
 * Generates random Result<T, E> values for property-based testing.
 */

import * as fc from 'fast-check'
import type { Result } from '../types/result'
import type { ResultArbitraryConfig } from './types'

/**
 * Generate random Result<T, E> values.
 *
 * By default, generates 50% Ok and 50% Err values. Use `okWeight` to adjust the distribution.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { result } from 'receta-test/arbitraries'
 *
 * // Generate Result<number, string>
 * const resultArb = result(fc.integer(), fc.string())
 *
 * fc.assert(
 *   fc.property(resultArb, (r) => {
 *     // r is randomly Ok(number) or Err(string)
 *     if (r._tag === 'Ok') {
 *       expect(typeof r.value).toBe('number')
 *     } else {
 *       expect(typeof r.error).toBe('string')
 *     }
 *   })
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Generate mostly Ok values (90%)
 * const resultArb = result(fc.integer(), fc.string(), { okWeight: 0.9 })
 * ```
 *
 * @param okArb - Arbitrary for generating Ok values
 * @param errArb - Arbitrary for generating Err values
 * @param config - Configuration for weight distribution
 * @returns Arbitrary that generates Result<T, E>
 */
export function result<T, E>(
  okArb: fc.Arbitrary<T>,
  errArb: fc.Arbitrary<E>,
  config: ResultArbitraryConfig = {}
): fc.Arbitrary<Result<T, E>> {
  const { okWeight = 0.5 } = config

  // Use fc.integer() to decide between Ok and Err based on weight
  return fc
    .tuple(fc.integer({ min: 0, max: 99 }), okArb, errArb)
    .map(([random, value, error]): Result<T, E> => {
      return random < okWeight * 100 ? { _tag: 'Ok', value } : { _tag: 'Err', error }
    })
}

/**
 * Generate only Ok results.
 *
 * Useful when you want to test behavior with guaranteed success values.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { okResult } from 'receta-test/arbitraries'
 *
 * const okArb = okResult(fc.integer())
 *
 * fc.assert(
 *   fc.property(okArb, (r) => {
 *     expect(r._tag).toBe('Ok')
 *     expect(typeof r.value).toBe('number')
 *   })
 * )
 * ```
 *
 * @param valueArb - Arbitrary for generating Ok values
 * @returns Arbitrary that always generates Ok results
 */
export function okResult<T>(valueArb: fc.Arbitrary<T>): fc.Arbitrary<Result<T, never>> {
  return valueArb.map((value): Result<T, never> => ({ _tag: 'Ok', value }))
}

/**
 * Generate only Err results.
 *
 * Useful when you want to test error handling paths.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { errResult } from 'receta-test/arbitraries'
 *
 * const errArb = errResult(fc.string())
 *
 * fc.assert(
 *   fc.property(errArb, (r) => {
 *     expect(r._tag).toBe('Err')
 *     expect(typeof r.error).toBe('string')
 *   })
 * )
 * ```
 *
 * @param errorArb - Arbitrary for generating Err values
 * @returns Arbitrary that always generates Err results
 */
export function errResult<E>(errorArb: fc.Arbitrary<E>): fc.Arbitrary<Result<never, E>> {
  return errorArb.map((error): Result<never, E> => ({ _tag: 'Err', error }))
}

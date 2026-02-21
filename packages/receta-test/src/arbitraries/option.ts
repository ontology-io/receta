/**
 * Fast-check arbitraries for Option types.
 *
 * Generates random Option<T> values for property-based testing.
 */

import * as fc from 'fast-check'
import type { Option } from '../types/option'
import type { OptionArbitraryConfig } from './types'

/**
 * Generate random Option<T> values.
 *
 * By default, generates 50% Some and 50% None values. Use `someWeight` to adjust the distribution.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { option } from 'receta-test/arbitraries'
 *
 * // Generate Option<number>
 * const optionArb = option(fc.integer())
 *
 * fc.assert(
 *   fc.property(optionArb, (opt) => {
 *     // opt is randomly Some(number) or None
 *     if (opt._tag === 'Some') {
 *       expect(typeof opt.value).toBe('number')
 *     } else {
 *       expect(opt._tag).toBe('None')
 *     }
 *   })
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Generate mostly Some values (80%)
 * const optionArb = option(fc.integer(), { someWeight: 0.8 })
 * ```
 *
 * @param valueArb - Arbitrary for generating Some values
 * @param config - Configuration for weight distribution
 * @returns Arbitrary that generates Option<T>
 */
export function option<T>(
  valueArb: fc.Arbitrary<T>,
  config: OptionArbitraryConfig = {}
): fc.Arbitrary<Option<T>> {
  const { someWeight = 0.5 } = config

  // Use fc.integer() to decide between Some and None based on weight
  return fc
    .tuple(fc.integer({ min: 0, max: 99 }), valueArb)
    .map(([random, value]): Option<T> => {
      return random < someWeight * 100 ? { _tag: 'Some', value } : { _tag: 'None' }
    })
}

/**
 * Generate only Some values.
 *
 * Useful when you want to test behavior with guaranteed present values.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { someValue } from 'receta-test/arbitraries'
 *
 * const someArb = someValue(fc.integer())
 *
 * fc.assert(
 *   fc.property(someArb, (opt) => {
 *     expect(opt._tag).toBe('Some')
 *     expect(typeof opt.value).toBe('number')
 *   })
 * )
 * ```
 *
 * @param valueArb - Arbitrary for generating Some values
 * @returns Arbitrary that always generates Some values
 */
export function someValue<T>(valueArb: fc.Arbitrary<T>): fc.Arbitrary<Option<T>> {
  return valueArb.map((value): Option<T> => ({ _tag: 'Some', value }))
}

/**
 * Generate only None values.
 *
 * Useful when you want to test behavior with guaranteed absence.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { noneValue } from 'receta-test/arbitraries'
 *
 * const noneArb = noneValue<number>()
 *
 * fc.assert(
 *   fc.property(noneArb, (opt) => {
 *     expect(opt._tag).toBe('None')
 *   })
 * )
 * ```
 *
 * @returns Arbitrary that always generates None
 */
export function noneValue<T = never>(): fc.Arbitrary<Option<T>> {
  return fc.constant({ _tag: 'None' } as Option<T>)
}

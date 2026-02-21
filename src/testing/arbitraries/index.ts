/**
 * Fast-check arbitraries for property-based testing.
 *
 * Provides random value generators for Receta types (Result, Option).
 * Use with fast-check's fc.assert() for testing with hundreds of random cases.
 *
 * @example
 * ```typescript
 * import * as fc from 'fast-check'
 * import { result, option } from 'receta-test/arbitraries'
 *
 * fc.assert(
 *   fc.property(result(fc.integer(), fc.string()), (r) => {
 *     // Test with randomly generated Result<number, string>
 *   })
 * )
 * ```
 */

export { result, okResult, errResult } from './result'
export { option, someValue, noneValue } from './option'
export type { ResultArbitraryConfig, OptionArbitraryConfig } from './types'

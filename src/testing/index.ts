/**
 * receta-test - Test utilities for Receta
 *
 * Provides ontologically-sound matchers, law testing, and property-based testing
 * utilities for functional programming with Receta.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { recetaMatchers, testFunctorLaws, testMonadLaws } from 'receta-test'
 * import { ok } from 'receta/result'
 * import * as Result from 'receta/result'
 *
 * // Extend Vitest with Receta matchers
 * expect.extend(recetaMatchers)
 *
 * // Use matchers in tests
 * test('Result matchers', () => {
 *   expect(ok(5)).toBeOk(5)
 * })
 *
 * // Test functor laws
 * testFunctorLaws({
 *   type: 'Result',
 *   of: ok,
 *   map: Result.map
 * })
 *
 * // Test monad laws
 * testMonadLaws({
 *   type: 'Result',
 *   of: ok,
 *   flatMap: Result.flatMap
 * })
 * ```
 */

// Re-export everything from matchers
export * from './matchers'

// Re-export everything from laws
export * from './laws'

// Re-export everything from arbitraries
export * from './arbitraries'

// Re-export types
export type { ResultMatchers, OptionMatchers, RecetaMatchers } from './types'

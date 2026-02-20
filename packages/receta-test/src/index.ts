/**
 * receta-test - Test utilities for Receta
 *
 * Provides ontologically-sound matchers, law testing, and property-based testing
 * utilities for functional programming with Receta.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { recetaMatchers } from 'receta-test'
 *
 * // Extend Vitest with Receta matchers
 * expect.extend(recetaMatchers)
 *
 * // Use in tests
 * import { ok, err } from 'receta/result'
 *
 * test('Result matchers', () => {
 *   expect(ok(5)).toBeOk(5)
 *   expect(err('fail')).toBeErr('fail')
 * })
 * ```
 */

// Re-export everything from matchers
export * from './matchers'

// Re-export types
export type { ResultMatchers, OptionMatchers, RecetaMatchers } from './types'

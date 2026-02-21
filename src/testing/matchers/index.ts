/**
 * Vitest matchers for Receta types.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { resultMatchers, optionMatchers } from 'receta-test/matchers'
 *
 * // Extend expect with all matchers
 * expect.extend(resultMatchers)
 * expect.extend(optionMatchers)
 *
 * // Or extend with all at once
 * import { recetaMatchers } from 'receta-test/matchers'
 * expect.extend(recetaMatchers)
 * ```
 */

export { resultMatchers, toBeOk, toBeErr, toEqualResult } from './result'
export { optionMatchers, toBeSome, toBeNone, toEqualOption } from './option'

import { resultMatchers } from './result'
import { optionMatchers } from './option'

/**
 * All Receta matchers combined for easy extension.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { recetaMatchers } from 'receta-test/matchers'
 *
 * expect.extend(recetaMatchers)
 * ```
 */
export const recetaMatchers = {
  ...resultMatchers,
  ...optionMatchers,
}

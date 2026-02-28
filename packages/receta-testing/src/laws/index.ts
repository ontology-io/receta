/**
 * Law testing utilities for functional types.
 *
 * @example
 * ```typescript
 * import { testFunctorLaws, testMonadLaws } from 'receta-test/laws'
 * import { ok, err } from 'receta/result'
 * import * as Result from 'receta/result'
 *
 * describe('Result', () => {
 *   testFunctorLaws({
 *     type: 'Result',
 *     of: ok,
 *     map: Result.map
 *   })
 *
 *   testMonadLaws({
 *     type: 'Result',
 *     of: ok,
 *     flatMap: Result.flatMap
 *   })
 * })
 * ```
 */

export { testFunctorLaws } from './functor'
export { testMonadLaws } from './monad'
export type { FunctorLawConfig, FunctorTestCase, MonadLawConfig, MonadTestCase } from './types'

/**
 * Type definitions for law testing utilities.
 */

/**
 * Configuration for testing functor laws.
 *
 * @example
 * ```typescript
 * testFunctorLaws({
 *   type: 'Result',
 *   of: ok,
 *   map: Result.map,
 *   testCases: [
 *     { value: 5, transforms: [x => x * 2, x => x + 1] }
 *   ]
 * })
 * ```
 */
export interface FunctorLawConfig<F, A> {
  /**
   * Name of the type being tested (for test descriptions).
   */
  type: string

  /**
   * Constructor function to wrap values in the functor.
   *
   * @example ok, some, Just
   */
  of: (value: A) => F

  /**
   * Map function to test.
   *
   * @example Result.map, Option.map
   */
  map: <B>(fa: F, fn: (a: A) => B) => F

  /**
   * Custom equality function for comparing functor values.
   * Defaults to deep equality check.
   */
  equals?: (a: F, b: F) => boolean

  /**
   * Specific test cases to run.
   * If not provided, uses default test cases.
   */
  testCases?: Array<FunctorTestCase<A>>
}

/**
 * Test case for functor law testing.
 */
export interface FunctorTestCase<A> {
  /**
   * Base value to test with.
   */
  value: A

  /**
   * Transformation functions to test composition law.
   * Defaults to [x => x, x => x] if not provided.
   */
  transforms?: Array<(a: A) => any>
}

/**
 * Configuration for testing monad laws.
 *
 * @example
 * ```typescript
 * testMonadLaws({
 *   type: 'Result',
 *   of: ok,
 *   flatMap: Result.flatMap,
 *   testCases: [
 *     {
 *       value: 5,
 *       functions: [
 *         (x: number) => ok(x * 2),
 *         (x: number) => x > 0 ? ok(x) : err('negative')
 *       ]
 *     }
 *   ]
 * })
 * ```
 */
export interface MonadLawConfig<M, A> {
  /**
   * Name of the type being tested (for test descriptions).
   */
  type: string

  /**
   * Constructor function to wrap values in the monad.
   *
   * @example ok, some, Just
   */
  of: (value: A) => M

  /**
   * FlatMap (bind, chain) function to test.
   *
   * @example Result.flatMap, Option.flatMap
   */
  flatMap: <B>(ma: M, fn: (a: A) => M) => M

  /**
   * Custom equality function for comparing monad values.
   * Defaults to deep equality check.
   */
  equals?: (a: M, b: M) => boolean

  /**
   * Specific test cases to run.
   * If not provided, uses default test cases.
   */
  testCases?: Array<MonadTestCase<M, A>>
}

/**
 * Test case for monad law testing.
 */
export interface MonadTestCase<M, A> {
  /**
   * Base value to test with.
   */
  value: A

  /**
   * Monadic functions for testing left identity and associativity.
   * Defaults to [of] if not provided.
   */
  functions?: Array<(a: A) => M>
}

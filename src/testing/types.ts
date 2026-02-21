/**
 * Shared type definitions for receta-test utilities.
 */

/**
 * Extended Vitest matcher interface for Result types.
 */
export interface ResultMatchers<R = unknown> {
  /**
   * Assert that a Result is Ok, optionally checking the value.
   *
   * @example
   * ```typescript
   * expect(ok(5)).toBeOk()
   * expect(ok(5)).toBeOk(5)
   * expect(err('fail')).not.toBeOk()
   * ```
   */
  toBeOk<T>(expectedValue?: T): R

  /**
   * Assert that a Result is Err, optionally checking the error.
   *
   * @example
   * ```typescript
   * expect(err('fail')).toBeErr()
   * expect(err('fail')).toBeErr('fail')
   * expect(ok(5)).not.toBeErr()
   * ```
   */
  toBeErr<E>(expectedError?: E): R

  /**
   * Deep equality check for Result types.
   *
   * @example
   * ```typescript
   * expect(ok(5)).toEqualResult(ok(5))
   * expect(err('fail')).toEqualResult(err('fail'))
   * ```
   */
  toEqualResult<T, E>(expected: unknown): R
}

/**
 * Extended Vitest matcher interface for Option types.
 */
export interface OptionMatchers<R = unknown> {
  /**
   * Assert that an Option is Some, optionally checking the value.
   *
   * @example
   * ```typescript
   * expect(some(5)).toBeSome()
   * expect(some(5)).toBeSome(5)
   * expect(none()).not.toBeSome()
   * ```
   */
  toBeSome<T>(expectedValue?: T): R

  /**
   * Assert that an Option is None.
   *
   * @example
   * ```typescript
   * expect(none()).toBeNone()
   * expect(some(5)).not.toBeNone()
   * ```
   */
  toBeNone(): R

  /**
   * Deep equality check for Option types.
   *
   * @example
   * ```typescript
   * expect(some(5)).toEqualOption(some(5))
   * expect(none()).toEqualOption(none())
   * ```
   */
  toEqualOption<T>(expected: unknown): R
}

/**
 * Combined matcher interface for all Receta types.
 */
export interface RecetaMatchers<R = unknown> extends ResultMatchers<R>, OptionMatchers<R> {}

// Augment Vitest's matcher types
declare module 'vitest' {
  interface Assertion<T = any> extends RecetaMatchers {}
  interface AsymmetricMatchersContaining extends RecetaMatchers {}
}

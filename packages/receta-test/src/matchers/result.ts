/**
 * Vitest matchers for Result types.
 *
 * These matchers provide better error messages and type-safe assertions
 * for Result<T, E> values compared to generic equality checks.
 */

import { expect } from 'vitest'

type MatcherContext = {
  isNot: boolean
  equals: (a: unknown, b: unknown) => boolean
}

type MatcherFunction = (
  this: MatcherContext,
  received: unknown,
  ...expected: unknown[]
) => { pass: boolean; message: () => string }

/**
 * Check if a value has the shape of a Result type.
 */
function isResultLike(value: unknown): value is { _tag: 'Ok' | 'Err' } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_tag' in value &&
    (value._tag === 'Ok' || value._tag === 'Err')
  )
}

/**
 * Assert that a Result is Ok, optionally checking the value.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { ok, err } from 'receta/result'
 *
 * expect(ok(5)).toBeOk()           // Pass
 * expect(ok(5)).toBeOk(5)          // Pass
 * expect(ok(5)).toBeOk(10)         // Fail
 * expect(err('fail')).not.toBeOk() // Pass
 * ```
 */
export const toBeOk: MatcherFunction = function (received: unknown, expectedValue?: unknown) {
  const { isNot } = this

  if (!isResultLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be a Result, but got ${typeof received}`,
    }
  }

  const isOk = received._tag === 'Ok'

  // If no expected value provided, just check the tag
  if (arguments.length === 1) {
    return {
      pass: isOk,
      message: () =>
        isNot
          ? `Expected Result not to be Ok, but got Ok`
          : `Expected Result to be Ok, but got Err${
              'error' in received ? ` with error: ${JSON.stringify(received.error)}` : ''
            }`,
    }
  }

  // Check both tag and value
  if (!isOk) {
    return {
      pass: false,
      message: () =>
        `Expected Result to be Ok with value ${JSON.stringify(expectedValue)}, but got Err${
          'error' in received ? ` with error: ${JSON.stringify(received.error)}` : ''
        }`,
    }
  }

  const actualValue = 'value' in received ? received.value : undefined
  const valuesMatch = this.equals(actualValue, expectedValue)

  return {
    pass: valuesMatch,
    message: () =>
      isNot
        ? `Expected Ok value not to equal ${JSON.stringify(expectedValue)}`
        : `Expected Ok value to equal ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(
            actualValue
          )}`,
  }
}

/**
 * Assert that a Result is Err, optionally checking the error.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { ok, err } from 'receta/result'
 *
 * expect(err('fail')).toBeErr()          // Pass
 * expect(err('fail')).toBeErr('fail')    // Pass
 * expect(err('fail')).toBeErr('other')   // Fail
 * expect(ok(5)).not.toBeErr()            // Pass
 * ```
 */
export const toBeErr: MatcherFunction = function (received: unknown, expectedError?: unknown) {
  const { isNot } = this

  if (!isResultLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be a Result, but got ${typeof received}`,
    }
  }

  const isErr = received._tag === 'Err'

  // If no expected error provided, just check the tag
  if (arguments.length === 1) {
    return {
      pass: isErr,
      message: () =>
        isNot
          ? `Expected Result not to be Err, but got Err`
          : `Expected Result to be Err, but got Ok${
              'value' in received ? ` with value: ${JSON.stringify(received.value)}` : ''
            }`,
    }
  }

  // Check both tag and error
  if (!isErr) {
    return {
      pass: false,
      message: () =>
        `Expected Result to be Err with error ${JSON.stringify(expectedError)}, but got Ok${
          'value' in received ? ` with value: ${JSON.stringify(received.value)}` : ''
        }`,
    }
  }

  const actualError = 'error' in received ? received.error : undefined
  const errorsMatch = this.equals(actualError, expectedError)

  return {
    pass: errorsMatch,
    message: () =>
      isNot
        ? `Expected Err error not to equal ${JSON.stringify(expectedError)}`
        : `Expected Err error to equal ${JSON.stringify(expectedError)}, but got ${JSON.stringify(
            actualError
          )}`,
  }
}

/**
 * Deep equality check for Result types.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { ok, err } from 'receta/result'
 *
 * expect(ok(5)).toEqualResult(ok(5))           // Pass
 * expect(err('fail')).toEqualResult(err('fail')) // Pass
 * expect(ok(5)).toEqualResult(ok(10))          // Fail
 * expect(ok(5)).toEqualResult(err('fail'))     // Fail
 * ```
 */
export const toEqualResult: MatcherFunction = function (received: unknown, expected: unknown) {
  const { isNot } = this

  if (!isResultLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be a Result, but got ${typeof received}`,
    }
  }

  if (!isResultLike(expected)) {
    return {
      pass: false,
      message: () => `Expected comparison value to be a Result, but got ${typeof expected}`,
    }
  }

  // Check if tags match
  if (received._tag !== expected._tag) {
    return {
      pass: false,
      message: () =>
        `Expected Result tags to match, but got ${received._tag} and ${expected._tag}`,
    }
  }

  // Check value/error equality
  const actualContent = received._tag === 'Ok' && 'value' in received ? received.value : 'error' in received ? received.error : undefined
  const expectedContent = expected._tag === 'Ok' && 'value' in expected ? expected.value : 'error' in expected ? expected.error : undefined

  const contentsMatch = this.equals(actualContent, expectedContent)

  return {
    pass: contentsMatch,
    message: () =>
      isNot
        ? `Expected Results not to be equal`
        : `Expected Results to be equal, but ${received._tag} contents differ:\nReceived: ${JSON.stringify(
            actualContent
          )}\nExpected: ${JSON.stringify(expectedContent)}`,
  }
}

/**
 * All Result matchers as a single object for easy extension.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { resultMatchers } from 'receta-test/matchers'
 *
 * expect.extend(resultMatchers)
 * ```
 */
export const resultMatchers = {
  toBeOk,
  toBeErr,
  toEqualResult,
}

/**
 * Vitest matchers for Option types.
 *
 * These matchers provide better error messages and type-safe assertions
 * for Option<T> values compared to generic equality checks.
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
 * Check if a value has the shape of an Option type.
 */
function isOptionLike(value: unknown): value is { _tag: 'Some' | 'None' } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_tag' in value &&
    (value._tag === 'Some' || value._tag === 'None')
  )
}

/**
 * Assert that an Option is Some, optionally checking the value.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { some, none } from 'receta/option'
 *
 * expect(some(5)).toBeSome()           // Pass
 * expect(some(5)).toBeSome(5)          // Pass
 * expect(some(5)).toBeSome(10)         // Fail
 * expect(none()).not.toBeSome()        // Pass
 * ```
 */
export const toBeSome: MatcherFunction = function (received: unknown, expectedValue?: unknown) {
  const { isNot } = this

  if (!isOptionLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be an Option, but got ${typeof received}`,
    }
  }

  const isSome = received._tag === 'Some'

  // If no expected value provided, just check the tag
  if (arguments.length === 1) {
    return {
      pass: isSome,
      message: () =>
        isNot
          ? `Expected Option not to be Some, but got Some${
              'value' in received ? ` with value: ${JSON.stringify(received.value)}` : ''
            }`
          : `Expected Option to be Some, but got None`,
    }
  }

  // Check both tag and value
  if (!isSome) {
    return {
      pass: false,
      message: () =>
        `Expected Option to be Some with value ${JSON.stringify(expectedValue)}, but got None`,
    }
  }

  const actualValue = 'value' in received ? received.value : undefined
  const valuesMatch = this.equals(actualValue, expectedValue)

  return {
    pass: valuesMatch,
    message: () =>
      isNot
        ? `Expected Some value not to equal ${JSON.stringify(expectedValue)}`
        : `Expected Some value to equal ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(
            actualValue
          )}`,
  }
}

/**
 * Assert that an Option is None.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { some, none } from 'receta/option'
 *
 * expect(none()).toBeNone()          // Pass
 * expect(some(5)).not.toBeNone()     // Pass
 * ```
 */
export const toBeNone: MatcherFunction = function (received: unknown) {
  const { isNot } = this

  if (!isOptionLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be an Option, but got ${typeof received}`,
    }
  }

  const isNone = received._tag === 'None'

  return {
    pass: isNone,
    message: () =>
      isNot
        ? `Expected Option not to be None, but got None`
        : `Expected Option to be None, but got Some${
            'value' in received ? ` with value: ${JSON.stringify(received.value)}` : ''
          }`,
  }
}

/**
 * Deep equality check for Option types.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { some, none } from 'receta/option'
 *
 * expect(some(5)).toEqualOption(some(5))   // Pass
 * expect(none()).toEqualOption(none())     // Pass
 * expect(some(5)).toEqualOption(some(10))  // Fail
 * expect(some(5)).toEqualOption(none())    // Fail
 * ```
 */
export const toEqualOption: MatcherFunction = function (received: unknown, expected: unknown) {
  const { isNot } = this

  if (!isOptionLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be an Option, but got ${typeof received}`,
    }
  }

  if (!isOptionLike(expected)) {
    return {
      pass: false,
      message: () => `Expected comparison value to be an Option, but got ${typeof expected}`,
    }
  }

  // Check if tags match
  if (received._tag !== expected._tag) {
    return {
      pass: false,
      message: () =>
        `Expected Option tags to match, but got ${received._tag} and ${expected._tag}`,
    }
  }

  // If both are None, they're equal
  if (received._tag === 'None' && expected._tag === 'None') {
    return {
      pass: true,
      message: () => (isNot ? `Expected Options not to be equal (both None)` : ''),
    }
  }

  // Check value equality for Some
  const actualValue = 'value' in received ? received.value : undefined
  const expectedValue = 'value' in expected ? expected.value : undefined

  const valuesMatch = this.equals(actualValue, expectedValue)

  return {
    pass: valuesMatch,
    message: () =>
      isNot
        ? `Expected Options not to be equal`
        : `Expected Options to be equal, but Some values differ:\nReceived: ${JSON.stringify(
            actualValue
          )}\nExpected: ${JSON.stringify(expectedValue)}`,
  }
}

/**
 * All Option matchers as a single object for easy extension.
 *
 * @example
 * ```typescript
 * import { expect } from 'vitest'
 * import { optionMatchers } from 'receta-test/matchers'
 *
 * expect.extend(optionMatchers)
 * ```
 */
export const optionMatchers = {
  toBeSome,
  toBeNone,
  toEqualOption,
}

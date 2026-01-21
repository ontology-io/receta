/**
 * Built-in validators for common use cases.
 *
 * @module validation/validators
 */

import type { Validator } from './types'
import { valid, invalid, fromPredicate } from './constructors'

// ============================================================================
// String Validators
// ============================================================================

/**
 * Validates that a string is not empty.
 *
 * @param errorMessage - Custom error message
 * @returns Validator that checks for non-empty strings
 *
 * @example
 * ```typescript
 * required('Name is required')('John') // => Valid('John')
 * required('Name is required')('') // => Invalid(['Name is required'])
 * required('Name is required')('  ') // => Invalid(['Name is required']) (whitespace only)
 * ```
 */
export const required = (errorMessage: string): Validator<string, string, string> =>
  fromPredicate((s) => s.trim().length > 0, errorMessage)

/**
 * Validates minimum string length.
 *
 * @param min - Minimum length
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks minimum length
 *
 * @example
 * ```typescript
 * minLength(3)('John') // => Valid('John')
 * minLength(3)('Jo') // => Invalid(['Must be at least 3 characters'])
 * minLength(3, 'Too short')('Jo') // => Invalid(['Too short'])
 * ```
 */
export const minLength = (
  min: number,
  errorMessage?: string
): Validator<string, string, string> =>
  fromPredicate((s) => s.length >= min, errorMessage ?? `Must be at least ${min} characters`)

/**
 * Validates maximum string length.
 *
 * @param max - Maximum length
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks maximum length
 *
 * @example
 * ```typescript
 * maxLength(10)('John') // => Valid('John')
 * maxLength(10)('Very long name') // => Invalid(['Must be at most 10 characters'])
 * ```
 */
export const maxLength = (
  max: number,
  errorMessage?: string
): Validator<string, string, string> =>
  fromPredicate((s) => s.length <= max, errorMessage ?? `Must be at most ${max} characters`)

/**
 * Validates string length within a range.
 *
 * @param min - Minimum length
 * @param max - Maximum length
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks length range
 *
 * @example
 * ```typescript
 * lengthBetween(3, 10)('John') // => Valid('John')
 * lengthBetween(3, 10)('Jo') // => Invalid(['Must be between 3 and 10 characters'])
 * lengthBetween(3, 10)('Very long name') // => Invalid(['Must be between 3 and 10 characters'])
 * ```
 */
export const lengthBetween = (
  min: number,
  max: number,
  errorMessage?: string
): Validator<string, string, string> =>
  fromPredicate(
    (s) => s.length >= min && s.length <= max,
    errorMessage ?? `Must be between ${min} and ${max} characters`
  )

/**
 * Validates string matches a regex pattern.
 *
 * @param pattern - Regex pattern to match
 * @param errorMessage - Custom error message
 * @returns Validator that checks regex match
 *
 * @example
 * ```typescript
 * matches(/^[A-Z]/, 'Must start with uppercase')('John') // => Valid('John')
 * matches(/^[A-Z]/, 'Must start with uppercase')('john') // => Invalid(['Must start with uppercase'])
 *
 * // Username validation
 * matches(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores')
 * ```
 */
export const matches = (
  pattern: RegExp,
  errorMessage: string
): Validator<string, string, string> => fromPredicate((s) => pattern.test(s), errorMessage)

/**
 * Validates email address format.
 *
 * Uses a simple but effective regex pattern for email validation.
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks email format
 *
 * @example
 * ```typescript
 * email()('john@example.com') // => Valid('john@example.com')
 * email()('invalid-email') // => Invalid(['Invalid email address'])
 * email('Bad email')('invalid') // => Invalid(['Bad email'])
 * ```
 */
export const email = (errorMessage?: string): Validator<string, string, string> =>
  fromPredicate(
    (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
    errorMessage ?? 'Invalid email address'
  )

/**
 * Validates URL format.
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks URL format
 *
 * @example
 * ```typescript
 * url()('https://example.com') // => Valid('https://example.com')
 * url()('not-a-url') // => Invalid(['Invalid URL'])
 * ```
 */
export const url = (errorMessage?: string): Validator<string, string, string> =>
  fromPredicate(
    (s) => {
      try {
        new URL(s)
        return true
      } catch {
        return false
      }
    },
    errorMessage ?? 'Invalid URL'
  )

/**
 * Validates string contains only alphanumeric characters.
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks alphanumeric characters
 *
 * @example
 * ```typescript
 * alphanumeric()('John123') // => Valid('John123')
 * alphanumeric()('John@123') // => Invalid(['Must contain only letters and numbers'])
 * ```
 */
export const alphanumeric = (errorMessage?: string): Validator<string, string, string> =>
  fromPredicate(
    (s) => /^[a-zA-Z0-9]+$/.test(s),
    errorMessage ?? 'Must contain only letters and numbers'
  )

// ============================================================================
// Number Validators
// ============================================================================

/**
 * Validates number is greater than or equal to minimum.
 *
 * @param minimum - Minimum value (inclusive)
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks minimum value
 *
 * @example
 * ```typescript
 * min(0)(5) // => Valid(5)
 * min(0)(-1) // => Invalid(['Must be at least 0'])
 * min(18, 'Must be adult')(17) // => Invalid(['Must be adult'])
 * ```
 */
export const min = (minimum: number, errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => n >= minimum, errorMessage ?? `Must be at least ${minimum}`)

/**
 * Validates number is less than or equal to maximum.
 *
 * @param maximum - Maximum value (inclusive)
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks maximum value
 *
 * @example
 * ```typescript
 * max(100)(50) // => Valid(50)
 * max(100)(150) // => Invalid(['Must be at most 100'])
 * ```
 */
export const max = (maximum: number, errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => n <= maximum, errorMessage ?? `Must be at most ${maximum}`)

/**
 * Validates number is within a range.
 *
 * @param minimum - Minimum value (inclusive)
 * @param maximum - Maximum value (inclusive)
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks range
 *
 * @example
 * ```typescript
 * between(0, 100)(50) // => Valid(50)
 * between(0, 100)(-1) // => Invalid(['Must be between 0 and 100'])
 * between(0, 100)(150) // => Invalid(['Must be between 0 and 100'])
 * ```
 */
export const between = (
  minimum: number,
  maximum: number,
  errorMessage?: string
): Validator<number, number, string> =>
  fromPredicate(
    (n) => n >= minimum && n <= maximum,
    errorMessage ?? `Must be between ${minimum} and ${maximum}`
  )

/**
 * Validates number is positive (> 0).
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks positive value
 *
 * @example
 * ```typescript
 * positive()(5) // => Valid(5)
 * positive()(0) // => Invalid(['Must be positive'])
 * positive()(-1) // => Invalid(['Must be positive'])
 * ```
 */
export const positive = (errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => n > 0, errorMessage ?? 'Must be positive')

/**
 * Validates number is negative (< 0).
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks negative value
 *
 * @example
 * ```typescript
 * negative()(-5) // => Valid(-5)
 * negative()(0) // => Invalid(['Must be negative'])
 * negative()(1) // => Invalid(['Must be negative'])
 * ```
 */
export const negative = (errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => n < 0, errorMessage ?? 'Must be negative')

/**
 * Validates number is an integer.
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks integer value
 *
 * @example
 * ```typescript
 * integer()(42) // => Valid(42)
 * integer()(42.5) // => Invalid(['Must be an integer'])
 * ```
 */
export const integer = (errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => Number.isInteger(n), errorMessage ?? 'Must be an integer')

/**
 * Validates number is not NaN.
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks for valid number
 *
 * @example
 * ```typescript
 * notNaN()(42) // => Valid(42)
 * notNaN()(NaN) // => Invalid(['Must be a valid number'])
 * ```
 */
export const notNaN = (errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => !Number.isNaN(n), errorMessage ?? 'Must be a valid number')

/**
 * Validates number is finite (not Infinity or -Infinity).
 *
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks for finite number
 *
 * @example
 * ```typescript
 * finite()(42) // => Valid(42)
 * finite()(Infinity) // => Invalid(['Must be a finite number'])
 * finite()(-Infinity) // => Invalid(['Must be a finite number'])
 * ```
 */
export const finite = (errorMessage?: string): Validator<number, number, string> =>
  fromPredicate((n) => Number.isFinite(n), errorMessage ?? 'Must be a finite number')

// ============================================================================
// Array Validators
// ============================================================================

/**
 * Validates array is not empty.
 *
 * @param errorMessage - Custom error message
 * @returns Validator that checks non-empty array
 *
 * @example
 * ```typescript
 * nonEmpty('List cannot be empty')([1, 2, 3]) // => Valid([1, 2, 3])
 * nonEmpty('List cannot be empty')([]) // => Invalid(['List cannot be empty'])
 * ```
 */
export const nonEmpty = <T>(errorMessage: string): Validator<T[], T[], string> =>
  fromPredicate((arr) => arr.length > 0, errorMessage)

/**
 * Validates array has minimum length.
 *
 * @param minCount - Minimum number of elements
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks minimum array length
 *
 * @example
 * ```typescript
 * minItems(2)([1, 2, 3]) // => Valid([1, 2, 3])
 * minItems(2)([1]) // => Invalid(['Must have at least 2 items'])
 * ```
 */
export const minItems = <T>(
  minCount: number,
  errorMessage?: string
): Validator<T[], T[], string> =>
  fromPredicate((arr) => arr.length >= minCount, errorMessage ?? `Must have at least ${minCount} items`)

/**
 * Validates array has maximum length.
 *
 * @param maxCount - Maximum number of elements
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks maximum array length
 *
 * @example
 * ```typescript
 * maxItems(5)([1, 2, 3]) // => Valid([1, 2, 3])
 * maxItems(2)([1, 2, 3]) // => Invalid(['Must have at most 2 items'])
 * ```
 */
export const maxItems = <T>(
  maxCount: number,
  errorMessage?: string
): Validator<T[], T[], string> =>
  fromPredicate((arr) => arr.length <= maxCount, errorMessage ?? `Must have at most ${maxCount} items`)

// ============================================================================
// Generic Validators
// ============================================================================

/**
 * Validates value is one of the allowed values.
 *
 * @param allowed - Array of allowed values
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks value is in allowed list
 *
 * @example
 * ```typescript
 * oneOf(['admin', 'user', 'guest'])('admin') // => Valid('admin')
 * oneOf(['admin', 'user', 'guest'])('superadmin') // => Invalid(['Must be one of: admin, user, guest'])
 *
 * // With custom error
 * oneOf([1, 2, 3], 'Invalid option')(2) // => Valid(2)
 * oneOf([1, 2, 3], 'Invalid option')(4) // => Invalid(['Invalid option'])
 * ```
 */
export const oneOf = <T>(
  allowed: readonly T[],
  errorMessage?: string
): Validator<T, T, string> =>
  fromPredicate(
    (value) => allowed.includes(value),
    errorMessage ?? `Must be one of: ${allowed.join(', ')}`
  )

/**
 * Validates value equals expected value.
 *
 * @param expected - Expected value
 * @param errorMessage - Custom error message (optional)
 * @returns Validator that checks equality
 *
 * @example
 * ```typescript
 * equals('yes')('yes') // => Valid('yes')
 * equals('yes')('no') // => Invalid(['Must equal: yes'])
 *
 * // Useful for checkbox confirmations
 * equals(true, 'You must agree')
 * ```
 */
export const equals = <T>(expected: T, errorMessage?: string): Validator<T, T, string> =>
  fromPredicate((value) => value === expected, errorMessage ?? `Must equal: ${expected}`)

/**
 * Validates value is not null or undefined.
 *
 * @param errorMessage - Custom error message
 * @returns Validator that checks for defined value
 *
 * @example
 * ```typescript
 * defined('Value required')(42) // => Valid(42)
 * defined('Value required')(null) // => Invalid(['Value required'])
 * defined('Value required')(undefined) // => Invalid(['Value required'])
 * ```
 */
export const defined = <T>(errorMessage: string): Validator<T | null | undefined, T, string> => (
  value
) => (value !== null && value !== undefined ? valid(value) : invalid(errorMessage))

/**
 * Comparison predicates for numbers and strings.
 *
 * @module predicate/comparison
 */

import type { Predicate } from './types'

/**
 * Creates a predicate that tests if a value is greater than a threshold.
 *
 * @param threshold - The minimum value (exclusive)
 * @returns A predicate that returns true if value > threshold
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, gt(10)) // => [15, 20]
 *
 * // With pipe
 * R.pipe(
 *   numbers,
 *   R.filter(gt(10))
 * ) // => [15, 20]
 * ```
 *
 * @see gte - for inclusive comparison (>=)
 * @see lt - for less than comparison
 * @see between - for range comparison
 */
export const gt = <T extends number | bigint>(threshold: T): Predicate<T> => (value) =>
  value > threshold

/**
 * Creates a predicate that tests if a value is greater than or equal to a threshold.
 *
 * @param threshold - The minimum value (inclusive)
 * @returns A predicate that returns true if value >= threshold
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, gte(10)) // => [10, 15, 20]
 * ```
 *
 * @see gt - for exclusive comparison (>)
 * @see lte - for less than or equal comparison
 */
export const gte = <T extends number | bigint>(threshold: T): Predicate<T> => (value) =>
  value >= threshold

/**
 * Creates a predicate that tests if a value is less than a threshold.
 *
 * @param threshold - The maximum value (exclusive)
 * @returns A predicate that returns true if value < threshold
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, lt(10)) // => [1, 5]
 *
 * // Useful for filtering by age, price, etc.
 * const products = [
 *   { name: 'A', price: 5 },
 *   { name: 'B', price: 15 },
 *   { name: 'C', price: 25 }
 * ]
 * R.filter(products, (p) => lt(20)(p.price)) // => products A and B
 * ```
 *
 * @see lte - for inclusive comparison (<=)
 * @see gt - for greater than comparison
 * @see between - for range comparison
 */
export const lt = <T extends number | bigint>(threshold: T): Predicate<T> => (value) =>
  value < threshold

/**
 * Creates a predicate that tests if a value is less than or equal to a threshold.
 *
 * @param threshold - The maximum value (inclusive)
 * @returns A predicate that returns true if value <= threshold
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, lte(10)) // => [1, 5, 10]
 * ```
 *
 * @see lt - for exclusive comparison (<)
 * @see gte - for greater than or equal comparison
 */
export const lte = <T extends number | bigint>(threshold: T): Predicate<T> => (value) =>
  value <= threshold

/**
 * Creates a predicate that tests if a value equals another value.
 *
 * Uses strict equality (===).
 *
 * @param expected - The value to compare against
 * @returns A predicate that returns true if value === expected
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 2, 3, 2, 1]
 * R.filter(numbers, eq(2)) // => [2, 2]
 *
 * const users = [
 *   { id: 1, status: 'active' },
 *   { id: 2, status: 'inactive' },
 *   { id: 3, status: 'active' }
 * ]
 * R.filter(users, (u) => eq('active')(u.status)) // => active users
 * ```
 *
 * @see neq - for inequality comparison
 */
export const eq = <T>(expected: T): Predicate<T> => (value) => value === expected

/**
 * Creates a predicate that tests if a value does not equal another value.
 *
 * Uses strict inequality (!==).
 *
 * @param expected - The value to compare against
 * @returns A predicate that returns true if value !== expected
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 2, 3, 2, 1]
 * R.filter(numbers, neq(2)) // => [1, 3, 1]
 * ```
 *
 * @see eq - for equality comparison
 */
export const neq = <T>(expected: T): Predicate<T> => (value) => value !== expected

/**
 * Creates a predicate that tests if a value is within a range (inclusive).
 *
 * @param min - The minimum value (inclusive)
 * @param max - The maximum value (inclusive)
 * @returns A predicate that returns true if min <= value <= max
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const numbers = [1, 5, 10, 15, 20, 25]
 * R.filter(numbers, between(10, 20)) // => [10, 15, 20]
 *
 * // Real-world: Filter products by price range
 * const products = [
 *   { name: 'Budget', price: 5 },
 *   { name: 'Standard', price: 15 },
 *   { name: 'Premium', price: 50 }
 * ]
 * R.filter(products, (p) => between(10, 30)(p.price))
 * // => [{ name: 'Standard', price: 15 }]
 * ```
 *
 * @see gt - for greater than comparison
 * @see lt - for less than comparison
 */
export const between = <T extends number | bigint>(min: T, max: T): Predicate<T> => (value) =>
  value >= min && value <= max

/**
 * Creates a predicate that tests if a string starts with a prefix.
 *
 * Case-sensitive.
 *
 * @param prefix - The prefix to test for
 * @returns A predicate that returns true if value starts with prefix
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const names = ['Alice', 'Bob', 'Alex', 'Barbara']
 * R.filter(names, startsWith('A')) // => ['Alice', 'Alex']
 *
 * // Real-world: Filter files by extension
 * const files = ['app.ts', 'test.spec.ts', 'config.json']
 * R.filter(files, (f) => !startsWith('test.')(f)) // => non-test files
 * ```
 *
 * @see endsWith - for suffix testing
 * @see includes - for substring testing
 */
export const startsWith = (prefix: string): Predicate<string> => (value) =>
  value.startsWith(prefix)

/**
 * Creates a predicate that tests if a string ends with a suffix.
 *
 * Case-sensitive.
 *
 * @param suffix - The suffix to test for
 * @returns A predicate that returns true if value ends with suffix
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const files = ['app.ts', 'app.js', 'config.json', 'test.spec.ts']
 * R.filter(files, endsWith('.ts')) // => ['app.ts', 'test.spec.ts']
 * ```
 *
 * @see startsWith - for prefix testing
 * @see includes - for substring testing
 */
export const endsWith = (suffix: string): Predicate<string> => (value) => value.endsWith(suffix)

/**
 * Creates a predicate that tests if a string contains a substring.
 *
 * Case-sensitive.
 *
 * @param substring - The substring to search for
 * @returns A predicate that returns true if value contains substring
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const emails = ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com']
 * R.filter(emails, includes('@gmail.com')) // => Gmail emails
 *
 * // Real-world: Search functionality
 * const users = [
 *   { name: 'Alice Smith' },
 *   { name: 'Bob Johnson' },
 *   { name: 'Alice Brown' }
 * ]
 * const searchTerm = 'Smith'
 * R.filter(users, (u) => includes(searchTerm)(u.name))
 * // => [{ name: 'Alice Smith' }]
 * ```
 *
 * @see startsWith - for prefix testing
 * @see endsWith - for suffix testing
 */
export const includes = (substring: string): Predicate<string> => (value) =>
  value.includes(substring)

/**
 * Creates a predicate that tests if a string matches a regular expression.
 *
 * @param pattern - The regular expression to test against
 * @returns A predicate that returns true if value matches pattern
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * const emails = ['alice@example.com', 'invalid-email', 'bob@test.org']
 * const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 * R.filter(emails, matches(emailPattern)) // => valid emails
 *
 * // Real-world: Validate input format
 * const phoneNumbers = ['+1-555-0100', '555-0100', 'not-a-phone']
 * R.filter(phoneNumbers, matches(/^\+?\d{1,3}-\d{3}-\d{4}$/))
 * // => ['+1-555-0100', '555-0100']
 * ```
 *
 * @see includes - for simple substring testing
 */
export const matches = (pattern: RegExp): Predicate<string> => (value) => pattern.test(value)

/**
 * Creates a predicate that tests if a value is empty.
 *
 * Works with strings, arrays, and objects.
 * - Strings: empty if length === 0
 * - Arrays: empty if length === 0
 * - Objects: empty if has no own properties
 *
 * @returns A predicate that returns true if value is empty
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * R.filter(['', 'hello', '', 'world'], isEmpty) // => ['', '']
 * R.filter([[], [1, 2], []], isEmpty) // => [[], []]
 * R.filter([{}, { a: 1 }, {}], isEmpty) // => [{}, {}]
 *
 * // Real-world: Remove empty form fields
 * const formData = { name: 'Alice', email: '', bio: 'Developer' }
 * R.pipe(
 *   R.entries(formData),
 *   R.filter(([_, value]) => !isEmpty(value)),
 *   R.fromEntries
 * ) // => { name: 'Alice', bio: 'Developer' }
 * ```
 *
 * @see isNotEmpty - for the inverse
 */
export const isEmpty: Predicate<string | readonly unknown[] | Record<string, unknown>> = (
  value
) => {
  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length === 0
  }
  return Object.keys(value).length === 0
}

/**
 * Creates a predicate that tests if a value is not empty.
 *
 * The inverse of `isEmpty`.
 *
 * @returns A predicate that returns true if value is not empty
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 *
 * R.filter(['', 'hello', '', 'world'], isNotEmpty) // => ['hello', 'world']
 * ```
 *
 * @see isEmpty - for the inverse
 */
export const isNotEmpty: Predicate<string | readonly unknown[] | Record<string, unknown>> = (
  value
) => !isEmpty(value)

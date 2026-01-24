/**
 * Constructors for creating Validation instances.
 *
 * @module validation/constructors
 */

import type { Validation, Valid, Invalid, Validator } from '../types'
import type { Result } from '../../result/types'
import type { Predicate } from '../../predicate/types'
import { isOk } from '../../result/guards'

/**
 * Creates a Valid validation containing a value.
 *
 * @param value - The value to wrap
 * @returns A Valid validation containing the value
 *
 * @example
 * ```typescript
 * const result = valid(42)
 * // => { _tag: 'Valid', value: 42 }
 *
 * const user = valid({ name: 'John', email: 'john@example.com' })
 * // => { _tag: 'Valid', value: { name: 'John', email: 'john@example.com' } }
 * ```
 */
export function valid<T>(value: T): Valid<T> {
  return { _tag: 'Valid', value }
}

/**
 * Creates an Invalid validation containing one or more errors.
 *
 * Accepts either a single error or an array of errors for convenience.
 * All errors are stored as an array internally for accumulation.
 *
 * @param errors - The error(s) to wrap
 * @returns An Invalid validation containing the errors
 *
 * @example
 * ```typescript
 * // Single error
 * invalid('Name is required')
 * // => { _tag: 'Invalid', errors: ['Name is required'] }
 *
 * // Multiple errors
 * invalid(['Name is required', 'Email is invalid'])
 * // => { _tag: 'Invalid', errors: ['Name is required', 'Email is invalid'] }
 *
 * // Real-world: Form validation
 * const validatePassword = (password: string) =>
 *   password.length < 8
 *     ? invalid(['Password too short', 'Must be at least 8 characters'])
 *     : valid(password)
 * ```
 */
export function invalid<E>(errors: E | readonly E[]): Invalid<E> {
  return {
    _tag: 'Invalid',
    errors: Array.isArray(errors) ? (errors as readonly E[]) : ([errors] as readonly E[]),
  }
}

/**
 * Creates a validator from a predicate function.
 *
 * If the predicate returns true, returns Valid with the value.
 * If the predicate returns false, returns Invalid with the error.
 *
 * @param predicate - Function that tests the value
 * @param error - Error to return when predicate fails
 * @returns A validator function
 *
 * @example
 * ```typescript
 * import { gt } from 'receta/predicate'
 *
 * // Simple predicate validator
 * const isPositive = fromPredicate(
 *   (n: number) => n > 0,
 *   'Must be positive'
 * )
 * isPositive(5) // => Valid(5)
 * isPositive(-1) // => Invalid(['Must be positive'])
 *
 * // Using predicate builders
 * const isAdult = fromPredicate(
 *   gt(18),
 *   'Must be 18 or older'
 * )
 *
 * // Real-world: Email validation
 * const isEmail = fromPredicate(
 *   (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s),
 *   'Invalid email format'
 * )
 * ```
 *
 * @see fromPredicateWithError - for dynamic error messages
 */
export function fromPredicate<T, E>(
  predicate: Predicate<T>,
  error: E
): Validator<T, T, E> {
  return (value: T) => (predicate(value) ? valid(value) : invalid(error))
}

/**
 * Creates a validator from a predicate with a dynamic error function.
 *
 * Like fromPredicate, but allows the error message to depend on the input value.
 *
 * @param predicate - Function that tests the value
 * @param getError - Function that generates the error from the value
 * @returns A validator function
 *
 * @example
 * ```typescript
 * // Dynamic error message
 * const minLength = (min: number) =>
 *   fromPredicateWithError(
 *     (s: string) => s.length >= min,
 *     (s) => `Expected ${min} characters, got ${s.length}`
 *   )
 *
 * minLength(5)('hi')
 * // => Invalid(['Expected 5 characters, got 2'])
 *
 * // Real-world: Range validation with context
 * const inRange = (min: number, max: number) =>
 *   fromPredicateWithError(
 *     (n: number) => n >= min && n <= max,
 *     (n) => `${n} is out of range [${min}, ${max}]`
 *   )
 * ```
 *
 * @see fromPredicate - for static error messages
 */
export function fromPredicateWithError<T, E>(
  predicate: Predicate<T>,
  getError: (value: T) => E
): Validator<T, T, E> {
  return (value: T) => (predicate(value) ? valid(value) : invalid(getError(value)))
}

/**
 * Converts a Result to a Validation.
 *
 * Ok becomes Valid, Err becomes Invalid with a single error.
 *
 * @param result - The Result to convert
 * @returns A Validation with the same value or error
 *
 * @example
 * ```typescript
 * import { ok, err } from 'receta/result'
 *
 * fromResult(ok(42))
 * // => Valid(42)
 *
 * fromResult(err('failed'))
 * // => Invalid(['failed'])
 *
 * // Real-world: Convert Result-based parsers to Validation
 * const parseJSON = <T>(str: string): Validation<T, string> =>
 *   fromResult(Result.tryCatch(() => JSON.parse(str) as T))
 * ```
 *
 * @see toResult - for converting Validation to Result
 */
export function fromResult<T, E>(result: Result<T, E>): Validation<T, E> {
  return isOk(result) ? valid(result.value) : invalid(result.error)
}

/**
 * Wraps a potentially throwing function in a Validation.
 *
 * If the function succeeds, returns Valid with the return value.
 * If the function throws, returns Invalid with the caught error.
 *
 * @param fn - Function that may throw
 * @returns Validation containing either the return value or the error
 *
 * @example
 * ```typescript
 * // Parse JSON safely
 * const parseJSON = <T>(str: string): Validation<T, unknown> =>
 *   tryCatch(() => JSON.parse(str) as T)
 *
 * parseJSON('{"name":"John"}')
 * // => Valid({ name: 'John' })
 *
 * parseJSON('invalid json')
 * // => Invalid([SyntaxError: ...])
 * ```
 */
export function tryCatch<T>(fn: () => T): Validation<T, unknown>

/**
 * Wraps a potentially throwing function in a Validation with error mapping.
 *
 * @param fn - Function that may throw
 * @param mapError - Function to transform the caught error
 * @returns Validation containing either the return value or mapped error
 *
 * @example
 * ```typescript
 * // Parse JSON with custom error
 * const parseJSON = <T>(str: string): Validation<T, string> =>
 *   tryCatch(
 *     () => JSON.parse(str) as T,
 *     (e) => `JSON parse error: ${e.message}`
 *   )
 *
 * // Real-world: Parse with validation
 * const parseAndValidate = <T>(str: string, validate: Validator<T, T, string>) =>
 *   pipe(
 *     tryCatch(() => JSON.parse(str) as T, String),
 *     flatMap(validate)
 *   )
 * ```
 */
export function tryCatch<T, E>(fn: () => T, mapError: (error: unknown) => E): Validation<T, E>

export function tryCatch<T, E = unknown>(
  fn: () => T,
  mapError?: (error: unknown) => E
): Validation<T, E | unknown> {
  try {
    return valid(fn())
  } catch (error) {
    return invalid(mapError ? mapError(error) : error)
  }
}

/**
 * Async version of tryCatch.
 *
 * Wraps a potentially rejecting Promise in a Validation.
 *
 * @param fn - Async function that may throw
 * @returns Promise of Validation containing either the return value or error
 *
 * @example
 * ```typescript
 * // Fetch with validation
 * const fetchUser = async (id: string): Promise<Validation<User, unknown>> =>
 *   tryCatchAsync(() => fetch(`/api/users/${id}`).then(r => r.json()))
 *
 * // With error mapping
 * const fetchUser = async (id: string): Promise<Validation<User, string>> =>
 *   tryCatchAsync(
 *     () => fetch(`/api/users/${id}`).then(r => r.json()),
 *     (e) => `Failed to fetch user: ${e}`
 *   )
 * ```
 */
export async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Validation<T, unknown>>

/**
 * Async version of tryCatch with error mapping.
 *
 * @param fn - Async function that may throw
 * @param mapError - Function to transform the caught error
 * @returns Promise of Validation containing either the return value or mapped error
 *
 * @example
 * ```typescript
 * // Real-world: API call with validation
 * const createUser = async (data: unknown): Promise<Validation<User, string>> =>
 *   pipe(
 *     await tryCatchAsync(
 *       () => fetch('/api/users', {
 *         method: 'POST',
 *         body: JSON.stringify(data)
 *       }).then(r => r.json()),
 *       (e) => `Network error: ${e}`
 *     ),
 *     flatMap(validateUserData)
 *   )
 * ```
 */
export async function tryCatchAsync<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): Promise<Validation<T, E>>

export async function tryCatchAsync<T, E = unknown>(
  fn: () => Promise<T>,
  mapError?: (error: unknown) => E
): Promise<Validation<T, E | unknown>> {
  try {
    return valid(await fn())
  } catch (error) {
    return invalid(mapError ? mapError(error) : error)
  }
}

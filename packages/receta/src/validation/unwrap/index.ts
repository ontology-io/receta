/**
 * Extract values from Validation instances.
 *
 * @module validation/unwrap
 */

import { instrumentedPurry } from '../../utils'
import type { Validation } from '../types'
import { isValid } from '../guards'

/**
 * Extracts the value from a Valid validation or throws an error.
 *
 * ⚠️ **Warning**: This function throws if the validation is Invalid.
 * Only use when you're certain the validation is Valid, or use unwrapOr/unwrapOrElse instead.
 *
 * @param validation - The validation to unwrap
 * @returns The value from Valid
 * @throws {Error} If the validation is Invalid
 *
 * @example
 * ```typescript
 * unwrap(valid(42)) // => 42
 *
 * unwrap(invalid(['error']))
 * // => throws Error: "Cannot unwrap Invalid validation"
 *
 * // Real-world: When you've already checked the validation
 * const validation = validateConfig(config)
 * if (isValid(validation)) {
 *   const value = unwrap(validation) // Safe because we checked
 *   useConfig(value)
 * }
 * ```
 *
 * @see unwrapOr - for providing a default value
 * @see unwrapOrElse - for computing a default value
 * @see match - for safe pattern matching
 */
export function unwrap<T, E>(validation: Validation<T, E>): T {
  if (isValid(validation)) {
    return validation.value
  }
  throw new Error(
    `Cannot unwrap Invalid validation. Errors: ${JSON.stringify(validation.errors)}`
  )
}

/**
 * Extracts the value from a Valid validation or returns a default value.
 *
 * @param validation - The validation to unwrap
 * @param defaultValue - Value to return if validation is Invalid
 * @returns The value from Valid, or the default value
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOr(valid(42), 0) // => 42
 * unwrapOr(invalid(['error']), 0) // => 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateAge(input),
 *   unwrapOr(18)
 * )
 *
 * // Real-world: Configuration with defaults
 * const getPort = (config: Config) =>
 *   pipe(
 *     validatePort(config.port),
 *     unwrapOr(3000)
 *   )
 *
 * // Form field with default
 * const getUsername = (form: FormData) =>
 *   pipe(
 *     validateUsername(form.username),
 *     unwrapOr('anonymous')
 *   )
 * ```
 *
 * @see unwrapOrElse - for computing the default value
 * @see unwrap - for throwing on Invalid
 */
export function unwrapOr<T, E>(validation: Validation<T, E>, defaultValue: T): T
export function unwrapOr<T>(defaultValue: T): <E>(validation: Validation<T, E>) => T
export function unwrapOr(...args: unknown[]): unknown {
  return instrumentedPurry('unwrapOr', 'validation', unwrapOrImplementation, args)
}

function unwrapOrImplementation<T, E>(validation: Validation<T, E>, defaultValue: T): T {
  return isValid(validation) ? validation.value : defaultValue
}

/**
 * Extracts the value from a Valid validation or computes a default from errors.
 *
 * @param validation - The validation to unwrap
 * @param fn - Function that takes errors and returns a default value
 * @returns The value from Valid, or the computed default
 *
 * @example
 * ```typescript
 * // Data-first
 * unwrapOrElse(valid(42), () => 0)
 * // => 42
 *
 * unwrapOrElse(invalid(['error1', 'error2']), (errors) => {
 *   console.error('Validation failed:', errors)
 *   return 0
 * })
 * // Logs errors and returns 0
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateInput(input),
 *   unwrapOrElse((errors) => {
 *     reportErrors(errors)
 *     return fallbackValue
 *   })
 * )
 *
 * // Real-world: Log errors and return default
 * const getConfig = (raw: unknown) =>
 *   pipe(
 *     validateConfig(raw),
 *     unwrapOrElse((errors) => {
 *       logger.error('Config validation failed', { errors })
 *       return defaultConfig
 *     })
 *   )
 *
 * // Real-world: Create error report
 * const processForm = (data: FormData) =>
 *   pipe(
 *     validateForm(data),
 *     unwrapOrElse((errors) => {
 *       showNotification({
 *         type: 'error',
 *         message: `Validation failed with ${errors.length} errors`
 *       })
 *       return emptyForm
 *     })
 *   )
 * ```
 *
 * @see unwrapOr - for a static default value
 * @see match - for comprehensive error handling
 */
export function unwrapOrElse<T, E>(
  validation: Validation<T, E>,
  fn: (errors: readonly E[]) => T
): T
export function unwrapOrElse<T, E>(
  fn: (errors: readonly E[]) => T
): (validation: Validation<T, E>) => T
export function unwrapOrElse(...args: unknown[]): unknown {
  return instrumentedPurry('unwrapOrElse', 'validation', unwrapOrElseImplementation, args)
}

function unwrapOrElseImplementation<T, E>(
  validation: Validation<T, E>,
  fn: (errors: readonly E[]) => T
): T {
  return isValid(validation) ? validation.value : fn(validation.errors)
}

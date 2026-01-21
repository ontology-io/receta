/**
 * Side effects for Validation.
 *
 * @module validation/tap
 */

import * as R from 'remeda'
import type { Validation } from './types'
import { isValid } from './guards'

/**
 * Performs a side effect with the Valid value, returning the validation unchanged.
 *
 * Useful for logging, debugging, or triggering side effects in a pipeline
 * without modifying the validation.
 *
 * @param validation - The validation to tap
 * @param fn - Side effect function called with the valid value
 * @returns The original validation unchanged
 *
 * @example
 * ```typescript
 * // Data-first
 * tap(valid(42), (n) => console.log('Value:', n))
 * // Logs: "Value: 42"
 * // Returns: Valid(42)
 *
 * tap(invalid(['error']), (n) => console.log('Value:', n))
 * // Logs nothing
 * // Returns: Invalid(['error'])
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateEmail(email),
 *   tap((email) => console.log('Valid email:', email)),
 *   flatMap(sendWelcomeEmail)
 * )
 *
 * // Real-world: Log valid values
 * const processUser = (data: unknown) =>
 *   pipe(
 *     validateUser(data),
 *     tap((user) => logger.info('User validated', { userId: user.id })),
 *     flatMap(saveUser)
 *   )
 *
 * // Real-world: Trigger analytics
 * const submitForm = (formData: FormData) =>
 *   pipe(
 *     validateForm(formData),
 *     tap((data) => analytics.track('form_validated', data)),
 *     flatMap(sendToAPI)
 *   )
 *
 * // Real-world: Debug pipeline
 * const debug = <T>(label: string) => (value: T) => {
 *   console.log(label, value)
 *   return value
 * }
 *
 * pipe(
 *   validateInput(input),
 *   tap(debug('After validation')),
 *   map(transform),
 *   tap(debug('After transform'))
 * )
 * ```
 *
 * @see tapInvalid - for side effects on Invalid
 */
export function tap<T, E>(validation: Validation<T, E>, fn: (value: T) => void): Validation<T, E>
export function tap<T>(fn: (value: T) => void): <E>(validation: Validation<T, E>) => Validation<T, E>
export function tap(...args: unknown[]): unknown {
  return R.purry(tapImplementation, args)
}

function tapImplementation<T, E>(validation: Validation<T, E>, fn: (value: T) => void): Validation<T, E> {
  if (isValid(validation)) {
    fn(validation.value)
  }
  return validation
}

/**
 * Performs a side effect with the Invalid errors, returning the validation unchanged.
 *
 * Useful for logging errors, sending error reports, or triggering error handling
 * side effects without modifying the validation.
 *
 * @param validation - The validation to tap
 * @param fn - Side effect function called with the errors
 * @returns The original validation unchanged
 *
 * @example
 * ```typescript
 * // Data-first
 * tapInvalid(invalid(['error1', 'error2']), (errors) => console.error(errors))
 * // Logs: ['error1', 'error2']
 * // Returns: Invalid(['error1', 'error2'])
 *
 * tapInvalid(valid(42), (errors) => console.error(errors))
 * // Logs nothing
 * // Returns: Valid(42)
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateForm(formData),
 *   tapInvalid((errors) => logger.error('Validation failed', { errors })),
 *   match({
 *     onValid: processForm,
 *     onInvalid: () => showErrorPage()
 *   })
 * )
 *
 * // Real-world: Error reporting
 * const processWithErrorReporting = (data: unknown) =>
 *   pipe(
 *     validateData(data),
 *     tapInvalid((errors) => {
 *       errorTracker.report('validation_error', {
 *         errors,
 *         context: { data }
 *       })
 *     }),
 *     flatMap(process)
 *   )
 *
 * // Real-world: User feedback
 * const submitForm = (formData: FormData) =>
 *   pipe(
 *     validateForm(formData),
 *     tapInvalid((errors) => {
 *       showToast({
 *         type: 'error',
 *         message: `Please fix ${errors.length} error(s)`
 *       })
 *     }),
 *     flatMap(sendToAPI)
 *   )
 *
 * // Real-world: Combined logging
 * const processWithLogging = (data: unknown) =>
 *   pipe(
 *     validateData(data),
 *     tap((valid) => logger.info('Validation passed', { data: valid })),
 *     tapInvalid((errors) => logger.error('Validation failed', { errors })),
 *     flatMap(process)
 *   )
 * ```
 *
 * @see tap - for side effects on Valid
 */
export function tapInvalid<T, E>(
  validation: Validation<T, E>,
  fn: (errors: readonly E[]) => void
): Validation<T, E>
export function tapInvalid<E>(
  fn: (errors: readonly E[]) => void
): <T>(validation: Validation<T, E>) => Validation<T, E>
export function tapInvalid(...args: unknown[]): unknown {
  return R.purry(tapInvalidImplementation, args)
}

function tapInvalidImplementation<T, E>(
  validation: Validation<T, E>,
  fn: (errors: readonly E[]) => void
): Validation<T, E> {
  if (!isValid(validation)) {
    fn(validation.errors)
  }
  return validation
}

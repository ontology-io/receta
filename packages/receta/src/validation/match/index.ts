/**
 * Pattern matching for Validation.
 *
 * @module validation/match
 */

import { instrumentedPurry } from '../../utils'
import type { Validation } from '../types'
import { isValid } from '../guards'

/**
 * Pattern matching interface for Validation.
 */
export interface ValidationMatcher<T, E, R> {
  readonly onValid: (value: T) => R
  readonly onInvalid: (errors: readonly E[]) => R
}

/**
 * Performs pattern matching on a Validation.
 *
 * Exhaustively handles both Valid and Invalid cases by providing functions
 * for each. This is the recommended way to work with Validation when you
 * need to handle both cases.
 *
 * @param validation - The validation to match on
 * @param matcher - Object with onValid and onInvalid handlers
 * @returns The result of calling the appropriate handler
 *
 * @example
 * ```typescript
 * // Data-first
 * match(valid(42), {
 *   onValid: (n) => `Success: ${n}`,
 *   onInvalid: (errors) => `Errors: ${errors.join(', ')}`
 * })
 * // => "Success: 42"
 *
 * match(invalid(['error1', 'error2']), {
 *   onValid: (n) => `Success: ${n}`,
 *   onInvalid: (errors) => `Errors: ${errors.join(', ')}`
 * })
 * // => "Errors: error1, error2"
 *
 * // Data-last (in pipe)
 * pipe(
 *   validateEmail(email),
 *   match({
 *     onValid: (email) => sendWelcomeEmail(email),
 *     onInvalid: (errors) => showErrors(errors)
 *   })
 * )
 *
 * // Real-world: HTTP response
 * app.post('/api/users', (req, res) => {
 *   const validation = validateUser(req.body)
 *
 *   match(validation, {
 *     onValid: (user) => res.status(201).json(user),
 *     onInvalid: (errors) => res.status(400).json({ errors })
 *   })
 * })
 *
 * // Real-world: UI rendering
 * const renderForm = (validation: Validation<FormData, FieldError>) =>
 *   match(validation, {
 *     onValid: (data) => <SuccessMessage data={data} />,
 *     onInvalid: (errors) => <Form errors={errors} />
 *   })
 *
 * // Real-world: Error logging
 * const processWithLogging = (data: unknown) =>
 *   pipe(
 *     validateData(data),
 *     match({
 *       onValid: (validated) => {
 *         logger.info('Validation succeeded')
 *         return process(validated)
 *       },
 *       onInvalid: (errors) => {
 *         logger.error('Validation failed', { errors })
 *         return null
 *       }
 *     })
 *   )
 * ```
 *
 * @see unwrapOr - for providing a default value
 * @see unwrapOrElse - for computing a default from errors
 */
export function match<T, E, R>(
  validation: Validation<T, E>,
  matcher: ValidationMatcher<T, E, R>
): R
export function match<T, E, R>(
  matcher: ValidationMatcher<T, E, R>
): (validation: Validation<T, E>) => R
export function match(...args: unknown[]): unknown {
  return instrumentedPurry('match', 'validation', matchImplementation, args)
}

function matchImplementation<T, E, R>(
  validation: Validation<T, E>,
  matcher: ValidationMatcher<T, E, R>
): R {
  return isValid(validation) ? matcher.onValid(validation.value) : matcher.onInvalid(validation.errors)
}

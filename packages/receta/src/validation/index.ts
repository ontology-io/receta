/**
 * Validation module - Data validation with error accumulation.
 *
 * The Validation type is similar to Result but optimized for error accumulation.
 * While Result short-circuits on the first error (fail-fast), Validation accumulates
 * all errors (fail-slow), making it ideal for form validation and multi-field data validation.
 *
 * @module validation
 *
 * @example
 * ```typescript
 * import { valid, invalid, validate, schema } from 'receta/validation'
 *
 * // Single field validation with multiple rules
 * const validatePassword = (password: string) =>
 *   validate(password, [
 *     fromPredicate(s => s.length >= 8, 'At least 8 characters'),
 *     fromPredicate(s => /[A-Z]/.test(s), 'At least one uppercase'),
 *     fromPredicate(s => /[0-9]/.test(s), 'At least one number')
 *   ])
 *
 * // Multi-field validation (accumulates all errors)
 * const userSchema = schema({
 *   name: pipe(required, minLength(3)),
 *   email: pipe(required, email),
 *   age: pipe(required, min(18))
 * })
 *
 * // Returns all field errors at once, not just the first one
 * validateForm(formData) // => Invalid([...all errors...])
 * ```
 */

// Types
export type { Validation, Valid, Invalid, Validator, ValidationSchema, FieldError } from './types'

// Constructors
export {
  valid,
  invalid,
  fromPredicate,
  fromPredicateWithError,
  fromResult,
  tryCatch,
  tryCatchAsync,
} from './constructors'

// Type guards
export { isValid, isInvalid } from './guards'

// Transformers
export { map } from './map'
export { mapInvalid } from './mapInvalid'
export { flatMap } from './flatMap'
export { flatten } from './flatten'

// Combinators
export { collectErrors } from './collectErrors'
export { validate } from './validate'
export { validateAll } from './validateAll'
export { schema, partial } from './schema'

// Extractors
export { unwrap, unwrapOr, unwrapOrElse } from './unwrap'
export { match, type ValidationMatcher } from './match'

// Side effects
export { tap, tapInvalid } from './tap'

// Conversions
export { toResult, toResultWith } from './toResult'

// Built-in validators
export {
  // String validators
  required,
  minLength,
  maxLength,
  lengthBetween,
  matches,
  email,
  url,
  alphanumeric,
  // Number validators
  min,
  max,
  between,
  positive,
  negative,
  integer,
  notNaN,
  finite,
  // Array validators
  nonEmpty,
  minItems,
  maxItems,
  // Generic validators
  oneOf,
  equals,
  defined,
} from './validators'

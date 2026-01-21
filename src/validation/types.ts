/**
 * Represents a successful validation containing a value.
 */
export interface Valid<T> {
  readonly _tag: 'Valid'
  readonly value: T
}

/**
 * Represents a failed validation containing accumulated errors.
 *
 * Unlike Result's Err which contains a single error, Invalid contains
 * an array of errors to support error accumulation across multiple validations.
 */
export interface Invalid<E> {
  readonly _tag: 'Invalid'
  readonly errors: readonly E[]
}

/**
 * Validation type representing either success (Valid) or failure (Invalid).
 *
 * Validation is similar to Result but optimized for error accumulation.
 * While Result short-circuits on the first error (fail-fast), Validation
 * accumulates all errors (fail-slow), making it ideal for form validation
 * and multi-field data validation.
 *
 * @typeParam T - The type of the success value
 * @typeParam E - The type of error values (stored as array)
 *
 * @example
 * ```typescript
 * type FormValidation = Validation<User, string>
 *
 * const success: FormValidation = { _tag: 'Valid', value: { name: 'John', email: 'john@example.com' } }
 * const failure: FormValidation = { _tag: 'Invalid', errors: ['Name too short', 'Invalid email'] }
 * ```
 */
export type Validation<T, E> = Valid<T> | Invalid<E>

/**
 * A function that validates a value and returns a Validation.
 *
 * Validators can be composed using flatMap, validate, and other combinators
 * to build complex validation logic from simple validators.
 *
 * @typeParam T - The input type to validate
 * @typeParam U - The output type after validation (often same as T)
 * @typeParam E - The error type
 *
 * @example
 * ```typescript
 * const minLength = (min: number): Validator<string, string, string> =>
 *   (value) => value.length >= min
 *     ? valid(value)
 *     : invalid(`Must be at least ${min} characters`)
 * ```
 */
export type Validator<T, U, E> = (value: T) => Validation<U, E>

/**
 * A schema definition for object validation.
 *
 * Maps object keys to validators that test the corresponding values.
 * Used with the `schema` combinator for validating entire objects.
 *
 * @typeParam T - The object type to validate
 * @typeParam E - The error type
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   email: string
 *   age: number
 * }
 *
 * const userSchema: ValidationSchema<User, string> = {
 *   name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
 *   email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
 *   age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
 * }
 * ```
 */
export type ValidationSchema<T, E> = {
  [K in keyof T]: Validator<T[K], T[K], E>
}

/**
 * Represents a validation error for a specific field.
 *
 * Used when validating objects to track which field(s) failed validation.
 *
 * @typeParam E - The type of individual error messages
 *
 * @example
 * ```typescript
 * const fieldError: FieldError<string> = {
 *   field: 'email',
 *   errors: ['Invalid email format', 'Email already exists']
 * }
 * ```
 */
export interface FieldError<E> {
  readonly field: string
  readonly errors: readonly E[]
}

/**
 * Object validation with schema-based field validation.
 *
 * @module validation/schema
 */

import * as R from 'remeda'
import type { Validation, ValidationSchema, FieldError } from '../types'
import { valid, invalid } from '../constructors'
import { isInvalid } from '../guards'

/**
 * Validates an object against a schema, accumulating field-level errors.
 *
 * Each field is validated independently using its validator from the schema.
 * If all fields are valid, returns Valid with the object.
 * If any field is invalid, returns Invalid with FieldError objects for each failed field.
 *
 * @param schemaObj - Schema mapping keys to validators
 * @param value - Object to validate
 * @returns Validation with the object, or field-level errors
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
 *
 * // Valid object
 * schema(userSchema, { name: 'John', email: 'john@example.com', age: 25 })
 * // => Valid({ name: 'John', email: 'john@example.com', age: 25 })
 *
 * // Invalid object - accumulates all field errors
 * schema(userSchema, { name: '', email: 'invalid', age: 17 })
 * // => Invalid([
 * //   { field: 'name', errors: ['Name required'] },
 * //   { field: 'email', errors: ['Invalid email'] },
 * //   { field: 'age', errors: ['Must be 18+'] }
 * // ])
 *
 * // Real-world: Form validation
 * const validateRegistration = (formData: unknown) =>
 *   schema(userSchema, formData)
 *
 * const result = validateRegistration(formData)
 * if (isInvalid(result)) {
 *   // Display all field errors at once
 *   result.errors.forEach(({ field, errors }) => {
 *     showFieldError(field, errors)
 *   })
 * }
 *
 * // Real-world: API request validation
 * const createUserSchema: ValidationSchema<CreateUserRequest, string> = {
 *   email: pipe(
 *     fromPredicate(s => s.length > 0, 'Email required'),
 *     flatMap(fromPredicate(s => s.includes('@'), 'Invalid email'))
 *   ),
 *   password: pipe(
 *     fromPredicate(s => s.length >= 8, 'Min 8 characters'),
 *     flatMap(fromPredicate(s => /[A-Z]/.test(s), 'Need uppercase'))
 *   )
 * }
 *
 * app.post('/api/users', (req, res) => {
 *   const validation = schema(createUserSchema, req.body)
 *   if (isInvalid(validation)) {
 *     return res.status(400).json({ errors: validation.errors })
 *   }
 *   // Process valid user data
 *   createUser(validation.value)
 * })
 * ```
 *
 * @see validate - for applying multiple validators to a single value
 * @see collectErrors - for combining independent validations
 */
export function schema<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: T
): Validation<T, FieldError<E>>
export function schema<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>
): (value: T) => Validation<T, FieldError<E>>
export function schema(...args: unknown[]): unknown {
  return R.purry(schemaImplementation, args)
}

function schemaImplementation<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: T
): Validation<T, FieldError<E>> {
  const fieldErrors: FieldError<E>[] = []

  for (const key in schemaObj) {
    const validator = schemaObj[key]
    if (!validator) continue

    const fieldValue = value[key]
    const validation = validator(fieldValue)

    if (isInvalid(validation)) {
      fieldErrors.push({
        field: key,
        errors: validation.errors,
      })
    }
  }

  return fieldErrors.length > 0 ? invalid(fieldErrors) : valid(value)
}

/**
 * Creates a schema validator for partial objects.
 *
 * Like schema, but only validates fields that are present in the value.
 * Missing fields are not validated.
 *
 * @param schemaObj - Schema mapping keys to validators
 * @param value - Partial object to validate
 * @returns Validation with the partial object, or field-level errors
 *
 * @example
 * ```typescript
 * const userSchema: ValidationSchema<User, string> = {
 *   name: (n) => n.length > 0 ? valid(n) : invalid('Name required'),
 *   email: (e) => e.includes('@') ? valid(e) : invalid('Invalid email'),
 *   age: (a) => a >= 18 ? valid(a) : invalid('Must be 18+')
 * }
 *
 * // Only validates present fields
 * partial(userSchema, { name: 'John' })
 * // => Valid({ name: 'John' })
 *
 * partial(userSchema, { name: '', email: 'invalid' })
 * // => Invalid([
 * //   { field: 'name', errors: ['Name required'] },
 * //   { field: 'email', errors: ['Invalid email'] }
 * // ])
 *
 * // Real-world: PATCH request validation
 * app.patch('/api/users/:id', (req, res) => {
 *   const validation = partial(userSchema, req.body)
 *   if (isInvalid(validation)) {
 *     return res.status(400).json({ errors: validation.errors })
 *   }
 *   updateUser(req.params.id, validation.value)
 * })
 * ```
 *
 * @see schema - for validating complete objects
 */
export function partial<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: Partial<T>
): Validation<Partial<T>, FieldError<E>>
export function partial<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>
): (value: Partial<T>) => Validation<Partial<T>, FieldError<E>>
export function partial(...args: unknown[]): unknown {
  return R.purry(partialImplementation, args)
}

function partialImplementation<T extends Record<string, unknown>, E>(
  schemaObj: ValidationSchema<T, E>,
  value: Partial<T>
): Validation<Partial<T>, FieldError<E>> {
  const fieldErrors: FieldError<E>[] = []

  for (const key in value) {
    const validator = schemaObj[key]
    if (!validator) continue

    const fieldValue = value[key]
    if (fieldValue === undefined) continue

    const validation = validator(fieldValue as T[Extract<keyof T, string>])

    if (isInvalid(validation)) {
      fieldErrors.push({
        field: key,
        errors: validation.errors,
      })
    }
  }

  return fieldErrors.length > 0 ? invalid(fieldErrors) : valid(value)
}

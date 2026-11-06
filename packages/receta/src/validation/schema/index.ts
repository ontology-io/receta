/**
 * Object validation with schema-based field validation.
 *
 * @module validation/schema
 */

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
 * Valid holds the object you passed in, so a validator can't convert a field or fill in a default.
 *
 * @param schemaObj - Schema mapping keys to validators
 * @param value - Object to validate
 * @returns Validation with the object, or field-level errors
 *
 * @example
 * ```typescript
 * type User = {
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
 * const validateRegistration = (form: User) =>
 *   schema(userSchema, form)
 *
 * const result = validateRegistration(formData)
 * if (isInvalid(result)) {
 *   // Display all field errors at once
 *   R.forEach(result.errors, ({ field, errors }) => {
 *     showFieldError(field, errors)
 *   })
 * }
 *
 * // Real-world: API request validation
 * const createUserSchema: ValidationSchema<CreateUserRequest, string> = {
 *   email: validate([required('Email required'), email()]),
 *   password: validate([minLength(8, 'Min 8 characters'), matches(/[A-Z]/, 'Need uppercase')])
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
export function schema<T extends object, E>(
  schemaObj: ValidationSchema<T, E>,
  value: T
): Validation<T, FieldError<E>>
export function schema<T extends object, E>(
  schemaObj: ValidationSchema<T, E>
): (value: T) => Validation<T, FieldError<E>>
export function schema<T extends object, E>(
  schemaObj: ValidationSchema<T, E>,
  ...rest: [] | [value: T]
): Validation<T, FieldError<E>> | ((value: T) => Validation<T, FieldError<E>>) {
  // Not purry: it passes the data first, and here the rules come first.
  return rest.length === 0
    ? (value) => schemaImplementation(schemaObj, value)
    : schemaImplementation(schemaObj, rest[0])
}

function schemaImplementation<T extends object, E>(
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
export function partial<T extends object, E>(
  schemaObj: ValidationSchema<T, E>,
  value: Partial<T>
): Validation<Partial<T>, FieldError<E>>
export function partial<T extends object, E>(
  schemaObj: ValidationSchema<T, E>
): (value: Partial<T>) => Validation<Partial<T>, FieldError<E>>
export function partial<T extends object, E>(
  schemaObj: ValidationSchema<T, E>,
  ...rest: [] | [value: Partial<T>]
): Validation<Partial<T>, FieldError<E>> | ((value: Partial<T>) => Validation<Partial<T>, FieldError<E>>) {
  // Not purry: it passes the data first, and here the rules come first.
  return rest.length === 0
    ? (value) => partialImplementation(schemaObj, value)
    : partialImplementation(schemaObj, rest[0])
}

function partialImplementation<T extends object, E>(
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

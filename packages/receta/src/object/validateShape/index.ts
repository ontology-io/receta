/**
 * Validates an object against a schema, returning Result.
 *
 * @module object/validateShape
 */

import * as R from 'remeda'
import { instrumentedPurry } from '../../utils'
import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { PlainObject, ObjectError } from '../types'

/**
 * Predicate function for validation.
 */
type Validator<T> = (value: unknown) => value is T

/**
 * Schema for object validation.
 */
export type ObjectSchema<T extends PlainObject> = {
  readonly [K in keyof T]: Validator<T[K]> | ObjectSchema<any>
}

/**
 * Validates an object against a schema, returning Result.
 *
 * Checks that an object matches a given shape/schema. Returns Ok if valid,
 * Err with details if invalid. Useful for runtime type checking, API
 * validation, and form validation.
 *
 * @param obj - The object to validate
 * @param schema - Schema defining expected shape and validators
 * @returns Result<T, ObjectError> - Ok if valid, Err with details if not
 *
 * @example
 * ```typescript
 * // Define schema with predicates
 * const userSchema = {
 *   id: (v: unknown): v is number => typeof v === 'number',
 *   name: (v: unknown): v is string => typeof v === 'string',
 *   email: (v: unknown): v is string =>
 *     typeof v === 'string' && v.includes('@')
 * }
 *
 * // Data-first
 * const input = { id: 1, name: 'Alice', email: 'alice@example.com' }
 * validateShape(input, userSchema)
 * // => Ok({ id: 1, name: 'Alice', email: 'alice@example.com' })
 *
 * const invalid = { id: '1', name: 'Alice', email: 'invalid' }
 * validateShape(invalid, userSchema)
 * // => Err({ code: 'VALIDATION_ERROR', message: '...', path: ['id'] })
 *
 * // Data-last (in pipe)
 * pipe(
 *   apiResponse,
 *   stripUndefined,
 *   (obj) => validateShape(obj, schema),
 *   map(user => processUser(user))
 * )
 *
 * // With Predicate module
 * import { isString, isNumber, where } from 'receta/predicate'
 *
 * const schema = {
 *   id: isNumber,
 *   name: isString,
 *   age: where({ min: 0, max: 150 })
 * }
 * ```
 *
 * @see Validation module - for more complex validation with error accumulation
 */
export function validateShape<T extends PlainObject>(
  obj: unknown,
  schema: ObjectSchema<T>
): Result<T, ObjectError>
export function validateShape<T extends PlainObject>(
  schema: ObjectSchema<T>
): (obj: unknown) => Result<T, ObjectError>
export function validateShape(...args: unknown[]): unknown {
  return instrumentedPurry('validateShape', 'object', validateShapeImplementation, args)
}

function validateShapeImplementation<T extends PlainObject>(
  obj: unknown,
  schema: ObjectSchema<T>
): Result<T, ObjectError> {
  // Check if obj is a plain object
  if (!R.isPlainObject(obj)) {
    return err({
      code: 'VALIDATION_ERROR',
      message: 'Expected a plain object',
      path: [],
    })
  }

  const typedObj = obj as PlainObject

  // Validate each field in schema
  for (const [key, validator] of Object.entries(schema)) {
    const value = typedObj[key]

    // Check if validator is a function (predicate) or nested schema
    if (typeof validator === 'function') {
      if (!validator(value)) {
        return err({
          code: 'VALIDATION_ERROR',
          message: `Validation failed for key "${key}"`,
          path: [key],
        })
      }
    } else if (typeof validator === 'object' && validator !== null) {
      // Nested schema validation
      const nestedResult = validateShapeImplementation(value, validator)
      if (nestedResult._tag === 'Err') {
        return err({
          ...nestedResult.error,
          path: [key, ...(nestedResult.error.path ?? [])],
        })
      }
    }
  }

  return ok(typedObj as T)
}

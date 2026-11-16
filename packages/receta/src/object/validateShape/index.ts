/**
 * Validates an object against a schema, returning Result.
 *
 * @module object/validateShape
 */

import * as R from 'remeda'
import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { ObjectPath, PlainObject, ObjectError } from '../types'

/**
 * Predicate function for validation.
 */
type Validator<T> = (value: unknown) => value is T

/**
 * Schema for object validation.
 */
export type ObjectSchema<T extends object> = {
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
 * import { isNumber, isString } from '@ontologyio/receta/predicate'
 * import { map } from '@ontologyio/receta/result'
 *
 * // Define schema with predicates
 * const userSchema = {
 *   id: isNumber,
 *   name: isString,
 *   email: (v: unknown): v is string => isString(v) && v.includes('@')
 * }
 *
 * // Data-first
 * const input = { id: 1, name: 'Alice', email: 'alice@example.com' }
 * validateShape(input, userSchema)
 * // => Ok({ id: 1, name: 'Alice', email: 'alice@example.com' })
 *
 * const invalid = { id: '1', name: 'Alice', email: 'invalid' }
 * validateShape(invalid, userSchema)
 * // => Err({ code: 'VALIDATION_ERROR', message: 'Validation failed for key "id"', path: ['id'] })
 *
 * // A nested schema: the message and the path both name the whole way down
 * validateShape({ user: { address: { zip: 12345 } } }, { user: { address: { zip: isString } } })
 * // => Err({
 * //   code: 'VALIDATION_ERROR',
 * //   message: 'Validation failed for key "user.address.zip"',
 * //   path: ['user', 'address', 'zip']
 * // })
 *
 * // Data-last (in pipe)
 * pipe(
 *   apiResponse,
 *   stripUndefined,
 *   (obj) => validateShape(obj, userSchema),
 *   map(user => processUser(user))
 * )
 *
 * // With Predicate module
 * import { isString, isNumber } from '@ontologyio/receta/predicate'
 *
 * const profileSchema = {
 *   id: isNumber,
 *   name: isString,
 *   age: (v: unknown): v is number => isNumber(v) && v >= 0 && v <= 150
 * }
 * ```
 *
 * @see Validation module - for more complex validation with error accumulation
 */
export function validateShape<T extends object>(
  obj: unknown,
  schema: ObjectSchema<T>
): Result<T, ObjectError>
export function validateShape<T extends object>(
  schema: ObjectSchema<T>
): (obj: unknown) => Result<T, ObjectError>
export function validateShape(...args: unknown[]): unknown {
  return R.purry(validateShapeImplementation, args)
}

function validateShapeImplementation<T extends PlainObject>(
  obj: unknown,
  schema: ObjectSchema<T>
): Result<T, ObjectError> {
  return validateAt(obj, schema, [])
}

/**
 * Validates `obj` against `schema`. `path` is where `obj` sits in the value the caller
 * passed, so an error deep in a nested schema can name the whole way down.
 */
function validateAt<T extends PlainObject>(
  obj: unknown,
  schema: ObjectSchema<T>,
  path: ObjectPath
): Result<T, ObjectError> {
  // Check if obj is a plain object
  if (!R.isPlainObject(obj)) {
    return err({
      code: 'VALIDATION_ERROR',
      message: path.length === 0 ? 'Expected a plain object' : `Expected a plain object at "${path.join('.')}"`,
      path,
    })
  }

  const typedObj = obj as PlainObject

  // Validate each field in schema
  for (const [key, validator] of Object.entries(schema)) {
    const value = typedObj[key]
    const keyPath = [...path, key]

    // Check if validator is a function (predicate) or nested schema
    if (typeof validator === 'function') {
      if (!validator(value)) {
        return err({
          code: 'VALIDATION_ERROR',
          message: `Validation failed for key "${keyPath.join('.')}"`,
          path: keyPath,
        })
      }
    } else if (typeof validator === 'object' && validator !== null) {
      // Nested schema validation
      const nestedResult = validateAt(value, validator, keyPath)
      if (nestedResult._tag === 'Err') {
        return nestedResult
      }
    }
  }

  return ok(typedObj as T)
}

/**
 * Deep transformation of object keys (e.g., camelCase ↔ snake_case).
 *
 * @module object/transformKeys
 */

import * as R from 'remeda'
import type { PlainObject } from '../types'

/**
 * Type of key transformation to apply.
 */
export type KeyTransform = 'camelCase' | 'snakeCase' | 'kebabCase' | 'pascalCase' | ((key: string) => string)

/**
 * Options for transformKeys operation.
 */
export interface TransformKeysOptions {
  /**
   * Whether to transform keys recursively in nested objects (default: true).
   */
  readonly deep?: boolean

  /**
   * Whether to transform keys in arrays of objects (default: true).
   */
  readonly transformArrays?: boolean
}

/**
 * Converts a string to camelCase.
 *
 * @example
 * ```typescript
 * toCamelCase('hello_world') // => 'helloWorld'
 * toCamelCase('hello-world') // => 'helloWorld'
 * toCamelCase('HelloWorld') // => 'helloWorld'
 * ```
 */
function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[A-Z]/, (c) => c.toLowerCase())
}

/**
 * Converts a string to snake_case.
 *
 * @example
 * ```typescript
 * toSnakeCase('helloWorld') // => 'hello_world'
 * toSnakeCase('HelloWorld') // => 'hello_world'
 * toSnakeCase('hello-world') // => 'hello_world'
 * ```
 */
function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .replace(/[-\s]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '')
}

/**
 * Converts a string to kebab-case.
 *
 * @example
 * ```typescript
 * toKebabCase('helloWorld') // => 'hello-world'
 * toKebabCase('HelloWorld') // => 'hello-world'
 * toKebabCase('hello_world') // => 'hello-world'
 * ```
 */
function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .replace(/[_\s]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '')
}

/**
 * Converts a string to PascalCase.
 *
 * @example
 * ```typescript
 * toPascalCase('hello_world') // => 'HelloWorld'
 * toPascalCase('hello-world') // => 'HelloWorld'
 * toPascalCase('helloWorld') // => 'HelloWorld'
 * ```
 */
function toPascalCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ''))
    .replace(/^[a-z]/, (c) => c.toUpperCase())
}

/**
 * Gets the transformation function for a given transform type.
 */
function getTransformFn(transform: KeyTransform): (key: string) => string {
  if (typeof transform === 'function') {
    return transform
  }

  switch (transform) {
    case 'camelCase':
      return toCamelCase
    case 'snakeCase':
      return toSnakeCase
    case 'kebabCase':
      return toKebabCase
    case 'pascalCase':
      return toPascalCase
  }
}

/**
 * Recursively transforms all keys in an object and its nested structures.
 *
 * This function is useful for converting API responses between different
 * naming conventions (e.g., snake_case from Python APIs to camelCase in JS).
 *
 * Supports deep transformation of nested objects and arrays of objects.
 *
 * @param obj - The object whose keys to transform
 * @param transform - The transformation to apply ('camelCase', 'snakeCase', 'kebabCase', 'pascalCase', or custom function)
 * @param options - Transformation options
 * @returns A new object with transformed keys
 *
 * @example
 * ```typescript
 * // Convert snake_case API response to camelCase
 * const apiResponse = {
 *   user_id: 123,
 *   user_profile: {
 *     first_name: 'Alice',
 *     last_name: 'Smith',
 *     contact_info: {
 *       email_address: 'alice@example.com'
 *     }
 *   }
 * }
 *
 * transformKeys(apiResponse, 'camelCase')
 * // => {
 * //   userId: 123,
 * //   userProfile: {
 * //     firstName: 'Alice',
 * //     lastName: 'Smith',
 * //     contactInfo: {
 * //       emailAddress: 'alice@example.com'
 * //     }
 * //   }
 * // }
 *
 * // Convert camelCase to snake_case for API request
 * const jsObject = {
 *   userId: 123,
 *   userProfile: {
 *     firstName: 'Alice',
 *     contactInfo: {
 *       emailAddress: 'alice@example.com'
 *     }
 *   }
 * }
 *
 * transformKeys(jsObject, 'snakeCase')
 * // => {
 * //   user_id: 123,
 * //   user_profile: {
 * //     first_name: 'Alice',
 * //     contact_info: {
 * //       email_address: 'alice@example.com'
 * //     }
 * //   }
 * // }
 *
 * // Transform arrays of objects
 * const users = {
 *   user_list: [
 *     { first_name: 'Alice', user_id: 1 },
 *     { first_name: 'Bob', user_id: 2 }
 *   ]
 * }
 *
 * transformKeys(users, 'camelCase')
 * // => {
 * //   userList: [
 * //     { firstName: 'Alice', userId: 1 },
 * //     { firstName: 'Bob', userId: 2 }
 * //   ]
 * // }
 *
 * // Custom transformation function
 * transformKeys(
 *   { hello: 'world', foo: 'bar' },
 *   (key) => key.toUpperCase()
 * )
 * // => { HELLO: 'world', FOO: 'bar' }
 *
 * // Shallow transformation (not recursive)
 * transformKeys(
 *   { user_name: 'Alice', user_meta: { created_at: '2024-01-01' } },
 *   'camelCase',
 *   { deep: false }
 * )
 * // => { userName: 'Alice', userMeta: { created_at: '2024-01-01' } }
 *
 * // Data-last (in pipe)
 * pipe(
 *   fetchUserData(),
 *   transformKeys('camelCase')
 * )
 * ```
 *
 * @see mapKeys - for shallow key transformation only
 */
export function transformKeys(
  obj: PlainObject,
  transform: KeyTransform,
  options?: TransformKeysOptions
): PlainObject
export function transformKeys(
  transform: KeyTransform,
  options?: TransformKeysOptions
): (obj: PlainObject) => PlainObject
export function transformKeys(
  objOrTransform: PlainObject | KeyTransform,
  transformOrOptions?: KeyTransform | TransformKeysOptions,
  maybeOptions?: TransformKeysOptions
): any {
  // Data-last: first arg is transform (string or function)
  if (typeof objOrTransform === 'string' || typeof objOrTransform === 'function') {
    return (obj: PlainObject) =>
      transformKeysImplementation(obj, objOrTransform as KeyTransform, transformOrOptions as TransformKeysOptions)
  }

  // Data-first
  return transformKeysImplementation(
    objOrTransform as PlainObject,
    transformOrOptions as KeyTransform,
    maybeOptions
  )
}

function transformKeysImplementation(
  obj: PlainObject,
  transform: KeyTransform,
  options: TransformKeysOptions = {}
): PlainObject {
  const { deep = true, transformArrays = true } = options
  const transformFn = getTransformFn(transform)

  function transformValue(value: unknown): unknown {
    if (!deep) {
      return value
    }

    // Handle arrays
    if (Array.isArray(value)) {
      if (!transformArrays) {
        return value
      }
      return value.map((item) => transformValue(item))
    }

    // Handle plain objects (not null, not Date, not custom classes)
    if (
      value !== null &&
      typeof value === 'object' &&
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      return transformKeysImplementation(value as PlainObject, transform, options)
    }

    // Return primitives and other types as-is
    return value
  }

  const result: PlainObject = {}

  for (const [key, value] of Object.entries(obj)) {
    const newKey = transformFn(key)
    result[newKey] = transformValue(value)
  }

  return result
}

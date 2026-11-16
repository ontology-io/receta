/**
 * Deep transformation of object keys (e.g., camelCase ↔ snake_case).
 *
 * @module object/transformKeys
 */

import type { PlainObject } from '../types'
import { setOwnKey } from '../../utils/setOwnKey'
import { camelCase, kebabCase, pascalCase, snakeCase } from '../../string/case'

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

const CASE_CONVERTERS = {
  camelCase,
  snakeCase,
  kebabCase,
  pascalCase,
} as const

/**
 * Wraps a case converter so that underscores at either end of a key survive.
 *
 * Leading and trailing underscores are part of a key's name, not a word separator: `_id`
 * and `id` are different keys, and `__typename` has to stay `__typename`.
 */
function keepingOuterUnderscores(convert: (key: string) => string): (key: string) => string {
  return (key) => {
    const [, leading = '', inner = '', trailing = ''] = /^(_*)(.*?)(_*)$/s.exec(key) ?? []

    return `${leading}${convert(inner)}${trailing}`
  }
}

/**
 * Gets the transformation function for a given transform type.
 */
function getTransformFn(transform: KeyTransform): (key: string) => string {
  return typeof transform === 'function'
    ? transform
    : keepingOuterUnderscores(CASE_CONVERTERS[transform])
}

/**
 * Recursively transforms all keys in an object and its nested structures.
 *
 * This function is useful for converting API responses between different
 * naming conventions (e.g., snake_case from Python APIs to camelCase in JS).
 *
 * Supports deep transformation of nested objects and arrays of objects.
 *
 * The named transforms use the same word rules as `camelCase`, `snakeCase`, `kebabCase`
 * and `pascalCase` from the string module, so a run of capitals is one word (`userID`
 * becomes `user_id`). Underscores at the start or end of a key are kept as they are:
 * `_id` stays `_id` and `__typename` stays `__typename`.
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
 * // Acronyms stay one word, and outer underscores are kept
 * transformKeys({ userID: 1, HTMLParser: 2, _id: 3, __typename: 'User' }, 'snakeCase')
 * // => { user_id: 1, html_parser: 2, _id: 3, __typename: 'User' }
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
    setOwnKey(result, newKey, transformValue(value))
  }

  return result
}

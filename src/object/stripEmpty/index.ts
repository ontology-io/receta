/**
 * Removes empty values (null, undefined, empty strings, arrays, objects) from an object.
 *
 * @module object/stripEmpty
 */

import * as R from 'remeda'
import type { PlainObject } from '../types'

/**
 * Options for stripEmpty operation.
 */
export interface StripEmptyOptions {
  /**
   * Whether to remove empty strings (default: true).
   */
  readonly stripEmptyStrings?: boolean

  /**
   * Whether to remove empty arrays (default: true).
   */
  readonly stripEmptyArrays?: boolean

  /**
   * Whether to remove empty objects (default: true).
   */
  readonly stripEmptyObjects?: boolean

  /**
   * Whether to strip recursively in nested objects (default: true).
   */
  readonly deep?: boolean
}

/**
 * Checks if a value is considered empty.
 */
function isEmpty(value: unknown, options: Required<StripEmptyOptions>): boolean {
  // null and undefined are always empty
  if (value == null) {
    return true
  }

  // Empty string
  if (options.stripEmptyStrings && typeof value === 'string' && value === '') {
    return true
  }

  // Empty array
  if (options.stripEmptyArrays && Array.isArray(value) && value.length === 0) {
    return true
  }

  // Empty object (plain object with no keys)
  if (
    options.stripEmptyObjects &&
    typeof value === 'object' &&
    !Array.isArray(value) &&
    Object.getPrototypeOf(value) === Object.prototype &&
    Object.keys(value).length === 0
  ) {
    return true
  }

  return false
}

/**
 * Removes all empty values from an object.
 *
 * By default, removes:
 * - null and undefined
 * - Empty strings ('')
 * - Empty arrays ([])
 * - Empty objects ({})
 *
 * This is useful for cleaning API payloads, removing optional fields before
 * sending data, and normalizing objects for comparison or storage.
 *
 * @param obj - The object to strip empty values from
 * @param options - Options controlling what is considered "empty"
 * @returns A new object with empty values removed
 *
 * @example
 * ```typescript
 * // Basic usage
 * const input = {
 *   name: 'Alice',
 *   email: '',
 *   tags: [],
 *   metadata: {},
 *   age: null,
 *   verified: false
 * }
 *
 * stripEmpty(input)
 * // => { name: 'Alice', verified: false }
 *
 * // Keeps non-empty values (0, false are not empty)
 * stripEmpty({ count: 0, active: false, name: '' })
 * // => { count: 0, active: false }
 *
 * // Deep cleaning of nested objects
 * const nested = {
 *   user: {
 *     name: 'Alice',
 *     bio: '',
 *     settings: {
 *       theme: null,
 *       notifications: []
 *     }
 *   },
 *   metadata: {}
 * }
 *
 * stripEmpty(nested)
 * // => { user: { name: 'Alice', settings: {} } }
 * // Note: settings is empty but kept because stripEmptyObjects applies to top-level
 *
 * // Customize what to strip
 * stripEmpty(
 *   { name: '', tags: [], count: 0 },
 *   { stripEmptyStrings: false, stripEmptyArrays: true }
 * )
 * // => { name: '', count: 0 }
 *
 * // Preparing API request payload
 * const formData = {
 *   title: 'New Post',
 *   body: 'Content here',
 *   tags: [],
 *   draft: false,
 *   publishedAt: null
 * }
 *
 * pipe(
 *   formData,
 *   stripEmpty,
 *   (clean) => fetch('/api/posts', { method: 'POST', body: JSON.stringify(clean) })
 * )
 * // Sends: { title: 'New Post', body: 'Content here', draft: false }
 *
 * // Shallow stripping (not recursive)
 * stripEmpty(
 *   {
 *     name: 'Alice',
 *     nested: { bio: '', age: null }
 *   },
 *   { deep: false }
 * )
 * // => { name: 'Alice', nested: { bio: '', age: null } }
 *
 * // Data-last (in pipe)
 * pipe(
 *   apiPayload,
 *   stripEmpty()
 * )
 * ```
 *
 * @see compact - for removing only null/undefined (keeps empty strings/arrays)
 * @see stripUndefined - for removing only undefined values
 */
export function stripEmpty(obj: PlainObject, options?: StripEmptyOptions): PlainObject
export function stripEmpty(options?: StripEmptyOptions): (obj: PlainObject) => PlainObject
export function stripEmpty(objOrOptions?: PlainObject | StripEmptyOptions, maybeOptions?: StripEmptyOptions): any {
  // Data-last: if first arg looks like options (has stripEmpty* or deep keys)
  if (
    objOrOptions !== undefined &&
    typeof objOrOptions === 'object' &&
    !Array.isArray(objOrOptions) &&
    ('stripEmptyStrings' in objOrOptions ||
      'stripEmptyArrays' in objOrOptions ||
      'stripEmptyObjects' in objOrOptions ||
      'deep' in objOrOptions)
  ) {
    return (obj: PlainObject) => stripEmptyImplementation(obj, objOrOptions as StripEmptyOptions)
  }

  // Data-first
  return stripEmptyImplementation(objOrOptions as PlainObject ?? {}, maybeOptions)
}

function stripEmptyImplementation(
  obj: PlainObject,
  options: StripEmptyOptions = {}
): PlainObject {
  const opts: Required<StripEmptyOptions> = {
    stripEmptyStrings: options.stripEmptyStrings ?? true,
    stripEmptyArrays: options.stripEmptyArrays ?? true,
    stripEmptyObjects: options.stripEmptyObjects ?? true,
    deep: options.deep ?? true,
  }

  function stripValue(value: unknown): unknown {
    // Handle nested objects recursively
    if (
      opts.deep &&
      value !== null &&
      typeof value === 'object' &&
      !Array.isArray(value) &&
      Object.getPrototypeOf(value) === Object.prototype
    ) {
      return stripEmptyImplementation(value as PlainObject, options)
    }

    // Return value as-is (arrays, primitives, etc.)
    return value
  }

  const result: PlainObject = {}

  for (const [key, value] of Object.entries(obj)) {
    const processedValue = stripValue(value)

    if (!isEmpty(processedValue, opts)) {
      result[key] = processedValue
    }
  }

  return result
}

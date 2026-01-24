/**
 * Deep merges multiple objects with configurable conflict resolution.
 *
 * @module object/deepMerge
 */

import * as R from 'remeda'
import type { PlainObject, DeepMergeOptions } from '../types'

/**
 * Deep merges multiple objects with configurable conflict resolution.
 *
 * Recursively merges objects, with later objects taking precedence over earlier ones.
 * Arrays and nested objects can be merged according to specified strategies.
 *
 * @param objects - Array of objects to merge
 * @param options - Merge options (arrayStrategy, customMerge)
 * @returns A new deeply merged object
 *
 * @example
 * ```typescript
 * // Basic deep merge
 * const defaults = { theme: 'light', features: { search: true } }
 * const config = { features: { export: true } }
 * deepMerge([defaults, config])
 * // => { theme: 'light', features: { search: true, export: true } }
 *
 * // Array replace strategy (default)
 * deepMerge([
 *   { tags: ['a', 'b'] },
 *   { tags: ['c'] }
 * ])
 * // => { tags: ['c'] }
 *
 * // Array concat strategy
 * deepMerge([
 *   { tags: ['a', 'b'] },
 *   { tags: ['c'] }
 * ], { arrayStrategy: 'concat' })
 * // => { tags: ['a', 'b', 'c'] }
 *
 * // Custom merge function
 * deepMerge([obj1, obj2], {
 *   customMerge: (key, target, source) => {
 *     if (key === 'count') return (target as number) + (source as number)
 *     return source
 *   }
 * })
 *
 * // Data-last (in pipe)
 * pipe(
 *   defaults,
 *   (defaults) => deepMerge([defaults, userConfig])
 * )
 * ```
 *
 * @see Remeda.merge - for shallow merge
 * @see Remeda.mergeDeep - for basic deep merge
 */
export function deepMerge(objects: readonly PlainObject[], options?: DeepMergeOptions): PlainObject
export function deepMerge(options?: DeepMergeOptions): (objects: readonly PlainObject[]) => PlainObject
export function deepMerge(objectsOrOptions?: readonly PlainObject[] | DeepMergeOptions, maybeOptions?: DeepMergeOptions): any {
  // Data-last: if first arg looks like options (has arrayStrategy/customMerge)
  if (objectsOrOptions !== undefined && !Array.isArray(objectsOrOptions) &&
      ('arrayStrategy' in objectsOrOptions || 'customMerge' in objectsOrOptions)) {
    return (objects: readonly PlainObject[]) => deepMergeImplementation(objects, objectsOrOptions as DeepMergeOptions)
  }

  // Data-first
  return deepMergeImplementation(objectsOrOptions as readonly PlainObject[] ?? [], maybeOptions)
}

function deepMergeImplementation(objects: readonly PlainObject[], options?: DeepMergeOptions): PlainObject {
  const opts = options ?? {}
  const { arrayStrategy = 'replace', customMerge } = opts

  if (objects.length === 0) return {}
  if (objects.length === 1) return { ...objects[0] }

  function mergeValues(key: string, target: unknown, source: unknown): unknown {
    // Custom merge takes precedence
    if (customMerge !== undefined) {
      return customMerge(key, target, source)
    }

    // Handle arrays
    if (Array.isArray(target) && Array.isArray(source)) {
      switch (arrayStrategy) {
        case 'concat':
          return [...target, ...source]
        case 'merge':
          return source.map((item, index) => {
            if (index < target.length) {
              return mergeTwo(target[index], item)
            }
            return item
          })
        case 'replace':
        default:
          return source
      }
    }

    // Handle plain objects
    if (R.isPlainObject(target) && R.isPlainObject(source)) {
      return mergeTwo(target as PlainObject, source as PlainObject)
    }

    // Default: source overwrites target
    return source
  }

  function mergeTwo(target: PlainObject, source: PlainObject): PlainObject {
    const result = { ...target }

    Object.entries(source).forEach(([key, sourceValue]) => {
      const targetValue = result[key]

      if (targetValue === undefined) {
        result[key] = sourceValue
      } else {
        result[key] = mergeValues(key, targetValue, sourceValue)
      }
    })

    return result
  }

  // Merge all objects sequentially
  return objects.reduce<PlainObject>((acc, obj) => mergeTwo(acc, obj), {})
}

import * as R from 'remeda'
import type { Lens, Path, PathValue } from './types'
import { lens } from './lens'

/**
 * Creates a Lens focusing on a nested property using dot notation.
 *
 * Allows deep access into nested objects using string paths like 'user.address.city'.
 * The lens handles immutable updates at any depth.
 *
 * @param pathStr - Dot-separated path to the nested property
 * @returns A Lens focusing on the value at the specified path
 *
 * @example
 * ```typescript
 * interface User {
 *   name: string
 *   address: {
 *     street: string
 *     city: string
 *     zip: string
 *   }
 * }
 *
 * const cityLens = path<User, string>('address.city')
 *
 * const user = {
 *   name: 'Alice',
 *   address: { street: '123 Main St', city: 'Boston', zip: '02101' }
 * }
 *
 * cityLens.get(user) // 'Boston'
 * cityLens.set('NYC')(user)
 * // => { name: 'Alice', address: { street: '123 Main St', city: 'NYC', zip: '02101' } }
 * ```
 *
 * @example
 * ```typescript
 * // Deeply nested access
 * interface State {
 *   ui: {
 *     modal: {
 *       isOpen: boolean
 *       data: { title: string }
 *     }
 *   }
 * }
 *
 * const modalTitleLens = path<State, string>('ui.modal.data.title')
 * ```
 *
 * @see prop - For single property access
 * @see lens - For custom get/set logic
 */
export function path<S, A = unknown>(pathStr: string): Lens<S, A> {
  const keys = pathStr.split('.')

  return lens(
    (source) => {
      let current: unknown = source
      for (const key of keys) {
        if (current == null) return undefined as A
        // Type-safe property access
        current = R.isPlainObject(current) || Array.isArray(current)
          ? (current as Record<string, unknown>)[key]
          : undefined
      }
      return current as A
    },
    (value) => (source) => {
      if (keys.length === 0) return source
      if (keys.length === 1) {
        const key = keys[0]!
        return { ...source, [key]: value } as S
      }

      // Recursively update nested path using typed helper
      const [head, ...tail] = keys
      const headKey = head!
      const nested = R.isPlainObject(source) || Array.isArray(source)
        ? (source as Record<string, unknown>)[headKey]
        : undefined

      return {
        ...source,
        [headKey]: setNested(nested, tail, value),
      } as S
    }
  )
}

/**
 * Helper to set a value at a nested path immutably.
 * @internal
 */
function setNested(obj: unknown, keys: readonly string[], value: unknown): unknown {
  if (keys.length === 0) return value
  if (keys.length === 1) {
    const key = keys[0]!
    // Handle objects and arrays
    if (R.isPlainObject(obj)) {
      return { ...obj, [key]: value }
    }
    if (Array.isArray(obj)) {
      return { ...obj, [key]: value }
    }
    // If obj is null/undefined, create new object
    return { [key]: value }
  }

  const [head, ...tail] = keys
  const headKey = head!
  const currentValue = R.isPlainObject(obj) || Array.isArray(obj)
    ? (obj as Record<string, unknown>)[headKey]
    : undefined

  if (R.isPlainObject(obj)) {
    return {
      ...obj,
      [headKey]: setNested(currentValue, tail, value),
    }
  }
  if (Array.isArray(obj)) {
    return {
      ...obj,
      [headKey]: setNested(currentValue, tail, value),
    }
  }
  // If obj is null/undefined, create new object
  return {
    [headKey]: setNested(currentValue, tail, value),
  }
}

import * as R from 'remeda'
import type { Lens, Path, PathValue } from '../types'
import { lens } from '../lens'

/**
 * Creates a Lens focusing on a nested property using dot notation.
 *
 * Allows deep access into nested objects using string paths like 'user.address.city'.
 * The lens handles immutable updates at any depth.
 *
 * Paths step through plain objects and arrays, so `items.0.name` reaches into the
 * first item. The path string isn't checked against `S`, and the type `A` is taken
 * on trust.
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
    (value) => (source) => setNested(source, keys, value) as S
  )
}

/**
 * Helper to set a value at a nested path immutably.
 * @internal
 */
function setNested(container: unknown, keys: readonly string[], value: unknown): unknown {
  const [key, ...rest] = keys
  if (key === undefined) return value

  const child = R.isPlainObject(container) || Array.isArray(container)
    ? (container as Record<string, unknown>)[key]
    : undefined

  return withKey(container, key, setNested(child, rest, value))
}

/**
 * Copies a container with one key replaced, keeping an array an array.
 * @internal
 */
function withKey(container: unknown, key: string, value: unknown): unknown {
  if (Array.isArray(container)) return Object.assign([...container], { [key]: value })
  return R.isObjectType(container) ? { ...container, [key]: value } : { [key]: value }
}

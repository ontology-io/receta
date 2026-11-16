import * as R from 'remeda'
import type { Lens, Path, PathValue } from '../types'
import { lens } from '../lens'
import { setOwnKey } from '../../utils/setOwnKey'

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
 * Setting through a part that doesn't exist yet creates it: an array when the next part
 * is an index (`items.0.name` on `{}` gives `{ items: [{ name }] }`), an object otherwise.
 * That is the same value `setPath` and `unflatten` build.
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
  if (Array.isArray(container)) {
    const copy = [...container]
    setOwnKey(copy, key, value)
    return copy
  }

  if (R.isObjectType(container)) {
    return { ...container, [key]: value }
  }

  // Nothing is here yet. An index means the path is stepping into an array.
  if (ARRAY_INDEX.test(key)) {
    const created: unknown[] = []
    setOwnKey(created, key, value)
    return created
  }

  return { [key]: value }
}

// '0', '1', '42': a whole number written the way an array index is, with no leading zero
const ARRAY_INDEX = /^(?:0|[1-9]\d*)$/

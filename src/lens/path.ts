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
      let current: any = source
      for (const key of keys) {
        if (current == null) return undefined as A
        current = current[key]
      }
      return current as A
    },
    (value) => (source) => {
      if (keys.length === 0) return source
      if (keys.length === 1) {
        return { ...source, [keys[0]!]: value } as S
      }

      // Recursively update nested path
      const [head, ...tail] = keys
      const nested = (source as any)[head!]

      return {
        ...source,
        [head!]: setNested(nested, tail, value),
      } as S
    }
  )
}

/**
 * Helper to set a value at a nested path immutably.
 * @internal
 */
function setNested(obj: any, keys: string[], value: any): any {
  if (keys.length === 0) return value
  if (keys.length === 1) {
    return { ...obj, [keys[0]!]: value }
  }

  const [head, ...tail] = keys
  return {
    ...obj,
    [head!]: setNested(obj?.[head!], tail, value),
  }
}

import { type Option, fromNullable } from '../../option'
import type { Cache } from '../types'

/**
 * Creates a WeakMap-based cache for object keys.
 *
 * Advantages:
 * - Entries are garbage collected when keys are no longer referenced
 * - No memory leaks from unreferenced objects
 * - Perfect for caching computations on DOM nodes, objects, etc.
 *
 * Limitations:
 * - Only works with object keys (not primitives)
 * - Cannot iterate entries
 * - No size limit or TTL support
 *
 * @example
 * ```typescript
 * import { memoizeBy, weakCache } from 'receta/memo'
 *
 * interface Node {
 *   id: string
 *   children: Node[]
 * }
 *
 * const processNode = memoizeBy(
 *   (node: Node) => expensiveOperation(node),
 *   (node) => node, // object as key
 *   { cache: weakCache() }
 * )
 *
 * const node = { id: 'root', children: [] }
 * processNode(node) // computed
 * processNode(node) // cached
 * // When 'node' is GC'd, cache entry is automatically removed
 * ```
 */
export function weakCache<K extends object, V>(): Cache<K, V> {
  const weak = new WeakMap<K, V>()

  return {
    get(key: K): Option<V> {
      return fromNullable(weak.get(key))
    },

    set(key: K, value: V): void {
      weak.set(key, value)
    },

    has(key: K): boolean {
      return weak.has(key)
    },

    delete(key: K): boolean {
      return weak.delete(key)
    },

    clear(): void {
      // WeakMap doesn't support clear()
      // This is a no-op since WeakMap entries are GC'd automatically
    },
  }
}

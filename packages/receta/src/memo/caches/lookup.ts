import { type Option, none } from '../../option'
import type { Cache } from '../types'

/**
 * Reads a cache through `has` first, so a custom cache that only expires entries
 * there still works. An entry that disappears before `get` counts as a miss.
 *
 * @internal
 */
export const lookup = <K, V>(cache: Cache<K, V>, key: K): Option<V> =>
  cache.has(key) ? cache.get(key) : none()

import type { Predicate, Mapper } from '../types'
import { instrumentedPurryConfig2 } from '../../utils'

/**
 * Creates a function that conditionally applies a transformation (inverse of when).
 *
 * Returns a function that tests its input against the predicate. If the predicate
 * fails, applies the given function; otherwise returns the input unchanged.
 *
 * This is the inverse of `when` - it applies the transformation when the
 * condition is NOT met.
 *
 * @example
 * ```typescript
 * const ensureArray = unless(
 *   Array.isArray,
 *   (value) => [value]
 * )
 *
 * ensureArray([1, 2, 3])  // => [1, 2, 3]
 * ensureArray(5)          // => [5]
 * ensureArray('hello')    // => ['hello']
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = unless(
 *   (str: string) => str.startsWith('http'),
 *   (str) => `https://${str}`,
 *   'example.com'
 * )
 * // => 'https://example.com'
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe
 * pipe(
 *   getConfig(),
 *   unless(
 *     (config) => 'apiKey' in config,
 *     (config) => ({ ...config, apiKey: process.env.API_KEY })
 *   )
 * )
 * ```
 *
 * @see when - for the normal condition
 */
export function unless<T>(predicate: Predicate<T>, fn: Mapper<T, T>): (value: T) => T
export function unless<T>(predicate: Predicate<T>, fn: Mapper<T, T>, value: T): T
export function unless(...args: unknown[]): unknown {
  return instrumentedPurryConfig2('unless', 'function', unlessImplementation, args)
}

function unlessImplementation<T>(predicate: Predicate<T>, fn: Mapper<T, T>, value: T): T {
  return predicate(value) ? value : fn(value)
}

import { purryConfig } from '../utils'

/**
 * Executes a side effect function and returns the original value unchanged.
 *
 * This is invaluable for debugging pipelines or performing side effects
 * (like logging) without breaking the data flow.
 *
 * @example
 * ```typescript
 * // Debugging a pipeline
 * pipe(
 *   [1, 2, 3, 4, 5],
 *   R.map(x => x * 2),
 *   tap(x => console.log('After doubling:', x)),  // [2, 4, 6, 8, 10]
 *   R.filter(x => x > 5),
 *   tap(x => console.log('After filtering:', x)), // [6, 8, 10]
 *   R.reduce((a, b) => a + b, 0)
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = tap(
 *   (x) => console.log('Value:', x),
 *   42
 * )
 * // Logs: "Value: 42"
 * // => 42
 * ```
 *
 * @example
 * ```typescript
 * // Side effects in a chain
 * const processUser = pipe(
 *   fetchUser(userId),
 *   tap(user => analytics.track('user_fetched', { id: user.id })),
 *   tap(user => logger.info('Processing user', user)),
 *   transformUser,
 *   tap(transformed => cache.set(userId, transformed)),
 *   saveUser
 * )
 * ```
 *
 * @example
 * ```typescript
 * // Conditional logging
 * pipe(
 *   getData(),
 *   tap(data => {
 *     if (process.env.NODE_ENV === 'development') {
 *       console.log('Debug:', data)
 *     }
 *   }),
 *   processData
 * )
 * ```
 */
export function tap<T>(fn: (value: T) => void): (value: T) => T
export function tap<T>(fn: (value: T) => void, value: T): T
export function tap(...args: unknown[]): unknown {
  return purryConfig(tapImplementation, args)
}

function tapImplementation<T>(fn: (value: T) => void, value: T): T {
  fn(value)
  return value
}

import type { CondPair } from '../types'
import { purryConfig2 } from '../../utils'

/**
 * Creates a function that applies the first matching predicate-function pair, with a required default.
 *
 * Similar to `cond`, but returns a value directly (not wrapped in Option) by requiring
 * a default value. This guarantees that a value is always returned, making it useful
 * for exhaustive pattern matching scenarios.
 *
 * The key difference from `cond`:
 * - `cond` returns `Option<U>` (can return None if no match)
 * - `switchCase` returns `U` (always returns a value via default)
 *
 * @example
 * ```typescript
 * // Priority assignment with default
 * const getPriority = switchCase<string, number>(
 *   [
 *     [eq('critical'), () => 1],
 *     [eq('high'), () => 2],
 *     [eq('medium'), () => 3],
 *     [eq('low'), () => 4]
 *   ],
 *   5 // default priority for unknown levels
 * )
 *
 * getPriority('critical')  // => 1
 * getPriority('high')      // => 2
 * getPriority('unknown')   // => 5 (default)
 * ```
 *
 * @example
 * ```typescript
 * import { switchCase } from '@ontologyio/receta/function'
 * import { between, eq, gte } from '@ontologyio/receta/predicate'
 *
 * // HTTP status handling with default error message
 * const getStatusMessage = switchCase<number, string>(
 *   [
 *     [between(200, 299), () => 'Success'],
 *     [between(300, 399), () => 'Redirect'],
 *     [eq(404), () => 'Not Found'],
 *     [between(400, 499), () => 'Client Error'],
 *     [gte(500), () => 'Server Error']
 *   ],
 *   'Unknown Status'
 * )
 *
 * getStatusMessage(200)  // => 'Success'
 * getStatusMessage(404)  // => 'Not Found'
 * getStatusMessage(100)  // => 'Unknown Status'
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = switchCase<string, number>(
 *   [
 *     [eq('small'), () => 10],
 *     [eq('medium'), () => 20],
 *     [eq('large'), () => 30]
 *   ],
 *   15, // default value
 *   'medium'
 * )
 * // => 20
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe
 * pipe(
 *   getUserRole(),
 *   switchCase<Role, Permissions>(
 *     [
 *       [eq('admin'), () => allPermissions],
 *       [eq('editor'), () => editorPermissions],
 *       [eq('viewer'), () => viewPermissions]
 *     ],
 *     noPermissions // default for unknown roles
 *   )
 * )
 * ```
 *
 * @example
 * ```typescript
 * import { switchCase } from '@ontologyio/receta/function'
 * import { eq, oneOf } from '@ontologyio/receta/predicate'
 *
 * // File extension to MIME type mapping
 * const getMimeType = switchCase<string, string>(
 *   [
 *     [oneOf(['jpg', 'jpeg']), () => 'image/jpeg'],
 *     [eq('png'), () => 'image/png'],
 *     [eq('gif'), () => 'image/gif'],
 *     [eq('pdf'), () => 'application/pdf'],
 *     [eq('json'), () => 'application/json']
 *   ],
 *   'application/octet-stream' // default MIME type
 * )
 * ```
 *
 * @returns U - The result of the first matching pair's function, or the default value
 * @see cond - for pattern matching that returns Option<U>
 * @see ifElse - for simple binary conditions
 */
export function switchCase<T, U>(
  pairs: readonly CondPair<T, U>[],
  defaultValue: U
): (value: T) => U
export function switchCase<T, U>(
  pairs: readonly CondPair<T, U>[],
  defaultValue: U,
  value: T
): U
export function switchCase(...args: unknown[]): unknown {
  return purryConfig2(switchCaseImplementation, args)
}

function switchCaseImplementation<T, U>(
  pairs: readonly CondPair<T, U>[],
  defaultValue: U,
  value: T
): U {
  for (const [predicate, fn] of pairs) {
    if (predicate(value)) {
      return fn(value)
    }
  }
  return defaultValue
}

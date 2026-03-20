import type { CondPair } from '../types'
import { instrumentedPurryConfig2 } from '../../utils'

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
 *     [(s) => s === 'critical', () => 1],
 *     [(s) => s === 'high', () => 2],
 *     [(s) => s === 'medium', () => 3],
 *     [(s) => s === 'low', () => 4]
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
 * // HTTP status handling with default error message
 * const getStatusMessage = switchCase<number, string>(
 *   [
 *     [(s) => s >= 200 && s < 300, () => 'Success'],
 *     [(s) => s >= 300 && s < 400, () => 'Redirect'],
 *     [(s) => s === 404, () => 'Not Found'],
 *     [(s) => s >= 400 && s < 500, () => 'Client Error'],
 *     [(s) => s >= 500, () => 'Server Error']
 *   ],
 *   'Unknown Status'
 * )
 *
 * getStatusMessage(200)  // => 'Success'
 * getStatusMessage(404)  // => 'Not Found'
 * getStatusMessage(999)  // => 'Unknown Status'
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = switchCase<string, number>(
 *   [
 *     [(s) => s === 'small', () => 10],
 *     [(s) => s === 'medium', () => 20],
 *     [(s) => s === 'large', () => 30]
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
 *       [(r) => r === 'admin', () => allPermissions],
 *       [(r) => r === 'editor', () => editorPermissions],
 *       [(r) => r === 'viewer', () => viewPermissions]
 *     ],
 *     noPermissions // default for unknown roles
 *   )
 * )
 * ```
 *
 * @example
 * ```typescript
 * // File extension to MIME type mapping
 * const getMimeType = switchCase<string, string>(
 *   [
 *     [(ext) => ext === 'jpg' || ext === 'jpeg', () => 'image/jpeg'],
 *     [(ext) => ext === 'png', () => 'image/png'],
 *     [(ext) => ext === 'gif', () => 'image/gif'],
 *     [(ext) => ext === 'pdf', () => 'application/pdf'],
 *     [(ext) => ext === 'json', () => 'application/json']
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
  return instrumentedPurryConfig2('switchCase', 'function', switchCaseImplementation, args)
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

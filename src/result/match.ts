import * as R from 'remeda'
import type { Result } from './types'
import { isOk } from './guards'

/**
 * Pattern matches on a Result, providing handlers for both cases.
 *
 * This is a more functional alternative to if/else or switch statements.
 * Both handlers must return the same type.
 *
 * @param result - The Result to match on
 * @param handlers - Object with onOk and onErr handlers
 * @returns The result of calling the appropriate handler
 *
 * @example
 * ```typescript
 * // Data-first
 * match(
 *   parseNumber('42'),
 *   {
 *     onOk: n => `Success: ${n}`,
 *     onErr: e => `Error: ${e}`
 *   }
 * ) // => 'Success: 42'
 *
 * // Data-last (in pipe)
 * pipe(
 *   fetchUser(id),
 *   match({
 *     onOk: user => renderUser(user),
 *     onErr: error => renderError(error)
 *   })
 * )
 *
 * // With different handler types
 * const getStatus = match({
 *   onOk: () => 'success' as const,
 *   onErr: () => 'error' as const
 * })
 * ```
 */
export function match<T, E, U>(
  result: Result<T, E>,
  handlers: {
    readonly onOk: (value: T) => U
    readonly onErr: (error: E) => U
  }
): U
export function match<T, E, U>(handlers: {
  readonly onOk: (value: T) => U
  readonly onErr: (error: E) => U
}): (result: Result<T, E>) => U
export function match(...args: unknown[]): unknown {
  return R.purry(matchImplementation, args)
}

function matchImplementation<T, E, U>(
  result: Result<T, E>,
  handlers: {
    readonly onOk: (value: T) => U
    readonly onErr: (error: E) => U
  }
): U {
  return isOk(result) ? handlers.onOk(result.value) : handlers.onErr(result.error)
}

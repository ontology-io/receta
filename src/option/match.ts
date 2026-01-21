import * as R from 'remeda'
import type { Option } from './types'
import { isSome } from './guards'

/**
 * Pattern matching for Options.
 *
 * Provides a clean way to handle both Some and None cases.
 *
 * @param option - The Option to match on
 * @param patterns - Object with onSome and onNone handlers
 * @returns The result of the matched handler
 *
 * @example
 * ```typescript
 * // Data-first
 * const message = match(findUser(id), {
 *   onSome: user => `Hello, ${user.name}`,
 *   onNone: () => 'User not found'
 * })
 *
 * // Data-last (in pipe)
 * pipe(
 *   config.get('theme'),
 *   match({
 *     onSome: theme => applyTheme(theme),
 *     onNone: () => applyDefaultTheme()
 *   })
 * )
 *
 * // With different return types
 * const status = match(maybeUser, {
 *   onSome: () => 200,
 *   onNone: () => 404
 * })
 * ```
 *
 * @see unwrapOr - for simple default values
 * @see unwrapOrElse - for computed defaults
 */
export function match<T, R>(
  option: Option<T>,
  patterns: {
    onSome: (value: T) => R
    onNone: () => R
  }
): R
export function match<T, R>(patterns: {
  onSome: (value: T) => R
  onNone: () => R
}): (option: Option<T>) => R
export function match(...args: unknown[]): unknown {
  return R.purry(matchImplementation, args)
}

function matchImplementation<T, R>(
  option: Option<T>,
  patterns: {
    onSome: (value: T) => R
    onNone: () => R
  }
): R {
  return isSome(option) ? patterns.onSome(option.value) : patterns.onNone()
}

import type { Option, Some, None } from './types'

/**
 * Type guard to check if an Option is Some.
 *
 * Narrows the type to Some<T>.
 *
 * @param option - The Option to check
 * @returns True if the Option is Some
 *
 * @example
 * ```typescript
 * const opt = some(42)
 *
 * if (isSome(opt)) {
 *   console.log(opt.value) // TypeScript knows this is safe
 * }
 * ```
 */
export function isSome<T>(option: Option<T>): option is Some<T> {
  return option._tag === 'Some'
}

/**
 * Type guard to check if an Option is None.
 *
 * Narrows the type to None.
 *
 * @param option - The Option to check
 * @returns True if the Option is None
 *
 * @example
 * ```typescript
 * const opt = none()
 *
 * if (isNone(opt)) {
 *   console.log('No value present')
 * }
 * ```
 */
export function isNone<T>(option: Option<T>): option is None {
  return option._tag === 'None'
}

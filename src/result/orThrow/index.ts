import type { Result } from '../types'
import { isOk } from '../guards'

/**
 * Type helper to extract Promise<Result<T, E>> → Promise<T>
 */
type UnwrapAsyncResult<T> = T extends Promise<Result<infer U, any>> ? Promise<U> : never

/**
 * Type helper to convert Result-returning function to throwing version
 */
type OrThrowVersion<F extends (...args: any[]) => Promise<Result<any, any>>> =
  F extends (...args: infer Args) => Promise<Result<infer T, any>>
    ? (...args: Args) => Promise<T>
    : never

/**
 * Converts a Result-returning async function into a throwing variant.
 *
 * This is a higher-order function that wraps any async function returning
 * `Promise<Result<T, E>>` to instead return `Promise<T>` and throw on errors.
 *
 * Use this to create `*OrThrow` variants without duplicating logic.
 *
 * @param fn - Async function that returns Promise<Result<T, E>>
 * @returns Async function that returns Promise<T> and throws on Err
 *
 * @example
 * ```typescript
 * import { mapAsync } from 'receta/async'
 * import { orThrow } from 'receta/result'
 *
 * // Create throwing variant
 * const mapAsyncOrThrow = orThrow(mapAsync)
 *
 * // Use it
 * try {
 *   const results = await mapAsyncOrThrow(
 *     urls,
 *     async (url) => fetch(url),
 *     { concurrency: 5 }
 *   )
 *   console.log(results)
 * } catch (error) {
 *   console.error('Failed:', error)
 * }
 *
 * // Works with curried functions too
 * const fetchAllOrThrow = orThrow(
 *   mapAsync(async (url: string) => fetch(url))
 * )
 * const results = await fetchAllOrThrow(urls)
 * ```
 *
 * @see unwrap - for throwing extraction from a single Result
 */
export function orThrow<F extends (...args: any[]) => Promise<Result<any, any>>>(
  fn: F
): OrThrowVersion<F> {
  return (async (...args: any[]) => {
    const result = await fn(...args)
    if (isOk(result)) {
      return result.value
    }
    throw result.error
  }) as OrThrowVersion<F>
}

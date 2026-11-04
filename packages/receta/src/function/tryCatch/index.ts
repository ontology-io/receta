import * as R from 'remeda'
import { tryCatch as resultTryCatch } from '../../result/constructors'
import type { Result } from '../../result/types'

/**
 * Wraps a function to safely execute it and return a Result.
 *
 * This is a convenience wrapper around `Result.tryCatch` that creates a
 * function you can reuse, rather than wrapping a single execution.
 *
 * **Note**: This wraps the Result module's `tryCatch`. For one-off executions,
 * use `Result.tryCatch` directly.
 *
 * It only catches synchronous throws. An async function comes back as an `Ok`
 * holding its promise, and a rejection isn't caught. Use `tryCatchAsync` from
 * the Result module for async code.
 *
 * @example
 * ```typescript
 * const parseJSON = tryCatch(
 *   (str: string) => JSON.parse(str),
 *   () => 'Invalid JSON'
 * )
 *
 * parseJSON('{"valid": "json"}')  // => Ok({ valid: 'json' })
 * parseJSON('invalid json')       // => Err('Invalid JSON')
 * ```
 *
 * @example
 * ```typescript
 * // Creating safe versions of throwing functions
 * const safeDivide = tryCatch(
 *   (a: number, b: number) => {
 *     if (b === 0) throw new Error('Division by zero')
 *     return a / b
 *   }
 * )
 *
 * safeDivide(10, 2)  // => Ok(5)
 * safeDivide(10, 0)  // => Err(Error('Division by zero'))
 * ```
 *
 * @example
 * ```typescript
 * import { flatMap, map } from '@ontologyio/receta/result'
 *
 * // In a pipe with Result operations
 * pipe(
 *   getUserInput(),
 *   tryCatch((input: string) => JSON.parse(input)),
 *   map(data => data.userId),
 *   flatMap(fetchUser)
 * )
 * ```
 *
 * @see Result.tryCatch - For one-off safe execution
 */
export function tryCatch<Args extends readonly any[], T, E = unknown>(
  fn: (...args: Args) => T,
  onError?: (error: unknown) => E
): (...args: Args) => Result<T, E> {
  return function wrappedFunction(...args: Args): Result<T, E> {
    if (onError) {
      return resultTryCatch(() => fn(...args), onError)
    }
    return resultTryCatch(() => fn(...args)) as Result<T, E>
  }
}

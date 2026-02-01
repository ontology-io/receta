import * as R from 'remeda'
import { ok, err, type Result } from '../../result'

/**
 * Typed wrapper around Promise.allSettled with better type inference.
 *
 * Unlike Promise.all (which fails fast on first rejection), this waits for
 * all promises to settle (fulfill or reject) before returning results.
 * Provides helper functions to extract fulfilled/rejected values.
 *
 * @param promises - Array of promises to settle
 * @returns Promise resolving to array of settled results
 *
 * @example
 * ```typescript
 * // Basic usage
 * const results = await promiseAllSettled([
 *   fetch('/api/users/1'),
 *   fetch('/api/users/2'),
 *   fetch('/api/users/999'), // might fail
 * ])
 *
 * results.forEach((result) => {
 *   if (result.status === 'fulfilled') {
 *     console.log('Success:', result.value)
 *   } else {
 *     console.log('Error:', result.reason)
 *   }
 * })
 * ```
 *
 * @example
 * ```typescript
 * // Extract only successful results
 * const results = await promiseAllSettled([
 *   fetchUser(1),
 *   fetchUser(2),
 *   fetchUser(999), // fails
 * ])
 *
 * const users = extractFulfilled(results)
 * // => [User1, User2] (failed one excluded)
 * ```
 *
 * @example
 * ```typescript
 * // Convert to Result pattern for composability
 * import * as R from 'remeda'
 * import { map, unwrapOr } from 'receta/result'
 *
 * const results = await promiseAllSettled([
 *   fetchUser(1),
 *   fetchUser(2),
 *   fetchUser(3),
 * ])
 *
 * const resultArray = toResults(results)
 * const usernames = R.pipe(
 *   resultArray,
 *   R.map((r) => map(r, (user) => user.name)),
 *   R.map((r) => unwrapOr(r, 'Unknown'))
 * )
 * // => ['John', 'Jane', 'Unknown']
 * ```
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/allSettled
 */
export async function promiseAllSettled<T>(
  promises: readonly Promise<T>[]
): Promise<PromiseSettledResult<T>[]> {
  return Promise.allSettled(promises)
}

/**
 * Extracts all fulfilled values from settled results.
 *
 * Filters out rejected promises and returns only successful values.
 * Useful when you want to process partial results even if some promises failed.
 *
 * @param results - Array of settled promise results
 * @returns Array of fulfilled values only
 *
 * @example
 * ```typescript
 * const results = await promiseAllSettled([
 *   Promise.resolve(1),
 *   Promise.reject('error'),
 *   Promise.resolve(3),
 * ])
 *
 * const values = extractFulfilled(results)
 * // => [1, 3]
 * ```
 *
 * @example
 * ```typescript
 * // Process partial API results
 * const results = await promiseAllSettled(
 *   userIds.map((id) => fetchUser(id))
 * )
 *
 * const successfulUsers = extractFulfilled(results)
 * console.log(`Fetched ${successfulUsers.length} of ${userIds.length} users`)
 * ```
 */
export function extractFulfilled<T>(
  results: readonly PromiseSettledResult<T>[]
): T[] {
  return R.pipe(
  results,
  R.filter((r): r is PromiseFulfilledResult<T> => r.status === 'fulfilled'),
  R.map((r) => r.value)
)
}

/**
 * Extracts all rejection reasons from settled results.
 *
 * Filters out fulfilled promises and returns only error reasons.
 * Useful for logging or analyzing failures.
 *
 * @param results - Array of settled promise results
 * @returns Array of rejection reasons only
 *
 * @example
 * ```typescript
 * const results = await promiseAllSettled([
 *   Promise.resolve(1),
 *   Promise.reject(new Error('Network error')),
 *   Promise.reject(new Error('Timeout')),
 * ])
 *
 * const errors = extractRejected(results)
 * // => [Error('Network error'), Error('Timeout')]
 *
 * errors.forEach((err) => console.error('Failed:', err.message))
 * ```
 *
 * @example
 * ```typescript
 * // Track failed operations
 * const results = await promiseAllSettled(
 *   userIds.map((id) => deleteUser(id))
 * )
 *
 * const failures = extractRejected(results)
 * if (failures.length > 0) {
 *   console.warn(`${failures.length} deletions failed:`, failures)
 * }
 * ```
 */
export function extractRejected<T = unknown>(
  results: readonly PromiseSettledResult<any>[]
): T[] {
  return R.pipe(
  results,
  R.filter((r): r is PromiseRejectedResult => r.status === 'rejected'),
  R.map((r) => r.reason as T)
)
}

/**
 * Converts settled results to Result array for composability.
 *
 * Transforms native PromiseSettledResult into Receta's Result type,
 * enabling composition with Result utilities (map, flatMap, etc.).
 *
 * @param results - Array of settled promise results
 * @returns Array of Result values
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { map, unwrapOr } from 'receta/result'
 *
 * const results = await promiseAllSettled([
 *   fetchUser(1),
 *   fetchUser(999), // fails
 * ])
 *
 * const userResults = toResults(results)
 * const names = R.pipe(
 *   userResults,
 *   R.map((r) => map(r, (user) => user.name)),
 *   R.map((r) => unwrapOr(r, 'Unknown'))
 * )
 * // => ['John', 'Unknown']
 * ```
 *
 * @example
 * ```typescript
 * import { partition } from 'receta/result'
 *
 * const results = await promiseAllSettled([
 *   fetchUser(1),
 *   fetchUser(2),
 *   fetchUser(999),
 * ])
 *
 * const [successes, failures] = partition(toResults(results))
 * console.log(`${successes.length} succeeded, ${failures.length} failed`)
 * ```
 *
 * @example
 * ```typescript
 * // Compose with validation
 * import { flatMap } from 'receta/result'
 * import { validate } from 'receta/validation'
 *
 * const results = await promiseAllSettled(
 *   urls.map((url) => fetch(url).then(r => r.json()))
 * )
 *
 * const validated = R.pipe(
 *   toResults(results),
 *   R.map((r) => flatMap(r, (data) => validateSchema(userSchema, data)))
 * )
 * ```
 */
export function toResults<T, E = unknown>(
  results: readonly PromiseSettledResult<T>[]
): Array<Result<T, E>> {
  return results.map((result) =>
    result.status === 'fulfilled'
      ? ok(result.value)
      : err(result.reason as E)
  )
}

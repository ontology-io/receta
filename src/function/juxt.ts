import * as R from 'remeda'
import type { ReturnTypes } from './types'

/**
 * Creates a function that applies multiple functions to the same input and returns all results as an array.
 *
 * The `juxt` combinator (short for "juxtaposition") applies each function to the input value
 * and collects all results in an array, preserving the order.
 *
 * This is useful when you need to apply multiple transformations to the same value
 * and keep all the results.
 *
 * @example
 * ```typescript
 * const analyze = juxt([
 *   (nums: number[]) => nums.length,
 *   (nums: number[]) => Math.min(...nums),
 *   (nums: number[]) => Math.max(...nums),
 *   (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length
 * ])
 *
 * analyze([1, 2, 3, 4, 5])
 * // => [5, 1, 5, 3]
 * //    [length, min, max, average]
 * ```
 *
 * @example
 * ```typescript
 * // Extract multiple fields from an object
 * interface User { id: string; name: string; email: string; role: string }
 *
 * const getUserSummary = juxt([
 *   (user: User) => user.id,
 *   (user: User) => user.name,
 *   (user: User) => user.role
 * ])
 *
 * getUserSummary({ id: '1', name: 'Alice', email: 'alice@example.com', role: 'admin' })
 * // => ['1', 'Alice', 'admin']
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = juxt([
 *   (s: string) => s.toUpperCase(),
 *   (s: string) => s.toLowerCase(),
 *   (s: string) => s.length
 * ], 'Hello')
 * // => ['HELLO', 'hello', 5]
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe
 * pipe(
 *   getUserInput(),
 *   juxt([
 *     (input) => input.trim(),
 *     (input) => input.length,
 *     (input) => input.split(' ').length
 *   ])
 * )
 * // => [trimmedInput, totalLength, wordCount]
 * ```
 */
export function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns
): (...args: Parameters<Fns[0]>) => ReturnTypes<Fns>
export function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns,
  ...args: Parameters<Fns[0]>
): ReturnTypes<Fns>
export function juxt<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns,
  ...args: any[]
): ReturnTypes<Fns> | ((...args: Parameters<Fns[0]>) => ReturnTypes<Fns>) {
  return args.length === 0
    ? (...inputArgs: Parameters<Fns[0]>) => juxtImplementation(fns, ...inputArgs)
    : juxtImplementation(fns, ...args)
}

function juxtImplementation<Fns extends readonly ((...args: any[]) => any)[]>(
  fns: Fns,
  ...args: any[]
): ReturnTypes<Fns> {
  return R.map(fns, (fn) => fn(...args)) as ReturnTypes<Fns>
}

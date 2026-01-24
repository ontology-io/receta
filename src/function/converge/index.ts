import * as R from 'remeda'
import type { FunctionTuple } from '../types'
import { purryConfig2 } from '../../utils'

/**
 * Creates a function that applies multiple functions to the same input, then combines their results.
 *
 * The `converge` combinator applies each function in the array to the input value,
 * collecting the results, then passes all results to the `after` function.
 *
 * This is useful when you need to derive multiple values from a single input
 * and combine them in some way.
 *
 * @example
 * ```typescript
 * // Calculate average by dividing sum by length
 * const average = converge(
 *   (sum: number, length: number) => sum / length,
 *   [
 *     (nums: number[]) => nums.reduce((a, b) => a + b, 0),  // sum
 *     (nums: number[]) => nums.length                        // length
 *   ]
 * )
 *
 * average([1, 2, 3, 4, 5])  // => 3
 * ```
 *
 * @example
 * ```typescript
 * // Build an object from different transformations
 * interface User { name: string; email: string }
 * interface Profile { displayName: string; username: string; domain: string }
 *
 * const buildProfile = converge(
 *   (name: string, username: string, domain: string): Profile => ({
 *     displayName: name,
 *     username,
 *     domain
 *   }),
 *   [
 *     (user: User) => user.name,
 *     (user: User) => user.email.split('@')[0],
 *     (user: User) => user.email.split('@')[1]
 *   ]
 * )
 *
 * buildProfile({ name: 'Alice', email: 'alice@example.com' })
 * // => { displayName: 'Alice', username: 'alice', domain: 'example.com' }
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = converge(
 *   (min: number, max: number) => max - min,
 *   [
 *     (nums: number[]) => Math.min(...nums),
 *     (nums: number[]) => Math.max(...nums)
 *   ],
 *   [1, 5, 3, 9, 2]
 * )
 * // => 8 (range from 1 to 9)
 * ```
 */
export function converge<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>
): (value: T) => R
export function converge<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>,
  value: T
): R
export function converge(...args: unknown[]): unknown {
  return purryConfig2(convergeImplementation, args)
}

function convergeImplementation<T, Args extends readonly unknown[], R>(
  after: (...args: Args) => R,
  fns: FunctionTuple<T, Args>,
  value: T
): R {
  const results = R.map(fns, (fn) => fn(value)) as unknown as Args
  return after(...results)
}

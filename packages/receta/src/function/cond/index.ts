import type { Option } from '../../option/types'
import { some, none } from '../../option/constructors'
import type { CondPair } from '../types'
import { instrumentedPurryConfig } from '../../utils'

/**
 * Creates a function that applies the first matching predicate-function pair.
 *
 * Returns a function that tests its input against each predicate in order,
 * applying the corresponding function when a match is found. Returns None
 * if no predicates match.
 *
 * This is like a functional switch statement or if-else chain, useful for
 * multi-way conditional logic with clean, declarative syntax.
 *
 * @example
 * ```typescript
 * const classifyNumber = cond<number, string>([
 *   [(n) => n < 0, (n) => 'negative'],
 *   [(n) => n === 0, () => 'zero'],
 *   [(n) => n > 0 && n < 10, (n) => 'small positive'],
 *   [(n) => n >= 10, (n) => 'large positive']
 * ])
 *
 * classifyNumber(-5)   // => Some('negative')
 * classifyNumber(0)    // => Some('zero')
 * classifyNumber(3)    // => Some('small positive')
 * classifyNumber(100)  // => Some('large positive')
 * ```
 *
 * @example
 * ```typescript
 * // HTTP status code handling
 * const handleStatus = cond<number, string>([
 *   [(s) => s >= 200 && s < 300, () => 'success'],
 *   [(s) => s >= 300 && s < 400, () => 'redirect'],
 *   [(s) => s >= 400 && s < 500, () => 'client error'],
 *   [(s) => s >= 500, () => 'server error']
 * ])
 *
 * handleStatus(200)  // => Some('success')
 * handleStatus(404)  // => Some('client error')
 * handleStatus(500)  // => Some('server error')
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = cond<string, number>([
 *   [(s) => s === 'low', () => 1],
 *   [(s) => s === 'medium', () => 5],
 *   [(s) => s === 'high', () => 10]
 * ], 'medium')
 * // => Some(5)
 * ```
 *
 * @returns Option<U> - Some with result if a predicate matched, None otherwise
 */
export function cond<T, U>(pairs: readonly CondPair<T, U>[]): (value: T) => Option<U>
export function cond<T, U>(pairs: readonly CondPair<T, U>[], value: T): Option<U>
export function cond(...args: unknown[]): unknown {
  return instrumentedPurryConfig('cond', 'function', condImplementation, args)
}

function condImplementation<T, U>(pairs: readonly CondPair<T, U>[], value: T): Option<U> {
  for (const [predicate, fn] of pairs) {
    if (predicate(value)) {
      return some(fn(value))
    }
  }
  return none as unknown as Option<U>
}

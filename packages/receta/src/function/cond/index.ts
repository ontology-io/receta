import type { Option } from '../../option/types'
import { some, none } from '../../option/constructors'
import type { CondPair } from '../types'
import { purryConfig } from '../../utils'

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
 *   [lt(0), (n) => 'negative'],
 *   [eq(0), () => 'zero'],
 *   [and(gt(0), lt(10)), (n) => 'small positive'],
 *   [gte(10), (n) => 'large positive']
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
 * import { cond } from '@ontologyio/receta/function'
 * import { between, gte } from '@ontologyio/receta/predicate'
 *
 * // HTTP status code handling
 * const handleStatus = cond<number, string>([
 *   [between(200, 299), () => 'success'],
 *   [between(300, 399), () => 'redirect'],
 *   [between(400, 499), () => 'client error'],
 *   [gte(500), () => 'server error']
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
 *   [eq('low'), () => 1],
 *   [eq('medium'), () => 5],
 *   [eq('high'), () => 10]
 * ], 'medium')
 * // => Some(5)
 * ```
 *
 * @returns Option<U> - Some with result if a predicate matched, None otherwise
 */
export function cond<T, U>(pairs: readonly CondPair<T, U>[]): (value: T) => Option<U>
export function cond<T, U>(pairs: readonly CondPair<T, U>[], value: T): Option<U>
export function cond(...args: unknown[]): unknown {
  return purryConfig(condImplementation, args)
}

function condImplementation<T, U>(pairs: readonly CondPair<T, U>[], value: T): Option<U> {
  for (const [predicate, fn] of pairs) {
    if (predicate(value)) {
      return some(fn(value))
    }
  }
  return none as unknown as Option<U>
}

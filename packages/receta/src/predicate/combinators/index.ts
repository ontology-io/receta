/**
 * Predicate combinators for building complex predicates from simple ones.
 *
 * @module predicate/combinators
 */

import type { Predicate } from '../types'

/**
 * Combines multiple predicates with logical AND.
 *
 * Returns a predicate that is true only if all predicates return true.
 * Short-circuits on the first false result.
 *
 * @param predicates - The predicates to combine
 * @returns A predicate that returns true if all predicates return true
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { gt, lt, and } from 'receta/predicate'
 *
 * // Combine comparisons
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, and(gt(5), lt(15))) // => [10]
 *
 * // Multiple conditions
 * const users = [
 *   { age: 25, active: true, verified: true },
 *   { age: 30, active: false, verified: true },
 *   { age: 35, active: true, verified: false }
 * ]
 * R.filter(
 *   users,
 *   and(
 *     (u) => u.age >= 25,
 *     (u) => u.active,
 *     (u) => u.verified
 *   )
 * ) // => [{ age: 25, active: true, verified: true }]
 * ```
 *
 * @see or - for logical OR
 * @see not - for logical NOT
 */
export const and =
  <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value) =>
    predicates.every((p) => p(value))

/**
 * Combines multiple predicates with logical OR.
 *
 * Returns a predicate that is true if any predicate returns true.
 * Short-circuits on the first true result.
 *
 * @param predicates - The predicates to combine
 * @returns A predicate that returns true if any predicate returns true
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { eq, or } from 'receta/predicate'
 *
 * // Match multiple values
 * const numbers = [1, 2, 3, 4, 5]
 * R.filter(numbers, or(eq(1), eq(3), eq(5))) // => [1, 3, 5]
 *
 * // Real-world: Filter by multiple statuses
 * const orders = [
 *   { id: 1, status: 'pending' },
 *   { id: 2, status: 'shipped' },
 *   { id: 3, status: 'delivered' },
 *   { id: 4, status: 'cancelled' }
 * ]
 * R.filter(
 *   orders,
 *   (o) => or(
 *     eq('pending'),
 *     eq('shipped')
 *   )(o.status)
 * ) // => pending and shipped orders
 * ```
 *
 * @see and - for logical AND
 * @see not - for logical NOT
 * @see oneOf - for checking against a list of values
 */
export const or =
  <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value) =>
    predicates.some((p) => p(value))

/**
 * Negates a predicate.
 *
 * Returns a predicate that returns the opposite boolean value.
 *
 * @param predicate - The predicate to negate
 * @returns A predicate that returns the opposite of the input predicate
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { eq, not, isEmpty } from 'receta/predicate'
 *
 * const numbers = [1, 2, 3, 2, 1]
 * R.filter(numbers, not(eq(2))) // => [1, 3, 1]
 *
 * // Real-world: Filter non-empty strings
 * const names = ['Alice', '', 'Bob', '', 'Charlie']
 * R.filter(names, not(isEmpty)) // => ['Alice', 'Bob', 'Charlie']
 *
 * // Complex negation
 * const users = [
 *   { name: 'Alice', admin: true },
 *   { name: 'Bob', admin: false },
 *   { name: 'Charlie', admin: false }
 * ]
 * R.filter(users, not((u) => u.admin)) // => non-admin users
 * ```
 *
 * @see and - for logical AND
 * @see or - for logical OR
 */
export const not =
  <T>(predicate: Predicate<T>): Predicate<T> =>
  (value) =>
    !predicate(value)

/**
 * Combines multiple predicates with logical XOR (exclusive or).
 *
 * Returns a predicate that is true if exactly one predicate returns true.
 *
 * @param predicates - The predicates to combine (must have at least 2)
 * @returns A predicate that returns true if exactly one predicate returns true
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { gt, lt, xor } from 'receta/predicate'
 *
 * const numbers = [1, 5, 10, 15, 20]
 * // Keep numbers that are either < 8 OR > 12, but not both
 * R.filter(numbers, xor(lt(8), gt(12))) // => [1, 5, 15, 20]
 * // 10 is excluded because it's neither < 8 nor > 12
 *
 * // Real-world: Exclusive features (must have one but not both)
 * const products = [
 *   { id: 1, premium: true, trial: false },  // valid
 *   { id: 2, premium: false, trial: true },  // valid
 *   { id: 3, premium: true, trial: true },   // invalid (both)
 *   { id: 4, premium: false, trial: false }  // invalid (neither)
 * ]
 * R.filter(
 *   products,
 *   xor((p) => p.premium, (p) => p.trial)
 * ) // => products 1 and 2
 * ```
 *
 * @see or - for inclusive OR
 * @see and - for logical AND
 */
export const xor =
  <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value) => {
    let trueCount = 0
    for (const p of predicates) {
      if (p(value)) {
        trueCount++
        if (trueCount > 1) return false
      }
    }
    return trueCount === 1
  }

/**
 * Creates a predicate that always returns true.
 *
 * Useful as a default or fallback predicate.
 *
 * @returns A predicate that always returns true
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { always } from 'receta/predicate'
 *
 * // Keep all items
 * R.filter([1, 2, 3], always()) // => [1, 2, 3]
 *
 * // Real-world: Default case in conditional filtering
 * const shouldFilter = Math.random() > 0.5
 * const predicate = shouldFilter ? (n: number) => n > 5 : always<number>()
 * R.filter([1, 5, 10], predicate)
 * ```
 *
 * @see never - for a predicate that always returns false
 */
export const always = <T>(): Predicate<T> => () => true

/**
 * Creates a predicate that always returns false.
 *
 * Useful as a default or fallback predicate for filtering out all items.
 *
 * @returns A predicate that always returns false
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { never } from 'receta/predicate'
 *
 * // Filter out all items
 * R.filter([1, 2, 3], never()) // => []
 *
 * // Real-world: Disable filtering temporarily
 * const isDebugMode = process.env.DEBUG === 'true'
 * const predicate = isDebugMode ? never<Log>() : (log) => log.level === 'error'
 * ```
 *
 * @see always - for a predicate that always returns true
 */
export const never = <T>(): Predicate<T> => () => false

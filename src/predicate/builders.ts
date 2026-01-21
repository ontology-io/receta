/**
 * Higher-level predicate builders for common patterns.
 *
 * @module predicate/builders
 */

import type { Predicate, PredicateSchema } from './types'
import { and } from './combinators'
import { eq } from './comparison'

/**
 * Creates a predicate that tests object properties against a schema.
 *
 * Each key in the schema maps to a predicate that tests the corresponding property.
 * All predicates must pass for the overall predicate to return true.
 *
 * @param schema - A map of property names to predicates
 * @returns A predicate that tests if all schema predicates pass
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { where, gt, eq } from 'receta/predicate'
 *
 * interface User {
 *   age: number
 *   name: string
 *   active: boolean
 * }
 *
 * const users: User[] = [
 *   { age: 25, name: 'Alice', active: true },
 *   { age: 17, name: 'Bob', active: true },
 *   { age: 30, name: 'Charlie', active: false }
 * ]
 *
 * // Filter with multiple conditions
 * R.filter(users, where({
 *   age: gt(18),
 *   active: Boolean  // shorthand for (v) => v === true
 * }))
 * // => [{ age: 25, name: 'Alice', active: true }]
 *
 * // Real-world: Database-like queries
 * const products = [
 *   { price: 10, category: 'electronics', inStock: true },
 *   { price: 50, category: 'electronics', inStock: false },
 *   { price: 15, category: 'books', inStock: true }
 * ]
 * R.filter(products, where({
 *   category: eq('electronics'),
 *   inStock: Boolean,
 *   price: (p) => p < 30
 * }))
 * // => [{ price: 10, category: 'electronics', inStock: true }]
 * ```
 *
 * @see oneOf - for checking if value is in a list
 * @see prop - for testing a single property
 */
export const where = <T extends Record<string, unknown>>(
  schema: PredicateSchema<T>
): Predicate<T> => {
  const predicates: Predicate<T>[] = Object.entries(schema).map(
    ([key, predicate]) => (obj: T) => {
      if (!predicate) return true
      return predicate(obj[key as keyof T])
    }
  )
  return and(...predicates)
}

/**
 * Creates a predicate that tests if a value is in a list.
 *
 * Uses strict equality (===) for comparison.
 *
 * @param values - The list of values to check against
 * @returns A predicate that returns true if value is in the list
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { oneOf } from 'receta/predicate'
 *
 * const numbers = [1, 2, 3, 4, 5]
 * R.filter(numbers, oneOf([1, 3, 5])) // => [1, 3, 5]
 *
 * // Real-world: Filter by allowed statuses
 * const orders = [
 *   { id: 1, status: 'pending' },
 *   { id: 2, status: 'shipped' },
 *   { id: 3, status: 'cancelled' },
 *   { id: 4, status: 'delivered' }
 * ]
 * R.filter(
 *   orders,
 *   (o) => oneOf(['pending', 'shipped'])(o.status)
 * ) // => pending and shipped orders
 *
 * // More concise with prop
 * import { prop } from 'receta/predicate'
 * R.filter(orders, prop('status', oneOf(['pending', 'shipped'])))
 * ```
 *
 * @see eq - for single value comparison
 * @see or - for combining multiple predicates
 */
export const oneOf =
  <T>(values: readonly T[]): Predicate<T> =>
  (value) =>
    values.includes(value)

/**
 * Creates a predicate that tests a specific property of an object.
 *
 * @param key - The property key to test
 * @param predicate - The predicate to apply to the property value
 * @returns A predicate that tests the specified property
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { prop, gt, oneOf } from 'receta/predicate'
 *
 * const users = [
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob', age: 17 },
 *   { name: 'Charlie', age: 30 }
 * ]
 *
 * // Test single property
 * R.filter(users, prop('age', gt(18))) // => Alice and Charlie
 *
 * // Combine with other predicates
 * R.filter(users, prop('name', oneOf(['Alice', 'Bob'])))
 * // => Alice and Bob
 *
 * // Real-world: Nested property access
 * const orders = [
 *   { id: 1, user: { country: 'US' } },
 *   { id: 2, user: { country: 'UK' } },
 *   { id: 3, user: { country: 'US' } }
 * ]
 * // Using pipe for nested access
 * R.filter(orders, (o) => prop('country', eq('US'))(o.user))
 * // => US orders
 * ```
 *
 * @see where - for testing multiple properties
 * @see oneOf - for checking against multiple values
 */
export const prop =
  <T, K extends keyof T>(key: K, predicate: Predicate<T[K]>): Predicate<T> =>
  (obj) =>
    predicate(obj[key])

/**
 * Creates a predicate that tests if an object has a specific shape.
 *
 * Similar to `where`, but returns true only if the object has exactly
 * the properties specified in the pattern (strict matching).
 *
 * @param pattern - The pattern object to match against
 * @returns A predicate that tests if value matches the pattern
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { matchesShape } from 'receta/predicate'
 *
 * const events = [
 *   { type: 'click', x: 100, y: 200 },
 *   { type: 'keypress', key: 'Enter' },
 *   { type: 'click', x: 150, y: 250 }
 * ]
 *
 * // Find click events
 * R.filter(events, matchesShape({ type: 'click' }))
 * // => click events
 *
 * // Real-world: Pattern matching on API responses
 * const responses = [
 *   { status: 'success', data: { id: 1 } },
 *   { status: 'error', message: 'Not found' },
 *   { status: 'success', data: { id: 2 } }
 * ]
 * R.filter(responses, matchesShape({ status: 'success' }))
 * // => success responses
 * ```
 *
 * @see where - for predicate-based matching
 * @see eq - for equality comparison
 */
export const matchesShape =
  <T extends Record<string, unknown>>(pattern: Partial<T>): Predicate<T> =>
  (obj) => {
    for (const key in pattern) {
      if (obj[key] !== pattern[key]) {
        return false
      }
    }
    return true
  }

/**
 * Creates a predicate that tests if an object has a specific property.
 *
 * @param key - The property key to check for
 * @returns A predicate that returns true if the object has the property
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { hasProperty } from 'receta/predicate'
 *
 * const objects = [
 *   { name: 'Alice', age: 25 },
 *   { name: 'Bob' },
 *   { name: 'Charlie', age: 30 }
 * ]
 *
 * R.filter(objects, hasProperty('age'))
 * // => [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
 *
 * // Real-world: Filter objects with optional properties
 * const users = [
 *   { id: 1, email: 'alice@example.com' },
 *   { id: 2 },
 *   { id: 3, email: 'charlie@example.com' }
 * ]
 * R.filter(users, hasProperty('email')) // => users with email
 * ```
 *
 * @see prop - for testing a property value
 * @see where - for testing multiple properties
 */
export const hasProperty =
  <T extends Record<string, unknown>, K extends string>(key: K): Predicate<T> =>
  (obj) =>
    key in obj

/**
 * Creates a predicate that tests if a value satisfies a custom condition.
 *
 * This is just an identity function that makes code more readable.
 *
 * @param predicate - The predicate function
 * @returns The same predicate (for readability)
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { satisfies } from 'receta/predicate'
 *
 * const numbers = [1, 2, 3, 4, 5]
 * R.filter(numbers, satisfies((n) => n % 2 === 0)) // => [2, 4]
 *
 * // Makes complex predicates more readable
 * const users = [
 *   { name: 'Alice', age: 25, premium: true },
 *   { name: 'Bob', age: 17, premium: false },
 *   { name: 'Charlie', age: 30, premium: true }
 * ]
 * R.filter(
 *   users,
 *   satisfies((u) => u.age >= 18 && u.premium)
 * )
 * ```
 *
 * @see where - for structured object testing
 */
export const satisfies = <T>(predicate: Predicate<T>): Predicate<T> => predicate

/**
 * Creates a predicate by composing a selector function with a predicate.
 *
 * Useful for testing derived values or nested properties.
 *
 * @param selector - Function to extract a value from the input
 * @param predicate - Predicate to apply to the extracted value
 * @returns A predicate that tests the selected value
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { by, gt } from 'receta/predicate'
 *
 * const users = [
 *   { name: 'Alice', tags: ['admin', 'user'] },
 *   { name: 'Bob', tags: ['user'] },
 *   { name: 'Charlie', tags: ['admin', 'moderator', 'user'] }
 * ]
 *
 * // Test derived values
 * R.filter(
 *   users,
 *   by((u) => u.tags.length, gt(1))
 * )
 * // => Alice and Charlie (have multiple tags)
 *
 * // Real-world: Filter by computed values
 * const products = [
 *   { name: 'A', price: 100, discount: 0.1 },
 *   { name: 'B', price: 50, discount: 0.2 },
 *   { name: 'C', price: 150, discount: 0 }
 * ]
 * R.filter(
 *   products,
 *   by((p) => p.price * (1 - p.discount), gt(80))
 * )
 * // => products with final price > 80
 * ```
 *
 * @see prop - for simple property access
 * @see where - for multiple property testing
 */
export const by =
  <T, U>(selector: (value: T) => U, predicate: Predicate<U>): Predicate<T> =>
  (value) =>
    predicate(selector(value))

/**
 * Core type definitions for the Predicate module.
 *
 * @module predicate/types
 */

/**
 * A function that takes a value and returns a boolean.
 *
 * Predicates are used for filtering, validation, and type narrowing.
 * They can be composed using combinators like `and`, `or`, and `not`.
 *
 * @typeParam T - The type of value the predicate tests
 *
 * @example
 * ```typescript
 * // Simple predicate
 * const isPositive: Predicate<number> = (n) => n > 0
 *
 * // Type-narrowing predicate
 * const isString: Predicate<unknown> = (value): value is string =>
 *   typeof value === 'string'
 * ```
 */
export type Predicate<T> = (value: T) => boolean

/**
 * A function that takes a value and returns a type predicate.
 *
 * Type predicates enable TypeScript to narrow types in control flow.
 *
 * @typeParam T - The input type
 * @typeParam U - The narrowed type (must extend T)
 *
 * @example
 * ```typescript
 * const isString: TypePredicate<unknown, string> = (value): value is string =>
 *   typeof value === 'string'
 *
 * const value: unknown = 'hello'
 * if (isString(value)) {
 *   // TypeScript knows value is string here
 *   console.log(value.toUpperCase())
 * }
 * ```
 */
export type TypePredicate<T, U extends T> = (value: T) => value is U

/**
 * A schema definition for the `where` function.
 *
 * Maps object keys to predicates that test the corresponding values.
 *
 * @typeParam T - The object type to test
 *
 * @example
 * ```typescript
 * interface User {
 *   age: number
 *   name: string
 *   active: boolean
 * }
 *
 * const schema: PredicateSchema<User> = {
 *   age: (n) => n >= 18,
 *   name: (s) => s.length > 0,
 *   active: Boolean
 * }
 * ```
 */
export type PredicateSchema<T> = {
  [K in keyof T]?: Predicate<T[K]>
}

/**
 * Type definitions for function combinators and utilities.
 * @module
 */

/**
 * A function that takes a value and returns a boolean.
 */
export type Predicate<T> = (value: T) => boolean

/**
 * A function that transforms a value of type T to type U.
 */
export type Mapper<T, U> = (value: T) => U

/**
 * A pair of predicate and corresponding function for conditional execution.
 */
export type CondPair<T, U> = readonly [predicate: Predicate<T>, fn: Mapper<T, U>]

/**
 * Represents a tuple of functions that take the same input type.
 */
export type FunctionTuple<T, Args extends readonly unknown[]> = {
  readonly [K in keyof Args]: Mapper<T, Args[K]>
}

/**
 * Extracts the return types of a tuple of functions.
 */
export type ReturnTypes<Fns extends readonly ((...args: any[]) => any)[]> = {
  readonly [K in keyof Fns]: Fns[K] extends (...args: any[]) => infer R ? R : never
}

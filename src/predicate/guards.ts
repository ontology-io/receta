/**
 * Type-narrowing predicates for runtime type checking.
 *
 * @module predicate/guards
 */

import type { TypePredicate } from './types'

/**
 * Type guard that checks if a value is a string.
 *
 * Narrows the type to `string` in TypeScript.
 *
 * @param value - The value to check
 * @returns True if value is a string
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isString } from 'receta/predicate'
 *
 * const mixed: unknown[] = ['hello', 42, 'world', true]
 * const strings = R.filter(mixed, isString) // type: string[]
 * // => ['hello', 'world']
 *
 * // Type narrowing in conditionals
 * const value: unknown = 'test'
 * if (isString(value)) {
 *   console.log(value.toUpperCase()) // TypeScript knows value is string
 * }
 * ```
 *
 * @see isNumber - for number type guard
 * @see isBoolean - for boolean type guard
 */
export const isString: TypePredicate<unknown, string> = (value): value is string =>
  typeof value === 'string'

/**
 * Type guard that checks if a value is a number.
 *
 * Narrows the type to `number` in TypeScript.
 * Returns false for NaN (use `isFiniteNumber` to include NaN).
 *
 * @param value - The value to check
 * @returns True if value is a number and not NaN
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isNumber } from 'receta/predicate'
 *
 * const mixed: unknown[] = [42, 'hello', 100, null]
 * const numbers = R.filter(mixed, isNumber) // type: number[]
 * // => [42, 100]
 *
 * // Type narrowing
 * const value: unknown = 42
 * if (isNumber(value)) {
 *   console.log(value * 2) // TypeScript knows value is number
 * }
 * ```
 *
 * @see isFiniteNumber - to allow NaN
 * @see isInteger - for integer type guard
 * @see isString - for string type guard
 */
export const isNumber: TypePredicate<unknown, number> = (value): value is number =>
  typeof value === 'number' && !Number.isNaN(value)

/**
 * Type guard that checks if a value is a finite number.
 *
 * Returns false for Infinity, -Infinity, and NaN.
 *
 * @param value - The value to check
 * @returns True if value is a finite number
 *
 * @example
 * ```typescript
 * import { isFiniteNumber } from 'receta/predicate'
 *
 * isFiniteNumber(42) // => true
 * isFiniteNumber(Infinity) // => false
 * isFiniteNumber(-Infinity) // => false
 * isFiniteNumber(NaN) // => false
 * ```
 *
 * @see isNumber - for basic number check
 * @see isInteger - for integer check
 */
export const isFiniteNumber: TypePredicate<unknown, number> = (value): value is number =>
  typeof value === 'number' && Number.isFinite(value)

/**
 * Type guard that checks if a value is an integer.
 *
 * @param value - The value to check
 * @returns True if value is an integer
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isInteger } from 'receta/predicate'
 *
 * const numbers = [1, 1.5, 2, 2.5, 3]
 * R.filter(numbers, isInteger) // => [1, 2, 3]
 * ```
 *
 * @see isNumber - for general number check
 * @see isFiniteNumber - for finite number check
 */
export const isInteger: TypePredicate<unknown, number> = (value): value is number =>
  Number.isInteger(value)

/**
 * Type guard that checks if a value is a boolean.
 *
 * Narrows the type to `boolean` in TypeScript.
 *
 * @param value - The value to check
 * @returns True if value is a boolean
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isBoolean } from 'receta/predicate'
 *
 * const mixed: unknown[] = [true, 1, false, 'yes']
 * const booleans = R.filter(mixed, isBoolean) // type: boolean[]
 * // => [true, false]
 * ```
 *
 * @see isString - for string type guard
 * @see isNumber - for number type guard
 */
export const isBoolean: TypePredicate<unknown, boolean> = (value): value is boolean =>
  typeof value === 'boolean'

/**
 * Type guard that checks if a value is null.
 *
 * @param value - The value to check
 * @returns True if value is null
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isNull } from 'receta/predicate'
 *
 * const values: unknown[] = [null, undefined, 0, '']
 * R.filter(values, isNull) // => [null]
 * ```
 *
 * @see isUndefined - for undefined check
 * @see isNullish - for null or undefined check
 * @see isDefined - for non-nullish check
 */
export const isNull: TypePredicate<unknown, null> = (value): value is null => value === null

/**
 * Type guard that checks if a value is undefined.
 *
 * @param value - The value to check
 * @returns True if value is undefined
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isUndefined } from 'receta/predicate'
 *
 * const values: unknown[] = [null, undefined, 0, '']
 * R.filter(values, isUndefined) // => [undefined]
 * ```
 *
 * @see isNull - for null check
 * @see isNullish - for null or undefined check
 * @see isDefined - for non-nullish check
 */
export const isUndefined: TypePredicate<unknown, undefined> = (value): value is undefined =>
  value === undefined

/**
 * Type guard that checks if a value is null or undefined.
 *
 * @param value - The value to check
 * @returns True if value is null or undefined
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isNullish, not } from 'receta/predicate'
 *
 * const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
 * R.filter(values, not(isNullish)) // type: string[]
 * // => ['hello', 'world']
 * ```
 *
 * @see isDefined - for the inverse
 * @see isNull - for null-only check
 * @see isUndefined - for undefined-only check
 */
export const isNullish: TypePredicate<unknown, null | undefined> = (
  value
): value is null | undefined => value == null

/**
 * Type guard that checks if a value is not null or undefined.
 *
 * Narrows out `null` and `undefined` from the type.
 *
 * @param value - The value to check
 * @returns True if value is not null or undefined
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isDefined } from 'receta/predicate'
 *
 * const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
 * const defined = R.filter(values, isDefined) // type: string[]
 * // => ['hello', 'world']
 * ```
 *
 * @see isNullish - for the inverse
 */
export const isDefined = <T>(value: T): value is NonNullable<T> => value != null

/**
 * Type guard that checks if a value is an array.
 *
 * @param value - The value to check
 * @returns True if value is an array
 *
 * @example
 * ```typescript
 * import { isArray } from 'receta/predicate'
 *
 * const value: unknown = [1, 2, 3]
 * if (isArray(value)) {
 *   console.log(value.length) // TypeScript knows value is array
 * }
 * ```
 *
 * @see isObject - for object type guard
 * @see isFunction - for function type guard
 */
export const isArray: TypePredicate<unknown, unknown[]> = (value): value is unknown[] =>
  Array.isArray(value)

/**
 * Type guard that checks if a value is a plain object.
 *
 * Returns false for arrays, functions, null, and other non-plain objects.
 *
 * @param value - The value to check
 * @returns True if value is a plain object
 *
 * @example
 * ```typescript
 * import { isObject } from 'receta/predicate'
 *
 * isObject({}) // => true
 * isObject({ a: 1 }) // => true
 * isObject([]) // => false
 * isObject(null) // => false
 * isObject(() => {}) // => false
 * ```
 *
 * @see isArray - for array type guard
 * @see isFunction - for function type guard
 */
export const isObject: TypePredicate<unknown, Record<string, unknown>> = (
  value
): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

/**
 * Type guard that checks if a value is a function.
 *
 * @param value - The value to check
 * @returns True if value is a function
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isFunction } from 'receta/predicate'
 *
 * const mixed: unknown[] = [() => {}, 42, function() {}, 'test']
 * R.filter(mixed, isFunction) // type: Function[]
 * ```
 *
 * @see isObject - for object type guard
 * @see isArray - for array type guard
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const isFunction: TypePredicate<unknown, Function> = (value): value is Function =>
  typeof value === 'function'

/**
 * Type guard that checks if a value is a Date instance.
 *
 * @param value - The value to check
 * @returns True if value is a Date
 *
 * @example
 * ```typescript
 * import { isDate } from 'receta/predicate'
 *
 * isDate(new Date()) // => true
 * isDate('2024-01-01') // => false
 * isDate(Date.now()) // => false
 * ```
 */
export const isDate: TypePredicate<unknown, Date> = (value): value is Date =>
  value instanceof Date

/**
 * Type guard that checks if a value is a RegExp instance.
 *
 * @param value - The value to check
 * @returns True if value is a RegExp
 *
 * @example
 * ```typescript
 * import { isRegExp } from 'receta/predicate'
 *
 * isRegExp(/test/) // => true
 * isRegExp(new RegExp('test')) // => true
 * isRegExp('/test/') // => false
 * ```
 */
export const isRegExp: TypePredicate<unknown, RegExp> = (value): value is RegExp =>
  value instanceof RegExp

/**
 * Type guard that checks if a value is an Error instance.
 *
 * @param value - The value to check
 * @returns True if value is an Error
 *
 * @example
 * ```typescript
 * import { isError } from 'receta/predicate'
 *
 * isError(new Error('fail')) // => true
 * isError(new TypeError('invalid')) // => true
 * isError('error message') // => false
 * ```
 */
export const isError: TypePredicate<unknown, Error> = (value): value is Error =>
  value instanceof Error

/**
 * Type guard that checks if a value is a Promise.
 *
 * @param value - The value to check
 * @returns True if value is a Promise
 *
 * @example
 * ```typescript
 * import { isPromise } from 'receta/predicate'
 *
 * isPromise(Promise.resolve(42)) // => true
 * isPromise(async () => {}) // => false (it's a function)
 * await isPromise((async () => {})()) // => true (result of calling it)
 * ```
 */
export const isPromise: TypePredicate<unknown, Promise<unknown>> = (
  value
): value is Promise<unknown> => value instanceof Promise

/**
 * Creates a type guard that checks if a value is an instance of a class.
 *
 * @param constructor - The class constructor to check against
 * @returns A type guard that returns true if value is an instance of the class
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { isInstanceOf } from 'receta/predicate'
 *
 * class User {
 *   constructor(public name: string) {}
 * }
 *
 * const values: unknown[] = [
 *   new User('Alice'),
 *   { name: 'Bob' },
 *   new User('Charlie')
 * ]
 * const users = R.filter(values, isInstanceOf(User)) // type: User[]
 * // => [User('Alice'), User('Charlie')]
 * ```
 */
export const isInstanceOf =
  <T>(constructor: new (...args: any[]) => T): TypePredicate<unknown, T> =>
  (value): value is T =>
    value instanceof constructor

/**
 * Predicate module - Composable predicates for filtering, validation, and type narrowing.
 *
 * Predicates are functions that take a value and return a boolean.
 * They can be composed using combinators like `and`, `or`, and `not`.
 *
 * @example
 * ```typescript
 * import * as R from 'remeda'
 * import { gt, lt, and, where } from 'receta/predicate'
 *
 * // Basic filtering
 * const numbers = [1, 5, 10, 15, 20]
 * R.filter(numbers, and(gt(5), lt(15))) // => [10]
 *
 * // Object filtering
 * const users = [
 *   { age: 25, active: true },
 *   { age: 17, active: true },
 *   { age: 30, active: false }
 * ]
 * R.filter(users, where({
 *   age: gt(18),
 *   active: Boolean
 * })) // => [{ age: 25, active: true }]
 * ```
 *
 * @module predicate
 */

// Types
export type { Predicate, TypePredicate, PredicateSchema } from './types'

// Comparison predicates
export {
  gt,
  gte,
  lt,
  lte,
  eq,
  neq,
  between,
  startsWith,
  endsWith,
  includes,
  matches,
  isEmpty,
  isNotEmpty,
} from './comparison'

// Predicate combinators
export { and, or, not, xor, always, never } from './combinators'

// Predicate builders
export {
  where,
  oneOf,
  prop,
  matchesShape,
  hasProperty,
  satisfies,
  by,
} from './builders'

// Type guards
export {
  isString,
  isNumber,
  isFiniteNumber,
  isInteger,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isDefined,
  isArray,
  isObject,
  isFunction,
  isDate,
  isRegExp,
  isError,
  isPromise,
  isInstanceOf,
} from './guards'

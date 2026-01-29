import type { Result } from '../../result/types'
import { ok, err } from '../../result/constructors'
import type { Predicate } from '../types'
import { purryConfig } from '../../utils'

/**
 * A pair of predicate and corresponding error for guard validation.
 */
export type GuardPair<T, E> = readonly [predicate: Predicate<T>, error: E]

/**
 * Validates a value through a series of guard clauses (early return pattern).
 *
 * Tests the input against each predicate in order. If a predicate returns false,
 * immediately returns Err with the corresponding error. If all predicates pass,
 * returns Ok with the original value.
 *
 * This implements the guard clause / early return pattern common in validation chains,
 * allowing you to declaratively express a series of validation rules.
 *
 * @example
 * ```typescript
 * // User validation
 * const validateUser = guard<User, string>([
 *   [(u) => u.age >= 18, 'Must be 18 or older'],
 *   [(u) => u.email.includes('@'), 'Invalid email format'],
 *   [(u) => u.name.trim().length > 0, 'Name is required']
 * ])
 *
 * validateUser({ age: 25, email: 'test@example.com', name: 'Alice' })
 * // => Ok({ age: 25, email: 'test@example.com', name: 'Alice' })
 *
 * validateUser({ age: 16, email: 'test@example.com', name: 'Bob' })
 * // => Err('Must be 18 or older')
 *
 * validateUser({ age: 25, email: 'invalid', name: 'Charlie' })
 * // => Err('Invalid email format')
 * ```
 *
 * @example
 * ```typescript
 * // Data-first
 * const result = guard<number, string>(
 *   [
 *     [(n) => n > 0, 'Must be positive'],
 *     [(n) => n < 100, 'Must be less than 100'],
 *     [(n) => Number.isInteger(n), 'Must be an integer']
 *   ],
 *   42
 * )
 * // => Ok(42)
 * ```
 *
 * @example
 * ```typescript
 * // In a pipe for validation chains
 * pipe(
 *   parseFormData(),
 *   guard([
 *     [(data) => 'username' in data, 'Username is required'],
 *     [(data) => data.username.length >= 3, 'Username too short']
 *   ]),
 *   Result.map(createUser)
 * )
 * ```
 *
 * @example
 * ```typescript
 * // With structured errors
 * type ValidationError = { field: string; message: string }
 *
 * const validatePassword = guard<string, ValidationError>([
 *   [
 *     (pwd) => pwd.length >= 8,
 *     { field: 'password', message: 'Password must be at least 8 characters' }
 *   ],
 *   [
 *     (pwd) => /[A-Z]/.test(pwd),
 *     { field: 'password', message: 'Password must contain uppercase letter' }
 *   ],
 *   [
 *     (pwd) => /[0-9]/.test(pwd),
 *     { field: 'password', message: 'Password must contain a number' }
 *   ]
 * ])
 * ```
 *
 * @returns Result<T, E> - Ok with original value if all guards pass, Err with first failing guard's error
 * @see when - for conditional transformations
 * @see cond - for multi-way branching with Option
 */
export function guard<T, E>(pairs: readonly GuardPair<T, E>[]): (value: T) => Result<T, E>
export function guard<T, E>(pairs: readonly GuardPair<T, E>[], value: T): Result<T, E>
export function guard(...args: unknown[]): unknown {
  return purryConfig(guardImplementation, args)
}

function guardImplementation<T, E>(pairs: readonly GuardPair<T, E>[], value: T): Result<T, E> {
  for (const [predicate, error] of pairs) {
    if (!predicate(value)) {
      return err(error)
    }
  }
  return ok(value)
}

import * as R from 'remeda'
import type { Option } from '../types'
import { some, none } from '../constructors'
import { isSome } from '../guards'

/**
 * Collects an array of Options into an Option of array.
 *
 * If all Options are Some, returns Some with array of values.
 * If any Option is None, returns None.
 *
 * This is useful for operations that must all succeed.
 *
 * @param options - Array of Options to collect
 * @returns Option containing array of values, or None if any is None
 *
 * @example
 * ```typescript
 * // All Some
 * collect([some(1), some(2), some(3)])
 * // => Some([1, 2, 3])
 *
 * // Any None
 * collect([some(1), none(), some(3)])
 * // => None
 *
 * // Real-world: validating multiple fields
 * const validateForm = (data: FormData) => {
 *   const fields = collect([
 *     validateEmail(data.email),
 *     validatePassword(data.password),
 *     validateAge(data.age)
 *   ])
 *
 *   return map(fields, ([email, password, age]) => ({
 *     email,
 *     password,
 *     age
 *   }))
 * }
 * ```
 *
 * @see partition - for separating Some and None values
 */
export function collect<T>(options: readonly Option<T>[]): Option<T[]>
export function collect<T>(): (options: readonly Option<T>[]) => Option<T[]>
export function collect(...args: unknown[]): unknown {
  return R.purry(collectImplementation, args)
}

function collectImplementation<T>(options: readonly Option<T>[]): Option<T[]> {
  const values: T[] = []

  for (const option of options) {
    if (!isSome(option)) {
      return none()
    }
    values.push(option.value)
  }

  return some(values)
}

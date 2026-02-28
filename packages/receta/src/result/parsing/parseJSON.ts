import type { Result } from '../types'
import { ok, err } from '../constructors'

/**
 * Safely parses a JSON string into a typed value.
 *
 * Unlike JSON.parse which throws on invalid input, this function returns a Result
 * that either contains the parsed value or a SyntaxError.
 *
 * @param str - The JSON string to parse
 * @returns Result containing the parsed value or a SyntaxError
 *
 * @example
 * ```typescript
 * // Successful parsing
 * parseJSON('{"name":"John"}')
 * // => Ok({ name: 'John' })
 *
 * parseJSON('[1, 2, 3]')
 * // => Ok([1, 2, 3])
 *
 * // Failed parsing
 * parseJSON('invalid json')
 * // => Err(SyntaxError: Unexpected token 'i'...)
 *
 * parseJSON('{"incomplete":')
 * // => Err(SyntaxError: Unexpected end of JSON input)
 *
 * // With type annotation
 * interface User {
 *   name: string
 *   age: number
 * }
 *
 * const result = parseJSON<User>('{"name":"Alice","age":30}')
 * // => Ok({ name: 'Alice', age: 30 })
 *
 * // Use with pipe and map
 * pipe(
 *   parseJSON<User>('{"name":"Bob","age":25}'),
 *   Result.map(user => user.name.toUpperCase())
 * )
 * // => Ok('BOB')
 * ```
 *
 * @see {@link JSON.parse} - The underlying native function
 */
export function parseJSON<T = unknown>(str: string): Result<T, SyntaxError> {
  try {
    return ok(JSON.parse(str) as T)
  } catch (error) {
    return err(error as SyntaxError)
  }
}

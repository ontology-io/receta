import * as R from 'remeda'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type WithErrorContextError<E> = {
  /** What was being done, such as `loading config`. */
  readonly context: string
  /** The context, then the cause's own message: `loading config: file not found`. */
  readonly message: string
  /** The original error, untouched. */
  readonly cause: E
}

/** A readable line for any error: its message, its code, or the value as text. */
const describe = (error: unknown): string => {
  if (R.isString(error)) return error
  if (R.isObjectType(error) && 'message' in error && R.isString(error.message)) return error.message
  if (R.isObjectType(error) && 'code' in error && R.isString(error.code)) return error.code
  return String(error)
}

/**
 * Wraps an Err with a note about what was being done, so the message reads `loading config: file not found`.
 *
 * Use when: an error crosses a layer and its own message no longer says where it happened,
 * such as `ENOENT` from deep inside a config loader or `timeout` from one of several API
 * calls. Wrapping again adds another layer in front, like a stack trace written for people.
 * The original error stays in `cause` for code that needs its fields. An `Ok` passes
 * through.
 *
 * @example
 * ```ts
 * import { err, mapErr, ok } from '@ontologyio/receta/result'
 *
 * withErrorContext(err('file not found'), 'loading config')
 * // => Err({ context: 'loading config', message: 'loading config: file not found', cause: 'file not found' })
 *
 * R.pipe(
 *   err(new Error('ECONNREFUSED')),
 *   withErrorContext('connecting to the database'),
 *   withErrorContext('starting the server'),
 *   mapErr((error) => error.message),
 * )
 * // => Err('starting the server: connecting to the database: ECONNREFUSED')
 *
 * withErrorContext(ok(42), 'loading config')
 * // => Ok(42)
 * ```
 *
 * @tags error, context, wrap, message, cause, chain, logging, debugging, trace
 * @see mapErr - @ontologyio/receta/result, the error change underneath
 * @see toUserMessage - turns an error into text for the person using the app
 */
export function withErrorContext<T, E>(
  result: Result<T, E>,
  context: string,
): Result<T, WithErrorContextError<E>>
export function withErrorContext(
  context: string,
): <T, E>(result: Result<T, E>) => Result<T, WithErrorContextError<E>>
export function withErrorContext(...args: unknown[]): unknown {
  return R.purry(withErrorContextImplementation, args)
}

const withErrorContextImplementation = <T, E>(
  result: Result<T, E>,
  context: string,
): Result<T, WithErrorContextError<E>> =>
  mapErr(result, (cause) => ({ context, message: `${context}: ${describe(cause)}`, cause }))

import { tryCatch } from '@ontologyio/receta/function'
import { isError, isString } from '@ontologyio/receta/predicate'
import type { Result } from '@ontologyio/receta/result'

export type SafeCallError<Args extends readonly unknown[]> = {
  readonly code: 'THREW'
  /** The arguments of the call that threw. */
  readonly input: Args
  readonly message: string
  /** What was thrown, untouched. */
  readonly cause: unknown
}

const messageOf = (cause: unknown): string => {
  if (isError(cause)) return cause.message
  if (isString(cause)) return cause
  return `Threw ${String(cause)}`
}

/**
 * Wraps a function that may throw so it returns a Result, with the arguments and a readable message on failure.
 *
 * Use when: calling synchronous code you don't control that signals failure by throwing, such
 * as `decodeURIComponent`, `new URL`, `atob`, a parser or a third-party SDK, and the caller
 * should branch on a value instead. The wrapped function takes the same arguments. Whatever was
 * thrown is kept in `cause`; `message` is its message, the string itself, or a description.
 *
 * @example
 * ```ts
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * const decode = safeCall(decodeURIComponent)
 *
 * decode('caf%C3%A9')
 * // => Ok('café')
 *
 * R.pipe(decode('%E0%A4%A'), mapErr(({ code, input }) => ({ code, input })))
 * // => Err({ code: 'THREW', input: ['%E0%A4%A'] })
 *
 * const host = safeCall((href: string) => new URL(href).hostname)
 * host('https://receta.dev/docs?q=1')
 * // => Ok('receta.dev')
 * ```
 *
 * @tags try catch, throw, exception, wrap, safe, result, error handling, sdk, decode
 * @see tryCatch - @ontologyio/receta/function, wraps a function without shaping the error
 * @see safeCallAsync - the same for functions that return a promise
 */
export function safeCall<Args extends readonly unknown[], T>(
  fn: (...args: Args) => T,
): (...args: Args) => Result<T, SafeCallError<Args>> {
  return (...args) =>
    tryCatch(fn, (cause): SafeCallError<Args> => ({
      code: 'THREW',
      input: args,
      message: messageOf(cause),
      cause,
    }))(...args)
}

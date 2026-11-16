import { isError, isString } from '@ontologyio/receta/predicate'
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type SafeCallAsyncError<Args extends readonly unknown[]> = {
  readonly code: 'REJECTED'
  /** The arguments of the call that failed. */
  readonly input: Args
  readonly message: string
  /** The rejection reason, untouched. */
  readonly cause: unknown
}

const messageOf = (cause: unknown): string => {
  if (isError(cause)) return cause.message
  if (isString(cause)) return cause
  return `Rejected with ${String(cause)}`
}

/**
 * Wraps an async function so it resolves to a Result instead of rejecting, keeping the arguments on failure.
 *
 * Use when: calling an SDK, a database client or `fetch`-based helper you don't control, and
 * every call site would otherwise need its own `try`. The wrapped function takes the same
 * arguments and never rejects. A synchronous throw inside the function is caught too. Whatever
 * it rejected with is kept in `cause`; `message` is its message, the string itself, or a
 * description.
 *
 * @example
 * ```ts
 * import { mapErr } from '@ontologyio/receta/result'
 *
 * const loadUser = safeCallAsync((id: string) =>
 *   id === 'u1' ? Promise.resolve({ id, name: 'Ada' }) : Promise.reject(new Error(`No user ${id}`)),
 * )
 *
 * await loadUser('u1')
 * // => Ok({ id: 'u1', name: 'Ada' })
 *
 * const missing = await loadUser('u2')
 * R.pipe(missing, mapErr(({ code, input, message }) => ({ code, input, message })))
 * // => Err({ code: 'REJECTED', input: ['u2'], message: 'No user u2' })
 * ```
 *
 * @tags async, promise, reject, try catch, wrap, safe, result, sdk, error handling
 * @see tryCatchAsync - @ontologyio/receta/result, one call instead of a wrapped function
 * @see safeCall - the same for functions that throw synchronously
 */
export function safeCallAsync<Args extends readonly unknown[], T>(
  fn: (...args: Args) => Promise<T>,
): (...args: Args) => Promise<Result<T, SafeCallAsyncError<Args>>> {
  return (...args) =>
    tryCatchAsync(
      () => fn(...args),
      (cause): SafeCallAsyncError<Args> => ({
        code: 'REJECTED',
        input: args,
        message: messageOf(cause),
        cause,
      }),
    )
}

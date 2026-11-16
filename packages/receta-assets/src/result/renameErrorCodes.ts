import * as R from 'remeda'
import { fromNullable, unwrapOr } from '@ontologyio/receta/option'
import { mapErr, type Result } from '@ontologyio/receta/result'

/** The error with each renamed code replaced; codes not in the table keep their name. */
export type RenameErrorCodesError<E extends { readonly code: string }, M> = Omit<E, 'code'> & {
  readonly code: Exclude<E['code'], keyof M> | M[keyof M]
}

/**
 * Renames error codes using a lookup table, such as `ER_DUP_ENTRY` to `EMAIL_TAKEN`, keeping every other field of the error.
 *
 * Use when: errors cross a boundary where their codes stop making sense, such as database or
 * SDK codes reaching an API or a UI that should speak in domain terms, or several providers
 * that call the same failure by different names. Codes not in the table pass through as they
 * are. An `Ok` is untouched.
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type DbError = { code: 'ER_DUP_ENTRY' | 'ER_LOCK_WAIT_TIMEOUT' | 'ECONNREFUSED'; message: string }
 * const duplicate: Result<number, DbError> = err({ code: 'ER_DUP_ENTRY', message: 'users.email' })
 * const offline: Result<number, DbError> = err({ code: 'ECONNREFUSED', message: '10.0.0.5:3306' })
 * const renames = { ER_DUP_ENTRY: 'EMAIL_TAKEN', ER_LOCK_WAIT_TIMEOUT: 'BUSY' } as const
 *
 * renameErrorCodes(duplicate, renames)
 * // => Err({ code: 'EMAIL_TAKEN', message: 'users.email' })
 *
 * R.pipe(offline, renameErrorCodes(renames))
 * // => Err({ code: 'ECONNREFUSED', message: '10.0.0.5:3306' })
 *
 * renameErrorCodes(ok(7), renames)
 * // => Ok(7)
 * ```
 *
 * @tags error code, rename, translate, map error, boundary, domain error, adapter
 * @see toHttpResponse - picks a status from the renamed codes
 * @see mapErr - @ontologyio/receta/result, the error change underneath
 */
export function renameErrorCodes<
  T,
  E extends { readonly code: string },
  const M extends { readonly [C in E['code']]?: string },
>(result: Result<T, E>, renames: M): Result<T, RenameErrorCodesError<E, M>>
export function renameErrorCodes<
  E extends { readonly code: string },
  const M extends { readonly [C in E['code']]?: string },
>(renames: M): <T>(result: Result<T, E>) => Result<T, RenameErrorCodesError<E, M>>
export function renameErrorCodes(...args: unknown[]): unknown {
  return R.purry(renameErrorCodesImplementation, args)
}

const renameErrorCodesImplementation = <T, E extends { readonly code: string }>(
  result: Result<T, E>,
  renames: Readonly<Record<string, string | undefined>>,
): Result<T, E> =>
  mapErr(result, (error) => ({
    ...error,
    code: unwrapOr(fromNullable(renames[error.code]), error.code),
  }))

import * as R from 'remeda'
import { fromNullable, unwrapOr } from '@ontologyio/receta/option'
import { match, type Result } from '@ontologyio/receta/result'

export type ToUserMessageTexts<T, E extends { readonly code: string }> = {
  /** The text after a success, built from the value. */
  readonly ok: (value: T) => string
  /** A text per error code. Codes left out get `fallback`. */
  readonly errors: { readonly [C in E['code']]?: string }
  /** The text for any error code without its own entry. */
  readonly fallback: string
}

/**
 * Turns a Result into the sentence to show a person: a success text from the value, or the text for the error's code.
 *
 * Use when: an action's outcome becomes a toast, a banner, a CLI line or a chat reply, and
 * error codes must turn into friendly words without leaking internals like stack traces or
 * SQL. Codes you didn't list get the fallback, so a new error code never shows up raw. The
 * error's own `message` is never shown; put that in your logs.
 *
 * @example
 * ```ts
 * import { err, ok, type Result } from '@ontologyio/receta/result'
 *
 * type SaveError = { code: 'CONFLICT' | 'FORBIDDEN' | 'DB_DOWN'; message: string }
 * const texts = {
 *   ok: (doc: { title: string }) => `Saved "${doc.title}"`,
 *   errors: { CONFLICT: 'Someone else changed this first. Reload and try again.' },
 *   fallback: 'Something went wrong. Please try again.',
 * }
 * const saved: Result<{ title: string }, SaveError> = ok({ title: 'Q3 plan' })
 * const conflicted: Result<{ title: string }, SaveError> = err({ code: 'CONFLICT', message: 'version 7 != 8' })
 * const crashed: Result<{ title: string }, SaveError> = err({ code: 'DB_DOWN', message: 'ECONNREFUSED' })
 *
 * toUserMessage(saved, texts)
 * // => 'Saved "Q3 plan"'
 *
 * toUserMessage(conflicted, texts)
 * // => 'Someone else changed this first. Reload and try again.'
 *
 * R.pipe(crashed, toUserMessage(texts))
 * // => 'Something went wrong. Please try again.'
 * ```
 *
 * @tags message, toast, ui, error text, user facing, i18n, notification, feedback
 * @see toHttpResponse - the same decision for an HTTP status and body
 * @see match - @ontologyio/receta/result, the branch underneath
 */
export function toUserMessage<T, E extends { readonly code: string }>(
  result: Result<T, E>,
  texts: ToUserMessageTexts<T, E>,
): string
export function toUserMessage<T, E extends { readonly code: string }>(
  texts: ToUserMessageTexts<T, E>,
): (result: Result<T, E>) => string
export function toUserMessage(...args: unknown[]): unknown {
  return R.purry(toUserMessageImplementation, args)
}

const toUserMessageImplementation = <T, E extends { readonly code: string }>(
  result: Result<T, E>,
  texts: ToUserMessageTexts<T, E>,
): string =>
  match(result, {
    onOk: texts.ok,
    onErr: (error) =>
      unwrapOr(fromNullable<string>(texts.errors[error.code as E['code']]), texts.fallback),
  })

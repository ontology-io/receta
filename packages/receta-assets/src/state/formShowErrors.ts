import * as R from 'remeda'
import { over, prop, set } from '@ontologyio/receta/lens'
import { filterValues } from '@ontologyio/receta/object'
import { isNotEmpty, isString } from '@ontologyio/receta/predicate'

/** The form state this works on. Extra fields, such as `submitting`, are kept. */
export type FormShowErrorsState<V extends object = Record<string, unknown>> = {
  readonly values: V
  readonly touched: Readonly<Partial<Record<keyof V, boolean>>>
  readonly errors: Readonly<Partial<Record<keyof V, string>>>
}

const isMessage = (message: unknown): boolean => isString(message) && isNotEmpty(message)

type Form = {
  readonly values: Readonly<Record<string, unknown>>
  readonly touched: Readonly<Record<string, boolean>>
  readonly errors: Readonly<Record<string, string>>
}

/**
 * Replaces a form's errors with a new set, and marks every field that has one as touched so it shows.
 *
 * Use when: a submit fails validation on the client or the server answers 422 with field
 * errors, and each message must appear under its field even if the user never visited it.
 * Errors from before are dropped, so pass every current error, and an empty message counts as
 * no error. Touched flags of other fields stay. The form state is `{ values, touched, errors }`,
 * with extra fields kept, and the error keys are checked against `values`.
 *
 * @example
 * ```ts
 * const form = {
 *   values: { email: '', password: 'x', name: 'Ada' },
 *   touched: { name: true },
 *   errors: { name: 'Old error' },
 *   submitting: true,
 * }
 *
 * formShowErrors(form, { email: 'Required', password: 'Too short' })
 * // => {
 * //   values: { email: '', password: 'x', name: 'Ada' },
 * //   touched: { name: true, email: true, password: true },
 * //   errors: { email: 'Required', password: 'Too short' },
 * //   submitting: true,
 * // }
 *
 * R.pipe(form, formShowErrors({ email: '' })).errors
 * // => {}
 * ```
 *
 * @tags form, errors, validation, submit, 422, server errors, touched, show, field, lens
 * @see formSetField - clears one field's error as the user types
 * @see set - @ontologyio/receta/lens, replaces the errors
 */
export function formShowErrors<F extends FormShowErrorsState<object>>(
  form: F,
  errors: Readonly<Partial<Record<keyof F['values'], string>>>,
): F
export function formShowErrors<F extends FormShowErrorsState<object>>(
  errors: Readonly<Partial<Record<keyof F['values'], string>>>,
): (form: F) => F
export function formShowErrors(...args: unknown[]): unknown {
  return R.purry(formShowErrorsImplementation, args)
}

const formShowErrorsImplementation = (form: Form, errors: Readonly<Record<string, string | undefined>>): Form => {
  const current = filterValues(errors, isMessage) as Readonly<Record<string, string>>
  const touchedNow = R.mapValues(current, R.constant(true))
  return R.pipe(
    form,
    set(prop<Form, 'errors'>('errors'), current),
    over(prop<Form, 'touched'>('touched'), (touched) => ({ ...touched, ...touchedNow })),
  )
}

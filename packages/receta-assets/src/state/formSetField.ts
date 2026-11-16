import * as R from 'remeda'
import { compose, over, prop, set, type Lens } from '@ontologyio/receta/lens'

/** The form state this works on. Extra fields, such as `initial` or `submitting`, are kept. */
export type FormSetFieldState<V extends object = Record<string, unknown>> = {
  readonly values: V
  readonly touched: Readonly<Partial<Record<keyof V, boolean>>>
  readonly errors: Readonly<Partial<Record<keyof V, string>>>
}

type Form = {
  readonly values: Readonly<Record<string, unknown>>
  readonly touched: Readonly<Record<string, boolean>>
  readonly errors: Readonly<Record<string, string>>
}

const valueOf = (field: string): Lens<Form, unknown> =>
  compose(prop<Form, 'values'>('values'), prop<Readonly<Record<string, unknown>>, string>(field))

const touchedOf = (field: string): Lens<Form, boolean> =>
  compose(prop<Form, 'touched'>('touched'), prop<Readonly<Record<string, boolean>>, string>(field))

/**
 * Sets one form field's value, marks it touched and clears its error, in one immutable update.
 *
 * Use when: a hand-rolled form in React, Vue, Svelte or a reducer handles an input's change,
 * and the field should stop showing its old error while the user fixes it. The form state is
 * `{ values, touched, errors }`, with extra fields kept. The field name and value are checked
 * against the type of `values`. Validate again on blur or submit to bring errors back.
 *
 * @example
 * ```ts
 * const form = {
 *   values: { email: 'ada@', age: 36 },
 *   touched: {},
 *   errors: { email: 'Enter a valid email' },
 *   submitting: false,
 * }
 *
 * formSetField(form, 'email', 'ada@example.com')
 * // => { values: { email: 'ada@example.com', age: 36 }, touched: { email: true }, errors: {}, submitting: false }
 *
 * R.pipe(form, formSetField('age', 37)).values
 * // => { email: 'ada@', age: 37 }
 * ```
 *
 * @tags form, field, input, change, touched, error, value, react, reducer, lens
 * @see formResetField - puts a field back to its initial value
 * @see formShowErrors - shows validation errors after a submit
 * @see compose - @ontologyio/receta/lens, joins the group lens and the field lens
 */
export function formSetField<F extends FormSetFieldState<object>, K extends keyof F['values'] & string>(
  form: F,
  field: K,
  value: F['values'][K],
): F
export function formSetField<F extends FormSetFieldState<object>, K extends keyof F['values'] & string>(
  field: K,
  value: F['values'][K],
): (form: F) => F
export function formSetField(...args: unknown[]): unknown {
  return R.purry(formSetFieldImplementation, args)
}

const formSetFieldImplementation = (form: Form, field: string, value: unknown): Form =>
  R.pipe(
    form,
    set(valueOf(field), value),
    set(touchedOf(field), true),
    over(prop<Form, 'errors'>('errors'), (errors) => R.omit(errors, [field])),
  )

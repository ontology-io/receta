import * as R from 'remeda'
import { compose, over, prop, set, view, type Lens } from '@ontologyio/receta/lens'

/** The form state this works on, with the values the form started from. Extra fields are kept. */
export type FormResetFieldState<V extends object = Record<string, unknown>> = {
  readonly values: V
  readonly initial: V
  readonly touched: Readonly<Partial<Record<keyof V, boolean>>>
  readonly errors: Readonly<Partial<Record<keyof V, string>>>
}

type Group = Readonly<Record<string, unknown>>

type Form = {
  readonly values: Group
  readonly initial: Group
  readonly touched: Group
  readonly errors: Group
}

const fieldIn = (group: keyof Form, field: string): Lens<Form, unknown> =>
  compose(prop<Form, keyof Form>(group), prop<Group, string>(field))

const omitField = (field: string) => (group: Group): Group => R.omit(group, [field])

/**
 * Puts one form field back to its initial value, and forgets that it was touched or had an error.
 *
 * Use when: a field has an "undo" or "reset" button, an edit is cancelled, or a dependent
 * field must go back to its default when another one changes, such as the state when the
 * country changes. The form state is `{ values, initial, touched, errors }`, with extra fields
 * kept. The rest of the form is untouched, and the field name is checked against `values`.
 *
 * @example
 * ```ts
 * const form = {
 *   values: { country: 'FR', region: 'Bretagne' },
 *   initial: { country: 'DE', region: '' },
 *   touched: { country: true, region: true },
 *   errors: { region: 'Unknown region' },
 * }
 *
 * formResetField(form, 'region')
 * // => {
 * //   values: { country: 'FR', region: '' },
 * //   initial: { country: 'DE', region: '' },
 * //   touched: { country: true },
 * //   errors: {},
 * // }
 *
 * R.pipe(form, formResetField('country')).values
 * // => { country: 'DE', region: 'Bretagne' }
 * ```
 *
 * @tags form, reset, undo, cancel, field, initial, default, touched, error, lens
 * @see formSetField - changes a field's value
 * @see compose - @ontologyio/receta/lens, joins the group lens and the field lens
 */
export function formResetField<F extends FormResetFieldState<object>, K extends keyof F['values'] & string>(
  form: F,
  field: K,
): F
export function formResetField<F extends FormResetFieldState<object>, K extends keyof F['values'] & string>(
  field: K,
): (form: F) => F
export function formResetField(...args: unknown[]): unknown {
  return R.purry(formResetFieldImplementation, args)
}

const formResetFieldImplementation = (form: Form, field: string): Form =>
  R.pipe(
    form,
    set(fieldIn('values', field), view(fieldIn('initial', field), form)),
    over(prop<Form, 'touched'>('touched'), omitField(field)),
    over(prop<Form, 'errors'>('errors'), omitField(field)),
  )

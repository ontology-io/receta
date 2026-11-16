import * as R from 'remeda'
import { eq } from '@ontologyio/receta/predicate'
import {
  flatMap,
  fromPredicate,
  required,
  schema,
  type FieldError,
  type Validation,
  type Validator,
} from '@ontologyio/receta/validation'

export type ValidatePasswordConfirmationForm = {
  readonly password: string
  readonly confirmation: string
}

/**
 * Checks a password and its repeat field together, with each problem under its own field.
 *
 * Use when: a sign-up, reset or change-password form has "Password" and "Confirm password"
 * inputs. You pass the rule for the password itself, such as `minLength(8)`, and this adds the
 * repeat: a blank repeat asks for it, a different one says they don't match. Errors come back
 * as `{ field, errors }`, ready to show under each input.
 *
 * @example
 * ```ts
 * import { minLength } from '@ontologyio/receta/validation'
 *
 * validatePasswordConfirmation({ password: 'longenough', confirmation: 'longenough' }, minLength(8))
 * // => Valid({ password: 'longenough', confirmation: 'longenough' })
 *
 * validatePasswordConfirmation({ password: 'short', confirmation: 'shrot' }, minLength(8))
 * // => Invalid([
 * //   { field: 'password', errors: ['Must be at least 8 characters'] },
 * //   { field: 'confirmation', errors: ["Passwords don't match"] },
 * // ])
 *
 * R.pipe({ password: 'longenough', confirmation: '' }, validatePasswordConfirmation(minLength(8)))
 * // => Invalid([{ field: 'confirmation', errors: ['Re-enter your password'] }])
 * ```
 *
 * @tags password, confirm, repeat, match, signup, reset, form
 * @see schema - @ontologyio/receta/validation, one validator per field, every field checked
 * @see validatePassword - strength rules to pass as the password rule
 */
export function validatePasswordConfirmation(
  form: ValidatePasswordConfirmationForm,
  passwordRule: Validator<string, string, string>,
): Validation<ValidatePasswordConfirmationForm, FieldError<string>>
export function validatePasswordConfirmation(
  passwordRule: Validator<string, string, string>,
): (form: ValidatePasswordConfirmationForm) => Validation<ValidatePasswordConfirmationForm, FieldError<string>>
export function validatePasswordConfirmation(...args: unknown[]): unknown {
  return R.purry(validatePasswordConfirmationImplementation, args)
}

const validatePasswordConfirmationImplementation = (
  form: ValidatePasswordConfirmationForm,
  passwordRule: Validator<string, string, string>,
): Validation<ValidatePasswordConfirmationForm, FieldError<string>> =>
  schema<ValidatePasswordConfirmationForm, string>(
    {
      password: passwordRule,
      // A blank repeat only asks for it: "don't match" would be noise until something is typed.
      confirmation: (confirmation) =>
        R.pipe(
          confirmation,
          required('Re-enter your password'),
          flatMap(fromPredicate(eq(form.password), "Passwords don't match")),
        ),
    },
    form,
  )

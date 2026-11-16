import * as R from 'remeda'
import { eq } from '@ontologyio/receta/predicate'
import {
  email,
  equals,
  flatMap,
  fromPredicate,
  matches,
  maxLength,
  minLength,
  required,
  schema,
  validate,
  type FieldError,
  type Validation,
} from '@ontologyio/receta/validation'

export type ValidateSignupFormInput = {
  readonly name: string
  readonly email: string
  readonly password: string
  readonly confirmPassword: string
  readonly acceptedTerms: boolean
}

/**
 * Checks a whole sign-up form at once and returns every field's problems, keyed by field.
 *
 * Use when: handling a sign-up submit, on the client before sending or on the server before
 * creating the account, and the form should light up every bad field in one pass. Name and
 * email are trimmed first, and the trimmed form is what comes back. A blank field reports
 * only that it is required. Copy it and change the rules to fit your own sign-up form.
 *
 * ```text
 *  form
 *   │ trim name and email
 *   ▼
 *  ┌────────────────────────────────────────────┐
 *  │ check every field, none skipped            │
 *  │  name             required, then ≤ 80      │
 *  │  email            required, then format    │
 *  │  password         ≥ 8, a letter, a digit   │
 *  │  confirmPassword  required, then = password│
 *  │  acceptedTerms    must be true             │
 *  └─────────────────────┬──────────────────────┘
 *                        │ failing fields
 *                        ▼
 *                ⟨ any failed? ⟩
 *             yes │           │ no
 *                 ▼           ▼
 *  ╭─────────────────────────╮  ╭─────────────────────╮
 *  │ Invalid([{ field,       │  │ Valid(trimmed form) │
 *  │   errors }, …])         │  ╰─────────────────────╯
 *  ╰─────────────────────────╯
 * ```
 *
 * @example
 * ```ts
 * validateSignupForm({
 *   name: ' Ada ',
 *   email: 'ada@example.com',
 *   password: 'analytical1',
 *   confirmPassword: 'analytical1',
 *   acceptedTerms: true,
 * })
 * // => Valid({ name: 'Ada', email: 'ada@example.com', password: 'analytical1', confirmPassword: 'analytical1', acceptedTerms: true })
 *
 * validateSignupForm({ name: '', email: 'ada@', password: 'short', confirmPassword: '', acceptedTerms: false })
 * // => Invalid([
 * //   { field: 'name', errors: ['Enter your name'] },
 * //   { field: 'email', errors: ['Enter an email address like name@example.com'] },
 * //   { field: 'password', errors: ['Use at least 8 characters', 'Add a number'] },
 * //   { field: 'confirmPassword', errors: ['Re-enter your password'] },
 * //   { field: 'acceptedTerms', errors: ['Accept the terms to continue'] },
 * // ])
 * ```
 *
 * @tags signup, register, form, schema, account, onboarding, fields
 * @see schema - @ontologyio/receta/validation, one validator per field, every field checked
 * @see validatePasswordConfirmation - just the password pair
 */
export function validateSignupForm(form: ValidateSignupFormInput): Validation<ValidateSignupFormInput, FieldError<string>> {
  const trimmed = { ...form, name: form.name.trim(), email: form.email.trim() }
  return schema<ValidateSignupFormInput, string>(
    {
      name: (name) => R.pipe(name, required('Enter your name'), flatMap(maxLength(80, 'Name must be at most 80 characters'))),
      email: (address) =>
        R.pipe(address, required('Enter your email address'), flatMap(email('Enter an email address like name@example.com'))),
      password: validate([
        minLength(8, 'Use at least 8 characters'),
        matches(/\p{L}/u, 'Add a letter'),
        matches(/\p{Nd}/u, 'Add a number'),
      ]),
      confirmPassword: (repeat) =>
        R.pipe(repeat, required('Re-enter your password'), flatMap(fromPredicate(eq(trimmed.password), "Passwords don't match"))),
      acceptedTerms: equals<boolean>(true, 'Accept the terms to continue'),
    },
    trimmed,
  )
}

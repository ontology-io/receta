import * as R from 'remeda'
import { normalizeWhitespace } from '@ontologyio/receta/string'
import { flatMap, maxLength, minLength, required, valid, validate, type Validation } from '@ontologyio/receta/validation'

export type ValidateTextFieldOptions = {
  /** The field's name as the form shows it, used in every message: `'Display name'`. */
  readonly label: string
  /** Most characters allowed, after whitespace is tidied. */
  readonly maxLength: number
  /** Fewest characters allowed when something is typed. Defaults to 1. */
  readonly minLength?: number
  /** A blank field is fine and comes back as `''`. Defaults to false. */
  readonly optional?: boolean
}

/**
 * Checks a free-text form field, tidies its whitespace, and names the field in every message.
 *
 * Use when: a form has a name, title, company or similar text input and needs messages like
 * "Display name is required". Spaces are trimmed and runs of whitespace become one space
 * before any check, and that tidied text is what comes back. A blank required field reports
 * only that it is required. Length counts UTF-16 units, as `String.length` does.
 *
 * @example
 * ```ts
 * validateTextField('  Ada   Lovelace ', { label: 'Full name', maxLength: 80 })
 * // => Valid('Ada Lovelace')
 *
 * validateTextField(' ', { label: 'Full name', maxLength: 80 })
 * // => Invalid(['Full name is required'])
 *
 * R.pipe('Al', validateTextField({ label: 'Team name', minLength: 3, maxLength: 4 }))
 * // => Invalid(['Team name must be at least 3 characters'])
 *
 * validateTextField('', { label: 'Company', maxLength: 80, optional: true })
 * // => Valid('')
 * ```
 *
 * @tags text, field, form, name, title, length, required, whitespace, input
 * @see normalizeWhitespace - @ontologyio/receta/string, the tidying step
 * @see required - @ontologyio/receta/validation, the blank check that gates the length checks
 */
export function validateTextField(input: string, options: ValidateTextFieldOptions): Validation<string, string>
export function validateTextField(options: ValidateTextFieldOptions): (input: string) => Validation<string, string>
export function validateTextField(...args: unknown[]): unknown {
  return R.purry(validateTextFieldImplementation, args)
}

const validateTextFieldImplementation = (input: string, options: ValidateTextFieldOptions): Validation<string, string> => {
  const { label } = options
  const shortest = options.minLength ?? 1
  const text = normalizeWhitespace(input)
  const lengthRules = validate([
    minLength(shortest, `${label} must be at least ${shortest} characters`),
    maxLength(options.maxLength, `${label} must be at most ${options.maxLength} characters`),
  ])
  if (options.optional === true && text === '') return valid(text)
  return R.pipe(text, required(`${label} is required`), flatMap(lengthRules))
}

// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import { validate } from '../validate'
import { maxItems, minItems, nonEmpty } from '../validators'
import type { Validation, ValidationSchema } from '../types'

// --- the array validators accept readonly arrays
declare const readonlyTags: readonly string[]
declare const tags: string[]

export const checkedReadonly: Validation<readonly string[], string> = nonEmpty<string>('Need one')(readonlyTags)
export const checkedMin: Validation<readonly string[], string> = minItems<string>(1)(readonlyTags)
export const checkedMax: Validation<readonly string[], string> = maxItems<string>(3)(readonlyTags)

// A mutable array stays mutable
export const checkedMutable: Validation<string[], string> = nonEmpty<string>('Need one')(tags)
export const checkedLiteral = nonEmpty('Need one')([1, 2, 3])

interface ReadonlyForm {
  tags: readonly string[]
}

interface MutableForm {
  tags: string[]
}

export const readonlySchema: ValidationSchema<ReadonlyForm, string> = {
  tags: validate([nonEmpty('Need one'), minItems(1), maxItems(3)]),
}
export const readonlySchemaSingle: ValidationSchema<ReadonlyForm, string> = {
  tags: nonEmpty('Need one'),
}
export const mutableSchema: ValidationSchema<MutableForm, string> = {
  tags: validate([nonEmpty('Need one'), minItems(1), maxItems(3)]),
}
export const mutableSchemaSingle: ValidationSchema<MutableForm, string> = {
  tags: maxItems(3),
}

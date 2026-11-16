// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import { fromPredicate, fromPredicateWithError } from '../constructors'
import type { Validation, Validator } from '../types'

// --- fromPredicate narrows with a type guard
const isString = (value: unknown): value is string => typeof value === 'string'

export const stringValidator: Validator<unknown, string, string> = fromPredicate(isString, 'Expected a string')
export const narrowed: Validation<string, string> = fromPredicate(isString, 'Expected a string')(42 as unknown)
export const narrowedWithError: Validation<string, string> = fromPredicateWithError(
  isString,
  (value) => `Expected a string, got ${typeof value}`
)(42 as unknown)

// A plain predicate keeps the type
export const positive: Validator<number, number, string> = fromPredicate((n: number) => n > 0, 'Must be positive')

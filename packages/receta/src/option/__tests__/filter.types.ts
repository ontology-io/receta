// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { filter, type Option } from '../index'

declare const mixed: Option<string | number>
declare const count: Option<number>

const isString = (value: string | number): value is string => typeof value === 'string'

// A type guard narrows the Option.
export const narrowed: Option<string> = filter(mixed, isString)
export const narrowedInPipe: Option<string> = R.pipe(mixed, filter(isString))
export const narrowedInline: Option<string> = filter(mixed, (value): value is string => typeof value === 'string')

// A plain predicate keeps the type.
export const kept: Option<number> = filter(count, (n) => n > 0)
export const keptInPipe: Option<number> = R.pipe(
  count,
  filter((n) => n > 0)
)

// @ts-expect-error a plain predicate doesn't narrow
export const notNarrowed: Option<string> = filter(mixed, (value) => String(value).length > 2)

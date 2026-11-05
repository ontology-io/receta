// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { between, gt, gte, lt, lte, where } from '../index'

type Person = { age: number; score: bigint }

const numbers: readonly number[] = [1, 2, 3]
const bigints: readonly bigint[] = [1n, 2n, 3n]

// A plain threshold accepts any number, not only the literal it was given.
export const dataFirst = [
  R.filter(numbers, gt(2)),
  R.filter(numbers, gte(2)),
  R.filter(numbers, lt(2)),
  R.filter(numbers, lte(2)),
  R.filter(numbers, between(1, 3)),
]
export const inPipe = R.pipe(numbers, R.filter(gt(2)))
export const onFields = where<Person>({ age: gt(18), score: lt(10n) })
export const fromVariable = (limit: number) => R.filter(numbers, gt(limit))

// bigint stays bigint, and writing the type out keeps working.
export const onBigints = R.filter(bigints, between(1n, 3n))
export const explicit = R.filter(numbers, gt<number>(2))
export const eitherKind = gt<number | bigint>(2)(2n)

// @ts-expect-error a number threshold can't test bigints
export const wrongKind = R.filter(bigints, gt(2))

// @ts-expect-error a range can't mix number and bigint
export const mixedRange = between(1, 2n)

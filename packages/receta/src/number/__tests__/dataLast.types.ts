// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { round, toPercent } from '../index'

// One number is the decimals, because it can't be told apart from the value. So one number
// gives back a function, and the types have to say so.
export const roundInPipe: number = R.pipe(1.2345, round(2))
export const roundDefault: number = R.pipe(1.5, round())
export const roundInMap: readonly number[] = R.map([1.234], round(2))
export const percentInPipe: string = R.pipe(0.25, toPercent(1))
export const percentDefault: string = R.pipe(0.25, toPercent())

export const roundDirect: number = round(1.2345, 2)
export const percentDirect: string = toPercent(0.25, 1)

// @ts-expect-error one number returns a function, so this isn't a number
export const roundMisread: number = round(3.7)
// @ts-expect-error one number returns a function, so this isn't a string
export const percentMisread: string = toPercent(0.5)

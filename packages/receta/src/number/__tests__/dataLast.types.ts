// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { percentage, round, toPercent, type PercentageOptions } from '../index'

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

// percentage takes its options last, in both forms.
const asFraction: PercentageOptions = { fraction: true }
export const percentageDirect: number = percentage(25, 100)
export const percentageDirectFraction: number = percentage(25, 100, asFraction)
export const percentageInPipe: number = R.pipe(25, percentage(100))
export const percentageInPipeFraction: string = R.pipe(25, percentage(100, { fraction: true }), toPercent(1))

// @ts-expect-error a total alone returns a function, so this isn't a number
export const percentageMisread: number = percentage(100)
// @ts-expect-error fraction is a boolean
percentage(25, 100, { fraction: 'yes' })

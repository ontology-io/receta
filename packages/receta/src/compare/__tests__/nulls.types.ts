// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { ascending, byDate, nullsFirst, nullsLast, type Comparator } from '../index'

declare const scores: Array<number | null>
declare const dates: Array<Date | null | undefined>

// The comparator for the values doesn't have to accept null: it never sees one.
export const nullScoresLast: Comparator<number | null | undefined> = nullsLast(ascending((n: number) => n))
export const nullScoresFirst: Comparator<number | null | undefined> = nullsFirst(ascending((n: number) => n))
export const nullDatesFirst: Comparator<Date | null | undefined> = nullsFirst(byDate((d: Date) => d))

export const sortedScores: Array<number | null> = R.sort(scores, nullsLast(ascending((n: number) => n)))
export const sortedDates: Array<Date | null | undefined> = R.sort(dates, nullsFirst(byDate((d: Date) => d)))

// The extractor's type comes from the array being sorted
export const inferred: Array<number | null> = R.sort(
  scores,
  nullsLast(ascending((n) => n))
)

// A comparator that does accept null still fits, as it did before
export const withFallback: Array<number | null> = R.sort(
  scores,
  nullsFirst(ascending((n: number | null) => n ?? 0))
)

// @ts-expect-error the values are numbers, so a string comparator doesn't fit
R.sort(scores, nullsLast(ascending((s: string) => s)))

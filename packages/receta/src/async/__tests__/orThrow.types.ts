// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { filterAsyncOrThrow, mapAsyncOrThrow } from '../index'

const words: readonly string[] = ['a', 'bb']

export const mapped: Promise<number[]> = mapAsyncOrThrow(words, async (word) => word.length)
export const kept: Promise<string[]> = filterAsyncOrThrow(words, async (word) => word.length > 1)

const toLengths = mapAsyncOrThrow(async (word: string) => word.length, { concurrency: 2 })
const onlyLong = filterAsyncOrThrow(async (word: string) => word.length > 1)

export const mappedDataLast: Promise<number[]> = toLengths(words)
export const keptDataLast: Promise<string[]> = onlyLong(words)
export const inPipe: Promise<number[]> = R.pipe(words, toLengths)

// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { collect, flatten, ok, partition, type Result } from '../index'

const results: readonly Result<number, string>[] = [ok(1)]
const nested: Result<Result<number, string>, boolean> = ok(ok(1))

// TypeScript can't carry generics through an overloaded function, so a bare reference gets
// the right shape with unknown inside. Call it with () in a pipe to keep the element type.
export const collected: Result<unknown[], unknown> = R.pipe(results, collect)
export const collectedCalled: Result<number[], string> = R.pipe(results, collect())
export const split: [unknown[], unknown[]] = R.pipe(results, partition)
export const splitCalled: [number[], string[]] = R.pipe(results, partition())
export const flat: Result<unknown, unknown> = R.pipe(nested, flatten)
export const flatCalled: Result<number, unknown> = R.pipe(nested, flatten())

// Calling them directly still resolves.
export const direct: Result<number[], string> = collect(results)

// Compile-time checks: `tsc --noEmit` reads this file, and the test runner doesn't check types.
import * as R from 'remeda'
import { collect, flatten, partition, some, toNullable, type Option } from '../index'

const options: readonly Option<number>[] = [some(1)]
const nested: Option<Option<number>> = some(some(1))
const single: Option<number> = some(1)

// TypeScript can't carry generics through an overloaded function, so a bare reference gets
// the right shape with unknown inside. Call it with () in a pipe to keep the element type.
export const collected: Option<unknown[]> = R.pipe(options, collect)
export const collectedCalled: Option<number[]> = R.pipe(options, collect())
export const split: [unknown[], number] = R.pipe(options, partition)
export const splitCalled: [number[], number] = R.pipe(options, partition())
export const flat: Option<unknown> = R.pipe(nested, flatten)
export const flatCalled: Option<number> = R.pipe(nested, flatten())
export const nullable: unknown = R.pipe(single, toNullable)
export const nullableCalled: number | null = R.pipe(single, toNullable())

// Calling them directly still resolves.
export const direct: Option<number[]> = collect(options)

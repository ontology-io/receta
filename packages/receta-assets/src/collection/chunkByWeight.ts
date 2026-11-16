import * as R from 'remeda'
import { batchBy } from '@ontologyio/receta/collection'

/**
 * Splits a list into chunks whose total weight stays under a limit, keeping the items in order.
 *
 * Use when: batching rows into requests under a payload size, inserts under a parameter limit,
 * or messages under a token budget. Items fill the current chunk until the next one would push
 * it past `maxWeight`, then a new chunk starts. An item heavier than the limit on its own gets a
 * chunk to itself instead of being dropped, so check for those if the limit is hard. For a
 * limit on the number of items, use `R.chunk`.
 *
 * @example
 * ```ts
 * const rows = [
 *   { id: 1, bytes: 400 },
 *   { id: 2, bytes: 500 },
 *   { id: 3, bytes: 300 },
 *   { id: 4, bytes: 1200 },
 *   { id: 5, bytes: 100 },
 * ]
 *
 * R.pipe(chunkByWeight(rows, 1000, (row) => row.bytes), R.map(R.map(R.prop('id'))))
 * // => [[1, 2], [3], [4], [5]]
 *
 * R.pipe(['a', 'bb', 'ccc', 'd'], chunkByWeight(4, (word) => word.length))
 * // => [['a', 'bb'], ['ccc', 'd']]
 * ```
 *
 * @tags chunk, batch, split, payload size, limit, budget, bin packing, bulk insert, tokens
 * @see batchBy - @ontologyio/receta/collection, cuts the list where the chunk number changes
 */
export function chunkByWeight<T>(
  items: readonly T[],
  maxWeight: number,
  weight: (item: T) => number,
): readonly (readonly T[])[]
export function chunkByWeight<T>(
  maxWeight: number,
  weight: (item: T) => number,
): (items: readonly T[]) => readonly (readonly T[])[]
export function chunkByWeight(...args: unknown[]): unknown {
  return R.purry(chunkByWeightImplementation, args)
}

type Fill = { readonly chunk: number; readonly used: number }

const chunkByWeightImplementation = <T>(
  items: readonly T[],
  maxWeight: number,
  weight: (item: T) => number,
): readonly (readonly T[])[] => {
  // Start as if a full chunk were open, so the first item always opens chunk 0.
  const fills = R.mapWithFeedback(
    items,
    (fill: Fill, item): Fill => {
      const next = fill.used + weight(item)
      return next > maxWeight ? { chunk: fill.chunk + 1, used: weight(item) } : { chunk: fill.chunk, used: next }
    },
    { chunk: -1, used: Number.POSITIVE_INFINITY },
  )
  return R.pipe(
    batchBy(R.zip(items, fills), ([, fill]) => fill.chunk),
    R.map((chunk) => R.map(chunk, ([item]) => item)),
  )
}

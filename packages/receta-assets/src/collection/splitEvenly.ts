import * as R from 'remeda'
import { batchBy } from '@ontologyio/receta/collection'

/**
 * Splits a list into a given number of parts whose sizes differ by at most one, keeping the order.
 *
 * Use when: dividing work among n workers, laying out items in n columns, or sharding a batch
 * across n requests, where `R.chunk` would fix the size of each part instead of how many parts
 * there are. Bigger parts come first. There are never more parts than items, so 2 items split
 * into 3 parts give 2 parts of one. A `parts` below 1 gives `[]`.
 *
 * @example
 * ```ts
 * splitEvenly(R.range(1, 11), 3)
 * // => [[1, 2, 3, 4], [5, 6, 7], [8, 9, 10]]
 *
 * splitEvenly(R.range(1, 11), 4)
 * // => [[1, 2, 3], [4, 5, 6], [7, 8], [9, 10]]
 *
 * R.pipe(['a', 'b'], splitEvenly(3))
 * // => [['a'], ['b']]
 *
 * splitEvenly([1, 2, 3], 0)
 * // => []
 * ```
 *
 * @tags split, partition, columns, shards, workers, distribute, balance, divide, parts, chunk
 * @see chunkByWeight - parts limited by a total weight instead of a count
 * @see batchBy - @ontologyio/receta/collection, cuts the list where the part number changes
 */
export function splitEvenly<T>(items: readonly T[], parts: number): readonly (readonly T[])[]
export function splitEvenly(parts: number): <T>(items: readonly T[]) => readonly (readonly T[])[]
export function splitEvenly(...args: unknown[]): unknown {
  return R.purry(splitEvenlyImplementation, args)
}

const splitEvenlyImplementation = <T>(items: readonly T[], parts: number): readonly (readonly T[])[] => {
  const count = Math.floor(parts)
  if (count < 1) return []
  // The first `extra` parts take one item more than the rest.
  const size = Math.floor(items.length / count)
  const extra = items.length % count
  const bigPartsEnd = extra * (size + 1)
  const partOf = (index: number): number =>
    index < bigPartsEnd ? Math.floor(index / (size + 1)) : extra + Math.floor((index - bigPartsEnd) / size)
  return R.pipe(
    items,
    R.map((item, index) => ({ item, part: partOf(index) })),
    batchBy((entry) => entry.part),
    R.map(R.map((entry) => entry.item)),
  )
}

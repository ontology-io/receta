import * as R from 'remeda'
import { mapAsync } from '@ontologyio/receta/async'
import { map, mapErr, type Result } from '@ontologyio/receta/result'

export type PartitionAsyncOptions = {
  /** How many checks run at once. Defaults to all of them. */
  readonly concurrency?: number
}

export type PartitionAsyncError = {
  readonly code: 'CHECK_FAILED'
  /** Which item's check failed. */
  readonly index: number
  readonly error: unknown
  readonly message: string
}

/**
 * Splits items in two with an async check: the items that pass, then the items that don't.
 *
 * Use when: deciding needs a lookup per item and both groups matter, such as which emails
 * can receive mail and which bounce, which SKUs are in stock, or which users exist in
 * another system. Both groups keep the input order. A check that throws fails the whole
 * split, since the item would belong to neither group.
 *
 * @example
 * ```ts
 * const inStock = async (sku: string) => sku !== 'mug-blue'
 *
 * await partitionAsync(['mug-red', 'mug-blue', 'cap'], inStock, { concurrency: 2 })
 * // => Ok([['mug-red', 'cap'], ['mug-blue']])
 *
 * const brokenCheck = async (sku: string) => (sku === 'cap' ? Promise.reject('timeout') : true)
 *
 * await partitionAsync(['mug-red', 'cap'], brokenCheck)
 * // => Err({ code: 'CHECK_FAILED', index: 1, error: 'timeout', message: 'The check for item 1 failed' })
 * ```
 *
 * @tags partition, split, async predicate, filter, group, availability, lookup
 * @see filterAsync - @ontologyio/receta/async, keeps only the items that pass
 * @see mapAsync - @ontologyio/receta/async, runs the checks with a concurrency limit
 */
export async function partitionAsync<T>(
  items: readonly T[],
  check: (item: T, index: number) => Promise<boolean>,
  options: PartitionAsyncOptions = {},
): Promise<Result<[T[], T[]], PartitionAsyncError>> {
  const checkOne = async (item: T, index: number) => ({ item, passed: await check(item, index) })
  return R.pipe(
    await mapAsync(items, checkOne, options),
    map((checked): [T[], T[]] => {
      const [passed, failed] = R.partition(checked, R.prop('passed'))
      const items = (group: typeof checked) => R.map(group, (entry) => entry.item)
      return [items(passed), items(failed)]
    }),
    mapErr(({ index, error }): PartitionAsyncError => ({
      code: 'CHECK_FAILED',
      index,
      error,
      message: `The check for item ${index} failed`,
    })),
  )
}

import * as R from 'remeda'
import type { Option } from './types'
import { isSome } from './guards'

/**
 * Partitions an array of Options into Some values and count of Nones.
 *
 * Returns a tuple of [Some values[], None count].
 *
 * @param options - Array of Options to partition
 * @returns Tuple of [values from Some, count of None]
 *
 * @example
 * ```typescript
 * const results = [some(1), none(), some(2), none(), some(3)]
 *
 * partition(results)
 * // => [[1, 2, 3], 2]
 *
 * // Real-world: processing batch operations
 * const processUsers = async (ids: string[]) => {
 *   const results = await Promise.all(
 *     ids.map(id => fetchUser(id))
 *   )
 *
 *   const [users, failedCount] = partition(results)
 *   console.log(`Processed ${users.length}, failed ${failedCount}`)
 *   return users
 * }
 * ```
 *
 * @see collect - for requiring all to be Some
 */
export function partition<T>(options: readonly Option<T>[]): [T[], number]
export function partition<T>(): (options: readonly Option<T>[]) => [T[], number]
export function partition(...args: unknown[]): unknown {
  return R.purry(partitionImplementation, args)
}

function partitionImplementation<T>(options: readonly Option<T>[]): [T[], number] {
  const values: T[] = []
  let noneCount = 0

  for (const option of options) {
    if (isSome(option)) {
      values.push(option.value)
    } else {
      noneCount++
    }
  }

  return [values, noneCount]
}

import * as R from 'remeda'
import { memoizeAsync } from '@ontologyio/receta/memo'
import { fromNullable, type Option } from '@ontologyio/receta/option'
import { map, tryCatchAsync, type Result } from '@ontologyio/receta/result'

export type TtlLookupTableOptions = {
  /** How long the loaded table is used before the next lookup loads it again. */
  readonly ttlMs: number
}

export type TtlLookupTableError = {
  readonly code: 'LOAD_FAILED'
  readonly error: unknown
  readonly message: string
}

/**
 * Loads a whole reference table at once, keeps it for a while, and answers lookups by key from it.
 *
 * Use when: lookups hit small, slow-changing reference data, such as currencies, countries,
 * plans, feature flags or tax rates, and one request for the whole table beats one request
 * per key. The table is indexed by `keyOf` once per load. A key not in the table is
 * `Ok(None)`. Concurrent lookups share one load, and a failed load isn't kept, so the next
 * lookup tries again.
 *
 * @example
 * ```ts
 * import { sleep } from '@ontologyio/receta/async'
 *
 * let loads = 0
 * const loadCurrencies = async () => {
 *   loads += 1
 *   return [{ code: 'EUR', symbol: '€' }, { code: 'JPY', symbol: '¥' }]
 * }
 * const currency = ttlLookupTable(loadCurrencies, (row) => row.code, { ttlMs: 20 })
 *
 * await currency('EUR')
 * // => Ok(Some({ code: 'EUR', symbol: '€' }))
 *
 * await currency('XYZ')
 * // => Ok(None)
 *
 * loads
 * // => 1
 *
 * await sleep(25)
 * await currency('JPY')
 * loads
 * // => 2
 * ```
 *
 * @tags lookup table, reference data, ttl, index, currencies, countries, feature flags, cache
 * @see memoizeAsync - @ontologyio/receta/memo, keeps the table and shares its load
 * @see cachedLookup - caches one lookup per key instead of the whole table
 */
export function ttlLookupTable<V>(
  loadAll: () => Promise<readonly V[]>,
  keyOf: (row: V) => string,
  options: TtlLookupTableOptions,
): (key: string) => Promise<Result<Option<V>, TtlLookupTableError>> {
  const table = memoizeAsync(async () => R.indexBy(await loadAll(), keyOf), {
    ttl: options.ttlMs,
    keyFn: () => 'table',
  })
  return async (key) =>
    R.pipe(
      await tryCatchAsync(
        () => table(),
        (error): TtlLookupTableError => ({ code: 'LOAD_FAILED', error, message: 'Loading the table failed' }),
      ),
      map((rows) => fromNullable(rows[key])),
    )
}

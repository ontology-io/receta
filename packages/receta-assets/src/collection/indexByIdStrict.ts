import * as R from 'remeda'
import { indexByUnique } from '@ontologyio/receta/collection'
import { by, gt } from '@ontologyio/receta/predicate'
import { mapErr, type Result } from '@ontologyio/receta/result'

export type IndexByIdStrictError = {
  readonly code: 'DUPLICATE_ID'
  /** Every id that appears more than once, in the order they first appear. */
  readonly ids: readonly (string | number)[]
  readonly message: string
}

/**
 * Builds an id-to-item lookup, and fails with every repeated id when ids aren't unique.
 *
 * Use when: normalizing API data into a lookup by id, or loading seed data or a config list
 * where a repeated id is a bug that must not be hidden by "last one wins". The error lists all
 * repeated ids at once, so one run shows every row to fix. Ids compare as strings, so `1` and
 * `'1'` count as the same id.
 *
 * @example
 * ```ts
 * const users = [
 *   { id: 'u1', name: 'Ana' },
 *   { id: 'u2', name: 'Bo' },
 * ]
 *
 * indexByIdStrict(users)
 * // => Ok({ u1: { id: 'u1', name: 'Ana' }, u2: { id: 'u2', name: 'Bo' } })
 *
 * indexByIdStrict([{ id: 7 }, { id: 3 }, { id: 7 }, { id: 3 }, { id: 1 }])
 * // => Err({ code: 'DUPLICATE_ID', ids: [7, 3], message: 'These ids appear more than once: 7, 3' })
 * ```
 *
 * @tags index, lookup, map, normalize, unique, duplicate, id, dictionary, keyBy, strict
 * @see indexByUnique - @ontologyio/receta/collection, stops at the first repeated key
 * @see dedupeByKeepFirst - removes the repeated rows instead of failing
 */
export function indexByIdStrict<T extends { readonly id: string | number }>(
  items: readonly T[],
): Result<Readonly<Record<T['id'], T>>, IndexByIdStrictError> {
  return R.pipe(
    indexByUnique(items, (item): T['id'] => item.id),
    // indexByUnique stops at the first repeat, so count every id to report all of them.
    mapErr((): IndexByIdStrictError => {
      const counts = R.countBy(items, (item) => String(item.id))
      const ids = R.pipe(
        items,
        R.map((item) => item.id),
        R.uniqueBy(String),
        R.filter(by((id) => counts[String(id)] ?? 0, gt(1))),
      )
      return { code: 'DUPLICATE_ID', ids, message: `These ids appear more than once: ${R.join(ids, ', ')}` }
    }),
  )
}

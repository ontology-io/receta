import * as R from 'remeda'
import { fromNullable, map, unwrapOr } from '@ontologyio/receta/option'
import { by, isDefined, not } from '@ontologyio/receta/predicate'

export type MergeByIdPatch<T extends { readonly id: string | number }> = Partial<T> & Pick<T, 'id'>

export type MergeByIdResult<T extends { readonly id: string | number }> = {
  /** Every item, with the fields of its patches copied over it, in the original order. */
  readonly items: readonly T[]
  /** Patches whose id is not in the list, in input order. */
  readonly unmatched: readonly MergeByIdPatch<T>[]
}

/**
 * Applies partial patches to a list by `id`, and returns the patches that matched no item.
 *
 * Use when: an API answers a bulk edit with only the changed fields, or a form edits a few
 * columns of many rows, and the list should take those fields without replacing whole items.
 * Several patches for one id apply in order, so a later field wins. A patch with an unknown id
 * can't become an item, since it lacks fields, so it comes back in `unmatched` to report or
 * refetch. Patches are shallow: a nested object in a patch replaces the whole nested object.
 *
 * ```text
 *  STEP                       DATA AFTER IT
 *  ─────────────────────────  ───────────────────────────────────────────────
 *  patches                    [{ id 1, qty 3 }, { id 9, qty 1 }, { id 1, note }]
 *  R.groupBy(id)              { 1: [{ qty 3 }, { note }], 9: [{ qty 1 }] }
 *  R.map(items, spread group  [item 1 with qty 3 and note, item 2 as it was]
 *    over the item)
 *  R.filter(id not in items)  unmatched: [{ id 9, qty 1 }]
 * ```
 *
 * @example
 * ```ts
 * const rows = [
 *   { id: 1, name: 'Desk', qty: 1, note: '' },
 *   { id: 2, name: 'Lamp', qty: 4, note: '' },
 * ]
 *
 * mergeById(rows, [{ id: 1, qty: 3 }, { id: 9, qty: 1 }, { id: 1, note: 'oak' }])
 * // => {
 * //   items: [
 * //     { id: 1, name: 'Desk', qty: 3, note: 'oak' },
 * //     { id: 2, name: 'Lamp', qty: 4, note: '' },
 * //   ],
 * //   unmatched: [{ id: 9, qty: 1 }],
 * // }
 *
 * R.pipe(rows, mergeById([{ id: 2, qty: 0 }]), (result) => R.map(result.items, R.prop('qty')))
 * // => [1, 0]
 * ```
 *
 * @tags merge, patch, partial update, bulk edit, apply changes, sync, id, list
 * @see upsertManyById - merges whole items and appends new ones
 * @see updateById - one change to one item, failing when the id is missing
 */
export function mergeById<T extends { readonly id: string | number }>(
  items: readonly T[],
  patches: readonly MergeByIdPatch<NoInfer<T>>[],
): MergeByIdResult<T>
export function mergeById<T extends { readonly id: string | number }>(
  patches: readonly MergeByIdPatch<T>[],
): (items: readonly T[]) => MergeByIdResult<T>
export function mergeById(...args: unknown[]): unknown {
  return R.purry(mergeByIdImplementation, args)
}

const mergeByIdImplementation = <T extends { readonly id: string | number }>(
  items: readonly T[],
  patches: readonly MergeByIdPatch<T>[],
): MergeByIdResult<T> => {
  // Keys go through String, so an id of 1 and of '1' meet in one group.
  const patchesById = R.groupBy(patches, (patch) => String(patch.id))
  const known = R.indexBy(items, (item) => String(item.id))
  const applyPatches = (item: T): T =>
    R.pipe(
      fromNullable(patchesById[String(item.id)]),
      // Patches for one id apply in input order, so a later field wins.
      map((group) => R.reduce(group, (merged: T, patch) => ({ ...merged, ...patch }), item)),
      unwrapOr(item),
    )
  const hasItem = by((patch: MergeByIdPatch<T>) => known[String(patch.id)], isDefined)
  return { items: R.map(items, applyPatches), unmatched: R.filter(patches, not(hasItem)) }
}

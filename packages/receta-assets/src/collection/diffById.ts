import * as R from 'remeda'
import { diff } from '@ontologyio/receta/collection'
import { ascending } from '@ontologyio/receta/compare'

export type DiffByIdChange<T> = {
  readonly id: string | number
  readonly before: T
  readonly after: T
  /** The top-level fields whose values differ, compared deeply. */
  readonly fields: readonly string[]
}

export type DiffByIdResult<T> = {
  /** In `after` but not in `before`, in `after` order. */
  readonly added: readonly T[]
  /** In `before` but not in `after`, in `before` order. */
  readonly removed: readonly T[]
  /** In both with different contents, in `after` order. */
  readonly changed: readonly DiffByIdChange<T>[]
  /** In both and deeply equal, in `after` order. */
  readonly unchanged: readonly T[]
}

/**
 * Compares two versions of a list by `id`: what was added, removed, changed (and which fields), and kept.
 *
 * Use when: syncing a local copy with the server, writing an audit log ("price changed"), or
 * turning a form's list into create, update and delete calls. Each part keeps the order of the
 * list it comes from. Ids are expected to be unique in each list; a repeated id counts once,
 * with its last copy. Ids compare as strings, so `1` and `'1'` are the same id.
 *
 * ```text
 *  item in after ──▶ ⟨ id in before? ⟩──no────▶ ╭───────╮
 *                           │ yes               │ added │
 *                           ▼                   ╰───────╯
 *                    ⟨ deep equal? ⟩──yes──▶ ╭───────────╮
 *                           │ no             │ unchanged │
 *                           ▼                ╰───────────╯
 *          ╭───────────────────────────────────────╮
 *          │ changed { id, before, after, fields } │
 *          ╰───────────────────────────────────────╯
 *
 *  item in before ──▶ ⟨ id in after? ⟩──no──▶ ╭─────────╮
 *                                             │ removed │
 *                                             ╰─────────╯
 * ```
 *
 * @example
 * ```ts
 * const before = [
 *   { id: 10, name: 'Desk', price: 120 },
 *   { id: 2, name: 'Lamp', price: 30 },
 *   { id: 7, name: 'Chair', price: 80 },
 * ]
 * const after = [
 *   { id: 10, name: 'Desk', price: 99 },
 *   { id: 2, name: 'Lamp', price: 30 },
 *   { id: 5, name: 'Shelf', price: 45 },
 * ]
 *
 * diffById(before, after)
 * // => {
 * //   added: [{ id: 5, name: 'Shelf', price: 45 }],
 * //   removed: [{ id: 7, name: 'Chair', price: 80 }],
 * //   changed: [{
 * //     id: 10,
 * //     before: { id: 10, name: 'Desk', price: 120 },
 * //     after: { id: 10, name: 'Desk', price: 99 },
 * //     fields: ['price'],
 * //   }],
 * //   unchanged: [{ id: 2, name: 'Lamp', price: 30 }],
 * // }
 *
 * R.pipe([{ id: 'a', tags: ['x'] }], diffById([{ id: 'a', tags: ['x'] }]), R.prop('unchanged'))
 * // => [{ id: 'a', tags: ['x'] }]
 * ```
 *
 * @tags diff, compare, changes, sync, audit, changelog, added, removed, updated, delta, id
 * @see diff - @ontologyio/receta/collection, the comparison underneath, which orders numeric ids by value
 * @see reconcileById - compares two different sources instead of two versions of one list
 */
export function diffById<T extends { readonly id: string | number }>(
  before: readonly T[],
  after: readonly NoInfer<T>[],
): DiffByIdResult<T>
export function diffById<T extends { readonly id: string | number }>(
  after: readonly T[],
): (before: readonly T[]) => DiffByIdResult<T>
export function diffById(...args: unknown[]): unknown {
  return R.purry(diffByIdImplementation, args)
}

const differentFields = <T extends object>(before: T, after: T): readonly string[] =>
  R.pipe(
    [...R.keys(before), ...R.keys(after)],
    R.unique(),
    R.filter((field) => !R.isDeepEqual(R.prop(before, field), R.prop(after, field))),
  )

const diffByIdImplementation = <T extends { readonly id: string | number }>(
  before: readonly T[],
  after: readonly T[],
): DiffByIdResult<T> => {
  const { added, removed, updated, unchanged } = diff(before, after, (item) => item.id)
  // diff walks ids as object keys, which puts integer ids in numeric order, so restore the input order.
  const positionIn = (list: readonly T[]) => {
    const positions = new Map(R.map(list, (item, index) => [String(item.id), index] as const))
    return (item: T): number => positions.get(String(item.id)) ?? 0
  }
  const inAfterOrder = ascending(positionIn(after))
  return {
    added: R.sort(added, inAfterOrder),
    removed: R.sort(removed, ascending(positionIn(before))),
    changed: R.pipe(
      updated,
      R.sort((a, b) => inAfterOrder(a.new, b.new)),
      R.map(({ old, new: next }) => ({ id: next.id, before: old, after: next, fields: differentFields(old, next) })),
    ),
    unchanged: R.sort(unchanged, inAfterOrder),
  }
}

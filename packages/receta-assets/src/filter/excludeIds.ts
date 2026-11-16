import { by, not, type Predicate } from '@ontologyio/receta/predicate'

/**
 * Builds a predicate that drops items whose `id` is in a list, checking each id in constant time.
 *
 * Use when: a feed or suggestion list must hide what the person dismissed, blocked, already
 * saw or already has, and the id list may hold thousands of entries. The ids go into a `Set`
 * once, so filtering stays fast where `oneOf` would scan the list for every item; a `Set` you
 * already hold works as it is. Ids match exactly: `7` and `'7'` are different.
 *
 * @example
 * ```ts
 * const suggestions = [{ id: 'u1', name: 'Ada' }, { id: 'u2', name: 'Grace' }, { id: 'u3', name: 'Alan' }]
 *
 * R.filter(suggestions, excludeIds(['u2', 'u9']))
 * // => [{ id: 'u1', name: 'Ada' }, { id: 'u3', name: 'Alan' }]
 *
 * const dismissed = new Set([2, 3])
 * R.filter([{ id: 1 }, { id: 2 }, { id: 4 }], excludeIds(dismissed))
 * // => [{ id: 1 }, { id: 4 }]
 * ```
 *
 * @tags exclude, ids, hide, dismissed, blocked, seen, blacklist, set, filter
 * @see oneOf - @ontologyio/receta/predicate, membership by scanning the list
 */
export function excludeIds<Id>(ids: Iterable<Id>): Predicate<{ readonly id: Id }> {
  const excluded = new Set(ids)
  return by((item: { readonly id: Id }) => item.id, not((id: Id) => excluded.has(id)))
}

import { eq, oneOf, or, where, type Predicate } from '@ontologyio/receta/predicate'

export type IsVisibleToItem = {
  readonly visibility: 'public' | 'team' | 'private'
  readonly ownerId: string
  /** The team that `team` visibility shares with. */
  readonly teamId?: string | null | undefined
}

export type IsVisibleToViewer = {
  readonly id: string
  readonly teamIds: readonly string[]
}

/**
 * Builds a predicate for the items a person may see: public ones, their own, and their teams' shared ones.
 *
 * Use when: a list of documents, boards, dashboards or files mixes public, team-shared and
 * private items, and each person should see only theirs. An owner always sees their item,
 * whatever its visibility. A `team` item is seen by members of its team, and one without a
 * team only by its owner. Run the same rule in the database query or API too: a filter in the
 * browser hides items, it doesn't protect them.
 *
 * @example
 * ```ts
 * const docs = [
 *   { title: 'Roadmap', visibility: 'public', ownerId: 'u1' },
 *   { title: 'Sprint notes', visibility: 'team', ownerId: 'u2', teamId: 'eng' },
 *   { title: 'Salaries', visibility: 'private', ownerId: 'u3' },
 *   { title: 'Diary', visibility: 'private', ownerId: 'u9' },
 * ] as const
 *
 * R.map(R.filter(docs, isVisibleTo({ id: 'u9', teamIds: ['eng'] })), R.prop('title'))
 * // => ['Roadmap', 'Sprint notes', 'Diary']
 *
 * R.map(R.filter(docs, isVisibleTo({ id: 'u5', teamIds: [] })), R.prop('title'))
 * // => ['Roadmap']
 * ```
 *
 * @tags permissions, visibility, access, sharing, private, team, owner, acl, filter
 * @see where - @ontologyio/receta/predicate, the per-field checks combined here
 */
export function isVisibleTo(viewer: IsVisibleToViewer): Predicate<IsVisibleToItem> {
  return or(
    where<IsVisibleToItem>({ visibility: eq('public') }),
    where<IsVisibleToItem>({ ownerId: eq(viewer.id) }),
    where<IsVisibleToItem>({ visibility: eq('team'), teamId: oneOf<string, string | null | undefined>(viewer.teamIds) }),
  )
}

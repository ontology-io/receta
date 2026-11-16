import * as R from 'remeda'
import { flatten } from '@ontologyio/receta/collection'
import { fromNullable, map, type Option } from '@ontologyio/receta/option'
import { by } from '@ontologyio/receta/predicate'

/**
 * Finds the first node that matches and returns the path to it, from its root down to the node itself.
 *
 * Use when: building breadcrumbs for the page a user is on, expanding the ancestors of a
 * selected node in a tree view, or showing where a file lives. Nodes are searched depth-first,
 * so with several matches the one met first wins. Returns `None` when nothing matches.
 *
 * @example
 * ```ts
 * import { map } from '@ontologyio/receta/option'
 * import { eq, where } from '@ontologyio/receta/predicate'
 *
 * type Page = { readonly slug: string; readonly children?: readonly Page[] }
 * const site: readonly Page[] = [
 *   { slug: 'docs', children: [{ slug: 'guides', children: [{ slug: 'install' }] }] },
 *   { slug: 'blog' },
 * ]
 * const childrenOf = (page: Page) => page.children ?? []
 *
 * R.pipe(
 *   findTreePath(site, childrenOf, where({ slug: eq('install') })),
 *   map(R.map(R.prop('slug'))),
 * )
 * // => Some(['docs', 'guides', 'install'])
 *
 * R.pipe(site, findTreePath(childrenOf, where({ slug: eq('pricing') })))
 * // => None
 * ```
 *
 * @tags tree, path, breadcrumbs, ancestors, find, search, parents, navigation, hierarchy
 * @see treeToRows - the rows of the whole tree for a tree view
 * @see flatten - @ontologyio/receta/collection, the depth-first walk that records each path
 */
export function findTreePath<T>(
  roots: readonly T[],
  children: (node: T) => readonly T[],
  isTarget: (node: T) => boolean,
): Option<readonly T[]>
export function findTreePath<T>(
  children: (node: T) => readonly T[],
  isTarget: (node: T) => boolean,
): (roots: readonly T[]) => Option<readonly T[]>
export function findTreePath(...args: unknown[]): unknown {
  return R.purry(findTreePathImplementation, args)
}

const findTreePathImplementation = <T>(
  roots: readonly T[],
  children: (node: T) => readonly T[],
  isTarget: (node: T) => boolean,
): Option<readonly T[]> =>
  R.pipe(
    flatten(roots, { getChildren: children, includePath: true }),
    R.find(by((entry) => entry.item, isTarget)),
    fromNullable,
    // flatten's path holds the ancestors, so the node itself goes on the end.
    map(({ item, path }) => [...path, item]),
  )

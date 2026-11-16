import * as R from 'remeda'
import { flatten } from '@ontologyio/receta/collection'
import { by, isNullish, not, oneOf } from '@ontologyio/receta/predicate'

export type BuildTreeItem = {
  readonly id: string | number
  readonly parentId?: string | number | null | undefined
}

export type BuildTreeNode<T> = T & { readonly children: readonly BuildTreeNode<T>[] }

export type BuildTreeResult<T> = {
  /** Items without a parent, each with its descendants nested in `children`, in input order. */
  readonly roots: readonly BuildTreeNode<T>[]
  /** Items no root leads to: their parent is missing, or they sit in a cycle. In input order. */
  readonly orphans: readonly T[]
}

/**
 * Nests a flat list of rows with `id` and `parentId` into a tree, and returns the rows it couldn't place.
 *
 * Use when: categories, comments, folders or an org chart come from a database as flat rows
 * and the UI needs them nested. A `parentId` of `null` or `undefined` makes a root. Children
 * keep their input order. A row whose parent is missing, or that sits in a cycle, can't hang
 * from a root, so it lands in `orphans` instead of vanishing or looping forever. Ids compare
 * as strings, so a `parentId` of `'1'` finds the row with `id: 1`.
 *
 * ```text
 *  STEP                          DATA AFTER IT
 *  ────────────────────────────  ────────────────────────────────────────
 *  items                         [1 root, 2 → 1, 3 → 2, 4 root, 5 → 99]
 *  R.groupBy(parentId)           { 1: [2], 2: [3], 99: [5] }
 *  build each root, recursively  [1 { children: [2 { children: [3] }] }, 4]
 *  flatten, collect reached ids  1, 2, 3, 4
 *  R.filter(not reached)         orphans: [5]
 * ```
 *
 * @example
 * ```ts
 * const categories = [
 *   { id: 1, name: 'Home', parentId: null },
 *   { id: 2, name: 'Kitchen', parentId: 1 },
 *   { id: 3, name: 'Knives', parentId: 2 },
 *   { id: 4, name: 'Garden', parentId: null },
 *   { id: 5, name: 'Lost', parentId: 99 },
 * ]
 *
 * buildTree(categories)
 * // => {
 * //   roots: [
 * //     { id: 1, name: 'Home', parentId: null, children: [
 * //       { id: 2, name: 'Kitchen', parentId: 1, children: [
 * //         { id: 3, name: 'Knives', parentId: 2, children: [] },
 * //       ] },
 * //     ] },
 * //     { id: 4, name: 'Garden', parentId: null, children: [] },
 * //   ],
 * //   orphans: [{ id: 5, name: 'Lost', parentId: 99 }],
 * // }
 *
 * buildTree([{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }])
 * // => { roots: [], orphans: [{ id: 'a', parentId: 'b' }, { id: 'b', parentId: 'a' }] }
 * ```
 *
 * @tags tree, nest, hierarchy, parent, children, categories, comments, folders, org chart, adjacency list
 * @see treeToRows - flattens the tree back into rows for a tree table
 * @see flatten - @ontologyio/receta/collection, walks the built tree to find what was reached
 */
export function buildTree<T extends BuildTreeItem>(items: readonly T[]): BuildTreeResult<T> {
  const isRoot = by((item: T) => item.parentId, isNullish)
  const childrenByParent = R.groupBy(R.filter(items, not(isRoot)), (item) => String(item.parentId))

  // A path of ids from the root guards against a repeated id making a node its own descendant.
  const build = (item: T, ancestors: readonly string[]): BuildTreeNode<T> => {
    const path = [...ancestors, String(item.id)]
    const children = R.pipe(
      childrenByParent[String(item.id)] ?? [],
      R.filter(not(by((child: T) => String(child.id), oneOf(path)))),
      R.map((child) => build(child, path)),
    )
    return { ...item, children }
  }

  const roots = R.map(R.filter(items, isRoot), (root) => build(root, []))
  const reached = new Set(R.map(flatten(roots, { getChildren: (node) => node.children }), (node) => String(node.id)))
  const isReached = (item: T): boolean => reached.has(String(item.id))
  return { roots, orphans: R.filter(items, not(isReached)) }
}

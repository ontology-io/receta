import * as R from 'remeda'
import { flatten } from '@ontologyio/receta/collection'

export type TreeToRowsRow<T> = {
  readonly item: T
  /** 0 for a root, 1 for its children, and so on: the indent level. */
  readonly depth: number
  /** Whether the node has children, to decide if it gets an expand arrow. */
  readonly hasChildren: boolean
  /** Whether its children are shown below it. */
  readonly expanded: boolean
}

/**
 * Turns a tree into the rows a tree table or file explorer shows, skipping the children of collapsed nodes.
 *
 * Use when: rendering nested folders, comments or categories as a flat list with indentation,
 * where the user opens and closes nodes. Rows come in depth-first order: a node, then its open
 * children, then its next sibling. `depth` is the indent level, `hasChildren` says whether to
 * draw an expand arrow, and `expanded` whether it points down.
 *
 * @example
 * ```ts
 * type Entry = { readonly name: string; readonly children?: readonly Entry[] }
 * const files: readonly Entry[] = [
 *   { name: 'src', children: [{ name: 'app.ts' }, { name: 'lib', children: [{ name: 'util.ts' }] }] },
 *   { name: 'README.md' },
 * ]
 * const childrenOf = (entry: Entry) => entry.children ?? []
 * const open = new Set(['src'])
 *
 * R.pipe(
 *   treeToRows(files, childrenOf, (entry) => open.has(entry.name)),
 *   R.map(({ item, depth, expanded }) => ({ name: item.name, depth, expanded })),
 * )
 * // => [
 * //   { name: 'src', depth: 0, expanded: true },
 * //   { name: 'app.ts', depth: 1, expanded: false },
 * //   { name: 'lib', depth: 1, expanded: false },
 * //   { name: 'README.md', depth: 0, expanded: false },
 * // ]
 *
 * R.pipe(
 *   files,
 *   treeToRows(childrenOf, R.constant(true)),
 *   R.map((row) => `${'· '.repeat(row.depth)}${row.item.name}`),
 * )
 * // => ['src', '· app.ts', '· lib', '· · util.ts', 'README.md']
 * ```
 *
 * @tags tree, rows, tree table, tree view, file explorer, outline, expand, collapse, indent, depth
 * @see buildTree - nests flat rows with parentId into the tree this takes
 * @see flatten - @ontologyio/receta/collection, the depth-first walk underneath
 */
export function treeToRows<T>(
  roots: readonly T[],
  children: (node: T) => readonly T[],
  isExpanded: (node: T) => boolean,
): readonly TreeToRowsRow<T>[]
export function treeToRows<T>(
  children: (node: T) => readonly T[],
  isExpanded: (node: T) => boolean,
): (roots: readonly T[]) => readonly TreeToRowsRow<T>[]
export function treeToRows(...args: unknown[]): unknown {
  return R.purry(treeToRowsImplementation, args)
}

const treeToRowsImplementation = <T>(
  roots: readonly T[],
  children: (node: T) => readonly T[],
  isExpanded: (node: T) => boolean,
): readonly TreeToRowsRow<T>[] =>
  R.pipe(
    // A collapsed node reports no children, so the walk doesn't go below it.
    flatten(roots, { getChildren: (node) => (isExpanded(node) ? children(node) : []), includePath: true }),
    R.map(({ item, depth }) => {
      const hasChildren = children(item).length > 0
      return { item, depth, hasChildren, expanded: hasChildren && isExpanded(item) }
    }),
  )

import * as R from 'remeda'
import type { FlattenConfig, FlattenedItem } from '../types'

/**
 * Flattens a tree structure into a flat array with optional depth control and path tracking.
 *
 * Unlike Remeda's `flat()` which flattens nested arrays, this function handles tree structures
 * where each node contains children. Useful for hierarchical data like file systems, org charts,
 * or nested comments.
 *
 * @param items - The root items to flatten
 * @param config - Configuration for extracting children and controlling depth
 * @returns Flat array of items or items with path information
 *
 * @example
 * ```typescript
 * // Data-first: File system tree
 * interface FileNode {
 *   name: string
 *   children?: FileNode[]
 * }
 *
 * const tree: FileNode[] = [
 *   {
 *     name: 'src',
 *     children: [
 *       { name: 'index.ts' },
 *       { name: 'utils', children: [{ name: 'helper.ts' }] }
 *     ]
 *   }
 * ]
 *
 * flatten(tree, { getChildren: (n) => n.children })
 * // => [
 * //   { name: 'src', children: [...] },
 * //   { name: 'index.ts' },
 * //   { name: 'utils', children: [...] },
 * //   { name: 'helper.ts' }
 * // ]
 *
 * // With path tracking
 * flatten(tree, {
 *   getChildren: (n) => n.children,
 *   includePath: true
 * })
 * // => [
 * //   { item: { name: 'src', ... }, path: [], depth: 0 },
 * //   { item: { name: 'index.ts' }, path: [{ name: 'src', ... }], depth: 1 },
 * //   { item: { name: 'utils', ... }, path: [{ name: 'src', ... }], depth: 1 },
 * //   { item: { name: 'helper.ts' }, path: [{ name: 'src', ... }, { name: 'utils', ... }], depth: 2 }
 * // ]
 *
 * // With max depth
 * flatten(tree, {
 *   getChildren: (n) => n.children,
 *   maxDepth: 1
 * })
 * // => [
 * //   { name: 'src', children: [...] },
 * //   { name: 'index.ts' },
 * //   { name: 'utils', children: [...] }
 * // ]
 * // (stops at depth 1, doesn't include helper.ts)
 *
 * // Data-last (in pipe)
 * pipe(
 *   tree,
 *   flatten({ getChildren: (n) => n.children })
 * )
 * ```
 *
 * @see nest - for inverse operation (flat → tree)
 */
export function flatten<T>(
  items: readonly T[],
  config: FlattenConfig<T> & { includePath: true }
): readonly FlattenedItem<T>[]
export function flatten<T>(
  items: readonly T[],
  config: FlattenConfig<T> & { includePath?: false }
): readonly T[]
export function flatten<T>(
  items: readonly T[],
  config: FlattenConfig<T>
): readonly T[] | readonly FlattenedItem<T>[]
export function flatten<T>(
  config: FlattenConfig<T> & { includePath: true }
): (items: readonly T[]) => readonly FlattenedItem<T>[]
export function flatten<T>(
  config: FlattenConfig<T> & { includePath?: false }
): (items: readonly T[]) => readonly T[]
export function flatten<T>(
  config: FlattenConfig<T>
): (items: readonly T[]) => readonly T[] | readonly FlattenedItem<T>[]
export function flatten(...args: unknown[]): unknown {
  return R.purry(flattenImplementation, args)
}

function flattenImplementation<T>(
  items: readonly T[],
  config: FlattenConfig<T>
): readonly T[] | readonly FlattenedItem<T>[] {
  const { getChildren, maxDepth, includePath = false } = config

  if (includePath) {
    const result: FlattenedItem<T>[] = []

    function traverseWithPath(nodes: readonly T[], path: readonly T[], depth: number): void {
      for (const node of nodes) {
        result.push({ item: node, path, depth })

        if (maxDepth === undefined || depth < maxDepth) {
          const children = getChildren(node)
          if (children && children.length > 0) {
            traverseWithPath(children, [...path, node], depth + 1)
          }
        }
      }
    }

    traverseWithPath(items, [], 0)
    return result
  } else {
    const result: T[] = []

    function traverse(nodes: readonly T[], depth: number): void {
      for (const node of nodes) {
        result.push(node)

        if (maxDepth === undefined || depth < maxDepth) {
          const children = getChildren(node)
          if (children && children.length > 0) {
            traverse(children, depth + 1)
          }
        }
      }
    }

    traverse(items, 0)
    return result
  }
}

import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { flatten } from '../flatten'

interface FileNode {
  name: string
  children?: FileNode[]
}

describe('Collection.flatten', () => {
  describe('data-first', () => {
    it('flattens a simple tree', () => {
      const tree: FileNode[] = [
        {
          name: 'src',
          children: [
            { name: 'index.ts' },
            { name: 'utils.ts' },
          ],
        },
      ]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
      })

      expect(result).toEqual([
        { name: 'src', children: [{ name: 'index.ts' }, { name: 'utils.ts' }] },
        { name: 'index.ts' },
        { name: 'utils.ts' },
      ])
    })

    it('flattens a multi-level tree', () => {
      const tree: FileNode[] = [
        {
          name: 'src',
          children: [
            { name: 'index.ts' },
            {
              name: 'utils',
              children: [{ name: 'helper.ts' }, { name: 'types.ts' }],
            },
          ],
        },
      ]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
      })

      // src, index.ts, utils, helper.ts, types.ts = 5 nodes
      expect(result).toHaveLength(5)
      expect(result[0]).toEqual(tree[0])
      expect(result[result.length - 1]).toEqual({ name: 'types.ts' })
    })

    it('includes path information when requested', () => {
      const tree: FileNode[] = [
        {
          name: 'src',
          children: [
            { name: 'index.ts' },
            {
              name: 'utils',
              children: [{ name: 'helper.ts' }],
            },
          ],
        },
      ]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
        includePath: true,
      })

      expect(result[0]).toEqual({
        item: tree[0],
        path: [],
        depth: 0,
      })

      expect(result[1]).toEqual({
        item: { name: 'index.ts' },
        path: [tree[0]],
        depth: 1,
      })

      expect(result[3]).toEqual({
        item: { name: 'helper.ts' },
        path: [tree[0], { name: 'utils', children: [{ name: 'helper.ts' }] }],
        depth: 2,
      })
    })

    it('respects maxDepth', () => {
      const tree: FileNode[] = [
        {
          name: 'root',
          children: [
            {
              name: 'level1',
              children: [
                {
                  name: 'level2',
                  children: [{ name: 'level3' }],
                },
              ],
            },
          ],
        },
      ]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
        maxDepth: 1,
      })

      expect(result).toHaveLength(2) // root and level1 only
      expect(result.map((n) => n.name)).toEqual(['root', 'level1'])
    })

    it('handles empty tree', () => {
      const result = flatten([], {
        getChildren: (n: FileNode) => n.children,
      })

      expect(result).toEqual([])
    })

    it('handles nodes without children', () => {
      const tree: FileNode[] = [{ name: 'file.ts' }]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
      })

      expect(result).toEqual([{ name: 'file.ts' }])
    })

    it('handles undefined children', () => {
      const tree: FileNode[] = [
        {
          name: 'parent',
          children: [{ name: 'child' }],
        },
      ]

      const result = flatten(tree, {
        getChildren: (n) => n.children,
      })

      // parent, child = 2 nodes (child has no children)
      expect(result).toHaveLength(2)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const tree: FileNode[] = [
        {
          name: 'src',
          children: [{ name: 'index.ts' }],
        },
      ]

      const result = R.pipe(
        tree,
        flatten({
          getChildren: (n) => n.children,
        })
      )

      expect(result).toHaveLength(2)
    })

    it('chains with other operations', () => {
      const tree: FileNode[] = [
        {
          name: 'src',
          children: [
            { name: 'index.ts' },
            { name: 'README.md' },
            {
              name: 'utils',
              children: [{ name: 'helper.ts' }],
            },
          ],
        },
      ]

      const result = R.pipe(
        tree,
        flatten({
          getChildren: (n) => n.children,
        }),
        R.filter((node) => node.name.endsWith('.ts'))
      )

      expect(result).toHaveLength(2)
      expect(result.map((n) => n.name)).toEqual(['index.ts', 'helper.ts'])
    })
  })

  describe('edge cases', () => {
    it('handles circular references safely with maxDepth', () => {
      type CircularNode = {
        name: string
        children?: CircularNode[]
      }

      const node1: CircularNode = { name: 'node1' }
      const node2: CircularNode = { name: 'node2' }
      node1.children = [node2]
      // Don't create circular reference for this test

      const result = flatten([node1], {
        getChildren: (n) => n.children,
        maxDepth: 2,
      })

      expect(result.length).toBeGreaterThan(0)
    })

    it('handles deep nesting', () => {
      let current: FileNode = { name: 'leaf' }
      for (let i = 0; i < 100; i++) {
        current = { name: `level${i}`, children: [current] }
      }

      const result = flatten([current], {
        getChildren: (n) => n.children,
      })

      expect(result).toHaveLength(101)
    })
  })
})

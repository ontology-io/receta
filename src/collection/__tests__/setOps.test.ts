import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { union, intersect, symmetricDiff } from '../setOps'

describe('Collection set operations', () => {
  describe('union', () => {
    describe('data-first', () => {
      it('merges two arrays of primitives', () => {
        const result = union([1, 2, 3], [3, 4, 5])
        expect(result).toEqual([1, 2, 3, 4, 5])
      })

      it('removes duplicates with custom comparator', () => {
        const users1 = [{ id: 1, name: 'Alice' }]
        const users2 = [
          { id: 1, name: 'Alice' },
          { id: 2, name: 'Bob' },
        ]

        const result = union(users1, users2, (a, b) => a.id === b.id)

        expect(result.length).toBe(2)
        expect(result[0]?.id).toBe(1)
        expect(result[1]?.id).toBe(2)
      })

      it('handles empty arrays', () => {
        expect(union([], [1, 2, 3])).toEqual([1, 2, 3])
        expect(union([1, 2, 3], [])).toEqual([1, 2, 3])
        expect(union([], [])).toEqual([])
      })

      it('uses reference equality by default', () => {
        const obj1 = { id: 1 }
        const obj2 = { id: 2 }
        const obj3 = { id: 1 } // Different reference

        const result = union([obj1, obj2], [obj3])

        expect(result.length).toBe(3) // All different references
      })

      it('preserves order - first array then second', () => {
        const result = union([3, 1], [2, 4])
        expect(result).toEqual([3, 1, 2, 4])
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe([1, 2], union([2, 3]))
        expect(result).toEqual([1, 2, 3])
      })
    })
  })

  describe('intersect', () => {
    describe('data-first', () => {
      it('finds common elements in primitives', () => {
        const result = intersect([1, 2, 3], [2, 3, 4])
        expect(result).toEqual([2, 3])
      })

      it('finds common elements with custom comparator', () => {
        const assigned = [{ taskId: 1 }, { taskId: 2 }]
        const completed = [{ taskId: 2 }, { taskId: 3 }]

        const result = intersect(assigned, completed, (a, b) => a.taskId === b.taskId)

        expect(result.length).toBe(1)
        expect(result[0]?.taskId).toBe(2)
      })

      it('returns empty array when no common elements', () => {
        const result = intersect([1, 2], [3, 4])
        expect(result).toEqual([])
      })

      it('handles empty arrays', () => {
        expect(intersect([], [1, 2, 3])).toEqual([])
        expect(intersect([1, 2, 3], [])).toEqual([])
        expect(intersect([], [])).toEqual([])
      })

      it('returns elements from first array', () => {
        const obj1 = { id: 1, name: 'Alice' }
        const obj2 = { id: 1, name: 'Alicia' } // Different name

        const result = intersect([obj1], [obj2], (a, b) => a.id === b.id)

        expect(result.length).toBe(1)
        expect(result[0]?.name).toBe('Alice') // From first array
      })

      it('preserves order from first array', () => {
        const result = intersect([3, 1, 2], [2, 3, 1])
        expect(result).toEqual([3, 1, 2])
      })

      it('handles all elements in common', () => {
        const result = intersect([1, 2, 3], [1, 2, 3])
        expect(result).toEqual([1, 2, 3])
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe([1, 2, 3], intersect([2, 3, 4]))
        expect(result).toEqual([2, 3])
      })
    })
  })

  describe('symmetricDiff', () => {
    describe('data-first', () => {
      it('finds elements in either but not both', () => {
        const result = symmetricDiff([1, 2, 3], [2, 3, 4])
        expect(result).toEqual([1, 4])
      })

      it('finds symmetric difference with custom comparator', () => {
        const planned = [{ id: 1 }, { id: 2 }]
        const actual = [{ id: 2 }, { id: 3 }]

        const result = symmetricDiff(planned, actual, (a, b) => a.id === b.id)

        expect(result.length).toBe(2)
        expect(R.pipe(
  result,
  R.map((x) => x.id),
  R.sort()
)).toEqual([1, 3])
      })

      it('returns all elements when no overlap', () => {
        const result = symmetricDiff([1, 2], [3, 4])
        expect(result).toEqual([1, 2, 3, 4])
      })

      it('returns empty when arrays are identical', () => {
        const result = symmetricDiff([1, 2, 3], [1, 2, 3])
        expect(result).toEqual([])
      })

      it('handles empty arrays', () => {
        expect(symmetricDiff([], [1, 2, 3])).toEqual([1, 2, 3])
        expect(symmetricDiff([1, 2, 3], [])).toEqual([1, 2, 3])
        expect(symmetricDiff([], [])).toEqual([])
      })

      it('preserves order - first array elements then second', () => {
        const result = symmetricDiff([3, 1], [2, 4])
        expect(result).toEqual([3, 1, 2, 4])
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe([1, 2, 3], symmetricDiff([2, 3, 4]))
        expect(result).toEqual([1, 4])
      })
    })
  })

  describe('real-world scenarios', () => {
    it('merges user permissions from multiple roles', () => {
      const roleA = ['read', 'write']
      const roleB = ['write', 'delete']

      const allPermissions = union(roleA, roleB)

      expect(allPermissions).toEqual(['read', 'write', 'delete'])
    })

    it('finds common tags between posts', () => {
      const post1Tags = ['typescript', 'react', 'testing']
      const post2Tags = ['react', 'nodejs', 'testing']

      const commonTags = intersect(post1Tags, post2Tags)

      expect(commonTags).toEqual(['react', 'testing'])
    })

    it('finds features that changed between versions', () => {
      const v1Features = [{ name: 'auth' }, { name: 'search' }]
      const v2Features = [{ name: 'search' }, { name: 'analytics' }]

      const changedFeatures = symmetricDiff(
        v1Features,
        v2Features,
        (a, b) => a.name === b.name
      )

      expect(changedFeatures.length).toBe(2)
      expect(R.pipe(
  changedFeatures,
  R.map((f) => f.name),
  R.sort()
)).toEqual(['analytics', 'auth'])
    })

    it('combines multiple sets of data', () => {
      const source1 = [{ id: 1 }, { id: 2 }]
      const source2 = [{ id: 2 }, { id: 3 }]
      const source3 = [{ id: 3 }, { id: 4 }]

      const combined = R.pipe(
        source1,
        union(source2, (a, b) => a.id === b.id),
        union(source3, (a, b) => a.id === b.id)
      )

      expect(combined.length).toBe(4)
      expect(R.pipe(
  combined,
  R.map((x) => x.id),
  R.sort()
)).toEqual([1, 2, 3, 4])
    })

    it('finds users in both teams', () => {
      const teamA = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]
      const teamB = [
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]

      const inBothTeams = intersect(teamA, teamB, (a, b) => a.id === b.id)

      expect(inBothTeams.length).toBe(1)
      expect(inBothTeams[0]?.name).toBe('Bob')
    })
  })
})

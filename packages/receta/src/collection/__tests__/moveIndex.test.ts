import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { moveIndex } from '../moveIndex'

describe('Collection.moveIndex', () => {
  describe('data-first', () => {
    it('moves element forward', () => {
      const result = moveIndex(['a', 'b', 'c', 'd', 'e'], 1, 3)

      expect(result).toEqual(['a', 'c', 'd', 'b', 'e'])
    })

    it('moves element backward', () => {
      const result = moveIndex(['a', 'b', 'c', 'd', 'e'], 3, 1)

      expect(result).toEqual(['a', 'd', 'b', 'c', 'e'])
    })

    it('moves first element to last', () => {
      const result = moveIndex([1, 2, 3, 4, 5], 0, 4)

      expect(result).toEqual([2, 3, 4, 5, 1])
    })

    it('moves last element to first', () => {
      const result = moveIndex([1, 2, 3, 4, 5], 4, 0)

      expect(result).toEqual([5, 1, 2, 3, 4])
    })

    it('returns same array when indices are equal', () => {
      const result = moveIndex([1, 2, 3], 1, 1)

      expect(result).toEqual([1, 2, 3])
    })

    it('handles negative from index', () => {
      const result = moveIndex(['a', 'b', 'c', 'd'], -1, 0)

      expect(result).toEqual(['d', 'a', 'b', 'c'])
    })

    it('handles negative to index', () => {
      const result = moveIndex(['a', 'b', 'c', 'd'], 0, -1)

      expect(result).toEqual(['b', 'c', 'd', 'a'])
    })

    it('handles both negative indices', () => {
      const result = moveIndex(['a', 'b', 'c', 'd'], -2, -1)

      expect(result).toEqual(['a', 'b', 'd', 'c'])
    })

    it('returns original array for out of bounds from index', () => {
      const result = moveIndex([1, 2, 3], 10, 1)

      expect(result).toEqual([1, 2, 3])
    })

    it('returns original array for out of bounds to index', () => {
      const result = moveIndex([1, 2, 3], 1, 10)

      expect(result).toEqual([1, 2, 3])
    })

    it('returns original array for negative out of bounds', () => {
      const result = moveIndex([1, 2, 3], -10, 1)

      expect(result).toEqual([1, 2, 3])
    })

    it('handles single element array', () => {
      const result = moveIndex([1], 0, 0)

      expect(result).toEqual([1])
    })

    it('handles two element array', () => {
      const result = moveIndex([1, 2], 0, 1)

      expect(result).toEqual([2, 1])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(['a', 'b', 'c', 'd'], moveIndex(1, 3))

      expect(result).toEqual(['a', 'c', 'd', 'b'])
    })

    it('chains multiple moves', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        moveIndex(0, 4), // [2, 3, 4, 5, 1]
        moveIndex(0, 2) // [3, 4, 2, 5, 1]
      )

      expect(result).toEqual([3, 4, 2, 5, 1])
    })

    it('works with filter and map', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5, 6],
        R.filter((x) => x % 2 === 0), // [2, 4, 6]
        moveIndex(0, 2) // [4, 6, 2]
      )

      expect(result).toEqual([4, 6, 2])
    })
  })

  describe('usage patterns', () => {
    it('reorders tasks in a todo list', () => {
      interface Task {
        id: number
        title: string
      }

      const tasks: Task[] = [
        { id: 1, title: 'First' },
        { id: 2, title: 'Second' },
        { id: 3, title: 'Third' },
      ]

      const result = moveIndex(tasks, 0, 2)

      expect(result[0]!.title).toBe('Second')
      expect(result[1]!.title).toBe('Third')
      expect(result[2]!.title).toBe('First')
    })

    it('handles drag and drop reordering', () => {
      const items = ['A', 'B', 'C', 'D', 'E']

      // Simulate dragging 'B' (index 1) to position after 'D' (index 3)
      const result = moveIndex(items, 1, 3)

      expect(result).toEqual(['A', 'C', 'D', 'B', 'E'])
    })
  })

  describe('edge cases', () => {
    it('preserves immutability', () => {
      const original = [1, 2, 3, 4, 5]
      const result = moveIndex(original, 0, 4)

      expect(original).toEqual([1, 2, 3, 4, 5])
      expect(result).toEqual([2, 3, 4, 5, 1])
    })

    it('handles objects', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = moveIndex(items, 0, 2)

      expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 1 }])
    })

    it('handles readonly arrays', () => {
      const items: readonly number[] = [1, 2, 3, 4, 5]
      const result = moveIndex(items, 1, 3)

      expect(result).toEqual([1, 3, 4, 2, 5])
    })
  })
})

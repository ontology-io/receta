import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { insertAt } from '../insertAt'

describe('Collection.insertAt', () => {
  describe('data-first', () => {
    it('inserts single element at middle', () => {
      const result = insertAt(['a', 'b', 'd', 'e'], 2, 'c')

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('inserts multiple elements', () => {
      const result = insertAt([1, 2, 5, 6], 2, [3, 4])

      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('inserts at beginning', () => {
      const result = insertAt(['b', 'c'], 0, 'a')

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('inserts at end', () => {
      const result = insertAt(['a', 'b'], 2, 'c')

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('inserts with negative index', () => {
      const result = insertAt(['a', 'b', 'd'], -1, 'c')

      expect(result).toEqual(['a', 'b', 'c', 'd'])
    })

    it('inserts into empty array', () => {
      const result = insertAt([], 0, 'a')

      expect(result).toEqual(['a'])
    })

    it('handles index beyond array length', () => {
      const result = insertAt([1, 2], 10, 3)

      expect(result).toEqual([1, 2, 3])
    })

    it('handles negative index beyond start', () => {
      const result = insertAt([1, 2, 3], -10, 0)

      expect(result).toEqual([0, 1, 2, 3])
    })

    it('inserts single element array', () => {
      const result = insertAt([1, 2, 4], 2, [3])

      expect(result).toEqual([1, 2, 3, 4])
    })

    it('inserts empty array (no-op)', () => {
      const result = insertAt([1, 2, 3], 1, [])

      expect(result).toEqual([1, 2, 3])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(['a', 'b', 'd', 'e'], insertAt(2, 'c'))

      expect(result).toEqual(['a', 'b', 'c', 'd', 'e'])
    })

    it('chains multiple insertions', () => {
      const result = R.pipe(
        [1, 5],
        insertAt(1, [2, 3, 4]), // [1, 2, 3, 4, 5]
        insertAt(5, 6) // [1, 2, 3, 4, 5, 6]
      )

      expect(result).toEqual([1, 2, 3, 4, 5, 6])
    })

    it('works with filter and map', () => {
      const result = R.pipe(
        [1, 2, 4, 5],
        insertAt(2, 3), // [1, 2, 3, 4, 5]
        R.map((x) => x * 2) // [2, 4, 6, 8, 10]
      )

      expect(result).toEqual([2, 4, 6, 8, 10])
    })
  })

  describe('usage patterns', () => {
    it('adds item to todo list at position', () => {
      interface Todo {
        id: number
        text: string
      }

      const todos: Todo[] = [
        { id: 1, text: 'Buy milk' },
        { id: 3, text: 'Walk dog' },
      ]

      const result = insertAt(todos, 1, { id: 2, text: 'Read book' })

      expect(result).toHaveLength(3)
      expect(result[1]!.text).toBe('Read book')
    })

    it('builds array incrementally', () => {
      const result = R.pipe(
        [] as string[],
        insertAt(0, 'a'),
        insertAt(1, 'b'),
        insertAt(2, 'c')
      )

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('inserts sorted element at correct position', () => {
      const sorted = [1, 3, 5, 7, 9]
      const newValue = 6

      // Find insert position
      const index = sorted.findIndex((x) => x > newValue)
      const result = insertAt(sorted, index, newValue)

      expect(result).toEqual([1, 3, 5, 6, 7, 9])
    })
  })

  describe('edge cases', () => {
    it('preserves immutability', () => {
      const original = [1, 2, 3]
      const result = insertAt(original, 1, 99)

      expect(original).toEqual([1, 2, 3])
      expect(result).toEqual([1, 99, 2, 3])
    })

    it('handles objects', () => {
      const items = [{ id: 1 }, { id: 3 }]
      const result = insertAt(items, 1, { id: 2 })

      expect(result).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }])
    })

    it('handles readonly arrays', () => {
      const items: readonly number[] = [1, 2, 4]
      const result = insertAt(items, 2, 3)

      expect(result).toEqual([1, 2, 3, 4])
    })

    it('handles nested arrays', () => {
      const items = [[1], [2], [4]]
      // Need to wrap [3] in another array since insertAt spreads arrays
      const result = insertAt(items, 2, [[3]])

      expect(result).toEqual([[1], [2], [3], [4]])
    })

    it('handles string insertion', () => {
      const words = ['hello', 'world']
      const result = insertAt(words, 1, 'beautiful')

      expect(result).toEqual(['hello', 'beautiful', 'world'])
    })
  })
})

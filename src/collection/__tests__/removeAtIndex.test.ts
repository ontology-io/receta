import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { removeAtIndex } from '../removeAtIndex'

describe('Collection.removeAtIndex', () => {
  describe('data-first', () => {
    it('removes element at middle index', () => {
      const result = removeAtIndex(['a', 'b', 'c', 'd'], 2)

      expect(result).toEqual(['a', 'b', 'd'])
    })

    it('removes at beginning', () => {
      const result = removeAtIndex([1, 2, 3], 0)

      expect(result).toEqual([2, 3])
    })

    it('removes at end', () => {
      const result = removeAtIndex([1, 2, 3], 2)

      expect(result).toEqual([1, 2])
    })

    it('removes with negative index', () => {
      const result = removeAtIndex(['a', 'b', 'c', 'd'], -1)

      expect(result).toEqual(['a', 'b', 'c'])
    })

    it('removes with negative index from middle', () => {
      const result = removeAtIndex([1, 2, 3, 4, 5], -3)

      expect(result).toEqual([1, 2, 4, 5])
    })

    it('returns original array for out of bounds positive index', () => {
      const result = removeAtIndex([1, 2, 3], 10)

      expect(result).toEqual([1, 2, 3])
    })

    it('returns original array for out of bounds negative index', () => {
      const result = removeAtIndex([1, 2, 3], -10)

      expect(result).toEqual([1, 2, 3])
    })

    it('handles single element array', () => {
      const result = removeAtIndex(['a'], 0)

      expect(result).toEqual([])
    })

    it('handles two element array', () => {
      const result = removeAtIndex([1, 2], 0)

      expect(result).toEqual([2])
    })

    it('removes object from array', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
        { id: 3, name: 'Charlie' },
      ]

      const result = removeAtIndex(items, 1)

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 3, name: 'Charlie' },
      ])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(['a', 'b', 'c', 'd'], removeAtIndex(2))

      expect(result).toEqual(['a', 'b', 'd'])
    })

    it('chains multiple removals', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        removeAtIndex(0), // [2, 3, 4, 5]
        removeAtIndex(-1) // [2, 3, 4]
      )

      expect(result).toEqual([2, 3, 4])
    })

    it('works with filter', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        removeAtIndex(2), // [1, 2, 4, 5]
        R.filter((x) => x % 2 === 0) // [2, 4]
      )

      expect(result).toEqual([2, 4])
    })

    it('removes then maps', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        removeAtIndex(2), // [1, 2, 4, 5]
        R.map((x) => x * 2) // [2, 4, 8, 10]
      )

      expect(result).toEqual([2, 4, 8, 10])
    })

    it('removes multiple elements by chaining', () => {
      const result = R.pipe(
        ['a', 'b', 'c', 'd', 'e'],
        removeAtIndex(1), // ['a', 'c', 'd', 'e']
        removeAtIndex(2) // ['a', 'c', 'e']
      )

      expect(result).toEqual(['a', 'c', 'e'])
    })
  })

  describe('usage patterns', () => {
    it('deletes todo item', () => {
      interface Todo {
        id: number
        text: string
      }

      const todos: Todo[] = [
        { id: 1, text: 'Buy milk' },
        { id: 2, text: 'Read book' },
        { id: 3, text: 'Walk dog' },
      ]

      const result = removeAtIndex(todos, 1)

      expect(result).toHaveLength(2)
      expect(result[0]!.text).toBe('Buy milk')
      expect(result[1]!.text).toBe('Walk dog')
    })

    it('removes invalid entry', () => {
      const scores = [95, -1, 87, 92, -1, 100]

      // Remove first invalid score at index 1
      const result = removeAtIndex(scores, 1)

      expect(result).toEqual([95, 87, 92, -1, 100])
    })

    it('removes duplicates one by one', () => {
      const items = [1, 2, 2, 3, 4, 4, 5]

      // Remove second occurrence of 2 (index 2)
      const result = removeAtIndex(items, 2)

      expect(result).toEqual([1, 2, 3, 4, 4, 5])
    })
  })

  describe('edge cases', () => {
    it('preserves immutability', () => {
      const original = [1, 2, 3, 4, 5]
      const result = removeAtIndex(original, 2)

      expect(original).toEqual([1, 2, 3, 4, 5])
      expect(result).toEqual([1, 2, 4, 5])
    })

    it('handles objects without mutation', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = removeAtIndex(items, 1)

      expect(items).toHaveLength(3)
      expect(result).toHaveLength(2)
      expect(result).toEqual([{ id: 1 }, { id: 3 }])
    })

    it('handles readonly arrays', () => {
      const items: readonly number[] = [1, 2, 3, 4]
      const result = removeAtIndex(items, 2)

      expect(result).toEqual([1, 2, 4])
    })

    it('handles nested arrays', () => {
      const items = [[1, 2], [3, 4], [5, 6]]
      const result = removeAtIndex(items, 1)

      expect(result).toEqual([[1, 2], [5, 6]])
    })

    it('handles empty result', () => {
      const result = removeAtIndex([1], 0)

      expect(result).toEqual([])
      expect(Array.isArray(result)).toBe(true)
    })

    it('handles string arrays', () => {
      const words = ['hello', 'world', 'foo', 'bar']
      const result = removeAtIndex(words, 2)

      expect(result).toEqual(['hello', 'world', 'bar'])
    })

    it('handles removal from large array', () => {
      const large = Array.from({ length: 1000 }, (_, i) => i)
      const result = removeAtIndex(large, 500)

      expect(result).toHaveLength(999)
      expect(result[499]).toBe(499)
      expect(result[500]).toBe(501)
    })
  })
})

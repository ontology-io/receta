import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { updateAt } from '../updateAt'

describe('Collection.updateAt', () => {
  describe('data-first', () => {
    it('updates element at middle index', () => {
      const result = updateAt(['a', 'b', 'c', 'd'], 2, 'X')

      expect(result).toEqual(['a', 'b', 'X', 'd'])
    })

    it('updates at beginning', () => {
      const result = updateAt([1, 2, 3], 0, 10)

      expect(result).toEqual([10, 2, 3])
    })

    it('updates at end', () => {
      const result = updateAt([1, 2, 3], 2, 30)

      expect(result).toEqual([1, 2, 30])
    })

    it('updates with negative index', () => {
      const result = updateAt(['a', 'b', 'c', 'd'], -1, 'Z')

      expect(result).toEqual(['a', 'b', 'c', 'Z'])
    })

    it('updates with negative index from middle', () => {
      const result = updateAt([1, 2, 3, 4, 5], -3, 99)

      expect(result).toEqual([1, 2, 99, 4, 5])
    })

    it('returns original array for out of bounds positive index', () => {
      const result = updateAt([1, 2, 3], 10, 99)

      expect(result).toEqual([1, 2, 3])
    })

    it('returns original array for out of bounds negative index', () => {
      const result = updateAt([1, 2, 3], -10, 99)

      expect(result).toEqual([1, 2, 3])
    })

    it('handles single element array', () => {
      const result = updateAt(['a'], 0, 'b')

      expect(result).toEqual(['b'])
    })

    it('handles updating objects', () => {
      const items = [
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]

      const result = updateAt(items, 1, { id: 2, name: 'Bobby' })

      expect(result).toEqual([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bobby' },
      ])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(['a', 'b', 'c', 'd'], updateAt(2, 'X'))

      expect(result).toEqual(['a', 'b', 'X', 'd'])
    })

    it('chains multiple updates', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        updateAt(0, 10), // [10, 2, 3, 4, 5]
        updateAt(4, 50) // [10, 2, 3, 4, 50]
      )

      expect(result).toEqual([10, 2, 3, 4, 50])
    })

    it('works with map and filter', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        updateAt(2, 99), // [1, 2, 99, 4, 5]
        R.filter((x) => x < 50) // [1, 2, 4, 5]
      )

      expect(result).toEqual([1, 2, 4, 5])
    })

    it('updates then maps', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        updateAt(2, 10), // [1, 2, 10, 4, 5]
        R.map((x) => x * 2) // [2, 4, 20, 8, 10]
      )

      expect(result).toEqual([2, 4, 20, 8, 10])
    })
  })

  describe('usage patterns', () => {
    it('updates todo item completion status', () => {
      interface Todo {
        id: number
        text: string
        done: boolean
      }

      const todos: Todo[] = [
        { id: 1, text: 'Buy milk', done: false },
        { id: 2, text: 'Read book', done: false },
        { id: 3, text: 'Walk dog', done: false },
      ]

      const result = updateAt(todos, 1, { id: 2, text: 'Read book', done: true })

      expect(result[1]!.done).toBe(true)
      expect(result[0]!.done).toBe(false)
      expect(result[2]!.done).toBe(false)
    })

    it('corrects value at index', () => {
      const scores = [95, 87, 92, 100, 88]
      const correctedScores = updateAt(scores, 2, 94) // Fix score at index 2

      expect(correctedScores).toEqual([95, 87, 94, 100, 88])
    })

    it('replaces element in sorted list', () => {
      const items = ['apple', 'banana', 'cherry', 'date']
      const result = updateAt(items, 2, 'coconut')

      expect(result).toEqual(['apple', 'banana', 'coconut', 'date'])
    })
  })

  describe('edge cases', () => {
    it('preserves immutability', () => {
      const original = [1, 2, 3, 4, 5]
      const result = updateAt(original, 2, 99)

      expect(original).toEqual([1, 2, 3, 4, 5])
      expect(result).toEqual([1, 2, 99, 4, 5])
    })

    it('handles objects without mutation', () => {
      const items = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const result = updateAt(items, 1, { id: 99 })

      expect(items[1]).toEqual({ id: 2 })
      expect(result[1]).toEqual({ id: 99 })
    })

    it('handles readonly arrays', () => {
      const items: readonly number[] = [1, 2, 3, 4]
      const result = updateAt(items, 2, 99)

      expect(result).toEqual([1, 2, 99, 4])
    })

    it('handles nested arrays', () => {
      const items = [[1, 2], [3, 4], [5, 6]]
      const result = updateAt(items, 1, [99, 100])

      expect(result).toEqual([[1, 2], [99, 100], [5, 6]])
    })

    it('handles boolean values', () => {
      const flags = [true, false, true, false]
      const result = updateAt(flags, 1, true)

      expect(result).toEqual([true, true, true, false])
    })

    it('handles undefined and null', () => {
      const items = [1, 2, 3]
      const result = updateAt(items, 1, null as unknown as number)

      expect(result[1]).toBeNull()
    })
  })
})

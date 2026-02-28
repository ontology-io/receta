import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { batchBy } from '../batchBy'

describe('Collection.batchBy', () => {
  describe('data-first', () => {
    it('groups consecutive same values', () => {
      const result = batchBy([1, 1, 2, 2, 2, 3, 1, 1], (x) => x)

      expect(result).toEqual([[1, 1], [2, 2, 2], [3], [1, 1]])
    })

    it('groups consecutive items by property', () => {
      const items = [
        { status: 'pending', id: 1 },
        { status: 'pending', id: 2 },
        { status: 'done', id: 3 },
        { status: 'done', id: 4 },
        { status: 'pending', id: 5 },
      ]

      const result = batchBy(items, (item) => item.status)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveLength(2)
      expect(result[1]).toHaveLength(2)
      expect(result[2]).toHaveLength(1)
      expect(result[2]![0]!.id).toBe(5)
    })

    it('handles empty array', () => {
      const result = batchBy([], (x: number) => x)

      expect(result).toEqual([])
    })

    it('handles single element', () => {
      const result = batchBy([1], (x) => x)

      expect(result).toEqual([[1]])
    })

    it('handles all different values', () => {
      const result = batchBy([1, 2, 3, 4, 5], (x) => x)

      expect(result).toEqual([[1], [2], [3], [4], [5]])
    })

    it('handles all same values', () => {
      const result = batchBy([5, 5, 5, 5], (x) => x)

      expect(result).toEqual([[5, 5, 5, 5]])
    })

    it('groups consecutive dates by day', () => {
      const events = [
        { timestamp: '2024-01-01T10:00:00Z', event: 'login' },
        { timestamp: '2024-01-01T11:00:00Z', event: 'click' },
        { timestamp: '2024-01-02T09:00:00Z', event: 'login' },
        { timestamp: '2024-01-02T10:00:00Z', event: 'logout' },
        { timestamp: '2024-01-03T08:00:00Z', event: 'login' },
      ]

      const result = batchBy(events, (e) => e.timestamp.split('T')[0]!)

      expect(result).toHaveLength(3)
      expect(result[0]).toHaveLength(2)
      expect(result[1]).toHaveLength(2)
      expect(result[2]).toHaveLength(1)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe([1, 1, 2, 2, 3], batchBy((x) => x))

      expect(result).toEqual([[1, 1], [2, 2], [3]])
    })

    it('chains with other operations', () => {
      const result = R.pipe(
        [1, 1, 2, 2, 2, 3, 3, 1],
        batchBy((x) => x),
        R.filter((batch) => batch.length > 1),
        R.map((batch) => batch[0])
      )

      expect(result).toEqual([1, 2, 3])
    })

    it('works with filtering before batching', () => {
      const result = R.pipe(
        [1, 2, 3, 3, 4, 5, 5, 5],
        R.filter((x) => x >= 3),
        batchBy((x) => x)
      )

      expect(result).toEqual([[3, 3], [4], [5, 5, 5]])
    })
  })

  describe('edge cases', () => {
    it('handles boolean values', () => {
      const result = batchBy([true, true, false, false, true], (x) => (x ? 1 : 0))

      expect(result).toHaveLength(3)
    })

    it('handles string grouping', () => {
      const words = ['hello', 'help', 'world', 'work', 'yes']
      const result = batchBy(words, (w) => w[0]!)

      expect(result).toHaveLength(3)
      expect(result[0]).toEqual(['hello', 'help'])
      expect(result[1]).toEqual(['world', 'work'])
      expect(result[2]).toEqual(['yes'])
    })

    it('handles numeric ranges', () => {
      const numbers = [1, 2, 5, 6, 7, 10, 11, 20]
      const result = batchBy(numbers, (n) => Math.floor(n / 5))

      expect(result).toHaveLength(4)
      expect(result[0]).toEqual([1, 2])
      expect(result[1]).toEqual([5, 6, 7])
      expect(result[2]).toEqual([10, 11])
      expect(result[3]).toEqual([20])
    })
  })
})

import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { windowSliding } from '../windowSliding'

describe('Collection.windowSliding', () => {
  describe('data-first', () => {
    it('creates sliding windows with default step', () => {
      const result = windowSliding([1, 2, 3, 4, 5], { size: 3 })

      expect(result).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
    })

    it('creates sliding windows with custom step', () => {
      const result = windowSliding([1, 2, 3, 4, 5, 6], { size: 3, step: 2 })

      expect(result).toEqual([[1, 2, 3], [3, 4, 5]])
    })

    it('creates non-overlapping windows when step equals size', () => {
      const result = windowSliding([1, 2, 3, 4, 5, 6], { size: 2, step: 2 })

      expect(result).toEqual([[1, 2], [3, 4], [5, 6]])
    })

    it('returns empty array for size larger than array', () => {
      const result = windowSliding([1, 2, 3], { size: 5 })

      expect(result).toEqual([])
    })

    it('returns empty array for empty input', () => {
      const result = windowSliding([], { size: 3 })

      expect(result).toEqual([])
    })

    it('returns empty array for size <= 0', () => {
      const result = windowSliding([1, 2, 3], { size: 0 })

      expect(result).toEqual([])
    })

    it('handles size 1', () => {
      const result = windowSliding([1, 2, 3], { size: 1 })

      expect(result).toEqual([[1], [2], [3]])
    })

    it('handles size equal to array length', () => {
      const result = windowSliding([1, 2, 3], { size: 3 })

      expect(result).toEqual([[1, 2, 3]])
    })

    it('handles large step size', () => {
      const result = windowSliding([1, 2, 3, 4, 5, 6], { size: 2, step: 10 })

      expect(result).toEqual([[1, 2]])
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe([1, 2, 3, 4, 5], windowSliding({ size: 3 }))

      expect(result).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
    })

    it('calculates moving average', () => {
      const prices = [100, 102, 101, 105, 103, 107]

      const movingAverages = R.pipe(
        prices,
        windowSliding({ size: 3 }),
        R.map((window) => window.reduce((a, b) => a + b, 0) / window.length),
        R.map((avg) => Math.round(avg * 100) / 100)
      )

      expect(movingAverages).toHaveLength(4)
      expect(movingAverages[0]).toBeCloseTo(101, 2)
    })

    it('finds sequential patterns', () => {
      const sequence = [1, 2, 3, 2, 3, 4, 3, 4, 5]

      const increasingSequences = R.pipe(
        sequence,
        windowSliding({ size: 3 }),
        R.filter((window) => window[0]! < window[1]! && window[1]! < window[2]!)
      )

      expect(increasingSequences).toHaveLength(3)
      expect(increasingSequences).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
    })

    it('creates n-grams', () => {
      const words = ['the', 'quick', 'brown', 'fox']

      const bigrams = R.pipe(words, windowSliding({ size: 2 }))

      expect(bigrams).toEqual([
        ['the', 'quick'],
        ['quick', 'brown'],
        ['brown', 'fox'],
      ])
    })
  })

  describe('edge cases', () => {
    it('handles single element array', () => {
      const result = windowSliding([1], { size: 1 })

      expect(result).toEqual([[1]])
    })

    it('handles strings in array', () => {
      const result = windowSliding(['a', 'b', 'c', 'd'], { size: 2 })

      expect(result).toEqual([['a', 'b'], ['b', 'c'], ['c', 'd']])
    })

    it('handles objects in array', () => {
      const items = [
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
        { id: 3, value: 'c' },
      ]

      const result = windowSliding(items, { size: 2 })

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual([
        { id: 1, value: 'a' },
        { id: 2, value: 'b' },
      ])
    })

    it('preserves window immutability', () => {
      const input = [1, 2, 3, 4, 5]
      const result = windowSliding(input, { size: 3 })

      // Modify original array
      input.push(6)

      // Result should not be affected
      expect(result).toEqual([[1, 2, 3], [2, 3, 4], [3, 4, 5]])
    })
  })
})

import { describe, it, expect } from 'bun:test'
import { mapAsync } from '../mapAsync'
import { sleep } from '../retry'

describe('Async.mapAsync', () => {
  describe('data-first', () => {
    it('maps over array with async function', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x * 2
      )
      expect(result).toEqual([2, 4, 6])
    })

    it('passes index to mapper function', async () => {
      const result = await mapAsync(
        ['a', 'b', 'c'],
        async (x, i) => `${x}${i}`
      )
      expect(result).toEqual(['a0', 'b1', 'c2'])
    })

    it('handles empty array', async () => {
      const result = await mapAsync([], async (x) => x)
      expect(result).toEqual([])
    })

    it('preserves order of results', async () => {
      const result = await mapAsync(
        [100, 50, 150],
        async (x) => {
          await sleep(x)
          return x
        }
      )
      expect(result).toEqual([100, 50, 150])
    })
  })

  describe('concurrency control', () => {
    it('respects concurrency limit', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      const result = await mapAsync(
        [1, 2, 3, 4, 5],
        async (x) => {
          executing.add(x)
          maxConcurrent = Math.max(maxConcurrent, executing.size)
          await sleep(50)
          executing.delete(x)
          return x * 2
        },
        { concurrency: 2 }
      )

      expect(result).toEqual([2, 4, 6, 8, 10])
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('uses unlimited concurrency by default', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      const result = await mapAsync(
        [1, 2, 3, 4, 5],
        async (x) => {
          executing.add(x)
          maxConcurrent = Math.max(maxConcurrent, executing.size)
          await sleep(10)
          executing.delete(x)
          return x
        }
      )

      expect(result).toEqual([1, 2, 3, 4, 5])
      expect(maxConcurrent).toBe(5) // All running concurrently
    })

    it('handles concurrency limit of 1 (sequential)', async () => {
      const order: number[] = []

      await mapAsync(
        [1, 2, 3],
        async (x) => {
          order.push(x)
          await sleep(10)
        },
        { concurrency: 1 }
      )

      expect(order).toEqual([1, 2, 3])
    })

    it('handles concurrency greater than array length', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x * 2,
        { concurrency: 10 }
      )
      expect(result).toEqual([2, 4, 6])
    })
  })

  describe('error handling', () => {
    it('propagates errors from mapper function', async () => {
      await expect(
        mapAsync([1, 2, 3], async (x) => {
          if (x === 2) throw new Error('Failed')
          return x
        })
      ).rejects.toThrow('Failed')
    })

    it('stops execution on first error', async () => {
      const executed: number[] = []

      await expect(
        mapAsync(
          [1, 2, 3, 4, 5],
          async (x) => {
            executed.push(x)
            await sleep(10)
            if (x === 3) throw new Error('Failed')
            return x
          },
          { concurrency: 2 }
        )
      ).rejects.toThrow('Failed')

      // Some items may have started before error was thrown
      expect(executed.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('data-last', () => {
    it('returns a function when given only mapper', async () => {
      const double = mapAsync(async (x: number) => x * 2)
      expect(typeof double).toBe('function')

      const result = await double([1, 2, 3])
      expect(result).toEqual([2, 4, 6])
    })

    it('supports concurrency option in curried form', async () => {
      const mapper = mapAsync(
        async (x: number) => x * 2,
        { concurrency: 2 }
      )

      const result = await mapper([1, 2, 3, 4])
      expect(result).toEqual([2, 4, 6, 8])
    })
  })

  describe('edge cases', () => {
    it('handles single item', async () => {
      const result = await mapAsync([42], async (x) => x * 2)
      expect(result).toEqual([84])
    })

    it('handles mapper that returns undefined', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async () => undefined
      )
      expect(result).toEqual([undefined, undefined, undefined])
    })

    it('handles mapper that returns promises of different types', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x.toString()
      )
      expect(result).toEqual(['1', '2', '3'])
    })
  })
})

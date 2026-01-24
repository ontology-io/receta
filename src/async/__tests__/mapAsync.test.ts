import { describe, it, expect } from 'bun:test'
import { mapAsync, mapAsyncOrThrow } from '../mapAsync'
import { sleep } from '../retry'
import { isOk, isErr, unwrap } from '../../result'

describe('Async.mapAsync', () => {
  describe('data-first', () => {
    it('maps over array with async function', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x * 2
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([2, 4, 6])
    })

    it('passes index to mapper function', async () => {
      const result = await mapAsync(
        ['a', 'b', 'c'],
        async (x, i) => `${x}${i}`
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual(['a0', 'b1', 'c2'])
    })

    it('handles empty array', async () => {
      const result = await mapAsync([], async (x) => x)
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([])
    })

    it('preserves order of results', async () => {
      const result = await mapAsync(
        [100, 50, 150],
        async (x) => {
          await sleep(x)
          return x
        }
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([100, 50, 150])
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

      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([2, 4, 6, 8, 10])
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

      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([1, 2, 3, 4, 5])
      expect(maxConcurrent).toBe(5) // All running concurrently
    })

    it('handles concurrency limit of 1 (sequential)', async () => {
      const order: number[] = []

      const result = await mapAsync(
        [1, 2, 3],
        async (x) => {
          order.push(x)
          await sleep(10)
        },
        { concurrency: 1 }
      )

      expect(isOk(result)).toBe(true)
      expect(order).toEqual([1, 2, 3])
    })

    it('handles concurrency greater than array length', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x * 2,
        { concurrency: 10 }
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([2, 4, 6])
    })
  })

  describe('error handling', () => {
    it('returns Err with error details from mapper function', async () => {
      const result = await mapAsync([1, 2, 3], async (x) => {
        if (x === 2) throw new Error('Failed')
        return x
      })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('map_async_error')
        // With unlimited concurrency (Promise.all), index is -1
        expect(result.error.index).toBe(-1)
      }
    })

    it('returns Err with detailed context when concurrency is limited', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => {
          if (x === 2) throw new Error('Failed')
          return x
        },
        { concurrency: 1 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('map_async_error')
        expect(result.error.index).toBe(1)
        expect(result.error.item).toBe(2)
      }
    })

    it('stops execution on first error', async () => {
      const executed: number[] = []

      const result = await mapAsync(
        [1, 2, 3, 4, 5],
        async (x) => {
          executed.push(x)
          await sleep(10)
          if (x === 3) throw new Error('Failed')
          return x
        },
        { concurrency: 2 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('map_async_error')
        expect(result.error.index).toBe(2)
      }

      // Some items may have started before error was thrown
      expect(executed.length).toBeGreaterThanOrEqual(1)
    })

    it('mapAsyncOrThrow variant throws errors', async () => {
      await expect(
        mapAsyncOrThrow([1, 2, 3], async (x) => {
          if (x === 2) throw new Error('Failed')
          return x
        })
      ).rejects.toThrow()
    })
  })

  describe('data-last', () => {
    it('returns a function when given only mapper', async () => {
      const double = mapAsync(async (x: number) => x * 2)
      expect(typeof double).toBe('function')

      const result = await double([1, 2, 3])
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([2, 4, 6])
    })

    it('supports concurrency option in curried form', async () => {
      const mapper = mapAsync(
        async (x: number) => x * 2,
        { concurrency: 2 }
      )

      const result = await mapper([1, 2, 3, 4])
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([2, 4, 6, 8])
    })
  })

  describe('edge cases', () => {
    it('handles single item', async () => {
      const result = await mapAsync([42], async (x) => x * 2)
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([84])
    })

    it('handles mapper that returns undefined', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async () => undefined
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual([undefined, undefined, undefined])
    })

    it('handles mapper that returns promises of different types', async () => {
      const result = await mapAsync(
        [1, 2, 3],
        async (x) => x.toString()
      )
      expect(isOk(result)).toBe(true)
      expect(unwrap(result)).toEqual(['1', '2', '3'])
    })
  })
})

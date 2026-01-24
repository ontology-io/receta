import { describe, it, expect } from 'bun:test'
import {
  mapAsync,
  retry,
  timeout,
  batch,
  poll,
  chunk,
  parallel,
  sequential,
  sleep,
} from '../index'
import { isOk, isErr, unwrapOr } from '../../result'

describe('Async Integration Tests', () => {
  describe('mapAsync + retry pattern', () => {
    it('retries failed items during mapping', async () => {
      let attempts = 0

      const items = [1, 2, 3]
      const result = await mapAsync(
        items,
        async (x) => {
          const retryResult = await retry(
            async () => {
              attempts++
              if (x === 2 && attempts < 3) {
                throw new Error('Transient failure')
              }
              return x * 2
            },
            { maxAttempts: 3, delay: 10 }
          )
          return unwrapOr(retryResult, 0) // Unwrap for simple test
        },
        { concurrency: 2 }
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])
      expect(results).toEqual([2, 4, 6])
      expect(attempts).toBeGreaterThan(3) // Some retries happened
    })
  })

  describe('mapAsync + timeout pattern', () => {
    it('applies timeout to each mapped operation', async () => {
      const items = [50, 100, 150]

      const result = await mapAsync(
        items,
        async (delay) => {
          return timeout(sleep(delay).then(() => delay), 120)
        }
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])

      // 150ms item should timeout, others should succeed
      expect(isOk(results[0]!)).toBe(true)
      expect(isOk(results[1]!)).toBe(true)
      expect(isErr(results[2]!)).toBe(true) // 150ms times out
    })

    it('processes items with timeouts using concurrency', async () => {
      const items = [10, 20, 30, 40, 50]

      const result = await mapAsync(
        items,
        async (delay) => {
          const timeoutResult = await timeout(sleep(delay).then(() => delay), 1000)
          return unwrapOr(timeoutResult, 0)
        },
        { concurrency: 2 }
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])
      expect(results).toEqual([10, 20, 30, 40, 50])
    })
  })

  describe('batch + retry pattern', () => {
    it('retries failed batches', async () => {
      let batchAttempts = 0

      const items = [1, 2, 3, 4, 5, 6]
      const result = await batch(
        items,
        async (batchItems) => {
          const retryResult = await retry(
            async () => {
              batchAttempts++
              if (batchAttempts === 2) {
                throw new Error('Batch failed')
              }
              return batchItems.reduce((sum, x) => sum + x, 0)
            },
            { maxAttempts: 3, delay: 10 }
          )
          return unwrapOr(retryResult, 0)
        },
        { batchSize: 3 }
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])
      expect(results.length).toBe(2)
      expect(batchAttempts).toBeGreaterThan(2)
    })
  })

  describe('poll + timeout pattern', () => {
    it('polls with overall timeout', async () => {
      let attempts = 0

      const pollResult = await poll(
        async () => {
          attempts++
          if (attempts < 3) return null
          return 'ready'
        },
        { interval: 50, timeout: 500 }
      )

      expect(isOk(pollResult)).toBe(true)
      if (isOk(pollResult)) {
        expect(pollResult.value).toBe('ready')
      }
      expect(attempts).toBe(3)
    })

    it('times out if polling takes too long', async () => {
      const result = await poll(
        async () => null, // Never returns truthy
        { interval: 50, maxAttempts: 100, timeout: 200 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('timeout')
      }
    })
  })

  describe('real-world: API with rate limiting', () => {
    it('fetches data with retry, timeout, and concurrency control', async () => {
      let requestCount = 0

      const mockFetch = async (id: number): Promise<{ id: number; data: string }> => {
        requestCount++
        await sleep(20)

        // Simulate occasional failures
        if (requestCount === 3) {
          throw new Error('Network error')
        }

        return { id, data: `Data for ${id}` }
      }

      const userIds = [1, 2, 3, 4, 5]

      const result = await mapAsync(
        userIds,
        async (id) => {
          const retryResult = await retry(
            async () => {
              const timeoutResult = await timeout(mockFetch(id), 1000)
              if (isErr(timeoutResult)) throw new Error('Timeout')
              return timeoutResult.value
            },
            { maxAttempts: 3, delay: 10 }
          )
          return unwrapOr(retryResult, { id, data: '' })
        },
        { concurrency: 2 } // Max 2 concurrent requests
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])
      expect(results).toHaveLength(5)
      expect(results[0]!.id).toBe(1)
      expect(results[4]!.id).toBe(5)
    })
  })

  describe('real-world: bulk data processing', () => {
    it('processes large dataset in batches with error handling', async () => {
      const records = Array.from({ length: 100 }, (_, i) => ({
        id: i,
        value: i * 10,
      }))

      const processedBatches: number[] = []

      const result = await batch(
        records,
        async (batchRecords) => {
          // Simulate batch processing
          await sleep(10)
          processedBatches.push(batchRecords.length)
          return batchRecords.map((r) => r.value)
        },
        {
          batchSize: 25,
          delayBetweenBatches: 20,
        }
      )

      expect(isOk(result)).toBe(true)
      const results = unwrapOr(result, [])
      expect(results).toHaveLength(4) // 100 / 25 = 4 batches
      expect(processedBatches).toEqual([25, 25, 25, 25])
      expect(results.flat()).toHaveLength(100)
    })
  })

  describe('real-world: parallel tasks with dependencies', () => {
    it('runs independent tasks in parallel, dependent tasks sequentially', async () => {
      const events: string[] = []

      // Phase 1: Independent tasks (parallel)
      const phase1Result = await parallel([
        async () => {
          await sleep(50)
          events.push('fetch-users')
          return ['user1', 'user2']
        },
        async () => {
          await sleep(50)
          events.push('fetch-posts')
          return ['post1', 'post2']
        },
        async () => {
          await sleep(50)
          events.push('fetch-comments')
          return ['comment1', 'comment2']
        },
      ])

      expect(isOk(phase1Result)).toBe(true)
      const phase1 = unwrapOr(phase1Result, [])

      // Phase 2: Dependent tasks (sequential)
      const phase2Result = await sequential([
        async () => {
          events.push('process-users')
          return phase1[0]
        },
        async () => {
          events.push('process-posts')
          return phase1[1]
        },
        async () => {
          events.push('process-comments')
          return phase1[2]
        },
      ])

      expect(isOk(phase2Result)).toBe(true)
      const phase2 = unwrapOr(phase2Result, [])

      // Phase 1 tasks should run concurrently
      expect(events.slice(0, 3).sort()).toEqual([
        'fetch-comments',
        'fetch-posts',
        'fetch-users',
      ])

      // Phase 2 tasks should run sequentially
      expect(events.slice(3)).toEqual([
        'process-users',
        'process-posts',
        'process-comments',
      ])

      expect(phase2).toHaveLength(3)
    })
  })

  describe('chunk utility', () => {
    it('splits array into chunks', () => {
      const items = [1, 2, 3, 4, 5, 6, 7, 8, 9]
      const chunks = chunk(items, 3)

      expect(chunks).toEqual([[1, 2, 3], [4, 5, 6], [7, 8, 9]])
    })

    it('handles arrays not evenly divisible by chunk size', () => {
      const items = [1, 2, 3, 4, 5]
      const chunks = chunk(items, 2)

      expect(chunks).toEqual([[1, 2], [3, 4], [5]])
    })

    it('handles empty array', () => {
      const chunks = chunk([], 5)
      expect(chunks).toEqual([])
    })

    it('handles chunk size larger than array', () => {
      const items = [1, 2, 3]
      const chunks = chunk(items, 10)

      expect(chunks).toEqual([[1, 2, 3]])
    })
  })
})

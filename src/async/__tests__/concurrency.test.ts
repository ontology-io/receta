import { describe, it, expect } from 'bun:test'
import { parallel, sequential, parallelOrThrow, sequentialOrThrow } from '../index'
import { sleep } from '../retry'
import { filterAsync, filterAsyncOrThrow } from '../filterAsync'
import { isOk, isErr, unwrapOr } from '../../result'

describe('Async.parallel', () => {
  describe('basic parallel execution', () => {
    it('executes all tasks and returns results', async () => {
      const tasks = [
        async () => 1,
        async () => 2,
        async () => 3,
      ]

      const result = await parallel(tasks)
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([1, 2, 3])
    })

    it('preserves order of results', async () => {
      const tasks = [
        async () => { await sleep(100); return 'slow' },
        async () => { await sleep(10); return 'fast' },
        async () => { await sleep(50); return 'medium' },
      ]

      const result = await parallel(tasks)
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual(['slow', 'fast', 'medium'])
    })

    it('handles empty task array', async () => {
      const result = await parallel([])
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([])
    })
  })

  describe('concurrency control', () => {
    it('limits concurrent execution', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      const tasks = [1, 2, 3, 4, 5].map((id) => async () => {
        executing.add(id)
        maxConcurrent = Math.max(maxConcurrent, executing.size)
        await sleep(50)
        executing.delete(id)
        return id
      })

      await parallel(tasks, { concurrency: 2 })

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('uses unlimited concurrency by default', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      const tasks = [1, 2, 3, 4, 5].map((id) => async () => {
        executing.add(id)
        maxConcurrent = Math.max(maxConcurrent, executing.size)
        await sleep(10)
        executing.delete(id)
        return id
      })

      await parallel(tasks)

      expect(maxConcurrent).toBe(5)
    })
  })

  describe('error handling', () => {
    it('returns Err when task fails', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task 2 failed') },
        async () => 3,
      ]

      const result = await parallel(tasks)
      expect(isErr(result)).toBe(true)
    })

    it('stops execution on error (with concurrency)', async () => {
      const executed: number[] = []

      const tasks = [1, 2, 3, 4, 5].map((id) => async () => {
        executed.push(id)
        await sleep(50)
        if (id === 3) throw new Error('Failed')
        return id
      })

      const result = await parallel(tasks, { concurrency: 2 })
      expect(isErr(result)).toBe(true)
    })

    it('parallelOrThrow variant throws on error', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task 2 failed') },
        async () => 3,
      ]

      await expect(parallelOrThrow(tasks)).rejects.toThrow()
    })
  })
})

describe('Async.sequential', () => {
  describe('basic sequential execution', () => {
    it('executes tasks one at a time', async () => {
      const order: number[] = []

      const tasks = [1, 2, 3].map((id) => async () => {
        order.push(id)
        await sleep(10)
        return id
      })

      const result = await sequential(tasks)

      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([1, 2, 3])
      expect(order).toEqual([1, 2, 3])
    })

    it('waits for each task to complete before starting next', async () => {
      const events: string[] = []

      const tasks = [
        async () => {
          events.push('start-1')
          await sleep(50)
          events.push('end-1')
          return 1
        },
        async () => {
          events.push('start-2')
          await sleep(50)
          events.push('end-2')
          return 2
        },
      ]

      const result = await sequential(tasks)

      expect(isOk(result)).toBe(true)
      expect(events).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
    })

    it('handles empty task array', async () => {
      const result = await sequential([])
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([])
    })
  })

  describe('error handling', () => {
    it('stops on first error', async () => {
      const executed: number[] = []

      const tasks = [
        async () => { executed.push(1); return 1 },
        async () => { executed.push(2); throw new Error('Failed') },
        async () => { executed.push(3); return 3 },
      ]

      const result = await sequential(tasks)

      expect(isErr(result)).toBe(true)
      expect(executed).toEqual([1, 2]) // Task 3 never executed

      if (isErr(result)) {
        expect(result.error.type).toBe('sequential_error')
        expect(result.error.taskIndex).toBe(1)
        expect(result.error.completedTasks).toBe(1)
      }
    })

    it('propagates error from failing task', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task error') },
      ]

      const result = await sequential(tasks)
      expect(isErr(result)).toBe(true)
    })

    it('sequentialOrThrow variant throws on error', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task error') },
      ]

      await expect(sequentialOrThrow(tasks)).rejects.toThrow()
    })
  })

  describe('use cases', () => {
    it('handles dependent tasks', async () => {
      let state = 0

      const tasks = [
        async () => { state += 1; return state },
        async () => { state *= 2; return state },
        async () => { state += 10; return state },
      ]

      const result = await sequential(tasks)

      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([1, 2, 12])
      expect(state).toBe(12)
    })
  })
})

describe('Async.filterAsync', () => {
  describe('basic filtering', () => {
    it('filters array with async predicate', async () => {
      const result = await filterAsync(
        [1, 2, 3, 4, 5],
        async (x) => x % 2 === 0
      )
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([2, 4])
    })

    it('passes index to predicate', async () => {
      const result = await filterAsync(
        ['a', 'b', 'c', 'd'],
        async (x, i) => i % 2 === 0
      )
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual(['a', 'c'])
    })

    it('handles empty array', async () => {
      const result = await filterAsync([], async () => true)
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([])
    })

    it('handles predicate that filters everything', async () => {
      const result = await filterAsync(
        [1, 2, 3],
        async () => false
      )
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([])
    })

    it('handles predicate that keeps everything', async () => {
      const result = await filterAsync(
        [1, 2, 3],
        async () => true
      )
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([1, 2, 3])
    })
  })

  describe('concurrency control', () => {
    it('respects concurrency limit', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      const result = await filterAsync(
        [1, 2, 3, 4, 5],
        async (x) => {
          executing.add(x)
          maxConcurrent = Math.max(maxConcurrent, executing.size)
          await sleep(50)
          executing.delete(x)
          return true
        },
        { concurrency: 2 }
      )

      expect(isOk(result)).toBe(true)
      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })
  })

  describe('data-last', () => {
    it('returns curried function', async () => {
      const filterEven = filterAsync(async (x: number) => x % 2 === 0)
      expect(typeof filterEven).toBe('function')

      const result = await filterEven([1, 2, 3, 4, 5])
      expect(isOk(result)).toBe(true)
      expect(unwrapOr(result, [])).toEqual([2, 4])
    })
  })

  describe('error handling', () => {
    it('returns Err when predicate fails', async () => {
      const result = await filterAsync(
        [1, 2, 3, 4, 5],
        async (x) => {
          if (x === 3) throw new Error('Predicate failed')
          return x % 2 === 0
        }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('filter_async_error')
      }
    })

    it('filterAsyncOrThrow variant throws on error', async () => {
      await expect(
        filterAsyncOrThrow(
          [1, 2, 3, 4, 5],
          async (x) => {
            if (x === 3) throw new Error('Predicate failed')
            return x % 2 === 0
          }
        )
      ).rejects.toThrow()
    })
  })
})

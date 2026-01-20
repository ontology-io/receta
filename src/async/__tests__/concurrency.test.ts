import { describe, it, expect } from 'bun:test'
import { parallel, sequential } from '../index'
import { sleep } from '../retry'
import { filterAsync } from '../filterAsync'

describe('Async.parallel', () => {
  describe('basic parallel execution', () => {
    it('executes all tasks and returns results', async () => {
      const tasks = [
        async () => 1,
        async () => 2,
        async () => 3,
      ]

      const results = await parallel(tasks)
      expect(results).toEqual([1, 2, 3])
    })

    it('preserves order of results', async () => {
      const tasks = [
        async () => { await sleep(100); return 'slow' },
        async () => { await sleep(10); return 'fast' },
        async () => { await sleep(50); return 'medium' },
      ]

      const results = await parallel(tasks)
      expect(results).toEqual(['slow', 'fast', 'medium'])
    })

    it('handles empty task array', async () => {
      const results = await parallel([])
      expect(results).toEqual([])
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
    it('propagates first error', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task 2 failed') },
        async () => 3,
      ]

      await expect(parallel(tasks)).rejects.toThrow('Task 2 failed')
    })

    it('stops execution on error (with concurrency)', async () => {
      const executed: number[] = []

      const tasks = [1, 2, 3, 4, 5].map((id) => async () => {
        executed.push(id)
        await sleep(50)
        if (id === 3) throw new Error('Failed')
        return id
      })

      await expect(parallel(tasks, { concurrency: 2 })).rejects.toThrow('Failed')
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

      const results = await sequential(tasks)

      expect(results).toEqual([1, 2, 3])
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

      await sequential(tasks)

      expect(events).toEqual(['start-1', 'end-1', 'start-2', 'end-2'])
    })

    it('handles empty task array', async () => {
      const results = await sequential([])
      expect(results).toEqual([])
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

      await expect(sequential(tasks)).rejects.toThrow('Failed')

      expect(executed).toEqual([1, 2]) // Task 3 never executed
    })

    it('propagates error from failing task', async () => {
      const tasks = [
        async () => 1,
        async () => { throw new Error('Task error') },
      ]

      await expect(sequential(tasks)).rejects.toThrow('Task error')
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

      const results = await sequential(tasks)

      expect(results).toEqual([1, 2, 12])
      expect(state).toBe(12)
    })
  })
})

describe('Async.filterAsync', () => {
  describe('basic filtering', () => {
    it('filters array with async predicate', async () => {
      const results = await filterAsync(
        [1, 2, 3, 4, 5],
        async (x) => x % 2 === 0
      )
      expect(results).toEqual([2, 4])
    })

    it('passes index to predicate', async () => {
      const results = await filterAsync(
        ['a', 'b', 'c', 'd'],
        async (x, i) => i % 2 === 0
      )
      expect(results).toEqual(['a', 'c'])
    })

    it('handles empty array', async () => {
      const results = await filterAsync([], async () => true)
      expect(results).toEqual([])
    })

    it('handles predicate that filters everything', async () => {
      const results = await filterAsync(
        [1, 2, 3],
        async () => false
      )
      expect(results).toEqual([])
    })

    it('handles predicate that keeps everything', async () => {
      const results = await filterAsync(
        [1, 2, 3],
        async () => true
      )
      expect(results).toEqual([1, 2, 3])
    })
  })

  describe('concurrency control', () => {
    it('respects concurrency limit', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      await filterAsync(
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

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })
  })

  describe('data-last', () => {
    it('returns curried function', async () => {
      const filterEven = filterAsync(async (x: number) => x % 2 === 0)
      expect(typeof filterEven).toBe('function')

      const results = await filterEven([1, 2, 3, 4, 5])
      expect(results).toEqual([2, 4])
    })
  })
})

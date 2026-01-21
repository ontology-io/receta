import { describe, it, expect } from 'bun:test'
import { retryResult, mapAsyncResult, timeoutResult, pollResult, sleep } from '../index'
import { isOk, isErr, unwrapOr, map as mapResult, mapErr } from '../../result'
import * as R from 'remeda'

describe('Async Result Integration', () => {
  describe('retryResult', () => {
    it('returns Ok on success', async () => {
      const result = await retryResult(async () => 42)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Err after max attempts', async () => {
      let attempts = 0
      const result = await retryResult(
        async () => {
          attempts++
          throw new Error('Failed')
        },
        { maxAttempts: 3, delay: 10 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('max_attempts_exceeded')
        expect(result.error.attempts).toBe(3)
      }
      expect(attempts).toBe(3)
    })

    it('returns Ok after successful retry', async () => {
      let attempts = 0
      const result = await retryResult(
        async () => {
          attempts++
          if (attempts < 3) throw new Error('Not yet')
          return 'success'
        },
        { maxAttempts: 5, delay: 10 }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('success')
      }
      expect(attempts).toBe(3)
    })

    it('composes with Result functions', async () => {
      const result = await retryResult(async () => 5, { maxAttempts: 1 })

      const doubled = R.pipe(
        result,
        mapResult(x => x * 2),
        unwrapOr(0)
      )

      expect(doubled).toBe(10)
    })

    it('handles errors with mapErr', async () => {
      const result = await retryResult(
        async () => {
          throw new Error('Test error')
        },
        { maxAttempts: 1, delay: 10 }
      )

      const mapped = R.pipe(
        result,
        mapErr(error => `Failed: ${error.type}`)
      )

      expect(isErr(mapped)).toBe(true)
      if (isErr(mapped)) {
        expect(mapped.error).toBe('Failed: max_attempts_exceeded')
      }
    })
  })

  describe('mapAsyncResult', () => {
    it('returns Ok with all successes', async () => {
      const result = await mapAsyncResult(
        [1, 2, 3],
        async (x) => {
          return isOk({ _tag: 'Ok' as const, value: x * 2 })
            ? { _tag: 'Ok' as const, value: x * 2 }
            : { _tag: 'Err' as const, error: 'fail' }
        }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual([2, 4, 6])
      }
    })

    it('returns Err on first failure', async () => {
      const result = await mapAsyncResult(
        [1, 2, 3, 4],
        async (x) => {
          if (x === 3) {
            return { _tag: 'Err' as const, error: 'Failed at 3' }
          }
          return { _tag: 'Ok' as const, value: x * 2 }
        }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('item_failed')
        expect(result.error.index).toBe(2)
        expect(result.error.error).toBe('Failed at 3')
      }
    })

    it('respects concurrency limit', async () => {
      const executing = new Set<number>()
      let maxConcurrent = 0

      await mapAsyncResult(
        [1, 2, 3, 4, 5],
        async (x) => {
          executing.add(x)
          maxConcurrent = Math.max(maxConcurrent, executing.size)
          await sleep(50)
          executing.delete(x)
          return { _tag: 'Ok' as const, value: x }
        },
        { concurrency: 2 }
      )

      expect(maxConcurrent).toBeLessThanOrEqual(2)
    })

    it('composes with Result functions', async () => {
      const result = await mapAsyncResult(
        [1, 2, 3],
        async (x) => ({ _tag: 'Ok' as const, value: x * 2 })
      )

      const sum = R.pipe(
        result,
        mapResult(arr => arr.reduce((a, b) => a + b, 0)),
        unwrapOr(0)
      )

      expect(sum).toBe(12) // (2 + 4 + 6)
    })
  })

  describe('timeoutResult', () => {
    it('returns Ok when promise resolves in time', async () => {
      const result = await timeoutResult(
        Promise.resolve(42),
        1000
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Err on timeout', async () => {
      const result = await timeoutResult(
        sleep(200).then(() => 'too slow'),
        50
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.name).toBe('TimeoutError')
        expect(result.error.message).toContain('50ms')
      }
    })

    it('composes with Result functions', async () => {
      const result = await timeoutResult(
        Promise.resolve({ name: 'John', age: 30 }),
        1000
      )

      const name = R.pipe(
        result,
        mapResult(user => user.name),
        unwrapOr('Unknown')
      )

      expect(name).toBe('John')
    })

    it('handles timeout with default value', async () => {
      const result = await timeoutResult(
        sleep(200).then(() => 'slow'),
        50
      )

      const value = unwrapOr(result, 'default')
      expect(value).toBe('default')
    })
  })

  describe('pollResult', () => {
    it('returns Ok when condition is met', async () => {
      let attempts = 0
      const result = await pollResult(
        async () => {
          attempts++
          if (attempts >= 3) return 'ready'
          return null
        },
        { interval: 50, maxAttempts: 10 }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('ready')
      }
      expect(attempts).toBe(3)
    })

    it('returns Err after max attempts', async () => {
      const result = await pollResult(
        async () => null, // Never returns truthy
        { interval: 20, maxAttempts: 3 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('max_attempts')
        expect(result.error.attempts).toBe(3)
      }
    })

    it('returns Err on timeout', async () => {
      const result = await pollResult(
        async () => null,
        { interval: 100, maxAttempts: 10, timeout: 250 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('timeout')
      }
    })

    it('composes with Result functions', async () => {
      let attempts = 0
      const result = await pollResult(
        async () => {
          attempts++
          if (attempts >= 2) return { status: 'complete', data: 42 }
          return null
        },
        { interval: 20, maxAttempts: 5 }
      )

      const data = R.pipe(
        result,
        mapResult(job => job.data),
        unwrapOr(0)
      )

      expect(data).toBe(42)
    })
  })

  describe('Integration patterns', () => {
    it('combines retryResult with timeoutResult', async () => {
      const fetchWithRetry = async () => {
        const result = await retryResult(
          async () => {
            return await Promise.resolve({ data: 'test' })
          },
          { maxAttempts: 3, delay: 10 }
        )

        if (isOk(result)) {
          return result.value
        }
        throw new Error('Retry failed')
      }

      const timedResult = await timeoutResult(fetchWithRetry(), 1000)

      expect(isOk(timedResult)).toBe(true)
      if (isOk(timedResult)) {
        expect(timedResult.value.data).toBe('test')
      }
    })

    it('uses mapAsyncResult with retryResult', async () => {
      const result = await mapAsyncResult(
        [1, 2, 3],
        async (x) => {
          const retried = await retryResult(
            async () => x * 2,
            { maxAttempts: 2, delay: 10 }
          )
          return retried
        }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual([2, 4, 6])
      }
    })

    it('chains multiple Result operations', async () => {
      const retryRes = await retryResult(async () => 5, { maxAttempts: 1 })

      const result = R.pipe(
        retryRes,
        mapResult(x => x * 2),
        mapResult(x => x + 10),
        unwrapOr(0)
      )

      expect(result).toBe(20) // (5 * 2) + 10
    })
  })
})

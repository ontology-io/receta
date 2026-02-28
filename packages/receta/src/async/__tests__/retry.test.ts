import { describe, it, expect } from 'bun:test'
import { retry, sleep } from '../retry'
import { isOk, isErr, unwrapOr } from '../../result'

describe('Async.retry', () => {
  describe('basic retry', () => {
    it('returns Ok on first success', async () => {
      const result = await retry(async () => 42)
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('retries on failure and succeeds', async () => {
      let attempts = 0

      const result = await retry(async () => {
        attempts++
        if (attempts < 3) throw new Error('Not yet')
        return 'success'
      })

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('success')
      }
      expect(attempts).toBe(3)
    })

    it('returns Err after max attempts exceeded', async () => {
      let attempts = 0

      const result = await retry(
        async () => {
          attempts++
          throw new Error(`Attempt ${attempts}`)
        },
        { maxAttempts: 3 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.type).toBe('max_attempts_exceeded')
        expect(result.error.attempts).toBe(3)
      }
      expect(attempts).toBe(3)
    })

    it('uses default maxAttempts of 3', async () => {
      let attempts = 0

      const result = await retry(async () => {
        attempts++
        throw new Error('Failed')
      })

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.attempts).toBe(3)
      }
      expect(attempts).toBe(3)
    })
  })

  describe('exponential backoff', () => {
    it('uses exponential backoff by default', async () => {
      let attempts = 0
      const delays: number[] = []
      let lastTime = Date.now()

      const result = await retry(
        async () => {
          attempts++
          const now = Date.now()
          if (attempts > 1) {
            delays.push(now - lastTime)
          }
          lastTime = now
          throw new Error('Failed')
        },
        {
          maxAttempts: 3,
          delay: 100,
          backoff: 2,
        }
      )

      expect(isErr(result)).toBe(true)
      expect(attempts).toBe(3)
      expect(delays.length).toBe(2)
      // First delay ~100ms, second delay ~200ms (with some tolerance)
      expect(delays[0]!).toBeGreaterThanOrEqual(90)
      expect(delays[0]!).toBeLessThan(150)
      expect(delays[1]!).toBeGreaterThanOrEqual(180)
      expect(delays[1]!).toBeLessThan(250)
    })

    it('uses constant delay when backoff is 1', async () => {
      let attempts = 0
      const delays: number[] = []
      let lastTime = Date.now()

      const result = await retry(
        async () => {
          attempts++
          const now = Date.now()
          if (attempts > 1) {
            delays.push(now - lastTime)
          }
          lastTime = now
          throw new Error('Failed')
        },
        {
          maxAttempts: 3,
          delay: 100,
          backoff: 1,
        }
      )

      expect(isErr(result)).toBe(true)
      expect(delays.length).toBe(2)
      // Both delays should be ~100ms
      expect(delays[0]!).toBeGreaterThanOrEqual(90)
      expect(delays[0]!).toBeLessThan(150)
      expect(delays[1]!).toBeGreaterThanOrEqual(90)
      expect(delays[1]!).toBeLessThan(150)
    })

    it('respects maxDelay', async () => {
      let attempts = 0
      const delays: number[] = []
      let lastTime = Date.now()

      const result = await retry(
        async () => {
          attempts++
          const now = Date.now()
          if (attempts > 1) {
            delays.push(now - lastTime)
          }
          lastTime = now
          throw new Error('Failed')
        },
        {
          maxAttempts: 4,
          delay: 100,
          backoff: 10, // Would cause very large delays
          maxDelay: 200,
        }
      )

      expect(isErr(result)).toBe(true)
      // All delays should be capped at maxDelay
      delays.forEach((delay) => {
        expect(delay).toBeLessThan(250)
      })
    })
  })

  describe('shouldRetry predicate', () => {
    it('stops retrying when shouldRetry returns false', async () => {
      let attempts = 0

      const result = await retry(
        async () => {
          attempts++
          throw new Error('Network error')
        },
        {
          maxAttempts: 5,
          shouldRetry: (error) => {
            // Only retry first 2 attempts
            return attempts < 2
          },
        }
      )

      expect(isErr(result)).toBe(true)
      expect(attempts).toBe(2)
    })

    it('continues retrying when shouldRetry returns true', async () => {
      let attempts = 0

      const result = await retry(
        async () => {
          attempts++
          if (attempts < 3) throw new Error('Retry this')
          return 'success'
        },
        {
          shouldRetry: (error) => {
            return error instanceof Error && error.message === 'Retry this'
          },
        }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('success')
      }
      expect(attempts).toBe(3)
    })
  })

  describe('onRetry callback', () => {
    it('calls onRetry on each retry attempt', async () => {
      const retryAttempts: Array<{ error: unknown; attempt: number; delay: number }> = []

      const result = await retry(
        async () => {
          throw new Error('Failed')
        },
        {
          maxAttempts: 3,
          delay: 50,
          onRetry: (error, attempt, delay) => {
            retryAttempts.push({ error, attempt, delay })
          },
        }
      )

      expect(isErr(result)).toBe(true)
      expect(retryAttempts.length).toBe(2) // Called for attempts 1 and 2, not 3
      expect(retryAttempts[0]!.attempt).toBe(1)
      expect(retryAttempts[1]!.attempt).toBe(2)
    })

    it('does not call onRetry on first attempt', async () => {
      let onRetryCalled = false

      const result = await retry(
        async () => 'success',
        {
          onRetry: () => {
            onRetryCalled = true
          },
        }
      )

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('success')
      }
      expect(onRetryCalled).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles maxAttempts of 1 (no retries)', async () => {
      let attempts = 0

      const result = await retry(
        async () => {
          attempts++
          throw new Error('Failed')
        },
        { maxAttempts: 1 }
      )

      expect(isErr(result)).toBe(true)
      expect(attempts).toBe(1)
    })

    it('handles different error types', async () => {
      let attempts = 0

      const result = await retry(
        async () => {
          attempts++
          if (attempts === 1) throw new Error('First')
          if (attempts === 2) throw 'String error'
          throw { custom: 'error' }
        },
        { maxAttempts: 3, delay: 10 }
      )

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.lastError).toEqual({ custom: 'error' })
      }
      expect(attempts).toBe(3)
    })
  })
})

describe('Async.sleep', () => {
  it('sleeps for specified duration', async () => {
    const start = Date.now()
    await sleep(100)
    const duration = Date.now() - start

    expect(duration).toBeGreaterThanOrEqual(90)
    expect(duration).toBeLessThan(150)
  })

  it('resolves with undefined', async () => {
    const result = await sleep(10)
    expect(result).toBeUndefined()
  })
})

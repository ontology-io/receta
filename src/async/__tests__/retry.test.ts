import { describe, it, expect } from 'bun:test'
import { retry, sleep } from '../retry'

describe('Async.retry', () => {
  describe('basic retry', () => {
    it('returns result on first success', async () => {
      const result = await retry(async () => 42)
      expect(result).toBe(42)
    })

    it('retries on failure and succeeds', async () => {
      let attempts = 0

      const result = await retry(async () => {
        attempts++
        if (attempts < 3) throw new Error('Not yet')
        return 'success'
      })

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('throws after max attempts exceeded', async () => {
      let attempts = 0

      await expect(
        retry(
          async () => {
            attempts++
            throw new Error(`Attempt ${attempts}`)
          },
          { maxAttempts: 3 }
        )
      ).rejects.toThrow('Attempt 3')

      expect(attempts).toBe(3)
    })

    it('uses default maxAttempts of 3', async () => {
      let attempts = 0

      await expect(
        retry(async () => {
          attempts++
          throw new Error('Failed')
        })
      ).rejects.toThrow('Failed')

      expect(attempts).toBe(3)
    })
  })

  describe('exponential backoff', () => {
    it('uses exponential backoff by default', async () => {
      let attempts = 0
      const delays: number[] = []
      let lastTime = Date.now()

      await expect(
        retry(
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
      ).rejects.toThrow('Failed')

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

      await expect(
        retry(
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
      ).rejects.toThrow('Failed')

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

      await expect(
        retry(
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
      ).rejects.toThrow('Failed')

      // All delays should be capped at maxDelay
      delays.forEach((delay) => {
        expect(delay).toBeLessThan(250)
      })
    })
  })

  describe('shouldRetry predicate', () => {
    it('stops retrying when shouldRetry returns false', async () => {
      let attempts = 0

      await expect(
        retry(
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
      ).rejects.toThrow('Network error')

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

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })
  })

  describe('onRetry callback', () => {
    it('calls onRetry on each retry attempt', async () => {
      const retryAttempts: Array<{ error: unknown; attempt: number; delay: number }> = []

      await expect(
        retry(
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
      ).rejects.toThrow('Failed')

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

      expect(result).toBe('success')
      expect(onRetryCalled).toBe(false)
    })
  })

  describe('edge cases', () => {
    it('handles maxAttempts of 1 (no retries)', async () => {
      let attempts = 0

      await expect(
        retry(
          async () => {
            attempts++
            throw new Error('Failed')
          },
          { maxAttempts: 1 }
        )
      ).rejects.toThrow('Failed')

      expect(attempts).toBe(1)
    })

    it('handles different error types', async () => {
      let attempts = 0

      await expect(
        retry(
          async () => {
            attempts++
            if (attempts === 1) throw new Error('First')
            if (attempts === 2) throw 'String error'
            throw { custom: 'error' }
          },
          { maxAttempts: 3, delay: 10 }
        )
      ).rejects.toEqual({ custom: 'error' })

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

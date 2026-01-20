import { describe, it, expect } from 'bun:test'
import { timeout, timeoutFn, TimeoutError } from '../timeout'
import { sleep } from '../retry'

describe('Async.timeout', () => {
  describe('basic timeout', () => {
    it('resolves if promise completes before timeout', async () => {
      const promise = Promise.resolve(42)
      const result = await timeout(promise, 1000)
      expect(result).toBe(42)
    })

    it('rejects with TimeoutError if promise exceeds timeout', async () => {
      const promise = sleep(200).then(() => 'too slow')

      await expect(timeout(promise, 50)).rejects.toThrow(TimeoutError)
    })

    it('includes timeout duration in error message', async () => {
      const promise = sleep(200).then(() => 'too slow')

      await expect(timeout(promise, 100)).rejects.toThrow('100ms')
    })

    it('preserves original promise rejection', async () => {
      const promise = Promise.reject(new Error('Original error'))

      await expect(timeout(promise, 1000)).rejects.toThrow('Original error')
    })
  })

  describe('custom timeout error', () => {
    it('uses custom error when provided', async () => {
      const promise = sleep(200)
      const customError = new Error('Custom timeout')

      await expect(
        timeout(promise, 50, { timeout: 50, timeoutError: customError })
      ).rejects.toThrow('Custom timeout')
    })

    it('uses custom error instance', async () => {
      const promise = sleep(200)
      const customError = new Error('Slow operation')

      try {
        await timeout(promise, 50, { timeout: 50, timeoutError: customError })
        throw new Error('Should have timed out')
      } catch (error) {
        expect(error).toBe(customError)
      }
    })
  })

  describe('timeout options', () => {
    it('uses timeout from options over second parameter', async () => {
      const promise = sleep(200)

      // Should use options.timeout (50) not ms parameter (1000)
      await expect(
        timeout(promise, 1000, { timeout: 50 })
      ).rejects.toThrow(TimeoutError)
    })

    it('falls back to ms parameter if options.timeout not provided', async () => {
      const promise = sleep(200)

      await expect(timeout(promise, 50)).rejects.toThrow(TimeoutError)
    })
  })

  describe('edge cases', () => {
    it('handles zero timeout', async () => {
      const promise = Promise.resolve(42)

      // Even with 0 timeout, synchronous resolution might succeed
      // This is timing-dependent, so we just verify it doesn't crash
      try {
        await timeout(promise, 0)
      } catch (error) {
        expect(error).toBeInstanceOf(TimeoutError)
      }
    })

    it('handles very long timeout', async () => {
      const promise = Promise.resolve(42)
      const result = await timeout(promise, 999999)
      expect(result).toBe(42)
    })

    it('handles promise that resolves to undefined', async () => {
      const promise = Promise.resolve(undefined)
      const result = await timeout(promise, 1000)
      expect(result).toBeUndefined()
    })
  })
})

describe('Async.timeoutFn', () => {
  describe('basic functionality', () => {
    it('wraps async function with timeout', async () => {
      const fn = async (x: number) => {
        await sleep(10)
        return x * 2
      }

      const wrapped = timeoutFn(fn, 1000)
      const result = await wrapped(21)

      expect(result).toBe(42)
    })

    it('times out slow functions', async () => {
      const fn = async () => {
        await sleep(200)
        return 'too slow'
      }

      const wrapped = timeoutFn(fn, 50)

      await expect(wrapped()).rejects.toThrow(TimeoutError)
    })

    it('preserves function arguments', async () => {
      const fn = async (a: number, b: string, c: boolean) => {
        return { a, b, c }
      }

      const wrapped = timeoutFn(fn, 1000)
      const result = await wrapped(42, 'hello', true)

      expect(result).toEqual({ a: 42, b: 'hello', c: true })
    })
  })

  describe('with custom error', () => {
    it('uses custom error for timeouts', async () => {
      const fn = async () => {
        await sleep(200)
        return 'slow'
      }

      const customError = new Error('Function too slow')
      const wrapped = timeoutFn(fn, 50, { timeout: 50, timeoutError: customError })

      await expect(wrapped()).rejects.toThrow('Function too slow')
    })
  })

  describe('edge cases', () => {
    it('handles functions with no arguments', async () => {
      const fn = async () => 42

      const wrapped = timeoutFn(fn, 1000)
      const result = await wrapped()

      expect(result).toBe(42)
    })

    it('handles functions that throw', async () => {
      const fn = async () => {
        throw new Error('Function error')
      }

      const wrapped = timeoutFn(fn, 1000)

      await expect(wrapped()).rejects.toThrow('Function error')
    })

    it('can be called multiple times', async () => {
      const fn = async (x: number) => x * 2

      const wrapped = timeoutFn(fn, 1000)

      expect(await wrapped(5)).toBe(10)
      expect(await wrapped(10)).toBe(20)
      expect(await wrapped(15)).toBe(30)
    })
  })
})

describe('TimeoutError', () => {
  it('is instanceof Error', () => {
    const error = new TimeoutError()
    expect(error).toBeInstanceOf(Error)
  })

  it('has correct name', () => {
    const error = new TimeoutError()
    expect(error.name).toBe('TimeoutError')
  })

  it('uses default message', () => {
    const error = new TimeoutError()
    expect(error.message).toBe('Operation timed out')
  })

  it('uses custom message', () => {
    const error = new TimeoutError('Custom message')
    expect(error.message).toBe('Custom message')
  })
})

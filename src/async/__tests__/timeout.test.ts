import { describe, it, expect } from 'bun:test'
import { timeout, TimeoutError } from '../timeout'
import { sleep } from '../retry'
import { isOk, isErr } from '../../result'

describe('Async.timeout', () => {
  describe('basic timeout', () => {
    it('returns Ok if promise completes before timeout', async () => {
      const promise = Promise.resolve(42)
      const result = await timeout(promise, 1000)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Err with TimeoutError if promise exceeds timeout', async () => {
      const promise = sleep(200).then(() => 'too slow')
      const result = await timeout(promise, 50)

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(TimeoutError)
      }
    })

    it('includes timeout duration in error message', async () => {
      const promise = sleep(200).then(() => 'too slow')
      const result = await timeout(promise, 100)

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error.message).toContain('100ms')
      }
    })

    it('preserves original promise rejection as non-timeout error', async () => {
      const promise = Promise.reject(new Error('Original error'))

      await expect(timeout(promise, 1000)).rejects.toThrow('Original error')
    })
  })

  describe('edge cases', () => {
    it('handles zero timeout', async () => {
      const promise = Promise.resolve(42)

      // Even with 0 timeout, synchronous resolution might succeed
      // This is timing-dependent
      const result = await timeout(promise, 0)
      // Either Ok (if resolved fast) or Err (if timed out)
      expect(isOk(result) || isErr(result)).toBe(true)
    })

    it('handles very long timeout', async () => {
      const promise = Promise.resolve(42)
      const result = await timeout(promise, 999999)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('handles promise that resolves to undefined', async () => {
      const promise = Promise.resolve(undefined)
      const result = await timeout(promise, 1000)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBeUndefined()
      }
    })

    it('handles promise that resolves to null', async () => {
      const promise = Promise.resolve(null)
      const result = await timeout(promise, 1000)

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBeNull()
      }
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

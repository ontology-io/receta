import { describe, it, expect } from 'bun:test'
import { ok, err, tryCatch, tryCatchAsync } from '../constructors'
import { isOk, isErr } from '../guards'

describe('Result Constructors', () => {
  describe('ok', () => {
    it('creates an Ok result with value', () => {
      const result = ok(42)
      expect(result._tag).toBe('Ok')
      expect(result.value).toBe(42)
    })

    it('works with different types', () => {
      expect(ok('hello').value).toBe('hello')
      expect(ok(true).value).toBe(true)
      expect(ok({ name: 'John' }).value).toEqual({ name: 'John' })
      expect(ok(null).value).toBe(null)
    })
  })

  describe('err', () => {
    it('creates an Err result with error', () => {
      const result = err('Something went wrong')
      expect(result._tag).toBe('Err')
      expect(result.error).toBe('Something went wrong')
    })

    it('works with different error types', () => {
      expect(err(404).error).toBe(404)
      expect(err(new Error('fail')).error).toBeInstanceOf(Error)
      expect(err({ code: 'ERR', message: 'fail' }).error).toEqual({ code: 'ERR', message: 'fail' })
    })
  })

  describe('tryCatch', () => {
    it('returns Ok when function succeeds', () => {
      const result = tryCatch(() => 42)
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Err when function throws', () => {
      const result = tryCatch(() => {
        throw new Error('fail')
      })
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error)
      }
    })

    it('catches JSON.parse errors', () => {
      const result = tryCatch(() => JSON.parse('invalid json'))
      expect(isErr(result)).toBe(true)
    })

    it('maps errors with custom mapper', () => {
      const result = tryCatch(
        () => {
          throw new Error('Original error')
        },
        (e) => `Caught: ${e}`
      )
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toContain('Caught:')
      }
    })

    it('preserves success value with error mapper', () => {
      const result = tryCatch(
        () => 42,
        (e) => `Error: ${e}`
      )
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })
  })

  describe('tryCatchAsync', () => {
    it('returns Ok when async function succeeds', async () => {
      const result = await tryCatchAsync(async () => 42)
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Err when async function throws', async () => {
      const result = await tryCatchAsync(async () => {
        throw new Error('async fail')
      })
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(Error)
      }
    })

    it('handles rejected promises', async () => {
      const result = await tryCatchAsync(() => Promise.reject('rejected'))
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('rejected')
      }
    })

    it('maps async errors with custom mapper', async () => {
      const result = await tryCatchAsync(
        async () => {
          throw new Error('Async error')
        },
        (e) => ({ code: 'ASYNC_ERROR', original: e })
      )
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toHaveProperty('code', 'ASYNC_ERROR')
      }
    })

    it('preserves async success value with error mapper', async () => {
      const result = await tryCatchAsync(
        async () => 'success',
        (e) => `Error: ${e}`
      )
      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toBe('success')
      }
    })
  })
})

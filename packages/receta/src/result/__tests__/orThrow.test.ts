import { describe, it, expect } from 'bun:test'
import { ok, err, orThrow } from '../index'
import type { Result } from '../types'

describe('Result.orThrow', () => {
  describe('with async Result functions', () => {
    it('returns value from Ok result', async () => {
      const asyncFn = async (x: number): Promise<Result<number, string>> => ok(x * 2)
      const throwingFn = orThrow(asyncFn)

      const result = await throwingFn(5)
      expect(result).toBe(10)
    })

    it('throws error from Err result', async () => {
      const asyncFn = async (x: number): Promise<Result<number, string>> =>
        x > 0 ? ok(x * 2) : err('negative number')

      const throwingFn = orThrow(asyncFn)

      expect(throwingFn(-5)).rejects.toThrow('negative number')
    })

    it('preserves argument types', async () => {
      const asyncFn = async (
        a: string,
        b: number,
        c: boolean
      ): Promise<Result<string, Error>> => ok(`${a}-${b}-${c}`)

      const throwingFn = orThrow(asyncFn)

      const result = await throwingFn('test', 42, true)
      expect(result).toBe('test-42-true')
    })

    it('preserves complex return types', async () => {
      type User = { id: number; name: string }
      const asyncFn = async (id: number): Promise<Result<User, string>> =>
        ok({ id, name: 'Alice' })

      const throwingFn = orThrow(asyncFn)

      const result = await throwingFn(1)
      expect(result).toEqual({ id: 1, name: 'Alice' })
    })
  })

  describe('with data-first functions', () => {
    it('works with standard async function', async () => {
      const fetchUser = async (id: number): Promise<Result<string, Error>> =>
        id > 0 ? ok(`User${id}`) : err(new Error('Invalid ID'))

      const fetchUserOrThrow = orThrow(fetchUser)

      expect(await fetchUserOrThrow(1)).toBe('User1')
      expect(fetchUserOrThrow(0)).rejects.toThrow('Invalid ID')
    })

    it('works with variadic arguments', async () => {
      const sum = async (...nums: number[]): Promise<Result<number, string>> =>
        nums.length > 0 ? ok(nums.reduce((a, b) => a + b, 0)) : err('empty array')

      const sumOrThrow = orThrow(sum)

      expect(await sumOrThrow(1, 2, 3, 4)).toBe(10)
      expect(sumOrThrow()).rejects.toThrow('empty array')
    })
  })

  describe('with optional parameters', () => {
    it('preserves optional parameters', async () => {
      const greet = async (
        name: string,
        prefix?: string
      ): Promise<Result<string, never>> => ok(`${prefix ?? 'Hello'} ${name}`)

      const greetOrThrow = orThrow(greet)

      expect(await greetOrThrow('Alice')).toBe('Hello Alice')
      expect(await greetOrThrow('Alice', 'Hi')).toBe('Hi Alice')
    })
  })

  describe('error handling', () => {
    it('throws with custom error objects', async () => {
      interface CustomError {
        code: string
        message: string
      }

      const asyncFn = async (x: number): Promise<Result<number, CustomError>> =>
        x > 0 ? ok(x) : err({ code: 'INVALID', message: 'Must be positive' })

      const throwingFn = orThrow(asyncFn)

      try {
        await throwingFn(-1)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toEqual({ code: 'INVALID', message: 'Must be positive' })
      }
    })

    it('throws with primitive errors', async () => {
      const asyncFn = async (x: number): Promise<Result<number, number>> =>
        x > 0 ? ok(x) : err(404)

      const throwingFn = orThrow(asyncFn)

      try {
        await throwingFn(-1)
        expect(true).toBe(false) // Should not reach here
      } catch (error) {
        expect(error).toBe(404)
      }
    })
  })

  describe('integration with real-world patterns', () => {
    it('works with mapAsync-style functions', async () => {
      // Simulate mapAsync signature
      const mapAsync = async <T, U>(
        items: readonly T[],
        fn: (item: T) => Promise<U>
      ): Promise<Result<U[], Error>> => {
        try {
          const results = await Promise.all(items.map(fn))
          return ok(results)
        } catch (error) {
          return err(error as Error)
        }
      }

      const mapAsyncOrThrow = orThrow(mapAsync)

      const result = await mapAsyncOrThrow([1, 2, 3], async (x) => x * 2)
      expect(result).toEqual([2, 4, 6])
    })

    it('works with retry-style functions', async () => {
      let attempts = 0

      // Simulate retry signature
      const retry = async <T>(fn: () => Promise<T>): Promise<Result<T, Error>> => {
        attempts++
        return attempts >= 2 ? ok(await fn()) : err(new Error('Retry failed'))
      }

      const retryOrThrow = orThrow(retry)

      // First call fails
      expect(retryOrThrow(async () => 'success')).rejects.toThrow('Retry failed')

      // Second call succeeds
      expect(await retryOrThrow(async () => 'success')).toBe('success')
    })
  })

  describe('type safety', () => {
    it('enforces correct argument types', async () => {
      const typedFn = async (x: number): Promise<Result<string, Error>> => ok(String(x))
      const throwingFn = orThrow(typedFn)

      // This should compile
      const result = await throwingFn(42)
      expect(result).toBe('42')

      // @ts-expect-error - Should not accept string
      // throwingFn('not a number')
    })

    it('infers correct return type', async () => {
      const typedFn = async (x: number): Promise<Result<boolean, Error>> => ok(x > 0)
      const throwingFn = orThrow(typedFn)

      const result = await throwingFn(5)

      // TypeScript should infer result as boolean
      const isBoolean: boolean = result
      expect(isBoolean).toBe(true)
    })
  })
})

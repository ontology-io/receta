import { describe, it, expect } from 'bun:test'
import { some, none, fromNullable, fromResult, tryCatch } from '../constructors'
import { isSome, isNone } from '../guards'
import { ok, err } from '../../result/constructors'

describe('Option Constructors', () => {
  describe('some', () => {
    it('creates a Some option with value', () => {
      const result = some(42)
      expect(result._tag).toBe('Some')
      expect(result.value).toBe(42)
    })

    it('works with different types', () => {
      expect(some('hello').value).toBe('hello')
      expect(some(true).value).toBe(true)
      expect(some({ name: 'John' }).value).toEqual({ name: 'John' })
      expect(some(null).value).toBe(null)
    })

    it('wraps arrays', () => {
      const result = some([1, 2, 3])
      expect(result.value).toEqual([1, 2, 3])
    })

    it('wraps objects', () => {
      const obj = { id: 1, name: 'Test' }
      const result = some(obj)
      expect(result.value).toBe(obj)
    })
  })

  describe('none', () => {
    it('creates a None option', () => {
      const result = none()
      expect(result._tag).toBe('None')
    })

    it('none options are equal by tag', () => {
      const a = none()
      const b = none()
      expect(a._tag).toBe(b._tag)
    })
  })

  describe('fromNullable', () => {
    it('returns Some for non-null values', () => {
      const result = fromNullable(42)
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns None for null', () => {
      const result = fromNullable(null)
      expect(isNone(result)).toBe(true)
    })

    it('returns None for undefined', () => {
      const result = fromNullable(undefined)
      expect(isNone(result)).toBe(true)
    })

    it('handles 0 as Some', () => {
      const result = fromNullable(0)
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(0)
      }
    })

    it('handles empty string as Some', () => {
      const result = fromNullable('')
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe('')
      }
    })

    it('handles false as Some', () => {
      const result = fromNullable(false)
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(false)
      }
    })

    it('works with array find', () => {
      const arr = [1, 2, 3]
      const found = fromNullable(arr.find((x) => x === 2))
      const notFound = fromNullable(arr.find((x) => x === 5))

      expect(isSome(found)).toBe(true)
      expect(isNone(notFound)).toBe(true)
    })
  })

  describe('fromResult', () => {
    it('returns Some when Result is Ok', () => {
      const result = fromResult(ok(42))
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns None when Result is Err', () => {
      const result = fromResult(err('error'))
      expect(isNone(result)).toBe(true)
    })

    it('discards error information', () => {
      const result = fromResult(err({ code: 'ERROR', message: 'Something went wrong' }))
      expect(isNone(result)).toBe(true)
      // Error information is not preserved
    })

    it('preserves Ok value type', () => {
      const result = fromResult(ok({ name: 'John', age: 30 }))
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toEqual({ name: 'John', age: 30 })
      }
    })
  })

  describe('tryCatch', () => {
    it('returns Some when function succeeds', () => {
      const result = tryCatch(() => 42)
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns None when function throws', () => {
      const result = tryCatch(() => {
        throw new Error('fail')
      })
      expect(isNone(result)).toBe(true)
    })

    it('catches JSON.parse errors', () => {
      const result = tryCatch(() => JSON.parse('invalid json'))
      expect(isNone(result)).toBe(true)
    })

    it('returns Some for successful JSON.parse', () => {
      const result = tryCatch(() => JSON.parse('{"name":"John"}'))
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toEqual({ name: 'John' })
      }
    })

    it('catches any error type', () => {
      const result = tryCatch(() => {
        throw 'string error'
      })
      expect(isNone(result)).toBe(true)
    })

    it('preserves computation value', () => {
      const result = tryCatch(() => {
        const a = 10
        const b = 20
        return a + b
      })
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(30)
      }
    })
  })
})

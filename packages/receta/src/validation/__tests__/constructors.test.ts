import { describe, it, expect } from 'bun:test'
import {
  valid,
  invalid,
  fromPredicate,
  fromPredicateWithError,
  fromResult,
  tryCatch,
  tryCatchAsync,
} from '../constructors'
import { isValid, isInvalid } from '../guards'
import { ok, err } from '../../result/constructors'

describe('Validation Constructors', () => {
  describe('valid', () => {
    it('creates Valid validation with value', () => {
      const result = valid(42)
      expect(result._tag).toBe('Valid')
      expect(result.value).toBe(42)
    })

    it('works with different types', () => {
      expect(valid('hello').value).toBe('hello')
      expect(valid(true).value).toBe(true)
      expect(valid({ name: 'John' }).value).toEqual({ name: 'John' })
      expect(valid([1, 2, 3]).value).toEqual([1, 2, 3])
    })
  })

  describe('invalid', () => {
    it('creates Invalid validation with single error', () => {
      const result = invalid('error message')
      expect(result._tag).toBe('Invalid')
      expect(result.errors).toEqual(['error message'])
    })

    it('creates Invalid validation with multiple errors', () => {
      const result = invalid(['error1', 'error2', 'error3'])
      expect(result._tag).toBe('Invalid')
      expect(result.errors).toEqual(['error1', 'error2', 'error3'])
    })

    it('works with different error types', () => {
      const numErrors = invalid([1, 2, 3])
      expect(numErrors.errors).toEqual([1, 2, 3])

      const objErrors = invalid([{ code: 'ERR1' }, { code: 'ERR2' }])
      expect(objErrors.errors).toEqual([{ code: 'ERR1' }, { code: 'ERR2' }])
    })
  })

  describe('fromPredicate', () => {
    it('returns Valid when predicate passes', () => {
      const isPositive = fromPredicate((n: number) => n > 0, 'Must be positive')
      const result = isPositive(5)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toBe(5)
      }
    })

    it('returns Invalid when predicate fails', () => {
      const isPositive = fromPredicate((n: number) => n > 0, 'Must be positive')
      const result = isPositive(-1)

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual(['Must be positive'])
      }
    })

    it('works with complex predicates', () => {
      const isEmail = fromPredicate(
        (s: string) => s.includes('@') && s.includes('.'),
        'Invalid email'
      )

      expect(isValid(isEmail('user@example.com'))).toBe(true)
      expect(isInvalid(isEmail('not-an-email'))).toBe(true)
    })
  })

  describe('fromPredicateWithError', () => {
    it('returns Valid when predicate passes', () => {
      const minLength = fromPredicateWithError(
        (s: string) => s.length >= 5,
        (s) => `Expected 5 chars, got ${s.length}`
      )
      const result = minLength('hello')

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toBe('hello')
      }
    })

    it('returns Invalid with dynamic error when predicate fails', () => {
      const minLength = fromPredicateWithError(
        (s: string) => s.length >= 5,
        (s) => `Expected 5 chars, got ${s.length}`
      )
      const result = minLength('hi')

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors).toEqual(['Expected 5 chars, got 2'])
      }
    })

    it('generates error based on input value', () => {
      const inRange = fromPredicateWithError(
        (n: number) => n >= 0 && n <= 100,
        (n) => `${n} is out of range [0, 100]`
      )

      const result1 = inRange(-5)
      const result2 = inRange(150)

      expect(isInvalid(result1) && result1.errors).toEqual(['-5 is out of range [0, 100]'])
      expect(isInvalid(result2) && result2.errors).toEqual(['150 is out of range [0, 100]'])
    })
  })

  describe('fromResult', () => {
    it('converts Ok to Valid', () => {
      const validation = fromResult(ok(42))

      expect(isValid(validation)).toBe(true)
      if (isValid(validation)) {
        expect(validation.value).toBe(42)
      }
    })

    it('converts Err to Invalid', () => {
      const validation = fromResult(err('error message'))

      expect(isInvalid(validation)).toBe(true)
      if (isInvalid(validation)) {
        expect(validation.errors).toEqual(['error message'])
      }
    })
  })

  describe('tryCatch', () => {
    it('returns Valid when function succeeds', () => {
      const result = tryCatch(() => 42)

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Invalid when function throws', () => {
      const result = tryCatch(() => {
        throw new Error('fail')
      })

      expect(isInvalid(result)).toBe(true)
    })

    it('maps error with custom mapper', () => {
      const result = tryCatch(
        () => {
          throw new Error('Original error')
        },
        (e) => `Caught: ${String(e)}`
      )

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors[0]).toContain('Caught:')
      }
    })

    it('works with JSON.parse', () => {
      const parseJSON = <T>(str: string) => tryCatch(() => JSON.parse(str) as T)

      const validResult = parseJSON<{ name: string }>('{"name":"John"}')
      expect(isValid(validResult)).toBe(true)

      const invalidResult = parseJSON('invalid json')
      expect(isInvalid(invalidResult)).toBe(true)
    })
  })

  describe('tryCatchAsync', () => {
    it('returns Valid when promise resolves', async () => {
      const result = await tryCatchAsync(() => Promise.resolve(42))

      expect(isValid(result)).toBe(true)
      if (isValid(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Invalid when promise rejects', async () => {
      const result = await tryCatchAsync(() => Promise.reject(new Error('fail')))

      expect(isInvalid(result)).toBe(true)
    })

    it('maps error with custom mapper', async () => {
      const result = await tryCatchAsync(
        () => Promise.reject(new Error('Original')),
        (e) => `Async error: ${String(e)}`
      )

      expect(isInvalid(result)).toBe(true)
      if (isInvalid(result)) {
        expect(result.errors[0]).toContain('Async error:')
      }
    })
  })
})

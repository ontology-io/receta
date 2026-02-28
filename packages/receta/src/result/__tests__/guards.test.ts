import { describe, it, expect } from 'bun:test'
import { ok, err } from '../constructors'
import { isOk, isErr } from '../guards'
import type { Result } from '../types'

describe('Result Guards', () => {
  describe('isOk', () => {
    it('returns true for Ok results', () => {
      expect(isOk(ok(42))).toBe(true)
      expect(isOk(ok('hello'))).toBe(true)
      expect(isOk(ok(null))).toBe(true)
    })

    it('returns false for Err results', () => {
      expect(isOk(err('fail'))).toBe(false)
      expect(isOk(err(404))).toBe(false)
    })

    it('narrows type to Ok', () => {
      const result: Result<number, string> = ok(42)

      if (isOk(result)) {
        // TypeScript should know result.value is accessible
        const value: number = result.value
        expect(value).toBe(42)
      }
    })
  })

  describe('isErr', () => {
    it('returns true for Err results', () => {
      expect(isErr(err('fail'))).toBe(true)
      expect(isErr(err(404))).toBe(true)
      expect(isErr(err(null))).toBe(true)
    })

    it('returns false for Ok results', () => {
      expect(isErr(ok(42))).toBe(false)
      expect(isErr(ok('success'))).toBe(false)
    })

    it('narrows type to Err', () => {
      const result: Result<number, string> = err('fail')

      if (isErr(result)) {
        // TypeScript should know result.error is accessible
        const error: string = result.error
        expect(error).toBe('fail')
      }
    })
  })

  describe('type narrowing in practice', () => {
    it('enables safe branching logic', () => {
      const results: Result<number, string>[] = [
        ok(1),
        err('fail'),
        ok(2)
      ]

      const values: number[] = []
      const errors: string[] = []

      for (const result of results) {
        if (isOk(result)) {
          values.push(result.value)
        } else {
          errors.push(result.error)
        }
      }

      expect(values).toEqual([1, 2])
      expect(errors).toEqual(['fail'])
    })
  })
})

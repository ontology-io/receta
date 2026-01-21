import { describe, it, expect } from 'bun:test'
import { some, none } from '../constructors'
import { isSome, isNone } from '../guards'

describe('Option Guards', () => {
  describe('isSome', () => {
    it('returns true for Some', () => {
      expect(isSome(some(42))).toBe(true)
    })

    it('returns false for None', () => {
      expect(isSome(none())).toBe(false)
    })

    it('narrows type to Some', () => {
      const opt = some(42)
      if (isSome(opt)) {
        // TypeScript should know opt.value exists
        expect(opt.value).toBe(42)
      }
    })

    it('works with different value types', () => {
      expect(isSome(some('hello'))).toBe(true)
      expect(isSome(some(0))).toBe(true)
      expect(isSome(some(false))).toBe(true)
      expect(isSome(some(null))).toBe(true)
      expect(isSome(some(undefined))).toBe(true)
    })
  })

  describe('isNone', () => {
    it('returns true for None', () => {
      expect(isNone(none())).toBe(true)
    })

    it('returns false for Some', () => {
      expect(isNone(some(42))).toBe(false)
    })

    it('narrows type to None', () => {
      const opt = none()
      if (isNone(opt)) {
        // TypeScript should know this is None
        expect(opt._tag).toBe('None')
      }
    })
  })

  describe('type guards in control flow', () => {
    it('work in if statements', () => {
      const opt = some(42)
      let value = 0

      if (isSome(opt)) {
        value = opt.value
      }

      expect(value).toBe(42)
    })

    it('work with early returns', () => {
      const getValue = (opt: ReturnType<typeof some> | ReturnType<typeof none>): number => {
        if (isNone(opt)) {
          return 0
        }
        return opt.value as number
      }

      expect(getValue(some(42))).toBe(42)
      expect(getValue(none())).toBe(0)
    })

    it('work in ternary expressions', () => {
      const opt1 = some(42)
      const opt2 = none()

      expect(isSome(opt1) ? opt1.value : 0).toBe(42)
      expect(isSome(opt2) ? (opt2.value as number) : 0).toBe(0)
    })
  })
})

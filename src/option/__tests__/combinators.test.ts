import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { some, none, fromNullable } from '../constructors'
import { collect } from '../collect'
import { partition } from '../partition'
import { toResult } from '../toResult'
import { toNullable } from '../toNullable'
import { map } from '../map'
import { isSome, isNone } from '../guards'
import { isOk, isErr } from '../../result/guards'

describe('Option Combinators', () => {
  describe('collect', () => {
    describe('data-first', () => {
      it('returns Some with array when all are Some', () => {
        const result = collect([some(1), some(2), some(3)])
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toEqual([1, 2, 3])
        }
      })

      it('returns None when any is None', () => {
        const result = collect([some(1), none(), some(3)])
        expect(isNone(result)).toBe(true)
      })

      it('returns None when first is None', () => {
        const result = collect([none(), some(1), some(2)])
        expect(isNone(result)).toBe(true)
      })

      it('returns None when last is None', () => {
        const result = collect([some(1), some(2), none()])
        expect(isNone(result)).toBe(true)
      })

      it('returns Some for empty array', () => {
        const result = collect([])
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toEqual([])
        }
      })

      it('works with different types', () => {
        const result = collect([some('a'), some('b'), some('c')])
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toEqual(['a', 'b', 'c'])
        }
      })

      it('preserves order', () => {
        const result = collect([some(3), some(1), some(2)])
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toEqual([3, 1, 2])
        }
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe([some(1), some(2), some(3)], collect)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toEqual([1, 2, 3])
        }
      })
    })

    describe('real-world usage', () => {
      it('validates multiple fields', () => {
        const validateEmail = (email: string) => (email.includes('@') ? some(email) : none())

        const validateAge = (age: number) => (age >= 18 ? some(age) : none())

        const validateForm = (email: string, age: number) =>
          R.pipe(
            collect([validateEmail(email), validateAge(age)]),
            map(([validEmail, validAge]) => ({
              email: validEmail,
              age: validAge,
            }))
          )

        const valid = validateForm('user@example.com', 25)
        expect(isSome(valid)).toBe(true)

        const invalidEmail = validateForm('invalid', 25)
        expect(isNone(invalidEmail)).toBe(true)

        const invalidAge = validateForm('user@example.com', 15)
        expect(isNone(invalidAge)).toBe(true)
      })
    })
  })

  describe('partition', () => {
    describe('data-first', () => {
      it('separates Some values and counts Nones', () => {
        const [values, noneCount] = partition([some(1), none(), some(2), none(), some(3)])
        expect(values).toEqual([1, 2, 3])
        expect(noneCount).toBe(2)
      })

      it('returns all values when no Nones', () => {
        const [values, noneCount] = partition([some(1), some(2), some(3)])
        expect(values).toEqual([1, 2, 3])
        expect(noneCount).toBe(0)
      })

      it('returns empty array when all Nones', () => {
        const [values, noneCount] = partition([none(), none(), none()])
        expect(values).toEqual([])
        expect(noneCount).toBe(3)
      })

      it('handles empty array', () => {
        const [values, noneCount] = partition([])
        expect(values).toEqual([])
        expect(noneCount).toBe(0)
      })

      it('preserves order of Some values', () => {
        const [values] = partition([some(3), none(), some(1), some(2), none()])
        expect(values).toEqual([3, 1, 2])
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const [values, noneCount] = R.pipe([some(1), none(), some(2)], partition)
        expect(values).toEqual([1, 2])
        expect(noneCount).toBe(1)
      })
    })

    describe('real-world usage', () => {
      it('processes batch operations', () => {
        const fetchUser = (id: number): ReturnType<typeof some | typeof none> =>
          id > 0 ? some({ id, name: `User ${id}` }) : none()

        const ids = [1, -1, 2, -2, 3]
        const results = ids.map(fetchUser)
        const [users, failedCount] = partition(results)

        expect(users).toHaveLength(3)
        expect(failedCount).toBe(2)
      })

      it('filters nullable results', () => {
        const data = [1, null, 2, undefined, 3, null]
        const options = data.map(fromNullable)
        const [values, noneCount] = partition(options)

        expect(values).toEqual([1, 2, 3])
        expect(noneCount).toBe(3)
      })
    })
  })

  describe('toResult', () => {
    describe('data-first', () => {
      it('converts Some to Ok', () => {
        const result = toResult(some(42), 'error')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(42)
        }
      })

      it('converts None to Err with provided error', () => {
        const result = toResult(none(), 'No value')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error).toBe('No value')
        }
      })

      it('works with complex error types', () => {
        const result = toResult(none(), {
          code: 'NOT_FOUND',
          message: 'Value not found',
        })
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error).toEqual({
            code: 'NOT_FOUND',
            message: 'Value not found',
          })
        }
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(42), toResult('error'))
        expect(isOk(result)).toBe(true)
      })

      it('converts None in pipeline', () => {
        const result = R.pipe(none<number>(), map((x) => x * 2), toResult('Failed'))
        expect(isErr(result)).toBe(true)
      })
    })
  })

  describe('toNullable', () => {
    describe('data-first', () => {
      it('converts Some to value', () => {
        expect(toNullable(some(42))).toBe(42)
      })

      it('converts None to null', () => {
        expect(toNullable(none())).toBe(null)
      })

      it('preserves value types', () => {
        expect(toNullable(some('hello'))).toBe('hello')
        expect(toNullable(some({ name: 'John' }))).toEqual({ name: 'John' })
        expect(toNullable(some(0))).toBe(0)
        expect(toNullable(some(false))).toBe(false)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(42), toNullable)
        expect(result).toBe(42)
      })

      it('works at end of transformation pipeline', () => {
        const result = R.pipe(some(10), map((x) => x * 2), toNullable)
        expect(result).toBe(20)
      })

      it('returns null after None', () => {
        const result = R.pipe(none<number>(), map((x) => x * 2), toNullable)
        expect(result).toBe(null)
      })
    })

    describe('real-world usage', () => {
      it('prepares data for external API', () => {
        const apiPayload = {
          userId: toNullable(some('123')),
          email: toNullable(none()),
          metadata: toNullable(some({ role: 'admin' })),
        }

        expect(apiPayload).toEqual({
          userId: '123',
          email: null,
          metadata: { role: 'admin' },
        })
      })
    })
  })

  describe('integration', () => {
    it('combines collect with toResult', () => {
      const results = collect([some(1), some(2), some(3)])
      const result = toResult(results, 'Collection failed')

      expect(isOk(result)).toBe(true)
      if (isOk(result)) {
        expect(result.value).toEqual([1, 2, 3])
      }
    })

    it('handles failed collection', () => {
      const results = collect([some(1), none(), some(3)])
      const result = toResult(results, 'Collection failed')

      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBe('Collection failed')
      }
    })

    it('converts partition results', () => {
      const options = [some(1), none(), some(2)]
      const [values, failedCount] = partition(options)

      expect(values).toEqual([1, 2])
      expect(failedCount).toBe(1)

      const allValues = collect(options)
      expect(isNone(allValues)).toBe(true)
    })
  })
})

import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import {
  isString,
  isNumber,
  isFiniteNumber,
  isInteger,
  isBoolean,
  isNull,
  isUndefined,
  isNullish,
  isDefined,
  isArray,
  isObject,
  isFunction,
  isDate,
  isRegExp,
  isError,
  isPromise,
  isInstanceOf,
} from '../guards'

describe('Predicate.guards', () => {
  describe('isString', () => {
    it('returns true for strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })

    it('returns false for non-strings', () => {
      expect(isString(42)).toBe(false)
      expect(isString(true)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
    })

    it('narrows type in filter', () => {
      const mixed: unknown[] = ['hello', 42, 'world', true]
      const strings = R.filter(mixed, isString)
      expect(strings).toEqual(['hello', 'world'])
      // TypeScript knows strings is string[]
    })
  })

  describe('isNumber', () => {
    it('returns true for numbers', () => {
      expect(isNumber(42)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(-5)).toBe(true)
      expect(isNumber(3.14)).toBe(true)
    })

    it('returns false for NaN', () => {
      expect(isNumber(NaN)).toBe(false)
    })

    it('returns false for non-numbers', () => {
      expect(isNumber('42')).toBe(false)
      expect(isNumber(true)).toBe(false)
      expect(isNumber(null)).toBe(false)
    })

    it('narrows type in filter', () => {
      const mixed: unknown[] = [42, 'hello', 100, null]
      const numbers = R.filter(mixed, isNumber)
      expect(numbers).toEqual([42, 100])
    })
  })

  describe('isFiniteNumber', () => {
    it('returns true for finite numbers', () => {
      expect(isFiniteNumber(42)).toBe(true)
      expect(isFiniteNumber(0)).toBe(true)
      expect(isFiniteNumber(-5)).toBe(true)
    })

    it('returns false for Infinity', () => {
      expect(isFiniteNumber(Infinity)).toBe(false)
      expect(isFiniteNumber(-Infinity)).toBe(false)
    })

    it('returns false for NaN', () => {
      expect(isFiniteNumber(NaN)).toBe(false)
    })
  })

  describe('isInteger', () => {
    it('returns true for integers', () => {
      expect(isInteger(1)).toBe(true)
      expect(isInteger(0)).toBe(true)
      expect(isInteger(-5)).toBe(true)
    })

    it('returns false for floats', () => {
      expect(isInteger(1.5)).toBe(false)
      expect(isInteger(3.14)).toBe(false)
    })

    it('works with filter', () => {
      const numbers = [1, 1.5, 2, 2.5, 3]
      expect(R.filter(numbers, isInteger)).toEqual([1, 2, 3])
    })
  })

  describe('isBoolean', () => {
    it('returns true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })

    it('returns false for non-booleans', () => {
      expect(isBoolean(1)).toBe(false)
      expect(isBoolean('true')).toBe(false)
      expect(isBoolean(null)).toBe(false)
    })
  })

  describe('isNull', () => {
    it('returns true only for null', () => {
      expect(isNull(null)).toBe(true)
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
      expect(isNull('')).toBe(false)
    })
  })

  describe('isUndefined', () => {
    it('returns true only for undefined', () => {
      expect(isUndefined(undefined)).toBe(true)
      expect(isUndefined(null)).toBe(false)
      expect(isUndefined(0)).toBe(false)
      expect(isUndefined('')).toBe(false)
    })
  })

  describe('isNullish', () => {
    it('returns true for null and undefined', () => {
      expect(isNullish(null)).toBe(true)
      expect(isNullish(undefined)).toBe(true)
    })

    it('returns false for other values', () => {
      expect(isNullish(0)).toBe(false)
      expect(isNullish('')).toBe(false)
      expect(isNullish(false)).toBe(false)
    })
  })

  describe('isDefined', () => {
    it('returns true for non-nullish values', () => {
      expect(isDefined(0)).toBe(true)
      expect(isDefined('')).toBe(true)
      expect(isDefined(false)).toBe(true)
      expect(isDefined([])).toBe(true)
    })

    it('returns false for null and undefined', () => {
      expect(isDefined(null)).toBe(false)
      expect(isDefined(undefined)).toBe(false)
    })

    it('narrows type in filter', () => {
      const values: Array<string | null | undefined> = ['hello', null, 'world', undefined]
      const defined = R.filter(values, isDefined)
      expect(defined).toEqual(['hello', 'world'])
      // TypeScript knows defined is string[]
    })
  })

  describe('isArray', () => {
    it('returns true for arrays', () => {
      expect(isArray([])).toBe(true)
      expect(isArray([1, 2, 3])).toBe(true)
    })

    it('returns false for non-arrays', () => {
      expect(isArray({})).toBe(false)
      expect(isArray('array')).toBe(false)
      expect(isArray(null)).toBe(false)
    })
  })

  describe('isObject', () => {
    it('returns true for plain objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })

    it('returns false for arrays', () => {
      expect(isObject([])).toBe(false)
    })

    it('returns false for null', () => {
      expect(isObject(null)).toBe(false)
    })

    it('returns false for functions', () => {
      expect(isObject(() => {})).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('returns true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(function () {})).toBe(true)
      expect(isFunction(async () => {})).toBe(true)
    })

    it('returns false for non-functions', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction('function')).toBe(false)
    })
  })

  describe('isDate', () => {
    it('returns true for Date instances', () => {
      expect(isDate(new Date())).toBe(true)
    })

    it('returns false for non-dates', () => {
      expect(isDate('2024-01-01')).toBe(false)
      expect(isDate(Date.now())).toBe(false)
      expect(isDate({})).toBe(false)
    })
  })

  describe('isRegExp', () => {
    it('returns true for RegExp instances', () => {
      expect(isRegExp(/test/)).toBe(true)
      expect(isRegExp(new RegExp('test'))).toBe(true)
    })

    it('returns false for non-regexes', () => {
      expect(isRegExp('/test/')).toBe(false)
      expect(isRegExp({})).toBe(false)
    })
  })

  describe('isError', () => {
    it('returns true for Error instances', () => {
      expect(isError(new Error('fail'))).toBe(true)
      expect(isError(new TypeError('invalid'))).toBe(true)
      expect(isError(new RangeError('out of range'))).toBe(true)
    })

    it('returns false for non-errors', () => {
      expect(isError('error message')).toBe(false)
      expect(isError({ message: 'error' })).toBe(false)
    })
  })

  describe('isPromise', () => {
    it('returns true for Promise instances', async () => {
      expect(isPromise(Promise.resolve(42))).toBe(true)
      const rejected = Promise.reject(new Error()).catch(() => {})
      expect(isPromise(rejected)).toBe(true)
    })

    it('returns false for async functions', () => {
      expect(isPromise(async () => {})).toBe(false)
    })

    it('returns false for non-promises', () => {
      expect(isPromise({ then: () => {} })).toBe(false)
      expect(isPromise(42)).toBe(false)
    })
  })

  describe('isInstanceOf', () => {
    it('checks if value is instance of a class', () => {
      class User {
        constructor(public name: string) {}
      }

      expect(isInstanceOf(User)(new User('Alice'))).toBe(true)
      expect(isInstanceOf(User)({ name: 'Bob' })).toBe(false)
    })

    it('works with filter', () => {
      class User {
        constructor(public name: string) {}
      }

      const values: unknown[] = [new User('Alice'), { name: 'Bob' }, new User('Charlie')]
      const users = R.filter(values, isInstanceOf(User))
      expect(users).toHaveLength(2)
      expect(users[0]).toBeInstanceOf(User)
      expect(users[1]).toBeInstanceOf(User)
    })
  })

  describe('real-world scenarios', () => {
    it('filters and narrows mixed array', () => {
      const mixed: unknown[] = ['hello', 42, true, null, 'world', undefined, 100]

      const strings = R.filter(mixed, isString)
      expect(strings).toEqual(['hello', 'world'])

      const numbers = R.filter(mixed, isNumber)
      expect(numbers).toEqual([42, 100])

      const defined = R.filter(mixed, isDefined)
      expect(defined).toEqual(['hello', 42, true, 'world', 100])
    })

    it('filters optional properties', () => {
      const users = [
        { id: 1, email: 'alice@example.com' },
        { id: 2, email: undefined },
        { id: 3, email: 'charlie@example.com' },
      ]

      const withEmail = R.filter(users, (u) => isDefined(u.email))
      expect(withEmail).toEqual([
        { id: 1, email: 'alice@example.com' },
        { id: 3, email: 'charlie@example.com' },
      ])
    })
  })
})

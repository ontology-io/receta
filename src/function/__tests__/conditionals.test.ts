import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { ifElse, when, unless, cond } from '../index'
import { some, none } from '../../option'

describe('function/conditionals', () => {
  describe('ifElse', () => {
    describe('data-last', () => {
      it('applies onTrue when predicate passes', () => {
        const classify = ifElse(
          (n: number) => n >= 0,
          (n) => 'positive',
          (n) => 'negative'
        )

        expect(classify(5)).toBe('positive')
        expect(classify(0)).toBe('positive')
      })

      it('applies onFalse when predicate fails', () => {
        const classify = ifElse(
          (n: number) => n >= 0,
          (n) => 'positive',
          (n) => 'negative'
        )

        expect(classify(-3)).toBe('negative')
        expect(classify(-100)).toBe('negative')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          25,
          ifElse(
            (age) => age >= 18,
            (age) => ({ status: 'adult' as const, age }),
            (age) => ({ status: 'minor' as const, age })
          )
        )

        expect(result).toEqual({ status: 'adult', age: 25 })
      })
    })

    describe('data-first', () => {
      it('returns result directly', () => {
        const result = ifElse(
          (n: number) => n % 2 === 0,
          (n) => `${n} is even`,
          (n) => `${n} is odd`,
          7
        )

        expect(result).toBe('7 is odd')
      })

      it('handles different return types correctly', () => {
        const result = ifElse(
          (x: string) => x.length > 5,
          (x) => x.toUpperCase(),
          (x) => x.toLowerCase(),
          'hello'
        )

        expect(result).toBe('hello')
      })
    })
  })

  describe('when', () => {
    describe('data-last', () => {
      it('applies function when predicate passes', () => {
        const ensurePositive = when((n: number) => n < 0, (n) => Math.abs(n))

        expect(ensurePositive(-5)).toBe(5)
        expect(ensurePositive(3)).toBe(3)
        expect(ensurePositive(0)).toBe(0)
      })

      it('returns original when predicate fails', () => {
        const addDefault = when((s: string) => s.length === 0, () => 'default')

        expect(addDefault('')).toBe('default')
        expect(addDefault('hello')).toBe('hello')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          '  ',
          (s) => s.trim(),
          when((s) => s.length === 0, () => 'Anonymous'),
          (s) => s.toUpperCase()
        )

        expect(result).toBe('ANONYMOUS')
      })
    })

    describe('data-first', () => {
      it('returns transformed value when condition met', () => {
        const result = when((s: string) => s.startsWith('_'), (s) => s.slice(1), '_private')

        expect(result).toBe('private')
      })

      it('returns original when condition not met', () => {
        const result = when((n: number) => n > 100, (n) => 100, 50)

        expect(result).toBe(50)
      })
    })
  })

  describe('unless', () => {
    describe('data-last', () => {
      it('applies function when predicate fails', () => {
        const ensureArray = unless(Array.isArray, (value) => [value])

        expect(ensureArray([1, 2, 3])).toEqual([1, 2, 3])
        expect(ensureArray(5)).toEqual([5])
        expect(ensureArray('hello')).toEqual(['hello'])
      })

      it('returns original when predicate passes', () => {
        const addProtocol = unless(
          (s: string) => s.startsWith('http'),
          (s) => `https://${s}`
        )

        expect(addProtocol('example.com')).toBe('https://example.com')
        expect(addProtocol('http://example.com')).toBe('http://example.com')
        expect(addProtocol('https://example.com')).toBe('https://example.com')
      })

      it('works in pipe', () => {
        const result = R.pipe(
          { name: 'Alice' },
          unless((config) => 'apiKey' in config, (config) => ({ ...config, apiKey: 'default' }))
        )

        expect(result).toEqual({ name: 'Alice', apiKey: 'default' })
      })
    })

    describe('data-first', () => {
      it('transforms when condition not met', () => {
        const result = unless((n: number) => n > 0, (n) => -n, -5)

        expect(result).toBe(5)
      })

      it('returns original when condition met', () => {
        const result = unless((n: number) => n > 0, (n) => -n, 5)

        expect(result).toBe(5)
      })
    })
  })

  describe('cond', () => {
    describe('data-last', () => {
      it('applies first matching predicate', () => {
        const classifyNumber = cond<number, string>([
          [(n) => n < 0, (n) => 'negative'],
          [(n) => n === 0, () => 'zero'],
          [(n) => n > 0 && n < 10, (n) => 'small positive'],
          [(n) => n >= 10, (n) => 'large positive'],
        ])

        expect(classifyNumber(-5)).toEqual(some('negative'))
        expect(classifyNumber(0)).toEqual(some('zero'))
        expect(classifyNumber(3)).toEqual(some('small positive'))
        expect(classifyNumber(100)).toEqual(some('large positive'))
      })

      it('returns None when no predicate matches', () => {
        const onlyPositive = cond<number, string>([[(n) => n > 0, () => 'positive']])

        expect(onlyPositive(-5)).toEqual(none)
        expect(onlyPositive(0)).toEqual(none)
      })

      it('works in pipe', () => {
        const handleStatus = cond<number, string>([
          [(s) => s >= 200 && s < 300, () => 'success'],
          [(s) => s >= 300 && s < 400, () => 'redirect'],
          [(s) => s >= 400 && s < 500, () => 'client error'],
          [(s) => s >= 500, () => 'server error'],
        ])

        const result = R.pipe(404, handleStatus)

        expect(result).toEqual(some('client error'))
      })

      it('stops at first match', () => {
        let callCount = 0
        const countingCond = cond<number, string>([
          [
            (n) => {
              callCount++
              return n > 0
            },
            () => 'positive',
          ],
          [
            (n) => {
              callCount++
              return n > 10
            },
            () => 'large',
          ],
        ])

        const result = countingCond(15)
        expect(result).toEqual(some('positive'))
        expect(callCount).toBe(1) // Only first predicate called
      })
    })

    describe('data-first', () => {
      it('returns Some with result when matched', () => {
        const result = cond<string, number>(
          [
            [(s) => s === 'low', () => 1],
            [(s) => s === 'medium', () => 5],
            [(s) => s === 'high', () => 10],
          ],
          'medium'
        )

        expect(result).toEqual(some(5))
      })

      it('returns None when not matched', () => {
        const result = cond<string, number>(
          [
            [(s) => s === 'low', () => 1],
            [(s) => s === 'high', () => 10],
          ],
          'medium'
        )

        expect(result).toEqual(none)
      })
    })

    describe('empty pairs', () => {
      it('returns None for empty pairs array', () => {
        const noOp = cond<number, string>([])

        expect(noOp(42)).toEqual(none)
      })
    })
  })
})

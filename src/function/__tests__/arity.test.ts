import { describe, it, expect, vi } from 'vitest'
import * as R from 'remeda'
import { unary, binary, nAry } from '../index'

describe('function/arity', () => {
  describe('unary', () => {
    it('limits function to one argument', () => {
      const fn = vi.fn((a: number, b?: number, c?: number) => a + (b ?? 0) + (c ?? 0))
      const unaryFn = unary(fn)

      expect(unaryFn(1, 2, 3)).toBe(1)
      expect(fn).toHaveBeenCalledWith(1)
    })

    it('fixes parseInt with map', () => {
      // Without unary, parseInt gets index as second argument (radix)
      const withoutUnary = ['1', '2', '3'].map(parseInt)
      const withUnary = ['1', '2', '3'].map(unary(parseInt))

      // parseInt('1', 0) = 1, parseInt('2', 1) = NaN, parseInt('3', 2) = NaN
      expect(withoutUnary).toEqual([1, NaN, NaN])

      // unary(parseInt) only passes the string
      expect(withUnary).toEqual([1, 2, 3])
    })

    it('works with console.log', () => {
      const logs: any[] = []
      const mockLog = (...args: any[]) => logs.push(args)
      const logFirst = unary(mockLog)

      ;['a', 'b', 'c'].forEach(logFirst)

      expect(logs).toEqual([['a'], ['b'], ['c']])
    })

    it('wraps Number constructor', () => {
      const parseNumber = unary(Number)
      const inputs = ['42', '3.14', '100']

      expect(inputs.map(parseNumber)).toEqual([42, 3.14, 100])
    })

    it('works in pipe', () => {
      const result = R.pipe(
        ['10', '20', '30'],
        R.map(unary(parseInt))
      )

      expect(result).toEqual([10, 20, 30])
    })
  })

  describe('binary', () => {
    it('limits function to two arguments', () => {
      const fn = vi.fn((...nums: number[]) => nums.reduce((a, b) => a + b, 0))
      const binaryFn = binary(fn)

      expect(binaryFn(1, 2, 3, 4)).toBe(3)
      expect(fn).toHaveBeenCalledWith(1, 2)
    })

    it('limits callback arguments', () => {
      const logs: any[] = []
      const mockLog = (...args: any[]) => logs.push(args)
      const logTwo = binary(mockLog)

      ;['a', 'b', 'c'].forEach(logTwo)

      expect(logs).toEqual([
        ['a', 0],
        ['b', 1],
        ['c', 2],
      ])
    })

    it('works with variadic functions', () => {
      const add = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

      expect(add(1, 2, 3, 4)).toBe(10)
      expect(binary(add)(1, 2, 3, 4)).toBe(3)
    })

    it('preserves type safety', () => {
      const concat = (a: string, b: string, c?: string) => [a, b, c].filter(Boolean).join('')
      const binaryConcat = binary(concat)

      expect(concat('a', 'b', 'c')).toBe('abc')
      expect(binaryConcat('a', 'b', 'c')).toBe('ab')
    })
  })

  describe('nAry', () => {
    it('limits function to N arguments', () => {
      const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)

      const sumTwo = nAry(2, sum)
      const sumThree = nAry(3, sum)

      expect(sumTwo(1, 2, 3, 4, 5)).toBe(3)
      expect(sumThree(1, 2, 3, 4, 5)).toBe(6)
    })

    it('works with zero arguments', () => {
      const fn = vi.fn((...args: any[]) => args.length)
      const noArgs = nAry(0, fn)

      expect(noArgs(1, 2, 3)).toBe(0)
      expect(fn).toHaveBeenCalledWith()
    })

    it('works with one argument (same as unary)', () => {
      const parseNumber = nAry(1, Number)

      expect(['1', '2', '3'].map(parseNumber)).toEqual([1, 2, 3])
    })

    it('controlling variadic functions', () => {
      const max = (...nums: number[]) => Math.max(...nums)

      const maxOfTwo = nAry(2, max)
      const maxOfThree = nAry(3, max)

      expect(maxOfTwo(5, 10, 2, 8)).toBe(10)
      expect(maxOfThree(5, 10, 2, 8)).toBe(10)
      expect(nAry(4, max)(5, 10, 2, 8)).toBe(10)
    })

    it('creating specialized log functions', () => {
      const logs: any[][] = []
      const log = (...args: any[]) => logs.push(args)

      const logOne = nAry(1, log)
      const logThree = nAry(3, log)

      logOne('a', 'b', 'c', 'd')
      logThree('a', 'b', 'c', 'd')

      expect(logs).toEqual([['a'], ['a', 'b', 'c']])
    })

    it('works in functional chains', () => {
      const concat = (...strs: string[]) => strs.join('')
      const concatTwo = nAry(2, concat)

      const result = R.pipe(
        [
          ['a', 'b', 'c'],
          ['x', 'y', 'z'],
        ],
        R.map((arr) => concatTwo(...arr))
      )

      expect(result).toEqual(['ab', 'xy'])
    })

    it('handles large arity', () => {
      const fn = (...args: number[]) => args.reduce((a, b) => a + b, 0)
      const sum10 = nAry(10, fn)

      expect(sum10(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)).toBe(55) // sum of 1-10
    })

    it('identity when N >= actual arguments', () => {
      const fn = (a: number, b: number, c: number) => a + b + c
      const limitedFn = nAry(5, fn)

      expect(limitedFn(1, 2, 3)).toBe(6)
    })
  })
})

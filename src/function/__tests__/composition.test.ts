import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { compose, converge, juxt, ap } from '../index'

describe('function/composition', () => {
  describe('compose', () => {
    it('composes two functions right-to-left', () => {
      const addOne = (n: number) => n + 1
      const double = (n: number) => n * 2

      const f = compose(double, addOne)

      expect(f(2)).toBe(6) // double(addOne(2)) = double(3) = 6
      expect(f(5)).toBe(12) // double(addOne(5)) = double(6) = 12
    })

    it('composes three functions right-to-left', () => {
      const addOne = (n: number) => n + 1
      const double = (n: number) => n * 2
      const square = (n: number) => n * n

      const f = compose(square, double, addOne)

      expect(f(2)).toBe(36) // square(double(addOne(2))) = square(double(3)) = square(6) = 36
      expect(f(3)).toBe(64) // square(double(addOne(3))) = square(double(4)) = square(8) = 64
    })

    it('composes string transformations', () => {
      const exclaim = (s: string) => `${s}!`
      const toUpper = (s: string) => s.toUpperCase()
      const trim = (s: string) => s.trim()

      const shout = compose(exclaim, toUpper, trim)

      expect(shout('  hello  ')).toBe('HELLO!')
      expect(shout(' world ')).toBe('WORLD!')
    })

    it('single function returns itself', () => {
      const double = (n: number) => n * 2
      const f = compose(double)

      expect(f(5)).toBe(10)
    })

    it('handles type transformations', () => {
      const length = (s: string) => s.length
      const isEven = (n: number) => n % 2 === 0
      const toString = (b: boolean) => String(b)

      const f = compose(toString, isEven, length)

      expect(f('hello')).toBe('false') // toString(isEven(length('hello')))
      expect(f('test')).toBe('true')
    })
  })

  describe('converge', () => {
    it('calculates average using converge', () => {
      const average = converge(
        (sum: number, length: number) => sum / length,
        [
          (nums: number[]) => nums.reduce((a, b) => a + b, 0),
          (nums: number[]) => nums.length,
        ]
      )

      expect(average([1, 2, 3, 4, 5])).toBe(3)
      expect(average([10, 20, 30])).toBe(20)
    })

    it('builds object from multiple transformations', () => {
      interface User {
        name: string
        email: string
      }
      interface Profile {
        displayName: string
        username: string
        domain: string
      }

      const buildProfile = converge(
        (name: string, username: string, domain: string): Profile => ({
          displayName: name,
          username,
          domain,
        }),
        [
          (user: User) => user.name,
          (user: User) => user.email.split('@')[0]!,
          (user: User) => user.email.split('@')[1]!,
        ]
      )

      const result = buildProfile({ name: 'Alice', email: 'alice@example.com' })

      expect(result).toEqual({
        displayName: 'Alice',
        username: 'alice',
        domain: 'example.com',
      })
    })

    it('data-first signature', () => {
      const result = converge(
        (min: number, max: number) => max - min,
        [
          (nums: number[]) => Math.min(...nums),
          (nums: number[]) => Math.max(...nums),
        ],
        [1, 5, 3, 9, 2]
      )

      expect(result).toBe(8) // 9 - 1
    })

    it('works in pipe', () => {
      const result = R.pipe(
        [1, 2, 3, 4, 5],
        converge(
          (sum: number, count: number, max: number) => ({
            sum,
            count,
            max,
            average: sum / count,
          }),
          [
            (nums) => nums.reduce((a, b) => a + b, 0),
            (nums) => nums.length,
            (nums) => Math.max(...nums),
          ]
        )
      )

      expect(result).toEqual({
        sum: 15,
        count: 5,
        max: 5,
        average: 3,
      })
    })
  })

  describe('juxt', () => {
    it('applies multiple functions to same input', () => {
      const analyze = juxt([
        (nums: number[]) => nums.length,
        (nums: number[]) => Math.min(...nums),
        (nums: number[]) => Math.max(...nums),
        (nums: number[]) => nums.reduce((a, b) => a + b, 0) / nums.length,
      ])

      expect(analyze([1, 2, 3, 4, 5])).toEqual([5, 1, 5, 3])
    })

    it('extracts multiple fields from object', () => {
      interface User {
        id: string
        name: string
        email: string
        role: string
      }

      const getUserSummary = juxt([
        (user: User) => user.id,
        (user: User) => user.name,
        (user: User) => user.role,
      ])

      const result = getUserSummary({
        id: '1',
        name: 'Alice',
        email: 'alice@example.com',
        role: 'admin',
      })

      expect(result).toEqual(['1', 'Alice', 'admin'])
    })

    it('data-first signature', () => {
      const result = juxt(
        [
          (s: string) => s.toUpperCase(),
          (s: string) => s.toLowerCase(),
          (s: string) => s.length,
        ],
        'Hello'
      )

      expect(result).toEqual(['HELLO', 'hello', 5])
    })

    it('works in pipe', () => {
      const result = R.pipe(
        'test input',
        juxt([
          (input: string) => input.trim(),
          (input: string) => input.length,
          (input: string) => input.split(' ').length,
        ])
      )

      expect(result).toEqual(['test input', 10, 2])
    })

    it('handles empty function array', () => {
      const noOp = juxt([])

      expect(noOp('anything')).toEqual([])
    })

    it('preserves function return types', () => {
      const mixed = juxt([
        (n: number) => n.toString(),
        (n: number) => n * 2,
        (n: number) => n > 0,
      ])

      const result = mixed(5)

      expect(result).toEqual(['5', 10, true])
      expect(typeof result[0]).toBe('string')
      expect(typeof result[1]).toBe('number')
      expect(typeof result[2]).toBe('boolean')
    })
  })

  describe('ap', () => {
    it('applies array of functions to array of values', () => {
      const fns = [
        (n: number) => n + 1,
        (n: number) => n * 2,
        (n: number) => n * n,
      ]

      const result = ap(fns, [1, 2, 3])

      expect(result).toEqual([
        2,
        3,
        4, // +1 to each
        2,
        4,
        6, // *2 to each
        1,
        4,
        9, // square each
      ])
    })

    it('applies validators to multiple inputs', () => {
      const validators = [
        (s: string) => s.length > 0,
        (s: string) => s.length < 100,
        (s: string) => /^[a-z]+$/i.test(s),
      ]

      const result = ap(validators, ['hello', '', 'test123'])

      expect(result).toEqual([
        true,
        false,
        true, // length > 0
        true,
        true,
        true, // length < 100
        true,
        false,
        false, // only letters
      ])
    })

    it('data-first signature', () => {
      const fns = [(n: number) => n + 10, (n: number) => n * 10]
      const result = ap(fns, [1, 2, 3])

      expect(result).toEqual([11, 12, 13, 10, 20, 30])
    })

    it('works in pipe', () => {
      const result = R.pipe(
        [1, 2],
        ap([
          (n: number) => n + 1,
          (n: number) => n * 2,
        ])
      )

      expect(result).toEqual([2, 3, 2, 4])
    })

    it('handles empty functions array', () => {
      expect(ap([], [1, 2, 3])).toEqual([])
    })

    it('handles empty values array', () => {
      const fns = [(n: number) => n + 1, (n: number) => n * 2]

      expect(ap(fns, [])).toEqual([])
    })

    it('handles both empty', () => {
      expect(ap([], [])).toEqual([])
    })
  })
})

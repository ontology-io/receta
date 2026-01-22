import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { flip, partial, partialRight } from '../index'

describe('function/utilities', () => {
  describe('flip', () => {
    it('reverses argument order for two arguments', () => {
      const divide = (a: number, b: number) => a / b
      const divideBy = flip(divide)

      expect(divide(10, 2)).toBe(5)
      expect(divideBy(2, 10)).toBe(5) // same as divide(10, 2)
    })

    it('useful for partial application', () => {
      const subtract = (a: number, b: number) => a - b
      const subtractFrom = flip(subtract)

      const subtractFrom10 = (n: number) => subtractFrom(n, 10)

      expect(subtractFrom10(3)).toBe(7) // 10 - 3
      expect(subtractFrom10(8)).toBe(2) // 10 - 8
    })

    it('handles string concatenation', () => {
      const concat = (a: string, b: string) => a + b
      const append = flip(concat)

      expect(concat('hello', ' world')).toBe('hello world')
      expect(append(' world', 'hello')).toBe('hello world')
    })

    it('preserves additional arguments', () => {
      const fn = (a: number, b: number, c: number) => `${a}-${b}-${c}`
      const flipped = flip(fn)

      expect(fn(1, 2, 3)).toBe('1-2-3')
      expect(flipped(2, 1, 3)).toBe('1-2-3')
    })

    it('works in pipe', () => {
      const divide = (a: number, b: number) => a / b

      const result = R.pipe(
        2,
        (divisor) => flip(divide)(divisor, 10)
      )

      expect(result).toBe(5) // 10 / 2
    })
  })

  describe('partial', () => {
    it('partially applies single argument', () => {
      const greet = (greeting: string, name: string) => `${greeting}, ${name}!`
      const sayHello = partial(greet, 'Hello')

      expect(sayHello('Alice')).toBe('Hello, Alice!')
      expect(sayHello('Bob')).toBe('Hello, Bob!')
    })

    it('partially applies multiple arguments', () => {
      const multiply = (a: number, b: number, c: number) => a * b * c

      const double = partial(multiply, 2)
      expect(double(3, 4)).toBe(24) // 2 * 3 * 4

      const quadruple = partial(multiply, 2, 2)
      expect(quadruple(5)).toBe(20) // 2 * 2 * 5
    })

    it('creates specialized logging functions', () => {
      const log = (level: string, module: string, message: string) =>
        `[${level}] ${module}: ${message}`

      const logError = partial(log, 'ERROR')
      const logUserError = partial(log, 'ERROR', 'UserModule')

      expect(logError('Auth', 'Invalid token')).toBe('[ERROR] Auth: Invalid token')
      expect(logUserError('Invalid input')).toBe('[ERROR] UserModule: Invalid input')
    })

    it('works with variadic functions', () => {
      const sum = (...nums: number[]) => nums.reduce((a, b) => a + b, 0)
      const add10 = partial(sum, 10)

      expect(add10(5, 5)).toBe(20) // 10 + 5 + 5
      expect(add10(1, 2, 3, 4)).toBe(20) // 10 + 1 + 2 + 3 + 4
    })

    it('works in functional chains', () => {
      const format = (prefix: string, value: string) => `${prefix}: ${value}`
      const addLabel = partial(format, 'Label')

      const result = R.pipe(['a', 'b', 'c'], R.map(addLabel))

      expect(result).toEqual(['Label: a', 'Label: b', 'Label: c'])
    })
  })

  describe('partialRight', () => {
    it('partially applies from the right', () => {
      const divide = (a: number, b: number) => a / b
      const divideBy10 = partialRight(divide, 10)

      expect(divideBy10(100)).toBe(10) // 100 / 10
      expect(divideBy10(50)).toBe(5) // 50 / 10
    })

    it('handles multiple arguments', () => {
      const format = (message: string, level: string, timestamp: string) =>
        `${timestamp} [${level}] ${message}`

      const logInfo = partialRight(format, 'INFO', '2026-01-22')

      expect(logInfo('App started')).toBe('2026-01-22 [INFO] App started')
      expect(logInfo('Request received')).toBe('2026-01-22 [INFO] Request received')
    })

    it('useful when data comes last', () => {
      const buildUrl = (path: string, host: string, protocol: string) =>
        `${protocol}://${host}${path}`

      const httpsUrl = partialRight(buildUrl, 'example.com', 'https')

      expect(httpsUrl('/api/users')).toBe('https://example.com/api/users')
      expect(httpsUrl('/api/posts')).toBe('https://example.com/api/posts')
    })

    it('works with array operations', () => {
      const join = (items: string[], separator: string) => items.join(separator)
      const joinWithComma = partialRight(join, ', ')

      expect(joinWithComma(['a', 'b', 'c'])).toBe('a, b, c')
      expect(joinWithComma(['x', 'y'])).toBe('x, y')
    })

    it('combines with partial', () => {
      const log = (level: string, module: string, message: string, timestamp: string) =>
        `${timestamp} [${level}] ${module}: ${message}`

      const errorLog = partial(log, 'ERROR')
      const errorLogNow = partialRight(errorLog, new Date().toISOString())

      const result = errorLogNow('UserModule', 'Failed to authenticate')

      expect(result).toContain('[ERROR] UserModule: Failed to authenticate')
    })
  })
})

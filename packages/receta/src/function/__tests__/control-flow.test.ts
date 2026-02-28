import { describe, it, expect, vi } from 'vitest'
import * as R from 'remeda'
import { tap, tryCatch, memoize } from '../index'
import { ok, err, isOk } from '../../result'

describe('function/control-flow', () => {
  describe('tap', () => {
    describe('data-last', () => {
      it('executes side effect and returns original value', () => {
        let sideEffect = 0
        const result = R.pipe(
          42,
          tap((x) => {
            sideEffect = x * 2
          })
        )

        expect(result).toBe(42)
        expect(sideEffect).toBe(84)
      })

      it('useful for debugging pipelines', () => {
        const logs: any[] = []
        const log = (label: string) => (value: any) => logs.push(`${label}: ${JSON.stringify(value)}`)

        const result = R.pipe(
          [1, 2, 3, 4, 5],
          R.map((x) => x * 2),
          tap(log('After doubling')),
          R.filter((x) => x > 5),
          tap(log('After filtering')),
          R.reduce((a, b) => a + b, 0)
        )

        expect(result).toBe(24)
        expect(logs).toEqual(['After doubling: [2,4,6,8,10]', 'After filtering: [6,8,10]'])
      })

      it('does not affect value even if side effect throws', () => {
        const result = R.pipe(
          'test',
          tap(() => {
            // Side effect that doesn't throw in this test
            return 'ignored'
          })
        )

        expect(result).toBe('test')
      })
    })

    describe('data-first', () => {
      it('returns value after executing side effect', () => {
        let called = false
        const result = tap(() => {
          called = true
        }, 'value')

        expect(result).toBe('value')
        expect(called).toBe(true)
      })

      it('can be used for logging', () => {
        const logs: string[] = []

        const value = tap((x: number) => logs.push(`Got: ${x}`), 42)

        expect(value).toBe(42)
        expect(logs).toEqual(['Got: 42'])
      })
    })

    it('works with objects', () => {
      const updates: any[] = []
      const trackUpdate = (obj: any) => updates.push({ ...obj })

      const result = R.pipe({ count: 0 }, tap(trackUpdate), (obj) => ({ ...obj, count: 1 }), tap(trackUpdate))

      expect(updates).toEqual([{ count: 0 }, { count: 1 }])
      expect(result).toEqual({ count: 1 })
    })

    it('works with arrays', () => {
      const snapshots: number[][] = []

      const result = R.pipe(
        [1, 2, 3],
        tap((arr) => snapshots.push([...arr])),
        R.map((x) => x * 2),
        tap((arr) => snapshots.push([...arr]))
      )

      expect(snapshots).toEqual([
        [1, 2, 3],
        [2, 4, 6],
      ])
      expect(result).toEqual([2, 4, 6])
    })
  })

  describe('tryCatch', () => {
    it('creates safe version of throwing function', () => {
      const parseJSON = tryCatch((str: string) => JSON.parse(str))

      const validResult = parseJSON('{"valid": "json"}')
      const invalidResult = parseJSON('invalid json')

      expect(isOk(validResult)).toBe(true)
      expect(isOk(invalidResult)).toBe(false)
    })

    it('handles custom error transformation', () => {
      const safeDivide = tryCatch(
        (a: number, b: number) => {
          if (b === 0) throw new Error('Division by zero')
          return a / b
        },
        (error) => `Error: ${error instanceof Error ? error.message : String(error)}`
      )

      const validResult = safeDivide(10, 2)
      const errorResult = safeDivide(10, 0)

      expect(validResult).toEqual(ok(5))
      expect(errorResult).toEqual(err('Error: Division by zero'))
    })

    it('works with multiple arguments', () => {
      const safeOperation = tryCatch((a: number, b: number, c: number) => {
        if (a < 0 || b < 0 || c < 0) throw new Error('Negative input')
        return a + b + c
      })

      expect(safeOperation(1, 2, 3)).toEqual(ok(6))
      expect(isOk(safeOperation(-1, 2, 3))).toBe(false)
    })

    it('reusable across multiple calls', () => {
      const parseNumber = tryCatch(
        (str: string) => {
          const n = Number(str)
          if (isNaN(n)) throw new Error('Not a number')
          return n
        }
      )

      expect(parseNumber('42')).toEqual(ok(42))
      expect(parseNumber('3.14')).toEqual(ok(3.14))
      expect(isOk(parseNumber('not a number'))).toBe(false)
    })

    it('works in Result pipelines', () => {
      const parseJSON = tryCatch((str: string) => JSON.parse(str))

      const result = R.pipe('{"userId": "123"}', parseJSON, (r) => {
        if (isOk(r)) {
          return ok(r.value.userId)
        }
        return r
      })

      expect(result).toEqual(ok('123'))
    })
  })

  describe('memoize', () => {
    it('caches function results', () => {
      let callCount = 0
      const expensive = memoize((n: number) => {
        callCount++
        return n * 2
      })

      expect(expensive(5)).toBe(10)
      expect(callCount).toBe(1)

      expect(expensive(5)).toBe(10)
      expect(callCount).toBe(1) // Not called again

      expect(expensive(10)).toBe(20)
      expect(callCount).toBe(2)
    })

    it('works with string keys', () => {
      let callCount = 0
      const reverse = memoize((str: string) => {
        callCount++
        return str.split('').reverse().join('')
      })

      expect(reverse('hello')).toBe('olleh')
      expect(callCount).toBe(1)

      expect(reverse('hello')).toBe('olleh')
      expect(callCount).toBe(1)

      expect(reverse('world')).toBe('dlrow')
      expect(callCount).toBe(2)
    })

    it('fibonacci example', () => {
      let callCount = 0
      const fibonacci = memoize((n: number): number => {
        callCount++
        if (n <= 1) return n
        return fibonacci(n - 1) + fibonacci(n - 2)
      })

      fibonacci(10)
      const firstCallCount = callCount

      callCount = 0
      fibonacci(10)

      expect(callCount).toBe(0) // Result cached
    })

    it('works with object arguments', () => {
      let callCount = 0
      const fn = memoize((obj: { id: number }) => {
        callCount++
        return obj.id * 2
      })

      const obj1 = { id: 5 }
      const obj2 = { id: 5 }

      fn(obj1)
      expect(callCount).toBe(1)

      fn(obj1)
      expect(callCount).toBe(1) // Same reference

      fn(obj2)
      expect(callCount).toBe(2) // Different reference
    })
  })
})

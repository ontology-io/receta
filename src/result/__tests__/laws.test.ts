import { describe, it, expect } from 'bun:test'
import { ok, err } from '../constructors'
import { map } from '../map'
import { flatMap } from '../flatMap'
import type { Result } from '../types'

/**
 * Property-based tests verifying Result satisfies functor and monad laws.
 *
 * These laws ensure that Result behaves predictably and composably:
 * - Functor laws: map preserves structure
 * - Monad laws: flatMap chains correctly
 */
describe('Result Laws', () => {
  describe('Functor Laws', () => {
    /**
     * Functor Identity Law:
     * Mapping with identity function should return the same Result.
     *
     * map(result, x => x) === result
     */
    it('satisfies identity law', () => {
      const identity = <T>(x: T) => x

      // Test with Ok
      const okResult = ok(42)
      expect(map(okResult, identity)).toEqual(okResult)

      // Test with Err
      const errResult = err('fail')
      expect(map(errResult, identity)).toEqual(errResult)

      // Test with different types
      expect(map(ok('hello'), identity)).toEqual(ok('hello'))
      expect(map(ok({ x: 1 }), identity)).toEqual(ok({ x: 1 }))
      expect(map(ok(null), identity)).toEqual(ok(null))
    })

    /**
     * Functor Composition Law:
     * Mapping with composed functions should equal composing maps.
     *
     * map(map(result, f), g) === map(result, x => g(f(x)))
     */
    it('satisfies composition law', () => {
      const f = (x: number) => x + 1
      const g = (x: number) => x * 2

      // Test with Ok
      const okResult = ok(5)
      const composed = (x: number) => g(f(x))

      expect(map(map(okResult, f), g)).toEqual(map(okResult, composed))

      // Test with Err
      const errResult = err<number, string>('fail')
      expect(map(map(errResult, f), g)).toEqual(map(errResult, composed))

      // Test with different transformations
      const toLowerCase = (s: string) => s.toLowerCase()
      const getLength = (s: string) => s.length

      const strResult = ok('HELLO')
      const strComposed = (s: string) => getLength(toLowerCase(s))

      expect(map(map(strResult, toLowerCase), getLength)).toEqual(
        map(strResult, strComposed)
      )
    })
  })

  describe('Monad Laws', () => {
    /**
     * Monad Left Identity Law:
     * Wrapping a value and flat-mapping is the same as applying the function.
     *
     * flatMap(ok(a), f) === f(a)
     */
    it('satisfies left identity law', () => {
      const f = (x: number): Result<number, string> =>
        x > 0 ? ok(x * 2) : err('negative')

      const value = 5
      expect(flatMap(ok(value), f)).toEqual(f(value))

      // Test with different values
      expect(flatMap(ok(10), f)).toEqual(f(10))
      expect(flatMap(ok(0), f)).toEqual(f(0))
      expect(flatMap(ok(-1), f)).toEqual(f(-1))
    })

    /**
     * Monad Right Identity Law:
     * Flat-mapping with ok should return the same Result.
     *
     * flatMap(result, ok) === result
     */
    it('satisfies right identity law', () => {
      // Test with Ok
      const okResult = ok(42)
      expect(flatMap(okResult, ok)).toEqual(okResult)

      // Test with Err
      const errResult = err('fail')
      expect(flatMap(errResult, ok)).toEqual(errResult)

      // Test with different types
      expect(flatMap(ok('hello'), ok)).toEqual(ok('hello'))
      expect(flatMap(ok([1, 2, 3]), ok)).toEqual(ok([1, 2, 3]))
    })

    /**
     * Monad Associativity Law:
     * Chaining flat-maps should be associative.
     *
     * flatMap(flatMap(result, f), g) === flatMap(result, x => flatMap(f(x), g))
     */
    it('satisfies associativity law', () => {
      const f = (x: number): Result<number, string> =>
        x > 0 ? ok(x + 1) : err('not positive')

      const g = (x: number): Result<number, string> =>
        x < 100 ? ok(x * 2) : err('too large')

      // Test with Ok that succeeds all the way
      const okResult = ok(5)
      const leftAssoc = flatMap(flatMap(okResult, f), g)
      const rightAssoc = flatMap(okResult, x => flatMap(f(x), g))
      expect(leftAssoc).toEqual(rightAssoc)

      // Test with Ok that fails in f
      const okFail = ok(-1)
      expect(flatMap(flatMap(okFail, f), g)).toEqual(
        flatMap(okFail, x => flatMap(f(x), g))
      )

      // Test with Ok that fails in g
      const okFailG = ok(99)
      expect(flatMap(flatMap(okFailG, f), g)).toEqual(
        flatMap(okFailG, x => flatMap(f(x), g))
      )

      // Test with Err
      const errResult = err<number, string>('initial error')
      expect(flatMap(flatMap(errResult, f), g)).toEqual(
        flatMap(errResult, x => flatMap(f(x), g))
      )
    })
  })

  describe('Interaction Laws', () => {
    /**
     * Map in terms of flatMap:
     * map can be defined using flatMap and ok.
     *
     * map(result, f) === flatMap(result, x => ok(f(x)))
     */
    it('map can be expressed with flatMap', () => {
      const f = (x: number) => x * 2

      // Test with Ok
      const okResult = ok(5)
      expect(map(okResult, f)).toEqual(flatMap(okResult, x => ok(f(x))))

      // Test with Err
      const errResult = err<number, string>('fail')
      expect(map(errResult, f)).toEqual(flatMap(errResult, x => ok(f(x))))
    })

    /**
     * Error preservation:
     * Once a Result is Err, it stays Err through all operations.
     */
    it('preserves errors through operations', () => {
      const initial = err<number, string>('initial error')

      const result = flatMap(
        flatMap(
          map(initial, x => x + 1),
          x => ok(x * 2)
        ),
        x => ok(x.toString())
      )

      expect(result).toEqual(err('initial error'))
    })

    /**
     * Success chaining:
     * Ok values flow through successful operations.
     */
    it('chains successful operations', () => {
      const result = flatMap(
        flatMap(
          map(ok(5), x => x + 1), // 6
          x => ok(x * 2)           // 12
        ),
        x => ok(x.toString())      // "12"
      )

      expect(result).toEqual(ok('12'))
    })
  })

  describe('Edge Cases', () => {
    it('handles complex nested operations', () => {
      const parseNumber = (s: string): Result<number, string> => {
        const n = Number(s)
        return Number.isNaN(n) ? err('Invalid number') : ok(n)
      }

      const divide = (a: number, b: number): Result<number, string> =>
        b === 0 ? err('Division by zero') : ok(a / b)

      // Success case
      const success = flatMap(parseNumber('10'), n =>
        flatMap(parseNumber('2'), m =>
          divide(n, m)
        )
      )
      expect(success).toEqual(ok(5))

      // First parse fails
      const fail1 = flatMap(parseNumber('abc'), n =>
        flatMap(parseNumber('2'), m =>
          divide(n, m)
        )
      )
      expect(fail1).toEqual(err('Invalid number'))

      // Division fails
      const fail2 = flatMap(parseNumber('10'), n =>
        flatMap(parseNumber('0'), m =>
          divide(n, m)
        )
      )
      expect(fail2).toEqual(err('Division by zero'))
    })

    it('maintains referential transparency', () => {
      const f = (x: number) => ok(x * 2)
      const input = ok(5)

      // Calling f multiple times with same input gives same result
      expect(flatMap(input, f)).toEqual(flatMap(input, f))

      // Intermediate results can be assigned
      const intermediate = flatMap(input, f)
      const final1 = map(intermediate, x => x + 1)
      const final2 = map(intermediate, x => x + 1)

      expect(final1).toEqual(final2)
    })
  })
})

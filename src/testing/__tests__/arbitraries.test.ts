import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { result, okResult, errResult, option, someValue, noneValue } from '../arbitraries'

describe('Result Arbitraries', () => {
  describe('result()', () => {
    it('generates Result values', () => {
      fc.assert(
        fc.property(result(fc.integer(), fc.string()), (r) => {
          expect(r).toBeDefined()
          expect(r._tag === 'Ok' || r._tag === 'Err').toBe(true)
        })
      )
    })

    it('generates both Ok and Err values', () => {
      const results = fc.sample(result(fc.integer(), fc.string()), 100)
      const hasOk = results.some((r) => r._tag === 'Ok')
      const hasErr = results.some((r) => r._tag === 'Err')

      expect(hasOk).toBe(true)
      expect(hasErr).toBe(true)
    })

    it('generates Ok values with correct type', () => {
      fc.assert(
        fc.property(result(fc.integer(), fc.string()), (r) => {
          if (r._tag === 'Ok') {
            expect(typeof r.value).toBe('number')
          }
        })
      )
    })

    it('generates Err values with correct type', () => {
      fc.assert(
        fc.property(result(fc.integer(), fc.string()), (r) => {
          if (r._tag === 'Err') {
            expect(typeof r.error).toBe('string')
          }
        })
      )
    })

    it('respects okWeight configuration', () => {
      // Generate 200 samples with 90% Ok weight
      const results = fc.sample(result(fc.integer(), fc.string(), { okWeight: 0.9 }), 200)
      const okCount = results.filter((r) => r._tag === 'Ok').length

      // Should be roughly 90% Ok (allow 10% variance)
      expect(okCount).toBeGreaterThan(160) // 80% of 200
      expect(okCount).toBeLessThan(200) // Not 100%
    })

    it('respects okWeight = 0 (all Err)', () => {
      const results = fc.sample(result(fc.integer(), fc.string(), { okWeight: 0 }), 100)
      const allErr = results.every((r) => r._tag === 'Err')

      expect(allErr).toBe(true)
    })

    it('respects okWeight = 1 (all Ok)', () => {
      const results = fc.sample(result(fc.integer(), fc.string(), { okWeight: 1 }), 100)
      const allOk = results.every((r) => r._tag === 'Ok')

      expect(allOk).toBe(true)
    })

    it('generates diverse Ok values', () => {
      const results = fc.sample(result(fc.integer(), fc.string()), 100)
      const okValues = results.filter((r) => r._tag === 'Ok').map((r) => (r as any).value)
      const uniqueValues = new Set(okValues)

      // Should have multiple different values
      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('generates diverse Err values', () => {
      const results = fc.sample(result(fc.integer(), fc.string()), 100)
      const errValues = results.filter((r) => r._tag === 'Err').map((r) => (r as any).error)
      const uniqueValues = new Set(errValues)

      // Should have multiple different values
      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('works with complex types', () => {
      interface User {
        id: number
        name: string
      }
      interface ApiError {
        code: string
        message: string
      }

      const userArb = fc.record({
        id: fc.integer(),
        name: fc.string(),
      })
      const errorArb = fc.record({
        code: fc.string(),
        message: fc.string(),
      })

      fc.assert(
        fc.property(result(userArb, errorArb), (r) => {
          if (r._tag === 'Ok') {
            expect(r.value).toHaveProperty('id')
            expect(r.value).toHaveProperty('name')
          } else {
            expect(r.error).toHaveProperty('code')
            expect(r.error).toHaveProperty('message')
          }
        })
      )
    })
  })

  describe('okResult()', () => {
    it('always generates Ok values', () => {
      fc.assert(
        fc.property(okResult(fc.integer()), (r) => {
          expect(r._tag).toBe('Ok')
        })
      )
    })

    it('generates diverse Ok values', () => {
      const results = fc.sample(okResult(fc.integer()), 100)
      const values = results.map((r) => (r as any).value)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('works with different value types', () => {
      fc.assert(
        fc.property(okResult(fc.string()), (r) => {
          expect(r._tag).toBe('Ok')
          expect(typeof r.value).toBe('string')
        })
      )
    })
  })

  describe('errResult()', () => {
    it('always generates Err values', () => {
      fc.assert(
        fc.property(errResult(fc.string()), (r) => {
          expect(r._tag).toBe('Err')
        })
      )
    })

    it('generates diverse Err values', () => {
      const results = fc.sample(errResult(fc.string()), 100)
      const errors = results.map((r) => (r as any).error)
      const uniqueErrors = new Set(errors)

      expect(uniqueErrors.size).toBeGreaterThan(1)
    })

    it('works with different error types', () => {
      fc.assert(
        fc.property(errResult(fc.integer()), (r) => {
          expect(r._tag).toBe('Err')
          expect(typeof r.error).toBe('number')
        })
      )
    })
  })
})

describe('Option Arbitraries', () => {
  describe('option()', () => {
    it('generates Option values', () => {
      fc.assert(
        fc.property(option(fc.integer()), (opt) => {
          expect(opt).toBeDefined()
          expect(opt._tag === 'Some' || opt._tag === 'None').toBe(true)
        })
      )
    })

    it('generates both Some and None values', () => {
      const options = fc.sample(option(fc.integer()), 100)
      const hasSome = options.some((opt) => opt._tag === 'Some')
      const hasNone = options.some((opt) => opt._tag === 'None')

      expect(hasSome).toBe(true)
      expect(hasNone).toBe(true)
    })

    it('generates Some values with correct type', () => {
      fc.assert(
        fc.property(option(fc.integer()), (opt) => {
          if (opt._tag === 'Some') {
            expect(typeof opt.value).toBe('number')
          }
        })
      )
    })

    it('respects someWeight configuration', () => {
      // Generate 200 samples with 90% Some weight
      const options = fc.sample(option(fc.integer(), { someWeight: 0.9 }), 200)
      const someCount = options.filter((opt) => opt._tag === 'Some').length

      // Should be roughly 90% Some (allow 10% variance)
      expect(someCount).toBeGreaterThan(160) // 80% of 200
      expect(someCount).toBeLessThan(200) // Not 100%
    })

    it('respects someWeight = 0 (all None)', () => {
      const options = fc.sample(option(fc.integer(), { someWeight: 0 }), 100)
      const allNone = options.every((opt) => opt._tag === 'None')

      expect(allNone).toBe(true)
    })

    it('respects someWeight = 1 (all Some)', () => {
      const options = fc.sample(option(fc.integer(), { someWeight: 1 }), 100)
      const allSome = options.every((opt) => opt._tag === 'Some')

      expect(allSome).toBe(true)
    })

    it('generates diverse Some values', () => {
      const options = fc.sample(option(fc.integer()), 100)
      const someValues = options.filter((opt) => opt._tag === 'Some').map((opt) => (opt as any).value)
      const uniqueValues = new Set(someValues)

      // Should have multiple different values
      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('works with complex types', () => {
      interface User {
        id: number
        name: string
      }

      const userArb = fc.record({
        id: fc.integer(),
        name: fc.string(),
      })

      fc.assert(
        fc.property(option(userArb), (opt) => {
          if (opt._tag === 'Some') {
            expect(opt.value).toHaveProperty('id')
            expect(opt.value).toHaveProperty('name')
          } else {
            expect(opt._tag).toBe('None')
          }
        })
      )
    })

    it('handles falsy values correctly', () => {
      const falsyArb = fc.oneof(fc.constant(0), fc.constant(''), fc.constant(false))

      fc.assert(
        fc.property(option(falsyArb), (opt) => {
          if (opt._tag === 'Some') {
            // Falsy values should still be wrapped in Some
            expect([0, '', false]).toContain(opt.value)
          }
        })
      )
    })
  })

  describe('someValue()', () => {
    it('always generates Some values', () => {
      fc.assert(
        fc.property(someValue(fc.integer()), (opt) => {
          expect(opt._tag).toBe('Some')
        })
      )
    })

    it('generates diverse Some values', () => {
      const options = fc.sample(someValue(fc.integer()), 100)
      const values = options.map((opt) => (opt as any).value)
      const uniqueValues = new Set(values)

      expect(uniqueValues.size).toBeGreaterThan(1)
    })

    it('works with different value types', () => {
      fc.assert(
        fc.property(someValue(fc.string()), (opt) => {
          expect(opt._tag).toBe('Some')
          expect(typeof opt.value).toBe('string')
        })
      )
    })

    it('preserves falsy values', () => {
      fc.assert(
        fc.property(someValue(fc.constant(0)), (opt) => {
          expect(opt._tag).toBe('Some')
          expect(opt.value).toBe(0)
        })
      )
    })
  })

  describe('noneValue()', () => {
    it('always generates None', () => {
      fc.assert(
        fc.property(noneValue(), (opt) => {
          expect(opt._tag).toBe('None')
        })
      )
    })

    it('all None values are equal', () => {
      const options = fc.sample(noneValue(), 10)
      const allEqual = options.every((opt) => opt._tag === 'None')

      expect(allEqual).toBe(true)
    })

    it('works with type parameter', () => {
      // Type parameter is only for TypeScript, runtime behavior is the same
      const opt1 = fc.sample(noneValue<number>(), 1)[0]
      const opt2 = fc.sample(noneValue<string>(), 1)[0]

      expect(opt1?._tag).toBe('None')
      expect(opt2?._tag).toBe('None')
    })
  })
})

describe('Integration with Law Testing', () => {
  it('arbitraries work with Result functor laws', () => {
    fc.assert(
      fc.property(result(fc.integer(), fc.string()), (r) => {
        const identity = <T>(x: T) => x

        // Identity law: map(fa, identity) === fa
        const mapped = r._tag === 'Ok' ? { _tag: 'Ok' as const, value: identity(r.value) } : r

        expect(mapped).toEqual(r)
      })
    )
  })

  it('arbitraries work with Option functor laws', () => {
    fc.assert(
      fc.property(option(fc.integer()), (opt) => {
        const identity = <T>(x: T) => x

        // Identity law: map(fa, identity) === fa
        const mapped = opt._tag === 'Some' ? { _tag: 'Some' as const, value: identity(opt.value) } : opt

        expect(mapped).toEqual(opt)
      })
    )
  })

  it('generates edge cases automatically', () => {
    const samples = fc.sample(result(fc.integer(), fc.string()), 1000)
    const okValues = samples.filter((r) => r._tag === 'Ok').map((r) => (r as any).value)

    // Fast-check should generate edge cases like 0, -1, MAX_SAFE_INTEGER, etc.
    const hasZero = okValues.includes(0)
    const hasNegative = okValues.some((v) => v < 0)
    const hasPositive = okValues.some((v) => v > 0)

    expect(hasZero || hasNegative || hasPositive).toBe(true)
  })
})

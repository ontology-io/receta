import { describe, it, expect, beforeAll } from 'bun:test'
import { some, none } from '../../option'
import { optionMatchers } from '../matchers/option'

// Extend expect with Option matchers
beforeAll(() => {
  expect.extend(optionMatchers)
})

describe('Option Matchers', () => {
  describe('toBeSome', () => {
    describe('without expected value', () => {
      it('passes for Some options', () => {
        expect(some(5)).toBeSome()
        expect(some('hello')).toBeSome()
        expect(some(null)).toBeSome()
        expect(some({ name: 'John' })).toBeSome()
        expect(some([])).toBeSome()
      })

      it('fails for None options', () => {
        expect(() => expect(none()).toBeSome()).toThrow()
      })

      it('passes with not for None options', () => {
        expect(none()).not.toBeSome()
      })

      it('fails with not for Some options', () => {
        expect(() => expect(some(5)).not.toBeSome()).toThrow()
      })

      it('fails for non-Option values', () => {
        expect(() => expect(5).toBeSome()).toThrow()
        expect(() => expect('hello').toBeSome()).toThrow()
        expect(() => expect(null).toBeSome()).toThrow()
        expect(() => expect({ value: 5 }).toBeSome()).toThrow()
      })
    })

    describe('with expected value', () => {
      it('passes when Some value matches', () => {
        expect(some(5)).toBeSome(5)
        expect(some('hello')).toBeSome('hello')
        expect(some(null)).toBeSome(null)
        expect(some({ name: 'John' })).toBeSome({ name: 'John' })
      })

      it('fails when Some value does not match', () => {
        expect(() => expect(some(5)).toBeSome(10)).toThrow()
        expect(() => expect(some('hello')).toBeSome('world')).toThrow()
        expect(() => expect(some({ name: 'John' })).toBeSome({ name: 'Jane' })).toThrow()
      })

      it('fails for None options', () => {
        expect(() => expect(none()).toBeSome(5)).toThrow()
      })

      it('passes with not when Some value does not match', () => {
        expect(some(5)).not.toBeSome(10)
        expect(some('hello')).not.toBeSome('world')
      })

      it('handles complex values', () => {
        const obj = { nested: { value: 42 } }
        expect(some(obj)).toBeSome({ nested: { value: 42 } })
        expect(some([1, 2, 3])).toBeSome([1, 2, 3])
      })
    })
  })

  describe('toBeNone', () => {
    it('passes for None options', () => {
      expect(none()).toBeNone()
      expect(none<number>()).toBeNone()
      expect(none<string>()).toBeNone()
    })

    it('fails for Some options', () => {
      expect(() => expect(some(5)).toBeNone()).toThrow()
      expect(() => expect(some('hello')).toBeNone()).toThrow()
      expect(() => expect(some(null)).toBeNone()).toThrow()
    })

    it('passes with not for Some options', () => {
      expect(some(5)).not.toBeNone()
      expect(some('hello')).not.toBeNone()
    })

    it('fails with not for None options', () => {
      expect(() => expect(none()).not.toBeNone()).toThrow()
    })

    it('fails for non-Option values', () => {
      expect(() => expect(null).toBeNone()).toThrow()
      expect(() => expect(undefined).toBeNone()).toThrow()
      expect(() => expect(5).toBeNone()).toThrow()
    })
  })

  describe('toEqualOption', () => {
    it('passes for equal Some options', () => {
      expect(some(5)).toEqualOption(some(5))
      expect(some('hello')).toEqualOption(some('hello'))
      expect(some({ name: 'John' })).toEqualOption(some({ name: 'John' }))
    })

    it('passes for equal None options', () => {
      expect(none()).toEqualOption(none())
      expect(none<number>()).toEqualOption(none<string>())
    })

    it('fails when Some values differ', () => {
      expect(() => expect(some(5)).toEqualOption(some(10))).toThrow()
      expect(() => expect(some('hello')).toEqualOption(some('world'))).toThrow()
    })

    it('fails when tags differ', () => {
      expect(() => expect(some(5)).toEqualOption(none())).toThrow()
      expect(() => expect(none()).toEqualOption(some(5))).toThrow()
    })

    it('passes with not when Options differ', () => {
      expect(some(5)).not.toEqualOption(some(10))
      expect(some(5)).not.toEqualOption(none())
      expect(none()).not.toEqualOption(some(5))
    })

    it('fails for non-Option values', () => {
      expect(() => expect(5).toEqualOption(some(5))).toThrow()
      expect(() => expect(some(5)).toEqualOption(5)).toThrow()
    })

    it('handles deeply nested structures', () => {
      const complex = { nested: { deep: { value: [1, 2, 3] } } }
      expect(some(complex)).toEqualOption(some({ nested: { deep: { value: [1, 2, 3] } } }))
    })
  })

  describe('Integration with Option operations', () => {
    it('works with map', () => {
      const option = some(5)
      const mapped = option._tag === 'Some' ? some(option.value * 2) : option

      expect(mapped).toBeSome(10)
      expect(mapped).toEqualOption(some(10))
    })

    it('works with fromNullable pattern', () => {
      function findUser(id: number) {
        const user = id === 1 ? { id: 1, name: 'John' } : null
        return user !== null ? some(user) : none()
      }

      expect(findUser(1)).toBeSome({ id: 1, name: 'John' })
      expect(findUser(2)).toBeNone()
    })

    it('works in test assertions', () => {
      function parsePositiveInt(str: string) {
        const n = Number(str)
        return Number.isNaN(n) || n <= 0 || !Number.isInteger(n) ? none() : some(n)
      }

      expect(parsePositiveInt('42')).toBeSome(42)
      expect(parsePositiveInt('abc')).toBeNone()
      expect(parsePositiveInt('-5')).toBeNone()
      expect(parsePositiveInt('3.14')).toBeNone()
      expect(parsePositiveInt('0')).toBeNone()
    })

    it('works with chaining', () => {
      const opt1 = some(5)
      const opt2 = opt1._tag === 'Some' && opt1.value > 0 ? some(opt1.value * 2) : none()
      const opt3 = opt2._tag === 'Some' && opt2.value < 20 ? some(opt2.value + 1) : none()

      expect(opt1).toBeSome(5)
      expect(opt2).toBeSome(10)
      expect(opt3).toBeSome(11)
    })
  })

  describe('Error messages', () => {
    it('provides clear messages for toBeSome failures', () => {
      try {
        expect(none()).toBeSome()
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Option to be Some')
        expect(e.message).toContain('but got None')
      }
    })

    it('provides clear messages for toBeNone failures', () => {
      try {
        expect(some(5)).toBeNone()
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Option to be None')
        expect(e.message).toContain('but got Some')
      }
    })

    it('provides clear messages for value mismatches', () => {
      try {
        expect(some(5)).toBeSome(10)
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Some value to equal')
      }
    })

    it('includes actual values in error messages', () => {
      try {
        expect(some(5)).toBeSome(10)
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('5')
        expect(e.message).toContain('10')
      }
    })
  })

  describe('Type narrowing behavior', () => {
    it('works with type guards', () => {
      const option = some(42)

      if (option._tag === 'Some') {
        expect(option).toBeSome(42)
        expect(option.value).toBe(42)
      }
    })

    it('handles None consistently', () => {
      const none1 = none<number>()
      const none2 = none<string>()

      expect(none1).toBeNone()
      expect(none2).toBeNone()
      expect(none1).toEqualOption(none2)
    })
  })

  describe('Edge cases', () => {
    it('handles Some with falsy values', () => {
      expect(some(0)).toBeSome(0)
      expect(some('')).toBeSome('')
      expect(some(false)).toBeSome(false)
      expect(some(null)).toBeSome(null)
    })

    it('distinguishes Some(undefined) from None', () => {
      expect(some(undefined)).toBeSome(undefined)
      expect(some(undefined)).not.toBeNone()
      expect(none()).toBeNone()
    })

    it('handles arrays and objects', () => {
      expect(some([])).toBeSome([])
      expect(some({})).toBeSome({})
      expect(some([1, 2, 3])).toBeSome([1, 2, 3])
      expect(some({ a: 1 })).toBeSome({ a: 1 })
    })
  })
})

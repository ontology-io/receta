import { describe, it, expect, beforeAll } from 'bun:test'
import { ok, err } from '@ontologyio/receta/result'
import { resultMatchers } from '../matchers/result'

// Extend expect with Result matchers
beforeAll(() => {
  expect.extend(resultMatchers)
})

describe('Result Matchers', () => {
  describe('toBeOk', () => {
    describe('without expected value', () => {
      it('passes for Ok results', () => {
        expect(ok(5)).toBeOk()
        expect(ok('hello')).toBeOk()
        expect(ok(null)).toBeOk()
        expect(ok({ name: 'John' })).toBeOk()
      })

      it('fails for Err results', () => {
        expect(() => expect(err('fail')).toBeOk()).toThrow()
        expect(() => expect(err(404)).toBeOk()).toThrow()
      })

      it('passes with not for Err results', () => {
        expect(err('fail')).not.toBeOk()
        expect(err(404)).not.toBeOk()
      })

      it('fails with not for Ok results', () => {
        expect(() => expect(ok(5)).not.toBeOk()).toThrow()
      })

      it('fails for non-Result values', () => {
        expect(() => expect(5).toBeOk()).toThrow()
        expect(() => expect('hello').toBeOk()).toThrow()
        expect(() => expect(null).toBeOk()).toThrow()
        expect(() => expect({ value: 5 }).toBeOk()).toThrow()
      })
    })

    describe('with expected value', () => {
      it('passes when Ok value matches', () => {
        expect(ok(5)).toBeOk(5)
        expect(ok('hello')).toBeOk('hello')
        expect(ok(null)).toBeOk(null)
        expect(ok({ name: 'John' })).toBeOk({ name: 'John' })
      })

      it('fails when Ok value does not match', () => {
        expect(() => expect(ok(5)).toBeOk(10)).toThrow()
        expect(() => expect(ok('hello')).toBeOk('world')).toThrow()
        expect(() => expect(ok({ name: 'John' })).toBeOk({ name: 'Jane' })).toThrow()
      })

      it('fails for Err results', () => {
        expect(() => expect(err('fail')).toBeOk(5)).toThrow()
      })

      it('passes with not when Ok value does not match', () => {
        expect(ok(5)).not.toBeOk(10)
        expect(ok('hello')).not.toBeOk('world')
      })

      it('handles complex values', () => {
        const obj = { nested: { value: 42 } }
        expect(ok(obj)).toBeOk({ nested: { value: 42 } })
        expect(ok([1, 2, 3])).toBeOk([1, 2, 3])
      })
    })
  })

  describe('toBeErr', () => {
    describe('without expected error', () => {
      it('passes for Err results', () => {
        expect(err('fail')).toBeErr()
        expect(err(404)).toBeErr()
        expect(err({ code: 'ERR', message: 'fail' })).toBeErr()
      })

      it('fails for Ok results', () => {
        expect(() => expect(ok(5)).toBeErr()).toThrow()
        expect(() => expect(ok('hello')).toBeErr()).toThrow()
      })

      it('passes with not for Ok results', () => {
        expect(ok(5)).not.toBeErr()
        expect(ok('hello')).not.toBeErr()
      })

      it('fails with not for Err results', () => {
        expect(() => expect(err('fail')).not.toBeErr()).toThrow()
      })

      it('fails for non-Result values', () => {
        expect(() => expect(5).toBeErr()).toThrow()
        expect(() => expect('error').toBeErr()).toThrow()
        expect(() => expect(null).toBeErr()).toThrow()
      })
    })

    describe('with expected error', () => {
      it('passes when Err error matches', () => {
        expect(err('fail')).toBeErr('fail')
        expect(err(404)).toBeErr(404)
        expect(err({ code: 'ERR' })).toBeErr({ code: 'ERR' })
      })

      it('fails when Err error does not match', () => {
        expect(() => expect(err('fail')).toBeErr('other')).toThrow()
        expect(() => expect(err(404)).toBeErr(500)).toThrow()
      })

      it('fails for Ok results', () => {
        expect(() => expect(ok(5)).toBeErr('fail')).toThrow()
      })

      it('passes with not when Err error does not match', () => {
        expect(err('fail')).not.toBeErr('other')
        expect(err(404)).not.toBeErr(500)
      })

      it('handles complex error objects', () => {
        const error = { code: 'ERR', details: { line: 42 } }
        expect(err(error)).toBeErr({ code: 'ERR', details: { line: 42 } })
      })
    })
  })

  describe('toEqualResult', () => {
    it('passes for equal Ok results', () => {
      expect(ok(5)).toEqualResult(ok(5))
      expect(ok('hello')).toEqualResult(ok('hello'))
      expect(ok({ name: 'John' })).toEqualResult(ok({ name: 'John' }))
    })

    it('passes for equal Err results', () => {
      expect(err('fail')).toEqualResult(err('fail'))
      expect(err(404)).toEqualResult(err(404))
      expect(err({ code: 'ERR' })).toEqualResult(err({ code: 'ERR' }))
    })

    it('fails when Ok values differ', () => {
      expect(() => expect(ok(5)).toEqualResult(ok(10))).toThrow()
      expect(() => expect(ok('hello')).toEqualResult(ok('world'))).toThrow()
    })

    it('fails when Err errors differ', () => {
      expect(() => expect(err('fail')).toEqualResult(err('other'))).toThrow()
      expect(() => expect(err(404)).toEqualResult(err(500))).toThrow()
    })

    it('fails when tags differ', () => {
      expect(() => expect(ok(5)).toEqualResult(err('fail'))).toThrow()
      expect(() => expect(err('fail')).toEqualResult(ok(5))).toThrow()
    })

    it('passes with not when Results differ', () => {
      expect(ok(5)).not.toEqualResult(ok(10))
      expect(ok(5)).not.toEqualResult(err('fail'))
      expect(err('fail')).not.toEqualResult(err('other'))
    })

    it('fails for non-Result values', () => {
      expect(() => expect(5).toEqualResult(ok(5))).toThrow()
      expect(() => expect(ok(5)).toEqualResult(5)).toThrow()
    })

    it('handles deeply nested structures', () => {
      const complex = { nested: { deep: { value: [1, 2, 3] } } }
      expect(ok(complex)).toEqualResult(ok({ nested: { deep: { value: [1, 2, 3] } } }))
    })
  })

  describe('Integration with Result operations', () => {
    it('works with map', () => {
      const result = ok(5)
      const mapped = result._tag === 'Ok' ? ok(result.value * 2) : result

      expect(mapped).toBeOk(10)
      expect(mapped).toEqualResult(ok(10))
    })

    it('works with error propagation', () => {
      const initial = err('initial error')

      expect(initial).toBeErr('initial error')
      expect(initial).not.toBeOk()
      expect(initial).toEqualResult(err('initial error'))
    })

    it('works in test assertions', () => {
      function parseNumber(str: string) {
        const n = Number(str)
        return Number.isNaN(n) ? err('Invalid number') : ok(n)
      }

      expect(parseNumber('42')).toBeOk(42)
      expect(parseNumber('abc')).toBeErr('Invalid number')
      expect(parseNumber('3.14')).toBeOk(3.14)
    })
  })

  describe('Error messages', () => {
    it('provides clear messages for toBeOk failures', () => {
      try {
        expect(err('fail')).toBeOk()
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Result to be Ok')
        expect(e.message).toContain('but got Err')
      }
    })

    it('provides clear messages for toBeErr failures', () => {
      try {
        expect(ok(5)).toBeErr()
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Result to be Err')
        expect(e.message).toContain('but got Ok')
      }
    })

    it('provides clear messages for value mismatches', () => {
      try {
        expect(ok(5)).toBeOk(10)
        throw new Error('Should have thrown')
      } catch (e: any) {
        expect(e.message).toContain('Expected Ok value to equal')
      }
    })
  })
})

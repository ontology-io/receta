import { describe, it, expect } from 'bun:test'
import { parseJSON, parseNumber, parseInt } from '../parsing'
import { isOk, isErr } from '../guards'
import * as R from 'remeda'
import { map, flatMap } from '../index'

describe('Result Parsing Utilities', () => {
  describe('parseJSON', () => {
    describe('successful parsing', () => {
      it('parses valid JSON object', () => {
        const result = parseJSON('{"name":"John","age":30}')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toEqual({ name: 'John', age: 30 })
        }
      })

      it('parses valid JSON array', () => {
        const result = parseJSON('[1, 2, 3]')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toEqual([1, 2, 3])
        }
      })

      it('parses primitives', () => {
        expect(parseJSON('123')).toEqual({ _tag: 'Ok', value: 123 })
        expect(parseJSON('"hello"')).toEqual({ _tag: 'Ok', value: 'hello' })
        expect(parseJSON('true')).toEqual({ _tag: 'Ok', value: true })
        expect(parseJSON('null')).toEqual({ _tag: 'Ok', value: null })
      })

      it('parses nested structures', () => {
        const json = '{"user":{"name":"Alice","tags":["admin","user"]}}'
        const result = parseJSON(json)
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toEqual({
            user: { name: 'Alice', tags: ['admin', 'user'] },
          })
        }
      })

      it('parses empty object and array', () => {
        expect(parseJSON('{}')).toEqual({ _tag: 'Ok', value: {} })
        expect(parseJSON('[]')).toEqual({ _tag: 'Ok', value: [] })
      })
    })

    describe('failed parsing', () => {
      it('returns Err for invalid JSON', () => {
        const result = parseJSON('invalid json')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(SyntaxError)
        }
      })

      it('returns Err for incomplete JSON', () => {
        const result = parseJSON('{"incomplete":')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error).toBeInstanceOf(SyntaxError)
        }
      })

      it('returns Err for trailing comma', () => {
        const result = parseJSON('{"name":"John",}')
        expect(isErr(result)).toBe(true)
      })

      it('returns Err for empty string', () => {
        const result = parseJSON('')
        expect(isErr(result)).toBe(true)
      })
    })

    describe('type inference', () => {
      interface User {
        name: string
        age: number
      }

      it('works with type annotations', () => {
        const result = parseJSON<User>('{"name":"Bob","age":25}')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value.name).toBe('Bob')
          expect(result.value.age).toBe(25)
        }
      })
    })

    describe('composition', () => {
      it('works with map', () => {
        const result = R.pipe(
          parseJSON<{ count: number }>('{"count":5}'),
          map((obj) => obj.count * 2)
        )
        expect(result).toEqual({ _tag: 'Ok', value: 10 })
      })

      it('works with flatMap for validation', () => {
        interface Config {
          port: number
        }

        const parseConfig = (str: string) =>
          R.pipe(
            parseJSON<Config>(str),
            flatMap((config) =>
              config.port > 0 && config.port < 65536
                ? { _tag: 'Ok' as const, value: config }
                : { _tag: 'Err' as const, error: 'Invalid port range' }
            )
          )

        expect(isOk(parseConfig('{"port":3000}'))).toBe(true)
        expect(isErr(parseConfig('{"port":70000}'))).toBe(true)
      })
    })
  })

  describe('parseNumber', () => {
    describe('successful parsing', () => {
      it('parses positive integers', () => {
        const result = parseNumber('123')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(123)
        }
      })

      it('parses negative integers', () => {
        const result = parseNumber('-42')
        expect(result).toEqual({ _tag: 'Ok', value: -42 })
      })

      it('parses floating point numbers', () => {
        expect(parseNumber('3.14')).toEqual({ _tag: 'Ok', value: 3.14 })
        expect(parseNumber('-0.5')).toEqual({ _tag: 'Ok', value: -0.5 })
      })

      it('parses zero', () => {
        expect(parseNumber('0')).toEqual({ _tag: 'Ok', value: 0 })
        expect(parseNumber('-0')).toEqual({ _tag: 'Ok', value: -0 })
      })

      it('parses scientific notation', () => {
        expect(parseNumber('1e10')).toEqual({ _tag: 'Ok', value: 1e10 })
        expect(parseNumber('1.5e-3')).toEqual({ _tag: 'Ok', value: 0.0015 })
      })

      it('trims whitespace', () => {
        expect(parseNumber('  42  ')).toEqual({ _tag: 'Ok', value: 42 })
        expect(parseNumber('\t100\n')).toEqual({ _tag: 'Ok', value: 100 })
      })
    })

    describe('failed parsing', () => {
      it('returns Err for non-numeric strings', () => {
        const result = parseNumber('abc')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error._tag).toBe('ParseNumberError')
          expect(result.error.reason).toBe('not_a_number')
          expect(result.error.input).toBe('abc')
        }
      })

      it('returns Err for empty string', () => {
        const result = parseNumber('')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error.reason).toBe('not_a_number')
        }
      })

      it('returns Err for Infinity', () => {
        const result = parseNumber('Infinity')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error.reason).toBe('infinite')
        }
      })

      it('returns Err for -Infinity', () => {
        const result = parseNumber('-Infinity')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error.reason).toBe('infinite')
        }
      })

      it('returns Err for mixed alphanumeric', () => {
        expect(isErr(parseNumber('123abc'))).toBe(true)
        expect(isErr(parseNumber('abc123'))).toBe(true)
      })
    })

    describe('composition', () => {
      it('works in validation pipelines', () => {
        const parsePositive = (str: string) =>
          R.pipe(
            parseNumber(str),
            flatMap((n) =>
              n > 0
                ? { _tag: 'Ok' as const, value: n }
                : { _tag: 'Err' as const, error: 'Must be positive' }
            )
          )

        expect(isOk(parsePositive('42'))).toBe(true)
        expect(isErr(parsePositive('-5'))).toBe(true)
        expect(isErr(parsePositive('abc'))).toBe(true)
      })
    })
  })

  describe('parseInt', () => {
    describe('decimal parsing (radix 10)', () => {
      it('parses positive integers', () => {
        const result = parseInt('123')
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(123)
        }
      })

      it('parses negative integers', () => {
        expect(parseInt('-42')).toEqual({ _tag: 'Ok', value: -42 })
      })

      it('parses zero', () => {
        expect(parseInt('0')).toEqual({ _tag: 'Ok', value: 0 })
        expect(parseInt('-0')).toEqual({ _tag: 'Ok', value: -0 })
      })

      it('trims whitespace', () => {
        expect(parseInt('  100  ')).toEqual({ _tag: 'Ok', value: 100 })
      })
    })

    describe('binary parsing (radix 2)', () => {
      it('parses binary strings', () => {
        expect(parseInt('1010', 2)).toEqual({ _tag: 'Ok', value: 10 })
        expect(parseInt('11111111', 2)).toEqual({ _tag: 'Ok', value: 255 })
        expect(parseInt('0', 2)).toEqual({ _tag: 'Ok', value: 0 })
      })

      it('parses partial valid binary (native parseInt behavior)', () => {
        // Note: parseInt stops at first invalid digit, so '102' in base 2 -> 2 ('10')
        const result = parseInt('102', 2)
        expect(isOk(result)).toBe(true)
        if (isOk(result)) {
          expect(result.value).toBe(2) // Parses '10', stops at '2'
        }
      })
    })

    describe('hexadecimal parsing (radix 16)', () => {
      it('parses hex strings', () => {
        expect(parseInt('FF', 16)).toEqual({ _tag: 'Ok', value: 255 })
        expect(parseInt('1A', 16)).toEqual({ _tag: 'Ok', value: 26 })
        expect(parseInt('0', 16)).toEqual({ _tag: 'Ok', value: 0 })
      })

      it('handles 0x prefix', () => {
        expect(parseInt('0xFF', 16)).toEqual({ _tag: 'Ok', value: 255 })
      })

      it('is case insensitive', () => {
        expect(parseInt('ff', 16)).toEqual({ _tag: 'Ok', value: 255 })
        expect(parseInt('FF', 16)).toEqual({ _tag: 'Ok', value: 255 })
      })
    })

    describe('octal parsing (radix 8)', () => {
      it('parses octal strings', () => {
        expect(parseInt('77', 8)).toEqual({ _tag: 'Ok', value: 63 })
        expect(parseInt('10', 8)).toEqual({ _tag: 'Ok', value: 8 })
      })
    })

    describe('failed parsing', () => {
      it('returns Err for non-numeric strings', () => {
        const result = parseInt('abc')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error._tag).toBe('ParseNumberError')
          expect(result.error.reason).toBe('not_a_number')
        }
      })

      it('returns Err for empty string', () => {
        expect(isErr(parseInt(''))).toBe(true)
      })

      it('returns Err for decimal numbers', () => {
        const result = parseInt('123.45')
        expect(isErr(result)).toBe(true)
        if (isErr(result)) {
          expect(result.error.reason).toBe('not_a_number')
        }
      })

      it('returns Err for invalid radix', () => {
        const result1 = parseInt('123', 1)
        expect(isErr(result1)).toBe(true)
        if (isErr(result1)) {
          expect(result1.error.reason).toBe('out_of_radix_range')
        }

        const result2 = parseInt('123', 37)
        expect(isErr(result2)).toBe(true)
        if (isErr(result2)) {
          expect(result2.error.reason).toBe('out_of_radix_range')
        }
      })
    })

    describe('composition', () => {
      it('works with match for pattern matching', () => {
        const result = R.pipe(
          parseInt('FF', 16),
          map((n) => `Decimal: ${n}`)
        )
        expect(result).toEqual({ _tag: 'Ok', value: 'Decimal: 255' })
      })
    })
  })

  describe('error structures', () => {
    it('ParseNumberError has correct shape', () => {
      const result = parseNumber('invalid')
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toHaveProperty('_tag', 'ParseNumberError')
        expect(result.error).toHaveProperty('input')
        expect(result.error).toHaveProperty('reason')
        expect(result.error).toHaveProperty('message')
      }
    })

    it('SyntaxError from parseJSON is native error', () => {
      const result = parseJSON('invalid')
      expect(isErr(result)).toBe(true)
      if (isErr(result)) {
        expect(result.error).toBeInstanceOf(SyntaxError)
        expect(result.error.message).toBeTruthy()
      }
    })
  })
})

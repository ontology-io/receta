import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { ok, err } from '../constructors'
import { map } from '../map'
import { mapErr } from '../mapErr'
import { flatMap } from '../flatMap'
import { flatten } from '../flatten'

describe('Result Transformers', () => {
  describe('map', () => {
    it('transforms Ok value (data-first)', () => {
      expect(map(ok(5), x => x * 2)).toEqual(ok(10))
    })

    it('passes through Err unchanged (data-first)', () => {
      expect(map(err('fail'), (x: number) => x * 2)).toEqual(err('fail'))
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        ok(5),
        map(x => x * 2),
        map(x => x + 1)
      )
      expect(result).toEqual(ok(11))
    })

    it('transforms types correctly', () => {
      const result = R.pipe(
        ok(42),
        map(n => String(n)),
        map(s => s.length)
      )
      expect(result).toEqual(ok(2))
    })

    it('chains with Err in pipe', () => {
      const result = R.pipe(
        err<number, string>('fail'),
        map(x => x * 2),
        map(x => x + 1)
      )
      expect(result).toEqual(err('fail'))
    })
  })

  describe('mapErr', () => {
    it('transforms Err value (data-first)', () => {
      expect(mapErr(err('fail'), e => `Error: ${e}`)).toEqual(err('Error: fail'))
    })

    it('passes through Ok unchanged (data-first)', () => {
      expect(mapErr(ok(5), (e: string) => `Error: ${e}`)).toEqual(ok(5))
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        err('fail'),
        mapErr(e => ({ code: 'ERROR', message: e }))
      )
      expect(result).toEqual(err({ code: 'ERROR', message: 'fail' }))
    })

    it('enriches error with context', () => {
      const result = R.pipe(
        err('Network timeout'),
        mapErr(e => ({
          code: 'NETWORK_ERROR',
          message: e,
          timestamp: 123456
        }))
      )
      expect(result).toEqual(err({
        code: 'NETWORK_ERROR',
        message: 'Network timeout',
        timestamp: 123456
      }))
    })
  })

  describe('flatMap', () => {
    const parseNumber = (str: string) =>
      str === '' ? err('Empty string') : ok(Number(str))

    it('chains Ok values (data-first)', () => {
      expect(flatMap(ok('42'), parseNumber)).toEqual(ok(42))
    })

    it('propagates inner Err (data-first)', () => {
      expect(flatMap(ok(''), parseNumber)).toEqual(err('Empty string'))
    })

    it('propagates outer Err (data-first)', () => {
      expect(flatMap(err<string, string>('fail'), parseNumber)).toEqual(err('fail'))
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        ok('42'),
        flatMap(parseNumber),
        map(n => n * 2)
      )
      expect(result).toEqual(ok(84))
    })

    it('short-circuits on first error in chain', () => {
      const result = R.pipe(
        ok(''),
        flatMap(parseNumber),
        map(n => n * 2) // This should not execute
      )
      expect(result).toEqual(err('Empty string'))
    })

    it('chains multiple operations', () => {
      const divide = (n: number, d: number) =>
        d === 0 ? err('Division by zero') : ok(n / d)

      const result = R.pipe(
        ok('10'),
        flatMap(parseNumber),
        flatMap(n => divide(n, 2)),
        map(n => n + 1)
      )
      expect(result).toEqual(ok(6))
    })
  })

  describe('flatten', () => {
    it('flattens Ok(Ok(T)) to Ok(T) (data-first)', () => {
      expect(flatten(ok(ok(42)))).toEqual(ok(42))
    })

    it('flattens Ok(Err(E)) to Err(E) (data-first)', () => {
      expect(flatten(ok(err('inner')))).toEqual(err('inner'))
    })

    it('passes through Err unchanged (data-first)', () => {
      expect(flatten(err<typeof ok<number>, string>('outer'))).toEqual(err('outer'))
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        ok(ok(42)),
        flatten
      )
      expect(result).toEqual(ok(42))
    })

    it('flattens nested Result from map', () => {
      const result = R.pipe(
        ok(5),
        map(n => ok(n * 2)), // Returns Result<Result<number, never>, never>
        flatten
      )
      expect(result).toEqual(ok(10))
    })
  })

  describe('integration: combining transformers', () => {
    it('map + mapErr handles both paths', () => {
      const process = (result: typeof ok<number> | typeof err<string>) =>
        R.pipe(
          result,
          map(n => n * 2),
          mapErr(e => `Failed: ${e}`)
        )

      expect(process(ok(5))).toEqual(ok(10))
      expect(process(err('fail'))).toEqual(err('Failed: fail'))
    })

    it('flatMap + map compose cleanly', () => {
      const parseAndDouble = (str: string) =>
        R.pipe(
          ok(str),
          flatMap(s => s === '' ? err('Empty') : ok(Number(s))),
          map(n => n * 2)
        )

      expect(parseAndDouble('21')).toEqual(ok(42))
      expect(parseAndDouble('')).toEqual(err('Empty'))
    })
  })
})

import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { ok, err } from '../constructors'
import { unwrap, unwrapOr, unwrapOrElse } from '../unwrap'
import { match } from '../match'
import { tap, tapErr } from '../tap'

describe('Result Extractors', () => {
  describe('unwrap', () => {
    it('extracts Ok value', () => {
      expect(unwrap(ok(42))).toBe(42)
      expect(unwrap(ok('hello'))).toBe('hello')
    })

    it('throws on Err', () => {
      expect(() => unwrap(err('fail'))).toThrow('fail')
      expect(() => unwrap(err(new Error('error')))).toThrow(Error)
    })
  })

  describe('unwrapOr', () => {
    it('extracts Ok value (data-first)', () => {
      expect(unwrapOr(ok(42), 0)).toBe(42)
    })

    it('returns default on Err (data-first)', () => {
      expect(unwrapOr(err('fail'), 0)).toBe(0)
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        ok(42),
        unwrapOr(0)
      )
      expect(result).toBe(42)
    })

    it('uses default for Err in pipe', () => {
      const result = R.pipe(
        err('fail'),
        unwrapOr(100)
      )
      expect(result).toBe(100)
    })

    it('handles complex default values', () => {
      const defaultUser = { name: 'Guest', id: 0 }
      expect(unwrapOr(err('not found'), defaultUser)).toEqual(defaultUser)
    })
  })

  describe('unwrapOrElse', () => {
    it('extracts Ok value (data-first)', () => {
      expect(unwrapOrElse(ok(42), () => 0)).toBe(42)
    })

    it('computes fallback on Err (data-first)', () => {
      expect(unwrapOrElse(err('fail'), () => 0)).toBe(0)
    })

    it('provides error to fallback function', () => {
      const result = unwrapOrElse(
        err('not found'),
        (e) => `Error: ${e}`
      )
      expect(result).toBe('Error: not found')
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        err('fail'),
        unwrapOrElse(() => 100)
      )
      expect(result).toBe(100)
    })

    it('allows logging and fallback', () => {
      const logs: string[] = []
      const result = unwrapOrElse(
        err('network error'),
        (e) => {
          logs.push(`Caught: ${e}`)
          return 0
        }
      )
      expect(result).toBe(0)
      expect(logs).toEqual(['Caught: network error'])
    })

    it('only calls fallback for Err', () => {
      let called = false
      unwrapOrElse(ok(42), () => {
        called = true
        return 0
      })
      expect(called).toBe(false)
    })
  })

  describe('match', () => {
    it('calls onOk for Ok (data-first)', () => {
      const result = match(ok(42), {
        onOk: n => `Success: ${n}`,
        onErr: e => `Error: ${e}`
      })
      expect(result).toBe('Success: 42')
    })

    it('calls onErr for Err (data-first)', () => {
      const result = match(err('fail'), {
        onOk: (n: number) => `Success: ${n}`,
        onErr: e => `Error: ${e}`
      })
      expect(result).toBe('Error: fail')
    })

    it('works in pipe (data-last)', () => {
      const result = R.pipe(
        ok(42),
        match({
          onOk: n => n * 2,
          onErr: () => 0
        })
      )
      expect(result).toBe(84)
    })

    it('handles different return types consistently', () => {
      const getStatus = match({
        onOk: () => 'success' as const,
        onErr: () => 'error' as const
      })

      expect(getStatus(ok(42))).toBe('success')
      expect(getStatus(err('fail'))).toBe('error')
    })

    it('can render different views', () => {
      const renderResult = (r: typeof ok<{ name: string }> | typeof err<string>) =>
        match(r, {
          onOk: user => `<div>Hello ${user.name}</div>`,
          onErr: error => `<div class="error">${error}</div>`
        })

      expect(renderResult(ok({ name: 'John' }))).toBe('<div>Hello John</div>')
      expect(renderResult(err('Not found'))).toBe('<div class="error">Not found</div>')
    })
  })

  describe('tap and tapErr', () => {
    it('tap executes side effect for Ok', () => {
      const logs: number[] = []
      const result = R.pipe(
        ok(42),
        tap(n => logs.push(n)),
        tap(n => logs.push(n * 2))
      )
      expect(result).toEqual(ok(42))
      expect(logs).toEqual([42, 84])
    })

    it('tap does not execute for Err', () => {
      const logs: number[] = []
      const result = R.pipe(
        err('fail'),
        tap((n: number) => logs.push(n))
      )
      expect(result).toEqual(err('fail'))
      expect(logs).toEqual([])
    })

    it('tapErr executes side effect for Err', () => {
      const logs: string[] = []
      const result = R.pipe(
        err('fail'),
        tapErr(e => logs.push(`Error: ${e}`))
      )
      expect(result).toEqual(err('fail'))
      expect(logs).toEqual(['Error: fail'])
    })

    it('tapErr does not execute for Ok', () => {
      const logs: string[] = []
      const result = R.pipe(
        ok(42),
        tapErr((e: string) => logs.push(e))
      )
      expect(result).toEqual(ok(42))
      expect(logs).toEqual([])
    })

    it('tap and tapErr can be combined', () => {
      const logs: string[] = []

      const processOk = R.pipe(
        ok(42),
        tap(n => logs.push(`Ok: ${n}`)),
        tapErr((e: string) => logs.push(`Err: ${e}`))
      )

      const processErr = R.pipe(
        err('fail'),
        tap(n => logs.push(`Ok: ${n}`)),
        tapErr(e => logs.push(`Err: ${e}`))
      )

      expect(processOk).toEqual(ok(42))
      expect(processErr).toEqual(err('fail'))
      expect(logs).toEqual(['Ok: 42', 'Err: fail'])
    })
  })
})

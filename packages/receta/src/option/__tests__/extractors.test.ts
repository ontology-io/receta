import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { some, none } from '../constructors'
import { unwrap, unwrapOr, unwrapOrElse } from '../unwrap'
import { match } from '../match'
import { tap, tapNone } from '../tap'
import { map } from '../map'
import { isSome } from '../guards'

describe('Option Extractors', () => {
  describe('unwrap', () => {
    it('returns value for Some', () => {
      expect(unwrap(some(42))).toBe(42)
    })

    it('throws for None', () => {
      expect(() => unwrap(none())).toThrow('Cannot unwrap None')
    })

    it('preserves value type', () => {
      expect(unwrap(some('hello'))).toBe('hello')
      expect(unwrap(some({ name: 'John' }))).toEqual({ name: 'John' })
    })
  })

  describe('unwrapOr', () => {
    describe('data-first', () => {
      it('returns value for Some', () => {
        expect(unwrapOr(some(42), 0)).toBe(42)
      })

      it('returns default for None', () => {
        expect(unwrapOr(none(), 0)).toBe(0)
      })

      it('works with different types', () => {
        expect(unwrapOr(some('hello'), 'default')).toBe('hello')
        expect(unwrapOr(none(), 'default')).toBe('default')
      })

      it('works with objects', () => {
        const defaultUser = { name: 'Guest' }
        expect(unwrapOr(some({ name: 'John' }), defaultUser)).toEqual({ name: 'John' })
        expect(unwrapOr(none(), defaultUser)).toBe(defaultUser)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(42), unwrapOr(0))
        expect(result).toBe(42)
      })

      it('returns default at end of pipe', () => {
        const result = R.pipe(
          none<number>(),
          map((x) => x * 2),
          unwrapOr(99)
        )
        expect(result).toBe(99)
      })
    })
  })

  describe('unwrapOrElse', () => {
    describe('data-first', () => {
      it('returns value for Some', () => {
        let called = false
        const result = unwrapOrElse(some(42), () => {
          called = true
          return 0
        })
        expect(result).toBe(42)
        expect(called).toBe(false)
      })

      it('computes default for None', () => {
        const result = unwrapOrElse(none(), () => 42)
        expect(result).toBe(42)
      })

      it('calls function lazily', () => {
        let callCount = 0
        const compute = () => {
          callCount++
          return 100
        }

        unwrapOrElse(some(42), compute)
        expect(callCount).toBe(0)

        unwrapOrElse(none(), compute)
        expect(callCount).toBe(1)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(
          some(42),
          unwrapOrElse(() => 0)
        )
        expect(result).toBe(42)
      })

      it('computes default at end of pipe', () => {
        let called = false
        const result = R.pipe(
          none<number>(),
          map((x) => x * 2),
          unwrapOrElse(() => {
            called = true
            return 99
          })
        )
        expect(result).toBe(99)
        expect(called).toBe(true)
      })
    })
  })

  describe('match', () => {
    describe('data-first', () => {
      it('calls onSome for Some', () => {
        const result = match(some(42), {
          onSome: (x) => `Value: ${x}`,
          onNone: () => 'No value',
        })
        expect(result).toBe('Value: 42')
      })

      it('calls onNone for None', () => {
        const result = match(none(), {
          onSome: (x) => `Value: ${x}`,
          onNone: () => 'No value',
        })
        expect(result).toBe('No value')
      })

      it('works with different return types', () => {
        const result = match(some(42), {
          onSome: () => 200,
          onNone: () => 404,
        })
        expect(result).toBe(200)
      })

      it('passes value to onSome', () => {
        let receivedValue: number | null = null
        match(some(42), {
          onSome: (x) => {
            receivedValue = x
          },
          onNone: () => {},
        })
        expect(receivedValue).toBe(42)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(
          some(42),
          match({
            onSome: (x) => x * 2,
            onNone: () => 0,
          })
        )
        expect(result).toBe(84)
      })

      it('works after transformation pipeline', () => {
        const result = R.pipe(
          some(10),
          map((x) => x * 2),
          match({
            onSome: (x) => `Result: ${x}`,
            onNone: () => 'Failed',
          })
        )
        expect(result).toBe('Result: 20')
      })
    })
  })

  describe('tap', () => {
    describe('data-first', () => {
      it('runs side effect on Some', () => {
        let sideEffect = 0
        const result = tap(some(42), (x) => {
          sideEffect = x
        })
        expect(sideEffect).toBe(42)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(42)
        }
      })

      it('does not run side effect on None', () => {
        let called = false
        const result = tap(none(), () => {
          called = true
        })
        expect(called).toBe(false)
        expect(result._tag).toBe('None')
      })

      it('returns original Option unchanged', () => {
        const original = some(42)
        const result = tap(original, () => {})
        expect(result).toBe(original)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        let logged: number | null = null
        const result = R.pipe(
          some(42),
          tap((x) => {
            logged = x
          })
        )
        expect(logged).toBe(42)
        expect(isSome(result)).toBe(true)
      })

      it('works in middle of pipeline', () => {
        const logs: number[] = []
        const result = R.pipe(
          some(10),
          tap((x) => logs.push(x)),
          map((x) => x * 2),
          tap((x) => logs.push(x)),
          map((x) => x + 1)
        )
        expect(logs).toEqual([10, 20])
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(21)
        }
      })
    })
  })

  describe('tapNone', () => {
    describe('data-first', () => {
      it('runs side effect on None', () => {
        let called = false
        const result = tapNone(none(), () => {
          called = true
        })
        expect(called).toBe(true)
        expect(result._tag).toBe('None')
      })

      it('does not run side effect on Some', () => {
        let called = false
        const result = tapNone(some(42), () => {
          called = true
        })
        expect(called).toBe(false)
        expect(isSome(result)).toBe(true)
      })

      it('returns original Option unchanged', () => {
        const original = none()
        const result = tapNone(original, () => {})
        expect(result).toBe(original)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        let called = false
        const result = R.pipe(
          none(),
          tapNone(() => {
            called = true
          })
        )
        expect(called).toBe(true)
        expect(result._tag).toBe('None')
      })

      it('works for logging missing values', () => {
        let logMessage = ''
        const result = R.pipe(
          none<number>(),
          tapNone(() => {
            logMessage = 'Value not found'
          }),
          unwrapOr(0)
        )
        expect(logMessage).toBe('Value not found')
        expect(result).toBe(0)
      })
    })
  })
})

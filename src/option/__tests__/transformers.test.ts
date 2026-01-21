import { describe, it, expect } from 'bun:test'
import * as R from 'remeda'
import { some, none } from '../constructors'
import { map } from '../map'
import { flatMap } from '../flatMap'
import { filter } from '../filter'
import { flatten } from '../flatten'
import { isSome, isNone } from '../guards'

describe('Option Transformers', () => {
  describe('map', () => {
    describe('data-first', () => {
      it('transforms Some value', () => {
        const result = map(some(5), (x) => x * 2)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(10)
        }
      })

      it('passes through None unchanged', () => {
        const result = map(none(), (x: number) => x * 2)
        expect(isNone(result)).toBe(true)
      })

      it('changes type of value', () => {
        const result = map(some(42), (x) => String(x))
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe('42')
        }
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(5), map((x) => x * 2))
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(10)
        }
      })

      it('chains multiple maps', () => {
        const result = R.pipe(
          some(5),
          map((x) => x * 2),
          map((x) => x + 1),
          map((x) => String(x))
        )
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe('11')
        }
      })

      it('short-circuits on None', () => {
        let callCount = 0
        const result = R.pipe(
          none<number>(),
          map((x) => {
            callCount++
            return x * 2
          })
        )
        expect(isNone(result)).toBe(true)
        expect(callCount).toBe(0)
      })
    })
  })

  describe('flatMap', () => {
    describe('data-first', () => {
      it('chains Option-returning functions', () => {
        const half = (x: number) => (x % 2 === 0 ? some(x / 2) : none())
        const result = flatMap(some(10), half)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(5)
        }
      })

      it('returns None when function returns None', () => {
        const half = (x: number) => (x % 2 === 0 ? some(x / 2) : none())
        const result = flatMap(some(11), half)
        expect(isNone(result)).toBe(true)
      })

      it('passes through None unchanged', () => {
        const half = (x: number) => some(x / 2)
        const result = flatMap(none<number>(), half)
        expect(isNone(result)).toBe(true)
      })

      it('avoids nested Options', () => {
        const double = (x: number) => some(x * 2)
        const result = flatMap(some(5), double)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(10)
          // Not Some(Some(10))
        }
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const half = (x: number) => (x % 2 === 0 ? some(x / 2) : none())
        const result = R.pipe(some(10), flatMap(half))
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(5)
        }
      })

      it('chains multiple flatMaps', () => {
        const half = (x: number) => (x % 2 === 0 ? some(x / 2) : none())
        const result = R.pipe(some(20), flatMap(half), flatMap(half))
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(5)
        }
      })

      it('short-circuits on first None', () => {
        const half = (x: number) => (x % 2 === 0 ? some(x / 2) : none())
        let callCount = 0
        const result = R.pipe(
          some(11),
          flatMap(half),
          flatMap((x) => {
            callCount++
            return some(x)
          })
        )
        expect(isNone(result)).toBe(true)
        expect(callCount).toBe(0)
      })
    })
  })

  describe('filter', () => {
    describe('data-first', () => {
      it('keeps Some when predicate is true', () => {
        const result = filter(some(5), (x) => x > 0)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(5)
        }
      })

      it('returns None when predicate is false', () => {
        const result = filter(some(-5), (x) => x > 0)
        expect(isNone(result)).toBe(true)
      })

      it('passes through None unchanged', () => {
        const result = filter(none<number>(), (x) => x > 0)
        expect(isNone(result)).toBe(true)
      })

      it('works with complex predicates', () => {
        const isEven = (x: number) => x % 2 === 0
        expect(isSome(filter(some(4), isEven))).toBe(true)
        expect(isNone(filter(some(3), isEven))).toBe(true)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(5), filter((x) => x > 0))
        expect(isSome(result)).toBe(true)
      })

      it('chains with map', () => {
        const result = R.pipe(
          some(10),
          map((x) => x - 5),
          filter((x) => x > 0),
          map((x) => x * 2)
        )
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(10)
        }
      })

      it('short-circuits after filter returns None', () => {
        let callCount = 0
        const result = R.pipe(
          some(5),
          filter((x) => x > 10),
          map((x) => {
            callCount++
            return x * 2
          })
        )
        expect(isNone(result)).toBe(true)
        expect(callCount).toBe(0)
      })
    })
  })

  describe('flatten', () => {
    describe('data-first', () => {
      it('flattens Some(Some(x)) to Some(x)', () => {
        const result = flatten(some(some(42)))
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(42)
        }
      })

      it('flattens Some(None) to None', () => {
        const result = flatten(some(none()))
        expect(isNone(result)).toBe(true)
      })

      it('passes through None unchanged', () => {
        const result = flatten(none())
        expect(isNone(result)).toBe(true)
      })
    })

    describe('data-last', () => {
      it('works in pipe', () => {
        const result = R.pipe(some(some(42)), flatten)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(42)
        }
      })

      it('works with map that creates nested Options', () => {
        const lookup = (x: number) => (x > 0 ? some(x * 2) : none())
        const result = R.pipe(some(5), map(lookup), flatten)
        expect(isSome(result)).toBe(true)
        if (isSome(result)) {
          expect(result.value).toBe(10)
        }
      })
    })
  })

  describe('integration', () => {
    it('combines all transformers in a pipeline', () => {
      const result = R.pipe(
        some(10),
        map((x) => x * 2), // 20
        filter((x) => x > 15), // Some(20)
        map((x) => x / 2), // 10
        flatMap((x) => (x % 2 === 0 ? some(x / 2) : none())), // Some(5)
        map((x) => x + 1) // Some(6)
      )
      expect(isSome(result)).toBe(true)
      if (isSome(result)) {
        expect(result.value).toBe(6)
      }
    })

    it('stops processing on first None', () => {
      let mapCount = 0
      let filterCount = 0

      const result = R.pipe(
        some(10),
        map((x) => {
          mapCount++
          return x
        }),
        filter((x) => {
          filterCount++
          return x > 20
        }),
        map((x) => {
          mapCount++
          return x
        })
      )

      expect(isNone(result)).toBe(true)
      expect(mapCount).toBe(1) // Only first map runs
      expect(filterCount).toBe(1) // Filter runs
      // Second map doesn't run
    })
  })
})

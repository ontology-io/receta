import { describe, it, expect } from 'bun:test'
import { some, none } from '../constructors'
import { map } from '../map'
import { flatMap } from '../flatMap'

/**
 * Property-based tests verifying Option satisfies mathematical laws.
 *
 * These tests ensure Option behaves correctly as a Functor and Monad.
 */
describe('Option Laws', () => {
  describe('Functor Laws', () => {
    describe('Identity Law', () => {
      it('map(option, identity) = option', () => {
        const identity = <T>(x: T) => x

        // Test with Some
        const someValue = some(42)
        expect(map(someValue, identity)).toEqual(someValue)

        // Test with None
        const noneValue = none<number>()
        expect(map(noneValue, identity)).toEqual(noneValue)

        // Test with different types
        expect(map(some('hello'), identity)).toEqual(some('hello'))
        expect(map(some({ name: 'John' }), identity)).toEqual(some({ name: 'John' }))
      })
    })

    describe('Composition Law', () => {
      it('map(map(option, f), g) = map(option, x => g(f(x)))', () => {
        const f = (x: number) => x + 1
        const g = (x: number) => x * 2

        // Test with Some
        const someValue = some(5)
        expect(map(map(someValue, f), g)).toEqual(map(someValue, (x) => g(f(x))))

        // Test with None
        const noneValue = none<number>()
        expect(map(map(noneValue, f), g)).toEqual(map(noneValue, (x) => g(f(x))))

        // Test with more complex functions
        const h = (x: number) => String(x)
        const i = (x: string) => x.length
        const composed = (x: number) => i(h(x))

        expect(map(map(some(123), h), i)).toEqual(map(some(123), composed))
      })
    })
  })

  describe('Monad Laws', () => {
    describe('Left Identity Law', () => {
      it('flatMap(some(a), f) = f(a)', () => {
        const f = (x: number) => some(x * 2)
        const value = 5

        expect(flatMap(some(value), f)).toEqual(f(value))

        // Test with None-returning function
        const g = (x: number) => (x > 10 ? some(x) : none())
        expect(flatMap(some(5), g)).toEqual(g(5))
        expect(flatMap(some(15), g)).toEqual(g(15))
      })
    })

    describe('Right Identity Law', () => {
      it('flatMap(option, some) = option', () => {
        // Test with Some
        const someValue = some(42)
        expect(flatMap(someValue, some)).toEqual(someValue)

        // Test with None
        const noneValue = none<number>()
        expect(flatMap(noneValue, some)).toEqual(noneValue)

        // Test with different types
        expect(flatMap(some('hello'), some)).toEqual(some('hello'))
      })
    })

    describe('Associativity Law', () => {
      it('flatMap(flatMap(option, f), g) = flatMap(option, x => flatMap(f(x), g))', () => {
        const f = (x: number) => some(x + 1)
        const g = (x: number) => some(x * 2)

        // Test with Some
        const someValue = some(5)
        expect(flatMap(flatMap(someValue, f), g)).toEqual(
          flatMap(someValue, (x) => flatMap(f(x), g))
        )

        // Test with None
        const noneValue = none<number>()
        expect(flatMap(flatMap(noneValue, f), g)).toEqual(
          flatMap(noneValue, (x) => flatMap(f(x), g))
        )

        // Test with functions that can return None
        const h = (x: number) => (x > 10 ? some(x) : none())
        const i = (x: number) => (x % 2 === 0 ? some(x / 2) : none())

        expect(flatMap(flatMap(some(20), h), i)).toEqual(
          flatMap(some(20), (x) => flatMap(h(x), i))
        )

        expect(flatMap(flatMap(some(5), h), i)).toEqual(flatMap(some(5), (x) => flatMap(h(x), i)))
      })
    })
  })

  describe('Relationship between map and flatMap', () => {
    it('map(option, f) = flatMap(option, x => some(f(x)))', () => {
      const f = (x: number) => x * 2

      // Test with Some
      const someValue = some(5)
      expect(map(someValue, f)).toEqual(flatMap(someValue, (x) => some(f(x))))

      // Test with None
      const noneValue = none<number>()
      expect(map(noneValue, f)).toEqual(flatMap(noneValue, (x) => some(f(x))))

      // Test with type-changing function
      const g = (x: number) => String(x)
      expect(map(some(42), g)).toEqual(flatMap(some(42), (x) => some(g(x))))
    })
  })

  describe('None as zero element', () => {
    it('flatMap(none(), f) = none()', () => {
      const f = (x: number) => some(x * 2)
      const noneValue = none<number>()

      expect(flatMap(noneValue, f)).toEqual(none())
    })

    it('map(none(), f) = none()', () => {
      const f = (x: number) => x * 2
      const noneValue = none<number>()

      expect(map(noneValue, f)).toEqual(none())
    })
  })

  describe('Edge cases and invariants', () => {
    it('maintains referential transparency', () => {
      const f = (x: number) => x * 2
      const option = some(5)

      const result1 = map(option, f)
      const result2 = map(option, f)

      expect(result1).toEqual(result2)
    })

    it('None is None regardless of type parameter', () => {
      const none1 = none<number>()
      const none2 = none<string>()
      const none3 = none<{ name: string }>()

      expect(none1._tag).toBe('None')
      expect(none2._tag).toBe('None')
      expect(none3._tag).toBe('None')
    })

    it('transformations preserve Some-ness or None-ness', () => {
      const f = (x: number) => x * 2
      const g = (x: number) => some(x + 1)

      // Some stays Some (unless flatMap returns None)
      expect(map(some(5), f)._tag).toBe('Some')
      expect(flatMap(some(5), g)._tag).toBe('Some')

      // None stays None
      expect(map(none(), f)._tag).toBe('None')
      expect(flatMap(none(), g)._tag).toBe('None')
    })
  })
})

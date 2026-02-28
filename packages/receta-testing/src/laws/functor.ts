/**
 * Functor law testing utilities.
 *
 * Provides automated testing for functor laws:
 * 1. Identity: map(fa, x => x) === fa
 * 2. Composition: map(map(fa, f), g) === map(fa, x => g(f(x)))
 */

import { describe, it, expect } from 'vitest'
import type { FunctorLawConfig, FunctorTestCase } from './types'

/**
 * Default equality function using deep equality.
 */
function defaultEquals<F>(a: F, b: F): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Generate default test cases if none provided.
 */
function getDefaultTestCases<A>(baseValue: A): Array<FunctorTestCase<A>> {
  return [
    {
      value: baseValue,
      transforms: [
        (x: any) => x, // identity
        (x: any) => x, // identity again
      ],
    },
  ]
}

/**
 * Test that a functor implementation satisfies functor laws.
 *
 * This function generates test suites that verify:
 * - Identity law: `map(fa, x => x) === fa`
 * - Composition law: `map(map(fa, f), g) === map(fa, x => g(f(x)))`
 *
 * @example
 * ```typescript
 * import { testFunctorLaws } from 'receta-test/laws'
 * import { ok } from 'receta/result'
 * import * as Result from 'receta/result'
 *
 * describe('Result', () => {
 *   testFunctorLaws({
 *     type: 'Result',
 *     of: ok,
 *     map: Result.map,
 *     testCases: [
 *       { value: 5, transforms: [x => x * 2, x => x + 1] },
 *       { value: 'hello', transforms: [s => s.toUpperCase(), s => s.length] }
 *     ]
 *   })
 * })
 * ```
 *
 * @param config - Configuration specifying the functor and test cases
 */
export function testFunctorLaws<F, A>(config: FunctorLawConfig<F, A>): void {
  const { type, of, map, equals = defaultEquals, testCases } = config

  // Use provided test cases or generate default ones
  const cases = testCases && testCases.length > 0 ? testCases : getDefaultTestCases(null as A)

  describe(`${type} Functor Laws`, () => {
    describe('Identity Law: map(fa, x => x) === fa', () => {
      it('mapping with identity function returns the same value', () => {
        const identity = <T>(x: T): T => x

        for (const testCase of cases) {
          const fa = of(testCase.value)
          const mapped = map(fa, identity)

          const passed = equals(mapped, fa)
          if (!passed) {
            throw new Error(
              `Identity law violated for ${type}.\n` +
                `Expected: map(${JSON.stringify(fa)}, identity) === ${JSON.stringify(fa)}\n` +
                `Got: ${JSON.stringify(mapped)}`
            )
          }
        }
      })
    })

    describe('Composition Law: map(map(fa, f), g) === map(fa, x => g(f(x)))', () => {
      it('mapping twice equals mapping with composed function', () => {
        for (const testCase of cases) {
          const transforms = testCase.transforms || [
            (x: any) => x,
            (x: any) => x,
          ]

          // Need at least 2 transforms for composition
          if (transforms.length < 2) {
            continue
          }

          const f = transforms[0]
          const g = transforms[1]

          if (!f || !g) continue

          const fa = of(testCase.value)

          // Sequential: map(map(fa, f), g)
          const sequential = map(map(fa, f as any), g as any)

          // Composed: map(fa, x => g(f(x)))
          const composed = map(fa, ((x: any) => g(f(x))) as any)

          const passed = equals(sequential, composed)
          if (!passed) {
            throw new Error(
              `Composition law violated for ${type}.\n` +
                `Expected: map(map(fa, f), g) === map(fa, x => g(f(x)))\n` +
                `Sequential result: ${JSON.stringify(sequential)}\n` +
                `Composed result: ${JSON.stringify(composed)}`
            )
          }
        }
      })
    })

    describe('Functor preserves structure', () => {
      it('map does not change the functor shape', () => {
        for (const testCase of cases) {
          const fa = of(testCase.value)
          const mapped = map(fa, (x: any) => x)

          // Both should have same structure (tags, etc.)
          const faTag = (fa as any)._tag
          const mappedTag = (mapped as any)._tag

          if (faTag !== undefined && mappedTag !== undefined) {
            expect(mappedTag).toBe(faTag)
          }
        }
      })
    })
  })
}

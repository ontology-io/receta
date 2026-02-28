/**
 * Monad law testing utilities.
 *
 * Provides automated testing for monad laws:
 * 1. Left Identity: flatMap(of(a), f) === f(a)
 * 2. Right Identity: flatMap(ma, of) === ma
 * 3. Associativity: flatMap(flatMap(ma, f), g) === flatMap(ma, x => flatMap(f(x), g))
 */

import { describe, it, expect } from 'vitest'
import type { MonadLawConfig, MonadTestCase } from './types'

/**
 * Default equality function using deep equality.
 */
function defaultEquals<M>(a: M, b: M): boolean {
  return JSON.stringify(a) === JSON.stringify(b)
}

/**
 * Generate default test cases if none provided.
 */
function getDefaultTestCases<M, A>(of: (a: A) => M, baseValue: A): Array<MonadTestCase<M, A>> {
  return [
    {
      value: baseValue,
      functions: [of], // Just use 'of' as default function
    },
  ]
}

/**
 * Test that a monad implementation satisfies monad laws.
 *
 * This function generates test suites that verify:
 * - Left Identity: `flatMap(of(a), f) === f(a)`
 * - Right Identity: `flatMap(ma, of) === ma`
 * - Associativity: `flatMap(flatMap(ma, f), g) === flatMap(ma, x => flatMap(f(x), g))`
 *
 * @example
 * ```typescript
 * import { testMonadLaws } from 'receta-test/laws'
 * import { ok, err } from 'receta/result'
 * import * as Result from 'receta/result'
 *
 * describe('Result', () => {
 *   testMonadLaws({
 *     type: 'Result',
 *     of: ok,
 *     flatMap: Result.flatMap,
 *     testCases: [
 *       {
 *         value: 5,
 *         functions: [
 *           (x: number) => ok(x * 2),
 *           (x: number) => x > 0 ? ok(x) : err('negative')
 *         ]
 *       }
 *     ]
 *   })
 * })
 * ```
 *
 * @param config - Configuration specifying the monad and test cases
 */
export function testMonadLaws<M, A>(config: MonadLawConfig<M, A>): void {
  const { type, of, flatMap, equals = defaultEquals, testCases } = config

  // Use provided test cases or generate default ones
  const cases =
    testCases && testCases.length > 0 ? testCases : getDefaultTestCases(of, null as A)

  describe(`${type} Monad Laws`, () => {
    describe('Left Identity Law: flatMap(of(a), f) === f(a)', () => {
      it('wrapping a value and flat-mapping is the same as applying the function', () => {
        for (const testCase of cases) {
          const functions = testCase.functions || [of]

          for (const f of functions) {
            const wrapped = of(testCase.value)
            const viaFlatMap = flatMap(wrapped, f as any)
            const direct = f(testCase.value)

            const passed = equals(viaFlatMap, direct)
            if (!passed) {
              throw new Error(
                `Left Identity law violated for ${type}.\n` +
                  `Expected: flatMap(of(${JSON.stringify(testCase.value)}), f) === f(${JSON.stringify(testCase.value)})\n` +
                  `Via flatMap: ${JSON.stringify(viaFlatMap)}\n` +
                  `Direct: ${JSON.stringify(direct)}`
              )
            }
          }
        }
      })
    })

    describe('Right Identity Law: flatMap(ma, of) === ma', () => {
      it('flat-mapping with of returns the same monad', () => {
        for (const testCase of cases) {
          const ma = of(testCase.value)
          const mapped = flatMap(ma, of as any)

          const passed = equals(mapped, ma)
          if (!passed) {
            throw new Error(
              `Right Identity law violated for ${type}.\n` +
                `Expected: flatMap(ma, of) === ma\n` +
                `Original: ${JSON.stringify(ma)}\n` +
                `After flatMap: ${JSON.stringify(mapped)}`
            )
          }
        }
      })
    })

    describe('Associativity Law: flatMap(flatMap(ma, f), g) === flatMap(ma, x => flatMap(f(x), g))', () => {
      it('chaining flat-maps is associative', () => {
        for (const testCase of cases) {
          const functions = testCase.functions || [of]

          // Need at least 2 functions for associativity
          if (functions.length < 2) {
            continue
          }

          const f = functions[0]
          const g = functions[1]

          if (!f || !g) continue

          const ma = of(testCase.value)

          // Left associative: flatMap(flatMap(ma, f), g)
          const leftAssoc = flatMap(flatMap(ma, f as any), g as any)

          // Right associative: flatMap(ma, x => flatMap(f(x), g))
          const rightAssoc = flatMap(ma, ((x: any) => flatMap(f(x), g as any)) as any)

          const passed = equals(leftAssoc, rightAssoc)
          if (!passed) {
            throw new Error(
              `Associativity law violated for ${type}.\n` +
                `Expected: flatMap(flatMap(ma, f), g) === flatMap(ma, x => flatMap(f(x), g))\n` +
                `Left associative: ${JSON.stringify(leftAssoc)}\n` +
                `Right associative: ${JSON.stringify(rightAssoc)}`
            )
          }
        }
      })
    })

    describe('Monad preserves structure', () => {
      it('flatMap does not change the monad type', () => {
        for (const testCase of cases) {
          const ma = of(testCase.value)
          const mapped = flatMap(ma, of as any)

          // Both should have same structure (tags, etc.)
          const maTag = (ma as any)._tag
          const mappedTag = (mapped as any)._tag

          if (maTag !== undefined && mappedTag !== undefined) {
            expect(mappedTag).toBe(maTag)
          }
        }
      })
    })
  })
}

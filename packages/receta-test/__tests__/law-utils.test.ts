/**
 * Example usage of law testing utilities.
 *
 * Law testing functions (testFunctorLaws, testMonadLaws) should be called
 * at the describe() level, NOT inside it() blocks.
 */

import { describe } from 'bun:test'
import { ok } from '../../../src/result'
import { some } from '../../../src/option'
import * as Result from '../../../src/result'
import * as Option from '../../../src/option'
import { testFunctorLaws } from '../src/laws/functor'
import { testMonadLaws } from '../src/laws/monad'

// ✅ CORRECT: Call at describe level
describe('Result Type Laws', () => {
  // This generates multiple describe() and it() blocks testing functor laws
  testFunctorLaws({
    type: 'Result',
    of: ok,
    map: Result.map,
    testCases: [
      { value: 5, transforms: [(x: number) => x * 2, (x: number) => x + 1] },
      { value: 'hello', transforms: [(s: string) => s.toUpperCase(), (s: string) => s.length] },
    ],
  })

  // This generates multiple describe() and it() blocks testing monad laws
  testMonadLaws({
    type: 'Result',
    of: ok,
    flatMap: Result.flatMap,
    testCases: [
      {
        value: 5,
        functions: [
          (x: number) => ok(x * 2),
          (x: number) => x > 0 ? ok(x) : ok(0),
        ],
      },
    ],
  })
})

describe('Option Type Laws', () => {
  testFunctorLaws({
    type: 'Option',
    of: some,
    map: Option.map,
    testCases: [
      { value: 10, transforms: [(x: number) => x * 3, (x: number) => x - 5] },
      { value: 'world', transforms: [(s: string) => s + '!', (s: string) => s.length] },
    ],
  })

  testMonadLaws({
    type: 'Option',
    of: some,
    flatMap: Option.flatMap,
    testCases: [
      {
        value: 10,
        functions: [
          (x: number) => some(x * 3),
          (x: number) => x > 5 ? some(x) : some(0),
        ],
      },
    ],
  })
})

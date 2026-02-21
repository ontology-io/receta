# Receta Testing Utilities

Test utilities for Receta's functional programming types — custom Vitest matchers, law testing, and property-based testing with fast-check.

## Installation

Testing utilities are included with Receta. For the full testing experience, also install peer dependencies:

```bash
npm install receta --save-dev
npm install vitest fast-check --save-dev
```

## Quick Start

```typescript
import { expect } from 'vitest'
import { recetaMatchers } from 'receta/testing'
import { ok, err } from 'receta/result'
import { some, none } from 'receta/option'

// Extend Vitest with Receta matchers
expect.extend(recetaMatchers)

describe('My tests', () => {
  it('works with Result types', () => {
    expect(ok(5)).toBeOk(5)
    expect(err('fail')).toBeErr('fail')
  })

  it('works with Option types', () => {
    expect(some(42)).toBeSome(42)
    expect(none()).toBeNone()
  })
})
```

## Matchers

### Result Matchers

#### `toBeOk(expectedValue?)`

Assert that a Result is Ok, optionally checking the value.

```typescript
import { ok, err } from 'receta/result'

expect(ok(5)).toBeOk()           // ✅ Pass
expect(ok(5)).toBeOk(5)          // ✅ Pass
expect(ok(5)).toBeOk(10)         // ❌ Fail
expect(err('fail')).not.toBeOk() // ✅ Pass
```

#### `toBeErr(expectedError?)`

Assert that a Result is Err, optionally checking the error.

```typescript
import { ok, err } from 'receta/result'

expect(err('fail')).toBeErr()         // ✅ Pass
expect(err('fail')).toBeErr('fail')   // ✅ Pass
expect(ok(5)).not.toBeErr()           // ✅ Pass
```

#### `toEqualResult(expected)`

Deep equality check for Result types.

```typescript
import { ok, err } from 'receta/result'

expect(ok(5)).toEqualResult(ok(5))              // ✅ Pass
expect(err('fail')).toEqualResult(err('fail'))  // ✅ Pass
expect(ok(5)).toEqualResult(ok(10))             // ❌ Fail
```

### Option Matchers

#### `toBeSome(expectedValue?)`

Assert that an Option is Some, optionally checking the value.

```typescript
import { some, none } from 'receta/option'

expect(some(5)).toBeSome()       // ✅ Pass
expect(some(5)).toBeSome(5)      // ✅ Pass
expect(none()).not.toBeSome()    // ✅ Pass
```

#### `toBeNone()`

Assert that an Option is None.

```typescript
import { some, none } from 'receta/option'

expect(none()).toBeNone()        // ✅ Pass
expect(some(5)).not.toBeNone()   // ✅ Pass
```

#### `toEqualOption(expected)`

Deep equality check for Option types.

```typescript
import { some, none } from 'receta/option'

expect(some(5)).toEqualOption(some(5))   // ✅ Pass
expect(none()).toEqualOption(none())     // ✅ Pass
expect(some(5)).toEqualOption(none())    // ❌ Fail
```

## Law Testing

Automatically verify functor and monad laws for your custom types:

```typescript
import { testFunctorLaws, testMonadLaws } from 'receta/testing/laws'
import { ok } from 'receta/result'
import * as Result from 'receta/result'

describe('Result Type Laws', () => {
  testFunctorLaws({
    type: 'Result',
    of: ok,
    map: Result.map,
    testCases: [
      {
        value: 5,
        transforms: [(x: number) => x * 2, (x: number) => x + 1]
      }
    ]
  })

  testMonadLaws({
    type: 'Result',
    of: ok,
    flatMap: Result.flatMap,
    testCases: [
      {
        value: 5,
        transforms: [(x: number) => ok(x * 2), (x: number) => ok(x + 1)]
      }
    ]
  })
})
```

## Property-Based Testing

Generate random test data for exhaustive testing with fast-check:

```typescript
import * as fc from 'fast-check'
import { result, option } from 'receta/testing/arbitraries'
import * as Result from 'receta/result'

// Test with 100 random Result values
fc.assert(
  fc.property(result(fc.integer(), fc.string()), (r) => {
    // Identity law: map(r, x => x) === r
    expect(Result.map(r, x => x)).toEqualResult(r)
  })
)

// Test with weighted distribution (90% Ok, 10% Err)
fc.assert(
  fc.property(
    result(fc.integer(), fc.string(), { okWeight: 0.9 }),
    (r) => {
      // Your property test here
    }
  )
)

// Test Option values
fc.assert(
  fc.property(option(fc.string()), (opt) => {
    // Option laws and properties
  })
)
```

### Available Arbitraries

- `result(okArb, errArb, config?)` - Generate random Result values
- `okResult(valueArb)` - Generate only Ok results
- `errResult(errorArb)` - Generate only Err results
- `option(valueArb, config?)` - Generate random Option values
- `someValue(valueArb)` - Generate only Some values
- `noneValue()` - Generate only None values

Configuration options:
- `okWeight` (0-1): Probability of generating Ok vs Err (default: 0.5)
- `someWeight` (0-1): Probability of generating Some vs None (default: 0.5)

## Selective Imports

Import only what you need:

```typescript
// Just matchers
import { resultMatchers } from 'receta/testing/matchers'
expect.extend(resultMatchers)

// Just laws
import { testFunctorLaws } from 'receta/testing/laws'

// Just arbitraries
import { result } from 'receta/testing/arbitraries'
```

## Examples

### Testing API Responses

```typescript
import { ok, err, tryCatchAsync } from 'receta/result'

describe('fetchUser', () => {
  it('returns Ok for valid user', async () => {
    const result = await tryCatchAsync(() => fetchUser('123'))
    expect(result).toBeOk({ id: '123', name: 'John' })
  })

  it('returns Err for network errors', async () => {
    const result = await tryCatchAsync(() => fetchUser('invalid'))
    expect(result).toBeErr()
  })
})
```

### Testing Parsers

```typescript
import { parseJSON } from 'receta/result'

describe('parseJSON', () => {
  it('parses valid JSON', () => {
    expect(parseJSON('{"name":"John"}')).toBeOk({ name: 'John' })
  })

  it('returns Err for invalid JSON', () => {
    expect(parseJSON('invalid')).toBeErr()
  })
})
```

### Testing with Property-Based Testing

```typescript
import * as fc from 'fast-check'
import { result } from 'receta/testing/arbitraries'
import * as Result from 'receta/result'

describe('Result.map', () => {
  it('satisfies functor identity law', () => {
    fc.assert(
      fc.property(result(fc.integer(), fc.string()), (r) => {
        const identity = <T>(x: T) => x
        expect(Result.map(r, identity)).toEqualResult(r)
      })
    )
  })

  it('satisfies functor composition law', () => {
    fc.assert(
      fc.property(
        result(fc.integer(), fc.string()),
        fc.func(fc.integer()),
        fc.func(fc.integer()),
        (r, f, g) => {
          const composed = Result.map(Result.map(r, f), g)
          const direct = Result.map(r, (x) => g(f(x)))
          expect(composed).toEqualResult(direct)
        }
      )
    )
  })
})
```

## TypeScript Support

All utilities are fully typed and integrate with Vitest's type system:

```typescript
import type { Result } from 'receta/result'

const result: Result<number, string> = ok(5)

// TypeScript knows these are valid
expect(result).toBeOk()
expect(result).toBeOk(5)
expect(result).not.toBeErr()
```

## Related

- [Result module](../result/README.md) - Error handling with Result<T, E>
- [Option module](../option/README.md) - Nullable handling with Option<T>
- [Vitest documentation](https://vitest.dev) - Testing framework
- [fast-check documentation](https://fast-check.dev) - Property-based testing

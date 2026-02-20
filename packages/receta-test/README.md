# receta-test

Test utilities for [Receta](https://github.com/khaledmaher/receta) — ontologically-sound matchers, law testing, and property-based testing for functional programming.

## Installation

```bash
npm install --save-dev receta-test
# or
bun add --dev receta-test
```

## Quick Start

```typescript
import { expect } from 'vitest'
import { recetaMatchers } from 'receta-test'
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

## Why receta-test?

### Before: Verbose and unclear
```typescript
import { ok, err } from 'receta/result'

// ❌ Verbose
expect(result).toEqual(ok(5))

// ❌ Unclear error messages
expect(result._tag).toBe('Ok')
expect(result.value).toBe(5)

// ❌ Error message: "Expected { _tag: 'Ok', value: 10 } to equal { _tag: 'Ok', value: 5 }"
```

### After: Clear and concise
```typescript
import { ok, err } from 'receta/result'

// ✅ Concise
expect(result).toBeOk(5)

// ✅ Clear error messages
// Error: "Expected Ok value to equal 5, but got 10"

// ✅ Better type safety
expect(result).toBeOk()        // Passes for any Ok
expect(result).toBeOk(5)       // Passes only if Ok(5)
expect(result).not.toBeErr()   // Passes if Ok
```

## API Reference

### Result Matchers

#### `toBeOk(expectedValue?)`

Assert that a Result is Ok, optionally checking the value.

```typescript
import { ok, err } from 'receta/result'

// Without expected value (just check tag)
expect(ok(5)).toBeOk()           // ✅ Pass
expect(err('fail')).not.toBeOk() // ✅ Pass

// With expected value (check tag and value)
expect(ok(5)).toBeOk(5)          // ✅ Pass
expect(ok(5)).toBeOk(10)         // ❌ Fail
expect(ok({ id: 1 })).toBeOk({ id: 1 }) // ✅ Pass (deep equality)
```

#### `toBeErr(expectedError?)`

Assert that a Result is Err, optionally checking the error.

```typescript
import { ok, err } from 'receta/result'

// Without expected error (just check tag)
expect(err('fail')).toBeErr()    // ✅ Pass
expect(ok(5)).not.toBeErr()      // ✅ Pass

// With expected error (check tag and error)
expect(err('fail')).toBeErr('fail')  // ✅ Pass
expect(err(404)).toBeErr(404)        // ✅ Pass
expect(err({ code: 'ERR' })).toBeErr({ code: 'ERR' }) // ✅ Pass
```

#### `toEqualResult(expected)`

Deep equality check for Result types.

```typescript
import { ok, err } from 'receta/result'

expect(ok(5)).toEqualResult(ok(5))           // ✅ Pass
expect(err('fail')).toEqualResult(err('fail')) // ✅ Pass
expect(ok(5)).toEqualResult(err('fail'))     // ❌ Fail
expect(ok(5)).toEqualResult(ok(10))          // ❌ Fail
```

### Option Matchers

#### `toBeSome(expectedValue?)`

Assert that an Option is Some, optionally checking the value.

```typescript
import { some, none } from 'receta/option'

// Without expected value (just check tag)
expect(some(5)).toBeSome()       // ✅ Pass
expect(none()).not.toBeSome()    // ✅ Pass

// With expected value (check tag and value)
expect(some(5)).toBeSome(5)      // ✅ Pass
expect(some(5)).toBeSome(10)     // ❌ Fail
expect(some({ id: 1 })).toBeSome({ id: 1 }) // ✅ Pass (deep equality)
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
expect(some(5)).toEqualOption(some(10))  // ❌ Fail
```

## Real-World Examples

### Testing API Responses

```typescript
import { ok, err } from 'receta/result'
import { tryCatchAsync } from 'receta/result'

describe('fetchUser', () => {
  it('returns Ok for valid user', async () => {
    const result = await tryCatchAsync(() => fetchUser('123'))

    expect(result).toBeOk()
    expect(result).toBeOk({ id: '123', name: 'John' })
  })

  it('returns Err for network errors', async () => {
    const result = await tryCatchAsync(() => fetchUser('invalid'))

    expect(result).toBeErr()
    expect(result).not.toBeOk()
  })
})
```

### Testing Parsers

```typescript
import { ok, err } from 'receta/result'

function parseJSON<T>(str: string) {
  try {
    return ok(JSON.parse(str) as T)
  } catch (e) {
    return err(e as SyntaxError)
  }
}

describe('parseJSON', () => {
  it('parses valid JSON', () => {
    expect(parseJSON('{"name":"John"}')).toBeOk({ name: 'John' })
  })

  it('returns Err for invalid JSON', () => {
    const result = parseJSON('invalid')
    expect(result).toBeErr()
    expect(result).not.toBeOk()
  })
})
```

### Testing Optional Values

```typescript
import { some, none, fromNullable } from 'receta/option'

function findUser(id: number) {
  const users = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }]
  return fromNullable(users.find(u => u.id === id))
}

describe('findUser', () => {
  it('returns Some when user exists', () => {
    expect(findUser(1)).toBeSome({ id: 1, name: 'John' })
  })

  it('returns None when user does not exist', () => {
    expect(findUser(999)).toBeNone()
  })
})
```

### Testing Validation Logic

```typescript
import { ok, err } from 'receta/result'
import { where, gt, lt } from 'receta/predicate'

function validateAge(age: number) {
  return age >= 18 && age <= 120
    ? ok(age)
    : err({ code: 'INVALID_AGE', value: age })
}

describe('validateAge', () => {
  it('accepts valid ages', () => {
    expect(validateAge(25)).toBeOk(25)
    expect(validateAge(18)).toBeOk(18)
    expect(validateAge(120)).toBeOk(120)
  })

  it('rejects invalid ages', () => {
    expect(validateAge(17)).toBeErr({ code: 'INVALID_AGE', value: 17 })
    expect(validateAge(121)).toBeErr({ code: 'INVALID_AGE', value: 121 })
  })
})
```

## Selective Matcher Import

You can import only the matchers you need:

```typescript
import { expect } from 'vitest'
import { resultMatchers } from 'receta-test/matchers'

// Only extend with Result matchers
expect.extend(resultMatchers)
```

```typescript
import { expect } from 'vitest'
import { optionMatchers } from 'receta-test/matchers'

// Only extend with Option matchers
expect.extend(optionMatchers)
```

```typescript
import { expect } from 'vitest'
import { toBeOk, toBeErr } from 'receta-test/matchers'

// Import individual matchers
expect.extend({ toBeOk, toBeErr })
```

## TypeScript Support

All matchers are fully typed and integrate with Vitest's type system:

```typescript
import { expect } from 'vitest'
import { recetaMatchers } from 'receta-test'
import { ok, err } from 'receta/result'

expect.extend(recetaMatchers)

const result: Result<number, string> = ok(5)

// TypeScript knows these are valid
expect(result).toBeOk()
expect(result).toBeOk(5)
expect(result).not.toBeErr()

// TypeScript provides autocomplete for matcher methods
expect(result).to // <-- Autocomplete shows toBeOk, toBeErr, toEqualResult, etc.
```

## Migration Guide

### From vanilla Vitest assertions

**Before:**
```typescript
expect(result).toEqual(ok(5))
expect(result._tag).toBe('Ok')
if (result._tag === 'Ok') {
  expect(result.value).toBe(5)
}
```

**After:**
```typescript
expect(result).toBeOk(5)
```

### From generic object matchers

**Before:**
```typescript
expect(option).toMatchObject({ _tag: 'Some', value: 5 })
```

**After:**
```typescript
expect(option).toBeSome(5)
```

## Error Messages

receta-test provides clear, actionable error messages:

```typescript
// Instead of:
// "Expected { _tag: 'Ok', value: 10 } to equal { _tag: 'Ok', value: 5 }"

// You get:
// "Expected Ok value to equal 5, but got 10"

// Instead of:
// "Expected { _tag: 'Some', value: 'hello' } to equal { _tag: 'None' }"

// You get:
// "Expected Option tags to match, but got Some and None"
```

## Roadmap

This package currently implements **Phase 1 (P0): Core Matchers**. Future phases include:

### Phase 2 (P1): Law Testing
- `testFunctorLaws({ of, map, arbitrary })` - Automated functor law verification
- `testMonadLaws({ of, flatMap, arbitrary })` - Automated monad law verification

### Phase 3 (P2): Fast-check Arbitraries
- `fc.result(okArb, errArb)` - Generate random Result values
- `fc.option(valueArb)` - Generate random Option values
- `fc.asyncResult(okArb, errArb)` - Generate async Results

## Contributing

Contributions are welcome! See the [main Receta repository](https://github.com/khaledmaher/receta) for contribution guidelines.

## License

MIT © Khaled Maher

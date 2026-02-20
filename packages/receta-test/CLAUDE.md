# CLAUDE.md - receta-test

This file provides guidance for working with the receta-test package.

## Package Purpose

**receta-test** provides ontologically-sound test utilities for Receta, including:

1. **Custom Vitest Matchers** - Better assertions for Result and Option types
2. **Law Testing** (Future) - Automated functor/monad law verification
3. **Property-Based Testing** (Future) - Fast-check arbitraries for Receta types

## Current Implementation Status

✅ **Phase 1 (P0): Core Matchers** - COMPLETE
- Result matchers: `toBeOk`, `toBeErr`, `toEqualResult`
- Option matchers: `toBeSome`, `toBeNone`, `toEqualOption`
- Full test coverage
- TypeScript type declarations

🔲 **Phase 2 (P1): Law Testing** - NOT YET IMPLEMENTED
🔲 **Phase 3 (P2): Fast-check Arbitraries** - NOT YET IMPLEMENTED

## Design Principles

1. **Result-First**: Test utilities follow Receta's Result-first error handling
2. **Composable**: All utilities work with Remeda's pipe and composition patterns
3. **Type-Safe**: Full TypeScript support with proper type narrowing
4. **Ontologically Sound**: Map to Receta's function categories (constructors, guards, transformers, etc.)
5. **Zero Magic**: Explicit behavior, no hidden transformations or auto-generation
6. **Vitest Native**: Extend Vitest, don't replace it

## File Structure

```
packages/receta-test/
├── src/
│   ├── matchers/
│   │   ├── result.ts        # Result matchers implementation
│   │   ├── option.ts        # Option matchers implementation
│   │   └── index.ts         # Matcher exports
│   ├── laws/                # Law testing (future)
│   ├── arbitraries/         # Fast-check generators (future)
│   ├── builders/            # Test data builders (future)
│   ├── types.ts             # TypeScript type declarations
│   └── index.ts             # Main export
├── __tests__/
│   ├── result-matchers.test.ts  # Result matcher tests
│   └── option-matchers.test.ts  # Option matcher tests
├── package.json
├── tsconfig.json
├── README.md
└── CLAUDE.md
```

## Development Workflow

### Running Tests

```bash
cd packages/receta-test
bun test                 # Run all tests
bun test --watch         # Watch mode
bun run typecheck        # Type checking
bun run build            # Build package
```

### Adding New Matchers

When adding a new matcher:

1. **Create matcher function** in appropriate file (e.g., `src/matchers/validation.ts`)
2. **Follow naming convention**:
   - `toBe*` for tag checks (e.g., `toBeValid`, `toBeInvalid`)
   - `toEqual*` for deep equality (e.g., `toEqualValidation`)
3. **Implement both positive and negative assertions**
4. **Add TypeScript declarations** in `src/types.ts`
5. **Write comprehensive tests** in `__tests__/`
6. **Export from matcher module** and main index

### Matcher Implementation Pattern

```typescript
import type { MatcherFunction } from 'vitest'

export const toBeMyType: MatcherFunction = function (received: unknown, expectedValue?: unknown) {
  const { isNot } = this

  // 1. Type guard check
  if (!isMyTypeLike(received)) {
    return {
      pass: false,
      message: () => `Expected value to be MyType, but got ${typeof received}`,
    }
  }

  // 2. Tag check (without expected value)
  if (arguments.length === 1) {
    const isCorrectTag = received._tag === 'MyTag'
    return {
      pass: isCorrectTag,
      message: () => isNot
        ? `Expected not to be MyTag`
        : `Expected to be MyTag, but got ${received._tag}`,
    }
  }

  // 3. Value equality check (with expected value)
  const actualValue = 'value' in received ? received.value : undefined
  const valuesMatch = this.equals(actualValue, expectedValue)

  return {
    pass: valuesMatch,
    message: () => isNot
      ? `Expected value not to equal ${JSON.stringify(expectedValue)}`
      : `Expected value to equal ${JSON.stringify(expectedValue)}, but got ${JSON.stringify(actualValue)}`,
  }
}
```

## Testing Philosophy

### Test Coverage Requirements

- ✅ All matchers must have 100% test coverage
- ✅ Test both positive and negative assertions
- ✅ Test with and without expected values
- ✅ Test error messages
- ✅ Test edge cases (falsy values, nested structures, etc.)
- ✅ Test integration with real Receta operations

### Test Organization

Each matcher test file should include:

1. **Basic functionality** - Does it work?
2. **With/without expected values** - Both calling patterns
3. **Positive and negative assertions** - `.toBe*()` and `.not.toBe*()`
4. **Edge cases** - Falsy values, complex types, type mismatches
5. **Integration tests** - Real-world usage with Receta operations
6. **Error messages** - Clear, actionable error messages

## Common Patterns

### Type Guard Helper

```typescript
function isMyTypeLike(value: unknown): value is { _tag: 'MyTag' | 'OtherTag' } {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_tag' in value &&
    (value._tag === 'MyTag' || value._tag === 'OtherTag')
  )
}
```

### Error Message Formatting

```typescript
// ✅ GOOD: Specific, actionable
`Expected Ok value to equal 5, but got 10`

// ❌ BAD: Generic, unclear
`Assertion failed`

// ✅ GOOD: Include actual values
`Expected Some with value ${JSON.stringify(expected)}, but got None`

// ✅ GOOD: Show path for nested failures
`Expected Results to be equal, but Ok contents differ:\nReceived: {...}\nExpected: {...}`
```

## TypeScript Integration

### Type Declaration Pattern

```typescript
// In src/types.ts
export interface MyTypeMatchers<R = unknown> {
  /**
   * JSDoc with examples
   */
  toBeMyType<T>(expectedValue?: T): R
}

// Augment Vitest
declare module 'vitest' {
  interface Assertion<T = any> extends MyTypeMatchers {}
  interface AsymmetricMatchersContaining extends MyTypeMatchers {}
}
```

## Future Phases

### Phase 2: Law Testing

Will provide declarative law testing:

```typescript
// Example (not yet implemented)
import { testFunctorLaws } from 'receta-test/laws'

testFunctorLaws({
  type: 'Result',
  of: ok,
  map: Result.map,
  arbitrary: fc.integer()
})
```

### Phase 3: Fast-check Arbitraries

Will provide property-based testing generators:

```typescript
// Example (not yet implemented)
import * as fc from 'fast-check'
import { result, option } from 'receta-test/arbitraries'

fc.assert(
  fc.property(result(fc.integer(), fc.string()), (r) => {
    // Property tests
  })
)
```

## Important Notes

- **Only implement matchers** - Don't create a full test framework
- **Extend Vitest** - Don't replace or wrap it
- **Follow Receta conventions** - Result-first, composable, type-safe
- **No magic** - Explicit, predictable behavior
- **Clear error messages** - Always prioritize developer experience

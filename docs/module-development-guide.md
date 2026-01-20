# Module Development Guide

> Complete workflow for implementing Receta modules from scratch to production-ready documentation.

This guide documents the proven process used to build the Result module, which can be replicated for all future Receta modules (Option, Async, Validation, etc.).

---

## Table of Contents

1. [Overview](#overview)
2. [Phase 1: Project Setup](#phase-1-project-setup)
3. [Phase 2: Core Implementation](#phase-2-core-implementation)
4. [Phase 3: Test Suite](#phase-3-test-suite)
5. [Phase 4: Examples](#phase-4-examples)
6. [Phase 5: Documentation](#phase-5-documentation)
7. [Phase 6: Git Workflow](#phase-6-git-workflow)
8. [Quality Checklist](#quality-checklist)
9. [Templates](#templates)

---

## Overview

### Development Principles

1. **Implementation First**: Write code before docs (docs reflect reality)
2. **Test Everything**: 100% coverage with property-based tests
3. **Real-World Inspiration**: Examples from Stripe, GitHub, AWS, etc.
4. **Beginner-Friendly**: Assume no FP background
5. **Production-Ready**: Code and docs ready for real projects

### Timeline for a Module

- **Phase 1-2**: Implementation + Tests (2-4 hours)
- **Phase 3**: Examples (30 mins)
- **Phase 4**: Documentation (3-4 hours)
- **Phase 5**: Git workflow (15 mins)
- **Total**: ~6-9 hours for a complete module

---

## Phase 1: Project Setup

### Step 1.1: Initialize Package (if new project)

**Skip if already done for Result module**

```bash
# Create package.json
bun init

# Install dependencies
bun add remeda
bun add -d typescript @types/bun
```

**File**: `package.json`
```json
{
  "name": "receta",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "test": "bun test",
    "test:watch": "bun test --watch",
    "typecheck": "tsc --noEmit"
  },
  "dependencies": {
    "remeda": "^2.19.1"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "typescript": "^5.7.3"
  }
}
```

### Step 1.2: TypeScript Configuration

**File**: `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "outDir": "dist",
    "rootDir": "src"
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

### Step 1.3: Git Initialization

```bash
# Initialize git
git init

# Create feature branch
git checkout -b <module-name>-module-implementation
```

**File**: `.gitignore`
```
node_modules/
dist/
.env
.DS_Store
*.log
```

### Step 1.4: Create Todo List

Use TodoWrite to track all tasks. Example for a new module:

```typescript
[
  { content: "Initialize package.json", status: "completed", activeForm: "..." },
  { content: "Create type definitions", status: "in_progress", activeForm: "..." },
  { content: "Implement constructors", status: "pending", activeForm: "..." },
  // ... etc
]
```

---

## Phase 2: Core Implementation

### Step 2.1: Create Module Directory

```bash
mkdir -p src/<module-name>
```

### Step 2.2: Define Types

**File**: `src/<module-name>/types.ts`

**Pattern to follow:**
```typescript
/**
 * Brief description of the type.
 */
export interface TypeName<T> {
  readonly _tag: 'TagName'
  readonly value: T
}

/**
 * Main type - union of variants.
 *
 * @typeParam T - The type of the value
 *
 * @example
 * ```typescript
 * type MyType = SomeVariant<string>
 * ```
 */
export type MainType<T> = Variant1<T> | Variant2<T>
```

**Key principles:**
- Use branded types (`_tag`) for discriminated unions
- Make all fields `readonly`
- Include JSDoc with examples
- Keep types minimal and focused

### Step 2.3: Implement Constructors

**File**: `src/<module-name>/constructors.ts`

**Pattern to follow:**
```typescript
import type { MainType } from './types'

/**
 * Creates a [Variant] containing a value.
 *
 * @param value - The value to wrap
 * @returns A [Variant] containing the value
 *
 * @example
 * ```typescript
 * const result = constructor(42)
 * // => { _tag: 'Variant', value: 42 }
 * ```
 */
export function constructor<T>(value: T): VariantType<T> {
  return { _tag: 'Variant', value }
}

/**
 * Wraps a potentially throwing function.
 *
 * @param fn - Function that may throw
 * @returns Result containing either the return value or the error
 *
 * @example
 * ```typescript
 * const result = tryCatch(() => JSON.parse(str))
 * ```
 */
export function tryCatch<T>(fn: () => T): MainType<T, unknown>
export function tryCatch<T, E>(fn: () => T, mapError: (error: unknown) => E): MainType<T, E>
export function tryCatch<T, E = unknown>(
  fn: () => T,
  mapError?: (error: unknown) => E
): MainType<T, E | unknown> {
  try {
    return variant1(fn())
  } catch (error) {
    return variant2(mapError ? mapError(error) : error)
  }
}
```

**Checklist:**
- [ ] Simple constructors first (`ok`, `some`, etc.)
- [ ] `tryCatch` pattern for exception safety
- [ ] Async variants if needed (`tryCatchAsync`)
- [ ] Full JSDoc with examples
- [ ] Support both data-first and data-last with `purry`

### Step 2.4: Implement Type Guards

**File**: `src/<module-name>/guards.ts`

```typescript
import type { MainType, Variant1, Variant2 } from './types'

/**
 * Type guard to check if value is Variant1.
 *
 * Narrows the type to Variant1<T>.
 *
 * @param value - The value to check
 * @returns True if the value is Variant1
 *
 * @example
 * ```typescript
 * if (isVariant1(value)) {
 *   console.log(value.field) // TypeScript knows this is safe
 * }
 * ```
 */
export function isVariant1<T, E>(value: MainType<T, E>): value is Variant1<T> {
  return value._tag === 'Variant1'
}
```

### Step 2.5: Implement Transformers

**Files**: `src/<module-name>/map.ts`, `flatMap.ts`, etc.

**Pattern to follow (using Remeda's purry):**

```typescript
import * as R from 'remeda'
import type { MainType } from './types'
import { isVariant1 } from './guards'
import { variant1 } from './constructors'

/**
 * Maps over the value.
 *
 * If the value is Variant1, applies the function.
 * If the value is Variant2, returns it unchanged.
 *
 * @param value - The value to map over
 * @param fn - Function to transform the value
 * @returns A new value with the transformed result
 *
 * @example
 * ```typescript
 * // Data-first
 * map(variant1(5), x => x * 2) // => Variant1(10)
 *
 * // Data-last (in pipe)
 * pipe(
 *   variant1(5),
 *   map(x => x * 2)
 * ) // => Variant1(10)
 * ```
 *
 * @see mapVariant2 - for transforming the other variant
 * @see flatMap - for chaining operations
 */
export function map<T, U, E>(value: MainType<T, E>, fn: (val: T) => U): MainType<U, E>
export function map<T, U>(fn: (val: T) => U): <E>(value: MainType<T, E>) => MainType<U, E>
export function map(...args: unknown[]): unknown {
  return R.purry(mapImplementation, args)
}

function mapImplementation<T, U, E>(value: MainType<T, E>, fn: (val: T) => U): MainType<U, E> {
  return isVariant1(value) ? variant1(fn(value.value)) : value
}
```

**Checklist for each transformer:**
- [ ] Data-first signature
- [ ] Data-last signature (for pipe)
- [ ] Use `R.purry` for dual signatures
- [ ] Separate implementation function
- [ ] Full JSDoc with both examples
- [ ] `@see` tags linking related functions

### Step 2.6: Implement Extractors

**Files**: `unwrap.ts`, `match.ts`, etc.

Follow same pattern as transformers but these typically don't need data-last variants if they're terminal operations.

### Step 2.7: Implement Combinators

**Files**: `collect.ts`, `partition.ts`, etc.

For functions that work with arrays of the main type.

### Step 2.8: Create Barrel Export

**File**: `src/<module-name>/index.ts`

```typescript
/**
 * [Module Name] module - [Brief description]
 *
 * @module module-name
 */

// Types
export type { MainType, Variant1, Variant2 } from './types'

// Constructors
export { constructor1, constructor2, tryCatch } from './constructors'

// Type guards
export { isVariant1, isVariant2 } from './guards'

// Transformers
export { map } from './map'
export { mapVariant2 } from './mapVariant2'
export { flatMap } from './flatMap'
export { flatten } from './flatten'

// Extractors
export { unwrap, unwrapOr, unwrapOrElse } from './unwrap'
export { match } from './match'

// Side effects
export { tap, tapVariant2 } from './tap'

// Combinators
export { collect } from './collect'
export { partition } from './partition'

// Conversions
export { fromNullable } from './fromNullable'
```

---

## Phase 3: Test Suite

### Step 3.1: Create Test Directory

```bash
mkdir -p src/<module-name>/__tests__
```

### Step 3.2: Write Unit Tests

**Pattern**: One test file per module, grouped by functionality.

**File**: `src/<module-name>/__tests__/constructors.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { constructor1, constructor2, tryCatch } from '../constructors'
import { isVariant1, isVariant2 } from '../guards'

describe('Module Constructors', () => {
  describe('constructor1', () => {
    it('creates variant1 with value', () => {
      const result = constructor1(42)
      expect(result._tag).toBe('Variant1')
      expect(result.value).toBe(42)
    })

    it('works with different types', () => {
      expect(constructor1('hello').value).toBe('hello')
      expect(constructor1(true).value).toBe(true)
      expect(constructor1({ name: 'John' }).value).toEqual({ name: 'John' })
    })
  })

  describe('tryCatch', () => {
    it('returns Variant1 when function succeeds', () => {
      const result = tryCatch(() => 42)
      expect(isVariant1(result)).toBe(true)
      if (isVariant1(result)) {
        expect(result.value).toBe(42)
      }
    })

    it('returns Variant2 when function throws', () => {
      const result = tryCatch(() => {
        throw new Error('fail')
      })
      expect(isVariant2(result)).toBe(true)
    })

    it('maps errors with custom mapper', () => {
      const result = tryCatch(
        () => {
          throw new Error('Original error')
        },
        (e) => `Caught: ${e}`
      )
      expect(isVariant2(result)).toBe(true)
      if (isVariant2(result)) {
        expect(result.error).toContain('Caught:')
      }
    })
  })
})
```

**Test file structure:**
- `constructors.test.ts` - Constructors and type guards
- `transformers.test.ts` - map, flatMap, flatten
- `extractors.test.ts` - unwrap, match, tap
- `combinators.test.ts` - collect, partition
- `laws.test.ts` - Property-based tests

### Step 3.3: Property-Based Tests (Laws)

**File**: `src/<module-name>/__tests__/laws.test.ts`

```typescript
import { describe, it, expect } from 'bun:test'
import { variant1, variant2 } from '../constructors'
import { map } from '../map'
import { flatMap } from '../flatMap'

/**
 * Property-based tests verifying the module satisfies mathematical laws.
 */
describe('Module Laws', () => {
  describe('Functor Laws', () => {
    it('satisfies identity law', () => {
      const identity = <T>(x: T) => x

      const value = variant1(42)
      expect(map(value, identity)).toEqual(value)
    })

    it('satisfies composition law', () => {
      const f = (x: number) => x + 1
      const g = (x: number) => x * 2

      const value = variant1(5)

      expect(map(map(value, f), g)).toEqual(map(value, x => g(f(x))))
    })
  })

  describe('Monad Laws', () => {
    it('satisfies left identity law', () => {
      const f = (x: number) => variant1(x * 2)
      const value = 5

      expect(flatMap(variant1(value), f)).toEqual(f(value))
    })

    it('satisfies right identity law', () => {
      const value = variant1(42)
      expect(flatMap(value, variant1)).toEqual(value)
    })

    it('satisfies associativity law', () => {
      const f = (x: number) => variant1(x + 1)
      const g = (x: number) => variant1(x * 2)
      const value = variant1(5)

      expect(flatMap(flatMap(value, f), g)).toEqual(
        flatMap(value, x => flatMap(f(x), g))
      )
    })
  })
})
```

### Step 3.4: Run Tests

```bash
# Run all tests
bun test

# Watch mode
bun test --watch

# Typecheck
bun run typecheck

# Build
bun run build
```

**Quality Gates:**
- ✅ All tests passing
- ✅ 90%+ code coverage
- ✅ No TypeScript errors
- ✅ Build succeeds

---

## Phase 4: Examples

### Step 4.1: Create Examples File

**File**: `examples/<module-name>-usage.ts`

```typescript
/**
 * [Module Name] Usage Examples
 *
 * Run with: bun run examples/<module-name>-usage.ts
 */

import * as R from 'remeda'
import {
  variant1,
  variant2,
  map,
  flatMap,
  match,
  collect,
  type MainType,
} from '../src/<module-name>'

// Example 1: Basic usage
console.log('=== Example 1: Basic Usage ===')

const simple = variant1(42)
const transformed = map(simple, x => x * 2)
console.log('Transformed:', transformed)

// Example 2: Chaining operations
console.log('\n=== Example 2: Chaining Operations ===')

const result = R.pipe(
  variant1(5),
  map(x => x + 1),
  flatMap(x => variant1(x * 2)),
  match({
    onVariant1: v => `Success: ${v}`,
    onVariant2: e => `Error: ${e}`
  })
)
console.log('Result:', result)

// Example 3: Real-world scenario (inspired by actual APIs)
console.log('\n=== Example 3: Real-World Scenario ===')

// ... 5-7 realistic examples from Stripe, GitHub, etc.
```

**Checklist:**
- [ ] 5-7 progressive examples
- [ ] Include basic usage
- [ ] Show pipe composition
- [ ] Real-world scenarios (API, forms, DB)
- [ ] Runnable with `bun run`
- [ ] Console output for verification

---

## Phase 5: Documentation

### Documentation Philosophy

1. **Real-world first**: Show WHY before HOW
2. **Examples from production**: Stripe, GitHub, AWS, Next.js
3. **Beginner-friendly**: No FP jargon
4. **Immediately useful**: Copy-paste recipes
5. **Well-organized**: Multiple entry points

### Step 5.1: Create Documentation Directory

```bash
mkdir -p docs/<module-name>
```

### Step 5.2: Write Overview (00-overview.md)

**Length**: ~500 lines

**Structure:**
```markdown
# [Module Name]: [One-line pitch]

> **TL;DR**: [2-sentence explanation]

## The Problem: [Hidden issue in traditional code]

### Real-World Example: [Stripe/GitHub/AWS problem]

[Code showing the problem with traditional approach]

### How Successful Products Handle This

**Stripe API** (actual response):
[Real API response showing the pattern]

**GitHub API** (actual response):
[Real API response showing the pattern]

## The Solution: [Module Type]

[Code showing the solution]

## Why [Module] Over [Alternative]?

### Problem 1: [Alternative] Doesn't Compose
### Problem 2: [Alternative] Loses Type Information
### Problem 3: [Alternative] Doesn't Work in Pipelines

## Real-World Use Cases

### 1. API Requests
### 2. Form Validation
### 3. Database Operations
### 4. Configuration Loading
### 5. Parsing

## Mental Model: [Visual analogy]

## When to Use [Module]

✅ **Use when:**
❌ **Don't use for:**

## What's Next?
```

### Step 5.3: Write Function Guides

Create one guide per category:

**01-constructors.md** (~350 lines)
- Overview table
- Each constructor with real-world examples
- Comparison table
- Common patterns

**02-transformers.md** (~430 lines)
- Each transformer with real-world examples
- When to use which
- Chaining patterns
- Cheat sheet

**03-extractors.md** (~480 lines)
- Each extractor with real-world examples
- When to use which
- Comparison table
- Antipatterns to avoid

**04-combinators.md** (~460 lines)
- Each combinator with real-world examples
- Combining combinators
- Comparison table

### Step 5.4: Write Patterns Guide (05-patterns.md)

**Length**: ~650 lines

**Structure:**
```markdown
# Common Patterns & Recipes

## Table of Contents

1. [API Integration](#api-integration)
2. [Form Validation](#form-validation)
3. [Database Operations](#database-operations)
4. [File Operations](#file-operations)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Processing](#payment-processing)
7. [Batch Operations](#batch-operations)
8. [Error Recovery](#error-recovery)

## API Integration

### GitHub API Client
[Complete, copy-paste-ready implementation]

### Stripe Payment API
[Complete, copy-paste-ready implementation]

## Form Validation

### Multi-Field Validation with Collect
[Complete implementation]

### Bulk Validation with Partition
[Complete implementation]

[... etc for each category]
```

**Key**: Every pattern should be:
- **Complete**: Copy-paste ready
- **Production-ready**: Error handling, types
- **Real**: Inspired by actual APIs/products
- **Explained**: Brief comments on key points

### Step 5.5: Write Migration Guide (06-migration.md)

**Length**: ~570 lines

**Structure:**
```markdown
# Migration Guide: From [Old Approach] to [Module]

## Why Migrate?

**Before:**
**After:**

## Step 1: Identify [Pattern to Replace]

### Before: [Old code]
### After: [New code]

## Step 2: Refactor [Category]

### Pattern 1: [Simple case]
### Pattern 2: [Complex case]
### Pattern 3: [Edge case]

[... 5-7 migration steps]

## Migration Checklist

- [ ] Step 1
- [ ] Step 2
[... actionable checklist]

## Common Pitfalls

### ❌ Pitfall 1: [Bad pattern]
### ✅ Solution: [Good pattern]

## Incremental Migration Strategy
```

### Step 5.6: Write API Reference (07-api-reference.md)

**Length**: ~770 lines

**Structure:**
```markdown
# API Reference & Quick Lookup

## Decision Tree: Which Function Do I Need?

[ASCII decision tree]

## Function Reference

### Constructors

#### `constructor(value)` {#constructor}
[Signature]
[Description]
[Example]
[When to use]

[... for every function]

## Cheat Sheet

| I want to... | Use this |
|--------------|----------|

## Type Signatures Quick Reference

## Common Patterns

## Related Docs
```

### Step 5.7: Write Documentation README

**File**: `docs/<module-name>/README.md` (~340 lines)

**Structure:**
```markdown
# [Module Name] Documentation

Complete guide to [brief description].

## Quick Start

[30-second example]

## Documentation Structure

### 📚 Learning Path

**New to [Module]?** Follow this order:

1. **[Overview](./00-overview.md)** - Why?
2. **[Constructors](./01-constructors.md)** - Creating
[... etc]

### 📖 By Topic

#### I want to understand...
#### I want examples for...
#### I need to...

## Key Concepts

## Common Patterns

## Quick Reference

## Real-World Examples

## Best Practices

### ✅ Do
### ❌ Don't

## TypeScript Tips

## Performance

## Testing

## Getting Help

## Next Steps
```

---

## Phase 6: Git Workflow

### Step 6.1: Commit Implementation

```bash
git add src/<module-name>/ package.json tsconfig.json .gitignore
git commit -m "$(cat <<'EOF'
feat: implement [Module] module with comprehensive test suite

Implemented complete [Module]<T> module following FP principles
with Remeda integration.

## Implementation
- Core types: [list types]
- Constructors: [list constructors]
- Type guards: [list guards]
- Transformers: [list transformers]
- Extractors: [list extractors]
- Combinators: [list combinators]

## Features
- Full data-first/data-last support via Remeda's purry
- Type-safe with strict TypeScript settings
- Tree-shakeable module structure
- Comprehensive JSDoc documentation

## Testing
- X passing tests with Bun test runner
- [Categories of tests]
- Property-based tests for [laws]
- Edge cases and integration scenarios

All tests passing ✓
TypeScript compilation successful ✓
Build output generated ✓

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

### Step 6.2: Commit Examples

```bash
git add examples/
git commit -m "docs: add comprehensive [Module] module usage examples

Added examples demonstrating:
- [Feature 1]
- [Feature 2]
[... list key examples]

All examples run successfully ✓

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Step 6.3: Commit Documentation

```bash
git add docs/<module-name>/
git commit -m "$(cat <<'EOF'
docs: add comprehensive [Module] knowledge base documentation

Created production-ready documentation for developers unfamiliar with
[topic], inspired by real-world APIs from Stripe, GitHub, AWS, and
modern web frameworks.

## Documentation Structure (8 guides)

### 00-overview.md
- Why [Module] over [alternative]
- [Mental model]
- Comparison with [real APIs]
- When to use

### 01-constructors.md
- [Constructor 1] - [purpose]
- [Constructor 2] - [purpose]
[... etc]

[... detail each guide]

## Features

- **Real-world examples** from [products]
- **Production-ready patterns** for [use cases]
- **Decision trees** to find the right function
- **Copy-paste recipes** for common scenarios
- **Migration guide** from [old approach]
- **100+ code examples** from actual product flows

## Target Audience

Developers who:
- Are new to [concept]
- Come from [old approach] background
- Need practical examples, not theory
- Want to build reliable production apps

All examples inspired by real APIs and frameworks developers use daily.

🤖 Generated with Claude Code

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Quality Checklist

### Implementation Quality

- [ ] All types are readonly and use branded tags
- [ ] All functions support data-first AND data-last (via purry)
- [ ] Full JSDoc on every export with examples
- [ ] `@see` tags linking related functions
- [ ] No `any` types
- [ ] Strict TypeScript passes
- [ ] Build succeeds with declarations

### Test Quality

- [ ] 90%+ code coverage
- [ ] Tests for data-first and data-last signatures
- [ ] Edge case testing
- [ ] Property-based tests (functor/monad laws if applicable)
- [ ] Integration tests showing real workflows
- [ ] All tests pass with Bun

### Documentation Quality

- [ ] 8 core documents (overview through API reference)
- [ ] 100+ real-world code examples
- [ ] Examples from Stripe/GitHub/AWS/Next.js/etc.
- [ ] Decision tree for function selection
- [ ] Migration guide from traditional approach
- [ ] Copy-paste-ready pattern recipes
- [ ] No FP jargon without explanation
- [ ] Cross-linked documents
- [ ] README with navigation

### Git Quality

- [ ] Feature branch created
- [ ] 3 clear commits (implementation, examples, docs)
- [ ] Detailed commit messages
- [ ] Co-authored by Claude

---

## Templates

### Type Definition Template

```typescript
/**
 * [Brief description of what this represents].
 */
export interface TypeName<T> {
  readonly _tag: 'TagName'
  readonly value: T
}

/**
 * [Main type description] - [one-line purpose].
 *
 * [Longer explanation if needed].
 *
 * @typeParam T - [Description]
 *
 * @example
 * ```typescript
 * // [Show usage]
 * ```
 */
export type MainType<T> = Variant1<T> | Variant2
```

### Function Template

```typescript
/**
 * [One-line description of what it does].
 *
 * [Longer explanation of behavior, when to use, edge cases].
 *
 * @param param1 - [Description]
 * @param param2 - [Description]
 * @returns [Description of return value]
 *
 * @example
 * ```typescript
 * // Data-first
 * functionName(value, arg) // => result
 *
 * // Data-last (in pipe)
 * pipe(
 *   value,
 *   functionName(arg)
 * ) // => result
 * ```
 *
 * @see relatedFunction - [when to use instead]
 */
export function functionName<T, U>(value: T, arg: U): Result
export function functionName<U>(arg: U): <T>(value: T) => Result
export function functionName(...args: unknown[]): unknown {
  return R.purry(functionNameImpl, args)
}

function functionNameImpl<T, U>(value: T, arg: U): Result {
  // Implementation
}
```

### Test Template

```typescript
import { describe, it, expect } from 'bun:test'
import { functionName } from '../functionName'

describe('ModuleName.functionName', () => {
  describe('data-first', () => {
    it('[describes behavior]', () => {
      expect(functionName(input, arg)).toEqual(expected)
    })

    it('[describes edge case]', () => {
      expect(functionName(edge, arg)).toEqual(expectedEdge)
    })
  })

  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(
        input,
        functionName(arg)
      )
      expect(result).toEqual(expected)
    })
  })

  describe('typing', () => {
    it('infers types correctly', () => {
      const result = functionName(input, arg)
      // TypeScript should infer [type]
      expect(result).toEqual(expected)
    })
  })
})
```

### Documentation Section Template

```markdown
### Real-World: [Specific API/Product]

[2-3 sentence setup of the scenario]

​```typescript
// [Product] - [specific use case]
const exampleName = (params) =>
  pipe(
    // Step 1: [what happens]
    operation1(params),
    // Step 2: [what happens]
    operation2,
    // Step 3: [what happens]
    operation3
  )

// Usage
const result = exampleName(input)
match(result, {
  onSuccess: (data) => handleSuccess(data),
  onFailure: (error) => handleError(error)
})
​```

[Brief explanation of key points]
```

---

## Success Metrics

A module is **done** when:

✅ **Implementation**
- Compiles with strict TypeScript
- Builds successfully
- All exports have JSDoc

✅ **Tests**
- 100% passing
- 90%+ coverage
- Laws verified

✅ **Examples**
- 5-7 runnable examples
- Real-world inspired
- Console output works

✅ **Documentation**
- 8 core guides written
- 100+ code examples
- Decision tree included
- Migration guide complete

✅ **Git**
- 3 clear commits
- Feature branch
- Detailed messages

---

## Notes for Future Modules

### Module-Specific Variations

**Result/Option** (error handling):
- Functor + Monad laws
- Focus on error handling patterns
- Examples: API, validation, DB

**Async** (concurrency):
- Focus on Promise patterns
- Concurrency control examples
- Examples: rate limiting, batch processing

**Validation** (data validation):
- Focus on error accumulation
- Form validation patterns
- Examples: Zod-like schemas, forms

**Predicate** (filtering):
- Focus on composition
- Type narrowing examples
- Examples: where clauses, filtering

### Documentation Customization

**Adjust real-world examples** based on module:
- Result → Stripe, GitHub, Prisma
- Async → Rate limiting, bulk operations
- Validation → Forms, API validation
- Predicate → Database queries, filtering

**Adjust mental models**:
- Result → Railway-oriented programming
- Async → Conveyor belt with speed control
- Validation → Quality control checkpoint
- Predicate → Filter/sieve

---

## Quick Reference

### Time Budget per Phase

1. **Setup** (if new): 30 mins
2. **Implementation**: 2-3 hours
3. **Tests**: 1-2 hours
4. **Examples**: 30 mins
5. **Documentation**: 3-4 hours
6. **Git**: 15 mins

**Total**: 6-9 hours for complete module

### Documentation Line Counts

- Overview: ~500 lines
- Constructors: ~350 lines
- Transformers: ~430 lines
- Extractors: ~480 lines
- Combinators: ~460 lines
- Patterns: ~650 lines
- Migration: ~570 lines
- API Reference: ~770 lines
- README: ~340 lines

**Total**: ~4,500 lines per module

### Test Counts

- Constructors: ~15-20 tests
- Transformers: ~25-30 tests
- Extractors: ~25-30 tests
- Combinators: ~20-25 tests
- Laws: ~10-15 tests

**Total**: ~90-120 tests per module

---

## Appendix: Result Module Statistics

Used as reference for future modules:

- **Implementation**: 15 files, ~500 lines
- **Tests**: 6 files, 98 tests, 160 assertions
- **Examples**: 1 file, 7 examples
- **Documentation**: 9 files, 4,210 lines
- **Git**: 3 commits, feature branch

**Quality metrics:**
- TypeScript: Strict mode, no errors
- Tests: 100% passing, property-based included
- Documentation: 100+ real-world examples
- Examples: All runnable with Bun

---

**This guide is a living document. Update it as we learn from building more modules.**

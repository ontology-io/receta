# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Receta

> Practical FP recipes built on Remeda — higher-level patterns for real-world TypeScript applications.

## Project Overview

**Receta** (Spanish for "recipe") is a functional utility library that builds on top of [Remeda](https://remedajs.com). While Remeda provides low-level FP primitives (map, filter, pipe, etc.), Receta provides **composed patterns** that solve common real-world problems.

```
┌─────────────────────────────────────┐
│           Your Application          │
├─────────────────────────────────────┤
│    Receta (Patterns & Recipes)      │  ← This library
├─────────────────────────────────────┤
│    Remeda (FP Primitives)           │
├─────────────────────────────────────┤
│         TypeScript / JS             │
└─────────────────────────────────────┘
```

## Design Principles

### 1. Compositional Architecture - Build Up, Never Duplicate
- **Core Principle**: Functions are built from other functions, never duplicated
- Higher-level functions compose lower-level ones
- Single source of truth for each behavior
- Example: `retryResult()` calls `retry()`, doesn't reimplement retry logic
- **Anti-pattern**: Having separate throwing and Result-returning versions with duplicate logic

### 2. Remeda as Infrastructure
- Receta **depends on** Remeda and uses it internally
- Never reimplement what Remeda already provides
- Re-export Remeda utilities only when extending them
- Follow Remeda's data-first/data-last pattern

### 3. Result-First Error Handling
- **Default**: Functions return `Result<T, E>`, not throw exceptions
- Errors as values for explicit, composable error handling
- No `*Result` suffix - Result pattern is the standard, not an option
- Throwing functions only when absolutely necessary (rare)
- Example: `retry()` returns `Result<T, RetryError>` by default

### 4. Type Safety First
- Leverage TypeScript's type system to the fullest
- Prefer narrowing over type assertions
- Use branded/opaque types where semantic meaning matters
- All functions must be fully typed — no `any`

### 5. Explicit Over Magic
- No hidden side effects
- Nullability handled via Option, not silent defaults
- Pure functions wherever possible
- Clear function names that indicate behavior

### 6. Practical Over Academic
- Solve real problems, not theoretical exercises
- API should read like intent: `Result.tryCatch(() => JSON.parse(str))`
- Optimize for the 90% use case, escape hatch for the 10%

### 7. Tree-Shakeable
- Each module can be imported independently
- No barrel files that force bundling everything
- Side-effect free for dead code elimination

---

## Common Development Commands

### Running Tests
```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch

# Run specific test file
bun test src/result/__tests__/constructors.test.ts
```

### Building & Type Checking
```bash
# Type check without emitting files
bun run typecheck

# Build the project (compiles TypeScript to dist/)
bun run build

# Clean build artifacts
bun run clean
```

### Development Workflow
```bash
# Typical workflow for implementing a module:
bun test --watch           # Keep running in terminal
bun run typecheck          # Run before committing
bun run build              # Verify build works
```

### Running Examples
```bash
# Run example files to verify implementation
bun run examples/result-usage.ts
```

---

## Module Structure

```
src/
├── result/          # Result<T, E> type and utilities
├── option/          # Option<T> type and utilities
├── async/           # Async utilities (mapAsync, retry, etc.)
├── validation/      # Validation combinators
├── predicate/       # Predicate builders (where, and, or, gt, etc.)
├── collection/      # Advanced collection ops (nest, diff, paginate)
├── object/          # Object manipulation (flatten, rename, mask)
├── string/          # String utilities (template, slugify, etc.)
├── number/          # Number formatting and math helpers
├── date/            # Date utilities (relative, ranges, etc.)
├── memo/            # Memoization strategies
├── lens/            # Lens/optics for immutable updates
├── compare/         # Comparator builders
├── id/              # ID generation (uuid, nanoid)
├── function/        # Function combinators (ifElse, converge)
├── fetch/           # Fetch wrappers with Result pattern
└── types/           # Shared type utilities
```

---

## Core Types

### Result<T, E>

```typescript
type Result<T, E> = Ok<T> | Err<E>

interface Ok<T> {
  readonly _tag: 'Ok'
  readonly value: T
}

interface Err<E> {
  readonly _tag: 'Err'
  readonly error: E
}
```

### Option<T>

```typescript
type Option<T> = Some<T> | None

interface Some<T> {
  readonly _tag: 'Some'
  readonly value: T
}

interface None {
  readonly _tag: 'None'
}
```

---

## Coding Conventions

### File Structure

Each utility module follows this structure:

```typescript
// src/result/map.ts

import * as R from 'remeda'
import type { Result, Ok, Err } from './types'
import { ok, err, isOk } from './constructors'

/**
 * Maps over the Ok value of a Result.
 * 
 * @example
 * ```typescript
 * // Data-first
 * Result.map(ok(5), x => x * 2) // => Ok(10)
 * Result.map(err('fail'), x => x * 2) // => Err('fail')
 * 
 * // Data-last (in pipe)
 * pipe(
 *   ok(5),
 *   Result.map(x => x * 2)
 * ) // => Ok(10)
 * ```
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
export function map<T, U>(fn: (value: T) => U): <E>(result: Result<T, E>) => Result<U, E>
export function map(...args: unknown[]): unknown {
  return R.purry(mapImplementation, args)
}

function mapImplementation<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return isOk(result) ? ok(fn(result.value)) : result
}
```

### Naming Conventions

| Pattern | Convention | Example |
|---------|------------|---------|
| Type guards | `is*` | `isOk`, `isSome`, `isString` |
| Constructors | noun or `create*` | `ok`, `err`, `some`, `none` |
| Transformers | verb | `map`, `flatMap`, `filter` |
| Extractors | `unwrap*`, `get*` | `unwrapOr`, `getOrElse` |
| Predicates | `is*`, `has*`, `can*` | `isEmpty`, `hasKey` |
| Converters | `to*`, `from*` | `toOption`, `fromNullable` |
| Async variants | `*Async` | `mapAsync`, `filterAsync` |

### Function Signatures

Always support both data-first and data-last via `purry`:

```typescript
// Type overloads
export function myFn<T>(data: T[], options: Options): Result<T>
export function myFn<T>(options: Options): (data: T[]) => Result<T>

// Implementation
export function myFn(...args: unknown[]): unknown {
  return R.purry(myFnImpl, args)
}
```

### Error Messages

Use consistent error message format:

```typescript
// Good
err({ code: 'PARSE_ERROR', message: 'Failed to parse JSON', cause: originalError })

// Avoid
err('parse failed')
err(new Error('Failed'))
```

### JSDoc Comments

Every exported function must have:

```typescript
/**
 * Brief one-line description.
 * 
 * Longer description if needed, explaining behavior,
 * edge cases, and relationship to other functions.
 * 
 * @example
 * ```typescript
 * // Always include runnable examples
 * myFn([1, 2, 3], x => x * 2) // => [2, 4, 6]
 * ```
 * 
 * @see relatedFn - for alternative approach
 * @see otherFn - for inverse operation
 */
```

---

## Implementation Patterns

### Pattern 1: Compositional Functions (Build Up, Not Duplicate)

**Core principle**: Build higher-level functions from lower-level ones.

```typescript
import { ok, err, type Result } from '../result'

// ❌ ANTI-PATTERN: Duplicate implementations
export async function retry<T>(fn: () => Promise<T>): Promise<T> {
  // ... retry logic with try/catch
}

export async function retryResult<T>(fn: () => Promise<T>): Promise<Result<T, E>> {
  // ... DUPLICATE retry logic returning Result
}

// ✅ CORRECT: Compose from existing functions
export async function retry<T>(fn: () => Promise<T>): Promise<Result<T, RetryError>> {
  // Single implementation returning Result
  let lastError: unknown
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return ok(await fn())
    } catch (error) {
      lastError = error
      if (attempt === maxAttempts) {
        return err({ type: 'max_attempts_exceeded', lastError, attempts: attempt })
      }
      await sleep(delay)
    }
  }
}

// If you need a throwing version (rare), build it from the Result version
export async function retryOrThrow<T>(fn: () => Promise<T>): Promise<T> {
  const result = await retry(fn)
  if (isErr(result)) throw result.error
  return result.value
}
```

### Pattern 2: Result-Returning Functions (Default Pattern)

All async error-handling functions should return Result by default:

```typescript
import { Result, ok, err, tryCatch } from '../result'

// ✅ Result by default
export function parseJSON<T>(str: string): Result<T, SyntaxError> {
  return tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )
}

// ✅ Result with custom error type
export function parseNumber(str: string): Result<number, string> {
  const n = Number(str)
  return Number.isNaN(n)
    ? err(`Invalid number: "${str}"`)
    : ok(n)
}

// ✅ Async function returning Result
export async function fetchUser(id: string): Promise<Result<User, FetchError>> {
  try {
    const response = await fetch(`/api/users/${id}`)
    if (!response.ok) {
      return err({ type: 'http_error', status: response.status })
    }
    const user = await response.json()
    return ok(user)
  } catch (error) {
    return err({ type: 'network_error', cause: error })
  }
}
```

### Pattern 2: Predicate Builders

```typescript
import * as R from 'remeda'

type Predicate<T> = (value: T) => boolean

export const gt = <T extends number | bigint>(threshold: T): Predicate<T> => 
  (value) => value > threshold

export const lt = <T extends number | bigint>(threshold: T): Predicate<T> => 
  (value) => value < threshold

export const between = <T extends number | bigint>(min: T, max: T): Predicate<T> =>
  (value) => value >= min && value <= max

export const and = <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value) => predicates.every(p => p(value))

export const or = <T>(...predicates: Predicate<T>[]): Predicate<T> =>
  (value) => predicates.some(p => p(value))

export const not = <T>(predicate: Predicate<T>): Predicate<T> =>
  (value) => !predicate(value)

// Usage with Remeda
R.filter(numbers, and(gt(0), lt(100)))
```

### Pattern 3: Async Utilities

```typescript
import * as R from 'remeda'
import { Result, ok, err } from '../result'

export interface MapAsyncOptions {
  concurrency?: number
}

export async function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options: MapAsyncOptions = {}
): Promise<U[]> {
  const { concurrency = Infinity } = options
  
  if (concurrency === Infinity) {
    return Promise.all(items.map(fn))
  }
  
  const results: U[] = []
  const executing = new Set<Promise<void>>()
  
  for (const [index, item] of items.entries()) {
    const promise = fn(item, index).then(result => {
      results[index] = result
      executing.delete(promise)
    })
    
    executing.add(promise)
    
    if (executing.size >= concurrency) {
      await Promise.race(executing)
    }
  }
  
  await Promise.all(executing)
  return results
}
```

### Pattern 4: Lens Implementation

```typescript
import * as R from 'remeda'

export interface Lens<S, A> {
  get: (source: S) => A
  set: (value: A) => (source: S) => S
}

export function lens<S, A>(
  get: (source: S) => A,
  set: (value: A) => (source: S) => S
): Lens<S, A> {
  return { get, set }
}

export function prop<S, K extends keyof S>(key: K): Lens<S, S[K]> {
  return lens(
    (source) => source[key],
    (value) => (source) => ({ ...source, [key]: value })
  )
}

export function view<S, A>(l: Lens<S, A>): (source: S) => A
export function view<S, A>(l: Lens<S, A>, source: S): A
export function view<S, A>(l: Lens<S, A>, source?: S): A | ((source: S) => A) {
  return source === undefined ? l.get : l.get(source)
}

export function over<S, A>(l: Lens<S, A>, fn: (a: A) => A): (source: S) => S
export function over<S, A>(l: Lens<S, A>, fn: (a: A) => A, source: S): S
export function over<S, A>(
  l: Lens<S, A>, 
  fn: (a: A) => A, 
  source?: S
): S | ((source: S) => S) {
  const apply = (s: S) => l.set(fn(l.get(s)))(s)
  return source === undefined ? apply : apply(source)
}
```

---

## Testing Conventions

### Test File Structure

```typescript
// src/result/__tests__/map.test.ts

import { describe, it, expect } from 'vitest'
import * as R from 'remeda'
import { ok, err, map } from '../index'

describe('Result.map', () => {
  describe('data-first', () => {
    it('transforms Ok value', () => {
      expect(map(ok(5), x => x * 2)).toEqual(ok(10))
    })
    
    it('passes through Err unchanged', () => {
      expect(map(err('fail'), x => x * 2)).toEqual(err('fail'))
    })
  })
  
  describe('data-last', () => {
    it('works in pipe', () => {
      const result = R.pipe(
        ok(5),
        map(x => x * 2)
      )
      expect(result).toEqual(ok(10))
    })
  })
  
  describe('typing', () => {
    it('infers types correctly', () => {
      const result = map(ok(5), x => String(x))
      // TypeScript should infer Result<string, never>
      expect(result).toEqual(ok('5'))
    })
  })
})
```

### Property-Based Testing

Use fast-check for property tests where applicable:

```typescript
import * as fc from 'fast-check'
import { ok, err, map, flatMap } from '../index'

describe('Result laws', () => {
  it('satisfies functor identity', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        const result = ok(n)
        expect(map(result, x => x)).toEqual(result)
      })
    )
  })
  
  it('satisfies functor composition', () => {
    fc.assert(
      fc.property(fc.integer(), (n) => {
        const f = (x: number) => x + 1
        const g = (x: number) => x * 2
        const result = ok(n)
        
        expect(map(map(result, f), g)).toEqual(map(result, x => g(f(x))))
      })
    )
  })
})
```

---

## Documentation Standards

### README for Each Module

Each module directory should have a README.md:

```markdown
# Result

The Result type represents either success (Ok) or failure (Err).

## Installation

​```typescript
import { Result, ok, err } from 'receta/result'
​```

## Why Result?

- Explicit error handling
- Type-safe error propagation  
- Composable with pipe

## API

### Constructors
- `ok(value)` — Create Ok result
- `err(error)` — Create Err result

### Type Guards
- `isOk(result)` — Check if Ok
- `isErr(result)` — Check if Err

### Transformers
- `map(result, fn)` — Transform Ok value
- `mapErr(result, fn)` — Transform Err value
- `flatMap(result, fn)` — Chain Results

### Extractors
- `unwrap(result)` — Get value or throw
- `unwrapOr(result, default)` — Get value or default
- `unwrapOrElse(result, fn)` — Get value or compute default

## Examples

​```typescript
// Parsing with Result
const parseConfig = (json: string): Result<Config, ParseError> =>
  pipe(
    Result.tryCatch(() => JSON.parse(json)),
    Result.flatMap(validate)
  )
​```
```

---

## Project Setup

### Dependencies

```json
{
  "dependencies": {
    "remeda": "^2.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "vitest": "^1.0.0",
    "fast-check": "^3.0.0",
    "@types/node": "^20.0.0"
  }
}
```

### TypeScript Config

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
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

### Package Exports

```json
{
  "name": "receta",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./result": {
      "import": "./dist/result/index.js",
      "types": "./dist/result/index.d.ts"
    },
    "./option": {
      "import": "./dist/option/index.js",
      "types": "./dist/option/index.d.ts"
    }
  }
}
```

---

## Remeda Reference

Receta uses Remeda extensively. Key functions:

### Core
- `pipe(data, ...fns)` — Left-to-right composition
- `purry(impl, args)` — Create data-first/data-last function

### Array (commonly used)
- `map`, `filter`, `reduce`, `find`, `findIndex`
- `groupBy`, `indexBy`, `partition`
- `first`, `last`, `take`, `drop`
- `unique`, `uniqueBy`, `sort`, `sortBy`
- `flat`, `flatMap`, `chunk`, `zip`

### Object
- `pick`, `omit`, `mapValues`, `mapKeys`
- `entries`, `fromEntries`, `keys`, `values`
- `merge`, `mergeDeep`, `clone`

### Guards
- `isString`, `isNumber`, `isArray`, `isPlainObject`
- `isNullish`, `isNonNullish`, `isDefined`
- `isEmpty`, `isTruthy`

### Function
- `identity`, `constant`, `doNothing`
- `once`, `debounce` (use `funnel`)

Full reference: See `remeda-llms.txt` in project root.

---

## Development Workflow for New Modules

When implementing a new module, follow the proven workflow documented in [docs/module-development-guide.md](./docs/module-development-guide.md):

### Quick Start
1. **Create feature branch**: `git checkout -b <module-name>-module-implementation`
2. **Implement module** following existing patterns in `src/result/`
3. **Write comprehensive tests** with 90%+ coverage
4. **Add real-world examples** in `examples/`
5. **Create documentation** (8 guides following Result module structure)
6. **Commit in 3 phases**: implementation → examples → documentation

### Key Resources
- **Module guide**: `docs/module-development-guide.md` - Complete workflow and templates
- **Remeda reference**: `remeda-llms.txt` - Full Remeda API documentation
- **Result module**: `src/result/` - Reference implementation to follow
- **Test patterns**: `src/result/__tests__/` - Testing conventions and structure

### Before Committing
```bash
bun test           # All tests must pass
bun run typecheck  # No TypeScript errors
bun run build      # Build must succeed
```

---

## Module Implementation Status

| Module | Status | Priority | Notes |
|--------|--------|----------|-------|
| result | ✅ Complete | P0 | Full implementation with tests and docs |
| async | ✅ Complete | P0 | Promise utilities, concurrency control |
| option | 🔴 Not started | P0 | Similar to Result but for nullability |
| predicate | 🔴 Not started | P1 | Predicate combinators and builders |
| validation | 🔴 Not started | P1 | Data validation with error accumulation |
| collection | 🔴 Not started | P2 | Advanced collection operations |
| object | 🔴 Not started | P2 | Object manipulation utilities |
| string | 🔴 Not started | P2 | String processing and formatting |
| number | 🔴 Not started | P2 | Number formatting and calculations |
| date | 🔴 Not started | P3 | Date utilities and formatting |
| memo | 🔴 Not started | P3 | Memoization strategies |
| lens | 🔴 Not started | P3 | Functional lenses for immutable updates |
| compare | 🔴 Not started | P3 | Comparator builders |
| id | 🔴 Not started | P3 | ID generation utilities |
| function | 🔴 Not started | P3 | Function combinators |
| fetch | 🔴 Not started | P3 | Fetch wrappers with Result integration |

---

## Quick Reference

```typescript
// Result pattern
import { Result, ok, err, tryCatch } from 'receta/result'

const result = tryCatch(() => JSON.parse(str))
const value = Result.unwrapOr(result, {})

// Option pattern  
import { Option, some, none, fromNullable } from 'receta/option'

const opt = fromNullable(maybeValue)
const value = Option.unwrapOr(opt, 'default')

// Async with Result
import { mapAsync, retry } from 'receta/async'

const results = await mapAsync(urls, fetchJSON, { concurrency: 5 })

// Predicates
import { where, gt, and, oneOf } from 'receta/predicate'

const isValidUser = where({
  age: gt(18),
  role: oneOf(['admin', 'user']),
  active: Boolean
})

R.filter(users, isValidUser)
```

---

## Architecture Insights

### Type System Architecture
- **Discriminated Unions**: All core types use `_tag` for type narrowing
- **Readonly by Default**: Ensures immutability at the type level
- **Branded Types**: Use `_tag` to prevent accidental type mixing
- **No Any**: Strict type safety enforced throughout

### Data-First/Data-Last Pattern
All transformers support both calling conventions via Remeda's `purry`:
```typescript
// Data-first (direct call)
map(result, x => x * 2)

// Data-last (in pipe)
pipe(result, map(x => x * 2))
```

### Module Organization
Each module follows this structure:
```
module-name/
├── types.ts           # Type definitions only
├── constructors.ts    # Creating instances
├── guards.ts          # Type guards (is*)
├── map.ts            # Individual transformer files
├── flatMap.ts        # (one file per function)
├── unwrap.ts         # Extractors
├── match.ts          # Pattern matching
├── collect.ts        # Combinators
├── index.ts          # Barrel export
└── __tests__/        # Test suite
    ├── constructors.test.ts
    ├── transformers.test.ts
    ├── extractors.test.ts
    ├── combinators.test.ts
    └── laws.test.ts  # Property-based tests
```

### Testing Philosophy
1. **Unit Tests**: Cover both data-first and data-last signatures
2. **Type Tests**: Verify TypeScript inference works correctly
3. **Property Tests**: Verify mathematical laws (functor, monad, etc.)
4. **Integration Tests**: Real-world usage patterns
5. **Edge Cases**: Empty values, errors, nested structures

### Documentation Philosophy
Documentation targets developers unfamiliar with functional programming:
- **Real-world examples**: From Stripe, GitHub, AWS APIs
- **No FP jargon**: Use practical terms
- **Progressive learning**: Simple → Complex
- **Copy-paste ready**: All examples are production-ready
- **8-document structure**: Overview → API Reference

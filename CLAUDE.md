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

---

## ⚠️ CRITICAL: Implementation Priority Rules

**ALWAYS USE RECETA/REMEDA FIRST** — These rules override all default coding practices when working in this repository.

### Rule 1: Receta + Remeda First for All TypeScript/JavaScript Code

When implementing ANY functionality in this repository, follow this priority order:

1. **Check Receta first** - Use Receta modules for error handling, async operations, validation, predicates, etc.
2. **Check Remeda second** - Use Remeda for array/object/function utilities (map, filter, pipe, etc.)
3. **Vanilla JS/TS last** - Only use native syntax when Receta/Remeda don't provide the functionality

### Rule 2: Mandatory Patterns

#### Error Handling - ALWAYS use Result
```typescript
// ✅ CORRECT: Use Result for error handling
import { Result, ok, err, tryCatch } from 'receta/result'

function parseJSON<T>(str: string): Result<T, SyntaxError> {
  return tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )
}

// ❌ WRONG: Never use try/catch directly
function parseJSON(str: string) {
  try {
    return JSON.parse(str)
  } catch (e) {
    throw e
  }
}
```

#### Nullable Values - ALWAYS use Option
```typescript
// ✅ CORRECT: Use Option for nullable values
import { Option, fromNullable } from 'receta/option'

function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}

// ❌ WRONG: Never return null/undefined directly
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}
```

#### Array/Object Operations - ALWAYS use Remeda
```typescript
// ✅ CORRECT: Use Remeda's pipe and utilities
import * as R from 'remeda'

const result = R.pipe(
  data,
  R.filter(x => x.active),
  R.map(x => x.value),
  R.unique()
)

// ❌ WRONG: Never chain native array methods
const result = data
  .filter(x => x.active)
  .map(x => x.value)
  .filter((v, i, arr) => arr.indexOf(v) === i)
```

#### Async Operations - ALWAYS use Receta Async
```typescript
// ✅ CORRECT: Use Receta async utilities
import { mapAsync, retry } from 'receta/async'

const results = await mapAsync(
  urls,
  async (url) => fetch(url),
  { concurrency: 5 }
)

const result = await retry(
  () => fetchData(),
  { maxAttempts: 3, delay: 1000 }
)

// ❌ WRONG: Never use Promise.all directly or manual retry logic
const results = await Promise.all(urls.map(url => fetch(url)))

// ❌ WRONG: Manual retry with loops
for (let i = 0; i < 3; i++) {
  try {
    return await fetchData()
  } catch (e) {
    if (i === 2) throw e
  }
}
```

#### Predicates/Filtering - ALWAYS use Receta Predicate
```typescript
// ✅ CORRECT: Use Receta predicates with Remeda filter
import { where, gt, oneOf } from 'receta/predicate'
import * as R from 'remeda'

const validUsers = R.filter(
  users,
  where({
    age: gt(18),
    role: oneOf(['admin', 'user'])
  })
)

// ❌ WRONG: Never inline predicate logic
const validUsers = users.filter(u =>
  u.age > 18 && ['admin', 'user'].includes(u.role)
)
```

### Rule 3: Implementation Decision Tree

Before writing ANY code, consult this decision tree:

```
START: Need to implement something?
│
├─ Error handling needed? ──────────────────────► Receta Result
├─ Nullable/optional value? ────────────────────► Receta Option
├─ Async/Promise operation? ────────────────────► Receta Async
├─ Array/object transformation? ────────────────► Remeda (pipe, map, filter, etc.)
├─ Validation with error accumulation? ─────────► Receta Validation
├─ Filtering/predicates? ───────────────────────► Receta Predicate
├─ String operations? ──────────────────────────► Receta String
├─ Number formatting? ──────────────────────────► Receta Number
├─ Function composition? ───────────────────────► Receta Function + Remeda pipe
├─ Memoization needed? ─────────────────────────► Receta Memo
├─ Collection operations? ──────────────────────► Receta Collection
└─ None of the above ───────────────────────────► Check Remeda, then vanilla
```

### Rule 4: Pre-Implementation Checklist

Before completing ANY implementation, verify:

- [ ] No bare try/catch blocks (use `Result.tryCatch` instead)
- [ ] No null/undefined returns (use `Option` instead)
- [ ] No `.filter().map().reduce()` chains (use `R.pipe` instead)
- [ ] No manual `Promise.all` (use `Async.parallel` or `mapAsync`)
- [ ] No inline predicates (use `Predicate.where`)
- [ ] All functions composed with `R.pipe` or `R.compose`
- [ ] Error handling returns `Result<T, E>`
- [ ] Optional values return `Option<T>`

### Rule 5: Refactoring Vanilla Code

When you encounter vanilla JS/TS patterns, **proactively refactor** to Receta/Remeda:

**Example refactoring:**
```typescript
// BEFORE: Vanilla implementation
async function processUsers(ids: string[]) {
  const results = []
  for (const id of ids) {
    try {
      const user = await fetchUser(id)
      if (user && user.age >= 18) {
        results.push(user.name.toUpperCase())
      }
    } catch (e) {
      console.error(e)
    }
  }
  return results
}

// AFTER: Receta + Remeda implementation
import * as R from 'remeda'
import { Result, tryCatchAsync } from 'receta/result'
import { Option, fromNullable } from 'receta/option'
import { mapAsync } from 'receta/async'
import { where, gte } from 'receta/predicate'

async function processUsers(
  ids: string[]
): Promise<Result<string[], Error>> {
  return R.pipe(
    await mapAsync(ids, (id) => tryCatchAsync(() => fetchUser(id))),
    Result.collect,
    Result.map(
      R.pipe(
        R.map(fromNullable),
        Option.collect,
        R.filter(where({ age: gte(18) })),
        R.map(u => u.name.toUpperCase())
      )
    )
  )
}
```

### Rule 6: Code Review Enforcement

All code contributions MUST follow these rules. During code review, check:

1. **No vanilla patterns** - Reject code using try/catch, null returns, array method chains
2. **Receta/Remeda usage** - Ensure proper imports and usage of library functions
3. **Composition over imperative** - Prefer `R.pipe` over loops and mutations
4. **Type safety** - Result and Option provide better type inference than vanilla

---

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
bun run examples/option-usage.ts
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
├── memo/            # Memoization strategies
├── lens/            # Lens/optics for immutable updates
├── compare/         # Comparator builders
├── function/        # Function combinators (ifElse, converge)
├── testing/         # Testing utilities (matchers, laws, arbitraries)
│   ├── matchers/    # Vitest matchers for Result/Option
│   ├── laws/        # Functor/Monad law testing
│   └── arbitraries/ # Fast-check arbitraries for property testing
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

**When to Use Result: Decision Tree**

```
Should this function return Result<T, E>?
│
├─ Can it fail at runtime? ────────────────────► NO  → Return raw value (string, number, etc.)
│
├─ Is it a pure transformation? ───────────────► YES → Return raw value
│   (e.g., toUpperCase, slugify, clamp)
│
├─ Is it a predicate/type guard? ──────────────► YES → Return boolean or Option<T>
│   (e.g., isEmpty, isPositive, isEmail)
│
├─ Is it a formatter/serializer? ──────────────► YES → Return raw string/number
│   (e.g., toCurrency, toBytes, format)           (Formatters can't fail)
│
├─ Does it parse/deserialize input? ───────────► YES → Return Result<T, ParseError>
│   (e.g., fromString, fromJSON, fromBytes)
│
├─ Is it async and can fail? ──────────────────► YES → Return Promise<Result<T, E>>
│   (e.g., mapAsync, retry, timeout, fetch)
│
├─ Does it do I/O or network calls? ───────────► YES → Return Promise<Result<T, E>>
│   (e.g., readFile, fetchAPI, queryDB)
│
├─ Does it validate with error details? ───────► YES → Return Result<T, ValidationError>
│   (e.g., validateEmail, validateSchema)
│
└─ Pure computation, no errors? ───────────────► NO  → Return raw value
```

**Examples of Result-Returning Functions:**

```typescript
import { Result, ok, err, tryCatch } from '../result'

// ✅ Parsing: Always use Result
export function parseJSON<T>(str: string): Result<T, SyntaxError> {
  return tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )
}

// ✅ Custom error type for domain-specific parsing
export function parseNumber(str: string): Result<number, ParseError> {
  const n = Number(str)
  return Number.isNaN(n)
    ? err({ code: 'PARSE_ERROR', message: `Invalid number: "${str}"`, input: str })
    : ok(n)
}

// ✅ Async operations: Always use Result
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

// ✅ Async mapping with Result pattern
export async function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError>> {
  // Returns Result to handle mapper failures explicitly
}

// ❌ WRONG: Formatting doesn't need Result (can't fail)
export function toCurrency(n: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(n)
}

// ❌ WRONG: Pure transformations don't need Result
export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, '-')
}

// ❌ WRONG: Predicates return boolean or Option
export function isEmpty(str: string): boolean {
  return str.trim().length === 0
}

// ✅ GOOD: Use Option for "maybe present" values
export function isEmail(str: string): Option<string> {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(str) ? some(str) : none()
}
```

**Providing "OrThrow" Variants:**

For backward compatibility or when users prefer exceptions, provide `*OrThrow` variants:

```typescript
// ✅ Main function returns Result
export async function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<Result<U[], MapAsyncError>> {
  // ... implementation
}

// ✅ Throwing variant builds on Result version
export async function mapAsyncOrThrow<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<U[]> {
  const result = await mapAsync(items, fn, options)
  if (result._tag === 'Err') throw result.error
  return result.value
}
```

### Pattern 2: Option-Returning Functions (For Nullable Values)

All functions dealing with potentially absent values should return Option by default:

```typescript
import { Option, some, none, fromNullable } from '../option'

// ✅ Option for database queries
export function findUserById(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}

// ✅ Option for configuration with potential absence
export function getEnv(key: string): Option<string> {
  return fromNullable(process.env[key])
}

// ✅ Option for parsing when error details don't matter
export function parsePositiveInt(str: string): Option<number> {
  return pipe(
    tryCatch(() => Number(str)),
    filter(n => !isNaN(n) && n > 0 && Number.isInteger(n))
  )
}

// ✅ Converting between Option and Result
export function getUserOrError(id: string): Result<User, NotFoundError> {
  return pipe(
    findUserById(id),
    toResult({ code: 'USER_NOT_FOUND', userId: id })
  )
}
```

### Pattern 3: Predicate Builders

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

### Pattern 4: Async Utilities

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

### Pattern 5: Lens Implementation

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

✅ **All Core Modules Complete** — Receta is feature-complete for its intended scope.

| Module | Status | Priority | Notes |
|--------|--------|----------|-------|
| result | ✅ Complete | P0 | Full implementation with tests and docs |
| async | ✅ Complete | P0 | Promise utilities, concurrency control |
| option | ✅ Complete | P0 | Type-safe nullable handling, Result interop |
| predicate | ✅ Complete | P1 | Composable predicates, type guards, combinators |
| validation | ✅ Complete | P1 | Error accumulation, form validation, schema validation |
| collection | ✅ Complete | P2 | Advanced collection operations (nest, diff, paginate, indexByUnique, set operations) |
| object | ✅ Complete | P2 | Safe object manipulation (flatten, unflatten, getPath, mask, deepMerge, validateShape) |
| string | ✅ Complete | P2 | String processing, validation, sanitization (slugify, case conversions, template, HTML escape, validators, **pluralize, truncateWords, escapeRegex, normalizeWhitespace, initials, highlight**) |
| number | ✅ Complete | P2 | Number formatting, validation, calculations, conversions (format, toCurrency, toBytes, round, percentage, etc.) |
| memo | ✅ Complete | P3 | Memoization strategies (memoize, memoizeBy, memoizeAsync, TTL/LRU/WeakMap caches, deduplication) |
| lens | ✅ Complete | P3 | Functional lenses for immutable updates (prop, path, index, compose, optional, view/set/over operations) |
| compare | ✅ Complete | P3 | Comparator builders (ascending, descending, natural, compose, type-specific comparators) |
| function | ✅ Complete | P3 | Function combinators (ifElse, when, unless, cond, compose, converge, juxt, ap, partial, flip, arity controls, tap, tryCatch, memoize) |

### Potential Future Additions

High-value functions from the original brainstorming that could be added to existing modules:

#### Async Module
- ~~`pipeAsync`~~ — ✅ **IMPLEMENTED** - Async-aware pipe composition (left-to-right, supports 1-10 functions)
- ~~`promiseAllSettled`~~ — ✅ **IMPLEMENTED** - Typed wrapper with result extraction helpers (extractFulfilled, extractRejected, toResults)

#### Result Module
- ~~`parseNumber`~~ — ✅ **IMPLEMENTED** - Safe number parsing to Result with finite validation
- ~~`parseInt`~~ — ✅ **IMPLEMENTED** - Safe parseInt with radix support (2-36)
- ~~`parseJSON`~~ — ✅ **IMPLEMENTED** - Safe JSON.parse returning Result<T, SyntaxError>
- `parseUrl` — Safe URL parsing

#### Number Module
- ~~`percentage`~~ — ✅ **ALREADY IMPLEMENTED** - Calculate percentage with zero handling
- ~~`ratio`~~ — ✅ **ALREADY IMPLEMENTED** - a / b with safe zero handling
- ~~`roundTo`~~ — ✅ **IMPLEMENTED** - Round to nearest step (e.g., 0.25)
- ~~`interpolate`~~ — ✅ **ALREADY IMPLEMENTED** - Linear interpolation
- ~~`normalize`~~ — ✅ **IMPLEMENTED** - Scale to 0-1 range
- ~~`parseFormattedNumber`~~ — ✅ **IMPLEMENTED** - "1,234.56" → 1234.56

#### String Module
- ~~`pluralize`~~ — ✅ **IMPLEMENTED** - Count-aware pluralization with smart English rules
- ~~`truncateWords`~~ — ✅ **IMPLEMENTED** - Truncate by word count preserving boundaries
- ~~`escapeRegex`~~ — ✅ **IMPLEMENTED** - Escape regex special characters for safe patterns
- ~~`normalizeWhitespace`~~ — ✅ **IMPLEMENTED** - Normalize whitespace to single spaces
- ~~`initials`~~ — ✅ **IMPLEMENTED** - Extract initials for avatars ("John Doe" → "JD")
- ~~`highlight`~~ — ✅ **IMPLEMENTED** - Wrap matches in HTML tags with XSS protection

#### Object Module
- ~~`transformKeys`~~ — ✅ **IMPLEMENTED** - Deep case transformation (camelCase ↔ snake_case ↔ kebab-case ↔ PascalCase)
- ~~`stripEmpty`~~ — ✅ **IMPLEMENTED** - Remove null/undefined/empty strings/arrays/objects with configurable options
- `defaults` — Deep defaults (inverse of merge)
- `project` — GraphQL-style field selection

#### Collection Module
- ~~`flatten`~~ — ✅ **IMPLEMENTED** - Tree → flat array with depth/path tracking
- ~~`batchBy`~~ — ✅ **IMPLEMENTED** - Group consecutive items by predicate
- ~~`windowSliding`~~ — ✅ **IMPLEMENTED** - Sliding window over array with configurable step
- ~~`cartesianProduct`~~ — ✅ **IMPLEMENTED** - All combinations of arrays (type-safe for 2-5 arrays)
- ~~`moveIndex`~~ — ✅ **IMPLEMENTED** - Move item from index to index immutably
- ~~`insertAt`~~ — ✅ **IMPLEMENTED** - Insert elements at specific index
- ~~`updateAt`~~ — ✅ **IMPLEMENTED** - Update element at specific index
- ~~`removeAtIndex`~~ — ✅ **IMPLEMENTED** - Remove element at specific index

#### Function Module
- ~~`unless`~~ — ✅ **IMPLEMENTED** - Run unless predicate (complement of `when`)
- ~~`guard`~~ — ✅ **IMPLEMENTED** - Early return pattern helper for validation chains
- ~~`switchCase`~~ — ✅ **IMPLEMENTED** - Pattern matching with required default (alternative to `cond`)

### Out of Scope

These modules are **intentionally excluded** as they are too opinionated or better handled by existing libraries:

- **fetch** — Too opinionated about HTTP clients and error handling. Users should wrap their chosen HTTP client with `Result.tryCatchAsync()` instead.
- **id** — Just thin wrappers around existing libraries. Use `crypto.randomUUID()`, `nanoid`, `ulid`, or other ID generation packages directly.
- **date** — Extremely opinionated territory with many library choices (date-fns, dayjs, luxon, Temporal). Users should choose their preferred date library and use it directly.
- **Event/Stream patterns** — Better handled by RxJS, xstate, or native EventTarget
- **JSON Patch (RFC 6902)** — Too specialized, use dedicated libraries like `fast-json-patch`
- **Advanced combinatorics** — Permutations, combinations are niche use cases

### Future Spin-off: receta-stats

Statistical utilities (median, mode, variance, standardDeviation, percentile) could be packaged as a separate **receta-stats** module if there's demand. This keeps the core `number` module focused on formatting/validation while allowing statistical analysis as an optional extension.

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

// Testing utilities
import { recetaMatchers } from 'receta/testing'
import { testFunctorLaws } from 'receta/testing/laws'
import { result, option } from 'receta/testing/arbitraries'
import * as fc from 'fast-check'

expect.extend(recetaMatchers)
expect(ok(5)).toBeOk(5)

testFunctorLaws({ type: 'Result', of: ok, map: Result.map })

fc.assert(fc.property(result(fc.integer(), fc.string()), (r) => {
  expect(Result.map(r, x => x)).toEqualResult(r)
}))
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

# Function Module - Overview

> Composable function combinators and utilities for building clean, declarative TypeScript code.

## What is the Function Module?

The Function module provides higher-order utilities that let you compose, transform, and control function behavior in a declarative way. Instead of writing imperative if-else chains and nested callbacks, you build pipelines using composable building blocks.

## Why Use Function Combinators?

### Problem: Imperative Code Gets Messy

```typescript
// ❌ Traditional imperative approach
function processUser(user: User): ProcessedUser {
  let result = user

  // Nested if-else logic
  if (!result.email.includes('@')) {
    result = { ...result, email: 'invalid@example.com' }
  }

  if (result.username.length === 0) {
    const emailParts = result.email.split('@')
    result = { ...result, username: emailParts[0] || 'anonymous' }
  }

  if (result.password.length < 8) {
    result = { ...result, password: result.password + '12345678'.slice(result.password.length) }
  }

  return result
}
```

### Solution: Declarative Function Composition

```typescript
// ✅ Declarative approach with function combinators
import { pipe } from 'remeda'
import { when, unless } from 'receta/function'

const processUser = (user: User) =>
  pipe(
    user,
    when(
      (u) => !u.email.includes('@'),
      (u) => ({ ...u, email: 'invalid@example.com' })
    ),
    unless(
      (u) => u.username.length > 0,
      (u) => ({ ...u, username: u.email.split('@')[0] || 'anonymous' })
    ),
    when(
      (u) => u.password.length < 8,
      (u) => ({ ...u, password: u.password + '12345678'.slice(u.password.length) })
    )
  )
```

**Benefits:**
- **Readable**: Each transformation is clearly isolated
- **Composable**: Easy to add/remove/reorder steps
- **Testable**: Each function can be tested independently
- **Type-safe**: Full TypeScript inference throughout

## Module Categories

The Function module is organized into five categories:

### 1. Conditional Combinators
Execute code based on predicates without if-else statements.

```typescript
import { ifElse, when, unless, cond } from 'receta/function'

// Branching
const classify = ifElse(
  (n: number) => n >= 0,
  (n) => 'positive',
  (n) => 'negative'
)

// Multi-way conditionals
const httpStatus = cond<number, string>([
  [(s) => s >= 200 && s < 300, () => 'success'],
  [(s) => s >= 400 && s < 500, () => 'client error'],
  [(s) => s >= 500, () => 'server error']
])
```

**When to use:** HTTP status handling, form validation, state machines

### 2. Composition Utilities
Combine multiple functions into new functions.

```typescript
import { compose, converge, juxt } from 'receta/function'

// Build complex objects from single input
const buildProfile = converge(
  (name, username, domain) => ({ name, username, domain }),
  [
    (user: User) => user.fullName,
    (user: User) => user.email.split('@')[0],
    (user: User) => user.email.split('@')[1]
  ]
)

// Extract multiple metrics
const stats = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => Math.min(...nums)
])
```

**When to use:** Data transformation, analytics, deriving multiple values from single input

### 3. Partial Application
Pre-fill function arguments to create specialized versions.

```typescript
import { partial, partialRight, flip } from 'receta/function'

const log = (level: string, module: string, msg: string) =>
  `[${level}] ${module}: ${msg}`

const logError = partial(log, 'ERROR')
const logUserError = partial(logError, 'UserModule')

logUserError('Invalid input') // => '[ERROR] UserModule: Invalid input'
```

**When to use:** Logging systems, specialized validators, configuration

### 4. Arity Control
Control how many arguments a function accepts.

```typescript
import { unary, binary, nAry } from 'receta/function'

// Fix parseInt with map
['1', '2', '3'].map(parseInt)         // => [1, NaN, NaN] ❌
['1', '2', '3'].map(unary(parseInt))  // => [1, 2, 3] ✅
```

**When to use:** Array callbacks, adapting functions for different contexts

### 5. Control Flow
Manage side effects, errors, and performance.

```typescript
import { tap, tryCatch, memoize } from 'receta/function'

// Debug pipelines
pipe(
  data,
  transform,
  tap((x) => console.log('After transform:', x)),
  validate,
  tap((x) => console.log('After validate:', x))
)

// Safe parsing
const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (error) => `Parse error: ${error}`
)
```

**When to use:** Debugging, error handling, performance optimization

## Core Principles

### 1. Data-First and Data-Last Signatures

All functions support both calling styles:

```typescript
// Data-first (direct call)
when(predicate, fn, value)

// Data-last (for pipe)
pipe(value, when(predicate, fn))
```

### 2. Composability

Functions work seamlessly with Remeda's `pipe`:

```typescript
import { pipe, map, filter } from 'remeda'
import { when, tap, converge } from 'receta/function'

const result = pipe(
  rawData,
  when(needsNormalization, normalize),
  map(transform),
  tap(logProgress),
  filter(isValid),
  converge(buildSummary, extractors)
)
```

### 3. Type Safety

Full TypeScript inference with no type assertions needed:

```typescript
const result = ifElse(
  (n: number) => n > 0,
  (n) => `positive: ${n}`,  // TypeScript knows n is number
  (n) => `negative: ${n}`   // TypeScript knows n is number
)
// result is automatically typed as (n: number) => string
```

### 4. Integration with Result and Option

Works naturally with error handling types:

```typescript
import { cond } from 'receta/function'
import { unwrapOr } from 'receta/option'

const getMessage = cond<State, string>([
  [(s) => s === 'loading', () => 'Please wait...'],
  [(s) => s === 'success', () => 'Done!'],
  [(s) => s === 'error', () => 'Failed']
])

const message = unwrapOr(getMessage(state), 'Unknown state')
```

## Common Patterns

### State Machines

```typescript
type State = 'idle' | 'loading' | 'success' | 'error'

const handleState = cond<State, Action>([
  [(s) => s === 'idle', () => startLoading()],
  [(s) => s === 'loading', () => showSpinner()],
  [(s) => s === 'success', () => displayData()],
  [(s) => s === 'error', () => showError()]
])
```

### Validation Pipelines

```typescript
const validateUser = pipe(
  when(emailInvalid, normalizeEmail),
  unless(hasUsername, deriveUsernameFromEmail),
  when(passwordWeak, strengthenPassword),
  unless(ageProvided, setDefaultAge)
)
```

### Data Aggregation

```typescript
const analyzeData = converge(
  (total, count, max, min) => ({
    total,
    count,
    average: total / count,
    max,
    min,
    range: max - min
  }),
  [
    (data) => sum(data),
    (data) => data.length,
    (data) => Math.max(...data),
    (data) => Math.min(...data)
  ]
)
```

### Debugging Pipelines

```typescript
const processData = pipe(
  fetchData,
  tap((data) => logger.debug('Fetched:', data.length, 'items')),
  transform,
  tap((data) => logger.debug('Transformed:', data)),
  validate,
  tap((data) => logger.debug('Validated:', data.isValid))
)
```

## Quick Start

```typescript
import * as R from 'remeda'
import {
  ifElse, when, unless, cond,
  compose, converge, juxt,
  partial, flip, unary,
  tap, tryCatch, memoize
} from 'receta/function'

// 1. Conditional logic
const classify = ifElse(
  (age: number) => age >= 18,
  (age) => ({ status: 'adult', age }),
  (age) => ({ status: 'minor', age })
)

// 2. Composition
const getStats = juxt([
  (nums: number[]) => nums.length,
  (nums: number[]) => Math.max(...nums),
  (nums: number[]) => Math.min(...nums)
])

// 3. Partial application
const logError = partial(
  (level: string, msg: string) => `[${level}] ${msg}`,
  'ERROR'
)

// 4. Safe execution
const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (err) => `Parse failed: ${err}`
)

// 5. Debug pipeline
const process = R.pipe(
  data,
  tap((x) => console.log('Input:', x)),
  transform,
  tap((x) => console.log('Output:', x))
)
```

## Next Steps

- **[Conditionals Guide](./02-conditionals-guide.md)** - Deep dive into ifElse, when, unless, cond
- **[Composition Guide](./03-composition-guide.md)** - Master compose, converge, juxt, ap
- **[Partial Application Guide](./04-partial-application-guide.md)** - Learn partial, flip, arity controls
- **[Control Flow Guide](./05-control-flow-guide.md)** - Explore tap, tryCatch, memoize
- **[Integration Guide](./06-integration-guide.md)** - Combine with Result, Option, and Remeda
- **[Real-World Patterns](./07-real-world-patterns.md)** - Production-ready examples
- **[API Reference](./08-api-reference.md)** - Complete function signatures

## Philosophy

The Function module follows these design principles:

1. **Declarative over Imperative**: Express *what* you want, not *how* to do it
2. **Composition over Complexity**: Build complex behavior from simple pieces
3. **Explicitness over Magic**: Clear function names and predictable behavior
4. **Type Safety First**: Leverage TypeScript's type system fully
5. **Practical over Academic**: Solve real problems with pragmatic solutions

These combinators aren't just academic exercises—they're tools for writing cleaner, more maintainable production code.

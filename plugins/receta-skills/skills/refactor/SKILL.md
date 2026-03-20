---
name: refactor
description: Refactor vanilla JS/TS code to use Receta and Remeda functional patterns
tags:
  - refactoring
  - result
  - option
  - pipe
  - remeda
  - functional-programming
---

# Receta Refactor

You are a functional programming refactoring specialist for TypeScript codebases using Receta and Remeda. Your job is to transform vanilla JavaScript/TypeScript patterns into idiomatic Receta code.

## Instructions

When the user invokes this skill, they will provide either:
- A file path or code snippet to refactor
- A description of what pattern they want to convert

Follow this process:

### Step 1: Analyze the Input

Read the provided code and identify ALL vanilla patterns that should be converted. Categorize each finding using this decision tree:

| Vanilla Pattern | Receta Replacement |
|---|---|
| `try { ... } catch (e) { ... }` | `tryCatch(() => ...)` or `tryCatchAsync(() => ...)` from `@ontologyio/receta/result` |
| `function f(): T \| null` or `T \| undefined` | `Option<T>` with `fromNullable()` from `@ontologyio/receta/option` |
| `.filter().map().reduce()` chains | `R.pipe(data, R.filter(...), R.map(...), R.reduce(...))` from `remeda` |
| `Promise.all(items.map(...))` | `mapAsync(items, fn, { concurrency })` from `@ontologyio/receta/async` |
| Inline predicates in filter | `where({ field: gt(n) })` from `@ontologyio/receta/predicate` |
| `if (x != null) { ... }` null checks | `Option.map()` / `Option.match()` |
| Nested if/else chains | `cond()`, `ifElse()`, `when()`, `unless()` from `@ontologyio/receta/function` |
| Manual retry loops | `retry()` from `@ontologyio/receta/async` |
| `throw new Error(...)` in functions | Return `err(...)` from `@ontologyio/receta/result` |
| `JSON.parse(str)` | `parseJSON(str)` from `@ontologyio/receta/result` |
| Manual memoization | `memoize()` / `memoizeAsync()` from `@ontologyio/receta/memo` |
| `obj.a?.b?.c` deep access | `getPath(obj, 'a.b.c')` from `@ontologyio/receta/object` |
| Spread-based immutable updates | `lens` operations from `@ontologyio/receta/lens` for complex cases |
| Manual form validation | `schema()` / `validateAll()` from `@ontologyio/receta/validation` |

### Step 2: Plan the Refactoring

Before making changes, present a numbered list of transformations you will apply:

```
Refactoring Plan:
1. [Line X-Y] try/catch around JSON.parse -> Result.tryCatch
2. [Line Z] Return type User | null -> Option<User>
3. [Line W] .filter().map() chain -> R.pipe with R.filter, R.map
...
```

Ask the user to confirm before proceeding.

### Step 3: Apply Transformations

For each transformation:

1. Add the necessary imports from Receta and Remeda at the top of the file
2. Replace the vanilla pattern with the Receta equivalent
3. Update the function signature/return type if needed
4. Ensure the refactored code maintains identical behavior

### Step 4: Verify

After refactoring:
- Confirm all imports are correct (use `@ontologyio/receta/<module>` paths)
- Check that no bare `try/catch`, `null` returns, or array method chains remain
- Verify type signatures are updated
- Suggest running `bun test` or `bun run typecheck` to validate

## Import Reference

```typescript
// Result - error handling
import { ok, err, tryCatch, tryCatchAsync, map, flatMap, match, unwrapOr, collect, parseJSON, parseNumber } from '@ontologyio/receta/result'

// Option - nullable values
import { some, none, fromNullable, isSome, isNone, map, flatMap, match, unwrapOr } from '@ontologyio/receta/option'

// Async - promise utilities
import { mapAsync, retry, timeout, pipeAsync } from '@ontologyio/receta/async'

// Predicate - composable predicates
import { where, gt, lt, gte, lte, between, oneOf, and, or, not, matches } from '@ontologyio/receta/predicate'

// Validation - error accumulation
import { valid, invalid, schema, validateAll, map as vMap } from '@ontologyio/receta/validation'

// Collection - advanced array ops
import { nest, paginate, batchBy, windowSliding, moveIndex, insertAt, flatten } from '@ontologyio/receta/collection'

// Object - object manipulation
import { getPath, setPath, mask, rename, mapKeys, mapValues, filterKeys, filterValues, validateShape } from '@ontologyio/receta/object'

// Function - combinators
import { ifElse, when, unless, cond, switchCase, guard, converge, tap } from '@ontologyio/receta/function'

// Lens - immutable updates
import { prop, path, view, set, over } from '@ontologyio/receta/lens'

// Memo - caching
import { memoize, memoizeBy, memoizeAsync } from '@ontologyio/receta/memo'

// Remeda - FP primitives
import * as R from 'remeda'
```

## Refactoring Examples

### Example 1: try/catch to Result

BEFORE:
```typescript
async function fetchUser(id: string): Promise<User> {
  try {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return await res.json()
  } catch (e) {
    throw new Error(`Failed to fetch user: ${e}`)
  }
}
```

AFTER:
```typescript
import { tryCatchAsync, type Result } from '@ontologyio/receta/result'

async function fetchUser(id: string): Promise<Result<User, string>> {
  return tryCatchAsync(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json() as User
    },
    (e) => `Failed to fetch user: ${e}`
  )
}
```

### Example 2: Null checks to Option

BEFORE:
```typescript
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}

const user = findUser('123')
if (user) {
  console.log(user.name)
}
```

AFTER:
```typescript
import { fromNullable, map, unwrapOr, type Option } from '@ontologyio/receta/option'
import * as R from 'remeda'

function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}

R.pipe(
  findUser('123'),
  map(u => u.name),
  unwrapOr('Unknown')
)
```

### Example 3: Array chains to R.pipe

BEFORE:
```typescript
const result = users
  .filter(u => u.active)
  .map(u => u.email)
  .filter(e => e.endsWith('@company.com'))
  .sort()
```

AFTER:
```typescript
import * as R from 'remeda'

const result = R.pipe(
  users,
  R.filter(u => u.active),
  R.map(u => u.email),
  R.filter(e => e.endsWith('@company.com')),
  R.sort((a, b) => a.localeCompare(b))
)
```

### Example 4: Promise.all to mapAsync

BEFORE:
```typescript
const results = await Promise.all(
  urls.map(async (url) => {
    const res = await fetch(url)
    return res.json()
  })
)
```

AFTER:
```typescript
import { mapAsync } from '@ontologyio/receta/async'

const results = await mapAsync(
  urls,
  async (url) => {
    const res = await fetch(url)
    return res.json()
  },
  { concurrency: 5 }
)
```

### Example 5: Complex conditionals to function combinators

BEFORE:
```typescript
function processUser(user: User): string {
  if (user.role === 'admin') {
    return `Admin: ${user.name}`
  } else if (user.role === 'moderator') {
    return `Mod: ${user.name}`
  } else {
    return user.name
  }
}
```

AFTER:
```typescript
import { cond } from '@ontologyio/receta/function'

const processUser = cond<User, string>([
  [(u) => u.role === 'admin', (u) => `Admin: ${u.name}`],
  [(u) => u.role === 'moderator', (u) => `Mod: ${u.name}`],
  [() => true, (u) => u.name],
])
```

## Rules

1. NEVER leave bare try/catch blocks — always use `tryCatch` or `tryCatchAsync`
2. NEVER return `null` or `undefined` — use `Option<T>` with `fromNullable`
3. NEVER use `.filter().map().reduce()` chains — use `R.pipe`
4. NEVER use `Promise.all(items.map(...))` — use `mapAsync`
5. NEVER use inline predicates when `where()` would be clearer
6. All functions composed with `R.pipe` where possible
7. Error handling returns `Result<T, E>`, not exceptions
8. Optional values return `Option<T>`, not `T | null | undefined`

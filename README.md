# Receta

> **Practical FP recipes built on Remeda** — Higher-level patterns for real-world TypeScript applications

[![npm version](https://img.shields.io/npm/v/receta.svg)](https://www.npmjs.com/package/receta)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)

---

![gemini-2 5-flash-image_remove_the_text_Typescript_Package_Library-0](https://github.com/user-attachments/assets/706475dc-3c32-439f-a6c1-460bcaa15e24)

## What is Receta?

**Receta** (Spanish for "recipe") is a functional utility library that builds on top of [Remeda](https://remedajs.com). While Remeda provides low-level FP primitives (map, filter, pipe, etc.), **Receta provides composed patterns** that solve common real-world problems.

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

## Why Receta?

TypeScript gives you compile-time safety, but **runtime is still the Wild West**:

```typescript
// ❌ THE VANILLA NIGHTMARE
async function getUserProfile(userId: string) {
  try {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const user = await response.json()
    if (!user) throw new Error('User not found')
    return user.profile?.email || null
  } catch (error) {
    console.error(error)
    return null // 🤮 What went wrong? Who knows!
  }
}
```

**7+ runtime failure points. Zero compile-time help. Good luck debugging production.**

### Receta Solution: Errors as Values + Pipe Composition

```typescript
// ✅ RECETA: Type-safe, composable, self-documenting
import * as R from 'remeda'
import { Result, tryCatchAsync } from 'receta/result'
import { Option, fromNullable } from 'receta/option'

async function getUserProfile(
  userId: string
): Promise<Result<string, FetchError>> {
  return R.pipe(
    await tryCatchAsync(
      () => fetch(`/api/users/${userId}`).then(r => r.json()),
      (e): FetchError => ({ type: 'network_error', cause: e })
    ),
    Result.flatMap(user =>
      Option.toResult(
        fromNullable(user?.profile?.email),
        { type: 'email_not_found', userId }
      )
    )
  )
}

// Caller knows EXACTLY what can fail
R.pipe(
  await getUserProfile('123'),
  Result.match({
    Ok: (email) => console.log('Email:', email),
    Err: (error) => {
      if (error.type === 'network_error') showNetworkError()
      if (error.type === 'email_not_found') showEmailMissing()
    }
  })
)
```

**Benefits:**
- ✅ **Compile-time exhaustiveness** — TypeScript forces you to handle all error cases
- ✅ **No hidden exceptions** — Errors are explicit in return types
- ✅ **Composable with `pipe`** — Chain operations without nested try/catch
- ✅ **Self-documenting** — Function signature tells you what can fail

---

## Installation

```bash
npm install receta remeda
# or
bun add receta remeda
# or
yarn add receta remeda
```

---

## Quick Start

### Result: Type-Safe Error Handling

```typescript
import { Result, ok, err, tryCatch } from 'receta/result'
import * as R from 'remeda'

// Parse JSON safely
const parseJSON = <T>(str: string): Result<T, SyntaxError> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (e) => e as SyntaxError
  )

// Compose with pipe
const result = R.pipe(
  '{"name": "Alice"}',
  parseJSON,
  Result.map((user: any) => user.name),
  Result.unwrapOr('Unknown')
)

console.log(result) // "Alice"
```

### Option: No More Null/Undefined Bugs

```typescript
import { Option, fromNullable } from 'receta/option'
import * as R from 'remeda'

type User = { settings?: { theme?: string } }

const getUserTheme = (user: User): string =>
  R.pipe(
    user.settings?.theme,
    fromNullable,
    Option.unwrapOr('light')
  )

getUserTheme({}) // "light"
getUserTheme({ settings: { theme: 'dark' } }) // "dark"
```

### Async: Concurrency Control + Retry

```typescript
import { mapAsync, retry } from 'receta/async'

// Fetch URLs with concurrency limit
const results = await mapAsync(
  urls,
  async (url) => fetch(url).then(r => r.json()),
  { concurrency: 5 } // Max 5 concurrent requests
)

// Retry with exponential backoff
const response = await retry(
  () => fetch('https://api.example.com/data'),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential' // 1s, 2s, 4s
  }
)
```

### Predicate: Composable Filters

```typescript
import { where, between, oneOf, gte } from 'receta/predicate'
import * as R from 'remeda'

const products = [
  { price: 50, inStock: true, category: 'electronics', rating: 4.5 },
  { price: 150, inStock: false, category: 'books', rating: 3.8 }
]

const filtered = R.filter(
  products,
  where({
    price: between(10, 100),
    inStock: true,
    category: oneOf(['electronics', 'books']),
    rating: gte(4.0)
  })
)
// [{ price: 50, ... }]
```

### Validation: Form Validation with Error Accumulation

```typescript
import { validate, combine, field } from 'receta/validation'
import { isEmail, minLength } from 'receta/string'

const validateRegistration = combine({
  email: field('email', [
    validate(isEmail, 'Must be a valid email')
  ]),
  password: field('password', [
    validate(minLength(8), 'Must be at least 8 characters')
  ])
})

const result = validateRegistration({
  email: 'invalid',
  password: '123'
})
// Invalid({ email: ['Must be a valid email'], password: ['Must be at least 8 characters'] })
```

---

## Core Modules

| Module | Purpose | Key Functions |
|--------|---------|---------------|
| **[result](./docs/result/)** | Type-safe error handling | `ok`, `err`, `tryCatch`, `match`, `unwrapOr` |
| **[option](./docs/option/)** | Nullable value handling | `some`, `none`, `fromNullable`, `unwrapOr` |
| **[async](./docs/async/)** | Async utilities | `mapAsync`, `retry`, `timeout`, `debounce`, `throttle` |
| **[predicate](./docs/predicate/)** | Composable predicates | `where`, `gt`, `lt`, `between`, `oneOf`, `and`, `or` |
| **[validation](./docs/validation/)** | Form/data validation | `validate`, `combine`, `field`, error accumulation |
| **[collection](./docs/collection/)** | Advanced collections | `nest`, `diff`, `paginate`, `setOps` |
| **[object](./docs/object/)** | Object manipulation | `flatten`, `unflatten`, `getPath`, `mask`, `deepMerge` |
| **[string](./docs/string/)** | String utilities | `slugify`, `template`, `truncate`, `isEmail`, `sanitize` |
| **[number](./docs/number/)** | Number formatting | `toCurrency`, `toBytes`, `clamp`, `percentage` |
| **[memo](./docs/memo/)** | Memoization | `memoize`, `memoizeAsync`, TTL/LRU caches |
| **[lens](./docs/lens/)** | Immutable updates | `prop`, `path`, `over`, `set`, `view` |
| **[compare](./docs/compare/)** | Comparator builders | `ascending`, `descending`, `natural`, `compose` |
| **[function](./docs/function/)** | Function combinators | `ifElse`, `when`, `cond`, `compose`, `partial` |

---

## Design Principles

### 1. Compositional Architecture
- Functions are built from other functions, never duplicated
- Higher-level functions compose lower-level ones
- Single source of truth for each behavior

### 2. Remeda as Infrastructure
- Receta depends on and uses Remeda internally
- Re-exports Remeda utilities only when extending them
- Follows Remeda's data-first/data-last pattern via `purry`

### 3. Result-First Error Handling
- **Default**: Functions return `Result<T, E>`, not throw exceptions
- Errors as values for explicit, composable error handling
- Throwing functions only when absolutely necessary

### 4. Type Safety First
- Leverage TypeScript's type system to the fullest
- All functions fully typed — no `any`
- Prefer narrowing over type assertions

### 5. Practical Over Academic
- Solve real problems, not theoretical exercises
- API reads like intent: `Result.tryCatch(() => JSON.parse(str))`
- Optimize for the 90% use case, escape hatch for the 10%

### 6. Tree-Shakeable
- Each module can be imported independently
- No barrel files forcing bundling everything
- Side-effect free for dead code elimination

---

## Documentation

- **[Why Receta?](./WHY-RECETA.md)** — Real-world problems and solutions
- **[Module Development Guide](./docs/module-development-guide.md)** — Contributing new modules
- **Module Guides:**
  - [Result](./docs/result/README.md) — Error handling patterns
  - [Option](./docs/option/README.md) — Nullable value handling
  - [Async](./docs/async/README.md) — Async utilities and patterns
  - [Predicate](./docs/predicate/README.md) — Composable predicates
  - [Validation](./docs/validation/README.md) — Form and data validation
  - [Collection](./docs/collection/README.md) — Advanced collection operations
  - [Object](./docs/object/README.md) — Safe object manipulation
  - [String](./docs/string/README.md) — String utilities
  - [Number](./docs/number/README.md) — Number formatting and math
  - [Memo](./docs/memo/README.md) — Memoization strategies
  - [Lens](./docs/lens/README.md) — Functional lenses
  - [Compare](./docs/compare/README.md) — Comparator builders
  - [Function](./docs/function/README.md) — Function combinators

---

## Examples

Check the [examples/](./examples/) directory for real-world usage patterns:

- Payment processing with error handling
- API request pipelines
- Form validation
- Data transformations
- Retry strategies
- And more!

---

## When NOT to Use Receta

Receta is overkill for:
- **Prototypes/scripts** — `try/catch` is fine for throwaway code
- **Simple CRUD** — If your app is 90% database queries, simpler tools suffice
- **Team unfamiliar with FP** — Requires buy-in and learning curve

Use Receta when:
- **Reliability matters** — Payment processing, auth, data pipelines
- **Error handling is complex** — Multiple failure modes need distinct handling
- **Type safety is critical** — Financial apps, healthcare, aerospace
- **Composability wins** — Building reusable utilities and services

---

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for:
- Development setup
- Testing guidelines
- Commit conventions
- Pull request process

---

## License

[MIT](./LICENSE) © 2026 Khaled Maher

---

## Acknowledgments

- Built on [Remeda](https://remedajs.com) — the best data-first/data-last FP library for TypeScript
- Inspired by Rust's `Result<T, E>` and `Option<T>` types
- Guided by practical FP principles from Scala, Haskell, and F#

---

**Receta: Where TypeScript meets elegance. Stop fighting runtime errors. Start composing solutions.**

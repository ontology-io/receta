# Option Constructors

> Creating Option values from data, nullable types, Results, and fallible operations.

## Overview

Constructors are functions that create `Option<T>` values. There are 5 main constructors:

| Constructor | Purpose | Use Case |
|------------|---------|----------|
| `some(value)` | Wrap a known value | When you have a value that exists |
| `none()` | Represent absence | When you know there's no value |
| `fromNullable(value)` | Convert nullable | Working with `T \| null \| undefined` |
| `fromResult(result)` | Convert from Result | When you don't need error details |
| `tryCatch(fn)` | Wrap throwing code | When function might throw |

## some()

Creates a `Some` Option containing a value.

```typescript
function some<T>(value: T): Some<T>
```

### Basic Usage

```typescript
import { some } from 'receta/option'

const num = some(42)
// => { _tag: 'Some', value: 42 }

const str = some('hello')
// => { _tag: 'Some', value: 'hello' }

const obj = some({ name: 'John', age: 30 })
// => { _tag: 'Some', value: { name: 'John', age: 30 } }
```

### Real-World: Database Query Success

```typescript
// When you successfully find a record
const findUserById = (id: string): Option<User> => {
  const user = users.find(u => u.id === id)
  return user ? some(user) : none()
}

// Usage
const user = findUserById('123')
// If found: Some({ id: '123', name: 'Alice', ... })
// If not found: None
```

### Real-World: API Response with Data

```typescript
// Stripe - Payment intent with amount
type PaymentIntent = {
  id: string
  amount: number
  currency: string
}

const getPaymentAmount = (intent: PaymentIntent): Option<number> =>
  some(intent.amount)

// Always returns Some because amount always exists
```

### When to Use

Use `some()` when:
- ✅ You have a value that definitely exists
- ✅ You're building an Option from known data
- ✅ You're returning success from a function that returns Option

Don't use `some()` for:
- ❌ Values that might be null/undefined (use `fromNullable` instead)
- ❌ Operations that might fail (use `tryCatch` instead)

## none()

Creates a `None` Option representing absence of a value.

```typescript
function none<T = never>(): None
```

### Basic Usage

```typescript
import { none } from 'receta/option'

const missing = none()
// => { _tag: 'None' }

// Type parameter is usually inferred from context
const noUser: Option<User> = none()
```

### Real-World: Database Query Miss

```typescript
// When record isn't found
const findUserByEmail = (email: string): Option<User> => {
  const user = users.find(u => u.email === email)
  return user ? some(user) : none()
}

// Usage
const user = findUserByEmail('notfound@example.com')
// => None
```

### Real-World: Optional Configuration

```typescript
// Feature flag that's not set
const getFeatureFlag = (name: string): Option<boolean> => {
  const flag = featureFlags[name]
  return flag !== undefined ? some(flag) : none()
}

// If flag doesn't exist
const isEnabled = getFeatureFlag('new-ui')
// => None
```

### Real-World: Search with No Results

```typescript
// GitHub API - searching with no matches
const searchRepos = (query: string): Option<Repo[]> => {
  const results = repos.filter(r => r.name.includes(query))
  return results.length > 0 ? some(results) : none()
}

// No repositories match
const repos = searchRepos('xyz123notfound')
// => None
```

### When to Use

Use `none()` when:
- ✅ You know there's no value
- ✅ An operation didn't find what it was looking for
- ✅ A search returned no results
- ✅ An optional field is missing

## fromNullable()

Converts nullable values (`T | null | undefined`) to Option.

```typescript
function fromNullable<T>(value: T | null | undefined): Option<T>
```

### Basic Usage

```typescript
import { fromNullable } from 'receta/option'

fromNullable(42)        // => Some(42)
fromNullable(null)      // => None
fromNullable(undefined) // => None

// Falsy values that are NOT null/undefined become Some
fromNullable(0)         // => Some(0)
fromNullable('')        // => Some('')
fromNullable(false)     // => Some(false)
```

### Real-World: Array.find()

```typescript
// Array.find returns T | undefined
const users = [
  { id: '1', name: 'Alice' },
  { id: '2', name: 'Bob' }
]

const findUser = (id: string): Option<User> =>
  fromNullable(users.find(u => u.id === id))

findUser('1') // => Some({ id: '1', name: 'Alice' })
findUser('99') // => None
```

### Real-World: DOM APIs

```typescript
// querySelector returns Element | null
const getElement = (selector: string): Option<Element> =>
  fromNullable(document.querySelector(selector))

const button = getElement('#submit-btn')
// If found: Some(Element)
// If not found: None
```

### Real-World: Map/Record Access

```typescript
// Map.get() returns V | undefined
const cache = new Map<string, User>()

const getCached = (key: string): Option<User> =>
  fromNullable(cache.get(key))

// Record access can be undefined
const config: Record<string, string> = { ... }

const getSetting = (key: string): Option<string> =>
  fromNullable(config[key])
```

### Real-World: API Responses with Null Fields

```typescript
// GitHub API - many fields are nullable
type GitHubUser = {
  login: string
  name: string | null
  bio: string | null
  company: string | null
  location: string | null
}

const getUserDisplay = (user: GitHubUser) => ({
  username: user.login,
  displayName: fromNullable(user.name),
  bio: fromNullable(user.bio),
  company: fromNullable(user.company),
  location: fromNullable(user.location)
})

// Can now use Option methods on all fields
pipe(
  getUserDisplay(githubUser),
  display => unwrapOr(display.displayName, display.username)
)
```

### When to Use

Use `fromNullable()` when:
- ✅ Working with APIs that return `null` or `undefined`
- ✅ Converting TypeScript nullable types to Option
- ✅ Array methods like `find()`, `at()`, `shift()`, `pop()`
- ✅ Map/Record access
- ✅ DOM APIs

## fromResult()

Converts a Result to an Option, discarding error information.

```typescript
function fromResult<T, E>(result: Result<T, E>): Option<T>
```

### Basic Usage

```typescript
import { fromResult } from 'receta/option'
import { ok, err } from 'receta/result'

fromResult(ok(42))          // => Some(42)
fromResult(err('error'))    // => None
fromResult(err({ code: 'NOT_FOUND' })) // => None (error details discarded)
```

### Real-World: Parsing When Error Doesn't Matter

```typescript
import { tryCatch as resultTryCatch } from 'receta/result'

// You have a Result from parsing
const parseJSON = (str: string): Result<unknown, SyntaxError> =>
  resultTryCatch(
    () => JSON.parse(str),
    e => e as SyntaxError
  )

// But you only care if it succeeded, not why it failed
const maybeData = (str: string): Option<unknown> =>
  fromResult(parseJSON(str))

maybeData('{"name":"John"}') // => Some({ name: 'John' })
maybeData('invalid')          // => None (SyntaxError discarded)
```

### Real-World: Validation Chain

```typescript
// Start with detailed validation
const validateEmail = (email: string): Result<string, ValidationError> => {
  if (!email.includes('@')) {
    return err({ field: 'email', message: 'Must contain @' })
  }
  if (email.length < 3) {
    return err({ field: 'email', message: 'Too short' })
  }
  return ok(email)
}

// In some contexts, you just need to know if it's valid
const hasValidEmail = (email: string): boolean =>
  pipe(
    validateEmail(email),
    fromResult,
    isSome
  )

hasValidEmail('user@example.com') // => true
hasValidEmail('invalid')           // => false (error details not needed)
```

### Real-World: Database Query with Error Logging

```typescript
// Query returns Result with error details
const queryUser = async (id: string): Promise<Result<User, DbError>> => {
  // ... database query that might fail
}

// In analytics, you only care about success rate
const trackUserLookup = async (id: string) => {
  const result = await queryUser(id)

  // Log full error elsewhere
  if (isErr(result)) {
    logger.error('User query failed', result.error)
  }

  // For metrics, just track success/failure
  const found = fromResult(result)
  metrics.increment('user_lookup', { found: isSome(found) })

  return found
}
```

### When to Use

Use `fromResult()` when:
- ✅ You have a Result but only care about success/failure
- ✅ Error details are logged elsewhere
- ✅ Converting detailed errors to simple presence/absence
- ✅ You need Option's composability but have a Result

Don't use if:
- ❌ You need the error information later
- ❌ Different errors should be handled differently

## tryCatch()

Wraps potentially throwing code, returning None if it throws.

```typescript
function tryCatch<T>(fn: () => T): Option<T>
```

### Basic Usage

```typescript
import { tryCatch } from 'receta/option'

// Success case
tryCatch(() => JSON.parse('{"name":"John"}'))
// => Some({ name: 'John' })

// Error case
tryCatch(() => JSON.parse('invalid'))
// => None

// Works with any throwing code
tryCatch(() => {
  if (Math.random() > 0.5) throw new Error('fail')
  return 42
})
// => Some(42) or None
```

### Real-World: JSON Parsing

```typescript
// Parse JSON, don't care about error details
const parseJSON = <T>(str: string): Option<T> =>
  tryCatch(() => JSON.parse(str) as T)

const config = parseJSON<Config>('{"timeout":5000}')
// => Some({ timeout: 5000 })

const invalid = parseJSON<Config>('not json')
// => None
```

### Real-World: Number Parsing

```typescript
// Parse and validate in one go
const parsePositiveInt = (str: string): Option<number> =>
  pipe(
    tryCatch(() => {
      const n = Number(str)
      if (Number.isNaN(n)) throw new Error('Not a number')
      if (n <= 0) throw new Error('Not positive')
      if (!Number.isInteger(n)) throw new Error('Not an integer')
      return n
    })
  )

parsePositiveInt('42')    // => Some(42)
parsePositiveInt('-5')    // => None
parsePositiveInt('3.14')  // => None
parsePositiveInt('abc')   // => None
```

### Real-World: URL Parsing

```typescript
// URL constructor throws on invalid URLs
const parseURL = (str: string): Option<URL> =>
  tryCatch(() => new URL(str))

parseURL('https://example.com')  // => Some(URL)
parseURL('not a url')             // => None

// Use in pipeline
const getHostname = (urlStr: string): string =>
  pipe(
    parseURL(urlStr),
    map(url => url.hostname),
    unwrapOr('unknown')
  )

getHostname('https://github.com/user/repo') // => 'github.com'
getHostname('invalid')                       // => 'unknown'
```

### Real-World: Date Parsing

```typescript
// Date constructor can create Invalid Date
const parseDate = (str: string): Option<Date> =>
  tryCatch(() => {
    const date = new Date(str)
    if (isNaN(date.getTime())) throw new Error('Invalid date')
    return date
  })

parseDate('2024-01-15')  // => Some(Date)
parseDate('not a date')  // => None
```

### When to Use

Use `tryCatch()` when:
- ✅ Function might throw but you don't need error details
- ✅ Parsing operations (JSON, numbers, URLs, dates)
- ✅ DOM operations that might fail
- ✅ Converting exceptions to Option

Use Result's `tryCatch` if:
- ❌ You need to know *why* it failed
- ❌ Different errors need different handling

## Comparison Table

| Constructor | Input | Output | Use Case |
|------------|-------|--------|----------|
| `some(42)` | Value | `Some(42)` | You have a value |
| `none()` | Nothing | `None` | You know it's missing |
| `fromNullable(null)` | `T \| null \| undefined` | `Some(T)` or `None` | Converting nullable types |
| `fromResult(ok(42))` | `Result<T, E>` | `Some(T)` or `None` | Discarding error details |
| `tryCatch(() => ...)` | Throwing function | `Some(T)` or `None` | Wrapping exceptions |

## Cheat Sheet

```typescript
// Create Some
const val = some(42)

// Create None
const missing = none()

// From nullable (most common)
const found = fromNullable(users.find(u => u.id === id))

// From Result (discard errors)
const succeeded = fromResult(validateEmail(email))

// From throwing code (parsing, etc)
const parsed = tryCatch(() => JSON.parse(str))
```

## Next Steps

- **[Type Guards](./02-transformers.md#type-guards)** - Checking if Option is Some or None
- **[Transformers](./02-transformers.md)** - Mapping and transforming Options
- **[Extractors](./03-extractors.md)** - Getting values out of Options
- **[Patterns](./05-patterns.md)** - Real-world constructor recipes

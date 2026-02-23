# Constructors: Creating Results

> How to create `Result` values from successful operations, failures, and risky code.

## Overview

| Function | Purpose | Real-World Analogy |
|----------|---------|-------------------|
| `ok(value)` | Wrap a successful value | HTTP 200 OK response |
| `err(error)` | Wrap a failure value | HTTP 400/500 error response |
| `tryCatch(fn)` | Catch exceptions as errors | try-catch block as a value |
| `tryCatchAsync(fn)` | Catch async exceptions | try-catch for Promises |
| `fromNullable(value, error)` | Convert null/undefined to error | Database query returning 0 rows |

---

## `ok(value)` - Success Response

**When to use**: You have a value and want to wrap it in a Result.

### Real-World: Stripe Payment Success

```typescript
import { ok } from 'receta/result'

// Stripe returns payment confirmation
const createCharge = (token: string, amount: number) => {
  const charge = {
    id: 'ch_abc123',
    amount: amount,
    status: 'succeeded',
    created: Date.now()
  }

  return ok(charge) // ✅ Explicit success
}

// Type: Result<Charge, never>
// "This function always succeeds"
```

### Real-World: GitHub API Success

```typescript
// When repo exists
const fetchRepo = async (owner: string, name: string) => {
  const repo = await fetch(`https://api.github.com/repos/${owner}/${name}`)
  return ok({
    name: repo.name,
    stars: repo.stargazers_count,
    language: repo.language
  })
}
```

**Pattern**: Use `ok()` when you're **certain** the operation succeeded and want to return a Result for consistency with other functions.

---

## `err(error)` - Explicit Failure

**When to use**: You know something failed and want to communicate the error clearly.

### Real-World: Stripe Card Declined

```typescript
import { err } from 'receta/result'

type CardError = {
  type: 'card_error'
  code: 'card_declined' | 'insufficient_funds' | 'expired_card'
  message: string
}

const validateCard = (cardNumber: string): Result<string, CardError> => {
  if (cardNumber.length !== 16) {
    return err({
      type: 'card_error',
      code: 'card_declined',
      message: 'Card number must be 16 digits'
    })
  }

  return ok(cardNumber)
}
```

### Real-World: AWS S3 Access Denied

```typescript
type S3Error = {
  code: 'AccessDenied' | 'NoSuchBucket' | 'NoSuchKey'
  message: string
  resource: string
}

const getObject = (bucket: string, key: string): Result<Buffer, S3Error> => {
  if (!hasPermission(bucket)) {
    return err({
      code: 'AccessDenied',
      message: 'You do not have permission to access this bucket',
      resource: `${bucket}/${key}`
    })
  }

  // ... fetch object
}
```

### Real-World: Form Validation Errors

```typescript
const validateEmail = (email: string) => {
  if (!email.includes('@')) {
    return err('Email must contain @')
  }
  if (email.length < 5) {
    return err('Email too short')
  }
  return ok(email)
}
```

**Pattern**: Use `err()` for **business logic failures** - when you can predict and describe what went wrong.

---

## `tryCatch(fn)` - Safe Operations

**When to use**: Code that **might throw exceptions** (like `JSON.parse`, `new URL`, etc.)

### Real-World: Parsing API Responses

```typescript
import { tryCatch } from 'receta/result'

// GitHub API returns JSON - but what if it's malformed?
const parseGitHubResponse = (body: string) =>
  tryCatch(() => JSON.parse(body))

// Type: Result<unknown, unknown>
parseGitHubResponse('{"login":"octocat"}') // Ok({ login: 'octocat' })
parseGitHubResponse('invalid json')         // Err(SyntaxError)
```

### Real-World: URL Parsing (Next.js, React Router)

```typescript
const parseUrl = (url: string) =>
  tryCatch(() => new URL(url))

parseUrl('https://example.com')  // Ok(URL)
parseUrl('not a url')            // Err(TypeError)
```

### Custom Error Mapping

```typescript
// Map raw errors to your domain errors
type ParseError = {
  type: 'parse_error'
  input: string
  reason: string
}

const parseJSON = <T>(str: string): Result<T, ParseError> =>
  tryCatch(
    () => JSON.parse(str) as T,
    (error) => ({
      type: 'parse_error',
      input: str.slice(0, 100), // First 100 chars
      reason: String(error)
    })
  )
```

### Real-World: Prisma Queries

```typescript
// Prisma can throw on constraint violations
const createUser = (email: string) =>
  tryCatch(
    () => db.user.create({ data: { email } }),
    (error) => {
      if (error.code === 'P2002') {
        return { type: 'duplicate_email', email }
      }
      return { type: 'database_error', error }
    }
  )
```

**Pattern**: Use `tryCatch` to **convert exceptions to values**. Map the error to match your domain language.

---

## `tryCatchAsync(fn)` - Async Safety

**When to use**: Async operations that might fail (fetch, database calls, file I/O).

### Real-World: Stripe API Calls

```typescript
import { tryCatchAsync } from 'receta/result'

type StripeError = {
  type: 'api_error' | 'network_error'
  message: string
}

const createCharge = async (
  token: string,
  amount: number
): Promise<Result<Charge, StripeError>> =>
  tryCatchAsync(
    async () => {
      const charge = await stripe.charges.create({
        amount,
        currency: 'usd',
        source: token
      })
      return charge
    },
    (error) => ({
      type: 'api_error',
      message: error.message
    })
  )

// Usage
const result = await createCharge('tok_visa', 1000)
match(result, {
  onOk: (charge) => console.log('Charged:', charge.id),
  onErr: (error) => console.error('Failed:', error.message)
})
```

### Real-World: Supabase/Database Queries

```typescript
const fetchUser = async (id: string) =>
  tryCatchAsync(
    async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error
      return data
    },
    (error) => ({
      code: 'DB_ERROR',
      message: error.message
    })
  )
```

### Real-World: File System Operations

```typescript
import fs from 'fs/promises'

const readConfig = async (path: string) =>
  tryCatchAsync(
    async () => {
      const content = await fs.readFile(path, 'utf8')
      return JSON.parse(content)
    },
    (error) => {
      if (error.code === 'ENOENT') {
        return { type: 'not_found', path }
      }
      if (error instanceof SyntaxError) {
        return { type: 'invalid_json', path }
      }
      return { type: 'unknown', error: String(error) }
    }
  )
```

### Real-World: Fetch with Timeout

```typescript
const fetchWithTimeout = async (url: string, timeout: number) =>
  tryCatchAsync(
    async () => {
      const controller = new AbortController()
      const id = setTimeout(() => controller.abort(), timeout)

      try {
        const res = await fetch(url, { signal: controller.signal })
        return res.json()
      } finally {
        clearTimeout(id)
      }
    },
    (error) => {
      if (error.name === 'AbortError') {
        return { type: 'timeout', url, timeout }
      }
      return { type: 'network', message: error.message }
    }
  )
```

**Pattern**: Use `tryCatchAsync` for **any async operation**. Map errors to domain-specific types.

---

## `fromNullable(value, error)` - Handle Missing Data

**When to use**: Database queries, `Array.find()`, optional config values, dictionary lookups.

### Real-World: Database Queries

```typescript
import { fromNullable } from 'receta/result'

// Prisma findFirst returns null if not found
const findUserByEmail = async (email: string) => {
  const user = await db.user.findFirst({ where: { email } })

  return fromNullable(user, {
    type: 'not_found',
    resource: 'user',
    query: { email }
  })
}

// Type: Result<User, { type: 'not_found', ... }>
```

### Real-World: Array.find() - Finding Products

```typescript
const products = [
  { id: '1', name: 'iPhone', price: 999 },
  { id: '2', name: 'MacBook', price: 1999 }
]

const findProduct = (id: string) =>
  fromNullable(
    products.find(p => p.id === id),
    { type: 'product_not_found', id }
  )

findProduct('1') // Ok({ id: '1', name: 'iPhone', ... })
findProduct('99') // Err({ type: 'product_not_found', id: '99' })
```

### Real-World: Config/Environment Variables

```typescript
// Next.js / Vite environment variables
const getEnvVar = (key: string) =>
  fromNullable(
    process.env[key],
    { type: 'missing_env_var', key }
  )

const config = pipe(
  getEnvVar('DATABASE_URL'),
  flatMap(url => getEnvVar('API_KEY').map(key => ({ url, key }))),
  unwrapOr({ url: 'default', key: 'default' })
)
```

### Real-World: URL Query Parameters

```typescript
// Express.js / Next.js API route
const getUserIdFromQuery = (query: Record<string, string | undefined>) =>
  fromNullable(
    query.userId,
    { type: 'missing_param', param: 'userId' }
  )

// app.get('/api/users', (req, res) => {
//   const result = getUserIdFromQuery(req.query)
//   ...
// })
```

### Real-World: localStorage (Browser)

```typescript
const getStoredUser = () =>
  pipe(
    fromNullable(localStorage.getItem('user'), 'No user in storage'),
    flatMap(str => tryCatch(() => JSON.parse(str))),
    mapErr(() => 'Invalid user data in storage')
  )
```

**Pattern**: Use `fromNullable` when an operation **might return nothing**, and you want to treat "nothing" as an error.

---

## Comparison Table

| Scenario | Constructor | Example |
|----------|-------------|---------|
| Always succeeds | `ok(value)` | Formatting a string |
| Known failure | `err(error)` | Validation fails |
| Might throw | `tryCatch(fn)` | `JSON.parse()` |
| Async might throw | `tryCatchAsync(fn)` | `fetch()`, database |
| Might be null | `fromNullable(value, error)` | `Array.find()`, `?.` |

---

## Common Patterns

### 1. Validation Chain

```typescript
const validateSignup = (email: string, password: string) =>
  pipe(
    validateEmail(email),           // Result<string, string>
    flatMap(() => validatePassword(password)), // Chains validations
    map(() => ({ email, password }))
  )
```

### 2. API Call with Fallback

```typescript
const fetchUserWithFallback = async (id: string) =>
  pipe(
    await tryCatchAsync(() => fetchFromPrimary(id)),
    match({
      onOk: (user) => ok(user),
      onErr: () => tryCatchAsync(() => fetchFromCache(id))
    })
  )
```

### 3. Required Config

```typescript
const loadConfig = () => {
  const dbUrl = fromNullable(process.env.DATABASE_URL, 'Missing DATABASE_URL')
  const apiKey = fromNullable(process.env.API_KEY, 'Missing API_KEY')

  return pipe(
    collect([dbUrl, apiKey]),
    map(([url, key]) => ({ databaseUrl: url, apiKey: key }))
  )
}
```

---

## Next Steps

- **[Transformers](./02-transformers.md)**: Work with Results using `map`, `flatMap`, etc.
- **[Extractors](./03-extractors.md)**: Get values out with `unwrap`, `match`
- **[Patterns](./04-patterns.md)**: Complete recipes for common scenarios

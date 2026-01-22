# Integration Guide

> Combining Function combinators with Result, Option, and Remeda for powerful pipelines.

## Overview

The Function module is designed to work seamlessly with Receta's Result and Option types, as well as Remeda's data transformation utilities. This guide shows you how to combine them effectively.

## Integration with Result

### Conditional Logic with Results

```typescript
import { pipe } from 'remeda'
import { ifElse, when, cond } from 'receta/function'
import { ok, err, isOk, map, flatMap, unwrapOr } from 'receta/result'

// Transform Results based on conditions
const processResult = <T>(result: Result<T, string>) =>
  pipe(
    result,
    when(
      isOk,
      (r) => map(r, (value) => ({ ...value, processed: true }))
    )
  )

// Multi-way error handling with cond
const handleError = cond<string, string>([
  [(err) => err.includes('network'), () => 'Network error - please retry'],
  [(err) => err.includes('auth'), () => 'Authentication failed'],
  [(err) => err.includes('not found'), () => 'Resource not found'],
  [() => true, (err) => `Unknown error: ${err}`]
])

const getErrorMessage = (result: Result<any, string>) =>
  isOk(result) ? 'Success' : unwrapOr(handleError(result.error), 'Error occurred')
```

### Safe Transformation Pipelines

```typescript
import { tryCatch } from 'receta/function'
import { flatMap, map } from 'receta/result'

interface User {
  id: string
  config: string // JSON string
}

const processUser = (user: User) =>
  pipe(
    user.config,
    // Parse JSON safely
    tryCatch((str: string) => JSON.parse(str)),
    // Transform if successful
    map((config) => ({
      ...user,
      parsedConfig: config
    })),
    // Validate
    flatMap(validateUser),
    // Add metadata
    map((validated) => ({
      ...validated,
      processedAt: new Date()
    }))
  )
```

### Combining tap with Result

```typescript
const processWithLogging = (data: string) =>
  pipe(
    data,
    tap((input) => logger.info('Input received', { length: input.length })),
    tryCatch(JSON.parse),
    tap((result) => {
      if (isOk(result)) {
        logger.info('Parse successful')
      } else {
        logger.error('Parse failed', result.error)
      }
    }),
    flatMap(validate),
    tap((result) => logger.info('Validation complete', { isOk: isOk(result) }))
  )
```

## Integration with Option

### Conditional Transformations

```typescript
import { cond, when } from 'receta/function'
import { some, none, isSome, unwrapOr, map } from 'receta/option'

// cond returns Option naturally
const classify = cond<number, string>([
  [(n) => n < 0, () => 'negative'],
  [(n) => n === 0, () => 'zero'],
  [(n) => n > 0, () => 'positive']
])

const result = pipe(
  5,
  classify,
  unwrapOr('unknown')
)
// => 'positive'
```

### Safe Lookups

```typescript
interface Config {
  [key: string]: any
}

const getSetting = (config: Config, key: string): Option<any> =>
  fromNullable(config[key])

const processConfig = (config: Config) =>
  pipe(
    getSetting(config, 'apiUrl'),
    when(
      isSome,
      (opt) => map(opt, (url: string) => url.trim())
    ),
    unwrapOr('https://api.default.com')
  )
```

## Integration with Remeda

### Combining map/filter with Function Utilities

```typescript
import { pipe, map, filter, reduce } from 'remeda'
import { when, tap, converge } from 'receta/function'

const processNumbers = pipe(
  [1, 2, 3, 4, 5, -1, -2],
  tap((nums) => console.log('Input:', nums)),
  map(when((n) => n < 0, Math.abs)),
  filter((n) => n > 2),
  tap((nums) => console.log('Filtered:', nums)),
  reduce((sum, n) => sum + n, 0)
)
// => 12
```

### Advanced Pipelines

```typescript
interface Product {
  id: string
  name: string
  price: number
  category: string
}

const analyzeProducts = pipe(
  map(when(
    (p: Product) => p.category === 'sale',
    (p) => ({ ...p, price: p.price * 0.9 })
  )),
  tap((products) => logger.info('Prices adjusted', { count: products.length })),
  converge(
    (total, count, categories) => ({
      totalValue: total,
      productCount: count,
      avgPrice: total / count,
      categories: categories.size
    }),
    [
      (products: Product[]) => reduce(products, (sum, p) => sum + p.price, 0),
      (products: Product[]) => products.length,
      (products: Product[]) => new Set(products.map(p => p.category))
    ]
  )
)
```

## Real-World Pattern: API Client

```typescript
import { pipe } from 'remeda'
import { tryCatch, tap, when, partial } from 'receta/function'
import { flatMap, map, mapErr } from 'receta/result'

interface ApiConfig {
  baseUrl: string
  headers: Record<string, string>
}

interface ApiError {
  status: number
  message: string
  timestamp: string
}

const createApiClient = (config: ApiConfig) => {
  const fetchApi = async (endpoint: string, options?: RequestInit) => {
    const url = `${config.baseUrl}${endpoint}`
    
    return pipe(
      url,
      tap((url) => logger.debug('Fetching', { url })),
      // Safe fetch
      tryCatch(
        async (url: string) => {
          const response = await fetch(url, {
            ...options,
            headers: { ...config.headers, ...(options?.headers || {}) }
          })
          
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`)
          }
          
          return response.json()
        },
        (error): ApiError => ({
          status: 500,
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString()
        })
      ),
      tap((result) => {
        if (isOk(result)) {
          logger.debug('Fetch successful')
        } else {
          logger.error('Fetch failed', result.error)
        }
      })
    )
  }
  
  return {
    get: partial(fetchApi),
    post: (endpoint: string, body: any) =>
      fetchApi(endpoint, {
        method: 'POST',
        body: JSON.stringify(body)
      })
  }
}

// Usage
const api = createApiClient({
  baseUrl: 'https://api.example.com',
  headers: { 'Authorization': `Bearer ${token}` }
})

const user = await pipe(
  await api.get('/users/123'),
  map((data) => ({
    ...data,
    fetchedAt: new Date()
  })),
  flatMap(validateUser),
  unwrapOr(null)
)
```

## Real-World Pattern: Form Validation

```typescript
import { pipe } from 'remeda'
import { when, unless, cond } from 'receta/function'
import { ok, err, flatMap, collect } from 'receta/result'

interface FormData {
  email: string
  password: string
  age?: number
}

interface ValidationError {
  field: string
  message: string
}

// Individual validators
const validateEmail = (email: string): Result<string, ValidationError> =>
  email.includes('@')
    ? ok(email.toLowerCase())
    : err({ field: 'email', message: 'Invalid email' })

const validatePassword = (password: string): Result<string, ValidationError> =>
  password.length >= 8
    ? ok(password)
    : err({ field: 'password', message: 'Password too short' })

const validateAge = (age?: number): Result<number, ValidationError> => {
  if (age === undefined) return ok(18) // default
  return age >= 18
    ? ok(age)
    : err({ field: 'age', message: 'Must be 18 or older' })
}

// Normalize form
const normalizeForm = (data: FormData): FormData =>
  pipe(
    data,
    when(
      (d) => d.email.includes(' '),
      (d) => ({ ...d, email: d.email.trim() })
    ),
    unless(
      (d) => d.age !== undefined,
      (d) => ({ ...d, age: 18 })
    )
  )

// Validate entire form
const validateForm = (data: FormData) =>
  pipe(
    data,
    normalizeForm,
    tap((form) => logger.debug('Normalized form', form)),
    (form) => collect([
      validateEmail(form.email),
      validatePassword(form.password),
      validateAge(form.age)
    ]),
    map(([email, password, age]) => ({
      email,
      password,
      age
    }))
  )

// Usage
const result = validateForm({
  email: ' USER@EXAMPLE.COM ',
  password: 'password123'
})

if (isOk(result)) {
  console.log('Valid:', result.value)
} else {
  console.error('Errors:', result.error)
}
```

## Best Practices

### 1. Prefer Result for Error Details

```typescript
// ✅ Result when you need error context
const parse = tryCatch(
  JSON.parse,
  (error) => ({ code: 'PARSE_ERROR', original: error })
)

// ✅ Option when error details don't matter
const findUser = (id: string): Option<User> =>
  fromNullable(users.find(u => u.id === id))
```

### 2. Use tap for Side Effects in Pipelines

```typescript
// ✅ Good: non-intrusive logging
pipe(
  data,
  tap(logInput),
  transform,
  tap(logTransformed),
  validate
)

// ❌ Bad: breaks the pipeline
pipe(
  data,
  (d) => { console.log(d); return d },
  transform
)
```

### 3. Combine Conditionals with Validation

```typescript
const processUser = pipe(
  normalizeEmail,
  when(needsVerification, sendVerificationEmail),
  flatMap(validateUser),
  tap(auditLog),
  unless(isActive, activateUser)
)
```

### 4. Handle All Result/Option Cases

```typescript
// ✅ Always handle both cases
const result = pipe(
  fetchData(),
  match(
    (data) => `Success: ${data}`,
    (error) => `Error: ${error}`
  )
)

// ❌ Don't unwrap without default
const result = unwrap(fetchData()) // Can throw!
```

## Next Steps

- **[Real-World Patterns](./07-real-world-patterns.md)** - More production examples
- **[API Reference](./08-api-reference.md)** - Complete function signatures

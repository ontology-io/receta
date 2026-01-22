# Control Flow Guide

> Manage side effects, errors, and performance with tap, tryCatch, and memoize.

## Overview

Control flow utilities help you handle cross-cutting concerns like logging, error handling, and performance without disrupting your main logic flow.

## tap - Non-Destructive Side Effects

The `tap` function executes a side effect and returns the original value unchanged.

### Signature

```typescript
function tap<T>(fn: (value: T) => void): (value: T) => T
```

### Basic Usage

```typescript
import { pipe } from 'remeda'
import { tap } from 'receta/function'

const result = pipe(
  42,
  tap((x) => console.log('Value:', x)),  // Logs: Value: 42
  (x) => x * 2
)
// => 84
```

### Debugging Pipelines

This is `tap`'s killer use case:

```typescript
import { pipe, map, filter } from 'remeda'

const processData = pipe(
  [1, 2, 3, 4, 5],
  tap((data) => console.log('Input:', data)),
  map((x) => x * 2),
  tap((data) => console.log('After doubling:', data)),
  filter((x) => x > 5),
  tap((data) => console.log('After filtering:', data))
)

// Logs:
// Input: [1, 2, 3, 4, 5]
// After doubling: [2, 4, 6, 8, 10]
// After filtering: [6, 8, 10]
```

### Real-World Example: Logging Pipeline

```typescript
interface User {
  id: string
  email: string
}

const logger = {
  info: (msg: string, data?: any) => console.log(`[INFO] ${msg}`, data),
  error: (msg: string, error?: any) => console.error(`[ERROR] ${msg}`, error)
}

const processUser = (userId: string) =>
  pipe(
    userId,
    tap((id) => logger.info('Fetching user', { id })),
    fetchUser,
    tap((user) => logger.info('User fetched', { email: user.email })),
    validateUser,
    tap((user) => logger.info('User validated', { id: user.id })),
    saveUser,
    tap((user) => logger.info('User saved', { id: user.id }))
  )
```

### Analytics and Tracking

```typescript
const trackEvent = (event: string, data: any) => {
  // Send to analytics service
  analytics.track(event, data)
}

const createOrder = pipe(
  buildOrder,
  tap((order) => trackEvent('order_created', { orderId: order.id })),
  validateOrder,
  tap((order) => trackEvent('order_validated', { orderId: order.id })),
  saveOrder,
  tap((order) => trackEvent('order_saved', { orderId: order.id, total: order.total }))
)
```

## tryCatch - Safe Function Execution

The `tryCatch` function wraps a potentially throwing function and returns a Result.

### Signature

```typescript
function tryCatch<Args extends readonly any[], T, E = unknown>(
  fn: (...args: Args) => T,
  onError?: (error: unknown) => E
): (...args: Args) => Result<T, E>
```

### Basic Usage

```typescript
import { tryCatch } from 'receta/function'
import { isOk, unwrap } from 'receta/result'

const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (error) => `Parse error: ${error}`
)

const result1 = parseJSON('{"valid": "json"}')
if (isOk(result1)) {
  console.log(unwrap(result1)) // => { valid: 'json' }
}

const result2 = parseJSON('invalid json')
if (!isOk(result2)) {
  console.log(result2.error) // => 'Parse error: ...'
}
```

### Creating Safe Versions of Functions

```typescript
// Unsafe divide function
const divide = (a: number, b: number) => {
  if (b === 0) throw new Error('Division by zero')
  return a / b
}

// Safe version
const safeDivide = tryCatch(divide)

safeDivide(10, 2)  // => Ok(5)
safeDivide(10, 0)  // => Err(Error('Division by zero'))
```

### Real-World Example: API Response Parsing

```typescript
interface ApiResponse {
  data: unknown
  status: number
}

interface ParsedUser {
  id: string
  name: string
  email: string
}

const parseUser = tryCatch(
  (response: ApiResponse): ParsedUser => {
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}`)
    }
    
    const data = response.data as any
    
    if (!data.id || !data.name || !data.email) {
      throw new Error('Invalid user data')
    }
    
    return {
      id: data.id,
      name: data.name,
      email: data.email
    }
  },
  (error) => ({
    code: 'PARSE_ERROR',
    message: error instanceof Error ? error.message : String(error)
  })
)

const response: ApiResponse = {
  status: 200,
  data: { id: '1', name: 'Alice', email: 'alice@example.com' }
}

const result = parseUser(response)
```

### Combining with Result Operations

```typescript
import { pipe } from 'remeda'
import { tryCatch } from 'receta/function'
import { map, flatMap, unwrapOr } from 'receta/result'

const processConfig = (jsonString: string) =>
  pipe(
    jsonString,
    tryCatch(JSON.parse),
    map((config) => ({
      ...config,
      validated: true
    })),
    flatMap(validateConfig),
    unwrapOr({ default: true })
  )
```

## memoize - Cache Function Results

The `memoize` function caches results based on the first argument.

### Signature

```typescript
function memoize<Args extends readonly any[], R>(
  fn: (...args: Args) => R
): (...args: Args) => R
```

### Basic Usage

```typescript
import { memoize } from 'receta/function'

let callCount = 0

const expensive = memoize((n: number) => {
  callCount++
  return n * 2
})

expensive(5)  // Computed, callCount = 1
expensive(5)  // Cached, callCount still 1
expensive(10) // Computed, callCount = 2
```

### Classic Example: Fibonacci

```typescript
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

// Without memoization: exponential time
// With memoization: linear time

console.time('First')
fibonacci(40) // => 102334155
console.timeEnd('First') // ~10ms

console.time('Cached')
fibonacci(40) // => 102334155
console.timeEnd('Cached') // ~0ms
```

### Real-World Example: API Client

```typescript
const fetchUser = memoize(async (userId: string) => {
  const response = await fetch(`/api/users/${userId}`)
  return response.json()
})

// First call: makes HTTP request
await fetchUser('user-1')

// Second call: returns cached result
await fetchUser('user-1')

// Different argument: makes new request
await fetchUser('user-2')
```

### Cache Invalidation

Note: The basic `memoize` uses the first argument as cache key and never expires.

For more advanced caching (TTL, LRU, custom keys), use the `memo` module:

```typescript
import { memoizeBy, memoizeAsync } from 'receta/memo'

// Custom cache key
const fetchByQuery = memoizeBy(
  async (params: QueryParams) => fetchData(params),
  (params) => JSON.stringify(params)
)

// TTL cache
import { ttl } from 'receta/memo'

const fetchWithTTL = ttl(
  async (id: string) => fetchData(id),
  { ttl: 60000 } // 1 minute
)
```

## Combining Control Flow Utilities

You can combine these utilities for powerful pipelines:

```typescript
import { pipe } from 'remeda'
import { tap, tryCatch, memoize } from 'receta/function'

const processData = pipe(
  tap((input) => logger.debug('Processing', input)),
  tryCatch(parseInput),
  tap((result) => logger.debug('Parsed', result)),
  map(transform),
  tap((result) => logger.debug('Transformed', result))
)

// With memoization
const processDataCached = memoize(processData)
```

## Best Practices

### 1. Use tap for Pure Logging

```typescript
// ✅ Good: side effects only
tap((user) => logger.info('User fetched', user))

// ❌ Bad: modifying data
tap((user) => { user.processed = true; return user })
```

### 2. Transform Errors in tryCatch

```typescript
// ✅ Good: structured error
tryCatch(
  parse,
  (error) => ({
    code: 'PARSE_ERROR',
    message: error instanceof Error ? error.message : 'Unknown error',
    original: error
  })
)

// ❌ Bad: losing error information
tryCatch(parse, () => 'Error occurred')
```

### 3. Document Memoization Behavior

```typescript
/**
 * Fetches user data with caching.
 * 
 * ⚠️ Results are cached permanently by user ID.
 * Use `clearCache()` to invalidate.
 */
const fetchUser = memoize(...)
```

### 4. Conditional Logging with tap

```typescript
const debugTap = process.env.NODE_ENV === 'development'
  ? tap
  : (_fn: any) => (x: any) => x // No-op in production

pipe(
  data,
  debugTap((x) => console.log('Debug:', x)),
  transform
)
```

## Next Steps

- **[Integration Guide](./06-integration-guide.md)** - Combine with Result and Option
- **[Real-World Patterns](./07-real-world-patterns.md)** - Production examples
- **[API Reference](./08-api-reference.md)** - Complete function signatures

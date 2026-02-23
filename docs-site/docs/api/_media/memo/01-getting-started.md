# Getting Started with Memo

> Learn the basics of function memoization in 10 minutes.

## Table of Contents

1. [Why Memoization?](#why-memoization)
2. [Installation](#installation)
3. [Your First Memoized Function](#your-first-memoized-function)
4. [Common Use Cases](#common-use-cases)
5. [Next Steps](#next-steps)

---

## Why Memoization?

### The Problem: Repeated Expensive Work

```typescript
// Expensive computation
function fibonacci(n: number): number {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

fibonacci(40) // Takes ~1 second
fibonacci(40) // Takes ~1 second again! (wasteful)
fibonacci(40) // Takes ~1 second again! (wasteful)
```

**Problem**: Same input, same output, but we're recomputing every time.

### The Solution: Memoization

```typescript
import { memoize } from 'receta/memo'

const memoFib = memoize(fibonacci)

memoFib(40) // Takes ~1 second (computed)
memoFib(40) // Takes <1ms (cached!)
memoFib(40) // Takes <1ms (cached!)
```

**Benefit**: 1000x+ speedup for cached calls.

---

## Installation

Receta is built on Remeda and requires it as a peer dependency:

```bash
# Using bun (recommended)
bun add receta remeda

# Using npm
npm install receta remeda

# Using yarn
yarn add receta remeda

# Using pnpm
pnpm add receta remeda
```

**TypeScript Configuration**

Receta requires TypeScript 5.0+ with strict mode:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}
```

---

## Your First Memoized Function

### Step 1: Import

```typescript
import { memoize } from 'receta/memo'
```

### Step 2: Wrap Your Function

```typescript
// Original function
function getUserById(id: string): User {
  console.log(`Fetching user ${id}`)
  return database.users.find(u => u.id === id)!
}

// Memoized version
const memoGetUserById = memoize(getUserById)
```

### Step 3: Use It

```typescript
const user1 = memoGetUserById('123')
// Console: "Fetching user 123"

const user2 = memoGetUserById('123')
// (no console output - cached!)

console.log(user1 === user2) // true (same object)
```

### How It Works

1. **First call**: Function executes, result cached with argument as key
2. **Subsequent calls**: If argument matches, return cached result
3. **Different argument**: Execute function, cache new result

---

## Common Use Cases

### 1. Expensive Computations

```typescript
import { memoize } from 'receta/memo'

const factorial = memoize((n: number): number => {
  if (n <= 1) return 1
  return n * factorial(n - 1)
})

factorial(100) // Computed
factorial(100) // Cached (instant)
```

**When to use**: Mathematical computations, parsing, transformations

### 2. API Calls

```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

const fetchUser = memoizeAsync(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  },
  { cache: ttlCache(5 * 60 * 1000) } // 5 min cache
)

await fetchUser('123') // API call
await fetchUser('123') // Cached (no network!)
```

**When to use**: API responses, external data, slow network calls

### 3. Database Queries

```typescript
import { memoizeAsync, lruCache } from 'receta/memo'

const queryUsers = memoizeAsync(
  async (filter: string) => {
    return await db.query(`SELECT * FROM users WHERE ${filter}`)
  },
  {
    keyFn: (filter) => filter,
    cache: lruCache(50) // Keep last 50 queries
  }
)

await queryUsers('active = true') // DB query
await queryUsers('active = true') // Cached
```

**When to use**: Read-heavy queries, configuration data, lookups

### 4. Image Processing

```typescript
import { memoizeBy, lruCache } from 'receta/memo'

interface ImageOptions {
  url: string
  width: number
  height: number
}

const resizeImage = memoizeBy(
  (opts: ImageOptions) => processImage(opts),
  (opts) => `${opts.url}:${opts.width}x${opts.height}`,
  { cache: lruCache(100) }
)

resizeImage({ url: 'photo.jpg', width: 800, height: 600 }) // Processed
resizeImage({ url: 'photo.jpg', width: 800, height: 600 }) // Cached
```

**When to use**: Image/video transformations, file processing

---

## Quick Comparison

### Without Memoization

```typescript
// ❌ Problems:
// - Repeated work
// - Slow performance
// - Wasted resources
// - No request deduplication

async function getWeather(city: string) {
  const res = await fetch(`/api/weather/${city}`)
  return res.json()
}

// Multiple components requesting same data
const [a, b, c] = await Promise.all([
  getWeather('NYC'), // API call
  getWeather('NYC'), // API call (duplicate!)
  getWeather('NYC')  // API call (duplicate!)
]) // 3 API calls for same data!
```

### With Memoization

```typescript
// ✅ Benefits:
// - Work done once
// - Fast subsequent calls
// - Efficient resource use
// - Request deduplication

import { memoizeAsync } from 'receta/memo'

const getWeather = memoizeAsync(async (city: string) => {
  const res = await fetch(`/api/weather/${city}`)
  return res.json()
})

const [a, b, c] = await Promise.all([
  getWeather('NYC'), // API call
  getWeather('NYC'), // Deduplicated!
  getWeather('NYC')  // Deduplicated!
]) // Only 1 API call!
```

---

## Understanding Cache Keys

### Single Argument (Automatic)

```typescript
import { memoize } from 'receta/memo'

// Cache key = first argument
const double = memoize((n: number) => n * 2)

double(5) // Cache key: 5
double(5) // Cache hit!
```

### Multiple Arguments (Manual Key)

```typescript
import { memoizeBy } from 'receta/memo'

// Custom key function
const add = memoizeBy(
  (a: number, b: number) => a + b,
  (a, b) => `${a},${b}` // Cache key
)

add(2, 3) // Cache key: "2,3"
add(2, 3) // Cache hit!
add(3, 2) // Cache key: "3,2" (different key, computed)
```

### Object Arguments (Serialize)

```typescript
import { memoizeBy } from 'receta/memo'

interface Options {
  id: string
  type: string
}

const fetchData = memoizeBy(
  (opts: Options) => api.fetch(opts),
  (opts) => JSON.stringify(opts) // Serialize to key
)

fetchData({ id: '1', type: 'user' }) // Computed
fetchData({ id: '1', type: 'user' }) // Cached
```

---

## Cache Invalidation

### Manual Clearing

```typescript
import { memoize, clearCache } from 'receta/memo'

const getUser = memoize(fetchUser)

getUser('123') // Computed
getUser('123') // Cached

// Clear cache when data changes
clearCache(getUser)

getUser('123') // Recomputed
```

### Alternative Syntax

```typescript
const getUser = memoize(fetchUser)

getUser('123') // Computed
getUser('123') // Cached

// Using .clear() method
getUser.clear()

getUser('123') // Recomputed
```

### Time-Based Expiration

```typescript
import { memoize, ttlCache } from 'receta/memo'

const getWeather = memoize(fetchWeather, {
  cache: ttlCache(5 * 60 * 1000) // 5 min TTL
})

getWeather('NYC') // Computed
getWeather('NYC') // Cached

// After 5 minutes...
getWeather('NYC') // Recomputed (expired)
```

---

## Performance Tips

### ✅ Good Candidates for Memoization

- **Pure functions** (same input → same output)
- **Expensive computations** (parsing, calculations)
- **API calls** (network latency)
- **Database queries** (I/O bound)
- **Recursive algorithms** (fibonacci, factorial)

### ❌ Poor Candidates

- **Functions with side effects** (logging, I/O)
- **Random outputs** (Math.random, Date.now)
- **Always-unique arguments** (no cache hits)
- **Memory-intensive results** (large objects)
- **Real-time data** (stock prices, live feeds)

---

## Common Pitfalls

### Pitfall 1: Memoizing Impure Functions

```typescript
// ❌ Bad: Side effects
const log = memoize((msg: string) => {
  console.log(msg) // Side effect!
  return msg
})

log('hello') // Logs "hello"
log('hello') // Cached - doesn't log! (unexpected)
```

### Pitfall 2: Forgetting Multi-Arg Keys

```typescript
// ❌ Bad: Only uses first argument
const add = memoize((a: number, b: number) => a + b)

add(2, 3) // 5, cache key: 2
add(2, 5) // 5 (WRONG! cached from key 2)

// ✅ Good: Custom key function
const add = memoizeBy(
  (a: number, b: number) => a + b,
  (a, b) => `${a},${b}`
)
```

### Pitfall 3: Unbounded Cache Growth

```typescript
// ❌ Bad: Unbounded cache
const process = memoize(expensiveProcess)

for (let i = 0; i < 1000000; i++) {
  process(i) // Cache grows to 1M entries! (OOM)
}

// ✅ Good: Use LRU cache
import { lruCache } from 'receta/memo'

const process = memoize(expensiveProcess, {
  cache: lruCache(1000) // Max 1000 entries
})
```

---

## Next Steps

Now that you understand the basics:

1. **Learn cache strategies** → [Core Concepts](./02-core-concepts.md)
2. **See real-world examples** → [Practical Examples](./03-practical-examples.md)
3. **Understand TypeScript types** → [TypeScript Integration](./04-typescript-integration.md)
4. **Handle errors properly** → [Error Handling](./05-error-handling.md)

### Quick Reference

```typescript
import {
  memoize,      // Single-arg caching
  memoizeBy,    // Custom key extraction
  memoizeAsync, // Async + deduplication
  ttlCache,     // Time-based expiration
  lruCache,     // Memory-limited
  weakCache,    // GC-friendly
  clearCache    // Invalidate cache
} from 'receta/memo'

// Basic
const fast = memoize(slow)

// Multi-arg
const add = memoizeBy((a, b) => a + b, (a, b) => `${a},${b}`)

// Async
const fetch = memoizeAsync(async (id) => await api.get(id))

// TTL
const weather = memoize(getWeather, { cache: ttlCache(60000) })

// LRU
const user = memoize(getUser, { cache: lruCache(100) })
```

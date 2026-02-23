# Memo Module Documentation

Complete guide to function memoization - cache expensive computations, deduplicate requests, and optimize performance.

## Quick Start

```typescript
import { memoize, memoizeAsync, ttlCache, lruCache } from 'receta/memo'

// Basic memoization
const fibonacci = memoize((n: number) => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

fibonacci(40) // computed
fibonacci(40) // cached (instant!)

// Async with TTL cache
const fetchWeather = memoizeAsync(
  async (city: string) => api.getWeather(city),
  { cache: ttlCache(5 * 60 * 1000) } // 5 min cache
)

// Request deduplication
const [a, b, c] = await Promise.all([
  fetchWeather('NYC'), // API call
  fetchWeather('NYC'), // deduplicated
  fetchWeather('NYC')  // deduplicated
]) // Only 1 actual API call!
```

## Documentation Structure

### 📚 Learning Path

**New to Memoization?** Follow this order:

1. **[Getting Started](./01-getting-started.md)** - Installation, first memoized function
2. **[Core Concepts](./02-core-concepts.md)** - memoize, memoizeBy, cache strategies
3. **[Practical Examples](./03-practical-examples.md)** - API caching, DB queries, computations
4. **[TypeScript Integration](./04-typescript-integration.md)** - Type inference, generics
5. **[Error Handling](./05-error-handling.md)** - Failed promises, cache invalidation
6. **[Patterns](./06-patterns.md)** - Best practices, anti-patterns, performance
7. **[Migration Guide](./07-migration.md)** - From manual caching to Memo
8. **[API Reference](./08-api-reference.md)** - Quick lookup

### 📖 By Topic

#### I want to understand...

- **Why memoization?** → [Getting Started: Why Memo?](./01-getting-started.md#why-memoization)
- **Basic caching** → [Core Concepts: memoize](./02-core-concepts.md#memoize)
- **Custom cache keys** → [Core Concepts: memoizeBy](./02-core-concepts.md#memoizeby)
- **Async caching** → [Core Concepts: memoizeAsync](./02-core-concepts.md#memoizeasync)
- **Cache strategies** → [Core Concepts: TTL/LRU/WeakMap](./02-core-concepts.md#cache-strategies)

#### I want examples for...

- **API response caching** → [Practical Examples: API](./03-practical-examples.md#api-caching)
- **Database query caching** → [Practical Examples: Database](./03-practical-examples.md#database-queries)
- **Expensive computations** → [Practical Examples: Computations](./03-practical-examples.md#expensive-computations)
- **Image processing** → [Practical Examples: Image Processing](./03-practical-examples.md#image-processing)
- **Request deduplication** → [Practical Examples: Deduplication](./03-practical-examples.md#request-deduplication)

#### I need to...

- **Migrate manual caching** → [Migration Guide](./07-migration.md)
- **Choose cache strategy** → [Patterns: Cache Selection](./06-patterns.md#choosing-cache-strategy)
- **Quick function lookup** → [API Reference](./08-api-reference.md)
- **Debug cache misses** → [Patterns: Debugging](./06-patterns.md#debugging-cache-misses)

## Key Concepts

### What is Memoization?

Memoization is caching function results based on arguments:

```typescript
// Without memoization
const slow = (n: number) => {
  // expensive computation
  return result
}
slow(42) // computes
slow(42) // computes again (wasteful!)

// With memoization
const fast = memoize(slow)
fast(42) // computes
fast(42) // cached (instant!)
```

### Why Memo over manual caching?

✅ **Automatic** - No manual cache logic
✅ **Type-safe** - Infers argument and return types
✅ **Composable** - Works with any function
✅ **Pluggable** - TTL, LRU, WeakMap strategies
✅ **Request deduplication** - Concurrent async calls share work
✅ **Production-ready** - Memory management, expiration, GC-friendly

❌ Manual caching is error-prone
❌ Duplicate request logic everywhere
❌ Hard to invalidate properly
❌ Memory leaks from unbounded caches
❌ No request deduplication

## Core Functions

### Memoization

| Function | Use Case | Example |
|----------|----------|---------|
| `memoize(fn)` | Single-argument functions | `memoize((id: string) => fetchUser(id))` |
| `memoizeBy(fn, keyFn)` | Multi-arg or complex keys | `memoizeBy((a, b) => a + b, (a, b) => \`${a},${b}\`)` |
| `memoizeAsync(fn)` | Async with deduplication | `memoizeAsync(async (id) => await fetch(id))` |

### Cache Strategies

| Strategy | When to Use | Example |
|----------|-------------|---------|
| `Map` (default) | Simple, unbounded | `memoize(fn)` |
| `ttlCache(ms)` | Time-sensitive data | `memoize(fn, { cache: ttlCache(60000) })` |
| `lruCache(n)` | Memory-limited | `memoize(fn, { cache: lruCache(100) })` |
| `weakCache()` | Object keys, GC-friendly | `memoizeBy(fn, x => x, { cache: weakCache() })` |

### Utilities

| Function | Purpose | Example |
|----------|---------|---------|
| `clearCache(memoized)` | Invalidate cache | `clearCache(fetchUser)` |
| `memoized.clear()` | Alternative syntax | `fetchUser.clear()` |
| `memoized.cache` | Direct cache access | `fetchUser.cache.has(123)` |

## Common Patterns

### API Response Caching

```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

const fetchUser = memoizeAsync(
  async (id: string) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  },
  { cache: ttlCache(5 * 60 * 1000) } // 5 min TTL
)

// Multiple components request same user
const user = await fetchUser('123') // API call
const same = await fetchUser('123') // cached
```

### Request Deduplication

```typescript
// Prevent duplicate in-flight requests
const getData = memoizeAsync(async (id: string) => {
  return await expensiveAPICall(id)
})

// All 3 requests share the same promise
const [a, b, c] = await Promise.all([
  getData('foo'),
  getData('foo'),
  getData('foo')
]) // Only 1 API call!
```

### Expensive Computations

```typescript
import { memoize } from 'receta/memo'

const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

fibonacci(100) // fast with memoization
```

### Memory-Limited Caching

```typescript
import { memoize, lruCache } from 'receta/memo'

// Cache only last 50 users
const getUser = memoize(fetchUser, {
  cache: lruCache(50)
})
```

## Performance Benefits

### Before Memoization

```typescript
// Expensive computation
const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

fibonacci(40) // ~1 second
fibonacci(40) // ~1 second (recomputed!)
```

### After Memoization

```typescript
const memoFib = memoize(fibonacci)

memoFib(40) // ~1 second (first call)
memoFib(40) // <1ms (cached!)
```

**Speedup: 1000x+ for cached calls**

## When to Use Memo

### ✅ Good Use Cases

- API response caching
- Database query results
- Expensive computations (fibonacci, parsing, etc.)
- Image/video transformations
- Configuration loading
- Dependency resolution
- Recursive algorithms

### ❌ Avoid When

- Function has side effects (I/O, mutations)
- Results change frequently
- Arguments are always unique
- Memory is extremely constrained
- Real-time data required

## Quick Reference

```typescript
import {
  // Core functions
  memoize,
  memoizeBy,
  memoizeAsync,

  // Cache strategies
  ttlCache,
  lruCache,
  weakCache,

  // Utilities
  clearCache
} from 'receta/memo'

// Basic
const fast = memoize(slow)

// Custom key
const add = memoizeBy((a, b) => a + b, (a, b) => `${a},${b}`)

// Async
const fetch = memoizeAsync(async (id) => await api.get(id))

// TTL cache
const weather = memoize(getWeather, { cache: ttlCache(60000) })

// LRU cache
const user = memoize(getUser, { cache: lruCache(100) })

// WeakMap cache
const process = memoizeBy(processNode, n => n, { cache: weakCache() })

// Clear cache
clearCache(fast)
fast.clear() // alternative
```

## Next Steps

- **New to memoization?** → Start with [Getting Started](./01-getting-started.md)
- **Need examples?** → Jump to [Practical Examples](./03-practical-examples.md)
- **Migrating code?** → See [Migration Guide](./07-migration.md)
- **Quick lookup?** → Use [API Reference](./08-api-reference.md)

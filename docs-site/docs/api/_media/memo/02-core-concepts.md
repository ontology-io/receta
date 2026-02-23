# Core Concepts

> Deep dive into memoization functions and cache strategies.

## Table of Contents

1. [memoize()](#memoize)
2. [memoizeBy()](#memoizeby)
3. [memoizeAsync()](#memoizeasync)
4. [Cache Strategies](#cache-strategies)
5. [Cache Interface](#cache-interface)

---

## memoize()

Basic memoization for single-argument functions.

### Signature

```typescript
function memoize<Args extends readonly [unknown, ...unknown[]], R>(
  fn: (...args: Args) => R,
  options?: MemoizeOptions
): MemoizedFunction<Args, R>
```

### How It Works

```typescript
import { memoize } from 'receta/memo'

const expensive = (n: number) => {
  console.log(`Computing ${n}`)
  return n * 2
}

const memoExpensive = memoize(expensive)

memoExpensive(5) // Console: "Computing 5", returns 10
memoExpensive(5) // (no console output), returns 10 (cached)
memoExpensive(10) // Console: "Computing 10", returns 20
```

**Cache Key**: Uses the **first argument** as the cache key.

### When to Use

✅ **Good for**:
- Functions with single argument
- Functions where first argument uniquely identifies result
- Simple caching needs

❌ **Not suitable for**:
- Multi-argument functions (use `memoizeBy` instead)
- Functions where multiple args affect result

### Examples

#### Fibonacci

```typescript
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

fibonacci(40) // Fast with memoization!
```

#### User Lookup

```typescript
const getUserById = memoize((id: string): User => {
  return database.users.find(u => u.id === id)!
})

getUserById('123') // DB query
getUserById('123') // Cached
```

#### Parse JSON

```typescript
const parseConfig = memoize((json: string) => {
  return JSON.parse(json)
})

parseConfig('{"a":1}') // Parsed
parseConfig('{"a":1}') // Cached
```

### Options

```typescript
interface MemoizeOptions {
  cache?: Cache<unknown, unknown>
  maxSize?: number
  ttl?: number
}
```

#### With maxSize

```typescript
const getUser = memoize(fetchUser, {
  maxSize: 100 // Keep max 100 entries
})
```

#### With Custom Cache

```typescript
import { ttlCache } from 'receta/memo'

const getWeather = memoize(fetchWeather, {
  cache: ttlCache(5 * 60 * 1000) // 5 min expiration
})
```

---

## memoizeBy()

Memoization with custom key extraction.

### Signature

```typescript
function memoizeBy<Args extends readonly unknown[], R, K>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => K,
  options?: MemoizeOptions<K>
): MemoizedFunction<Args, R>
```

### How It Works

```typescript
import { memoizeBy } from 'receta/memo'

const add = memoizeBy(
  (a: number, b: number) => a + b,
  (a, b) => `${a},${b}` // Custom cache key
)

add(2, 3) // Cache key: "2,3", returns 5
add(2, 3) // Cache hit, returns 5
add(3, 2) // Cache key: "3,2", computes 5
```

**Cache Key**: Determined by the `keyFn` function.

### When to Use

✅ **Good for**:
- Multi-argument functions
- Object/array arguments
- Custom cache key logic
- Complex equality checks

### Examples

#### Multi-Argument Functions

```typescript
const multiply = memoizeBy(
  (a: number, b: number) => a * b,
  (a, b) => `${a}*${b}`
)

multiply(3, 4) // Computed: 12
multiply(3, 4) // Cached: 12
```

#### Object Arguments

```typescript
interface FetchOptions {
  id: string
  include?: string[]
}

const fetchData = memoizeBy(
  (opts: FetchOptions) => api.fetch(opts),
  (opts) => JSON.stringify(opts) // Serialize object to key
)

fetchData({ id: '1', include: ['profile'] }) // Computed
fetchData({ id: '1', include: ['profile'] }) // Cached
```

#### Nested Property Access

```typescript
interface Order {
  customer: {
    address: {
      country: string
    }
  }
  items: Item[]
}

const calculateShipping = memoizeBy(
  (order: Order) => computeShippingCost(order),
  (order) => order.customer.address.country // Key by country
)
```

#### Combining Multiple Args

```typescript
const formatDate = memoizeBy(
  (date: Date, format: string, locale: string) => {
    return Intl.DateTimeFormat(locale).format(date)
  },
  (date, format, locale) => `${date.getTime()}:${format}:${locale}`
)
```

### Key Function Strategies

#### Strategy 1: String Concatenation

```typescript
memoizeBy(
  (a, b, c) => compute(a, b, c),
  (a, b, c) => `${a}:${b}:${c}`
)
```

#### Strategy 2: JSON Serialization

```typescript
memoizeBy(
  (opts) => process(opts),
  (opts) => JSON.stringify(opts)
)
```

#### Strategy 3: Object Reference

```typescript
memoizeBy(
  (node) => transform(node),
  (node) => node // Use object as key (with WeakMap cache)
)
```

#### Strategy 4: Selective Properties

```typescript
interface User {
  id: string
  name: string
  email: string
}

memoizeBy(
  (user) => formatUser(user),
  (user) => user.id // Only cache by ID
)
```

---

## memoizeAsync()

Async memoization with request deduplication.

### Signature

```typescript
function memoizeAsync<Args extends readonly unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  options?: MemoizeOptions & { keyFn?: KeyFn<Args, unknown> }
): MemoizedAsyncFunction<Args, R>
```

### How It Works

```typescript
import { memoizeAsync } from 'receta/memo'

const fetchUser = memoizeAsync(async (id: string) => {
  console.log(`[API] Fetching ${id}`)
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})

await fetchUser('123') // Console: "[API] Fetching 123"
await fetchUser('123') // (cached, no console output)
```

### Request Deduplication

**Key Feature**: Concurrent requests to the same key share a single promise.

```typescript
// All 3 requests share the same promise!
const [a, b, c] = await Promise.all([
  fetchUser('123'), // Triggers API call
  fetchUser('123'), // Waits for same promise
  fetchUser('123')  // Waits for same promise
])

console.log(a === b && b === c) // true (same object)
```

**Without memoization**: 3 separate API calls
**With memoization**: 1 API call, 3 references to result

### When to Use

✅ **Good for**:
- API calls
- Database queries
- File I/O
- Any async operation
- Thundering herd prevention

### Examples

#### API Client

```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

class APIClient {
  private fetchUser = memoizeAsync(
    async (id: string) => {
      const res = await fetch(`/api/users/${id}`)
      return res.json()
    },
    { cache: ttlCache(5 * 60 * 1000) } // 5 min cache
  )

  getUser(id: string) {
    return this.fetchUser(id)
  }

  clearCache() {
    this.fetchUser.clear()
  }
}
```

#### Database Queries

```typescript
const queryUsers = memoizeAsync(
  async (filter: string) => {
    return await db.query(`SELECT * FROM users WHERE ${filter}`)
  },
  {
    keyFn: (filter) => filter,
    cache: lruCache(50) // Cache last 50 queries
  }
)

await queryUsers('active = true') // DB query
await queryUsers('active = true') // Cached
```

#### Image Processing

```typescript
interface ImageOpts {
  url: string
  width: number
  height: number
}

const resizeImage = memoizeAsync(
  async (opts: ImageOpts) => {
    const image = await loadImage(opts.url)
    return await resize(image, opts.width, opts.height)
  },
  {
    keyFn: (opts) => `${opts.url}:${opts.width}x${opts.height}`,
    cache: lruCache(100)
  }
)
```

### Error Handling

Failed promises are **NOT cached**:

```typescript
let callCount = 0

const flaky = memoizeAsync(async (id: string) => {
  callCount++
  if (callCount === 1) throw new Error('First call fails')
  return `Success: ${id}`
})

await flaky('123').catch(e => console.log(e.message))
// Console: "First call fails"

await flaky('123') // Retries! (not cached)
// Returns: "Success: 123"
```

### Custom Key Function

```typescript
interface QueryOpts {
  table: string
  where: Record<string, unknown>
  limit: number
}

const query = memoizeAsync(
  async (opts: QueryOpts) => db.query(opts),
  { keyFn: (opts) => JSON.stringify(opts) }
)

await query({ table: 'users', where: { active: true }, limit: 10 })
```

---

## Cache Strategies

### Default: Map Cache

```typescript
const fn = memoize(expensive)
// Uses: new Map()
```

**Characteristics**:
- ✅ Simple, fast
- ✅ No memory limit
- ❌ No expiration
- ❌ Can grow unbounded

### TTL Cache (Time-to-Live)

```typescript
import { ttlCache } from 'receta/memo'

const getWeather = memoize(fetchWeather, {
  cache: ttlCache(5 * 60 * 1000) // 5 minutes
})
```

**Characteristics**:
- ✅ Auto-expiration
- ✅ Fresh data
- ✅ Predictable memory
- ⚠️ Periodic cleanup needed

**When to use**:
- API responses
- Weather data
- Stock prices
- Session data
- Rate-limited APIs

**Example**:

```typescript
import { memoize, ttlCache } from 'receta/memo'

const fetchNews = memoize(
  (category: string) => api.getNews(category),
  { cache: ttlCache(10 * 60 * 1000) } // 10 min TTL
)

fetchNews('tech') // API call
fetchNews('tech') // Cached

// After 10 minutes...
fetchNews('tech') // API call (expired)
```

### LRU Cache (Least Recently Used)

```typescript
import { lruCache } from 'receta/memo'

const getUser = memoize(fetchUser, {
  cache: lruCache(100) // Max 100 entries
})
```

**Characteristics**:
- ✅ Fixed memory usage
- ✅ Keeps hot data
- ✅ Auto-eviction
- ⚠️ Older data lost

**When to use**:
- Memory-constrained environments
- Large datasets
- Frequently accessed items
- Bounded cache size needed

**Example**:

```typescript
import { memoize, lruCache } from 'receta/memo'

const processImage = memoize(transform, {
  cache: lruCache(50) // Keep 50 most recent
})

// After 50 different images:
processImage('img-001') // Cached
processImage('img-050') // Cached
processImage('img-051') // Computes, evicts img-001
```

### WeakMap Cache

```typescript
import { weakCache } from 'receta/memo'

const processNode = memoizeBy(
  (node: Node) => transform(node),
  (node) => node, // Object as key
  { cache: weakCache() }
)
```

**Characteristics**:
- ✅ GC-friendly
- ✅ No memory leaks
- ✅ Perfect for objects
- ❌ Only object keys
- ❌ Can't iterate entries

**When to use**:
- Object keys (DOM nodes, etc.)
- Automatic cleanup needed
- Memory-sensitive applications

**Example**:

```typescript
import { memoizeBy, weakCache } from 'receta/memo'

interface TreeNode {
  id: string
  children: TreeNode[]
}

const computeDepth = memoizeBy(
  (node: TreeNode): number => {
    if (node.children.length === 0) return 0
    return 1 + Math.max(...node.children.map(computeDepth))
  },
  (node) => node, // Use node object as key
  { cache: weakCache() }
)

const root = { id: 'root', children: [...] }
computeDepth(root) // Computed
computeDepth(root) // Cached

// When `root` is garbage collected, cache entry auto-removed
```

---

## Cache Interface

All cache strategies implement this interface:

```typescript
interface Cache<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}
```

### Direct Cache Access

```typescript
const fn = memoize(expensive)

// Check cache
fn.cache.has(key) // boolean

// Get cached value
fn.cache.get(key) // value | undefined

// Delete entry
fn.cache.delete(key) // boolean

// Clear all
fn.cache.clear() // void
```

### Custom Cache Implementation

```typescript
class CustomCache<K, V> implements Cache<K, V> {
  private map = new Map<K, V>()

  get(key: K): V | undefined {
    console.log(`Cache get: ${key}`)
    return this.map.get(key)
  }

  set(key: K, value: V): void {
    console.log(`Cache set: ${key}`)
    this.map.set(key, value)
  }

  has(key: K): boolean {
    return this.map.has(key)
  }

  delete(key: K): boolean {
    return this.map.delete(key)
  }

  clear(): void {
    this.map.clear()
  }
}

const fn = memoize(expensive, {
  cache: new CustomCache()
})
```

---

## Choosing a Strategy

| Use Case | Strategy | Example |
|----------|----------|---------|
| Simple caching | Default Map | `memoize(fn)` |
| Time-sensitive data | TTL | `memoize(fn, { cache: ttlCache(60000) })` |
| Memory-limited | LRU | `memoize(fn, { cache: lruCache(100) })` |
| Object keys | WeakMap | `memoizeBy(fn, x => x, { cache: weakCache() })` |
| Custom logic | Custom Cache | `memoize(fn, { cache: myCache })` |

---

## Next Steps

- **See real-world examples** → [Practical Examples](./03-practical-examples.md)
- **Learn TypeScript patterns** → [TypeScript Integration](./04-typescript-integration.md)
- **Handle errors** → [Error Handling](./05-error-handling.md)
- **Best practices** → [Patterns](./06-patterns.md)

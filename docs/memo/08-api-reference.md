# API Reference

> Complete reference for all Memo module functions and types.

## Core Functions

### memoize()

Creates a memoized function with automatic caching.

```typescript
function memoize<Args extends readonly [unknown, ...unknown[]], R>(
  fn: (...args: Args) => R,
  options?: MemoizeOptions
): MemoizedFunction<Args, R>
```

**Parameters**:
- `fn`: Function to memoize (uses first arg as cache key)
- `options`: Optional cache configuration

**Returns**: Memoized function with `.cache` and `.clear()` properties

**Example**:
```typescript
const double = memoize((n: number) => n * 2)
double(5) // 10 (computed)
double(5) // 10 (cached)
```

---

### memoizeBy()

Memoization with custom key extraction.

```typescript
function memoizeBy<Args extends readonly unknown[], R, K>(
  fn: (...args: Args) => R,
  keyFn: (...args: Args) => K,
  options?: MemoizeOptions<K>
): MemoizedFunction<Args, R>
```

**Parameters**:
- `fn`: Function to memoize
- `keyFn`: Extract cache key from arguments
- `options`: Optional cache configuration

**Example**:
```typescript
const add = memoizeBy(
  (a: number, b: number) => a + b,
  (a, b) => `${a},${b}`
)
```

---

### memoizeAsync()

Async memoization with request deduplication.

```typescript
function memoizeAsync<Args extends readonly unknown[], R>(
  fn: (...args: Args) => Promise<R>,
  options?: MemoizeOptions & { keyFn?: KeyFn<Args, unknown> }
): MemoizedAsyncFunction<Args, R>
```

**Parameters**:
- `fn`: Async function to memoize
- `options`: Cache config + optional custom key function

**Example**:
```typescript
const fetchUser = memoizeAsync(async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})
```

---

## Cache Strategies

### ttlCache()

Time-to-live cache with automatic expiration.

```typescript
function ttlCache<K, V>(ttlMs: number): Cache<K, V>
```

**Example**:
```typescript
import { memoize, ttlCache } from 'receta/memo'

const fn = memoize(expensive, {
  cache: ttlCache(5 * 60 * 1000) // 5 min
})
```

---

### lruCache()

Least-recently-used cache with size limit.

```typescript
function lruCache<K, V>(maxSize: number): Cache<K, V>
```

**Example**:
```typescript
import { memoize, lruCache } from 'receta/memo'

const fn = memoize(expensive, {
  cache: lruCache(100) // max 100 entries
})
```

---

### weakCache()

WeakMap-based cache for object keys.

```typescript
function weakCache<K extends object, V>(): Cache<K, V>
```

**Example**:
```typescript
import { memoizeBy, weakCache } from 'receta/memo'

const fn = memoizeBy(
  (node: Node) => process(node),
  (node) => node,
  { cache: weakCache() }
)
```

---

## Utilities

### clearCache()

Clear memoized function cache.

```typescript
function clearCache<Args, R>(
  memoized: MemoizedFunction<Args, R> | MemoizedAsyncFunction<Args, R>
): void
```

**Example**:
```typescript
import { memoize, clearCache } from 'receta/memo'

const fn = memoize(expensive)
clearCache(fn)
```

---

## Types

### Cache Interface

```typescript
interface Cache<K, V> {
  get(key: K): V | undefined
  set(key: K, value: V): void
  has(key: K): boolean
  delete(key: K): boolean
  clear(): void
}
```

### MemoizeOptions

```typescript
interface MemoizeOptions<K = string> {
  cache?: Cache<K, unknown>
  maxSize?: number
  ttl?: number
}
```

### MemoizedFunction

```typescript
interface MemoizedFunction<Args extends readonly unknown[], R> {
  (...args: Args): R
  cache: Cache<unknown, R>
  clear: () => void
}
```

### MemoizedAsyncFunction

```typescript
interface MemoizedAsyncFunction<Args extends readonly unknown[], R> {
  (...args: Args): Promise<R>
  cache: Cache<unknown, Promise<R>>
  clear: () => void
}
```

---

## Decision Tree

**Which function should I use?**

1. **Single argument?**
   - Yes → `memoize()`
   - No → Go to 2

2. **Multiple arguments or complex key?**
   - Yes → `memoizeBy()`
   - No → Go to 3

3. **Async function?**
   - Yes → `memoizeAsync()`
   - No → `memoize()`

**Which cache strategy?**

1. **Time-sensitive data?**
   - Yes → `ttlCache()`
   - No → Go to 2

2. **Memory-limited?**
   - Yes → `lruCache()`
   - No → Go to 3

3. **Object keys?**
   - Yes → `weakCache()`
   - No → Default `Map`

---

## Complete Import Reference

```typescript
import {
  // Core
  memoize,
  memoizeBy,
  memoizeAsync,

  // Caches
  ttlCache,
  lruCache,
  weakCache,

  // Utilities
  clearCache,

  // Types
  type Cache,
  type MemoizeOptions,
  type MemoizedFunction,
  type MemoizedAsyncFunction,
  type KeyFn
} from 'receta/memo'
```

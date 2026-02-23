# Migration Guide

> Step-by-step guide to migrating from manual caching to Memo module.

## Before: Manual Caching

```typescript
// ❌ Manual cache management
const cache = new Map<string, User>()

async function getUser(id: string): Promise<User> {
  if (cache.has(id)) {
    return cache.get(id)!
  }
  
  const user = await fetchUser(id)
  cache.set(id, user)
  
  // Manual cleanup
  if (cache.size > 100) {
    const firstKey = cache.keys().next().value
    cache.delete(firstKey)
  }
  
  return user
}
```

**Problems**:
- Manual cache logic in every function
- No TTL support
- No request deduplication
- Error-prone cleanup
- Hard to test

## After: Memo Module

```typescript
// ✅ Automatic memoization
import { memoizeAsync, lruCache } from 'receta/memo'

const getUser = memoizeAsync(
  async (id: string) => await fetchUser(id),
  { cache: lruCache(100) }
)
```

**Benefits**:
- Automatic caching
- LRU eviction
- Request deduplication
- Type-safe
- Testable

## Migration Steps

### Step 1: Identify Cache Patterns

Look for:
- `Map<K, V>` used for caching
- Manual cache lookups (`has`, `get`, `set`)
- TTL logic with `setTimeout`
- LRU eviction loops

### Step 2: Choose Cache Strategy

| Current Pattern | Use |
|-----------------|-----|
| Simple `Map` | `memoize()` |
| TTL with `setTimeout` | `ttlCache()` |
| Manual LRU eviction | `lruCache()` |
| `WeakMap` | `weakCache()` |

### Step 3: Replace Implementation

```typescript
// Before
const cache = new Map<string, Data>()
const inFlight = new Map<string, Promise<Data>>()

async function getData(id: string): Promise<Data> {
  if (cache.has(id)) return cache.get(id)!
  if (inFlight.has(id)) return inFlight.get(id)!
  
  const promise = fetchData(id)
  inFlight.set(id, promise)
  
  try {
    const data = await promise
    cache.set(id, data)
    return data
  } finally {
    inFlight.delete(id)
  }
}

// After
import { memoizeAsync } from 'receta/memo'

const getData = memoizeAsync(async (id: string) => await fetchData(id))
```

## Common Scenarios

### Scenario 1: API Response Caching

**Before**:
```typescript
const cache = new Map()
const CACHE_TTL = 5 * 60 * 1000

async function fetchUser(id: string) {
  const cached = cache.get(id)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  
  const data = await api.getUser(id)
  cache.set(id, { data, timestamp: Date.now() })
  return data
}
```

**After**:
```typescript
import { memoizeAsync, ttlCache } from 'receta/memo'

const fetchUser = memoizeAsync(
  async (id: string) => await api.getUser(id),
  { cache: ttlCache(5 * 60 * 1000) }
)
```

### Scenario 2: Expensive Computation

**Before**:
```typescript
const fibCache = new Map<number, number>()

function fibonacci(n: number): number {
  if (fibCache.has(n)) return fibCache.get(n)!
  
  if (n <= 1) return n
  const result = fibonacci(n - 1) + fibonacci(n - 2)
  
  fibCache.set(n, result)
  return result
}
```

**After**:
```typescript
import { memoize } from 'receta/memo'

const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})
```

## Next Steps

- **API reference** → [API Reference](./08-api-reference.md)
- **Examples** → [Practical Examples](./03-practical-examples.md)

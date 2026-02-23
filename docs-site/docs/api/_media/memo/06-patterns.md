# Patterns and Best Practices

> Design patterns, anti-patterns, and performance optimization.

## Best Practices

### ✅ Do: Memoize Pure Functions

```typescript
// ✅ Good: Pure function
const double = memoize((n: number) => n * 2)
```

### ❌ Don't: Memoize Impure Functions

```typescript
// ❌ Bad: Side effects
const log = memoize((msg: string) => {
  console.log(msg) // Side effect!
  return msg
})
```

### ✅ Do: Use Appropriate Cache Strategy

```typescript
// Time-sensitive data: TTL
const weather = memoize(fetchWeather, { cache: ttlCache(5 * 60 * 1000) })

// Memory-limited: LRU
const user = memoize(fetchUser, { cache: lruCache(100) })

// Object keys: WeakMap
const process = memoizeBy(fn, x => x, { cache: weakCache() })
```

### ✅ Do: Invalidate on Mutations

```typescript
const getUser = memoize(fetchUser)

async function updateUser(id: string, data: any) {
  await db.update(id, data)
  getUser.cache.delete(id) // Invalidate
}
```

## Choosing Cache Strategy

| Data Type | Strategy | Why |
|-----------|----------|-----|
| API responses | TTL | Auto-refresh stale data |
| Database queries | LRU | Limit memory, keep hot data |
| Computations | Map | Simple, no expiration needed |
| DOM nodes | WeakMap | GC-friendly, no leaks |

## Debugging Cache Misses

```typescript
const fn = memoize(expensive)

// Check if cached
console.log(fn.cache.has(key)) // false = cache miss

// Inspect cache size
if (fn.cache instanceof Map) {
  console.log('Cache size:', fn.cache.size)
}

// Debug cache keys
fn.cache.forEach((value, key) => {
  console.log('Cached:', key, value)
})
```

## Next Steps

- **Migrate existing code** → [Migration Guide](./07-migration.md)
- **API reference** → [API Reference](./08-api-reference.md)

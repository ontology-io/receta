# Error Handling

> Managing errors in memoized functions, especially async operations.

## Failed Promises Are Not Cached

```typescript
import { memoizeAsync } from 'receta/memo'

let callCount = 0

const flaky = memoizeAsync(async (id: string) => {
  callCount++
  if (callCount === 1) {
    throw new Error('First call fails')
  }
  return `Success: ${id}`
})

// First call fails
await flaky('123').catch(e => console.log(e.message))
// Console: "First call fails"

// Second call retries (error was not cached)
const result = await flaky('123')
// Returns: "Success: 123"
```

**Key Behavior**: Failed promises are automatically removed from cache, allowing retries.

## Cache Invalidation on Error

```typescript
const fetchData = memoizeAsync(async (id: string) => {
  const res = await fetch(`/api/data/${id}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

// Network error
await fetchData('123').catch(e => {
  console.log('Failed:', e.message)
  // Cache entry for '123' is automatically removed
})

// Retry immediately
await fetchData('123') // Will retry the fetch
```

## Manual Cache Invalidation

```typescript
import { memoizeAsync, clearCache } from 'receta/memo'

const getUser = memoizeAsync(async (id: string) => {
  return await db.users.findById(id)
})

// When data changes
async function updateUser(id: string, data: Partial<User>) {
  await db.users.update(id, data)
  
  // Invalidate cache
  getUser.cache.delete(id)
  // or clearCache(getUser)
}
```

## Next Steps

- **Best practices** → [Patterns](./06-patterns.md)
- **Migration guide** → [Migration](./07-migration.md)

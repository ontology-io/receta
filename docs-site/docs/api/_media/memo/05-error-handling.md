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

### Single Entry Invalidation

```typescript
import { memoizeAsync, clearCache } from 'receta/memo'

const getUser = memoizeAsync(async (id: string) => {
  return await db.users.findById(id)
})

// When data changes
async function updateUser(id: string, data: Partial<User>) {
  await db.users.update(id, data)

  // Invalidate specific entry
  getUser.cache.delete(id)
}
```

### Batch Invalidation

```typescript
import { memoizeAsync, invalidateMany } from 'receta/memo'

const getUser = memoizeAsync(fetchUser)

// After batch update
async function updateUsers(ids: string[], data: Partial<User>) {
  await db.users.updateMany(ids, data)

  // Invalidate multiple entries at once
  invalidateMany(getUser, ids)
}
```

### Conditional Invalidation

```typescript
import { memoize, invalidateWhere } from 'receta/memo'

const getUser = memoize(fetchUser)

// Invalidate all admin users after permission change
function revokeAdminAccess() {
  invalidateWhere(getUser, (_key, user) => user?.role === 'admin')
}

// Invalidate by key pattern
function clearDraftPosts() {
  invalidateWhere(getPost, (key: string) => key.startsWith('draft:'))
}
```

### Multi-Cache Invalidation

```typescript
import { memoizeAsync, invalidateAll } from 'receta/memo'

const getUser = memoizeAsync(fetchUser)
const getUserPosts = memoizeAsync(fetchUserPosts)
const getUserComments = memoizeAsync(fetchUserComments)

// Delete user and clear all related caches
async function deleteUser(id: string) {
  await db.users.delete(id)

  // Clear all user-related caches at once
  invalidateAll(getUser, getUserPosts, getUserComments)
}
```

### Full Cache Clear

```typescript
import { clearCache } from 'receta/memo'

const getUser = memoize(fetchUser)

// Clear entire cache
clearCache(getUser)
// or
getUser.clear()
```

## Invalidation Strategies

| Strategy | Function | Use Case |
|----------|----------|----------|
| Single entry | `cache.delete(key)` | Update one item |
| Multiple entries | `invalidateMany(fn, keys)` | Batch updates |
| Pattern-based | `invalidateWhere(fn, predicate)` | Conditional logic |
| Multi-cache | `invalidateAll(...fns)` | Related caches |
| Full clear | `clearCache(fn)` or `fn.clear()` | Reset everything |

## Next Steps

- **Best practices** → [Patterns](./06-patterns.md)
- **Migration guide** → [Migration](./07-migration.md)

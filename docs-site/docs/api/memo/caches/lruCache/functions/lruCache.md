# Function: lruCache()

> **lruCache**\<`K`, `V`\>(`maxSize`): [`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

Defined in: [memo/caches/lruCache.ts:28](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/caches/lruCache.ts#L28)

Creates a Least-Recently-Used (LRU) cache with a maximum size.

When the cache reaches max size, the least recently accessed entry is evicted.
Useful for limiting memory usage while keeping hot data cached.

## Type Parameters

### K

`K`

### V

`V`

## Parameters

### maxSize

`number`

Maximum number of entries to cache

## Returns

[`Cache`](../../../types/interfaces/Cache.md)\<`K`, `V`\>

## Example

```typescript
import { memoize, lruCache } from 'receta/memo'

// Cache up to 100 users
const getUser = memoize(fetchUser, {
  cache: lruCache(100)
})

// After 100 different users:
getUser('user-001') // cached
getUser('user-002') // cached
// ... 100 more calls ...
getUser('user-101') // causes 'user-001' to be evicted
```

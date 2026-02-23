# Function: invalidateAll()

> **invalidateAll**(...`memoized`): `void`

Defined in: [memo/invalidation/index.ts:122](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/invalidation/index.ts#L122)

Clears the cache of multiple memoized functions at once.

Useful for coordinated invalidation across related caches.

## Parameters

### memoized

...`AnyMemoized`[]

One or more memoized functions to clear

## Returns

`void`

## Example

```typescript
import { memoize, memoizeAsync, invalidateAll } from 'receta/memo'

const getUser = memoize(fetchUser)
const getUserPosts = memoizeAsync(fetchUserPosts)
const getUserComments = memoizeAsync(fetchUserComments)

// After user deletion
async function deleteUser(id: string) {
  await db.users.delete(id)

  // Clear all user-related caches
  invalidateAll(getUser, getUserPosts, getUserComments)
}

// Alternative: clear specific entries before clearing all
getUser.cache.delete(id)
getUserPosts.cache.delete(id)
invalidateAll(getUserComments) // Clear everything from this one
```

# Function: invalidateWhere()

> **invalidateWhere**\<`K`, `V`\>(`memoized`, `predicate`): `void`

Defined in: [memo/invalidation/index.ts:64](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/invalidation/index.ts#L64)

Invalidates cache entries matching a predicate.

Useful for conditional invalidation based on key patterns or cached values.

## Type Parameters

### K

`K` = `unknown`

### V

`V` = `unknown`

## Parameters

### memoized

`AnyMemoized`

The memoized function to invalidate entries from

### predicate

(`key`, `value?`) => `boolean`

Function that returns true for entries to invalidate

## Returns

`void`

## Example

```typescript
import { memoize, invalidateWhere } from 'receta/memo'

const getUser = memoizeBy(
  fetchUser,
  (id, type) => `${type}:${id}`
)

// Invalidate all admin users
invalidateWhere(getUser, (key) => key.startsWith('admin:'))

// Invalidate by value condition
invalidateWhere(getUser, (key, value) => {
  return value && value.deleted === true
})
```

# Function: invalidateMany()

> **invalidateMany**\<`K`\>(`memoized`, `keys`): `void`

Defined in: [memo/invalidation/index.ts:32](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/invalidation/index.ts#L32)

Invalidates multiple cache entries by their keys.

Useful when you know specific keys to invalidate after a batch operation.

## Type Parameters

### K

`K`

## Parameters

### memoized

`AnyMemoized`

The memoized function to invalidate entries from

### keys

`K`[]

Array of cache keys to invalidate

## Returns

`void`

## Example

```typescript
import { memoize, invalidateMany } from 'receta/memo'

const getUser = memoize(fetchUser)

// After batch user update
await updateUsers(['1', '2', '3'], newData)
invalidateMany(getUser, ['1', '2', '3'])

// Next calls will recompute
getUser('1') // Fetched again
getUser('2') // Fetched again
```

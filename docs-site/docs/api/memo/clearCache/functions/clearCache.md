# Function: clearCache()

> **clearCache**\<`Args`, `R`\>(`memoized`): `void`

Defined in: [memo/clearCache/index.ts:23](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/memo/clearCache/index.ts#L23)

Clears the cache of a memoized function.

## Type Parameters

### Args

`Args` *extends* readonly `unknown`[]

### R

`R`

## Parameters

### memoized

[`MemoizedFunction`](../../types/interfaces/MemoizedFunction.md)\<`Args`, `R`\> | [`MemoizedAsyncFunction`](../../types/interfaces/MemoizedAsyncFunction.md)\<`Args`, `R`\>

## Returns

`void`

## Example

```typescript
import { memoize, clearCache } from 'receta/memo'

const expensive = memoize((n: number) => fibonacci(n))

expensive(40) // computed
expensive(40) // cached

clearCache(expensive)

expensive(40) // computed again

// Alternative: use .clear() method
expensive.clear()
```

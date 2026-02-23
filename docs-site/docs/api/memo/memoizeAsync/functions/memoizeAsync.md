# Function: memoizeAsync()

> **memoizeAsync**\<`Args`, `R`\>(`fn`, `options?`): [`MemoizedAsyncFunction`](../../types/interfaces/MemoizedAsyncFunction.md)\<`Args`, `R`\>

Defined in: [memo/memoizeAsync/index.ts:44](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/memoizeAsync/index.ts#L44)

Creates a memoized async function with request deduplication.

Key features:
- Caches resolved promises
- Prevents duplicate in-flight requests (thundering herd protection)
- Failed promises are not cached
- Supports TTL and LRU cache strategies

## Type Parameters

### Args

`Args` *extends* readonly `unknown`[]

### R

`R`

## Parameters

### fn

(...`args`) => `Promise`\<`R`\>

### options?

[`MemoizeOptions`](../../types/interfaces/MemoizeOptions.md)\<`string`\> & `object` = `{}`

## Returns

[`MemoizedAsyncFunction`](../../types/interfaces/MemoizedAsyncFunction.md)\<`Args`, `R`\>

## Example

```typescript
// Basic async memoization
const fetchUser = memoizeAsync(async (id: string) => {
  const res = await fetch(`/api/users/${id}`)
  return res.json()
})

// Concurrent calls - only 1 fetch happens
const [a, b, c] = await Promise.all([
  fetchUser('123'),
  fetchUser('123'),
  fetchUser('123')
]) // All return same result from single API call

// With TTL
const getWeather = memoizeAsync(
  async (city: string) => api.fetchWeather(city),
  { ttl: 5 * 60 * 1000 } // 5 min cache
)

// Custom key extraction
const fetchData = memoizeAsync(
  async (opts: { id: string; type: string }) => api.fetch(opts),
  { keyFn: (opts) => `${opts.id}:${opts.type}` }
)
```

## See

 - memoize - for synchronous functions
 - memoizeBy - for custom key extraction

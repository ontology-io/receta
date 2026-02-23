# Variable: memoize()

> `const` **memoize**: \<`Args`, `R`\>(`fn`, `options`) => [`MemoizedFunction`](../../../memo/types/interfaces/MemoizedFunction.md)\<`Args`, `R`\> = `memoizeImpl`

Defined in: [function/memoize/index.ts:51](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/function/memoize/index.ts#L51)

Creates a memoized version of a function that caches its results.

This is a simple re-export of the `memo` module's `memoize` function,
provided here for convenience in the function module.

By default, uses the first argument as the cache key. For custom cache keys,
use `memo.memoizeBy` instead.

Creates a memoized version of a function that caches results based on arguments.

By default, uses a simple Map cache with the first argument as the key.
For multi-argument functions or complex keys, use `memoizeBy()` instead.

## Type Parameters

### Args

`Args` *extends* readonly \[`unknown`, `unknown`\]

### R

`R`

## Parameters

### fn

(...`args`) => `R`

### options?

[`MemoizeOptions`](../../../memo/types/interfaces/MemoizeOptions.md) = `{}`

## Returns

[`MemoizedFunction`](../../../memo/types/interfaces/MemoizedFunction.md)\<`Args`, `R`\>

## Example

```typescript
// Basic memoization
const fibonacci = (n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
}

const memoFib = memoize(fibonacci)
memoFib(40) // computed (takes time)
memoFib(40) // cached (instant)

// With max size
const getUser = memoize(fetchUser, { maxSize: 100 })

// With TTL
const getWeather = memoize(fetchWeather, { ttl: 5 * 60 * 1000 }) // 5 min
```

## See

 - memoizeBy - for custom key extraction
 - memoizeAsync - for async functions with deduplication

## Examples

```typescript
const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

fibonacci(40)  // Computed once
fibonacci(40)  // Returned from cache instantly
```

```typescript
// Memoizing expensive computations
const expensiveCalc = memoize((data: string) => {
  console.log('Computing...')
  return data.split('').reverse().join('')
})

expensiveCalc('hello')  // Logs "Computing...", returns "olleh"
expensiveCalc('hello')  // Returns "olleh" (no log, cached)
expensiveCalc('world')  // Logs "Computing...", returns "dlrow"
```

```typescript
// For custom cache keys, use memo.memoizeBy
import { memoizeBy } from 'receta/memo'

const fetchUser = memoizeBy(
  (id: string) => fetch(`/api/users/${id}`).then(r => r.json()),
  (id) => id  // Cache key function
)
```

## See

 - memo.memoize - Original implementation with more options
 - memo.memoizeBy - For custom cache key generation
 - memo.memoizeAsync - For Promise-based memoization

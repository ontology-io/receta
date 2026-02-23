# Function: memoize()

> **memoize**\<`Args`, `R`\>(`fn`, `options?`): [`MemoizedFunction`](../../types/interfaces/MemoizedFunction.md)\<`Args`, `R`\>

Defined in: [memo/memoize/index.ts:32](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/memo/memoize/index.ts#L32)

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

[`MemoizeOptions`](../../types/interfaces/MemoizeOptions.md) = `{}`

## Returns

[`MemoizedFunction`](../../types/interfaces/MemoizedFunction.md)\<`Args`, `R`\>

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

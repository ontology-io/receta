# Function: orThrow()

> **orThrow**\<`F`\>(`fn`): `OrThrowVersion`\<`F`\>

Defined in: [result/orThrow/index.ts:57](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/result/orThrow/index.ts#L57)

Converts a Result-returning async function into a throwing variant.

This is a higher-order function that wraps any async function returning
`Promise<Result<T, E>>` to instead return `Promise<T>` and throw on errors.

Use this to create `*OrThrow` variants without duplicating logic.

## Type Parameters

### F

`F` *extends* (...`args`) => `Promise`\<[`Result`](../../types/type-aliases/Result.md)\<`any`, `any`\>\>

## Parameters

### fn

`F`

Async function that returns Promise<Result<T, E>>

## Returns

`OrThrowVersion`\<`F`\>

Async function that returns Promise<T> and throws on Err

## Example

```typescript
import { mapAsync } from 'receta/async'
import { orThrow } from 'receta/result'

// Create throwing variant
const mapAsyncOrThrow = orThrow(mapAsync)

// Use it
try {
  const results = await mapAsyncOrThrow(
    urls,
    async (url) => fetch(url),
    { concurrency: 5 }
  )
  console.log(results)
} catch (error) {
  console.error('Failed:', error)
}

// Works with curried functions too
const fetchAllOrThrow = orThrow(
  mapAsync(async (url: string) => fetch(url))
)
const results = await fetchAllOrThrow(urls)
```

## See

unwrap - for throwing extraction from a single Result

# Function: retry()

> **retry**\<`T`\>(`fn`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`RetryError`](../interfaces/RetryError.md)\>\>

Defined in: [async/retry/index.ts:72](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/retry/index.ts#L72)

Retries an async function with exponential backoff, returning a Result.

Useful for handling transient failures like network errors, rate limits,
or temporary service unavailability. Returns Result for explicit error handling.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`T`\>

Async function to retry

### options?

[`RetryOptions`](../../types/interfaces/RetryOptions.md) = `{}`

Retry options

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`RetryError`](../interfaces/RetryError.md)\>\>

Promise resolving to Result containing either the value or retry error

## Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Basic retry with defaults (3 attempts, exponential backoff)
const result = await retry(async () => {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

// Handle with Result pattern
const data = R.pipe(
  result,
  mapErr(error => console.error('Failed after retries:', error)),
  unwrapOr({ default: 'data' })
)

// Custom retry options
const customResult = await retry(
  async () => fetchData(),
  {
    maxAttempts: 5,
    delay: 500,
    backoff: 2,
    maxDelay: 10000,
    shouldRetry: (error, attempt) => {
      // Only retry on specific errors
      return error instanceof NetworkError && attempt < 3
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms:`, error)
    }
  }
)

// Compose with other Result operations
const processed = R.pipe(
  await retry(() => fetchUser(id)),
  map(user => user.email),
  unwrapOr('noreply@example.com')
)
```

## See

 - poll - for polling until a condition is met
 - timeout - for adding timeout to promises

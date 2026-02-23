# Function: timeout()

> **timeout**\<`T`\>(`promise`, `ms`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`TimeoutError`](../classes/TimeoutError.md)\>\>

Defined in: [async/timeout/index.ts:58](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/timeout/index.ts#L58)

Adds a timeout to a promise, returning a Result.

If the promise doesn't resolve within the specified time,
returns an Err with TimeoutError for explicit error handling.

## Type Parameters

### T

`T`

## Parameters

### promise

`Promise`\<`T`\>

Promise to add timeout to

### ms

`number`

Timeout in milliseconds

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`TimeoutError`](../classes/TimeoutError.md)\>\>

Promise resolving to Result with value or TimeoutError

## Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Basic timeout
const result = await timeout(
  fetch('/api/data'),
  5000 // 5 second timeout
)

// Handle with Result pattern
const data = R.pipe(
  result,
  mapErr(error => console.error('Timeout:', error)),
  unwrapOr({ fallback: 'data' })
)

// Compose with other async operations
const processed = R.pipe(
  await timeout(fetchUser(id), 3000),
  map(user => user.email),
  unwrapOr('noreply@example.com')
)

// Check timeout errors explicitly
const result = await timeout(slowOperation(), 1000)
if (isErr(result) && result.error instanceof TimeoutError) {
  console.log('Operation timed out')
}
```

## See

 - retry - for retrying failed operations
 - poll - for polling with timeout

# Function: poll()

> **poll**\<`T`\>(`fn`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`PollError`](../type-aliases/PollError.md)\>\>

Defined in: [async/poll/index.ts:78](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/poll/index.ts#L78)

Polls an async function until it returns a truthy value or reaches max attempts.

Useful for waiting on async operations like job completion, order status,
or resource availability. Returns Result for explicit error handling.

## Type Parameters

### T

`T`

## Parameters

### fn

() => `Promise`\<`false` \| `T` \| `null` \| `undefined`\>

Async function to poll

### options?

[`PollOptions`](../../types/interfaces/PollOptions.md) = `{}`

Polling options

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`, [`PollError`](../type-aliases/PollError.md)\>\>

Promise resolving to Result with value or poll error

## Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Poll until job is complete
const result = await poll(
  async () => {
    const status = await checkJobStatus(jobId)
    return status.state === 'completed' ? status : null
  },
  {
    interval: 1000, // Check every second
    maxAttempts: 30, // Max 30 attempts (30 seconds)
  }
)

// Handle with Result pattern
const job = R.pipe(
  result,
  mapErr(error => {
    if (error.type === 'max_attempts') {
      return 'Job check timed out'
    }
    return 'Job check failed'
  }),
  unwrapOr(null)
)

// Poll with timeout
const order = await poll(
  async () => fetchOrderStatus(orderId),
  {
    interval: 2000,
    timeout: 60000, // Fail after 1 minute
    onPoll: (attempt) => console.log(`Checking... attempt ${attempt}`)
  }
)

// Poll until condition is met
const result = await poll(
  async () => {
    const data = await fetchData()
    return data.ready ? data : null
  },
  {
    interval: 500,
    shouldContinue: (attempt) => attempt < 20
  }
)
```

## See

retry - for retrying failed operations

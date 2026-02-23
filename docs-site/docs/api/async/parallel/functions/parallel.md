# Function: parallel()

> **parallel**\<`T`\>(`tasks`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`MapAsyncError`](../../mapAsync/interfaces/MapAsyncError.md)\>\>

Defined in: [async/parallel/index.ts:45](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/parallel/index.ts#L45)

Executes an array of async tasks in parallel with optional concurrency limit.

Similar to Promise.all but with concurrency control. Useful when you have
a list of async operations and want to limit how many run simultaneously.

## Type Parameters

### T

`T`

## Parameters

### tasks

readonly () => `Promise`\<`T`\>[]

Array of async functions to execute

### options?

[`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)

Concurrency options

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`MapAsyncError`](../../mapAsync/interfaces/MapAsyncError.md)\>\>

Promise resolving to array of results

## Example

```typescript
// Execute all tasks with concurrency limit of 3
const results = await parallel(
  [
    () => fetch('/api/users/1'),
    () => fetch('/api/users/2'),
    () => fetch('/api/users/3'),
    () => fetch('/api/users/4'),
    () => fetch('/api/users/5'),
  ],
  { concurrency: 3 }
)

// Unlimited concurrency (same as Promise.all)
const all = await parallel([
  () => fetchUser(1),
  () => fetchPosts(),
  () => fetchComments(),
])

// Generate tasks dynamically
const userIds = [1, 2, 3, 4, 5]
const fetchTasks = userIds.map(id => () => fetchUser(id))
const users = await parallel(fetchTasks, { concurrency: 2 })
```

## See

 - sequential - for running tasks one at a time
 - mapAsync - for mapping over data with concurrency

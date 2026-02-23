# Function: mapAsync()

## Call Signature

> **mapAsync**\<`T`, `U`\>(`items`, `fn`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`MapAsyncError`](../interfaces/MapAsyncError.md)\>\>

Defined in: [async/mapAsync/index.ts:64](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/mapAsync/index.ts#L64)

Maps over an array with an async function, with optional concurrency control.

Returns a Result to handle errors explicitly. If any mapper function fails,
the entire operation returns an Err with details about the failure.

This is more powerful than Promise.all(items.map(fn)) because it:
- Allows limiting concurrent operations (rate limiting, resource management)
- Returns Result for explicit error handling
- Provides detailed error information (which item failed)

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### items

readonly `T`[]

Array of items to map over

#### fn

(`item`, `index`) => `Promise`\<`U`\>

Async function to apply to each item

#### options?

[`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)

Concurrency options

### Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`MapAsyncError`](../interfaces/MapAsyncError.md)\>\>

Promise resolving to Result containing array of results or error

### Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Data-first: Fetch users with concurrency limit
const result = await mapAsync(
  ['user1', 'user2', 'user3'],
  async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
  { concurrency: 2 }
)

// Handle with Result pattern
const users = R.pipe(
  result,
  mapErr(error => console.error('Failed at index:', error.index)),
  unwrapOr([])
)

// Data-last (in pipe)
const processed = await R.pipe(
  userIds,
  async (ids) => mapAsync(ids, fetchUser, { concurrency: 5 }),
  async (result) => unwrapOr(result, [])
)

// Unlimited concurrency (same as Promise.all but safer)
const all = await mapAsync(urls, fetchJSON)
```

### See

 - filterAsync - for filtering with async predicates
 - parallel - for running tasks in parallel with concurrency limit
 - mapAsyncOrThrow - throwing variant for backward compatibility

## Call Signature

> **mapAsync**\<`T`, `U`\>(`fn`, `options?`): (`items`) => `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`MapAsyncError`](../interfaces/MapAsyncError.md)\>\>

Defined in: [async/mapAsync/index.ts:70](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/mapAsync/index.ts#L70)

Maps over an array with an async function, with optional concurrency control.

Returns a Result to handle errors explicitly. If any mapper function fails,
the entire operation returns an Err with details about the failure.

This is more powerful than Promise.all(items.map(fn)) because it:
- Allows limiting concurrent operations (rate limiting, resource management)
- Returns Result for explicit error handling
- Provides detailed error information (which item failed)

### Type Parameters

#### T

`T`

#### U

`U`

### Parameters

#### fn

(`item`, `index`) => `Promise`\<`U`\>

Async function to apply to each item

#### options?

[`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)

Concurrency options

### Returns

Promise resolving to Result containing array of results or error

> (`items`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`MapAsyncError`](../interfaces/MapAsyncError.md)\>\>

#### Parameters

##### items

readonly `T`[]

#### Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`MapAsyncError`](../interfaces/MapAsyncError.md)\>\>

### Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Data-first: Fetch users with concurrency limit
const result = await mapAsync(
  ['user1', 'user2', 'user3'],
  async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
  { concurrency: 2 }
)

// Handle with Result pattern
const users = R.pipe(
  result,
  mapErr(error => console.error('Failed at index:', error.index)),
  unwrapOr([])
)

// Data-last (in pipe)
const processed = await R.pipe(
  userIds,
  async (ids) => mapAsync(ids, fetchUser, { concurrency: 5 }),
  async (result) => unwrapOr(result, [])
)

// Unlimited concurrency (same as Promise.all but safer)
const all = await mapAsync(urls, fetchJSON)
```

### See

 - filterAsync - for filtering with async predicates
 - parallel - for running tasks in parallel with concurrency limit
 - mapAsyncOrThrow - throwing variant for backward compatibility

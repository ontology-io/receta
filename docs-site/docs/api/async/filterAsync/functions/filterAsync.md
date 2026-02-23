# Function: filterAsync()

## Call Signature

> **filterAsync**\<`T`\>(`items`, `predicate`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`FilterAsyncError`](../interfaces/FilterAsyncError.md)\>\>

Defined in: [async/filterAsync/index.ts:58](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/filterAsync/index.ts#L58)

Filters an array using an async predicate function.

Returns a Result to handle errors explicitly. If any predicate evaluation fails,
the entire operation returns an Err with details about the failure.

### Type Parameters

#### T

`T`

### Parameters

#### items

readonly `T`[]

Array of items to filter

#### predicate

(`item`, `index`) => `Promise`\<`boolean`\>

Async function that returns true to keep the item

#### options?

[`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)

Concurrency options

### Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`FilterAsyncError`](../interfaces/FilterAsyncError.md)\>\>

Promise resolving to Result containing filtered array or error

### Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Data-first: Filter users who exist
const result = await filterAsync(
  userIds,
  async (id) => {
    const res = await fetch(`/api/users/${id}`)
    return res.ok
  },
  { concurrency: 5 }
)

// Handle with Result pattern
const existingUsers = R.pipe(
  result,
  mapErr(error => console.error('Filter failed:', error)),
  unwrapOr([])
)

// Data-last (in pipe)
const filtered = await R.pipe(
  urls,
  async (items) => filterAsync(items, isValid, { concurrency: 3 }),
  async (result) => unwrapOr(result, [])
)
```

### See

 - mapAsync - for transforming with async functions
 - filterAsyncOrThrow - throwing variant for backward compatibility

## Call Signature

> **filterAsync**\<`T`\>(`predicate`, `options?`): (`items`) => `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`FilterAsyncError`](../interfaces/FilterAsyncError.md)\>\>

Defined in: [async/filterAsync/index.ts:64](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/filterAsync/index.ts#L64)

Filters an array using an async predicate function.

Returns a Result to handle errors explicitly. If any predicate evaluation fails,
the entire operation returns an Err with details about the failure.

### Type Parameters

#### T

`T`

### Parameters

#### predicate

(`item`, `index`) => `Promise`\<`boolean`\>

Async function that returns true to keep the item

#### options?

[`ConcurrencyOptions`](../../types/interfaces/ConcurrencyOptions.md)

Concurrency options

### Returns

Promise resolving to Result containing filtered array or error

> (`items`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`FilterAsyncError`](../interfaces/FilterAsyncError.md)\>\>

#### Parameters

##### items

readonly `T`[]

#### Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`FilterAsyncError`](../interfaces/FilterAsyncError.md)\>\>

### Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Data-first: Filter users who exist
const result = await filterAsync(
  userIds,
  async (id) => {
    const res = await fetch(`/api/users/${id}`)
    return res.ok
  },
  { concurrency: 5 }
)

// Handle with Result pattern
const existingUsers = R.pipe(
  result,
  mapErr(error => console.error('Filter failed:', error)),
  unwrapOr([])
)

// Data-last (in pipe)
const filtered = await R.pipe(
  urls,
  async (items) => filterAsync(items, isValid, { concurrency: 3 }),
  async (result) => unwrapOr(result, [])
)
```

### See

 - mapAsync - for transforming with async functions
 - filterAsyncOrThrow - throwing variant for backward compatibility

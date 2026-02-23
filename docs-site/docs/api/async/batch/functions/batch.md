# Function: batch()

> **batch**\<`T`, `U`\>(`items`, `fn`, `options?`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`BatchError`](../interfaces/BatchError.md)\>\>

Defined in: [async/batch/index.ts:81](https://github.com/maxios/receta/blob/2efcc1ca4c25f7c40cb62cc270556bb4fa8f0cc6/src/async/batch/index.ts#L81)

Processes items in batches with optional delay between batches.

Returns a Result to handle errors explicitly. If any batch processing fails,
the entire operation returns an Err with details about which batch failed.

Useful for bulk operations like data imports, exports, or processing
large datasets without overwhelming the system.

## Type Parameters

### T

`T`

### U

`U`

## Parameters

### items

readonly `T`[]

Array of items to process

### fn

(`batch`) => `Promise`\<`U`\>

Async function to apply to each batch

### options?

[`BatchOptions`](../../types/interfaces/BatchOptions.md) = `{}`

Batch options

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`U`[], [`BatchError`](../interfaces/BatchError.md)\>\>

Promise resolving to Result containing array of all results or error

## Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Process users in batches of 50
const result = await batch(
  users,
  async (userBatch) => {
    return db.users.insertMany(userBatch)
  },
  {
    batchSize: 50,
    delayBetweenBatches: 1000, // 1 second between batches
  }
)

// Handle with Result pattern
const inserted = R.pipe(
  result,
  mapErr(error => console.error('Batch failed:', error)),
  unwrapOr([])
)

// Send emails in batches to avoid rate limits
const emailResult = await batch(
  emailAddresses,
  async (batch) => sendBulkEmail(batch),
  {
    batchSize: 100,
    delayBetweenBatches: 5000, // 5 seconds between batches
    concurrency: 2, // Process 2 batches concurrently
  }
)

// Import large dataset with error handling
const imported = await batch(
  records,
  async (recordBatch) => {
    console.log(`Importing batch of ${recordBatch.length}`)
    return importRecords(recordBatch)
  },
  { batchSize: 1000 }
)
```

## See

 - mapAsync - for mapping over items with concurrency
 - parallel - for running tasks in parallel
 - batchOrThrow - throwing variant for backward compatibility

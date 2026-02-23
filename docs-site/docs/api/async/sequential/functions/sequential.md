# Function: sequential()

> **sequential**\<`T`\>(`tasks`): `Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`SequentialError`](../interfaces/SequentialError.md)\>\>

Defined in: [async/sequential/index.ts:66](https://github.com/maxios/receta/blob/da901099eeb29f836fd8b01eba35f097a9c6cdba/src/async/sequential/index.ts#L66)

Executes an array of async tasks sequentially (one at a time).

Returns a Result to handle errors explicitly. If any task fails,
execution stops and returns an Err with details about which task failed.

Each task waits for the previous one to complete before starting.
Useful when tasks have dependencies or when you need strict ordering.

## Type Parameters

### T

`T`

## Parameters

### tasks

readonly () => `Promise`\<`T`\>[]

Array of async functions to execute

## Returns

`Promise`\<[`Result`](../../../result/types/type-aliases/Result.md)\<`T`[], [`SequentialError`](../interfaces/SequentialError.md)\>\>

Promise resolving to Result containing array of results or error

## Example

```typescript
import * as R from 'remeda'
import { unwrapOr, mapErr } from 'receta/result'

// Execute tasks one at a time in order
const result = await sequential([
  () => createUser({ name: 'Alice' }),
  () => createPost({ title: 'Hello' }),
  () => publishPost({ id: 1 }),
])

// Handle with Result pattern
const results = R.pipe(
  result,
  mapErr(error => console.error('Task failed at index:', error.taskIndex)),
  unwrapOr([])
)

// Database migrations that must run in order
const migrationResult = await sequential([
  () => runMigration('001_create_users'),
  () => runMigration('002_add_email_index'),
  () => runMigration('003_create_posts'),
])

if (isErr(migrationResult)) {
  console.error('Migration failed:', migrationResult.error)
  // Can rollback completed migrations using completedTasks count
}

// Process items with side effects in order
const logs = await sequential(
  events.map(event => () => processEvent(event))
)
```

## See

 - parallel - for running tasks in parallel with concurrency limit
 - sequentialOrThrow - throwing variant for backward compatibility

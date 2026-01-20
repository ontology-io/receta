# API Reference & Quick Lookup

Complete API reference for the Async module. Use this as a quick lookup guide when working with async operations.

---

## Which Function Do I Need?

Use this decision tree to find the right function for your use case:

```
Do you need to...

├─ Transform/Filter Collections?
│  ├─ Map over items with async function?
│  │  └─ mapAsync
│  └─ Filter items with async predicate?
│     └─ filterAsync
│
├─ Control Execution Order?
│  ├─ Run tasks in parallel (with limit)?
│  │  └─ parallel
│  └─ Run tasks one-by-one?
│     └─ sequential
│
├─ Handle Errors/Failures?
│  ├─ Retry on failure?
│  │  └─ retry
│  └─ Add timeout to prevent hanging?
│     └─ timeout / timeoutFn
│
├─ Wait for Conditions?
│  ├─ Poll until condition is met?
│  │  └─ poll
│  └─ Just wait for duration?
│     └─ sleep
│
├─ Process in Batches?
│  ├─ Process items in chunks?
│  │  └─ batch
│  └─ Split array into chunks?
│     └─ chunk
│
└─ Rate Limit Calls?
   ├─ Delay until calls stop?
   │  └─ debounce
   └─ Limit to fixed rate?
      └─ throttle
```

---

## Function Reference

### mapAsync

Transform an array with an async function, with optional concurrency control.

#### Signature

```typescript
// Data-first
function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<U[]>

// Data-last
function mapAsync<T, U>(
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<U[]>
```

#### Parameters

- `items` - Array of items to transform
- `fn` - Async function to apply to each item. Receives:
  - `item: T` - Current item
  - `index: number` - Index of item in array
- `options` (optional) - Concurrency options:
  - `concurrency?: number` - Max concurrent operations (default: Infinity)

#### Returns

`Promise<U[]>` - Array of transformed results in same order as input

#### When to Use

- Fetching data for multiple items (users, posts, etc.)
- Processing files/images in parallel
- Making multiple API calls with rate limiting
- Any transformation that requires async operations

#### Example

```typescript
// Fetch users with concurrency limit
const users = await mapAsync(
  ['user1', 'user2', 'user3', 'user4', 'user5'],
  async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
  { concurrency: 2 }
)

// Unlimited concurrency (same as Promise.all)
const results = await mapAsync(
  urls,
  async (url) => fetch(url).then(r => r.json())
)
```

#### Related Functions

- `filterAsync` - For filtering with async predicates
- `parallel` - For running pre-defined async tasks
- `batch` - For processing in chunks with delays

---

### filterAsync

Filter an array using an async predicate function.

#### Signature

```typescript
// Data-first
function filterAsync<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): Promise<T[]>

// Data-last
function filterAsync<T>(
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): (items: readonly T[]) => Promise<T[]>
```

#### Parameters

- `items` - Array of items to filter
- `predicate` - Async function that returns true to keep item. Receives:
  - `item: T` - Current item
  - `index: number` - Index of item
- `options` (optional) - Concurrency options

#### Returns

`Promise<T[]>` - Array containing only items where predicate returned true

#### When to Use

- Check which items exist (API validation)
- Filter based on async checks (permissions, availability)
- Validate items against external services

#### Example

```typescript
// Filter to only existing users
const existingUsers = await filterAsync(
  userIds,
  async (id) => {
    const res = await fetch(`/api/users/${id}`)
    return res.ok
  },
  { concurrency: 5 }
)

// Filter files that are images
const images = await filterAsync(
  files,
  async (file) => (await file.type).startsWith('image/')
)
```

#### Related Functions

- `mapAsync` - For transforming with async functions
- `parallel` - For running tasks in parallel

---

### retry

Retry an async function with exponential backoff on failure.

#### Signature

```typescript
function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>
```

#### Parameters

- `fn` - Async function to retry (no arguments)
- `options` (optional) - Retry configuration:
  - `maxAttempts?: number` - Max retry attempts (default: 3)
  - `delay?: number` - Initial delay in ms (default: 1000)
  - `backoff?: number` - Delay multiplier for exponential backoff (default: 2)
  - `maxDelay?: number` - Maximum delay between retries in ms (default: 30000)
  - `shouldRetry?: (error: unknown, attempt: number) => boolean` - Return true to retry
  - `onRetry?: (error: unknown, attempt: number, delay: number) => void` - Callback on each retry

#### Returns

`Promise<T>` - Result of successful function call

#### Throws

The last error if all retry attempts fail

#### When to Use

- Network requests that may fail transiently
- API calls that hit rate limits
- Database operations that may timeout
- Any operation prone to temporary failures

#### Example

```typescript
// Basic retry with defaults
const data = await retry(async () => {
  const res = await fetch('/api/data')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
})

// Custom retry logic
const result = await retry(
  async () => fetchData(),
  {
    maxAttempts: 5,
    delay: 500,
    backoff: 2,
    shouldRetry: (error, attempt) => {
      // Only retry network errors
      return error instanceof NetworkError && attempt < 3
    },
    onRetry: (error, attempt, delay) => {
      console.log(`Retry ${attempt} after ${delay}ms`)
    }
  }
)

// Constant delay (no backoff)
const fixed = await retry(
  async () => checkStatus(),
  { delay: 1000, backoff: 1 }
)
```

#### Related Functions

- `poll` - For polling until condition is met
- `timeout` - For adding timeout to operations
- `sleep` - For manual delays

---

### timeout

Add a timeout to a promise or async function.

#### Signature

```typescript
// Add timeout to a promise
function timeout<T>(
  promise: Promise<T>,
  ms: number,
  options?: TimeoutOptions
): Promise<T>

// Wrap function with timeout
function timeoutFn<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  ms: number,
  options?: TimeoutOptions
): (...args: TArgs) => Promise<TReturn>
```

#### Parameters

- `promise` / `fn` - Promise or async function to add timeout to
- `ms` - Timeout in milliseconds
- `options` (optional):
  - `timeout?: number` - Alternative way to specify timeout
  - `timeoutError?: Error` - Custom error to throw on timeout

#### Returns

- `timeout()`: `Promise<T>` - Original promise that rejects on timeout
- `timeoutFn()`: Wrapped function with timeout behavior

#### Throws

`TimeoutError` if operation times out (or custom error if provided)

#### When to Use

- Prevent hanging on slow API calls
- Set SLA limits on operations
- Add safety timeouts to any async operation
- Fail fast instead of waiting indefinitely

#### Example

```typescript
// Basic timeout on promise
const data = await timeout(
  fetch('/api/data'),
  5000 // 5 second timeout
)

// With custom error
const result = await timeout(
  slowOperation(),
  3000,
  { timeoutError: new Error('Operation took too long') }
)

// Create a fetch function with timeout
const fetchWithTimeout = timeoutFn(
  async (url: string) => {
    const res = await fetch(url)
    return res.json()
  },
  5000
)

const data = await fetchWithTimeout('/api/data')

// Handle timeout errors
try {
  const data = await timeout(fetch('/api/data'), 1000)
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out')
  }
}
```

#### Related Functions

- `retry` - For retrying failed operations
- `poll` - For polling with timeout

---

### parallel

Execute async tasks in parallel with optional concurrency limit.

#### Signature

```typescript
function parallel<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
  options?: ConcurrencyOptions
): Promise<T[]>
```

#### Parameters

- `tasks` - Array of async functions (no arguments)
- `options` (optional):
  - `concurrency?: number` - Max concurrent tasks (default: Infinity)

#### Returns

`Promise<T[]>` - Array of results in same order as tasks

#### When to Use

- Run multiple independent operations concurrently
- Fetch data from multiple endpoints
- Process files/images in parallel
- Any scenario with pre-defined async tasks

#### Example

```typescript
// Execute with concurrency limit
const results = await parallel(
  [
    () => fetch('/api/users/1'),
    () => fetch('/api/users/2'),
    () => fetch('/api/users/3'),
    () => fetch('/api/users/4'),
  ],
  { concurrency: 2 }
)

// Unlimited concurrency (same as Promise.all)
const all = await parallel([
  () => fetchUser(1),
  () => fetchPosts(),
  () => fetchComments(),
])

// Generate tasks dynamically
const userIds = [1, 2, 3, 4, 5]
const tasks = userIds.map(id => () => fetchUser(id))
const users = await parallel(tasks, { concurrency: 3 })
```

#### Related Functions

- `sequential` - For running tasks one at a time
- `mapAsync` - For mapping over data (not pre-defined tasks)
- `batch` - For processing in chunks

---

### sequential

Execute async tasks sequentially (one at a time).

#### Signature

```typescript
function sequential<T>(
  tasks: ReadonlyArray<() => Promise<T>>
): Promise<T[]>
```

#### Parameters

- `tasks` - Array of async functions to execute in order

#### Returns

`Promise<T[]>` - Array of results in same order as tasks

#### When to Use

- Tasks have dependencies on each other
- Need strict ordering (migrations, setup steps)
- Operations with side effects that must happen in order
- Rate limiting by processing one at a time

#### Example

```typescript
// Database migrations in order
await sequential([
  () => runMigration('001_create_users'),
  () => runMigration('002_add_email_index'),
  () => runMigration('003_create_posts'),
])

// Sequential setup steps
const results = await sequential([
  () => createUser({ name: 'Alice' }),
  () => createPost({ title: 'Hello' }),
  () => publishPost({ id: 1 }),
])

// Process events in order
const logs = await sequential(
  events.map(event => () => processEvent(event))
)
```

#### Related Functions

- `parallel` - For running tasks concurrently
- `batch` - For processing in chunks

---

### poll

Poll an async function until it returns a truthy value or reaches max attempts.

#### Signature

```typescript
function poll<T>(
  fn: () => Promise<T | null | undefined | false>,
  options?: PollOptions
): Promise<T>
```

#### Parameters

- `fn` - Async function to poll (should return truthy value when complete)
- `options` (optional):
  - `interval?: number` - Time between polls in ms (default: 1000)
  - `maxAttempts?: number` - Max poll attempts (default: 10)
  - `timeout?: number` - Total timeout in ms (optional)
  - `shouldContinue?: (attempt: number) => boolean` - Custom continue logic
  - `onPoll?: (attempt: number) => void` - Callback on each poll

#### Returns

`Promise<T>` - The first truthy result from fn

#### Throws

Error if max attempts reached, timeout occurs, or shouldContinue returns false

#### When to Use

- Wait for job completion
- Check order/payment status
- Wait for resource availability
- Poll until condition is met

#### Example

```typescript
// Poll until job completes
const job = await poll(
  async () => {
    const status = await checkJobStatus(jobId)
    return status.state === 'completed' ? status : null
  },
  {
    interval: 1000, // Check every second
    maxAttempts: 30, // Max 30 seconds
  }
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

// Custom stop condition
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

#### Related Functions

- `retry` - For retrying failed operations
- `timeout` - For adding timeout

---

### batch

Process items in batches with optional delay between batches.

#### Signature

```typescript
function batch<T, U>(
  items: readonly T[],
  fn: (batch: readonly T[]) => Promise<U>,
  options?: BatchOptions
): Promise<U[]>
```

#### Parameters

- `items` - Array of items to process
- `fn` - Function to process each batch (receives array of items)
- `options` (optional):
  - `batchSize?: number` - Items per batch (default: 10)
  - `delayBetweenBatches?: number` - Delay in ms (default: 0)
  - `concurrency?: number` - Max concurrent batches (default: 1)

#### Returns

`Promise<U[]>` - Array of results from each batch

#### When to Use

- Bulk operations (imports, exports)
- Rate-limited APIs that accept batch requests
- Processing large datasets without overwhelming system
- Database bulk inserts/updates

#### Example

```typescript
// Process users in batches
const results = await batch(
  users,
  async (userBatch) => {
    return db.users.insertMany(userBatch)
  },
  {
    batchSize: 50,
    delayBetweenBatches: 1000, // 1 second between batches
  }
)

// Send emails in batches
await batch(
  emailAddresses,
  async (batch) => sendBulkEmail(batch),
  {
    batchSize: 100,
    delayBetweenBatches: 5000,
    concurrency: 2, // Process 2 batches at once
  }
)

// Import large dataset
const imported = await batch(
  records,
  async (recordBatch) => {
    console.log(`Importing batch of ${recordBatch.length}`)
    return importRecords(recordBatch)
  },
  { batchSize: 1000 }
)
```

#### Related Functions

- `chunk` - For splitting array into chunks
- `mapAsync` - For processing individual items
- `parallel` - For running tasks concurrently

---

### chunk

Split an array into chunks of a specific size.

#### Signature

```typescript
function chunk<T>(
  items: readonly T[],
  size: number
): T[][]
```

#### Parameters

- `items` - Array to split into chunks
- `size` - Size of each chunk

#### Returns

`T[][]` - Array of chunks (arrays of items)

#### When to Use

- Split data before batch processing
- Paginate results
- Process large arrays in smaller pieces
- Prepare data for batch APIs

#### Example

```typescript
// Split numbers into groups of 3
const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9]
const chunks = chunk(numbers, 3)
// => [[1, 2, 3], [4, 5, 6], [7, 8, 9]]

// Process users in chunks
const users = await fetchUsers()
const userBatches = chunk(users, 50)

for (const batch of userBatches) {
  await processBatch(batch)
}

// Paginate results
const allItems = await fetchAll()
const pages = chunk(allItems, 20)
```

#### Related Functions

- `batch` - For processing chunks with async function

---

### debounce

Debounce an async function (delay execution until calls stop).

#### Signature

```typescript
function debounce<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: DebounceOptions
): (...args: TArgs) => Promise<TReturn>
```

#### Parameters

- `fn` - Async function to debounce
- `options`:
  - `delay: number` - Delay in ms to wait before invoking
  - `leading?: boolean` - Invoke on leading edge (default: false)
  - `trailing?: boolean` - Invoke on trailing edge (default: true)

#### Returns

Debounced function with same signature as input

#### When to Use

- Search inputs (wait for user to stop typing)
- Auto-save (wait for user to stop editing)
- Window resize handlers
- Any operation that shouldn't run on every invocation

#### Example

```typescript
// Debounced search
const searchAPI = debounce(
  async (query: string) => {
    const res = await fetch(`/api/search?q=${query}`)
    return res.json()
  },
  { delay: 300 }
)

// User types "hello" quickly
searchAPI('h')      // Cancelled
searchAPI('he')     // Cancelled
searchAPI('hel')    // Cancelled
searchAPI('hell')   // Cancelled
searchAPI('hello')  // Executes after 300ms

// Leading edge debounce
const saveData = debounce(
  async (data) => api.save(data),
  { delay: 1000, leading: true, trailing: false }
)

// Auto-save on edit
const autoSave = debounce(
  async (document) => saveDocument(document),
  { delay: 2000 }
)
```

#### Related Functions

- `throttle` - For limiting to fixed rate

---

### throttle

Throttle an async function (limit to fixed rate).

#### Signature

```typescript
function throttle<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ThrottleOptions
): (...args: TArgs) => Promise<TReturn>
```

#### Parameters

- `fn` - Async function to throttle
- `options`:
  - `delay: number` - Min time between invocations in ms
  - `leading?: boolean` - Invoke on leading edge (default: true)
  - `trailing?: boolean` - Invoke on trailing edge (default: true)

#### Returns

Throttled function with same signature as input

#### When to Use

- Rate-limit API calls
- Scroll/resize event handlers
- Analytics tracking
- Any operation that should run at regular intervals

#### Example

```typescript
// Throttle API calls (max once per second)
const trackEvent = throttle(
  async (event: string) => {
    await fetch('/api/analytics', {
      method: 'POST',
      body: JSON.stringify({ event })
    })
  },
  { delay: 1000 }
)

// User scrolls rapidly
trackEvent('scroll') // Executes immediately
trackEvent('scroll') // Ignored (within 1s)
trackEvent('scroll') // Ignored (within 1s)
// ... 1 second passes
trackEvent('scroll') // Executes

// Throttle with trailing edge only
const saveProgress = throttle(
  async (data) => api.save(data),
  { delay: 5000, leading: false, trailing: true }
)

// Rate-limit API requests
const fetchData = throttle(
  async (id: string) => {
    const res = await fetch(`/api/data/${id}`)
    return res.json()
  },
  { delay: 100 } // Max 10 requests per second
)
```

#### Related Functions

- `debounce` - For delaying until calls stop

---

### sleep

Sleep for a specified duration.

#### Signature

```typescript
function sleep(ms: number): Promise<void>
```

#### Parameters

- `ms` - Duration in milliseconds

#### Returns

`Promise<void>` - Resolves after the duration

#### When to Use

- Add delays between operations
- Implement manual backoff
- Simulate loading states
- Rate limiting with manual control

#### Example

```typescript
// Wait 1 second
await sleep(1000)

// Use in sequence
console.log('Starting...')
await sleep(2000)
console.log('2 seconds later')

// Manual backoff
for (let i = 0; i < 5; i++) {
  await processItem(i)
  await sleep(500) // Wait 500ms between items
}

// Simulate loading
setLoading(true)
await sleep(1000)
setLoading(false)
```

#### Related Functions

- `retry` - For automatic retry with backoff
- `poll` - For polling with intervals

---

## Quick Lookup Cheat Sheet

| I want to... | Use this | Key option |
|--------------|----------|------------|
| Map over array with async fn | `mapAsync` | `concurrency` |
| Filter array with async predicate | `filterAsync` | `concurrency` |
| Retry on failure | `retry` | `maxAttempts`, `backoff` |
| Add timeout to promise | `timeout` | `timeout` |
| Add timeout to function | `timeoutFn` | `timeout` |
| Run tasks in parallel | `parallel` | `concurrency` |
| Run tasks in sequence | `sequential` | - |
| Poll until condition met | `poll` | `interval`, `maxAttempts` |
| Process in batches | `batch` | `batchSize`, `delayBetweenBatches` |
| Split array into chunks | `chunk` | - |
| Debounce function calls | `debounce` | `delay` |
| Throttle function calls | `throttle` | `delay` |
| Wait for duration | `sleep` | - |

---

## Type Signatures Quick Reference

### Core Types

```typescript
// Options types
interface ConcurrencyOptions {
  readonly concurrency?: number
}

interface RetryOptions {
  readonly maxAttempts?: number
  readonly delay?: number
  readonly backoff?: number
  readonly maxDelay?: number
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean
  readonly onRetry?: (error: unknown, attempt: number, delay: number) => void
}

interface TimeoutOptions {
  readonly timeout: number
  readonly timeoutError?: Error
}

interface PollOptions {
  readonly interval?: number
  readonly maxAttempts?: number
  readonly timeout?: number
  readonly shouldContinue?: (attempt: number) => boolean
  readonly onPoll?: (attempt: number) => void
}

interface BatchOptions {
  readonly batchSize?: number
  readonly delayBetweenBatches?: number
  readonly concurrency?: number
}

interface DebounceOptions {
  readonly delay: number
  readonly leading?: boolean
  readonly trailing?: boolean
}

interface ThrottleOptions {
  readonly delay: number
  readonly leading?: boolean
  readonly trailing?: boolean
}

// Error types
class TimeoutError extends Error {
  constructor(message?: string)
}
```

### Function Signatures

```typescript
// Collection operations
function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: ConcurrencyOptions
): Promise<U[]>

function filterAsync<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: ConcurrencyOptions
): Promise<T[]>

// Task execution
function parallel<T>(
  tasks: ReadonlyArray<() => Promise<T>>,
  options?: ConcurrencyOptions
): Promise<T[]>

function sequential<T>(
  tasks: ReadonlyArray<() => Promise<T>>
): Promise<T[]>

// Error handling
function retry<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<T>

function timeout<T>(
  promise: Promise<T>,
  ms: number,
  options?: TimeoutOptions
): Promise<T>

function timeoutFn<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  ms: number,
  options?: TimeoutOptions
): (...args: TArgs) => Promise<TReturn>

// Polling and batching
function poll<T>(
  fn: () => Promise<T | null | undefined | false>,
  options?: PollOptions
): Promise<T>

function batch<T, U>(
  items: readonly T[],
  fn: (batch: readonly T[]) => Promise<U>,
  options?: BatchOptions
): Promise<U[]>

function chunk<T>(
  items: readonly T[],
  size: number
): T[][]

// Rate limiting
function debounce<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: DebounceOptions
): (...args: TArgs) => Promise<TReturn>

function throttle<TArgs extends readonly unknown[], TReturn>(
  fn: (...args: TArgs) => Promise<TReturn>,
  options: ThrottleOptions
): (...args: TArgs) => Promise<TReturn>

// Utilities
function sleep(ms: number): Promise<void>
```

---

## Options Reference

### ConcurrencyOptions

Control how many async operations run simultaneously.

```typescript
interface ConcurrencyOptions {
  readonly concurrency?: number // Default: Infinity
}
```

**Examples:**
- `{ concurrency: 1 }` - Sequential (one at a time)
- `{ concurrency: 5 }` - Max 5 concurrent operations
- `{ concurrency: Infinity }` - Unlimited (same as Promise.all)

**Used by:** `mapAsync`, `filterAsync`, `parallel`, `batch`

---

### RetryOptions

Configure retry behavior with exponential backoff.

```typescript
interface RetryOptions {
  readonly maxAttempts?: number    // Default: 3
  readonly delay?: number          // Default: 1000ms
  readonly backoff?: number        // Default: 2 (exponential)
  readonly maxDelay?: number       // Default: 30000ms
  readonly shouldRetry?: (error: unknown, attempt: number) => boolean
  readonly onRetry?: (error: unknown, attempt: number, delay: number) => void
}
```

**Delay calculation:** `delay * (backoff ^ (attempt - 1))`, capped at `maxDelay`

**Examples:**
- `{ maxAttempts: 5, delay: 500 }` - 5 attempts, starting at 500ms
- `{ backoff: 1 }` - Constant delay (no exponential backoff)
- `{ shouldRetry: (e) => e instanceof NetworkError }` - Only retry network errors

**Used by:** `retry`

---

### TimeoutOptions

Add timeout to async operations.

```typescript
interface TimeoutOptions {
  readonly timeout: number         // Required: timeout in ms
  readonly timeoutError?: Error    // Optional: custom error
}
```

**Examples:**
- `{ timeout: 5000 }` - 5 second timeout
- `{ timeout: 3000, timeoutError: new Error('Too slow') }` - Custom error

**Used by:** `timeout`, `timeoutFn`

---

### PollOptions

Configure polling behavior.

```typescript
interface PollOptions {
  readonly interval?: number       // Default: 1000ms
  readonly maxAttempts?: number    // Default: 10
  readonly timeout?: number        // Optional: total timeout
  readonly shouldContinue?: (attempt: number) => boolean
  readonly onPoll?: (attempt: number) => void
}
```

**Examples:**
- `{ interval: 500, maxAttempts: 20 }` - Poll every 500ms, max 20 times
- `{ timeout: 30000 }` - Fail after 30 seconds regardless of attempts
- `{ onPoll: (n) => console.log(`Attempt ${n}`) }` - Log each poll

**Used by:** `poll`

---

### BatchOptions

Configure batch processing.

```typescript
interface BatchOptions {
  readonly batchSize?: number           // Default: 10
  readonly delayBetweenBatches?: number // Default: 0
  readonly concurrency?: number         // Default: 1
}
```

**Behavior:**
- If `delayBetweenBatches > 0`: Processes batches sequentially with delay
- If `delayBetweenBatches = 0`: Uses `concurrency` for parallel batches

**Examples:**
- `{ batchSize: 50 }` - Process 50 items at a time
- `{ batchSize: 100, delayBetweenBatches: 2000 }` - 100 per batch, 2s delay
- `{ batchSize: 20, concurrency: 3 }` - 20 per batch, 3 batches at once

**Used by:** `batch`

---

### DebounceOptions

Configure debounce behavior.

```typescript
interface DebounceOptions {
  readonly delay: number           // Required: delay in ms
  readonly leading?: boolean       // Default: false
  readonly trailing?: boolean      // Default: true
}
```

**Behavior:**
- `leading: true, trailing: false` - Execute immediately, ignore subsequent
- `leading: false, trailing: true` - Execute after calls stop
- `leading: true, trailing: true` - Execute immediately and after calls stop

**Examples:**
- `{ delay: 300 }` - Wait 300ms after calls stop
- `{ delay: 1000, leading: true, trailing: false }` - Execute first call only

**Used by:** `debounce`

---

### ThrottleOptions

Configure throttle behavior.

```typescript
interface ThrottleOptions {
  readonly delay: number           // Required: min time between calls
  readonly leading?: boolean       // Default: true
  readonly trailing?: boolean      // Default: true
}
```

**Behavior:**
- `leading: true` - Execute first call immediately
- `trailing: true` - Execute last call after delay period
- Both true - Execute first and last calls

**Examples:**
- `{ delay: 1000 }` - Max once per second
- `{ delay: 100 }` - Max 10 times per second
- `{ delay: 5000, leading: false }` - Execute only trailing edge

**Used by:** `throttle`

---

## Error Handling Reference

### TimeoutError

Thrown when an operation times out.

```typescript
class TimeoutError extends Error {
  name: 'TimeoutError'
  message: string
}
```

**Catching timeout errors:**

```typescript
try {
  const data = await timeout(fetch('/api/data'), 5000)
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out')
  } else {
    console.log('Other error:', error)
  }
}
```

---

### Retry Errors

`retry()` throws the last error if all attempts fail.

```typescript
try {
  const data = await retry(
    async () => fetchData(),
    { maxAttempts: 3 }
  )
} catch (error) {
  // This is the error from the 3rd (last) attempt
  console.log('Failed after 3 attempts:', error)
}
```

**Custom retry logic:**

```typescript
const result = await retry(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`)
    }
    return res.json()
  },
  {
    shouldRetry: (error, attempt) => {
      // Don't retry on 4xx errors (client errors)
      if (error instanceof Error && error.message.includes('HTTP 4')) {
        return false
      }
      return attempt < 3
    }
  }
)
```

---

### Poll Errors

`poll()` throws an error if:
- Max attempts reached
- Timeout occurs
- `shouldContinue` returns false

```typescript
try {
  const result = await poll(
    async () => checkStatus(),
    { maxAttempts: 10, interval: 1000 }
  )
} catch (error) {
  // Error message: "Polling failed after 10 attempts"
}
```

---

## Common Patterns

### Fetch with Retry and Timeout

```typescript
const fetchSafe = async (url: string) => {
  return retry(
    async () => {
      return timeout(
        fetch(url).then(r => {
          if (!r.ok) throw new Error(`HTTP ${r.status}`)
          return r.json()
        }),
        5000
      )
    },
    { maxAttempts: 3, delay: 1000 }
  )
}
```

### Batch Processing with Progress

```typescript
const processBatches = async (items: Item[]) => {
  let processed = 0

  const results = await batch(
    items,
    async (batch) => {
      const result = await processBatch(batch)
      processed += batch.length
      console.log(`Progress: ${processed}/${items.length}`)
      return result
    },
    { batchSize: 50, delayBetweenBatches: 1000 }
  )

  return results
}
```

### Debounced Search with Loading State

```typescript
const searchWithLoading = debounce(
  async (query: string) => {
    setLoading(true)
    try {
      const results = await fetch(`/api/search?q=${query}`)
      setResults(await results.json())
    } finally {
      setLoading(false)
    }
  },
  { delay: 300 }
)
```

### Poll with Custom Stop Condition

```typescript
const waitForDeployment = async (deployId: string) => {
  return poll(
    async () => {
      const status = await getDeploymentStatus(deployId)

      // Stop on success or failure
      if (status.state === 'deployed') return status
      if (status.state === 'failed') throw new Error('Deployment failed')

      // Continue polling
      return null
    },
    {
      interval: 2000,
      timeout: 300000, // 5 minute max
      onPoll: (attempt) => console.log(`Checking deployment... (${attempt})`)
    }
  )
}
```

---

## Performance Tips

1. **Use concurrency limits** - Don't overwhelm APIs or databases
   ```typescript
   // Bad: 1000 concurrent requests
   await Promise.all(urls.map(fetch))

   // Good: Max 10 concurrent
   await mapAsync(urls, fetch, { concurrency: 10 })
   ```

2. **Batch when possible** - More efficient than individual operations
   ```typescript
   // Less efficient
   await mapAsync(users, user => db.insert(user))

   // More efficient
   await batch(users, batch => db.insertMany(batch), { batchSize: 100 })
   ```

3. **Use timeouts** - Prevent hanging operations
   ```typescript
   // Bad: May hang forever
   await fetch(url)

   // Good: Fail fast
   await timeout(fetch(url), 5000)
   ```

4. **Choose right backoff strategy**
   ```typescript
   // Constant delay for predictable timing
   retry(fn, { delay: 1000, backoff: 1 })

   // Exponential backoff for rate limits
   retry(fn, { delay: 1000, backoff: 2, maxDelay: 30000 })
   ```

---

## See Also

- [Getting Started](./01-getting-started.md) - Introduction and basic usage
- [Recipes & Patterns](./03-recipes-and-patterns.md) - Common async patterns
- [Real-World Examples](./04-real-world-examples.md) - Production examples
- [Performance Guide](./05-performance-guide.md) - Optimization tips
- [Error Handling](./06-error-handling.md) - Robust error handling patterns

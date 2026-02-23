# Migration Guide: From Manual Async to Async Utils

> Step-by-step guide to refactoring manual Promise handling to structured async utilities.

## Why Migrate?

**Before (manual async code):**
- `Promise.all()` has no concurrency control
- Retry logic scattered and inconsistent
- No built-in timeout handling
- Manual batching is error-prone
- Race conditions in debounce/throttle implementations
- Hard to test and reason about

**After (async utils):**
- Concurrency control prevents overwhelming APIs
- Consistent retry with exponential backoff
- Built-in timeout protection
- Reliable batching for bulk operations
- Battle-tested debounce/throttle
- Composable and testable

---

## Step 1: Replace Promise.all with mapAsync

### Problem: No Concurrency Control

**Before:**
```typescript
// ❌ Fetches ALL users simultaneously
// Can overwhelm the API, database, or network
async function fetchAllUsers(userIds: string[]) {
  return Promise.all(
    userIds.map(id =>
      fetch(`/api/users/${id}`).then(r => r.json())
    )
  )
}

// With 1000 user IDs, this creates 1000 simultaneous requests!
const users = await fetchAllUsers(thousandIds)
```

**After:**
```typescript
// ✅ Controlled concurrency - max 5 requests at a time
import { mapAsync } from 'receta/async'

async function fetchAllUsers(userIds: string[]) {
  return mapAsync(
    userIds,
    async (id) => {
      const res = await fetch(`/api/users/${id}`)
      return res.json()
    },
    { concurrency: 5 }
  )
}

// Processes 1000 IDs efficiently with only 5 concurrent requests
const users = await fetchAllUsers(thousandIds)
```

### Real-World Example: Stripe Payment Intents

**Before:**
```typescript
// Express route - processes refunds
app.post('/api/bulk-refund', async (req, res) => {
  const { paymentIntentIds } = req.body

  try {
    // ❌ Stripe rate limits at ~100 req/sec
    // This will fail with 429 errors
    const refunds = await Promise.all(
      paymentIntentIds.map(id =>
        stripe.refunds.create({ payment_intent: id })
      )
    )

    res.json({ success: true, refunds })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

**After:**
```typescript
import { mapAsync } from 'receta/async'

app.post('/api/bulk-refund', async (req, res) => {
  const { paymentIntentIds } = req.body

  try {
    // ✅ Respects Stripe rate limits
    const refunds = await mapAsync(
      paymentIntentIds,
      async (id) => stripe.refunds.create({ payment_intent: id }),
      { concurrency: 10 } // Safe for Stripe API
    )

    res.json({ success: true, refunds })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})
```

---

## Step 2: Add Retry to Unreliable Operations

### Problem: Manual Retry is Fragile

**Before:**
```typescript
// ❌ Inconsistent retry logic, no backoff
async function fetchWithRetry(url: string, maxRetries = 3) {
  let lastError

  for (let i = 0; i < maxRetries; i++) {
    try {
      const res = await fetch(url)
      if (res.ok) return res.json()
      throw new Error(`HTTP ${res.status}`)
    } catch (error) {
      lastError = error
      // Simple delay - same every time
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
  }

  throw lastError
}
```

**After:**
```typescript
// ✅ Exponential backoff, configurable, logs retries
import { retry } from 'receta/async'

async function fetchWithRetry(url: string) {
  return retry(
    async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 2, // Exponential: 1s, 2s, 4s
      onRetry: (error, attempt, delay) => {
        console.log(`Retry ${attempt} after ${delay}ms:`, error.message)
      }
    }
  )
}
```

### Real-World Example: GitHub API with Rate Limiting

**Before:**
```typescript
// ❌ No retry logic - fails on rate limit
async function fetchGitHubRepo(owner: string, repo: string) {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repo}`
  )

  if (res.status === 403) {
    // GitHub rate limit - should retry after delay
    throw new Error('Rate limited')
  }

  return res.json()
}

// Fails immediately on rate limit
const repo = await fetchGitHubRepo('facebook', 'react')
```

**After:**
```typescript
import { retry } from 'receta/async'

async function fetchGitHubRepo(owner: string, repo: string) {
  return retry(
    async () => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}`
      )

      if (res.status === 403) {
        const resetTime = res.headers.get('X-RateLimit-Reset')
        throw new Error(`Rate limited until ${resetTime}`)
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`)
      }

      return res.json()
    },
    {
      maxAttempts: 5,
      delay: 1000,
      backoff: 2,
      shouldRetry: (error, attempt) => {
        // Only retry rate limits and network errors
        return error.message.includes('Rate limited') ||
               error.message.includes('fetch failed')
      },
      onRetry: (error, attempt, delay) => {
        console.log(`GitHub API retry ${attempt} in ${delay}ms`)
      }
    }
  )
}

// Automatically retries on rate limit
const repo = await fetchGitHubRepo('facebook', 'react')
```

---

## Step 3: Add Timeouts to Slow Operations

### Problem: No Timeout Protection

**Before:**
```typescript
// ❌ Can hang forever if API is slow
async function fetchUserData(userId: string) {
  const user = await fetch(`/api/users/${userId}`).then(r => r.json())
  const posts = await fetch(`/api/posts?userId=${userId}`).then(r => r.json())
  const comments = await fetch(`/api/comments?userId=${userId}`).then(r => r.json())

  return { user, posts, comments }
}

// If any endpoint hangs, the whole operation hangs
```

**After:**
```typescript
// ✅ Timeout protection on each operation
import { timeout } from 'receta/async'

async function fetchUserData(userId: string) {
  const user = await timeout(
    fetch(`/api/users/${userId}`).then(r => r.json()),
    5000 // 5 second timeout
  )

  const posts = await timeout(
    fetch(`/api/posts?userId=${userId}`).then(r => r.json()),
    5000
  )

  const comments = await timeout(
    fetch(`/api/comments?userId=${userId}`).then(r => r.json()),
    5000
  )

  return { user, posts, comments }
}

// Fails fast if any endpoint is slow
```

### Real-World Example: Next.js API Route with External Service

**Before:**
```typescript
// pages/api/weather.ts
// ❌ Can block for minutes if weather API is down
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { city } = req.query

    // No timeout - can hang indefinitely
    const weather = await fetch(
      `https://api.weather.com/v1/current?city=${city}`
    ).then(r => r.json())

    res.json(weather)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
}
```

**After:**
```typescript
import { timeout, TimeoutError } from 'receta/async'

// pages/api/weather.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { city } = req.query

    // ✅ 3 second timeout prevents hanging
    const weather = await timeout(
      fetch(`https://api.weather.com/v1/current?city=${city}`).then(r => r.json()),
      3000
    )

    res.json(weather)
  } catch (error) {
    if (error instanceof TimeoutError) {
      res.status(504).json({ error: 'Weather service timeout' })
    } else {
      res.status(500).json({ error: error.message })
    }
  }
}
```

---

## Step 4: Replace Manual Batching with batch()

### Problem: Manual Batching is Error-Prone

**Before:**
```typescript
// ❌ Complex manual batching logic
async function importUsers(users: User[]) {
  const batchSize = 100
  const results = []

  for (let i = 0; i < users.length; i += batchSize) {
    const batch = users.slice(i, i + batchSize)

    try {
      const result = await db.users.insertMany(batch)
      results.push(result)

      // Manual delay between batches
      if (i + batchSize < users.length) {
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    } catch (error) {
      console.error(`Batch ${i / batchSize} failed:`, error)
      throw error
    }
  }

  return results
}
```

**After:**
```typescript
// ✅ Clean, declarative batching
import { batch } from 'receta/async'

async function importUsers(users: User[]) {
  return batch(
    users,
    async (userBatch) => db.users.insertMany(userBatch),
    {
      batchSize: 100,
      delayBetweenBatches: 1000, // 1 second between batches
    }
  )
}
```

### Real-World Example: Bulk Email Sending

**Before:**
```typescript
// ❌ Complex batching with rate limiting
async function sendBulkEmails(recipients: string[], emailContent: Email) {
  const batchSize = 50
  const delayMs = 5000 // 5 seconds between batches
  const results = []

  for (let i = 0; i < recipients.length; i += batchSize) {
    const batch = recipients.slice(i, i + batchSize)

    console.log(`Sending batch ${i / batchSize + 1}/${Math.ceil(recipients.length / batchSize)}`)

    try {
      // Send batch
      const result = await emailService.sendBatch(batch, emailContent)
      results.push(result)

      // Delay between batches to respect rate limits
      if (i + batchSize < recipients.length) {
        console.log(`Waiting ${delayMs}ms before next batch...`)
        await new Promise(resolve => setTimeout(resolve, delayMs))
      }
    } catch (error) {
      console.error(`Batch failed:`, error)
      // What now? Partial failure handling is complex
    }
  }

  return results
}
```

**After:**
```typescript
import { batch } from 'receta/async'

async function sendBulkEmails(recipients: string[], emailContent: Email) {
  return batch(
    recipients,
    async (recipientBatch) => {
      console.log(`Sending to ${recipientBatch.length} recipients`)
      return emailService.sendBatch(recipientBatch, emailContent)
    },
    {
      batchSize: 50,
      delayBetweenBatches: 5000, // 5 seconds between batches
    }
  )
}

// Even better: combine with retry for resilience
import { retry } from 'receta/async'

async function sendBulkEmailsWithRetry(recipients: string[], emailContent: Email) {
  return batch(
    recipients,
    async (recipientBatch) => {
      return retry(
        async () => emailService.sendBatch(recipientBatch, emailContent),
        {
          maxAttempts: 3,
          delay: 2000,
          onRetry: (error, attempt) => {
            console.log(`Retrying batch, attempt ${attempt}`)
          }
        }
      )
    },
    {
      batchSize: 50,
      delayBetweenBatches: 5000,
    }
  )
}
```

---

## Step 5: Replace setTimeout Patterns with debounce/throttle

### Problem: Manual Rate Limiting is Buggy

**Before:**
```typescript
// ❌ Buggy debounce implementation
let searchTimeout: NodeJS.Timeout | undefined

function onSearchInput(query: string) {
  // Clear previous timeout
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }

  // Set new timeout
  searchTimeout = setTimeout(async () => {
    try {
      const results = await fetch(`/api/search?q=${query}`).then(r => r.json())
      displayResults(results)
    } catch (error) {
      console.error('Search failed:', error)
    }
  }, 300)
}

// Issues:
// - Global state (searchTimeout)
// - No proper cleanup
// - Hard to test
// - Race conditions possible
```

**After:**
```typescript
// ✅ Reliable debounce with proper cleanup
import { debounce } from 'receta/async'

const searchAPI = debounce(
  async (query: string) => {
    const results = await fetch(`/api/search?q=${query}`).then(r => r.json())
    displayResults(results)
  },
  { delay: 300 }
)

function onSearchInput(query: string) {
  searchAPI(query)
}
```

### Real-World Example: React Auto-Save

**Before:**
```typescript
// ❌ Manual throttle for auto-save
let lastSave = 0
let saveTimeout: NodeJS.Timeout | undefined

function useAutoSave(documentId: string) {
  const [content, setContent] = useState('')

  const save = async (newContent: string) => {
    const now = Date.now()
    const timeSinceLastSave = now - lastSave

    // Throttle: don't save more than once per 5 seconds
    if (timeSinceLastSave < 5000) {
      // Schedule a save for later
      if (saveTimeout) clearTimeout(saveTimeout)
      saveTimeout = setTimeout(() => {
        save(newContent)
      }, 5000 - timeSinceLastSave)
      return
    }

    lastSave = now

    try {
      await fetch(`/api/documents/${documentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ content: newContent })
      })
    } catch (error) {
      console.error('Auto-save failed:', error)
    }
  }

  const onChange = (newContent: string) => {
    setContent(newContent)
    save(newContent)
  }

  return { content, onChange }
}
```

**After:**
```typescript
import { throttle } from 'receta/async'

function useAutoSave(documentId: string) {
  const [content, setContent] = useState('')

  // ✅ Simple, reliable throttle
  const save = useMemo(
    () =>
      throttle(
        async (newContent: string) => {
          await fetch(`/api/documents/${documentId}`, {
            method: 'PATCH',
            body: JSON.stringify({ content: newContent })
          })
        },
        { delay: 5000 }
      ),
    [documentId]
  )

  const onChange = (newContent: string) => {
    setContent(newContent)
    save(newContent)
  }

  return { content, onChange }
}
```

---

## Step 6: Migrate to Result Pattern

### Why Migrate to Result?

Result-returning functions provide **type-safe error handling** without exceptions:

**Before (exceptions)**:
```typescript
try {
  const data = await retry(() => fetchUser(id))
  return data.email
} catch (error) {
  console.error('Failed:', error)
  return 'fallback@example.com'
}
```

**After (Result)**:
```typescript
const result = await retryResult(() => fetchUser(id))
return pipe(
  result,
  map(user => user.email),
  mapErr(err => console.error('Failed after', err.attempts, 'attempts')),
  unwrapOr('fallback@example.com')
)
```

### Benefits

✅ **Errors in type signatures** - `Result<User, FetchError>` visible at compile time
✅ **No exceptions** - Pure functional error handling
✅ **Composable** - Chain with `pipe`, `map`, `mapErr`, `flatMap`
✅ **Explicit** - Must handle errors, can't forget
✅ **Better DX** - IDE shows error types

### Migration Path: retry → retryResult

**Before**:
```typescript
const fetchUser = async (id: string): Promise<User> => {
  return retry(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    { maxAttempts: 3 }
  )
}

// Usage requires try-catch
try {
  const user = await fetchUser('123')
  console.log(user.name)
} catch (error) {
  console.error('Failed to fetch user')
}
```

**After**:
```typescript
const fetchUserResult = async (id: string): Promise<Result<User, FetchError>> => {
  const result = await retryResult(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    { maxAttempts: 3 }
  )

  return pipe(
    result,
    mapErr((err): FetchError => ({
      type: 'network',
      message: `Failed after ${err.attempts} attempts`,
      retryable: true
    }))
  )
}

// Usage is type-safe, no try-catch
const result = await fetchUserResult('123')
const name = pipe(result, map(u => u.name), unwrapOr('Unknown'))
```

### Migration Path: mapAsync → mapAsyncResult

**Before**:
```typescript
const processUsers = async (userIds: string[]): Promise<User[]> => {
  try {
    return await mapAsync(
      userIds,
      async (id) => fetchUser(id),
      { concurrency: 5 }
    )
  } catch (error) {
    console.error('One user failed, entire batch failed')
    return []
  }
}
```

**After**:
```typescript
const processUsersResult = async (
  userIds: string[]
): Promise<Result<User[], FetchError>> => {
  return mapAsyncResult(
    userIds,
    (id) => fetchUserResult(id),
    { concurrency: 5 }
  )
}

// Know exactly which user failed
const result = await processUsersResult(userIds)
if (isErr(result)) {
  console.error(`User at index ${result.error.index} failed:`, result.error.error)
  // Can retry just that user!
} else {
  console.log(`Processed ${result.value.length} users`)
}
```

### Migration Path: timeout → timeoutResult

**Before**:
```typescript
const fetchWithTimeout = async (url: string) => {
  try {
    return await timeout(fetch(url), 5000)
  } catch (error) {
    if (error instanceof TimeoutError) {
      return fallbackData
    }
    throw error
  }
}
```

**After**:
```typescript
const fetchWithTimeoutResult = async (url: string) => {
  const result = await timeoutResult(fetch(url), 5000)
  return pipe(result, unwrapOr(fallbackData))
}
```

### Migration Path: poll → pollResult

**Before**:
```typescript
const waitForJob = async (jobId: string) => {
  try {
    return await poll(
      async () => {
        const status = await checkJobStatus(jobId)
        if (status.state === 'failed') throw new Error('Job failed')
        return status.state === 'completed' ? status : null
      },
      { interval: 2000, maxAttempts: 30 }
    )
  } catch (error) {
    console.error('Job polling failed:', error)
    throw error
  }
}
```

**After**:
```typescript
const waitForJobResult = async (jobId: string) => {
  return pollResult(
    async () => {
      const status = await checkJobStatus(jobId)
      if (status.state === 'failed') return err({ type: 'job_failed', jobId })
      return status.state === 'completed' ? ok(status) : null
    },
    { interval: 2000, maxAttempts: 30 }
  )
}

// Usage
const result = await waitForJobResult('job-123')
pipe(
  result,
  match(
    (status) => console.log('Job completed:', status),
    (error) => console.error('Job failed:', error.type)
  )
)
```

### Real-World Example: Payment Processing with Result

**Before (exception-based)**:
```typescript
async function processPayment(paymentId: string): Promise<Payment> {
  try {
    // Fetch payment details with retry
    const payment = await retry(
      async () => {
        const res = await fetch(`/api/payments/${paymentId}`)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      },
      { maxAttempts: 3 }
    )

    // Process with timeout
    const result = await timeout(
      stripe.charges.create({
        amount: payment.amount,
        currency: payment.currency,
        source: payment.sourceId
      }),
      10000
    )

    return result
  } catch (error) {
    // Can't distinguish between fetch error, timeout, or Stripe error
    console.error('Payment processing failed:', error)
    throw error
  }
}

// Usage requires try-catch everywhere
try {
  const payment = await processPayment('pay-123')
  console.log('Success:', payment.id)
} catch (error) {
  // Generic error handling
  console.error('Failed:', error)
}
```

**After (Result-based)**:
```typescript
type PaymentError =
  | { type: 'fetch_failed'; attempts: number; message: string }
  | { type: 'timeout'; operation: string }
  | { type: 'stripe_error'; code: string; message: string }

async function processPaymentResult(
  paymentId: string
): Promise<Result<Payment, PaymentError>> {
  // Fetch payment details with retry
  const paymentResult = await retryResult(
    async () => {
      const res = await fetch(`/api/payments/${paymentId}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    { maxAttempts: 3 }
  )

  // Early return if fetch failed
  if (isErr(paymentResult)) {
    return err({
      type: 'fetch_failed',
      attempts: paymentResult.error.attempts,
      message: paymentResult.error.error.message
    })
  }

  const payment = paymentResult.value

  // Process with timeout
  const chargeResult = await timeoutResult(
    stripe.charges.create({
      amount: payment.amount,
      currency: payment.currency,
      source: payment.sourceId
    }),
    10000
  )

  // Transform timeout or Stripe errors
  return pipe(
    chargeResult,
    mapErr((error): PaymentError => {
      if (error instanceof TimeoutError) {
        return { type: 'timeout', operation: 'stripe_charge' }
      }
      return {
        type: 'stripe_error',
        code: error.code || 'unknown',
        message: error.message
      }
    })
  )
}

// Usage is type-safe and explicit
const result = await processPaymentResult('pay-123')

pipe(
  result,
  match(
    (payment) => {
      console.log('Payment succeeded:', payment.id)
      // Continue with success flow
    },
    (error) => {
      // Type-safe error handling
      switch (error.type) {
        case 'fetch_failed':
          console.error(`Failed to fetch payment after ${error.attempts} attempts`)
          // Retry with exponential backoff
          break
        case 'timeout':
          console.error(`Stripe charge timed out`)
          // Notify user to check payment status
          break
        case 'stripe_error':
          console.error(`Stripe error [${error.code}]: ${error.message}`)
          // Show specific error to user
          break
      }
    }
  )
)
```

### Combining Result with Async Utilities

**Pattern: Retry + Result + mapAsync**:
```typescript
// Process multiple payments with retry and Result
const processPaymentsResult = async (
  paymentIds: string[]
): Promise<Result<Payment[], { index: number; error: PaymentError }>> => {
  return mapAsyncResult(
    paymentIds,
    (id) => processPaymentResult(id),
    { concurrency: 5 }
  )
}

// Usage
const result = await processPaymentsResult(paymentIds)

if (isOk(result)) {
  console.log(`Successfully processed ${result.value.length} payments`)
} else {
  const { index, error } = result.error
  console.error(`Payment ${paymentIds[index]} failed:`, error.type)

  // Retry just the failed payment
  const retryResult = await processPaymentResult(paymentIds[index])
  // Handle retry result...
}
```

### Migration Checklist for Result Pattern

- [ ] Identify functions that return `Promise<T>` and throw exceptions
- [ ] Change return type to `Promise<Result<T, E>>`
- [ ] Define custom error types (unions) instead of using `Error`
- [ ] Replace `retry()` with `retryResult()`
- [ ] Replace `mapAsync()` with `mapAsyncResult()` where appropriate
- [ ] Replace `timeout()` with `timeoutResult()`
- [ ] Replace `poll()` with `pollResult()`
- [ ] Replace try-catch blocks with `pipe()` + Result functions
- [ ] Use `isOk()`/`isErr()` for type narrowing
- [ ] Use `match()` for exhaustive error handling
- [ ] Use `unwrapOr()` or `unwrapOrElse()` for default values
- [ ] Use `mapErr()` to transform and enrich errors
- [ ] Test error paths with type-safe assertions
- [ ] Update documentation to reflect Result return types

### When to Use Result Pattern

**Use Result when:**
- ✅ Operation can fail in predictable ways
- ✅ Errors are part of normal control flow
- ✅ You want compile-time guarantee that errors are handled
- ✅ Errors need to be transformed or enriched
- ✅ Multiple operations need to be chained

**Stick with exceptions when:**
- ❌ Truly exceptional conditions (out of memory, etc.)
- ❌ Working with libraries that expect exceptions
- ❌ Simple scripts where type safety isn't critical
- ❌ Legacy code that's not worth refactoring

---

## Pattern-by-Pattern Migration

### Pattern 1: Parallel Fetch → mapAsync

**Before:**
```typescript
// Fetch all product details
const products = await Promise.all(
  productIds.map(id => fetchProduct(id))
)
```

**After:**
```typescript
import { mapAsync } from 'receta/async'

const products = await mapAsync(
  productIds,
  fetchProduct,
  { concurrency: 10 }
)
```

---

### Pattern 2: Manual Retry Loop → retry()

**Before:**
```typescript
let attempts = 0
let success = false
let result

while (!success && attempts < 3) {
  try {
    result = await dangerousOperation()
    success = true
  } catch (error) {
    attempts++
    if (attempts >= 3) throw error
    await sleep(1000 * attempts) // Manual backoff
  }
}
```

**After:**
```typescript
import { retry } from 'receta/async'

const result = await retry(
  dangerousOperation,
  { maxAttempts: 3, delay: 1000, backoff: 2 }
)
```

---

### Pattern 3: setTimeout → debounce

**Before:**
```typescript
let timer: NodeJS.Timeout | undefined

function handleInput(value: string) {
  clearTimeout(timer)
  timer = setTimeout(() => {
    processInput(value)
  }, 500)
}
```

**After:**
```typescript
import { debounce } from 'receta/async'

const handleInput = debounce(
  async (value: string) => processInput(value),
  { delay: 500 }
)
```

---

### Pattern 4: Polling Loop → poll()

**Before:**
```typescript
async function waitForJobComplete(jobId: string) {
  let attempts = 0
  const maxAttempts = 30

  while (attempts < maxAttempts) {
    const status = await checkJobStatus(jobId)

    if (status.state === 'completed') {
      return status
    }

    if (status.state === 'failed') {
      throw new Error('Job failed')
    }

    attempts++
    await sleep(2000)
  }

  throw new Error('Job timeout')
}
```

**After:**
```typescript
import { poll } from 'receta/async'

async function waitForJobComplete(jobId: string) {
  return poll(
    async () => {
      const status = await checkJobStatus(jobId)

      if (status.state === 'failed') {
        throw new Error('Job failed')
      }

      return status.state === 'completed' ? status : null
    },
    {
      interval: 2000,
      maxAttempts: 30,
      onPoll: (attempt) => console.log(`Checking job... (${attempt})`)
    }
  )
}
```

---

### Pattern 5: Sequential Batches → batch()

**Before:**
```typescript
async function processInBatches<T>(items: T[], processor: (item: T) => Promise<void>) {
  for (let i = 0; i < items.length; i += 10) {
    const batch = items.slice(i, i + 10)
    await Promise.all(batch.map(processor))
    await sleep(1000) // Delay between batches
  }
}
```

**After:**
```typescript
import { batch } from 'receta/async'

async function processInBatches<T>(items: T[], processor: (item: T) => Promise<void>) {
  await batch(
    items,
    async (batch) => Promise.all(batch.map(processor)),
    { batchSize: 10, delayBetweenBatches: 1000 }
  )
}
```

---

## Common Pitfalls During Migration

### ❌ Pitfall 1: Forgetting to Set Concurrency

```typescript
// BAD - same as Promise.all (unlimited concurrency)
const results = await mapAsync(items, fetchData)

// GOOD - explicit concurrency limit
const results = await mapAsync(items, fetchData, { concurrency: 5 })
```

### ❌ Pitfall 2: Using retry() for Non-Transient Errors

```typescript
// BAD - retrying validation errors makes no sense
const user = await retry(
  async () => {
    const data = await fetchUserData()
    if (!data.email) throw new Error('Email required')
    return data
  }
)

// GOOD - only retry transient errors
const user = await retry(
  async () => fetchUserData(),
  {
    shouldRetry: (error) => {
      // Only retry network errors, not validation errors
      return error.message.includes('fetch failed')
    }
  }
)
```

### ❌ Pitfall 3: Nesting Retries

```typescript
// BAD - exponential retry explosion
const result = await retry(async () => {
  return retry(async () => {
    return fetch('/api/data').then(r => r.json())
  })
})

// GOOD - single retry at the right level
const result = await retry(
  async () => fetch('/api/data').then(r => r.json())
)
```

### ❌ Pitfall 4: Debounce vs Throttle Confusion

```typescript
// BAD - using debounce for scroll events (delays execution until scrolling stops)
const trackScroll = debounce(
  async () => analytics.track('scroll'),
  { delay: 1000 }
)
window.addEventListener('scroll', () => trackScroll())
// Only fires when user stops scrolling for 1 second!

// GOOD - use throttle for regular sampling
const trackScroll = throttle(
  async () => analytics.track('scroll'),
  { delay: 1000 }
)
window.addEventListener('scroll', () => trackScroll())
// Fires at most once per second while scrolling
```

### ❌ Pitfall 5: Ignoring Timeout Errors

```typescript
// BAD - treating timeout like any other error
try {
  const data = await timeout(fetchData(), 5000)
} catch (error) {
  console.error('Failed:', error)
  // Can't distinguish timeout from other failures
}

// GOOD - handle timeout specifically
import { TimeoutError } from 'receta/async'

try {
  const data = await timeout(fetchData(), 5000)
} catch (error) {
  if (error instanceof TimeoutError) {
    // Show user-friendly timeout message
    console.error('Request timed out - please try again')
  } else {
    // Other error
    console.error('Failed:', error)
  }
}
```

---

## Incremental Migration Strategy

### Phase 1: New Code First

Start by using async utils in all new code:

```typescript
// New feature - use async utils from the start
async function processNewOrders() {
  return mapAsync(
    await getNewOrders(),
    processOrder,
    { concurrency: 5 }
  )
}
```

### Phase 2: Migrate High-Impact Areas

Focus on code that causes the most problems:

1. **API routes with external services** → Add `timeout` and `retry`
2. **Bulk operations** → Replace `Promise.all` with `mapAsync`
3. **User-facing search** → Use `debounce`
4. **Analytics tracking** → Use `throttle`
5. **Background jobs** → Use `poll` and `batch`

### Phase 3: Systematic Refactoring

Use search patterns to find migration candidates:

```bash
# Find Promise.all usage
rg "Promise\.all"

# Find setTimeout patterns
rg "setTimeout"

# Find retry loops
rg "while.*attempts"

# Find polling loops
rg "setInterval|while.*check"
```

Then migrate each pattern systematically.

---

## Testing Migrated Code

### Testing mapAsync

```typescript
import { describe, it, expect, vi } from 'vitest'
import { mapAsync } from 'receta/async'

describe('mapAsync migration', () => {
  it('processes items with concurrency limit', async () => {
    const fetchUser = vi.fn(async (id: string) => ({ id, name: `User ${id}` }))

    const ids = ['1', '2', '3', '4', '5']
    const users = await mapAsync(ids, fetchUser, { concurrency: 2 })

    expect(users).toHaveLength(5)
    expect(fetchUser).toHaveBeenCalledTimes(5)
  })

  it('handles errors correctly', async () => {
    const fetchUser = vi.fn(async (id: string) => {
      if (id === '3') throw new Error('User not found')
      return { id, name: `User ${id}` }
    })

    await expect(
      mapAsync(['1', '2', '3'], fetchUser)
    ).rejects.toThrow('User not found')
  })
})
```

### Testing retry

```typescript
import { describe, it, expect, vi } from 'vitest'
import { retry } from 'receta/async'

describe('retry migration', () => {
  it('retries on failure', async () => {
    let attempts = 0
    const flaky = vi.fn(async () => {
      attempts++
      if (attempts < 3) throw new Error('Temporary failure')
      return 'success'
    })

    const result = await retry(flaky, { maxAttempts: 3, delay: 10 })

    expect(result).toBe('success')
    expect(flaky).toHaveBeenCalledTimes(3)
  })

  it('respects shouldRetry predicate', async () => {
    const fn = vi.fn(async () => {
      throw new Error('FATAL_ERROR')
    })

    await expect(
      retry(fn, {
        shouldRetry: (error) => !error.message.includes('FATAL')
      })
    ).rejects.toThrow('FATAL_ERROR')

    expect(fn).toHaveBeenCalledTimes(1) // No retries
  })
})
```

### Testing debounce

```typescript
import { describe, it, expect, vi } from 'vitest'
import { debounce } from 'receta/async'

describe('debounce migration', () => {
  it('delays execution until calls stop', async () => {
    const fn = vi.fn(async (value: string) => value)
    const debounced = debounce(fn, { delay: 100 })

    // Rapid calls
    debounced('a')
    debounced('b')
    debounced('c')

    // Wait for debounce
    await new Promise(resolve => setTimeout(resolve, 150))

    // Only last call should execute
    expect(fn).toHaveBeenCalledTimes(1)
    expect(fn).toHaveBeenCalledWith('c')
  })
})
```

---

## Migration Checklist

### Pre-Migration
- [ ] Identify all `Promise.all` usage
- [ ] Find manual retry loops
- [ ] Locate `setTimeout` debounce/throttle patterns
- [ ] Search for manual polling loops
- [ ] Find batching logic

### During Migration
- [ ] Replace `Promise.all` with `mapAsync` + concurrency
- [ ] Replace retry loops with `retry()`
- [ ] Add `timeout()` to external API calls
- [ ] Replace manual batching with `batch()`
- [ ] Replace `setTimeout` patterns with `debounce`/`throttle`
- [ ] Replace polling loops with `poll()`

### Post-Migration
- [ ] Add tests for new async utilities
- [ ] Monitor error rates and timeouts
- [ ] Verify concurrency limits are effective
- [ ] Check retry backoff behavior in logs
- [ ] Confirm debounce/throttle timing
- [ ] Update documentation

### Testing
- [ ] Test concurrency limits (should not exceed limit)
- [ ] Test retry on transient failures
- [ ] Test timeout behavior (should fail fast)
- [ ] Test debounce (should delay until calls stop)
- [ ] Test throttle (should limit call rate)
- [ ] Test batch processing (correct batch sizes and delays)

---

## Next Steps

- **[Patterns](./05-patterns.md)**: Complete recipes for common scenarios
- **[API Reference](./07-api-reference.md)**: Quick function lookup
- **[Advanced Patterns](./04-advanced-patterns.md)**: Combining utilities for complex workflows

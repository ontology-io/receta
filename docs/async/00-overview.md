# Async: Tame Concurrency, Timeouts, and Async Patterns

> **TL;DR**: Async utilities provide battle-tested patterns for handling concurrent operations, rate limits, retries, and timeouts—making your async code reliable without manual Promise juggling.

## The Problem: Promises Are Low-Level Primitives

### Real-World Example: Stripe API Rate Limiting

```typescript
// Traditional approach - overwhelming the API
async function processRefunds(chargeIds: string[]) {
  const promises = chargeIds.map(id =>
    stripe.refunds.create({ charge: id })
  )

  // 💥 Fires 1000 requests simultaneously!
  const results = await Promise.all(promises)
  return results
}

// What goes wrong? 🤔
// - Stripe rate limit: 100 req/sec → 429 Too Many Requests
// - No retry logic → manual rerun needed
// - No timeout → hangs forever on slow networks
// - All-or-nothing → one failure kills everything
// - Memory spike → loading 1000 responses at once
```

When you call `processRefunds()` with 1000 charge IDs:
- **429 errors** flood in after request #100
- Your **Lambda times out** waiting for responses
- **Half the refunds succeed**, half fail (inconsistent state)
- You have **no idea which ones** worked
- You'll only discover this when customers complain

### How Successful Products Handle This

**Stripe's Best Practices** (from their docs):
```typescript
// They recommend:
// - Rate limiting (100 req/sec)
// - Exponential backoff on 429
// - Idempotency keys for retries
// - Batch operations where possible
```

**GitHub API** (actual rate limit headers):
```
X-RateLimit-Limit: 5000
X-RateLimit-Remaining: 4999
X-RateLimit-Reset: 1372700873
Retry-After: 60
```

**Vercel Deployments** (actual deployment pattern):
```typescript
// Poll deployment status every 2 seconds
// Timeout after 5 minutes
// Retry on network errors
// Cancel if user navigates away
```

**AWS Lambda Best Practices**:
```typescript
// Concurrency limits per region
// Timeout configuration (max 15 minutes)
// Retry with exponential backoff
// Dead letter queues for failures
```

**What they have in common**: **Controlled concurrency**, **automatic retries**, **timeout protection**, and **graceful degradation**.

## The Solution: Async Utilities

```typescript
import { mapAsync, retry, timeout, debounce } from 'receta/async'
import { ok, err } from 'receta/result'

async function processRefunds(chargeIds: string[]) {
  return mapAsync(
    chargeIds,
    async (id) => {
      // Retry on rate limits
      return retry(
        () => stripe.refunds.create({ charge: id }),
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: 'exponential',
          shouldRetry: (error) => error.statusCode === 429
        }
      )
    },
    {
      concurrency: 10, // Max 10 concurrent requests
      timeout: 30000,  // 30 second timeout per request
      onError: 'continue' // Don't fail entire batch
    }
  )
}
```

**Now your code:**
1. ✅ Never overwhelms Stripe's API (10 concurrent max)
2. ✅ Automatically retries rate limits (exponential backoff)
3. ✅ Times out stuck requests (30s per refund)
4. ✅ Continues on individual failures (collect all results)
5. ✅ Returns both successes and failures (full visibility)

## Why Async Utilities Over Manual Promise Handling?

### Problem 1: Manual Concurrency Control is Complex

```typescript
// Traditional manual concurrency limiting
async function processWithLimit<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  limit: number
): Promise<U[]> {
  const results: U[] = []
  const executing = new Set<Promise<void>>()

  for (const [index, item] of items.entries()) {
    const promise = fn(item).then(result => {
      results[index] = result
      executing.delete(promise)
    })

    executing.add(promise)

    if (executing.size >= limit) {
      await Promise.race(executing)
    }
  }

  await Promise.all(executing)
  return results
}

// 50 lines of boilerplate for EVERY async operation!
```

**With mapAsync:**
```typescript
const results = await mapAsync(
  items,
  fn,
  { concurrency: 10 }
)

// 1 line. Done.
```

### Problem 2: Retry Logic is Error-Prone

```typescript
// Traditional retry with exponential backoff
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3
): Promise<T> {
  let lastError: Error

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error

      if (attempt < maxAttempts - 1) {
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError
}

// Complex, easy to get wrong, hard to customize
```

**With retry:**
```typescript
const result = await retry(
  fn,
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 'exponential',
    maxDelay: 10000
  }
)

// Handles all edge cases, fully customizable
```

### Problem 3: Timeouts Don't Cancel Promises

```typescript
// Traditional timeout doesn't actually cancel
async function withTimeout<T>(
  promise: Promise<T>,
  ms: number
): Promise<T> {
  let timeoutId: NodeJS.Timeout

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(`Timeout after ${ms}ms`))
    }, ms)
  })

  try {
    return await Promise.race([promise, timeoutPromise])
  } finally {
    clearTimeout(timeoutId)
  }
}

// Problem: Original promise keeps running!
// Wastes resources, may cause side effects
```

**With timeout:**
```typescript
const result = await timeout(
  promise,
  5000,
  {
    signal: controller.signal, // Actually cancels
    onTimeout: () => cleanup()  // Clean up resources
  }
)

// Properly cancels, cleans up, returns Result
```

## Real-World Use Cases

### 1. API Rate Limiting (Stripe, GitHub, Twitter)

```typescript
import { mapAsync, retry } from 'receta/async'
import { ok, err, Result } from 'receta/result'

type StripeError = {
  type: 'rate_limit' | 'card_error' | 'network'
  message: string
  statusCode?: number
}

async function bulkCreateCustomers(
  emails: string[]
): Promise<Result<Stripe.Customer, StripeError>[]> {
  return mapAsync(
    emails,
    async (email) => {
      return retry(
        async () => {
          const customer = await stripe.customers.create({ email })
          return ok(customer)
        },
        {
          maxAttempts: 5,
          delay: 1000,
          backoff: 'exponential',
          shouldRetry: (error) => {
            // Retry on rate limits and network errors
            return error.statusCode === 429 ||
                   error.type === 'network'
          },
          onRetry: (attempt, error) => {
            console.log(`Retry ${attempt} for ${email}:`, error.message)
          }
        }
      )
    },
    {
      concurrency: 10,        // Stripe allows 100/sec, we use 10 to be safe
      timeout: 30000,         // 30 second timeout per customer
      onProgress: (completed, total) => {
        console.log(`Progress: ${completed}/${total}`)
      }
    }
  )
}

// Usage
const customers = await bulkCreateCustomers(emails)
const [successful, failed] = partition(customers, Result.isOk)

console.log(`Created ${successful.length} customers`)
console.log(`Failed ${failed.length} customers`)
```

### 2. GitHub API Pagination with Rate Limit Respect

```typescript
import { retry, sleep } from 'receta/async'
import { Result, ok, err } from 'receta/result'

type GitHubError = {
  status: number
  message: string
  retryAfter?: number
}

async function fetchAllRepoIssues(
  owner: string,
  repo: string
): Promise<Result<Issue[], GitHubError>> {
  const issues: Issue[] = []
  let page = 1

  while (true) {
    const result = await retry(
      async () => {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?page=${page}&per_page=100`,
          {
            headers: {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )

        // Check rate limit headers
        const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '0')
        const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0')

        if (remaining === 0) {
          const waitTime = resetTime * 1000 - Date.now()
          throw {
            status: 429,
            message: 'Rate limit exceeded',
            retryAfter: waitTime
          }
        }

        if (!response.ok) {
          throw {
            status: response.status,
            message: await response.text()
          }
        }

        return response.json()
      },
      {
        maxAttempts: 3,
        delay: 1000,
        backoff: 'exponential',
        shouldRetry: (error: GitHubError) => {
          // Retry rate limits and server errors
          return error.status === 429 || error.status >= 500
        },
        getDelay: (attempt, error: GitHubError) => {
          // Use Retry-After header if available
          if (error.retryAfter) {
            return error.retryAfter
          }
          // Otherwise exponential backoff
          return Math.min(1000 * Math.pow(2, attempt), 60000)
        }
      }
    )

    if (Result.isErr(result)) {
      return result
    }

    const pageIssues = result.value

    if (pageIssues.length === 0) {
      break // No more pages
    }

    issues.push(...pageIssues)
    page++

    // Be nice to GitHub - small delay between pages
    await sleep(100)
  }

  return ok(issues)
}
```

### 3. Vercel Deployment Polling

```typescript
import { poll, timeout } from 'receta/async'
import { Result, ok, err } from 'receta/result'

type DeploymentStatus = 'QUEUED' | 'BUILDING' | 'READY' | 'ERROR'

type Deployment = {
  id: string
  status: DeploymentStatus
  url?: string
  error?: string
}

async function waitForDeployment(
  deploymentId: string
): Promise<Result<Deployment, string>> {
  return timeout(
    poll(
      async () => {
        const response = await fetch(
          `https://api.vercel.com/v13/deployments/${deploymentId}`,
          {
            headers: {
              'Authorization': `Bearer ${process.env.VERCEL_TOKEN}`
            }
          }
        )

        const deployment: Deployment = await response.json()
        return deployment
      },
      {
        interval: 2000,        // Check every 2 seconds
        shouldStop: (deployment) => {
          // Stop when deployment is done (success or failure)
          return deployment.status === 'READY' ||
                 deployment.status === 'ERROR'
        },
        onPoll: (attempt, deployment) => {
          console.log(`[${attempt}] Status: ${deployment.status}`)
        }
      }
    ),
    300000, // 5 minute timeout
    {
      onTimeout: () => {
        console.log('Deployment timed out after 5 minutes')
      }
    }
  ).then(deployment => {
    if (deployment.status === 'ERROR') {
      return err(deployment.error || 'Deployment failed')
    }
    return ok(deployment)
  })
}

// Usage
const result = await waitForDeployment('dpl_xyz123')

match(result, {
  onOk: (deployment) => {
    console.log(`✅ Deployed to: ${deployment.url}`)
  },
  onErr: (error) => {
    console.log(`❌ Deployment failed: ${error}`)
  }
})
```

### 4. AWS Lambda Batch Processing

```typescript
import { mapAsync, chunk } from 'receta/async'
import { Result, ok, err, collect } from 'receta/result'

type S3Object = {
  bucket: string
  key: string
  size: number
}

async function processBatchInLambda(
  objects: S3Object[]
): Promise<Result<ProcessedObject[], string>> {
  // Lambda has 15 minute timeout and memory limits
  // Process in chunks to avoid memory issues

  const chunks = chunk(objects, 50) // Process 50 at a time
  const results: ProcessedObject[] = []

  for (const objectChunk of chunks) {
    const chunkResults = await mapAsync(
      objectChunk,
      async (obj) => {
        return timeout(
          processObject(obj),
          60000, // 1 minute per object
          {
            onTimeout: () => {
              console.log(`Timeout processing ${obj.key}`)
            }
          }
        )
      },
      {
        concurrency: 5,  // Process 5 objects concurrently
        onError: 'collect' // Collect all errors
      }
    )

    // Check if any failed
    const collected = collect(chunkResults)
    if (Result.isErr(collected)) {
      return err(`Failed to process chunk: ${collected.error}`)
    }

    results.push(...collected.value)

    // Check remaining Lambda time
    const remainingTime = context.getRemainingTimeInMillis()
    if (remainingTime < 60000) {
      // Less than 1 minute left - stop and return what we have
      console.log('Lambda timeout approaching - stopping early')
      break
    }
  }

  return ok(results)
}
```

### 5. Next.js API Route with Debouncing

```typescript
import { debounce } from 'receta/async'
import { Result, ok, err } from 'receta/result'

// Debounce search to avoid overwhelming database
const searchUsers = debounce(
  async (query: string): Promise<Result<User[], string>> => {
    try {
      const users = await db.user.findMany({
        where: {
          OR: [
            { email: { contains: query } },
            { name: { contains: query } }
          ]
        },
        take: 10
      })
      return ok(users)
    } catch (error) {
      return err('Database query failed')
    }
  },
  {
    wait: 300,           // Wait 300ms after last call
    leading: false,      // Don't execute on leading edge
    trailing: true,      // Execute on trailing edge
    maxWait: 1000       // Execute at least every 1 second
  }
)

// API route
export default async function handler(req, res) {
  const { q } = req.query

  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query required' })
  }

  const result = await searchUsers(q)

  match(result, {
    onOk: (users) => res.json({ users }),
    onErr: (error) => res.status(500).json({ error })
  })
}
```

### 6. Real-Time Data Sync with Throttling

```typescript
import { throttle, mapAsync } from 'receta/async'
import { Result, ok, err } from 'receta/result'

type SyncEvent = {
  id: string
  type: 'create' | 'update' | 'delete'
  data: unknown
}

// Sync changes to remote API, but don't overwhelm it
const syncToRemote = throttle(
  async (events: SyncEvent[]): Promise<Result<void, string>> => {
    try {
      await fetch('https://api.example.com/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events })
      })
      return ok(undefined)
    } catch (error) {
      return err('Sync failed')
    }
  },
  {
    interval: 5000,      // At most once every 5 seconds
    leading: true,       // Sync immediately on first change
    trailing: true       // Sync accumulated changes after interval
  }
)

// In your app
function handleDataChange(event: SyncEvent) {
  // Buffer events
  eventBuffer.push(event)

  // Sync will be throttled automatically
  syncToRemote(eventBuffer).then(result => {
    if (Result.isOk(result)) {
      eventBuffer = [] // Clear buffer on success
    }
  })
}
```

## Mental Model: Guardrails for Async Operations

Think of async utilities as **guardrails** on a highway:

```
Input ──[Async Operation]──> Output
         │                │
         │ concurrency    │ timeout
         │ retry          │ debounce
         │ throttle       │ poll
         │                │
         └────[Safe]──────┘
```

- **Without guardrails**: Promises run wild, crash your app, overwhelm APIs
- **With guardrails**: Controlled execution, automatic recovery, graceful failures

## Core Utilities

### Concurrency Control

```typescript
// mapAsync - Run operations with controlled concurrency
mapAsync(items, fn, { concurrency: 10 })

// filterAsync - Filter with async predicate
filterAsync(items, asyncPredicate, { concurrency: 5 })

// reduceAsync - Reduce with async accumulator
reduceAsync(items, asyncReducer, initialValue)
```

### Retry & Recovery

```typescript
// retry - Retry failed operations with backoff
retry(fn, {
  maxAttempts: 3,
  delay: 1000,
  backoff: 'exponential',
  shouldRetry: (error) => error.status === 429
})

// retryUntil - Retry until condition is met
retryUntil(fn, {
  predicate: (result) => result.status === 'ready',
  maxAttempts: 10
})
```

### Timing Control

```typescript
// timeout - Add timeout to any promise
timeout(promise, 5000)

// sleep - Delay execution
await sleep(1000)

// debounce - Execute after silence period
debounce(fn, { wait: 300 })

// throttle - Execute at most once per interval
throttle(fn, { interval: 1000 })
```

### Polling

```typescript
// poll - Repeatedly execute until condition
poll(fn, {
  interval: 2000,
  shouldStop: (result) => result.complete,
  maxAttempts: 30
})
```

### Batching

```typescript
// batch - Collect and execute in batches
batch(items, {
  size: 50,
  flushInterval: 1000,
  onFlush: async (batch) => processBatch(batch)
})

// chunk - Split array into chunks
chunk([1,2,3,4,5], 2) // [[1,2], [3,4], [5]]
```

## Integration with Result Pattern

All major async functions now have Result-returning variants for type-safe, composable error handling:

### Why Result + Async?

Instead of throwing exceptions, Result-returning functions make errors **explicit in type signatures**:

```typescript
// Before: Error handling with try-catch
try {
  const data = await retry(() => fetchUser(id))
  return data.email
} catch (error) {
  return 'noreply@example.com'
}

// After: Error handling with Result
const result = await retryResult(() => fetchUser(id))
return pipe(
  result,
  map(user => user.email),
  unwrapOr('noreply@example.com')
)
```

### Result-Returning Functions

| Throwing Version | Result Version | Error Type |
|-----------------|----------------|------------|
| `retry()` | `retryResult()` | `RetryError` |
| `mapAsync()` | `mapAsyncResult()` | `MapAsyncError<E>` |
| `timeout()` | `timeoutResult()` | `TimeoutError` |
| `poll()` | `pollResult()` | `PollError` |

### Real-World: GitHub API with Result

```typescript
import * as R from 'remeda'
import { retryResult, timeoutResult } from 'receta/async'
import { unwrapOr, map, mapErr, isErr } from 'receta/result'

type Repo = { name: string; stars: number }
type FetchError = { type: 'network' | 'timeout' | 'rate_limit'; message: string }

const fetchRepo = async (owner: string, repo: string): Promise<Result<Repo, FetchError>> => {
  // Combine retry + timeout for resilient API calls
  const result = await retryResult(
    async () => {
      const res = await timeoutResult(
        fetch(`https://api.github.com/repos/${owner}/${repo}`),
        5000
      )

      if (isErr(res)) {
        throw new Error('Timeout')
      }

      const data = await res.value.json()
      return { name: data.full_name, stars: data.stargazers_count }
    },
    { maxAttempts: 3, delay: 1000 }
  )

  return pipe(
    result,
    mapErr(error => ({
      type: 'network' as const,
      message: `Failed after ${error.attempts} attempts`
    }))
  )
}

// Usage - no try-catch needed!
const repo = await fetchRepo('facebook', 'react')
const stars = pipe(repo, map(r => r.stars), unwrapOr(0))
```

### Benefits

✅ **Type-safe errors** - `Result<User, FetchError>` in signatures
✅ **No exceptions** - Pure functional approach
✅ **Composable** - Chain with `pipe`, `map`, `mapErr`
✅ **Explicit** - Errors visible at compile time
✅ **Non-breaking** - Original functions still available

See [Result Integration Examples](../../examples/async-result-integration.ts) for more patterns.

## When to Use Async Utilities

✅ **Use async utilities when:**
- Making API calls that can be rate-limited (Stripe, GitHub, Twitter)
- Processing large datasets that could overwhelm memory
- Implementing real-time features (polling, webhooks, SSE)
- Building reliable background jobs (retries, timeouts)
- Handling user input that triggers async operations (debounce/throttle)
- Working in resource-constrained environments (Lambda, Edge Functions)

❌ **Don't use async utilities for:**
- Single one-off promises (just use `await`)
- Operations that must run completely unbounded
- Synchronous operations (use regular array methods)
- Real-time streams (use observables/async iterators instead)

## Common Patterns

### Pattern 1: API Client with Rate Limiting

```typescript
class StripeClient {
  private limiter = createRateLimiter({ requestsPerSecond: 100 })

  async createCharge(params: ChargeParams) {
    return this.limiter.schedule(() =>
      retry(
        () => stripe.charges.create(params),
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: 'exponential',
          shouldRetry: (e) => e.statusCode === 429
        }
      )
    )
  }
}
```

### Pattern 2: Batch Processing with Progress

```typescript
async function processBatchWithProgress<T, U>(
  items: T[],
  processor: (item: T) => Promise<U>,
  onProgress: (completed: number, total: number) => void
): Promise<U[]> {
  return mapAsync(
    items,
    processor,
    {
      concurrency: 10,
      onProgress
    }
  )
}

// Usage
await processBatchWithProgress(
  users,
  sendEmail,
  (completed, total) => {
    console.log(`Sent ${completed}/${total} emails`)
  }
)
```

### Pattern 3: Circuit Breaker

```typescript
const callWithCircuitBreaker = createCircuitBreaker(
  async (url: string) => {
    return timeout(
      fetch(url),
      5000
    )
  },
  {
    failureThreshold: 5,    // Open after 5 failures
    resetTimeout: 60000,    // Try again after 1 minute
    onOpen: () => console.log('Circuit opened'),
    onClose: () => console.log('Circuit closed')
  }
)
```

## What's Next?

- **[Concurrency Control](./01-concurrency.md)**: mapAsync, filterAsync, concurrency limiting
- **[Retry Strategies](./02-retry.md)**: Exponential backoff, custom retry logic
- **[Timing Utilities](./03-timing.md)**: timeout, sleep, debounce, throttle
- **[Polling & Watching](./04-polling.md)**: poll, watch, waitUntil
- **[Batching & Chunking](./05-batching.md)**: batch, chunk, window
- **[Patterns](./06-patterns.md)**: Circuit breakers, rate limiters, queue management
- **[Migration Guide](./07-migration.md)**: From Promise.all to mapAsync

---

**Key Takeaway**: Async utilities provide battle-tested patterns for concurrency, retries, and timing control—making your async code as reliable as Stripe, GitHub, and Vercel without the complexity of manual Promise management.

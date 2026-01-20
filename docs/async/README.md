# Async Module Documentation

Control concurrency, handle retries, and manage timeouts - making async operations as reliable as Stripe and GitHub without manual Promise juggling.

## Quick Start

```typescript
import * as R from 'remeda'
import { mapAsync, retry, timeout, debounce } from 'receta/async'

// Process with concurrency limit
const users = await mapAsync(
  userIds,
  async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
  { concurrency: 10 }
)

// Retry with exponential backoff
const data = await retry(
  () => fetchFromAPI(),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    shouldRetry: (error) => error.status === 429
  }
)

// Add timeout protection
const result = await timeout(
  slowOperation(),
  5000 // 5 second timeout
)
```

## Documentation Structure

### 📚 Learning Path

**New to async utilities?** Follow this order:

1. **[Overview](./00-overview.md)** - Why async utilities? Real-world motivation
2. **[Concurrency Control](./01-concurrency.md)** - mapAsync, filterAsync, parallel
3. **[Retry & Timeout](./02-retry-timeout.md)** - Exponential backoff, timeout protection
4. **[Debounce & Throttle](./03-debounce-throttle.md)** - Rate limiting user input
5. **[Batching](./04-batching.md)** - Process in chunks, bulk operations
6. **[Patterns](./05-patterns.md)** - Real-world recipes (API, webhooks, jobs)
7. **[Migration Guide](./06-migration.md)** - From Promise.all to mapAsync
8. **[API Reference](./07-api-reference.md)** - Quick lookup

### 📖 By Topic

#### I want to understand...

- **Why use async utilities?** → [Overview](./00-overview.md)
- **How to control concurrency** → [Concurrency Control](./01-concurrency.md)
- **How to retry failed operations** → [Retry & Timeout](./02-retry-timeout.md)
- **How to debounce/throttle** → [Debounce & Throttle](./03-debounce-throttle.md)
- **How to process in batches** → [Batching](./04-batching.md)

#### I want examples for...

- **API rate limiting** → [Patterns: API Integration](./05-patterns.md#api-integration-patterns)
- **Payment processing** → [Patterns: Stripe Payment](./05-patterns.md#stripe-payment-processing)
- **File operations** → [Patterns: AWS S3](./05-patterns.md#aws-s3-file-operations)
- **Bulk imports** → [Patterns: User Import](./05-patterns.md#user-importexport)
- **Webhook delivery** → [Patterns: Webhooks](./05-patterns.md#webhook-delivery)
- **Job polling** → [Patterns: Job Status](./05-patterns.md#job-status-polling)

#### I need to...

- **Migrate from Promise.all** → [Migration Guide](./06-migration.md)
- **Quick function lookup** → [API Reference](./07-api-reference.md)
- **Decision tree: which function?** → [API Reference: Decision Tree](./07-api-reference.md#which-function-do-i-need)

## Key Concepts

### What are Async Utilities?

Async utilities provide **battle-tested patterns** for handling concurrent operations, rate limits, retries, and timeouts:

```typescript
// Without async utilities - overwhelming the API
const results = await Promise.all(
  userIds.map(id => fetch(`/api/users/${id}`))
)
// 💥 Fires 1000 requests simultaneously!
// Rate limit exceeded, memory spike, all-or-nothing failure

// With async utilities - controlled execution
const results = await mapAsync(
  userIds,
  async (id) => fetch(`/api/users/${id}`).then(r => r.json()),
  { concurrency: 10 }
)
// ✅ Max 10 concurrent requests
// ✅ Memory efficient
// ✅ Graceful error handling
```

### Why Async Utilities?

✅ **Controlled concurrency** - Never overwhelm APIs or databases
✅ **Automatic retries** - Handle transient failures gracefully
✅ **Timeout protection** - Prevent hanging operations
✅ **Rate limiting** - Debounce/throttle user input
✅ **Type-safe** - Full TypeScript support
✅ **Composable** - Works with Remeda's pipe

❌ Manual Promise.all - No concurrency control
❌ Manual retry logic - Complex and error-prone
❌ No timeout - Operations hang forever
❌ No rate limiting - Overwhelming external services

## Common Patterns

### Fetch with Concurrency Limit

```typescript
const users = await mapAsync(
  userIds,
  async (id) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json()
  },
  { concurrency: 10 }
)
```

### Retry with Exponential Backoff

```typescript
const data = await retry(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,
    shouldRetry: (error) => {
      // Only retry on network errors and 5xx
      return !error.message.includes('HTTP 4')
    }
  }
)
```

### Debounced Search

```typescript
const searchAPI = debounce(
  async (query: string) => {
    const res = await fetch(`/api/search?q=${query}`)
    return res.json()
  },
  { delay: 300 }
)

// User types "hello" - only last call executes
searchAPI('h')      // Cancelled
searchAPI('he')     // Cancelled
searchAPI('hello')  // Executes after 300ms
```

### Batch Processing

```typescript
const results = await batch(
  users,
  async (userBatch) => db.users.insertMany(userBatch),
  {
    batchSize: 50,
    delayBetweenBatches: 1000
  }
)
```

## Quick Reference

| I want to... | Function | Example |
|--------------|----------|---------|
| Process array concurrently | `mapAsync` | `mapAsync(items, fn, { concurrency: 10 })` |
| Filter with async predicate | `filterAsync` | `filterAsync(items, asyncCheck, { concurrency: 5 })` |
| Retry on failure | `retry` | `retry(fn, { maxAttempts: 3, delay: 1000 })` |
| Add timeout | `timeout` | `timeout(promise, 5000)` |
| Run tasks in parallel | `parallel` | `parallel(tasks, { concurrency: 10 })` |
| Run tasks sequentially | `sequential` | `sequential(tasks)` |
| Poll until condition | `poll` | `poll(fn, { interval: 1000, maxAttempts: 30 })` |
| Process in batches | `batch` | `batch(items, fn, { batchSize: 50 })` |
| Debounce calls | `debounce` | `debounce(fn, { delay: 300 })` |
| Throttle calls | `throttle` | `throttle(fn, { delay: 1000 })` |
| Wait for duration | `sleep` | `await sleep(1000)` |

## Real-World Examples

### Stripe Payment Processing

```typescript
const processRefunds = async (chargeIds: string[]) => {
  return mapAsync(
    chargeIds,
    async (id) => {
      return retry(
        () => stripe.refunds.create({ charge: id }),
        {
          maxAttempts: 3,
          delay: 1000,
          backoff: 2,
          shouldRetry: (error) => error.statusCode === 429
        }
      )
    },
    {
      concurrency: 10,  // Stripe allows 100/sec, we use 10
      timeout: 30000    // 30 second timeout per refund
    }
  )
}
```

### GitHub API Pagination

```typescript
const fetchAllRepos = async (org: string) => {
  const repos = []
  let page = 1

  while (true) {
    const result = await retry(
      async () => {
        const res = await fetch(
          `https://api.github.com/orgs/${org}/repos?page=${page}&per_page=100`,
          {
            headers: {
              'Authorization': `token ${process.env.GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        )

        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      },
      {
        maxAttempts: 3,
        delay: 1000,
        shouldRetry: (error) => {
          // Retry on rate limits and 5xx errors
          return error.message.includes('429') ||
                 error.message.includes('5')
        }
      }
    )

    if (result.length === 0) break
    repos.push(...result)
    page++

    await sleep(100) // Be nice to GitHub
  }

  return repos
}
```

### AWS Lambda Batch Processing

```typescript
const processBatchInLambda = async (objects: S3Object[]) => {
  const chunks = chunk(objects, 50)
  const results = []

  for (const objectChunk of chunks) {
    const chunkResults = await mapAsync(
      objectChunk,
      async (obj) => {
        return timeout(
          processObject(obj),
          60000, // 1 minute per object
          { onTimeout: () => console.log(`Timeout: ${obj.key}`) }
        )
      },
      { concurrency: 5 }
    )

    results.push(...chunkResults)

    // Check remaining Lambda time
    const remainingTime = context.getRemainingTimeInMillis()
    if (remainingTime < 60000) {
      console.log('Lambda timeout approaching - stopping early')
      break
    }
  }

  return results
}
```

## Decision Tree

Use this flowchart to find the right function:

```
Do you need to...

├─ Transform/Filter Collections?
│  ├─ Map over items with async function?
│  │  └─ mapAsync(items, fn, { concurrency: 10 })
│  └─ Filter items with async predicate?
│     └─ filterAsync(items, predicate, { concurrency: 5 })
│
├─ Control Execution Order?
│  ├─ Run tasks in parallel (with limit)?
│  │  └─ parallel(tasks, { concurrency: 10 })
│  └─ Run tasks one-by-one?
│     └─ sequential(tasks)
│
├─ Handle Errors/Failures?
│  ├─ Retry on failure?
│  │  └─ retry(fn, { maxAttempts: 3, delay: 1000 })
│  └─ Add timeout to prevent hanging?
│     └─ timeout(promise, 5000)
│
├─ Wait for Conditions?
│  ├─ Poll until condition is met?
│  │  └─ poll(fn, { interval: 1000, maxAttempts: 30 })
│  └─ Just wait for duration?
│     └─ sleep(1000)
│
├─ Process in Batches?
│  ├─ Process items in chunks?
│  │  └─ batch(items, fn, { batchSize: 50 })
│  └─ Split array into chunks?
│     └─ chunk(items, size)
│
└─ Rate Limit Calls?
   ├─ Delay until calls stop?
   │  └─ debounce(fn, { delay: 300 })
   └─ Limit to fixed rate?
      └─ throttle(fn, { delay: 1000 })
```

## Best Practices

### ✅ Do

- Use concurrency limits for API calls (respect rate limits)
- Add timeouts to prevent hanging operations
- Retry on transient failures (network errors, rate limits)
- Use `batch` for bulk operations (more efficient)
- Debounce user input (search, autosave)
- Throttle analytics/tracking events
- Use `sequential` for operations with dependencies
- Log retries and failures for debugging

### ❌ Don't

- Don't use `Promise.all` without concurrency control
- Don't retry on client errors (4xx) - they won't succeed
- Don't use infinite timeouts - always set limits
- Don't process large datasets without batching
- Don't debounce critical operations (payments, etc.)
- Don't mix async utilities with manual Promise juggling
- Don't ignore errors - always handle them
- Don't forget to clean up resources on timeout

## TypeScript Tips

```typescript
// ✅ Explicit timeout handling
try {
  const data = await timeout(fetch('/api/data'), 5000)
} catch (error) {
  if (error instanceof TimeoutError) {
    console.log('Request timed out')
  }
}

// ✅ Type-safe retry with error narrowing
const result = await retry(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  {
    shouldRetry: (error) => {
      // TypeScript knows error is unknown
      if (error instanceof Error) {
        return !error.message.includes('HTTP 4')
      }
      return false
    }
  }
)

// ✅ Concurrency with type inference
const users = await mapAsync(
  ['1', '2', '3'],
  async (id) => {
    const res = await fetch(`/api/users/${id}`)
    return res.json() as User
  },
  { concurrency: 10 }
)
// TypeScript infers: User[]
```

## Performance Guidelines

### Concurrency Tuning

```typescript
// ❌ Bad: Overwhelming API
await Promise.all(urls.map(fetch))

// ✅ Good: Controlled concurrency
await mapAsync(urls, fetch, { concurrency: 10 })

// 💡 Tip: Benchmark to find optimal concurrency
const optimal = await findOptimalConcurrency(
  urls,
  fetch,
  [1, 5, 10, 20, 50]
)
```

### Batching Efficiency

```typescript
// ❌ Less efficient: Individual operations
await mapAsync(users, user => db.insert(user))

// ✅ More efficient: Batch operations
await batch(users, batch => db.insertMany(batch), { batchSize: 100 })
```

### Retry Strategy

```typescript
// ❌ Bad: Constant delay (hammers server)
retry(fn, { delay: 1000, backoff: 1 })

// ✅ Good: Exponential backoff (gives server time to recover)
retry(fn, { delay: 1000, backoff: 2, maxDelay: 30000 })
```

### Memory Management

```typescript
// ❌ Bad: Loading everything at once
const results = await Promise.all(
  largeArray.map(processItem)
)

// ✅ Good: Stream processing with batching
const chunks = chunk(largeArray, 100)
for (const chunk of chunks) {
  const chunkResults = await mapAsync(chunk, processItem, { concurrency: 10 })
  await saveResults(chunkResults)
  // Previous chunk can be garbage collected
}
```

## Testing Async Code

```typescript
import { expect, test } from 'bun:test'
import { mapAsync, retry, timeout } from 'receta/async'

test('mapAsync processes with concurrency limit', async () => {
  const items = [1, 2, 3, 4, 5]
  let concurrent = 0
  let maxConcurrent = 0

  const results = await mapAsync(
    items,
    async (n) => {
      concurrent++
      maxConcurrent = Math.max(maxConcurrent, concurrent)
      await sleep(10)
      concurrent--
      return n * 2
    },
    { concurrency: 2 }
  )

  expect(results).toEqual([2, 4, 6, 8, 10])
  expect(maxConcurrent).toBeLessThanOrEqual(2)
})

test('retry respects maxAttempts', async () => {
  let attempts = 0

  try {
    await retry(
      async () => {
        attempts++
        throw new Error('fail')
      },
      { maxAttempts: 3 }
    )
  } catch (error) {
    // Expected to throw after 3 attempts
  }

  expect(attempts).toBe(3)
})

test('timeout throws TimeoutError', async () => {
  await expect(
    timeout(
      new Promise(resolve => setTimeout(resolve, 1000)),
      100
    )
  ).rejects.toThrow(TimeoutError)
})
```

## Getting Help

- **Confused about which function to use?** → [Decision Tree](./07-api-reference.md#which-function-do-i-need)
- **Want a complete example?** → [Patterns](./05-patterns.md)
- **Migrating from Promise.all?** → [Migration Guide](./06-migration.md)
- **Need quick lookup?** → [API Reference](./07-api-reference.md)

## Next Steps

1. Read the [Overview](./00-overview.md) to understand why async utilities
2. Learn [Concurrency Control](./01-concurrency.md) for parallel operations
3. Master [Retry & Timeout](./02-retry-timeout.md) for robust error handling
4. Check out [Patterns](./05-patterns.md) for your use case
5. Use the [API Reference](./07-api-reference.md) for quick lookups

---

**Built on Remeda** · [Source Code](../../src/async/) · [Tests](../../src/async/__tests__/)

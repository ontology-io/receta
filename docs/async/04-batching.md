# Batching and Polling

> Process large datasets efficiently with controlled batching and monitor long-running operations with polling strategies.

## Table of Contents

1. [Batch Processing](#batch-processing)
2. [Polling Strategies](#polling-strategies)
3. [Real-World Patterns](#real-world-patterns)
4. [Performance Optimization](#performance-optimization)
5. [Error Handling in Batches](#error-handling-in-batches)
6. [Progress Tracking](#progress-tracking)

---

## Batch Processing

### The Problem: Processing Large Datasets

```typescript
// DON'T: Process 10,000 payments all at once
async function processPayments(payments: Payment[]) {
  return Promise.all(payments.map(p => stripe.charges.create(p)))
  // Problems:
  // - Memory explosion
  // - API rate limits hit
  // - All-or-nothing failure
  // - No progress visibility
}
```

### The Solution: Controlled Batching

```typescript
import { batch } from 'receta/async'
import * as R from 'remeda'

async function processPayments(payments: Payment[]) {
  return batch(payments, async (payment) => {
    return stripe.charges.create({
      amount: payment.amount,
      currency: payment.currency,
      customer: payment.customerId
    })
  }, {
    batchSize: 100,        // Process 100 at a time
    delayMs: 1000,         // Wait 1s between batches
    concurrency: 10,       // 10 concurrent requests per batch
    onBatchComplete: (results, batchIndex) => {
      console.log(`Batch ${batchIndex + 1} complete: ${results.length} payments`)
    }
  })
}
```

---

## Batch Function Overview

### Basic Usage

```typescript
import { batch } from 'receta/async'

// Simple batching
const results = await batch(
  items,
  async (item) => processItem(item),
  { batchSize: 50 }
)

// With all options
const results = await batch(
  items,
  async (item, index) => processItem(item, index),
  {
    batchSize: 100,
    concurrency: 5,
    delayMs: 500,
    onBatchStart: (batchIndex, batchSize) => {
      console.log(`Starting batch ${batchIndex + 1} (${batchSize} items)`)
    },
    onBatchComplete: (results, batchIndex) => {
      console.log(`Completed batch ${batchIndex + 1}`)
    },
    onProgress: (completed, total) => {
      console.log(`Progress: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`)
    }
  }
)
```

### Type Signature

```typescript
function batch<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: BatchOptions
): Promise<U[]>

interface BatchOptions {
  batchSize?: number           // Items per batch (default: 10)
  concurrency?: number         // Concurrent operations per batch (default: 5)
  delayMs?: number            // Delay between batches (default: 0)
  onBatchStart?: (batchIndex: number, batchSize: number) => void
  onBatchComplete?: (results: U[], batchIndex: number) => void
  onProgress?: (completed: number, total: number) => void
}
```

---

## Chunk Utility

### Breaking Arrays into Batches

```typescript
import { chunk } from 'receta/async'

// Split array into chunks
const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const batches = chunk(items, 3)
// => [[1, 2, 3], [4, 5, 6], [7, 8, 9], [10]]

// Process each chunk manually
for (const batch of batches) {
  await processBatch(batch)
  await sleep(1000) // Delay between batches
}
```

### Combining with Remeda

```typescript
import * as R from 'remeda'
import { chunk } from 'receta/async'

// Process in chunks with transformation
const results = await R.pipe(
  largeDataset,
  chunk(100),
  async (batches) => {
    const results = []
    for (const batch of batches) {
      const batchResults = await Promise.all(
        batch.map(item => processItem(item))
      )
      results.push(...batchResults)
    }
    return results
  }
)
```

---

## Batch Size Optimization

### Finding the Right Batch Size

```typescript
// Rule of thumb: Start with these defaults and adjust
const defaultBatchSizes = {
  // API Calls
  externalApi: 100,      // Most APIs handle 100/batch well
  database: 1000,        // Databases can handle larger batches
  emailSending: 50,      // Email services often rate-limit

  // Data Processing
  imageProcessing: 10,   // CPU/memory intensive
  fileUploads: 5,        // I/O bound operations
  dataTransform: 5000,   // Pure computation can be large
}

// Adaptive batching based on processing time
async function adaptiveBatch<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  let batchSize = 100
  const results: U[] = []

  for (let i = 0; i < items.length; i += batchSize) {
    const batchItems = items.slice(i, i + batchSize)
    const startTime = Date.now()

    const batchResults = await Promise.all(batchItems.map(fn))
    results.push(...batchResults)

    const duration = Date.now() - startTime

    // Adjust batch size based on duration
    if (duration < 1000) {
      batchSize = Math.min(batchSize * 1.5, 500) // Increase
    } else if (duration > 5000) {
      batchSize = Math.max(batchSize * 0.5, 10)  // Decrease
    }
  }

  return results
}
```

---

## Delays Between Batches

### Rate Limit Compliance

```typescript
import { batch, sleep } from 'receta/async'

// Stripe: 100 requests per second
async function batchStripeCharges(charges: ChargeRequest[]) {
  return batch(charges,
    async (charge) => stripe.charges.create(charge),
    {
      batchSize: 100,
      delayMs: 1000,  // 1 second delay = 100 req/sec
      concurrency: 10
    }
  )
}

// SendGrid: 10,000 emails per hour
async function batchSendEmails(emails: Email[]) {
  const perBatch = 100
  const batchesPerHour = 10000 / perBatch // 100 batches
  const delayMs = (60 * 60 * 1000) / batchesPerHour // ~36 seconds

  return batch(emails,
    async (email) => sendgrid.send(email),
    {
      batchSize: perBatch,
      delayMs,
      onBatchComplete: (_, index) => {
        console.log(`Batch ${index + 1} complete. Next batch in ${delayMs}ms`)
      }
    }
  )
}
```

### Exponential Backoff Between Batches

```typescript
async function batchWithBackoff<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  batchSize: number
): Promise<U[]> {
  const batches = chunk(items, batchSize)
  const results: U[] = []

  for (const [index, batch] of batches.entries()) {
    const delay = Math.min(1000 * Math.pow(2, index), 30000)
    if (index > 0) {
      await sleep(delay)
    }

    const batchResults = await Promise.all(batch.map(fn))
    results.push(...batchResults)
  }

  return results
}
```

---

## Polling Strategies

### Poll Function Overview

```typescript
import { poll } from 'receta/async'

// Poll until condition is met
const result = await poll(
  async () => {
    const job = await api.getJob(jobId)
    return job.status === 'completed' ? job : null
  },
  {
    intervalMs: 1000,     // Check every 1 second
    timeoutMs: 60000,     // Give up after 60 seconds
    maxAttempts: 100,     // Or after 100 attempts
  }
)
```

### Type Signature

```typescript
function poll<T>(
  fn: () => Promise<T | null | undefined>,
  options?: PollOptions
): Promise<Result<T, PollError>>

interface PollOptions {
  intervalMs?: number       // Time between checks (default: 1000)
  timeoutMs?: number       // Max total time (default: 30000)
  maxAttempts?: number     // Max number of attempts
  backoff?: 'linear' | 'exponential' | 'fibonacci'
  onAttempt?: (attempt: number) => void
}

type PollError =
  | { type: 'timeout'; attempts: number; duration: number }
  | { type: 'max_attempts'; attempts: number }
  | { type: 'error'; error: unknown; attempt: number }
```

---

## Polling Patterns

### Job Status Polling

```typescript
import { poll, timeout } from 'receta/async'
import { Result } from 'receta/result'

// AWS Batch job monitoring
async function waitForBatchJob(
  jobId: string
): Promise<Result<JobResult, PollError>> {
  return poll(
    async () => {
      const job = await batch.describeJobs({ jobs: [jobId] })
      const status = job.jobs[0]?.status

      if (status === 'SUCCEEDED') {
        return { jobId, status, output: job.jobs[0].container.output }
      }
      if (status === 'FAILED') {
        throw new Error(`Job failed: ${job.jobs[0].statusReason}`)
      }

      return null // Still running
    },
    {
      intervalMs: 5000,      // Check every 5 seconds
      timeoutMs: 3600000,    // 1 hour timeout
      backoff: 'exponential',
      onAttempt: (attempt) => {
        console.log(`Checking job status (attempt ${attempt})...`)
      }
    }
  )
}
```

### CI/CD Pipeline Monitoring

```typescript
// GitHub Actions workflow polling
async function waitForWorkflow(
  owner: string,
  repo: string,
  runId: number
): Promise<Result<WorkflowRun, PollError>> {
  return poll(
    async () => {
      const { data } = await octokit.actions.getWorkflowRun({
        owner,
        repo,
        run_id: runId
      })

      if (data.status === 'completed') {
        return data
      }

      return null // Still in progress
    },
    {
      intervalMs: 10000,  // Check every 10 seconds
      timeoutMs: 1800000, // 30 minute timeout
      onAttempt: (attempt) => {
        if (attempt % 6 === 0) { // Log every minute
          console.log(`Workflow still running (${attempt * 10}s elapsed)...`)
        }
      }
    }
  )
}
```

### Payment Processing Status

```typescript
// Stripe charge confirmation polling
async function waitForChargeConfirmation(
  chargeId: string
): Promise<Result<Charge, PollError>> {
  return poll(
    async () => {
      const charge = await stripe.charges.retrieve(chargeId)

      if (charge.status === 'succeeded') {
        return charge
      }
      if (charge.status === 'failed') {
        throw new Error(`Charge failed: ${charge.failure_message}`)
      }

      return null // Still pending
    },
    {
      intervalMs: 2000,
      maxAttempts: 30,  // 60 seconds max
      backoff: 'linear'
    }
  )
}
```

---

## Combining Poll with Timeout

### Race Against Time Limit

```typescript
import { poll, timeout, race } from 'receta/async'

async function pollWithTimeout<T>(
  fn: () => Promise<T | null>,
  pollIntervalMs: number,
  timeoutMs: number
): Promise<Result<T, 'timeout' | 'error'>> {
  return race([
    poll(fn, { intervalMs: pollIntervalMs }),
    timeout(timeoutMs)
  ])
}

// Usage
const result = await pollWithTimeout(
  async () => {
    const status = await checkJobStatus(jobId)
    return status.complete ? status : null
  },
  1000,
  30000
)
```

---

## Real-World Patterns

### Pattern 1: Data Import/Export

```typescript
// CSV export with batching and progress
async function exportUsersToCSV(
  filters: UserFilters
): Promise<Result<string, ExportError>> {
  const users = await db.user.findMany({ where: filters })

  if (users.length === 0) {
    return err({ type: 'no_data' })
  }

  const csvRows: string[] = ['id,email,name,created_at']

  await batch(users,
    async (user) => {
      const row = [
        user.id,
        user.email,
        user.name,
        user.createdAt.toISOString()
      ].join(',')
      csvRows.push(row)
    },
    {
      batchSize: 1000,
      onProgress: (completed, total) => {
        console.log(`Exported ${completed}/${total} users`)
      }
    }
  )

  const csv = csvRows.join('\n')
  const filename = `users_export_${Date.now()}.csv`

  await fs.writeFile(filename, csv)
  return ok(filename)
}
```

### Pattern 2: Email Sending Batches

```typescript
// SendGrid bulk email with rate limiting
interface EmailCampaign {
  recipients: EmailAddress[]
  template: string
  subject: string
}

async function sendEmailCampaign(
  campaign: EmailCampaign
): Promise<Result<CampaignReport, SendError>> {
  const report: CampaignReport = {
    sent: 0,
    failed: 0,
    errors: []
  }

  await batch(campaign.recipients,
    async (recipient) => {
      const result = await tryCatchAsync(async () => {
        await sendgrid.send({
          to: recipient.email,
          subject: campaign.subject,
          templateId: campaign.template,
          dynamicTemplateData: recipient.data
        })
      })

      if (isOk(result)) {
        report.sent++
      } else {
        report.failed++
        report.errors.push({
          recipient: recipient.email,
          error: result.error
        })
      }
    },
    {
      batchSize: 100,       // SendGrid batch limit
      delayMs: 1000,        // Rate limit compliance
      concurrency: 10,
      onBatchComplete: (_, index) => {
        console.log(`Sent batch ${index + 1}. Total sent: ${report.sent}`)
      }
    }
  )

  return ok(report)
}
```

### Pattern 3: Database Migrations

```typescript
// Backfill database records in batches
async function backfillUserScores(): Promise<Result<MigrationReport, MigrationError>> {
  const usersWithoutScores = await db.user.findMany({
    where: { score: null },
    select: { id: true }
  })

  console.log(`Found ${usersWithoutScores.length} users to backfill`)

  const report: MigrationReport = {
    processed: 0,
    failed: 0,
    errors: []
  }

  await batch(usersWithoutScores,
    async (user) => {
      const result = await tryCatchAsync(async () => {
        const score = await calculateUserScore(user.id)
        await db.user.update({
          where: { id: user.id },
          data: { score }
        })
      })

      if (isOk(result)) {
        report.processed++
      } else {
        report.failed++
        report.errors.push({ userId: user.id, error: result.error })
      }
    },
    {
      batchSize: 500,      // Database can handle larger batches
      delayMs: 100,        // Small delay to not overwhelm DB
      concurrency: 20,
      onProgress: (completed, total) => {
        const percent = ((completed / total) * 100).toFixed(1)
        console.log(`Migration progress: ${completed}/${total} (${percent}%)`)
      }
    }
  )

  return ok(report)
}
```

### Pattern 4: Order Processing

```typescript
// Process pending orders in batches
interface OrderProcessor {
  processPendingOrders(): Promise<Result<ProcessingReport, ProcessingError>>
}

const orderProcessor: OrderProcessor = {
  processPendingOrders: async () => {
    const pendingOrders = await db.order.findMany({
      where: { status: 'pending' },
      include: { items: true, customer: true }
    })

    const report: ProcessingReport = {
      processed: 0,
      skipped: 0,
      failed: 0,
      totalRevenue: 0
    }

    await batch(pendingOrders,
      async (order) => {
        // Check inventory
        const inventoryCheck = await checkInventory(order.items)
        if (!inventoryCheck.available) {
          report.skipped++
          return
        }

        // Process payment
        const paymentResult = await processPayment(order)
        if (isErr(paymentResult)) {
          report.failed++
          await db.order.update({
            where: { id: order.id },
            data: { status: 'failed', error: paymentResult.error }
          })
          return
        }

        // Update order
        await db.order.update({
          where: { id: order.id },
          data: { status: 'completed', processedAt: new Date() }
        })

        report.processed++
        report.totalRevenue += order.total
      },
      {
        batchSize: 50,
        delayMs: 500,
        concurrency: 5,
        onBatchComplete: (_, index) => {
          console.log(`Batch ${index + 1} complete`)
          console.log(`Processed: ${report.processed}, Failed: ${report.failed}, Skipped: ${report.skipped}`)
        }
      }
    )

    return ok(report)
  }
}
```

---

## Performance Optimization

### Memory Management

```typescript
// DON'T: Load all results in memory
async function processLargeDataset(items: Item[]) {
  const results = await batch(items, processItem, { batchSize: 1000 })
  return results // 1M items = huge memory usage
}

// DO: Stream results to disk
async function processLargeDataset(items: Item[]) {
  const outputStream = fs.createWriteStream('results.json')
  outputStream.write('[')

  let first = true
  await batch(items,
    async (item) => {
      const result = await processItem(item)
      const json = JSON.stringify(result)
      outputStream.write(first ? json : `,${json}`)
      first = false
    },
    { batchSize: 1000 }
  )

  outputStream.write(']')
  outputStream.end()
}
```

### Optimal Concurrency

```typescript
import os from 'os'

// Auto-detect optimal concurrency
function getOptimalConcurrency(taskType: 'cpu' | 'io'): number {
  const cpuCount = os.cpus().length

  if (taskType === 'cpu') {
    return cpuCount // CPU-bound: match CPU cores
  } else {
    return cpuCount * 4 // I/O-bound: can handle more
  }
}

// Usage
await batch(items, processItem, {
  batchSize: 100,
  concurrency: getOptimalConcurrency('io')
})
```

---

## Error Handling in Batches

### Fail Fast vs. Continue on Error

```typescript
// Strategy 1: Fail fast (default Promise.all behavior)
async function batchFailFast<T, U>(items: T[], fn: (item: T) => Promise<U>) {
  return batch(items, fn, { batchSize: 100 })
  // First error stops everything
}

// Strategy 2: Collect errors, continue processing
async function batchContinueOnError<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<{ results: U[]; errors: Array<{ index: number; error: unknown }> }> {
  const results: U[] = []
  const errors: Array<{ index: number; error: unknown }> = []

  await batch(items,
    async (item, index) => {
      const result = await tryCatchAsync(() => fn(item))
      if (isOk(result)) {
        results.push(result.value)
      } else {
        errors.push({ index, error: result.error })
      }
    },
    { batchSize: 100 }
  )

  return { results, errors }
}
```

### Retry Failed Items

```typescript
async function batchWithRetry<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  maxRetries = 3
): Promise<Result<U[], BatchError>> {
  let currentItems = items
  let allResults: U[] = []

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const { results, errors } = await batchContinueOnError(currentItems, fn)

    allResults.push(...results)

    if (errors.length === 0) {
      return ok(allResults)
    }

    if (attempt === maxRetries) {
      return err({
        type: 'batch_failed',
        message: `${errors.length} items failed after ${maxRetries} retries`,
        failedItems: errors
      })
    }

    // Retry only failed items
    currentItems = errors.map(e => items[e.index])
    console.log(`Retrying ${currentItems.length} failed items (attempt ${attempt + 1})`)
  }

  return err({ type: 'unexpected_error' })
}
```

---

## Progress Tracking

### Console Progress Bar

```typescript
import { batch } from 'receta/async'

async function processWithProgress<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  const total = items.length
  let completed = 0

  return batch(items, fn, {
    batchSize: 100,
    onProgress: (done, total) => {
      completed = done
      const percent = ((done / total) * 100).toFixed(1)
      const bar = '█'.repeat(Math.floor(done / total * 40))
      const empty = '░'.repeat(40 - bar.length)
      process.stdout.write(`\r[${bar}${empty}] ${percent}% (${done}/${total})`)
    }
  })
}
```

### Structured Progress Reporting

```typescript
interface ProgressReport {
  stage: string
  completed: number
  total: number
  percent: number
  estimatedTimeRemaining: number
  errors: number
}

class BatchProgressTracker {
  private startTime = Date.now()
  private completed = 0
  private errors = 0

  constructor(
    private total: number,
    private stage: string,
    private onUpdate: (report: ProgressReport) => void
  ) {}

  update(completed: number, errorOccurred = false) {
    this.completed = completed
    if (errorOccurred) this.errors++

    const elapsed = Date.now() - this.startTime
    const rate = completed / elapsed
    const remaining = this.total - completed
    const estimatedTimeRemaining = remaining / rate

    this.onUpdate({
      stage: this.stage,
      completed,
      total: this.total,
      percent: (completed / this.total) * 100,
      estimatedTimeRemaining,
      errors: this.errors
    })
  }
}

// Usage
async function processWithTracking<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>
): Promise<U[]> {
  const tracker = new BatchProgressTracker(
    items.length,
    'Processing items',
    (report) => {
      console.log(`${report.stage}: ${report.completed}/${report.total}`)
      console.log(`ETA: ${Math.round(report.estimatedTimeRemaining / 1000)}s`)
      if (report.errors > 0) {
        console.log(`Errors: ${report.errors}`)
      }
    }
  )

  return batch(items,
    async (item, index) => {
      const result = await tryCatchAsync(() => fn(item))
      tracker.update(index + 1, isErr(result))
      if (isErr(result)) throw result.error
      return result.value
    },
    { batchSize: 100 }
  )
}
```

---

## Summary

### When to Use Batching

Use `batch()` when:
- Processing large datasets (>100 items)
- Calling rate-limited APIs
- Managing memory usage
- Need progress tracking
- Want controlled concurrency

### When to Use Polling

Use `poll()` when:
- Waiting for async jobs to complete
- Monitoring external system status
- Processing webhooks/callbacks
- Checking for data availability
- Long-running operations

### Best Practices

1. **Start conservative**: Small batch sizes, low concurrency
2. **Monitor and adjust**: Track performance, optimize iteratively
3. **Handle errors gracefully**: Continue on error, retry failed items
4. **Respect rate limits**: Add delays between batches
5. **Track progress**: Keep users informed on long operations
6. **Test edge cases**: Empty arrays, all failures, timeouts
7. **Use appropriate backoff**: Exponential for retries, linear for polling

# Concurrency Control

> Managing parallel operations, rate limits, and performance optimization in async workflows.

## Overview

Concurrency control lets you execute multiple async operations efficiently while respecting system constraints like API rate limits, memory usage, and CPU capacity.

| Function | Purpose | Real-World Analogy |
|----------|---------|-------------------|
| `mapAsync(items, fn, { concurrency })` | Transform items in parallel with limit | Processing orders with N workers |
| `filterAsync(items, predicate, { concurrency })` | Filter items using async predicate | Checking inventory across warehouses |
| `parallel(tasks)` | Run all tasks simultaneously | Fetching data from multiple APIs at once |
| `sequential(tasks)` | Run tasks one after another | Processing payments in order |

---

## `mapAsync` - Controlled Parallel Mapping

**When to use**: You need to transform many items using async operations, but want to limit how many run at once.

### Signature

```typescript
function mapAsync<T, U>(
  items: readonly T[],
  fn: (item: T, index: number) => Promise<U>,
  options?: { concurrency?: number }
): Promise<U[]>
```

### Real-World: GitHub Bulk Repository Fetch

**Problem**: Fetch data for 1000 repositories, but GitHub limits you to 5000 requests/hour.

```typescript
import { mapAsync } from 'receta/async'

type Repo = {
  name: string
  stars: number
  language: string
}

// Fetch repos with concurrency limit to avoid rate limit
const fetchRepos = async (repoNames: string[]) => {
  return mapAsync(
    repoNames,
    async (name) => {
      const [owner, repo] = name.split('/')
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      })
      const data = await res.json()
      return {
        name: data.name,
        stars: data.stargazers_count,
        language: data.language
      }
    },
    { concurrency: 10 } // Max 10 requests at once
  )
}

// Usage
const repos = await fetchRepos([
  'facebook/react',
  'microsoft/typescript',
  'vercel/next.js',
  // ... 997 more repos
])
```

**Why concurrency: 10?**
- GitHub allows 5000 requests/hour = ~83/minute = ~1.4/second
- 10 concurrent requests is safe and fast
- Too high (100+) risks hitting rate limit
- Too low (1-2) wastes time

### Real-World: Stripe Batch Payment Processing

**Problem**: Process 500 customer payments, but Stripe limits to 100 requests/second.

```typescript
type Payment = {
  customerId: string
  amount: number
  currency: string
}

type PaymentResult = {
  id: string
  status: 'succeeded' | 'failed'
  customerId: string
}

const processPayments = async (payments: Payment[]): Promise<PaymentResult[]> => {
  return mapAsync(
    payments,
    async (payment) => {
      const charge = await stripe.charges.create({
        amount: payment.amount,
        currency: payment.currency,
        customer: payment.customerId
      })
      return {
        id: charge.id,
        status: charge.status as 'succeeded' | 'failed',
        customerId: payment.customerId
      }
    },
    { concurrency: 50 } // 50 concurrent = safe for 100/sec limit
  )
}

// Usage
const payments: Payment[] = [
  { customerId: 'cus_123', amount: 1000, currency: 'usd' },
  { customerId: 'cus_456', amount: 2500, currency: 'usd' },
  // ... 498 more
]

const results = await processPayments(payments)
console.log(`Processed ${results.filter(r => r.status === 'succeeded').length} payments`)
```

### Real-World: Image Processing Pipeline

**Problem**: Resize 1000 product images, but each resize uses 100MB RAM.

```typescript
import sharp from 'sharp'
import fs from 'fs/promises'

const resizeImages = async (imagePaths: string[]) => {
  return mapAsync(
    imagePaths,
    async (path) => {
      const outputPath = path.replace('.jpg', '-thumb.jpg')

      await sharp(path)
        .resize(300, 300, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toFile(outputPath)

      return outputPath
    },
    { concurrency: 4 } // Only 4 images at once to limit memory
  )
}

// Usage
const images = await fs.readdir('./products')
const thumbnails = await resizeImages(
  images.map(img => `./products/${img}`)
)
```

**Why concurrency: 4?**
- Each resize uses ~100MB RAM
- 4 concurrent = ~400MB total
- Prevents OOM errors on low-memory servers
- Adjust based on available RAM

### Real-World: Database Bulk Operations

**Problem**: Update 10,000 user records, but database connection pool has 20 connections.

```typescript
const updateUsers = async (updates: Array<{ id: string; name: string }>) => {
  return mapAsync(
    updates,
    async (update) => {
      return db.user.update({
        where: { id: update.id },
        data: { name: update.name }
      })
    },
    { concurrency: 15 } // Leave 5 connections for other queries
  )
}
```

### Performance Characteristics

```typescript
// Benchmark: Fetching 100 URLs
const urls = Array.from({ length: 100 }, (_, i) => `https://api.example.com/item/${i}`)

// No limit (concurrency: Infinity) - 2.3 seconds, might fail
await mapAsync(urls, fetch) // All 100 at once!

// concurrency: 50 - 2.5 seconds, stable
await mapAsync(urls, fetch, { concurrency: 50 })

// concurrency: 10 - 4.1 seconds, very stable
await mapAsync(urls, fetch, { concurrency: 10 })

// concurrency: 1 - 23 seconds, sequential
await mapAsync(urls, fetch, { concurrency: 1 })
```

**Rule of Thumb**: Start with concurrency = 10, then adjust based on:
- API rate limits (lower)
- Memory constraints (lower)
- Network capacity (higher)
- Need for speed (higher)

---

## `filterAsync` - Async Filtering

**When to use**: Filter items using an async condition (like checking if file exists, or if product is in stock).

### Signature

```typescript
function filterAsync<T>(
  items: readonly T[],
  predicate: (item: T, index: number) => Promise<boolean>,
  options?: { concurrency?: number }
): Promise<T[]>
```

### Real-World: Check Inventory Across Warehouses

**Problem**: Filter products that are in stock by checking multiple warehouse APIs.

```typescript
import { filterAsync } from 'receta/async'

type Product = {
  id: string
  name: string
  sku: string
}

const isInStock = async (product: Product): Promise<boolean> => {
  // Check all warehouses in parallel
  const warehouses = ['US-EAST', 'US-WEST', 'EU-CENTRAL']

  const results = await Promise.all(
    warehouses.map(async (warehouse) => {
      const res = await fetch(
        `https://warehouse.api.com/${warehouse}/stock/${product.sku}`
      )
      const data = await res.json()
      return data.quantity > 0
    })
  )

  return results.some(inStock => inStock) // In stock if ANY warehouse has it
}

const filterInStockProducts = async (products: Product[]) => {
  return filterAsync(
    products,
    isInStock,
    { concurrency: 20 } // Check 20 products at once
  )
}

// Usage
const allProducts: Product[] = [
  { id: '1', name: 'iPhone', sku: 'IPHONE-14' },
  { id: '2', name: 'MacBook', sku: 'MACBOOK-PRO' },
  // ... 998 more
]

const inStock = await filterInStockProducts(allProducts)
console.log(`${inStock.length} products available`)
```

### Real-World: Validate S3 Objects Exist

**Problem**: Filter a list of S3 keys to only those that exist.

```typescript
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({ region: 'us-east-1' })

const objectExists = async (key: string): Promise<boolean> => {
  try {
    await s3.send(new HeadObjectCommand({
      Bucket: 'my-bucket',
      Key: key
    }))
    return true
  } catch {
    return false
  }
}

const filterExistingFiles = async (keys: string[]) => {
  return filterAsync(
    keys,
    objectExists,
    { concurrency: 30 } // S3 can handle high concurrency
  )
}

// Usage
const requestedFiles = [
  'uploads/avatar-123.jpg',
  'uploads/avatar-456.jpg',
  'uploads/deleted-file.jpg', // Doesn't exist
  // ... more files
]

const existingFiles = await filterExistingFiles(requestedFiles)
```

### Real-World: Find Valid Email Addresses

**Problem**: Filter email list by actually checking if addresses are deliverable.

```typescript
const isValidEmail = async (email: string): Promise<boolean> => {
  try {
    // Use email validation API
    const res = await fetch(
      `https://api.emailvalidation.com/verify?email=${email}`,
      { headers: { 'X-API-Key': API_KEY } }
    )
    const data = await res.json()
    return data.status === 'deliverable'
  } catch {
    return false
  }
}

const filterValidEmails = async (emails: string[]) => {
  return filterAsync(
    emails,
    isValidEmail,
    { concurrency: 5 } // Respect API rate limit
  )
}

// Usage
const emailList = ['user1@example.com', 'fake@invalid.xyz', /* ... */]
const validEmails = await filterValidEmails(emailList)
```

---

## `parallel` - Run All Tasks Together

**When to use**: You have independent tasks that should all run simultaneously (fetching from multiple APIs, running independent calculations).

### Signature

```typescript
function parallel<T extends readonly unknown[]>(
  tasks: { [K in keyof T]: () => Promise<T[K]> }
): Promise<T>
```

### Real-World: Dashboard Data Loading

**Problem**: Load dashboard data from 5 different sources - should all load at once.

```typescript
import { parallel } from 'receta/async'

type DashboardData = {
  userStats: { total: number; active: number }
  recentOrders: Order[]
  revenue: { today: number; month: number }
  notifications: Notification[]
  systemHealth: { status: 'healthy' | 'degraded' }
}

const loadDashboard = async (): Promise<DashboardData> => {
  const [userStats, recentOrders, revenue, notifications, systemHealth] =
    await parallel([
      () => fetch('/api/users/stats').then(r => r.json()),
      () => fetch('/api/orders/recent').then(r => r.json()),
      () => fetch('/api/revenue').then(r => r.json()),
      () => fetch('/api/notifications').then(r => r.json()),
      () => fetch('/api/health').then(r => r.json())
    ])

  return { userStats, recentOrders, revenue, notifications, systemHealth }
}

// Usage - All 5 APIs load in parallel
const data = await loadDashboard()
// Total time = slowest API (not sum of all APIs)
```

### Real-World: Multi-Region Deployment

**Problem**: Deploy to 3 cloud regions simultaneously.

```typescript
const deployToRegion = async (region: string, artifact: string) => {
  console.log(`Deploying to ${region}...`)
  // Upload artifact, update servers, health check
  await uploadArtifact(region, artifact)
  await updateServers(region)
  await healthCheck(region)
  console.log(`${region} deployed!`)
}

const deployGlobally = async (artifact: string) => {
  const regions = ['us-east-1', 'eu-west-1', 'ap-southeast-1']

  await parallel(
    regions.map(region => () => deployToRegion(region, artifact))
  )

  console.log('Global deployment complete!')
}

// All regions deploy at the same time
await deployGlobally('v2.3.0')
```

### Real-World: Microservices Health Check

**Problem**: Check health of 10 microservices in parallel.

```typescript
type ServiceHealth = {
  name: string
  status: 'healthy' | 'unhealthy'
  responseTime: number
}

const checkService = async (name: string, url: string): Promise<ServiceHealth> => {
  const start = Date.now()

  try {
    const res = await fetch(`${url}/health`, {
      signal: AbortSignal.timeout(5000)
    })
    const responseTime = Date.now() - start

    return {
      name,
      status: res.ok ? 'healthy' : 'unhealthy',
      responseTime
    }
  } catch {
    return { name, status: 'unhealthy', responseTime: Date.now() - start }
  }
}

const checkAllServices = async () => {
  const services = {
    auth: 'https://auth.api.com',
    payments: 'https://payments.api.com',
    inventory: 'https://inventory.api.com',
    shipping: 'https://shipping.api.com',
    notifications: 'https://notifications.api.com'
  }

  const results = await parallel(
    Object.entries(services).map(([name, url]) =>
      () => checkService(name, url)
    )
  )

  return results
}

// Usage
const health = await checkAllServices()
health.forEach(({ name, status, responseTime }) => {
  console.log(`${name}: ${status} (${responseTime}ms)`)
})
```

### Performance Characteristics

```typescript
// Sequential (slow)
const slow = async () => {
  const a = await fetchA() // 1 second
  const b = await fetchB() // 1 second
  const c = await fetchC() // 1 second
  return [a, b, c]
}
await slow() // Total: 3 seconds

// Parallel (fast)
const fast = async () => {
  return parallel([fetchA, fetchB, fetchC])
}
await fast() // Total: 1 second (all run at once)
```

---

## `sequential` - Run Tasks In Order

**When to use**: Tasks depend on each other, or you need guaranteed ordering (payment processing, database migrations).

### Signature

```typescript
function sequential<T extends readonly unknown[]>(
  tasks: { [K in keyof T]: () => Promise<T[K]> }
): Promise<T>
```

### Real-World: Payment Processing Flow

**Problem**: Process payment steps in exact order - can't capture before authorization!

```typescript
import { sequential } from 'receta/async'

type PaymentFlow = {
  authorized: AuthResult
  captured: CaptureResult
  receipt: ReceiptResult
  notification: NotificationResult
}

const processPayment = async (
  customerId: string,
  amount: number
): Promise<PaymentFlow> => {
  const [authorized, captured, receipt, notification] = await sequential([
    // Step 1: Authorize card
    async () => {
      console.log('Authorizing...')
      return stripe.authorizations.create({
        customer: customerId,
        amount
      })
    },

    // Step 2: Capture funds (only after authorization!)
    async () => {
      console.log('Capturing...')
      return stripe.captures.create({ /* ... */ })
    },

    // Step 3: Generate receipt
    async () => {
      console.log('Generating receipt...')
      return generateReceipt(customerId, amount)
    },

    // Step 4: Send notification
    async () => {
      console.log('Sending notification...')
      return sendEmail(customerId, 'Payment received')
    }
  ])

  return { authorized, captured, receipt, notification }
}

// Each step waits for previous to complete
await processPayment('cus_123', 5000)
```

### Real-World: Database Migration Pipeline

**Problem**: Run migrations in order - migration 003 depends on 002.

```typescript
type Migration = {
  version: string
  name: string
  sql: string
}

const migrations: Migration[] = [
  { version: '001', name: 'create_users', sql: 'CREATE TABLE users...' },
  { version: '002', name: 'add_email_index', sql: 'CREATE INDEX...' },
  { version: '003', name: 'add_users_status', sql: 'ALTER TABLE users...' }
]

const runMigration = async (migration: Migration) => {
  console.log(`Running migration ${migration.version}: ${migration.name}`)
  await db.execute(migration.sql)
  await db.migrations.insert({ version: migration.version })
  console.log(`✓ Completed ${migration.version}`)
}

const migrate = async () => {
  await sequential(
    migrations.map(m => () => runMigration(m))
  )
  console.log('All migrations complete!')
}

// Runs in exact order: 001 → 002 → 003
await migrate()
```

### Real-World: Video Processing Pipeline

**Problem**: Process video in stages - can't add subtitles before transcoding!

```typescript
const processVideo = async (videoId: string) => {
  const [transcoded, thumbnail, subtitles, uploaded] = await sequential([
    // Step 1: Transcode to different resolutions
    async () => {
      console.log('Transcoding video...')
      return transcode(videoId, ['720p', '1080p', '4k'])
    },

    // Step 2: Generate thumbnail from transcoded video
    async () => {
      console.log('Generating thumbnail...')
      return generateThumbnail(videoId)
    },

    // Step 3: Generate subtitles
    async () => {
      console.log('Generating subtitles...')
      return generateSubtitles(videoId)
    },

    // Step 4: Upload everything to CDN
    async () => {
      console.log('Uploading to CDN...')
      return uploadToCDN(videoId)
    }
  ])

  return { transcoded, thumbnail, subtitles, uploaded }
}
```

---

## Concurrency Patterns

### Pattern 1: Rate-Limited API Calls

**Problem**: GitHub allows 5000 requests/hour. Need to fetch 1000 repos.

```typescript
import { mapAsync } from 'receta/async'

const GITHUB_RATE_LIMIT = 5000 // requests per hour
const SAFE_CONCURRENCY = 10    // requests at once

const fetchGitHubRepos = async (repos: string[]) => {
  return mapAsync(
    repos,
    async (repo) => {
      const res = await fetch(`https://api.github.com/repos/${repo}`)
      return res.json()
    },
    { concurrency: SAFE_CONCURRENCY }
  )
}

// Alternative: Add delay between requests
const fetchWithDelay = async (url: string) => {
  await new Promise(resolve => setTimeout(resolve, 100)) // 100ms delay
  return fetch(url).then(r => r.json())
}
```

### Pattern 2: Memory-Constrained Processing

**Problem**: Process 1000 large files, but only 2GB RAM available.

```typescript
import { mapAsync } from 'receta/async'

const processLargeFiles = async (files: string[]) => {
  // Each file uses ~500MB when processing
  // 2GB / 500MB = 4 files max
  return mapAsync(
    files,
    async (file) => {
      const data = await readLargeFile(file) // 500MB
      const processed = await processData(data)
      await writeOutput(processed)
      return processed
    },
    { concurrency: 3 } // Leave some RAM headroom
  )
}
```

### Pattern 3: Batch Processing with Progress

**Problem**: Process 10,000 items and show progress.

```typescript
const processBatch = async <T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  onProgress: (completed: number, total: number) => void
) => {
  let completed = 0

  const results = await mapAsync(
    items,
    async (item) => {
      const result = await fn(item)
      completed++
      onProgress(completed, items.length)
      return result
    },
    { concurrency: 20 }
  )

  return results
}

// Usage
await processBatch(
  users,
  updateUser,
  (completed, total) => {
    console.log(`Progress: ${completed}/${total} (${(completed/total*100).toFixed(1)}%)`)
  }
)
```

### Pattern 4: Retry with Exponential Backoff

**Problem**: API calls sometimes fail - retry with increasing delays.

```typescript
const retryWithBackoff = async <T>(
  fn: () => Promise<T>,
  maxRetries = 3
): Promise<T> => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error) {
      if (attempt === maxRetries) throw error

      const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
      console.log(`Retry ${attempt + 1}/${maxRetries} after ${delay}ms`)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  throw new Error('Max retries exceeded')
}

// Usage with mapAsync
const fetchWithRetry = async (urls: string[]) => {
  return mapAsync(
    urls,
    (url) => retryWithBackoff(() => fetch(url).then(r => r.json())),
    { concurrency: 10 }
  )
}
```

### Pattern 5: Priority Queue Processing

**Problem**: Process high-priority items first, then low-priority.

```typescript
type Task = {
  id: string
  priority: 'high' | 'low'
  fn: () => Promise<void>
}

const processByPriority = async (tasks: Task[]) => {
  const high = tasks.filter(t => t.priority === 'high')
  const low = tasks.filter(t => t.priority === 'low')

  // Process high priority first (parallel)
  await mapAsync(high, t => t.fn(), { concurrency: 10 })

  // Then process low priority
  await mapAsync(low, t => t.fn(), { concurrency: 5 })
}
```

---

## Comparison Table

| Function | Execution | Use Case | Concurrency Control |
|----------|-----------|----------|---------------------|
| `mapAsync` | Parallel with limit | Transform many items | ✅ Yes (configurable) |
| `filterAsync` | Parallel with limit | Filter with async check | ✅ Yes (configurable) |
| `parallel` | All at once | Independent tasks | ❌ No (all run together) |
| `sequential` | One by one | Dependent tasks | ❌ No (always sequential) |

### When to Use Each

```typescript
// mapAsync - Transform with rate limit
const results = await mapAsync(items, fetchData, { concurrency: 10 })

// filterAsync - Filter with async validation
const valid = await filterAsync(items, isValid, { concurrency: 20 })

// parallel - Load independent data
const [users, products, orders] = await parallel([
  fetchUsers,
  fetchProducts,
  fetchOrders
])

// sequential - Steps depend on each other
const [auth, data, processed] = await sequential([
  authenticate,
  fetchData,
  processData
])
```

---

## Common Pitfalls and Solutions

### Pitfall 1: Too High Concurrency

```typescript
// ❌ Bad - Will hit rate limit
await mapAsync(repos, fetchRepo) // Default: unlimited!

// ✅ Good - Respect rate limit
await mapAsync(repos, fetchRepo, { concurrency: 10 })
```

### Pitfall 2: Sequential When Should Parallel

```typescript
// ❌ Bad - Slow (3 seconds total)
const a = await fetchA() // 1 second
const b = await fetchB() // 1 second
const c = await fetchC() // 1 second

// ✅ Good - Fast (1 second total)
const [a, b, c] = await parallel([fetchA, fetchB, fetchC])
```

### Pitfall 3: Parallel When Should Sequential

```typescript
// ❌ Bad - Might capture before authorization completes!
const [auth, capture] = await parallel([
  authorizeCard,
  capturePayment
])

// ✅ Good - Capture only after authorization
const [auth, capture] = await sequential([
  authorizeCard,
  capturePayment
])
```

### Pitfall 4: Not Handling Errors

```typescript
// ❌ Bad - One failure stops everything
await mapAsync(items, processItem)

// ✅ Good - Handle errors individually
await mapAsync(items, async (item) => {
  try {
    return await processItem(item)
  } catch (error) {
    console.error(`Failed to process ${item.id}:`, error)
    return null // or return error object
  }
})
```

### Pitfall 5: Memory Leak in Long-Running Tasks

```typescript
// ❌ Bad - Loads all files into memory at once
const files = await Promise.all(filePaths.map(readFile))

// ✅ Good - Process in batches
const processInBatches = async (items: string[], batchSize = 100) => {
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize)
    await mapAsync(batch, processFile, { concurrency: 10 })
  }
}
```

---

## Performance Guidelines

### Choosing the Right Concurrency Limit

```typescript
// API Rate Limits
const concurrency = {
  github: 10,        // 5000/hour = ~1.4/second, 10 is safe
  stripe: 50,        // 100/second, 50 is safe
  twitter: 5,        // Strict limits
  internal: 100      // Your own API, can be higher
}

// System Resources
const concurrency = {
  imageProcessing: 4,   // CPU-intensive
  fileIO: 20,           // I/O bound
  database: 15,         // Based on connection pool size
  network: 50           // Network I/O
}

// Rule of thumb
const safeConcurrency = Math.min(
  rateLimit / 2,           // Half of rate limit
  connectionPoolSize - 5,  // Leave connections for other tasks
  availableRAM / taskMemory // Don't exceed RAM
)
```

### Benchmarking Your Operations

```typescript
const benchmark = async () => {
  const items = Array.from({ length: 100 }, (_, i) => i)

  const concurrencies = [1, 5, 10, 20, 50, 100]

  for (const concurrency of concurrencies) {
    const start = Date.now()

    await mapAsync(
      items,
      async (item) => {
        await new Promise(resolve => setTimeout(resolve, 100))
        return item * 2
      },
      { concurrency }
    )

    const duration = Date.now() - start
    console.log(`Concurrency ${concurrency}: ${duration}ms`)
  }
}

// Results:
// Concurrency 1: 10,000ms
// Concurrency 5: 2,000ms
// Concurrency 10: 1,000ms ← Sweet spot
// Concurrency 20: 500ms
// Concurrency 50: 200ms
// Concurrency 100: 100ms ← Diminishing returns
```

### Memory Usage Monitoring

```typescript
const monitorMemory = async () => {
  const before = process.memoryUsage()

  await mapAsync(
    largeDataset,
    processItem,
    { concurrency: 10 }
  )

  const after = process.memoryUsage()
  const diff = after.heapUsed - before.heapUsed

  console.log(`Memory used: ${(diff / 1024 / 1024).toFixed(2)}MB`)

  // If too high, reduce concurrency
}
```

### Optimal Concurrency Formula

```typescript
const calculateOptimalConcurrency = (params: {
  rateLimit?: number        // Requests per second allowed
  taskDuration?: number     // Average task duration in ms
  memoryPerTask?: number    // MB per task
  availableMemory?: number  // Total MB available
  poolSize?: number         // Connection pool size
}) => {
  const limits = [
    params.rateLimit ? params.rateLimit * 0.8 : Infinity,
    params.availableMemory && params.memoryPerTask
      ? Math.floor(params.availableMemory / params.memoryPerTask)
      : Infinity,
    params.poolSize ? params.poolSize * 0.8 : Infinity,
    100 // Never go above 100
  ]

  return Math.floor(Math.min(...limits))
}

// Example usage
const concurrency = calculateOptimalConcurrency({
  rateLimit: 100,        // 100 req/sec
  memoryPerTask: 50,     // 50MB per task
  availableMemory: 1000, // 1GB available
  poolSize: 20           // 20 connections
})

console.log(`Optimal concurrency: ${concurrency}`)
// Output: 16 (limited by poolSize: 20 * 0.8 = 16)
```

---

## Real-World Example: E-Commerce Order Processing

Putting it all together - processing orders with multiple async steps:

```typescript
import { mapAsync, sequential, parallel } from 'receta/async'

type Order = {
  id: string
  items: Array<{ productId: string; quantity: number }>
  customerId: string
  total: number
}

const processOrder = async (order: Order) => {
  // Sequential: Must happen in order
  const [validated, charged, fulfilled] = await sequential([
    // Step 1: Validate inventory
    async () => {
      console.log(`Validating order ${order.id}`)
      const inStock = await validateInventory(order.items)
      if (!inStock) throw new Error('Out of stock')
      return true
    },

    // Step 2: Charge customer (only after validation!)
    async () => {
      console.log(`Charging customer for order ${order.id}`)
      return stripe.charges.create({
        customer: order.customerId,
        amount: order.total
      })
    },

    // Step 3: Fulfill order (only after payment!)
    async () => {
      console.log(`Fulfilling order ${order.id}`)

      // Parallel: These can happen at the same time
      const [shipment, receipt, notification] = await parallel([
        () => createShipment(order),
        () => generateReceipt(order),
        () => sendOrderConfirmation(order.customerId)
      ])

      return { shipment, receipt, notification }
    }
  ])

  return { validated, charged, fulfilled }
}

const processOrders = async (orders: Order[]) => {
  // Process multiple orders concurrently (but each order is sequential internally)
  return mapAsync(
    orders,
    processOrder,
    { concurrency: 10 } // Process 10 orders at once
  )
}

// Usage
const orders: Order[] = [/* ... 100 orders ... */]
const results = await processOrders(orders)
console.log(`Processed ${results.length} orders`)
```

---

## Next Steps

- **[Error Handling](./02-error-handling.md)**: Handle async errors with Result pattern
- **[Retry Strategies](./03-retry.md)**: Implement retry logic with exponential backoff
- **[API Reference](./07-api-reference.md)**: Complete async module API

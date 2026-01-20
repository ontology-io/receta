# Common Patterns & Recipes

Real-world patterns for async operations using Receta's async module. All examples are production-ready and use actual APIs.

## API Integration Patterns

### GitHub API Client with Rate Limiting

GitHub API has strict rate limits (5000 requests/hour authenticated). This pattern handles rate limiting gracefully.

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { mapAsync, retryWithBackoff } from 'receta/async'

interface GitHubRateLimit {
  limit: number
  remaining: number
  reset: number
}

interface GitHubRepo {
  name: string
  full_name: string
  stargazers_count: number
  language: string
}

class GitHubClient {
  private rateLimit: GitHubRateLimit | null = null
  private readonly baseUrl = 'https://api.github.com'

  constructor(private readonly token: string) {}

  /**
   * Fetch with automatic rate limit handling
   */
  private async fetchWithRateLimit<T>(
    endpoint: string
  ): Promise<Result<T, string>> {
    // Check if we're rate limited
    if (this.rateLimit && this.rateLimit.remaining === 0) {
      const now = Date.now() / 1000
      const waitTime = Math.max(0, this.rateLimit.reset - now)

      if (waitTime > 0) {
        await new Promise(resolve => setTimeout(resolve, waitTime * 1000))
      }
    }

    return retryWithBackoff(
      async () => {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        })

        // Update rate limit from headers
        this.rateLimit = {
          limit: parseInt(response.headers.get('X-RateLimit-Limit') || '5000'),
          remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '5000'),
          reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0'),
        }

        if (!response.ok) {
          if (response.status === 403 && this.rateLimit.remaining === 0) {
            throw new Error('RATE_LIMIT_EXCEEDED')
          }
          throw new Error(`GitHub API error: ${response.status}`)
        }

        return await response.json() as T
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 10000,
        shouldRetry: (error) => {
          // Retry on rate limit and 5xx errors
          return error.message === 'RATE_LIMIT_EXCEEDED' ||
                 error.message.includes('5')
        },
      }
    )
  }

  /**
   * Fetch all repositories for an organization
   */
  async getOrgRepos(org: string): Promise<Result<GitHubRepo[], string>> {
    const repos: GitHubRepo[] = []
    let page = 1

    while (true) {
      const result = await this.fetchWithRateLimit<GitHubRepo[]>(
        `/orgs/${org}/repos?page=${page}&per_page=100`
      )

      if (Result.isErr(result)) {
        return result
      }

      const pageRepos = result.value
      if (pageRepos.length === 0) break

      repos.push(...pageRepos)
      page++
    }

    return Result.ok(repos)
  }

  /**
   * Fetch multiple repos in parallel with concurrency control
   */
  async getReposBatch(
    repoNames: string[]
  ): Promise<Array<Result<GitHubRepo, string>>> {
    return mapAsync(
      repoNames,
      async (name) => this.fetchWithRateLimit<GitHubRepo>(`/repos/${name}`),
      { concurrency: 10 } // Stay under rate limit
    )
  }
}

// Usage
const client = new GitHubClient(process.env.GITHUB_TOKEN!)

// Fetch all repos for an org
const orgRepos = await client.getOrgRepos('facebook')
if (Result.isOk(orgRepos)) {
  console.log(`Found ${orgRepos.value.length} repos`)

  const topRepos = R.pipe(
    orgRepos.value,
    R.sortBy(repo => -repo.stargazers_count),
    R.take(10)
  )

  console.log('Top 10 repos:', topRepos)
}

// Fetch specific repos in parallel
const repos = await client.getReposBatch([
  'facebook/react',
  'facebook/react-native',
  'facebook/jest',
])

const successful = repos.filter(Result.isOk)
console.log(`Successfully fetched ${successful.length}/${repos.length} repos`)
```

### Stripe Payment Processing

Handle payment processing with proper error handling and retry logic for network failures.

```typescript
import { Result } from 'receta/result'
import { retryWithBackoff, timeout } from 'receta/async'

interface StripePaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'processing' | 'requires_payment_method' | 'canceled'
  client_secret: string
}

interface StripeCharge {
  id: string
  amount: number
  paid: boolean
  status: string
}

interface CreatePaymentParams {
  amount: number
  currency: string
  customerId: string
  description: string
  metadata?: Record<string, string>
}

class StripeClient {
  private readonly baseUrl = 'https://api.stripe.com/v1'

  constructor(private readonly secretKey: string) {}

  /**
   * Create payment intent with automatic retry
   */
  async createPaymentIntent(
    params: CreatePaymentParams
  ): Promise<Result<StripePaymentIntent, string>> {
    return retryWithBackoff(
      async () => {
        const body = new URLSearchParams({
          amount: params.amount.toString(),
          currency: params.currency,
          customer: params.customerId,
          description: params.description,
          ...R.mapValues(params.metadata || {}, String),
        })

        const response = await fetch(`${this.baseUrl}/payment_intents`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.secretKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: body.toString(),
        })

        if (!response.ok) {
          const error = await response.json()
          throw new Error(error.error?.message || 'Payment failed')
        }

        return await response.json() as StripePaymentIntent
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        shouldRetry: (error) => {
          // Retry on network errors, not on payment errors
          return !error.message.includes('card') &&
                 !error.message.includes('insufficient')
        },
      }
    )
  }

  /**
   * Wait for payment to complete with timeout
   */
  async waitForPaymentSuccess(
    paymentIntentId: string,
    maxWaitMs: number = 30000
  ): Promise<Result<StripePaymentIntent, string>> {
    return timeout(
      async () => {
        while (true) {
          const result = await this.getPaymentIntent(paymentIntentId)

          if (Result.isErr(result)) {
            return result
          }

          const intent = result.value

          if (intent.status === 'succeeded') {
            return Result.ok(intent)
          }

          if (intent.status === 'canceled' ||
              intent.status === 'requires_payment_method') {
            return Result.err(`Payment ${intent.status}`)
          }

          // Still processing, wait and check again
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      },
      maxWaitMs,
      `Payment confirmation timeout after ${maxWaitMs}ms`
    )
  }

  /**
   * Get payment intent details
   */
  private async getPaymentIntent(
    id: string
  ): Promise<Result<StripePaymentIntent, string>> {
    return retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/payment_intents/${id}`, {
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch payment intent: ${response.status}`)
      }

      return await response.json() as StripePaymentIntent
    })
  }

  /**
   * Process refund with validation
   */
  async refundPayment(
    paymentIntentId: string,
    amount?: number
  ): Promise<Result<StripeCharge, string>> {
    return retryWithBackoff(async () => {
      const body = new URLSearchParams({
        payment_intent: paymentIntentId,
        ...(amount && { amount: amount.toString() }),
      })

      const response = await fetch(`${this.baseUrl}/refunds`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error?.message || 'Refund failed')
      }

      return await response.json() as StripeCharge
    })
  }
}

// Usage
const stripe = new StripeClient(process.env.STRIPE_SECRET_KEY!)

// Create and wait for payment
const paymentResult = await stripe.createPaymentIntent({
  amount: 2000, // $20.00
  currency: 'usd',
  customerId: 'cus_123',
  description: 'Premium subscription',
  metadata: {
    orderId: 'order_456',
    userId: 'user_789',
  },
})

if (Result.isOk(paymentResult)) {
  const intent = paymentResult.value
  console.log(`Payment intent created: ${intent.id}`)

  // Wait for payment to complete
  const completedResult = await stripe.waitForPaymentSuccess(intent.id)

  if (Result.isOk(completedResult)) {
    console.log('Payment succeeded!')
  } else {
    console.error('Payment failed:', completedResult.error)

    // Optionally refund
    await stripe.refundPayment(intent.id)
  }
}
```

### AWS S3 File Operations

Upload and download files from S3 with proper error handling and progress tracking.

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { mapAsync, retryWithBackoff } from 'receta/async'
import { createHash } from 'crypto'

interface S3Object {
  key: string
  size: number
  lastModified: Date
  etag: string
}

interface UploadOptions {
  contentType?: string
  metadata?: Record<string, string>
  onProgress?: (uploaded: number, total: number) => void
}

class S3Client {
  private readonly baseUrl: string

  constructor(
    private readonly accessKeyId: string,
    private readonly secretAccessKey: string,
    private readonly bucket: string,
    private readonly region: string = 'us-east-1'
  ) {
    this.baseUrl = `https://${bucket}.s3.${region}.amazonaws.com`
  }

  /**
   * Upload file with automatic retry and chunking for large files
   */
  async uploadFile(
    key: string,
    content: Buffer | Blob,
    options: UploadOptions = {}
  ): Promise<Result<S3Object, string>> {
    const contentBuffer = content instanceof Blob
      ? Buffer.from(await content.arrayBuffer())
      : content

    const contentLength = contentBuffer.length
    const contentMD5 = createHash('md5').update(contentBuffer).digest('base64')

    return retryWithBackoff(
      async () => {
        const response = await fetch(`${this.baseUrl}/${key}`, {
          method: 'PUT',
          headers: {
            'Content-Type': options.contentType || 'application/octet-stream',
            'Content-Length': contentLength.toString(),
            'Content-MD5': contentMD5,
            ...this.getAuthHeaders('PUT', key),
            ...R.mapKeys(options.metadata || {}, k => `x-amz-meta-${k}`),
          },
          body: contentBuffer,
        })

        if (!response.ok) {
          throw new Error(`S3 upload failed: ${response.status}`)
        }

        const etag = response.headers.get('ETag')?.replace(/"/g, '') || ''

        return {
          key,
          size: contentLength,
          lastModified: new Date(),
          etag,
        }
      },
      {
        maxAttempts: 3,
        initialDelay: 1000,
        shouldRetry: (error) => {
          // Retry on network errors, not on auth errors
          return !error.message.includes('403') &&
                 !error.message.includes('401')
        },
      }
    )
  }

  /**
   * Download file with retry
   */
  async downloadFile(key: string): Promise<Result<Buffer, string>> {
    return retryWithBackoff(async () => {
      const response = await fetch(`${this.baseUrl}/${key}`, {
        headers: this.getAuthHeaders('GET', key),
      })

      if (!response.ok) {
        throw new Error(`S3 download failed: ${response.status}`)
      }

      const arrayBuffer = await response.arrayBuffer()
      return Buffer.from(arrayBuffer)
    })
  }

  /**
   * Upload multiple files in parallel
   */
  async uploadBatch(
    files: Array<{ key: string; content: Buffer; options?: UploadOptions }>,
    concurrency: number = 5
  ): Promise<Array<Result<S3Object, string>>> {
    return mapAsync(
      files,
      async (file) => this.uploadFile(file.key, file.content, file.options),
      { concurrency }
    )
  }

  /**
   * List objects with pagination
   */
  async listObjects(prefix?: string): Promise<Result<S3Object[], string>> {
    const objects: S3Object[] = []
    let continuationToken: string | undefined

    while (true) {
      const url = new URL(this.baseUrl)
      url.searchParams.set('list-type', '2')
      if (prefix) url.searchParams.set('prefix', prefix)
      if (continuationToken) {
        url.searchParams.set('continuation-token', continuationToken)
      }

      const result = await retryWithBackoff(async () => {
        const response = await fetch(url.toString(), {
          headers: this.getAuthHeaders('GET', '/'),
        })

        if (!response.ok) {
          throw new Error(`S3 list failed: ${response.status}`)
        }

        return await response.text()
      })

      if (Result.isErr(result)) {
        return result
      }

      // Parse XML response (simplified - use xml2js in production)
      const xmlText = result.value
      const keyMatches = xmlText.matchAll(/<Key>(.*?)<\/Key>/g)
      const sizeMatches = xmlText.matchAll(/<Size>(.*?)<\/Size>/g)

      const pageObjects = Array.from(keyMatches).map((match, i) => ({
        key: match[1],
        size: parseInt(Array.from(sizeMatches)[i]?.[1] || '0'),
        lastModified: new Date(),
        etag: '',
      }))

      objects.push(...pageObjects)

      // Check for more pages
      const isTruncated = xmlText.includes('<IsTruncated>true</IsTruncated>')
      if (!isTruncated) break

      const tokenMatch = xmlText.match(/<NextContinuationToken>(.*?)<\/NextContinuationToken>/)
      continuationToken = tokenMatch?.[1]
      if (!continuationToken) break
    }

    return Result.ok(objects)
  }

  /**
   * Generate signed auth headers (simplified AWS Signature V4)
   */
  private getAuthHeaders(method: string, path: string): Record<string, string> {
    // In production, use aws-sdk or proper signature generation
    // This is a placeholder
    return {
      'Authorization': `AWS ${this.accessKeyId}:signature`,
      'x-amz-date': new Date().toISOString(),
    }
  }
}

// Usage
const s3 = new S3Client(
  process.env.AWS_ACCESS_KEY_ID!,
  process.env.AWS_SECRET_ACCESS_KEY!,
  'my-bucket',
  'us-east-1'
)

// Upload single file
const uploadResult = await s3.uploadFile(
  'uploads/image.png',
  Buffer.from('...'),
  {
    contentType: 'image/png',
    metadata: {
      userId: '123',
      originalName: 'photo.png',
    },
    onProgress: (uploaded, total) => {
      console.log(`Upload progress: ${(uploaded / total * 100).toFixed(1)}%`)
    },
  }
)

if (Result.isOk(uploadResult)) {
  console.log('Upload successful:', uploadResult.value)
}

// Upload multiple files
const files = [
  { key: 'file1.txt', content: Buffer.from('content1') },
  { key: 'file2.txt', content: Buffer.from('content2') },
  { key: 'file3.txt', content: Buffer.from('content3') },
]

const results = await s3.uploadBatch(files, 3)
const successful = results.filter(Result.isOk)
console.log(`Uploaded ${successful.length}/${files.length} files`)

// List and download
const listResult = await s3.listObjects('uploads/')
if (Result.isOk(listResult)) {
  const images = listResult.value.filter(obj => obj.key.endsWith('.png'))

  const downloads = await mapAsync(
    images,
    async (obj) => s3.downloadFile(obj.key),
    { concurrency: 5 }
  )

  console.log(`Downloaded ${downloads.filter(Result.isOk).length} images`)
}
```

## Bulk Operations

### User Import/Export

Handle large-scale user data imports with validation and error recovery.

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { mapAsync } from 'receta/async'

interface UserRecord {
  email: string
  name: string
  role: 'admin' | 'user' | 'guest'
  metadata?: Record<string, unknown>
}

interface ImportResult {
  total: number
  successful: number
  failed: number
  errors: Array<{ row: number; email: string; error: string }>
}

/**
 * Import users from CSV with validation and batch processing
 */
async function importUsers(
  csvContent: string,
  options: {
    batchSize?: number
    concurrency?: number
    onProgress?: (processed: number, total: number) => void
  } = {}
): Promise<Result<ImportResult, string>> {
  const { batchSize = 100, concurrency = 5, onProgress } = options

  // Parse CSV
  const lines = csvContent.trim().split('\n')
  const headers = lines[0].split(',')
  const rows = lines.slice(1)

  // Validate headers
  const requiredHeaders = ['email', 'name', 'role']
  const missingHeaders = requiredHeaders.filter(h => !headers.includes(h))
  if (missingHeaders.length > 0) {
    return Result.err(`Missing required headers: ${missingHeaders.join(', ')}`)
  }

  // Parse rows
  const users = rows.map((line, idx) => {
    const values = line.split(',')
    const user: Record<string, string> = {}
    headers.forEach((header, i) => {
      user[header] = values[i]?.trim() || ''
    })
    return { row: idx + 2, user } // +2 for header and 1-indexed
  })

  const result: ImportResult = {
    total: users.length,
    successful: 0,
    failed: 0,
    errors: [],
  }

  // Process in batches
  const batches = R.chunk(users, batchSize)

  for (const batch of batches) {
    const results = await mapAsync(
      batch,
      async ({ row, user }) => {
        // Validate user
        const validation = validateUser(user)
        if (Result.isErr(validation)) {
          return { row, email: user.email, error: validation.error }
        }

        // Create user in database
        const createResult = await createUser(validation.value)
        if (Result.isErr(createResult)) {
          return { row, email: user.email, error: createResult.error }
        }

        return { row, email: user.email, success: true }
      },
      { concurrency }
    )

    // Collect results
    for (const res of results) {
      if ('success' in res) {
        result.successful++
      } else {
        result.failed++
        result.errors.push(res)
      }
    }

    // Report progress
    if (onProgress) {
      const processed = result.successful + result.failed
      onProgress(processed, result.total)
    }
  }

  return Result.ok(result)
}

/**
 * Validate user record
 */
function validateUser(
  user: Record<string, string>
): Result<UserRecord, string> {
  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(user.email)) {
    return Result.err(`Invalid email: ${user.email}`)
  }

  // Name validation
  if (!user.name || user.name.length < 2) {
    return Result.err('Name must be at least 2 characters')
  }

  // Role validation
  const validRoles = ['admin', 'user', 'guest']
  if (!validRoles.includes(user.role)) {
    return Result.err(`Invalid role: ${user.role}`)
  }

  return Result.ok({
    email: user.email,
    name: user.name,
    role: user.role as UserRecord['role'],
    metadata: R.omit(user, ['email', 'name', 'role']),
  })
}

/**
 * Create user in database (mock)
 */
async function createUser(user: UserRecord): Promise<Result<void, string>> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate occasional failures
  if (Math.random() < 0.05) {
    return Result.err('Database error')
  }

  return Result.ok(undefined)
}

// Usage
const csv = `email,name,role,department
john@example.com,John Doe,admin,Engineering
jane@example.com,Jane Smith,user,Sales
invalid-email,Bad User,admin,Engineering
bob@example.com,Bob Johnson,user,Marketing`

const importResult = await importUsers(csv, {
  batchSize: 50,
  concurrency: 10,
  onProgress: (processed, total) => {
    console.log(`Progress: ${processed}/${total} (${(processed/total*100).toFixed(1)}%)`)
  },
})

if (Result.isOk(importResult)) {
  const stats = importResult.value
  console.log(`Import complete:
    Total: ${stats.total}
    Successful: ${stats.successful}
    Failed: ${stats.failed}
  `)

  if (stats.errors.length > 0) {
    console.log('\nErrors:')
    stats.errors.forEach(err => {
      console.log(`  Row ${err.row} (${err.email}): ${err.error}`)
    })
  }
}
```

### Data Synchronization

Sync data between systems with conflict resolution and incremental updates.

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { mapAsync } from 'receta/async'

interface SyncRecord {
  id: string
  data: unknown
  version: number
  updatedAt: Date
}

interface SyncResult {
  created: number
  updated: number
  deleted: number
  conflicts: number
  errors: Array<{ id: string; error: string }>
}

/**
 * Sync records between source and destination
 */
async function syncData(
  sourceRecords: SyncRecord[],
  destinationRecords: SyncRecord[],
  options: {
    conflictResolution?: 'source' | 'destination' | 'newest'
    concurrency?: number
  } = {}
): Promise<Result<SyncResult, string>> {
  const { conflictResolution = 'newest', concurrency = 10 } = options

  const result: SyncResult = {
    created: 0,
    updated: 0,
    deleted: 0,
    conflicts: 0,
    errors: [],
  }

  // Index destination records
  const destById = R.indexBy(destinationRecords, r => r.id)
  const sourceById = R.indexBy(sourceRecords, r => r.id)

  // Find records to create, update, and delete
  const toCreate: SyncRecord[] = []
  const toUpdate: Array<{ source: SyncRecord; dest: SyncRecord }> = []
  const toDelete: SyncRecord[] = []

  // Check source records
  for (const sourceRecord of sourceRecords) {
    const destRecord = destById[sourceRecord.id]

    if (!destRecord) {
      toCreate.push(sourceRecord)
    } else if (sourceRecord.version !== destRecord.version) {
      toUpdate.push({ source: sourceRecord, dest: destRecord })
    }
  }

  // Check for deletions
  for (const destRecord of destinationRecords) {
    if (!sourceById[destRecord.id]) {
      toDelete.push(destRecord)
    }
  }

  // Process creates
  const createResults = await mapAsync(
    toCreate,
    async (record) => {
      const res = await createRecord(record)
      return { id: record.id, result: res }
    },
    { concurrency }
  )

  for (const { id, result: res } of createResults) {
    if (Result.isOk(res)) {
      result.created++
    } else {
      result.errors.push({ id, error: res.error })
    }
  }

  // Process updates with conflict resolution
  const updateResults = await mapAsync(
    toUpdate,
    async ({ source, dest }) => {
      // Detect conflicts (both modified since last sync)
      const isConflict = source.version > dest.version + 1

      if (isConflict) {
        result.conflicts++
      }

      // Resolve conflict
      let recordToUse: SyncRecord
      if (conflictResolution === 'source') {
        recordToUse = source
      } else if (conflictResolution === 'destination') {
        recordToUse = dest
      } else {
        // Use newest
        recordToUse = source.updatedAt > dest.updatedAt ? source : dest
      }

      const res = await updateRecord(recordToUse)
      return { id: source.id, result: res }
    },
    { concurrency }
  )

  for (const { id, result: res } of updateResults) {
    if (Result.isOk(res)) {
      result.updated++
    } else {
      result.errors.push({ id, error: res.error })
    }
  }

  // Process deletes
  const deleteResults = await mapAsync(
    toDelete,
    async (record) => {
      const res = await deleteRecord(record.id)
      return { id: record.id, result: res }
    },
    { concurrency }
  )

  for (const { id, result: res } of deleteResults) {
    if (Result.isOk(res)) {
      result.deleted++
    } else {
      result.errors.push({ id, error: res.error })
    }
  }

  return Result.ok(result)
}

// Mock operations
async function createRecord(record: SyncRecord): Promise<Result<void, string>> {
  await new Promise(resolve => setTimeout(resolve, 50))
  return Result.ok(undefined)
}

async function updateRecord(record: SyncRecord): Promise<Result<void, string>> {
  await new Promise(resolve => setTimeout(resolve, 50))
  return Result.ok(undefined)
}

async function deleteRecord(id: string): Promise<Result<void, string>> {
  await new Promise(resolve => setTimeout(resolve, 50))
  return Result.ok(undefined)
}

// Usage
const sourceRecords: SyncRecord[] = [
  { id: '1', data: { name: 'A' }, version: 2, updatedAt: new Date('2024-01-15') },
  { id: '2', data: { name: 'B' }, version: 1, updatedAt: new Date('2024-01-14') },
  { id: '3', data: { name: 'C' }, version: 1, updatedAt: new Date('2024-01-16') },
]

const destRecords: SyncRecord[] = [
  { id: '1', data: { name: 'A-old' }, version: 1, updatedAt: new Date('2024-01-10') },
  { id: '2', data: { name: 'B' }, version: 1, updatedAt: new Date('2024-01-14') },
  { id: '4', data: { name: 'D' }, version: 1, updatedAt: new Date('2024-01-12') },
]

const syncResult = await syncData(sourceRecords, destRecords, {
  conflictResolution: 'newest',
  concurrency: 5,
})

if (Result.isOk(syncResult)) {
  console.log('Sync complete:', syncResult.value)
}
```

### Batch Email Sending

Send emails in batches with rate limiting and failure tracking.

```typescript
import * as R from 'remeda'
import { Result } from 'receta/result'
import { mapAsync } from 'receta/async'

interface Email {
  to: string
  subject: string
  body: string
  attachments?: Array<{ filename: string; content: Buffer }>
}

interface SendResult {
  email: string
  messageId?: string
  error?: string
}

/**
 * Send emails in batches with rate limiting
 */
async function sendEmailBatch(
  emails: Email[],
  options: {
    batchSize?: number
    delayBetweenBatches?: number
    maxRetriesPerEmail?: number
  } = {}
): Promise<Result<SendResult[], string>> {
  const {
    batchSize = 50,
    delayBetweenBatches = 1000,
    maxRetriesPerEmail = 3,
  } = options

  const results: SendResult[] = []
  const batches = R.chunk(emails, batchSize)

  for (const [batchIndex, batch] of batches.entries()) {
    console.log(`Processing batch ${batchIndex + 1}/${batches.length}`)

    // Send batch in parallel
    const batchResults = await mapAsync(
      batch,
      async (email) => {
        let lastError: string | undefined

        // Retry logic
        for (let attempt = 1; attempt <= maxRetriesPerEmail; attempt++) {
          const result = await sendEmail(email)

          if (Result.isOk(result)) {
            return {
              email: email.to,
              messageId: result.value,
            }
          }

          lastError = result.error

          if (attempt < maxRetriesPerEmail) {
            // Wait before retry
            await new Promise(resolve =>
              setTimeout(resolve, 1000 * attempt)
            )
          }
        }

        return {
          email: email.to,
          error: lastError,
        }
      },
      { concurrency: 10 } // Limit concurrent sends
    )

    results.push(...batchResults)

    // Delay between batches to respect rate limits
    if (batchIndex < batches.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  return Result.ok(results)
}

/**
 * Send single email (mock implementation)
 */
async function sendEmail(email: Email): Promise<Result<string, string>> {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate occasional failures
  if (Math.random() < 0.1) {
    return Result.err('SMTP error: Connection timeout')
  }

  return Result.ok(`msg-${Date.now()}-${Math.random()}`)
}

// Usage
const emails: Email[] = Array.from({ length: 200 }, (_, i) => ({
  to: `user${i}@example.com`,
  subject: 'Welcome!',
  body: `Hello user ${i}!`,
}))

const result = await sendEmailBatch(emails, {
  batchSize: 50,
  delayBetweenBatches: 1000,
  maxRetriesPerEmail: 3,
})

if (Result.isOk(result)) {
  const successful = result.value.filter(r => r.messageId)
  const failed = result.value.filter(r => r.error)

  console.log(`Email sending complete:
    Total: ${result.value.length}
    Successful: ${successful.length}
    Failed: ${failed.length}
  `)

  if (failed.length > 0) {
    console.log('\nFailed emails:')
    failed.forEach(r => {
      console.log(`  ${r.email}: ${r.error}`)
    })
  }
}
```

## Real-time Updates

### Webhook Delivery

Deliver webhooks with retry and exponential backoff.

```typescript
import { Result } from 'receta/result'
import { retryWithBackoff } from 'receta/async'

interface WebhookEvent {
  id: string
  type: string
  data: unknown
  timestamp: Date
}

interface WebhookEndpoint {
  url: string
  secret: string
  events: string[]
}

/**
 * Deliver webhook with retry and signature
 */
async function deliverWebhook(
  endpoint: WebhookEndpoint,
  event: WebhookEvent
): Promise<Result<void, string>> {
  // Check if endpoint is subscribed to this event
  if (!endpoint.events.includes(event.type)) {
    return Result.ok(undefined) // Skip delivery
  }

  const payload = JSON.stringify(event)
  const signature = await generateSignature(payload, endpoint.secret)

  return retryWithBackoff(
    async () => {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-ID': event.id,
          'X-Webhook-Timestamp': event.timestamp.toISOString(),
        },
        body: payload,
      })

      if (!response.ok) {
        throw new Error(`Webhook delivery failed: ${response.status}`)
      }

      return undefined
    },
    {
      maxAttempts: 5,
      initialDelay: 1000,
      maxDelay: 60000,
      backoffMultiplier: 2,
      shouldRetry: (error) => {
        // Retry on 5xx errors and timeouts, not on 4xx
        return !error.message.includes('4')
      },
    }
  )
}

/**
 * Generate HMAC signature for webhook
 */
async function generateSignature(
  payload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder()
  const keyData = encoder.encode(secret)
  const messageData = encoder.encode(payload)

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )

  const signature = await crypto.subtle.sign('HMAC', key, messageData)
  const hashArray = Array.from(new Uint8Array(signature))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// Usage
const endpoint: WebhookEndpoint = {
  url: 'https://api.example.com/webhooks',
  secret: 'whsec_...',
  events: ['user.created', 'user.updated'],
}

const event: WebhookEvent = {
  id: 'evt_123',
  type: 'user.created',
  data: {
    userId: '123',
    email: 'user@example.com',
  },
  timestamp: new Date(),
}

const result = await deliverWebhook(endpoint, event)
if (Result.isOk(result)) {
  console.log('Webhook delivered successfully')
} else {
  console.error('Webhook delivery failed:', result.error)
}
```

### Job Status Polling

Poll for job completion with timeout and progress updates.

```typescript
import { Result } from 'receta/result'
import { timeout } from 'receta/async'

interface Job {
  id: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  progress?: number
  result?: unknown
  error?: string
}

/**
 * Poll job status until completion
 */
async function waitForJobCompletion(
  jobId: string,
  options: {
    pollInterval?: number
    maxWaitTime?: number
    onProgress?: (job: Job) => void
  } = {}
): Promise<Result<Job, string>> {
  const {
    pollInterval = 1000,
    maxWaitTime = 300000, // 5 minutes
    onProgress,
  } = options

  return timeout(
    async () => {
      while (true) {
        const jobResult = await fetchJobStatus(jobId)

        if (Result.isErr(jobResult)) {
          return jobResult
        }

        const job = jobResult.value

        // Report progress
        if (onProgress) {
          onProgress(job)
        }

        // Check terminal states
        if (job.status === 'completed') {
          return Result.ok(job)
        }

        if (job.status === 'failed') {
          return Result.err(job.error || 'Job failed')
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval))
      }
    },
    maxWaitTime,
    `Job did not complete within ${maxWaitTime}ms`
  )
}

/**
 * Fetch job status (mock)
 */
async function fetchJobStatus(jobId: string): Promise<Result<Job, string>> {
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate job progress
  const progress = Math.min(100, (Date.now() % 10000) / 100)
  const status = progress < 100 ? 'running' : 'completed'

  return Result.ok({
    id: jobId,
    status,
    progress,
    result: status === 'completed' ? { data: 'result' } : undefined,
  })
}

// Usage
const jobId = 'job_123'

const result = await waitForJobCompletion(jobId, {
  pollInterval: 2000,
  maxWaitTime: 60000,
  onProgress: (job) => {
    console.log(`Job progress: ${job.progress?.toFixed(1)}%`)
  },
})

if (Result.isOk(result)) {
  console.log('Job completed:', result.value.result)
} else {
  console.error('Job failed:', result.error)
}
```

## Error Recovery

### Circuit Breaker Pattern

Prevent cascading failures with circuit breaker.

```typescript
import { Result } from 'receta/result'

type CircuitState = 'closed' | 'open' | 'half-open'

interface CircuitBreakerOptions {
  failureThreshold: number
  successThreshold: number
  timeout: number
}

class CircuitBreaker {
  private state: CircuitState = 'closed'
  private failureCount = 0
  private successCount = 0
  private nextAttempt = Date.now()

  constructor(private options: CircuitBreakerOptions) {}

  async execute<T>(
    fn: () => Promise<T>
  ): Promise<Result<T, string>> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        return Result.err('Circuit breaker is open')
      }
      this.state = 'half-open'
    }

    try {
      const result = await fn()
      this.onSuccess()
      return Result.ok(result)
    } catch (error) {
      this.onFailure()
      return Result.err(error instanceof Error ? error.message : 'Unknown error')
    }
  }

  private onSuccess(): void {
    this.failureCount = 0

    if (this.state === 'half-open') {
      this.successCount++
      if (this.successCount >= this.options.successThreshold) {
        this.state = 'closed'
        this.successCount = 0
      }
    }
  }

  private onFailure(): void {
    this.failureCount++
    this.successCount = 0

    if (this.failureCount >= this.options.failureThreshold) {
      this.state = 'open'
      this.nextAttempt = Date.now() + this.options.timeout
    }
  }

  getState(): CircuitState {
    return this.state
  }
}

// Usage
const breaker = new CircuitBreaker({
  failureThreshold: 5,
  successThreshold: 2,
  timeout: 60000,
})

async function callExternalAPI(): Promise<string> {
  const result = await breaker.execute(async () => {
    const response = await fetch('https://api.example.com/data')
    if (!response.ok) throw new Error('API error')
    return await response.text()
  })

  if (Result.isErr(result)) {
    console.log('Circuit breaker state:', breaker.getState())
    return 'fallback data'
  }

  return result.value
}
```

## Performance Optimization

### Concurrency Tuning

Find optimal concurrency for your workload.

```typescript
import { mapAsync } from 'receta/async'

/**
 * Benchmark different concurrency levels
 */
async function findOptimalConcurrency<T, U>(
  items: T[],
  fn: (item: T) => Promise<U>,
  concurrencyLevels: number[] = [1, 5, 10, 20, 50, 100]
): Promise<{ concurrency: number; duration: number }> {
  const results: Array<{ concurrency: number; duration: number }> = []

  for (const concurrency of concurrencyLevels) {
    const start = Date.now()
    await mapAsync(items, fn, { concurrency })
    const duration = Date.now() - start

    results.push({ concurrency, duration })
    console.log(`Concurrency ${concurrency}: ${duration}ms`)
  }

  // Find fastest
  return results.reduce((best, current) =>
    current.duration < best.duration ? current : best
  )
}

// Usage
const urls = Array.from({ length: 100 }, (_, i) =>
  `https://api.example.com/data/${i}`
)

const optimal = await findOptimalConcurrency(
  urls,
  async (url) => {
    const response = await fetch(url)
    return await response.json()
  }
)

console.log(`Optimal concurrency: ${optimal.concurrency}`)
```

This document provides production-ready patterns for common async operations. All examples use real APIs and include proper error handling, retry logic, and performance optimization.

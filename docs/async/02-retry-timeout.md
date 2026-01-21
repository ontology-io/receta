# Retry and Timeout Patterns

> Building resilient async operations that handle transient failures gracefully.

## Table of Contents

1. [Retry Patterns](#retry-patterns)
2. [Timeout Patterns](#timeout-patterns)
3. [Result Integration](#result-integration)
4. [Combined Patterns](#combined-patterns)
5. [Real-World Examples](#real-world-examples)
6. [Best Practices](#best-practices)
7. [Common Mistakes](#common-mistakes)

---

## Retry Patterns

### Basic Retry with Exponential Backoff

The retry function automatically handles transient failures with exponential backoff:

```typescript
import { retry } from 'receta/async'

// Basic retry with defaults (3 attempts, 1s initial delay, 2x backoff)
const fetchUser = async (id: string) => {
  const data = await retry(async () => {
    const res = await fetch(`/api/users/${id}`)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
  return data
}

// Custom retry configuration
const fetchWithCustomRetry = async (url: string) => {
  return retry(
    async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    {
      maxAttempts: 5,        // Try up to 5 times
      delay: 500,            // Start with 500ms delay
      backoff: 2,            // Double delay each time
      maxDelay: 10000,       // Cap at 10 seconds
    }
  )
}
```

**Delay progression with exponential backoff:**
- Attempt 1: Immediate
- Attempt 2: 500ms delay
- Attempt 3: 1000ms delay (500 × 2)
- Attempt 4: 2000ms delay (1000 × 2)
- Attempt 5: 4000ms delay (2000 × 2)

### Conditional Retry with shouldRetry

Only retry specific types of errors:

```typescript
// Retry only on network errors, not client errors
const fetchData = async (url: string) => {
  return retry(
    async () => {
      const res = await fetch(url)
      if (!res.ok) {
        const error: any = new Error(`HTTP ${res.status}`)
        error.status = res.status
        throw error
      }
      return res.json()
    },
    {
      maxAttempts: 3,
      shouldRetry: (error, attempt) => {
        // Don't retry client errors (4xx)
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) {
            return false
          }
        }
        // Retry server errors (5xx) and network errors
        return true
      }
    }
  )
}

// Retry based on specific error types
class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

class RateLimitError extends Error {
  constructor(public resetAt: number) {
    super('Rate limit exceeded')
    this.name = 'RateLimitError'
  }
}

const smartRetry = async (operation: () => Promise<any>) => {
  return retry(operation, {
    maxAttempts: 5,
    shouldRetry: (error, attempt) => {
      // Always retry network errors
      if (error instanceof NetworkError) {
        return true
      }

      // Retry rate limits only on first few attempts
      if (error instanceof RateLimitError) {
        return attempt <= 2
      }

      // Don't retry other errors
      return false
    }
  })
}
```

### Retry with Monitoring

Use the onRetry callback to log, monitor, or notify:

```typescript
import { retry } from 'receta/async'

const fetchWithMonitoring = async (url: string) => {
  return retry(
    async () => {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (error, attempt, delay) => {
        // Log retry attempts
        console.warn(`Retry attempt ${attempt} after ${delay}ms`, {
          url,
          error: error instanceof Error ? error.message : String(error),
          nextDelay: delay,
        })

        // Send metrics to monitoring service
        metrics.increment('api.retry', {
          url,
          attempt: String(attempt),
        })

        // Alert on multiple retries
        if (attempt >= 2) {
          alerts.send({
            severity: 'warning',
            message: `Multiple retry attempts for ${url}`,
            metadata: { attempt, error },
          })
        }
      }
    }
  )
}
```

### Constant Delay (No Backoff)

For operations that need consistent retry intervals:

```typescript
// Poll an endpoint every second
const pollStatus = async (jobId: string) => {
  return retry(
    async () => {
      const res = await fetch(`/api/jobs/${jobId}/status`)
      const data = await res.json()

      if (data.status === 'pending') {
        throw new Error('Job still pending')
      }

      return data
    },
    {
      maxAttempts: 10,
      delay: 1000,
      backoff: 1,  // No backoff, constant 1 second delay
    }
  )
}
```

---

## Timeout Patterns

### Basic Timeout

Add a timeout to any promise:

```typescript
import { timeout, TimeoutError } from 'receta/async'

// Basic timeout
const fetchWithTimeout = async (url: string) => {
  try {
    const data = await timeout(
      fetch(url).then(r => r.json()),
      5000  // 5 second timeout
    )
    return data
  } catch (error) {
    if (error instanceof TimeoutError) {
      console.error('Request timed out after 5 seconds')
      throw error
    }
    throw error  // Other errors
  }
}

// Custom timeout error
const fetchWithCustomError = async (url: string) => {
  return timeout(
    fetch(url).then(r => r.json()),
    3000,
    {
      timeout: 3000,
      timeoutError: new Error(`Request to ${url} timed out`)
    }
  )
}
```

### Function-Level Timeout with timeoutFn

Wrap functions to automatically apply timeouts:

```typescript
import { timeoutFn } from 'receta/async'

// Create a fetch function with built-in timeout
const fetchJSON = timeoutFn(
  async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  5000  // All calls time out after 5 seconds
)

// Use it like a normal function
const user = await fetchJSON('/api/users/123')
const posts = await fetchJSON('/api/posts')

// Each call has its own 5-second timeout
```

### Per-Operation Timeout

Different operations need different timeouts:

```typescript
// Short timeout for critical data
const fetchCriticalData = timeoutFn(
  async (id: string) => {
    const res = await fetch(`/api/critical/${id}`)
    return res.json()
  },
  2000  // 2 seconds max
)

// Longer timeout for uploads
const uploadFile = timeoutFn(
  async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    })
    return res.json()
  },
  30000  // 30 seconds for large files
)

// Very long timeout for exports
const exportData = timeoutFn(
  async (query: string) => {
    const res = await fetch('/api/export', {
      method: 'POST',
      body: JSON.stringify({ query }),
    })
    return res.json()
  },
  120000  // 2 minutes for complex exports
)
```

### Handling TimeoutError

Distinguish timeout errors from other failures:

```typescript
import { timeout, TimeoutError } from 'receta/async'

const robustFetch = async (url: string) => {
  try {
    return await timeout(fetch(url).then(r => r.json()), 5000)
  } catch (error) {
    if (error instanceof TimeoutError) {
      // Timeout-specific handling
      console.error('Request timed out, using cached data')
      return getCachedData(url)
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network error
      console.error('Network error, retrying...')
      return robustFetch(url)  // Retry
    }

    // Other errors
    throw error
  }
}
```

---

## Result Integration

### Why Result Pattern?

Traditional retry and timeout functions throw exceptions, making error handling verbose and error-prone:

```typescript
// Traditional: Requires try-catch
try {
  const data = await retry(() => fetch(url))
} catch (error) {
  // Error handling here
}

// Result: Errors as values
const result = await retryResult(() => fetch(url))
if (isOk(result)) {
  // Use result.value
} else {
  // Handle result.error
}
```

**Benefits:**
- ✅ Errors visible in function signature
- ✅ Composable with Result utilities (map, flatMap, unwrapOr)
- ✅ No exceptions - pure functional error handling
- ✅ Full error context (attempts, last error, etc.)

---

### retryResult()

Type-safe retry with Result pattern instead of throwing exceptions.

#### Signature

```typescript
function retryResult<T>(
  fn: () => Promise<T>,
  options?: RetryOptions
): Promise<Result<T, RetryError>>

type RetryError = {
  type: 'max_attempts_exceeded'
  lastError: unknown
  attempts: number
}
```

#### Real-World: Database Connection with Result

```typescript
import { retryResult } from 'receta/async'
import { unwrapOr, mapErr, isOk } from 'receta/result'
import * as R from 'remeda'

const connectToDatabase = async (): Promise<Database> => {
  const result = await retryResult(
    async () => {
      const db = await mongoose.connect(connectionString)
      return db
    },
    {
      maxAttempts: 5,
      delay: 1000,
      backoff: 2,
      onRetry: (error, attempt, delay) => {
        logger.warn(`DB connection attempt ${attempt} failed, retrying in ${delay}ms`)
      }
    }
  )

  return R.pipe(
    result,
    mapErr(error => {
      logger.error(`DB connection failed after ${error.attempts} attempts`)
      return error
    }),
    unwrapOr(fallbackDatabase)
  )
}

// No try-catch needed!
const db = await connectToDatabase()
```

#### Real-World: API Call with Error Recovery

```typescript
import { retryResult } from 'receta/async'
import { match, ok } from 'receta/result'

const fetchUser = async (id: string) => {
  const result = await retryResult(
    async () => {
      const res = await fetch(`/api/users/${id}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    {
      maxAttempts: 3,
      delay: 1000,
      backoff: 2,
    }
  )

  return match(result, {
    Ok: (user) => user,
    Err: (error) => {
      // Graceful fallback
      logger.error('Failed to fetch user, using cache', {
        id,
        attempts: error.attempts,
        lastError: error.lastError
      })
      return getCachedUser(id)
    }
  })
}
```

#### Comparison: Traditional vs Result

| Aspect | Traditional `retry()` | `retryResult()` |
|--------|----------------------|-----------------|
| Error handling | try-catch required | Explicit Result type |
| Error visibility | Hidden (throws) | Visible in signature |
| Composability | Limited | Full Result API (map, flatMap, etc.) |
| Error context | Lost in exception | Preserved (attempts, lastError) |
| Type safety | ❌ Error type unknown | ✅ `Result<T, RetryError>` |
| Pure function | ❌ Throws exceptions | ✅ Returns values |

#### Advanced: Combining Multiple Retries

```typescript
import { retryResult } from 'receta/async'
import { flatMap, ok, err, isOk } from 'receta/result'
import * as R from 'remeda'

// Fetch user, then their posts (both with retry)
const fetchUserWithPosts = async (userId: string) => {
  const userResult = await retryResult(
    () => fetch(`/api/users/${userId}`).then(r => r.json()),
    { maxAttempts: 3, delay: 1000 }
  )

  return R.pipe(
    userResult,
    flatMap(async (user) => {
      const postsResult = await retryResult(
        () => fetch(`/api/users/${userId}/posts`).then(r => r.json()),
        { maxAttempts: 3, delay: 500 }
      )

      return isOk(postsResult)
        ? ok({ ...user, posts: postsResult.value })
        : err(`Failed to fetch posts: ${postsResult.error.lastError}`)
    })
  )
}

// Usage
const result = await fetchUserWithPosts('123')
if (isOk(result)) {
  console.log('User with posts:', result.value)
} else {
  console.error('Error:', result.error)
}
```

---

### timeoutResult()

Add timeout with Result pattern for type-safe timeout handling.

#### Signature

```typescript
function timeoutResult<T>(
  promise: Promise<T>,
  ms: number
): Promise<Result<T, TimeoutError>>

type TimeoutError = {
  type: 'timeout'
  timeoutMs: number
  message: string
}
```

#### Real-World: API Call with Timeout

```typescript
import { timeoutResult } from 'receta/async'
import { unwrapOr, mapErr, isErr } from 'receta/result'
import * as R from 'remeda'

const fetchWithTimeout = async (url: string) => {
  const result = await timeoutResult(
    fetch(url).then(r => r.json()),
    5000
  )

  return R.pipe(
    result,
    mapErr(error => {
      logger.warn(`Request to ${url} timed out after ${error.timeoutMs}ms`)
      return error
    }),
    unwrapOr({ error: 'Request timed out' })
  )
}
```

#### Real-World: Multiple Services with Fallback

```typescript
import { timeoutResult, retryResult } from 'receta/async'
import { unwrapOr, match, ok } from 'receta/result'

// Try primary service, fall back to secondary
const fetchDataResilient = async (query: string) => {
  // Try primary service with timeout
  const primaryResult = await timeoutResult(
    fetch(`https://primary-api.com/search?q=${query}`).then(r => r.json()),
    3000
  )

  if (isOk(primaryResult)) {
    return primaryResult.value
  }

  // Primary failed, try secondary with retry
  logger.warn('Primary service failed, trying secondary', {
    error: primaryResult.error
  })

  const secondaryResult = await retryResult(
    async () => {
      const res = await timeoutResult(
        fetch(`https://secondary-api.com/search?q=${query}`).then(r => r.json()),
        5000
      )
      if (isErr(res)) throw res.error
      return res.value
    },
    { maxAttempts: 2, delay: 500 }
  )

  return match(secondaryResult, {
    Ok: (data) => data,
    Err: (error) => {
      logger.error('Both services failed', {
        primary: primaryResult.error,
        secondary: error
      })
      return { error: 'All services unavailable' }
    }
  })
}
```

#### Comparison: Traditional vs Result

| Aspect | Traditional `timeout()` | `timeoutResult()` |
|--------|------------------------|-------------------|
| Error handling | try-catch required | Explicit Result type |
| Timeout detection | instanceof check | Type in error object |
| Composability | Limited | Full Result API |
| Error metadata | Basic TimeoutError | Full context (ms, message) |
| Type safety | ❌ Error type unknown | ✅ `Result<T, TimeoutError>` |
| Pure function | ❌ Throws exceptions | ✅ Returns values |

#### Advanced: Combining Timeout and Retry with Result

```typescript
import { retryResult, timeoutResult } from 'receta/async'
import { flatMap, isErr } from 'receta/result'

// Each retry attempt has its own timeout
const resilientFetch = async (url: string) => {
  return retryResult(
    async () => {
      const res = await timeoutResult(
        fetch(url).then(r => r.json()),
        3000
      )

      // Convert timeout Result to exception for retry logic
      if (isErr(res)) throw res.error
      return res.value
    },
    {
      maxAttempts: 3,
      delay: 500,
      onRetry: (error, attempt, delay) => {
        logger.warn(`Retry ${attempt} after timeout`, { url, delay })
      }
    }
  )
}

// Usage
const result = await resilientFetch('https://api.example.com/data')
if (isOk(result)) {
  console.log('Data:', result.value)
} else {
  console.error('Failed after retries:', result.error)
}
```

#### Real-World: Microservice Circuit Breaker with Result

```typescript
import { timeoutResult, retryResult } from 'receta/async'
import { Result, ok, err, isOk, match } from 'receta/result'

class ServiceClient {
  private circuitOpen = false
  private failures = 0
  private readonly threshold = 5

  async request<T>(
    endpoint: string,
    timeoutMs: number = 5000
  ): Promise<Result<T, string>> {
    // Check circuit breaker
    if (this.circuitOpen) {
      return err('Circuit breaker open - service unavailable')
    }

    const result = await retryResult(
      async () => {
        const res = await timeoutResult(
          fetch(endpoint).then(r => r.json()),
          timeoutMs
        )

        if (isErr(res)) throw res.error
        return res.value as T
      },
      { maxAttempts: 2, delay: 500 }
    )

    return match(result, {
      Ok: (data) => {
        // Reset on success
        this.failures = 0
        return ok(data)
      },
      Err: (error) => {
        // Track failures
        this.failures++
        if (this.failures >= this.threshold) {
          this.circuitOpen = true
          setTimeout(() => {
            this.circuitOpen = false
            this.failures = 0
          }, 30000) // Reset after 30s
        }

        return err(`Service error: ${error.lastError}`)
      }
    })
  }
}

// Usage
const client = new ServiceClient()

const result = await client.request('/api/users/123', 3000)
if (isOk(result)) {
  console.log('User:', result.value)
} else {
  console.error('Error:', result.error)
  // No exception thrown - safe to continue
}
```

---

## Combined Patterns

### Retry with Timeout

Combine retry and timeout for maximum resilience:

```typescript
import { retry, timeout } from 'receta/async'

// Each retry attempt has a timeout
const resilientFetch = async (url: string) => {
  return retry(
    async () => {
      // Each attempt times out after 5 seconds
      return timeout(
        fetch(url).then(r => r.json()),
        5000
      )
    },
    {
      maxAttempts: 3,
      delay: 1000,
    }
  )
}

// More sophisticated: increase timeout with each retry
const adaptiveRetry = async (url: string) => {
  let attempt = 0

  return retry(
    async () => {
      attempt++
      const timeoutMs = 3000 + (attempt * 2000)  // 3s, 5s, 7s

      return timeout(
        fetch(url).then(r => r.json()),
        timeoutMs
      )
    },
    {
      maxAttempts: 3,
      delay: 1000,
    }
  )
}
```

### Circuit Breaker Pattern

Prevent cascading failures by stopping requests after repeated failures:

```typescript
class CircuitBreaker {
  private failures = 0
  private lastFailureTime = 0
  private state: 'closed' | 'open' | 'half-open' = 'closed'

  constructor(
    private threshold: number = 5,
    private timeout: number = 60000,  // 1 minute
    private resetTimeout: number = 30000  // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    // Check if circuit is open
    if (this.state === 'open') {
      const timeSinceFailure = Date.now() - this.lastFailureTime

      if (timeSinceFailure < this.resetTimeout) {
        throw new Error('Circuit breaker is open')
      }

      // Try to close circuit
      this.state = 'half-open'
    }

    try {
      // Execute with timeout
      const result = await timeout(operation(), this.timeout)

      // Success - reset failures
      if (this.state === 'half-open') {
        this.state = 'closed'
        this.failures = 0
      }

      return result
    } catch (error) {
      this.failures++
      this.lastFailureTime = Date.now()

      // Open circuit if threshold exceeded
      if (this.failures >= this.threshold) {
        this.state = 'open'
      }

      throw error
    }
  }
}

// Usage
const breaker = new CircuitBreaker()

const fetchWithBreaker = async (url: string) => {
  return breaker.execute(async () => {
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  })
}
```

### Retry with Rate Limit Handling

Handle API rate limits intelligently:

```typescript
import { retry, sleep } from 'receta/async'

const fetchWithRateLimit = async (url: string) => {
  return retry(
    async () => {
      const res = await fetch(url)

      // Check rate limit headers
      if (res.status === 429) {
        const resetTime = res.headers.get('X-RateLimit-Reset')
        const retryAfter = res.headers.get('Retry-After')

        const error: any = new Error('Rate limited')
        error.resetTime = resetTime ? parseInt(resetTime) : null
        error.retryAfter = retryAfter ? parseInt(retryAfter) : null
        throw error
      }

      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return res.json()
    },
    {
      maxAttempts: 3,
      shouldRetry: (error, attempt) => {
        // Only retry rate limit errors
        return error instanceof Error && error.message === 'Rate limited'
      },
      onRetry: async (error: any, attempt, delay) => {
        // Wait for rate limit reset if available
        if (error.retryAfter) {
          await sleep(error.retryAfter * 1000)
        } else if (error.resetTime) {
          const waitTime = error.resetTime * 1000 - Date.now()
          if (waitTime > 0) {
            await sleep(waitTime)
          }
        }
      }
    }
  )
}
```

---

## Real-World Examples

### Fetching from Unreliable APIs

```typescript
import { retry, timeout, TimeoutError } from 'receta/async'

// Third-party API that's often slow or down
const fetchWeatherData = async (city: string) => {
  return retry(
    async () => {
      return timeout(
        fetch(`https://api.weather.com/v1/current?city=${city}`).then(async res => {
          if (!res.ok) {
            const error: any = new Error(`Weather API error: ${res.status}`)
            error.status = res.status
            throw error
          }
          return res.json()
        }),
        10000  // 10 second timeout per attempt
      )
    },
    {
      maxAttempts: 3,
      delay: 2000,
      backoff: 2,
      shouldRetry: (error, attempt) => {
        // Don't retry client errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status
          if (status >= 400 && status < 500) return false
        }

        // Retry timeouts and server errors
        return error instanceof TimeoutError || true
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`Weather API retry ${attempt}, waiting ${delay}ms`, {
          city,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }
  )
}
```

### Database Connection with Retry

```typescript
import { retry } from 'receta/async'
import { createConnection, Connection } from 'mysql2/promise'

class DatabasePool {
  private connection: Connection | null = null

  async getConnection(): Promise<Connection> {
    if (this.connection) return this.connection

    this.connection = await retry(
      async () => {
        console.log('Attempting database connection...')
        return createConnection({
          host: process.env.DB_HOST,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        })
      },
      {
        maxAttempts: 5,
        delay: 1000,
        backoff: 2,
        maxDelay: 10000,
        onRetry: (error, attempt, delay) => {
          console.error(`Database connection failed (attempt ${attempt}), retrying in ${delay}ms...`, {
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }
    )

    return this.connection
  }

  async query<T>(sql: string, params?: any[]): Promise<T> {
    const conn = await this.getConnection()

    return retry(
      async () => {
        const [rows] = await conn.execute(sql, params)
        return rows as T
      },
      {
        maxAttempts: 3,
        delay: 100,
        shouldRetry: (error) => {
          // Retry on connection errors
          return error instanceof Error &&
                 (error.message.includes('ECONNREFUSED') ||
                  error.message.includes('ETIMEDOUT'))
        }
      }
    )
  }
}
```

### S3 Upload with Retry

```typescript
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { retry, timeout } from 'receta/async'

const s3Client = new S3Client({ region: 'us-east-1' })

const uploadToS3 = async (
  bucket: string,
  key: string,
  body: Buffer | ReadableStream,
  contentType: string
) => {
  return retry(
    async () => {
      return timeout(
        s3Client.send(new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })),
        60000  // 1 minute timeout for uploads
      )
    },
    {
      maxAttempts: 3,
      delay: 2000,
      backoff: 2,
      shouldRetry: (error, attempt) => {
        // Retry on network errors and throttling
        if (error instanceof Error) {
          const message = error.message.toLowerCase()
          return message.includes('network') ||
                 message.includes('timeout') ||
                 message.includes('throttl') ||
                 message.includes('slowdown')
        }
        return false
      },
      onRetry: (error, attempt, delay) => {
        console.warn(`S3 upload retry ${attempt} for ${key}`, {
          error: error instanceof Error ? error.message : String(error),
          delay,
        })
      }
    }
  )
}

// Usage
const result = await uploadToS3(
  'my-bucket',
  'uploads/avatar.jpg',
  fileBuffer,
  'image/jpeg'
)
```

### Webhook Delivery with Timeout and Retry

```typescript
import { retry, timeout, TimeoutError } from 'receta/async'

interface WebhookPayload {
  event: string
  data: any
  timestamp: number
}

interface WebhookEndpoint {
  url: string
  secret: string
}

const deliverWebhook = async (
  endpoint: WebhookEndpoint,
  payload: WebhookPayload
) => {
  return retry(
    async () => {
      return timeout(
        fetch(endpoint.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Secret': endpoint.secret,
            'X-Webhook-Event': payload.event,
          },
          body: JSON.stringify(payload),
        }).then(async res => {
          if (!res.ok) {
            throw new Error(`Webhook delivery failed: HTTP ${res.status}`)
          }
          return res
        }),
        10000  // 10 second timeout for webhook delivery
      )
    },
    {
      maxAttempts: 3,
      delay: 5000,   // 5 second initial delay
      backoff: 2,
      shouldRetry: (error, attempt) => {
        // Don't retry on client errors (4xx)
        if (error instanceof Error && error.message.includes('HTTP 4')) {
          return false
        }

        // Retry on timeouts and server errors
        return true
      },
      onRetry: (error, attempt, delay) => {
        // Log failed webhook attempts
        console.error(`Webhook delivery failed (attempt ${attempt})`, {
          url: endpoint.url,
          event: payload.event,
          error: error instanceof Error ? error.message : String(error),
          nextRetry: `${delay}ms`,
        })

        // Store failed attempt for monitoring
        webhookMetrics.recordFailure({
          url: endpoint.url,
          event: payload.event,
          attempt,
          error: error instanceof TimeoutError ? 'timeout' : 'error',
        })
      }
    }
  )
}

// Batch webhook delivery
const deliverWebhooks = async (
  endpoints: WebhookEndpoint[],
  payload: WebhookPayload
) => {
  const results = await Promise.allSettled(
    endpoints.map(endpoint => deliverWebhook(endpoint, payload))
  )

  const successful = results.filter(r => r.status === 'fulfilled').length
  const failed = results.filter(r => r.status === 'rejected')

  console.log(`Webhook delivery: ${successful}/${endpoints.length} successful`)

  if (failed.length > 0) {
    console.error('Failed webhooks:', failed.map((r, i) => ({
      url: endpoints[i]?.url,
      reason: r.status === 'rejected' ? r.reason.message : 'unknown',
    })))
  }

  return {
    successful,
    failed: failed.length,
    results,
  }
}
```

### Microservice Communication

```typescript
import { retry, timeout } from 'receta/async'

class ServiceClient {
  constructor(
    private baseUrl: string,
    private serviceName: string
  ) {}

  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`

    return retry(
      async () => {
        return timeout(
          fetch(url, {
            ...options,
            headers: {
              'Content-Type': 'application/json',
              'X-Service-Name': this.serviceName,
              ...options.headers,
            },
          }).then(async res => {
            if (!res.ok) {
              const error: any = new Error(
                `Service ${this.serviceName} error: ${res.status}`
              )
              error.status = res.status
              error.service = this.serviceName
              throw error
            }
            return res.json() as T
          }),
          5000  // 5 second timeout per request
        )
      },
      {
        maxAttempts: 3,
        delay: 1000,
        backoff: 1.5,
        shouldRetry: (error, attempt) => {
          if (error instanceof Error && 'status' in error) {
            const status = (error as any).status
            // Don't retry 4xx errors except 429 (rate limit)
            if (status >= 400 && status < 500 && status !== 429) {
              return false
            }
          }
          return true
        },
        onRetry: (error, attempt, delay) => {
          console.warn(`Service ${this.serviceName} retry ${attempt}`, {
            endpoint,
            error: error instanceof Error ? error.message : String(error),
            delay,
          })

          // Report service issues
          metrics.increment(`service.${this.serviceName}.retry`, {
            endpoint,
            attempt: String(attempt),
          })
        }
      }
    )
  }
}

// Usage
const userService = new ServiceClient('http://users-service', 'user-service')
const orderService = new ServiceClient('http://orders-service', 'order-service')

const user = await userService.request('/api/users/123', { method: 'GET' })
const orders = await orderService.request('/api/orders', {
  method: 'POST',
  body: JSON.stringify({ userId: user.id }),
})
```

---

## Best Practices

### 1. Choose Appropriate Retry Limits

```typescript
// Don't retry forever
const bad = await retry(operation, {
  maxAttempts: 100,  // Too many
  delay: 100,
})

// Use reasonable limits based on operation type
const good = await retry(operation, {
  maxAttempts: 3,    // Good for most operations
  delay: 1000,
})

// Higher limits for critical operations
const critical = await retry(criticalOperation, {
  maxAttempts: 5,
  delay: 2000,
  maxDelay: 30000,
})
```

### 2. Use Exponential Backoff for External APIs

```typescript
// Good: Exponential backoff reduces server load
const data = await retry(
  () => fetch('https://api.example.com/data'),
  {
    maxAttempts: 3,
    delay: 1000,
    backoff: 2,      // Delays: 1s, 2s, 4s
    maxDelay: 10000,
  }
)

// Bad: Constant retry hammers the server
const data = await retry(
  () => fetch('https://api.example.com/data'),
  {
    maxAttempts: 10,
    delay: 100,
    backoff: 1,  // Always 100ms - can overload server
  }
)
```

### 3. Set Timeouts Based on Operation Type

```typescript
// Fast operations: short timeout
const cache = await timeout(redis.get(key), 500)

// API calls: medium timeout
const data = await timeout(fetch('/api/data'), 5000)

// File uploads: long timeout
const upload = await timeout(uploadFile(largeFile), 60000)

// Background jobs: very long timeout
const export = await timeout(generateReport(), 300000)
```

### 4. Always Handle TimeoutError

```typescript
import { timeout, TimeoutError } from 'receta/async'

// Good: Specific timeout handling
try {
  const data = await timeout(operation(), 5000)
} catch (error) {
  if (error instanceof TimeoutError) {
    // Handle timeout specifically
    return getCachedData()
  }
  throw error
}

// Bad: Treating all errors the same
try {
  const data = await timeout(operation(), 5000)
} catch (error) {
  return null  // Hides important error information
}
```

### 5. Log Retry Attempts

```typescript
// Good: Monitor retry patterns
const data = await retry(operation, {
  maxAttempts: 3,
  onRetry: (error, attempt, delay) => {
    logger.warn('Retry attempt', {
      operation: 'fetchUserData',
      attempt,
      delay,
      error: error instanceof Error ? error.message : String(error),
    })
  }
})

// Even better: Send metrics
const data = await retry(operation, {
  maxAttempts: 3,
  onRetry: (error, attempt, delay) => {
    metrics.increment('operation.retry', {
      operation: 'fetchUserData',
      attempt: String(attempt),
    })
  }
})
```

### 6. Prefer Result Pattern for Error Handling

```typescript
import { retryResult, timeoutResult } from 'receta/async'
import { Result, isOk } from 'receta/result'

// Good: Result pattern - errors as values
const fetchUserSafe = async (id: string): Promise<Result<User, string>> => {
  const result = await retryResult(
    async () => {
      const res = await timeoutResult(
        fetch(`/api/users/${id}`).then(r => r.json()),
        5000
      )
      if (isErr(res)) throw res.error
      return res.value
    },
    { maxAttempts: 3 }
  )

  return mapErr(result, error =>
    error instanceof Error ? error.message : String(error)
  )
}

// Caller doesn't need try-catch
const result = await fetchUserSafe('123')
if (isOk(result)) {
  console.log('User:', result.value)
} else {
  console.error('Failed:', result.error)
}

// Bad: Traditional approach requires try-catch everywhere
const fetchUserUnsafe = async (id: string): Promise<User> => {
  try {
    return await retry(
      () => timeout(fetch(`/api/users/${id}`).then(r => r.json()), 5000),
      { maxAttempts: 3 }
    )
  } catch (error) {
    // Error handling required here
    throw error
  }
}
```

**Benefits of Result Pattern:**
- ✅ No try-catch needed at call sites
- ✅ Errors visible in function signature
- ✅ Composable with other Result operations
- ✅ Full error context preserved
- ✅ Type-safe error handling

---

## Common Mistakes

### 1. Not Limiting Retry Attempts

```typescript
// Bad: Infinite retry loop
const badRetry = async () => {
  while (true) {
    try {
      return await operation()
    } catch {
      await sleep(1000)
      // Continues forever!
    }
  }
}

// Good: Use retry with limits
const goodRetry = async () => {
  return retry(operation, { maxAttempts: 3 })
}
```

### 2. Retrying Non-Idempotent Operations

```typescript
// Bad: Retrying payment processing can charge multiple times
const badPayment = async (userId: string, amount: number) => {
  return retry(
    () => stripe.charges.create({ customer: userId, amount }),
    { maxAttempts: 3 }
  )
}

// Good: Make operation idempotent with request ID
const goodPayment = async (userId: string, amount: number) => {
  const idempotencyKey = `payment-${userId}-${Date.now()}`

  return retry(
    () => stripe.charges.create({
      customer: userId,
      amount,
      idempotency_key: idempotencyKey  // Prevents duplicate charges
    }),
    { maxAttempts: 3 }
  )
}
```

### 3. Too Short Timeouts

```typescript
// Bad: Timeout is too short for the operation
const badTimeout = await timeout(
  fetch('/api/generate-report'),  // Takes 10+ seconds
  1000  // Times out too quickly
)

// Good: Timeout matches operation duration
const goodTimeout = await timeout(
  fetch('/api/generate-report'),
  30000  // Reasonable for report generation
)
```

### 4. Ignoring Retry Callbacks

```typescript
// Bad: Silent retries make debugging hard
const data = await retry(operation, { maxAttempts: 5 })

// Good: Log retries for visibility
const data = await retry(operation, {
  maxAttempts: 5,
  onRetry: (error, attempt, delay) => {
    console.warn(`Retry ${attempt}/${5}:`, error)
  }
})
```

### 5. Not Using shouldRetry

```typescript
// Bad: Retrying client errors wastes time
const bad = await retry(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    return res.json()
  },
  { maxAttempts: 3 }
)
// Will retry on 404, 400, etc. - pointless!

// Good: Only retry retryable errors
const good = await retry(
  async () => {
    const res = await fetch('/api/data')
    if (!res.ok) {
      const error: any = new Error(`HTTP ${res.status}`)
      error.status = res.status
      throw error
    }
    return res.json()
  },
  {
    maxAttempts: 3,
    shouldRetry: (error) => {
      if (error instanceof Error && 'status' in error) {
        const status = (error as any).status
        return status >= 500 || status === 429
      }
      return true
    }
  }
)
```

### 6. Retrying Inside Loops

```typescript
// Bad: Nested retries can cause exponential delays
const bad = async (ids: string[]) => {
  return retry(async () => {
    return Promise.all(
      ids.map(id => retry(() => fetch(`/api/items/${id}`)))
    )
  })
}
// If outer retry fails, inner retries run again!

// Good: Retry at the appropriate level
const good = async (ids: string[]) => {
  return Promise.all(
    ids.map(id => retry(() => fetch(`/api/items/${id}`)))
  )
}
```

### 7. Not Handling Timeout vs Operation Errors

```typescript
// Bad: Can't tell if timeout or operation failed
try {
  await timeout(operation(), 5000)
} catch (error) {
  console.error('Failed')  // Was it timeout or operation error?
}

// Good: Distinguish error types
try {
  await timeout(operation(), 5000)
} catch (error) {
  if (error instanceof TimeoutError) {
    console.error('Operation timed out - might be slow network')
  } else {
    console.error('Operation failed:', error)
  }
}

// Better: Use Result pattern for type-safe error handling
const result = await timeoutResult(operation(), 5000)
if (isErr(result)) {
  if (result.error.type === 'timeout') {
    console.error('Operation timed out - might be slow network')
  }
} else {
  console.log('Success:', result.value)
}
```

### 8. Mixing Exception and Result Patterns

```typescript
// Bad: Inconsistent error handling
const fetchData = async (url: string) => {
  const result = await retryResult(() => fetch(url), { maxAttempts: 3 })

  if (isErr(result)) {
    throw new Error('Fetch failed')  // Breaks Result pattern!
  }

  return result.value
}

// Good: Stay consistent with Result pattern
const fetchData = async (url: string): Promise<Result<Data, string>> => {
  const result = await retryResult(
    () => fetch(url).then(r => r.json()),
    { maxAttempts: 3 }
  )

  return mapErr(result, error =>
    `Failed after ${error.attempts} attempts: ${error.lastError}`
  )
}

// Or: Stay consistent with exceptions
const fetchData = async (url: string): Promise<Data> => {
  return retry(
    () => fetch(url).then(r => r.json()),
    { maxAttempts: 3 }
  )
  // Let exceptions propagate
}
```

---

## When to Use Result Pattern

Use `retryResult()` and `timeoutResult()` when:

✅ Building APIs where callers need to handle errors gracefully
✅ Composing multiple async operations with error handling
✅ You want errors to be visible in function signatures
✅ You need detailed error context (attempts, timeout duration)
✅ Building functional pipelines with `pipe()`

Use traditional `retry()` and `timeout()` when:

✅ Working with existing exception-based code
✅ Simple scripts where try-catch is acceptable
✅ You want operations to fail fast with exceptions
✅ Integration with libraries that expect exceptions

**Recommendation:** Prefer Result pattern for application code, use traditional for scripts/tools.

---

## Next Steps

- **[Concurrency Control](./03-concurrency-control.md)**: Managing parallel operations
- **[Polling](./04-polling.md)**: Waiting for conditions to be met
- **[Real-World Patterns](./05-real-world-patterns.md)**: Complete integration examples

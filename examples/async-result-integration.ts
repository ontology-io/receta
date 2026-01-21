/**
 * Async + Result Integration Examples
 *
 * Shows how to use async utilities with Result pattern for
 * type-safe, composable error handling.
 *
 * Run with: bun run examples/async-result-integration.ts
 */

import * as R from 'remeda'
import {
  retryResult,
  mapAsyncResult,
  timeoutResult,
  pollResult,
  sleep,
} from '../src/async'
import { unwrapOr, mapErr, isOk, map, type Result } from '../src/result'

console.log('=== Async + Result Integration Examples ===\n')

// Example 1: Retry with Result Pattern
console.log('Example 1: Retry with Result Pattern')
console.log('-------------------------------------')

let attemptCount = 0
const unreliableAPI = async (id: number): Promise<{ id: number; data: string }> => {
  attemptCount++
  if (attemptCount < 3) {
    throw new Error('Network error')
  }
  return { id, data: 'Success after retries' }
}

attemptCount = 0 // Reset counter
const retryRes = await retryResult(
  () => unreliableAPI(1),
  {
    maxAttempts: 5,
    delay: 50,
    onRetry: (error, attempt) => {
      console.log(`Retry attempt ${attempt}`)
    },
  }
)

// Handle with Result pattern - no exceptions!
const data = R.pipe(
  retryRes,
  map(result => result.data),
  unwrapOr('Failed to fetch')
)

console.log('Result:', data)
console.log('Is Success:', isOk(retryRes))
console.log()

// Example 2: Type-Safe Batch API Calls
console.log('Example 2: Type-Safe Batch API Calls')
console.log('------------------------------------')

type User = { id: string; name: string; email: string }
type FetchError = { type: 'not_found' | 'network'; message: string }

const fetchUserResult = async (id: string): Promise<Result<User, FetchError>> => {
  await sleep(50)

  // Simulate some failures
  if (id === 'user3') {
    return { _tag: 'Err', error: { type: 'not_found', message: `User ${id} not found` } }
  }

  return {
    _tag: 'Ok',
    value: { id, name: `User ${id}`, email: `${id}@example.com` },
  }
}

const userIds = ['user1', 'user2', 'user3', 'user4']

// mapAsyncResult returns Result of array - fails fast on first error
const usersResult = await mapAsyncResult(
  userIds,
  async (id) => fetchUserResult(id),
  { concurrency: 2 }
)

if (isOk(usersResult)) {
  console.log('All users fetched:', usersResult.value.length)
} else {
  console.log('Failed at user:', usersResult.error.item)
  console.log('Error:', usersResult.error.error.message)
}
console.log()

// Example 3: Timeout with Fallback
console.log('Example 3: Timeout with Fallback')
console.log('---------------------------------')

const slowOperation = async (): Promise<{ data: string }> => {
  await sleep(300)
  return { data: 'Slow data' }
}

const fastOperation = async (): Promise<{ data: string }> => {
  await sleep(50)
  return { data: 'Fast data' }
}

// Try slow operation with timeout, fallback to fast
const timeoutRes = await timeoutResult(slowOperation(), 100)
const finalData = R.pipe(
  timeoutRes,
  mapErr(error => {
    console.log('Timed out, using fallback')
    return error
  }),
  unwrapOr({ data: 'Fallback data' })
)

console.log('Data:', finalData.data)
console.log()

// Example 4: Polling Job Status
console.log('Example 4: Polling Job Status with Result')
console.log('------------------------------------------')

type JobStatus = { jobId: string; status: 'pending' | 'complete'; result?: string }

let pollAttempts = 0
const checkJobStatus = async (): Promise<JobStatus | null> => {
  pollAttempts++
  console.log(`Checking job status (attempt ${pollAttempts})...`)
  await sleep(100)

  if (pollAttempts >= 3) {
    return { jobId: '12345', status: 'complete', result: 'Job completed!' }
  }
  return null
}

const jobResult = await pollResult(checkJobStatus, {
  interval: 150,
  maxAttempts: 10,
})

const jobData = R.pipe(
  jobResult,
  map(job => job.result),
  unwrapOr('Job not completed')
)

console.log('Job result:', jobData)
console.log()

// Example 5: Real-World GitHub API Pattern
console.log('Example 5: GitHub API with Result Pattern')
console.log('------------------------------------------')

type GitHubRepo = { name: string; stars: number }
type GitHubError = { type: 'rate_limit' | 'not_found' | 'network'; message: string }

const fetchGitHubRepoResult = async (
  owner: string,
  repo: string
): Promise<Result<GitHubRepo, GitHubError>> => {
  // Simulate API call with Result
  await sleep(100)

  return {
    _tag: 'Ok',
    value: {
      name: `${owner}/${repo}`,
      stars: Math.floor(Math.random() * 10000),
    },
  }
}

const fetchRepoWithRetryAndTimeout = async (owner: string, repo: string) => {
  // Combine retry + timeout for resilient API calls
  const result = await retryResult(
    async () => {
      const timeoutRes = await timeoutResult(
        fetchGitHubRepoResult(owner, repo).then(r => {
          if (isOk(r)) return r.value
          throw new Error(r.error.message)
        }),
        5000
      )

      if (isOk(timeoutRes)) {
        return timeoutRes.value
      }
      throw timeoutRes.error
    },
    {
      maxAttempts: 3,
      delay: 1000,
      onRetry: (error, attempt) => {
        console.log(`Retrying repo fetch (attempt ${attempt})`)
      },
    }
  )

  return R.pipe(
    result,
    mapErr(error => ({
      type: 'network' as const,
      message: `Failed to fetch repo: ${error.type}`,
    })),
    unwrapOr({ name: 'unknown', stars: 0 })
  )
}

const repo = await fetchRepoWithRetryAndTimeout('facebook', 'react')
console.log('Repository:', repo.name)
console.log('Stars:', repo.stars)
console.log()

// Example 6: Composable Error Recovery
console.log('Example 6: Composable Error Recovery')
console.log('-------------------------------------')

const operations = [
  { name: 'op1', fn: async () => 'result1' },
  { name: 'op2', fn: async () => 'result2' },
  { name: 'op3', fn: async () => { throw new Error('op3 failed') } },
]

// Process all operations, collecting Results
const operationResults = await Promise.all(
  operations.map(async (op) => {
    const result = await retryResult(op.fn, {
      maxAttempts: 2,
      delay: 10,
    })

    return {
      name: op.name,
      result: R.pipe(
        result,
        mapErr(error => `${op.name} failed after ${error.attempts} attempts`),
        unwrapOr('fallback')
      ),
    }
  })
)

console.log('Operation results:')
operationResults.forEach((op) => {
  console.log(`  ${op.name}: ${op.result}`)
})
console.log()

console.log('=== All Examples Complete ===')
console.log('\nKey Takeaways:')
console.log('1. Result pattern eliminates exceptions')
console.log('2. Errors are typed and visible in signatures')
console.log('3. Compose with pipe for clean error handling')
console.log('4. No try-catch blocks needed')
console.log('5. Type-safe fallback with unwrapOr')

/**
 * Async Module Usage Examples
 *
 * Run with: bun run examples/async-usage.ts
 */

import {
  mapAsync,
  filterAsync,
  retry,
  timeout,
  parallel,
  sequential,
  batch,
  poll,
  debounce,
  throttle,
  sleep,
} from '../src/async'

console.log('=== Async Module Examples ===\n')

// Example 1: Rate-Limited API Calls with mapAsync
console.log('Example 1: Rate-Limited API Calls')
console.log('-----------------------------------')

const fetchUserData = async (userId: number) => {
  await sleep(100) // Simulate API call
  return { id: userId, name: `User ${userId}`, email: `user${userId}@example.com` }
}

const userIds = [1, 2, 3, 4, 5, 6, 7, 8]

// Fetch users with concurrency limit of 3
const users = await mapAsync(userIds, fetchUserData, { concurrency: 3 })
console.log(`Fetched ${users.length} users with max 3 concurrent requests`)
console.log('First user:', users[0])
console.log()

// Example 2: Retry Failed HTTP Requests
console.log('Example 2: Retry Failed HTTP Requests')
console.log('--------------------------------------')

let attemptCount = 0
const unreliableAPI = async (id: number) => {
  attemptCount++
  if (attemptCount < 3) {
    throw new Error('Network error')
  }
  return { id, data: 'Success after retries' }
}

attemptCount = 0 // Reset counter
const result = await retry(
  () => unreliableAPI(1),
  {
    maxAttempts: 5,
    delay: 50,
    backoff: 2,
    onRetry: (error, attempt, delay) => {
      console.log(`Retry attempt ${attempt} after ${delay}ms:`, error)
    },
  }
)
console.log('Final result:', result)
console.log()

// Example 3: Timeout for Slow Operations
console.log('Example 3: Timeout for Slow Operations')
console.log('---------------------------------------')

const fastOperation = async () => {
  await sleep(50)
  return 'Completed quickly'
}

const slowOperation = async () => {
  await sleep(500)
  return 'Too slow'
}

try {
  const fast = await timeout(fastOperation(), 200)
  console.log('Fast operation:', fast)

  const slow = await timeout(slowOperation(), 200)
  console.log('Slow operation:', slow) // Won't reach here
} catch (error) {
  console.log('Timeout error:', (error as Error).message)
}
console.log()

// Example 4: Bulk Data Processing with Batching
console.log('Example 4: Bulk Data Processing with Batching')
console.log('----------------------------------------------')

const records = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  value: (i + 1) * 10,
}))

const processBatch = async (batchRecords: typeof records) => {
  console.log(`Processing batch of ${batchRecords.length} records...`)
  await sleep(100)
  return batchRecords.map((r) => ({ ...r, processed: true }))
}

const processedBatches = await batch(records, processBatch, {
  batchSize: 10,
  delayBetweenBatches: 50,
})

console.log(`Processed ${processedBatches.flat().length} records in ${processedBatches.length} batches`)
console.log()

// Example 5: Real-Time Polling (Order Status)
console.log('Example 5: Real-Time Polling (Order Status)')
console.log('--------------------------------------------')

let pollAttempts = 0
const checkOrderStatus = async () => {
  pollAttempts++
  console.log(`Checking order status (attempt ${pollAttempts})...`)
  await sleep(100)

  // Simulate order becoming ready after 3 attempts
  if (pollAttempts >= 3) {
    return { orderId: '12345', status: 'ready', items: ['Item 1', 'Item 2'] }
  }
  return null
}

const order = await poll(checkOrderStatus, {
  interval: 150,
  maxAttempts: 10,
})

console.log('Order ready:', order)
console.log()

// Example 6: Debounced Search API Calls
console.log('Example 6: Debounced Search API Calls')
console.log('--------------------------------------')

let searchCallCount = 0
const searchAPI = debounce(
  async (query: string) => {
    searchCallCount++
    await sleep(50)
    return { query, results: [`Result for "${query}"`] }
  },
  { delay: 100 }
)

// Simulate user typing "hello" rapidly
const searches = [
  searchAPI('h'),
  searchAPI('he'),
  searchAPI('hel'),
  searchAPI('hell'),
  searchAPI('hello'),
]

const finalSearch = await searches[searches.length - 1]!
console.log('Search calls made:', searchCallCount, '(should be 1 - only last call executed)')
console.log('Final search result:', finalSearch)
console.log()

// Example 7: GitHub API Integration Pattern
console.log('Example 7: GitHub API Integration Pattern')
console.log('------------------------------------------')

interface GitHubRepo {
  name: string
  stars: number
  url: string
}

const fetchGitHubRepo = async (owner: string, repo: string): Promise<GitHubRepo> => {
  // Simulate GitHub API call
  await sleep(100)
  return {
    name: `${owner}/${repo}`,
    stars: Math.floor(Math.random() * 10000),
    url: `https://github.com/${owner}/${repo}`,
  }
}

const repositories = [
  { owner: 'facebook', repo: 'react' },
  { owner: 'microsoft', repo: 'typescript' },
  { owner: 'vercel', repo: 'next.js' },
  { owner: 'nodejs', repo: 'node' },
]

// Fetch repos with retry, timeout, and concurrency control
const repos = await mapAsync(
  repositories,
  async ({ owner, repo }) => {
    return retry(
      async () => {
        return timeout(fetchGitHubRepo(owner, repo), 1000)
      },
      { maxAttempts: 3, delay: 100 }
    )
  },
  { concurrency: 2 }
)

console.log('Fetched repositories:')
repos.forEach((repo) => {
  console.log(`  - ${repo.name} (${repo.stars} stars)`)
})
console.log()

// Example 8: Parallel vs Sequential Execution
console.log('Example 8: Parallel vs Sequential Execution')
console.log('--------------------------------------------')

const task1 = async () => {
  await sleep(100)
  return 'Task 1 complete'
}
const task2 = async () => {
  await sleep(100)
  return 'Task 2 complete'
}
const task3 = async () => {
  await sleep(100)
  return 'Task 3 complete'
}

// Parallel execution
const parallelStart = Date.now()
const parallelResults = await parallel([task1, task2, task3])
const parallelTime = Date.now() - parallelStart
console.log('Parallel execution:', parallelResults, `(${parallelTime}ms - should be ~100ms)`)

// Sequential execution
const sequentialStart = Date.now()
const sequentialResults = await sequential([task1, task2, task3])
const sequentialTime = Date.now() - sequentialStart
console.log('Sequential execution:', sequentialResults, `(${sequentialTime}ms - should be ~300ms)`)
console.log()

// Example 9: Filter with Async Predicate
console.log('Example 9: Filter with Async Predicate')
console.log('---------------------------------------')

const checkUserExists = async (userId: number) => {
  await sleep(50)
  // Simulate: even IDs exist, odd IDs don't
  return userId % 2 === 0
}

const userIdsToCheck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
const existingUserIds = await filterAsync(
  userIdsToCheck,
  checkUserExists,
  { concurrency: 3 }
)

console.log('Existing user IDs:', existingUserIds)
console.log()

console.log('=== All Examples Complete ===')

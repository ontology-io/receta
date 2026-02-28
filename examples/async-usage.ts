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
} from '@ontologyio/receta/async'

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

// Example 10: Result + Async Composition Pattern
console.log('Example 10: Result + Async Composition Pattern')
console.log('-----------------------------------------------')

import { isOk, isErr, unwrapOr, mapErr } from '@ontologyio/receta/result'
import * as Result from '@ontologyio/receta/result'
import * as R from 'remeda'

interface User {
  id: number
  email: string
  verified: boolean
}

interface Post {
  id: number
  userId: number
  title: string
}

// Simulate API calls that return Results
const fetchUserResult = async (id: number) => {
  await sleep(50)
  if (id > 0) {
    return Result.ok({ id, email: `user${id}@example.com`, verified: true })
  }
  return Result.err({ code: 'USER_NOT_FOUND', userId: id })
}

const fetchUserPostsResult = async (userId: number) => {
  await sleep(50)
  return Result.ok([
    { id: 1, userId, title: 'First Post' },
    { id: 2, userId, title: 'Second Post' },
  ] as Post[])
}

// Compose async operations with Result chaining
const getUserWithPosts = async (userId: number) => {
  // Retry the user fetch operation
  const userResult = await retry(() => fetchUserResult(userId), {
    maxAttempts: 3,
    delay: 50,
  })

  // Use flatMap to chain the next async operation only if user exists
  if (isErr(userResult)) {
    return userResult
  }

  const user = userResult.value

  if (isErr(user)) {
    return user
  }

  // Fetch posts and combine with user data
  const postsResult = await fetchUserPostsResult(user.value.id)

  if (isErr(postsResult)) {
    return postsResult
  }

  return Result.ok({
    user: user.value,
    posts: postsResult.value,
  })
}

const userWithPosts = await getUserWithPosts(1)
console.log('User with posts:', isOk(userWithPosts) ? 'Success' : 'Failed')
console.log()

// Example 11: Predicate Integration in Retry Logic
console.log('Example 11: Predicate Integration in Retry Logic')
console.log('------------------------------------------------')

import { lt as predicateLt } from '@ontologyio/receta/predicate'

class NetworkError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'NetworkError'
  }
}

class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

let networkAttempts = 0
const unreliableNetworkCall = async () => {
  networkAttempts++
  if (networkAttempts < 3) {
    throw new NetworkError('Connection failed')
  }
  if (networkAttempts === 3) {
    throw new AuthError('Not authorized') // Should not retry
  }
  return { success: true, data: 'Response data' }
}

// Use predicate builders to create retry conditions
const isRetryableError = (error: unknown): boolean => {
  return error instanceof NetworkError
}

const isWithinRetryLimit = (attempt: number): boolean => {
  return predicateLt(5)(attempt)
}

networkAttempts = 0
const resultWithPredicates = await retry(unreliableNetworkCall, {
  maxAttempts: 5,
  delay: 50,
  shouldRetry: (error, attempt) => {
    // Combine predicates: only retry if it's a network error AND within limit
    return isRetryableError(error) && isWithinRetryLimit(attempt)
  },
  onRetry: (error, attempt, delay) => {
    console.log(`Retry ${attempt}: ${error instanceof Error ? error.message : 'Unknown error'}`)
  },
})

console.log('Result with predicates:', isOk(resultWithPredicates) ? 'Eventually succeeded' : 'Failed')
if (isErr(resultWithPredicates)) {
  console.log('Error type:', resultWithPredicates.error.type)
}
console.log()

// Example 12: Complex Async Pipeline with Result and Predicates
console.log('Example 12: Complex Async Pipeline with Result and Predicates')
console.log('--------------------------------------------------------------')

import { gte, between } from '@ontologyio/receta/predicate'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

// Simulate product API with Result pattern
const fetchProducts = async (): Promise<Result.Result<Product[], string>> => {
  await sleep(50)
  return Result.ok([
    { id: 1, name: 'Widget', price: 29.99, stock: 100 },
    { id: 2, name: 'Gadget', price: 49.99, stock: 0 },
    { id: 3, name: 'Doohickey', price: 19.99, stock: 50 },
    { id: 4, name: 'Thingamajig', price: 99.99, stock: 25 },
    { id: 5, name: 'Whatsit', price: 5.99, stock: 200 },
  ])
}

const checkStock = async (product: Product): Promise<boolean> => {
  await sleep(10)
  return gte(1)(product.stock)
}

const applyDiscount = (product: Product): Product => ({
  ...product,
  price: product.price * 0.9, // 10% discount
})

// Complex pipeline: fetch products, filter by stock, filter by price range, apply discount
const getAffordableInStockProducts = async () => {
  // Fetch products with retry
  const productsResult = await retry(fetchProducts, {
    maxAttempts: 3,
    delay: 50,
  })

  if (isErr(productsResult)) {
    return productsResult
  }

  const products = unwrapOr(productsResult.value, [])

  // Filter products with async stock check (concurrency: 3)
  const inStockProducts = await filterAsync(products, checkStock, { concurrency: 3 })

  // Filter by price range using predicates
  const affordableProducts = R.filter(inStockProducts, (p) => between(10, 60)(p.price))

  // Apply discounts using mapAsync
  const discountedProducts = await mapAsync(affordableProducts, async (p) => {
    await sleep(5) // Simulate async discount calculation
    return applyDiscount(p)
  })

  return Result.ok(discountedProducts)
}

const affordableProducts = await getAffordableInStockProducts()
if (isOk(affordableProducts)) {
  console.log(`Found ${affordableProducts.value.length} affordable in-stock products:`)
  affordableProducts.value.forEach((p) => {
    console.log(`  - ${p.name}: $${p.price.toFixed(2)} (stock: ${p.stock})`)
  })
}
console.log()

console.log('=== All Examples Complete ===')

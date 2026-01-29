/**
 * Examples of using pipeAsync and promiseAllSettled for async composition
 *
 * Run with: bun run examples/async-composition-usage.ts
 */

import {
  pipeAsync,
  promiseAllSettled,
  extractFulfilled,
  extractRejected,
  toResults,
} from '../src/async'
import { map, unwrapOr, partition } from '../src/result'

// ============================================================================
// Example 1: pipeAsync - Sequential API data pipeline
// ============================================================================

interface User {
  id: number
  name: string
  email: string
  companyId: number
}

interface Company {
  id: number
  name: string
  industry: string
}

interface Post {
  id: number
  userId: number
  title: string
  content: string
  published: boolean
}

// Mock API functions
const fetchUser = async (userId: number): Promise<User> => {
  console.log(`Fetching user ${userId}...`)
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    id: userId,
    name: 'John Doe',
    email: 'john@example.com',
    companyId: 42,
  }
}

const fetchCompany = async (companyId: number): Promise<Company> => {
  console.log(`Fetching company ${companyId}...`)
  await new Promise((resolve) => setTimeout(resolve, 100))
  return {
    id: companyId,
    name: 'Acme Corp',
    industry: 'Technology',
  }
}

const fetchUserPosts = async (userId: number): Promise<Post[]> => {
  console.log(`Fetching posts for user ${userId}...`)
  await new Promise((resolve) => setTimeout(resolve, 100))
  return [
    {
      id: 1,
      userId,
      title: 'Hello World',
      content: 'My first post',
      published: true,
    },
    {
      id: 2,
      userId,
      title: 'Draft',
      content: 'Work in progress',
      published: false,
    },
    {
      id: 3,
      userId,
      title: 'TypeScript Tips',
      content: 'Advanced patterns',
      published: true,
    },
  ]
}

async function example1_SequentialPipeline() {
  console.log('\n=== Example 1: Sequential API Pipeline ===\n')

  // Chain multiple async operations in a readable pipeline
  const userSummary = await pipeAsync(
    123, // userId
    fetchUser,
    async (user) => {
      const company = await fetchCompany(user.companyId)
      return { user, company }
    },
    async ({ user, company }) => {
      const posts = await fetchUserPosts(user.id)
      return { user, company, posts }
    },
    ({ user, company, posts }) => ({
      name: user.name,
      email: user.email,
      company: company.name,
      industry: company.industry,
      publishedPosts: posts.filter((p) => p.published).length,
      totalPosts: posts.length,
    })
  )

  console.log('User Summary:', userSummary)
  // {
  //   name: 'John Doe',
  //   email: 'john@example.com',
  //   company: 'Acme Corp',
  //   industry: 'Technology',
  //   publishedPosts: 2,
  //   totalPosts: 3
  // }
}

// ============================================================================
// Example 2: pipeAsync - Data transformation with sync/async mix
// ============================================================================

async function example2_MixedTransformations() {
  console.log('\n=== Example 2: Mixed Sync/Async Transformations ===\n')

  const processData = await pipeAsync(
    'raw-data-123',
    // Extract ID
    (key) => key.split('-').pop() ?? '',
    // Parse to number
    (id) => Number.parseInt(id, 10),
    // Fetch data (async)
    async (id) => {
      console.log(`Fetching data for ID ${id}...`)
      await new Promise((resolve) => setTimeout(resolve, 50))
      return { id, value: Math.random() * 100 }
    },
    // Round value (sync)
    (data) => ({ ...data, value: Math.round(data.value) }),
    // Format (async)
    async (data) => {
      console.log(`Formatting data...`)
      await new Promise((resolve) => setTimeout(resolve, 50))
      return `ID: ${data.id}, Value: ${data.value}`
    }
  )

  console.log('Processed:', processData)
}

// ============================================================================
// Example 3: promiseAllSettled - Batch API calls with partial failures
// ============================================================================

const fetchProduct = async (id: number) => {
  await new Promise((resolve) => setTimeout(resolve, 50))
  if (id === 999 || id === 888) {
    throw new Error(`Product ${id} not found`)
  }
  return {
    id,
    name: `Product ${id}`,
    price: Math.random() * 100,
  }
}

async function example3_BatchWithPartialFailures() {
  console.log('\n=== Example 3: Batch API with Partial Failures ===\n')

  const productIds = [101, 102, 999, 103, 888, 104]

  console.log(`Fetching ${productIds.length} products...`)
  const results = await promiseAllSettled(
    productIds.map((id) => fetchProduct(id))
  )

  // Extract only successful results
  const products = extractFulfilled(results)
  const errors = extractRejected<Error>(results)

  console.log(`✓ Success: ${products.length} products fetched`)
  console.log(`✗ Failed: ${errors.length} products`)
  console.log('Products:', products)
  console.log(
    'Errors:',
    errors.map((e) => e.message)
  )
}

// ============================================================================
// Example 4: promiseAllSettled + toResults - Compose with Result pattern
// ============================================================================

async function example4_ResultComposition() {
  console.log('\n=== Example 4: Result Pattern Composition ===\n')

  const userIds = [1, 2, 999, 3, 888]

  const results = await promiseAllSettled(
    userIds.map(async (id) => {
      if (id === 999 || id === 888) {
        throw new Error(`User ${id} not found`)
      }
      return { id, name: `User ${id}`, active: id % 2 === 1 }
    })
  )

  // Convert to Result array for composability
  const userResults = toResults(results)

  // Use Result utilities to transform
  const usernames = userResults
    .map((r) => map(r, (user) => (user.active ? user.name : 'Inactive')))
    .map((r) => unwrapOr(r, 'Unknown'))

  console.log('Usernames:', usernames)
  // ['User 1', 'Inactive', 'Unknown', 'User 3', 'Unknown']

  // Partition into successes and failures
  const [successfulUsers, failedUsers] = partition(userResults)
  console.log(`${successfulUsers.length} succeeded, ${failedUsers.length} failed`)
}

// ============================================================================
// Example 5: Real-world scenario - Report generation
// ============================================================================

interface SalesData {
  date: string
  amount: number
  region: string
}

async function example5_ReportGeneration() {
  console.log('\n=== Example 5: Report Generation Pipeline ===\n')

  const report = await pipeAsync(
    '2024-01',
    // Parse month
    (month) => {
      const [year, monthNum] = month.split('-').map(Number)
      return { year: year!, month: monthNum! }
    },
    // Fetch sales data
    async ({ year, month }) => {
      console.log(`Fetching sales for ${year}-${month}...`)
      await new Promise((resolve) => setTimeout(resolve, 100))

      const data: SalesData[] = [
        { date: '2024-01-01', amount: 1000, region: 'North' },
        { date: '2024-01-02', amount: 1500, region: 'South' },
        { date: '2024-01-03', amount: 800, region: 'North' },
        { date: '2024-01-04', amount: 2000, region: 'East' },
      ]
      return { year, month, data }
    },
    // Calculate totals by region
    ({ year, month, data }) => {
      const regionTotals = data.reduce(
        (acc, sale) => {
          acc[sale.region] = (acc[sale.region] || 0) + sale.amount
          return acc
        },
        {} as Record<string, number>
      )

      return { year, month, regionTotals, totalSales: data.length }
    },
    // Format report
    async ({ year, month, regionTotals, totalSales }) => {
      console.log('Generating report...')
      await new Promise((resolve) => setTimeout(resolve, 50))

      const grandTotal = Object.values(regionTotals).reduce((a, b) => a + b, 0)

      return {
        period: `${year}-${month.toString().padStart(2, '0')}`,
        summary: {
          totalSales,
          grandTotal,
          averagePerSale: Math.round(grandTotal / totalSales),
        },
        byRegion: regionTotals,
      }
    }
  )

  console.log('Report:', JSON.stringify(report, null, 2))
}

// ============================================================================
// Example 6: Combining pipeAsync + promiseAllSettled
// ============================================================================

async function example6_Combined() {
  console.log('\n=== Example 6: Combined pipeAsync + promiseAllSettled ===\n')

  const result = await pipeAsync(
    [1, 2, 999, 3, 888, 4], // IDs with some failures
    // Fetch all in parallel
    async (ids) => {
      console.log(`Fetching ${ids.length} items in parallel...`)
      return promiseAllSettled(
        ids.map(async (id) => {
          if (id === 999 || id === 888) {
            throw new Error(`Item ${id} failed`)
          }
          return { id, value: id * 10 }
        })
      )
    },
    // Extract only successful items
    (settled) => extractFulfilled(settled),
    // Transform values
    (items) => items.map((item) => ({ ...item, doubled: item.value * 2 })),
    // Calculate sum
    (items) => items.reduce((sum, item) => sum + item.doubled, 0)
  )

  console.log('Total:', result) // (1*10*2) + (2*10*2) + (3*10*2) + (4*10*2) = 200
}

// ============================================================================
// Run all examples
// ============================================================================

async function main() {
  console.log('🚀 Async Composition Examples\n')

  await example1_SequentialPipeline()
  await example2_MixedTransformations()
  await example3_BatchWithPartialFailures()
  await example4_ResultComposition()
  await example5_ReportGeneration()
  await example6_Combined()

  console.log('\n✨ All examples completed!\n')
}

main().catch(console.error)

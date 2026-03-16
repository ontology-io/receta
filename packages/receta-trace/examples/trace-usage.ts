/**
 * Trace Module Usage Examples
 *
 * Run with: cd packages/receta-trace && bun run examples/trace-usage.ts
 */

import * as R from 'remeda'
import {
  traced,
  createTracer,
  tracedPipe,
  tracedPipeAsync,
  toTreeString,
  toJSON,
} from '../src/index'
import { ok, err, tryCatch, map, flatMap, isOk, type Result } from '@ontologyio/receta/result'

// ─────────────────────────────────────────────────
// Example 1: Simple Sync Pipeline
// ─────────────────────────────────────────────────
console.log('=== Example 1: Simple Sync Pipeline ===\n')

const { result: syncResult, trace: syncTrace } = tracedPipe(
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  traced('filterEvens', (nums: number[]) => R.filter(nums, (n) => n % 2 === 0)),
  traced('double', (nums: number[]) => R.map(nums, (n) => n * 2)),
  traced('sum', (nums: number[]) => R.reduce(nums, (a, b) => a + b, 0)),
)

console.log(toTreeString(syncTrace))
console.log(`\nResult: ${syncResult}\n`)

// ─────────────────────────────────────────────────
// Example 2: Nested Function Calls
// ─────────────────────────────────────────────────
console.log('\n=== Example 2: Nested Function Calls ===\n')

const validate = traced('validate', (user: { name: string; age: number }) => {
  if (user.age < 0 || user.age > 150) return err('Invalid age')
  if (user.name.trim() === '') return err('Name required')
  return ok(user)
})

const formatName = traced('formatName', (name: string) =>
  name.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
)

const processUser = traced('processUser', (raw: { name: string; age: number }) => {
  const validated = validate(raw)
  if (!isOk(validated)) return validated
  const formatted = formatName(validated.value.name)
  return ok({ ...validated.value, name: formatted })
})

const tracer = createTracer()
const { result: userResult, trace: userTrace } = tracer.run(() =>
  processUser({ name: 'john doe', age: 30 })
)

console.log(toTreeString(userTrace))
console.log(`\nResult:`, userResult, '\n')

// ─────────────────────────────────────────────────
// Example 3: Async Pipeline
// ─────────────────────────────────────────────────
console.log('\n=== Example 3: Async Pipeline ===\n')

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const fetchUser = traced('fetchUser', async (id: string) => {
  await sleep(50) // simulate network
  return { id, name: 'Alice', email: 'alice@example.com' }
})

const fetchPosts = traced('fetchPosts', async (userId: string) => {
  await sleep(30) // simulate network
  return [
    { id: '1', title: 'Hello World', userId },
    { id: '2', title: 'Functional Programming', userId },
    { id: '3', title: 'TypeScript Tips', userId },
  ]
})

const enrichProfile = traced(
  'enrichProfile',
  async (data: { user: { id: string; name: string; email: string }; posts: { id: string; title: string }[] }) => {
    await sleep(10)
    return {
      ...data.user,
      postCount: data.posts.length,
      titles: R.map(data.posts, (p) => p.title),
    }
  },
)

const { result: asyncResult, trace: asyncTrace } = await tracedPipeAsync(
  'user-123',
  async (id: string) => {
    const user = await fetchUser(id)
    const posts = await fetchPosts(user.id)
    return { user, posts }
  },
  enrichProfile,
)

console.log(toTreeString(asyncTrace))
console.log(`\nResult:`, asyncResult, '\n')

// ─────────────────────────────────────────────────
// Example 4: Error Tracing
// ─────────────────────────────────────────────────
console.log('\n=== Example 4: Error Tracing ===\n')

const parseJSON = traced('parseJSON', (str: string) =>
  tryCatch(
    () => JSON.parse(str),
    (e) => `Parse error: ${e}`,
  )
)

const extractField = traced('extractField', (data: Result<any, string>) =>
  flatMap(data, (d) => (d.name ? ok(d.name as string) : err('Missing field: name')))
)

const toUpperCase = traced('toUpperCase', (result: Result<string, string>) =>
  map(result, (s: string) => s.toUpperCase())
)

// Success path
const { trace: successTrace } = tracedPipe(
  '{"name": "Alice", "role": "admin"}',
  parseJSON,
  extractField,
  toUpperCase,
)

console.log('Success path:')
console.log(toTreeString(successTrace))

// Error path
const { trace: errorTrace } = tracedPipe(
  'not valid json!!!',
  parseJSON,
  extractField,
  toUpperCase,
)

console.log('\nError path (invalid JSON):')
console.log(toTreeString(errorTrace))

// ─────────────────────────────────────────────────
// Example 5: Data Transformation Pipeline
// ─────────────────────────────────────────────────
console.log('\n\n=== Example 5: Data Transformation Pipeline ===\n')

interface Product {
  name: string
  price: number
  category: string
  inStock: boolean
}

const products: Product[] = [
  { name: 'Laptop', price: 999, category: 'electronics', inStock: true },
  { name: 'Book', price: 15, category: 'books', inStock: true },
  { name: 'Phone', price: 699, category: 'electronics', inStock: false },
  { name: 'Headphones', price: 149, category: 'electronics', inStock: true },
  { name: 'Notebook', price: 5, category: 'books', inStock: true },
  { name: 'Tablet', price: 449, category: 'electronics', inStock: true },
]

const { result: report, trace: reportTrace } = tracedPipe(
  products,
  traced('filterInStock', (items: Product[]) =>
    R.filter(items, (p) => p.inStock)
  ),
  traced('groupByCategory', (items: Product[]) =>
    R.groupBy(items, (p) => p.category)
  ),
  traced('computeSummary', (grouped: Record<string, Product[]>) =>
    R.pipe(
      R.entries(grouped),
      R.map(([category, items]) => ({
        category,
        count: items.length,
        totalValue: R.reduce(items, (sum, p) => sum + p.price, 0),
        avgPrice: Math.round(R.reduce(items, (sum, p) => sum + p.price, 0) / items.length),
      })),
    )
  ),
)

console.log(toTreeString(reportTrace))
console.log(`\nResult:`, JSON.stringify(report, null, 2), '\n')

// ─────────────────────────────────────────────────
// Example 6: JSON Trace Output (for logging)
// ─────────────────────────────────────────────────
console.log('\n=== Example 6: JSON Trace Output ===\n')

const { trace: jsonDemoTrace } = tracedPipe(
  42,
  traced('double', (x: number) => x * 2),
  traced('toString', (x: number) => `value: ${x}`),
)

const json = toJSON(jsonDemoTrace)
console.log(JSON.stringify(json, null, 2))

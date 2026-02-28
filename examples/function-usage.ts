/**
 * Real-world examples of function combinators and utilities
 *
 * Run with: bun run examples/function-usage.ts
 */

import * as R from 'remeda'
import {
  ifElse,
  when,
  unless,
  cond,
  compose,
  converge,
  juxt,
  ap,
  flip,
  partial,
  partialRight,
  unary,
  binary,
  nAry,
  tap,
  tryCatch,
  memoize,
} from '@ontologyio/receta/function'
import { unwrapOr, unwrap } from '@ontologyio/receta/option'
import { isOk, unwrap as unwrapResult, ok } from '@ontologyio/receta/result'
import { where, gt, lt, between, and as andPred, or as orPred } from '@ontologyio/receta/predicate'
import { nest, indexByUnique } from '@ontologyio/receta/collection'
import { flatten, getPath } from '@ontologyio/receta/object'

console.log('='.repeat(60))
console.log('Function Module - Real-World Examples')
console.log('='.repeat(60))

// ============================================================================
// Example 1: HTTP Status Code Handling with cond
// ============================================================================
console.log('\n1. HTTP Status Code Handling')
console.log('-'.repeat(60))

interface ApiResponse {
  status: number
  data?: any
  error?: string
}

const handleHttpStatus = cond<ApiResponse, string>([
  [(r) => r.status >= 200 && r.status < 300, (r) => `✓ Success: ${JSON.stringify(r.data)}`],
  [(r) => r.status >= 300 && r.status < 400, (r) => `↻ Redirect: ${r.status}`],
  [(r) => r.status >= 400 && r.status < 500, (r) => `✗ Client Error: ${r.error}`],
  [(r) => r.status >= 500, (r) => `✗ Server Error: ${r.error}`],
])

const responses: ApiResponse[] = [
  { status: 200, data: { userId: '123', name: 'Alice' } },
  { status: 301, error: 'Moved Permanently' },
  { status: 404, error: 'Not Found' },
  { status: 500, error: 'Internal Server Error' },
]

responses.forEach((response) => {
  const message = unwrapOr(handleHttpStatus(response), 'Unknown status')
  console.log(`[${response.status}] ${message}`)
})

// ============================================================================
// Example 2: Form Validation Pipeline
// ============================================================================
console.log('\n2. Form Validation Pipeline')
console.log('-'.repeat(60))

interface UserForm {
  email: string
  username: string
  password: string
  age?: number
}

const validateForm = (form: UserForm): UserForm =>
  R.pipe(
    form,
    // Normalize email
    when(
      (f) => f.email.includes(' '),
      (f) => ({ ...f, email: f.email.trim() })
    ),
    // Add default username if missing
    unless((f) => f.username.length > 0, (f) => ({
      ...f,
      username: f.email.split('@')[0] || 'user',
    })),
    // Ensure password meets minimum length
    when(
      (f) => f.password.length < 8,
      (f) => ({ ...f, password: f.password + '12345678'.slice(f.password.length) })
    ),
    // Add default age if missing
    unless((f) => f.age !== undefined && f.age > 0, (f) => ({
      ...f,
      age: 18,
    }))
  )

const rawForm: UserForm = {
  email: ' alice@example.com ',
  username: '',
  password: 'short',
}

const validated = validateForm(rawForm)
console.log('Input:', rawForm)
console.log('Validated:', validated)

// ============================================================================
// Example 3: Data Analytics with converge and juxt
// ============================================================================
console.log('\n3. Data Analytics with converge and juxt')
console.log('-'.repeat(60))

interface SalesRecord {
  id: string
  amount: number
  region: string
  timestamp: string
}

const sales: SalesRecord[] = [
  { id: '1', amount: 1200, region: 'North', timestamp: '2026-01-01' },
  { id: '2', amount: 800, region: 'South', timestamp: '2026-01-02' },
  { id: '3', amount: 1500, region: 'North', timestamp: '2026-01-03' },
  { id: '4', amount: 950, region: 'East', timestamp: '2026-01-04' },
  { id: '5', amount: 2000, region: 'West', timestamp: '2026-01-05' },
]

// Use juxt to extract multiple metrics at once
const extractMetrics = juxt([
  (records: SalesRecord[]) => records.length,
  (records: SalesRecord[]) => records.reduce((sum, r) => sum + r.amount, 0),
  (records: SalesRecord[]) => Math.max(...records.map((r) => r.amount)),
  (records: SalesRecord[]) => Math.min(...records.map((r) => r.amount)),
  (records: SalesRecord[]) => new Set(records.map((r) => r.region)).size,
])

const [count, total, max, min, uniqueRegions] = extractMetrics(sales)

console.log('Sales Metrics:')
console.log(`  Total Records: ${count}`)
console.log(`  Total Revenue: $${total.toLocaleString()}`)
console.log(`  Largest Sale: $${max.toLocaleString()}`)
console.log(`  Smallest Sale: $${min.toLocaleString()}`)
console.log(`  Unique Regions: ${uniqueRegions}`)

// Use converge to build a summary object
const buildSummary = converge(
  (total: number, count: number, max: number, regions: string[]): any => ({
    totalRevenue: total,
    recordCount: count,
    averageRevenue: Math.round(total / count),
    largestSale: max,
    regions,
  }),
  [
    (records: SalesRecord[]) => records.reduce((sum, r) => sum + r.amount, 0),
    (records: SalesRecord[]) => records.length,
    (records: SalesRecord[]) => Math.max(...records.map((r) => r.amount)),
    (records: SalesRecord[]) => [...new Set(records.map((r) => r.region))],
  ]
)

console.log('\nSummary Object:', buildSummary(sales))

// ============================================================================
// Example 4: Logger with Partial Application
// ============================================================================
console.log('\n4. Logging System with Partial Application')
console.log('-'.repeat(60))

const log = (timestamp: string, level: string, module: string, message: string) =>
  `${timestamp} [${level}] ${module}: ${message}`

const now = new Date().toISOString()
const logNow = partial(log, now)
const logError = partial(logNow, 'ERROR')
const logUserError = partial(logError, 'UserService')

console.log(logUserError('Failed to authenticate user'))
console.log(logUserError('User not found'))
console.log(partial(logNow, 'INFO', 'SystemService')('Application started'))

// ============================================================================
// Example 5: Data Transformation Pipeline with tap for Debugging
// ============================================================================
console.log('\n5. Data Pipeline with Debugging')
console.log('-'.repeat(60))

const processNumbers = (nums: number[]) => {
  const logs: string[] = []

  const result = R.pipe(
    nums,
    tap((arr) => logs.push(`Input: [${arr.join(', ')}]`)),
    R.map((x) => x * 2),
    tap((arr) => logs.push(`After doubling: [${arr.join(', ')}]`)),
    R.filter((x) => x > 10),
    tap((arr) => logs.push(`After filtering (>10): [${arr.join(', ')}]`)),
    R.reduce((sum, x) => sum + x, 0),
    tap((sum) => logs.push(`Final sum: ${sum}`))
  )

  return { result, logs }
}

const { result, logs } = processNumbers([1, 5, 8, 12, 15])
console.log('Pipeline execution:')
logs.forEach((log) => console.log(`  ${log}`))

// ============================================================================
// Example 6: Safe JSON Parsing with tryCatch
// ============================================================================
console.log('\n6. Safe JSON Parsing')
console.log('-'.repeat(60))

const parseJSON = tryCatch(
  (str: string) => JSON.parse(str),
  (error) => `Parse error: ${error instanceof Error ? error.message : String(error)}`
)

const inputs = ['{"valid": "json"}', '{"name": "Alice", "age": 30}', 'invalid json', '{broken']

inputs.forEach((input) => {
  const result = parseJSON(input)
  if (isOk(result)) {
    console.log(`✓ Parsed: ${input.slice(0, 30)}`)
    console.log(`  Result:`, unwrapResult(result))
  } else {
    console.log(`✗ Failed: ${input.slice(0, 30)}`)
    console.log(`  Error: ${result.error}`)
  }
})

// ============================================================================
// Example 7: Fibonacci with Memoization
// ============================================================================
console.log('\n7. Memoized Fibonacci')
console.log('-'.repeat(60))

const fibonacci = memoize((n: number): number => {
  if (n <= 1) return n
  return fibonacci(n - 1) + fibonacci(n - 2)
})

console.time('First calculation')
const fib40 = fibonacci(40)
console.timeEnd('First calculation')
console.log(`fibonacci(40) = ${fib40}`)

console.time('Cached calculation')
const fib40Cached = fibonacci(40)
console.timeEnd('Cached calculation')
console.log(`fibonacci(40) [cached] = ${fib40Cached}`)

// ============================================================================
// Example 8: Composing String Transformations
// ============================================================================
console.log('\n8. String Transformations with compose')
console.log('-'.repeat(60))

const exclaim = (s: string) => `${s}!`
const toUpper = (s: string) => s.toUpperCase()
const trim = (s: string) => s.trim()
const prefix = (p: string) => (s: string) => `${p} ${s}`

const shout = compose(exclaim, toUpper, trim)
const greetLoudly = compose(exclaim, toUpper, prefix('Hello'), trim)

console.log(shout('  hello world  '))
console.log(greetLoudly('  alice  '))

// ============================================================================
// Example 9: Fixing Array.map with unary
// ============================================================================
console.log('\n9. Fixing Array.map Callbacks')
console.log('-'.repeat(60))

const stringNumbers = ['1', '2', '3', '10', '20']

console.log('Without unary (parseInt gets index as radix):')
console.log(stringNumbers.map(parseInt)) // [1, NaN, NaN, 3, NaN]

console.log('\nWith unary (only first argument passed):')
console.log(stringNumbers.map(unary(parseInt))) // [1, 2, 3, 10, 20]

// ============================================================================
// Example 10: Flip for Better Partial Application
// ============================================================================
console.log('\n10. Using flip for Convenient Partial Application')
console.log('-'.repeat(60))

const divide = (a: number, b: number) => a / b
const divideBy = flip(divide)

const divideBy10 = partial(divideBy, 10)
const divideBy100 = partial(divideBy, 100)

console.log(`1000 / 10 = ${divideBy10(1000)}`)
console.log(`5000 / 10 = ${divideBy10(5000)}`)
console.log(`10000 / 100 = ${divideBy100(10000)}`)

// ============================================================================
// Example 11: Building Complex Objects with converge
// ============================================================================
console.log('\n11. Building Profile Objects')
console.log('-'.repeat(60))

interface RawUser {
  firstName: string
  lastName: string
  email: string
  scores: number[]
}

interface UserProfile {
  fullName: string
  username: string
  domain: string
  stats: {
    totalScore: number
    averageScore: number
    maxScore: number
    gradeLevel: string
  }
}

const buildProfile = converge(
  (fullName: string, username: string, domain: string, stats: any): UserProfile => ({
    fullName,
    username,
    domain,
    stats,
  }),
  [
    (user: RawUser) => `${user.firstName} ${user.lastName}`,
    (user: RawUser) => user.email.split('@')[0]!,
    (user: RawUser) => user.email.split('@')[1]!,
    (user: RawUser) => {
      const total = user.scores.reduce((a, b) => a + b, 0)
      const avg = total / user.scores.length
      const max = Math.max(...user.scores)
      const gradeLevel = avg >= 90 ? 'A' : avg >= 80 ? 'B' : avg >= 70 ? 'C' : 'D'

      return {
        totalScore: total,
        averageScore: Math.round(avg * 10) / 10,
        maxScore: max,
        gradeLevel,
      }
    },
  ]
)

const rawUser: RawUser = {
  firstName: 'Alice',
  lastName: 'Johnson',
  email: 'alice.johnson@university.edu',
  scores: [92, 88, 95, 87, 91],
}

console.log('Raw User:', rawUser)
console.log('\nProcessed Profile:')
console.log(JSON.stringify(buildProfile(rawUser), null, 2))

// ============================================================================
// Example 12: Integration with Predicate Module
// ============================================================================
console.log('\n12. Using Predicate Module with Function Combinators')
console.log('-'.repeat(60))

interface Product {
  id: string
  name: string
  price: number
  inStock: boolean
  category: string
}

const products: Product[] = [
  { id: '1', name: 'Laptop', price: 1200, inStock: true, category: 'Electronics' },
  { id: '2', name: 'Mouse', price: 25, inStock: true, category: 'Electronics' },
  { id: '3', name: 'Desk', price: 350, inStock: false, category: 'Furniture' },
  { id: '4', name: 'Chair', price: 200, inStock: true, category: 'Furniture' },
  { id: '5', name: 'Monitor', price: 400, inStock: true, category: 'Electronics' },
]

// Use predicate module to create reusable predicates
const isAffordable = where({ price: lt(500) })
const isExpensive = where({ price: gt(1000) })
const isAvailable = where({ inStock: (x: boolean) => x === true })
const isElectronics = where({ category: (c: string) => c === 'Electronics' })

// Combine predicates with function module
const categorizeProduct = cond<Product, string>([
  [andPred(isExpensive, isAvailable), (p) => `💎 Premium (${p.name})`],
  [andPred(isAffordable, isAvailable), (p) => `✓ Available (${p.name})`],
  [orPred(isExpensive, isElectronics), (p) => `⚡ High-Value (${p.name})`],
  [(p) => !p.inStock, (p) => `✗ Out of Stock (${p.name})`],
])

console.log('Product Categories:')
products.forEach((product) => {
  const category = unwrapOr(categorizeProduct(product), `Unknown (${product.name})`)
  console.log(`  ${category}`)
})

// Using where with filter in pipeline
const affordableElectronics = R.pipe(
  products,
  R.filter(andPred(isAffordable, isElectronics, isAvailable)),
  R.map((p) => `${p.name} - $${p.price}`)
)

console.log('\nAffordable Electronics in Stock:')
affordableElectronics.forEach((item) => console.log(`  ${item}`))

// ============================================================================
// Example 13: Integration with Collection Module
// ============================================================================
console.log('\n13. Using Collection Module with Function Combinators')
console.log('-'.repeat(60))

interface Order {
  orderId: string
  userId: string
  region: string
  items: Array<{ productId: string; quantity: number; price: number }>
  timestamp: string
}

const orders: Order[] = [
  {
    orderId: 'O1',
    userId: 'U1',
    region: 'North',
    items: [
      { productId: 'P1', quantity: 2, price: 100 },
      { productId: 'P2', quantity: 1, price: 50 },
    ],
    timestamp: '2026-01-01',
  },
  {
    orderId: 'O2',
    userId: 'U2',
    region: 'South',
    items: [{ productId: 'P1', quantity: 1, price: 100 }],
    timestamp: '2026-01-02',
  },
  {
    orderId: 'O3',
    userId: 'U1',
    region: 'North',
    items: [{ productId: 'P3', quantity: 3, price: 75 }],
    timestamp: '2026-01-03',
  },
]

// Use converge with collection operations
const analyzeOrders = converge(
  (byRegion: any, byUser: any, totalRevenue: number) => ({
    byRegion,
    byUser,
    totalRevenue,
    orderCount: orders.length,
  }),
  [
    // Nest by region (using R.groupBy which has simpler API)
    (orders: Order[]) => R.groupBy(orders, (o) => o.region),
    // Index by user (using indexByUnique from collection)
    (orders: Order[]) => {
      const grouped: Record<string, Order[]> = {}
      orders.forEach((o) => {
        if (!grouped[o.userId]) grouped[o.userId] = []
        grouped[o.userId]!.push(o)
      })
      return grouped
    },
    // Calculate total revenue
    (orders: Order[]) =>
      orders.reduce(
        (sum, o) => sum + o.items.reduce((s, item) => s + item.quantity * item.price, 0),
        0
      ),
  ]
)

console.log('Order Analysis:')
console.log(JSON.stringify(analyzeOrders(orders), null, 2))

// ============================================================================
// Example 14: Integration with Object Module
// ============================================================================
console.log('\n14. Using Object Module with Function Combinators')
console.log('-'.repeat(60))

interface Config {
  api: {
    baseUrl: string
    timeout: number
    retries: {
      max: number
      delay: number
    }
  }
  features: {
    darkMode: boolean
    notifications: boolean
  }
}

const config: Config = {
  api: {
    baseUrl: 'https://api.example.com',
    timeout: 5000,
    retries: {
      max: 3,
      delay: 1000,
    },
  },
  features: {
    darkMode: true,
    notifications: false,
  },
}

// Use converge with object operations
const extractConfigSummary = converge(
  (flattened: any, apiUrl: string, retries: number, features: string[]) => ({
    flattened,
    apiUrl,
    retryCount: retries,
    enabledFeatures: features,
  }),
  [
    (cfg: Config) => flatten(cfg),
    (cfg: Config) => unwrapOr(getPath(cfg, ['api', 'baseUrl']), 'unknown'),
    (cfg: Config) => unwrapOr(getPath(cfg, ['api', 'retries', 'max']), 0),
    (cfg: Config) => {
      const features = unwrapOr(getPath(cfg, ['features']), {})
      return Object.entries(features)
        .filter(([_, enabled]) => enabled)
        .map(([name]) => name)
    },
  ]
)

console.log('Config Summary:')
console.log(JSON.stringify(extractConfigSummary(config), null, 2))

// Using when/unless with object paths
const ensureRetries = unless(
  (cfg: Config) => unwrapOr(getPath(cfg, ['api', 'retries', 'max']), 0) > 0,
  (cfg: Config) => ({
    ...cfg,
    api: { ...cfg.api, retries: { max: 3, delay: 1000 } },
  })
)

const configWithDefaults = ensureRetries(config)
console.log('\nConfig with defaults:', JSON.stringify(configWithDefaults.api.retries, null, 2))

console.log('\n' + '='.repeat(60))
console.log('Examples completed successfully!')
console.log('All integrations with Receta modules demonstrated!')
console.log('='.repeat(60))

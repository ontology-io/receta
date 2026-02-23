/**
 * Number Module Usage Examples
 *
 * Run with: bun run examples/number-usage.ts
 */

import * as R from 'remeda'
import * as N from '../src/number'
import { isOk, unwrapOr } from '../src/result'
import { unwrapOr as optionUnwrapOr } from '../src/option'

console.log('=== Number Module Examples ===\n')

// ============================================================================
// Example 1: E-Commerce Pricing (Stripe-inspired)
// ============================================================================
console.log('--- Example 1: E-Commerce Pricing ---')

interface Product {
  id: string
  name: string
  priceInCents: number
}

const products: Product[] = [
  { id: '1', name: 'Premium Plan', priceInCents: 9900 },
  { id: '2', name: 'Enterprise Plan', priceInCents: 29900 },
  { id: '3', name: 'Starter Plan', priceInCents: 499 },
]

// Format prices for display
const displayPrice = (priceInCents: number) =>
  R.pipe(
    priceInCents / 100,
    N.toCurrency({ currency: 'USD' })
  )

products.forEach((product) => {
  console.log(`${product.name}: ${displayPrice(product.priceInCents)}`)
})
// Output:
// Premium Plan: $99.00
// Enterprise Plan: $299.00
// Starter Plan: $4.99

// Calculate cart total
const calculateCartTotal = (items: Product[], quantities: number[]) => {
  const totals = items.map((item, idx) => item.priceInCents * quantities[idx]!)
  return R.pipe(
    N.sum(totals),
    (total) => total / 100,
    N.toCurrency({ currency: 'USD' })
  )
}

const cartTotal = calculateCartTotal(
  [products[0]!, products[2]!],
  [1, 2]
)
console.log(`Cart Total: ${cartTotal}`)
// Output: Cart Total: $108.98

// ============================================================================
// Example 2: Analytics Dashboard
// ============================================================================
console.log('\n--- Example 2: Analytics Dashboard ---')

interface Analytics {
  pageViews: number
  uniqueVisitors: number
  conversions: number
  revenue: number
}

const stats: Analytics = {
  pageViews: 1234567,
  uniqueVisitors: 89432,
  conversions: 3421,
  revenue: 45678.90,
}

// Display metrics in compact format
console.log(`Page Views: ${N.toCompact(stats.pageViews)}`)
console.log(`Unique Visitors: ${N.toCompact(stats.uniqueVisitors)}`)
console.log(`Revenue: ${N.toCurrency(stats.revenue, { currency: 'USD' })}`)

// Calculate conversion rate
const conversionRate = R.pipe(
  N.percentage(stats.conversions, stats.uniqueVisitors),
  N.toPercent(2)
)
console.log(`Conversion Rate: ${conversionRate}`)
// Output:
// Page Views: 1.2M
// Unique Visitors: 89K
// Revenue: $45,678.90
// Conversion Rate: 3.83%

// Average order value
const avgOrderValue = R.pipe(
  N.average([45.99, 129.99, 89.50, 199.99, 59.99]),
  optionUnwrapOr(0),
  N.round(2),
  (val) => N.toCurrency(val, { currency: 'USD' })
)
console.log(`Average Order Value: ${avgOrderValue}`)
// Output: Average Order Value: $105.09

// ============================================================================
// Example 3: File Size Display
// ============================================================================
console.log('\n--- Example 3: File Size Display ---')

interface FileInfo {
  name: string
  sizeInBytes: number
}

const files: FileInfo[] = [
  { name: 'document.pdf', sizeInBytes: 2457600 },
  { name: 'image.jpg', sizeInBytes: 524288 },
  { name: 'video.mp4', sizeInBytes: 157286400 },
  { name: 'readme.txt', sizeInBytes: 1024 },
]

files.forEach((file) => {
  const displaySize = N.toBytes(file.sizeInBytes, { decimals: 1 })
  console.log(`${file.name}: ${displaySize}`)
})
// Output:
// document.pdf: 2.3 MB
// image.jpg: 512.0 KB
// video.mp4: 150.0 MB
// readme.txt: 1.0 KB

// Validate file size limit
const maxSizeBytes = N.fromBytes('10MB')
const uploadSize = 5242880 // 5MB

if (isOk(maxSizeBytes)) {
  const isUnderLimit = uploadSize <= maxSizeBytes.value
  console.log(`File upload (${N.toBytes(uploadSize)}): ${isUnderLimit ? 'OK' : 'TOO LARGE'}`)
}
// Output: File upload (5.00 MB): OK

// ============================================================================
// Example 4: Form Validation with Result
// ============================================================================
console.log('\n--- Example 4: Form Validation ---')

const validatePrice = (input: string) =>
  R.pipe(
    N.fromString(input),
    (result) => {
      if (isOk(result)) {
        const price = result.value
        if (price <= 0) {
          return N.fromString('invalid') // Return error
        }
        return result
      }
      return result
    }
  )

const priceInputs = ['19.99', 'invalid', '-5', '0', '99.95']

priceInputs.forEach((input) => {
  const result = validatePrice(input)
  if (isOk(result)) {
    console.log(`"${input}" → Valid: ${N.toCurrency(result.value, { currency: 'USD' })}`)
  } else {
    console.log(`"${input}" → Invalid: ${result.error.message}`)
  }
})
// Output:
// "19.99" → Valid: $19.99
// "invalid" → Invalid: Cannot parse "invalid" as a number
// "-5" → Invalid: Cannot parse "invalid" as a number
// "0" → Invalid: Cannot parse "invalid" as a number
// "99.95" → Valid: $99.95

// ============================================================================
// Example 5: Progress Indicators
// ============================================================================
console.log('\n--- Example 5: Progress Indicators ---')

interface Task {
  name: string
  completed: number
  total: number
}

const tasks: Task[] = [
  { name: 'Upload files', completed: 45, total: 100 },
  { name: 'Process data', completed: 78, total: 200 },
  { name: 'Generate report', completed: 100, total: 100 },
]

tasks.forEach((task) => {
  const progress = R.pipe(
    N.percentage(task.completed, task.total),
    N.toPercent(1)
  )
  const progressBar = R.pipe(
    N.percentage(task.completed, task.total),
    (p) => N.interpolate(0, 20, p),
    Math.round,
    (filled) => '█'.repeat(filled) + '░'.repeat(20 - filled)
  )
  console.log(`${task.name}: [${progressBar}] ${progress}`)
})
// Output:
// Upload files: [█████████░░░░░░░░░░░] 45.0%
// Process data: [███████░░░░░░░░░░░░░░] 39.0%
// Generate report: [████████████████████] 100.0%

// ============================================================================
// Example 6: Number Formatting & Calculations
// ============================================================================
console.log('\n--- Example 6: Number Formatting ---')

// Format numbers with different options
const num = 1234.5678

console.log('Default:', N.format(num))
console.log('No decimals:', N.format(num, { decimals: 0 }))
console.log('No grouping:', N.format(num, { useGrouping: false }))
console.log('German locale:', N.format(num, { locale: 'de-DE' }))
// Output:
// Default: 1,234.57
// No decimals: 1,235
// No grouping: 1234.57
// German locale: 1.234,57

// Rounding examples
const prices = [19.994, 29.995, 39.996]
const rounded = R.map(prices, N.round(2))
console.log('Rounded prices:', rounded)
// Output: Rounded prices: [19.99, 30, 40]

// Clamping values
const userRatings = [-1, 3, 7, 0, 5]
const clamped = R.map(userRatings, N.clamp(1, 5))
console.log('Clamped ratings (1-5):', clamped)
// Output: Clamped ratings (1-5): [1, 3, 5, 1, 5]

// ============================================================================
// Example 7: Currency Parsing (Stripe integration)
// ============================================================================
console.log('\n--- Example 7: Currency Parsing ---')

const paymentStrings = ['$19.99', '€1.234,56', '£50.00', 'invalid']

paymentStrings.forEach((str) => {
  const result = N.fromCurrency(str)
  if (isOk(result)) {
    const cents = Math.round(result.value * 100)
    console.log(`"${str}" → ${cents} cents (for Stripe API)`)
  } else {
    console.log(`"${str}" → Parse error: ${result.error.message}`)
  }
})
// Output:
// "$19.99" → 1999 cents (for Stripe API)
// "€1.234,56" → 123456 cents (for Stripe API)
// "£50.00" → 5000 cents (for Stripe API)
// "invalid" → Parse error: Cannot parse "invalid" as a currency value

// ============================================================================
// Example 8: Ordinal Numbers (Leaderboard)
// ============================================================================
console.log('\n--- Example 8: Ordinal Numbers ---')

interface Player {
  name: string
  score: number
}

const players: Player[] = [
  { name: 'Alice', score: 9500 },
  { name: 'Bob', score: 8200 },
  { name: 'Charlie', score: 7800 },
  { name: 'Diana', score: 9100 },
]

const leaderboard = R.pipe(
  players,
  R.sort((a, b) => b.score - a.score)
)

leaderboard.forEach((player, idx) => {
  const rank = N.toOrdinal(idx + 1)
  const score = N.format(player.score, { decimals: 0 })
  console.log(`${rank} place: ${player.name} - ${score} points`)
})
// Output:
// 1st place: Alice - 9,500 points
// 2nd place: Diana - 9,100 points
// 3rd place: Bob - 8,200 points
// 4th place: Charlie - 7,800 points

console.log('\n=== All Examples Complete ===')

/**
 * Predicate Usage Examples
 *
 * Run with: bun run examples/predicate-usage.ts
 */

import * as R from 'remeda'
import {
  gt,
  lt,
  gte,
  lte,
  eq,
  between,
  startsWith,
  includes,
  and,
  or,
  not,
  where,
  oneOf,
  prop,
  by,
  isString,
  isNumber,
  isDefined,
} from '@ontologyio/receta/predicate'

console.log('=== Example 1: Basic Comparisons ===\n')

const numbers = [1, 5, 10, 15, 20, 25]

console.log('Original numbers:', numbers)
console.log('Greater than 10:', R.filter(numbers, gt(10)))
console.log('Between 10 and 20:', R.filter(numbers, between(10, 20)))
console.log('Less than or equal to 15:', R.filter(numbers, lte(15)))

console.log('\n=== Example 2: Combining Predicates ===\n')

const scores = [45, 55, 65, 75, 85, 95]
console.log('Original scores:', scores)

// Passing score: between 60 and 80
const passingScore = and(gte(60), lte(80))
console.log('Passing scores (60-80):', R.filter(scores, passingScore))

// Honor roll: >= 90 OR (>= 85 AND < 90 with extra credit)
const honorRoll = or(gte(90), and(gte(85), lt(90)))
console.log('Honor roll (>=85):', R.filter(scores, honorRoll))

console.log('\n=== Example 3: Object Filtering with where() ===\n')

interface User {
  id: number
  name: string
  age: number
  active: boolean
  role: string
}

const users: User[] = [
  { id: 1, name: 'Alice', age: 25, active: true, role: 'admin' },
  { id: 2, name: 'Bob', age: 17, active: true, role: 'user' },
  { id: 3, name: 'Charlie', age: 30, active: false, role: 'user' },
  { id: 4, name: 'Diana', age: 22, active: true, role: 'moderator' },
]

console.log('All users:', users)

const activeAdults = where<User>({
  age: gte(18),
  active: Boolean,
})
console.log('\nActive adults (age >= 18, active = true):')
console.log(R.filter(users, activeAdults))

const staffMembers = where<User>({
  age: gte(18),
  active: Boolean,
  role: oneOf(['admin', 'moderator']),
})
console.log('\nActive staff (age >= 18, active, admin or moderator):')
console.log(R.filter(users, staffMembers))

console.log('\n=== Example 4: E-Commerce Product Filtering ===\n')

interface Product {
  id: number
  name: string
  price: number
  rating: number
  category: string
  inStock: boolean
}

const products: Product[] = [
  { id: 1, name: 'Laptop Pro', price: 1200, rating: 4.5, category: 'electronics', inStock: true },
  { id: 2, name: 'Wireless Mouse', price: 25, rating: 4.2, category: 'electronics', inStock: true },
  { id: 3, name: 'USB-C Cable', price: 15, rating: 3.8, category: 'accessories', inStock: false },
  {
    id: 4,
    name: 'Mechanical Keyboard',
    price: 150,
    rating: 4.7,
    category: 'electronics',
    inStock: true,
  },
  { id: 5, name: '4K Monitor', price: 400, rating: 4.6, category: 'electronics', inStock: true },
  { id: 6, name: 'Laptop Stand', price: 50, rating: 4.0, category: 'accessories', inStock: true },
]

console.log(`Total products: ${products.length}`)

// Affordable electronics in stock
const affordableElectronics = where<Product>({
  category: eq('electronics'),
  price: between(100, 500),
  inStock: Boolean,
  rating: gte(4.5),
})

console.log('\nAffordable electronics (100-500, rating >= 4.5, in stock):')
console.log(R.filter(products, affordableElectronics))

console.log('\n=== Example 5: String Filtering ===\n')

const files = [
  'app.ts',
  'app.test.ts',
  'utils.ts',
  'config.json',
  'types.d.ts',
  'README.md',
  'setup.test.ts',
]

console.log('All files:', files)
console.log('TypeScript files (.ts):', R.filter(files, startsWith('app')))
console.log('Test files:', R.filter(files, includes('.test.')))
console.log('Non-test TS files:', R.filter(files, and(includes('.ts'), not(includes('.test.')))))

console.log('\n=== Example 6: Type Narrowing with Guards ===\n')

const mixed: unknown[] = ['hello', 42, true, null, 'world', undefined, 100, false, 'test']

console.log('Mixed array:', mixed)
console.log('Strings only:', R.filter(mixed, isString))
console.log('Numbers only:', R.filter(mixed, isNumber))
console.log('Defined values:', R.filter(mixed, isDefined))

console.log('\n=== Example 7: Real-World API Filtering ===\n')

interface Order {
  id: number
  userId: number
  amount: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: string
  items: number
}

const orders: Order[] = [
  { id: 1, userId: 101, amount: 150, status: 'pending', createdAt: '2024-01-15', items: 3 },
  { id: 2, userId: 102, amount: 75, status: 'shipped', createdAt: '2024-01-14', items: 1 },
  { id: 3, userId: 101, amount: 300, status: 'delivered', createdAt: '2024-01-10', items: 5 },
  { id: 4, userId: 103, amount: 200, status: 'processing', createdAt: '2024-01-16', items: 4 },
  { id: 5, userId: 102, amount: 50, status: 'cancelled', createdAt: '2024-01-12', items: 1 },
]

console.log(`Total orders: ${orders.length}`)

// Active high-value orders (pending/processing, amount > 100)
const activeHighValue = where<Order>({
  status: oneOf(['pending', 'processing']),
  amount: gt(100),
})

console.log('\nActive high-value orders (pending/processing, amount > 100):')
console.log(R.filter(orders, activeHighValue))

// Large fulfilled orders (delivered, 3+ items)
const largeFulfilled = where<Order>({
  status: eq('delivered'),
  items: gte(3),
})

console.log('\nLarge fulfilled orders (delivered, 3+ items):')
console.log(R.filter(orders, largeFulfilled))

// VIP customer filter (userId 101, any active order)
const vipActiveOrders = and(prop('userId', eq(101)), prop('status', oneOf(['pending', 'processing', 'shipped'])))

console.log('\nVIP customer (101) active orders:')
console.log(R.filter(orders, vipActiveOrders))

console.log('\n=== Example 8: Complex Business Logic ===\n')

interface Transaction {
  id: number
  amount: number
  type: 'credit' | 'debit'
  category: string
  verified: boolean
  flagged: boolean
}

const transactions: Transaction[] = [
  { id: 1, amount: 100, type: 'credit', category: 'salary', verified: true, flagged: false },
  { id: 2, amount: 50, type: 'debit', category: 'groceries', verified: true, flagged: false },
  { id: 3, amount: 1000, type: 'credit', category: 'refund', verified: false, flagged: true },
  { id: 4, amount: 200, type: 'debit', category: 'rent', verified: true, flagged: false },
  { id: 5, amount: 500, type: 'credit', category: 'bonus', verified: true, flagged: false },
]

console.log(`Total transactions: ${transactions.length}`)

// Need review: flagged OR (amount > 400 AND not verified)
const needsReview = or(prop('flagged', Boolean), and(prop('amount', gt(400)), prop('verified', not(Boolean))))

console.log('\nTransactions needing review (flagged OR large unverified):')
console.log(R.filter(transactions, needsReview))

// Calculate total verified credits
const verifiedCredits = R.pipe(
  transactions,
  R.filter(
    where({
      type: eq('credit'),
      verified: Boolean,
    })
  ),
  R.map((t) => t.amount),
  R.reduce((sum, amount) => sum + amount, 0)
)

console.log(`\nTotal verified credits: $${verifiedCredits}`)

console.log('\n=== Example 9: Advanced Filtering with by() ===\n')

interface CartItem {
  name: string
  price: number
  quantity: number
  discount: number
}

const cart: CartItem[] = [
  { name: 'Laptop', price: 1000, quantity: 1, discount: 0.1 },
  { name: 'Mouse', price: 50, quantity: 2, discount: 0 },
  { name: 'Keyboard', price: 100, quantity: 1, discount: 0.2 },
  { name: 'Monitor', price: 300, quantity: 1, discount: 0.15 },
]

console.log('Shopping cart:', cart)

// Items with final price > 80
const expensiveItems = by((item: CartItem) => item.price * (1 - item.discount), gt(80))
console.log('\nItems with final price > $80:')
console.log(R.filter(cart, expensiveItems))

// Items with total value > 100
const highValueItems = by((item: CartItem) => item.price * item.quantity, gt(100))
console.log('\nItems with total value > $100:')
console.log(R.filter(cart, highValueItems))

console.log('\n=== All Examples Complete! ===')

# Comparison Predicates

Comparison predicates test values against thresholds, ranges, and patterns. They're the building blocks for most filtering operations.

## Overview

| Function | Purpose | Example |
|----------|---------|---------|
| `gt(n)` | Greater than | `gt(18)` → age > 18 |
| `gte(n)` | Greater or equal | `gte(18)` → age >= 18 |
| `lt(n)` | Less than | `lt(100)` → price < 100 |
| `lte(n)` | Less or equal | `lte(100)` → price <= 100 |
| `eq(v)` | Equals | `eq('active')` → status === 'active' |
| `neq(v)` | Not equals | `neq(null)` → value !== null |
| `between(min, max)` | Range (inclusive) | `between(18, 65)` → 18 <= age <= 65 |
| `startsWith(s)` | String prefix | `startsWith('app')` → 'app.ts' |
| `endsWith(s)` | String suffix | `endsWith('.ts')` → 'app.ts' |
| `includes(s)` | Substring | `includes('@gmail')` → emails |
| `matches(regex)` | Pattern match | `matches(/^\d+$/)` → digits only |
| `isEmpty` | Empty check | `isEmpty('')` → true |
| `isNotEmpty` | Non-empty check | `isNotEmpty('hi')` → true |

---

## Numeric Comparisons

### `gt(threshold)` - Greater Than

```typescript
import * as R from 'remeda'
import { gt } from 'receta/predicate'

// Filter adults
const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
]
R.filter(users, (u) => gt(18)(u.age))
// => [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]

// Filter expensive products
const products = [
  { name: 'Phone', price: 500 },
  { name: 'Cable', price: 15 }
]
R.filter(products, (p) => gt(100)(p.price))
// => [{ name: 'Phone', price: 500 }]
```

**Real-world: Stripe transactions over $100**
```typescript
const transactions = await fetchTransactions()
const largePayments = R.filter(transactions, (t) => gt(10000)(t.amount)) // cents
```

### `gte(threshold)` - Greater Than or Equal

```typescript
import { gte } from 'receta/predicate'

// Filter passing scores (>= 60)
const scores = [45, 60, 75, 55, 80]
R.filter(scores, gte(60))
// => [60, 75, 80]

// Minimum order value
const orders = [
  { id: 1, amount: 50 },
  { id: 2, amount: 100 },
  { id: 3, amount: 75 }
]
R.filter(orders, (o) => gte(75)(o.amount))
// => [{ id: 2, amount: 100 }, { id: 3, amount: 75 }]
```

**Real-world: AWS EC2 instances with enough CPU**
```typescript
const instances = await ec2.describeInstances()
const powerfulInstances = R.filter(
  instances,
  (i) => gte(4)(i.cpuCount)
)
```

### `lt(threshold)` - Less Than

```typescript
import { lt } from 'receta/predicate'

// Filter budget items (< $50)
const items = [
  { name: 'Notebook', price: 5 },
  { name: 'Laptop', price: 1000 },
  { name: 'Pen', price: 2 }
]
R.filter(items, (i) => lt(50)(i.price))
// => [{ name: 'Notebook', price: 5 }, { name: 'Pen', price: 2 }]

// Low stock alerts
const inventory = [
  { sku: 'A', quantity: 5 },
  { sku: 'B', quantity: 50 },
  { sku: 'C', quantity: 2 }
]
const lowStock = R.filter(inventory, (item) => lt(10)(item.quantity))
```

**Real-world: GitHub issues with few comments**
```typescript
const issues = await octokit.issues.listForRepo()
const needsAttention = R.filter(issues, (i) => lt(3)(i.comments))
```

### `lte(threshold)` - Less Than or Equal

```typescript
import { lte } from 'receta/predicate'

// Filter items within budget (≤ $100)
const shoppingCart = [
  { name: 'Shirt', price: 50 },
  { name: 'Shoes', price: 100 },
  { name: 'Watch', price: 200 }
]
R.filter(shoppingCart, (item) => lte(100)(item.price))
// => [{ name: 'Shirt', price: 50 }, { name: 'Shoes', price: 100 }]
```

### `between(min, max)` - Range Check (Inclusive)

```typescript
import { between } from 'receta/predicate'

// Filter by age range
const users = [
  { name: 'Teen', age: 15 },
  { name: 'Young', age: 25 },
  { name: 'Middle', age: 45 },
  { name: 'Senior', age: 70 }
]
const workingAge = R.filter(users, (u) => between(18, 65)(u.age))
// => [{ name: 'Young', age: 25 }, { name: 'Middle', age: 45 }]

// Price range filtering
const products = [
  { name: 'Budget Phone', price: 200 },
  { name: 'Mid-range Phone', price: 500 },
  { name: 'Flagship Phone', price: 1200 }
]
const affordable = R.filter(products, (p) => between(300, 800)(p.price))
// => [{ name: 'Mid-range Phone', price: 500 }]
```

**Real-world: E-commerce price slider**
```typescript
// User selects price range [50, 200]
const priceFilter = between(50, 200)
const filtered = R.filter(products, (p) => priceFilter(p.price))
```

---

## Equality Comparisons

### `eq(value)` - Equals (Strict ===)

```typescript
import { eq } from 'receta/predicate'

// Filter by status
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'shipped' },
  { id: 3, status: 'pending' }
]
R.filter(orders, (o) => eq('pending')(o.status))
// => [{ id: 1, status: 'pending' }, { id: 3, status: 'pending' }]

// Find exact matches
const numbers = [1, 2, 3, 2, 1]
R.filter(numbers, eq(2))
// => [2, 2]
```

**Real-world: Filter Prisma records by status**
```typescript
const activeUsers = R.filter(users, (u) => eq('ACTIVE')(u.status))
```

### `neq(value)` - Not Equals (Strict !==)

```typescript
import { neq } from 'receta/predicate'

// Exclude specific value
const numbers = [1, 2, 3, 2, 1]
R.filter(numbers, neq(2))
// => [1, 3, 1]

// Exclude cancelled orders
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'cancelled' },
  { id: 3, status: 'shipped' }
]
const activeOrders = R.filter(orders, (o) => neq('cancelled')(o.status))
```

---

## String Predicates

### `startsWith(prefix)` - String Prefix

```typescript
import { startsWith } from 'receta/predicate'

// Filter files by prefix
const files = ['app.ts', 'app.test.ts', 'utils.ts', 'config.json']
R.filter(files, startsWith('app'))
// => ['app.ts', 'app.test.ts']

// Filter by name
const users = ['Alice', 'Bob', 'Alex', 'Barbara']
R.filter(users, startsWith('A'))
// => ['Alice', 'Alex']
```

**Real-world: Filter S3 keys by folder**
```typescript
const objects = await s3.listObjects({ Bucket: 'my-bucket' })
const images = R.filter(objects, (obj) => startsWith('images/')(obj.Key))
```

### `endsWith(suffix)` - String Suffix

```typescript
import { endsWith } from 'receta/predicate'

// Filter TypeScript files
const files = ['app.ts', 'app.js', 'config.json', 'test.spec.ts']
R.filter(files, endsWith('.ts'))
// => ['app.ts', 'test.spec.ts']

// Filter by domain
const emails = ['alice@gmail.com', 'bob@yahoo.com', 'charlie@gmail.com']
R.filter(emails, endsWith('@gmail.com'))
// => ['alice@gmail.com', 'charlie@gmail.com']
```

**Real-world: Filter image files**
```typescript
const allowedExtensions = ['.jpg', '.png', '.gif']
const isImage = (filename: string) =>
  allowedExtensions.some(ext => endsWith(ext)(filename))
```

### `includes(substring)` - Substring Match

```typescript
import { includes } from 'receta/predicate'

// Search functionality
const products = [
  { name: 'iPhone 15 Pro' },
  { name: 'Samsung Galaxy S24' },
  { name: 'iPhone 15' }
]
const searchTerm = 'iPhone'
R.filter(products, (p) => includes(searchTerm)(p.name))
// => [{ name: 'iPhone 15 Pro' }, { name: 'iPhone 15' }]

// Filter logs
const logs = [
  'INFO: Server started',
  'ERROR: Connection failed',
  'INFO: Request received'
]
R.filter(logs, includes('ERROR'))
// => ['ERROR: Connection failed']
```

**Real-world: Full-text search in user names**
```typescript
const searchUsers = (query: string) =>
  R.filter(users, (u) => includes(query.toLowerCase())(u.name.toLowerCase()))
```

### `matches(regex)` - Regular Expression

```typescript
import { matches } from 'receta/predicate'

// Validate email format
const emails = ['alice@example.com', 'invalid-email', 'bob@test.org']
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
R.filter(emails, matches(emailPattern))
// => ['alice@example.com', 'bob@test.org']

// Filter phone numbers
const phones = ['+1-555-0100', '555-0100', 'not-a-phone']
R.filter(phones, matches(/^\+?\d{1,3}-\d{3}-\d{4}$/))
// => ['+1-555-0100', '555-0100']

// Extract digits-only strings
const mixed = ['abc', '123', 'a1b2', '456']
R.filter(mixed, matches(/^\d+$/))
// => ['123', '456']
```

**Real-world: Validate API tokens**
```typescript
const isValidToken = matches(/^[A-Za-z0-9_-]{32}$/)
if (!isValidToken(token)) {
  throw new Error('Invalid token format')
}
```

---

## Empty Checks

### `isEmpty` - Check if Empty

Works with strings, arrays, and objects.

```typescript
import { isEmpty } from 'receta/predicate'

// Strings
R.filter(['', 'hello', '', 'world'], isEmpty)
// => ['', '']

// Arrays
R.filter([[], [1, 2], []], isEmpty)
// => [[], []]

// Objects
R.filter([{}, { a: 1 }, {}], isEmpty)
// => [{}, {}]
```

**Real-world: Remove empty form fields**
```typescript
const formData = { name: 'Alice', email: '', bio: 'Developer', phone: '' }
const filled = R.pipe(
  R.entries(formData),
  R.filter(([_, value]) => !isEmpty(value)),
  R.fromEntries
)
// => { name: 'Alice', bio: 'Developer' }
```

### `isNotEmpty` - Check if Not Empty

```typescript
import { isNotEmpty } from 'receta/predicate'

// Filter non-empty strings
const names = ['', 'Alice', '', 'Bob', 'Charlie']
R.filter(names, isNotEmpty)
// => ['Alice', 'Bob', 'Charlie']

// Filter non-empty arrays
const batches = [[], [1, 2], [], [3]]
R.filter(batches, isNotEmpty)
// => [[1, 2], [3]]
```

---

## Combining Comparisons

```typescript
import { and, or, between, gt, lt } from 'receta/predicate'

// Adults but not seniors (18 ≤ age < 65)
const workingAge = and(gte(18), lt(65))

// Budget or premium (< $50 OR > $500)
const budgetOrPremium = or(lt(50), gt(500))

// Using between is cleaner for ranges
const teenRange = between(13, 19)
```

---

## When to Use Each

| Predicate | Use When |
|-----------|----------|
| `gt`, `gte`, `lt`, `lte` | Single-sided thresholds |
| `between` | Range checks (inclusive) |
| `eq`, `neq` | Exact value matching |
| `startsWith` | Prefixes (paths, names) |
| `endsWith` | Suffixes (extensions, domains) |
| `includes` | Substring search |
| `matches` | Complex patterns (regex) |
| `isEmpty` / `isNotEmpty` | Presence checks |

---

## Performance Tips

### 1. Use Simplest Predicate

```typescript
// ✅ Simpler and faster
eq('active')

// ❌ Overkill
matches(/^active$/)
```

### 2. Order Matters in AND

```typescript
// ✅ Fast check first
and(
  eq('active'),        // Quick check
  expensiveValidation  // Only if first passes
)

// ❌ Slow check first
and(
  expensiveValidation,
  eq('active')
)
```

### 3. Prefer `between` Over Multiple Checks

```typescript
// ✅ Single range check
between(18, 65)

// ❌ Two separate checks
and(gte(18), lte(65))
```

---

## Common Patterns

### Pattern: Age Groups

```typescript
const isChild = lt(13)
const isTeen = between(13, 19)
const isAdult = between(20, 64)
const isSenior = gte(65)
```

### Pattern: Price Ranges

```typescript
const isBudget = lt(50)
const isMidRange = between(50, 200)
const isPremium = gt(200)
```

### Pattern: String Validation

```typescript
const isEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
const isPhone = matches(/^\+?\d{10,}$/)
const isURL = matches(/^https?:\/\/.+/)
```

---

## Next Steps

- **[Combinators](./02-combinators.md)** - Combine predicates with `and`, `or`, `not`
- **[Builders](./03-builders.md)** - Use `where()` for multi-field checks
- **[Common Patterns](./05-patterns.md)** - Real-world filtering recipes

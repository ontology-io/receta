# Predicate Builders

> Build complex object predicates using database-like query patterns.

## Overview

| Builder | Purpose | Example |
|---------|---------|---------|
| `where(schema)` | Multi-field object check | `where({ age: gt(18), active: Boolean })` |
| `oneOf(values)` | Value in list | `oneOf(['admin', 'owner'])` |
| `prop(key, pred)` | Single property check | `prop('status', eq('active'))` |
| `matchesShape(pattern)` | Exact shape match | `matchesShape({ type: 'click' })` |
| `hasProperty(key)` | Property exists | `hasProperty('email')` |
| `satisfies(pred)` | Custom condition | `satisfies((x) => x > 0)` |
| `by(selector, pred)` | Test derived value | `by((u) => u.tags.length, gt(2))` |

**Mental Model:** Think of these as **SQL WHERE clauses** for in-memory objects.

---

## where() - Multi-Field Object Filtering

### Signature

```typescript
const where = <T extends Record<string, unknown>>(
  schema: PredicateSchema<T>
): Predicate<T>
```

The `where` builder creates predicates that test multiple object properties. All predicates in the schema must pass.

### Basic Usage

```typescript
import * as R from 'remeda'
import { where, gt, eq } from 'receta/predicate'

interface User {
  age: number
  name: string
  active: boolean
}

const users: User[] = [
  { age: 25, name: 'Alice', active: true },
  { age: 17, name: 'Bob', active: true },
  { age: 30, name: 'Charlie', active: false }
]

// Active adults
const activeAdult = where({
  age: gt(18),
  active: Boolean  // shorthand for (v) => Boolean(v)
})

R.filter(users, activeAdult)
// => [{ age: 25, name: 'Alice', active: true }]
```

### Database-Like Queries

Think of `where()` like SQL or MongoDB queries:

```typescript
// SQL: SELECT * FROM products WHERE price >= 100 AND inStock = true
const query = where({
  price: gte(100),
  inStock: eq(true)
})

R.filter(products, query)
```

```typescript
// MongoDB: db.orders.find({ status: 'pending', amount: { $gt: 1000 } })
const query = where({
  status: eq('pending'),
  amount: gt(1000)
})

R.filter(orders, query)
```

```typescript
// Prisma: prisma.user.findMany({ where: { role: 'admin', verified: true } })
const query = where({
  role: eq('admin'),
  verified: eq(true)
})

R.filter(users, query)
```

### Real-World Examples

#### E-Commerce Product Search

```typescript
interface Product {
  id: number
  name: string
  price: number
  category: string
  rating: number
  inStock: boolean
  tags: string[]
}

// Products: electronics, $50-200, rated 4+, in stock
const affordableQualityElectronics = where({
  category: eq('electronics'),
  price: between(50, 200),
  rating: gte(4.0),
  inStock: eq(true)
})

R.filter(products, affordableQualityElectronics)

// With custom predicate for tags
const gamingAccessories = where({
  category: eq('electronics'),
  tags: (tags: string[]) => tags.includes('gaming'),
  inStock: eq(true)
})
```

#### User Permissions

```typescript
interface User {
  id: string
  role: 'user' | 'admin' | 'moderator'
  verified: boolean
  accountAgeDays: number
  premiumTier: number
}

// Verified admins
const verifiedAdmin = where({
  role: eq('admin'),
  verified: eq(true)
})

// Senior moderators (90+ days, verified)
const seniorModerator = where({
  role: eq('moderator'),
  verified: eq(true),
  accountAgeDays: gte(90)
})

// Premium users
const premiumUser = where({
  verified: eq(true),
  premiumTier: gt(0)
})
```

#### GitHub-Style Issue Filtering

```typescript
interface Issue {
  id: number
  state: 'open' | 'closed'
  labels: string[]
  assignee: string | null
  comments: number
}

// Open bugs assigned to someone
const openAssignedBugs = where({
  state: eq('open'),
  labels: (labels: string[]) => labels.includes('bug'),
  assignee: isDefined
})

// High-priority issues needing attention
const criticalIssues = where({
  state: eq('open'),
  labels: (labels: string[]) =>
    labels.includes('critical') || labels.includes('security'),
  comments: lt(2)  // Few comments = needs attention
})
```

#### Order Management

```typescript
interface Order {
  id: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  amount: number
  customerId: string
  createdAt: Date
  isPriority: boolean
}

// Active high-value orders
const activeHighValue = where({
  status: oneOf(['pending', 'processing']),
  amount: gte(1000),
  isPriority: eq(true)
})

// Recent large orders
const recentLargeOrders = where({
  amount: gt(5000),
  createdAt: (date: Date) =>
    date.getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
})
```

### Nested Objects

```typescript
interface Order {
  id: string
  amount: number
  customer: {
    name: string
    country: string
    verified: boolean
  }
}

// For nested properties, use custom predicates
const usVerifiedOrders = where({
  amount: gt(100),
  customer: (customer) => customer.country === 'US' && customer.verified
})

// Or destructure in the predicate
const usVerifiedOrders2 = where({
  amount: gt(100),
  customer: where({
    country: eq('US'),
    verified: eq(true)
  })
})
```

---

## oneOf() - Value in List

### Signature

```typescript
const oneOf = <T>(values: readonly T[]): Predicate<T>
```

Check if a value is in a list. Uses strict equality (`===`).

### Basic Usage

```typescript
import { oneOf } from 'receta/predicate'

const numbers = [1, 2, 3, 4, 5]
R.filter(numbers, oneOf([1, 3, 5]))
// => [1, 3, 5]

const validRoles = oneOf(['admin', 'moderator', 'owner'])
R.filter(users, (u) => validRoles(u.role))
```

### Real-World Examples

#### Multi-Status Filtering

```typescript
// Active order statuses
const activeStatuses = oneOf(['pending', 'processing', 'shipped'])

R.filter(orders, (o) => activeStatuses(o.status))

// With where()
const activeOrders = where({
  status: oneOf(['pending', 'processing', 'shipped'])
})
```

#### Allowed File Extensions

```typescript
const allowedExtensions = oneOf(['.jpg', '.png', '.gif', '.webp'])

const imageFiles = R.filter(
  files,
  (f) => allowedExtensions(f.extension)
)
```

#### Country Whitelist

```typescript
interface User {
  country: string
  email: string
}

const supportedCountries = oneOf(['US', 'CA', 'UK', 'AU', 'DE', 'FR'])

const eligibleUsers = R.filter(users, (u) => supportedCountries(u.country))
```

#### Role-Based Access

```typescript
const staffRoles = oneOf(['admin', 'moderator', 'manager'])
const canAccessDashboard = (user: User) => staffRoles(user.role)

if (canAccessDashboard(currentUser)) {
  // Show admin dashboard
}
```

---

## prop() - Single Property Check

### Signature

```typescript
const prop = <T, K extends keyof T>(
  key: K,
  predicate: Predicate<T[K]>
): Predicate<T>
```

Test a specific property of an object.

### Basic Usage

```typescript
import { prop, gt } from 'receta/predicate'

const users = [
  { name: 'Alice', age: 25 },
  { name: 'Bob', age: 17 },
  { name: 'Charlie', age: 30 }
]

R.filter(users, prop('age', gt(18)))
// => Alice and Charlie
```

### Real-World Examples

#### Pipeline Filtering

```typescript
// Clean pipeline with prop()
R.pipe(
  users,
  R.filter(prop('verified', eq(true))),
  R.filter(prop('age', gte(18))),
  R.filter(prop('country', oneOf(['US', 'CA'])))
)

// Vs inline (less readable)
R.pipe(
  users,
  R.filter((u) => u.verified === true),
  R.filter((u) => u.age >= 18),
  R.filter((u) => ['US', 'CA'].includes(u.country))
)
```

#### Nested Property Access

```typescript
interface Order {
  id: string
  user: {
    name: string
    country: string
  }
}

// Filter by nested property
const usOrders = R.filter(
  orders,
  (o) => prop('country', eq('US'))(o.user)
)
```

---

## matchesShape() - Exact Shape Match

### Signature

```typescript
const matchesShape = <T extends Record<string, unknown>>(
  pattern: Partial<T>
): Predicate<T>
```

Check if an object has specific property values (strict equality).

### Basic Usage

```typescript
import { matchesShape } from 'receta/predicate'

const events = [
  { type: 'click', x: 100, y: 200 },
  { type: 'keypress', key: 'Enter' },
  { type: 'click', x: 150, y: 250 }
]

R.filter(events, matchesShape({ type: 'click' }))
// => click events
```

### Real-World Examples

#### API Response Filtering

```typescript
type ApiResponse =
  | { status: 'success'; data: unknown }
  | { status: 'error'; message: string }

const responses: ApiResponse[] = [
  { status: 'success', data: { id: 1 } },
  { status: 'error', message: 'Not found' },
  { status: 'success', data: { id: 2 } }
]

const successResponses = R.filter(
  responses,
  matchesShape({ status: 'success' })
)
```

#### Event Pattern Matching

```typescript
type Event =
  | { type: 'user.created'; userId: string }
  | { type: 'user.updated'; userId: string }
  | { type: 'order.placed'; orderId: string }

const userEvents = R.filter(
  events,
  or(
    matchesShape({ type: 'user.created' }),
    matchesShape({ type: 'user.updated' })
  )
)
```

---

## hasProperty() - Property Existence

### Signature

```typescript
const hasProperty = <T extends Record<string, unknown>, K extends string>(
  key: K
): Predicate<T>
```

Check if an object has a specific property (regardless of value).

### Basic Usage

```typescript
import { hasProperty } from 'receta/predicate'

const objects = [
  { name: 'Alice', age: 25 },
  { name: 'Bob' },
  { name: 'Charlie', age: 30 }
]

R.filter(objects, hasProperty('age'))
// => [{ name: 'Alice', age: 25 }, { name: 'Charlie', age: 30 }]
```

### Real-World Examples

#### Optional Fields

```typescript
interface User {
  id: string
  email?: string
  phone?: string
}

// Users with email
const hasEmail = R.filter(users, hasProperty('email'))

// Users with either email or phone
const hasContact = R.filter(
  users,
  or(hasProperty('email'), hasProperty('phone'))
)
```

---

## by() - Test Derived Values

### Signature

```typescript
const by = <T, U>(
  selector: (value: T) => U,
  predicate: Predicate<U>
): Predicate<T>
```

Extract a value and test it with a predicate. Perfect for derived/computed values.

### Basic Usage

```typescript
import { by, gt } from 'receta/predicate'

const users = [
  { name: 'Alice', tags: ['admin', 'user'] },
  { name: 'Bob', tags: ['user'] },
  { name: 'Charlie', tags: ['admin', 'moderator', 'user'] }
]

// Users with multiple tags
R.filter(users, by((u) => u.tags.length, gt(1)))
// => Alice and Charlie
```

### Real-World Examples

#### Computed Values

```typescript
interface Product {
  name: string
  price: number
  discount: number  // 0.0 to 1.0
}

// Final price > $80 after discount
const expensiveAfterDiscount = by(
  (p: Product) => p.price * (1 - p.discount),
  gt(80)
)

R.filter(products, expensiveAfterDiscount)
```

#### String Length

```typescript
// Long usernames (> 10 characters)
const longUsername = by(
  (u: User) => u.username.length,
  gt(10)
)

// Short descriptions
const shortDescription = by(
  (p: Product) => p.description.length,
  lt(50)
)
```

#### Array Length

```typescript
// Users with many followers
const popular = by(
  (u: User) => u.followers.length,
  gte(1000)
)

// Products with reviews
const hasReviews = by(
  (p: Product) => p.reviews.length,
  gt(0)
)
```

#### Date Calculations

```typescript
interface User {
  createdAt: Date
  lastLoginAt: Date
}

// Account age in days
const accountAgeDays = (u: User) =>
  Math.floor((Date.now() - u.createdAt.getTime()) / (24 * 60 * 60 * 1000))

// Veteran users (account > 365 days)
const veteranUsers = by(accountAgeDays, gt(365))

// Inactive users (no login in 90 days)
const daysSinceLogin = (u: User) =>
  Math.floor((Date.now() - u.lastLoginAt.getTime()) / (24 * 60 * 60 * 1000))

const inactiveUsers = by(daysSinceLogin, gt(90))
```

---

## satisfies() - Readable Custom Predicates

### Signature

```typescript
const satisfies = <T>(predicate: Predicate<T>): Predicate<T>
```

Identity function for readability. Makes complex inline predicates clearer.

### Basic Usage

```typescript
import { satisfies } from 'receta/predicate'

// Without satisfies (unclear intent)
R.filter(numbers, (n) => n % 2 === 0 && n > 10)

// With satisfies (clear intent)
R.filter(numbers, satisfies((n) => n % 2 === 0 && n > 10))
```

### Real-World Examples

```typescript
// Complex validation
const validUser = satisfies((u: User) =>
  u.email.includes('@') &&
  u.age >= 18 &&
  u.termsAccepted
)

// Custom business logic
const eligibleForDiscount = satisfies((order: Order) => {
  const isFirstOrder = order.customer.orderCount === 0
  const isHighValue = order.amount > 100
  return isFirstOrder && isHighValue
})
```

---

## Combining Builders

### Complex Queries

```typescript
// E-commerce: Premium electronics on sale, highly rated
const dealOfTheDay = where({
  category: eq('electronics'),
  price: and(gt(100), lt(500)),
  rating: gte(4.5),
  inStock: eq(true),
  tags: by(
    (tags: string[]) => tags,
    (tags) => tags.includes('sale') && tags.includes('featured')
  )
})

// User access: Verified staff or senior community members
const canModerate = or(
  where({
    role: oneOf(['admin', 'moderator']),
    verified: eq(true)
  }),
  where({
    role: eq('user'),
    verified: eq(true),
    reputation: gt(1000),
    accountAgeDays: by((u: User) => u.joinedDays, gt(180))
  })
)
```

---

## Pattern: Reusable Domain Predicates

Create a predicates module for your domain:

```typescript
// predicates/user.ts
import { where, eq, gt, oneOf, by } from 'receta/predicate'

export const isAdult = where({ age: gt(18) })
export const isVerified = where({ verified: eq(true) })
export const isStaff = where({ role: oneOf(['admin', 'moderator']) })
export const isActive = where({ status: eq('active'), verified: eq(true) })
export const isPremium = where({ tier: gt(0) })
export const isVeteran = by((u: User) => u.accountAgeDays, gt(365))

// Compose them
export const canAccessPremiumContent = or(isPremium, isStaff)
export const canModerate = and(isStaff, isVerified)
```

Usage:

```typescript
import * as UserPreds from './predicates/user'

const activeStaff = R.filter(users, UserPreds.isActive)
const moderators = R.filter(users, UserPreds.canModerate)
```

---

## Next Steps

- **[Type Guards](./04-guards.md)** - Type-safe predicates with narrowing
- **[Common Patterns](./05-patterns.md)** - Complete real-world recipes
- **[API Reference](./07-api-reference.md)** - Full API documentation

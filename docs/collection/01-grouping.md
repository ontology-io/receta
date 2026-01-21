# Hierarchical Grouping

Deep dive into `nest()` and `groupByPath()` for organizing data hierarchically.

## Overview

Hierarchical grouping creates multi-level nested structures from flat arrays. Essential for:
- Comment threads (user → post → replies)
- Analytics dashboards (region → category → metrics)
- File systems (folder → subfolder → files)
- Organization charts (department → team → members)

## `nest()` - Multi-Level Grouping

Groups items by multiple keys sequentially, creating nested maps.

### Basic Usage

```typescript
import { nest } from 'receta/collection'

const comments = [
  { userId: 1, postId: 10, text: 'Great!' },
  { userId: 1, postId: 10, text: 'Thanks!' },
  { userId: 1, postId: 20, text: 'Nice' },
  { userId: 2, postId: 10, text: 'Cool' }
]

// Group by userId, then by postId
const nested = nest(comments, ['userId', 'postId'])

// Result:
// {
//   1: {
//     10: [{ userId: 1, postId: 10, text: 'Great!' }, { userId: 1, postId: 10, text: 'Thanks!' }],
//     20: [{ userId: 1, postId: 20, text: 'Nice' }]
//   },
//   2: {
//     10: [{ userId: 2, postId: 10, text: 'Cool' }]
//   }
// }
```

### With Function Selectors

Use functions for dynamic grouping:

```typescript
const users = [
  { name: 'Alice', age: 25, country: 'US' },
  { name: 'Bob', age: 35, country: 'US' },
  { name: 'Charlie', age: 25, country: 'UK' }
]

// Group by age range, then by country
const grouped = nest(users, [
  (u) => u.age >= 30 ? 'senior' : 'junior',
  'country'
])

// Result:
// {
//   junior: {
//     US: [{ name: 'Alice', age: 25, country: 'US' }],
//     UK: [{ name: 'Charlie', age: 25, country: 'UK' }]
//   },
//   senior: {
//     US: [{ name: 'Bob', age: 35, country: 'US' }]
//   }
// }
```

### Real-World: GitHub Event Feed

```typescript
interface GitHubEvent {
  id: string
  repo: string
  type: 'push' | 'pr' | 'issue'
  user: string
  timestamp: string
}

const events: GitHubEvent[] = [
  { id: '1', repo: 'receta', type: 'push', user: 'alice', timestamp: '2024-01-01' },
  { id: '2', repo: 'receta', type: 'pr', user: 'bob', timestamp: '2024-01-02' },
  { id: '3', repo: 'remeda', type: 'push', user: 'alice', timestamp: '2024-01-03' }
]

// Group by repo → type → user for activity dashboard
const activityFeed = nest(events, ['repo', 'type', 'user'])

// Access: activityFeed.receta.push.alice => [event1]
```

### Real-World: E-commerce Categories

```typescript
interface Product {
  id: string
  category: string
  subcategory: string
  brand: string
  price: number
}

const products: Product[] = [
  { id: '1', category: 'electronics', subcategory: 'laptops', brand: 'apple', price: 1299 },
  { id: '2', category: 'electronics', subcategory: 'laptops', brand: 'dell', price: 899 },
  { id: '3', category: 'electronics', subcategory: 'phones', brand: 'apple', price: 999 }
]

// Build product catalog hierarchy
const catalog = nest(products, ['category', 'subcategory', 'brand'])

// Navigation: catalog.electronics.laptops.apple => [product1]
```

### Data-Last in Pipe

```typescript
import { pipe } from 'remeda'
import * as R from 'remeda'

const activeUserComments = pipe(
  comments,
  R.filter(c => c.active),
  nest(['userId', 'postId'])
)
```

## `groupByPath()` - Group by Nested Properties

Groups items by values at nested object paths.

### Basic Usage

```typescript
import { groupByPath } from 'receta/collection'

const users = [
  { name: 'Alice', profile: { role: 'admin' } },
  { name: 'Bob', profile: { role: 'user' } },
  { name: 'Charlie', profile: { role: 'admin' } }
]

// Group by nested path
const byRole = groupByPath(users, 'profile.role')

// Result:
// {
//   admin: [
//     { name: 'Alice', profile: { role: 'admin' } },
//     { name: 'Charlie', profile: { role: 'admin' } }
//   ],
//   user: [{ name: 'Bob', profile: { role: 'user' } }]
// }
```

### Real-World: Stripe Charges by Customer Email

```typescript
interface Charge {
  id: string
  amount: number
  customer: {
    id: string
    email: string
  }
  status: 'succeeded' | 'pending' | 'failed'
}

const charges: Charge[] = [
  { id: 'ch_1', amount: 1000, customer: { id: 'cus_1', email: 'alice@example.com' }, status: 'succeeded' },
  { id: 'ch_2', amount: 500, customer: { id: 'cus_1', email: 'alice@example.com' }, status: 'succeeded' },
  { id: 'ch_3', amount: 2000, customer: { id: 'cus_2', email: 'bob@example.com' }, status: 'pending' }
]

// Group charges by customer email
const chargesByCustomer = groupByPath(charges, 'customer.email')

// Calculate total per customer
Object.entries(chargesByCustomer).map(([email, charges]) => ({
  email,
  total: charges.reduce((sum, c) => sum + c.amount, 0)
}))
```

### Real-World: Order Status Dashboard

```typescript
interface Order {
  id: string
  items: string[]
  payment: {
    method: string
    status: 'paid' | 'pending' | 'failed'
  }
  shipping: {
    status: 'delivered' | 'in_transit' | 'pending'
  }
}

const orders: Order[] = [
  { id: '1', items: ['laptop'], payment: { method: 'card', status: 'paid' }, shipping: { status: 'delivered' } },
  { id: '2', items: ['mouse'], payment: { method: 'paypal', status: 'pending' }, shipping: { status: 'pending' } }
]

// Group by payment status
const byPaymentStatus = groupByPath(orders, 'payment.status')

// Group by shipping status
const byShippingStatus = groupByPath(orders, 'shipping.status')
```

### Handling Missing Paths

```typescript
const items = [
  { id: 1, metadata: { tags: ['urgent'] } },
  { id: 2, metadata: null }, // null metadata
  { id: 3 } // missing metadata
]

const grouped = groupByPath(items, 'metadata.tags')

// Result:
// {
//   urgent: [{ id: 1, metadata: { tags: ['urgent'] } }],
//   undefined: [{ id: 2, metadata: null }, { id: 3 }]
// }
```

## Combining Both Functions

Use `nest()` for multi-level grouping, then `groupByPath()` for nested properties:

```typescript
const events = [
  { id: '1', user: { role: 'admin' }, repo: 'foo', type: 'push' },
  { id: '2', user: { role: 'user' }, repo: 'foo', type: 'pr' },
  { id: '3', user: { role: 'admin' }, repo: 'bar', type: 'push' }
]

// First group by repo and type
const byRepoAndType = nest(events, ['repo', 'type'])

// Then group each category by user role
const withRoles = R.mapValues(byRepoAndType, byType =>
  R.mapValues(byType, events =>
    groupByPath(events, 'user.role')
  )
)

// Result:
// {
//   foo: {
//     push: { admin: [event1] },
//     pr: { user: [event2] }
//   },
//   bar: {
//     push: { admin: [event3] }
//   }
// }
```

## When to Use Which?

| Use Case | Function | Example |
|----------|----------|---------|
| Multiple top-level keys | `nest()` | Group by [category, priority, status] |
| Nested object property | `groupByPath()` | Group by 'user.role' |
| Dynamic grouping | `nest()` with functions | Group by age ranges |
| Single nested path | `groupByPath()` | Group by 'metadata.category' |
| Deep hierarchy (3+ levels) | `nest()` | Comments by [user, post, parent] |

## Performance Considerations

### Time Complexity

- `nest()`: O(n × k) where n = items, k = number of keys
- `groupByPath()`: O(n) single pass through items

### Optimization Tips

```typescript
// ❌ Avoid: Re-grouping on every access
function getComments(userId: number, postId: number) {
  return nest(comments, ['userId', 'postId'])[userId]?.[postId]
}

// ✅ Better: Group once, reuse
const commentsByUserAndPost = nest(comments, ['userId', 'postId'])

function getComments(userId: number, postId: number) {
  return commentsByUserAndPost[userId]?.[postId] ?? []
}
```

## Common Patterns

### Pattern 1: Fallback to Empty Array

```typescript
const comments = commentsByUserAndPost[userId]?.[postId] ?? []
```

### Pattern 2: Nested Access with Default

```typescript
const getNestedValue = <T>(
  nested: NestedMap<T>,
  keys: (string | number)[]
): T[] => {
  let current: any = nested
  for (const key of keys) {
    current = current?.[key]
    if (!current) return []
  }
  return Array.isArray(current) ? current : []
}

const comments = getNestedValue(grouped, [1, 10])
```

### Pattern 3: Transform After Grouping

```typescript
// Group, then aggregate
const avgPriceByCategory = pipe(
  products,
  nest(['category', 'subcategory']),
  mapValues(bySubcat =>
    mapValues(bySubcat, items => ({
      count: items.length,
      avgPrice: items.reduce((sum, p) => sum + p.price, 0) / items.length
    }))
  )
)
```

## TypeScript Tips

### Type Safety

```typescript
// TypeScript infers the nested structure
const grouped = nest(items, ['category', 'priority'])
// grouped: NestedMap<Item>

// Access is type-safe
const electronics = grouped.electronics // NestedMap<Item> | Item[] | undefined
```

### Custom Type Guards

```typescript
function isItemArray<T>(value: NestedMap<T> | readonly T[]): value is readonly T[] {
  return Array.isArray(value)
}

const value = grouped.electronics
if (isItemArray(value)) {
  // value is readonly T[]
  value.forEach(item => console.log(item))
}
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { nest, groupByPath } from 'receta/collection'

describe('Grouping operations', () => {
  it('creates nested structure', () => {
    const result = nest(items, ['cat', 'pri'])
    expect(result.electronics.high).toBeDefined()
    expect(result.electronics.high.length).toBeGreaterThan(0)
  })

  it('groups by nested path', () => {
    const result = groupByPath(users, 'profile.role')
    expect(result.admin).toBeDefined()
    expect(result.admin[0].profile.role).toBe('admin')
  })
})
```

## Next Steps

- **[Change Detection](./02-change-detection.md)** - Detect changes with `diff()`
- **[Pagination](./03-pagination.md)** - Paginate grouped results
- **[Patterns](./06-patterns.md)** - Production recipes

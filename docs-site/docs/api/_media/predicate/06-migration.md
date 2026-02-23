# Migration Guide: From Inline Filters to Predicates

> Step-by-step guide to refactoring existing code to use composable predicates.

## Why Migrate?

### Before: Inline Filters

```typescript
// ❌ Problems:
const activeAdults = users.filter(u => u.age >= 18 && u.active === true)
const activeStaff = users.filter(u => u.age >= 18 && u.active === true && (u.role === 'admin' || u.role === 'moderator'))
const premiumUsers = users.filter(u => u.age >= 18 && u.active === true && u.premium)
```

**Issues:**
- 🔴 **Duplication**: "age >= 18 && active === true" repeated 3 times
- 🔴 **Not reusable**: Can't extract or compose logic
- 🔴 **Hard to test**: Logic buried in larger functions
- 🔴 **Not discoverable**: No central place for filters
- 🔴 **Type unsafe**: No narrowing for mixed arrays

### After: Predicates

```typescript
// ✅ Benefits:
import { where, gt, eq, oneOf } from 'receta/predicate'

const isActiveAdult = where({ age: gt(18), active: eq(true) })
const isStaff = where({ role: oneOf(['admin', 'moderator']) })

const activeAdults = R.filter(users, isActiveAdult)
const activeStaff = R.filter(users, and(isActiveAdult, isStaff))
const premiumUsers = R.filter(users, and(isActiveAdult, where({ premium: eq(true) })))
```

**Wins:**
- ✅ **No duplication**: Define once, use everywhere
- ✅ **Composable**: Build complex from simple
- ✅ **Testable**: Test predicates in isolation
- ✅ **Discoverable**: All filters in one module
- ✅ **Type safe**: Type guards narrow types

---

## Migration Strategy

### Phase 1: Identify Patterns

Look for:
1. **Repeated conditions** across multiple filters
2. **Complex boolean logic** (multiple && or ||)
3. **Type checks** (typeof, instanceof)
4. **Value comparisons** (>, <, ===, includes())
5. **Object property checks** (multiple property tests)

### Phase 2: Extract Simple Predicates

Start with simple, reusable pieces.

### Phase 3: Compose Complex Predicates

Combine simple predicates into complex ones.

### Phase 4: Refactor Call Sites

Replace inline filters with named predicates.

---

## Step-by-Step Examples

### Example 1: Simple Numeric Filter

#### Before

```typescript
const expensiveProducts = products.filter(p => p.price > 100)
const budgetProducts = products.filter(p => p.price <= 50)
const midRangeProducts = products.filter(p => p.price > 50 && p.price <= 200)
```

#### Step 1: Identify Pattern

- Repeated: `p.price` comparisons
- Pattern: Numeric threshold checks

#### Step 2: Extract Predicates

```typescript
import { gt, lte, between } from 'receta/predicate'

const isExpensive = gt(100)
const isBudget = lte(50)
const isMidRange = between(50, 200)
```

#### Step 3: Refactor

```typescript
const expensiveProducts = R.filter(products, (p) => isExpensive(p.price))
const budgetProducts = R.filter(products, (p) => isBudget(p.price))
const midRangeProducts = R.filter(products, (p) => isMidRange(p.price))

// Or with where():
const expensiveProducts2 = R.filter(products, where({ price: gt(100) }))
const budgetProducts2 = R.filter(products, where({ price: lte(50) }))
const midRangeProducts2 = R.filter(products, where({ price: between(50, 200) }))
```

---

### Example 2: Status Filtering

#### Before

```typescript
const activeOrders = orders.filter(o =>
  o.status === 'pending' || o.status === 'processing' || o.status === 'shipped'
)
const completedOrders = orders.filter(o =>
  o.status === 'delivered' || o.status === 'cancelled'
)
```

#### Step 1: Extract

```typescript
import { oneOf } from 'receta/predicate'

const isActiveStatus = oneOf(['pending', 'processing', 'shipped'])
const isCompletedStatus = oneOf(['delivered', 'cancelled'])
```

#### Step 2: Refactor

```typescript
const activeOrders = R.filter(orders, (o) => isActiveStatus(o.status))
const completedOrders = R.filter(orders, (o) => isCompletedStatus(o.status))

// Or with where():
const activeOrders2 = R.filter(orders, where({ status: isActiveStatus }))
const completedOrders2 = R.filter(orders, where({ status: isCompletedStatus }))
```

---

### Example 3: Multi-Field Object Filter

#### Before

```typescript
const eligibleUsers = users.filter(u =>
  u.age >= 18 &&
  u.verified === true &&
  u.country === 'US' &&
  (u.role === 'admin' || u.role === 'moderator')
)
```

#### Step 1: Break Down

- Age check: `u.age >= 18`
- Verified: `u.verified === true`
- Country: `u.country === 'US'`
- Role: `u.role === 'admin' || u.role === 'moderator'`

#### Step 2: Extract

```typescript
import { where, gte, eq, oneOf } from 'receta/predicate'

const isEligible = where({
  age: gte(18),
  verified: eq(true),
  country: eq('US'),
  role: oneOf(['admin', 'moderator'])
})
```

#### Step 3: Refactor

```typescript
const eligibleUsers = R.filter(users, isEligible)
```

---

### Example 4: Type Checking

#### Before

```typescript
const data: unknown[] = [/* mixed types */]

const strings = data.filter(x => typeof x === 'string')
const numbers = data.filter(x => typeof x === 'number' && !isNaN(x))
const validObjects = data.filter(x =>
  typeof x === 'object' && x !== null && !Array.isArray(x)
)
```

#### Step 1: Use Type Guards

```typescript
import { isString, isNumber, isObject } from 'receta/predicate'

const strings = R.filter(data, isString) // Type: string[]
const numbers = R.filter(data, isNumber) // Type: number[]
const validObjects = R.filter(data, isObject) // Type: Record<string, unknown>[]
```

**Bonus**: TypeScript automatically narrows types!

---

### Example 5: Complex Boolean Logic

#### Before

```typescript
const canEdit = users.filter(u =>
  u.id === post.authorId ||
  (u.role === 'admin' && u.verified) ||
  (u.role === 'moderator' && u.reputation > 1000)
)
```

#### Step 1: Break Into Pieces

```typescript
import { where, eq, and, or, gt } from 'receta/predicate'

const isAuthor = where({ id: eq(post.authorId) })
const isVerifiedAdmin = where({ role: eq('admin'), verified: eq(true) })
const isSeniorMod = where({ role: eq('moderator'), reputation: gt(1000) })
```

#### Step 2: Compose

```typescript
const canEditPost = or(isAuthor, isVerifiedAdmin, isSeniorMod)
```

#### Step 3: Refactor

```typescript
const canEdit = R.filter(users, canEditPost)
```

---

### Example 6: Nested Property Access

#### Before

```typescript
const usOrders = orders.filter(o => o.customer.country === 'US')
const verifiedOrders = orders.filter(o => o.customer.verified === true)
const usVerifiedOrders = orders.filter(o =>
  o.customer.country === 'US' && o.customer.verified === true
)
```

#### Step 1: Extract

```typescript
import { where, eq } from 'receta/predicate'

const hasUSCustomer = where({
  customer: where({
    country: eq('US')
  })
})

const hasVerifiedCustomer = where({
  customer: where({
    verified: eq(true)
  })
})

const hasUSVerifiedCustomer = where({
  customer: where({
    country: eq('US'),
    verified: eq(true)
  })
})
```

#### Step 2: Refactor

```typescript
const usOrders = R.filter(orders, hasUSCustomer)
const verifiedOrders = R.filter(orders, hasVerifiedCustomer)
const usVerifiedOrders = R.filter(orders, hasUSVerifiedCustomer)
```

---

### Example 7: Derived Values

#### Before

```typescript
const popularUsers = users.filter(u => u.followers.length > 1000)
const recentPosts = posts.filter(p => {
  const daysSince = (Date.now() - p.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  return daysSince <= 7
})
```

#### Step 1: Use `by()`

```typescript
import { by, gt, lte } from 'receta/predicate'

const isPopular = by((u: User) => u.followers.length, gt(1000))

const isRecent = by((p: Post) => {
  const daysSince = (Date.now() - p.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  return daysSince
}, lte(7))
```

#### Step 2: Refactor

```typescript
const popularUsers = R.filter(users, isPopular)
const recentPosts = R.filter(posts, isRecent)
```

---

## Incremental Migration

You don't need to refactor everything at once!

### Strategy 1: Start with Duplicates

Find the most duplicated filter logic and extract it first.

```typescript
// 1. Find duplicates
// ❌ Repeated everywhere:
users.filter(u => u.age >= 18 && u.verified)

// 2. Extract
const isVerifiedAdult = where({ age: gte(18), verified: eq(true) })

// 3. Gradually replace call sites
R.filter(users, isVerifiedAdult)
```

### Strategy 2: Create a Predicates Module

```typescript
// predicates/user.ts
export const isAdult = where({ age: gte(18) })
export const isVerified = where({ verified: eq(true) })
export const isActive = where({ status: eq('active') })
export const isStaff = where({ role: oneOf(['admin', 'moderator']) })

// Compose
export const isVerifiedAdult = and(isAdult, isVerified)
export const isActiveStaff = and(isActive, isStaff)
```

```typescript
// Usage
import * as UserPred from './predicates/user'

R.filter(users, UserPred.isVerifiedAdult)
R.filter(users, UserPred.isActiveStaff)
```

### Strategy 3: Coexist During Migration

Old and new can live side-by-side:

```typescript
// ✅ Keep existing code working
const oldFilter = users.filter(u => u.age >= 18)

// ✅ New code uses predicates
const newFilter = R.filter(users, where({ age: gte(18) }))
```

---

## Common Pitfalls

### Pitfall 1: Over-Abstraction

```typescript
// ❌ Too granular
const isAgeGreaterThan18 = gt(18)
const hasAgeGreaterThan18 = where({ age: isAgeGreaterThan18 })

// ✅ Right level
const isAdult = where({ age: gt(18) })
```

**Rule**: Abstract when logic is **reused**, not just for the sake of it.

### Pitfall 2: Forgetting Short-Circuit Order

```typescript
// ❌ Expensive check first
and(
  complexDatabaseQuery,  // Slow!
  simplePropertyCheck    // Fast
)

// ✅ Fast check first
and(
  simplePropertyCheck,
  complexDatabaseQuery   // Only runs if first passes
)
```

### Pitfall 3: Not Using Built-Ins

```typescript
// ❌ Reinventing the wheel
const notEmpty = (s: string) => s.length > 0

// ✅ Use built-in
import { isNotEmpty } from 'receta/predicate'
```

### Pitfall 4: Inline Predicates Everywhere

```typescript
// ❌ Still inline, just with predicate functions
R.filter(users, where({ age: gt(18), verified: eq(true) }))
R.filter(users, where({ age: gt(18), verified: eq(true) }))
R.filter(users, where({ age: gt(18), verified: eq(true) }))

// ✅ Extract if reused
const isVerifiedAdult = where({ age: gt(18), verified: eq(true) })
R.filter(users, isVerifiedAdult)
R.filter(users, isVerifiedAdult)
R.filter(users, isVerifiedAdult)
```

---

## Testing After Migration

### Before (Hard to Test)

```typescript
// Can't test filter logic in isolation
const getActiveUsers = (users: User[]) =>
  users.filter(u => u.age >= 18 && u.verified && u.status === 'active')
```

### After (Easy to Test)

```typescript
// Test predicates independently
describe('User predicates', () => {
  it('isActiveUser filters correctly', () => {
    const user1 = { age: 25, verified: true, status: 'active' }
    const user2 = { age: 17, verified: true, status: 'active' }
    const user3 = { age: 25, verified: false, status: 'active' }

    expect(isActiveUser(user1)).toBe(true)
    expect(isActiveUser(user2)).toBe(false)  // Too young
    expect(isActiveUser(user3)).toBe(false)  // Not verified
  })
})

// Test composition
describe('User filtering', () => {
  it('getActiveUsers uses isActiveUser predicate', () => {
    const users = [/* ... */]
    const result = R.filter(users, isActiveUser)
    expect(result).toHaveLength(2)
  })
})
```

---

## Checklist

Use this checklist when migrating code:

- [ ] Identify duplicated filter logic
- [ ] Extract simple comparison predicates (gt, eq, oneOf, etc.)
- [ ] Create object predicates with where() for multi-field checks
- [ ] Use type guards (isString, isNumber, etc.) for type checks
- [ ] Compose complex predicates with and/or/not
- [ ] Create a predicates module for domain logic
- [ ] Write tests for extracted predicates
- [ ] Update call sites to use new predicates
- [ ] Remove old inline filters
- [ ] Document predicate meanings

---

## Migration Examples by Domain

### E-Commerce

```typescript
// Before
products.filter(p => p.price > 100 && p.inStock && p.rating >= 4.0)

// After
const qualityExpensive = where({
  price: gt(100),
  inStock: eq(true),
  rating: gte(4.0)
})
```

### User Management

```typescript
// Before
users.filter(u => (u.role === 'admin' || u.role === 'mod') && u.verified)

// After
const isVerifiedStaff = where({
  role: oneOf(['admin', 'mod']),
  verified: eq(true)
})
```

### API Filtering

```typescript
// Before
issues.filter(i => i.state === 'open' && i.labels.includes('bug') && i.assignee !== null)

// After
const openAssignedBugs = where({
  state: eq('open'),
  labels: (labels: string[]) => labels.includes('bug'),
  assignee: isDefined
})
```

---

## Next Steps

- **[API Reference](./07-api-reference.md)** - Complete function reference
- **[Common Patterns](./05-patterns.md)** - Real-world examples for inspiration
- **[README](./README.md)** - Documentation overview

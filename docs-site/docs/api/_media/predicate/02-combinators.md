# Predicate Combinators

> Combine simple predicates into complex conditions using logical operators.

## Overview

| Combinator | Purpose | Example |
|------------|---------|---------|
| `and(...preds)` | All must be true | `and(gt(18), lt(65))` → 18 < age < 65 |
| `or(...preds)` | Any must be true | `or(eq('admin'), eq('owner'))` |
| `not(pred)` | Invert predicate | `not(isEmpty)` → isNotEmpty |
| `xor(...preds)` | Exactly one true | `xor(isPremium, isTrial)` |
| `always()` | Always true | Default/fallback case |
| `never()` | Always false | Filter out all |

**Key Properties:**
- ✅ **Short-circuit**: `and` stops on first false, `or` stops on first true
- ✅ **Type-safe**: Composable with type guards for narrowing
- ✅ **Pure**: No side effects, same input = same output
- ✅ **Nestable**: Combinators can be nested infinitely

---

## and() - Logical AND

### Signature

```typescript
const and = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Returns true only if **all** predicates return true. Short-circuits on first false.

### Basic Usage

```typescript
import * as R from 'remeda'
import { and, gt, lt } from 'receta/predicate'

// Age range: 18 ≤ age < 65
const workingAge = and(gt(18), lt(65))

const users = [
  { name: 'Teen', age: 16 },
  { name: 'Adult', age: 30 },
  { name: 'Senior', age: 70 }
]

R.filter(users, (u) => workingAge(u.age))
// => [{ name: 'Adult', age: 30 }]
```

### Real-World Examples

#### E-Commerce Product Filtering

```typescript
import { and, where, gt, eq, oneOf } from 'receta/predicate'

interface Product {
  id: number
  name: string
  price: number
  category: string
  inStock: boolean
  rating: number
}

// Available quality products under $200
const affordableQuality = where({
  price: and(gt(50), lt(200)),
  rating: gt(4.0),
  inStock: eq(true)
})

R.filter(products, affordableQuality)

// Electronics on sale that are in stock
const saleElectronics = and(
  where({ category: eq('electronics') }),
  where({ inStock: eq(true) }),
  where({ price: lt(100) })
)
```

#### User Permissions

```typescript
interface User {
  role: 'admin' | 'moderator' | 'user'
  verified: boolean
  accountAgeDays: number
  premiumTier: number
}

// Must be verified AND (admin OR experienced moderator)
const canAccessModPanel = and(
  where({ verified: eq(true) }),
  or(
    where({ role: eq('admin') }),
    and(
      where({ role: eq('moderator') }),
      where({ accountAgeDays: gt(90) })
    )
  )
)

if (canAccessModPanel(currentUser)) {
  // Grant access
}
```

#### API Query Filtering

```typescript
// GitHub Issues: Open bugs assigned to someone
const openAssignedBugs = where({
  state: eq('open'),
  assignee: isDefined,
  labels: (labels: string[]) => labels.includes('bug')
})

// With additional filters
const criticalBugs = and(
  openAssignedBugs,
  where({
    labels: (labels: string[]) => labels.includes('critical')
  })
)
```

### Short-Circuit Behavior

```typescript
import { and } from 'receta/predicate'

let expensiveCheckRan = false

const cheapCheck = (n: number) => n > 0
const expensiveCheck = (n: number) => {
  expensiveCheckRan = true
  // Expensive computation here
  return n % 2 === 0
}

const combined = and(cheapCheck, expensiveCheck)

combined(-5) // => false
console.log(expensiveCheckRan) // => false (never ran!)

combined(3) // => false
console.log(expensiveCheckRan) // => true (cheapCheck passed)
```

**Performance tip**: Put fast/cheap checks first!

```typescript
// ✅ Good: fast check first
and(
  eq('active'),         // Fast equality check
  complexValidation     // Expensive computation
)

// ❌ Bad: expensive check first
and(
  complexValidation,
  eq('active')
)
```

---

## or() - Logical OR

### Signature

```typescript
const or = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Returns true if **any** predicate returns true. Short-circuits on first true.

### Basic Usage

```typescript
import { or, eq } from 'receta/predicate'

// Match admin or owner
const isStaff = or(
  eq('admin'),
  eq('owner'),
  eq('moderator')
)

const users = [
  { role: 'admin' },
  { role: 'user' },
  { role: 'owner' }
]

R.filter(users, (u) => isStaff(u.role))
// => admin and owner
```

### Real-World Examples

#### Order Status Filtering

```typescript
interface Order {
  id: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  amount: number
}

// Active orders (not delivered or cancelled)
const isActive = or(
  eq('pending'),
  eq('processing'),
  eq('shipped')
)

R.filter(orders, (o) => isActive(o.status))

// Or using oneOf (cleaner for multiple values)
import { oneOf } from 'receta/predicate'
const isActive2 = oneOf(['pending', 'processing', 'shipped'])
```

#### Budget or Premium Tiers

```typescript
// Either budget (< $50) or premium (> $500)
const budgetOrPremium = or(
  lt(50),
  gt(500)
)

const products = [
  { name: 'Basic', price: 30 },
  { name: 'Standard', price: 100 },
  { name: 'Premium', price: 600 }
]

R.filter(products, (p) => budgetOrPremium(p.price))
// => Basic ($30) and Premium ($600)
```

#### Multi-Role Access Control

```typescript
// Can edit if: owner OR verified admin OR senior moderator
const canEdit = (user: User, resource: Resource) =>
  or(
    eq(resource.ownerId)(user.id),
    and(
      eq('admin')(user.role),
      eq(true)(user.verified)
    ),
    and(
      eq('moderator')(user.role),
      gt(1000)(user.reputation)
    )
  )(user)
```

---

## not() - Logical NOT

### Signature

```typescript
const not = <T>(predicate: Predicate<T>): Predicate<T>
```

Inverts a predicate's result.

### Basic Usage

```typescript
import { not, isEmpty } from 'receta/predicate'

const names = ['Alice', '', 'Bob', '', 'Charlie']

// Filter non-empty strings
R.filter(names, not(isEmpty))
// => ['Alice', 'Bob', 'Charlie']

// Or use the built-in isNotEmpty
import { isNotEmpty } from 'receta/predicate'
R.filter(names, isNotEmpty)
```

### Real-World Examples

#### Exclude Specific Values

```typescript
// All orders except cancelled
const orders = [
  { id: 1, status: 'pending' },
  { id: 2, status: 'cancelled' },
  { id: 3, status: 'shipped' }
]

R.filter(orders, (o) => not(eq('cancelled'))(o.status))
// Or use neq
R.filter(orders, (o) => neq('cancelled')(o.status))
```

#### Invert Complex Conditions

```typescript
// Users who are NOT (verified AND premium)
const notPremiumVerified = not(
  and(
    where({ verified: eq(true) }),
    where({ tier: eq('premium') })
  )
)

// Same as: unverified OR non-premium
const equivalent = or(
  where({ verified: eq(false) }),
  where({ tier: neq('premium') })
)
```

#### Filter Out Test Data

```typescript
interface User {
  email: string
  name: string
  isTestAccount: boolean
}

const realUsers = R.filter(
  users,
  not(where({ isTestAccount: eq(true) }))
)
```

---

## xor() - Exclusive OR

### Signature

```typescript
const xor = <T>(...predicates: Predicate<T>[]): Predicate<T>
```

Returns true if **exactly one** predicate returns true.

### Basic Usage

```typescript
import { xor, lt, gt } from 'receta/predicate'

// Numbers outside range 8-12 (< 8 OR > 12, but not both)
const outsideRange = xor(lt(8), gt(12))

const numbers = [1, 5, 10, 15, 20]
R.filter(numbers, outsideRange)
// => [1, 5, 15, 20]
// 10 is excluded (neither < 8 nor > 12)
```

### Real-World Examples

#### Subscription Tiers

```typescript
interface User {
  id: number
  premium: boolean
  trial: boolean
}

// Valid if premium XOR trial (one but not both)
const validSubscription = xor(
  where({ premium: eq(true) }),
  where({ trial: eq(true) })
)

const users = [
  { id: 1, premium: true, trial: false },   // ✅ valid
  { id: 2, premium: false, trial: true },   // ✅ valid
  { id: 3, premium: true, trial: true },    // ❌ invalid (both)
  { id: 4, premium: false, trial: false }   // ❌ invalid (neither)
]

R.filter(users, validSubscription)
// => users 1 and 2
```

#### Feature Flags

```typescript
// Product should have EITHER physical shipping OR digital download
const validProduct = xor(
  where({ requiresShipping: eq(true) }),
  where({ isDigital: eq(true) })
)
```

---

## always() / never() - Constant Predicates

### Signatures

```typescript
const always = <T>(): Predicate<T> // Always returns true
const never = <T>(): Predicate<T>  // Always returns false
```

### Use Cases

#### Conditional Filtering

```typescript
import { always } from 'receta/predicate'

const shouldFilter = config.env === 'production'

const predicate = shouldFilter
  ? where({ verified: eq(true) })
  : always<User>()

R.filter(users, predicate)
// In dev: returns all users
// In prod: returns only verified
```

#### Default Cases

```typescript
const getFilterPredicate = (role: string): Predicate<User> => {
  switch (role) {
    case 'admin': return where({ isAdmin: eq(true) })
    case 'moderator': return where({ isModerator: eq(true) })
    default: return always<User>() // No filtering
  }
}
```

#### Clear All / Keep All

```typescript
import { never } from 'receta/predicate'

// Debug mode: don't filter logs
const shouldShowLog = debugMode ? always<Log>() : (log) => log.level === 'error'

// Maintenance mode: block all requests
const canAccess = maintenanceMode ? never<Request>() : checkPermissions
```

---

## De Morgan's Laws

Combinators follow logical laws that allow refactoring:

```typescript
// not(and(A, B)) === or(not(A), not(B))
not(and(isAdult, isVerified))
// Equivalent to:
or(not(isAdult), not(isVerified))

// not(or(A, B)) === and(not(A), not(B))
not(or(isAdmin, isOwner))
// Equivalent to:
and(not(isAdmin), not(isOwner))
```

**Example:**

```typescript
// "Not (premium AND verified)" means "free OR unverified"
const notPremiumVerified = not(and(isPremium, isVerified))
const equivalent = or(not(isPremium), not(isVerified))

// Both work the same!
```

---

## Performance Tips

### 1. Order Matters in `and`

```typescript
// ✅ Fast checks first
and(
  eq('active'),        // O(1) equality
  isValidEmail,        // Regex check
  existsInDatabase     // Network call
)

// ❌ Slow checks first
and(
  existsInDatabase,
  isValidEmail,
  eq('active')
)
```

### 2. `or` with Likely Cases First

```typescript
// If 90% of users are regular users:
or(
  eq('user'),          // 90% chance - stops here
  eq('admin'),         // 8% chance
  eq('superadmin')     // 2% chance
)
```

### 3. Flatten Nested Same Operators

```typescript
// ❌ Unnecessary nesting
and(
  and(checkA, checkB),
  and(checkC, checkD)
)

// ✅ Flattened
and(checkA, checkB, checkC, checkD)
```

---

## Common Patterns

### Pattern 1: Range Validation

```typescript
// Value within range
const inRange = (min: number, max: number) =>
  and(gte(min), lte(max))

// Or use between()
import { between } from 'receta/predicate'
const inRange2 = between(18, 65) // Cleaner!
```

### Pattern 2: Multi-Status Check

```typescript
// Instead of multiple ORs:
or(eq('pending'), eq('processing'), eq('shipped'))

// Use oneOf:
oneOf(['pending', 'processing', 'shipped'])
```

### Pattern 3: Permission Check

```typescript
const hasPermission = (user: User, permission: string) =>
  or(
    eq('admin')(user.role),                    // Admins can do anything
    (u: User) => u.permissions.includes(permission) // Or has specific permission
  )(user)
```

### Pattern 4: Nested Object Filtering

```typescript
const validOrder = where({
  status: oneOf(['pending', 'processing']),
  amount: and(gt(0), lt(10000)),
  customer: where({
    verified: eq(true),
    country: oneOf(['US', 'CA', 'UK'])
  })
})
```

---

## Testing Combinators

```typescript
import { describe, it, expect } from 'vitest'
import { and, or, not, gt, lt } from 'receta/predicate'

describe('Predicate combinators', () => {
  it('and - all must pass', () => {
    const inRange = and(gt(10), lt(20))
    expect(inRange(15)).toBe(true)
    expect(inRange(5)).toBe(false)
    expect(inRange(25)).toBe(false)
  })

  it('or - any can pass', () => {
    const extremes = or(lt(10), gt(90))
    expect(extremes(5)).toBe(true)
    expect(extremes(95)).toBe(true)
    expect(extremes(50)).toBe(false)
  })

  it('not - inverts result', () => {
    const notTen = not(eq(10))
    expect(notTen(10)).toBe(false)
    expect(notTen(5)).toBe(true)
  })
})
```

---

## Next Steps

- **[Builders](./03-builders.md)** - Build structured predicates with `where()`, `oneOf()`, `prop()`
- **[Type Guards](./04-guards.md)** - Use type-narrowing predicates
- **[Common Patterns](./05-patterns.md)** - Real-world recipes

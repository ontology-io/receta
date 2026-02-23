# Predicate: Composable Filtering for TypeScript

> **TL;DR**: Predicates are reusable, type-safe functions for filtering, validation, and type narrowing. Build complex conditions from simple building blocks like `gt(18)`, `eq('active')`, and `where({ age: gt(18), status: eq('active') })`.

## The Problem: Scattered Filtering Logic

### The Hidden Cost of Inline Filters

```typescript
// ❌ Traditional approach - logic scattered everywhere
const activeAdults = users.filter(u => u.age >= 18 && u.active === true)
const activeStaff = users.filter(u => u.age >= 18 && u.active === true && (u.role === 'admin' || u.role === 'moderator'))
const premiumUsers = users.filter(u => u.age >= 18 && u.active === true && u.premium)

// What's duplicated? The "adult active user" logic (age >= 18 && active === true)
// What if requirements change? Update 3+ places
// What if logic is complex? Copy-paste grows
```

**Problems with inline filters:**
1. **Duplication**: Same logic repeated across codebase
2. **Not reusable**: Can't extract or compose conditions
3. **Hard to test**: Logic embedded in larger functions
4. **Not discoverable**: No central place to find "what filters exist?"
5. **Type unsafe**: No type narrowing for mixed-type arrays

### How Production Applications Handle This

#### Prisma ORM (Database Queries)

```typescript
// Prisma's where clause - composable predicates for databases
const users = await prisma.user.findMany({
  where: {
    age: { gte: 18 },
    status: { in: ['active', 'premium'] },
    email: { contains: '@gmail.com' }
  }
})
```

#### MongoDB Queries

```typescript
// MongoDB - query operators are predicates
db.users.find({
  age: { $gt: 18 },
  status: { $in: ['active', 'premium'] },
  'profile.verified': true
})
```

#### TypeORM Repository

```typescript
// TypeORM - composable conditions
const users = await userRepository.find({
  where: {
    age: MoreThan(18),
    status: In(['active', 'premium']),
    verified: true
  }
})
```

**What they all share:**
- ✅ Composable conditions (combine small pieces)
- ✅ Named operators (`gte`, `in`, `contains`)
- ✅ Type-safe filtering
- ✅ Reusable patterns

## The Solution: Predicate Functions

```typescript
import * as R from 'remeda'
import { where, gt, oneOf } from 'receta/predicate'

// ✅ Define reusable predicates
const isAdult = gt(18)
const isActive = eq(true)
const isStaff = oneOf(['admin', 'moderator'])

// ✅ Compose into higher-level predicates
const isActiveAdult = where({
  age: isAdult,
  active: isActive
})

const isActiveStaff = where({
  age: isAdult,
  active: isActive,
  role: isStaff
})

// ✅ Use anywhere
R.filter(users, isActiveAdult)
R.filter(users, isActiveStaff)
R.find(users, isActiveStaff)
```

**Benefits:**
- 🔄 **Reusable**: Define once, use everywhere
- 🧩 **Composable**: Build complex from simple
- 🔒 **Type-safe**: TypeScript knows what you're filtering
- 🧪 **Testable**: Test predicates in isolation
- 📖 **Discoverable**: All filters in one module
- 🎯 **Explicit**: Clear intent (`gt(18)` vs `>= 18`)

## Why Predicates Over Inline Filters?

### Problem 1: Inline Filters Don't Compose

```typescript
// ❌ Can't extract or reuse
users.filter(u => u.age >= 18 && u.verified)
products.filter(p => p.price >= 100 && p.inStock)
orders.filter(o => o.amount >= 1000 && o.status === 'pending')

// Each has similar structure (threshold check + boolean)
// But you can't extract a "greaterThan" helper easily
```

```typescript
// ✅ With predicates - composition is natural
import { gt, where } from 'receta/predicate'

const isAdult = gt(18)
const isExpensive = gt(100)
const isLargeOrder = gt(1000)

R.filter(users, where({ age: isAdult, verified: Boolean }))
R.filter(products, where({ price: isExpensive, inStock: Boolean }))
R.filter(orders, where({ amount: isLargeOrder, status: eq('pending') }))
```

### Problem 2: Inline Filters Lose Type Information

```typescript
// ❌ TypeScript can't narrow mixed arrays
const mixed: unknown[] = ['hello', 42, true, 'world']
const strings = mixed.filter(x => typeof x === 'string')
// Type of strings: unknown[] ❌ (should be string[])
```

```typescript
// ✅ Type guards narrow types automatically
import { isString } from 'receta/predicate'

const strings = R.filter(mixed, isString)
// Type of strings: string[] ✅
```

### Problem 3: Inline Filters Don't Work in Pipelines

```typescript
// ❌ Awkward in pipe - need arrow functions
R.pipe(
  users,
  R.filter(u => u.age >= 18),
  R.filter(u => u.active),
  R.filter(u => u.role === 'admin')
)
```

```typescript
// ✅ Clean pipeline with predicates
R.pipe(
  users,
  R.filter(prop('age', gte(18))),
  R.filter(prop('active', Boolean)),
  R.filter(prop('role', eq('admin')))
)

// Or combine into one:
R.pipe(
  users,
  R.filter(where({
    age: gte(18),
    active: Boolean,
    role: eq('admin')
  }))
)
```

## Real-World Use Cases

### 1. API Filtering (GitHub-style)

```typescript
interface Issue {
  id: number
  state: 'open' | 'closed'
  labels: string[]
  assignee: string | null
}

// Filter: Open bugs assigned to someone
const openAssignedBugs = where({
  state: eq('open'),
  labels: (labels: string[]) => labels.includes('bug'),
  assignee: isDefined
})

R.filter(issues, openAssignedBugs)
```

### 2. E-Commerce Product Search

```typescript
// Price range + rating + availability
const affordableQuality = where({
  price: between(50, 200),
  rating: gte(4.0),
  inStock: Boolean
})

R.filter(products, affordableQuality)
```

### 3. User Permissions

```typescript
// Complex permission logic
const canAccessAdmin = or(
  prop('role', eq('admin')),
  and(
    prop('role', eq('moderator')),
    prop('verified', Boolean),
    by((u: User) => u.joinedDays, gt(30))
  )
)

if (canAccessAdmin(currentUser)) {
  // Grant access
}
```

### 4. Data Validation

```typescript
// Validate form data
const isValidEmail = matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)
const isStrongPassword = and(
  by((s: string) => s.length, gte(8)),
  matches(/[A-Z]/),
  matches(/[0-9]/)
)

const errors: string[] = []
if (!isValidEmail(formData.email)) errors.push('Invalid email')
if (!isStrongPassword(formData.password)) errors.push('Weak password')
```

### 5. Database-Like Queries

```typescript
// SQL: SELECT * FROM orders WHERE status IN ('pending', 'shipped') AND amount > 100
const activeHighValueOrders = where({
  status: oneOf(['pending', 'shipped']),
  amount: gt(100)
})

R.filter(orders, activeHighValueOrders)
```

## Mental Model: SQL WHERE Clauses for Arrays

Think of predicates as **SQL WHERE clauses** for in-memory data:

```sql
-- SQL
SELECT * FROM users WHERE age >= 18 AND status = 'active'
```

```typescript
// Receta Predicate (same structure)
R.filter(users, where({
  age: gte(18),
  status: eq('active')
}))
```

| SQL Operator | Predicate Function |
|--------------|-------------------|
| `>`, `>=`, `<`, `<=` | `gt()`, `gte()`, `lt()`, `lte()` |
| `=`, `!=` | `eq()`, `neq()` |
| `BETWEEN` | `between(min, max)` |
| `IN (...)` | `oneOf([...])` |
| `LIKE '%text%'` | `includes('text')` |
| `IS NULL` | `isNull`, `isNullish` |
| `IS NOT NULL` | `isDefined` |
| `AND` | `and(...)` |
| `OR` | `or(...)` |
| `NOT` | `not(...)` |

## When to Use Predicates

### ✅ Use Predicates When:

- **Filtering collections** - Arrays, sets, maps
- **Complex conditions** - More than 2 checks combined
- **Reusable logic** - Same filter used multiple times
- **Type narrowing** - Working with `unknown` or union types
- **Validation** - Checking if data meets criteria
- **Permissions** - User access control logic
- **Search/Query** - Building search interfaces
- **Testing** - Need to verify conditions in isolation

### ❌ Don't Use For:

- **One-off simple checks** - `if (x > 5)` is fine for unique cases
- **Non-boolean logic** - Predicates return true/false only
- **Mutations** - Predicates should be pure (no side effects)
- **Complex transformations** - Use `map` or `flatMap` instead

## Predicate Categories

### 1. Comparison (`gt`, `lt`, `eq`, `between`)
For numeric, string, and value comparisons.

```typescript
gt(18)           // age > 18
between(10, 50)  // 10 <= price <= 50
eq('active')     // status === 'active'
```

### 2. Combinators (`and`, `or`, `not`)
For logical composition.

```typescript
and(gt(18), lt(65))           // 18 < age < 65
or(eq('admin'), eq('owner'))  // role === 'admin' OR 'owner'
not(isEmpty)                  // not empty
```

### 3. Builders (`where`, `oneOf`, `prop`)
For structured object filtering.

```typescript
where({ age: gt(18), active: Boolean })  // Multi-field check
oneOf(['red', 'blue', 'green'])          // Value in list
prop('status', eq('active'))             // Single property check
```

### 4. Type Guards (`isString`, `isNumber`, `isDefined`)
For type narrowing and runtime checks.

```typescript
isString    // typeof x === 'string'
isNumber    // typeof x === 'number' && !isNaN(x)
isDefined   // x != null
```

## Architecture: Pure Functions

```typescript
// A predicate is just: (value: T) => boolean
type Predicate<T> = (value: T) => boolean

// Simple predicates
const isEven: Predicate<number> = (n) => n % 2 === 0
const isPositive: Predicate<number> = (n) => n > 0

// Predicate factories (return predicates)
const gt = <T>(threshold: T): Predicate<T> => (value) => value > threshold
const eq = <T>(expected: T): Predicate<T> => (value) => value === expected

// Higher-order combinators (predicates → predicate)
const and = <T>(...preds: Predicate<T>[]): Predicate<T> =>
  (value) => preds.every(p => p(value))
```

**Key properties:**
- ✅ **Pure**: No side effects
- ✅ **Composable**: Combine freely
- ✅ **Type-safe**: TypeScript checks everything
- ✅ **Lazy**: Only evaluated when called
- ✅ **Cacheable**: Same input = same output

## Integration with Remeda

Predicates work seamlessly with Remeda's collection functions:

```typescript
import * as R from 'remeda'
import { where, gt, oneOf } from 'receta/predicate'

const users = [/* ... */]

// filter - Keep matching items
R.filter(users, where({ age: gt(18) }))

// find - First match
R.find(users, where({ role: eq('admin') }))

// partition - Split by predicate
const [active, inactive] = R.partition(users, prop('active', Boolean))

// takeWhile - Take until predicate fails
R.takeWhile(numbers, lt(10))

// dropWhile - Drop until predicate fails
R.dropWhile(numbers, lt(10))

// any - Check if any match
R.some(users, prop('verified', Boolean))

// all - Check if all match
R.every(users, where({ age: gte(18) }))
```

## Performance Considerations

### Short-Circuit Evaluation

```typescript
// ✅ and() short-circuits on first false
and(
  expensiveCheck,  // If this fails...
  anotherCheck     // ...this never runs
)

// ✅ or() short-circuits on first true
or(
  quickCheck,      // If this succeeds...
  expensiveCheck   // ...this never runs
)
```

### Predicate Factories Are Fast

```typescript
// Creating predicates is cheap (no computation)
const isAdult = gt(18)        // Just returns a function
const isActive = eq(true)     // Just returns a function

// Only when you CALL them does work happen
isAdult(25)                   // Now we compute: 25 > 18
```

### Memoization for Expensive Predicates

```typescript
import { memoize } from 'receta/memo'

// If predicate does expensive work, memoize it
const expensivePredicate = memoize((user: User) => {
  // Complex calculation
  return user.score > computeThreshold(user.history)
})
```

## Common Patterns

### Pattern 1: Define Domain Predicates

```typescript
// predicates/user.ts
export const isAdult = prop('age', gte(18))
export const isVerified = prop('verified', Boolean)
export const isStaff = prop('role', oneOf(['admin', 'moderator']))
export const isActiveUser = where({ status: eq('active'), verified: Boolean })
```

### Pattern 2: Compose for Permissions

```typescript
// permissions.ts
const canEditPost = (user: User, post: Post) =>
  or(
    eq(post.authorId)(user.id),         // Author can edit
    and(isStaff(user), isVerified(user)) // Verified staff can edit
  )(user)
```

### Pattern 3: Validation Schemas

```typescript
const isValidUser = where({
  email: matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/),
  age: between(13, 120),
  username: by((s: string) => s.length, between(3, 20))
})

if (!isValidUser(userData)) {
  throw new Error('Invalid user data')
}
```

## What's Next?

Now that you understand the "why" of predicates, dive into specific APIs:

1. **[Comparison Predicates](./01-comparison.md)** - `gt`, `lt`, `eq`, `between`, string matching
2. **[Combinators](./02-combinators.md)** - `and`, `or`, `not`, `xor` for logic
3. **[Builders](./03-builders.md)** - `where`, `oneOf`, `prop` for structured queries
4. **[Type Guards](./04-guards.md)** - `isString`, `isNumber`, type narrowing
5. **[Common Patterns](./05-patterns.md)** - Real-world recipes and examples
6. **[Migration Guide](./06-migration.md)** - From inline filters to predicates
7. **[API Reference](./07-api-reference.md)** - Complete function listing

Or jump straight to **[Common Patterns](./05-patterns.md)** for copy-paste recipes!

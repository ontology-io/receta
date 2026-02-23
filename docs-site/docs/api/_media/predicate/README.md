# Predicate Module Documentation

> Composable filtering, validation, and type narrowing for TypeScript

## Quick Start

```typescript
import * as R from 'remeda'
import { where, gt, eq, oneOf, and, or } from 'receta/predicate'

interface User {
  age: number
  role: 'user' | 'admin' | 'moderator'
  verified: boolean
  country: string
}

// Define reusable predicates
const isAdult = where({ age: gt(18) })
const isStaff = where({ role: oneOf(['admin', 'moderator']) })
const isVerified = where({ verified: eq(true) })
const isUS = where({ country: eq('US') })

// Compose predicates
const canModerate = and(isStaff, isVerified)
const eligibleUser = and(isAdult, isVerified, isUS)

// Use with Remeda
const users: User[] = [/* ... */]
const moderators = R.filter(users, canModerate)
const eligible = R.filter(users, eligibleUser)
```

**Benefits:**
- ✅ Reusable - Define once, use everywhere
- ✅ Composable - Build complex from simple
- ✅ Type-safe - TypeScript type narrowing
- ✅ Testable - Test predicates in isolation
- ✅ Discoverable - All filters in one place
- ✅ Explicit - Clear intent and meaning

---

## Documentation Structure

### For Beginners

Start here if you're new to predicates:

1. **[Overview](./00-overview.md)** (~500 lines)
   - Why predicates over inline filters?
   - Mental model: SQL WHERE clauses for arrays
   - Real-world motivation and examples
   - When to use predicates vs alternatives
   - Integration with Remeda

2. **[Comparison Predicates](./01-comparison.md)** (~480 lines)
   - Numeric: `gt`, `gte`, `lt`, `lte`, `between`
   - Equality: `eq`, `neq`
   - Strings: `startsWith`, `endsWith`, `includes`, `matches`
   - Empty checks: `isEmpty`, `isNotEmpty`

### Core Concepts

3. **[Combinators](./02-combinators.md)** (~400 lines)
   - Logical composition: `and`, `or`, `not`, `xor`
   - Short-circuit behavior
   - De Morgan's laws
   - Performance optimization tips

4. **[Builders](./03-builders.md)** (~450 lines)
   - Multi-field: `where({ ... })`
   - Value lists: `oneOf([...])`
   - Single property: `prop(key, pred)`
   - Derived values: `by(selector, pred)`
   - Shape matching: `matchesShape(pattern)`
   - Property existence: `hasProperty(key)`

5. **[Type Guards](./04-guards.md)** (~400 lines)
   - Primitives: `isString`, `isNumber`, `isBoolean`
   - Nullish: `isNull`, `isUndefined`, `isNullish`, `isDefined`
   - Structural: `isArray`, `isObject`, `isFunction`
   - Instances: `isDate`, `isError`, `isPromise`, `isInstanceOf`
   - Type narrowing in TypeScript

### Practical Guides

6. **[Common Patterns](./05-patterns.md)** (~650 lines)
   - E-commerce filtering
   - User permissions & access control
   - API filtering (GitHub/Stripe style)
   - Form validation
   - Search & query functionality
   - Database-like queries
   - Batch processing & data pipelines
   - Content moderation

7. **[Migration Guide](./06-migration.md)** (~500 lines)
   - Why migrate from inline filters?
   - Step-by-step refactoring examples
   - Incremental migration strategy
   - Common pitfalls to avoid
   - Testing after migration
   - Domain-specific examples

### Reference

8. **[API Reference](./07-api-reference.md)** (~700 lines)
   - Decision tree for choosing functions
   - Complete function signatures
   - Quick lookup table
   - Cheat sheet

---

## Topic-Based Navigation

### By Use Case

**Filtering Collections**
- [Comparison Predicates](./01-comparison.md) - Basic value filtering
- [Builders](./03-builders.md) - Object filtering
- [Common Patterns](./05-patterns.md) - Real-world examples

**Access Control & Permissions**
- [Combinators](./02-combinators.md) - Combine permission checks
- [Common Patterns](./05-patterns.md#user-permissions--access-control)

**Form Validation**
- [Comparison Predicates](./01-comparison.md#string-predicates) - Email, phone validation
- [Common Patterns](./05-patterns.md#form-validation)

**API Filtering**
- [Builders](./03-builders.md) - Database-like queries
- [Common Patterns](./05-patterns.md#api-filtering-githubstripe-style)

**Type Safety**
- [Type Guards](./04-guards.md) - Runtime type checking
- [Type Guards](./04-guards.md#mixed-array-filtering) - Handle unknown types

**Refactoring Existing Code**
- [Migration Guide](./06-migration.md) - Step-by-step guide

---

## Quick Reference

### Most Common Patterns

```typescript
// Numeric comparison
where({ age: gt(18) })                  // age > 18
where({ price: between(50, 200) })      // 50 <= price <= 200

// Equality
where({ status: eq('active') })         // status === 'active'
where({ role: oneOf(['admin', 'mod']) }) // role in ['admin', 'mod']

// Multiple fields
where({
  age: gt(18),
  verified: eq(true),
  country: eq('US')
})

// Logical composition
and(isAdult, isVerified)                // Both must be true
or(isAdmin, isModerator)                // Either can be true
not(isEmpty)                            // Invert condition

// Type guards
R.filter(mixedArray, isString)          // Filter strings
R.filter(maybeNull, isDefined)          // Remove null/undefined

// Derived values
by((u: User) => u.followers.length, gt(1000))  // Many followers
```

### Learning Path

**Beginner** (1-2 hours)
1. Read [Overview](./00-overview.md)
2. Skim [Comparison Predicates](./01-comparison.md)
3. Try examples in [Common Patterns](./05-patterns.md)

**Intermediate** (2-3 hours)
1. Deep dive [Combinators](./02-combinators.md)
2. Master [Builders](./03-builders.md)
3. Work through [Migration Guide](./06-migration.md)

**Advanced** (1-2 hours)
1. Understand [Type Guards](./04-guards.md)
2. Study [Common Patterns](./05-patterns.md) for your domain
3. Keep [API Reference](./07-api-reference.md) handy

---

## Best Practices

### ✅ Do

```typescript
// Extract reusable predicates
const isActiveAdult = where({ age: gt(18), active: eq(true) })
R.filter(users, isActiveAdult)

// Name predicates clearly
const canEditPost = or(isAuthor, isAdmin)

// Compose small predicates
const isStaff = or(isAdmin, isModerator)

// Use type guards for mixed types
const strings = R.filter(mixed, isString) // Type: string[]

// Put fast checks first in and()
and(simpleCheck, expensiveCheck)
```

### ❌ Don't

```typescript
// Don't duplicate inline
R.filter(users, where({ age: gt(18), active: eq(true) }))
R.filter(users, where({ age: gt(18), active: eq(true) }))
R.filter(users, where({ age: gt(18), active: eq(true) }))

// Don't over-abstract
const isAgeGreaterThan = (n: number) => gt(n)
const isUserAgeGreaterThan = (n: number) => where({ age: isAgeGreaterThan(n) })

// Don't order inefficiently
and(expensiveCheck, cheapCheck) // Should be reversed!

// Don't reinvent built-ins
const notEmpty = (s: string) => s.length > 0 // Use isNotEmpty
```

---

## Integration with Remeda

Predicates work seamlessly with Remeda:

```typescript
import * as R from 'remeda'

// filter - Keep matching items
R.filter(users, isActive)

// find - First match
R.find(users, isAdmin)

// partition - Split by predicate
const [active, inactive] = R.partition(users, isActive)

// takeWhile - Take until predicate fails
R.takeWhile(numbers, lt(10))

// dropWhile - Drop until predicate fails
R.dropWhile(numbers, lt(10))

// some - Check if any match
R.some(users, isVerified)

// every - Check if all match
R.every(users, isAdult)

// Pipeline composition
R.pipe(
  users,
  R.filter(isActive),
  R.filter(isVerified),
  R.map((u) => u.name)
)
```

---

## Examples by Domain

### E-Commerce

```typescript
// Affordable quality products in stock
const goodDeals = where({
  price: between(50, 200),
  rating: gte(4.0),
  inStock: eq(true)
})

R.filter(products, goodDeals)
```

See: [E-Commerce Patterns](./05-patterns.md#e-commerce-filtering)

### User Management

```typescript
// Verified staff members
const verifiedStaff = where({
  role: oneOf(['admin', 'moderator']),
  verified: eq(true)
})

R.filter(users, verifiedStaff)
```

See: [User Permissions](./05-patterns.md#user-permissions--access-control)

### API Filtering

```typescript
// Open bugs assigned to someone
const openAssignedBugs = where({
  state: eq('open'),
  labels: (labels: string[]) => labels.includes('bug'),
  assignee: isDefined
})

R.filter(issues, openAssignedBugs)
```

See: [API Filtering](./05-patterns.md#api-filtering-githubstripe-style)

---

## Comparison with Alternatives

### vs Inline Filters

**Inline:**
```typescript
users.filter(u => u.age >= 18 && u.verified && u.country === 'US')
```

**Predicates:**
```typescript
const eligible = where({ age: gte(18), verified: eq(true), country: eq('US') })
R.filter(users, eligible)
```

**Wins:** Reusable, testable, composable, discoverable

### vs Lodash/Ramda

**Lodash:**
```typescript
_.filter(users, { active: true, verified: true })
```

**Predicates:**
```typescript
R.filter(users, where({ active: eq(true), verified: eq(true) }))
```

**Wins:** Type-safe, explicit, composable with custom predicates

### vs Custom Helpers

**Custom:**
```typescript
const isActiveUser = (u: User) => u.active && u.verified
R.filter(users, isActiveUser)
```

**Predicates:**
```typescript
const isActiveUser = where({ active: eq(true), verified: eq(true) })
R.filter(users, isActiveUser)
```

**Wins:** Standardized, composable, less code to maintain

---

## FAQ

**Q: When should I use predicates vs inline filters?**

A: Use predicates when:
- Logic is reused (even just twice)
- Condition is complex (3+ checks)
- Need type narrowing for mixed arrays
- Building query/filter interfaces
- Want testable, discoverable filters

Use inline when:
- One-off simple check (`if (x > 5)`)
- Unique business logic not reused

**Q: Do predicates have performance overhead?**

A: Negligible. Predicate functions are simple wrappers around native operators. The `and`/`or` combinators short-circuit, often making them faster than inline equivalents.

**Q: Can I mix predicates with inline filters?**

A: Yes! They coexist perfectly:
```typescript
R.filter(users, (u) => isActive(u) && u.customLogic())
```

**Q: How do I handle nested objects?**

A: Use nested `where()` or custom predicates:
```typescript
where({
  user: where({ country: eq('US') })
})
```

**Q: What about async predicates?**

A: Predicates are synchronous. For async filtering, use Remeda's async utilities or the `async` module's `filterAsync()`.

---

## Get Help

- **Can't find the right function?** → [Decision Tree](./07-api-reference.md#decision-tree)
- **Need copy-paste examples?** → [Common Patterns](./05-patterns.md)
- **Migrating existing code?** → [Migration Guide](./06-migration.md)
- **Function reference?** → [API Reference](./07-api-reference.md)
- **TypeScript issues?** → [Type Guards](./04-guards.md)

---

## Related Modules

- **[Result](../result/)** - Error handling with Result<T, E>
- **[Option](../option/)** - Nullable value handling with Option<T>
- **[Async](../async/)** - Async utilities (mapAsync, retry, etc.)
- **[Validation](../validation/)** - Data validation with error accumulation

---

**Next:** Start with the [Overview](./00-overview.md) to understand the "why" behind predicates!

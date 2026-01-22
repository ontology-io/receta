# Compare: Type-Safe Comparator Builders

> **TL;DR**: Build composable, type-safe comparators for sorting complex data structures. No more brittle `array.sort((a, b) => ...)` callbacks scattered throughout your codebase.

## The Problem: Sorting is Harder Than It Looks

Sorting seems simple until you need to:
- Sort by multiple fields with different priorities
- Handle null/undefined values consistently
- Sort strings case-insensitively or with locale awareness
- Sort version numbers naturally ("v1.2" before "v1.10")
- Reverse sort directions without rewriting logic
- Compose sorting logic across your application

### Real-World Example: GitHub Issues Sorting

Here's what you typically write:

```typescript
interface Issue {
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  assignee: string | null
}

// ❌ Brittle, hard to read, easy to get wrong
issues.sort((a, b) => {
  // Sort by status (open first)
  const statusOrder = { open: 0, closed: 1 }
  const statusDiff = statusOrder[a.status] - statusOrder[b.status]
  if (statusDiff !== 0) return statusDiff

  // Then by priority (high first)
  const priorityOrder = { high: 0, medium: 1, low: 2 }
  const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
  if (priorityDiff !== 0) return priorityDiff

  // Then by created date (oldest first)
  return a.createdAt.getTime() - b.createdAt.getTime()
})
```

**Problems:**
1. **Not reusable** - Can't extract "sort by priority" for other lists
2. **Error-prone** - Easy to mess up the comparison logic
3. **Hard to read** - Business logic buried in nested conditions
4. **Not composable** - Can't build complex sorts from simple ones
5. **No type safety** - Typos in property names caught only at runtime

### How Successful Products Handle This

**GitHub** (actual UI sorting):
- Issues can be sorted by status, assignee, labels, milestones, created date, updated date
- Multi-level sorting: "Open issues assigned to me, sorted by priority, then by age"
- Nulls handling: Unassigned issues grouped separately

**Stripe** (transaction lists):
- Sort by amount, status, date, customer
- Natural sorting for invoice numbers ("INV-2" before "INV-10")
- Consistent null handling for optional fields

**Vercel** (deployment lists):
- Sort by date (most recent first), duration, status
- Case-insensitive sorting for branch names
- Compose filters + sorts in URL query params

All these products need **reusable, composable sorting logic**.

## The Solution: Comparator Builders

```typescript
import { ascending, compose, byDate } from 'receta/compare'

// ✅ Readable, reusable, composable
const statusOrder = { open: 0, closed: 1 }
const priorityOrder = { high: 0, medium: 1, low: 2 }

issues.sort(
  compose(
    ascending(i => statusOrder[i.status]),
    ascending(i => priorityOrder[i.priority]),
    byDate(i => i.createdAt)
  )
)
```

**Benefits:**
1. **Reusable** - Extract `byPriority = ascending(i => priorityOrder[i.priority])`
2. **Type-safe** - TypeScript catches property name typos
3. **Readable** - Intent is clear: "sort by status, then priority, then date"
4. **Composable** - Build complex sorts from simple building blocks
5. **Testable** - Test individual comparators in isolation

## Why Compare Over `Array.sort()` Callbacks?

### Problem 1: Array.sort() Doesn't Compose

```typescript
// ❌ Can't reuse or combine
const sortByPrice = (a: Product, b: Product) => a.price - b.price
const sortByStock = (a: Product, b: Product) => a.stock - b.stock

// How do you combine these? Copy-paste and add if statements? 😢
```

```typescript
// ✅ Comparators compose naturally
import { ascending, compose } from 'receta/compare'

const byPrice = ascending((p: Product) => p.price)
const byStock = ascending((p: Product) => p.stock)

// Compose them!
const byPriceThenStock = compose(byPrice, byStock)

products.sort(byPriceThenStock)
```

### Problem 2: Array.sort() Loses Type Information

```typescript
// ❌ No type safety
items.sort((a, b) => a.createdAd - b.createdAt) // Typo! Runtime error

// ✅ TypeScript catches typos
import { byDate } from 'receta/compare'
items.sort(byDate(i => i.createdAd)) // ❌ Compile error: Property 'createdAd' doesn't exist
```

### Problem 3: Array.sort() Doesn't Work in Pipelines

```typescript
// ❌ Have to break out of the pipe
const result = R.pipe(
  items,
  R.filter(isActive),
  // Can't pass a comparator here easily
  items => items.sort((a, b) => ...)
)

// ✅ Works seamlessly with Remeda
import { ascending } from 'receta/compare'

const result = R.pipe(
  items,
  R.filter(isActive),
  R.sort(ascending(i => i.priority))
)
```

### Problem 4: Array.sort() Has Inconsistent Null Handling

```typescript
// ❌ Nulls behave unpredictably
items.sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
// Where do nulls end up? Depends on JS engine!

// ✅ Explicit null handling
import { ascending, nullsFirst } from 'receta/compare'

items.sort(nullsFirst(ascending(i => i.value ?? 0))) // Nulls first
items.sort(nullsLast(ascending(i => i.value ?? 0)))  // Nulls last
```

## Real-World Use Cases

### 1. Data Tables

Sort by multiple columns with different directions:

```typescript
import { compose, ascending, descending } from 'receta/compare'

interface Employee {
  department: string
  name: string
  salary: number
}

// Sort by department (asc), then salary (desc)
employees.sort(
  compose(
    ascending(e => e.department),
    descending(e => e.salary)
  )
)
```

### 2. API Response Lists

Handle complex sorting from query params:

```typescript
import { ascending, descending, byDate, compose } from 'receta/compare'

interface SearchParams {
  sortBy: 'date' | 'relevance' | 'price'
  order: 'asc' | 'desc'
}

function getSortComparator(params: SearchParams): Comparator<Product> {
  const base = params.sortBy === 'date'
    ? byDate(p => p.createdAt)
    : params.sortBy === 'price'
    ? ascending(p => p.price)
    : ascending(p => p.relevanceScore)

  return params.order === 'desc' ? reverse(base) : base
}
```

### 3. File Browsers

Natural sorting for file names:

```typescript
import { natural, compose, ascending } from 'receta/compare'

interface FileEntry {
  type: 'file' | 'directory'
  name: string
}

// Directories first, then natural sort by name
files.sort(
  compose(
    ascending(f => f.type === 'directory' ? 0 : 1),
    natural(f => f.name)
  )
)
// => [dir1/, dir2/, file1.txt, file2.txt, file10.txt]
```

### 4. Leaderboards

Sort players by score, breaking ties by time:

```typescript
import { withTiebreaker, descending, ascending } from 'receta/compare'

interface Player {
  name: string
  score: number
  completionTime: number
}

// Highest score first, fastest time breaks ties
players.sort(
  withTiebreaker(
    descending(p => p.score),
    ascending(p => p.completionTime)
  )
)
```

### 5. Internationalized Apps

Locale-aware string sorting:

```typescript
import { localeCompare } from 'receta/compare'

const germanCities = ['München', 'Berlin', 'Zürich']
germanCities.sort(localeCompare(x => x, 'de-DE'))
// => Correctly handles ü, ö, ä according to German rules
```

## Mental Model: Building Blocks

Think of comparators as **Lego bricks** for sorting:

```
┌─────────────────────────────────────────────┐
│              Final Comparator               │
│  (What you pass to array.sort())            │
└─────────────────────────────────────────────┘
                    ▲
                    │
         ┌──────────┴──────────┐
         │                     │
    ┌────────┐           ┌───────────┐
    │ Simple │           │ Combinator│
    │ Block  │     +     │  (compose,│
    │        │           │  reverse) │
    └────────┘           └───────────┘
         │                     │
    ascending()           compose()
    byDate()              reverse()
    natural()             nullsFirst()
```

**Simple blocks** do one thing:
- `ascending(fn)` - Sort low to high
- `byDate(fn)` - Sort dates chronologically
- `natural(fn)` - Natural string sorting

**Combinators** connect blocks:
- `compose(a, b, c)` - Multi-level sorting
- `reverse(comparator)` - Flip the order
- `nullsFirst(comparator)` - Handle nulls

**Combine them** to solve complex problems:
```typescript
compose(
  ascending(statusOrder),
  reverse(byDate(x => x.createdAt)),
  nullsFirst(ascending(x => x.assignee))
)
```

## When to Use Compare

✅ **Use when:**
- Sorting objects by multiple fields
- Need consistent null/undefined handling
- Building reusable sorting utilities
- Working with internationalized strings
- Sorting version numbers or file names naturally
- Combining filters and sorts in pipelines
- Need type-safe property access

❌ **Don't use for:**
- Simple one-off number sorting (`[3,1,2].sort((a,b) => a - b)` is fine)
- Sorting primitives where built-in sort works
- When you need custom collation beyond locale support
- Performance-critical sorting (though Compare is fast, hand-written may be faster)

## Core Concepts

### 1. Comparator Type

```typescript
type Comparator<T> = (a: T, b: T) => number

// Returns:
// < 0  if a should come before b
//   0  if a and b are equal
// > 0  if a should come after b
```

All Compare functions either **create** or **modify** comparators.

### 2. Ascending vs Descending

```typescript
ascending(x => x.value)  // Low to high:  1, 2, 3
descending(x => x.value) // High to low:  3, 2, 1
```

### 3. Composition

```typescript
// Primary sort, then tiebreaker, then second tiebreaker
compose(
  primaryComparator,
  tiebreakerComparator,
  secondTiebreakerComparator
)
```

### 4. Null Handling

```typescript
nullsFirst(comparator)  // null, null, 1, 2, 3
nullsLast(comparator)   // 1, 2, 3, null, null
```

### 5. Type-Specific Comparators

Different types need different comparisons:
- **Dates**: `byDate()` compares timestamps
- **Numbers**: `byNumber()` handles NaN and Infinity
- **Strings**: `byString()` supports case and locale options
- **Booleans**: `byBoolean()` treats false < true

## Comparison with Alternatives

### vs Lodash `_.orderBy`

```typescript
// Lodash
_.orderBy(users, ['status', 'priority', 'createdAt'], ['asc', 'desc', 'asc'])

// ❌ Problems:
// - Property names are strings (no type safety)
// - Limited to object properties (can't use computed values)
// - Order array must match property array
// - No composition or reusability

// Compare
users.sort(
  compose(
    ascending(u => u.status),
    descending(u => u.priority),
    byDate(u => u.createdAt)
  )
)

// ✅ Type-safe, composable, works with any extraction function
```

### vs Native `Intl.Collator`

```typescript
// Intl.Collator (good for strings)
const collator = new Intl.Collator('de-DE')
names.sort((a, b) => collator.compare(a, b))

// ❌ Only works for strings, verbose for objects

// Compare (wraps Collator internally)
names.sort(localeCompare(x => x, 'de-DE'))

// ✅ Works with objects, composable, cleaner syntax
```

### vs Ramda `R.sortBy`

```typescript
// Ramda
R.sortBy(R.prop('age'), users)

// ❌ Can only sort by one property
// ❌ Always ascending
// ❌ No type inference

// Compare
users.sort(ascending(u => u.age))

// ✅ Full TypeScript support
// ✅ Composable for multi-level sorting
// ✅ More control (ascending/descending/natural/etc)
```

## Architecture: How It Works

### Extraction Functions

All basic comparators take an **extraction function**:

```typescript
ascending((user: User) => user.age)
         └──────┬──────────────────┘
                │
        Extracts comparable value
```

This separates **what to compare** (the value) from **how to compare** (ascending/descending/natural).

### Composition via Priority

`compose()` applies comparators in order, short-circuiting when one returns non-zero:

```typescript
compose(
  comparatorA,  // If A says a ≠ b, use A's result
  comparatorB,  // If A says a = b, try B
  comparatorC   // If B also says equal, try C
)
```

### Null Safety Layer

`nullsFirst` and `nullsLast` wrap comparators to handle nulls before delegating:

```typescript
nullsFirst((a, b) => {
  if (a == null && b == null) return 0
  if (a == null) return -1  // a comes first
  if (b == null) return 1   // b comes first
  return innerComparator(a, b)
})
```

## What's Next?

- **[Basic Comparators](./01-basic-comparators.md)** - `ascending`, `descending`, `natural`, `byKey`
- **[Combinators](./02-combinators.md)** - `compose`, `reverse`, `nullsFirst`, `nullsLast`
- **[Type-Specific](./03-type-specific.md)** - `byDate`, `byNumber`, `byString`, `byBoolean`
- **[Advanced](./04-advanced.md)** - `caseInsensitive`, `localeCompare`
- **[Patterns & Recipes](./05-patterns.md)** - Real-world solutions
- **[Migration Guide](./06-migration.md)** - From `Array.sort()` to Compare
- **[API Reference](./07-api-reference.md)** - Complete function catalog

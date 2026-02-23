# Combinators

Combinators modify and combine comparators to create complex sorting logic from simple building blocks.

## Overview

| Function | Purpose | Example Use Case |
|----------|---------|------------------|
| `compose(...comparators)` | Multi-level sorting | Sort by status, then priority, then date |
| `reverse(comparator)` | Flip sort order | Convert ascending to descending |
| `nullsFirst(comparator)` | Nulls at start | Unassigned items first |
| `nullsLast(comparator)` | Nulls at end | Active items before inactive |
| `withTiebreaker(primary, tiebreaker)` | Explicit two-level sort | Score, then time |

## compose()

Combines multiple comparators into a single multi-level sort with priority ordering.

### Signature

```typescript
function compose<T>(...comparators: Comparator<T>[]): Comparator<T>
```

### How It Works

Applies comparators in order. If the first returns 0 (equal), tries the second, and so on:

```typescript
compose(
  comparatorA,  // Try A first
  comparatorB,  // If A says equal, try B
  comparatorC   // If B also says equal, try C
)
```

### When to Use

- Sorting by multiple fields with different priorities
- "Sort by X, then by Y, then by Z" requirements
- Data tables with multi-column sorting
- Complex business logic sorting

### Examples

#### GitHub Issues: Status → Priority → Date

```typescript
import { compose, ascending, byDate } from 'receta/compare'

interface Issue {
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
}

const statusOrder = { open: 0, closed: 1 }
const priorityOrder = { high: 0, medium: 1, low: 2 }

issues.sort(
  compose(
    ascending(i => statusOrder[i.status]),     // 1. Open first
    ascending(i => priorityOrder[i.priority]), // 2. Then high priority
    byDate(i => i.createdAt)                   // 3. Then oldest
  )
)
// Result: Open high-priority issues (oldest first), then open medium, then open low, then closed
```

#### Employee List: Department → Salary → Name

```typescript
interface Employee {
  name: string
  department: string
  salary: number
}

employees.sort(
  compose(
    ascending(e => e.department),  // Group by department
    descending(e => e.salary),     // Within department, highest paid first
    ascending(e => e.name)         // Break ties by name
  )
)
```

#### E-commerce: Category → Price → Rating

```typescript
interface Product {
  category: string
  price: number
  rating: number
}

products.sort(
  compose(
    ascending(p => p.category),    // Group by category
    ascending(p => p.price),       // Cheapest first within category
    descending(p => p.rating)      // Highest rated breaks ties
  )
)
```

#### File Browser: Type → Name

```typescript
interface FileEntry {
  name: string
  type: 'directory' | 'file'
}

files.sort(
  compose(
    ascending(f => f.type === 'directory' ? 0 : 1), // Directories first
    natural(f => f.name)                            // Then natural sort by name
  )
)
// => [src/, docs/, README.md, package.json]
```

### Real-World: Stripe Transactions

```typescript
interface Transaction {
  status: 'succeeded' | 'pending' | 'failed'
  amount: number
  createdAt: Date
}

const statusPriority = { failed: 0, pending: 1, succeeded: 2 }

transactions.sort(
  compose(
    ascending(t => statusPriority[t.status]), // Failed first (need attention)
    descending(t => t.amount),                // Largest amounts first
    descending(t => t.createdAt)              // Most recent first
  )
)
```

---

## reverse()

Reverses the order of any comparator.

### Signature

```typescript
function reverse<T>(comparator: Comparator<T>): Comparator<T>
```

### When to Use

- Toggle between ascending/descending based on user input
- Invert an existing comparator without rewriting logic
- "Reverse alphabetical" or "newest first" sorting

### Examples

#### Toggle Sort Direction

```typescript
import { reverse, ascending } from 'receta/compare'

function getSortComparator(direction: 'asc' | 'desc') {
  const base = ascending((p: Product) => p.price)
  return direction === 'desc' ? reverse(base) : base
}

// User clicks "Price ↑"
products.sort(getSortComparator('asc'))

// User clicks "Price ↓"
products.sort(getSortComparator('desc'))
```

#### Newest First

```typescript
// Instead of writing descending(), you can reverse ascending()
const oldestFirst = byDate((e: Event) => e.date)
const newestFirst = reverse(oldestFirst)

events.sort(newestFirst)
```

#### Reverse Alphabetical

```typescript
const aToZ = ascending((u: User) => u.name)
const zToA = reverse(aToZ)

users.sort(zToA)
// => [Zara, Yuki, Xavier, ...]
```

### Note on `reverse()` vs `descending()`

```typescript
// These are equivalent:
reverse(ascending(x => x.price))
descending(x => x.price)

// Use descending() for clarity when building from scratch
// Use reverse() when you already have a comparator to invert
```

---

## nullsFirst()

Wraps a comparator to place null/undefined values at the beginning.

### Signature

```typescript
function nullsFirst<T>(
  comparator: Comparator<Nullable<T>>
): Comparator<Nullable<T>>
```

### How It Works

Checks for null/undefined before delegating to the wrapped comparator:

```typescript
// Pseudocode:
if (a == null && b == null) return 0    // Both null = equal
if (a == null) return -1                // a is null = a comes first
if (b == null) return 1                 // b is null = b comes first
return innerComparator(a, b)            // Neither null = use inner comparator
```

### When to Use

- Showing unassigned/missing items first
- "To be determined" items at top of list
- Incomplete data should appear prominently

### Examples

#### Unassigned Tasks First

```typescript
import { nullsFirst, ascending } from 'receta/compare'

interface Task {
  title: string
  assignee: string | null
}

const tasks: Task[] = [
  { title: 'Fix bug', assignee: 'alice' },
  { title: 'Review PR', assignee: null },
  { title: 'Write docs', assignee: 'bob' },
  { title: 'Deploy', assignee: null }
]

tasks.sort(nullsFirst(ascending(t => t.assignee ?? '')))
// => [Review PR (null), Deploy (null), Fix bug (alice), Write docs (bob)]
```

#### Missing Data First

```typescript
interface User {
  name: string
  lastLogin: Date | null
}

// Show users who never logged in first
users.sort(nullsFirst(ascending(u => u.lastLogin ?? new Date(0))))
```

#### Optional Deadlines

```typescript
interface Project {
  name: string
  deadline: Date | undefined
}

// Projects without deadlines shown first (need attention)
projects.sort(nullsFirst(ascending(p => p.deadline ?? new Date(0))))
```

---

## nullsLast()

Wraps a comparator to place null/undefined values at the end.

### Signature

```typescript
function nullsLast<T>(
  comparator: Comparator<Nullable<T>>
): Comparator<Nullable<T>>
```

### When to Use

- Active/valid items before inactive/invalid
- Required fields before optional fields
- Focus on items with data

### Examples

#### Active Users First

```typescript
import { nullsLast, descending } from 'receta/compare'

interface User {
  name: string
  lastActivity: Date | null
}

// Active users first, inactive (null) at end
users.sort(nullsLast(descending(u => u.lastActivity ?? new Date(0))))
// => [Most recent activity ... least recent ... null, null]
```

#### Products with Discounts

```typescript
interface Product {
  name: string
  discount: number | null
}

// Products with discounts first, no discount at end
products.sort(nullsLast(descending(p => p.discount ?? 0)))
```

#### Verified Accounts

```typescript
interface Account {
  email: string
  verifiedAt: Date | null
}

// Verified accounts first, unverified at end
accounts.sort(nullsLast(descending(a => a.verifiedAt ?? new Date(0))))
```

### Real-World: Linear Issues

```typescript
interface LinearIssue {
  title: string
  assignee: { name: string } | null
  dueDate: Date | null
  priority: number
}

// Assigned issues first, then by priority
issues.sort(
  compose(
    nullsLast(ascending(i => i.assignee?.name ?? '')),
    descending(i => i.priority)
  )
)
```

---

## withTiebreaker()

Combines a primary comparator with a tiebreaker for when values are equal. More explicit than `compose()` for two-level sorting.

### Signature

```typescript
function withTiebreaker<T>(
  primary: Comparator<T>,
  tiebreaker: Comparator<T>
): Comparator<T>
```

### When to Use

- Explicit two-level sorting (more readable than `compose()` for 2 levels)
- Tiebreaking in games/competitions
- Secondary sort criteria clearly defined

### Examples

#### Leaderboard: Score → Time

```typescript
import { withTiebreaker, descending, ascending } from 'receta/compare'

interface Player {
  name: string
  score: number
  completionTime: number
}

// Highest score wins, fastest time breaks ties
players.sort(
  withTiebreaker(
    descending(p => p.score),
    ascending(p => p.completionTime)
  )
)
```

#### Sales Report: Revenue → Region

```typescript
interface SalesRegion {
  region: string
  revenue: number
}

// Highest revenue first, alphabetical breaks ties
regions.sort(
  withTiebreaker(
    descending(r => r.revenue),
    ascending(r => r.region)
  )
)
```

#### Job Applications: Experience → Education

```typescript
interface Applicant {
  name: string
  yearsExperience: number
  educationLevel: number
}

// Most experience first, highest education breaks ties
applicants.sort(
  withTiebreaker(
    descending(a => a.yearsExperience),
    descending(a => a.educationLevel)
  )
)
```

### `withTiebreaker()` vs `compose()`

```typescript
// These are equivalent:
withTiebreaker(comparatorA, comparatorB)
compose(comparatorA, comparatorB)

// withTiebreaker is more explicit for 2-level sorting
// compose is better for 3+ levels
```

---

## Combining Combinators

You can nest combinators for complex logic:

### Example: Multi-Level with Null Handling

```typescript
interface Task {
  status: 'open' | 'closed'
  assignee: string | null
  priority: number
  createdAt: Date
}

tasks.sort(
  compose(
    ascending(t => t.status === 'open' ? 0 : 1),      // Open first
    nullsFirst(ascending(t => t.assignee ?? '')),     // Unassigned first within status
    descending(t => t.priority),                      // High priority first
    byDate(t => t.createdAt)                          // Oldest first
  )
)
// Open unassigned high-priority old tasks first!
```

### Example: Reversing a Composed Comparator

```typescript
const normalOrder = compose(
  ascending((p: Product) => p.category),
  ascending((p: Product) => p.price)
)

const reverseOrder = reverse(normalOrder)

// Completely reverses the entire sort
products.sort(reverseOrder)
```

### Example: Nullable Values in Multi-Level Sort

```typescript
interface Employee {
  department: string
  manager: string | null
  salary: number
}

employees.sort(
  compose(
    ascending(e => e.department),
    nullsLast(ascending(e => e.manager ?? '')), // Reports-to at end
    descending(e => e.salary)
  )
)
```

---

## Comparison Table

| Combinator | Effect | Use When |
|------------|--------|----------|
| `compose(a, b, c)` | Multi-level sort | 3+ sort criteria |
| `withTiebreaker(a, b)` | Primary + tiebreak | Exactly 2 levels (more explicit) |
| `reverse(comparator)` | Flip order | Toggle asc/desc |
| `nullsFirst(comparator)` | Nulls at start | Missing data needs attention |
| `nullsLast(comparator)` | Nulls at end | Focus on valid data first |

## Common Patterns

### Pattern: User-Controlled Multi-Column Sort

```typescript
interface SortConfig {
  column: string
  direction: 'asc' | 'desc'
}

function buildComparator(configs: SortConfig[]): Comparator<Item> {
  const comparators = configs.map(cfg => {
    const base = byKey(cfg.column as keyof Item)
    return cfg.direction === 'desc' ? reverse(base) : base
  })

  return compose(...comparators)
}

// User clicks: "Department ↑, Salary ↓, Name ↑"
const comparator = buildComparator([
  { column: 'department', direction: 'asc' },
  { column: 'salary', direction: 'desc' },
  { column: 'name', direction: 'asc' }
])
```

### Pattern: Priority Queue

```typescript
interface QueueItem {
  priority: number
  enqueuedAt: Date
}

// Higher priority first, FIFO breaks ties
queue.sort(
  withTiebreaker(
    descending(item => item.priority),
    ascending(item => item.enqueuedAt)
  )
)
```

### Pattern: Grouped Sorting

```typescript
interface Message {
  isStarred: boolean
  isRead: boolean
  receivedAt: Date
}

// Starred first, then unread, then by date
messages.sort(
  compose(
    reverse(byBoolean(m => m.isStarred)),
    byBoolean(m => m.isRead),
    descending(m => m.receivedAt)
  )
)
```

## Next Steps

- **[Type-Specific Comparators](./03-type-specific.md)** - Specialized comparators for dates, numbers, strings, booleans
- **[Patterns & Recipes](./05-patterns.md)** - Real-world solutions
- **[API Reference](./07-api-reference.md)** - Complete function catalog

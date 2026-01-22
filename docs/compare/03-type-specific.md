# Type-Specific Comparators

Type-specific comparators provide specialized sorting for dates, numbers, strings, and booleans with proper handling of edge cases.

## Overview

| Function | Type | Handles | Example |
|----------|------|---------|---------|
| `byDate(fn)` | Date | Chronological ordering | Event timelines, logs |
| `byNumber(fn)` | number | NaN, Infinity | Prices, scores, metrics |
| `byString(fn, options)` | string | Case, locale | Names, titles |
| `byBoolean(fn)` | boolean | false < true | Flags, toggles |

## byDate()

Sorts Date objects chronologically (earliest to latest).

### Signature

```typescript
function byDate<T>(fn: (value: T) => Date): Comparator<T>
```

### Why Use byDate() vs ascending()?

```typescript
// ✅ byDate - explicitly handles dates
events.sort(byDate(e => e.createdAt))

// ⚠️  ascending - works but less clear
events.sort(ascending(e => e.createdAt))

// Both work, but byDate() signals intent and may optimize internally
```

### Examples

#### Event Timeline

```typescript
import { byDate } from 'receta/compare'

interface Event {
  name: string
  occurredAt: Date
}

const events: Event[] = [
  { name: 'Launch', occurredAt: new Date('2024-03-01') },
  { name: 'Meeting', occurredAt: new Date('2024-02-15') },
  { name: 'Review', occurredAt: new Date('2024-02-20') }
]

// Chronological (oldest first)
events.sort(byDate(e => e.occurredAt))
// => [Meeting (Feb 15), Review (Feb 20), Launch (Mar 1)]
```

#### Most Recent First

```typescript
import { reverse, byDate } from 'receta/compare'

// Newest first
events.sort(reverse(byDate(e => e.occurredAt)))
// => [Launch (Mar 1), Review (Feb 20), Meeting (Feb 15)]
```

#### Real-World: GitHub Commits

```typescript
interface Commit {
  sha: string
  message: string
  authoredAt: Date
  committedAt: Date
}

// Sort by commit date (most recent first)
commits.sort(reverse(byDate(c => c.committedAt)))

// Sort by author date
commits.sort(byDate(c => c.authoredAt))
```

#### Real-World: Stripe Transactions

```typescript
interface Transaction {
  id: string
  amount: number
  created: Date
}

// Most recent transactions first
transactions.sort(reverse(byDate(t => t.created)))
```

#### Log Files

```typescript
interface LogEntry {
  level: string
  message: string
  timestamp: Date
}

// Chronological log order
logs.sort(byDate(l => l.timestamp))
```

---

## byNumber()

Sorts numbers with proper handling of NaN and Infinity.

### Signature

```typescript
function byNumber<T>(fn: (value: T) => number): Comparator<T>
```

### Special Value Handling

- **NaN**: Treated as equal to each other, sorted to the end
- **Infinity**: Sorted as the largest value
- **-Infinity**: Sorted as the smallest value

### Examples

#### Basic Number Sorting

```typescript
import { byNumber } from 'receta/compare'

interface Metric {
  name: string
  value: number
}

const metrics: Metric[] = [
  { name: 'CPU', value: 45.2 },
  { name: 'Memory', value: 78.9 },
  { name: 'Disk', value: 23.1 }
]

// Lowest to highest
metrics.sort(byNumber(m => m.value))
// => [Disk (23.1), CPU (45.2), Memory (78.9)]
```

#### Handling NaN

```typescript
const values = [
  { name: 'A', score: 100 },
  { name: 'B', score: NaN },
  { name: 'C', score: 50 },
  { name: 'D', score: NaN }
]

values.sort(byNumber(v => v.score))
// => [C (50), A (100), B (NaN), D (NaN)]
//   NaN values grouped at end
```

#### Handling Infinity

```typescript
const limits = [
  { name: 'Basic', max: 100 },
  { name: 'Unlimited', max: Infinity },
  { name: 'Trial', max: 10 }
]

limits.sort(byNumber(l => l.max))
// => [Trial (10), Basic (100), Unlimited (Infinity)]
```

#### Real-World: Analytics Dashboard

```typescript
interface KPI {
  metric: string
  current: number
  change: number
}

// Sort by largest change (positive or negative)
kpis.sort(descending(byNumber(k => Math.abs(k.change))))
```

#### Real-World: Pricing Tiers

```typescript
interface PricingTier {
  name: string
  pricePerMonth: number
  userLimit: number
}

// Cheapest plans first
tiers.sort(byNumber(t => t.pricePerMonth))

// Plans with most users first
tiers.sort(reverse(byNumber(t => t.userLimit)))
```

---

## byString()

Sorts strings with options for case sensitivity and locale awareness.

### Signature

```typescript
function byString<T>(
  fn: (value: T) => string,
  options?: StringCompareOptions
): Comparator<T>

interface StringCompareOptions {
  caseSensitive?: boolean  // default: true
  locale?: string          // default: undefined
}
```

### Examples

#### Case-Sensitive (Default)

```typescript
import { byString } from 'receta/compare'

const users = [
  { name: 'alice' },
  { name: 'Bob' },
  { name: 'Charlie' }
]

// Default: case-sensitive (uppercase before lowercase)
users.sort(byString(u => u.name))
// => [Bob, Charlie, alice]
//     ^uppercase first
```

#### Case-Insensitive

```typescript
// Ignore case
users.sort(byString(u => u.name, { caseSensitive: false }))
// => [alice, Bob, Charlie]
//     ^alphabetical regardless of case
```

#### Locale-Aware Sorting

```typescript
const cities = [
  { name: 'Zürich' },
  { name: 'Berlin' },
  { name: 'München' }
]

// German locale (handles ü, ö correctly)
cities.sort(byString(c => c.name, { locale: 'de-DE' }))
```

#### Real-World: User Directory

```typescript
interface User {
  firstName: string
  lastName: string
  email: string
}

// Sort by last name, case-insensitive
users.sort(byString(u => u.lastName, { caseSensitive: false }))

// Sort by email (case-sensitive for domains)
users.sort(byString(u => u.email))
```

#### Real-World: Internationalized Product Catalog

```typescript
interface Product {
  name: string
  category: string
}

// French locale for product names
const frenchProducts = products.filter(p => p.locale === 'fr')
frenchProducts.sort(byString(p => p.name, { locale: 'fr-FR' }))
```

---

## byBoolean()

Sorts boolean values (false < true).

### Signature

```typescript
function byBoolean<T>(fn: (value: T) => boolean): Comparator<T>
```

### Default Order

- `false` comes before `true` (false < true)
- Use `reverse()` for true-first sorting

### Examples

#### Incomplete Tasks First

```typescript
import { byBoolean } from 'receta/compare'

interface Task {
  title: string
  completed: boolean
}

const tasks: Task[] = [
  { title: 'Review PR', completed: true },
  { title: 'Fix bug', completed: false },
  { title: 'Write docs', completed: false }
]

// Incomplete (false) first
tasks.sort(byBoolean(t => t.completed))
// => [Fix bug (false), Write docs (false), Review PR (true)]
```

#### Urgent Items First

```typescript
import { reverse, byBoolean } from 'receta/compare'

interface Item {
  name: string
  urgent: boolean
}

// Urgent (true) first
items.sort(reverse(byBoolean(i => i.urgent)))
// => [urgent items... non-urgent items...]
```

#### Multi-Level: Urgent + Incomplete

```typescript
import { compose, reverse, byBoolean } from 'receta/compare'

interface Task {
  title: string
  urgent: boolean
  completed: boolean
}

// Urgent first, then incomplete first within each urgency level
tasks.sort(
  compose(
    reverse(byBoolean(t => t.urgent)),
    byBoolean(t => t.completed)
  )
)
// => [Urgent incomplete, Urgent complete, Normal incomplete, Normal complete]
```

#### Real-World: Feature Flags

```typescript
interface FeatureFlag {
  name: string
  enabled: boolean
  rolloutPercentage: number
}

// Enabled features first, then by rollout percentage
flags.sort(
  compose(
    reverse(byBoolean(f => f.enabled)),
    descending(f => f.rolloutPercentage)
  )
)
```

#### Real-World: Email Inbox

```typescript
interface Email {
  subject: string
  isStarred: boolean
  isRead: boolean
  receivedAt: Date
}

// Starred first, then unread, then by date
emails.sort(
  compose(
    reverse(byBoolean(e => e.isStarred)),
    byBoolean(e => e.isRead),
    reverse(byDate(e => e.receivedAt))
  )
)
```

---

## Comparison Table

| Type | Function | Default Order | Reverse For |
|------|----------|---------------|-------------|
| Date | `byDate(fn)` | Oldest → Newest | Most recent first |
| Number | `byNumber(fn)` | Low → High | Highest first |
| String | `byString(fn)` | A → Z (case-sensitive) | Z → A, case-insensitive |
| Boolean | `byBoolean(fn)` | false → true | true first (active/enabled) |

## When to Use Each

### Use byDate() when:
- Sorting events, logs, or transactions
- Chronological ordering matters
- Need "most recent first" or "oldest first"

### Use byNumber() when:
- Sorting prices, scores, metrics, ratings
- Data may contain NaN or Infinity
- Numeric comparison (not lexicographic)

### Use byString() when:
- Sorting names, titles, categories
- Need case-insensitive sorting
- Working with internationalized content
- Default `ascending()` doesn't handle case/locale correctly

### Use byBoolean() when:
- Sorting by flags, toggles, status (active/inactive)
- Grouping by binary states
- Need explicit true/false ordering

## Common Patterns

### Pattern: Sort by Date Range

```typescript
interface Event {
  startDate: Date
  endDate: Date
}

// Sort by start date, end date breaks ties
events.sort(
  compose(
    byDate(e => e.startDate),
    byDate(e => e.endDate)
  )
)
```

### Pattern: Sort by Computed Number

```typescript
interface Product {
  price: number
  quantity: number
}

// Sort by total value (price * quantity)
products.sort(byNumber(p => p.price * p.quantity))
```

### Pattern: Multi-Language Support

```typescript
function sortByName(users: User[], locale: string) {
  return users.sort(byString(u => u.name, { locale }))
}

sortByName(users, 'en-US')  // English
sortByName(users, 'de-DE')  // German
sortByName(users, 'ja-JP')  // Japanese
```

### Pattern: Status Flags

```typescript
interface Account {
  isVerified: boolean
  isPremium: boolean
  isActive: boolean
}

// Premium verified active accounts first
accounts.sort(
  compose(
    reverse(byBoolean(a => a.isPremium)),
    reverse(byBoolean(a => a.isVerified)),
    reverse(byBoolean(a => a.isActive))
  )
)
```

## Next Steps

- **[Advanced Comparators](./04-advanced.md)** - Case-insensitive, locale-specific sorting
- **[Patterns & Recipes](./05-patterns.md)** - Real-world solutions
- **[API Reference](./07-api-reference.md)** - Complete function catalog

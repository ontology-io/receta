# Basic Comparators

Basic comparators are the foundation of the Compare module. They create simple, reusable sorting functions for common scenarios.

## Overview

| Function | Purpose | Example |
|----------|---------|---------|
| `ascending(fn)` | Sort low to high | Numbers, dates, priority scores |
| `descending(fn)` | Sort high to low | Latest first, highest score |
| `natural(fn)` | Natural string order | File names, version numbers |
| `byKey(key)` | Sort by object property | Quick property-based sorting |

## ascending()

Sorts values in ascending order (low to high) based on an extracted value.

### Signature

```typescript
function ascending<T, C extends number | string | Date>(
  fn: (value: T) => C
): Comparator<T>
```

### When to Use

- Sorting numbers from smallest to largest
- Sorting strings alphabetically (A-Z)
- Sorting dates chronologically (oldest first)
- Default ordering for most lists

### Examples

#### Sorting Numbers

```typescript
import { ascending } from 'receta/compare'

const prices = [99.99, 49.99, 149.99, 29.99]
prices.sort(ascending(x => x))
// => [29.99, 49.99, 99.99, 149.99]
```

#### Sorting Objects by Number Property

```typescript
interface Product {
  name: string
  price: number
  stock: number
}

const products: Product[] = [
  { name: 'Keyboard', price: 80, stock: 15 },
  { name: 'Mouse', price: 25, stock: 30 },
  { name: 'Monitor', price: 300, stock: 5 }
]

// Sort by price (lowest first)
products.sort(ascending(p => p.price))
// => [Mouse ($25), Keyboard ($80), Monitor ($300)]

// Sort by stock (least in stock first)
products.sort(ascending(p => p.stock))
// => [Monitor (5), Keyboard (15), Mouse (30)]
```

#### Sorting Strings

```typescript
interface User {
  username: string
  email: string
}

const users: User[] = [
  { username: 'charlie', email: 'charlie@example.com' },
  { username: 'alice', email: 'alice@example.com' },
  { username: 'bob', email: 'bob@example.com' }
]

users.sort(ascending(u => u.username))
// => [alice, bob, charlie]
```

#### Sorting Dates

```typescript
interface Event {
  name: string
  date: Date
}

const events: Event[] = [
  { name: 'Launch', date: new Date('2024-03-01') },
  { name: 'Meeting', date: new Date('2024-02-15') },
  { name: 'Review', date: new Date('2024-02-20') }
]

events.sort(ascending(e => e.date))
// => [Meeting (Feb 15), Review (Feb 20), Launch (Mar 1)]
```

### Real-World: Stripe Payments

```typescript
interface Payment {
  id: string
  amount: number
  createdAt: Date
  status: string
}

// Sort payments by amount (smallest first)
payments.sort(ascending(p => p.amount))

// Sort by creation date (oldest first)
payments.sort(ascending(p => p.createdAt))
```

---

## descending()

Sorts values in descending order (high to low) based on an extracted value.

### Signature

```typescript
function descending<T, C extends number | string | Date>(
  fn: (value: T) => C
): Comparator<T>
```

### When to Use

- "Most recent first" date sorting
- "Highest score first" leaderboards
- "Most expensive first" price lists
- Reverse alphabetical order (Z-A)

### Examples

#### Sorting Numbers (Highest First)

```typescript
import { descending } from 'receta/compare'

const scores = [95, 87, 100, 92]
scores.sort(descending(x => x))
// => [100, 95, 92, 87]
```

#### Leaderboard

```typescript
interface Player {
  name: string
  score: number
  level: number
}

const players: Player[] = [
  { name: 'Alice', score: 1000, level: 5 },
  { name: 'Bob', score: 1500, level: 7 },
  { name: 'Charlie', score: 800, level: 4 }
]

// Highest score first
players.sort(descending(p => p.score))
// => [Bob (1500), Alice (1000), Charlie (800)]
```

#### Most Recent First

```typescript
interface BlogPost {
  title: string
  publishedAt: Date
  views: number
}

const posts: BlogPost[] = [
  { title: 'Intro to TypeScript', publishedAt: new Date('2024-01-15'), views: 100 },
  { title: 'Advanced Patterns', publishedAt: new Date('2024-02-20'), views: 250 },
  { title: 'Best Practices', publishedAt: new Date('2024-01-30'), views: 180 }
]

// Most recent posts first
posts.sort(descending(p => p.publishedAt))
// => [Advanced Patterns (Feb 20), Best Practices (Jan 30), Intro (Jan 15)]

// Most viewed first
posts.sort(descending(p => p.views))
// => [Advanced Patterns (250), Best Practices (180), Intro (100)]
```

### Real-World: GitHub Issues

```typescript
interface Issue {
  number: number
  title: string
  comments: number
  updatedAt: Date
}

// Most recently updated issues first
issues.sort(descending(i => i.updatedAt))

// Most discussed issues first
issues.sort(descending(i => i.comments))
```

---

## natural()

Sorts strings naturally, handling embedded numbers correctly.

### Signature

```typescript
function natural<T>(fn: (value: T) => string): Comparator<T>
```

### The Problem It Solves

Standard string sorting treats numbers lexicographically:

```typescript
// ❌ Lexicographic (wrong for numbers)
['file10.txt', 'file2.txt', 'file1.txt'].sort()
// => ['file1.txt', 'file10.txt', 'file2.txt']
//                    ↑ Wrong! 10 comes before 2
```

Natural sorting handles numbers within strings intelligently:

```typescript
// ✅ Natural sorting (correct)
import { natural } from 'receta/compare'

['file10.txt', 'file2.txt', 'file1.txt'].sort(natural(x => x))
// => ['file1.txt', 'file2.txt', 'file10.txt']
//                  ↑ Correct! 2 comes before 10
```

### When to Use

- File names with numbers
- Version numbers (v1.2, v1.10, v1.20)
- Invoice/order numbers (INV-001, INV-002, INV-010)
- Street addresses ("10 Main St", "2 Main St")
- Any string containing numbers that should sort numerically

### Examples

#### File Names

```typescript
import { natural } from 'receta/compare'

const files = [
  'image10.png',
  'image2.png',
  'image1.png',
  'image20.png'
]

files.sort(natural(x => x))
// => ['image1.png', 'image2.png', 'image10.png', 'image20.png']
```

#### Version Numbers

```typescript
interface Release {
  version: string
  date: Date
}

const releases: Release[] = [
  { version: 'v1.10.0', date: new Date('2024-03-01') },
  { version: 'v1.2.0', date: new Date('2024-01-15') },
  { version: 'v1.20.0', date: new Date('2024-04-10') },
  { version: 'v2.0.0', date: new Date('2024-05-01') }
]

releases.sort(natural(r => r.version))
// => [v1.2.0, v1.10.0, v1.20.0, v2.0.0]
```

#### Invoice Numbers

```typescript
interface Invoice {
  number: string
  amount: number
}

const invoices: Invoice[] = [
  { number: 'INV-10', amount: 500 },
  { number: 'INV-2', amount: 250 },
  { number: 'INV-100', amount: 1000 }
]

invoices.sort(natural(i => i.number))
// => [INV-2, INV-10, INV-100]
```

### Real-World: File Browser

```typescript
interface FileEntry {
  name: string
  type: 'file' | 'directory'
  size: number
}

const entries: FileEntry[] = [
  { name: 'backup-10.zip', type: 'file', size: 1024 },
  { name: 'backup-2.zip', type: 'file', size: 512 },
  { name: 'backup-1.zip', type: 'file', size: 256 },
  { name: 'backup-20.zip', type: 'file', size: 2048 }
]

// Natural sort by filename
entries.sort(natural(e => e.name))
// => [backup-1.zip, backup-2.zip, backup-10.zip, backup-20.zip]
```

---

## byKey()

Convenience function for sorting objects directly by a property key.

### Signature

```typescript
function byKey<T, K extends keyof T>(key: K): Comparator<T>
```

### When to Use

- Quick sorting by a single object property
- When you don't need to transform the value
- Cleaner syntax for simple property access

### Comparison with `ascending()`

```typescript
// These are equivalent:
products.sort(ascending(p => p.price))
products.sort(byKey('price'))

// byKey() is shorter for simple cases
// ascending() is more flexible (can transform values)
```

### Examples

#### Sort by Number Property

```typescript
import { byKey } from 'receta/compare'

interface Product {
  id: string
  name: string
  price: number
}

const products: Product[] = [
  { id: 'c', name: 'Monitor', price: 300 },
  { id: 'a', name: 'Mouse', price: 25 },
  { id: 'b', name: 'Keyboard', price: 80 }
]

// Sort by price
products.sort(byKey('price'))
// => [Mouse (25), Keyboard (80), Monitor (300)]
```

#### Sort by String Property

```typescript
// Sort by name (alphabetically)
products.sort(byKey('name'))
// => [Keyboard, Monitor, Mouse]

// Sort by id
products.sort(byKey('id'))
// => [a, b, c]
```

#### Sort by Date Property

```typescript
interface Event {
  name: string
  date: Date
  location: string
}

const events: Event[] = [
  { name: 'Conference', date: new Date('2024-03-15'), location: 'NYC' },
  { name: 'Workshop', date: new Date('2024-02-10'), location: 'SF' },
  { name: 'Meetup', date: new Date('2024-04-05'), location: 'Austin' }
]

// Sort by date (oldest first)
events.sort(byKey('date'))
// => [Workshop (Feb 10), Conference (Mar 15), Meetup (Apr 5)]
```

### Real-World: Data Grid

```typescript
interface Employee {
  id: number
  name: string
  department: string
  salary: number
  hireDate: Date
}

// User clicks column header to sort
function sortByColumn(column: keyof Employee) {
  employees.sort(byKey(column))
}

sortByColumn('salary')    // Sort by salary
sortByColumn('hireDate')  // Sort by hire date
sortByColumn('name')      // Sort by name
```

---

## Comparison Table

| Comparator | Use For | Order | Example |
|------------|---------|-------|---------|
| `ascending(fn)` | Numbers, dates, computed values | Low → High | Prices, ages, dates |
| `descending(fn)` | Reverse ordering | High → Low | Scores, recent dates |
| `natural(fn)` | Strings with numbers | Numeric-aware | Files, versions |
| `byKey(key)` | Simple property access | Low → High | Quick object sorting |

## Common Patterns

### Sort by Computed Value

```typescript
interface Task {
  priority: number
  urgency: number
}

// Sort by combined score
tasks.sort(ascending(t => t.priority * t.urgency))
```

### Sort by String Length

```typescript
const words = ['elephant', 'cat', 'dog', 'butterfly']
words.sort(ascending(w => w.length))
// => ['cat', 'dog', 'elephant', 'butterfly']
```

### Sort by Nested Property

```typescript
interface User {
  profile: {
    age: number
  }
}

users.sort(ascending(u => u.profile.age))
```

### Toggle Sort Direction

```typescript
function getSortComparator(direction: 'asc' | 'desc') {
  return direction === 'asc'
    ? ascending(x => x.price)
    : descending(x => x.price)
}
```

## Next Steps

- **[Combinators](./02-combinators.md)** - Combine comparators for multi-level sorting
- **[Type-Specific](./03-type-specific.md)** - Specialized comparators for dates, numbers, strings
- **[Patterns](./05-patterns.md)** - Real-world recipes and solutions

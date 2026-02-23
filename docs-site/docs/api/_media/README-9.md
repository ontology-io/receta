# Compare Documentation

Complete guide to building type-safe, composable comparators for sorting operations.

## Quick Start

```typescript
import { compose, ascending, descending, byDate } from 'receta/compare'

interface Issue {
  status: 'open' | 'closed'
  priority: number
  createdAt: Date
}

// Multi-level sorting: status (open first) → priority (high first) → date (oldest first)
issues.sort(
  compose(
    ascending(i => i.status === 'open' ? 0 : 1),
    descending(i => i.priority),
    byDate(i => i.createdAt)
  )
)
```

---

## Documentation Structure

### 📚 Learning Path

**New to Compare?** Follow this order:

1. **[Overview](./00-overview.md)** (15 min) - Why Compare? When to use it?
2. **[Basic Comparators](./01-basic-comparators.md)** (20 min) - `ascending`, `descending`, `natural`, `byKey`
3. **[Combinators](./02-combinators.md)** (25 min) - Multi-level sorting with `compose`, null handling
4. **[Type-Specific](./03-type-specific.md)** (20 min) - `byDate`, `byNumber`, `byString`, `byBoolean`
5. **[Advanced](./04-advanced.md)** (15 min) - Case-insensitive and locale-aware sorting
6. **[Patterns & Recipes](./05-patterns.md)** (30 min) - Copy-paste solutions for real-world scenarios
7. **[Migration Guide](./06-migration.md)** (20 min) - Converting existing `Array.sort()` code
8. **[API Reference](./07-api-reference.md)** (Quick lookup) - Complete function catalog

**Total time:** ~2.5 hours for complete mastery

---

### 📖 By Topic

#### I want to understand...

- **Why use Compare?** → [Overview](./00-overview.md#the-problem-sorting-is-harder-than-it-looks)
- **How comparators work** → [Overview](./00-overview.md#architecture-how-it-works)
- **When to use vs Array.sort()** → [Overview](./00-overview.md#when-to-use-compare)
- **Multi-level sorting** → [Combinators](./02-combinators.md#compose)
- **Null handling** → [Combinators](./02-combinators.md#nullsfirst)
- **Case-insensitive sorting** → [Advanced](./04-advanced.md#caseinsensitive)
- **International sorting** → [Advanced](./04-advanced.md#localecompare)

#### I want examples for...

- **GitHub issues** → [Patterns](./05-patterns.md#github-issues-management)
- **Stripe payments** → [Patterns](./05-patterns.md#stripe-payment-dashboard)
- **Data tables** → [Patterns](./05-patterns.md#data-table-with-column-sorting)
- **File browsers** → [Patterns](./05-patterns.md#file-browser)
- **E-commerce products** → [Patterns](./05-patterns.md#e-commerce-product-listings)
- **Task management** → [Patterns](./05-patterns.md#task-management)
- **Search results** → [Patterns](./05-patterns.md#search-results)
- **Leaderboards** → [Patterns](./05-patterns.md#leaderboard--rankings)

#### I need to...

- **Sort by one field** → [Basic Comparators](./01-basic-comparators.md)
- **Sort by multiple fields** → [Combinators](./02-combinators.md#compose)
- **Handle null values** → [Combinators](./02-combinators.md#nullsfirst)
- **Sort dates** → [Type-Specific](./03-type-specific.md#bydate)
- **Sort numbers** → [Type-Specific](./03-type-specific.md#bynumber)
- **Sort file names** → [Basic Comparators](./01-basic-comparators.md#natural)
- **Toggle sort direction** → [Combinators](./02-combinators.md#reverse)
- **Migrate existing code** → [Migration Guide](./06-migration.md)
- **Find the right function** → [API Reference](./07-api-reference.md#decision-tree-which-function-do-i-need)

---

## Key Concepts

### Comparator Type

All Compare functions work with the `Comparator<T>` type:

```typescript
type Comparator<T> = (a: T, b: T) => number

// Returns:
// < 0  if a should come before b
//   0  if a and b are equal
// > 0  if a should come after b
```

### Building Blocks Approach

Compare uses a **compositional architecture**:

```
Simple Comparators          Combinators              Complex Sorting
─────────────────────      ─────────────────        ─────────────────
ascending()                     +                    Multi-level
descending()                                         sorting logic
byDate()                   compose()
natural()                  reverse()
byKey()                    nullsFirst()
                           nullsLast()
```

Combine simple building blocks to solve complex sorting problems.

---

## Common Patterns

### Single Field Sorting

```typescript
import { ascending, descending } from 'receta/compare'

// Numbers, low to high
products.sort(ascending(p => p.price))

// Dates, most recent first
posts.sort(descending(p => p.publishedAt))
```

### Multi-Level Sorting

```typescript
import { compose, ascending, descending } from 'receta/compare'

// Department (asc) → Salary (desc) → Name (asc)
employees.sort(
  compose(
    ascending(e => e.department),
    descending(e => e.salary),
    ascending(e => e.name)
  )
)
```

### Natural String Sorting

```typescript
import { natural } from 'receta/compare'

// Correctly sorts: file1, file2, file10 (not file1, file10, file2)
files.sort(natural(f => f.name))
```

### Null Handling

```typescript
import { ascending, nullsFirst, nullsLast } from 'receta/compare'

// Unassigned tasks first
tasks.sort(nullsFirst(ascending(t => t.assignee ?? '')))

// Active users first, inactive at end
users.sort(nullsLast(ascending(u => u.lastLogin ?? new Date(0))))
```

### Case-Insensitive Sorting

```typescript
import { caseInsensitive } from 'receta/compare'

// 'App.tsx' and 'app.tsx' sorted together
files.sort(caseInsensitive(f => f.name))
```

---

## Quick Reference

### Most Common Functions

| Function | Use Case | Example |
|----------|----------|---------|
| `ascending(fn)` | Low → High | Prices, ages, alphabetical |
| `descending(fn)` | High → Low | Scores, recent dates |
| `compose(...fns)` | Multi-level sort | Status → Priority → Date |
| `byDate(fn)` | Chronological | Event timelines |
| `natural(fn)` | File names, versions | file2 before file10 |
| `caseInsensitive(fn)` | User-facing strings | Filenames, usernames |
| `nullsFirst(fn)` | Missing data first | Unassigned tasks |

### Quick Decision Tree

```
Need to sort by...

One field?
  → ascending() or descending()

Multiple fields?
  → compose(first, second, third)

Strings with numbers?
  → natural()

Dates?
  → byDate()

Need to ignore case?
  → caseInsensitive()

Have null values?
  → nullsFirst() or nullsLast()

Want to reverse?
  → reverse(comparator)
```

---

## Real-World Examples

### GitHub Issue Triage

```typescript
import { compose, ascending, nullsFirst, descending } from 'receta/compare'

const statusOrder = { open: 0, closed: 1 }
const priorityOrder = { high: 0, medium: 1, low: 2 }

issues.sort(
  compose(
    ascending(i => statusOrder[i.status]),      // Open first
    nullsFirst(ascending(i => i.assignee)),     // Unassigned first
    ascending(i => priorityOrder[i.priority]),  // High priority first
    ascending(i => i.createdAt)                 // Oldest first
  )
)
```

### Stripe Transaction List

```typescript
import { compose, ascending, descending } from 'receta/compare'

const statusPriority = { failed: 0, pending: 1, succeeded: 2 }

transactions.sort(
  compose(
    ascending(t => statusPriority[t.status]), // Failed first (alerts)
    descending(t => t.amount),                // Largest first
    descending(t => t.created)                // Most recent first
  )
)
```

### File Browser

```typescript
import { compose, ascending, natural } from 'receta/compare'

files.sort(
  compose(
    ascending(f => f.type === 'directory' ? 0 : 1), // Directories first
    natural(f => f.name)                            // Natural name order
  )
)
```

---

## Best Practices

### ✅ Do

- Extract reusable comparators for common sorting logic
- Use `compose()` for multi-level sorting
- Use type-specific comparators (`byDate`, `byNumber`) for clarity
- Handle null values explicitly with `nullsFirst`/`nullsLast`
- Use `natural()` for strings with embedded numbers
- Use `caseInsensitive()` for user-facing content

### ❌ Don't

- Mutate data inside comparator functions
- Mix types in extraction functions (Date | string)
- Forget to handle null/undefined values
- Use lexicographic sort for version numbers (use `natural()`)
- Write custom comparison logic (use existing comparators)
- Ignore case sensitivity (be explicit with `caseInsensitive()`)

---

## TypeScript Tips

### Type Inference

```typescript
// ✅ TypeScript infers types correctly
const users: User[] = [/*...*/]
users.sort(ascending(u => u.age))
//                    ^--- TypeScript knows u is User

// ✅ Generic comparators
function sortByPriority<T extends { priority: number }>(items: T[]) {
  return items.sort(descending(i => i.priority))
}
```

### Reusable Comparators

```typescript
// Extract comparators for reuse
const byLastName = ascending((person: { lastName: string }) => person.lastName)
const byCreatedDate = byDate((item: { createdAt: Date }) => item.createdAt)

// Use across different types
users.sort(byLastName)
employees.sort(byLastName)
posts.sort(byCreatedDate)
comments.sort(byCreatedDate)
```

---

## Performance

Compare comparators are **highly optimized**:

- Minimal overhead vs hand-written comparisons
- No runtime type checking
- Inline-able by JavaScript engines
- Tree-shakeable (import only what you use)

For **very large arrays** (100k+ items):
- Consider memoizing extraction functions if expensive
- Use `byKey()` for direct property access
- Profile before optimizing

---

## Testing

```typescript
import { describe, it, expect } from 'bun:test'
import { ascending, compose, byDate } from 'receta/compare'

describe('Product sorting', () => {
  it('sorts by price ascending', () => {
    const products = [
      { name: 'Keyboard', price: 80 },
      { name: 'Mouse', price: 25 },
      { name: 'Monitor', price: 300 }
    ]

    const sorted = [...products].sort(ascending(p => p.price))

    expect(sorted[0].name).toBe('Mouse')
    expect(sorted[2].name).toBe('Monitor')
  })

  it('sorts by category then price', () => {
    const comparator = compose(
      ascending(p => p.category),
      ascending(p => p.price)
    )

    const sorted = products.sort(comparator)
    // Assert expected order
  })
})
```

---

## Getting Help

### Check These First

1. **[API Reference](./07-api-reference.md#decision-tree-which-function-do-i-need)** - Decision tree for finding the right function
2. **[Patterns](./05-patterns.md)** - Copy-paste solutions for common scenarios
3. **[Migration Guide](./06-migration.md)** - Converting existing code

### Common Issues

**Q: My sort isn't stable / order changes on re-sort**
A: JavaScript's `.sort()` is stable. If order changes, your comparator returns inconsistent results.

**Q: Nulls appear in wrong position**
A: Use `nullsFirst()` or `nullsLast()` explicitly.

**Q: Case-sensitive sort looks wrong**
A: Use `caseInsensitive()` for user-facing strings.

**Q: File names sort wrong (file10 before file2)**
A: Use `natural()` instead of `ascending()`.

**Q: International names don't sort correctly**
A: Use `localeCompare(fn, locale)` for language-specific rules.

---

## Next Steps

**Complete beginner?**
→ Start with [Overview](./00-overview.md)

**Know sorting basics?**
→ Jump to [Patterns](./05-patterns.md) for copy-paste solutions

**Migrating existing code?**
→ Follow [Migration Guide](./06-migration.md)

**Need specific function?**
→ Check [API Reference](./07-api-reference.md)

**Building something specific?**
→ Search [Patterns](./05-patterns.md) for your use case

---

## Related Modules

- **[Result](../result/README.md)** - Type-safe error handling
- **[Option](../option/README.md)** - Nullable value handling  
- **[Predicate](../predicate/README.md)** - Composable filtering
- **[Collection](../collection/README.md)** - Advanced array operations

---

**Compare module version:** 1.0.0  
**Last updated:** 2024-01-22  
**Feedback:** Report issues or suggest improvements

# Migration Guide: From Array.sort() to Compare

Step-by-step guide to refactoring existing sort code to use Compare module.

## Why Migrate?

**Before (Array.sort callback):**
```typescript
users.sort((a, b) => {
  if (a.department < b.department) return -1
  if (a.department > b.department) return 1
  if (a.salary > b.salary) return -1
  if (a.salary < b.salary) return 1
  return a.name.localeCompare(b.name)
})
```

**After (Compare module):**
```typescript
import { compose, ascending, descending, caseInsensitive } from 'receta/compare'

users.sort(
  compose(
    ascending(u => u.department),
    descending(u => u.salary),
    caseInsensitive(u => u.name)
  )
)
```

✅ More readable  
✅ Type-safe  
✅ Reusable  
✅ Testable  
✅ Composable

## Step 1: Identify Sortable Fields

Find all `Array.sort()` calls in your codebase:

```bash
# Search for sort callbacks
grep -r "\.sort\((a, b)" src/
grep -r "\.sort\(function" src/
```

Document each sort's logic:
- What fields are being compared?
- What's the sort order (asc/desc)?
- Are nulls handled?
- Is it multi-level?

## Step 2: Replace Simple Sorts

### Pattern 1: Single Field Ascending

```typescript
// Before
numbers.sort((a, b) => a - b)

// After
import { ascending } from 'receta/compare'
numbers.sort(ascending(x => x))
```

### Pattern 2: Single Field Descending

```typescript
// Before
scores.sort((a, b) => b - a)

// After
import { descending } from 'receta/compare'
scores.sort(descending(x => x))
```

### Pattern 3: Object Property

```typescript
// Before
users.sort((a, b) => a.age - b.age)

// After
import { ascending } from 'receta/compare'
users.sort(ascending(u => u.age))

// Or use byKey for direct property access
import { byKey } from 'receta/compare'
users.sort(byKey('age'))
```

### Pattern 4: String Comparison

```typescript
// Before
names.sort((a, b) => a.localeCompare(b))

// After
import { ascending } from 'receta/compare'
names.sort(ascending(x => x))
```

### Pattern 5: Date Comparison

```typescript
// Before
events.sort((a, b) => a.date.getTime() - b.date.getTime())

// After
import { byDate } from 'receta/compare'
events.sort(byDate(e => e.date))
```

## Step 3: Replace Multi-Level Sorts

### Pattern: Nested If Statements

```typescript
// Before
items.sort((a, b) => {
  if (a.priority !== b.priority) {
    return b.priority - a.priority // Higher priority first
  }
  if (a.status !== b.status) {
    return a.status.localeCompare(b.status)
  }
  return a.createdAt.getTime() - b.createdAt.getTime()
})

// After
import { compose, descending, ascending, byDate } from 'receta/compare'

items.sort(
  compose(
    descending(i => i.priority),
    ascending(i => i.status),
    byDate(i => i.createdAt)
  )
)
```

### Pattern: Ternary Chain

```typescript
// Before
products.sort((a, b) =>
  a.category !== b.category
    ? a.category.localeCompare(b.category)
    : b.rating !== a.rating
    ? b.rating - a.rating
    : a.price - b.price
)

// After
import { compose, ascending, descending } from 'receta/compare'

products.sort(
  compose(
    ascending(p => p.category),
    descending(p => p.rating),
    ascending(p => p.price)
  )
)
```

## Step 4: Handle Null Values

### Pattern: Nullish Coalescing

```typescript
// Before
users.sort((a, b) => {
  const aVal = a.lastLogin ?? new Date(0)
  const bVal = b.lastLogin ?? new Date(0)
  return aVal.getTime() - bVal.getTime()
})

// After
import { ascending, nullsFirst } from 'receta/compare'

users.sort(nullsFirst(ascending(u => u.lastLogin ?? new Date(0))))
```

### Pattern: Explicit Null Checks

```typescript
// Before
items.sort((a, b) => {
  if (a.value === null && b.value === null) return 0
  if (a.value === null) return -1
  if (b.value === null) return 1
  return a.value - b.value
})

// After
import { ascending, nullsFirst } from 'receta/compare'

items.sort(nullsFirst(ascending(i => i.value ?? 0)))
```

## Step 5: Handle String Case

### Pattern: toLowerCase() Comparison

```typescript
// Before
files.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()))

// After
import { caseInsensitive } from 'receta/compare'

files.sort(caseInsensitive(f => f.name))
```

### Pattern: Case-Sensitive with Locale

```typescript
// Before
const collator = new Intl.Collator('de-DE')
names.sort((a, b) => collator.compare(a, b))

// After
import { localeCompare } from 'receta/compare'

names.sort(localeCompare(x => x, 'de-DE'))
```

## Step 6: Handle Natural Sorting

### Pattern: Numeric String Comparison

```typescript
// Before (wrong - lexicographic)
files.sort((a, b) => a.name.localeCompare(b.name))
// => ['file1.txt', 'file10.txt', 'file2.txt'] ❌

// After
import { natural } from 'receta/compare'

files.sort(natural(f => f.name))
// => ['file1.txt', 'file2.txt', 'file10.txt'] ✅
```

## Step 7: Extract Reusable Comparators

Before:
```typescript
// Repeated in multiple places
function sortUsersByName(users: User[]) {
  return users.sort((a, b) => a.lastName.localeCompare(b.lastName))
}

function sortEmployeesByName(employees: Employee[]) {
  return employees.sort((a, b) => a.lastName.localeCompare(b.lastName))
}
```

After:
```typescript
import { ascending } from 'receta/compare'

// Reusable comparator
const byLastName = ascending((person: { lastName: string }) => person.lastName)

// Use everywhere
function sortUsersByName(users: User[]) {
  return users.sort(byLastName)
}

function sortEmployeesByName(employees: Employee[]) {
  return employees.sort(byLastName)
}
```

## Step 8: Parameterize Sort Direction

Before:
```typescript
function sortProducts(products: Product[], direction: 'asc' | 'desc') {
  return products.sort((a, b) => {
    const diff = a.price - b.price
    return direction === 'asc' ? diff : -diff
  })
}
```

After:
```typescript
import { ascending, descending } from 'receta/compare'

function sortProducts(products: Product[], direction: 'asc' | 'desc') {
  const comparator = direction === 'asc'
    ? ascending(p => p.price)
    : descending(p => p.price)

  return products.sort(comparator)
}
```

## Migration Checklist

For each `Array.sort()` in your codebase:

- [ ] Identify all fields being compared
- [ ] Determine sort order for each field (asc/desc)
- [ ] Check for null/undefined handling
- [ ] Look for string case handling
- [ ] Check if natural sorting is needed
- [ ] Identify if it's single or multi-level
- [ ] Replace with appropriate Compare functions
- [ ] Test that sort order is identical
- [ ] Extract reusable comparators if repeated
- [ ] Update tests to use new comparators

## Common Pitfalls

### Pitfall 1: Forgetting to Return from Arrow Functions

```typescript
// ❌ Wrong
const comparator = ascending(x => { x.value })

// ✅ Correct
const comparator = ascending(x => x.value)
```

### Pitfall 2: Mutating During Comparison

```typescript
// ❌ Don't mutate in comparator
items.sort(ascending(x => {
  x.viewed = true  // Side effect!
  return x.priority
}))

// ✅ Pure extraction
items.sort(ascending(x => x.priority))
```

### Pitfall 3: Wrong compose() Order

```typescript
// ❌ Wrong order (priority before status)
compose(
  ascending(x => x.priority),
  ascending(x => x.status)
)

// ✅ Correct (status before priority)
compose(
  ascending(x => x.status),
  ascending(x => x.priority)
)

// compose() applies in order: first has highest priority
```

### Pitfall 4: Comparing Different Types

```typescript
// ❌ Mixing types
ascending(x => x.date ?? 'never')  // Date | string

// ✅ Consistent types
ascending(x => x.date ?? new Date(0))  // Always Date
```

## Testing Your Migration

### Unit Test Template

```typescript
import { describe, it, expect } from 'bun:test'
import { yourComparator } from './comparators'

describe('Migration: Product sorting', () => {
  it('maintains same order as original implementation', () => {
    const products = [/* test data */]

    // Original implementation
    const originalSort = [...products].sort((a, b) => /* old logic */)

    // New implementation
    const newSort = [...products].sort(yourComparator)

    expect(newSort).toEqual(originalSort)
  })

  it('handles edge cases', () => {
    const edgeCases = [/* null, empty, duplicates */]
    const sorted = edgeCases.sort(yourComparator)
    expect(sorted).toBeDefined()
  })
})
```

## Incremental Migration Strategy

1. **Start with leaf nodes** - Migrate simplest sorts first
2. **One file at a time** - Don't refactor everything at once
3. **Test thoroughly** - Ensure sort order is identical
4. **Extract patterns** - Create reusable comparators
5. **Document decisions** - Note any behavioral changes

## Next Steps

- **[Patterns & Recipes](./05-patterns.md)** - Copy-paste solutions
- **[API Reference](./07-api-reference.md)** - Complete function catalog
- **[Basic Comparators](./01-basic-comparators.md)** - Foundation functions

# Migration Guide: From Manual Collection Operations

> Step-by-step guide to refactoring manual loops, grouping, and change detection to use Collection module patterns.

## Why Migrate?

### Before: Manual Collection Operations

```typescript
// ❌ Problems:
// Manual hierarchical grouping
const commentsByUserAndPost: Record<number, Record<number, Comment[]>> = {}
for (const comment of comments) {
  if (!commentsByUserAndPost[comment.userId]) {
    commentsByUserAndPost[comment.userId] = {}
  }
  if (!commentsByUserAndPost[comment.userId][comment.postId]) {
    commentsByUserAndPost[comment.userId][comment.postId] = []
  }
  commentsByUserAndPost[comment.userId][comment.postId].push(comment)
}

// Manual change detection
const added = newUsers.filter(nu => !oldUsers.some(ou => ou.id === nu.id))
const removed = oldUsers.filter(ou => !newUsers.some(nu => nu.id === ou.id))
const updated = newUsers.filter(nu => {
  const old = oldUsers.find(ou => ou.id === nu.id)
  return old && JSON.stringify(old) !== JSON.stringify(nu)
})

// Manual pagination
const start = (page - 1) * pageSize
const items = allItems.slice(start, start + pageSize)
const hasMore = start + pageSize < allItems.length
```

**Issues:**
- 🔴 **Verbose**: 30+ lines for common operations
- 🔴 **Error-prone**: Easy to get nesting/indexing wrong
- 🔴 **Not reusable**: Logic buried in larger functions
- 🔴 **Hard to test**: Complex logic mixed with business code
- 🔴 **Silent bugs**: Duplicate keys overwrite, off-by-one errors

### After: Collection Module

```typescript
// ✅ Benefits:
import { nest, diff, paginate, indexByUnique } from 'receta/collection'

// Hierarchical grouping - one line
const commentsByUserAndPost = nest(comments, ['userId', 'postId'])

// Change detection - explicit and complete
const changes = diff(oldUsers, newUsers, u => u.id)
// => { added: [...], removed: [...], updated: [{old, new}], unchanged: [...] }

// Pagination - handles all edge cases
const page = paginate(allItems, { page, pageSize })
// => { items: [...], page, pageSize, total, hasNext, hasPrevious }

// Safe indexing - errors on duplicates
const usersById = indexByUnique(users, u => u.id)
// => Ok({...}) or Err(DuplicateKeyError)
```

**Wins:**
- ✅ **Concise**: 1-2 lines vs 30+
- ✅ **Type-safe**: Proper TypeScript inference
- ✅ **Error handling**: Explicit Result types
- ✅ **Testable**: Pure functions
- ✅ **Discoverable**: All patterns in one module

---

## Migration Strategy

### Phase 1: Identify Patterns

Look for:
1. **Nested loops** creating hierarchical structures
2. **Change detection** logic (comparing old/new datasets)
3. **Pagination logic** (slicing, page calculations)
4. **Index building** (`Record<string, T>` from arrays)
5. **Set operations** on object arrays

### Phase 2: Replace Simple Operations

Start with single-use manual operations.

### Phase 3: Extract Complex Patterns

Handle multi-level grouping and custom comparisons.

### Phase 4: Add Error Handling

Leverage Result types for safer code.

---

## Step-by-Step Examples

### Example 1: Single-Level Grouping

#### Before

```typescript
// Manual grouping by category
const productsByCategory: Record<string, Product[]> = {}
for (const product of products) {
  if (!productsByCategory[product.category]) {
    productsByCategory[product.category] = []
  }
  productsByCategory[product.category].push(product)
}
```

#### Step 1: Identify Pattern

- Pattern: Group by single property
- Type: Flat grouping

#### Step 2: Use Remeda (Not Collection)

```typescript
import * as R from 'remeda'

// ✅ For single-level grouping, use Remeda
const productsByCategory = R.groupBy(products, p => p.category)
```

**Rule**: Use Collection's `nest()` only for **multi-level hierarchies**.

---

### Example 2: Multi-Level Grouping

#### Before

```typescript
// Group events by repository, then by type
const eventsByRepoAndType: Record<string, Record<string, Event[]>> = {}
for (const event of events) {
  if (!eventsByRepoAndType[event.repo]) {
    eventsByRepoAndType[event.repo] = {}
  }
  if (!eventsByRepoAndType[event.repo][event.type]) {
    eventsByRepoAndType[event.repo][event.type] = []
  }
  eventsByRepoAndType[event.repo][event.type].push(event)
}
```

#### Step 1: Identify Pattern

- Pattern: Two-level nesting
- Type: Hierarchical grouping

#### Step 2: Use `nest()`

```typescript
import { nest } from 'receta/collection'

const eventsByRepoAndType = nest(events, ['repo', 'type'])
// => { repo_foo: { push: [...], pr: [...] }, repo_bar: {...} }
```

#### Advanced: Group by Derived Value

```typescript
// Group by repo, then by date
const eventsByRepoAndDate = nest(events, [
  'repo',
  e => e.timestamp.slice(0, 10) // Extract date
])
// => { repo_foo: { '2024-01-01': [...], '2024-01-02': [...] } }
```

---

### Example 3: Change Detection

#### Before

```typescript
// Detect added/removed/updated users
const added = newUsers.filter(nu =>
  !oldUsers.some(ou => ou.id === nu.id)
)

const removed = oldUsers.filter(ou =>
  !newUsers.some(nu => nu.id === ou.id)
)

const updated = newUsers.filter(nu => {
  const old = oldUsers.find(ou => ou.id === nu.id)
  return old && JSON.stringify(old) !== JSON.stringify(nu)
}).map(nu => ({
  old: oldUsers.find(ou => ou.id === nu.id)!,
  new: nu
}))

const unchanged = newUsers.filter(nu => {
  const old = oldUsers.find(ou => ou.id === nu.id)
  return old && JSON.stringify(old) === JSON.stringify(nu)
})
```

**Problems:**
- O(n²) complexity (nested `some`/`find`)
- JSON.stringify for comparison (unreliable)
- Repeated logic across 4 separate filters

#### Step 1: Use `diff()`

```typescript
import { diff } from 'receta/collection'

const changes = diff(oldUsers, newUsers, u => u.id)
// => {
//   added: User[],
//   removed: User[],
//   updated: { old: User, new: User }[],
//   unchanged: User[]
// }
```

**Wins:**
- O(n) complexity
- Proper deep equality
- All categories in one call

#### Step 2: Handle Changes

```typescript
// Send notifications for changes
for (const user of changes.added) {
  sendEmail(user.email, 'Welcome!')
}

for (const { old, new: updated } of changes.updated) {
  if (old.status !== updated.status) {
    sendEmail(updated.email, `Status changed to ${updated.status}`)
  }
}

for (const user of changes.removed) {
  archiveUser(user.id)
}
```

#### Advanced: Custom Equality

```typescript
// Ignore 'lastSeen' field when comparing
const changes = diff(
  oldUsers,
  newUsers,
  u => u.id,
  {
    equals: (a, b) => {
      const { lastSeen: _, ...aRest } = a
      const { lastSeen: __, ...bRest } = b
      return R.isDeepEqual(aRest, bRest)
    }
  }
)
```

---

### Example 4: Offset Pagination

#### Before

```typescript
// Manual pagination
const page = Number(req.query.page) || 1
const pageSize = 20
const start = (page - 1) * pageSize
const end = start + pageSize

const items = allItems.slice(start, end)
const total = allItems.length
const totalPages = Math.ceil(total / pageSize)
const hasNext = page < totalPages
const hasPrevious = page > 1

res.json({ items, page, pageSize, total, totalPages, hasNext, hasPrevious })
```

**Problems:**
- Off-by-one errors (start/end calculations)
- Edge cases (page 0, negative, beyond total)
- Repeated logic across endpoints

#### Step 1: Use `paginate()`

```typescript
import { paginate } from 'receta/collection'

const result = paginate(allItems, {
  page: Number(req.query.page) || 1,
  pageSize: 20
})

res.json(result)
// => {
//   items: [...],
//   page: 1,
//   pageSize: 20,
//   total: 100,
//   totalPages: 5,
//   hasNext: true,
//   hasPrevious: false
// }
```

**Wins:**
- Handles page 0 → defaults to page 1
- Empty arrays → sensible defaults
- Consistent metadata format

---

### Example 5: Cursor Pagination

#### Before

```typescript
// Manual cursor-based pagination
const cursorValue = req.query.cursor
const limit = Number(req.query.limit) || 50

let items: Event[]
if (cursorValue) {
  const cursorIndex = events.findIndex(e => e.id === cursorValue)
  if (cursorIndex === -1) {
    return res.status(400).json({ error: 'Invalid cursor' })
  }
  items = events.slice(cursorIndex + 1, cursorIndex + 1 + limit)
} else {
  items = events.slice(0, limit)
}

const hasMore = items.length === limit
const nextCursor = hasMore ? items[items.length - 1].id : null

res.json({ items, nextCursor, hasMore })
```

**Problems:**
- Manual index finding
- Edge cases (invalid cursor, end of list)
- Inconsistent error handling

#### Step 1: Use `paginateCursor()`

```typescript
import { paginateCursor } from 'receta/collection'

const result = paginateCursor(
  events,
  e => e.id,
  {
    cursor: req.query.cursor as string | undefined,
    limit: Number(req.query.limit) || 50
  }
)

res.json(result)
// => {
//   items: Event[],
//   nextCursor: string | null,
//   hasMore: boolean
// }
```

**Wins:**
- Handles missing/invalid cursor → starts from beginning
- Proper boundary handling
- Type-safe cursor extraction

---

### Example 6: Index Building

#### Before

```typescript
// Manual indexing - silently overwrites duplicates
const usersById: Record<string, User> = {}
for (const user of users) {
  usersById[user.id] = user // Lost data if duplicate!
}

// Manual deduplication
const seen = new Set<string>()
const uniqueUsers: User[] = []
for (const user of users) {
  if (!seen.has(user.id)) {
    seen.add(user.id)
    uniqueUsers.push(user)
  }
}
```

**Problems:**
- Duplicates silently overwrite → data loss
- No error on collision
- Manual deduplication is verbose

#### Step 1: Use `indexByUnique()`

```typescript
import { indexByUnique } from 'receta/collection'
import { unwrapOr, isOk } from 'receta/result'

// ✅ Error on duplicates
const result = indexByUnique(users, u => u.id)

if (isOk(result)) {
  const usersById = result.value
} else {
  console.error(`Duplicate user ID: ${result.error.key}`)
}
```

#### Step 2: Choose Collision Strategy

```typescript
// Keep first occurrence
const byId = indexByUnique(users, u => u.id, { onCollision: 'first' })

// Keep last occurrence
const byId = indexByUnique(users, u => u.id, { onCollision: 'last' })

// Error on duplicates (default)
const byId = indexByUnique(users, u => u.id, { onCollision: 'error' })
```

**Use Cases:**
- `'error'`: Critical data (user IDs, order IDs)
- `'first'`: Preserve original
- `'last'`: Override with latest

---

### Example 7: Set Operations

#### Before

```typescript
// Manual union - creates duplicates!
const allUsers = [...activeUsers, ...pendingUsers]

// Manual deduplication
const uniqueUsers = allUsers.filter((user, index, self) =>
  self.findIndex(u => u.id === user.id) === index
)

// Manual intersection
const both = activeUsers.filter(au =>
  pendingUsers.some(pu => pu.id === au.id)
)

// Manual difference
const onlyActive = activeUsers.filter(au =>
  !pendingUsers.some(pu => pu.id === au.id)
)
```

**Problems:**
- O(n²) complexity
- Repeated custom equality logic
- Not reusable

#### Step 1: Use Set Operations

```typescript
import { union, intersect, difference, symmetricDiff } from 'receta/collection'

const byId = (a: User, b: User) => a.id === b.id

// All users (no duplicates)
const allUsers = union(activeUsers, pendingUsers, byId)

// Users in both lists
const both = intersect(activeUsers, pendingUsers, byId)

// Only in active
const onlyActive = difference(activeUsers, pendingUsers, byId)

// In one list but not both
const exclusive = symmetricDiff(activeUsers, pendingUsers, byId)
```

**Wins:**
- O(n) complexity
- Reusable equality function
- Clear intent

---

### Example 8: Nested Property Grouping

#### Before

```typescript
// Group orders by customer country
const ordersByCountry: Record<string, Order[]> = {}
for (const order of orders) {
  const country = order.customer.address.country
  if (!ordersByCountry[country]) {
    ordersByCountry[country] = []
  }
  ordersByCountry[country].push(order)
}
```

#### Step 1: Use `groupByPath()`

```typescript
import { groupByPath } from 'receta/collection'

const ordersByCountry = groupByPath(orders, 'customer.address.country')
// => { US: [...], CA: [...], UK: [...] }
```

**Advanced: Multi-Level Nested Path**

```typescript
// Group by country, then by payment status
const ordersByCountryAndStatus = pipe(
  orders,
  nest([
    o => o.customer.address.country,
    o => o.payment.status
  ])
)
// => { US: { paid: [...], pending: [...] }, CA: {...} }
```

---

## Incremental Migration

You don't need to refactor everything at once!

### Strategy 1: Start with Most Repeated

Find the most duplicated manual logic and replace it first.

```typescript
// 1. Find repeated pattern
// ❌ Manual grouping everywhere:
for (const item of items) {
  if (!grouped[item.category]) grouped[item.category] = []
  grouped[item.category].push(item)
}

// 2. Replace with nest() or R.groupBy()
const grouped = R.groupBy(items, i => i.category)

// 3. Gradually replace call sites
```

### Strategy 2: Create Collection Utilities Module

```typescript
// utils/collections.ts
import { nest, diff, paginate } from 'receta/collection'

export const groupEventsByRepoAndType = (events: Event[]) =>
  nest(events, ['repo', 'type'])

export const detectUserChanges = (old: User[], new_: User[]) =>
  diff(old, new_, u => u.id)

export const paginateResults = <T>(items: T[], page: number) =>
  paginate(items, { page, pageSize: 20 })
```

```typescript
// Usage
import * as Collections from './utils/collections'

const grouped = Collections.groupEventsByRepoAndType(events)
const changes = Collections.detectUserChanges(oldUsers, newUsers)
```

### Strategy 3: Coexist During Migration

Old and new can live side-by-side:

```typescript
// ✅ Keep existing code working
const manual = oldGroupingLogic(items)

// ✅ New code uses Collection module
const grouped = nest(items, ['category', 'priority'])
```

---

## Common Pitfalls

### Pitfall 1: Using `nest()` for Single-Level Grouping

```typescript
// ❌ Overkill
const grouped = nest(items, ['category'])

// ✅ Use Remeda's groupBy
const grouped = R.groupBy(items, i => i.category)
```

**Rule**: Use `nest()` only for **2+ levels**.

### Pitfall 2: JSON.stringify for Equality

```typescript
// ❌ Unreliable (key order, functions, etc.)
diff(old, new_, u => u.id, {
  equals: (a, b) => JSON.stringify(a) === JSON.stringify(b)
})

// ✅ Use Remeda's deep equality
import * as R from 'remeda'

diff(old, new_, u => u.id, {
  equals: R.isDeepEqual
})
```

### Pitfall 3: Ignoring Result Types

```typescript
// ❌ Assumes success
const byId = indexByUnique(users, u => u.id)
console.log(byId.value) // Runtime error if Err!

// ✅ Handle Result
const byId = indexByUnique(users, u => u.id)
if (isOk(byId)) {
  console.log(byId.value)
} else {
  console.error('Duplicate key:', byId.error.key)
}

// Or unwrap with default
const byId = unwrapOr(indexByUnique(users, u => u.id), {})
```

### Pitfall 4: Off-by-One in Page Numbers

```typescript
// ❌ Allows page 0
const page = Number(req.query.page)

// ✅ paginate() handles this
paginate(items, { page: 0, pageSize: 10 })
// => { page: 1, ... } (auto-corrects to 1)
```

---

## Testing After Migration

### Before (Hard to Test)

```typescript
// Can't test grouping logic in isolation
const getEventsByRepo = (events: Event[]) => {
  const grouped: Record<string, Record<string, Event[]>> = {}
  for (const event of events) {
    // 20 lines of manual logic...
  }
  return grouped
}
```

### After (Easy to Test)

```typescript
import { nest } from 'receta/collection'

const getEventsByRepo = (events: Event[]) =>
  nest(events, ['repo', 'type'])

describe('Event grouping', () => {
  it('groups events by repo and type', () => {
    const events = [
      { repo: 'foo', type: 'push', id: 1 },
      { repo: 'foo', type: 'pr', id: 2 },
      { repo: 'bar', type: 'push', id: 3 }
    ]

    const result = getEventsByRepo(events)

    expect(result).toEqual({
      foo: { push: [events[0]], pr: [events[1]] },
      bar: { push: [events[2]] }
    })
  })
})
```

---

## Checklist

Use this checklist when migrating code:

- [ ] Identify manual grouping loops (nested `for` loops)
- [ ] Replace multi-level grouping with `nest()`
- [ ] Replace single-level grouping with Remeda's `groupBy()`
- [ ] Replace change detection with `diff()`
- [ ] Replace manual pagination with `paginate()` or `paginateCursor()`
- [ ] Replace manual indexing with `indexByUnique()`
- [ ] Replace manual set operations with `union()`, `intersect()`, etc.
- [ ] Add Result type handling (`isOk`, `unwrapOr`)
- [ ] Write tests for migrated functions
- [ ] Update call sites to use new functions
- [ ] Remove old manual implementations
- [ ] Document edge cases and collision strategies

---

## Migration Examples by Domain

### Social Media Platform

```typescript
// Before: Manual comment grouping
const byUserAndPost: Record<number, Record<number, Comment[]>> = {}
for (const comment of comments) {
  if (!byUserAndPost[comment.userId]) byUserAndPost[comment.userId] = {}
  if (!byUserAndPost[comment.userId][comment.postId]) {
    byUserAndPost[comment.userId][comment.postId] = []
  }
  byUserAndPost[comment.userId][comment.postId].push(comment)
}

// After: nest()
const byUserAndPost = nest(comments, ['userId', 'postId'])
```

### E-Commerce Order System

```typescript
// Before: Manual change detection
const newOrders = fetchOrders()
const statusChanges = newOrders.filter(no => {
  const old = oldOrders.find(oo => oo.id === no.id)
  return old && old.status !== no.status
})

// After: diff()
const changes = diff(oldOrders, newOrders, o => o.id)
for (const { old, new: updated } of changes.updated) {
  if (old.status !== updated.status) {
    notifyStatusChange(updated)
  }
}
```

### API Endpoint Pagination

```typescript
// Before: Manual offset pagination
app.get('/api/products', (req, res) => {
  const page = Number(req.query.page) || 1
  const pageSize = 20
  const start = (page - 1) * pageSize
  const items = products.slice(start, start + pageSize)
  res.json({ items, page, hasMore: start + pageSize < products.length })
})

// After: paginate()
app.get('/api/products', (req, res) => {
  const result = paginate(products, {
    page: Number(req.query.page) || 1,
    pageSize: 20
  })
  res.json(result)
})
```

---

## Performance Considerations

### Before Migration: O(n²)

```typescript
// ❌ Nested loops for change detection
const added = newUsers.filter(nu =>
  !oldUsers.some(ou => ou.id === nu.id) // O(n) for each item
)
// Total: O(n²)
```

### After Migration: O(n)

```typescript
// ✅ Single pass with Map
const changes = diff(oldUsers, newUsers, u => u.id)
// Total: O(n)
```

**Rule**: For datasets > 100 items, Collection operations are significantly faster.

---

## Next Steps

- **[API Reference](./08-api-reference.md)** - Complete function reference
- **[Common Patterns](./06-patterns.md)** - Real-world examples
- **[README](./README.md)** - Documentation overview

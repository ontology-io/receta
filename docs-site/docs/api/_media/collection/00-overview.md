# Collection: Advanced Collection Operations for Real-World Apps

> **TL;DR**: Higher-level patterns for working with collections — hierarchical grouping, change detection, pagination, safe indexing, and set operations with custom comparators.

## The Problem: Collections Are Hard

Working with arrays of data is fundamental to every application, but common operations are surprisingly painful:

```typescript
// ❌ Manual hierarchical grouping - brittle and verbose
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

// ❌ Manual change detection - error-prone
const added = newUsers.filter(nu => !oldUsers.some(ou => ou.id === nu.id))
const removed = oldUsers.filter(ou => !newUsers.some(nu => nu.id === ou.id))
const updated = newUsers.filter(nu => {
  const old = oldUsers.find(ou => ou.id === nu.id)
  return old && JSON.stringify(old) !== JSON.stringify(nu)
})

// ❌ Manual pagination - easy to get wrong
const page1 = items.slice(0, 20)
const hasMore = items.length > 20
// What about cursor-based? Metadata? Edge cases?

// ❌ Manual indexing - silent bugs with duplicates
const byId: Record<string, User> = {}
for (const user of users) {
  byId[user.id] = user // Silently overwrites duplicates!
}
```

### Real-World Example: Reddit Comment System

Reddit displays comments hierarchically (by user, then by post) with pagination, change detection for live updates, and indexed lookups for performance. The manual approach is hundreds of lines:

```typescript
// Traditional Reddit-style comment system
class CommentManager {
  private comments: Comment[] = []
  private byUser: Map<number, Map<number, Comment[]>> = new Map()
  private cache: Map<string, Comment> = new Map()

  addComments(newComments: Comment[]) {
    // Manual change detection
    for (const comment of newComments) {
      const existing = this.cache.get(comment.id)
      if (!existing) {
        // New comment - need to update all indices
        this.comments.push(comment)
        this.updateIndices(comment)
      } else if (JSON.stringify(existing) !== JSON.stringify(comment)) {
        // Updated comment - need to reindex
        const idx = this.comments.indexOf(existing)
        this.comments[idx] = comment
        this.rebuildIndices() // Expensive!
      }
    }
  }

  getCommentsByUserAndPost(userId: number, postId: number, page: number) {
    // Manual nested grouping + pagination
    if (!this.byUser.has(userId)) return { items: [], hasMore: false }
    const userComments = this.byUser.get(userId)!
    if (!userComments.has(postId)) return { items: [], hasMore: false }

    const comments = userComments.get(postId)!
    const start = (page - 1) * 10
    const items = comments.slice(start, start + 10)
    return { items, hasMore: start + 10 < comments.length }
  }

  private updateIndices(comment: Comment) {
    // 50+ lines of manual index management...
  }
}
```

## How Successful Products Handle This

### GitHub API (Nested Grouping + Pagination)

```json
{
  "events": {
    "repo_foo": {
      "push": [
        { "id": 1, "user": "alice", "timestamp": "2024-01-01" },
        { "id": 2, "user": "bob", "timestamp": "2024-01-02" }
      ],
      "pr": [
        { "id": 3, "user": "alice", "timestamp": "2024-01-03" }
      ]
    }
  },
  "pagination": {
    "cursor": "event_123",
    "has_more": true
  }
}
```

### Stripe API (Change Detection)

```json
{
  "type": "customer.updated",
  "data": {
    "previous_attributes": { "email": "old@example.com" },
    "object": { "id": "cus_123", "email": "new@example.com" }
  }
}
```

### Redux DevTools (Diff Visualization)

```typescript
// Shows exactly what changed in your state
{
  added: [{ type: 'todos', id: 3 }],
  updated: [{
    path: ['todos', 0, 'completed'],
    before: false,
    after: true
  }],
  removed: [{ type: 'todos', id: 1 }]
}
```

## The Solution: Collection Module

Receta's Collection module provides battle-tested patterns:

```typescript
import { nest, diff, paginate, paginateCursor, indexByUnique } from 'receta/collection'
import { pipe } from 'remeda'

// ✅ Reddit-style comment system in 10 lines
const commentsByUserAndPost = nest(comments, ['userId', 'postId'])
// => { 1: { 10: [comments...], 20: [...] }, 2: { 10: [...] } }

// ✅ Change detection like Stripe webhooks
const changes = diff(oldUsers, newUsers, u => u.id)
// => { added: [...], updated: [{old, new}], removed: [...], unchanged: [...] }

// ✅ GitHub-style cursor pagination
const page = paginateCursor(events, e => e.id, { cursor: 'evt_123', limit: 10 })
// => { items: [...], nextCursor: 'evt_456', hasMore: true }

// ✅ Safe indexing like Redux normalizer
const usersById = indexByUnique(users, u => u.id, { onCollision: 'error' })
// => Ok({ user_1: {...}, user_2: {...} }) or Err(DuplicateKeyError)
```

## Why Collection Over Manual Loops?

### Problem 1: Manual Grouping Doesn't Scale

```typescript
// ❌ What happens with 3 levels? 4 levels? N levels?
const grouped: Record<string, Record<string, Record<string, Item[]>>> = {}
for (const item of items) {
  if (!grouped[item.category]) grouped[item.category] = {}
  if (!grouped[item.category][item.subcategory]) {
    grouped[item.category][item.subcategory] = {}
  }
  if (!grouped[item.category][item.subcategory][item.type]) {
    grouped[item.category][item.subcategory][item.type] = []
  }
  grouped[item.category][item.subcategory][item.type].push(item)
}

// ✅ Scales to any depth
nest(items, ['category', 'subcategory', 'type'])
```

### Problem 2: Change Detection Loses Context

```typescript
// ❌ Just arrays - no context about what changed
const added = newItems.filter(...)
const removed = oldItems.filter(...)
// Lost: WHICH item changed? What was the old value?

// ✅ Full change context
const changes = diff(oldItems, newItems, i => i.id)
changes.updated.forEach(({ old, new }) => {
  console.log(`Item ${old.id} changed from ${old.name} to ${new.name}`)
})
```

### Problem 3: Pagination Math Is Easy to Get Wrong

```typescript
// ❌ Off-by-one errors, edge cases
const start = (page - 1) * pageSize
const end = start + pageSize
const items = allItems.slice(start, end)
const hasNext = end < allItems.length
// What about page 0? Last page? Empty arrays?

// ✅ Handles all edge cases
paginate(allItems, { page, pageSize })
// => { items, page, pageSize, total, hasNext, hasPrevious }
```

### Problem 4: Duplicate Keys Fail Silently

```typescript
// ❌ Duplicate keys silently overwrite
const byId: Record<string, User> = {}
for (const user of users) {
  byId[user.id] = user // Lost data if duplicate ID!
}

// ✅ Explicit error handling with Result
const byIdResult = indexByUnique(users, u => u.id)
if (isErr(byIdResult)) {
  console.error(`Duplicate key: ${byIdResult.error.key}`)
}
```

### Problem 5: Set Operations Need Custom Comparators

```typescript
// ❌ Doesn't work with objects
const union = [...set1, ...set2] // Duplicates!
const uniqueUnion = [...new Set([...set1, ...set2])] // Still duplicates!

// ✅ Works with objects + custom equality
union(users1, users2, (a, b) => a.id === b.id)
intersect(assigned, completed, (a, b) => a.taskId === b.taskId)
```

## Real-World Use Cases

### 1. Social Media Feed (Hierarchical Grouping)

```typescript
// Group posts by user, then by date
const feed = pipe(
  posts,
  nest(['userId', (p) => p.createdAt.slice(0, 10)]) // Group by day
)
// => { user_1: { '2024-01-01': [posts], '2024-01-02': [posts] } }
```

### 2. E-commerce Order Tracking (Change Detection)

```typescript
// Detect order status changes for notifications
const changes = diff(oldOrders, newOrders, o => o.id)
for (const { old, new: updated } of changes.updated) {
  if (old.status !== updated.status) {
    sendNotification(`Order ${updated.id} is now ${updated.status}`)
  }
}
```

### 3. API Endpoints (Pagination)

```typescript
// Offset-based for simple APIs
app.get('/api/users', (req, res) => {
  const result = paginate(users, {
    page: Number(req.query.page) || 1,
    pageSize: 20
  })
  res.json(result)
})

// Cursor-based for high-scale APIs
app.get('/api/messages', (req, res) => {
  const result = paginateCursor(
    messages,
    m => m.id,
    { cursor: req.query.cursor, limit: 50 }
  )
  res.json(result)
})
```

### 4. State Management (Normalization)

```typescript
// Redux-style entity normalization
const normalize = <T extends { id: string }>(entities: T[]) =>
  pipe(
    entities,
    indexByUnique(e => e.id, { onCollision: 'last' }),
    unwrapOr({})
  )

const state = {
  users: normalize(users),
  posts: normalize(posts),
  comments: normalize(comments)
}
```

### 5. Access Control (Set Operations)

```typescript
// Merge permissions from multiple roles
const adminPerms = [{ resource: 'users', action: 'write' }]
const moderatorPerms = [{ resource: 'posts', action: 'delete' }]

const allPermissions = union(
  adminPerms,
  moderatorPerms,
  (a, b) => a.resource === b.resource && a.action === b.action
)
```

## Mental Model: Collection as Data Pipeline

Think of collections as flowing through a pipeline of transformations:

```
Raw Data → Group → Filter → Paginate → Index → Ready for Use

[1000 items]
    ↓ nest(['category', 'priority'])
{ electronics: { high: [10], medium: [50] }, books: {...} }
    ↓ groupByPath('payment.status')
{ paid: [100], pending: [50] }
    ↓ paginate({ page: 1, pageSize: 20 })
{ items: [20], page: 1, hasNext: true }
    ↓ indexByUnique(i => i.id)
Ok({ item_1: {...}, item_2: {...} })
```

## When to Use Collection

### ✅ Use Collection when:
- Grouping data hierarchically (2+ levels)
- Detecting changes between datasets (sync, webhooks)
- Implementing pagination (offset or cursor-based)
- Creating indexes with duplicate handling
- Performing set operations on objects
- Building normalized state (Redux, Zustand)
- Processing API responses with nested structures

### ❌ Don't use for:
- Simple `filter()` or `map()` — use Remeda
- Single-level grouping — use Remeda's `groupBy()`
- Flat key-value lookup — use plain `Record<>`
- Primitive arrays — use native `Set`

## What's Next?

- **[Grouping](./01-grouping.md)** - `nest()` and `groupByPath()`
- **[Change Detection](./02-change-detection.md)** - `diff()` with custom equality
- **[Pagination](./03-pagination.md)** - Offset and cursor-based
- **[Indexing](./04-indexing.md)** - Safe indexing with `indexByUnique()`
- **[Set Operations](./05-set-operations.md)** - `union()`, `intersect()`, `symmetricDiff()`
- **[Patterns](./06-patterns.md)** - Production recipes
- **[Migration Guide](./07-migration.md)** - From manual operations
- **[API Reference](./08-api-reference.md)** - Complete function reference

# Collection Module Documentation

Complete guide to advanced collection operations for real-world TypeScript applications.

## Quick Start

```typescript
import { nest, diff, paginate, indexByUnique, union } from 'receta/collection'
import { pipe } from 'remeda'

// Hierarchical grouping
const grouped = nest(comments, ['userId', 'postId'])

// Change detection
const changes = diff(oldUsers, newUsers, u => u.id)

// Pagination
const page = paginate(items, { page: 1, pageSize: 20 })

// Safe indexing
const indexed = indexByUnique(users, u => u.id)

// Set operations
const merged = union(set1, set2, (a, b) => a.id === b.id)
```

## Documentation Structure

### 📚 Learning Path

**New to Collection?** Follow this order:

1. **[Overview](./00-overview.md)** (15 min) - Why Collection utilities? Real-world problems and solutions
2. **[Grouping](./01-grouping.md)** (10 min) - Hierarchical grouping with `nest()` and `groupByPath()`
3. **[Change Detection](./02-change-detection.md)** (10 min) - Detecting changes with `diff()`
4. **[Pagination](./03-pagination.md)** (10 min) - Offset and cursor-based pagination
5. **[Indexing](./04-indexing.md)** (10 min) - Safe indexing with collision handling
6. **[Set Operations](./05-set-operations.md)** (10 min) - Union, intersect, symmetric diff
7. **[Patterns](./06-patterns.md)** (20 min) - Production-ready recipes
8. **[Migration Guide](./07-migration.md)** (15 min) - From manual operations
9. **[API Reference](./08-api-reference.md)** - Complete function reference

**Total time: ~2 hours**

### 📖 By Topic

#### I want to understand...
- **Why use Collection?** → [Overview](./00-overview.md)
- **How hierarchical grouping works** → [Grouping](./01-grouping.md)
- **How to detect changes** → [Change Detection](./02-change-detection.md)
- **How pagination works** → [Pagination](./03-pagination.md)
- **How to handle duplicates** → [Indexing](./04-indexing.md)
- **Set theory operations** → [Set Operations](./05-set-operations.md)

#### I want examples for...
- **Reddit-style comment system** → [Patterns - Social Media](./06-patterns.md#social-media)
- **E-commerce order tracking** → [Patterns - E-commerce](./06-patterns.md#e-commerce)
- **API pagination** → [Patterns - API Design](./06-patterns.md#api-design)
- **State normalization** → [Patterns - State Management](./06-patterns.md#state-management)
- **Permission systems** → [Patterns - Access Control](./06-patterns.md#access-control)

#### I need to...
- **Group by nested properties** → `groupByPath('user.role')`
- **Sync two datasets** → `diff(oldData, newData, getId)`
- **Implement infinite scroll** → `paginateCursor(items, getId, config)`
- **Create lookup tables** → `indexByUnique(items, getId)`
- **Merge collections** → `union(set1, set2, isEqual)`
- **Find common items** → `intersect(set1, set2, isEqual)`

## Key Concepts

### Hierarchical Grouping

Nest data by multiple keys for complex structures:

```typescript
// Group events by repo → type → user
const events = nest(githubEvents, ['repo', 'type', 'user'])
// => {
//   repo_foo: {
//     push: { alice: [events], bob: [events] },
//     pr: { alice: [events] }
//   }
// }
```

### Change Detection

Track exactly what changed between datasets:

```typescript
const { added, updated, removed, unchanged } = diff(
  oldOrders,
  newOrders,
  o => o.id
)

// Send notifications only for updates
updated.forEach(({ old, new: updated }) => {
  if (old.status !== updated.status) {
    notify(`Order ${updated.id} status changed`)
  }
})
```

### Cursor vs Offset Pagination

**Offset-based** (simple, for small datasets):
```typescript
paginate(items, { page: 2, pageSize: 20 })
// => { items, page, pageSize, total, hasNext, hasPrevious }
```

**Cursor-based** (scalable, real-time safe):
```typescript
paginateCursor(items, getId, { cursor: 'item_123', limit: 20 })
// => { items, nextCursor, hasMore }
```

### Safe Indexing with Result

Handle duplicate keys explicitly:

```typescript
// Returns Result<Record<string, T>, DuplicateKeyError>
const indexed = indexByUnique(users, u => u.id, {
  onCollision: 'error' // or 'first' | 'last'
})

if (isErr(indexed)) {
  console.error(`Duplicate key: ${indexed.error.key}`)
}
```

### Set Operations with Custom Comparators

Work with objects, not just primitives:

```typescript
// Merge permissions from roles
const allPerms = union(
  adminPerms,
  moderatorPerms,
  (a, b) => a.resource === b.resource && a.action === b.action
)

// Find users in both teams
const overlap = intersect(team1, team2, (a, b) => a.id === b.id)

// Find items in either but not both
const diff = symmetricDiff(planned, actual, (a, b) => a.id === b.id)
```

## Common Patterns

### Pattern 1: Reddit-Style Comments

```typescript
const commentsByUserAndPost = nest(comments, ['userId', 'postId'])
const userComments = commentsByUserAndPost[userId]?.[postId] ?? []
```

### Pattern 2: GitHub-Style Activity Feed

```typescript
const eventsByRepoAndType = pipe(
  events,
  filter(e => e.visibility === 'public'),
  nest(['repo', 'type']),
  mapValues(byType =>
    mapValues(byType, events =>
      paginate(events, { page: 1, pageSize: 10 })
    )
  )
)
```

### Pattern 3: Stripe-Style Webhooks

```typescript
const changes = diff(oldCustomers, newCustomers, c => c.id)
for (const { old, new: updated } of changes.updated) {
  webhook.send({
    type: 'customer.updated',
    data: { previous_attributes: old, object: updated }
  })
}
```

### Pattern 4: Redux Normalization

```typescript
const normalizeEntities = <T extends { id: string }>(entities: T[]) =>
  pipe(
    entities,
    indexByUnique(e => e.id, { onCollision: 'last' }),
    unwrapOr({})
  )

const state = {
  users: normalizeEntities(users),
  posts: normalizeEntities(posts)
}
```

### Pattern 5: RBAC Permission System

```typescript
const userPermissions = (userId: string) => pipe(
  getUserRoles(userId),
  flatMap(role => getRolePermissions(role)),
  arr => union(arr, [], (a, b) =>
    a.resource === b.resource && a.action === b.action
  )
)
```

## Quick Reference

### Grouping
| Function | Use Case | Example |
|----------|----------|---------|
| `nest()` | Multi-level grouping | `nest(items, ['category', 'priority'])` |
| `groupByPath()` | Group by nested path | `groupByPath(items, 'user.role')` |

### Change Detection
| Function | Use Case | Example |
|----------|----------|---------|
| `diff()` | Detect all changes | `diff(old, new, getId)` |

### Pagination
| Function | Use Case | Example |
|----------|----------|---------|
| `paginate()` | Offset-based | `paginate(items, { page: 1, pageSize: 20 })` |
| `paginateCursor()` | Cursor-based | `paginateCursor(items, getId, { limit: 20 })` |

### Indexing
| Function | Use Case | Example |
|----------|----------|---------|
| `indexByUnique()` | Safe indexing | `indexByUnique(items, getId, { onCollision: 'error' })` |

### Set Operations
| Function | Use Case | Example |
|----------|----------|---------|
| `union()` | Merge collections | `union(set1, set2, isEqual)` |
| `intersect()` | Find common | `intersect(set1, set2, isEqual)` |
| `symmetricDiff()` | Find differences | `symmetricDiff(set1, set2, isEqual)` |

## Real-World Examples

All examples are inspired by production systems:

- **GitHub** - Event grouping, activity feeds
- **Reddit** - Nested comments, hierarchical display
- **Stripe** - Webhook change detection
- **Redux** - Entity normalization
- **AWS** - Resource grouping by tags
- **Auth0** - Permission merging
- **Shopify** - Order tracking

## Best Practices

### ✅ Do

- Use `nest()` for 2+ levels of grouping
- Use `diff()` for sync operations and webhooks
- Use `paginateCursor()` for high-scale or real-time data
- Use `indexByUnique()` with explicit collision handling
- Provide custom comparators for object equality
- Chain operations in pipes for clarity

### ❌ Don't

- Don't use `nest()` for single-level grouping (use `groupBy`)
- Don't use `paginate()` for infinite scroll (use `paginateCursor`)
- Don't ignore Result from `indexByUnique()`
- Don't use reference equality for objects
- Don't mutate collections in place
- Don't skip edge case testing (empty arrays, duplicates)

## TypeScript Tips

### Inferring Types

```typescript
// Types are fully inferred
const grouped = nest(users, ['role', 'team'])
// grouped: NestedMap<User>

const changes = diff(oldItems, newItems, i => i.id)
// changes: DiffResult<Item>
```

### Custom Comparators

```typescript
type Comparator<T> = (a: T, b: T) => boolean

const byId: Comparator<{ id: string }> = (a, b) => a.id === b.id
const byEmail: Comparator<User> = (a, b) => a.email === b.email

union(users1, users2, byId)
```

### Result Handling

```typescript
import { isOk, isErr, unwrapOr } from 'receta/result'

const indexed = indexByUnique(items, getId)

if (isOk(indexed)) {
  const byId = indexed.value
  // Use the index
} else {
  console.error(indexed.error.key)
}

// Or use unwrapOr for defaults
const byId = unwrapOr(indexed, {})
```

## Performance

### Time Complexity

| Function | Complexity | Notes |
|----------|------------|-------|
| `nest()` | O(n × k) | n items, k keys |
| `diff()` | O(n + m) | Creates indices first |
| `paginate()` | O(1) | Slice operation |
| `paginateCursor()` | O(n) | Finds cursor position |
| `indexByUnique()` | O(n) | Single pass |
| `union()` | O(n × m) | With custom comparator |
| `intersect()` | O(n × m) | With custom comparator |

### Optimization Tips

- Cache `nest()` results for repeated access
- Use `indexByUnique()` once, reuse the index
- Prefer `paginateCursor()` over repeated `paginate()` calls
- Use `diff()` with custom `isEqual` to avoid JSON stringification
- Memoize custom comparators

## Testing

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest'
import { nest, diff, paginate } from 'receta/collection'

describe('Collection operations', () => {
  it('groups hierarchically', () => {
    const result = nest(items, ['category', 'priority'])
    expect(result.electronics.high).toHaveLength(10)
  })

  it('detects changes', () => {
    const changes = diff(old, updated, i => i.id)
    expect(changes.added).toHaveLength(1)
    expect(changes.updated[0].old.name).not.toBe(
      changes.updated[0].new.name
    )
  })
})
```

## Getting Help

- **Questions?** Check [API Reference](./08-api-reference.md)
- **Migration?** See [Migration Guide](./07-migration.md)
- **Examples?** Browse [Patterns](./06-patterns.md)
- **Issues?** File at [GitHub](https://github.com/your-org/receta/issues)

## Next Steps

1. Read [Overview](./00-overview.md) to understand the problems Collection solves
2. Try examples in `/examples/collection-usage.ts`
3. Browse [Patterns](./06-patterns.md) for your use case
4. Check [API Reference](./08-api-reference.md) for details

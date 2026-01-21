# Common Patterns & Production Recipes

Real-world patterns from GitHub, Reddit, Stripe, and more.

## Social Media: Reddit-Style Comments

```typescript
import { nest, paginate } from 'receta/collection'
import { pipe } from 'remeda'

// Hierarchical comment display
const displayComments = (comments: Comment[], userId: number, postId: number) =>
  pipe(
    comments,
    nest(['userId', 'postId']),
    grouped => grouped[userId]?.[postId] ?? [],
    paginate({ page: 1, pageSize: 20 })
  )
```

## E-commerce: Order Tracking

```typescript
import { diff } from 'receta/collection'

// Detect order status changes for notifications
const trackOrderChanges = (oldOrders: Order[], newOrders: Order[]) => {
  const changes = diff(oldOrders, newOrders, o => o.id)
  
  for (const { old, new: updated } of changes.updated) {
    if (old.status !== updated.status) {
      sendNotification({
        orderId: updated.id,
        oldStatus: old.status,
        newStatus: updated.status,
        customer: updated.customerId
      })
    }
  }
  
  return changes
}
```

## API Design: GitHub-Style Pagination

```typescript
import { paginateCursor } from 'receta/collection'

// Cursor-based API endpoint
app.get('/api/events', (req, res) => {
  const result = paginateCursor(
    events,
    e => e.id,
    {
      cursor: req.query.cursor as string,
      limit: Number(req.query.limit) || 50
    }
  )
  
  res.json({
    data: result.items,
    pagination: {
      next_cursor: result.nextCursor,
      has_more: result.hasMore
    }
  })
})
```

## State Management: Redux Normalization

```typescript
import { indexByUnique } from 'receta/collection'
import { unwrapOr } from 'receta/result'

const normalizeEntities = <T extends { id: string }>(entities: T[]) =>
  pipe(
    entities,
    indexByUnique(e => e.id, { onCollision: 'last' }),
    unwrapOr({})
  )

const store = {
  users: normalizeEntities(users),
  posts: normalizeEntities(posts),
  comments: normalizeEntities(comments)
}
```

## Access Control: Permission Merging

```typescript
import { union } from 'receta/collection'

const getUserPermissions = (userId: string) => {
  const roles = getUserRoles(userId)
  const permissions = roles.flatMap(role => getRolePermissions(role))
  
  return union(
    permissions,
    [],
    (a, b) => a.resource === b.resource && a.action === b.action
  )
}
```

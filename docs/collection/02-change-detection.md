# Change Detection with diff()

Detect exactly what changed between two collections - added, updated, removed, and unchanged items.

## Overview

Change detection is essential for:
- **Sync operations** - Update local state from server
- **Webhooks** - Send notifications only for changes
- **Optimistic updates** - Reconcile optimistic vs actual state
- **Audit logs** - Track what changed and when
- **Live updates** - Reflect changes in real-time UIs

## Basic Usage

```typescript
import { diff } from 'receta/collection'

const oldUsers = [
  { id: 1, name: 'Alice', role: 'admin' },
  { id: 2, name: 'Bob', role: 'user' }
]

const newUsers = [
  { id: 1, name: 'Alicia', role: 'admin' }, // name updated
  { id: 3, name: 'Charlie', role: 'user' }  // added
  // id: 2 removed
]

const changes = diff(oldUsers, newUsers, u => u.id)

console.log(changes)
// {
//   added: [{ id: 3, name: 'Charlie', role: 'user' }],
//   updated: [{
//     old: { id: 1, name: 'Alice', role: 'admin' },
//     new: { id: 1, name: 'Alicia', role: 'admin' }
//   }],
//   removed: [{ id: 2, name: 'Bob', role: 'user' }],
//   unchanged: []
// }
```

## The DiffResult Type

```typescript
interface DiffResult<T> {
  readonly added: readonly T[]        // Items in new but not in old
  readonly updated: readonly UpdatedItem<T>[]  // Items in both with changes
  readonly removed: readonly T[]      // Items in old but not in new
  readonly unchanged: readonly T[]    // Items in both, no changes
}

interface UpdatedItem<T> {
  readonly old: T  // Previous version
  readonly new: T  // Current version
}
```

## Custom Equality Checking

By default, `diff()` uses JSON stringification for equality. Provide custom equality for better performance or specific logic:

```typescript
const changes = diff(
  oldProducts,
  newProducts,
  p => p.id,
  (old, updated) => old.price === updated.price && old.stock === updated.stock
)

// Only reports changes if price OR stock changed
// Ignores other field changes (like updatedAt)
```

### When to Use Custom Equality

```typescript
// ❌ Inefficient: JSON stringification for every comparison
diff(items, updatedItems, i => i.id)

// ✅ Better: Custom equality for specific fields
diff(
  items,
  updatedItems,
  i => i.id,
  (old, updated) => old.status === updated.status && old.priority === updated.priority
)

// ✅ Best: For simple value types
diff(
  items,
  updatedItems,
  i => i.id,
  (old, updated) => old.version === updated.version
)
```

## Real-World: Stripe Webhook Events

```typescript
import { diff } from 'receta/collection'

interface Customer {
  id: string
  email: string
  name: string
  metadata: Record<string, string>
}

async function syncCustomers(localCustomers: Customer[]) {
  // Fetch latest from Stripe
  const stripeCustomers = await stripe.customers.list()

  const changes = diff(localCustomers, stripeCustomers.data, c => c.id)

  // Send webhook events for each type of change
  for (const customer of changes.added) {
    await webhook.send({
      type: 'customer.created',
      data: { object: customer }
    })
  }

  for (const { old, new: updated } of changes.updated) {
    await webhook.send({
      type: 'customer.updated',
      data: {
        object: updated,
        previous_attributes: diffAttributes(old, updated)
      }
    })
  }

  for (const customer of changes.removed) {
    await webhook.send({
      type: 'customer.deleted',
      data: { object: customer }
    })
  }

  return changes
}

function diffAttributes(old: Customer, updated: Customer) {
  const attrs: Partial<Customer> = {}
  if (old.email !== updated.email) attrs.email = old.email
  if (old.name !== updated.name) attrs.name = old.name
  return attrs
}
```

## Real-World: E-commerce Order Tracking

```typescript
interface Order {
  id: string
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  items: { sku: string, quantity: number }[]
  total: number
  customerId: string
}

function trackOrderChanges(
  previousOrders: Order[],
  currentOrders: Order[]
) {
  const changes = diff(previousOrders, currentOrders, o => o.id)

  // Notify customers of status changes
  for (const { old, new: updated } of changes.updated) {
    if (old.status !== updated.status) {
      sendCustomerNotification(updated.customerId, {
        orderId: updated.id,
        oldStatus: old.status,
        newStatus: updated.status,
        message: getStatusMessage(updated.status)
      })
    }
  }

  // Alert for new orders
  if (changes.added.length > 0) {
    sendAdminAlert(`${changes.added.length} new orders received`)
  }

  return changes
}

function getStatusMessage(status: Order['status']) {
  const messages = {
    pending: 'Your order is being processed',
    paid: 'Payment received, preparing shipment',
    shipped: 'Your order is on the way!',
    delivered: 'Your order has been delivered',
    cancelled: 'Your order has been cancelled'
  }
  return messages[status]
}
```

## Real-World: Redux Optimistic Updates

```typescript
interface Todo {
  id: string
  text: string
  completed: boolean
  optimistic?: boolean
}

function reconcileOptimisticState(
  optimisticTodos: Todo[],
  serverTodos: Todo[]
) {
  const changes = diff(optimisticTodos, serverTodos, t => t.id)

  // Successful optimistic updates (unchanged)
  const confirmed = changes.unchanged

  // Failed optimistic updates (removed from server response)
  const failed = changes.removed.filter(t => t.optimistic)

  // Server made additional changes
  const serverUpdated = changes.updated.map(u => u.new)

  // New items from other clients
  const fromOthers = changes.added

  return {
    todos: [...confirmed, ...serverUpdated, ...fromOthers],
    failedOptimistic: failed
  }
}
```

## Real-World: Live Collaboration

```typescript
interface Document {
  id: string
  content: string
  version: number
  lastModifiedBy: string
}

function handleDocumentUpdates(
  localDocs: Document[],
  serverDocs: Document[]
) {
  const changes = diff(
    localDocs,
    serverDocs,
    d => d.id,
    (local, server) => local.version === server.version
  )

  // Merge conflicts: local and server both changed
  const conflicts = changes.updated.filter(
    ({ old, new: updated }) =>
      old.lastModifiedBy !== updated.lastModifiedBy
  )

  if (conflicts.length > 0) {
    return {
      type: 'conflict',
      conflicts: conflicts.map(c => ({
        documentId: c.old.id,
        localVersion: c.old,
        serverVersion: c.new
      }))
    }
  }

  // No conflicts: apply server changes
  return {
    type: 'success',
    changes
  }
}
```

## Detecting Specific Field Changes

```typescript
function detectFieldChanges<T extends Record<string, any>>(
  old: T,
  updated: T,
  fields: (keyof T)[]
): Partial<T> {
  const changed: Partial<T> = {}

  for (const field of fields) {
    if (old[field] !== updated[field]) {
      changed[field] = old[field]
    }
  }

  return changed
}

// Usage with diff
const changes = diff(oldUsers, newUsers, u => u.id)

for (const { old, new: updated } of changes.updated) {
  const fieldChanges = detectFieldChanges(old, updated, ['email', 'role'])

  if (Object.keys(fieldChanges).length > 0) {
    auditLog.record({
      userId: updated.id,
      changedFields: fieldChanges,
      newValues: R.pick(updated, Object.keys(fieldChanges))
    })
  }
}
```

## Performance Optimization

### Time Complexity

`diff()` is O(n + m) where n and m are the sizes of the old and new collections:
1. Creates indices: O(n) + O(m)
2. Iterates both sets once: O(n + m)

### Optimization Tips

```typescript
// ❌ Avoid: Expensive equality checks
diff(items, updated, i => i.id) // Uses JSON.stringify

// ✅ Better: Compare specific fields
diff(
  items,
  updated,
  i => i.id,
  (a, b) => a.version === b.version
)

// ✅ Best: Compare primitive version field
diff(
  items,
  updated,
  i => i.id,
  (a, b) => a.updatedAt === b.updatedAt // Compare timestamps
)
```

## Common Patterns

### Pattern 1: Notify Only Updated

```typescript
const { updated } = diff(old, current, getId)
updated.forEach(({ old, new: item }) => notify(item))
```

### Pattern 2: Batch Changes

```typescript
const changes = diff(old, current, getId)

if (changes.added.length + changes.updated.length + changes.removed.length > 0) {
  await batchUpdate({
    insert: changes.added,
    update: changes.updated.map(u => u.new),
    delete: changes.removed.map(r => r.id)
  })
}
```

### Pattern 3: Change Summary

```typescript
const summarizeChanges = <T>(changes: DiffResult<T>) => ({
  totalChanges: changes.added.length + changes.updated.length + changes.removed.length,
  breakdown: {
    created: changes.added.length,
    modified: changes.updated.length,
    deleted: changes.removed.length,
    stable: changes.unchanged.length
  }
})

console.log(summarizeChanges(changes))
// { totalChanges: 5, breakdown: { created: 2, modified: 2, deleted: 1, stable: 10 } }
```

### Pattern 4: Audit Trail

```typescript
function createAuditEntries<T extends { id: string }>(
  changes: DiffResult<T>,
  userId: string
) {
  const entries = []

  for (const item of changes.added) {
    entries.push({
      action: 'create',
      entityId: item.id,
      by: userId,
      timestamp: new Date(),
      data: item
    })
  }

  for (const { old, new: updated } of changes.updated) {
    entries.push({
      action: 'update',
      entityId: updated.id,
      by: userId,
      timestamp: new Date(),
      before: old,
      after: updated
    })
  }

  for (const item of changes.removed) {
    entries.push({
      action: 'delete',
      entityId: item.id,
      by: userId,
      timestamp: new Date(),
      data: item
    })
  }

  return entries
}
```

## Data-Last in Pipe

```typescript
import { pipe } from 'remeda'

const syncPipeline = pipe(
  localData,
  diff(serverData, getId),
  changes => ({
    ...changes,
    summary: summarizeChanges(changes)
  }),
  applyChanges
)
```

## TypeScript Tips

```typescript
// Type inference works automatically
const changes = diff(oldUsers, newUsers, u => u.id)
// changes: DiffResult<User>

// Narrowing updated items
changes.updated.forEach(({ old, new: updated }) => {
  // old: User, updated: User
  if (old.role !== updated.role) {
    // Type-safe field access
  }
})
```

## Testing

```typescript
import { describe, it, expect } from 'vitest'
import { diff } from 'receta/collection'

describe('Change detection', () => {
  it('detects all change types', () => {
    const changes = diff(old, current, i => i.id)

    expect(changes.added).toHaveLength(1)
    expect(changes.updated).toHaveLength(1)
    expect(changes.removed).toHaveLength(1)
    expect(changes.unchanged).toHaveLength(2)
  })

  it('uses custom equality', () => {
    const changes = diff(
      old,
      current,
      i => i.id,
      (a, b) => a.version === b.version
    )

    expect(changes.updated).toHaveLength(0) // Same version
  })
})
```

## Next Steps

- **[Pagination](./03-pagination.md)** - Paginate change results
- **[Patterns](./06-patterns.md)** - More production recipes
- **[API Reference](./08-api-reference.md)** - Complete API docs

# Function: paginateCursor

## When to Use
Implement cursor-based pagination for infinite scroll, real-time feeds, and large datasets. Prevents issues with missing/duplicate items when data changes during pagination.

## Decision Tree
```
Need pagination?
│
├─ Cursor-based (infinite scroll, feeds) ───────────► paginateCursor()
│
├─ Page numbers (traditional UI) ───────────────────► paginate()
│
└─ Simple slicing ───────────────────────────────────► R.take() / R.drop()
```

## Examples
```typescript
// Basic cursor pagination
const messages = [
  { id: 'msg_1', text: 'Hello', createdAt: '2024-01-01' },
  { id: 'msg_2', text: 'World', createdAt: '2024-01-02' },
  { id: 'msg_3', text: 'Foo', createdAt: '2024-01-03' }
]

paginateCursor(messages, (m) => m.id, { limit: 2 })
// => {
//   items: [{ id: 'msg_1', ... }, { id: 'msg_2', ... }],
//   nextCursor: 'msg_2',
//   hasMore: true
// }

// Continue from cursor
paginateCursor(messages, (m) => m.id, {
  cursor: 'msg_2',
  limit: 2
})
// => {
//   items: [{ id: 'msg_3', ... }],
//   nextCursor: undefined, // last page
//   hasMore: false
// }

// Infinite scroll implementation
let cursor: string | undefined = undefined
const allItems: Message[] = []

async function loadMore() {
  const response = await fetch(`/api/messages?cursor=${cursor}&limit=20`)
  const page = await response.json()

  allItems.push(...page.items)
  cursor = page.nextCursor

  return page.hasMore
}

// Load first page
await loadMore()
// User scrolls down...
if (hasMore) await loadMore()

// Real-time feed with chronological cursor
const posts = await fetchPosts()

const page = pipe(
  posts,
  paginateCursor(
    (p) => p.createdAt, // Use timestamp as cursor
    { limit: 10 }
  )
)

// API endpoint
// GET /api/posts?cursor=2024-01-15T10:30:00Z&limit=10

// Twitter/Instagram-style feed
const feed = pipe(
  socialPosts,
  R.sortBy(p => -new Date(p.createdAt).getTime()), // newest first
  paginateCursor(
    (p) => p.id,
    { cursor: lastSeenPostId, limit: 25 }
  )
)

// Benefits: If new posts are added, pagination stays consistent
// Offset pagination would skip items or show duplicates

// GraphQL-style pagination
function getComments(postId: string, cursor?: string) {
  return pipe(
    getCommentsForPost(postId),
    paginateCursor(
      (c) => c.id,
      { cursor, limit: 50 }
    )
  )
}

// Usage in GraphQL resolver
{
  comments(first: 50, after: "cursor123") {
    items {
      id
      text
    }
    nextCursor
    hasMore
  }
}
```

## Related Functions
- **Offset-based**: `paginate()` - for traditional page numbers
- **Simple slicing**: `R.take()`, `R.drop()` - direct array slicing

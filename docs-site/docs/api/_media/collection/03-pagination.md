# Pagination: Offset and Cursor-Based

Master both pagination strategies for different use cases.

## When to Use Which?

| Strategy | Use Case | Pros | Cons |
|----------|----------|------|------|
| **Offset** | Admin panels, small datasets | Simple, page numbers | Slow for large data, real-time issues |
| **Cursor** | Social feeds, infinite scroll | Fast, real-time safe | No page numbers, complex |

## Offset-Based Pagination with `paginate()`

Best for: Admin dashboards, reports, search results with page numbers.

### Basic Usage

```typescript
import { paginate } from 'receta/collection'

const items = Array.from({ length: 100 }, (_, i) => ({ id: i + 1 }))

const page1 = paginate(items, { page: 1, pageSize: 20 })
// {
//   items: [items 1-20],
//   page: 1,
//   pageSize: 20,
//   total: 100,
//   hasNext: true,
//   hasPrevious: false
// }
```

### Real-World: Admin User List

```typescript
interface User {
  id: string
  email: string
  role: string
  createdAt: string
}

app.get('/admin/users', async (req, res) => {
  const allUsers = await db.users.findAll()
  
  const result = paginate(allUsers, {
    page: Number(req.query.page) || 1,
    pageSize: 50
  })

  res.json({
    users: result.items,
    pagination: {
      page: result.page,
      pageSize: result.pageSize,
      totalPages: Math.ceil(result.total / result.pageSize),
      totalItems: result.total,
      hasNext: result.hasNext,
      hasPrevious: result.hasPrevious
    }
  })
})
```

## Cursor-Based Pagination with `paginateCursor()`

Best for: Social feeds, messaging apps, real-time data, infinite scroll.

### Basic Usage

```typescript
import { paginateCursor } from 'receta/collection'

const messages = [/* ... */]

// First page
const page1 = paginateCursor(messages, m => m.id, { limit: 20 })
// { items: [first 20], nextCursor: 'msg_20', hasMore: true }

// Next page
const page2 = paginateCursor(messages, m => m.id, {
  cursor: page1.nextCursor,
  limit: 20
})
```

### Real-World: GitHub-Style API

```typescript
interface Event {
  id: string
  type: string
  createdAt: string
  payload: any
}

app.get('/api/events', async (req, res) => {
  const events = await db.events.findAll()

  const result = paginateCursor(
    events,
    e => e.id,
    {
      cursor: req.query.cursor as string,
      limit: Number(req.query.per_page) || 30
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

### Real-World: Infinite Scroll

```typescript
// React component with infinite scroll
function MessageList() {
  const [messages, setMessages] = useState<Message[]>([])
  const [cursor, setCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)

  const loadMore = async () => {
    const response = await fetch(`/api/messages?cursor=${cursor}&limit=20`)
    const data = await response.json()

    setMessages(prev => [...prev, ...data.items])
    setCursor(data.nextCursor)
    setHasMore(data.hasMore)
  }

  return (
    <InfiniteScroll loadMore={loadMore} hasMore={hasMore}>
      {messages.map(msg => <MessageItem key={msg.id} message={msg} />)}
    </InfiniteScroll>
  )
}
```

## Comparing Both Approaches

### Performance

```typescript
// Offset: Gets slower as page number increases
// Page 1: SELECT * FROM items LIMIT 20 OFFSET 0      -- Fast
// Page 100: SELECT * FROM items LIMIT 20 OFFSET 2000 -- Slow!

// Cursor: Consistent speed
// SELECT * FROM items WHERE id > 'cursor' LIMIT 20   -- Always fast
```

### Real-Time Safety

```typescript
// Offset: Items can shift between pages
const page1 = paginate(items, { page: 1, pageSize: 10 })
// New item added at position 5
const page2 = paginate(items, { page: 2, pageSize: 10 })
// Item 10 from page 1 appears again in page 2!

// Cursor: Stable pagination
const page1 = paginateCursor(items, getId, { limit: 10 })
// New item added - doesn't affect next page
const page2 = paginateCursor(items, getId, {
  cursor: page1.nextCursor,
  limit: 10
})
// No duplicates!
```

## Common Patterns

### Pattern 1: Page Navigation UI

```typescript
function PaginationControls({ result }: { result: PaginatedResult<any> }) {
  const totalPages = Math.ceil(result.total / result.pageSize)

  return (
    <div>
      <button disabled={!result.hasPrevious}>Previous</button>
      <span>Page {result.page} of {totalPages}</span>
      <button disabled={!result.hasNext}>Next</button>
    </div>
  )
}
```

### Pattern 2: Load More Button

```typescript
function LoadMoreButton({ hasMore, onLoad }: { hasMore: boolean, onLoad: () => void }) {
  return hasMore ? (
    <button onClick={onLoad}>Load More</button>
  ) : (
    <span>No more items</span>
  )
}
```

### Pattern 3: Combining with Filters

```typescript
const filteredAndPaginated = pipe(
  items,
  R.filter(item => item.active),
  R.sortBy(item => item.createdAt),
  paginate({ page: 1, pageSize: 20 })
)
```

## Next Steps

- **[Indexing](./04-indexing.md)** - Safe indexing with collision handling
- **[Patterns](./06-patterns.md)** - More production recipes

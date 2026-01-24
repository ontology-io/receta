# Function: union

## When to Use
Merge two collections, removing duplicates. Similar to Set union but works with objects and custom equality. Ideal for combining datasets, merging caches, and deduplication.

## Decision Tree
```
Need to merge collections?
│
├─ Combine without duplicates ─────────────────────► union()
│
├─ Keep duplicates ─────────────────────────────────► [...items1, ...items2]
│
├─ Only items in both ──────────────────────────────► intersect()
│
└─ Categorize all changes ──────────────────────────► diff()
```

## Examples
```typescript
// Basic union with primitives
union([1, 2, 3], [3, 4, 5])
// => [1, 2, 3, 4, 5]

// Union with objects (custom equality)
const users1 = [{ id: 1, name: 'Alice' }]
const users2 = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]

union(users1, users2, (a, b) => a.id === b.id)
// => [
//   { id: 1, name: 'Alice' },
//   { id: 2, name: 'Bob' }
// ]

// Merge caches from multiple sources
const localCache = getLocalCache()
const remoteCache = await fetchCache()

const merged = pipe(
  localCache,
  union(remoteCache, (a, b) => a.key === b.key)
)

// Combine tag lists
const postTags = ['javascript', 'typescript']
const userTags = ['typescript', 'react', 'node']

union(postTags, userTags)
// => ['javascript', 'typescript', 'react', 'node']

// Merge permissions
const rolePermissions = ['read', 'write']
const userPermissions = ['write', 'admin']

const allPermissions = union(rolePermissions, userPermissions)
// => ['read', 'write', 'admin']

// Deduplicate across sources
const results1 = await searchAPI1(query)
const results2 = await searchAPI2(query)

const allResults = pipe(
  results1,
  union(results2, (a, b) => a.url === b.url)
)

// Merge event streams
const realtimeEvents = getRealtimeEvents()
const historicalEvents = getHistoricalEvents()

const timeline = union(
  realtimeEvents,
  historicalEvents,
  (a, b) => a.eventId === b.eventId && a.timestamp === b.timestamp
)

// Combine filters (deduplicate)
const defaultFilters = ['active', 'verified']
const userFilters = ['active', 'premium']

const appliedFilters = union(defaultFilters, userFilters)
// => ['active', 'verified', 'premium']
```

## Related Functions
- **Only common**: `intersect()` - items in both collections
- **Only different**: `symmetricDiff()` - items unique to each
- **Full diff**: `diff()` - categorized changes (added/updated/removed)
- **Simple concat**: `[...a, ...b]` - keep duplicates

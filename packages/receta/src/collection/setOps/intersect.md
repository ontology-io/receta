# Function: intersect

## When to Use
Find elements that exist in both collections. Similar to Set intersection but works with objects and custom equality. Essential for finding overlaps, common items, and shared data.

## Decision Tree
```
Need to find common elements?
│
├─ Items in BOTH collections ───────────────────────► intersect()
│
├─ Items unique to EACH ────────────────────────────► symmetricDiff()
│
├─ Merge both collections ──────────────────────────► union()
│
└─ Full change analysis ────────────────────────────► diff()
```

## Examples
```typescript
// Basic intersection with primitives
intersect([1, 2, 3], [2, 3, 4])
// => [2, 3]

// Find common tasks
const assigned = [{ taskId: 1 }, { taskId: 2 }]
const completed = [{ taskId: 2 }, { taskId: 3 }]

intersect(assigned, completed, (a, b) => a.taskId === b.taskId)
// => [{ taskId: 2 }] // tasks that are both assigned AND completed

// Find users in both teams
const teamA = [
  { id: 1, name: 'Alice' },
  { id: 2, name: 'Bob' }
]
const teamB = [
  { id: 2, name: 'Bob' },
  { id: 3, name: 'Charlie' }
]

pipe(
  teamA,
  intersect(teamB, (a, b) => a.id === b.id)
)
// => [{ id: 2, name: 'Bob' }]

// Find overlapping tags
const post1Tags = ['javascript', 'typescript', 'react']
const post2Tags = ['typescript', 'react', 'vue']

intersect(post1Tags, post2Tags)
// => ['typescript', 'react']

// Access control - find allowed resources
const userPermissions = ['posts:read', 'posts:write', 'users:read']
const requiredPermissions = ['posts:write', 'posts:delete']

const allowed = intersect(userPermissions, requiredPermissions)
// => ['posts:write']
// User has 1 of 2 required permissions

// Find common availability
const aliceAvailability = ['monday', 'wednesday', 'friday']
const bobAvailability = ['wednesday', 'thursday', 'friday']

const meetingSlots = intersect(aliceAvailability, bobAvailability)
// => ['wednesday', 'friday']

// Filter by whitelist
const allProducts = [
  { id: 1, category: 'electronics' },
  { id: 2, category: 'clothing' },
  { id: 3, category: 'electronics' }
]
const allowedCategories = [
  { category: 'electronics' },
  { category: 'books' }
]

const filtered = intersect(
  allProducts,
  allowedCategories,
  (p, c) => p.category === c.category
)
// => [{ id: 1, category: 'electronics' }, { id: 3, category: 'electronics' }]

// Find mutual followers
const aliceFollowers = await getFollowers('alice')
const bobFollowers = await getFollowers('bob')

const mutualFollowers = pipe(
  aliceFollowers,
  intersect(bobFollowers, (a, b) => a.userId === b.userId)
)
```

## Related Functions
- **Combine**: `union()` - merge without duplicates
- **Different**: `symmetricDiff()` - items unique to each
- **Full analysis**: `diff()` - added/updated/removed/unchanged

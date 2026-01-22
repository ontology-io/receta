# Common Patterns & Recipes

Production-ready sorting patterns for real-world applications.

## GitHub Issues Management

```typescript
import { compose, ascending, descending, byDate, nullsFirst } from 'receta/compare'

interface GitHubIssue {
  number: number
  title: string
  status: 'open' | 'closed'
  priority: 'low' | 'medium' | 'high'
  assignee: string | null
  labels: string[]
  createdAt: Date
  updatedAt: Date
  comments: number
}

// Pattern 1: Default issue list (status → priority → age)
const statusOrder = { open: 0, closed: 1 }
const priorityOrder = { high: 0, medium: 1, low: 2 }

export const sortIssuesDefault = compose(
  ascending((i: GitHubIssue) => statusOrder[i.status]),
  ascending((i: GitHubIssue) => priorityOrder[i.priority]),
  byDate((i: GitHubIssue) => i.createdAt)
)

// Pattern 2: Triage view (unassigned → high priority → oldest)
export const sortIssuesTriage = compose(
  nullsFirst(ascending((i: GitHubIssue) => i.assignee ?? '')),
  ascending((i: GitHubIssue) => priorityOrder[i.priority]),
  byDate((i: GitHubIssue) => i.createdAt)
)

// Pattern 3: Activity view (most discussed → recently updated)
export const sortIssuesActivity = compose(
  descending((i: GitHubIssue) => i.comments),
  descending((i: GitHubIssue) => i.updatedAt)
)

// Pattern 4: User-specific (assigned to me → priority → deadline)
export function sortIssuesForUser(username: string) {
  return compose(
    ascending((i: GitHubIssue) => i.assignee === username ? 0 : 1),
    ascending((i: GitHubIssue) => priorityOrder[i.priority]),
    byDate((i: GitHubIssue) => i.createdAt)
  )
}
```

## Stripe Payment Dashboard

```typescript
interface StripePayment {
  id: string
  amount: number
  currency: string
  status: 'succeeded' | 'pending' | 'failed' | 'refunded'
  customer: string
  created: Date
  description: string
}

// Pattern 1: Alert view (failed first → largest → most recent)
const statusPriority = { failed: 0, pending: 1, refunded: 2, succeeded: 3 }

export const sortPaymentsAlerts = compose(
  ascending((p: StripePayment) => statusPriority[p.status]),
  descending((p: StripePayment) => p.amount),
  descending((p: StripePayment) => p.created)
)

// Pattern 2: Financial view (by currency → amount → date)
export const sortPaymentsFinancial = compose(
  ascending((p: StripePayment) => p.currency),
  descending((p: StripePayment) => p.amount),
  descending((p: StripePayment) => p.created)
)

// Pattern 3: Customer view (by customer → most recent)
export const sortPaymentsByCustomer = compose(
  ascending((p: StripePayment) => p.customer),
  descending((p: StripePayment) => p.created)
)
```

## Data Table with Column Sorting

```typescript
interface Employee {
  id: number
  name: string
  department: string
  salary: number
  hireDate: Date
  isActive: boolean
}

interface SortConfig {
  column: keyof Employee
  direction: 'asc' | 'desc'
}

export function buildTableComparator(configs: SortConfig[]): Comparator<Employee> {
  const comparators = configs.map(({ column, direction }) => {
    let base: Comparator<Employee>

    switch (column) {
      case 'hireDate':
        base = byDate(e => e.hireDate)
        break
      case 'salary':
        base = byNumber(e => e.salary)
        break
      case 'isActive':
        base = byBoolean(e => e.isActive)
        break
      default:
        base = caseInsensitive(e => String(e[column]))
    }

    return direction === 'desc' ? reverse(base) : base
  })

  return compose(...comparators)
}

// Usage: User clicks "Department ↑, Salary ↓, Name ↑"
const comparator = buildTableComparator([
  { column: 'department', direction: 'asc' },
  { column: 'salary', direction: 'desc' },
  { column: 'name', direction: 'asc' }
])

employees.sort(comparator)
```

## File Browser

```typescript
interface FileEntry {
  name: string
  type: 'file' | 'directory'
  size: number
  modifiedAt: Date
  extension: string
}

// Pattern 1: Standard view (directories → natural name)
export const sortFilesStandard = compose(
  ascending((f: FileEntry) => f.type === 'directory' ? 0 : 1),
  natural((f: FileEntry) => f.name)
)

// Pattern 2: By size (largest first, directories last)
export const sortFilesBySize = compose(
  ascending((f: FileEntry) => f.type === 'directory' ? 1 : 0),
  descending((f: FileEntry) => f.size)
)

// Pattern 3: By modified date (most recent first)
export const sortFilesByDate = descending((f: FileEntry) => f.modifiedAt)

// Pattern 4: By type (group extensions)
export const sortFilesByType = compose(
  ascending((f: FileEntry) => f.type === 'directory' ? 0 : 1),
  ascending((f: FileEntry) => f.extension),
  natural((f: FileEntry) => f.name)
)
```

## E-commerce Product Listings

```typescript
interface Product {
  id: string
  name: string
  category: string
  price: number
  rating: number
  reviewCount: number
  inStock: boolean
  releaseDate: Date
}

// Pattern 1: Best sellers (in stock → highest rated → most reviews)
export const sortProductsBestSellers = compose(
  reverse(byBoolean((p: Product) => p.inStock)),
  descending((p: Product) => p.rating),
  descending((p: Product) => p.reviewCount)
)

// Pattern 2: New arrivals (most recent → highest rated)
export const sortProductsNewArrivals = compose(
  descending((p: Product) => p.releaseDate),
  descending((p: Product) => p.rating)
)

// Pattern 3: Price low to high
export const sortProductsPriceLow = compose(
  reverse(byBoolean((p: Product) => p.inStock)),
  ascending((p: Product) => p.price)
)

// Pattern 4: By category and rating
export const sortProductsCategoryRating = compose(
  ascending((p: Product) => p.category),
  descending((p: Product) => p.rating),
  descending((p: Product) => p.reviewCount)
)
```

## Task Management

```typescript
interface Task {
  id: string
  title: string
  status: 'todo' | 'in_progress' | 'done'
  priority: number  // 1-5, 5 is highest
  dueDate: Date | null
  assignee: string | null
  createdAt: Date
}

// Pattern 1: My tasks (in progress → high priority → due soon)
const statusOrder = { in_progress: 0, todo: 1, done: 2 }

export const sortTasksMine = compose(
  ascending((t: Task) => statusOrder[t.status]),
  descending((t: Task) => t.priority),
  nullsLast(ascending((t: Task) => t.dueDate ?? new Date(9999, 0))),
  ascending((t: Task) => t.createdAt)
)

// Pattern 2: Team view (unassigned → priority → due date)
export const sortTasksTeam = compose(
  nullsFirst(ascending((t: Task) => t.assignee ?? '')),
  descending((t: Task) => t.priority),
  nullsLast(ascending((t: Task) => t.dueDate ?? new Date(9999, 0)))
)

// Pattern 3: Overdue tasks (past due → highest priority)
export function sortTasksOverdue(now: Date) {
  return compose(
    ascending((t: Task) => {
      if (!t.dueDate) return 1
      return t.dueDate < now ? 0 : 1
    }),
    ascending((t: Task) => t.dueDate ?? new Date(9999, 0)),
    descending((t: Task) => t.priority)
  )
}
```

## Search Results

```typescript
interface SearchResult {
  id: string
  title: string
  description: string
  relevanceScore: number
  category: string
  publishedAt: Date
  viewCount: number
}

// Pattern 1: By relevance (highest → most viewed)
export const sortSearchByRelevance = compose(
  descending((r: SearchResult) => r.relevanceScore),
  descending((r: SearchResult) => r.viewCount)
)

// Pattern 2: Most recent (newest → relevant)
export const sortSearchByDate = compose(
  descending((r: SearchResult) => r.publishedAt),
  descending((r: SearchResult) => r.relevanceScore)
)

// Pattern 3: By category and relevance
export const sortSearchByCategory = compose(
  ascending((r: SearchResult) => r.category),
  descending((r: SearchResult) => r.relevanceScore)
)

// Pattern 4: Popularity (most viewed → relevant → recent)
export const sortSearchByPopularity = compose(
  descending((r: SearchResult) => r.viewCount),
  descending((r: SearchResult) => r.relevanceScore),
  descending((r: SearchResult) => r.publishedAt)
)
```

## Analytics Dashboard

```typescript
interface Metric {
  name: string
  current: number
  previous: number
  change: number
  changePercent: number
  trend: 'up' | 'down' | 'stable'
}

// Pattern 1: Biggest movers (largest % change)
export const sortMetricsByChange = descending(
  (m: Metric) => Math.abs(m.changePercent)
)

// Pattern 2: Alerts (negative trends → largest drops)
export const sortMetricsAlerts = compose(
  ascending((m: Metric) => m.trend === 'down' ? 0 : 1),
  ascending((m: Metric) => m.change)
)

// Pattern 3: Performance (highest current → growing)
export const sortMetricsPerformance = compose(
  descending((m: Metric) => m.current),
  descending((m: Metric) => m.changePercent)
)
```

## Event Calendar

```typescript
interface CalendarEvent {
  id: string
  title: string
  startDate: Date
  endDate: Date
  isAllDay: boolean
  category: string
  attendees: number
}

// Pattern 1: Chronological (start date → duration)
export const sortEventsChronological = compose(
  byDate((e: CalendarEvent) => e.startDate),
  ascending((e: CalendarEvent) => e.endDate.getTime() - e.startDate.getTime())
)

// Pattern 2: Upcoming (all-day last → start time)
export const sortEventsUpcoming = compose(
  ascending((e: CalendarEvent) => e.isAllDay ? 1 : 0),
  byDate((e: CalendarEvent) => e.startDate)
)

// Pattern 3: By category and time
export const sortEventsByCategory = compose(
  ascending((e: CalendarEvent) => e.category),
  byDate((e: CalendarEvent) => e.startDate)
)
```

## Leaderboard / Rankings

```typescript
interface LeaderboardEntry {
  rank: number
  player: string
  score: number
  level: number
  completionTime: number
  achievements: number
}

// Pattern 1: By score (highest → fastest completion)
export const sortLeaderboardByScore = compose(
  descending((e: LeaderboardEntry) => e.score),
  ascending((e: LeaderboardEntry) => e.completionTime)
)

// Pattern 2: By level (highest → most achievements)
export const sortLeaderboardByLevel = compose(
  descending((e: LeaderboardEntry) => e.level),
  descending((e: LeaderboardEntry) => e.achievements),
  ascending((e: LeaderboardEntry) => e.completionTime)
)

// Pattern 3: Speed run (fastest completion → highest score)
export const sortLeaderboardSpeedrun = compose(
  ascending((e: LeaderboardEntry) => e.completionTime),
  descending((e: LeaderboardEntry) => e.score)
)
```

## API Response Pagination

```typescript
interface PaginatedRequest {
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page: number
  pageSize: number
}

function buildAPIComparator<T extends Record<string, any>>(
  request: PaginatedRequest
): Comparator<T> | null {
  if (!request.sortBy) return null

  const extractor = (item: T) => item[request.sortBy!]
  const base = ascending(extractor)

  return request.sortOrder === 'desc' ? reverse(base) : base
}

// Usage in API handler
async function handleListRequest(req: PaginatedRequest) {
  let items = await fetchItems()

  const comparator = buildAPIComparator(req)
  if (comparator) {
    items = items.sort(comparator)
  }

  return paginate(items, req.page, req.pageSize)
}
```

## Next Steps

- **[Migration Guide](./06-migration.md)** - Converting existing sort code
- **[API Reference](./07-api-reference.md)** - Complete function catalog

# API Reference & Quick Lookup

Complete reference for all Collection functions.

## Decision Tree

```
Which function do I need?

├─ Need to group data?
│  ├─ By multiple keys? → nest()
│  └─ By nested path? → groupByPath()
│
├─ Need to detect changes?
│  └─ Between two collections? → diff()
│
├─ Need pagination?
│  ├─ With page numbers? → paginate()
│  └─ Cursor-based (infinite scroll)? → paginateCursor()
│
├─ Need to create index/lookup?
│  └─ With duplicate handling? → indexByUnique()
│
└─ Need set operations?
   ├─ Merge collections? → union()
   ├─ Find common items? → intersect()
   └─ Find differences? → symmetricDiff()
```

## Function Reference

### `nest()` {#nest}

Groups items hierarchically by multiple keys.

**Signature:**
```typescript
function nest<T>(
  items: readonly T[],
  keys: readonly (keyof T | ((item: T) => string | number))[]
): NestedMap<T>
```

**When to use:** Multi-level grouping (2+ levels)

**Example:**
```typescript
nest(comments, ['userId', 'postId'])
```

---

### `groupByPath()` {#groupByPath}

Groups items by a nested object path.

**Signature:**
```typescript
function groupByPath<T>(
  items: readonly T[],
  path: string
): Record<string, T[]>
```

**When to use:** Grouping by nested property like 'user.role'

**Example:**
```typescript
groupByPath(users, 'profile.role')
```

---

### `diff()` {#diff}

Compares two collections and categorizes changes.

**Signature:**
```typescript
function diff<T, TId extends string | number>(
  oldItems: readonly T[],
  newItems: readonly T[],
  getId: (item: T) => TId,
  isEqual?: Comparator<T>
): DiffResult<T>
```

**When to use:** Sync operations, webhooks, change tracking

**Example:**
```typescript
diff(oldUsers, newUsers, u => u.id)
```

---

### `paginate()` {#paginate}

Offset-based pagination with metadata.

**Signature:**
```typescript
function paginate<T>(
  items: readonly T[],
  config: PaginationConfig
): PaginatedResult<T>
```

**When to use:** Admin panels, reports, page numbers needed

**Example:**
```typescript
paginate(items, { page: 1, pageSize: 20 })
```

---

### `paginateCursor()` {#paginateCursor}

Cursor-based pagination for scalability.

**Signature:**
```typescript
function paginateCursor<T, TCursor>(
  items: readonly T[],
  getCursor: (item: T) => TCursor,
  config: CursorPaginationConfig<TCursor>
): CursorPaginatedResult<T, TCursor>
```

**When to use:** Infinite scroll, real-time feeds, large datasets

**Example:**
```typescript
paginateCursor(messages, m => m.id, { limit: 20 })
```

---

### `indexByUnique()` {#indexByUnique}

Creates index with duplicate key handling (returns Result).

**Signature:**
```typescript
function indexByUnique<T, TKey extends string | number>(
  items: readonly T[],
  getKey: (item: T) => TKey,
  config?: IndexConfig
): Result<Record<TKey, T>, DuplicateKeyError>
```

**When to use:** Creating lookup tables, normalization

**Example:**
```typescript
indexByUnique(users, u => u.id, { onCollision: 'error' })
```

---

### `union()` {#union}

Merges collections with custom equality.

**Signature:**
```typescript
function union<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
```

**When to use:** Merging permissions, combining datasets

**Example:**
```typescript
union(set1, set2, (a, b) => a.id === b.id)
```

---

### `intersect()` {#intersect}

Finds elements in both collections.

**Signature:**
```typescript
function intersect<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
```

**When to use:** Finding common items, overlaps

**Example:**
```typescript
intersect(assigned, completed, (a, b) => a.id === b.id)
```

---

### `symmetricDiff()` {#symmetricDiff}

Finds elements in either but not both.

**Signature:**
```typescript
function symmetricDiff<T>(
  items1: readonly T[],
  items2: readonly T[],
  isEqual?: Comparator<T>
): T[]
```

**When to use:** Finding differences, XOR operations

**Example:**
```typescript
symmetricDiff(planned, actual, (a, b) => a.id === b.id)
```

## Type Reference

### `DiffResult<T>`
```typescript
interface DiffResult<T> {
  readonly added: readonly T[]
  readonly updated: readonly UpdatedItem<T>[]
  readonly removed: readonly T[]
  readonly unchanged: readonly T[]
}
```

### `PaginatedResult<T>`
```typescript
interface PaginatedResult<T> {
  readonly items: readonly T[]
  readonly page: number
  readonly pageSize: number
  readonly total: number
  readonly hasNext: boolean
  readonly hasPrevious: boolean
}
```

### `CursorPaginatedResult<T, TCursor>`
```typescript
interface CursorPaginatedResult<T, TCursor> {
  readonly items: readonly T[]
  readonly nextCursor?: TCursor | undefined
  readonly hasMore: boolean
}
```

### `Comparator<T>`
```typescript
type Comparator<T> = (a: T, b: T) => boolean
```

## Cheat Sheet

| I want to... | Use this |
|--------------|----------|
| Group by category then priority | `nest(items, ['category', 'priority'])` |
| Group by user.role | `groupByPath(items, 'user.role')` |
| Detect what changed | `diff(old, new, getId)` |
| Show page 2 of results | `paginate(items, { page: 2, pageSize: 20 })` |
| Implement infinite scroll | `paginateCursor(items, getId, { limit: 20 })` |
| Create fast lookup | `indexByUnique(items, getId)` |
| Merge two arrays (no dups) | `union(arr1, arr2, isEqual)` |
| Find common elements | `intersect(arr1, arr2, isEqual)` |
| Find non-overlapping items | `symmetricDiff(arr1, arr2, isEqual)` |

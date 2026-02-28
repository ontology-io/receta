# Compare Module Decision Tree

## When to Use
Build composable comparators for sorting complex data.

## Function Selection
```
START: What sorting need?
│
├─ BASIC sorting?
│  ├─ Ascending order ────────────────────────────► ascending()
│  ├─ Descending order ───────────────────────────► descending()
│  ├─ Natural sort (e.g., "file10" after "file2") ► natural()
│  └─ By object key ──────────────────────────────► byKey()
│
├─ COMBINE comparators?
│  ├─ Multi-level sort (priority) ────────────────► compose()
│  ├─ Reverse order ──────────────────────────────► reverse()
│  ├─ Nulls first ────────────────────────────────► nullsFirst()
│  ├─ Nulls last ─────────────────────────────────► nullsLast()
│  └─ Tiebreaker ─────────────────────────────────► withTiebreaker()
│
├─ TYPE-SPECIFIC?
│  ├─ Date comparison ─────────────────────────────► byDate()
│  ├─ Number comparison ───────────────────────────► byNumber()
│  ├─ String comparison ───────────────────────────► byString()
│  └─ Boolean comparison ──────────────────────────► byBoolean()
│
└─ ADVANCED string sorting?
    ├─ Case-insensitive ──────────────────────────► caseInsensitive()
    └─ Locale-aware ──────────────────────────────► localeCompare()
```

## Common Pattern
```typescript
// Multi-level sorting
users.sort(compose(
  ascending(u => u.status),      // First by status
  descending(u => u.priority),   // Then by priority
  byDate(u => u.createdAt)       // Finally by date
))
```

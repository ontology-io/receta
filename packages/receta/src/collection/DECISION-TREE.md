# Collection Module Decision Tree

## When to Use
Advanced collection operations beyond basic map/filter.

## Function Selection
```
START: What collection operation?
│
├─ HIERARCHICAL grouping?
│  ├─ Nested groupBy (tree structure) ────────────► nest()
│  └─ Group by nested path ───────────────────────► groupByPath()
│
├─ CHANGE DETECTION?
│  └─ Diff two arrays (added/removed/updated) ────► diff()
│
├─ PAGINATION?
│  ├─ Offset-based (page numbers) ────────────────► paginate()
│  └─ Cursor-based (infinite scroll) ─────────────► paginateCursor()
│
├─ INDEXING?
│  └─ Index by unique key (safe) ─────────────────► indexByUnique()
│
└─ SET OPERATIONS?
    ├─ Union (combine) ───────────────────────────► union()
    ├─ Intersection (common elements) ────────────► intersect()
    └─ Symmetric difference (unique to each) ─────► symmetricDiff()
```

## When NOT to Use
Use Remeda directly for: map, filter, groupBy, sortBy, uniq, etc.
Collection module is for MORE COMPLEX operations.

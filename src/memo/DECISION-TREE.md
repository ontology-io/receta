# Memo Module Decision Tree

## When to Use
Cache expensive function calls for performance optimization.

## Function Selection
```
START: What caching strategy?
│
├─ BASIC memoization?
│  └─ Default (Map-based) ────────────────────────► memoize()
│
├─ CUSTOM cache key?
│  └─ Based on specific args ─────────────────────► memoizeBy()
│
├─ ASYNC functions?
│  └─ Deduplicate concurrent calls ───────────────► memoizeAsync()
│
├─ CACHE STRATEGIES?
│  ├─ TTL (time-to-live) ─────────────────────────► ttlCache()
│  ├─ LRU (least recently used) ──────────────────► lruCache()
│  └─ WeakMap (garbage collected) ────────────────► weakCache()
│
└─ CACHE MANAGEMENT?
    ├─ Clear specific cache ──────────────────────► clearCache()
    ├─ Invalidate many ───────────────────────────► invalidateMany()
    ├─ Invalidate by predicate ───────────────────► invalidateWhere()
    └─ Invalidate all ────────────────────────────► invalidateAll()
```

## Common Use Cases
- **API calls**: Avoid duplicate requests with `memoizeAsync()`
- **Expensive computations**: Cache pure function results with `memoize()`
- **Temporary data**: Use `ttlCache()` for time-sensitive data
- **Memory management**: Use `lruCache()` for bounded memory usage

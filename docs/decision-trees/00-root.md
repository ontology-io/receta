# Receta Function Selection Guide

## Root Decision Tree: Which Module Do I Need?

```
START: What are you trying to do?
│
├─ Handle operations that can FAIL?
│  │
│  ├─ Need detailed error information? ────────────────────► result/
│  │
│  └─ Just care if value exists or not? ───────────────────► option/
│
├─ Work with ASYNC/PROMISE operations?
│  │
│  ├─ Control concurrency or timing? ──────────────────────► async/
│  │
│  └─ Error handling? ─────────────────────────────────────► async/ + result/
│
├─ FILTER or TEST values?
│  │
│  ├─ Simple yes/no checks? ───────────────────────────────► predicate/
│  │
│  └─ Collect multiple errors? ────────────────────────────► validation/
│
├─ Work with COLLECTIONS (arrays, lists)?
│  │
│  ├─ Basic operations (map, filter)? ─────────────────────► remeda directly
│  │
│  ├─ Hierarchical grouping or nesting? ───────────────────► collection/
│  │
│  ├─ Change detection or diffing? ────────────────────────► collection/
│  │
│  └─ Pagination? ─────────────────────────────────────────► collection/
│
├─ Work with OBJECTS?
│  │
│  ├─ Simple pick/omit/mapValues? ────────────────────────► remeda directly
│  │
│  ├─ Flatten/unflatten nested objects? ───────────────────► object/
│  │
│  ├─ Safe nested access? ─────────────────────────────────► object/ (getPath)
│  │
│  └─ Deep merging or validation? ─────────────────────────► object/
│
├─ Work with STRINGS?
│  │
│  ├─ Format/transform (case, slugify)? ───────────────────► string/
│  │
│  ├─ Validate (email, URL)? ──────────────────────────────► string/validators
│  │
│  └─ Sanitize (HTML escape, trim)? ───────────────────────► string/sanitize
│
├─ Work with NUMBERS?
│  │
│  ├─ Format (currency, percentage, bytes)? ───────────────► number/
│  │
│  ├─ Validate or clamp ranges? ───────────────────────────► number/
│  │
│  └─ Parse safely from string? ───────────────────────────► number/fromString
│
├─ OPTIMIZE performance?
│  │
│  ├─ Cache function results? ──────────────────────────────► memo/
│  │
│  └─ Deduplicate async calls? ─────────────────────────────► memo/memoizeAsync
│
├─ UPDATE nested immutable data?
│  │
│  ├─ Simple property updates? ────────────────────────────► object/setPath
│  │
│  └─ Complex compositional updates? ──────────────────────► lens/
│
├─ SORT collections?
│  │
│  ├─ Simple ascending/descending? ────────────────────────► remeda sortBy
│  │
│  └─ Multi-level or custom sorting? ──────────────────────► compare/
│
└─ Transform or compose FUNCTIONS?
   │
   ├─ Conditional logic (if/switch)? ─────────────────────► function/ifElse, cond
   │
   ├─ Compose multiple functions? ────────────────────────► function/compose
   │
   ├─ Partial application? ───────────────────────────────► function/partial
   │
   └─ Memoize? ───────────────────────────────────────────► function/memoize
```

## Quick Reference by Problem Type

### Error Handling
- **Known to fail, need error details** → `result/tryCatch`, `result/map`, `result/flatMap`
- **Optional/nullable values** → `option/fromNullable`, `option/map`
- **Form validation (multiple errors)** → `validation/schema`, `validation/validateAll`

### Async Operations
- **Retry failed requests** → `async/retry`
- **Timeout promises** → `async/timeout`
- **Process array in parallel** → `async/mapAsync`
- **Rate limiting** → `async/debounce`, `async/throttle`

### Data Transformation
- **Filter arrays** → `predicate/where`, `remeda/filter`
- **Transform nested objects** → `object/mapValues`, `lens/over`
- **Group hierarchically** → `collection/nest`
- **Detect changes** → `collection/diff`

### Formatting
- **Currency** → `number/toCurrency`
- **Dates** → Use date library (not yet in Receta)
- **File sizes** → `number/toBytes`
- **URLs/slugs** → `string/slugify`

### Type Safety
- **Type guards** → `predicate/isString`, `predicate/isNumber`, etc.
- **Runtime validation** → `validation/schema`, `object/validateShape`
- **Narrowing unions** → `result/match`, `option/match`

## Module Relationships

```
Core Types (Always Available):
┌──────────┐       ┌──────────┐
│  Result  │       │  Option  │
└────┬─────┘       └────┬─────┘
     │                  │
     └──────┬───────────┘
            │
    ┌───────▼────────┐
    │  Validation    │  (Extends Result with error accumulation)
    └────────────────┘

Functional Utilities:
┌──────────┐  ┌──────────┐  ┌──────────┐
│Predicate │─▶│  Where   │─▶│ Filter   │
└──────────┘  └──────────┘  └──────────┘

Data Operations:
┌──────────┐  ┌──────────┐  ┌──────────┐
│Collection│  │  Object  │  │  String  │
└──────────┘  └──────────┘  └──────────┘
                    │
            ┌───────▼───────┐
            │     Lens      │  (Immutable updates)
            └───────────────┘

Performance:
┌──────────┐  ┌──────────┐
│   Memo   │  │  Async   │
└──────────┘  └──────────┘
```

## Decision Tree Usage Tips

1. **Start broad, narrow down**: Use this root tree first, then dive into module-specific trees
2. **Multiple modules**: Complex problems often need 2-3 modules together
3. **Remeda first**: If Remeda has it, use Remeda. Receta builds on top
4. **Result by default**: When in doubt about error handling, use Result pattern
5. **Option for nullability**: If you'd check `value != null`, use Option instead

## Next Steps

For detailed function selection within each module, see:
- [result/_module.md](result/_module.md)
- [option/_module.md](option/_module.md)
- [async/_module.md](async/_module.md)
- [predicate/_module.md](predicate/_module.md)
- [validation/_module.md](validation/_module.md)
- [collection/_module.md](collection/_module.md)
- [object/_module.md](object/_module.md)
- [string/_module.md](string/_module.md)
- [number/_module.md](number/_module.md)
- [memo/_module.md](memo/_module.md)
- [lens/_module.md](lens/_module.md)
- [compare/_module.md](compare/_module.md)
- [function/_module.md](function/_module.md)

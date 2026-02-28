# Option Module Decision Tree

## When to Use Option Module

Use Option when:
- ✅ Value might be absent (null/undefined)
- ✅ You don't need detailed error information
- ✅ Absence is normal, not exceptional
- ✅ Working with optional/nullable APIs

Don't use Option when:
- ❌ Need error details (use Result instead)
- ❌ Multiple error cases (use Result or Validation)
- ❌ Accumulating errors (use Validation)

## Function Selection Decision Tree

```
START: What do you need to do with Option?
│
├─ CREATE an Option?
│  │
│  ├─ Have a present value? ───────────────────────► some()
│  ├─ Represent absence? ──────────────────────────► none()
│  ├─ From nullable (null/undefined)? ─────────────► fromNullable()
│  ├─ From Result? ────────────────────────────────► fromResult()
│  └─ From code that might throw? ─────────────────► tryCatch()
│
├─ CHECK what type?
│  │
│  ├─ Is it Some? ─────────────────────────────────► isSome()
│  └─ Is it None? ─────────────────────────────────► isNone()
│
├─ TRANSFORM Option?
│  │
│  ├─ Transform value? ─────────────────────────────► map()
│  ├─ Chain Options? ───────────────────────────────► flatMap()
│  ├─ Filter by predicate? ────────────────────────► filter()
│  └─ Flatten nested Option<Option<T>>? ───────────► flatten()
│
├─ EXTRACT value?
│  │
│  ├─ Get or throw? ────────────────────────────────► unwrap()
│  ├─ Get with default? ───────────────────────────► unwrapOr()
│  ├─ Get with computed default? ──────────────────► unwrapOrElse()
│  └─ Pattern match? ──────────────────────────────► match()
│
├─ SIDE EFFECTS?
│  │
│  ├─ Effect on Some? ──────────────────────────────► tap()
│  └─ Effect on None? ──────────────────────────────► tapNone()
│
├─ Work with MULTIPLE Options?
│  │
│  ├─ Collect all present values? ──────────────────► collect()
│  └─ Split into Some/None arrays? ─────────────────► partition()
│
└─ CONVERT to other type?
   │
   ├─ To Result? ─────────────────────────────────────► toResult()
   └─ To null/undefined? ─────────────────────────────► toNullable()
```

## Common Patterns

### Database Queries
```
Query → Option<User>
├─ Found → Some(user)
└─ Not found → None (not an error!)
```

### Configuration
```
Config key → Option<string>
├─ Present → Some(value)
└─ Missing → None (use default)
```

### Array Operations
```
array.find() → T | undefined
├─ Wrap → fromNullable()
├─ Transform → map()
└─ Default → unwrapOr()
```

## Function Categories

### Constructors
- [some.md](some.md), [none.md](none.md), [fromNullable.md](fromNullable.md), [fromResult.md](fromResult.md), [tryCatch.md](tryCatch.md)

### Guards
- [isSome.md](isSome.md), [isNone.md](isNone.md)

### Transformers
- [map.md](map.md), [flatMap.md](flatMap.md), [filter.md](filter.md), [flatten.md](flatten.md)

### Extractors
- [unwrap.md](unwrap.md), [unwrapOr.md](unwrapOr.md), [unwrapOrElse.md](unwrapOrElse.md), [match.md](match.md)

### Side Effects
- [tap.md](tap.md), [tapNone.md](tapNone.md)

### Combinators
- [collect.md](collect.md), [partition.md](partition.md)

### Conversions
- [toResult.md](toResult.md), [toNullable.md](toNullable.md)

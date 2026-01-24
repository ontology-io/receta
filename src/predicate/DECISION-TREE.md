# Predicate Module Decision Tree

## When to Use Predicate Module

Use Predicate when:
- ✅ Filtering collections
- ✅ Runtime type checking
- ✅ Composable boolean logic
- ✅ Reusable validation rules

## Function Selection Decision Tree

```
START: What kind of predicate do you need?
│
├─ COMPARISON (numbers, strings)?
│  │
│  ├─ Greater than? ───────────────────────────────► gt(), gte()
│  ├─ Less than? ──────────────────────────────────► lt(), lte()
│  ├─ Equal? ──────────────────────────────────────► eq(), neq()
│  ├─ Range? ──────────────────────────────────────► between()
│  ├─ String starts/ends? ─────────────────────────► startsWith(), endsWith()
│  ├─ Contains? ───────────────────────────────────► includes()
│  ├─ Regex? ──────────────────────────────────────► matches()
│  └─ Empty check? ────────────────────────────────► isEmpty(), isNotEmpty()
│
├─ COMBINE predicates?
│  │
│  ├─ ALL must match? ─────────────────────────────► and()
│  ├─ ANY can match? ──────────────────────────────► or()
│  ├─ Invert? ─────────────────────────────────────► not()
│  ├─ Exactly one? ────────────────────────────────► xor()
│  ├─ Always true? ────────────────────────────────► always()
│  └─ Always false? ───────────────────────────────► never()
│
├─ BUILD complex predicates?
│  │
│  ├─ Check object properties? ────────────────────► where()
│  ├─ Value in list? ──────────────────────────────► oneOf()
│  ├─ Single property? ────────────────────────────► prop()
│  ├─ Object shape match? ─────────────────────────► matchesShape()
│  ├─ Has property? ───────────────────────────────► hasProperty()
│  ├─ Custom predicate? ───────────────────────────► satisfies()
│  └─ Extract then test? ──────────────────────────► by()
│
└─ TYPE GUARDS?
   │
   ├─ Basic types? ──────────────────────────────────► isString, isNumber, etc.
   ├─ Null checks? ──────────────────────────────────► isNull, isNullish, isDefined
   ├─ Collections? ──────────────────────────────────► isArray, isObject
   ├─ Functions? ────────────────────────────────────► isFunction
   ├─ Special types? ────────────────────────────────► isDate, isRegExp, isError
   └─ Custom instance? ──────────────────────────────► isInstanceOf()
```

## Common Use Cases

### Filter Array
```typescript
import { where, gt, includes } from 'receta/predicate'
R.filter(users, where({
  age: gt(18),
  role: includes(['admin', 'user'])
}))
```

### Complex Logic
```typescript
and(
  gt(0),
  lt(100),
  not(eq(50))
)
```

### Type Guards
```typescript
if (isString(value) && isNotEmpty(value)) {
  // TypeScript knows value is non-empty string
}
```

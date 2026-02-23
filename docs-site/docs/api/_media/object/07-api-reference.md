# API Reference & Quick Lookup

Complete reference for all Object module functions with signatures, parameters, and quick examples.

## Decision Tree

```
What do you need to do?

├─ Access nested value safely
│  → getPath() → Option<T>
│
├─ Update nested value
│  ├─ Set new value
│  │  → setPath()
│  └─ Transform existing
│     → updatePath()
│
├─ Restructure object
│  ├─ Nested → Flat
│  │  → flatten()
│  ├─ Flat → Nested
│  │  → unflatten()
│  └─ Rename keys
│     → rename()
│
├─ Filter/transform
│  ├─ Security filtering
│  │  → mask()
│  ├─ Transform keys
│  │  → mapKeys()
│  ├─ Transform values
│  │  → mapValues()
│  ├─ Filter by keys
│  │  → filterKeys()
│  └─ Filter by values
│     → filterValues()
│
├─ Clean/validate
│  ├─ Remove undefined
│  │  → stripUndefined()
│  ├─ Remove nullish
│  │  → compact()
│  └─ Validate structure
│     → validateShape()
│
└─ Merge objects
   → deepMerge()
```

---

## Quick Reference

| Function | Input → Output | Time | Use Case |
|----------|---------------|------|----------|
| `flatten` | Nested → Flat | O(n) | DB queries, URLs |
| `unflatten` | Flat → Nested | O(n) | Env vars → config |
| `rename` | Obj + Map → Obj | O(n) | API normalization |
| `mask` | Obj + Keys → Obj | O(k) | Security filtering |
| `deepMerge` | Objs[] → Obj | O(n*m) | Config merging |
| `getPath` | Path → Option | O(d) | Safe access |
| `setPath` | Path + Val → Obj | O(d) | Immutable updates |
| `updatePath` | Path + Fn → Obj | O(d) | Transform value |
| `validateShape` | Obj + Schema → Result | O(n) | Type checking |
| `stripUndefined` | Obj → Obj | O(n) | Form cleanup |
| `compact` | Obj → Obj | O(n) | Remove nullish |
| `mapKeys` | Obj + Fn → Obj | O(n) | Key transformation |
| `mapValues` | Obj + Fn → Obj | O(n) | Value transformation |
| `filterKeys` | Obj + Pred → Obj | O(n) | Key filtering |
| `filterValues` | Obj + Pred → Obj | O(n) | Value filtering |

**Legend:** n=keys, d=depth, k=allowed keys, m=objects to merge

---

## Function Signatures

### Core Operations

```typescript
flatten(obj: PlainObject, options?: FlattenOptions): FlatObject
unflatten(obj: FlatObject, options?: UnflattenOptions): PlainObject
rename<T>(obj: T, mapping: Record<string, string>): PlainObject
mask<T>(obj: T, allowedKeys: readonly string[]): Partial<T>
deepMerge(objects: readonly PlainObject[], options?: DeepMergeOptions): PlainObject
```

### Safe Access

```typescript
getPath<T>(obj: PlainObject, path: ObjectPath): Option<T>
setPath<T>(obj: T, path: ObjectPath, value: unknown): T
updatePath<T, V>(obj: T, path: ObjectPath, fn: (value: V) => V): T
```

### Validation

```typescript
validateShape<T>(obj: unknown, schema: ObjectSchema<T>): Result<T, ObjectError>
stripUndefined<T>(obj: T): Partial<T>
compact<T>(obj: T): Partial<T>
```

### Transformation

```typescript
mapKeys<T>(obj: T, fn: (key: string, value: any) => string): PlainObject
mapValues<T, U>(obj: T, fn: (value: any, key: string) => U): Record<keyof T, U>
filterKeys<T>(obj: T, predicate: (key: string) => boolean): Partial<T>
filterValues<T>(obj: T, predicate: (value: any, key: string) => boolean): Partial<T>
```

---

## Cheat Sheet

### Common Tasks

```typescript
// Safely get nested value
getPath(obj, ['a', 'b', 'c']) |> unwrapOr('default')

// Update nested immutably
setPath(obj, ['a', 'b'], newValue)

// Transform nested value
updatePath(obj, ['count'], n => n + 1)

// Flatten for DB
flatten(obj)

// Unflatten from env
unflatten(process.env, { separator: '__' })

// Rename API response
rename(response, { old_key: 'newKey' })

// Remove sensitive fields
mask(user, ['id', 'email', 'name'])

// Merge configs
deepMerge([base, env, user])

// Clean form data
pipe(formData, stripUndefined, compact)

// Validate structure
validateShape(data, schema) |> Result.unwrapOr(fallback)

// Transform all keys
mapKeys(obj, key => key.toUpperCase())

// Transform all values
mapValues(obj, value => value * 2)

// Filter by key pattern
filterKeys(obj, key => key.startsWith('api_'))

// Filter by value
filterValues(obj, value => value > 0)
```

---

## Type Definitions

```typescript
type ObjectPath = readonly (string | number)[]
type PlainObject = Record<string, unknown>
type FlatObject = Record<string, unknown>

interface FlattenOptions {
  separator?: string        // Default: '.'
  maxDepth?: number        // Default: Infinity
  flattenArrays?: boolean  // Default: false
}

interface DeepMergeOptions {
  arrayStrategy?: 'replace' | 'concat' | 'merge'
  customMerge?: (key: string, target: unknown, source: unknown) => unknown
}

type ObjectSchema<T> = {
  [K in keyof T]: ((value: unknown) => value is T[K]) | ObjectSchema<any>
}

interface ObjectError {
  code: 'VALIDATION_ERROR' | 'PATH_NOT_FOUND' | 'INVALID_PATH'
  message: string
  path?: ObjectPath
  cause?: unknown
}
```

---

## Common Patterns

```typescript
// API normalization pipeline
pipe(
  apiResponse,
  flatten(),
  rename(keyMapping),
  unflatten(),
  validateShape(schema)
)

// Form submission pipeline
pipe(
  formData,
  stripUndefined,
  mask(allowedFields),
  validateShape(schema),
  Result.flatMap(submitToApi)
)

// Config loading pipeline
pipe(
  [defaults, envConfig, userConfig],
  deepMerge(),
  validateShape(configSchema),
  Result.unwrapOr(defaults)
)

// Safe nested update
pipe(
  state,
  getPath(['user', 'count']),
  Option.map(n => n + 1),
  Option.match({
    onSome: count => setPath(state, ['user', 'count'], count),
    onNone: () => state
  })
)
```

---

## Related Documentation

- **[Overview](./00-overview.md)** - Why use Object module
- **[Core Operations](./01-core-operations.md)** - flatten, rename, mask, merge
- **[Safe Access](./02-safe-access.md)** - getPath, setPath, updatePath
- **[Validation](./03-validation.md)** - validateShape, cleanup
- **[Transformation](./04-transformation.md)** - map, filter operations
- **[Patterns](./05-patterns.md)** - Real-world recipes
- **[Migration](./06-migration.md)** - From Lodash/Vanilla JS

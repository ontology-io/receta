# Object Module Documentation

Complete guide to Receta's Object module - safe, composable object manipulation with type-safe access, validation, and transformation.

## Quick Start

```typescript
import * as Obj from 'receta/object'
import { pipe } from 'remeda'

// Safe nested access
const host = pipe(
  config,
  Obj.getPath(['database', 'host']),
  unwrapOr('localhost')
)

// Immutable updates
const updated = Obj.setPath(config, ['database', 'port'], 5432)

// Validation
const result = Obj.validateShape(apiResponse, schema)

// Flatten/unflatten
const flat = Obj.flatten(nested)
const nested = Obj.unflatten(flat)

// Security filtering
const safe = Obj.mask(user, ['id', 'email', 'name'])

// Deep merge
const merged = Obj.deepMerge([defaults, envConfig, userConfig])
```

---

## Documentation Structure

### 📚 Learning Path

**New to Object module?** Follow this order:

1. **[Overview](./00-overview.md)** (15 min) - Why Object? Problems it solves
2. **[Core Operations](./01-core-operations.md)** (20 min) - flatten, rename, mask, merge
3. **[Safe Access](./02-safe-access.md)** (15 min) - getPath, setPath, updatePath
4. **[Validation](./03-validation.md)** (15 min) - validateShape, cleanup
5. **[Patterns & Recipes](./05-patterns.md)** (30 min) - Real-world solutions

### 📖 By Topic

#### I want to understand...

- **Why use Object over Lodash?** → [Overview](./00-overview.md#why-object-over-lodashvanilla-js)
- **When to use which function?** → [API Reference](./07-api-reference.md#decision-tree)
- **How to migrate from Lodash?** → [Migration Guide](./06-migration.md)

#### I want examples for...

- **API integration** → [Patterns: API Integration](./05-patterns.md#api-integration)
- **Form handling** → [Patterns: Form Handling](./05-patterns.md#form-handling)
- **Configuration** → [Patterns: Config Management](./05-patterns.md#configuration-management)
- **Security/sanitization** → [Patterns: Security](./05-patterns.md#security--sanitization)

#### I need to...

- **Access nested data safely** → [Safe Access](./02-safe-access.md#getpath)
- **Update nested data immutably** → [Safe Access](./02-safe-access.md#setpath)
- **Flatten/unflatten objects** → [Core Operations](./01-core-operations.md#flatten)
- **Rename API keys** → [Core Operations](./01-core-operations.md#rename)
- **Remove sensitive fields** → [Core Operations](./01-core-operations.md#mask)
- **Merge configs** → [Core Operations](./01-core-operations.md#deepmerge)
- **Validate structure** → [Validation](./03-validation.md#validateshape)
- **Transform keys/values** → [Transformation](./04-transformation.md)

---

## Key Concepts

### 15 Functions Across 4 Categories

| Category | Functions | Purpose |
|----------|-----------|---------|
| **Core** | flatten, unflatten, rename, mask, deepMerge | Restructure objects |
| **Safe Access** | getPath, setPath, updatePath | Type-safe nested operations |
| **Validation** | validateShape, stripUndefined, compact | Runtime checks & cleanup |
| **Transformation** | mapKeys, mapValues, filterKeys, filterValues | Bulk operations |

### Design Principles

1. **Immutable** - Original objects never change
2. **Type-safe** - Full TypeScript support
3. **Composable** - Works in pipe chains
4. **Explicit** - Option/Result for safety
5. **Validated** - Runtime type checking

### Integration Points

```typescript
// With Result pattern
pipe(
  apiResponse,
  Obj.validateShape(schema),
  Result.map(Obj.rename(keyMapping))
)

// With Option pattern
pipe(
  config,
  Obj.getPath(['api', 'key']),
  Option.unwrapOr('default')
)

// With Validation module
pipe(
  formData,
  Obj.stripUndefined,
  (data) => validateBusinessRules(data)  // Validation module
)
```

---

## Common Patterns

### API Response Normalization

```typescript
// GitHub API → Your schema
pipe(
  apiResponse,
  Obj.flatten(),
  Obj.rename(keyMapping),
  Obj.unflatten(),
  Obj.validateShape(schema)
)
```

### Form Submission

```typescript
// Clean, validate, submit
pipe(
  formData,
  Obj.stripUndefined,
  Obj.mask(allowedFields),
  Obj.validateShape(schema),
  Result.flatMap(submitToApi)
)
```

### Configuration Merging

```typescript
// Deep merge with validation
pipe(
  [defaultConfig, envConfig, userConfig],
  Obj.deepMerge({ arrayStrategy: 'concat' }),
  Obj.validateShape(configSchema),
  Result.unwrapOr(defaultConfig)
)
```

### Security Sanitization

```typescript
// Remove sensitive data
pipe(
  dbUser,
  Obj.mask(['id', 'username', 'email', 'avatar']),
  Obj.rename({ username: 'displayName' }),
  sanitizeForLogging
)
```

---

## Quick Reference

```typescript
// Nested access
Obj.getPath(obj, ['a', 'b', 'c'])  // → Option<T>

// Nested update
Obj.setPath(obj, ['a', 'b'], value)  // → T
Obj.updatePath(obj, ['a', 'b'], fn)  // → T

// Restructure
Obj.flatten(nested)                   // → Flat object
Obj.unflatten(flat)                   // → Nested object
Obj.rename(obj, { old: 'new' })       // → Renamed object

// Filter/merge
Obj.mask(obj, ['allowed', 'keys'])    // → Filtered object
Obj.deepMerge([obj1, obj2, obj3])     // → Merged object

// Validate/clean
Obj.validateShape(data, schema)       // → Result<T, E>
Obj.stripUndefined(obj)               // → Without undefined
Obj.compact(obj)                      // → Without nullish

// Transform
Obj.mapKeys(obj, fn)                  // → Keys transformed
Obj.mapValues(obj, fn)                // → Values transformed
Obj.filterKeys(obj, pred)             // → Keys filtered
Obj.filterValues(obj, pred)           // → Values filtered
```

---

## Best Practices

### ✅ Do

```typescript
// Use getPath for safe access
pipe(config, Obj.getPath(['db', 'host']), unwrapOr('localhost'))

// Use mask for security
Obj.mask(user, publicFields)

// Validate unknown data
Obj.validateShape(apiResponse, schema)

// Chain operations in pipelines
pipe(data, Obj.flatten(), Obj.rename(mapping), Obj.unflatten())
```

### ❌ Don't

```typescript
// Don't use for simple access
Obj.getPath(obj, ['name'])  // Just use obj.name

// Don't forget to validate
const data = apiResponse.data  // Might not exist!

// Don't mutate
obj.nested.value = 'new'  // Use setPath instead

// Don't nest too deep without flattening
// Consider flattening for complex nested operations
```

---

## TypeScript Tips

```typescript
// Type-safe path access
interface Config {
  database: {
    host: string
    port: number
  }
}

const host = Obj.getPath<string>(config, ['database', 'host'])
// TypeScript knows this is Option<string>

// Type-safe validation
const schema: ObjectSchema<User> = {
  id: (v): v is number => typeof v === 'number',
  email: (v): v is string => typeof v === 'string'
}
```

---

## Performance

- All operations are O(n) where n is number of keys (optimal)
- `getPath`/`setPath` are O(d) where d is depth
- No hidden cloning - explicit immutability
- Tree-shakeable - only import what you use

---

## Getting Help

- **Examples not working?** Check [Patterns](./05-patterns.md) for complete examples
- **Migration questions?** See [Migration Guide](./06-migration.md)
- **API questions?** See [API Reference](./07-api-reference.md)
- **Conceptual questions?** Read [Overview](./00-overview.md)

---

## Next Steps

1. **Beginners**: Start with [Overview](./00-overview.md)
2. **Migrating**: Read [Migration Guide](./06-migration.md)
3. **Building**: Check [Patterns](./05-patterns.md) for recipes
4. **Reference**: Use [API Reference](./07-api-reference.md) for quick lookup

---

## Complete Documentation

1. **[00-overview.md](./00-overview.md)** - Why Object module exists, problems it solves
2. **[01-core-operations.md](./01-core-operations.md)** - flatten, unflatten, rename, mask, deepMerge
3. **[02-safe-access.md](./02-safe-access.md)** - getPath, setPath, updatePath
4. **[03-validation.md](./03-validation.md)** - validateShape, stripUndefined, compact
5. **[04-transformation.md](./04-transformation.md)** - mapKeys, mapValues, filterKeys, filterValues
6. **[05-patterns.md](./05-patterns.md)** - Real-world recipes and complete solutions
7. **[06-migration.md](./06-migration.md)** - Migrate from Lodash/Vanilla JS
8. **[07-api-reference.md](./07-api-reference.md)** - Quick reference, signatures, cheat sheets

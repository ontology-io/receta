# Option Documentation

Complete guide to Option<T> - type-safe handling of optional values in TypeScript.

## Quick Start

```typescript
import { Option, some, none, map, unwrapOr } from 'receta/option'
import * as R from 'remeda'

// Create Options
const present = some(42)
const absent = none()

// From nullable values
const maybeUser = fromNullable(users.find(u => u.id === id))

// Transform safely
const email = R.pipe(
  maybeUser,
  map(u => u.email),
  map(e => e.toLowerCase()),
  unwrapOr('noreply@example.com')
)
```

## Documentation Structure

### 📚 Learning Path

**New to Option?** Follow this order:

1. **[Overview](./00-overview.md)** (500 lines) - Why Option? When to use it?
   - The problem with nullable types
   - How Option solves it
   - Real-world examples
   - Option vs Result vs Nullable

2. **[Constructors](./01-constructors.md)** (350 lines) - Creating Options
   - `some()`, `none()`, `fromNullable()`
   - `fromResult()`, `tryCatch()`
   - Real-world patterns

3. **[Transformers](./02-transformers.md)** (430 lines) - Working with Options
   - `map()`, `flatMap()`, `filter()`, `flatten()`
   - Pipeline composition
   - Chaining operations

4. **[Extractors](./03-extractors.md)** (480 lines) - Getting values out
   - `unwrap()`, `unwrapOr()`, `unwrapOrElse()`
   - `match()`, `tap()`, `tapNone()`
   - When to use which

5. **[Combinators](./04-combinators.md)** (460 lines) - Arrays and conversions
   - `collect()`, `partition()`
   - `toResult()`, `toNullable()`
   - Bulk operations

6. **[Patterns](./05-patterns.md)** (650 lines) - Real-world recipes
   - Database queries
   - Configuration loading
   - Form validation
   - API integration
   - Caching patterns

7. **[Migration Guide](./06-migration.md)** (570 lines) - From nullable types
   - Step-by-step refactoring
   - Incremental migration
   - Common pitfalls
   - Checklist

8. **[API Reference](./07-api-reference.md)** (770 lines) - Complete API
   - Decision tree
   - All function signatures
   - Quick lookup table
   - Cheat sheet

**Total**: ~4,200 lines of documentation

### 📖 By Topic

#### I want to understand...

- **Why Option exists** → [Overview](./00-overview.md)
- **When to use Option vs Result** → [Overview](./00-overview.md#option-vs-result-vs-nullable)
- **How to create Options** → [Constructors](./01-constructors.md)
- **How to transform values** → [Transformers](./02-transformers.md)
- **How to get values out** → [Extractors](./03-extractors.md)
- **How to work with arrays** → [Combinators](./04-combinators.md)
- **How to integrate with Result** → [Combinators](./04-combinators.md#toresult)

#### I want examples for...

- **Database queries** → [Patterns: Database](./05-patterns.md#database-queries)
- **Configuration** → [Patterns: Configuration](./05-patterns.md#configuration-loading)
- **Form validation** → [Patterns: Form Validation](./05-patterns.md#form-validation)
- **API responses** → [Patterns: API Integration](./05-patterns.md#api-integration)
- **Caching** → [Patterns: Caching](./05-patterns.md#caching)
- **Parsing** → [Patterns: Parsing](./05-patterns.md#parsing)

#### I need to...

- **Migrate from nullable types** → [Migration Guide](./06-migration.md)
- **Find a specific function** → [API Reference](./07-api-reference.md)
- **Decide which function to use** → [API Reference: Decision Tree](./07-api-reference.md#decision-tree)
- **See all signatures** → [API Reference](./07-api-reference.md)

## Key Concepts

### Option is a Box

```
Some(42)          None
┌─────────┐      ┌─────────┐
│   42    │      │         │
└─────────┘      └─────────┘
  (full)          (empty)
```

Operations work on contents without manual unwrapping.

### Type-Safe by Default

```typescript
// Compiler enforces handling both cases
const value: string = unwrapOr(option, 'default')

// Or explicit pattern matching
match(option, {
  onSome: v => doSomething(v),
  onNone: () => handleMissing()
})
```

### Composable in Pipelines

```typescript
R.pipe(
  findUser(id),           // Option<User>
  map(u => u.email),      // Option<string>
  filter(e => e.includes('@')),  // Option<string>
  unwrapOr('noreply@example.com')  // string
)
```

## Common Patterns

### Database Queries

```typescript
const findUserById = (id: string): Option<User> =>
  fromNullable(users.find(u => u.id === id))
```

### Configuration with Defaults

```typescript
const timeout = unwrapOr(getEnv('TIMEOUT'), '5000')
```

### Form Validation

```typescript
const validForm = collect([
  validateEmail(form.email),
  validateAge(form.age)
])
```

### Nested Lookups

```typescript
R.pipe(
  findUser(userId),
  flatMap(u => findTeam(u.teamId)),
  flatMap(t => findUser(t.leadId))
)
```

## Quick Reference

### Creating Options

```typescript
some(42)                    // Some(42)
none()                      // None
fromNullable(value)         // Some(v) or None
fromResult(result)          // Some(v) or None
tryCatch(() => fn())        // Some(v) or None
```

### Transforming Options

```typescript
map(opt, x => x * 2)        // Transform value
flatMap(opt, x => lookup(x)) // Chain operations
filter(opt, x => x > 0)     // Keep if passes
```

### Extracting Values

```typescript
unwrap(opt)                 // Value or throw
unwrapOr(opt, default)      // Value or default
match(opt, { onSome, onNone }) // Handle both
```

## Best Practices

### ✅ Do

- Use `Option` for values that might not exist
- Use `fromNullable()` to convert from nullable types
- Chain operations with `pipe()` and `map()`/`flatMap()`
- Provide defaults with `unwrapOr()` or `unwrapOrElse()`
- Use `collect()` when all values must be present

### ❌ Don't

- Don't use `unwrap()` in production (prefer `unwrapOr`)
- Don't use `Option` when you need error details (use `Result`)
- Don't mix nullable and Option styles in same module
- Don't forget to handle the None case

## TypeScript Tips

### Type Inference

```typescript
// Type is inferred
const opt = some(42)  // Option<number>
const none1 = none()  // Option<never>

// Provide type when needed
const none2: Option<string> = none()
```

### Narrowing with Type Guards

```typescript
if (isSome(opt)) {
  // TypeScript knows opt.value exists
  console.log(opt.value)
}
```

### Generic Functions

```typescript
function process<T>(opt: Option<T>): T {
  return unwrapOr(opt, defaultValue)
}
```

## Performance

Option operations are lightweight:
- Creating Options: O(1)
- `map`, `flatMap`, `filter`: O(1) (short-circuit on None)
- `collect`: O(n) where n = array length
- `partition`: O(n) where n = array length

No performance overhead compared to manual null checks - compiler optimizes discriminated unions efficiently.

## Testing

```typescript
import { some, none, isSome } from 'receta/option'

test('findUser returns Some when found', () => {
  const user = findUser('123')
  expect(isSome(user)).toBe(true)
  if (isSome(user)) {
    expect(user.value.id).toBe('123')
  }
})

test('findUser returns None when not found', () => {
  const user = findUser('999')
  expect(isNone(user)).toBe(true)
})
```

## Getting Help

- **Questions?** Check the [API Reference](./07-api-reference.md)
- **Patterns?** See [Common Patterns](./05-patterns.md)
- **Migration?** Read [Migration Guide](./06-migration.md)
- **Issues?** Visit [GitHub Issues](https://github.com/anthropics/receta/issues)

## Next Steps

1. **Read [Overview](./00-overview.md)** - Understand why Option exists
2. **Try [Quick Start](#quick-start)** - Get hands-on
3. **Browse [Patterns](./05-patterns.md)** - See real-world examples
4. **Check [API Reference](./07-api-reference.md)** - Look up specific functions

---

**Ready to start?** Begin with **[Overview](./00-overview.md)** to understand the fundamentals.

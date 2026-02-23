# Result Module Documentation

Complete guide to error handling with the Result type - making errors visible, typed, and composable.

## Quick Start

```typescript
import * as R from 'remeda'
import { ok, err, map, flatMap, match } from 'receta/result'

// Simple example
const result = tryCatch(() => JSON.parse(jsonString))

match(result, {
  onOk: (data) => console.log('Parsed:', data),
  onErr: (error) => console.error('Failed:', error)
})

// Chaining operations
const userEmail = R.pipe(
  fetchUser(id),
  map(user => user.email),
  unwrapOr('noreply@example.com')
)
```

## Documentation Structure

### 📚 Learning Path

**New to Result?** Follow this order:

1. **[Overview](./00-overview.md)** - Why Result? Real-world motivation
2. **[Constructors](./01-constructors.md)** - Creating Results (`ok`, `err`, `tryCatch`)
3. **[Transformers](./02-transformers.md)** - Working with Results (`map`, `flatMap`)
4. **[Extractors](./03-extractors.md)** - Getting values out (`match`, `unwrapOr`)
5. **[Combinators](./04-combinators.md)** - Multiple Results (`collect`, `partition`)
6. **[Patterns](./05-patterns.md)** - Real-world recipes (API, forms, DB)
7. **[Migration Guide](./06-migration.md)** - From try-catch to Result
8. **[API Reference](./07-api-reference.md)** - Quick lookup

### 📖 By Topic

#### I want to understand...

- **Why use Result?** → [Overview](./00-overview.md)
- **How to create Results** → [Constructors](./01-constructors.md)
- **How to transform Results** → [Transformers](./02-transformers.md)
- **How to extract values** → [Extractors](./03-extractors.md)
- **How to work with multiple Results** → [Combinators](./04-combinators.md)

#### I want examples for...

- **API integration** → [Patterns: API Integration](./05-patterns.md#api-integration)
- **Form validation** → [Patterns: Form Validation](./05-patterns.md#form-validation)
- **Database operations** → [Patterns: Database Operations](./05-patterns.md#database-operations)
- **File operations** → [Patterns: File Operations](./05-patterns.md#file-operations)
- **Authentication** → [Patterns: Authentication](./05-patterns.md#authentication--authorization)
- **Payment processing** → [Patterns: Payment Processing](./05-patterns.md#payment-processing)

#### I need to...

- **Migrate from try-catch** → [Migration Guide](./06-migration.md)
- **Quick function lookup** → [API Reference](./07-api-reference.md)
- **Decision tree: which function?** → [API Reference: Decision Tree](./07-api-reference.md#decision-tree-which-function-do-i-need)

## Key Concepts

### What is Result?

Result is a type that represents either **success** (`Ok`) or **failure** (`Err`):

```typescript
type Result<T, E> = Ok<T> | Err<E>

// Instead of:
try {
  const data = riskyOperation()
} catch (error) {
  // Handle error
}

// Use:
const result: Result<Data, Error> = tryCatch(() => riskyOperation())
match(result, {
  onOk: (data) => /* use data */,
  onErr: (error) => /* handle error */
})
```

### Why Result over try-catch?

✅ **Errors are visible** in function signatures
✅ **Type-safe** error handling
✅ **Composable** with `pipe`
✅ **No hidden exceptions**
✅ **Compiler-enforced** error handling

❌ try-catch hides errors in types
❌ `unknown` error types
❌ Doesn't compose
❌ Easy to forget

## Common Patterns

### API Call

```typescript
const fetchUser = async (id: string) =>
  pipe(
    await tryCatchAsync(() => fetch(`/api/users/${id}`)),
    flatMap(res => tryCatchAsync(() => res.json())),
    mapErr(error => ({ type: 'network', message: error.message }))
  )
```

### Form Validation

```typescript
const validateSignup = (form: SignupForm) =>
  pipe(
    collect([
      validateEmail(form.email),
      validatePassword(form.password)
    ]),
    map(([email, password]) => ({ email, password }))
  )
```

### Database Query

```typescript
const getUserById = async (id: string) =>
  pipe(
    await tryCatchAsync(() => db.user.findUnique({ where: { id } })),
    flatMap(user => fromNullable(user, 'User not found'))
  )
```

## Quick Reference

| I want to... | Function | Example |
|--------------|----------|---------|
| Wrap success | `ok(value)` | `ok(42)` |
| Wrap error | `err(error)` | `err('Not found')` |
| Catch exceptions | `tryCatch(fn)` | `tryCatch(() => JSON.parse(str))` |
| Catch async exceptions | `tryCatchAsync(fn)` | `await tryCatchAsync(() => fetch(url))` |
| Handle null | `fromNullable(value, error)` | `fromNullable(user, 'Not found')` |
| Transform value | `map(fn)` | `map(user => user.email)` |
| Chain operations | `flatMap(fn)` | `flatMap(user => fetchPosts(user.id))` |
| Get value with default | `unwrapOr(default)` | `unwrapOr('Guest')` |
| Handle both cases | `match({onOk, onErr})` | `match({ onOk, onErr })` |
| All must succeed | `collect(results)` | `collect([r1, r2, r3])` |
| Separate good/bad | `partition(results)` | `partition(results)` |

## Real-World Examples

### Stripe Payment Flow

```typescript
const processPayment = (customerId: string, amount: number) =>
  pipe(
    createCharge(customerId, amount),
    flatMap(charge => sendReceipt(charge)),
    tapErr(error => Sentry.capture(error)),
    match({
      onOk: () => ({ success: true }),
      onErr: (error) => ({ success: false, error: error.message })
    })
  )
```

### GitHub API Client

```typescript
const fetchRepos = async (username: string) =>
  pipe(
    await fetchUser(username),
    flatMap(user => tryCatchAsync(() => fetch(user.repos_url))),
    flatMap(res => tryCatchAsync(() => res.json())),
    unwrapOr([])
  )
```

### Bulk User Import

```typescript
const importUsers = async (rows: CSVRow[]) => {
  const results = rows.map(validateUser)
  const [valid, invalid] = partition(results)

  await db.user.createMany({ data: valid })

  return {
    imported: valid.length,
    failed: invalid.length,
    errors: invalid
  }
}
```

## Best Practices

### ✅ Do

- Use Result for operations that can fail predictably
- Chain operations with `flatMap`
- Use `match` or `unwrapOr` at system boundaries
- Add context to errors with `mapErr`
- Log errors with `tapErr`
- Use `collect` for all-or-nothing validation
- Use `partition` for bulk operations

### ❌ Don't

- Don't use `unwrap()` in production (throws!)
- Don't mix Result with throwing code
- Don't ignore errors silently
- Don't over-use Result for simple operations
- Don't forget to handle the error case

## TypeScript Tips

```typescript
// ✅ Explicit error types
type ApiError =
  | { type: 'not_found'; resource: string }
  | { type: 'network'; message: string }

function fetchUser(id: string): Promise<Result<User, ApiError>>

// ✅ Type narrowing with guards
if (isOk(result)) {
  result.value // TypeScript knows this is safe
}

// ✅ Exhaustive matching
match(result, {
  onOk: (value) => /* ... */,
  onErr: (error) => /* ... */  // Must handle!
})
```

## Performance

- **Zero runtime overhead** for type guards
- **Tree-shakeable** - only import what you use
- **No exceptions** - faster than try-catch in hot paths
- **Lazy evaluation** - operations only run when needed

## Testing

```typescript
import { expect, test } from 'bun:test'
import { ok, err, unwrap } from 'receta/result'

test('parseJSON succeeds', () => {
  const result = parseJSON('{"name":"John"}')
  expect(unwrap(result)).toEqual({ name: 'John' })
})

test('parseJSON fails on invalid input', () => {
  const result = parseJSON('invalid')
  expect(isErr(result)).toBe(true)
})
```

## Getting Help

- **Confused about which function to use?** → [Decision Tree](./07-api-reference.md#decision-tree-which-function-do-i-need)
- **Want a complete example?** → [Patterns](./05-patterns.md)
- **Migrating from try-catch?** → [Migration Guide](./06-migration.md)
- **Need quick lookup?** → [API Reference](./07-api-reference.md)

## Next Steps

1. Read the [Overview](./00-overview.md) to understand why Result
2. Try the [examples](../../examples/result-usage.ts)
3. Check out [Patterns](./05-patterns.md) for your use case
4. Use the [API Reference](./07-api-reference.md) for quick lookups

---

**Built on Remeda** · [Source Code](../../src/result/) · [Tests](../../src/result/__tests__/)

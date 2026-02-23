# Option Combinators

> Working with multiple Options and converting between types.

## Overview

| Function | Purpose | Signature |
|----------|---------|-----------|
| `collect` | All Some → Some(array), any None → None | `Option<T>[] → Option<T[]>` |
| `partition` | Separate Some values and None count | `Option<T>[] → [T[], number]` |
| `toResult` | Convert to Result with error | `Option<T> → Result<T, E>` |
| `toNullable` | Convert to nullable | `Option<T> → T \| null` |

## collect()

All-or-nothing: returns Some(array) only if all Options are Some.

```typescript
collect<T>(options: readonly Option<T>[]): Option<T[]>
```

### Usage

```typescript
collect([some(1), some(2), some(3)])
// => Some([1, 2, 3])

collect([some(1), none(), some(3)])
// => None
```

### Real-World: Form Validation

```typescript
const validateForm = (data: FormData) => {
  const fields = collect([
    validateEmail(data.email),
    validatePassword(data.password),
    validateAge(data.age)
  ])

  return map(fields, ([email, password, age]) => ({
    email,
    password,
    age
  }))
}

// Returns Some(validData) only if all fields valid
// Returns None if any field invalid
```

## partition()

Separate Some values from Nones.

```typescript
partition<T>(options: readonly Option<T>[]): [T[], number]
```

### Usage

```typescript
const [values, noneCount] = partition([
  some(1),
  none(),
  some(2),
  none(),
  some(3)
])
// values: [1, 2, 3]
// noneCount: 2
```

### Real-World: Batch Operations

```typescript
const processUsers = async (ids: string[]) => {
  const results = await Promise.all(ids.map(fetchUser))
  const [users, failedCount] = partition(results)

  console.log(`Processed: ${users.length}, Failed: ${failedCount}`)
  return users
}
```

## toResult()

Convert Option to Result, providing error for None case.

```typescript
toResult<T, E>(option: Option<T>, error: E): Result<T, E>
```

### Usage

```typescript
toResult(some(42), 'error')
// => Ok(42)

toResult(none(), 'No value')
// => Err('No value')
```

### Real-World: API Error Responses

```typescript
const getUser = (id: string): Result<User, ApiError> =>
  R.pipe(
    findUserById(id),
    toResult({ code: 'NOT_FOUND', message: `User ${id} not found` })
  )
```

## toNullable()

Convert Option back to nullable type.

```typescript
toNullable<T>(option: Option<T>): T | null
```

### Usage

```typescript
toNullable(some(42))  // => 42
toNullable(none())    // => null
```

### Real-World: External API Payloads

```typescript
const apiPayload = {
  userId: toNullable(maybeUserId),
  email: toNullable(maybeEmail),
  metadata: toNullable(maybeMetadata)
}
// Converts Options to null for JSON serialization
```

## Next Steps

- **[Patterns](./05-patterns.md)** - Real-world combinator recipes
- **[API Reference](./07-api-reference.md)** - Complete signatures

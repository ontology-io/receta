# Option Extractors

> Getting values out of Options safely.

## Overview

Extractors are terminal operations that get values out of Options. They handle both Some and None cases.

| Function | Returns | Use Case |
|----------|---------|----------|
| `unwrap` | `T` (throws if None) | When you're certain it's Some |
| `unwrapOr` | `T` | Provide a default value |
| `unwrapOrElse` | `T` | Compute default lazily |
| `match` | `R` | Handle both cases explicitly |
| `tap` | `Option<T>` | Side effects, returns original |
| `tapNone` | `Option<T>` | Side effects on None |

## unwrap()

Extract value or throw error.

```typescript
unwrap<T>(option: Option<T>): T
```

### Usage

```typescript
unwrap(some(42))  // => 42
unwrap(none())    // throws Error: Cannot unwrap None
```

### Real-World: When You Know It Exists

```typescript
// After validation, you know it exists
const config = unwrap(validateConfig(rawConfig))

// In tests
expect(unwrap(findUserById('test-id'))).toEqual(mockUser)
```

⚠️ **Use sparingly** - Prefer `unwrapOr` or `unwrapOrElse` for production code.

## unwrapOr()

Extract value or return default.

```typescript
// Data-first
unwrapOr<T>(option: Option<T>, defaultValue: T): T

// Data-last
unwrapOr<T>(defaultValue: T): (option: Option<T>) => T
```

### Basic Usage

```typescript
unwrapOr(some(42), 0)  // => 42
unwrapOr(none(), 0)    // => 0
```

### Real-World: Configuration with Defaults

```typescript
const config = {
  timeout: unwrapOr(getEnv('TIMEOUT'), '5000'),
  host: unwrapOr(getEnv('HOST'), 'localhost'),
  port: unwrapOr(getEnv('PORT'), '3000')
}
```

### Real-World: User Display Names

```typescript
const getDisplayName = (user: GitHubUser): string =>
  unwrapOr(fromNullable(user.name), user.login)

// Fallback to username if name not set
```

### In Pipelines

```typescript
const getUserEmail = (id: string): string =>
  R.pipe(
    findUserById(id),
    map(u => u.email),
    unwrapOr('noreply@example.com')
  )
```

## unwrapOrElse()

Extract value or compute default lazily.

```typescript
// Data-first
unwrapOrElse<T>(option: Option<T>, fn: () => T): T

// Data-last
unwrapOrElse<T>(fn: () => T): (option: Option<T>) => T
```

### Basic Usage

```typescript
unwrapOrElse(some(42), () => computeDefault())  // => 42 (fn not called)
unwrapOrElse(none(), () => computeDefault())    // => result of computeDefault()
```

### Real-World: Expensive Defaults

```typescript
// Only fetch default user if needed
const getUser = (id: string): User =>
  unwrapOrElse(
    findUserById(id),
    () => fetchGuestUser() // Only called if user not found
  )
```

### Real-World: Timestamp Generation

```typescript
const getTimestamp = (cached: Option<number>): number =>
  unwrapOrElse(cached, () => Date.now())

// Only generate new timestamp if cache empty
```

## match()

Pattern match on Some/None cases.

```typescript
// Data-first
match<T, R>(
  option: Option<T>,
  patterns: {
    onSome: (value: T) => R
    onNone: () => R
  }
): R

// Data-last
match<T, R>(patterns: {...}): (option: Option<T>) => R
```

### Basic Usage

```typescript
match(some(42), {
  onSome: n => `Value: ${n}`,
  onNone: () => 'No value'
})
// => 'Value: 42'
```

### Real-World: HTTP Status Codes

```typescript
const getStatusCode = (user: Option<User>): number =>
  match(user, {
    onSome: () => 200,
    onNone: () => 404
  })
```

### Real-World: UI Rendering

```typescript
const renderUser = (maybeUser: Option<User>) =>
  match(maybeUser, {
    onSome: user => <UserProfile user={user} />,
    onNone: () => <GuestView />
  })
```

### In Pipelines

```typescript
const processUser = (id: string): string =>
  R.pipe(
    findUserById(id),
    match({
      onSome: user => `Found: ${user.name}`,
      onNone: () => 'User not found'
    })
  )
```

## tap()

Run side effects without changing the Option.

```typescript
// Data-first
tap<T>(option: Option<T>, fn: (value: T) => void): Option<T>

// Data-last
tap<T>(fn: (value: T) => void): (option: Option<T>) => Option<T>
```

### Basic Usage

```typescript
const result = tap(some(42), x => console.log('Value:', x))
// Logs: "Value: 42"
// Returns: Some(42) unchanged
```

### Real-World: Logging

```typescript
const user = R.pipe(
  findUserById(id),
  tap(u => logger.info('User found', { userId: u.id })),
  map(u => u.email)
)
```

### Real-World: Debugging Pipelines

```typescript
const result = R.pipe(
  parseInput(str),
  tap(x => console.log('Parsed:', x)),
  map(x => x * 2),
  tap(x => console.log('Doubled:', x)),
  filter(x => x > 10),
  tap(x => console.log('Filtered:', x))
)
```

## tapNone()

Run side effects when Option is None.

```typescript
// Data-first
tapNone<T>(option: Option<T>, fn: () => void): Option<T>

// Data-last
tapNone<T>(fn: () => void): (option: Option<T>) => Option<T>
```

### Basic Usage

```typescript
const result = tapNone(none(), () => console.log('Value missing'))
// Logs: "Value missing"
// Returns: None unchanged
```

### Real-World: Error Logging

```typescript
const user = R.pipe(
  findUserById(id),
  tapNone(() => logger.warn('User not found', { userId: id })),
  unwrapOr(guestUser)
)
```

### Real-World: Metrics

```typescript
const result = R.pipe(
  cacheGet(key),
  tapNone(() => metrics.increment('cache_miss')),
  unwrapOrElse(() => fetchFromDb(key))
)
```

## Comparison Table

| Extractor | Return Type | Throws | Use Case |
|-----------|-------------|--------|----------|
| `unwrap` | `T` | Yes | Tests, after validation |
| `unwrapOr` | `T` | No | Simple default value |
| `unwrapOrElse` | `T` | No | Expensive/lazy default |
| `match` | `R` | No | Different logic per case |
| `tap` | `Option<T>` | No | Logging, side effects |
| `tapNone` | `Option<T>` | No | Error logging |

## Cheat Sheet

```typescript
// Extract or throw
unwrap(option)

// Extract or use default
unwrapOr(option, defaultValue)

// Extract or compute default
unwrapOrElse(option, () => computeDefault())

// Handle both cases
match(option, {
  onSome: value => doSomething(value),
  onNone: () => doSomethingElse()
})

// Log without changing
R.pipe(
  option,
  tap(x => console.log(x)),
  tapNone(() => console.log('missing'))
)
```

## Anti-Patterns

### ❌ Don't: unwrap() in production

```typescript
// Bad - throws in production
const email = unwrap(getUserEmail(id))
```

### ✅ Do: unwrapOr() with default

```typescript
// Good - safe default
const email = unwrapOr(getUserEmail(id), 'noreply@example.com')
```

### ❌ Don't: Nested if statements

```typescript
// Bad - verbose
let result
if (isSome(option)) {
  result = doSomething(option.value)
} else {
  result = doSomethingElse()
}
```

### ✅ Do: Use match()

```typescript
// Good - clean
const result = match(option, {
  onSome: doSomething,
  onNone: doSomethingElse
})
```

## Next Steps

- **[Combinators](./04-combinators.md)** - Working with arrays of Options
- **[Patterns](./05-patterns.md)** - Real-world extractor recipes
- **[API Reference](./07-api-reference.md)** - Complete function signatures

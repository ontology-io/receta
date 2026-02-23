# API Reference & Quick Lookup

> Complete function signatures and quick reference guide.

## Decision Tree

```
Do you have a value?
├─ Yes → some(value)
└─ No → none()

Do you have T | null | undefined?
└─ fromNullable(value)

Do you have a Result?
└─ fromResult(result)

Does function throw?
└─ tryCatch(() => fn())

Need to transform value?
├─ Keep type → map(fn)
├─ Return Option → flatMap(fn)
└─ Filter → filter(predicate)

Need to extract value?
├─ Have default → unwrapOr(default)
├─ Compute default → unwrapOrElse(() => compute())
├─ Handle both cases → match({ onSome, onNone })
└─ Certain it's Some → unwrap() (⚠️ throws)

Working with arrays?
├─ Need all → collect([...])
└─ Separate → partition([...])

Need different type?
├─ To Result → toResult(error)
└─ To nullable → toNullable()
```

## Constructors

### some()

```typescript
function some<T>(value: T): Some<T>
```

Creates a Some Option containing a value.

**Example:**
```typescript
some(42) // => Some(42)
```

### none()

```typescript
function none<T = never>(): None
```

Creates a None Option representing absence.

**Example:**
```typescript
none() // => None
```

### fromNullable()

```typescript
function fromNullable<T>(value: T | null | undefined): Option<T>
```

Converts nullable values to Option.

**Example:**
```typescript
fromNullable(42)        // => Some(42)
fromNullable(null)      // => None
fromNullable(undefined) // => None
```

### fromResult()

```typescript
function fromResult<T, E>(result: Result<T, E>): Option<T>
```

Converts Result to Option, discarding error.

**Example:**
```typescript
fromResult(ok(42))    // => Some(42)
fromResult(err('e'))  // => None
```

### tryCatch()

```typescript
function tryCatch<T>(fn: () => T): Option<T>
```

Wraps potentially throwing function.

**Example:**
```typescript
tryCatch(() => JSON.parse(str)) // => Some(obj) or None
```

## Type Guards

### isSome()

```typescript
function isSome<T>(option: Option<T>): option is Some<T>
```

Type guard for Some.

**Example:**
```typescript
if (isSome(opt)) {
  console.log(opt.value) // Type-safe access
}
```

### isNone()

```typescript
function isNone<T>(option: Option<T>): option is None
```

Type guard for None.

**Example:**
```typescript
if (isNone(opt)) {
  console.log('No value')
}
```

## Transformers

### map()

```typescript
// Data-first
map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U>

// Data-last
map<T, U>(fn: (value: T) => U): (option: Option<T>) => Option<U>
```

Transform the value inside Option.

**Example:**
```typescript
map(some(5), x => x * 2) // => Some(10)
pipe(some(5), map(x => x * 2)) // => Some(10)
```

### flatMap()

```typescript
// Data-first
flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U>

// Data-last
flatMap<T, U>(fn: (value: T) => Option<U>): (option: Option<T>) => Option<U>
```

Chain Option-returning functions.

**Example:**
```typescript
flatMap(some(5), x => some(x * 2)) // => Some(10)
```

### filter()

```typescript
// Data-first
filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T>

// Data-last
filter<T>(predicate: (value: T) => boolean): (option: Option<T>) => Option<T>
```

Keep value only if predicate passes.

**Example:**
```typescript
filter(some(5), x => x > 0) // => Some(5)
filter(some(-5), x => x > 0) // => None
```

### flatten()

```typescript
// Data-first
flatten<T>(option: Option<Option<T>>): Option<T>

// Data-last
flatten<T>(): (option: Option<Option<T>>) => Option<T>
```

Remove one level of nesting.

**Example:**
```typescript
flatten(some(some(42))) // => Some(42)
flatten(some(none())) // => None
```

## Extractors

### unwrap()

```typescript
unwrap<T>(option: Option<T>): T
```

Extract value or throw.

**Example:**
```typescript
unwrap(some(42)) // => 42
unwrap(none()) // throws Error
```

### unwrapOr()

```typescript
// Data-first
unwrapOr<T>(option: Option<T>, defaultValue: T): T

// Data-last
unwrapOr<T>(defaultValue: T): (option: Option<T>) => T
```

Extract value or return default.

**Example:**
```typescript
unwrapOr(some(42), 0) // => 42
unwrapOr(none(), 0) // => 0
```

### unwrapOrElse()

```typescript
// Data-first
unwrapOrElse<T>(option: Option<T>, fn: () => T): T

// Data-last
unwrapOrElse<T>(fn: () => T): (option: Option<T>) => T
```

Extract value or compute default.

**Example:**
```typescript
unwrapOrElse(some(42), () => compute()) // => 42
unwrapOrElse(none(), () => compute()) // => result of compute()
```

### match()

```typescript
// Data-first
match<T, R>(
  option: Option<T>,
  patterns: { onSome: (value: T) => R; onNone: () => R }
): R

// Data-last
match<T, R>(patterns: {...}): (option: Option<T>) => R
```

Pattern match on Some/None.

**Example:**
```typescript
match(opt, {
  onSome: x => `Value: ${x}`,
  onNone: () => 'No value'
})
```

### tap()

```typescript
// Data-first
tap<T>(option: Option<T>, fn: (value: T) => void): Option<T>

// Data-last
tap<T>(fn: (value: T) => void): (option: Option<T>) => Option<T>
```

Run side effect on Some.

**Example:**
```typescript
tap(some(42), x => console.log(x)) // Logs 42, returns Some(42)
```

### tapNone()

```typescript
// Data-first
tapNone<T>(option: Option<T>, fn: () => void): Option<T>

// Data-last
tapNone<T>(fn: () => void): (option: Option<T>) => Option<T>
```

Run side effect on None.

**Example:**
```typescript
tapNone(none(), () => console.log('missing')) // Logs, returns None
```

## Combinators

### collect()

```typescript
// Data-first
collect<T>(options: readonly Option<T>[]): Option<T[]>

// Data-last
collect<T>(): (options: readonly Option<T>[]) => Option<T[]>
```

All Some → Some(array), any None → None.

**Example:**
```typescript
collect([some(1), some(2)]) // => Some([1, 2])
collect([some(1), none()]) // => None
```

### partition()

```typescript
// Data-first
partition<T>(options: readonly Option<T>[]): [T[], number]

// Data-last
partition<T>(): (options: readonly Option<T>[]) => [T[], number]
```

Separate Some values and None count.

**Example:**
```typescript
partition([some(1), none(), some(2)])
// => [[1, 2], 1]
```

## Conversions

### toResult()

```typescript
// Data-first
toResult<T, E>(option: Option<T>, error: E): Result<T, E>

// Data-last
toResult<E>(error: E): <T>(option: Option<T>) => Result<T, E>
```

Convert to Result with error.

**Example:**
```typescript
toResult(some(42), 'error') // => Ok(42)
toResult(none(), 'error') // => Err('error')
```

### toNullable()

```typescript
// Data-first
toNullable<T>(option: Option<T>): T | null

// Data-last
toNullable<T>(): (option: Option<T>) => T | null
```

Convert to nullable.

**Example:**
```typescript
toNullable(some(42)) // => 42
toNullable(none()) // => null
```

## Cheat Sheet

| I want to... | Use this |
|--------------|----------|
| Create Some | `some(value)` |
| Create None | `none()` |
| From nullable | `fromNullable(value)` |
| From Result | `fromResult(result)` |
| Wrap throwing code | `tryCatch(() => fn())` |
| Check if Some | `isSome(option)` |
| Check if None | `isNone(option)` |
| Transform value | `map(option, fn)` |
| Chain operations | `flatMap(option, fn)` |
| Filter by condition | `filter(option, predicate)` |
| Get value or default | `unwrapOr(option, default)` |
| Get value or throw | `unwrap(option)` |
| Handle both cases | `match(option, { onSome, onNone })` |
| Log for debugging | `tap(option, console.log)` |
| All or nothing | `collect([...])` |
| Separate values | `partition([...])` |
| Convert to Result | `toResult(option, error)` |
| Convert to nullable | `toNullable(option)` |

## Common Patterns

```typescript
// Database query
fromNullable(users.find(u => u.id === id))

// Configuration with default
unwrapOr(getEnv('TIMEOUT'), '5000')

// Form validation
collect([validateEmail(email), validateAge(age)])

// Nested lookups
pipe(findUser(id), flatMap(u => findTeam(u.teamId)))

// Convert to Result for API
toResult(findUser(id), { code: 'NOT_FOUND' })
```

## Next Steps

- **[Overview](./00-overview.md)** - Introduction to Option
- **[Patterns](./05-patterns.md)** - Real-world recipes
- **[README](./README.md)** - Documentation navigation

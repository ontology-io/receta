# API Reference & Quick Lookup

> Fast reference guide with decision trees and function signatures.

## Decision Tree: Which Function Do I Need?

```
Do you have a Result?
├─ YES → Go to "Working with Results"
└─ NO → Go to "Creating Results"

Creating Results:
├─ Do you have a value that succeeded?
│  └─ Use: ok(value)
├─ Do you have an error/failure?
│  └─ Use: err(error)
├─ Might the operation throw?
│  ├─ Is it async?
│  │  └─ Use: tryCatchAsync(fn)
│  └─ Is it sync?
│     └─ Use: tryCatch(fn)
└─ Is the value possibly null/undefined?
   └─ Use: fromNullable(value, error)

Working with Results:
├─ Want to transform the SUCCESS value?
│  └─ Use: map(fn)
├─ Want to transform the ERROR value?
│  └─ Use: mapErr(fn)
├─ Want to chain another operation that returns Result?
│  └─ Use: flatMap(fn)
├─ Want to do something without changing the Result?
│  ├─ On success?
│  │  └─ Use: tap(fn)
│  └─ On error?
│     └─ Use: tapErr(fn)
├─ Want to get the value out?
│  ├─ With a default fallback?
│  │  ├─ Static default?
│  │  │  └─ Use: unwrapOr(default)
│  │  └─ Computed from error?
│  │     └─ Use: unwrapOrElse(fn)
│  ├─ Handle both Ok and Err differently?
│  │  └─ Use: match({onOk, onErr})
│  └─ You're 100% sure it's Ok?
│     └─ Use: unwrap() ⚠️
└─ Have MULTIPLE Results?
   ├─ All must succeed?
   │  └─ Use: collect(results)
   └─ Want successes AND failures?
      └─ Use: partition(results)
```

---

## Function Reference

### Constructors

#### `ok(value)` {#ok}
```typescript
function ok<T>(value: T): Ok<T>
```
Create a successful Result.

**Example:**
```typescript
ok(42)           // Ok(42)
ok("success")    // Ok("success")
ok({ id: 1 })    // Ok({ id: 1 })
```

**When to use:** Wrapping successful values in Result type.

---

#### `err(error)` {#err}
```typescript
function err<E>(error: E): Err<E>
```
Create a failed Result.

**Example:**
```typescript
err("Not found")           // Err("Not found")
err({ code: 404 })         // Err({ code: 404 })
err(new Error("Failed"))   // Err(Error)
```

**When to use:** Explicit error values, validation failures.

---

#### `tryCatch(fn, [mapError])` {#trycatch}
```typescript
function tryCatch<T>(fn: () => T): Result<T, unknown>
function tryCatch<T, E>(fn: () => T, mapError: (error: unknown) => E): Result<T, E>
```
Catch exceptions from synchronous code.

**Example:**
```typescript
tryCatch(() => JSON.parse(str))
tryCatch(() => new URL(str))
tryCatch(
  () => riskyOperation(),
  (e) => ({ type: 'error', message: String(e) })
)
```

**When to use:** `JSON.parse`, `new URL`, any sync code that might throw.

---

#### `tryCatchAsync(fn, [mapError])` {#trycatchasync}
```typescript
async function tryCatchAsync<T>(fn: () => Promise<T>): Promise<Result<T, unknown>>
async function tryCatchAsync<T, E>(
  fn: () => Promise<T>,
  mapError: (error: unknown) => E
): Promise<Result<T, E>>
```
Catch exceptions from async code.

**Example:**
```typescript
await tryCatchAsync(() => fetch(url))
await tryCatchAsync(
  async () => db.user.findFirst({ where: { id } }),
  (e) => `DB error: ${e}`
)
```

**When to use:** `fetch`, database calls, any async code that might throw.

---

#### `fromNullable(value, error)` {#fromnullable}
```typescript
function fromNullable<T, E>(value: T | null | undefined, error: E): Result<T, E>
function fromNullable<E>(error: E): <T>(value: T | null | undefined) => Result<T, E>
```
Convert nullable values to Result.

**Example:**
```typescript
fromNullable(user, "User not found")
fromNullable(arr.find(x => x.id === id), "Not found")

// Data-last
pipe(
  users.find(u => u.id === id),
  fromNullable("User not found")
)
```

**When to use:** `Array.find()`, optional object properties, nullable database results.

---

### Type Guards

#### `isOk(result)` {#isok}
```typescript
function isOk<T, E>(result: Result<T, E>): result is Ok<T>
```
Check if Result is Ok (narrows type).

**Example:**
```typescript
if (isOk(result)) {
  result.value // TypeScript knows this is safe
}
```

---

#### `isErr(result)` {#iserr}
```typescript
function isErr<T, E>(result: Result<T, E>): result is Err<E>
```
Check if Result is Err (narrows type).

**Example:**
```typescript
if (isErr(result)) {
  result.error // TypeScript knows this is safe
}
```

---

### Transformers

#### `map(result, fn)` {#map}
```typescript
function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E>
function map<T, U>(fn: (value: T) => U): <E>(result: Result<T, E>) => Result<U, E>
```
Transform Ok value, pass through Err.

**Example:**
```typescript
map(ok(5), x => x * 2)              // Ok(10)
map(err("fail"), x => x * 2)        // Err("fail")

// In pipe
pipe(
  fetchUser(id),
  map(user => user.email)
)
```

**When to use:** Transforming successful values.

---

#### `mapErr(result, fn)` {#maperr}
```typescript
function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F>
function mapErr<E, F>(fn: (error: E) => F): <T>(result: Result<T, E>) => Result<T, F>
```
Transform Err value, pass through Ok.

**Example:**
```typescript
mapErr(err("fail"), e => `Error: ${e}`)  // Err("Error: fail")

// Add context to errors
pipe(
  riskyOperation(),
  mapErr(e => ({ ...e, timestamp: Date.now() }))
)
```

**When to use:** Enriching errors, normalizing error formats.

---

#### `flatMap(result, fn)` {#flatmap}
```typescript
function flatMap<T, U, E, F>(
  result: Result<T, E>,
  fn: (value: T) => Result<U, F>
): Result<U, E | F>
function flatMap<T, U, F>(
  fn: (value: T) => Result<U, F>
): <E>(result: Result<T, E>) => Result<U, E | F>
```
Chain operations that return Result.

**Example:**
```typescript
flatMap(ok("42"), str => parseNumber(str))  // Ok(42)

// Chaining
pipe(
  fetchUser(id),
  flatMap(user => fetchPosts(user.id)),
  flatMap(posts => formatPosts(posts))
)
```

**When to use:** Chaining Result-returning operations, avoiding nested Results.

---

#### `flatten(result)` {#flatten}
```typescript
function flatten<T, E, F>(result: Result<Result<T, E>, F>): Result<T, E | F>
```
Flatten nested Result one level.

**Example:**
```typescript
flatten(ok(ok(42)))        // Ok(42)
flatten(ok(err("inner")))  // Err("inner")
flatten(err("outer"))      // Err("outer")
```

**When to use:** Simplifying `Result<Result<T, E>, F>` to `Result<T, E | F>`.

---

### Side Effects

#### `tap(result, fn)` {#tap}
```typescript
function tap<T, E>(result: Result<T, E>, fn: (value: T) => void): Result<T, E>
function tap<T>(fn: (value: T) => void): <E>(result: Result<T, E>) => Result<T, E>
```
Run side effect on Ok, return original Result.

**Example:**
```typescript
pipe(
  fetchUser(id),
  tap(user => console.log("Fetched:", user.name)),
  map(user => user.email)
)
```

**When to use:** Logging, analytics, progress updates.

---

#### `tapErr(result, fn)` {#taperr}
```typescript
function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E>
function tapErr<E>(fn: (error: E) => void): <T>(result: Result<T, E>) => Result<T, E>
```
Run side effect on Err, return original Result.

**Example:**
```typescript
pipe(
  riskyOperation(),
  tapErr(error => Sentry.capture(error)),
  tapErr(error => logger.error(error))
)
```

**When to use:** Error monitoring, logging failures.

---

### Extractors

#### `unwrap(result)` {#unwrap}
```typescript
function unwrap<T, E>(result: Result<T, E>): T
```
Get value or throw error. ⚠️ **Use sparingly!**

**Example:**
```typescript
unwrap(ok(42))       // 42
unwrap(err("fail"))  // throws "fail"
```

**When to use:** Tests, when you're certain Result is Ok.

---

#### `unwrapOr(result, default)` {#unwrapor}
```typescript
function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T
function unwrapOr<T>(defaultValue: T): <E>(result: Result<T, E>) => T
```
Get value or return default.

**Example:**
```typescript
unwrapOr(ok(42), 0)        // 42
unwrapOr(err("fail"), 0)   // 0

// UI rendering
const displayName = pipe(
  fetchUser(id),
  map(u => u.name),
  unwrapOr("Anonymous")
)
```

**When to use:** UI defaults, configuration defaults.

---

#### `unwrapOrElse(result, fn)` {#unwraporelse}
```typescript
function unwrapOrElse<T, E>(result: Result<T, E>, fn: (error: E) => T): T
function unwrapOrElse<T, E>(fn: (error: E) => T): (result: Result<T, E>) => T
```
Get value or compute fallback from error.

**Example:**
```typescript
unwrapOrElse(result, (error) => {
  logger.error(error)
  return defaultValue
})
```

**When to use:** Fallback logic depends on the error.

---

#### `match(result, {onOk, onErr})` {#match}
```typescript
function match<T, E, U>(
  result: Result<T, E>,
  handlers: {
    onOk: (value: T) => U
    onErr: (error: E) => U
  }
): U
```
Pattern match on Result.

**Example:**
```typescript
match(fetchUser(id), {
  onOk: (user) => `<div>${user.name}</div>`,
  onErr: (error) => `<div>Error: ${error}</div>`
})
```

**When to use:** Rendering different UI states, API responses.

---

### Combinators

#### `collect(results)` {#collect}
```typescript
function collect<T, E>(results: readonly Result<T, E>[]): Result<T[], E>
```
Convert `Result[]` to `Result<T[]>`, fail on first error.

**Example:**
```typescript
collect([ok(1), ok(2), ok(3)])        // Ok([1, 2, 3])
collect([ok(1), err("fail"), ok(3)])  // Err("fail")

// Multi-field validation
pipe(
  [validateEmail(email), validatePassword(password)],
  collect,
  map(([email, password]) => ({ email, password }))
)
```

**When to use:** Multi-field validation, all-or-nothing operations.

---

#### `partition(results)` {#partition}
```typescript
function partition<T, E>(results: readonly Result<T, E>[]): [T[], E[]]
```
Separate Ok values and Err values.

**Example:**
```typescript
const [successes, failures] = partition([
  ok(1),
  err("fail1"),
  ok(2),
  err("fail2")
])
// successes: [1, 2]
// failures: ["fail1", "fail2"]
```

**When to use:** Bulk operations, showing all successes and failures.

---

## Cheat Sheet

| I want to... | Use this |
|--------------|----------|
| Wrap a success value | `ok(value)` |
| Wrap an error value | `err(error)` |
| Catch sync exceptions | `tryCatch(fn)` |
| Catch async exceptions | `tryCatchAsync(fn)` |
| Handle null/undefined | `fromNullable(value, error)` |
| Transform success value | `map(fn)` |
| Transform error value | `mapErr(fn)` |
| Chain operations | `flatMap(fn)` |
| Log success | `tap(fn)` |
| Log error | `tapErr(fn)` |
| Get value with default | `unwrapOr(default)` |
| Get value with computed fallback | `unwrapOrElse(fn)` |
| Handle both cases | `match({onOk, onErr})` |
| All must succeed | `collect(results)` |
| Separate good/bad | `partition(results)` |

---

## Type Signatures Quick Reference

```typescript
// Types
type Result<T, E> = Ok<T> | Err<E>
type Ok<T> = { _tag: 'Ok'; value: T }
type Err<E> = { _tag: 'Err'; error: E }

// Constructors
ok:             <T>(value: T) => Ok<T>
err:            <E>(error: E) => Err<E>
tryCatch:       <T>(fn: () => T) => Result<T, unknown>
tryCatchAsync:  <T>(fn: () => Promise<T>) => Promise<Result<T, unknown>>
fromNullable:   <T, E>(value: T | null | undefined, error: E) => Result<T, E>

// Guards
isOk:   <T, E>(result: Result<T, E>) => result is Ok<T>
isErr:  <T, E>(result: Result<T, E>) => result is Err<E>

// Transformers
map:      <T, U, E>(result: Result<T, E>, fn: (value: T) => U) => Result<U, E>
mapErr:   <T, E, F>(result: Result<T, E>, fn: (error: E) => F) => Result<T, F>
flatMap:  <T, U, E, F>(result: Result<T, E>, fn: (value: T) => Result<U, F>) => Result<U, E | F>
flatten:  <T, E, F>(result: Result<Result<T, E>, F>) => Result<T, E | F>

// Side Effects
tap:      <T, E>(result: Result<T, E>, fn: (value: T) => void) => Result<T, E>
tapErr:   <T, E>(result: Result<T, E>, fn: (error: E) => void) => Result<T, E>

// Extractors
unwrap:        <T, E>(result: Result<T, E>) => T
unwrapOr:      <T, E>(result: Result<T, E>, defaultValue: T) => T
unwrapOrElse:  <T, E>(result: Result<T, E>, fn: (error: E) => T) => T
match:         <T, E, U>(result: Result<T, E>, handlers: { onOk: (T) => U, onErr: (E) => U }) => U

// Combinators
collect:   <T, E>(results: Result<T, E>[]) => Result<T[], E>
partition: <T, E>(results: Result<T, E>[]) => [T[], E[]]
```

---

## Common Patterns

```typescript
// Pattern 1: API call with error handling
const fetchUser = async (id: string) =>
  pipe(
    await tryCatchAsync(() => fetch(`/api/users/${id}`)),
    flatMap(res => tryCatchAsync(() => res.json())),
    flatMap(validateUser)
  )

// Pattern 2: Multi-field validation
const validateForm = (data: FormData) =>
  pipe(
    collect([
      validateEmail(data.email),
      validatePassword(data.password)
    ]),
    map(([email, password]) => ({ email, password }))
  )

// Pattern 3: Graceful degradation
const getContent = (id: string) =>
  pipe(
    fetchFromCDN(id),
    match({
      onOk: content => ok(content),
      onErr: () => fetchFromDB(id)
    }),
    unwrapOr(defaultContent)
  )

// Pattern 4: Error monitoring
const trackErrors = tapErr(error => {
  Sentry.capture(error)
  analytics.track('error', error)
})
```

---

## Related Docs

- **[Overview](./00-overview.md)**: Why Result?
- **[Constructors](./01-constructors.md)**: Creating Results
- **[Transformers](./02-transformers.md)**: Working with Results
- **[Extractors](./03-extractors.md)**: Getting values out
- **[Combinators](./04-combinators.md)**: Multiple Results
- **[Patterns](./05-patterns.md)**: Real-world recipes
- **[Migration](./06-migration.md)**: From try-catch

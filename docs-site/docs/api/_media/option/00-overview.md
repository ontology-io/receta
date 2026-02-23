# Option: Type-Safe Nullable Values

> **TL;DR**: Option represents values that might not exist, providing a type-safe alternative to `null`/`undefined` that composes cleanly in functional pipelines.

## The Problem: The Billion-Dollar Mistake

### Null Reference Errors Everywhere

```typescript
// Traditional nullable code
function getUserEmail(userId: string): string | undefined {
  const user = users.find(u => u.id === userId)
  return user?.email
}

// Using it requires constant null checks
const email = getUserEmail('123')
if (email !== undefined) {
  sendEmail(email.toUpperCase()) // Safe, but verbose
}

// Easy to forget checks - runtime error!
const email2 = getUserEmail('456')
sendEmail(email2.toUpperCase()) // 💥 Cannot read property 'toUpperCase' of undefined
```

**Problems with nullable types:**
1. **Easy to forget checks** - Nothing forces you to handle `null`/`undefined`
2. **Doesn't compose** - Can't chain operations without repeated checks
3. **Silent failures** - `user?.email?.toLowerCase()` returns `undefined` silently
4. **Type information lost** - `string | undefined` doesn't tell you *why* it's undefined

### How Successful Products Handle This

**Rust's Option type:**
```rust
// Rust forces you to handle None case
fn get_user(id: &str) -> Option<User> {
    users.find(|u| u.id == id)
}

// Compiler error if you don't handle None!
let email = get_user("123").map(|u| u.email); // Returns Option<String>
```

**Scala's Option:**
```scala
// Database queries return Option
def findById(id: String): Option[User] =
  users.find(_.id == id)

// Chainable transformations
val email = findById("123")
  .map(_.email)
  .map(_.toUpperCase)
  .getOrElse("NO EMAIL")
```

**Swift's Optional:**
```swift
// Optional is built into the language
func getUser(id: String) -> User? {
    return users.first(where: { $0.id == id })
}

// if-let syntax forces handling
if let user = getUser("123") {
    print(user.email)
}
```

## The Solution: Option<T>

```typescript
import { Option, some, none, map, unwrapOr } from 'receta/option'
import * as R from 'remeda'

// Returns Option instead of nullable
function getUserEmail(userId: string): Option<string> {
  const user = users.find(u => u.id === userId)
  return user ? some(user.email) : none()
}

// Compose safely without null checks
const email = R.pipe(
  getUserEmail('123'),
  map(e => e.toUpperCase()),
  unwrapOr('NO EMAIL')
)
// If user doesn't exist, returns 'NO EMAIL'
// If user exists, returns 'ALICE@EXAMPLE.COM'

// Never forget to handle missing values - type system enforces it!
const emailOrDefault: string = unwrapOr(getUserEmail('123'), 'default@example.com')
```

## Why Option Over Nullable Types?

### Problem 1: Nullable Types Don't Compose

```typescript
// ❌ Traditional nullable - verbose and error-prone
function getUppercaseEmail(userId: string): string {
  const user = users.find(u => u.id === userId)
  if (!user) return 'NO EMAIL'

  const email = user.email
  if (!email) return 'NO EMAIL'

  return email.toUpperCase()
}

// ✅ Option - clean composition
const getUppercaseEmail = (userId: string): string =>
  R.pipe(
    findUserById(userId),
    map(u => u.email),
    map(e => e.toUpperCase()),
    unwrapOr('NO EMAIL')
  )
```

### Problem 2: Nullable Types Lose Type Information

```typescript
// ❌ Why is it undefined? User not found? Email missing? Permission denied?
function getUserEmail(userId: string): string | undefined {
  const user = users.find(u => u.id === userId)
  if (!user) return undefined // Could be any reason
  return user.email
}

// ✅ Option for existence, Result for detailed errors
function getUserEmail(userId: string): Option<string> {
  const user = users.find(u => u.id === userId)
  return user ? some(user.email) : none()
}

function getUserEmailOrError(userId: string): Result<string, UserError> {
  const user = users.find(u => u.id === userId)
  if (!user) return err({ code: 'USER_NOT_FOUND', userId })
  if (!user.email) return err({ code: 'EMAIL_MISSING', userId })
  return ok(user.email)
}
```

### Problem 3: Nullable Types Don't Work in Pipelines

```typescript
// ❌ Can't pipe nullable values cleanly
const result = R.pipe(
  getUserId(),
  findUser, // returns User | undefined
  // What now? Can't continue pipe if undefined
)

// ✅ Option works seamlessly in pipes
const result = R.pipe(
  getUserId(),
  findUser, // returns Option<User>
  map(u => u.email),
  filter(e => e.includes('@')),
  unwrapOr('guest@example.com')
)
```

## Real-World Use Cases

### 1. Database Queries

```typescript
// findById pattern
const findUserById = (id: string): Option<User> =>
  fromNullable(users.find(u => u.id === id))

const user = findUserById('123')
match(user, {
  onSome: u => console.log(`Found: ${u.name}`),
  onNone: () => console.log('User not found')
})
```

### 2. Configuration Loading

```typescript
// Optional environment variables
const getConfig = (key: string): Option<string> =>
  fromNullable(process.env[key])

const config = {
  apiKey: unwrapOr(getConfig('API_KEY'), 'default-key'),
  timeout: pipe(
    getConfig('TIMEOUT'),
    map(s => Number(s)),
    filter(n => n > 0),
    unwrapOr(5000)
  )
}
```

### 3. Form Validation (Optional Fields)

```typescript
// Some fields are optional
type ProfileForm = {
  name: string
  email: string
  phone?: string // Optional
  website?: string // Optional
}

const validatePhone = (phone: string | undefined): Option<string> =>
  pipe(
    fromNullable(phone),
    filter(p => /^\d{10}$/.test(p))
  )

const profile = {
  name: form.name,
  email: form.email,
  phone: toNullable(validatePhone(form.phone)),
  website: toNullable(fromNullable(form.website))
}
```

### 4. API Responses (Optional Data)

```typescript
// GitHub API - some fields are optional
type GitHubUser = {
  login: string
  name: string | null // Optional
  company: string | null // Optional
  location: string | null // Optional
}

const getUserInfo = (user: GitHubUser) => ({
  login: user.login,
  displayName: unwrapOr(fromNullable(user.name), user.login),
  company: fromNullable(user.company),
  location: fromNullable(user.location)
})
```

### 5. Parsing and Conversion

```typescript
// Parse values that might fail
const parsePositiveInt = (str: string): Option<number> =>
  pipe(
    tryCatch(() => Number(str)),
    filter(n => !Number.isNaN(n) && n > 0 && Number.isInteger(n))
  )

const age = parsePositiveInt('25') // Some(25)
const invalid = parsePositiveInt('abc') // None
const negative = parsePositiveInt('-5') // None
```

## Mental Model: A Box That Might Be Empty

Think of Option as a box:
- **Some(value)** - Box contains a value
- **None** - Box is empty

```
Some(42)          None
┌─────────┐      ┌─────────┐
│   42    │      │         │
└─────────┘      └─────────┘
  (full)          (empty)
```

Operations work on the contents:
```typescript
// map: Transform contents if present
map(some(5), x => x * 2) // Some(10)
map(none(), x => x * 2)  // None (no contents to transform)

// flatMap: Open nested boxes
flatMap(some(5), x => some(x * 2)) // Some(10)
flatMap(some(5), x => none())       // None

// filter: Keep only if predicate passes
filter(some(5), x => x > 0)  // Some(5)
filter(some(-5), x => x > 0) // None
```

## When to Use Option

### ✅ Use Option when:

**1. Value might not exist for valid reasons**
```typescript
// User might not be found - that's not an error
findUserById(id): Option<User>

// Configuration might not be set - use default
getConfig(key): Option<string>

// Search might return no results - that's valid
searchUsers(query): Option<User[]>
```

**2. You want to chain operations safely**
```typescript
pipe(
  findUser(id),
  map(u => u.email),
  map(e => e.toUpperCase()),
  unwrapOr('NO EMAIL')
)
```

**3. You're working with optional fields**
```typescript
type User = {
  name: string
  email: string
  phone?: string // Optional
}

const phone = fromNullable(user.phone)
```

### ❌ Don't use Option for:

**1. Errors that need explanation**
```typescript
// ❌ Bad - no error details
function parseJSON(str: string): Option<unknown>

// ✅ Good - error has details
function parseJSON(str: string): Result<unknown, SyntaxError>
```

**2. Multiple possible error types**
```typescript
// ❌ Bad - can't distinguish error types
function fetchUser(id: string): Option<User>

// ✅ Good - explicit error types
function fetchUser(id: string): Result<User, NetworkError | NotFoundError>
```

**3. When absence is truly exceptional**
```typescript
// ❌ Bad - missing config is a setup error
function getRequiredConfig(key: string): Option<string>

// ✅ Good - throw or return Result
function getRequiredConfig(key: string): Result<string, ConfigError>
```

## Option vs Result vs Nullable

| Use Case | Best Choice | Why |
|----------|-------------|-----|
| Database query by ID | `Option<User>` | Not found is valid, not an error |
| API request | `Result<Data, Error>` | Need error details (network, 404, 500) |
| Optional form field | `Option<string>` or `string \| undefined` | Simple presence/absence |
| Parsing with validation | `Result<T, ParseError>` | Need to know *why* it failed |
| Configuration with default | `Option<string>` | Missing → use default |
| Required configuration | `Result<string, ConfigError>` | Missing is an error |

## Quick Comparison

```typescript
// Nullable type
const email: string | undefined = user?.email
if (email !== undefined) {
  sendEmail(email)
}

// Option type
const email: Option<string> = fromNullable(user?.email)
match(email, {
  onSome: sendEmail,
  onNone: () => console.log('No email')
})

// In a pipeline
pipe(
  fromNullable(user?.email),
  map(e => e.toLowerCase()),
  filter(e => e.includes('@')),
  unwrapOr('no-email@example.com')
)
```

## What's Next?

- **[Constructors](./01-constructors.md)** - Creating Options (`some`, `none`, `fromNullable`)
- **[Transformers](./02-transformers.md)** - Working with Options (`map`, `flatMap`, `filter`)
- **[Extractors](./03-extractors.md)** - Getting values out (`unwrap`, `match`, `unwrapOr`)
- **[Patterns](./05-patterns.md)** - Real-world recipes (DB queries, forms, config)
- **[Migration Guide](./06-migration.md)** - From nullable types to Option

## Core Concepts

1. **Option is a discriminated union** - `Some<T> | None`
2. **Type-safe** - Compiler ensures you handle both cases
3. **Composable** - Works in functional pipelines
4. **Explicit** - Makes optionality visible in types
5. **No magic** - Simple data structures with helper functions

Ready to start? Check out **[Constructors](./01-constructors.md)** to learn how to create Options.

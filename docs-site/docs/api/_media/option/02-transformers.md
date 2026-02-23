# Option Transformers

> Functions that transform Option values while preserving the Some/None state.

## Overview

Transformers let you work with values inside Options without manual unwrapping. They handle the Some/None cases automatically.

| Function | Purpose | Signature |
|----------|---------|-----------|
| `map` | Transform the value | `Option<T> → (T → U) → Option<U>` |
| `flatMap` | Chain Option-returning functions | `Option<T> → (T → Option<U>) → Option<U>` |
| `filter` | Keep value if predicate passes | `Option<T> → (T → boolean) → Option<T>` |
| `flatten` | Unwrap nested Options | `Option<Option<T>> → Option<T>` |

All transformers support **data-first** and **data-last** (pipe) usage via Remeda's `purry`.

## map()

Transform the value inside an Option.

### Signature

```typescript
// Data-first
map<T, U>(option: Option<T>, fn: (value: T) => U): Option<U>

// Data-last
map<T, U>(fn: (value: T) => U): (option: Option<T>) => Option<U>
```

### Basic Usage

```typescript
import { map, some, none } from 'receta/option'

// Transform Some
map(some(5), x => x * 2)
// => Some(10)

// None stays None
map(none(), x => x * 2)
// => None
```

### In Pipelines

```typescript
import * as R from 'remeda'

const result = R.pipe(
  some(5),
  map(x => x * 2),      // Some(10)
  map(x => x + 1),      // Some(11)
  map(x => String(x))   // Some('11')
)
```

### Real-World: Database + Transformation

```typescript
// Find user and get their email
const getUserEmail = (id: string): Option<string> =>
  R.pipe(
    findUserById(id),
    map(user => user.email),
    map(email => email.toLowerCase())
  )

getUserEmail('123')  // => Some('alice@example.com')
getUserEmail('999')  // => None
```

### Real-World: API Response Formatting

```typescript
// GitHub API - format user display name
type GitHubUser = {
  login: string
  name: string | null
  followers: number
}

const getDisplayName = (user: GitHubUser): string =>
  R.pipe(
    fromNullable(user.name),
    map(name => `${name} (@${user.login})`),
    unwrapOr(user.login)
  )

getDisplayName({ login: 'torvalds', name: 'Linus Torvalds', followers: 1000 })
// => 'Linus Torvalds (@torvalds)'

getDisplayName({ login: 'octocat', name: null, followers: 500 })
// => 'octocat'
```

## flatMap()

Chain operations that return Options, avoiding nested `Option<Option<T>>`.

### Signature

```typescript
// Data-first
flatMap<T, U>(option: Option<T>, fn: (value: T) => Option<U>): Option<U>

// Data-last
flatMap<T, U>(fn: (value: T) => Option<U>): (option: Option<T>) => Option<U>
```

### Basic Usage

```typescript
import { flatMap, some, none } from 'receta/option'

// Function returns Option
const half = (x: number) => x % 2 === 0 ? some(x / 2) : none()

flatMap(some(10), half) // => Some(5)
flatMap(some(11), half) // => None
flatMap(none(), half)   // => None
```

### Real-World: Nested Lookups

```typescript
// User has optional team, team has optional lead
type User = { id: string; teamId?: string }
type Team = { id: string; leadId?: string }

const findTeamLead = (userId: string): Option<User> =>
  R.pipe(
    findUserById(userId),
    flatMap(user =>
      fromNullable(user.teamId)
    ),
    flatMap(teamId =>
      findTeamById(teamId)
    ),
    flatMap(team =>
      fromNullable(team.leadId)
    ),
    flatMap(leadId =>
      findUserById(leadId)
    )
  )

// Returns Some(lead) if all lookups succeed, None if any fail
```

### Real-World: Validation Chains

```typescript
const validateAge = (age: number): Option<number> =>
  age >= 18 && age <= 120 ? some(age) : none()

const parseAndValidateAge = (input: string): Option<number> =>
  R.pipe(
    tryCatch(() => Number(input)),
    filter(n => !Number.isNaN(n)),
    flatMap(validateAge)
  )

parseAndValidateAge('25')  // => Some(25)
parseAndValidateAge('15')  // => None (too young)
parseAndValidateAge('abc') // => None (not a number)
```

## filter()

Keep the value only if a predicate passes.

### Signature

```typescript
// Data-first
filter<T>(option: Option<T>, predicate: (value: T) => boolean): Option<T>

// Data-last
filter<T>(predicate: (value: T) => boolean): (option: Option<T>) => Option<T>
```

### Basic Usage

```typescript
import { filter, some, none } from 'receta/option'

filter(some(5), x => x > 0)   // => Some(5)
filter(some(-5), x => x > 0)  // => None
filter(none(), x => x > 0)    // => None
```

### Real-World: Form Validation

```typescript
// Validate email format
const validateEmail = (email: string): Option<string> =>
  R.pipe(
    fromNullable(email),
    filter(e => e.length >= 3),
    filter(e => e.includes('@')),
    filter(e => e.includes('.'))
  )

validateEmail('user@example.com')  // => Some('user@example.com')
validateEmail('invalid')            // => None
validateEmail('')                   // => None
```

### Real-World: Configuration Validation

```typescript
// Parse and validate timeout config
const getTimeout = (): number =>
  R.pipe(
    fromNullable(process.env.TIMEOUT),
    map(s => Number(s)),
    filter(n => !Number.isNaN(n)),
    filter(n => n > 0),
    filter(n => n <= 60000),
    unwrapOr(5000) // Default 5 seconds
  )
```

## flatten()

Remove one level of nesting from Option<Option<T>>.

### Signature

```typescript
// Data-first
flatten<T>(option: Option<Option<T>>): Option<T>

// Data-last
flatten<T>(): (option: Option<Option<T>>) => Option<T>
```

### Basic Usage

```typescript
import { flatten, some, none } from 'receta/option'

flatten(some(some(42)))  // => Some(42)
flatten(some(none()))    // => None
flatten(none())          // => None
```

### Real-World: Avoiding Nesting

```typescript
// Without flatten - nested Option
const lookup1 = (id: string): Option<Option<User>> =>
  R.pipe(
    findTeamById(id),
    map(team => findUserById(team.leadId))
  )
// Returns Option<Option<User>> - awkward!

// With flatten
const lookup2 = (id: string): Option<User> =>
  R.pipe(
    findTeamById(id),
    map(team => findUserById(team.leadId)),
    flatten
  )
// Returns Option<User> - clean!

// Or use flatMap instead
const lookup3 = (id: string): Option<User> =>
  R.pipe(
    findTeamById(id),
    flatMap(team => findUserById(team.leadId))
  )
```

## Combining Transformers

### Pipeline Example

```typescript
const processUserId = (idStr: string): Option<User> =>
  R.pipe(
    // Parse ID
    tryCatch(() => Number(idStr)),
    // Validate it's positive
    filter(id => id > 0),
    // Convert to string
    map(id => String(id)),
    // Look up user
    flatMap(id => findUserById(id)),
    // Filter active users only
    filter(user => user.active)
  )

processUserId('123')   // => Some(user) if found and active
processUserId('-1')    // => None (negative ID)
processUserId('abc')   // => None (parse failed)
```

## Cheat Sheet

```typescript
// Transform value
map(option, x => x * 2)

// Chain Option-returning functions
flatMap(option, x => lookup(x))

// Keep if predicate passes
filter(option, x => x > 0)

// Flatten nested Options
flatten(nestedOption)

// In pipeline
R.pipe(
  some(5),
  map(x => x * 2),
  filter(x => x > 5),
  flatMap(x => lookup(x))
)
```

## When to Use Which

| Scenario | Use |
|----------|-----|
| Transform the value | `map` |
| Value doesn't change type | `map` |
| Next operation returns Option | `flatMap` |
| Conditional keeping | `filter` |
| Have `Option<Option<T>>` | `flatten` or use `flatMap` instead |

## Next Steps

- **[Extractors](./03-extractors.md)** - Getting values out of Options
- **[Combinators](./04-combinators.md)** - Working with arrays of Options
- **[Patterns](./05-patterns.md)** - Real-world transformation recipes

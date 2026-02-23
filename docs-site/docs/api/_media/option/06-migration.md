# Migration Guide: From Nullable to Option

> Step-by-step guide to refactoring nullable types to Option.

## Why Migrate?

**Before: Nullable types**
```typescript
function getUserEmail(id: string): string | undefined {
  const user = users.find(u => u.id === id)
  return user?.email
}

// Easy to forget null checks
const email = getUserEmail('123')
sendEmail(email.toUpperCase()) // 💥 Runtime error!
```

**After: Option**
```typescript
function getUserEmail(id: string): Option<string> {
  const user = users.find(u => u.id === id)
  return user ? some(user.email) : none()
}

// Type system forces you to handle absence
const email = unwrapOr(getUserEmail('123'), 'noreply@example.com')
sendEmail(email.toUpperCase()) // ✓ Always safe
```

## Step 1: Identify Nullable Returns

### Find Functions Returning Nullable

```typescript
// ❌ Before
function findUser(id: string): User | undefined
function getConfig(key: string): string | null
function parseNumber(str: string): number | undefined
```

### Convert to Option

```typescript
// ✅ After
function findUser(id: string): Option<User>
function getConfig(key: string): Option<string>
function parseNumber(str: string): Option<number>
```

## Step 2: Replace Constructors

### From Explicit null/undefined

```typescript
// ❌ Before
function findUser(id: string): User | undefined {
  const user = users.find(u => u.id === id)
  return user ?? undefined
}

// ✅ After
function findUser(id: string): Option<User> {
  const user = users.find(u => u.id === id)
  return user ? some(user) : none()
}

// Or simpler:
function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}
```

### From Array Methods

```typescript
// ❌ Before
const first = arr[0] ?? undefined
const found = arr.find(predicate) ?? undefined

// ✅ After
const first = fromNullable(arr[0])
const found = fromNullable(arr.find(predicate))
```

## Step 3: Replace Null Checks

### From if statements

```typescript
// ❌ Before
const user = findUser(id)
if (user !== undefined) {
  console.log(user.name)
} else {
  console.log('Not found')
}

// ✅ After
const user = findUser(id)
match(user, {
  onSome: u => console.log(u.name),
  onNone: () => console.log('Not found')
})
```

### From Optional Chaining

```typescript
// ❌ Before
const email = user?.email?.toLowerCase()

// ✅ After
const email = pipe(
  fromNullable(user),
  map(u => u.email),
  map(e => e.toLowerCase())
)
```

### From Nullish Coalescing

```typescript
// ❌ Before
const timeout = config.timeout ?? 5000

// ✅ After
const timeout = unwrapOr(fromNullable(config.timeout), 5000)
```

## Step 4: Replace Chains

### From Multiple Checks

```typescript
// ❌ Before
function getTeamLeadEmail(userId: string): string | undefined {
  const user = users.find(u => u.id === userId)
  if (!user) return undefined

  const team = teams.find(t => t.id === user.teamId)
  if (!team) return undefined

  const lead = users.find(u => u.id === team.leadId)
  if (!lead) return undefined

  return lead.email
}

// ✅ After
function getTeamLeadEmail(userId: string): Option<string> {
  return pipe(
    findUserById(userId),
    flatMap(user => findTeamById(user.teamId)),
    flatMap(team => findUserById(team.leadId)),
    map(lead => lead.email)
  )
}
```

## Step 5: Handle Extraction

### Simple Defaults

```typescript
// ❌ Before
const value = maybeValue ?? defaultValue

// ✅ After
const value = unwrapOr(maybeValue, defaultValue)
```

### Computed Defaults

```typescript
// ❌ Before
const value = maybeValue ?? expensiveComputation()

// ✅ After
const value = unwrapOrElse(maybeValue, () => expensiveComputation())
```

## Incremental Migration Strategy

### 1. Start at the Edges

Migrate leaf functions first:

```typescript
// Start here ✓
function findUser(id: string): Option<User>

// Then here
function getTeamLead(userId: string): Option<User> {
  return pipe(
    findUser(userId),  // Already migrated
    flatMap(user => findTeam(user.teamId))
  )
}
```

### 2. Use Conversion Functions

Bridge between old and new code:

```typescript
// New code using Option
function findUserOption(id: string): Option<User>

// Legacy wrapper
function findUser(id: string): User | undefined {
  return toNullable(findUserOption(id))
}

// Gradually phase out legacy wrapper
```

### 3. Module by Module

```typescript
// database.ts - fully migrated
export function findById(id: string): Option<User>

// api.ts - partially migrated, uses conversion
import { findById } from './database'
const user = toNullable(findById(id))

// Eventually migrate api.ts too
```

## Common Pitfalls

### ❌ Forgetting to Handle None

```typescript
// Bad - doesn't handle None
const email = unwrap(getUserEmail(id)) // Throws!
```

### ✅ Always Provide Fallback

```typescript
// Good
const email = unwrapOr(getUserEmail(id), 'noreply@example.com')
```

### ❌ Mixing Nullable and Option

```typescript
// Confusing - mixed types
function process(x: Option<string>): string | undefined
```

### ✅ Pick One Style Per Module

```typescript
// Clear - consistent types
function process(x: Option<string>): Option<string>
```

## Migration Checklist

- [ ] Identify all functions returning `T | null | undefined`
- [ ] Convert return types to `Option<T>`
- [ ] Replace `null`/`undefined` returns with `some()`/`none()`
- [ ] Replace null checks with `match()` or `unwrapOr()`
- [ ] Convert chains to `pipe()` with `map()`/`flatMap()`
- [ ] Add tests for both Some and None cases
- [ ] Update TypeScript types
- [ ] Remove `!` non-null assertions
- [ ] Remove optional chaining that's no longer needed

## Next Steps

- **[Patterns](./05-patterns.md)** - Common Option patterns
- **[API Reference](./07-api-reference.md)** - Complete API

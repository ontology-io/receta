# prefer-option-over-null

Prefer `Option<T>` over `T | null | undefined` for nullable values.

## Rule Details

This rule enforces using Receta's `Option` type instead of nullable types (`T | null | undefined`) for representing optional values.

**Why?**

- ✅ Eliminates null/undefined bugs — Forces explicit handling
- ✅ Type-safe — No accidental null dereferences
- ✅ Composable — Chain operations with `map`, `flatMap`, `filter`
- ✅ Self-documenting — Intent is clear from function signature

## Examples

### ❌ Incorrect

```typescript
function findUser(id: string): User | undefined {
  return users.find(u => u.id === id)
}

function getConfig(key: string): Config | null {
  return config[key] || null
}

const maybeValue: string | undefined = getValue()
```

### ✅ Correct

```typescript
import { Option, fromNullable, some, none } from 'receta/option'

function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}

function getConfig(key: string): Option<Config> {
  return fromNullable(config[key])
}

const maybeValue: Option<string> = fromNullable(getValue())
```

## Autofix Behavior

This rule provides two autofixes:

1. **Return type conversion** — `T | null | undefined` → `Option<T>`
2. **Return statement wrapping** — `return value` → `return fromNullable(value)`

**Before:**

```typescript
function findFirst(arr: number[]): number | undefined {
  return arr[0]
}
```

**After (autofix):**

```typescript
import { Option, fromNullable } from 'receta/option'

function findFirst(arr: number[]): Option<number> {
  return fromNullable(arr[0])
}
```

## Usage with Option Combinators

Once using Option, leverage combinators for safe transformations:

```typescript
import * as R from 'remeda'
import { Option, fromNullable, unwrapOr } from 'receta/option'

function getUserEmail(userId: string): Option<string> {
  return R.pipe(
    findUser(userId),
    Option.map(user => user.email),
    Option.filter(email => email.includes('@'))
  )
}

// Extract with default
const email = unwrapOr(getUserEmail('123'), 'noreply@example.com')
```

## When Not To Use

This rule may not be suitable for:

- **External API contracts** — When integrating with APIs that return `null`/`undefined`
- **Performance-critical code** — Option has minimal overhead, but nullable types are slightly faster
- **Gradual migration** — Disable temporarily when migrating large codebases

## Options

This rule has no options.

## Further Reading

- [Option Module Documentation](../../../docs/modules/option/README.md)
- [Option vs Nullable Types Guide](../../../docs/guides/option-vs-nullable.md)

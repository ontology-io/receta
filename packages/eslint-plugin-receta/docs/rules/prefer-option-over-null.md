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
import { fromNullable, none, some, type Option } from '@ontologyio/receta/option'

function findUser(id: string): Option<User> {
  return fromNullable(users.find(u => u.id === id))
}

function getConfig(key: string): Option<Config> {
  return fromNullable(config[key])
}

const maybeValue: Option<string> = fromNullable(getValue())
```

## What Is Reported

**Annotated functions** — A return type of `T | null`, `T | undefined` or `T | null | undefined`.

**Unannotated functions** — A function that can return `null` or `undefined` and can also return a real value. Both sides of `a ? b : null` and `a ?? null` count.

```typescript
function getOrder(raw: string) {
  const order = parse(raw)
  if (!order) return null // Reported
  return order.lines
}
```

For unannotated functions, these are not reported:

- `null` anywhere but a returned value, such as `let x = null`, `x === null` or `return { data: null }`
- A function that only ever returns `null`, because nothing about it is optional
- A bare `return`, which `consistent-return` already covers
- A function that returns JSX, because `null` is how a React component renders nothing
- An inline callback, an object property or a function typed through its variable (`const h: Handler = ...`), because the contract it has to fit is set elsewhere

## Autofix Behavior

This rule provides two autofixes:

1. **Return type conversion** — `T | null | undefined` → `Option<T>`
2. **Return statement wrapping** — `return value` → `return fromNullable(value)`

They are offered together, and only when every path out of the function goes through a `return value` the fix can wrap. These are reported without a fix:

- Unannotated functions, because there is no return type to rewrite
- Unions with several real members, such as `number | string | null`
- Arrow functions with an expression body
- A bare `return`, or a path that can run off the end of the function (a loop or `switch` as the last statement counts, because neither can be proven to exit)

The rewritten function returns an `Option` instead of a raw value, so its callers need updating. Run `tsc` after `--fix` to find them.

**Before:**

```typescript
function findFirst(arr: number[]): number | undefined {
  return arr[0]
}
```

**After (autofix):**

```typescript
import { fromNullable, type Option } from '@ontologyio/receta/option'

function findFirst(arr: number[]): Option<number> {
  return fromNullable(arr[0])
}
```

## Usage with Option Combinators

Once using Option, leverage combinators for safe transformations:

```typescript
import * as R from 'remeda'
import { filter, fromNullable, map, unwrapOr, type Option } from '@ontologyio/receta/option'

function getUserEmail(userId: string): Option<string> {
  return R.pipe(
    findUser(userId),
    map(user => user.email),
    filter(email => email.includes('@'))
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

The fix never changes a return type that something else depends on. A class method, an overload, a typed variable or a callback is reported without a fix, and so is a file where `Option` or `fromNullable` already means something else. An aliased import is reused under its alias.

## Further Reading

- [Option Module Documentation](../../../docs/modules/option/README.md)
- [Option vs Nullable Types Guide](../../../docs/guides/option-vs-nullable.md)

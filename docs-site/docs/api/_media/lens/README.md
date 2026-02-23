# Lens Documentation

Complete guide to using lenses for composable immutable updates in Receta.

## What Are Lenses?

Lenses provide a **composable, type-safe way** to read and update deeply nested data structures without mutation. Think "dot notation that works for updates" with full immutability guarantees.

## Quick Start

```typescript
import { prop, path, view, set, over } from 'receta/lens'
import * as R from 'remeda'

interface User {
  name: string
  address: { city: string }
}

// Create lenses
const nameLens = prop<User>('name')
const cityLens = path<User, string>('address.city')

const user = { name: 'Alice', address: { city: 'Boston' } }

// Read
view(nameLens, user) // 'Alice'

// Write
set(cityLens, 'NYC', user)
// => { name: 'Alice', address: { city: 'NYC' } }

// Transform
over(nameLens, (name) => name.toUpperCase(), user)
// => { name: 'ALICE', address: { city: 'Boston' } }

// Chain updates
R.pipe(
  user,
  set(cityLens, 'NYC'),
  over(nameLens, (n) => n.toUpperCase())
)
```

## Documentation Structure

### 📚 Learning Path

**New to Lenses?** Follow this order:

1. **[Overview](./00-overview.md)** - Why lenses? Real-world problems they solve
2. **[Constructors](./01-constructors.md)** - Creating lenses (`prop`, `path`, `index`, `lens`)
3. **[Operations](./02-operations.md)** - Using lenses (`view`, `set`, `over`)
4. **[Composition](./03-composition.md)** - Combining lenses for deep access
5. **[Patterns](./04-patterns.md)** - Real-world recipes (React, Redux, Forms)
6. **[Migration](./05-migration.md)** - Refactoring from spread operators
7. **[API Reference](./06-api-reference.md)** - Complete function reference

### 📖 By Topic

#### I want to understand...
- **[Why use lenses?](./00-overview.md#the-problem-deep-updates-are-painful)** - Real problems lenses solve
- **[How lenses work](./00-overview.md#mental-model-focusing-glasses)** - Mental model
- **[When to use lenses](./00-overview.md#when-to-use-lenses)** - Decision criteria

#### I want examples for...
- **[React state management](./04-patterns.md#react-state-management)** - useState, Zustand
- **[Redux reducers](./04-patterns.md#redux-patterns)** - Clean reducers with lenses
- **[Form handling](./04-patterns.md#form-validation)** - Field updates and validation
- **[API responses](./04-patterns.md#api-response-transformation)** - Normalizing nested data
- **[Configuration](./04-patterns.md#configuration-management)** - Environment-specific config

#### I need to...
- **[Create a lens](./01-constructors.md)** - All constructor functions
- **[Read a value](./02-operations.md#view---reading-values)** - Using `view()`
- **[Update a value](./02-operations.md#set---updating-values)** - Using `set()`
- **[Transform a value](./02-operations.md#over---transforming-values)** - Using `over()`
- **[Access deep nesting](./03-composition.md)** - Lens composition
- **[Refactor existing code](./05-migration.md)** - Migration from spreads

## Key Concepts

### Lenses Are...

✅ **Composable** - Build complex accessors from simple ones
✅ **Type-safe** - Full TypeScript inference
✅ **Immutable** - Never mutate original data
✅ **Reusable** - Define once, use everywhere
✅ **Readable** - Clear intent, no nested spreads

### Three Operations

1. **`view(lens, data)`** - Read the focused value
2. **`set(lens, value, data)`** - Update the focused value
3. **`over(lens, fn, data)`** - Transform the focused value

All operations:
- Work immutably (return new data)
- Support data-first and data-last
- Compose naturally with `R.pipe()`

## Common Patterns

### Pattern: React State Update

```typescript
const [state, setState] = useState(initial)

const updateCity = (city: string) => {
  setState((s) => set(cityLens, city, s))
}
```

### Pattern: Redux Reducer

```typescript
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'INCREMENT':
      return over(counterLens, (n) => n + 1, state)
    default:
      return state
  }
}
```

### Pattern: Chain Multiple Updates

```typescript
const updated = R.pipe(
  state,
  set(nameLens, 'Bob'),
  set(cityLens, 'NYC'),
  over(ageLens, (age) => age + 1)
)
```

## Quick Reference

| Constructor | Use For                  | Example                       |
| ----------- | ------------------------ | ----------------------------- |
| `prop`      | Object property          | `prop<User>('name')`          |
| `path`      | Nested path              | `path<User>('address.city')`  |
| `index`     | Array element            | `index<Todo>(0)`              |
| `optional`  | Nullable field           | `optional(prop<User>('bio'))` |
| `lens`      | Custom logic             | `lens(get, set)`              |

| Operation  | Purpose                     | Example                                |
| ---------- | --------------------------- | -------------------------------------- |
| `view`     | Read                        | `view(lens, data)`                     |
| `set`      | Write                       | `set(lens, value, data)`               |
| `over`     | Transform                   | `over(lens, (x) => x + 1, data)`       |
| `compose`  | Combine lenses              | `compose(outer, inner)`                |

## Real-World Examples

### Stripe Settings Update

```typescript
const businessCityLens = path<Settings, string>('account.business.address.city')
const brandingLogoLens = path<Settings, string>('account.branding.logo')

const updateSettings = (settings: Settings) =>
  R.pipe(
    settings,
    set(businessCityLens, 'San Francisco'),
    set(brandingLogoLens, 'https://cdn.stripe.com/logo.png')
  )
```

### GitHub PR State

```typescript
const ciStatusLens = path<PRState, string>('pullRequest.checks.ci.status')

const handleWebhook = (state: PRState, status: string) =>
  set(ciStatusLens, status, state)
```

### Shopping Cart

```typescript
const itemsLens = prop<Cart>('items')

const updateQuantity = (cart: Cart, itemId: string, qty: number) =>
  over(itemsLens, (items) =>
    items.map((item) =>
      item.id === itemId ? { ...item, quantity: qty } : item
    ),
    cart
  )
```

## Best Practices

### ✅ Do

- Define lenses at module level for reuse
- Use `path()` for nested access
- Use `over()` when transforming values
- Chain updates with `R.pipe()`
- Keep lens definitions close to type definitions

### ❌ Don't

- Create lenses inline repeatedly
- Use `set()` when you need `over()`
- Mix lenses with direct mutation
- Use lenses for shallow single-property updates (just use spread)
- Forget that operations return new data

## TypeScript Tips

### Type Inference

```typescript
// ✅ Good: Types inferred from context
const nameLens = prop<User>('name')
view(nameLens, user) // string

// ✅ Good: Explicit type for path
const cityLens = path<User, string>('address.city')

// ⚠️ Path needs type annotation for nested access
const zipLens = path<User, string>('address.zip')
```

### Type Safety

```typescript
// ✅ TypeScript catches typos
const badLens = prop<User>('nmae') // Error: no such property

// ✅ TypeScript enforces value types
set(ageLens, 'thirty', user) // Error: expected number
```

## Performance

Lens operations are fast:
- Lens creation is cheap (just object creation)
- Operations have minimal overhead vs manual spreads
- Composition is free (just function composition)
- Tree-shakeable (only include what you use)

## Getting Help

- **Questions**: Check [API Reference](./06-api-reference.md)
- **Examples**: See [Patterns](./04-patterns.md)
- **Migration**: Read [Migration Guide](./05-migration.md)
- **Issues**: [GitHub Issues](https://github.com/your-org/receta/issues)

## Next Steps

### Just Getting Started?
→ Read the **[Overview](./00-overview.md)** to understand why lenses exist

### Ready to Use Lenses?
→ Jump to **[Constructors](./01-constructors.md)** to learn how to create them

### Want Copy-Paste Code?
→ Browse **[Patterns](./04-patterns.md)** for real-world recipes

### Need Full Reference?
→ Check **[API Reference](./06-api-reference.md)** for all functions

---

**Quick Links**:
- [← Back to Main Docs](../)
- [Examples](../../examples/lens-usage.ts)
- [Source Code](../../src/lens/)

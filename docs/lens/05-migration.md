# Migration Guide: From Spread Operators to Lenses

Step-by-step guide for refactoring existing code to use lenses.

## Why Migrate?

**Before (Spread Hell)**:
```typescript
const updateCity = (state: State) => ({
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: 'NYC',
    },
  },
})
```

**After (Clean Lenses)**:
```typescript
const cityLens = path<State, string>('user.address.city')
const updateCity = (state: State) => set(cityLens, 'NYC', state)
```

## Migration Steps

### Step 1: Identify Repeated Update Patterns

Look for code that updates the same nested paths multiple times:

```typescript
// ❌ Before: Repeated pattern
const updateUserCity = (state) => ({
  ...state,
  user: { ...state.user, address: { ...state.user.address, city: newCity } },
})

const updateUserZip = (state) => ({
  ...state,
  user: { ...state.user, address: { ...state.user.address, zip: newZip } },
})

// ✅ After: Define lens once, reuse everywhere
const cityLens = path<State, string>('user.address.city')
const zipLens = path<State, string>('user.address.zip')

const updateUserCity = (state, city) => set(cityLens, city, state)
const updateUserZip = (state, zip) => set(zipLens, zip, state)
```

### Step 2: Replace Simple Property Updates

```typescript
// ❌ Before
const updateName = (user: User, name: string) => ({
  ...user,
  name,
})

// ✅ After
const nameLens = prop<User>('name')
const updateName = (user: User, name: string) => set(nameLens, name, user)
```

### Step 3: Replace Nested Updates

```typescript
// ❌ Before
const updateAddress = (state: State) => ({
  ...state,
  user: {
    ...state.user,
    address: {
      ...state.user.address,
      city: 'NYC',
      zip: '10001',
    },
  },
})

// ✅ After
const cityLens = path<State, string>('user.address.city')
const zipLens = path<State, string>('user.address.zip')

const updateAddress = (state: State) =>
  R.pipe(
    state,
    set(cityLens, 'NYC'),
    set(zipLens, '10001')
  )
```

### Step 4: Replace Transformations

```typescript
// ❌ Before
const incrementCounter = (state: State) => ({
  ...state,
  counter: state.counter + 1,
})

// ✅ After
const counterLens = prop<State>('counter')
const incrementCounter = (state: State) => over(counterLens, (n) => n + 1, state)
```

### Step 5: Replace Array Updates

```typescript
// ❌ Before
const updateFirstTodo = (state: TodoState) => ({
  ...state,
  todos: state.todos.map((todo, idx) =>
    idx === 0 ? { ...todo, done: true } : todo
  ),
})

// ✅ After
const todosLens = prop<TodoState>('todos')
const updateFirstTodo = (state: TodoState) =>
  over(todosLens, (todos) =>
    todos.map((todo, idx) => (idx === 0 ? { ...todo, done: true } : todo))
  , state)
```

## Migration Checklist

- [ ] Find all nested spread operators (3+ levels)
- [ ] Identify repeated update patterns
- [ ] Create lenses for commonly accessed paths
- [ ] Replace `set` operations with `set(lens, value)`
- [ ] Replace transformations with `over(lens, fn)`
- [ ] Chain multiple updates with `pipe`
- [ ] Update tests to verify immutability
- [ ] Remove helper functions that manually spread

## Incremental Migration

You don't have to migrate everything at once:

```typescript
// ✅ Mix and match during transition
const partialMigration = (state: State) => {
  // Use lenses for deep paths
  const withCity = set(cityLens, 'NYC', state)

  // Keep spreads for shallow updates (if preferred)
  return {
    ...withCity,
    timestamp: Date.now(),
  }
}
```

## Common Pitfalls

### Pitfall 1: Forgetting to Define Lenses

```typescript
// ❌ Bad: Creating lenses inline repeatedly
setState((s) => set(prop<State>('counter'), 10, s))
setState((s) => set(prop<State>('counter'), 20, s))

// ✅ Good: Define once, reuse
const counterLens = prop<State>('counter')
setState((s) => set(counterLens, 10, s))
setState((s) => set(counterLens, 20, s))
```

### Pitfall 2: Using `set` When You Need `over`

```typescript
// ❌ Bad: Reading then setting
const increment = (s) => set(counterLens, view(counterLens, s) + 1, s)

// ✅ Good: Using over
const increment = (s) => over(counterLens, (n) => n + 1, s)
```

## What's Next?

- **[API Reference →](./06-api-reference.md)** - Complete function signatures
- **[Patterns](./04-patterns.md)** - More real-world recipes

[← Back to Patterns](./04-patterns.md)

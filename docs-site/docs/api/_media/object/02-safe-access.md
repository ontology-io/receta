# Safe Access: Type-Safe Nested Operations

Safe access functions provide type-safe ways to read and modify deeply nested object structures without runtime errors. All operations are immutable and integrate with the Option pattern.

## Table of Contents

1. [getPath](#getpath)
2. [setPath](#setpath)
3. [updatePath](#updatepath)
4. [Comparison with Alternatives](#comparison-with-alternatives)
5. [Common Patterns](#common-patterns)

---

## getPath

Safely retrieves a value at a nested path, returning `Option<T>` instead of throwing errors.

### Signature

```typescript
function getPath<T = unknown>(
  obj: PlainObject,
  path: ObjectPath
): Option<T>

type ObjectPath = readonly (string | number)[]
```

### Why getPath Over Optional Chaining?

```typescript
// ❌ Optional chaining: can still fail on edge cases
const config = { api: 'not an object' }
const timeout = config.api?.timeout ?? 5000  // No error, but unsafe!

// ✅ getPath: type-safe, composable
const timeout = pipe(
  config,
  getPath<number>(['api', 'timeout']),
  unwrapOr(5000)
)
```

### Real-World: Configuration Loading

```typescript
import { getPath } from 'receta/object'
import { isSome, unwrapOr } from 'receta/option'

// Load database config with fallbacks
const loadDbConfig = (config: unknown) => {
  const host = pipe(
    config,
    getPath<string>(['database', 'host']),
    unwrapOr('localhost')
  )

  const port = pipe(
    config,
    getPath<number>(['database', 'port']),
    unwrapOr(5432)
  )

  const ssl = pipe(
    config,
    getPath<boolean>(['database', 'ssl']),
    unwrapOr(false)
  )

  return { host, port, ssl }
}
```

### Real-World: API Response Extraction

```typescript
// GitHub API: extract nested data safely
const getRepoStars = (apiResponse: unknown) =>
  pipe(
    apiResponse,
    getPath<number>(['repository', 'stargazers_count']),
    match({
      onSome: (stars) => `${stars} stars`,
      onNone: () => 'No star data'
    })
  )

// Stripe API: extract nested customer email
const getCustomerEmail = (charge: unknown) =>
  pipe(
    charge,
    getPath<string>(['customer', 'email']),
    toResult({ code: 'MISSING_EMAIL', message: 'Customer email not found' })
  )
```

### Array Indices

```typescript
const data = {
  users: [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ]
}

// Access array elements by index
const firstUserEmail = getPath<string>(data, ['users', 0, 'email'])
// => Some('alice@example.com')

const missingUser = getPath(data, ['users', 99, 'email'])
// => None
```

### Composing with Option Operations

```typescript
import { map, flatMap, filter } from 'receta/option'

// Extract and transform nested value
const getUserAge = (data: unknown) =>
  pipe(
    data,
    getPath<number>(['user', 'profile', 'age']),
    filter(age => age >= 18),  // Only adults
    map(age => `${age} years old`)
  )
// => Some('30 years old') or None
```

### Type Safety

```typescript
// getPath preserves type information
interface Config {
  database: {
    host: string
    port: number
  }
}

const config: Config = { /* ... */ }

// TypeScript knows this is Option<string>
const host = getPath<string>(config, ['database', 'host'])

// TypeScript knows this is Option<number>
const port = getPath<number>(config, ['database', 'port'])
```

---

## setPath

Immutably sets a value at a nested path, creating intermediate objects as needed.

### Signature

```typescript
function setPath<T extends PlainObject>(
  obj: T,
  path: ObjectPath,
  value: unknown
): T
```

### Why setPath Over Mutation?

```typescript
// ❌ Mutation: side effects, hard to track
function updateConfig(config) {
  config.database.host = 'prod.example.com'
  return config  // Original mutated!
}

// ✅ setPath: immutable, predictable
const updated = setPath(config, ['database', 'host'], 'prod.example.com')
// Original unchanged, new object returned
```

### Real-World: Immutable State Updates (Redux-style)

```typescript
// Redux reducer pattern
const reducer = (state: AppState, action: Action) => {
  switch (action.type) {
    case 'UPDATE_USERNAME':
      return setPath(state, ['user', 'profile', 'username'], action.payload)

    case 'INCREMENT_VIEWS':
      return updatePath(state, ['stats', 'views'], (n: number) => n + 1)

    case 'SET_THEME':
      return setPath(state, ['ui', 'theme'], action.payload)

    default:
      return state
  }
}
```

### Real-World: Form Field Updates

```typescript
// React form state management
const FormComponent = () => {
  const [formData, setFormData] = useState(initialData)

  const updateField = (path: ObjectPath, value: unknown) => {
    setFormData(prev => setPath(prev, path, value))
  }

  return (
    <>
      <input
        value={getPath(formData, ['user', 'firstName'])}
        onChange={e => updateField(['user', 'firstName'], e.target.value)}
      />
      <input
        value={getPath(formData, ['user', 'address', 'city'])}
        onChange={e => updateField(['user', 'address', 'city'], e.target.value)}
      />
    </>
  )
}
```

### Creating Intermediate Paths

```typescript
// setPath creates missing intermediate objects
const empty = {}

const result = setPath(empty, ['api', 'endpoints', 'users'], '/api/v1/users')
// {
//   api: {
//     endpoints: {
//       users: '/api/v1/users'
//     }
//   }
// }
```

### Working with Arrays

```typescript
const data = {
  items: ['apple', 'banana', 'cherry']
}

// Update array element
const updated = setPath(data, ['items', 1], 'blueberry')
// { items: ['apple', 'blueberry', 'cherry'] }

// Add nested array data
const nested = setPath({}, ['users', 0, 'name'], 'Alice')
// { users: [{ name: 'Alice' }] }
```

### Chaining Multiple Updates

```typescript
// Multiple immutable updates in sequence
const result = pipe(
  config,
  (c) => setPath(c, ['database', 'host'], 'prod.db.com'),
  (c) => setPath(c, ['database', 'port'], 5432),
  (c) => setPath(c, ['api', 'timeout'], 30000)
)
```

---

## updatePath

Updates a value at a path by applying a transformation function.

### Signature

```typescript
function updatePath<T extends PlainObject, V>(
  obj: T,
  path: ObjectPath,
  fn: (value: V) => V
): T
```

### Why updatePath?

```typescript
// ❌ Without updatePath: verbose and error-prone
const incrementViews = (state: AppState) => {
  const currentViews = getPath<number>(state, ['stats', 'views'])
  if (isSome(currentViews)) {
    return setPath(state, ['stats', 'views'], currentViews.value + 1)
  }
  return state
}

// ✅ With updatePath: concise and safe
const incrementViews = (state: AppState) =>
  updatePath(state, ['stats', 'views'], (n: number) => n + 1)
```

### Real-World: Analytics Tracking

```typescript
// Increment view counters
const trackPageView = (analytics: Analytics, pageId: string) =>
  updatePath(
    analytics,
    ['pages', pageId, 'views'],
    (views: number) => views + 1
  )

// Update last seen timestamp
const updateLastSeen = (user: User) =>
  updatePath(user, ['activity', 'lastSeen'], () => Date.now())
```

### Real-World: Shopping Cart Operations

```typescript
interface CartItem {
  id: string
  quantity: number
  price: number
}

interface Cart {
  items: CartItem[]
  total: number
}

// Increment item quantity
const incrementQuantity = (cart: Cart, itemId: string) => {
  const itemIndex = cart.items.findIndex(item => item.id === itemId)

  return pipe(
    cart,
    (c) => updatePath(c, ['items', itemIndex, 'quantity'], (q: number) => q + 1),
    (c) => updatePath(c, ['total'], (total: number) => recalculateTotal(c))
  )
}
```

### Real-World: Nested Array Updates

```typescript
// Update specific todo in nested structure
const toggleTodo = (state: AppState, listId: string, todoIndex: number) =>
  updatePath(
    state,
    ['lists', listId, 'todos', todoIndex, 'completed'],
    (completed: boolean) => !completed
  )
```

### Transforming Complex Values

```typescript
// Append to array
updatePath(state, ['tags'], (tags: string[]) => [...tags, 'new-tag'])

// Transform nested object
updatePath(state, ['user', 'preferences'], (prefs: Prefs) => ({
  ...prefs,
  notifications: true
}))

// String manipulation
updatePath(user, ['profile', 'bio'], (bio: string) => bio.trim().slice(0, 280))
```

### Path Not Found Behavior

```typescript
// If path doesn't exist, returns original object unchanged
const state = { user: { name: 'Alice' } }

const result = updatePath(state, ['user', 'age'], (age: number) => age + 1)
// => { user: { name: 'Alice' } }  (unchanged)

// To set instead of update when path might not exist:
const ensureAge = (state: State) => {
  const updated = updatePath(state, ['user', 'age'], (age: number) => age + 1)
  return updated === state
    ? setPath(state, ['user', 'age'], 1)  // Initialize
    : updated
}
```

---

## Comparison with Alternatives

### vs Optional Chaining (`?.`)

```typescript
// Optional chaining
const value = obj?.deeply?.nested?.value ?? 'default'

// Pros: Native, concise for simple cases
// Cons: Not composable, no type guard, fails on type mismatches

// getPath
const value = pipe(
  obj,
  getPath(['deeply', 'nested', 'value']),
  unwrapOr('default')
)

// Pros: Composable, type-safe, works in pipelines
// Cons: More verbose for simple cases
```

### vs Lodash get/set

```typescript
// Lodash get
_.get(obj, 'deeply.nested.value', 'default')

// Lodash set (MUTATES!)
_.set(obj, 'deeply.nested.value', 'new')

// Lodash setWith (immutable, but requires cloneDeep)
_.setWith(_.cloneDeep(obj), 'deeply.nested.value', 'new')

// Receta: immutable by default, type-safe
setPath(obj, ['deeply', 'nested', 'value'], 'new')
```

### vs Immer

```typescript
// Immer
produce(obj, draft => {
  draft.deeply.nested.value = 'new'
})

// Pros: Mutation-like syntax
// Cons: Magic, runtime overhead, not composable

// Receta
setPath(obj, ['deeply', 'nested', 'value'], 'new')

// Pros: Explicit, composable, no magic
// Cons: More verbose for multiple updates
```

### Comparison Table

| Feature | Optional Chain | Lodash | Immer | Receta |
|---------|---------------|--------|-------|---------|
| Immutable | ✅ | ❌ | ✅ | ✅ |
| Type-safe | ⚠️ Partial | ❌ | ⚠️ Partial | ✅ |
| Composable | ❌ | ❌ | ❌ | ✅ |
| Returns Option/Result | ❌ | ❌ | ❌ | ✅ |
| Pipeline-friendly | ❌ | ❌ | ❌ | ✅ |
| Zero overhead | ✅ | ✅ | ❌ | ✅ |

---

## Common Patterns

### Pattern 1: Safe Config Access with Fallbacks

```typescript
const getAppConfig = (rawConfig: unknown): AppConfig => ({
  apiUrl: pipe(
    rawConfig,
    getPath<string>(['api', 'url']),
    unwrapOr('https://api.example.com')
  ),
  timeout: pipe(
    rawConfig,
    getPath<number>(['api', 'timeout']),
    map(ms => Math.min(ms, 60000)),  // Cap at 60s
    unwrapOr(30000)
  ),
  retries: pipe(
    rawConfig,
    getPath<number>(['api', 'retries']),
    filter(n => n >= 0 && n <= 5),  // Validate range
    unwrapOr(3)
  )
})
```

### Pattern 2: Nested Form State Management

```typescript
// Complete form state manager
class FormState<T> {
  constructor(private data: T) {}

  get<V>(path: ObjectPath): Option<V> {
    return getPath<V>(this.data, path)
  }

  set(path: ObjectPath, value: unknown): FormState<T> {
    return new FormState(setPath(this.data, path, value))
  }

  update<V>(path: ObjectPath, fn: (value: V) => V): FormState<T> {
    return new FormState(updatePath(this.data, path, fn))
  }

  validate(path: ObjectPath, validator: (value: unknown) => boolean): boolean {
    return pipe(
      this.data,
      getPath(path),
      map(validator),
      unwrapOr(false)
    )
  }
}
```

### Pattern 3: Composing get/set/update

```typescript
// Get current value, transform, set back
const capitalizeUserName = (state: State) =>
  pipe(
    state,
    getPath<string>(['user', 'name']),
    map(name => name.toUpperCase()),
    match({
      onSome: (upper) => setPath(state, ['user', 'name'], upper),
      onNone: () => state
    })
  )

// Simpler with updatePath
const capitalizeUserName = (state: State) =>
  updatePath(state, ['user', 'name'], (name: string) => name.toUpperCase())
```

### Pattern 4: Bulk Updates

```typescript
// Update multiple paths
const updateUserProfile = (
  user: User,
  updates: { name?: string; email?: string; bio?: string }
) => {
  let result = user

  if (updates.name) {
    result = setPath(result, ['profile', 'name'], updates.name)
  }
  if (updates.email) {
    result = setPath(result, ['contact', 'email'], updates.email)
  }
  if (updates.bio) {
    result = setPath(result, ['profile', 'bio'], updates.bio)
  }

  return result
}
```

### Pattern 5: Conditional Updates

```typescript
// Update only if value exists
const incrementIfExists = (state: State, path: ObjectPath) =>
  pipe(
    state,
    getPath<number>(path),
    match({
      onSome: () => updatePath(state, path, (n: number) => n + 1),
      onNone: () => state
    })
  )
```

### Pattern 6: API Response Extraction Pipeline

```typescript
// Extract multiple values from API response
const extractUserData = (apiResponse: unknown) => {
  const userId = pipe(
    apiResponse,
    getPath<string>(['data', 'user', 'id']),
    toResult({ code: 'MISSING_USER_ID' })
  )

  const email = pipe(
    apiResponse,
    getPath<string>(['data', 'user', 'email']),
    toResult({ code: 'MISSING_EMAIL' })
  )

  const name = pipe(
    apiResponse,
    getPath<string>(['data', 'user', 'profile', 'displayName']),
    unwrapOr('Anonymous')
  )

  // Combine results
  return Result.collect([userId, email]).map(([id, email]) => ({
    id,
    email,
    name
  }))
}
```

---

## Next Steps

- **[Validation](./03-validation.md)** - validateShape, stripUndefined, compact
- **[Transformation](./04-transformation.md)** - mapKeys, mapValues, filtering
- **[Patterns & Recipes](./05-patterns.md)** - Complete solutions combining all operations
- **[API Reference](./07-api-reference.md)** - Quick lookup and cheat sheets

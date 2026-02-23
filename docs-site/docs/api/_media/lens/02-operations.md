# Lens Operations: Reading and Writing

Once you have a lens, you perform three fundamental operations: **view** (read), **set** (write), and **over** (transform).

## Quick Reference

| Operation | Purpose                 | Signature                                        |
| --------- | ----------------------- | ------------------------------------------------ |
| `view`    | Read value through lens | `view(lens, source): A`                          |
| `set`     | Update value            | `set(lens, value, source): S`                    |
| `over`    | Transform value         | `over(lens, fn: (a: A) => A, source): S`         |

---

## `view()` - Reading Values

**Purpose**: Extract the focused value from your data structure.

**Signatures**:
```typescript
// Data-first
function view<S, A>(lens: Lens<S, A>, source: S): A

// Data-last (for pipes)
function view<S, A>(lens: Lens<S, A>): (source: S) => A
```

### Basic Usage

```typescript
import { prop, path, view } from 'receta/lens'

interface User {
  name: string
  address: { city: string }
}

const user = { name: 'Alice', address: { city: 'Boston' } }

// Data-first
const name = view(prop<User>('name'), user) // 'Alice'
const city = view(path<User, string>('address.city'), user) // 'Boston'

// Data-last (in pipe)
const result = R.pipe(
  user,
  view(prop<User>('name'))
) // 'Alice'
```

### Real-World: API Response Parsing

```typescript
interface GitHubPR {
  data: {
    repository: {
      pullRequest: {
        title: string
        author: { login: string }
        reviewDecision: string | null
      }
    }
  }
}

const titleLens = path<GitHubPR, string>('data.repository.pullRequest.title')
const authorLens = path<GitHubPR, string>('data.repository.pullRequest.author.login')

const parsePR = (response: GitHubPR) => ({
  title: view(titleLens, response),
  author: view(authorLens, response),
})
```

---

## `set()` - Updating Values

**Purpose**: Update the focused value immutably.

**Signatures**:
```typescript
// Data-first
function set<S, A>(lens: Lens<S, A>, value: A, source: S): S

// Data-last (for pipes)
function set<S, A>(lens: Lens<S, A>, value: A): (source: S) => S
```

### Basic Usage

```typescript
const user = { name: 'Alice', age: 30 }

// Data-first
const updated = set(prop<User>('name'), 'Bob', user)
// => { name: 'Bob', age: 30 }

// Original unchanged
console.log(user.name) // 'Alice'

// Data-last (in pipe)
const result = R.pipe(
  user,
  set(prop<User>('name'), 'Charlie'),
  set(prop<User>('age'), 31)
)
// => { name: 'Charlie', age: 31 }
```

### Real-World: React State Update

```typescript
interface AppState {
  user: { name: string; email: string }
  settings: { theme: 'light' | 'dark' }
}

const themeLens = path<AppState, string>('settings.theme')
const emailLens = path<AppState, string>('user.email')

// In React component
const updateTheme = () => {
  setState((state) => set(themeLens, 'dark', state))
}

const updateEmail = (newEmail: string) => {
  setState((state) => set(emailLens, newEmail, state))
}

// Multiple updates in sequence
const updateMultiple = () => {
  setState((state) =>
    R.pipe(
      state,
      set(themeLens, 'dark'),
      set(emailLens, 'newemail@example.com')
    )
  )
}
```

### Real-World: Form Validation Result

```typescript
interface Form {
  fields: {
    email: { value: string; error?: string }
    password: { value: string; error?: string }
  }
  isValid: boolean
}

const emailErrorLens = path<Form, string | undefined>('fields.email.error')
const passwordErrorLens = path<Form, string | undefined>('fields.password.error')
const isValidLens = prop<Form>('isValid')

const validateAndUpdate = (form: Form): Form => {
  const emailError = validateEmail(form.fields.email.value)
  const passwordError = validatePassword(form.fields.password.value)

  return R.pipe(
    form,
    set(emailErrorLens, emailError),
    set(passwordErrorLens, passwordError),
    set(isValidLens, !emailError && !passwordError)
  )
}
```

---

## `over()` - Transforming Values

**Purpose**: Read the current value, transform it, and set the result.

**Signatures**:
```typescript
// Data-first
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A, source: S): S

// Data-last (for pipes)
function over<S, A>(lens: Lens<S, A>, fn: (a: A) => A): (source: S) => S
```

### Basic Usage

```typescript
const user = { name: 'alice', age: 30 }

// Data-first
const older = over(prop<User>('age'), (age) => age + 1, user)
// => { name: 'alice', age: 31 }

const caps = over(prop<User>('name'), (name) => name.toUpperCase(), user)
// => { name: 'ALICE', age: 30 }

// Data-last (in pipe)
const result = R.pipe(
  user,
  over(prop<User>('name'), (name) => name.toUpperCase()),
  over(prop<User>('age'), (age) => age + 1)
)
// => { name: 'ALICE', age: 31 }
```

### Real-World: Counter Increment

```typescript
interface State {
  counter: number
  history: number[]
}

const counterLens = prop<State>('counter')
const historyLens = prop<State>('history')

// Increment and record
const increment = (state: State): State =>
  R.pipe(
    state,
    over(counterLens, (n) => n + 1),
    over(historyLens, (history) => [...history, state.counter])
  )
```

### Real-World: Shopping Cart Quantity

```typescript
interface Cart {
  items: Array<{ id: string; quantity: number; price: number }>
  total: number
}

const itemsLens = prop<Cart>('items')
const totalLens = prop<Cart>('total')

// Update quantity for specific item
const updateQuantity = (cart: Cart, itemId: string, delta: number): Cart => {
  return R.pipe(
    cart,
    over(itemsLens, (items) =>
      items.map((item) =>
        item.id === itemId
          ? { ...item, quantity: item.quantity + delta }
          : item
      )
    ),
    // Recalculate total
    over(totalLens, () =>
      cart.items.reduce((sum, item) => sum + item.quantity * item.price, 0)
    )
  )
}
```

### Real-World: Text Normalization

```typescript
interface Article {
  title: string
  content: string
  tags: string[]
}

const titleLens = prop<Article>('title')
const contentLens = prop<Article>('content')
const tagsLens = prop<Article>('tags')

// Normalize article text
const normalizeArticle = (article: Article): Article =>
  R.pipe(
    article,
    over(titleLens, (title) => title.trim()),
    over(contentLens, (content) => content.trim().replace(/\s+/g, ' ')),
    over(tagsLens, (tags) => tags.map((tag) => tag.toLowerCase().trim()))
  )
```

---

## Operation Patterns

### Pattern 1: Conditional Updates

```typescript
// Update only if condition is met
const updateIfPositive = (state: State, value: number): State => {
  return value > 0 ? set(counterLens, value, state) : state
}

// Transform conditionally
const incrementIfEven = (state: State): State => {
  return over(
    counterLens,
    (n) => (n % 2 === 0 ? n + 1 : n),
    state
  )
}
```

### Pattern 2: Chained Transformations

```typescript
// Multiple transformations in sequence
const processUser = (user: User): User =>
  R.pipe(
    user,
    over(prop<User>('name'), (name) => name.trim()),
    over(prop<User>('name'), (name) => name.toLowerCase()),
    over(prop<User>('email'), (email) => email.toLowerCase()),
    set(prop<User>('updatedAt'), Date.now())
  )
```

### Pattern 3: Accumulating Results

```typescript
interface Stats {
  count: number
  sum: number
  average: number
}

const countLens = prop<Stats>('count')
const sumLens = prop<Stats>('sum')
const avgLens = prop<Stats>('average')

const addValue = (stats: Stats, value: number): Stats =>
  R.pipe(
    stats,
    over(countLens, (n) => n + 1),
    over(sumLens, (sum) => sum + value),
    over(avgLens, () => (stats.sum + value) / (stats.count + 1))
  )
```

---

## Equivalence: over = view + transform + set

Understanding that `over` is just a convenience for view → transform → set:

```typescript
// These are equivalent:

// Using over
const result1 = over(ageLens, (age) => age + 1, user)

// Using view + set
const currentAge = view(ageLens, user)
const newAge = currentAge + 1
const result2 = set(ageLens, newAge, user)

// result1 === result2
```

When to use each:
- Use `over` when you need the current value to compute the new value
- Use `set` when you already know the new value
- Use `view` when you only need to read

---

## Data-First vs Data-Last

All operations support both calling conventions:

```typescript
// Data-first: All arguments at once
view(lens, data)
set(lens, value, data)
over(lens, fn, data)

// Data-last: Partial application for pipes
view(lens)(data)
set(lens, value)(data)
over(lens, fn)(data)

// In practice with pipes
R.pipe(
  data,
  view(lens), // returns the focused value
  // ... more transformations
)

R.pipe(
  data,
  set(lens, value), // returns updated data
  set(otherLens, otherValue), // chain updates
)

R.pipe(
  data,
  over(lens, fn), // returns transformed data
  over(otherLens, otherFn), // chain transformations
)
```

---

## Common Mistakes

### Mistake 1: Forgetting Immutability

```typescript
// ❌ Wrong - mutating directly
const wrong = (user: User) => {
  user.name = 'Bob' // MUTATION!
  return user
}

// ✅ Correct - using lens
const correct = (user: User) => set(nameLens, 'Bob', user)
```

### Mistake 2: Using `set` Instead of `over`

```typescript
// ❌ Wrong - reading then setting (not atomic)
const increment = (state: State) => {
  const current = view(counterLens, state)
  return set(counterLens, current + 1, state)
}

// ✅ Correct - using over
const increment = (state: State) => over(counterLens, (n) => n + 1, state)
```

### Mistake 3: Wrong Pipe Order

```typescript
// ❌ Wrong - view returns the value, not the source
R.pipe(
  user,
  view(nameLens), // returns string
  set(ageLens, 31) // ERROR: expects User, got string
)

// ✅ Correct - separate pipes or use only set/over
R.pipe(
  user,
  set(nameLens, 'Bob'),
  set(ageLens, 31)
)

// Or extract value separately
const name = view(nameLens, user)
const updated = set(ageLens, 31, user)
```

---

## Performance Considerations

### Lens Creation is Cheap

```typescript
// ✅ Fine to create inline
setState((state) => set(prop<State>('counter'), 10, state))

// ✅ Also fine to cache
const counterLens = prop<State>('counter')
setState((state) => set(counterLens, 10, state))
```

### Multiple Updates

```typescript
// ✅ Efficient - single pass
R.pipe(
  state,
  set(lens1, value1),
  set(lens2, value2),
  set(lens3, value3)
)

// ⚠️ Less efficient - multiple passes (but usually negligible)
let result = state
result = set(lens1, value1, result)
result = set(lens2, value2, result)
result = set(lens3, value3, result)
```

---

## What's Next?

- **[Composition →](./03-composition.md)** - Combining lenses for deep access
- **[Patterns](./04-patterns.md)** - Real-world recipes (React, Redux, Forms)
- **[API Reference](./06-api-reference.md)** - Complete function signatures

**Quick links**:
- [← Back to Constructors](./01-constructors.md)
- [← Back to Overview](./00-overview.md)

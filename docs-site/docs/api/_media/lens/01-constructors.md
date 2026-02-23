# Lens Constructors: Creating Your Lenses

Lens constructors create the "focusing glasses" that let you zoom into specific parts of your data. This guide covers all four ways to create lenses.

## Quick Reference

| Constructor | Use For                              | Example                            |
| ----------- | ------------------------------------ | ---------------------------------- |
| `prop`      | Single object property               | `prop<User>('name')`               |
| `path`      | Nested properties (dot notation)     | `path<User>('address.city')`       |
| `index`     | Array element at specific position   | `index<Todo>(0)`                   |
| `lens`      | Custom logic (advanced)              | `lens(getter, setter)`             |
| `optional`  | Nullable/optional fields with Option | `optional(prop<User>('email?'))`   |

---

## `prop()` - Property Lens

**Purpose**: Focus on a single property of an object.

**Signature**:
```typescript
function prop<S, K extends keyof S>(key: K): Lens<S, S[K]>
```

**When to use**: You need to access/update a direct property of an object.

### Basic Usage

```typescript
import { prop, view, set, over } from 'receta/lens'

interface User {
  name: string
  email: string
  age: number
}

const user: User = {
  name: 'Alice',
  email: 'alice@example.com',
  age: 30,
}

// Create lenses for each property
const nameLens = prop<User>('name')
const emailLens = prop<User>('email')
const ageLens = prop<User>('age')

// Read
view(nameLens, user) // 'Alice'

// Write
set(nameLens, 'Bob', user)
// => { name: 'Bob', email: 'alice@example.com', age: 30 }

// Transform
over(ageLens, (age) => age + 1, user)
// => { name: 'Alice', email: 'alice@example.com', age: 31 }
```

### Real-World: React Form Field

```typescript
interface FormState {
  username: string
  password: string
  rememberMe: boolean
}

const usernameLens = prop<FormState>('username')
const passwordLens = prop<FormState>('password')
const rememberMeLens = prop<FormState>('rememberMe')

// In React component
const LoginForm = () => {
  const [form, setForm] = useState<FormState>(initialForm)

  const updateField = <K extends keyof FormState>(
    lens: Lens<FormState, FormState[K]>,
    value: FormState[K]
  ) => {
    setForm((state) => set(lens, value, state))
  }

  return (
    <>
      <input
        value={form.username}
        onChange={(e) => updateField(usernameLens, e.target.value)}
      />
      <input
        type="password"
        value={form.password}
        onChange={(e) => updateField(passwordLens, e.target.value)}
      />
      <checkbox
        checked={form.rememberMe}
        onChange={(e) => updateField(rememberMeLens, e.target.checked)}
      />
    </>
  )
}
```

### Real-World: Redux Reducer

```typescript
interface AppState {
  counter: number
  theme: 'light' | 'dark'
  isLoading: boolean
}

const counterLens = prop<AppState>('counter')
const themeLens = prop<AppState>('theme')
const loadingLens = prop<AppState>('isLoading')

// Reducer with lenses - no nested spreads!
const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'INCREMENT':
      return over(counterLens, (n) => n + 1, state)

    case 'TOGGLE_THEME':
      return over(
        themeLens,
        (theme) => (theme === 'light' ? 'dark' : 'light'),
        state
      )

    case 'SET_LOADING':
      return set(loadingLens, action.payload, state)

    default:
      return state
  }
}
```

---

## `path()` - Nested Path Lens

**Purpose**: Focus on deeply nested properties using dot notation.

**Signature**:
```typescript
function path<S, A = unknown>(pathStr: string): Lens<S, A>
```

**When to use**: You need to access/update properties multiple levels deep.

### Basic Usage

```typescript
interface User {
  name: string
  address: {
    street: string
    city: string
    zip: string
    country: {
      name: string
      code: string
    }
  }
}

const user: User = {
  name: 'Alice',
  address: {
    street: '123 Main St',
    city: 'Boston',
    zip: '02101',
    country: {
      name: 'USA',
      code: 'US',
    },
  },
}

// Create path lenses
const cityLens = path<User, string>('address.city')
const countryCodeLens = path<User, string>('address.country.code')

// Read nested values
view(cityLens, user) // 'Boston'
view(countryCodeLens, user) // 'US'

// Update nested values - no spread hell!
set(cityLens, 'NYC', user)
// => { name: 'Alice', address: { ..., city: 'NYC', ... } }

set(countryCodeLens, 'CA', user)
// => { name: 'Alice', address: { ..., country: { name: 'USA', code: 'CA' } } }
```

### Real-World: Stripe Settings

```typescript
interface StripeSettings {
  account: {
    business: {
      name: string
      taxId: string
      address: {
        line1: string
        city: string
        postalCode: string
        country: string
      }
    }
    branding: {
      logo: string
      primaryColor: string
      icon: string
    }
  }
  paymentMethods: {
    card: { enabled: boolean }
    bankTransfer: { enabled: boolean }
  }
}

// Define lenses for deep paths
const businessNameLens = path<StripeSettings, string>(
  'account.business.name'
)
const businessCityLens = path<StripeSettings, string>(
  'account.business.address.city'
)
const logoLens = path<StripeSettings, string>('account.branding.logo')
const cardEnabledLens = path<StripeSettings, boolean>(
  'paymentMethods.card.enabled'
)

// Update multiple deep fields
const updatedSettings = R.pipe(
  settings,
  set(businessNameLens, 'Acme Corp'),
  set(businessCityLens, 'San Francisco'),
  set(logoLens, 'https://cdn.example.com/logo.png'),
  set(cardEnabledLens, true)
)
```

### Real-World: GitHub PR State

```typescript
interface PRState {
  repository: {
    owner: string
    name: string
  }
  pullRequest: {
    number: number
    title: string
    author: {
      username: string
      avatarUrl: string
    }
    checks: {
      ci: { status: 'pending' | 'success' | 'failure' }
      lint: { status: 'pending' | 'success' | 'failure' }
    }
  }
}

// Path lenses for deep state
const prTitleLens = path<PRState, string>('pullRequest.title')
const ciStatusLens = path<PRState, string>('pullRequest.checks.ci.status')
const lintStatusLens = path<PRState, string>(
  'pullRequest.checks.lint.status'
)

// Update checks when webhook arrives
const handleWebhook = (state: PRState, checkName: string, status: string) => {
  const lens =
    checkName === 'ci'
      ? ciStatusLens
      : lintStatusLens

  return set(lens, status, state)
}
```

---

## `index()` - Array Element Lens

**Purpose**: Focus on a specific element in an array by index.

**Signature**:
```typescript
function index<A>(idx: number): Lens<readonly A[], A | undefined>
```

**When to use**: You need to update a specific array element immutably.

### Basic Usage

```typescript
import { index, view, set, over } from 'receta/lens'

const numbers = [10, 20, 30, 40, 50]

// Create index lenses
const firstLens = index<number>(0)
const thirdLens = index<number>(2)

// Read element
view(firstLens, numbers) // 10
view(thirdLens, numbers) // 30

// Update element
set(firstLens, 100, numbers)
// => [100, 20, 30, 40, 50]

set(thirdLens, 300, numbers)
// => [10, 20, 300, 40, 50]

// Transform element
over(firstLens, (n) => n * 2, numbers)
// => [20, 20, 30, 40, 50]
```

### Real-World: Todo List

```typescript
interface Todo {
  id: string
  text: string
  done: boolean
  priority: 'low' | 'medium' | 'high'
}

interface TodoListState {
  todos: Todo[]
}

const todosLens = prop<TodoListState>('todos')
const firstTodoLens = index<Todo>(0)
const secondTodoLens = index<Todo>(1)

// Mark first todo as done
const markFirstDone = (state: TodoListState) => {
  // Compose todosLens with firstTodoLens
  const firstTodo = compose(todosLens, firstTodoLens)

  return over(
    firstTodo,
    (todo) => (todo ? { ...todo, done: true } : todo),
    state
  )
}

// Update priority of second todo
const updateSecondPriority = (state: TodoListState, priority: Todo['priority']) => {
  const secondTodo = compose(todosLens, secondTodoLens)

  return over(
    secondTodo,
    (todo) => (todo ? { ...todo, priority } : todo),
    state
  )
}
```

### Real-World: Shopping Cart

```typescript
interface CartItem {
  productId: string
  name: string
  quantity: number
  price: number
}

interface Cart {
  items: CartItem[]
  total: number
}

const itemsLens = prop<Cart>('items')

// Update quantity of specific cart item
const updateItemQuantity = (
  cart: Cart,
  itemIndex: number,
  newQuantity: number
): Cart => {
  const itemLens = index<CartItem>(itemIndex)
  const itemsWithIndex = compose(itemsLens, itemLens)

  return over(
    itemsWithIndex,
    (item) => (item ? { ...item, quantity: newQuantity } : item),
    cart
  )
}

// Remove item (set to undefined doesn't work, so filter instead)
const removeItem = (cart: Cart, itemIndex: number): Cart => {
  return over(
    itemsLens,
    (items) => items.filter((_, idx) => idx !== itemIndex),
    cart
  )
}
```

---

## `lens()` - Custom Lens

**Purpose**: Create a lens with custom get/set logic for complex scenarios.

**Signature**:
```typescript
function lens<S, A>(
  get: (source: S) => A,
  set: (value: A) => (source: S) => S
): Lens<S, A>
```

**When to use**: Built-in constructors don't fit your needs (rare).

### Basic Usage

```typescript
import { lens, view, set, over } from 'receta/lens'

interface User {
  firstName: string
  lastName: string
}

// Custom lens for full name
const fullNameLens = lens<User, string>(
  // Getter: combine first + last
  (user) => `${user.firstName} ${user.lastName}`,

  // Setter: split and update both fields
  (fullName) => (user) => {
    const [firstName, ...rest] = fullName.split(' ')
    const lastName = rest.join(' ')
    return { ...user, firstName, lastName: lastName || user.lastName }
  }
)

const user = { firstName: 'Alice', lastName: 'Smith' }

view(fullNameLens, user) // 'Alice Smith'

set(fullNameLens, 'Bob Johnson', user)
// => { firstName: 'Bob', lastName: 'Johnson' }
```

### Real-World: Temperature Conversion

```typescript
interface WeatherData {
  temperatureCelsius: number
  humidity: number
  pressure: number
}

// Lens that reads/writes in Fahrenheit, stores in Celsius
const temperatureFahrenheitLens = lens<WeatherData, number>(
  // Get: C to F
  (data) => (data.temperatureCelsius * 9) / 5 + 32,

  // Set: F to C
  (fahrenheit) => (data) => ({
    ...data,
    temperatureCelsius: ((fahrenheit - 32) * 5) / 9,
  })
)

const weather = { temperatureCelsius: 20, humidity: 65, pressure: 1013 }

view(temperatureFahrenheitLens, weather) // 68

set(temperatureFahrenheitLens, 77, weather)
// => { temperatureCelsius: 25, humidity: 65, pressure: 1013 }
```

### Real-World: Computed Total

```typescript
interface Invoice {
  subtotal: number
  taxRate: number
  total: number // computed from subtotal + tax
}

// Lens for subtotal that auto-updates total
const subtotalLens = lens<Invoice, number>(
  (invoice) => invoice.subtotal,

  (newSubtotal) => (invoice) => ({
    ...invoice,
    subtotal: newSubtotal,
    total: newSubtotal * (1 + invoice.taxRate),
  })
)

const invoice = { subtotal: 100, taxRate: 0.1, total: 110 }

set(subtotalLens, 200, invoice)
// => { subtotal: 200, taxRate: 0.1, total: 220 }
```

---

## `optional()` - Optional Value Lens

**Purpose**: Handle nullable/optional fields safely with Option type.

**Signature**:
```typescript
function optional<S, A>(baseLens: Lens<S, A | undefined>): Lens<S, Option<A>>
```

**When to use**: Working with optional/nullable fields using the Option pattern.

### Basic Usage

```typescript
import { prop, optional, view, set, over } from 'receta/lens'
import { some, none, isSome, map as mapOption } from 'receta/option'

interface User {
  name: string
  email?: string
  phone?: string
}

const emailLens = prop<User>('email')
const optionalEmailLens = optional(emailLens)

const user1 = { name: 'Alice', email: 'alice@example.com' }
const user2 = { name: 'Bob' }

// View returns Option
view(optionalEmailLens, user1) // Some('alice@example.com')
view(optionalEmailLens, user2) // None

// Set with Some/None
set(optionalEmailLens, some('newemail@example.com'), user2)
// => { name: 'Bob', email: 'newemail@example.com' }

set(optionalEmailLens, none(), user1)
// => { name: 'Alice', email: undefined }

// Transform with Option operations
over(
  optionalEmailLens,
  (opt) => mapOption(opt, (email) => email.toLowerCase()),
  user1
)
// => { name: 'Alice', email: 'alice@example.com' }
```

### Real-World: Profile Bio

```typescript
interface Profile {
  username: string
  bio?: string
  website?: string
  location?: string
}

const bioLens = prop<Profile>('bio')
const optionalBioLens = optional(bioLens)

// Provide default bio if missing
const ensureBio = (profile: Profile): Profile => {
  return over(
    optionalBioLens,
    (opt) => (isSome(opt) ? opt : some('No bio provided')),
    profile
  )
}

// Truncate long bios
const truncateBio = (profile: Profile, maxLength: number): Profile => {
  return over(
    optionalBioLens,
    (opt) =>
      mapOption(opt, (bio) =>
        bio.length > maxLength ? bio.slice(0, maxLength) + '...' : bio
      ),
    profile
  )
}
```

---

## Choosing the Right Constructor

### Decision Tree

```
Do you need custom logic (e.g., computed values)?
├─ Yes → use lens()
└─ No
   ├─ Single property?
   │  ├─ Required → use prop()
   │  └─ Optional → use prop() + optional()
   │
   ├─ Nested property?
   │  └─ use path()
   │
   └─ Array element?
      └─ use index()
```

### Examples

```typescript
// ✅ prop - single required field
const nameLens = prop<User>('name')

// ✅ path - nested field
const cityLens = path<User, string>('address.city')

// ✅ index - array element
const firstLens = index<Todo>(0)

// ✅ prop + optional - nullable field
const emailLens = optional(prop<User>('email'))

// ✅ lens - custom logic needed
const fullNameLens = lens(
  (user) => `${user.firstName} ${user.lastName}`,
  (name) => (user) => {
    /* split and update */
  }
)
```

## Comparison Table

| Constructor | Type Safety | Nested Support | Custom Logic | Nullable Support |
| ----------- | ----------- | -------------- | ------------ | ---------------- |
| `prop`      | ✅ Full     | ❌             | ❌           | ⚠️ Manual        |
| `path`      | ⚠️ Runtime  | ✅             | ❌           | ⚠️ Manual        |
| `index`     | ✅ Full     | ❌             | ❌           | ✅ Returns `A?`  |
| `lens`      | ✅ Full     | ✅             | ✅           | ✅ Custom        |
| `optional`  | ✅ Full     | ❌             | ❌           | ✅ Option        |

## What's Next?

Now that you know how to create lenses, learn how to use them:

- **[Operations →](./02-operations.md)** - view, set, over
- **[Composition](./03-composition.md)** - Combining lenses for deep access
- **[Patterns](./04-patterns.md)** - Real-world recipes

**Quick links**:
- [← Back to Overview](./00-overview.md)
- [API Reference](./06-api-reference.md)

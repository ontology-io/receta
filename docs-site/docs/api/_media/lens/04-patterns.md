# Common Patterns & Real-World Recipes

Copy-paste-ready patterns for common scenarios.

## React State Management

### Pattern: Form State with Lenses

```typescript
import { useState } from 'react'
import { prop, path, set, over, type Lens } from 'receta/lens'

interface FormState {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  billing: {
    cardNumber: string
    expiryDate: string
  }
  agreedToTerms: boolean
}

const firstNameLens = path<FormState, string>('user.firstName')
const lastNameLens = path<FormState, string>('user.lastName')
const emailLens = path<FormState, string>('user.email')
const cardNumberLens = path<FormState, string>('billing.cardNumber')
const termsLens = prop<FormState>('agreedToTerms')

export const CheckoutForm = () => {
  const [form, setForm] = useState<FormState>(initialForm)

  const updateField = <A>(lens: Lens<FormState, A>, value: A) => {
    setForm((state) => set(lens, value, state))
  }

  return (
    <form>
      <input
        value={form.user.firstName}
        onChange={(e) => updateField(firstNameLens, e.target.value)}
      />
      <input
        value={form.user.email}
        onChange={(e) => updateField(emailLens, e.target.value)}
      />
      <input
        value={form.billing.cardNumber}
        onChange={(e) => updateField(cardNumberLens, e.target.value)}
      />
      <checkbox
        checked={form.agreedToTerms}
        onChange={(e) => updateField(termsLens, e.target.checked)}
      />
    </form>
  )
}
```

### Pattern: Zustand Store

```typescript
import { create } from 'zustand'
import { prop, path, set, over } from 'receta/lens'

interface Store {
  user: { name: string; email: string }
  settings: { theme: 'light' | 'dark'; notifications: boolean }
  counter: number
}

const themeLens = path<Store, string>('settings.theme')
const counterLens = prop<Store>('counter')

const useStore = create<Store & Actions>((set) => ({
  user: { name: '', email: '' },
  settings: { theme: 'light', notifications: true },
  counter: 0,

  updateTheme: (theme) =>
    set((state) => set(themeLens, theme, state)),

  increment: () =>
    set((state) => over(counterLens, (n) => n + 1, state)),
}))
```

## Redux Patterns

### Pattern: Reducer with Lenses

```typescript
import { prop, path, set, over } from 'receta/lens'

interface AppState {
  user: { isAuthenticated: boolean; profile: UserProfile }
  ui: { isLoading: boolean; modal: { isOpen: boolean } }
  data: { items: Item[] }
}

const isAuthenticatedLens = path<AppState, boolean>('user.isAuthenticated')
const isLoadingLens = path<AppState, boolean>('ui.isLoading')
const modalOpenLens = path<AppState, boolean>('ui.modal.isOpen')
const itemsLens = path<AppState, Item[]>('data.items')

const reducer = (state: AppState, action: Action): AppState => {
  switch (action.type) {
    case 'LOGIN_SUCCESS':
      return R.pipe(
        state,
        set(isAuthenticatedLens, true),
        set(isLoadingLens, false)
      )

    case 'TOGGLE_MODAL':
      return over(modalOpenLens, (open) => !open, state)

    case 'ADD_ITEM':
      return over(itemsLens, (items) => [...items, action.payload], state)

    default:
      return state
  }
}
```

## Form Validation

### Pattern: Field Errors

```typescript
interface FormField<T> {
  value: T
  error?: string
  touched: boolean
}

interface Form {
  fields: {
    email: FormField<string>
    password: FormField<string>
  }
  isValid: boolean
}

const emailValueLens = path<Form, string>('fields.email.value')
const emailErrorLens = path<Form, string | undefined>('fields.email.error')
const emailTouchedLens = path<Form, boolean>('fields.email.touched')

const validateEmail = (form: Form): Form => {
  const email = view(emailValueLens, form)
  const error = email.includes('@') ? undefined : 'Invalid email'

  return R.pipe(
    form,
    set(emailErrorLens, error),
    set(emailTouchedLens, true),
    set(prop<Form>('isValid'), error === undefined)
  )
}
```

## API Response Transformation

### Pattern: Normalizing Nested Data

```typescript
interface APIResponse {
  data: {
    user: {
      profile: {
        displayName: string
        bio: string
        social: {
          twitter?: string
          github?: string
        }
      }
    }
  }
}

const displayNameLens = path<APIResponse, string>(
  'data.user.profile.displayName'
)
const bioLens = path<APIResponse, string>('data.user.profile.bio')
const twitterLens = path<APIResponse, string | undefined>(
  'data.user.profile.social.twitter'
)

const normalizeResponse = (response: APIResponse): APIResponse =>
  R.pipe(
    response,
    over(displayNameLens, (name) => name.trim()),
    over(bioLens, (bio) => bio.slice(0, 160)),
    over(twitterLens, (handle) =>
      handle?.startsWith('@') ? handle : `@${handle}`
    )
  )
```

## Configuration Management

### Pattern: Environment-Specific Config

```typescript
interface Config {
  api: {
    baseUrl: string
    timeout: number
    retry: { maxAttempts: number; delay: number }
  }
  features: {
    analytics: boolean
    darkMode: boolean
  }
}

const baseUrlLens = path<Config, string>('api.baseUrl')
const timeoutLens = path<Config, number>('api.timeout')
const maxAttemptsLens = path<Config, number>('api.retry.maxAttempts')
const analyticsLens = path<Config, boolean>('features.analytics')

const toProduction = (config: Config): Config =>
  R.pipe(
    config,
    set(baseUrlLens, 'https://api.production.com'),
    set(timeoutLens, 5000),
    set(maxAttemptsLens, 5),
    set(analyticsLens, true)
  )

const toDevelopment = (config: Config): Config =>
  R.pipe(
    config,
    set(baseUrlLens, 'http://localhost:3000'),
    set(timeoutLens, 30000),
    set(analyticsLens, false)
  )
```

## List Operations

### Pattern: Update Specific Item

```typescript
interface TodoList {
  todos: Array<{ id: string; text: string; done: boolean }>
}

const todosLens = prop<TodoList>('todos')

const toggleTodo = (state: TodoList, todoId: string): TodoList => {
  return over(todosLens, (todos) =>
    todos.map((todo) =>
      todo.id === todoId ? { ...todo, done: !todo.done } : todo
    ),
    state
  )
}

const removeTodo = (state: TodoList, todoId: string): TodoList => {
  return over(todosLens, (todos) =>
    todos.filter((todo) => todo.id !== todoId),
    state
  )
}
```

## What's Next?

- **[Migration Guide →](./05-migration.md)** - Refactoring from spread operators
- **[API Reference](./06-api-reference.md)** - Complete function reference

[← Back to Composition](./03-composition.md)

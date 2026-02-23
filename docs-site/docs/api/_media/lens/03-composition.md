# Lens Composition: Building Complex Access Patterns

Lenses compose naturally, allowing you to build complex deep-access patterns from simple building blocks.

## The `compose()` Function

**Purpose**: Combine two lenses to create a lens that focuses deeper.

**Signature**:
```typescript
function compose<S, A, B>(outer: Lens<S, A>, inner: Lens<A, B>): Lens<S, B>
```

**Mental Model**: `compose(outer, inner)` means "first apply outer, then inner"

## Basic Composition

```typescript
import { prop, compose, view, set } from 'receta/lens'

interface User {
  name: string
  address: Address
}

interface Address {
  street: string
  city: string
}

const addressLens = prop<User>('address')
const cityLens = prop<Address>('city')

// Compose to access user's city
const userCityLens = compose(addressLens, cityLens)

const user = {
  name: 'Alice',
  address: { street: '123 Main', city: 'Boston' },
}

view(userCityLens, user) // 'Boston'
set(userCityLens, 'NYC', user)
// => { name: 'Alice', address: { street: '123 Main', city: 'NYC' } }
```

## Composition vs Path

```typescript
// These are equivalent:

// Using composition
const cityLens1 = compose(
  prop<User>('address'),
  prop<Address>('city')
)

// Using path
const cityLens2 = path<User, string>('address.city')

// Both work the same way
view(cityLens1, user) === view(cityLens2, user) // true
```

**When to use each**:
- Use `path()` for simple dot-notation access (more concise)
- Use `compose()` when you need to build up lenses dynamically or reuse lens pieces

## Multi-Level Composition

```typescript
interface State {
  user: {
    profile: {
      settings: {
        theme: string
      }
    }
  }
}

// Build up step by step
const userLens = prop<State>('user')
const profileLens = prop<State['user']>('profile')
const settingsLens = prop<State['user']['profile']>('settings')
const themeLens = prop<State['user']['profile']['settings']>('theme')

// Compose multiple levels
const themeFromState = compose(
  compose(compose(userLens, profileLens), settingsLens),
  themeLens
)

// Or use path for the same effect
const themeFromState2 = path<State, string>('user.profile.settings.theme')
```

## Real-World: Shopping Cart Items

```typescript
interface CartState {
  cart: {
    items: Array<{ id: string; quantity: number }>
  }
}

const cartLens = prop<CartState>('cart')
const itemsLens = prop<CartState['cart']>('items')
const firstItemLens = index<CartItem>(0)

// Access first item's quantity
const firstItemQuantityLens = compose(
  compose(compose(cartLens, itemsLens), firstItemLens),
  prop<CartItem>('quantity')
)

// Update first item quantity
const state = { cart: { items: [{ id: '1', quantity: 2 }] } }
over(firstItemQuantityLens, (q) => q + 1, state)
```

## Real-World: Form Field Errors

```typescript
interface FormState {
  fields: {
    email: { value: string; error?: string }
    password: { value: string; error?: string }
  }
}

const fieldsLens = prop<FormState>('fields')
const emailFieldLens = prop<FormState['fields']>('email')
const emailErrorLens = prop<FormState['fields']['email']>('error')

// Compose to access email error
const emailErrorFromForm = compose(
  compose(fieldsLens, emailFieldLens),
  emailErrorLens
)

// Or simpler with path
const emailErrorPath = path<FormState, string | undefined>(
  'fields.email.error'
)
```

## Composition Laws

Lens composition is associative:

```typescript
// These are equivalent
const lens1 = compose(compose(a, b), c)
const lens2 = compose(a, compose(b, c))

// (a . b) . c = a . (b . c)
view(lens1, data) === view(lens2, data)
```

## Dynamic Composition

```typescript
// Build lenses dynamically
const buildFieldLens = (fieldName: keyof FormFields) => {
  const fieldsLens = prop<Form>('fields')
  const fieldLens = prop<FormFields>(fieldName)
  return compose(fieldsLens, fieldLens)
}

const emailLens = buildFieldLens('email')
const passwordLens = buildFieldLens('password')
```

## What's Next?

- **[Patterns →](./04-patterns.md)** - Real-world recipes (React, Redux, Forms)
- **[API Reference](./06-api-reference.md)** - Complete function reference

[← Back to Operations](./02-operations.md)

# Lens: Composable Immutable Updates Made Simple

> **TL;DR**: Lenses provide a composable, type-safe way to read and update deeply nested data structures without mutation. Think "dot notation that works for updates" with full immutability guarantees.

## The Problem: Deep Updates Are Painful

### Scenario: Updating Nested State in React

You're building a user profile editor in React. The state structure looks like this:

```typescript
interface UserProfile {
  name: string
  email: string
  address: {
    street: string
    city: string
    zip: string
    country: {
      name: string
      code: string
    }
  }
  preferences: {
    theme: 'light' | 'dark'
    notifications: boolean
    language: string
  }
}
```

**Task**: User changes their city from "Boston" to "NYC"

**Traditional approach with spread operators**:

```typescript
// ❌ Nested spread hell - error-prone and verbose
const updateCity = (profile: UserProfile, newCity: string) => ({
  ...profile,
  address: {
    ...profile.address,
    city: newCity,
  },
})

// Easy to make mistakes:
const broken = (profile: UserProfile, newCity: string) => ({
  ...profile,
  address: {
    // Forgot to spread! Lost street, zip, country
    city: newCity,
  },
})
```

**4 levels deep? Good luck:**

```typescript
// ❌ Update country code - this is painful
const updateCountryCode = (profile: UserProfile, code: string) => ({
  ...profile,
  address: {
    ...profile.address,
    country: {
      ...profile.address.country,
      code,
    },
  },
})
```

### How Real Products Handle This

Let's look at how successful products structure their state updates:

**GitHub's PR Review State** (simplified):

```typescript
// GitHub needs to update review states deep in their data structure
interface PRState {
  pr: {
    number: number
    reviews: Array<{
      id: string
      author: string
      state: 'approved' | 'changes_requested' | 'commented'
      comments: Array<{ id: string; body: string }>
    }>
  }
}

// Traditional approach - updating a comment body
const updateComment = (
  state: PRState,
  reviewId: string,
  commentId: string,
  newBody: string
): PRState => ({
  ...state,
  pr: {
    ...state.pr,
    reviews: state.pr.reviews.map((review) =>
      review.id === reviewId
        ? {
            ...review,
            comments: review.comments.map((comment) =>
              comment.id === commentId
                ? { ...comment, body: newBody }
                : comment
            ),
          }
        : review
    ),
  },
})

// 😰 Complex, hard to read, easy to mess up
```

**Stripe Dashboard Settings** (simplified):

```typescript
// Stripe manages complex nested settings
interface StripeSettings {
  account: {
    business: {
      name: string
      taxId: string
      address: {
        line1: string
        city: string
        country: string
      }
    }
    branding: {
      logo: string
      primaryColor: string
      accentColor: string
    }
  }
}

// Updating the business address city
const updateBusinessCity = (
  settings: StripeSettings,
  city: string
): StripeSettings => ({
  ...settings,
  account: {
    ...settings.account,
    business: {
      ...settings.account.business,
      address: {
        ...settings.account.business.address,
        city,
      },
    },
  },
})

// 🤯 5 levels of spreading - this is maintenance hell
```

## The Solution: Lenses

Lenses solve this by providing **composable accessors** that work for both reading AND writing:

```typescript
import { prop, path, view, set, over } from 'receta/lens'
import * as R from 'remeda'

// Define lenses once
const cityLens = path<UserProfile, string>('address.city')
const countryCodeLens = path<UserProfile, string>('address.country.code')

// Reading is simple
const city = view(cityLens, profile) // "Boston"

// Updating is just as simple - immutable by default
const updated = set(cityLens, 'NYC', profile)

// Transformations work too
const uppercase = over(cityLens, (city) => city.toUpperCase(), profile)

// Compose in pipes - React setState style
setState((state) =>
  R.pipe(
    state,
    set(cityLens, 'NYC'),
    set(countryCodeLens, 'US'),
    over(prop<UserProfile>('email'), (email) => email.toLowerCase())
  )
)
```

### GitHub Example with Lenses

```typescript
import { prop, path, compose, set, view } from 'receta/lens'

// Define lenses for the structure
const prLens = prop<PRState>('pr')
const reviewsLens = prop<PRState['pr']>('reviews')

// Helper to update array element by predicate
const findReview = (id: string) => (reviews: Review[]) =>
  reviews.map((r) => (r.id === id ? updateReview(r) : r))

// Now updates are clear and composable
const updateReviewState = (
  state: PRState,
  reviewId: string,
  newState: Review['state']
) => {
  const reviewsPath = compose(prLens, reviewsLens)
  return over(reviewsPath, (reviews) =>
    reviews.map((review) =>
      review.id === reviewId ? { ...review, state: newState } : review
    )
  )(state)
}

// ✅ Much clearer intent, no nested spreads
```

### Stripe Example with Lenses

```typescript
import { path, set } from 'receta/lens'
import * as R from 'remeda'

// Define lenses once
const businessCityLens = path<StripeSettings, string>(
  'account.business.address.city'
)
const brandingLogoLens = path<StripeSettings, string>('account.branding.logo')
const primaryColorLens = path<StripeSettings, string>(
  'account.branding.primaryColor'
)

// Update multiple deep fields - clean and readable
const updateSettings = (settings: StripeSettings) =>
  R.pipe(
    settings,
    set(businessCityLens, 'San Francisco'),
    set(brandingLogoLens, 'https://cdn.stripe.com/new-logo.png'),
    set(primaryColorLens, '#6772E5')
  )

// ✅ Clean, composable, no spread operator hell
```

## Why Lenses Over Alternatives?

### Problem 1: Spread Operators Don't Compose

```typescript
// ❌ Can't reuse this logic
const updateCity = (profile: UserProfile) => ({
  ...profile,
  address: {
    ...profile.address,
    city: 'NYC',
  },
})

// ❌ Have to repeat the whole pattern for country
const updateCountry = (profile: UserProfile) => ({
  ...profile,
  address: {
    ...profile.address,
    country: {
      ...profile.address.country,
      code: 'US',
    },
  },
})

// ✅ Lenses compose naturally
const addressLens = prop<UserProfile>('address')
const cityLens = prop<Address>('city')
const countryLens = prop<Address>('country')
const codeLens = prop<Country>('code')

const addressCityLens = compose(addressLens, cityLens)
const countryCodeLens = compose(compose(addressLens, countryLens), codeLens)

// Or use path for convenience
const cityPath = path<UserProfile, string>('address.city')
const codePath = path<UserProfile, string>('address.country.code')
```

### Problem 2: Spread Operators Lose Type Information

```typescript
// ❌ TypeScript can't help you here
const broken = (profile: UserProfile) => ({
  ...profile,
  address: {
    // Oops, forgot to spread address
    // TypeScript doesn't catch this easily
    cty: 'NYC', // Typo! Should be 'city'
  },
})

// ✅ Lenses are fully type-safe
const cityLens = path<UserProfile, string>('address.city')
set(cityLens, 'NYC', profile) // TypeScript enforces correct types
```

### Problem 3: Spread Operators Don't Work in Pipelines

```typescript
// ❌ Can't chain spread updates naturally
const result = updateCity(updateCountry(updateEmail(profile)))

// ❌ Or you end up with this mess
const result = {
  ...profile,
  email: profile.email.toLowerCase(),
  address: {
    ...profile.address,
    city: 'NYC',
    country: {
      ...profile.address.country,
      code: 'US',
    },
  },
}

// ✅ Lenses work perfectly in pipes
const result = R.pipe(
  profile,
  set(emailLens, email.toLowerCase()),
  set(cityLens, 'NYC'),
  set(countryCodeLens, 'US')
)
```

## Real-World Use Cases

### 1. React State Management

```typescript
// Complex state in React
const [appState, setAppState] = useState<AppState>(initialState)

// Update with lenses
const updateTheme = () => {
  setAppState((state) => set(themeLens, 'dark', state))
}

const incrementCounter = () => {
  setAppState((state) => over(counterLens, (n) => n + 1, state))
}
```

### 2. Redux Reducers

```typescript
// Instead of nested spreads in reducers
const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'UPDATE_USER_CITY':
      return set(cityLens, action.payload, state)

    case 'INCREMENT_COUNTER':
      return over(counterLens, (n) => n + 1, state)

    default:
      return state
  }
}
```

### 3. Form Field Updates

```typescript
interface FormState {
  user: {
    firstName: string
    lastName: string
    email: string
  }
  billing: {
    cardNumber: string
    expiryDate: string
    cvv: string
  }
}

// Create lenses for each field
const firstNameLens = path<FormState, string>('user.firstName')
const emailLens = path<FormState, string>('user.email')
const cardLens = path<FormState, string>('billing.cardNumber')

// Generic field updater
const updateField = <T>(lens: Lens<FormState, T>, value: T) => {
  setFormState((state) => set(lens, value, state))
}

// Use in event handlers
<input onChange={(e) => updateField(emailLens, e.target.value)} />
```

### 4. API Response Transformation

```typescript
// Transform nested API response
interface APIResponse {
  data: {
    user: {
      profile: {
        displayName: string
        avatar: string
      }
    }
  }
}

const displayNameLens = path<APIResponse, string>(
  'data.user.profile.displayName'
)

// Normalize display names
const normalized = over(
  displayNameLens,
  (name) => name.trim().toLowerCase(),
  apiResponse
)
```

### 5. Configuration Management

```typescript
// Deep configuration objects
interface Config {
  api: {
    baseUrl: string
    timeout: number
    retry: {
      maxAttempts: number
      delay: number
    }
  }
  features: {
    darkMode: boolean
    analytics: boolean
  }
}

// Update config with environment variables
const retryAttemptsLens = path<Config, number>('api.retry.maxAttempts')
const analyticsLens = path<Config, boolean>('features.analytics')

const productionConfig = R.pipe(
  developmentConfig,
  set(retryAttemptsLens, 5),
  set(analyticsLens, true)
)
```

## Mental Model: Focusing Glasses

Think of a lens as **focusing glasses** that let you zoom into a specific part of a data structure:

```
┌─────────────────────────────────┐
│      UserProfile (whole)        │
│  ┌───────────────────────────┐  │
│  │      address              │  │
│  │  ┌─────────────────────┐  │  │
│  │  │      city           │  │  │  ← Lens focuses here
│  │  └─────────────────────┘  │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**Operations**:
- `view(lens, data)` - Look through the lens (read)
- `set(lens, value, data)` - Change what you see (write)
- `over(lens, fn, data)` - Transform what you see (modify)

The lens **remembers the path** back, so it can:
1. Extract the focused value
2. Update just that value
3. Reconstruct the entire structure immutably

## When to Use Lenses

### ✅ Use Lenses When:

- **Nested updates**: More than 2 levels deep
- **Repeated patterns**: Same update logic used multiple times
- **Complex state**: React/Redux/Zustand state management
- **Transformations**: Need to modify values, not just set them
- **Type safety matters**: Want compiler to catch errors
- **Code reuse**: Want to abstract update patterns
- **Composition**: Building complex updates from simple ones

### ❌ Don't Use Lenses For:

- **Shallow updates**: Single-level object updates (just use spread)
- **One-off operations**: Used once and never again
- **Simple assignments**: Direct property access is clearer
- **Performance-critical paths**: Lens creation has tiny overhead (usually negligible)
- **Mutation is ok**: Working with mutable data structures intentionally

### Examples

```typescript
// ❌ Overkill - just use spread
const updateName = (user: User, name: string) => ({ ...user, name })

// ✅ Worth it - deeply nested
const updateCity = set(path<User, string>('address.city'), 'NYC')

// ❌ Overkill - one-time operation
const temp = set(someLens, value, data)

// ✅ Worth it - reusable pattern
const cityLens = path<User, string>('address.city')
// Use everywhere: forms, APIs, state updates

// ❌ Overkill - mutation is intended
array.push(item) // Direct mutation is fine here

// ✅ Worth it - immutability required
const updated = over(itemsLens, (items) => [...items, item], state)
```

## Lenses vs Other Patterns

| Pattern                   | Composable | Type-Safe | Immutable | Readable | Reusable |
| ------------------------- | ---------- | --------- | --------- | -------- | -------- |
| **Lenses** (this library) | ✅         | ✅        | ✅        | ✅       | ✅       |
| Spread operators          | ❌         | ⚠️        | ✅        | ❌       | ❌       |
| Immer                     | ⚠️         | ✅        | ✅        | ✅       | ⚠️       |
| Lodash set/get            | ⚠️         | ❌        | ❌        | ✅       | ✅       |
| Ramda lenses              | ✅         | ⚠️        | ✅        | ⚠️       | ✅       |

**Why Receta Lenses?**
- **Type-safe**: Full TypeScript inference
- **Remeda integration**: Works seamlessly with `pipe()`
- **Beginner-friendly**: No FP jargon, clear examples
- **Practical**: Inspired by React, Redux, real apps
- **Lightweight**: Tree-shakeable, minimal runtime

## What's Next?

Now that you understand WHY lenses solve real problems, let's learn HOW to use them:

1. **[Constructors](./01-constructors.md)** - Creating lenses (`prop`, `path`, `index`, `lens`)
2. **[Operations](./02-operations.md)** - Using lenses (`view`, `set`, `over`)
3. **[Composition](./03-composition.md)** - Combining lenses for deep access
4. **[Patterns](./04-patterns.md)** - Real-world recipes (React, Redux, Forms)
5. **[Migration](./05-migration.md)** - Refactoring from spread operators
6. **[API Reference](./06-api-reference.md)** - Complete function reference

Ready to start? Begin with **[Constructors →](./01-constructors.md)**

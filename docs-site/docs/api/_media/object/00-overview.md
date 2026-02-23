# Object Module: Safe, Composable Object Manipulation

> **TL;DR**: The Object module provides utilities for safely manipulating nested objects with type-safe access, validation, and transformation. Unlike vanilla JavaScript or Lodash, all operations are immutable, integrate with Result/Option patterns, and work seamlessly in pipelines.

## Table of Contents

1. [The Problem: Hidden Dangers in Object Operations](#the-problem-hidden-dangers-in-object-operations)
2. [How Production APIs Handle This](#how-production-apis-handle-this)
3. [The Solution: Receta Object Module](#the-solution-receta-object-module)
4. [Why Object Over Lodash/Vanilla JS?](#why-object-over-lodashvanilla-js)
5. [Real-World Use Cases](#real-world-use-cases)
6. [Mental Model](#mental-model)
7. [When to Use Object](#when-to-use-object)
8. [What's Next?](#whats-next)

---

## The Problem: Hidden Dangers in Object Operations

### Real-World Example: API Response Transformation

You're building a dashboard that aggregates data from multiple APIs. Each API returns different object structures that need to be normalized:

```typescript
// GitHub API - snake_case with nested data
const githubUser = {
  login: 'alice',
  avatar_url: 'https://...',
  public_repos: 42,
  created_at: '2015-01-01T00:00:00Z',
  plan: {
    name: 'pro',
    collaborators: 10
  }
}

// Stripe API - different nesting, mixed naming
const stripeCustomer = {
  id: 'cus_123',
  email: 'alice@example.com',
  metadata: {
    github_username: 'alice',
    plan_tier: 'premium'
  },
  subscriptions: {
    data: [{ status: 'active' }]
  }
}

// Your frontend expects: flat, camelCase, consistent structure
interface User {
  id: string
  username: string
  email: string
  avatarUrl: string
  planTier: string
  isActive: boolean
}
```

**Traditional approach has hidden dangers:**

```typescript
// ❌ Problem 1: Unsafe nested access (runtime errors)
const planName = stripeCustomer.subscriptions.data[0].plan.name // TypeError!

// ❌ Problem 2: Manual key transformation (error-prone)
const normalized = {
  avatarUrl: githubUser.avatar_url, // Easy to miss one
  // ... 20 more fields to manually rename
}

// ❌ Problem 3: Mutations leak
function updateConfig(config) {
  config.database.host = 'prod.example.com' // Mutates original!
  return config
}

// ❌ Problem 4: No validation (silent failures)
const theme = config.ui?.theme ?? 'light' // What if config.ui is a string?

// ❌ Problem 5: Deep merging is tricky
const merged = { ...defaults, ...userConfig } // Only shallow merge!
```

### How This Manifests in Production

**At Stripe:**
```typescript
// Normalizing payment methods from different providers
const paymentMethod = {
  type: 'card',
  card: {
    brand: 'visa',
    last4: '4242',
    exp_month: 12,
    exp_year: 2025
  }
}

// Need to flatten for display: { cardBrand: 'visa', cardLast4: '4242', ... }
// Traditional approach: 50+ lines of manual transformation
```

**At GitHub:**
```typescript
// Merging user preferences across devices
const desktopPrefs = {
  theme: 'dark',
  editor: { fontSize: 14, tabSize: 2 }
}

const mobilePrefs = {
  theme: 'light',
  editor: { lineNumbers: true }
}

// Need: { theme: 'light', editor: { fontSize: 14, tabSize: 2, lineNumbers: true } }
// Object.assign() loses nested data!
```

---

## How Production APIs Handle This

### Stripe API Normalization

```typescript
// Stripe payment_intent object (actual response structure)
{
  "id": "pi_123",
  "object": "payment_intent",
  "amount": 2000,
  "metadata": {
    "order_id": "ord_456",
    "customer_tier": "premium"
  },
  "charges": {
    "data": [
      {
        "id": "ch_789",
        "payment_method_details": {
          "card": { "brand": "visa", "last4": "4242" }
        }
      }
    ]
  }
}

// Stripe's internal normalization (conceptual):
// 1. Flatten nested metadata
// 2. Extract deeply nested payment details
// 3. Rename keys to match internal schema
// 4. Validate structure before processing
```

### GitHub API Transformation

```typescript
// GitHub repository object (partial)
{
  "name": "receta",
  "full_name": "company/receta",
  "owner": {
    "login": "alice",
    "avatar_url": "https://..."
  },
  "created_at": "2024-01-01T00:00:00Z",
  "pushed_at": "2024-01-20T15:30:00Z"
}

// GitHub's frontend transformation:
// 1. Rename snake_case → camelCase
// 2. Flatten owner data
// 3. Parse ISO dates
// 4. Add computed fields (e.g., isStale)
```

### Next.js Configuration Merging

```typescript
// next.config.js deep merge behavior
const defaultConfig = {
  images: {
    domains: ['example.com'],
    deviceSizes: [640, 750, 828]
  },
  webpack: (config) => config
}

const userConfig = {
  images: {
    domains: ['cdn.example.com'], // Should merge, not replace
    formats: ['image/avif']
  }
}

// Next.js merges deeply while preserving defaults
```

---

## The Solution: Receta Object Module

The Object module provides **15 functions** across 4 categories:

### 1. Core Operations (5 functions)

```typescript
import * as Obj from 'receta/object'
import { pipe } from 'remeda'

// Flatten: Nested → Dot notation
const nested = { user: { profile: { name: 'Alice' } } }
Obj.flatten(nested)
// => { 'user.profile.name': 'Alice' }

// Unflatten: Dot notation → Nested
const flat = { 'user.name': 'Alice', 'user.age': 30 }
Obj.unflatten(flat)
// => { user: { name: 'Alice', age: 30 } }

// Rename: Transform keys
const snakeCase = { first_name: 'Alice', last_name: 'Smith' }
Obj.rename(snakeCase, { first_name: 'firstName', last_name: 'lastName' })
// => { firstName: 'Alice', lastName: 'Smith' }

// Mask: Security-focused filtering
const user = { id: 1, email: 'alice@example.com', passwordHash: 'secret' }
Obj.mask(user, ['id', 'email'])
// => { id: 1, email: 'alice@example.com' }

// DeepMerge: Intelligent deep merging
Obj.deepMerge([defaults, userConfig], { arrayStrategy: 'concat' })
```

### 2. Safe Access (3 functions)

```typescript
import { getPath, setPath, updatePath } from 'receta/object'
import { isSome, unwrapOr } from 'receta/option'

// GetPath: Returns Option<T> (no runtime errors!)
const config = { database: { host: 'localhost' } }
const host = getPath(config, ['database', 'host'])
// => Some('localhost')

const missing = getPath(config, ['api', 'key'])
// => None (safe!)

// SetPath: Immutable updates
const updated = setPath(config, ['database', 'port'], 5432)
// => { database: { host: 'localhost', port: 5432 } }
// Original config unchanged!

// UpdatePath: Transform in place
updatePath(user, ['profile', 'views'], (n: number) => n + 1)
// => { profile: { views: 11 } }
```

### 3. Validation (3 functions)

```typescript
import { validateShape, stripUndefined, compact } from 'receta/object'
import { isOk } from 'receta/result'

// ValidateShape: Runtime type checking
const schema = {
  id: (v): v is number => typeof v === 'number',
  email: (v): v is string => typeof v === 'string' && v.includes('@')
}

const result = validateShape(input, schema)
if (isOk(result)) {
  // TypeScript knows this is validated!
  console.log(result.value.email)
}

// StripUndefined: Clean payloads
const payload = { name: 'Alice', age: undefined, email: 'alice@example.com' }
stripUndefined(payload)
// => { name: 'Alice', email: 'alice@example.com' }

// Compact: Remove nullish values
compact({ name: 'Alice', age: null, email: undefined })
// => { name: 'Alice' }
```

### 4. Transformation (4 functions)

```typescript
import { mapKeys, mapValues, filterKeys, filterValues } from 'receta/object'

// MapKeys: Transform all keys
mapKeys(snakeCase, (key) => toCamelCase(key))

// MapValues: Transform all values
mapValues(prices, (price) => price * 1.1)

// FilterKeys: Keep matching keys
filterKeys(config, (key) => key.startsWith('api_'))

// FilterValues: Keep matching values
filterValues(scores, (score) => score >= 70)
```

---

## Why Object Over Lodash/Vanilla JS?

### Problem 1: Lodash Mutates or Forces Cloning

```typescript
// ❌ Lodash: Manual deep cloning required
import _ from 'lodash'

const original = { a: { b: 1 } }
const updated = _.set(_.cloneDeep(original), 'a.b', 2)
// Verbose, error-prone, easy to forget cloneDeep

// ✅ Receta: Immutable by default
const updated = setPath(original, ['a', 'b'], 2)
// Original unchanged, no cloning needed
```

### Problem 2: Vanilla JS Has No Safe Access

```typescript
// ❌ Vanilla: Optional chaining still throws on edge cases
const value = obj?.deeply?.nested?.value ?? 'default'
// What if 'deeply' is a string? Runtime error!

// ✅ Receta: Type-safe with Option
const value = pipe(
  obj,
  getPath(['deeply', 'nested', 'value']),
  unwrapOr('default')
)
// Guaranteed safe, works in pipes
```

### Problem 3: No Pipeline Integration

```typescript
// ❌ Lodash: Forced to use chain() or nest calls
const result = _.flatMap(
  _.filter(
    _.map(data, transform),
    predicate
  ),
  expand
)

// ✅ Receta: Natural pipeline composition
const result = pipe(
  apiResponse,
  Obj.rename(keyMapping),
  Obj.stripUndefined,
  Obj.validateShape(schema),
  Result.map(processValidData)
)
```

### Problem 4: No Built-in Validation

```typescript
// ❌ Lodash/Vanilla: Manual validation
if (typeof obj.id === 'number' && typeof obj.email === 'string') {
  // Process...
}

// ✅ Receta: First-class validation
const result = validateShape(obj, schema)
// Returns Result<T, ObjectError> with error details
```

### Comparison Table

| Feature | Vanilla JS | Lodash | Receta Object |
|---------|-----------|--------|---------------|
| Immutable | ❌ No | ⚠️ Manual | ✅ Always |
| Safe access | ⚠️ `?.` only | ❌ No | ✅ Option<T> |
| Pipeline | ❌ No | ⚠️ chain() | ✅ Native |
| Validation | ❌ No | ❌ No | ✅ Built-in |
| Type-safe | ⚠️ Partial | ❌ No | ✅ Full |
| Tree-shakeable | N/A | ❌ No | ✅ Yes |
| Deep merge | ❌ Shallow | ✅ Yes | ✅ Configurable |
| Flatten | ❌ No | ✅ Yes | ✅ Yes |

---

## Real-World Use Cases

### 1. API Response Normalization

```typescript
// Stripe payment → Your DB schema
const normalizePayment = (stripePayment: unknown) =>
  pipe(
    stripePayment,
    validateShape(stripePaymentSchema),
    Result.map(Obj.flatten),
    Result.map(Obj.rename(keyMapping)),
    Result.map(stripUndefined),
    Result.flatMap(saveToDatabase)
  )
```

### 2. Configuration Merging

```typescript
// Next.js-style deep merge
const mergedConfig = pipe(
  [defaultConfig, envConfig, userConfig],
  Obj.deepMerge({ arrayStrategy: 'concat' }),
  Obj.validateShape(configSchema),
  Result.unwrapOr(defaultConfig)
)
```

### 3. Form Data Sanitization

```typescript
// Clean form data before API call
const sanitizeForm = (formData: FormData) =>
  pipe(
    formData,
    Obj.stripUndefined,
    Obj.filterValues((v) => v !== ''),
    Obj.mask(allowedFields), // Security: only send allowed fields
    Obj.validateShape(formSchema)
  )
```

### 4. Database Query Builder

```typescript
// Build where clause from object
const buildWhere = (filters: Record<string, unknown>) =>
  pipe(
    filters,
    Obj.compact,
    Obj.flatten({ separator: '_' }),
    Obj.mapKeys((key) => `table.${key}`),
    Obj.filterValues((v) => v != null)
  )
```

### 5. Security: Sanitizing Responses

```typescript
// Remove sensitive data before sending to client
const sanitizeUser = (dbUser: DbUser) =>
  pipe(
    dbUser,
    Obj.mask(['id', 'username', 'email', 'avatar']), // Allowlist
    Obj.rename({ username: 'displayName' }),
    Obj.updatePath(['avatar'], (url: string) => resizeImage(url))
  )
```

---

## Mental Model

Think of the Object module as a **safe construction toolkit** for object manipulation:

```
Traditional approach:       Receta approach:

┌──────────────┐           ┌──────────────┐
│   Raw Object │           │   Raw Object │
└──────┬───────┘           └──────┬───────┘
       │                          │
       │ Manual ops               │ Safe ops
       │ (error-prone)            │ (type-safe)
       ↓                          ↓
┌──────────────┐           ┌──────────────┐
│   Hope it    │           │  Validated   │
│   works! 🤞  │           │  Result<T>   │
└──────────────┘           └──────────────┘
```

**Key principles:**
1. **Immutable**: Original objects never change
2. **Type-safe**: TypeScript guides you
3. **Composable**: Works in pipe chains
4. **Explicit**: Option/Result for safe handling
5. **Validated**: Runtime checks return Result

---

## When to Use Object

### ✅ Use Object when:

- **API integration**: Normalizing different API response shapes
- **Configuration**: Deep merging config files (Next.js, Vite, etc.)
- **Forms**: Sanitizing and validating form data
- **Security**: Masking sensitive fields before logging/sending
- **Data transformation**: Flattening/unflattening for databases
- **Nested updates**: Immutably updating deep structures
- **Type checking**: Runtime validation of unknown data

### ❌ Don't use Object for:

- **Simple access**: Use optional chaining `obj?.prop`
- **Creating objects**: Use object literals `{ ... }`
- **Shallow operations**: Use spread `{ ...obj }`
- **Class instances**: Stick with methods
- **Performance-critical hot paths**: Profile first

### Decision Tree

```
Need to work with objects?
│
├─ Just reading a known property?
│  → Use optional chaining: obj?.prop
│
├─ Creating/updating one level deep?
│  → Use spread: { ...obj, newKey: value }
│
├─ Working with nested structure?
│  │
│  ├─ Safe access needed?
│  │  → Use getPath() → Option<T>
│  │
│  ├─ Need to update?
│  │  → Use setPath() / updatePath()
│  │
│  └─ Need to flatten?
│     → Use flatten() / unflatten()
│
├─ Transforming many keys/values?
│  → Use mapKeys() / mapValues()
│
├─ Merging configs/data?
│  → Use deepMerge()
│
├─ Sanitizing for API/security?
│  → Use mask() + stripUndefined()
│
└─ Validating unknown data?
   → Use validateShape() → Result<T>
```

---

## What's Next?

Now that you understand why the Object module exists and when to use it, explore:

1. **[Core Operations](./01-core-operations.md)** - flatten, unflatten, rename, mask, deepMerge
2. **[Safe Access](./02-safe-access.md)** - getPath, setPath, updatePath
3. **[Validation](./03-validation.md)** - validateShape, stripUndefined, compact
4. **[Transformation](./04-transformation.md)** - mapKeys, mapValues, filterKeys, filterValues
5. **[Patterns & Recipes](./05-patterns.md)** - Copy-paste ready solutions
6. **[Migration Guide](./06-migration.md)** - From Lodash/Vanilla to Receta
7. **[API Reference](./07-api-reference.md)** - Quick lookup and cheat sheets

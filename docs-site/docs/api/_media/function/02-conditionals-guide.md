# Conditionals Guide

> Replace if-else chains with declarative conditional combinators.

## Overview

Conditional combinators let you express branching logic as composable functions instead of imperative control structures. This makes your code more declarative, testable, and easier to compose in pipelines.

## ifElse - Binary Branching

The `ifElse` combinator is the functional equivalent of the ternary operator (`? :`).

### Signature

```typescript
function ifElse<T, U>(
  predicate: (value: T) => boolean,
  onTrue: (value: T) => U,
  onFalse: (value: T) => U
): (value: T) => U
```

### Basic Usage

```typescript
import { ifElse } from 'receta/function'

// Classification logic
const classify = ifElse(
  (n: number) => n >= 0,
  (n) => 'positive',
  (n) => 'negative'
)

classify(5)   // => 'positive'
classify(-3)  // => 'negative'
classify(0)   // => 'positive'
```

### Comparison with Traditional Code

```typescript
// ❌ Traditional ternary
const result = age >= 18
  ? { status: 'adult', age }
  : { status: 'minor', age }

// ✅ ifElse combinator (more reusable)
const classifyAge = ifElse(
  (age: number) => age >= 18,
  (age) => ({ status: 'adult' as const, age }),
  (age) => ({ status: 'minor' as const, age })
)

const result = classifyAge(age)
```

### Real-World Example: User Access Control

```typescript
import { pipe } from 'remeda'
import { ifElse } from 'receta/function'

interface User {
  id: string
  role: 'admin' | 'user' | 'guest'
  permissions: string[]
}

interface AccessGrant {
  canAccess: boolean
  level: 'full' | 'limited' | 'none'
  user: User
}

const grantAccess = ifElse(
  (user: User) => user.role === 'admin',
  (user): AccessGrant => ({
    canAccess: true,
    level: 'full',
    user
  }),
  (user): AccessGrant => ({
    canAccess: user.permissions.includes('read'),
    level: user.permissions.length > 0 ? 'limited' : 'none',
    user
  })
)

const adminUser: User = { id: '1', role: 'admin', permissions: [] }
const regularUser: User = { id: '2', role: 'user', permissions: ['read'] }

console.log(grantAccess(adminUser))
// => { canAccess: true, level: 'full', user: ... }

console.log(grantAccess(regularUser))
// => { canAccess: true, level: 'limited', user: ... }
```

## when - Conditional Transformation

The `when` combinator applies a transformation only when a condition is met; otherwise, it returns the original value.

### Signature

```typescript
function when<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
): (value: T) => T
```

### Basic Usage

```typescript
import { when } from 'receta/function'

// Only transform negative numbers
const ensurePositive = when(
  (n: number) => n < 0,
  (n) => Math.abs(n)
)

ensurePositive(-5)  // => 5
ensurePositive(3)   // => 3
ensurePositive(0)   // => 0
```

### Chaining Multiple `when` Calls

```typescript
import { pipe } from 'remeda'

const normalizeText = pipe(
  when(
    (s: string) => s.length === 0,
    () => 'default'
  ),
  when(
    (s: string) => s.startsWith(' ') || s.endsWith(' '),
    (s) => s.trim()
  ),
  when(
    (s: string) => s.toLowerCase() === s,
    (s) => s.charAt(0).toUpperCase() + s.slice(1)
  )
)

normalizeText('')           // => 'Default'
normalizeText('  hello  ')  // => 'Hello'
normalizeText('world')      // => 'World'
normalizeText('CAPS')       // => 'CAPS' (already has uppercase)
```

### Real-World Example: Form Sanitization

```typescript
import { pipe } from 'remeda'
import { when } from 'receta/function'

interface FormData {
  email: string
  username: string
  bio?: string
}

const sanitizeForm = (data: FormData): FormData =>
  pipe(
    data,
    // Normalize email
    when(
      (d) => d.email.includes(' '),
      (d) => ({ ...d, email: d.email.trim().toLowerCase() })
    ),
    // Add default bio if missing
    when(
      (d) => !d.bio || d.bio.length === 0,
      (d) => ({ ...d, bio: 'No bio provided' })
    ),
    // Truncate long bios
    when(
      (d) => d.bio && d.bio.length > 500,
      (d) => ({ ...d, bio: d.bio!.slice(0, 497) + '...' })
    )
  )

const form: FormData = {
  email: ' Alice@Example.com ',
  username: 'alice',
  bio: 'A'.repeat(600)
}

console.log(sanitizeForm(form))
// => {
//   email: 'alice@example.com',
//   username: 'alice',
//   bio: 'AAA...AAA...' (truncated to 500 chars)
// }
```

## unless - Inverse Conditional

The `unless` combinator is the inverse of `when`: it applies a transformation when the condition is **not** met.

### Signature

```typescript
function unless<T>(
  predicate: (value: T) => boolean,
  fn: (value: T) => T
): (value: T) => T
```

### Basic Usage

```typescript
import { unless } from 'receta/function'

// Ensure value is wrapped in array
const ensureArray = unless(
  Array.isArray,
  (value) => [value]
)

ensureArray([1, 2, 3])  // => [1, 2, 3]
ensureArray(5)          // => [5]
ensureArray('hello')    // => ['hello']
```

### When to Use `when` vs `unless`

Use **when** if the condition reads naturally:
```typescript
// ✅ Reads clearly
when(isEmpty, fillWithDefault)
when(isNegative, makePositive)
```

Use **unless** if the inverse reads more naturally:
```typescript
// ✅ More natural to read
unless(hasProtocol, addProtocol)
unless(isAuthenticated, redirectToLogin)

// ❌ Less natural
when((user) => !isAuthenticated(user), redirectToLogin)
```

### Real-World Example: Configuration Defaults

```typescript
import { pipe } from 'remeda'
import { unless } from 'receta/function'

interface Config {
  apiUrl?: string
  timeout?: number
  retries?: number
  apiKey?: string
}

const applyDefaults = (config: Config): Required<Config> =>
  pipe(
    config,
    unless(
      (c) => 'apiUrl' in c && c.apiUrl !== undefined,
      (c) => ({ ...c, apiUrl: 'https://api.example.com' })
    ),
    unless(
      (c) => 'timeout' in c && c.timeout !== undefined,
      (c) => ({ ...c, timeout: 5000 })
    ),
    unless(
      (c) => 'retries' in c && c.retries !== undefined,
      (c) => ({ ...c, retries: 3 })
    ),
    unless(
      (c) => 'apiKey' in c && c.apiKey !== undefined,
      (c) => ({ ...c, apiKey: process.env.API_KEY || 'default-key' })
    )
  ) as Required<Config>

const userConfig: Config = { timeout: 10000 }

console.log(applyDefaults(userConfig))
// => {
//   apiUrl: 'https://api.example.com',
//   timeout: 10000, // User-provided value preserved
//   retries: 3,
//   apiKey: 'default-key'
// }
```

## cond - Multi-Way Conditional

The `cond` combinator handles multiple conditions in sequence, returning `Some` with the first match or `None` if no conditions match.

### Signature

```typescript
type CondPair<T, U> = readonly [
  predicate: (value: T) => boolean,
  fn: (value: T) => U
]

function cond<T, U>(
  pairs: readonly CondPair<T, U>[]
): (value: T) => Option<U>
```

### Basic Usage

```typescript
import { cond } from 'receta/function'
import { unwrapOr } from 'receta/option'

const classifyNumber = cond<number, string>([
  [(n) => n < 0, (n) => 'negative'],
  [(n) => n === 0, () => 'zero'],
  [(n) => n > 0 && n < 10, (n) => 'small positive'],
  [(n) => n >= 10, (n) => 'large positive']
])

unwrapOr(classifyNumber(-5), 'unknown')   // => 'negative'
unwrapOr(classifyNumber(0), 'unknown')    // => 'zero'
unwrapOr(classifyNumber(3), 'unknown')    // => 'small positive'
unwrapOr(classifyNumber(100), 'unknown')  // => 'large positive'
```

### Comparison with Switch Statement

```typescript
// ❌ Traditional switch
function getStatusMessage(code: number): string {
  switch (true) {
    case code >= 200 && code < 300:
      return 'Success'
    case code >= 300 && code < 400:
      return 'Redirect'
    case code >= 400 && code < 500:
      return 'Client Error'
    case code >= 500:
      return 'Server Error'
    default:
      return 'Unknown'
  }
}

// ✅ cond combinator (more functional)
const getStatusMessage = cond<number, string>([
  [(code) => code >= 200 && code < 300, () => 'Success'],
  [(code) => code >= 300 && code < 400, () => 'Redirect'],
  [(code) => code >= 400 && code < 500, () => 'Client Error'],
  [(code) => code >= 500, () => 'Server Error']
])

const message = unwrapOr(getStatusMessage(404), 'Unknown')
```

### Real-World Example: State Machine

```typescript
import { cond } from 'receta/function'
import { unwrapOr } from 'receta/option'

type OrderState =
  | 'pending'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'

interface Order {
  id: string
  state: OrderState
  items: number
  total: number
}

interface StateAction {
  message: string
  canCancel: boolean
  nextStates: OrderState[]
}

const getOrderAction = cond<Order, StateAction>([
  [
    (order) => order.state === 'pending',
    (order) => ({
      message: `Order ${order.id} is pending payment`,
      canCancel: true,
      nextStates: ['processing', 'cancelled']
    })
  ],
  [
    (order) => order.state === 'processing',
    (order) => ({
      message: `Processing ${order.items} items (total: $${order.total})`,
      canCancel: true,
      nextStates: ['shipped', 'cancelled']
    })
  ],
  [
    (order) => order.state === 'shipped',
    (order) => ({
      message: `Order ${order.id} is on the way`,
      canCancel: false,
      nextStates: ['delivered']
    })
  ],
  [
    (order) => order.state === 'delivered',
    (order) => ({
      message: `Order ${order.id} was delivered`,
      canCancel: false,
      nextStates: []
    })
  ],
  [
    (order) => order.state === 'cancelled',
    (order) => ({
      message: `Order ${order.id} was cancelled`,
      canCancel: false,
      nextStates: []
    })
  ]
])

const order: Order = {
  id: 'ORD-123',
  state: 'processing',
  items: 3,
  total: 99.99
}

const action = unwrapOr(getOrderAction(order), {
  message: 'Unknown state',
  canCancel: false,
  nextStates: []
})

console.log(action)
// => {
//   message: 'Processing 3 items (total: $99.99)',
//   canCancel: true,
//   nextStates: ['shipped', 'cancelled']
// }
```

### Handling No Matches

Since `cond` returns an `Option`, you always handle the "no match" case explicitly:

```typescript
import { cond } from 'receta/function'
import { match } from 'receta/option'

const result = pipe(
  value,
  cond(pairs),
  match(
    (value) => `Matched: ${value}`,
    () => 'No condition matched'
  )
)
```

## Combining Conditionals

You can combine different conditional combinators for complex logic:

```typescript
import { pipe } from 'remeda'
import { when, unless, ifElse } from 'receta/function'

interface Product {
  price: number
  inStock: boolean
  category: string
}

const applyPricing = (product: Product) =>
  pipe(
    product,
    // Add tax unless exempt category
    unless(
      (p) => p.category === 'essential',
      (p) => ({ ...p, price: p.price * 1.2 })
    ),
    // Round to 2 decimals
    when(
      (p) => p.price % 1 !== 0,
      (p) => ({ ...p, price: Math.round(p.price * 100) / 100 })
    ),
    // Apply discount based on stock
    (p) => ({
      ...p,
      price: ifElse(
        (prod: Product) => prod.inStock,
        (prod) => prod.price,
        (prod) => prod.price * 0.9 // 10% discount if out of stock
      )(p)
    })
  )
```

## Best Practices

### 1. Keep Predicates Pure

```typescript
// ❌ Avoid side effects in predicates
let counter = 0
when((n) => { counter++; return n > 0 }, transform)

// ✅ Pure predicates
when((n) => n > 0, transform)
```

### 2. Use Descriptive Names

```typescript
// ❌ Unclear
const fn = when((x) => x < 0, (x) => -x)

// ✅ Clear intent
const ensurePositive = when(
  (n) => n < 0,
  (n) => Math.abs(n)
)
```

### 3. Order `cond` Pairs Carefully

```typescript
// ✅ Specific conditions first
cond([
  [(n) => n === 0, () => 'zero'],          // Most specific
  [(n) => n > 0 && n < 10, () => 'small'], // More specific
  [(n) => n > 0, () => 'positive'],        // Less specific
  [() => true, () => 'other']              // Catch-all last
])

// ❌ General conditions first will shadow specific ones
cond([
  [(n) => n > 0, () => 'positive'],        // Too general
  [(n) => n > 0 && n < 10, () => 'small'], // Never reached!
])
```

### 4. Prefer `unless` for Negated Conditions

```typescript
// ❌ Double negative is confusing
when((user) => !user.isAuthenticated, redirectToLogin)

// ✅ Positive reading
unless((user) => user.isAuthenticated, redirectToLogin)
```

## Type Safety

All conditional combinators maintain full type safety:

```typescript
const result = ifElse(
  (n: number) => n > 0,
  (n) => `positive: ${n}`,  // n is inferred as number
  (n) => `negative: ${n}`   // n is inferred as number
)
// result type: (n: number) => string
```

TypeScript will catch type mismatches:

```typescript
ifElse(
  (n: number) => n > 0,
  (n) => n.toString(),   // returns string
  (n) => n               // ❌ Error: must return string
)
```

## Next Steps

- **[Composition Guide](./03-composition-guide.md)** - Learn compose, converge, juxt
- **[Integration Guide](./06-integration-guide.md)** - Combine with Result and Option
- **[API Reference](./08-api-reference.md)** - Complete function signatures

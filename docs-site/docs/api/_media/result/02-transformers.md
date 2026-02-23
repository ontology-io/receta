# Transformers: Working with Results

> How to transform, chain, and compose Results without unwrapping them.

## Overview

| Function | Purpose | Real-World Analogy |
|----------|---------|-------------------|
| `map(fn)` | Transform success value | Formatting API response for UI |
| `mapErr(fn)` | Transform error value | Enriching errors with context |
| `flatMap(fn)` | Chain operations that return Results | Multi-step API workflow |
| `flatten()` | Unwrap nested Results | Simplifying layered operations |
| `tap(fn)` | Side effect on success | Logging without changing value |
| `tapErr(fn)` | Side effect on error | Error monitoring/analytics |

---

## `map(fn)` - Transform Success Values

**When to use**: You have a Result and want to transform its value (like Array.map).

### Real-World: Format API Response for UI

```typescript
import { map } from 'receta/result'

// GitHub API returns full user object
const fetchUser = async (username: string) =>
  tryCatchAsync(() => fetch(`https://api.github.com/users/${username}`))

// Transform for UI (extract only what we need)
const userForUI = pipe(
  await fetchUser('octocat'),
  map(user => ({
    name: user.name,
    avatar: user.avatar_url,
    followers: user.followers.toLocaleString() // Format number
  }))
)

// Type: Result<{ name, avatar, followers }, Error>
```

### Real-World: Stripe Amount Formatting

```typescript
// Stripe stores amounts in cents
const getChargeAmount = (chargeId: string) =>
  pipe(
    fetchCharge(chargeId),          // Result<Charge, StripeError>
    map(charge => charge.amount),   // Result<number, StripeError>
    map(cents => cents / 100),      // Result<number, StripeError>
    map(dollars => `$${dollars.toFixed(2)}`) // Result<string, StripeError>
  )

// Ok(5000) → Ok(50) → Ok('$50.00')
```

### Real-World: Database Result Transformation

```typescript
// Prisma returns Date objects, frontend needs ISO strings
const getPost = (id: string) =>
  pipe(
    await db.post.findUnique({ where: { id } }),
    fromNullable(_, 'Post not found'),
    map(post => ({
      ...post,
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }))
  )
```

**Key Point**: `map` only runs if Result is `Ok`. If it's `Err`, the error passes through unchanged.

```typescript
map(ok(5), x => x * 2)     // Ok(10) ✅
map(err('fail'), x => x * 2) // Err('fail') - fn never runs ✅
```

---

## `mapErr(fn)` - Transform Error Values

**When to use**: Enrich errors with context, normalize error formats, add tracking IDs.

### Real-World: Add Context to Errors

```typescript
import { mapErr } from 'receta/result'

const fetchUserPosts = (userId: string) =>
  pipe(
    fetch(`/api/users/${userId}/posts`),
    mapErr(error => ({
      ...error,
      context: { userId, endpoint: '/posts' },
      timestamp: Date.now()
    }))
  )
```

### Real-World: Normalize Third-Party Errors

```typescript
// Stripe, AWS, GitHub all have different error formats
// Normalize them to your app's format
type AppError = {
  code: string
  message: string
  source: 'stripe' | 'aws' | 'github'
}

const chargeCard = (token: string) =>
  pipe(
    tryCatchAsync(() => stripe.charges.create({ token })),
    mapErr((stripeError): AppError => ({
      code: stripeError.code || 'unknown',
      message: stripeError.message,
      source: 'stripe'
    }))
  )
```

### Real-World: Error Severity Levels

```typescript
const categorizeError = pipe(
  riskyOperation(),
  mapErr(error => {
    const severity = error.status >= 500 ? 'critical' : 'warning'
    return { ...error, severity, retryable: error.status < 500 }
  })
)
```

### Real-World: User-Friendly Error Messages

```typescript
// Convert technical errors to user-friendly messages
const saveProfile = (profile: Profile) =>
  pipe(
    validateProfile(profile),
    flatMap(valid => db.profile.update(valid)),
    mapErr(dbError => {
      if (dbError.code === 'P2002') {
        return 'That username is already taken'
      }
      if (dbError.code === 'P2003') {
        return 'Invalid profile data'
      }
      return 'Something went wrong. Please try again.'
    })
  )
```

**Key Point**: `mapErr` only runs if Result is `Err`. If it's `Ok`, the value passes through.

```typescript
mapErr(ok(5), e => `Error: ${e}`)       // Ok(5) - fn never runs ✅
mapErr(err('fail'), e => `Error: ${e}`) // Err('Error: fail') ✅
```

---

## `flatMap(fn)` - Chain Dependent Operations

**When to use**: Next operation depends on previous result AND can also fail.

### Real-World: Multi-Step Workflow

```typescript
import { flatMap } from 'receta/result'

// Stripe payment flow
const processPayment = (email: string, token: string, amount: number) =>
  pipe(
    // Step 1: Find or create customer
    findOrCreateCustomer(email),
    // Step 2: Create charge (needs customer.id)
    flatMap(customer =>
      createCharge(customer.id, token, amount)
    ),
    // Step 3: Send receipt (needs charge.id)
    flatMap(charge =>
      sendReceipt(email, charge.id)
    ),
    // Step 4: Format response
    map(receipt => ({
      success: true,
      receiptUrl: receipt.url
    }))
  )

// If ANY step fails, pipeline short-circuits to Err
```

### Real-World: Database Transaction

```typescript
// User signup flow
const signupUser = (email: string, password: string) =>
  pipe(
    // 1. Validate email
    validateEmail(email),
    // 2. Hash password (can fail)
    flatMap(validEmail =>
      tryCatchAsync(() => bcrypt.hash(password, 10))
        .map(hash => ({ email: validEmail, hash }))
    ),
    // 3. Create user (can fail - duplicate email)
    flatMap(({ email, hash }) =>
      tryCatchAsync(() => db.user.create({ email, passwordHash: hash }))
    ),
    // 4. Create session
    flatMap(user =>
      createSession(user.id)
    ),
    // 5. Send welcome email (non-critical - use tap instead)
    tap(user => sendWelcomeEmail(user.email))
  )
```

### Real-World: API Pagination

```typescript
const fetchAllPages = async (url: string) => {
  let results: Item[] = []
  let nextUrl: string | null = url

  while (nextUrl) {
    const result = await pipe(
      tryCatchAsync(() => fetch(nextUrl)),
      flatMap(res => tryCatchAsync(() => res.json()))
    )

    if (isErr(result)) {
      return result // Propagate error
    }

    results = [...results, ...result.value.items]
    nextUrl = result.value.next_page
  }

  return ok(results)
}
```

### Why flatMap vs map?

```typescript
// ❌ Wrong: Using map creates nested Results
pipe(
  fetchUser(id),                    // Result<User, Error>
  map(user => fetchPosts(user.id))  // Result<Result<Post[], Error>, Error> 🤯
)

// ✅ Right: Using flatMap flattens the Result
pipe(
  fetchUser(id),                     // Result<User, Error>
  flatMap(user => fetchPosts(user.id)) // Result<Post[], Error> ✅
)
```

---

## `flatten()` - Unwrap Nested Results

**When to use**: You have `Result<Result<T, E>, E>` and want `Result<T, E>`.

### Real-World: Conditional Validation

```typescript
import { flatten } from 'receta/result'

const validateAge = (age: number): Result<number, string> =>
  age >= 18 ? ok(age) : err('Must be 18+')

const validateUser = (user: { age?: number }) =>
  pipe(
    // First check if age exists
    fromNullable(user.age, 'Age is required'),
    // This returns Result<Result<number, string>, string>
    map(age => validateAge(age)),
    // Flatten to Result<number, string>
    flatten
  )
```

### Real-World: Nested API Calls

```typescript
// Get user's primary email from GitHub API
const getPrimaryEmail = (username: string) =>
  pipe(
    fetchUser(username),              // Result<User, ApiError>
    map(user => user.emails),         // Result<Email[], ApiError>
    map(emails => emails.find(e => e.primary)), // Result<Email | undefined, ApiError>
    map(email => fromNullable(email, 'No primary email')), // Result<Result<Email, string>, ApiError>
    flatten                            // Result<Email, ApiError | string>
  )
```

---

## `tap(fn)` - Side Effects on Success

**When to use**: Logging, analytics, notifications - things that shouldn't affect the Result.

### Real-World: Logging

```typescript
import { tap } from 'receta/result'

const createOrder = (items: Item[]) =>
  pipe(
    validateItems(items),
    tap(valid => console.log('✓ Items validated:', valid.length)),
    flatMap(calculateTotal),
    tap(total => console.log('✓ Total calculated:', total)),
    flatMap(chargeCustomer),
    tap(charge => console.log('✓ Payment successful:', charge.id)),
    flatMap(sendConfirmation),
    tap(conf => console.log('✓ Confirmation sent:', conf.email))
  )

// Logs appear as each step succeeds, but don't affect the Result
```

### Real-World: Analytics

```typescript
const trackUserAction = (action: string) =>
  tap(data => analytics.track(action, data))

const signup = (email: string) =>
  pipe(
    validateEmail(email),
    trackUserAction('email_validated'),
    flatMap(createAccount),
    trackUserAction('account_created'),
    flatMap(sendWelcome),
    trackUserAction('welcome_sent')
  )
```

### Real-World: Progress Updates

```typescript
const processLargeFile = (file: File) =>
  pipe(
    validateFile(file),
    tap(() => updateProgress('Validating...', 10)),
    flatMap(parseFile),
    tap(() => updateProgress('Parsing...', 40)),
    flatMap(transformData),
    tap(() => updateProgress('Transforming...', 70)),
    flatMap(uploadToS3),
    tap(() => updateProgress('Uploading...', 90)),
    map(url => ({ url, status: 'complete' })),
    tap(() => updateProgress('Complete!', 100))
  )
```

**Key Point**: `tap` runs the function but **returns the original Result unchanged**.

```typescript
pipe(
  ok(42),
  tap(n => console.log(n)),  // Logs 42
  map(n => n * 2)             // Ok(84)
)

pipe(
  err('fail'),
  tap(n => console.log(n)),  // Never runs
  map(n => n * 2)             // Err('fail')
)
```

---

## `tapErr(fn)` - Side Effects on Error

**When to use**: Error monitoring, alerting, logging failures.

### Real-World: Error Monitoring (Sentry)

```typescript
import { tapErr } from 'receta/result'
import * as Sentry from '@sentry/node'

const processPayment = (token: string, amount: number) =>
  pipe(
    createCharge(token, amount),
    tapErr(error => {
      Sentry.captureException(error, {
        tags: { amount, currency: 'usd' }
      })
    }),
    tapErr(error => {
      console.error('💳 Payment failed:', error)
    })
  )
```

### Real-World: Slack Alerts

```typescript
const criticalOperation = () =>
  pipe(
    riskyDatabaseOperation(),
    tapErr(error => {
      if (error.severity === 'critical') {
        sendSlackAlert({
          channel: '#incidents',
          message: `🚨 Critical error: ${error.message}`
        })
      }
    })
  )
```

### Real-World: Retry Logic

```typescript
const fetchWithRetry = async (url: string, maxRetries = 3) => {
  let attempt = 0

  return pipe(
    await tryCatchAsync(() => fetch(url)),
    tapErr(error => {
      attempt++
      if (attempt < maxRetries) {
        console.log(`Retry ${attempt}/${maxRetries}`)
      }
    })
  )
}
```

---

## Cheat Sheet

```typescript
// ✅ Transform success value
map(result, user => user.email)

// ✅ Transform error value
mapErr(result, err => ({ ...err, timestamp: Date.now() }))

// ✅ Chain operations that return Results
flatMap(result, user => fetchPosts(user.id))

// ✅ Unwrap nested Results
flatten(nestedResult)

// ✅ Log success without changing value
tap(result, data => console.log(data))

// ✅ Monitor errors without changing value
tapErr(result, err => Sentry.capture(err))
```

## Common Patterns

### 1. Transform → Chain → Extract

```typescript
const workflow = pipe(
  fetchUser(id),              // Get user
  map(user => user.email),    // Extract email
  flatMap(sendResetEmail),    // Send email (can fail)
  map(() => 'Email sent!')    // Success message
)
```

### 2. Add Context to All Errors

```typescript
const withContext = (operation: string) =>
  mapErr(error => ({
    ...error,
    operation,
    timestamp: Date.now(),
    environment: process.env.NODE_ENV
  }))

const result = pipe(
  riskyOperation(),
  withContext('user_signup')
)
```

### 3. Tap for Observability

```typescript
const observable = pipe(
  operation(),
  tap(data => metrics.increment('success')),
  tapErr(error => metrics.increment('error')),
  tap(data => logger.info('Success', data)),
  tapErr(error => logger.error('Failed', error))
)
```

---

## Next Steps

- **[Extractors](./03-extractors.md)**: Get values out with `unwrap`, `match`
- **[Combinators](./04-combinators.md)**: Work with multiple Results
- **[Patterns](./05-patterns.md)**: Complete real-world recipes

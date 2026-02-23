# Extractors: Getting Values Out of Results

> How to extract values from Results and handle both success and error cases.

## Overview

| Function | Purpose | When to Use |
|----------|---------|-------------|
| `unwrap()` | Get value or throw | Testing, internal functions you know are Ok |
| `unwrapOr(default)` | Get value or fallback | UI rendering with defaults |
| `unwrapOrElse(fn)` | Get value or compute fallback | Fallback logic needs the error |
| `match({onOk, onErr})` | Handle both cases | Rendering different UI states |

---

## `unwrap()` - Get Value or Crash

**When to use**: Testing, or when you're **certain** the Result is Ok.

⚠️ **Warning**: Throws an exception if Result is Err. Use sparingly in production code!

### Real-World: Testing

```typescript
import { unwrap } from 'receta/result'

describe('createUser', () => {
  it('creates user successfully', () => {
    const result = createUser({ email: 'test@example.com', name: 'Test' })

    // In tests, we KNOW this should succeed
    const user = unwrap(result)
    expect(user.email).toBe('test@example.com')
  })
})
```

### Real-World: Internal Utilities

```typescript
// Internal function where you control all inputs
const formatUserDisplay = (userId: string) => {
  // We fetched this user 2 lines ago, so we know it exists
  const user = unwrap(findUserById(userId))
  return `${user.name} (${user.email})`
}
```

### When NOT to use unwrap

```typescript
// ❌ BAD: User input can be invalid
app.post('/api/user', (req, res) => {
  const user = unwrap(validateUser(req.body)) // CRASHES if invalid!
  res.json(user)
})

// ✅ GOOD: Handle error case
app.post('/api/user', (req, res) => {
  const result = validateUser(req.body)
  match(result, {
    onOk: (user) => res.json(user),
    onErr: (error) => res.status(400).json({ error })
  })
})
```

---

## `unwrapOr(default)` - Get Value or Default

**When to use**: UI rendering, configuration defaults, optional features.

### Real-World: UI Rendering with Defaults

```typescript
import { unwrapOr } from 'receta/result'

// GitHub profile component
const ProfileCard = ({ username }: { username: string }) => {
  const user = await fetchGitHubUser(username)

  // Show fallback if user not found
  const displayName = pipe(user, map(u => u.name), unwrapOr('Anonymous User'))
  const avatar = pipe(user, map(u => u.avatar_url), unwrapOr('/default-avatar.png'))
  const bio = pipe(user, map(u => u.bio), unwrapOr('No bio available'))

  return (
    <div>
      <img src={avatar} alt={displayName} />
      <h1>{displayName}</h1>
      <p>{bio}</p>
    </div>
  )
}
```

### Real-World: Configuration with Defaults

```typescript
// Next.js / Vite config loading
const loadConfig = () => {
  const port = pipe(
    fromNullable(process.env.PORT, 'No PORT specified'),
    map(str => parseInt(str, 10)),
    unwrapOr(3000) // Default port
  )

  const apiUrl = pipe(
    fromNullable(process.env.API_URL, 'No API_URL specified'),
    unwrapOr('http://localhost:4000') // Default API
  )

  return { port, apiUrl }
}
```

### Real-World: Feature Flags

```typescript
// LaunchDarkly / feature flag system
const isFeatureEnabled = (flagName: string): boolean =>
  pipe(
    tryCatch(() => featureFlags.get(flagName)),
    map(flag => flag.enabled),
    unwrapOr(false) // Default to disabled if flag fetch fails
  )

// Usage
if (isFeatureEnabled('new-checkout')) {
  return <NewCheckout />
} else {
  return <OldCheckout />
}
```

### Real-World: Pagination Defaults

```typescript
const getPaginationParams = (query: URLSearchParams) => {
  const page = pipe(
    fromNullable(query.get('page'), 'No page param'),
    map(Number),
    unwrapOr(1)
  )

  const pageSize = pipe(
    fromNullable(query.get('pageSize'), 'No pageSize param'),
    map(Number),
    unwrapOr(20)
  )

  return { page, pageSize }
}
```

---

## `unwrapOrElse(fn)` - Compute Fallback from Error

**When to use**: Fallback logic depends on the error, logging before defaulting.

### Real-World: Retry with Cache Fallback

```typescript
import { unwrapOrElse } from 'receta/result'

const fetchUserWithFallback = async (id: string) =>
  pipe(
    await tryCatchAsync(() => fetch(`/api/users/${id}`)),
    unwrapOrElse(async (error) => {
      // Log the error
      console.error('Primary API failed:', error)

      // Try cache
      const cached = await cache.get(`user:${id}`)
      if (cached) {
        console.info('Returning cached user')
        return cached
      }

      // Final fallback
      return { id, name: 'Guest', isGuest: true }
    })
  )
```

### Real-World: Error-Specific Defaults

```typescript
const loadUserPreferences = (userId: string) =>
  pipe(
    fetchPreferences(userId),
    unwrapOrElse((error) => {
      if (error.type === 'not_found') {
        // New user, use system defaults
        return defaultPreferences
      }
      if (error.type === 'permission_denied') {
        // User has restricted access
        return restrictedPreferences
      }
      // Unknown error, use safe defaults
      return minimalPreferences
    })
  )
```

### Real-World: Graceful Degradation

```typescript
// Stripe: try payment, fall back to invoicing
const chargeOrInvoice = (customerId: string, amount: number) =>
  pipe(
    chargeCustomer(customerId, amount),
    unwrapOrElse((error) => {
      // Log for monitoring
      logger.warn('Payment failed, creating invoice', { error, customerId })

      // Create invoice instead
      return createInvoice(customerId, amount)
    })
  )
```

### Real-World: User-Friendly Error Recovery

```typescript
const uploadAvatar = (file: File) =>
  pipe(
    validateImage(file),
    flatMap(valid => uploadToS3(valid)),
    unwrapOrElse((error) => {
      // Show specific help based on error
      if (error.type === 'file_too_large') {
        showNotification('Please choose an image under 5MB')
      } else if (error.type === 'invalid_format') {
        showNotification('Please upload a JPG or PNG')
      } else {
        showNotification('Upload failed. Please try again.')
      }

      // Return placeholder URL
      return '/default-avatar.png'
    })
  )
```

---

## `match({onOk, onErr})` - Pattern Matching

**When to use**: Rendering different UI states, handling both success and error explicitly.

### Real-World: API Response Handling

```typescript
import { match } from 'receta/result'

app.get('/api/users/:id', async (req, res) => {
  const result = await fetchUser(req.params.id)

  match(result, {
    onOk: (user) => {
      res.status(200).json({
        success: true,
        data: user
      })
    },
    onErr: (error) => {
      const status = error.type === 'not_found' ? 404 : 500
      res.status(status).json({
        success: false,
        error: error.message
      })
    }
  })
})
```

### Real-World: React Component States

```typescript
const UserProfile = ({ userId }: { userId: string }) => {
  const [userResult, setUserResult] = useState<Result<User, Error>>(
    err('Loading...')
  )

  useEffect(() => {
    fetchUser(userId).then(setUserResult)
  }, [userId])

  return match(userResult, {
    onOk: (user) => (
      <div>
        <h1>{user.name}</h1>
        <p>{user.email}</p>
        <img src={user.avatar} alt={user.name} />
      </div>
    ),
    onErr: (error) => (
      <div className="error">
        <h2>Error Loading Profile</h2>
        <p>{error.message}</p>
        <button onClick={() => fetchUser(userId).then(setUserResult)}>
          Retry
        </button>
      </div>
    )
  })
}
```

### Real-World: CLI Tool Output

```typescript
// Stripe CLI / AWS CLI style
const deployCLI = async (projectPath: string) => {
  const result = await deployProject(projectPath)

  match(result, {
    onOk: (deployment) => {
      console.log('✅ Deployment successful!')
      console.log(`🔗 URL: ${deployment.url}`)
      console.log(`📦 Build ID: ${deployment.buildId}`)
      process.exit(0)
    },
    onErr: (error) => {
      console.error('❌ Deployment failed')
      console.error(`Error: ${error.message}`)
      if (error.logs) {
        console.error('\nLogs:')
        console.error(error.logs)
      }
      process.exit(1)
    }
  })
}
```

### Real-World: Email Templates

```typescript
const sendOrderConfirmation = (orderId: string) =>
  pipe(
    fetchOrder(orderId),
    match({
      onOk: (order) => `
        <h1>Order Confirmed!</h1>
        <p>Thank you for your order #${order.id}</p>
        <p>Total: $${order.total.toFixed(2)}</p>
        <p>Estimated delivery: ${order.estimatedDelivery}</p>
      `,
      onErr: (error) => `
        <h1>Order Status Unavailable</h1>
        <p>We're having trouble retrieving your order details.</p>
        <p>Please contact support: support@example.com</p>
        <p>Error: ${error.message}</p>
      `
    })
  )
```

### Real-World: Notification System

```typescript
const notifyUser = (result: Result<Payment, PaymentError>) =>
  match(result, {
    onOk: (payment) => {
      toast.success(`Payment of $${payment.amount} processed successfully!`)
      analytics.track('payment_success', { amount: payment.amount })
    },
    onErr: (error) => {
      if (error.type === 'card_declined') {
        toast.error('Your card was declined. Please try a different card.')
      } else if (error.type === 'insufficient_funds') {
        toast.error('Insufficient funds. Please try a different payment method.')
      } else {
        toast.error('Payment failed. Please contact support.')
        Sentry.captureException(error)
      }
    }
  })
```

---

## Comparison: When to Use Which?

| Scenario | Best Choice | Example |
|----------|-------------|---------|
| Testing (know it's Ok) | `unwrap()` | `expect(unwrap(result)).toBe(42)` |
| UI with fallback text | `unwrapOr(default)` | `unwrapOr('No description')` |
| Config with defaults | `unwrapOr(default)` | `unwrapOr(3000)` for port |
| Need error for fallback | `unwrapOrElse(fn)` | Retry, cache, logging |
| Different UI for Ok/Err | `match({onOk, onErr})` | Loading/Error/Success states |
| HTTP response | `match({onOk, onErr})` | 200 vs 404/500 |

---

## Common Patterns

### 1. Graceful Degradation Chain

```typescript
const getContent = (id: string) =>
  pipe(
    fetchFromCDN(id),
    unwrapOrElse(() => fetchFromDB(id)),
    unwrapOrElse(() => fetchFromCache(id)),
    unwrapOr(staticFallback)
  )
```

### 2. Conditional Defaults Based on Error

```typescript
const withSmartDefaults = (result: Result<T, E>) =>
  unwrapOrElse((error) => {
    switch (error.type) {
      case 'not_found':
        return defaultForMissing
      case 'permission_denied':
        return defaultForRestricted
      default:
        return defaultForError
    }
  })
```

### 3. Match with Side Effects

```typescript
match(result, {
  onOk: (data) => {
    analytics.track('success')
    return renderSuccess(data)
  },
  onErr: (error) => {
    logger.error(error)
    Sentry.capture(error)
    return renderError(error)
  }
})
```

### 4. Extract with Transform

```typescript
// Get value and transform in one go
const userEmail = pipe(
  fetchUser(id),
  map(user => user.email.toLowerCase()),
  unwrapOr('noreply@example.com')
)
```

---

## Antipatterns to Avoid

### ❌ Don't use unwrap() in production

```typescript
// BAD
const handler = (req) => {
  const user = unwrap(validateRequest(req)) // Crashes!
  return user
}

// GOOD
const handler = (req) => {
  return match(validateRequest(req), {
    onOk: (user) => user,
    onErr: (error) => ({ error: error.message })
  })
}
```

### ❌ Don't ignore errors silently

```typescript
// BAD
const user = unwrapOr(null)(fetchUser(id)) // Error is lost!

// GOOD
const user = pipe(
  fetchUser(id),
  tapErr(error => logger.error('Failed to fetch user', { id, error })),
  unwrapOr(null)
)
```

### ❌ Don't use match for simple defaults

```typescript
// VERBOSE
match(result, {
  onOk: (x) => x,
  onErr: () => defaultValue
})

// CONCISE
unwrapOr(defaultValue)(result)
```

---

## Next Steps

- **[Combinators](./04-combinators.md)**: Work with multiple Results (`collect`, `partition`)
- **[Patterns](./05-patterns.md)**: Complete real-world recipes
- **[Migration Guide](./06-migration.md)**: From try-catch to Result

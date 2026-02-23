# Combinators: Working with Multiple Results

> How to handle arrays of Results, bulk validation, and parallel operations.

## Overview

| Function | Purpose | Real-World Analogy |
|----------|---------|-------------------|
| `collect(results)` | All-or-nothing validation | Stripe: charge only if ALL validations pass |
| `partition(results)` | Separate successes from failures | Bulk import: show which succeeded/failed |
| `fromNullable(value, error)` | Convert nullable to Result | Array.find() → Result |

---

## `collect(results)` - All or Nothing

**When to use**: Multi-field validation, dependent operations that all must succeed.

### Real-World: Form Validation (Stripe Checkout)

```typescript
import { collect } from 'receta/result'

interface CheckoutForm {
  email: string
  cardNumber: string
  cvv: string
  zipCode: string
}

type ValidationError = string

const validateCheckout = (
  form: CheckoutForm
): Result<CheckoutForm, ValidationError> => {
  const results = [
    validateEmail(form.email),
    validateCardNumber(form.cardNumber),
    validateCVV(form.cvv),
    validateZipCode(form.zipCode)
  ]

  return pipe(
    collect(results), // Fails on FIRST error
    map(([email, cardNumber, cvv, zipCode]) => ({
      email,
      cardNumber,
      cvv,
      zipCode
    }))
  )
}

// Usage
const result = validateCheckout(form)
match(result, {
  onOk: (valid) => {
    // All fields valid, proceed to payment
    processPayment(valid)
  },
  onErr: (error) => {
    // Show FIRST error to user
    showError(error)
  }
})
```

### Real-World: Database Transaction (All or Nothing)

```typescript
// Create user with profile and preferences atomically
const createUserWithProfile = async (data: SignupData) => {
  const operations = [
    createUser(data.email, data.password),
    createProfile(data.name, data.bio),
    createPreferences(data.theme, data.notifications)
  ]

  return pipe(
    await Promise.all(operations),
    collect, // ALL must succeed or transaction rolls back
    match({
      onOk: ([user, profile, prefs]) => ({
        userId: user.id,
        profileId: profile.id,
        prefsId: prefs.id
      }),
      onErr: async (error) => {
        // Rollback all operations
        await rollbackTransaction()
        return error
      }
    })
  )
}
```

### Real-World: Multi-Step API Workflow

```typescript
// GitHub: Create repo with initial files
const createRepoWithFiles = async (
  name: string,
  files: Array<{ path: string; content: string }>
) => {
  // Step 1: Create repo
  const repo = await createRepo(name)

  if (isErr(repo)) {
    return repo
  }

  // Step 2: Upload all files (all must succeed)
  const fileUploads = files.map(file =>
    uploadFile(repo.value.id, file.path, file.content)
  )

  return pipe(
    await Promise.all(fileUploads),
    collect, // All files must upload successfully
    map(uploads => ({
      repo: repo.value,
      files: uploads
    }))
  )
}
```

### Real-World: Configuration Validation

```typescript
// Required env vars - all must be present
const loadConfig = (): Result<Config, string> => {
  const required = [
    fromNullable(process.env.DATABASE_URL, 'Missing DATABASE_URL'),
    fromNullable(process.env.API_KEY, 'Missing API_KEY'),
    fromNullable(process.env.SECRET_KEY, 'Missing SECRET_KEY')
  ]

  return pipe(
    collect(required),
    map(([databaseUrl, apiKey, secretKey]) => ({
      databaseUrl,
      apiKey,
      secretKey
    }))
  )
}

// App won't start if ANY env var is missing
const config = unwrap(loadConfig()) // Safe to unwrap in startup
```

**Key Point**: `collect` **short-circuits on the first error**. If you need all errors, use `partition`.

---

## `partition(results)` - Separate Good from Bad

**When to use**: Bulk operations where you want to see all successes AND all failures.

### Real-World: Bulk User Import (CSV Upload)

```typescript
import { partition } from 'receta/result'

const importUsers = async (csvRows: string[][]) => {
  // Validate each row
  const results = csvRows.map((row, index) =>
    validateUserRow(row).mapErr(error => ({
      row: index + 1,
      error
    }))
  )

  const [validUsers, errors] = partition(results)

  // Save all valid users
  await db.user.createMany({ data: validUsers })

  // Return report
  return {
    imported: validUsers.length,
    failed: errors.length,
    errors: errors.map(e => `Row ${e.row}: ${e.error}`)
  }
}

// Response:
// {
//   imported: 47,
//   failed: 3,
//   errors: [
//     'Row 5: Invalid email',
//     'Row 12: Email already exists',
//     'Row 23: Missing required field: name'
//   ]
// }
```

### Real-World: Stripe Batch Payments

```typescript
// Process multiple payments, track successes and failures
const batchCharge = async (charges: ChargeRequest[]) => {
  const results = await Promise.all(
    charges.map(charge =>
      processPayment(charge.customerId, charge.amount)
        .map(payment => ({ customerId: charge.customerId, payment }))
        .mapErr(error => ({ customerId: charge.customerId, error }))
    )
  )

  const [successful, failed] = partition(results)

  // Send success receipts
  await Promise.all(
    successful.map(({ customerId, payment }) =>
      sendReceipt(customerId, payment.id)
    )
  )

  // Alert about failures
  if (failed.length > 0) {
    await sendAdminAlert({
      subject: `${failed.length} payments failed`,
      failures: failed
    })
  }

  return {
    successful: successful.length,
    failed: failed.length,
    failedCustomers: failed.map(f => f.customerId)
  }
}
```

### Real-World: Image Processing Pipeline

```typescript
// Resize multiple images, continue even if some fail
const resizeImages = async (images: File[]) => {
  const results = await Promise.all(
    images.map(async (file, index) =>
      pipe(
        validateImage(file),
        flatMap(valid => resizeImage(valid, { width: 800, height: 600 })),
        flatMap(resized => uploadToS3(resized)),
        mapErr(error => ({ filename: file.name, index, error }))
      )
    )
  )

  const [uploaded, failures] = partition(results)

  return {
    uploadedUrls: uploaded,
    failures: failures.map(f =>
      `${f.filename}: ${f.error.message}`
    )
  }
}

// UI shows:
// ✅ 8 images uploaded successfully
// ❌ 2 failed:
//    - photo.png: File too large
//    - sunset.gif: Invalid format (must be JPG/PNG)
```

### Real-World: API Health Checks

```typescript
// Check all services, report which are healthy/unhealthy
const healthCheck = async () => {
  const services = [
    { name: 'database', check: () => db.query('SELECT 1') },
    { name: 'redis', check: () => redis.ping() },
    { name: 'stripe', check: () => stripe.balance.retrieve() },
    { name: 's3', check: () => s3.listBuckets() }
  ]

  const results = await Promise.all(
    services.map(async ({ name, check }) =>
      pipe(
        await tryCatchAsync(check),
        map(() => name),
        mapErr(error => ({ service: name, error: error.message }))
      )
    )
  )

  const [healthy, unhealthy] = partition(results)

  return {
    status: unhealthy.length === 0 ? 'healthy' : 'degraded',
    healthy,
    unhealthy: unhealthy.map(s => `${s.service}: ${s.error}`)
  }
}

// Response:
// {
//   status: 'degraded',
//   healthy: ['database', 'redis', 's3'],
//   unhealthy: ['stripe: Connection timeout']
// }
```

### Real-World: Notification Delivery

```typescript
// Send email to multiple recipients
const sendBulkEmail = async (recipients: string[], template: EmailTemplate) => {
  const results = await Promise.all(
    recipients.map(email =>
      sendEmail(email, template)
        .mapErr(error => ({ email, reason: error.message }))
    )
  )

  const [sent, failed] = partition(results)

  // Log metrics
  analytics.track('bulk_email', {
    sent: sent.length,
    failed: failed.length,
    failureRate: failed.length / recipients.length
  })

  // Retry failed emails
  if (failed.length > 0 && failed.length < 10) {
    await retryFailedEmails(failed)
  }

  return { sent, failed }
}
```

---

## `fromNullable(value, error)` - Handle Optional Values

**When to use**: Array.find(), dictionary lookups, optional fields.

### Real-World: Finding Records

```typescript
import { fromNullable } from 'receta/result'

const users = [
  { id: '1', email: 'alice@example.com' },
  { id: '2', email: 'bob@example.com' }
]

const findUserById = (id: string): Result<User, string> =>
  fromNullable(
    users.find(u => u.id === id),
    `User not found: ${id}`
  )

// Usage
pipe(
  findUserById('1'),
  map(user => user.email),
  unwrapOr('noreply@example.com')
)
```

### Real-World: Cart Item Lookup

```typescript
// E-commerce: Find product in cart
const getCartItem = (cart: CartItem[], productId: string) =>
  pipe(
    fromNullable(
      cart.find(item => item.productId === productId),
      { type: 'not_in_cart', productId }
    ),
    match({
      onOk: (item) => `Quantity: ${item.quantity}`,
      onErr: () => 'Product not in cart'
    })
  )
```

### Real-World: Route Parameter Validation

```typescript
// Next.js / Express: Get required param
const getUserIdFromParams = (params: Record<string, string | undefined>) =>
  fromNullable(
    params.userId,
    { type: 'missing_param', param: 'userId' }
  )

// app.get('/api/users/:userId', (req, res) => {
//   const result = getUserIdFromParams(req.params)
//   match(result, {
//     onOk: (userId) => fetchUser(userId),
//     onErr: (error) => res.status(400).json({ error })
//   })
// })
```

### Real-World: Lookup Tables

```typescript
const HTTP_STATUS_MESSAGES: Record<number, string | undefined> = {
  200: 'OK',
  404: 'Not Found',
  500: 'Internal Server Error'
}

const getStatusMessage = (code: number) =>
  fromNullable(
    HTTP_STATUS_MESSAGES[code],
    `Unknown status code: ${code}`
  )

pipe(
  getStatusMessage(200),
  unwrapOr('Unknown')
) // 'OK'

pipe(
  getStatusMessage(418),
  unwrapOr('Unknown')
) // 'Unknown'
```

---

## Combining Combinators

### Pattern 1: Validate All, Then Collect

```typescript
const validateAndImportUsers = async (rows: unknown[]) => {
  // Step 1: Validate all (partition to see all errors)
  const validated = rows.map(validateUser)
  const [valid, invalid] = partition(validated)

  if (invalid.length > 0) {
    return err({
      message: `${invalid.length} rows have errors`,
      errors: invalid
    })
  }

  // Step 2: Import all (collect for atomicity)
  const imported = await Promise.all(valid.map(createUser))
  return collect(imported)
}
```

### Pattern 2: Collect Required, Partition Optional

```typescript
const setupAccount = async (data: AccountData) => {
  // Required fields - all must succeed
  const required = collect([
    validateEmail(data.email),
    validatePassword(data.password),
    validateUsername(data.username)
  ])

  if (isErr(required)) {
    return required
  }

  // Optional profile fields - best effort
  const optional = partition([
    fromNullable(data.avatar, 'No avatar'),
    fromNullable(data.bio, 'No bio'),
    fromNullable(data.website, 'No website')
  ])

  const [profile, _] = optional

  return ok({
    ...unwrap(required),
    profile
  })
}
```

---

## Comparison Table

| Scenario | Use collect | Use partition | Use fromNullable |
|----------|-------------|---------------|------------------|
| Multi-field form | ✅ Stop on first error | ❌ | ❌ |
| Bulk import | ❌ | ✅ Show all errors | ❌ |
| Config validation | ✅ All required | ❌ | ✅ Per field |
| Payment processing | ✅ Atomic | ❌ | ❌ |
| Health checks | ❌ | ✅ Show all failures | ❌ |
| Array.find() | ❌ | ❌ | ✅ |
| Optional fields | ❌ | ✅ Best effort | ✅ Per field |

---

## Common Patterns

### 1. Fail-Fast Validation

```typescript
const createOrder = pipe(
  collect([
    validateUser(userId),
    validateItems(items),
    validatePayment(paymentMethod)
  ]),
  flatMap(([user, items, payment]) =>
    chargeAndCreateOrder(user, items, payment)
  )
)
```

### 2. Best-Effort Processing

```typescript
const results = await processAll(items)
const [succeeded, failed] = partition(results)

return {
  processed: succeeded,
  failedCount: failed.length,
  retry: failed // Queue for retry
}
```

### 3. Required + Optional

```typescript
const required = collect(requiredFields)
const [optional, _] = partition(optionalFields)

return pipe(
  required,
  map(req => ({ ...req, ...optional }))
)
```

---

## Next Steps

- **[Patterns](./05-patterns.md)**: Complete real-world recipes
- **[Migration Guide](./06-migration.md)**: From try-catch to Result
- **[API Reference](./07-api-reference.md)**: Quick lookup guide

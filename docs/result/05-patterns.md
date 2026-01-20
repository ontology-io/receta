# Common Patterns & Recipes

> Complete, copy-paste-ready solutions for real-world scenarios.

## Table of Contents

1. [API Integration](#api-integration)
2. [Form Validation](#form-validation)
3. [Database Operations](#database-operations)
4. [File Operations](#file-operations)
5. [Authentication & Authorization](#authentication--authorization)
6. [Payment Processing](#payment-processing)
7. [Batch Operations](#batch-operations)
8. [Error Recovery](#error-recovery)

---

## API Integration

### GitHub API Client

```typescript
import * as R from 'remeda'
import { Result, tryCatchAsync, fromNullable, map, flatMap, mapErr } from 'receta/result'

type GitHubError =
  | { type: 'not_found'; resource: string }
  | { type: 'rate_limit'; resetAt: number }
  | { type: 'network'; message: string }

const githubApi = {
  fetchUser: async (username: string): Promise<Result<GitHubUser, GitHubError>> =>
    R.pipe(
      await tryCatchAsync(async () => {
        const res = await fetch(`https://api.github.com/users/${username}`)
        if (res.status === 404) {
          throw { type: 'not_found', resource: username }
        }
        if (res.status === 403) {
          const resetAt = parseInt(res.headers.get('X-RateLimit-Reset') || '0')
          throw { type: 'rate_limit', resetAt }
        }
        return res.json()
      }),
      mapErr((error): GitHubError =>
        error.type ? error : { type: 'network', message: String(error) }
      )
    ),

  fetchRepos: async (username: string) =>
    R.pipe(
      await githubApi.fetchUser(username),
      flatMap(user =>
        tryCatchAsync(() => fetch(user.repos_url).then(r => r.json()))
      )
    )
}

// Usage
const user = await githubApi.fetchUser('octocat')
match(user, {
  onOk: u => console.log(`${u.name} has ${u.public_repos} repos`),
  onErr: e => {
    if (e.type === 'rate_limit') {
      console.log(`Rate limited until ${new Date(e.resetAt * 1000)}`)
    }
  }
})
```

### Stripe Payment API

```typescript
type StripeError =
  | { type: 'card_error'; code: string; message: string }
  | { type: 'api_error'; message: string }

const stripeApi = {
  createCharge: async (
    customerId: string,
    amount: number,
    currency = 'usd'
  ): Promise<Result<Charge, StripeError>> =>
    tryCatchAsync(
      async () => {
        const charge = await stripe.charges.create({
          customer: customerId,
          amount,
          currency
        })
        return charge
      },
      (error): StripeError => {
        if (error.type === 'StripeCardError') {
          return {
            type: 'card_error',
            code: error.code,
            message: error.message
          }
        }
        return {
          type: 'api_error',
          message: error.message
        }
      }
    )
}
```

---

## Form Validation

### Multi-Field Validation with Collect

```typescript
interface SignupForm {
  email: string
  password: string
  confirmPassword: string
  agreeToTerms: boolean
}

type ValidationError =
  | 'email_invalid'
  | 'email_taken'
  | 'password_too_short'
  | 'passwords_dont_match'
  | 'must_agree_to_terms'

const validateSignup = async (
  form: SignupForm
): Promise<Result<ValidatedSignup, ValidationError>> => {
  // Synchronous validations
  const emailValid = validateEmail(form.email)
  const passwordValid = validatePassword(form.password)
  const passwordsMatch = form.password === form.confirmPassword
    ? ok(true)
    : err('passwords_dont_match' as const)
  const termsAgreed = form.agreeToTerms
    ? ok(true)
    : err('must_agree_to_terms' as const)

  // Collect sync validations
  const syncResult = collect([emailValid, passwordValid, passwordsMatch, termsAgreed])

  if (isErr(syncResult)) {
    return syncResult
  }

  // Async validation: check if email exists
  const emailAvailable = await checkEmailAvailable(form.email)

  return R.pipe(
    collect([syncResult, emailAvailable]),
    map(([_, email]) => ({
      email,
      passwordHash: hashPassword(form.password)
    }))
  )
}

// Validators
const validateEmail = (email: string): Result<string, ValidationError> =>
  email.includes('@') && email.length > 5
    ? ok(email.toLowerCase())
    : err('email_invalid')

const validatePassword = (password: string): Result<string, ValidationError> =>
  password.length >= 8
    ? ok(password)
    : err('password_too_short')

const checkEmailAvailable = async (email: string): Promise<Result<string, ValidationError>> => {
  const exists = await db.user.findFirst({ where: { email } })
  return exists ? err('email_taken') : ok(email)
}
```

### Bulk Validation with Partition

```typescript
// CSV import with detailed error reporting
const importUsers = async (rows: CSVRow[]) => {
  const results = rows.map((row, index) =>
    validateUserRow(row).mapErr(error => ({
      row: index + 1,
      data: row,
      error
    }))
  )

  const [valid, invalid] = partition(results)

  if (valid.length === 0) {
    return err({ type: 'all_invalid', errors: invalid })
  }

  // Import valid users
  await db.user.createMany({ data: valid })

  return ok({
    imported: valid.length,
    failed: invalid.length,
    errors: invalid
  })
}
```

---

## Database Operations

### CRUD with Error Handling

```typescript
const userRepository = {
  findById: async (id: string): Promise<Result<User, 'not_found' | 'db_error'>> =>
    R.pipe(
      await tryCatchAsync(() => db.user.findUnique({ where: { id } })),
      flatMap(user => fromNullable(user, 'not_found' as const)),
      mapErr(() => 'db_error' as const)
    ),

  create: async (data: CreateUserInput): Promise<Result<User, string>> =>
    tryCatchAsync(
      () => db.user.create({ data }),
      (error) => {
        if (error.code === 'P2002') {
          return 'Email already exists'
        }
        return `Database error: ${error.message}`
      }
    ),

  update: async (id: string, data: UpdateUserInput) =>
    R.pipe(
      await userRepository.findById(id),
      flatMap(user =>
        tryCatchAsync(() =>
          db.user.update({ where: { id }, data })
        )
      )
    ),

  delete: async (id: string) =>
    R.pipe(
      await userRepository.findById(id),
      flatMap(() =>
        tryCatchAsync(() => db.user.delete({ where: { id } }))
      )
    )
}
```

### Transaction Pattern

```typescript
const createOrderWithItems = async (
  userId: string,
  items: OrderItem[]
): Promise<Result<Order, string>> =>
  tryCatchAsync(
    async () =>
      db.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: { userId, status: 'pending' }
        })

        await tx.orderItem.createMany({
          data: items.map(item => ({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity
          }))
        })

        return order
      }),
    (error) => `Transaction failed: ${error.message}`
  )
```

---

## File Operations

### Read and Parse Config File

```typescript
import fs from 'fs/promises'

type ConfigError =
  | { type: 'not_found'; path: string }
  | { type: 'invalid_json'; path: string }
  | { type: 'validation_failed'; errors: string[] }

const loadConfig = async (path: string): Promise<Result<AppConfig, ConfigError>> =>
  R.pipe(
    await tryCatchAsync(
      () => fs.readFile(path, 'utf8'),
      () => ({ type: 'not_found' as const, path })
    ),
    flatMap(content =>
      tryCatch(
        () => JSON.parse(content),
        () => ({ type: 'invalid_json' as const, path })
      )
    ),
    flatMap(validateConfig)
  )
```

### Image Upload with Validation

```typescript
const uploadAvatar = async (file: File): Promise<Result<string, string>> =>
  R.pipe(
    validateImageFile(file),
    flatMap(valid => resizeImage(valid, { width: 200, height: 200 })),
    flatMap(resized => compressImage(resized, { quality: 0.8 })),
    flatMap(compressed => uploadToS3(compressed, 'avatars')),
    map(s3Result => s3Result.url),
    tapErr(error => logger.error('Avatar upload failed', { error })),
    mapErr(error => `Upload failed: ${error.message}`)
  )

const validateImageFile = (file: File): Result<File, Error> => {
  const maxSize = 5 * 1024 * 1024 // 5MB
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']

  if (file.size > maxSize) {
    return err(new Error('File too large (max 5MB)'))
  }
  if (!allowedTypes.includes(file.type)) {
    return err(new Error('Invalid file type (must be JPG, PNG, or WebP)'))
  }
  return ok(file)
}
```

---

## Authentication & Authorization

### JWT Authentication

```typescript
type AuthError =
  | { type: 'invalid_credentials' }
  | { type: 'token_expired' }
  | { type: 'token_invalid' }

const authService = {
  login: async (email: string, password: string): Promise<Result<{ token: string }, AuthError>> =>
    R.pipe(
      await userRepository.findByEmail(email),
      flatMap(user =>
        bcrypt.compare(password, user.passwordHash)
          ? ok(user)
          : err({ type: 'invalid_credentials' as const })
      ),
      map(user => ({
        token: jwt.sign({ userId: user.id }, JWT_SECRET)
      }))
    ),

  verifyToken: (token: string): Result<TokenPayload, AuthError> =>
    tryCatch(
      () => jwt.verify(token, JWT_SECRET) as TokenPayload,
      (error) => {
        if (error.name === 'TokenExpiredError') {
          return { type: 'token_expired' as const }
        }
        return { type: 'token_invalid' as const }
      }
    )
}

// Middleware
const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const result = authService.verifyToken(token)
  match(result, {
    onOk: (payload) => {
      req.user = payload
      next()
    },
    onErr: (error) => {
      res.status(401).json({ error: error.type })
    }
  })
}
```

---

## Payment Processing

### Stripe Checkout Flow

```typescript
const checkoutFlow = async (
  userId: string,
  items: CartItem[],
  paymentMethod: string
) =>
  R.pipe(
    // 1. Calculate total
    calculateCartTotal(items),
    // 2. Apply discounts/promos
    flatMap(total => applyPromoCodes(total, userId)),
    // 3. Create payment intent
    flatMap(amount => createPaymentIntent(amount, paymentMethod)),
    // 4. Confirm payment
    flatMap(intent => confirmPayment(intent.id)),
    // 5. Create order
    flatMap(payment => createOrder(userId, items, payment)),
    // 6. Send confirmation
    tap(order => sendOrderConfirmation(order)),
    // 7. Clear cart
    tap(() => clearCart(userId)),
    // Handle errors
    tapErr(error => {
      if (error.type === 'card_declined') {
        notifyUser(userId, 'Payment declined')
      }
    })
  )
```

---

## Batch Operations

### Parallel Processing with Limits

```typescript
const processBatch = async <T, E>(
  items: T[],
  processor: (item: T) => Promise<Result<unknown, E>>,
  concurrency = 5
) => {
  const chunks = R.chunk(items, concurrency)
  const results: Result<unknown, E>[] = []

  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(processor))
    results.push(...chunkResults)
  }

  return partition(results)
}

// Usage: Send 1000 emails, 10 at a time
const [sent, failed] = await processBatch(
  recipients,
  (email) => sendEmail(email, template),
  10
)
```

---

## Error Recovery

### Retry with Exponential Backoff

```typescript
const withRetry = async <T, E>(
  operation: () => Promise<Result<T, E>>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<Result<T, E>> => {
  let attempt = 0

  while (attempt < maxRetries) {
    const result = await operation()

    if (isOk(result)) {
      return result
    }

    attempt++
    if (attempt < maxRetries) {
      const delay = baseDelay * Math.pow(2, attempt - 1)
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }

  return operation() // Final attempt
}

// Usage
const user = await withRetry(() => fetchUser(id), 3, 1000)
```

### Fallback Chain

```typescript
const fetchWithFallbacks = async (id: string) =>
  R.pipe(
    await fetchFromCDN(id),
    match({
      onOk: data => ok(data),
      onErr: async () => R.pipe(
        await fetchFromDatabase(id),
        match({
          onOk: data => ok(data),
          onErr: async () => fetchFromCache(id)
        })
      )
    }),
    unwrapOr(defaultData)
  )
```

---

## Next Steps

- **[Migration Guide](./06-migration.md)**: From try-catch to Result
- **[API Reference](./07-api-reference.md)**: Quick lookup

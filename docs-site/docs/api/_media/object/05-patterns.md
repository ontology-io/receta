# Patterns & Recipes: Production-Ready Solutions

Copy-paste ready patterns for common real-world scenarios. All examples are production-ready and based on actual API structures.

## Table of Contents

1. [API Integration](#api-integration)
2. [Form Handling](#form-handling)
3. [Configuration Management](#configuration-management)
4. [Security & Sanitization](#security--sanitization)
5. [Database Operations](#database-operations)

---

## API Integration

### Pattern: GitHub API Normalization

```typescript
import * as Obj from 'receta/object'
import { pipe } from 'remeda'

// GitHub repository response → Your schema
const normalizeGitHubRepo = (apiResponse: unknown) =>
  pipe(
    apiResponse,
    Obj.validateShape({
      name: (v): v is string => typeof v === 'string',
      full_name: (v): v is string => typeof v === 'string',
      owner: {
        login: (v): v is string => typeof v === 'string',
        avatar_url: (v): v is string => typeof v === 'string'
      },
      stargazers_count: (v): v is number => typeof v === 'number',
      created_at: (v): v is string => typeof v === 'string'
    }),
    Result.map(Obj.rename({
      full_name: 'fullName',
      stargazers_count: 'stars',
      created_at: 'createdAt'
    })),
    Result.map(Obj.flatten()),
    Result.map((flat) => Obj.rename(flat, {
      'owner.login': 'ownerUsername',
      'owner.avatar_url': 'ownerAvatar'
    })),
    Result.map(Obj.unflatten())
  )
```

### Pattern: Stripe Payment Intent Processing

```typescript
// Stripe API → Your database schema
const processPaymentIntent = (stripeResponse: unknown) =>
  pipe(
    stripeResponse,
    Obj.getPath(['id']),
    toResult({ code: 'MISSING_ID' }),
    Result.flatMap((id) =>
      pipe(
        stripeResponse,
        Obj.flatten(),
        Obj.filterKeys((key) =>
          ['id', 'amount', 'currency', 'status', 'customer.email'].some(
            (allowed) => key.startsWith(allowed)
          )
        ),
        Obj.rename({
          'customer.email': 'customerEmail',
          'charges.data.0.payment_method_details.card.brand': 'cardBrand'
        }),
        Obj.unflatten(),
        (normalized) => Result.ok(normalized)
      )
    )
  )
```

---

## Form Handling

### Pattern: React Form State Manager

```typescript
interface FormState<T> {
  data: T
  errors: Record<string, string>
  touched: Record<string, boolean>
}

class Form<T extends PlainObject> {
  constructor(private state: FormState<T>) {}

  // Get field value
  getValue<V>(path: ObjectPath): Option<V> {
    return Obj.getPath<V>(this.state.data, path)
  }

  // Update field
  updateField(path: ObjectPath, value: unknown): Form<T> {
    return new Form({
      ...this.state,
      data: Obj.setPath(this.state.data, path, value),
      touched: Obj.setPath(this.state.touched, path, true)
    })
  }

  // Validate and submit
  submit(schema: ObjectSchema<T>): Result<T, ObjectError[]> {
    const cleanData = pipe(
      this.state.data,
      Obj.stripUndefined,
      Obj.compact
    )

    return Obj.validateShape(cleanData, schema)
  }
}

// Usage
const userForm = new Form({
  data: { name: '', email: '', age: undefined },
  errors: {},
  touched: {}
})

userForm
  .updateField(['name'], 'Alice')
  .updateField(['email'], 'alice@example.com')
  .submit(userSchema)
```

### Pattern: Multi-Step Form with Partial Validation

```typescript
const multiStepForm = {
  // Step 1: Personal Info
  validateStep1: (data: unknown) =>
    pipe(
      data,
      Obj.mask(['name', 'email', 'phone']),
      Obj.stripUndefined,
      (partial) => Obj.validateShape(partial, step1Schema)
    ),

  // Step 2: Address
  validateStep2: (data: unknown) =>
    pipe(
      data,
      Obj.mask(['street', 'city', 'state', 'zip']),
      Obj.stripUndefined,
      (partial) => Obj.validateShape(partial, step2Schema)
    ),

  // Final: Combine and validate all
  submitAll: (formData: unknown) =>
    pipe(
      formData,
      Obj.compact,
      (data) => Obj.validateShape(data, fullSchema),
      Result.flatMap(submitToAPI)
    )
}
```

---

## Configuration Management

### Pattern: Environment-Specific Config Merge

```typescript
// Next.js / Vite style config merging
const loadConfig = () => {
  const base = {
    api: {
      url: 'https://api.example.com',
      timeout: 30000,
      retries: 3
    },
    features: {
      analytics: false,
      debugMode: false
    }
  }

  const envConfig = pipe(
    process.env,
    Obj.filterKeys((key) => key.startsWith('APP_')),
    Obj.mapKeys((key) => key.replace(/^APP_/, '').toLowerCase()),
    Obj.unflatten({ separator: '__' })
  )

  const userConfig = loadUserConfig()  // From file

  return pipe(
    [base, envConfig, userConfig],
    Obj.deepMerge({ arrayStrategy: 'concat' }),
    (merged) => Obj.validateShape(merged, configSchema),
    Result.unwrapOr(base)
  )
}
```

### Pattern: Feature Flags with Fallbacks

```typescript
const getFeatureFlags = (remoteConfig: unknown) => {
  const defaults = {
    newDashboard: false,
    betaFeatures: false,
    experimentalApi: false
  }

  return pipe(
    remoteConfig,
    Obj.getPath(['features']),
    Option.map(Obj.compact),
    Option.map((flags) => ({ ...defaults, ...flags })),
    unwrapOr(defaults)
  )
}
```

---

## Security & Sanitization

### Pattern: Sanitize Before Logging

```typescript
const sanitizeForLogging = <T extends PlainObject>(
  obj: T,
  sensitiveFields: string[] = ['password', 'apiKey', 'creditCard', 'ssn']
): Partial<T> =>
  pipe(
    obj,
    Obj.flatten(),
    Obj.filterKeys((key) =>
      !sensitiveFields.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))
    ),
    Obj.unflatten()
  )

// Usage
logger.info('User login', sanitizeForLogging(request))
// Automatically removes password, tokens, etc.
```

### Pattern: GDPR-Compliant Data Minimization

```typescript
const gdprMinimize = {
  // Only collect necessary analytics
  analytics: (event: UserEvent) =>
    pipe(
      event,
      Obj.mask(['action', 'timestamp', 'category']),
      Obj.stripUndefined
      // No PII stored
    ),

  // Anonymize user data for support
  supportTicket: (user: User) =>
    pipe(
      user,
      Obj.mask(['id', 'createdAt', 'subscription']),
      Obj.updatePath(['id'], (id: string) => hashUserId(id))
      // Email/name removed, ID hashed
    ),

  // Export user data (GDPR right to access)
  exportUserData: (userId: string) =>
    fetchAllUserData(userId).then((data) =>
      pipe(
        data,
        Obj.flatten(),
        Obj.filterKeys((key) => !key.includes('_internal')),
        Obj.unflatten()
      )
    )
}
```

### Pattern: API Response Filtering by Role

```typescript
const filterByRole = (user: User, role: UserRole) => {
  const publicFields = ['id', 'username', 'avatar']
  const authenticatedFields = [...publicFields, 'email', 'createdAt']
  const adminFields = [...authenticatedFields, 'lastLogin', 'ipAddress', 'internalNotes']

  const allowedFields = {
    public: publicFields,
    user: authenticatedFields,
    admin: adminFields
  }[role]

  return Obj.mask(user, allowedFields)
}
```

---

## Database Operations

### Pattern: Query Builder

```typescript
const buildWhereClause = (filters: Record<string, unknown>) =>
  pipe(
    filters,
    Obj.compact,
    Obj.flatten({ separator: '.' }),
    Obj.mapKeys((key) => `table.${key}`),
    Obj.mapValues((value) =>
      Array.isArray(value) ? `IN (${value.join(',')})` : `= '${value}'`
    ),
    Object.entries,
    (entries) => entries.map(([key, value]) => `${key} ${value}`).join(' AND ')
  )

// Usage
const sql = `SELECT * FROM users WHERE ${buildWhereClause({
  status: 'active',
  role: ['admin', 'moderator'],
  'profile.verified': true
})}`
// => WHERE table.status = 'active' AND table.role IN (admin,moderator) AND table.profile.verified = 'true'
```

### Pattern: Prisma-Style Nested Updates

```typescript
const updateNestedUser = (userId: string, updates: DeepPartial<User>) =>
  pipe(
    updates,
    Obj.flatten(),
    Obj.filterKeys((key) => !key.includes('id')),  // Protect ID fields
    Obj.stripUndefined,
    (flat) =>
      Object.entries(flat).reduce(
        (query, [path, value]) => query.update({ where: { id: userId }, data: { [path]: value } }),
        prisma.user
      )
  )
```

---

## Complete Real-World Example: Payment Processing

```typescript
// Complete payment processing pipeline
const processPayment = async (stripeWebhook: unknown) => {
  // 1. Validate webhook structure
  const validated = pipe(
    stripeWebhook,
    Obj.validateShape(stripeWebhookSchema),
    Result.mapErr((error) => ({
      code: 'INVALID_WEBHOOK',
      message: 'Webhook validation failed',
      details: error
    }))
  )

  if (isErr(validated)) {
    logger.error('Invalid webhook', sanitizeForLogging(stripeWebhook))
    return validated
  }

  // 2. Extract payment data
  const paymentData = pipe(
    validated.value,
    Obj.flatten(),
    Obj.filterKeys((key) =>
      ['data.object.id', 'data.object.amount', 'data.object.customer'].some((prefix) =>
        key.startsWith(prefix)
      )
    ),
    Obj.rename({
      'data.object.id': 'paymentId',
      'data.object.amount': 'amount',
      'data.object.customer': 'customerId'
    }),
    Obj.unflatten(),
    Obj.compact
  )

  // 3. Update database
  const dbResult = await pipe(
    paymentData,
    Obj.validateShape(dbPaymentSchema),
    Result.flatMap(savePaymentToDb),
    Result.tapErr((error) =>
      logger.error('DB save failed', { paymentData: sanitizeForLogging(paymentData), error })
    )
  )

  // 4. Send notification
  if (isOk(dbResult)) {
    await sendPaymentConfirmation(dbResult.value.customerId)
  }

  return dbResult
}
```

---

## Next Steps

- **[Migration Guide](./06-migration.md)** - Migrate from Lodash/Vanilla JS
- **[API Reference](./07-api-reference.md)** - Quick lookup and cheat sheets

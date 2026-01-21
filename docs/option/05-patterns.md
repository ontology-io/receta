# Option Patterns & Recipes

> Production-ready patterns for common use cases.

## Database Queries

### findById Pattern

```typescript
type User = { id: string; name: string; email: string }

const findUserById = (id: string): Option<User> =>
  fromNullable(users.find(u => u.id === id))

const getUserEmail = (id: string): string =>
  R.pipe(
    findUserById(id),
    map(u => u.email),
    unwrapOr('noreply@example.com')
  )
```

### Nested Lookups

```typescript
// User → Team → Lead
const findTeamLead = (userId: string): Option<User> =>
  R.pipe(
    findUserById(userId),
    flatMap(user => fromNullable(user.teamId)),
    flatMap(findTeamById),
    flatMap(team => fromNullable(team.leadId)),
    flatMap(findUserById)
  )
```

## Configuration Loading

### Environment Variables with Defaults

```typescript
const getEnv = (key: string): Option<string> =>
  fromNullable(process.env[key])

const config = {
  apiKey: unwrapOr(getEnv('API_KEY'), 'default-key'),
  timeout: pipe(
    getEnv('TIMEOUT'),
    map(Number),
    filter(n => !isNaN(n) && n > 0),
    unwrapOr(5000)
  ),
  debug: unwrapOr(getEnv('DEBUG'), 'false') === 'true'
}
```

### Feature Flags

```typescript
const getFeatureFlag = (name: string): boolean =>
  pipe(
    fromNullable(featureFlags[name]),
    unwrapOr(false)
  )

if (getFeatureFlag('new-ui')) {
  renderNewUI()
} else {
  renderLegacyUI()
}
```

## Form Validation

### Multi-Field Validation

```typescript
const validateEmail = (email: string): Option<string> =>
  pipe(
    fromNullable(email),
    filter(e => e.length >= 3),
    filter(e => e.includes('@'))
  )

const validateAge = (age: string): Option<number> =>
  pipe(
    tryCatch(() => Number(age)),
    filter(n => !isNaN(n)),
    filter(n => n >= 18 && n <= 120)
  )

const validateForm = (form: FormData): Option<ValidForm> =>
  pipe(
    collect([
      validateEmail(form.email),
      validateAge(form.age)
    ]),
    map(([email, age]) => ({ email, age }))
  )
```

### Optional Fields

```typescript
type ProfileForm = {
  name: string  // Required
  email: string  // Required
  phone?: string  // Optional
  website?: string  // Optional
}

const processForm = (form: ProfileForm) => ({
  name: form.name,
  email: form.email,
  phone: pipe(
    fromNullable(form.phone),
    filter(p => /^\d{10}$/.test(p)),
    toNullable
  ),
  website: pipe(
    fromNullable(form.website),
    filter(w => w.startsWith('http')),
    toNullable
  )
})
```

## API Integration

### GitHub API

```typescript
type GitHubUser = {
  login: string
  name: string | null
  bio: string | null
  company: string | null
}

const formatUser = (user: GitHubUser) => ({
  username: user.login,
  displayName: unwrapOr(fromNullable(user.name), user.login),
  bio: fromNullable(user.bio),
  company: fromNullable(user.company)
})
```

### Stripe API

```typescript
type PaymentIntent = {
  id: string
  amount: number
  metadata?: Record<string, string>
}

const getMetadata = (intent: PaymentIntent, key: string): Option<string> =>
  pipe(
    fromNullable(intent.metadata),
    flatMap(meta => fromNullable(meta[key]))
  )

const orderId = unwrapOr(
  getMetadata(intent, 'order_id'),
  'unknown'
)
```

## Caching

### With Fallback

```typescript
const cache = new Map<string, User>()

const getUser = (id: string): Promise<User> =>
  unwrapOrElse(
    fromNullable(cache.get(id)),
    () => fetchUserFromDB(id).then(user => {
      cache.set(id, user)
      return user
    })
  )
```

## Parsing

### JSON with Validation

```typescript
const parseConfig = <T>(str: string, validate: (x: unknown) => x is T): Option<T> =>
  pipe(
    tryCatch(() => JSON.parse(str)),
    filter(validate)
  )

const config = parseConfig(configStr, isValidConfig)
```

### Number Parsing

```typescript
const parsePositiveInt = (str: string): Option<number> =>
  pipe(
    tryCatch(() => Number(str)),
    filter(n => !isNaN(n)),
    filter(n => Number.isInteger(n)),
    filter(n => n > 0)
  )
```

## Batch Processing

```typescript
const processUserIds = (ids: string[]): User[] => {
  const results = ids.map(findUserById)
  const [users, failedCount] = partition(results)

  logger.info(`Processed ${users.length}, Failed: ${failedCount}`)
  return users
}
```

## Integration with Result

### Convert for Detailed Errors

```typescript
const getUserOrError = (id: string): Result<User, NotFoundError> =>
  pipe(
    findUserById(id),
    toResult({ code: 'NOT_FOUND', userId: id })
  )
```

### Discard Error Details

```typescript
const hasUser = (id: string): boolean =>
  pipe(
    validateAndFetchUser(id), // Returns Result
    fromResult,
    isSome
  )
```

## Next Steps

- **[Migration Guide](./06-migration.md)** - From nullable types
- **[API Reference](./07-api-reference.md)** - Complete API

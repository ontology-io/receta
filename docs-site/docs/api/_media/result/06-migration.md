# Migration Guide: From try-catch to Result

> Step-by-step guide to refactoring exception-based code to Result-based code.

## Why Migrate?

**Before (try-catch):**
- Errors are invisible in function signatures
- Easy to forget error handling
- Type information lost in catch blocks
- Hard to compose operations
- Exceptions break control flow

**After (Result):**
- Errors are explicit in types
- Compiler forces you to handle errors
- Full type safety
- Composable with `pipe`
- Errors are values

---

## Step 1: Identify throw-happy Functions

### Before: Hidden Exceptions

```typescript
// ❌ No indication this can fail
function parseJSON(str: string) {
  return JSON.parse(str) // Throws SyntaxError
}

function getUser(id: string) {
  const user = users.find(u => u.id === id)
  if (!user) throw new Error('User not found') // Hidden!
  return user
}
```

### After: Explicit Results

```typescript
// ✅ Type signature shows it can fail
function parseJSON<T>(str: string): Result<T, SyntaxError> {
  return tryCatch(() => JSON.parse(str) as T)
}

function getUser(id: string): Result<User, string> {
  return fromNullable(
    users.find(u => u.id === id),
    'User not found'
  )
}
```

---

## Step 2: Refactor Error Handling

### Pattern 1: Simple try-catch

**Before:**
```typescript
function loadConfig() {
  try {
    const content = fs.readFileSync('config.json', 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Failed to load config:', error)
    return defaultConfig
  }
}
```

**After:**
```typescript
function loadConfig(): Config {
  return pipe(
    tryCatch(() => fs.readFileSync('config.json', 'utf8')),
    flatMap(content => tryCatch(() => JSON.parse(content))),
    tapErr(error => console.error('Failed to load config:', error)),
    unwrapOr(defaultConfig)
  )
}
```

### Pattern 2: Nested try-catch

**Before:**
```typescript
async function createUser(email: string, password: string) {
  try {
    const hash = await bcrypt.hash(password, 10)
    try {
      const user = await db.user.create({ email, passwordHash: hash })
      try {
        await sendWelcomeEmail(user.email)
      } catch (emailErr) {
        // Email failed but user created - what now?
        console.error('Email failed:', emailErr)
      }
      return user
    } catch (dbErr) {
      throw new Error(`Database error: ${dbErr.message}`)
    }
  } catch (hashErr) {
    throw new Error(`Hashing failed: ${hashErr.message}`)
  }
}
```

**After:**
```typescript
async function createUser(
  email: string,
  password: string
): Promise<Result<User, string>> {
  return pipe(
    await tryCatchAsync(() => bcrypt.hash(password, 10)),
    flatMap(hash =>
      tryCatchAsync(() => db.user.create({ email, passwordHash: hash }))
    ),
    tap(user =>
      // Email is optional - don't fail the whole operation
      sendWelcomeEmail(user.email).catch(console.error)
    ),
    mapErr(error => `User creation failed: ${error.message}`)
  )
}
```

### Pattern 3: Error Re-throwing

**Before:**
```typescript
async function fetchUserData(id: string) {
  try {
    const user = await fetchUser(id)
    if (!user) {
      throw new Error('User not found')
    }
    const posts = await fetchPosts(user.id)
    return { user, posts }
  } catch (error) {
    logger.error('fetchUserData failed', error)
    throw error // Re-throw
  }
}
```

**After:**
```typescript
async function fetchUserData(
  id: string
): Promise<Result<{ user: User; posts: Post[] }, string>> {
  return pipe(
    await fetchUser(id),
    flatMap(user =>
      fetchPosts(user.id).map(posts => ({ user, posts }))
    ),
    tapErr(error => logger.error('fetchUserData failed', error))
  )
}
```

---

## Step 3: Update Callers

### Before: try-catch at Call Site

```typescript
async function handler(req: Request, res: Response) {
  try {
    const user = await createUser(req.body.email, req.body.password)
    res.json({ success: true, user })
  } catch (error) {
    res.status(500).json({ success: false, error: error.message })
  }
}
```

### After: match at Call Site

```typescript
async function handler(req: Request, res: Response) {
  const result = await createUser(req.body.email, req.body.password)

  match(result, {
    onOk: (user) => {
      res.json({ success: true, user })
    },
    onErr: (error) => {
      res.status(500).json({ success: false, error })
    }
  })
}
```

---

## Step 4: Compose Operations

### Before: Sequential try-catch

```typescript
async function processOrder(orderId: string) {
  try {
    const order = await fetchOrder(orderId)
    const user = await fetchUser(order.userId)
    const payment = await processPayment(order.total, user.paymentMethod)
    await sendConfirmation(user.email, order.id)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### After: Composable Pipeline

```typescript
async function processOrder(
  orderId: string
): Promise<Result<{ success: true }, string>> {
  return pipe(
    await fetchOrder(orderId),
    flatMap(order =>
      fetchUser(order.userId).map(user => ({ order, user }))
    ),
    flatMap(({ order, user }) =>
      processPayment(order.total, user.paymentMethod)
        .map(payment => ({ order, user, payment }))
    ),
    tap(({ user, order }) => sendConfirmation(user.email, order.id)),
    map(() => ({ success: true as const })),
    mapErr(error => error.message)
  )
}
```

---

## Step 5: Handle Null/Undefined

### Before: Null Checks Everywhere

```typescript
function getUserEmail(userId: string): string | null {
  const user = users.find(u => u.id === userId)
  if (!user) return null

  if (!user.email) return null

  return user.email
}

// Caller
const email = getUserEmail(id)
if (email === null) {
  // handle missing
}
```

### After: fromNullable

```typescript
function getUserEmail(userId: string): Result<string, string> {
  return pipe(
    fromNullable(
      users.find(u => u.id === userId),
      'User not found'
    ),
    flatMap(user =>
      fromNullable(user.email, 'User has no email')
    )
  )
}

// Caller
const email = getUserEmail(id)
match(email, {
  onOk: (e) => sendEmail(e),
  onErr: (error) => console.log(error)
})
```

---

## Step 6: Validation Migration

### Before: Throwing Validators

```typescript
function validateUser(data: unknown): User {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid data')
  }
  if (!('email' in data) || typeof data.email !== 'string') {
    throw new Error('Email required')
  }
  if (!data.email.includes('@')) {
    throw new Error('Invalid email')
  }
  // ... more validation
  return data as User
}

// Usage
try {
  const user = validateUser(input)
  await createUser(user)
} catch (error) {
  showError(error.message)
}
```

### After: Result-based Validators

```typescript
function validateUser(data: unknown): Result<User, string> {
  if (!data || typeof data !== 'object') {
    return err('Invalid data')
  }

  return pipe(
    fromNullable((data as any).email, 'Email required'),
    flatMap(email =>
      email.includes('@') ? ok(email) : err('Invalid email')
    ),
    // Chain more validations
    flatMap(email => validateAge((data as any).age).map(() => email)),
    map(email => ({ email, ...data } as User))
  )
}

// Usage
pipe(
  validateUser(input),
  flatMap(createUser),
  match({
    onOk: () => showSuccess(),
    onErr: showError
  })
)
```

---

## Step 7: Express/API Route Migration

### Before: try-catch in Routes

```typescript
app.post('/api/users', async (req, res) => {
  try {
    const user = await db.user.create({ data: req.body })
    res.status(201).json(user)
  } catch (error) {
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'Email already exists' })
    } else {
      res.status(500).json({ error: 'Internal server error' })
    }
  }
})
```

### After: Result-based Routes

```typescript
app.post('/api/users', async (req, res) => {
  const result = await pipe(
    validateUserInput(req.body),
    flatMap(valid =>
      tryCatchAsync(
        () => db.user.create({ data: valid }),
        (error) => {
          if (error.code === 'P2002') {
            return { status: 409, message: 'Email already exists' }
          }
          return { status: 500, message: 'Internal server error' }
        }
      )
    )
  )

  match(result, {
    onOk: (user) => res.status(201).json(user),
    onErr: (error) => res.status(error.status).json({ error: error.message })
  })
})
```

---

## Migration Checklist

- [ ] Identify all functions that can throw
- [ ] Convert throwing functions to return `Result`
- [ ] Update function signatures with explicit error types
- [ ] Replace `try-catch` with `tryCatch`/`tryCatchAsync`
- [ ] Replace null checks with `fromNullable`
- [ ] Chain operations with `flatMap` instead of nesting try-catch
- [ ] Use `match` or `unwrapOr` at boundaries (API routes, UI)
- [ ] Add error logging with `tapErr`
- [ ] Update tests to check Result values
- [ ] Update TypeScript types to remove `throws` comments

---

## Common Pitfalls

### ❌ Pitfall 1: Still throwing inside Result

```typescript
// BAD
const bad = tryCatch(() => {
  if (condition) throw new Error('fail') // Defeats the purpose!
  return value
})

// GOOD
const good = condition ? err('fail') : ok(value)
```

### ❌ Pitfall 2: Using unwrap() everywhere

```typescript
// BAD - defeats the purpose
const user = unwrap(fetchUser(id)) // Throws if Err!

// GOOD - handle the error
const user = unwrapOr(fetchUser(id), guestUser)
// OR
match(fetchUser(id), {
  onOk: (user) => renderUser(user),
  onErr: (error) => renderError(error)
})
```

### ❌ Pitfall 3: Mixing Result and exceptions

```typescript
// BAD - inconsistent error handling
function process(): Result<T, E> {
  if (bad) throw new Error('fail') // Don't throw!
  return ok(value)
}

// GOOD - all errors as Results
function process(): Result<T, E> {
  return bad ? err('fail') : ok(value)
}
```

---

## Incremental Migration Strategy

1. **Start at the edges**: API routes, form handlers
2. **Work inward**: Services, repositories
3. **Convert utilities last**: Pure functions, helpers
4. **Keep boundaries clean**: Use `match` or `unwrapOr` at system boundaries
5. **Update tests incrementally**: One module at a time

---

## Next Steps

- **[API Reference](./07-api-reference.md)**: Quick function lookup
- **[Patterns](./05-patterns.md)**: Complete recipes for common scenarios

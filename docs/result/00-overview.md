# Result: Explicit Error Handling Without Exceptions

> **TL;DR**: Result is a type that represents either success (`Ok`) or failure (`Err`), making errors visible in your function signatures and preventing runtime crashes.

## The Problem: Hidden Errors Everywhere

### Real-World Example: Stripe Payment Processing

```typescript
// Traditional approach - errors are invisible
function processPayment(cardToken: string, amount: number) {
  const charge = stripe.charges.create({ token: cardToken, amount })
  const receipt = generateReceipt(charge.id)
  sendEmail(charge.customer, receipt)
  return { success: true, chargeId: charge.id }
}

// What could go wrong? 🤔
// - Invalid card token → CardError
// - Network timeout → NetworkError
// - Receipt generation fails → FileSystemError
// - Email service down → SMTPError
// None of these are in the type signature!
```

When you call `processPayment()`, you have **no idea** it can throw 4 different types of errors. You'll only discover this when:
- Your app crashes in production
- Users complain
- You read Stripe's documentation (if you're lucky)

### How Successful Products Handle This

**Stripe API** (actual response structure):
```json
{
  "error": {
    "type": "card_error",
    "code": "card_declined",
    "message": "Your card was declined"
  }
}
```

**GitHub API** (actual response structure):
```json
{
  "message": "Not Found",
  "documentation_url": "https://docs.github.com/..."
}
```

**AWS SDK** (actual API pattern):
```typescript
s3.getObject(params, (err, data) => {
  if (err) {
    // Handle NoSuchKey, AccessDenied, etc.
  } else {
    // Use data
  }
})
```

**What they have in common**: Errors are **explicit**, **typed**, and **impossible to ignore**.

## The Solution: Result Type

```typescript
import { Result, ok, err } from 'receta/result'

type PaymentError =
  | { type: 'card_error'; code: string }
  | { type: 'network_error'; timeout: number }
  | { type: 'receipt_error'; reason: string }
  | { type: 'email_error'; service: string }

function processPayment(
  cardToken: string,
  amount: number
): Result<{ chargeId: string }, PaymentError> {
  // Error handling is now VISIBLE and TYPED
}
```

**Now the function signature tells you:**
1. ✅ This can fail
2. ✅ Here are ALL the ways it can fail
3. ✅ Here's what you get on success

## Why Result Over try-catch?

### Problem 1: try-catch Doesn't Compose

```typescript
// Traditional try-catch pyramid of doom
try {
  const user = JSON.parse(userJson)
  try {
    const validated = validateUser(user)
    try {
      const saved = await db.save(validated)
      try {
        await sendWelcomeEmail(saved.email)
      } catch (emailErr) {
        // What do we do? User is saved but no email...
      }
    } catch (dbErr) {
      // Validation passed but save failed
    }
  } catch (validationErr) {
    // JSON parsed but validation failed
  }
} catch (parseErr) {
  // JSON parsing failed
}
```

**With Result:**
```typescript
const result = pipe(
  tryCatch(() => JSON.parse(userJson)),
  flatMap(validateUser),
  flatMap(user => db.save(user)),
  flatMap(saved => sendWelcomeEmail(saved.email))
)

// One place to handle ALL errors
match(result, {
  onOk: (user) => console.log('Success!'),
  onErr: (error) => console.error('Failed:', error)
})
```

### Problem 2: try-catch Loses Type Information

```typescript
try {
  await fetch('/api/users')
} catch (error) {
  // error is `unknown` - could be anything!
  // - TypeError (network failed)
  // - SyntaxError (invalid JSON)
  // - Custom API error
  // - Literally anything thrown
}
```

**With Result:**
```typescript
type FetchError =
  | { type: 'network'; message: string }
  | { type: 'json'; message: string }
  | { type: 'api'; status: number; body: unknown }

const result: Result<User, FetchError> = await fetchUser()
// TypeScript KNOWS the error type!
```

### Problem 3: try-catch Doesn't Work in Pipelines

```typescript
// Can't use try-catch in Array.map
const results = userIds.map(id => fetchUser(id)) // 💥 If any throws, whole array fails

// With Result
const results = userIds.map(id => fetchUser(id)) // Array<Result<User, Error>>
const [successes, failures] = partition(results)  // Separate good from bad
```

## Real-World Use Cases

### 1. API Requests (GitHub, Stripe, etc.)

```typescript
type ApiError =
  | { status: 404; message: 'Not Found' }
  | { status: 401; message: 'Unauthorized' }
  | { status: 500; message: 'Server Error' }

async function fetchRepo(
  owner: string,
  repo: string
): Promise<Result<Repository, ApiError>> {
  return tryCatchAsync(
    async () => {
      const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`)
      if (!res.ok) {
        throw { status: res.status, message: await res.text() }
      }
      return res.json()
    },
    (error) => error as ApiError
  )
}

// Usage
const repo = await fetchRepo('facebook', 'react')
match(repo, {
  onOk: (r) => console.log(`⭐ ${r.stargazers_count}`),
  onErr: (e) => console.log(`Error ${e.status}: ${e.message}`)
})
```

### 2. Form Validation (like Stripe Checkout)

```typescript
// Validate multiple fields, collect ALL errors
const validateCheckout = (form: CheckoutForm) => {
  const results = [
    validateEmail(form.email),
    validateCard(form.cardNumber),
    validateCVV(form.cvv),
    validateZip(form.zipCode)
  ]

  return collect(results) // Fails on FIRST error (fail-fast)
  // OR
  const [valid, errors] = partition(results) // Collect ALL errors
}
```

### 3. Database Operations (like Prisma, Supabase)

```typescript
const createUser = (email: string, name: string) =>
  pipe(
    validateEmail(email),
    flatMap(() => validateName(name)),
    flatMap(() => db.user.create({ email, name })),
    flatMap(user => sendWelcomeEmail(user.email)),
    match({
      onOk: (user) => ({ success: true, userId: user.id }),
      onErr: (error) => ({ success: false, error })
    })
  )
```

### 4. Configuration Loading (like Next.js, Vite)

```typescript
const loadConfig = () =>
  pipe(
    // Try to read .env file
    tryCatch(() => fs.readFileSync('.env', 'utf8')),
    // Parse environment variables
    flatMap(parseEnvFile),
    // Validate required vars
    flatMap(validateRequiredVars),
    // Return typed config
    map(buildConfig),
    // Fallback to defaults
    unwrapOr(defaultConfig)
  )
```

### 5. Parsing (like Zod, Yup)

```typescript
const parseUserInput = (raw: unknown) =>
  pipe(
    fromNullable(raw, 'Input is null'),
    flatMap(ensureObject),
    flatMap(parseUser),
    mapErr(error => ({
      code: 'VALIDATION_ERROR',
      details: error
    }))
  )
```

## Mental Model: Railway-Oriented Programming

Think of your code as a **railway track**:

```
Input ──[Success Track]──> Output
         ╱            ╲
        ╱              ╲
   [Ok]                [Err]
    ║                    ║
    ║                    ║
    ▼                    ▼
  Continue            Short-circuit
  pipeline            to error handler
```

- **Ok values** stay on the success track
- **Err values** switch to the error track and skip all remaining operations
- At the end, you handle both tracks with `match` or `unwrapOr`

## When to Use Result

✅ **Use Result when:**
- Making API calls (HTTP, database, external services)
- Parsing user input (JSON, forms, files)
- Validation (email, passwords, credit cards)
- File system operations (read, write, permissions)
- Any operation that can fail in **predictable ways**

❌ **Don't use Result for:**
- Bugs/programmer errors (null pointer, array out of bounds) → Use TypeScript's type system
- Truly unexpected errors (out of memory, stack overflow) → Let them throw
- Control flow (like returning early) → Use regular `if`/`return`

## What's Next?

- **[Constructors](./01-constructors.md)**: How to create Results (`ok`, `err`, `tryCatch`)
- **[Transformers](./02-transformers.md)**: How to work with Results (`map`, `flatMap`)
- **[Extractors](./03-extractors.md)**: How to get values out (`unwrap`, `match`)
- **[Patterns](./04-patterns.md)**: Common recipes for real-world scenarios
- **[Migration Guide](./05-migration.md)**: From try-catch to Result

---

**Key Takeaway**: Result makes errors **visible**, **typed**, and **composable**. It's how companies like Stripe, GitHub, and AWS make their APIs reliable and easy to use.
